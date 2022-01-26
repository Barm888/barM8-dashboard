const app = require('../../server/server');
var moment = require('moment-timezone');

module.exports = function (Viewscoupon) {

    Viewscoupon.updateViewCount = (params, cb) => {
        let  isSuccess = (message = "Please try again", isSuccess = false, res = {}) => cb(null, { message, isSuccess });
        if (params) {
            const Customer = app.models.Customer , ExclusiveOffer = app.models.ExclusiveOffer;
            let { exclusiveOfferId, customerId, timeZone } = params;
            if (!timeZone) timeZone = 'Australia/Sydney';
            let dateFormat = moment.tz(new Date(), timeZone).format('DD-MM-YYYY'),
                time = moment.tz(new Date(), timeZone).format('hh:mm a'),
                dateNo = moment.tz(new Date(), timeZone).format('DD'),
                month = moment.tz(new Date(), timeZone).format('MM'),
                year = moment.tz(new Date(), timeZone).format('YYYY'),
                date = moment.tz(new Date(), timeZone).toJSON();

            Customer.findById(customerId, (cusErr, cusRes) => {
                if (cusErr) isSuccess("Invalid Customer", false, cusErr);
                else if (cusRes) {
                    ExclusiveOffer.findById(exclusiveOfferId, (eOErr, eORes) => {
                        if (eOErr) isSuccess("Invalid coupon", false, eOErr);
                        else  if(eORes){
                            Viewscoupon.findOne({ where: { customerId, exclusiveOfferId, dateNo, month, year } }, (err, res) => {
                                if (err) isSuccess("Error", false, err);
                                else {
                                    if (res) {
                                        let viewcount = parseInt(res.viewcount) + 1;
                                        Viewscoupon.upsertWithWhere({ id: res.id }, { viewcount });
                                        isSuccess("Success", true, {});
                                    } else {
                                        Viewscoupon.create({ timeZone, dateFormat, time, date, dateNo, month, year, customerId, exclusiveOfferId, viewcount: 1 });
                                        isSuccess("Success", true, {});
                                    }
                                }
                            });
                        } else isSuccess("Invalid coupon", false, eOErr);
                    })
                } else isSuccess("Invalid Customer", false, cusErr);
            })
        } else isSuccess("Params is required", false);

    }

    Viewscoupon.remoteMethod('updateViewCount', {
        http: { path: '/updateViewCount', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });

};
