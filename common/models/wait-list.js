const app = require('../../server/server');
var moment = require('moment-timezone');

module.exports = function (Waitlist) {




    Waitlist.saveMail = (params, cb) => {

        let country = "Australia", timeZone = "Australia/Sydney";

        let momentdate = new Date();

        let date = moment.tz(momentdate, timeZone).format('YYYY-MM-DD') + 'T00:00:00.000Z',
            dateStr = moment.tz(momentdate, timeZone).format('DD-MM-YYYY'),
            timeStr = moment.tz(momentdate, timeZone).format('hh:mm A');

        let isCallBack = (isSuccess = false, message = "Please try again!", result = {}) => cb(null, { isSuccess, message, result });

        if (params) {
            let { email } = params;
            if (email) {
                Waitlist.find({ where: { email } }, (err, res) => {
                    if (err) isCallBack();
                    else {
                        if (res.length == 0) {
                            Waitlist.create({ email, date, dateStr, timeStr })
                            isCallBack(true, "Created", res);
                        } else {
                            isCallBack(false, "Already exists. Please try again", {});
                        }
                    }
                })
            } else isCallBack(false, "Email is required", {});
        } else isCallBack();
    }

    Waitlist.remoteMethod('saveMail', {
        http: { path: '/saveMail', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });

};
