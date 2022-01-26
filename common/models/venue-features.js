let app = require('../../server/server');
const cron = require('node-cron');
const moment = require('moment-timezone');

module.exports = function (Venuefeatures) {

    Venuefeatures.deleteAllVenueFeatures = (params, cb) => {

        let isCallBack = (isSuccess = false, message = "please try again", result = {}) => cb(null, { isSuccess, message, result });

        if (params) {
            let { ownerId } = params;
            if (ownerId) {
                Venuefeatures.destroyAll({ ownerId }, (err, res) => {
                    isCallBack(true, "Success");
                })
            } else isCallBack(false, "OwnerId is required!", {})
        } else isCallBack(false, "Params is required!", {})
    }

    Venuefeatures.remoteMethod('deleteAllVenueFeatures', {
        http: { path: '/deleteAllVenueFeatures', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "deleteAllVenueFeatures"
    });
};
