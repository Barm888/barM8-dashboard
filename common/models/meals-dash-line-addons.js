let app = require('../../server/server');

module.exports = function (Mealsdashlineaddons) {

    Mealsdashlineaddons.CreateAndUpdate = (details, cb) => {
        let data = {}, id, MealsDashLine = app.models.MealsDashLine, MealsExtraDashLine = app.models.MealsExtraDashLine, mealsDashSubLineId, price, desc, ownerId,
            MealsCategory = app.models.MealsCategory;

        let isSuccess = (cb, message = 'Please try again!', arg = false) => {
            data.isSuccess = arg;
            data.message = message;
            cb(null, data);
        };

        findOrCreateDashLine = (valObj, cObj) => {
            return new Promise(async (resolve, reject) => {
                if (valObj && valObj.mealsDashLines && valObj.mealsDashLines.length > 0) {
                   await valObj.mealsDashLines.forEach(async (valSin, j) => {
                        if (valSin && cObj && (valSin.menuHeader == cObj.menuHeader)) {
                            Mealsdashlineaddons.upsertWithWhere({ mealsDashLineId: valSin.id, price, desc }, { mealsDashLineId: valSin.id, price, desc });
                            if (valSin.dashSubLines && valSin.dashSubLines.length > 0) {
                              await valSin.dashSubLines.forEach(async (v, i) => {
                                    if (v && v.id) {
                                        mealsDashSubLineId = v.id;
                                      await MealsExtraDashLine.upsertWithWhere({ mealsDashSubLineId, price, desc }, { mealsDashSubLineId, price, desc }, (extraErr, extraRes) => {
                                            if (extraErr) {
                                                if ((i + 1) == valSin.dashSubLines.length && (j + 1) == valObj.mealsDashLines.length) {
                                                    resolve({ isSuccess: false });
                                                }
                                            } else if (extraRes) {
                                                if ((i + 1) == valSin.dashSubLines.length && (j + 1) == valObj.mealsDashLines.length) {
                                                    resolve({ isSuccess: true });
                                                }
                                            }
                                        });
                                    } else {
                                        if ((i + 1) == valSin.dashSubLines.length && (j + 1) == valObj.mealsDashLines.length) {
                                            resolve({ isSuccess: false });
                                        }
                                    }
                                });
                            } else {
                                if ((j + 1) == valObj.mealsDashLines.length) {
                                    resolve({ isSuccess: false });
                                }
                            }
                        } else {
                            if ((j + 1) == valObj.mealsDashLines.length) {
                                resolve({ isSuccess: false });
                            }
                        }
                    });
                } else {
                    resolve({ isSuccess: false });
                }
            });
        };

        if (details) {
            if (details.mealsDashLineId) {
                id = details.mealsDashLineId; price = details.price; desc = details.desc; ownerId = details.ownerId;
                if (id) {
                    MealsDashLine.find({ where: { id } }, (err, res) => {
                        if (res && res.length > 0) {
                            MealsCategory.find({ where: { ownerId }, include: [{ relation: 'mealsDashLines', scope: { include: [{ relation: "dashSubLines" }] } }] }, (categoryErr, categoryRes) => {
                                if (categoryErr) {
                                    isSuccess(false, "Please try again", cb);
                                } else if (categoryRes && categoryRes.length > 0) {
                                    categoryRes = JSON.parse(JSON.stringify(categoryRes));
                                    categoryRes.forEach(async (v, i) => {
                                        await findOrCreateDashLine(v, res[0]).then((cRes) => {
                                            if (cRes.isSuccess) {
                                                if (categoryRes.length == (i + 1)) {
                                                    isSuccess(cb, "Successfully created", true);
                                                }
                                            } else {
                                                if (categoryRes.length == (i + 1)) {
                                                    isSuccess(cb, "Please try again", false);
                                                }
                                            }
                                        }).catch(error => {
                                            if (categoryRes.length == (i + 1)) {
                                                isSuccess(cb, "Please try again", false);
                                            }
                                        });
                                    });
                                }
                            });
                        } else {
                            isSuccess(cb, "Melas dash line id required", false);
                        }
                    });
                } else {
                    isSuccess(cb, "Melas dash line id required", false);
                }
            } else {
                isSuccess(cb, "Melas dash line id required", false);
            }
        } else {
            isSuccess(cb, "Please try again", false);
        }
    };

    Mealsdashlineaddons.remoteMethod('CreateAndUpdate', {
        http: { path: '/CreateAndUpdate', verb: 'post' },
        accepts: { arg: 'details', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Meals header level addons."
    });
};
