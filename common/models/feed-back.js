const app = require('../../server/server');
var moment = require('moment-timezone');

module.exports = function (Feedback) {

    Feedback.createFeedBack = (params = {}, cb) => {

        const ExclusiveOffer = app.models.ExclusiveOffer,
            Business = app.models.Business,
            DailySpecial = app.models.DailySpecial,
            HappyHourDashDay = app.models.HappyHourDashDay,
            Customer = app.models.Customer;

        let isSuccess = (isSuccess = false, message = "Please try again", result = {}) => cb(null, { isSuccess, message });

        if (params) {
            let { offerId, type, ownerId, customerId, timeZone = "Australia/Sydney", country = "Australia", msg, status = "Open" } = params;

            let momentdate = new Date();
            let date = moment.tz(momentdate, timeZone).format('YYYY-MM-DD') + 'T00:00:00.000Z';
            let dateF = moment.tz(momentdate, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";
            let dateStr = moment.tz(momentdate, timeZone).format('DD-MM-YYYY');
            let time = moment.tz(momentdate, timeZone).format('hh:mm A');

            let createF = (cObj) => {
                Feedback.create(cObj, (err, res) => {
                    if (err) isSuccess(false, "Error!");
                    else isSuccess(true, "Successfully created!");
                })
            }

            if (customerId) {
                Customer.find({ where: { id: customerId } }, (err_c, res_c) => {
                    if (err_c) isSuccess(false, "Error!");
                    else if (res_c && res_c.length) {
                        if (ownerId) {
                            Business.find({ where: { id: ownerId } }, (b_err, b_res) => {
                                if (b_err) isSuccess(false, "Error!");
                                else if (b_res && b_res.length) {
                                    if (type == "LimitedOffer") {
                                        if (offerId && msg) {
                                            ExclusiveOffer.find({ where: { id: offerId } }, (err_e, res_e) => {
                                                if (err_e) {
                                                    isSuccess(false, "Error!");
                                                } else if (res_e && res_e.length) {
                                                    createF({
                                                        exclusiveOfferId: offerId, customerId, msg, status, timeZone,
                                                        country, date, dateF, dateStr, time, ownerId, isLimitedOffer: true
                                                    })
                                                } else isSuccess(false, "Invaild OfferId!");
                                            })
                                        } else isSuccess(false, "exclusiveOfferId and msg required!");
                                    } else if (type == "DailySpecial") {
                                        if (offerId && msg) {
                                            DailySpecial.find({ where: { id: offerId } }, (err_e, res_e) => {
                                                if (err_e) {
                                                    isSuccess(false, "Error!");
                                                } else if (res_e && res_e.length) {
                                                    createF({
                                                        dailySpecialId: offerId, customerId, msg, status, timeZone,
                                                        country, date, dateF, dateStr, time, ownerId, isDailySpecial: true
                                                    })
                                                } else isSuccess(false, "Invaild DailySpecialId!");
                                            })
                                        } else isSuccess(false, "DailySpecialId and msg required!");
                                    } else if (type == "DrinksSpecial") {
                                        if (offerId && msg) {
                                            HappyHourDashDay.find({ where: { id: offerId } }, (err_e, res_e) => {
                                                if (err_e) {
                                                    isSuccess(false, "Error!");
                                                } else if (res_e && res_e.length) {
                                                    createF({
                                                        happyHourDashDayId: offerId, customerId, msg, status, timeZone,
                                                        country, date, dateF, dateStr, time, ownerId, isDrinksSpecial: true
                                                    })
                                                } else isSuccess(false, "Invaild HappyHourDashDayId!");
                                            })
                                        } else isSuccess(false, "HappyHourDashDayId and msg required!");
                                    }
                                }
                                else {
                                    isSuccess(false, "Invaild OwnerId!");
                                }
                            })
                        } else isSuccess(false, "OwnerId is required!");
                    } else isSuccess(false, "Invaild CustomerId!");
                });
            } else isSuccess(false, "CustomerId is required!");

        } else isSuccess(false, "params required!");
    }


    Feedback.remoteMethod('createFeedBack', {
        http: { path: '/createFeedBack', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "create Feedback"
    });
};
