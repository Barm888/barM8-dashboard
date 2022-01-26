
let app = require('../../server/server'),
  moment = require('moment-timezone');

module.exports = function (Dashsubline) {
    Dashsubline.createAndUpdate = (details, cb) => {
        let data = {}, dashLineId = details.dashLineId, menu = details.menu, price = details.price, ingredients = details.ingredients;
        if (details) {
            if (details.menu && details.price) {
                Dashsubline.upsertWithWhere({ dashLineId, menu, price }, { dashLineId, menu, price, ingredients }, (err, res) => {
                    if (err) {
                        data.isSuccess = false;
                        data.message = "Not Created";
                        cb(null, data);
                    } else if (res) {
                        if (dashLineId && res) {
                            Dashsubline.find({ where: { dashLineId } }, (dErr, dRes) => {
                                if (dErr) {
                                    data.isSuccess = false;
                                    data.message = "No response find";
                                    cb(null, data);
                                } else if (dRes) {
                                    data.isSuccess = true;
                                    data.message = "Dash Sub line Successfully Created!";
                                    cb(null, data);
                                }
                            });
                        } else {
                            data.isSuccess = false;
                            data.message = "No response find";
                            cb(null, data);
                        }
                    }
                });
            } else {
                data.isSuccess = false;
                data.message = "Menu and Price is required!";
                cb(null, data);
            }
        } else {
            data.isSuccess = false;
            data.message = "Details is required!";
            cb(null, data);
        }
    };

    Dashsubline.multipleMenuCreateAndUpdated = (details, cb) => {
        const DashLine = app.models.DashLine,  DashDate  = app.models.DashDate;

        if(details){
            if (details.dates) {
                let month = details.month, year = details.year, ownerId = details.ownerId, meals = details.meals, category = details.menuHeader;
                let findAndCreate = (val) => {
                    return new Promise((resolve, reject) => {
                        let date = `${year}-${month}-${("0" + val).slice(-2)}T00:00:00.000Z`, dateNo = ("0" + val).slice(-2);
                        DashDate.find({ where: { ownerId, date }, include : "dashLines"  }, (err, res) => {
                            if (err) {
                                reject(err);
                            } else if (res && res.length > 0) {
                                resolve(res);
                            } else {
                                reject(res);
                            }
                        });
                    });
                }; 
             
                details.dates.forEach((a, i) => {
                    findAndCreate(a).then((res) => {
                        if (details.dates.length == (i + 1)) {
                            data.isSuccess = true;
                            data.message = "Dash Sub line Successfully Created!";
                            cb(null, data);
                        }
                    }, (err) => {
                        console.log(err);
                        if (details.dates.length == (i + 1)) {
                            data.isSuccess = false;
                            data.message = "Dash Sub line Successfully Created!";
                            cb(null, data);
                        }
                    });
                });
              
            } else {
                data.isSuccess = false;
                data.message = "date is required!";
                cb(null, data);
            }
        }else{
            data.isSuccess = false;
            data.message = "Details is required!";
            cb(null, data);
        }
    };


    Dashsubline.remoteMethod('multipleMenuCreateAndUpdated', {
        http: { path: '/multipleMenuCreateAndUpdated', verb: 'post' },
        accepts: { arg: 'details', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Multiple menu create and Updated."
    });


    Dashsubline.remoteMethod('createAndUpdate', {
        http: { path: '/createAndUpdate', verb: 'post' },
        accepts: { arg: 'details', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Create and Update Sub Line"
    });
};
