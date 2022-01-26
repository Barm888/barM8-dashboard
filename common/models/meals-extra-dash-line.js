
let app = require('../../server/server');

module.exports = function (Mealsextradashline) {


    Mealsextradashline.removeAddons = (details, cb) => {
        let data = {}, price, desc, id, MealsDashLine = app.models.MealsDashLine;

       let isSuccess = (cb, message, isSuccess) => {
            data.isSuccess = isSuccess;
            data.message = message;
            cb(null, data);
        };

        if (details) {
            price = details.price; desc = details.desc, id = details.mealsDashLineId;
            if(id){
                MealsDashLine.find({ where: { id }, include: [{ relation: "dashSubLines", scope: { include: [{ relation: "mealsExtraDashLines" }] } }] }, (err, res) => {
                  
                    if (err) {
                        isSuccess(cb, "Please try again", false);
                    } else if (res && res.length > 0) {
                        res = JSON.parse(JSON.stringify(res));
                        data.result = res;
                        res[0].dashSubLines.forEach((v, i) => {
                            if (v && v.mealsExtraDashLines && v.mealsExtraDashLines.length > 0) {
                                v.mealsExtraDashLines.forEach((value, index) => {
                                    if (value.desc == desc && value.price == price) {
                                        Mealsextradashline.destroyById(value.id);
                                    }
                                    if (v.mealsExtraDashLines.length == (index + 1) && (i + 1) == res[0].dashSubLines.length) {
                                        isSuccess(cb, "Success", true);
                                    }
                                });
                            } else {
                                if ((i + 1) == res[0].dashSubLines.length > 0) {
                                    isSuccess(cb, "Success", true);
                                }
                            }
                        });
                    }
                });
            }else{
                isSuccess(cb, "id is required", false);
            }
        } else {
            isSuccess(cb, "Details is required", false);
        }
    }

    Mealsextradashline.remoteMethod('removeAddons', {
        http: { path: '/removeAddons', verb: 'post' },
        accepts: { arg: 'details', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Remove all addons in item level"
    });

};
