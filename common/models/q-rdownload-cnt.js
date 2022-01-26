
const app = require('../../server/server');
const moment = require('moment-timezone');

module.exports = function (Qrdownloadcnt) {

    Qrdownloadcnt.updatedwnCnt = (params = {}, cb) => {

        let isCallBack = (isSuccess = false, message = "please try again", result = {}) => cb(null, { isSuccess, message, result });

        if (params) {
            let { isAndroid = false, isIos = false } = params;
            Qrdownloadcnt.create({ isAndroid, isIos }, (err, res) => {
                isCallBack(true, "Success", {});
            })

        } else isCallBack();
    }

    Qrdownloadcnt.remoteMethod('updatedwnCnt', {
        http: { path: '/updatedwnCnt', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "updatedwnCnt"
    });
};
