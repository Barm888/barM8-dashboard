const app = require('../../server/server');
const cron = require('node-cron');
const moment = require('moment-timezone');

module.exports = function (Allcategorychart) {

    Allcategorychart.createAnalytics = (params, cb) => {

        console.log(JSON.stringify(params));

        const Happenings = app.models.Happenings,
            AllCategoryCustomerHits = app.models.AllCategoryCustomerHits,
            Customer = app.models.Customer,
            SportsDate = app.models.SportsDate,
            ChartForExclusiveOffer = app.models.ChartForExclusiveOffer,
            HappyHourDashDay = app.models.HappyHourDashDay,
            DailySpecial = app.models.DailySpecial;

        let isCallBack = (isSuccess = false, message = "please try again", result = {}) => cb(null, { isSuccess, message, result });

        if (params) {

            let { happeningsId, customerId, type, dailySpecialId, exclusiveDateId, happyHourDashDayId, sportsDateId, timeZone = "Australia/Sydney",
                country = "Australia" } = params;

            let momentdate = new Date(),
                dateZero = moment.tz(momentdate, timeZone).format('YYYY-MM-DD') + 'T00:00:00.000Z',
                countryDate = moment.tz(momentdate, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z",
                dateStr = moment.tz(momentdate, timeZone).format('DD-MM-YYYY'),
                timeStr = moment.tz(momentdate, timeZone).format('hh:mm A'),
                date = parseFloat(moment.tz(momentdate, timeZone).format('DD')),
                month = parseFloat(moment.tz(momentdate, timeZone).format('MM')),
                year = parseFloat(moment.tz(momentdate, timeZone).format('YYYY')),
                hour = moment.tz(momentdate, timeZone).format('HH'),
                minute = moment.tz(momentdate, timeZone).format('MM'),
                day = moment.tz(momentdate, timeZone).format('dddd');

            let createChart = async ({ age, gender, customerId, aCCRes, ownerId }) => {

                if (aCCRes && aCCRes.id) {
                    let updateObj = {};

                    //AllCategory hours Count
                    let _hoursPlus = ("0" + (Number(hour) + 1)).slice(-2),
                        CCnt = Number(aCCRes[`_${hour}to${_hoursPlus}`]);
                    ++CCnt;
                    updateObj[`_${hour}to${_hoursPlus}`] = CCnt;

                    //Allcategory Age Count
                    age = parseInt(age);
                    if (age >= 18 && age <= 100) {
                        var ageCnt = 0, propertiesName = '';
                        if (age >= 18 && age <= 23) { ageCnt = aCCRes[`_18to23_Age`]; propertiesName = '_18to23_Age'; };
                        if (age >= 24 && age <= 29) { ageCnt = aCCRes[`_24to29_Age`]; propertiesName = '_24to29_Age'; }
                        if (age >= 30 && age <= 35) { ageCnt = aCCRes[`_30to35_Age`]; propertiesName = '_30to35_Age'; };
                        if (age >= 36 && age <= 41) { ageCnt = aCCRes[`_36to41_Age`]; propertiesName = '_36to41_Age'; };
                        if (age >= 42 && age <= 100) { ageCnt = aCCRes[`_42toPlus_Age`]; propertiesName = '_42toPlus_Age'; }
                        ageCnt = Number(ageCnt);
                        updateObj[propertiesName] = ++ageCnt;
                    }

                    //AllCategory male and Female Cnt
                    if (gender && gender == 'Male') {
                        updateObj.male = Number(aCCRes.male || 0) + 1;
                    }
                    else if (gender && gender == 'Female') {
                        updateObj.female = Number(aCCRes.female || 0) + 1;
                    }

                    //UpdateData 
                    await Allcategorychart.upsertWithWhere({ id: aCCRes.id }, updateObj);

                    await AllCategoryCustomerHits.create({
                        allCategoryChartId: aCCRes.id, customerId, scanDateZero: dateZero, date, month, year,
                        scanDate: dateStr, scanTime: timeStr, country, timeZone
                    }, () => {
                        if (ownerId && date && month && year) {

                            let alCFilter = {};
                            if (type == "Happenings") {
                                alCFilter = { ownerId, happeningsId };
                            } else if (type == 'Sports') {
                                alCFilter = { ownerId, sportsDateId };
                            } else if (type == 'DailySpecial') {
                                alCFilter = { ownerId, dailySpecialId };
                            } else if (type == 'ExclusiveOffer') {
                                alCFilter = { ownerId, couponDateId: exclusiveDateId };
                            } else if (type == 'DrinksSpecial') {
                                alCFilter = { ownerId, happyHourDashDayId };
                            }

                            Allcategorychart.findOne({
                                where: alCFilter,
                                include: [{ relation: "allCategoryCustomerHits" }]
                            }, (AllcategorychartErr, AllcategorychartRes) => {

                                let AllCChartD = JSON.parse(JSON.stringify(AllcategorychartRes));

                                if (AllCChartD && AllCChartD.allCategoryCustomerHits && AllCChartD.id) {

                                    let newCnt = AllCChartD.allCategoryCustomerHits.filter(m => m.customerId == customerId);

                                    if (newCnt && newCnt.length > 1) {
                                        let returning = Number(AllCChartD.returning || 0) + 1;
                                        Allcategorychart.upsertWithWhere({ id: AllCChartD.id }, { returning })
                                    } else {
                                        let newCount = Number(AllCChartD.new || 0) + 1;
                                        Allcategorychart.upsertWithWhere({ id: AllCChartD.id }, { new: newCount })
                                    }
                                }
                            })

                        }
                    });
                }
            }


            if (customerId) {
                Customer.findOne({ where: { id: customerId } }, { fields: ["id", "firstName", "lastName", "mobile", "postCode", "dob", "age", "state", "city", "gender"] }, (Cuerr, Cures) => {
                    if (Cuerr) { isCallBack(false, "Enter valid customer id"); }
                    else if (Cures) {
                        if (happeningsId && type == 'Happenings') {
                            Happenings.find({ where: { id: happeningsId } }, (er, rs) => {
                                if (er) isCallBack(false, "Error", er);
                                else {
                                    rs = JSON.parse(JSON.stringify(rs));
                                    if (rs && rs.length) {
                                        let { ownerId, happeningsCategoryId } = rs[0];
                                        Allcategorychart.upsertWithWhere({ ownerId, date, month, year, happeningsId, happeningsCategoryId }, { customerId, ownerId, happeningsCategoryId, happeningsId, dateStr, timeStr, timeZone, date, month, year, dateZero, countryDate, hour, minute, day, country }, (aCCErr, aCCRes) => {
                                            if (aCCRes) {
                                                createChart({ age: Cures.age, gender: Cures.gender, customerId, aCCRes, ownerId });
                                                isCallBack(true, "Success", aCCRes);
                                            } else isCallBack(false, "Error", {});
                                        });

                                    } else isCallBack(false, "No Data!. Invalid happenings id.", {});
                                }
                            });
                        }
                        else if (dailySpecialId && type == 'DailySpecial') {

                            DailySpecial.findOne({
                                where: { id: dailySpecialId },
                                include: [{
                                    relation: "dailySpecialCategory"
                                }]
                            }, (eDSLErr, eDSLRes) => {
                                eDSLRes = JSON.parse(JSON.stringify(eDSLRes));

                                if (eDSLRes && eDSLRes.id) {

                                    let { dailySpecialCategoryId, ownerId } = eDSLRes;

                                    Allcategorychart.upsertWithWhere({ ownerId, date, month, year, dailySpecialId, dailySpecialCategoryId }, { customerId, ownerId, dailySpecialCategoryId, dailySpecialId, dateStr, timeStr, timeZone, date, month, year, dateZero, countryDate, hour, minute, day, country }, (aCCErr, aCCRes) => {
                                        if (aCCRes) {
                                            createChart({ age: Cures.age, gender: Cures.gender, customerId, aCCRes, ownerId });
                                            isCallBack(true, "Success", aCCRes);
                                        } else isCallBack(false, "Error", {});
                                    });

                                } else isCallBack(false, "No Data.Invalid Daily Special id", {});
                            })
                        }
                        else if (exclusiveDateId && type == 'ExclusiveOffer') {
                            ChartForExclusiveOffer.createAnalytics({ exclusiveOfferId: exclusiveDateId, customerId, type: "view" }, cb)
                        }
                        else if (happyHourDashDayId && type == 'DrinksSpecial') {
                            HappyHourDashDay.findOne({ where: { id: happyHourDashDayId } }, (hHDashDayErr, hHDashDayRes) => {
                                hHDashDayRes = JSON.parse(JSON.stringify(hHDashDayRes));
                                if (hHDashDayRes && hHDashDayRes.id) {
                                    let { ownerId } = hHDashDayRes;
                                    Allcategorychart.upsertWithWhere({ ownerId, date, month, year, happyHourDashDayId }, { customerId, ownerId, happyHourDashDayId, dateStr, timeStr, timeZone, date, month, year, dateZero, countryDate, hour, minute, day, country }, (aCCErr, aCCRes) => {
                                        if (aCCRes) {
                                            createChart({ age: Cures.age, gender: Cures.gender, customerId, aCCRes, ownerId });
                                            isCallBack(true, "Success", aCCRes);
                                        } else isCallBack(false, "Error", {});
                                    });
                                } else isCallBack(false, "Invalid request", {});
                            })
                        }
                        else if (sportsDateId && type == 'Sports') {

                            SportsDate.findOne({ where: { id: sportsDateId }, fields: ["id", "sportsId"], include: [{ relation: "sports", scope: { fields: ["sportsCategoryId", "ownerId", "id"] } }] }, (sEr, sRe) => {
                                sRe = JSON.parse(JSON.stringify(sRe));
                                if (sRe && sRe.id && sRe.sportsId) {

                                    let { sportsId, sports: { sportsCategoryId, ownerId } } = sRe;

                                    Allcategorychart.upsertWithWhere({ ownerId, date, month, year, sportsDateId }, { customerId, ownerId, sportsCategoryId, sportsId, sportsDateId, dateStr, timeStr, timeZone, date, month, year, dateZero, countryDate, hour, minute, day, country }, (aCCErr, aCCRes) => {
                                        if (aCCRes) {
                                            createChart({ age: Cures.age, gender: Cures.gender, customerId, aCCRes, ownerId });
                                        }
                                    });
                                    isCallBack(true, "Success", {});
                                } else isCallBack(false, "No Data.Invalid sports date id", {});
                            })

                        } else {
                            isCallBack(false, "Invalid request", {});
                        }


                    } else isCallBack(false, "Enter valid customer id");
                })

            } else isCallBack(false, "CustomerId is required");

        } else isCallBack(false, "Params is required");
    }


    Allcategorychart.remoteMethod('createAnalytics', {
        http: { path: '/createAnalytics', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "create event analytics"
    });
};
