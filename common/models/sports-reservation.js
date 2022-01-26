const app = require('../../server/server');
const cron = require('node-cron');
const moment = require('moment-timezone');

module.exports = function (Sportsreservation) {



    Sportsreservation.createReservation = (params, cb) => {

        const Customer = app.models.Customer,
            Sports = app.models.Sports;

        let isCallBack = (isSuccess = false, message = "please try again", result = {}) => cb(null, { isSuccess, message, result });

        if (params) {

            let { ownerId, customerId, sportsId, timeZone = "Australia/Sydney",
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

            if (customerId) {

                Customer.findOne({ where: { id: customerId } }, { fields: ["id", "firstName", "lastName", "mobile", "postCode", "dob", "age", "state", "city", "gender"] }, (Cuerr, Cures) => {
                    if (Cuerr) { isCallBack(false, "Enter valid customer id"); }
                    else if (Cures) {
                        if (sportsId && ownerId) {

                            try {
                                Sports.findOne({ where: { id: sportsId } }, (sErr, sRes) => {
                                    if (sErr) { isCallBack(false, "Enter valid sports date id"); }
                                    else if (sRes) {
                                        Sportsreservation.upsertWithWhere({ ownerId, date, month, year, sportsId, customerId }, { customerId, sportsId, ownerId, dateStr, timeStr, timeZone, date, month, year, dateZero, countryDate, hour, minute, day, country, isInterest: true }, (aCCErr, aCCRes) => {
                                            if (aCCRes) {
                                                isCallBack(true, "Success", aCCRes);
                                            } else isCallBack(false, "Error", {});
                                        });
                                    }
                                })
                            } catch (e) {
                                isCallBack(false, "Error", e);
                            }

                        } else isCallBack(false, "Sports Id and ownerId required!")
                    }
                })
            } else isCallBack(false, "Customer id is required!");


        } else isCallBack(false, "Params is required!");
    }

    Sportsreservation.remoteMethod('createReservation', {
        http: { path: '/createReservation', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "create sports reservation"
    });


};
