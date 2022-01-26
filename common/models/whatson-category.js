
let app = require('../../server/server');

module.exports = function (Whatsoncategory) {

    Whatsoncategory.createAndUpdate = (params, cb) => {
        let WhatsOn = app.models.WhatsOn;
        let isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });
        let { ownerId, category, _category, files , whatsOnSubCategoryId } = params;
        Whatsoncategory.upsertWithWhere({ category, _category, ownerId }, { ownerId, category, _category }, (err, res) => {
            if (res) {
                files.forEach((val, i) => {
                    WhatsOn.create({ whatsonCategoryId: res.id, fileName: val.fileName, path: val.path , whatsOnSubCategoryId });
                });
            }
        });
        isSuccess();
    }

    Whatsoncategory.remoteMethod('createAndUpdate', {
        http: { path: '/createAndUpdate', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "whatscategory and whatson create and update"
    });
};
