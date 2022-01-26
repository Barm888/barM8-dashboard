
const app = require('../../server/server');
const cron = require('node-cron');
const moment = require('moment-timezone');


module.exports = function (Chartforexclusiveoffer) {

    Chartforexclusiveoffer.createAnalytics = (params, cb) => {

        const Customer = app.models.Customer,
            AllCategoryCustomerHits = app.models.AllCategoryCustomerHits,
            ExclusiveOffer = app.models.ExclusiveOffer;

        let isCallBack = (isSuccess = false, message = "please try again", result = {}) =>
            cb(null, { isSuccess, message, result });

        if (params) {

            let { customerId, exclusiveOfferId, timeZone = "Australia/Sydney",
                country = "Australia", type, ClaimscouponRes = {} } = params;

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

                    //Exclusive offer hours Count
                    let _hoursPlus = ("0" + (Number(hour) + 1)).slice(-2);
                    let viewData = aCCRes[`_${hour}to${_hoursPlus}`];


                    let ageAndGender = () => {
                        //Exclusive offer Age Count
                        age = parseInt(age);
                        if (age >= 18 && age <= 100) {
                            if (age >= 18 && age <= 23) viewData._18to23_Age = Number(viewData._18to23_Age || 0) + 1;
                            if (age >= 24 && age <= 29) viewData._24to29_Age = Number(viewData._24to29_Age || 0) + 1;
                            if (age >= 30 && age <= 35) viewData._30to35_Age = Number(viewData._30to35_Age || 0) + 1;
                            if (age >= 36 && age <= 41) viewData._36to41_Age = Number(viewData._36to41_Age || 0) + 1;
                            if (age >= 42 && age <= 100) viewData._42toPlus_Age = Number(viewData._42toPlus_Age || 0) + 1;
                        }

                        //AllCategory male and Female Cnt
                        if (gender && gender == 'Male') {
                            viewData.male = Number(viewData.male || 0) + 1;
                        }
                        else if (gender && gender == 'Female') {
                            viewData.female = Number(viewData.female || 0) + 1;
                        }
                    }

                    if (!viewData) viewData = {
                        view: 0, claim: 0, redeem: 0, _18to23_Age: 0,
                        _24to29_Age: 0, _30to35_Age: 0, _36to41_Age: 0, _42toPlus_Age: 0,
                        male: 0, female: 0
                    }

                    if (type == 'view') {
                        if (viewData && viewData.view) viewData.view = Number(viewData.view) + 1;
                        else if (viewData.view == 0) viewData.view = 1;
                        else viewData.view = 1;

                    } else if (type == 'claim') {
                        if (viewData && viewData.claim) viewData.claim = Number(viewData.claim) + 1;
                        else if (viewData.claim == 0) viewData.claim = 1;
                        else viewData.claim = 1;
                    } else if (type == 'redeem') {
                        if (viewData && viewData.redeem) viewData.redeem = Number(viewData.redeem) + 1;
                        else if (viewData.redeem == 0) viewData.redeem = 1;
                        else viewData.redeem = 1;
                    }

                    ageAndGender();



                    updateObj[`_${hour}to${_hoursPlus}`] = viewData;



                    // UpdateData 
                    await Chartforexclusiveoffer.upsertWithWhere({ id: aCCRes.id }, updateObj);

                    await AllCategoryCustomerHits.create({
                        chartForExclusiveOfferId: aCCRes.id, customerId, scanDateZero: dateZero, date, month, year,
                        scanDate: dateStr, scanTime: timeStr, country, timeZone
                    }, () => {
                        if (ownerId && date && month && year) {

                            Chartforexclusiveoffer.findOne({
                                where: { ownerId, exclusiveOfferId },
                                include: [{ relation: "allCategoryCustomerHits" }]
                            }, (AllcategorychartErr, AllcategorychartRes) => {

                                let AllCChartD = JSON.parse(JSON.stringify(AllcategorychartRes));

                                if (AllCChartD && AllCChartD.allCategoryCustomerHits && AllCChartD.id) {
                                    let newCnt = AllCChartD.allCategoryCustomerHits.filter(m => m.customerId == customerId);
                                    if (newCnt && newCnt.length > 1) {
                                        let returning = Number(AllCChartD.returning || 0) + 1;
                                        Chartforexclusiveoffer.upsertWithWhere({ id: AllCChartD.id }, { returning })
                                    } else {
                                        let newCount = Number(AllCChartD.new || 0) + 1;
                                        Chartforexclusiveoffer.upsertWithWhere({ id: AllCChartD.id }, { new: newCount })
                                    }
                                }
                            })

                        }
                    });
                }
            }

            if (exclusiveOfferId && customerId) {

                Customer.findOne({ where: { id: customerId } }, { fields: ["id", "firstName", "lastName", "mobile", "postCode", "dob", "age", "state", "city", "gender"] }, (Cuerr, Cures) => {
                    if (Cuerr) { isCallBack(false, "Enter valid customer id"); }
                    else if (Cures) {

                        ExclusiveOffer.findOne({ where: { id: exclusiveOfferId } }, (er, re) => {

                            re = JSON.parse(JSON.stringify(re));

                            if (re && re.id) {

                                let ownerId = re.ownerId;

                                Chartforexclusiveoffer.upsertWithWhere({ ownerId, date, month, year, exclusiveOfferId }, { customerId, ownerId, dateStr, exclusiveOfferId, timeStr, timeZone, date, month, year, dateZero, countryDate, hour, minute, day, country }, (aCCErr, aCCRes) => {
                                    if (aCCRes) {
                                        createChart({ age: Cures.age, gender: Cures.gender, customerId, aCCRes, ownerId });
                                        isCallBack(true, "Success", ClaimscouponRes);
                                    }
                                });

                            } else isCallBack(false, "No Data.Invalid coupon date id", {});
                        })

                    } else isCallBack(false, "Enter valid customer id");
                });

            } else isCallBack(false, "exclusiveOfferId or CustomerId is required");

        } else isCallBack(false, "Params is required");

    }


    Chartforexclusiveoffer.remoteMethod('createAnalytics', {
        http: { path: '/createAnalytics', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "create exclusive offer analytics"
    });
};
