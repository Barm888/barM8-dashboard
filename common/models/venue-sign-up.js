let app = require('../../server/server');
const cron = require('node-cron');
const moment = require('moment-timezone');

module.exports = function (Venuesignup) {

    Venuesignup.createSignUp = (params, cb) => {

        let isCallBack = (isSuccess = false, message = "please try again", result = {}) => cb(null, { isSuccess, message, result });

        if (params) {
            let { email, name, contactNo, type, venueName } = params;
            if (email && contactNo) {
                Venuesignup.find({ where: { email } }, (err, res) => {
                    if (res && res.length) {
                        isCallBack(false, "Already Exits!");
                    } else {
                        Venuesignup.create({ email, name, contactNo, type, venueName }, (err_1, res_1) => {
                            isCallBack(true, "Successfully created!");
                        })
                    }
                })
            } else isCallBack(false, "Email and contact number is required!");
        } else isCallBack(false, "params is required!");
    }


    Venuesignup.remoteMethod('createSignUp', {
        http: { path: '/createSignUp', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "createSignUp"
    });
};
