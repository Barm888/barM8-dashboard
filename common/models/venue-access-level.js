const app = require('../../server/server');
var moment = require('moment-timezone');


module.exports = function (Venueaccesslevel) {

    Venueaccesslevel.updateInterest = (params, cb) => {

        const Business = app.models.Business;
        const Customer = app.models.Customer;

        let timeZone = '', momentdate = new Date();

        if (!timeZone) timeZone = "Australia/Sydney";
        let dateFormat = moment.tz(momentdate, timeZone).format(),
            date = moment.tz(momentdate, timeZone).format('DD-MM-YYYY'),
            time = moment.tz(momentdate, timeZone).format('hh:mm a');

        let isSuccess = (message = "Please try again", isSuccess = false, result = {}) => cb(null, { message, isSuccess, result });

        if (params) {
            let { ownerId, customerId } = params;
            if (ownerId && customerId) {
                Business.find({ where: { id: ownerId } }, (berr, bres) => {
                    if (berr) isSuccess(berr, false);
                    else if (bres && bres.length) {
                        Customer.find({ where: { id: customerId } }, (cerr, cres) => {
                            if (cerr) isSuccess(cerr, false);
                            else if (cres && cres.length) {
                                Venueaccesslevel.find({ where: { customerId, ownerId } }, (vErr, vres) => {
                                    if (vErr) isSuccess(vErr, false);
                                    else if (vres && vres.length) {
                                        let { id, isInterest } = vres[0];
                                        if (isInterest) isSuccess("This customer already interested!", true);
                                        else isSuccess("Please try again!", true);
                                    } else {
                                        Venueaccesslevel.create({ customerId, ownerId, isInterest: true, dateFormat, date, time, timeZone }, (cVerr, cVres) => {
                                            if (cVerr) isSuccess(cVerr, false);
                                            else isSuccess("Successfully updated", true, cVres);
                                        })
                                    }
                                })
                            } else isSuccess("Please enter the vaild customerid", false);
                        })
                    } else isSuccess("Please enter the vaild ownerid", false);
                })
            } else isSuccess("ownerId and customerId is required", false);
        } else isSuccess("params is required", false);
    };

    Venueaccesslevel.remoteMethod('updateInterest', {
        http: { path: '/updateInterest', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });
};
