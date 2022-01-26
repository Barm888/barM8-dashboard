let app = require('../../server/server');
const cron = require('node-cron');
const moment = require('moment-timezone');

module.exports = function (Venuesettings) {

    Venuesettings.createAndUpdate = (params, cb) => {

        let isCallBack = (isSuccess, message, result = {}) => cb(null, { isSuccess, message, result });

        if (params) {
            let { createData } = params;
            createData.forEach((val, i) => {
                Venuesettings.upsertWithWhere({ ownerId: val.ownerId, category: val.category }, val, (err, res) => {
                    if (err && (i + 1) == createData.length) isCallBack(false, "Error", err);
                    else if ((i + 1) == createData.length) isCallBack(true, "Success", res);
                })
            })
        } else isCallBack(false, "Params is required!")
    }

    Venuesettings.remoteMethod('createAndUpdate', {
        http: { path: '/createAndUpdate', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "createAndUpdate"
    });

};
