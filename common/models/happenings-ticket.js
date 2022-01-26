

const app = require('../../server/server'),
moment = require('moment-timezone');

module.exports = function(Happeningsticket) {

    Happeningsticket.createAndUpdate = (params, cb) => {

      let isCallBack = (isSuccess, message, result = {}) => cb(null, { isSuccess, message, result });

        if (params) {
            let {  tickets } = params;
            tickets.forEach(async (tVal) => {
                await Happeningsticket.create(tVal);
            });
            isCallBack(true , "Successfully created", {});
        } else isCallBack();
    }

    Happeningsticket.remoteMethod('createAndUpdate', {
        http: { path: '/createAndUpdate', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Create And update"
    });
};
