const app = require('../../server/server');
var moment = require('moment-timezone');

module.exports = function (Visitvenuefromcoupon) {


    Visitvenuefromcoupon.updateVisitCount = (params, cb) => {
        let isSuccess = (message = "Please try again", isSuccess = false, res = {}) => cb(null, { message, isSuccess });
        if (params) {
            const Customer = app.models.Customer, ExclusiveOffer = app.models.ExclusiveOffer,
                Business = app.models.Business;
            let { exclusiveOfferId, customerId, timeZone, ownerId } = params;
            if (!timeZone) timeZone = 'Australia/Sydney';
            let dateFormat = moment.tz(new Date(), timeZone).format('DD-MM-YYYY'),
                time = moment.tz(new Date(), timeZone).format('hh:mm a'),
                dateNo = moment.tz(new Date(), timeZone).format('DD'),
                month = moment.tz(new Date(), timeZone).format('MM'),
                year = moment.tz(new Date(), timeZone).format('YYYY'),
                date = moment.tz(new Date(), timeZone).toJSON();

            Business.findOne(ownerId, (BErr, Bres) => {
                if (BErr) isSuccess("Invalid Business", false, cusErr);
                else {
                    Customer.findById(customerId, (cusErr, cusRes) => {
                        if (cusErr) isSuccess("Invalid Customer", false, cusErr);
                        else if (cusRes) {
                            ExclusiveOffer.findById(exclusiveOfferId, (eOErr, eORes) => {
                                if (eOErr) isSuccess("Invalid coupon", false, eOErr);
                                else if (eORes) {
                                    Visitvenuefromcoupon.findOne({ where: { ownerId, exclusiveOfferId, customerId } }, (err, res) => {
                                        res = JSON.parse(JSON.stringify(res));
                                        if (err) isSuccess("Error", false, err);
                                        else if (res) {
                                            let visitCount = parseInt(res.visitCount) + 1;
                                            Visitvenuefromcoupon.upsertWithWhere({ id: res.id }, { visitCount });
                                            isSuccess("Success", true, {});
                                        }
                                        else {
                                            Visitvenuefromcoupon.create({ ownerId, exclusiveOfferId, customerId, dateFormat, time, dateNo, month, year, date, visitCount: 1 });
                                            isSuccess("Success", true, {});
                                        }
                                    })
                                } else isSuccess("Invalid coupon", false, eOErr);
                            })
                        } else isSuccess("Invalid Customer", false, cusErr);
                    })
                }
            })

        } else isSuccess("Params is required", false);
    }

    Visitvenuefromcoupon.remoteMethod('updateVisitCount', {
        http: { path: '/updateVisitCount', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });
};
