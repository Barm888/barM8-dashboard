let app = require('../../server/server');
const cron = require('node-cron');
const moment = require('moment-timezone');

module.exports = function (Venuetags) {

    Venuetags.deleteAllOldData = (params, cb) => {
        let isCallBack = (isSuccess = false, message = "please try again", result = {}) => cb(null, { isSuccess, message, result });
        if (params) {
            let { ownerId } = params;
            if (ownerId) {
                Venuetags.destroyAll({ ownerId }, (err, res) => {
                    isCallBack(true, "Success");
                })
            } else isCallBack(false, "OwnerId is required!", {})
        } else isCallBack(false, "Params is required!", {})
    }


    Venuetags.remoteMethod('deleteAllOldData', {
        http: { path: '/deleteAllOldData', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "deleteAllOldData"
    });
};
