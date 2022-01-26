
const app = require('../../server/server');
const cron = require('node-cron');
const moment = require('moment-timezone');


module.exports = function (Chartforbooking) {

    Chartforbooking.createOrUpdate = (params, cb) => {

        const AllCategoryCustomerHits = app.models.AllCategoryCustomerHits,
            Customer = app.models.Customer,
            Business = app.models.Business;

        let isCallBack = (isSuccess = false, message = "please try again", result = {}) => cb(null, { isSuccess, message, result });

        if (params) {
            let { ownerId, customerId, timeZone = "Australia/Sydney",
                country = "Australia" } = params;
            if (ownerId && customerId) {

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


                let createChart = ({ Cures, aCCRes }) => {

                    let { age, gender } = Cures;

                    if (aCCRes && aCCRes.id) {

                        let updateObj = {}, alchaobj = {};

                        //AllCategory hours Count
                        let _hoursPlus = ("0" + (Number(hour) + 1)).slice(-2);
                        alchaobj = aCCRes[`_${hour}to${_hoursPlus}`];

                        updateObj[`_${hour}to${_hoursPlus}`] = Number(alchaobj) + 1;


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
                        Chartforbooking.upsertWithWhere({ id: aCCRes.id }, updateObj);

                        AllCategoryCustomerHits.create({
                            chartForBookingId: aCCRes.id, customerId, scanDateZero: dateZero, date, month, year,
                            scanDate: dateStr, scanTime: timeStr, country, timeZone
                        }, () => {
                            if (ownerId && date && month && year) {

                                let alCFilter = { ownerId, id: aCCRes.id, date, month, year }

                                Chartforbooking.findOne({
                                    where: alCFilter,
                                    include: [{ relation: "allCategoryCustomerHits" }]
                                }, (AllcategorychartErr, AllCChartD) => {

                                    AllCChartD = JSON.parse(JSON.stringify(AllCChartD));

                                    if (AllCChartD && AllCChartD.allCategoryCustomerHits && AllCChartD.id) {
                                        let newCnt = AllCChartD.allCategoryCustomerHits.filter(m => m.customerId == customerId);
                                        if (newCnt && newCnt.length > 1) {
                                            let returning = Number(AllCChartD.returning || 0) + 1;
                                            Chartforbooking.upsertWithWhere({ id: AllCChartD.id }, { returning })
                                        } else {
                                            let newCount = Number(AllCChartD.new || 0) + 1;
                                            Chartforbooking.upsertWithWhere({ id: AllCChartD.id }, { new: newCount })
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
                            Business.find({ where: { id: ownerId } }, (er, rs) => {
                                if (er) isCallBack(false, "Error", er);
                                else if (rs && rs.length) {
                                    Chartforbooking.upsertWithWhere({ ownerId, date, month, year }, { ownerId, dateStr, timeStr, timeZone, date, month, year, dateZero, countryDate, hour, minute, day, country }, (aCCErr, aCCRes) => {
                                        if (aCCRes) {
                                            // console.log(aCCRes, Cures);
                                            createChart({ Cures, aCCRes });
                                            isCallBack(true, "Success", {})
                                        } else isCallBack(false, "Error", aCCErr);
                                    });
                                } else isCallBack(false, "Invaild OwnerId! Please try again!", er);
                            });
                        } else isCallBack(false, "Enter valid customer id");
                    });
                }




            } else isCallBack(false, "ownerId and CustomerId  is required!", {});
        } else isCallBack(false, "params is required!", {});

    }


    Chartforbooking.remoteMethod('createOrUpdate', {
        http: { path: '/createOrUpdate', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "create booking analytics"
    });
};
