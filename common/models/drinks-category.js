

let app = require('../../server/server');

module.exports = function (Drinkscategory) {


    Drinkscategory.createAndUpdate = (params = {}, cb) => {

        let DrinksDashLine = app.models.DrinksDashLine, DrinksDashSubLine = app.models.DrinksDashSubLine,
            DrinksMixer = app.models.DrinksMixer, DrinksExtras = app.models.DrinksExtras, DrinksConfig = app.models.DrinksConfig,
            SpiritDispense = app.models.SpiritDispense;

       let isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });

        if (params && params.ownerId) {

            let { _category , brand , type , desc , brandTxt , drinksTypeId , ownerId , groupId } = params;

            let createCategory = () => {

                Drinkscategory.findOne({ where: { _category, ownerId } }, (err, res) => {
                    
                    if (res) {
                        if (_category == "_spirit") {
                            DrinksDashLine.upsertWithWhere({ drinksCategoryId: res.id, brand, desc }, { drinksCategoryId: res.id, brand, desc, brandTxt, drinksTypeId , type , groupId }, (dashLineErr, dashLineRes) => {
                                if (dashLineRes) {
                                    params.dispense.forEach(val => {
                                        let { name, _name, price } = val;
                                        DrinksDashSubLine.create({ drinksDashLineId: dashLineRes.id , dispenseTxt : name , dispense : _name , price , dispenseType : 'Spirit' , _dispenseType : 'spirit' });
                                    });
                                    params.mixer.forEach(val => DrinksMixer.upsertWithWhere({ drinksDashLineId: dashLineRes.id, name: val.name, _name: val._name },
                                        { drinksDashLineId: dashLineRes.id, name: val.name, _name: val._name }))
                                    params.extra.forEach(val => DrinksExtras.upsertWithWhere({ drinksDashLineId: dashLineRes.id, name: val.name, _name: val._name },
                                        { drinksDashLineId: dashLineRes.id, name: val.name, _name: val._name }))
                                }
                            });
                        } else {
                            let dispenseType  , _dispenseType = null;
                            if (_category == '_beer_cider') {
                                if (params.dispense.some((m) => m._dispenseType == 'bottleAndCan')) { dispenseType = "Bottle & Can"; _dispenseType = "bottleAndCan"; }
                                else { dispenseType = "On Tap"; _dispenseType = "onTap"; }
                            }

                            DrinksDashLine.upsertWithWhere({ drinksCategoryId: res.id, brand, desc }, 
                                { drinksCategoryId: res.id, brand, desc, brandTxt, drinksTypeId, type, dispenseType, _dispenseType, groupId }, (dashLineErr, dashLineRes) => {
                                if (dashLineRes && params.dispense && params.dispense.length) {
                                    params.dispense.forEach(val => {
                                        DrinksDashSubLine.upsertWithWhere({
                                            drinksDashLineId: dashLineRes.id,
                                            dispense: val.dispense, price: val.price
                                        }, {
                                                drinksDashLineId: dashLineRes.id, dispense: val.dispense,
                                                dispenseTxt: val.dispenseTxt, price: val.price, order: val.order,
                                                dispenseType: val.dispenseType, _dispenseType: val._dispenseType
                                            })
                                    });
                                }
                            });
                        }
                    }
                    isSuccess(true, "Successfully created");
                });
            };

            DrinksConfig.find((configErr, configRes) => {
                if (configRes && configRes.length) {
                    configRes.forEach((val, i) => {
                        Drinkscategory.upsertWithWhere({ ownerId, _category: val._name }, { ownerId, category: val.displayTxt, _category: val._name, shortName: val._name, order: val.order ,
                            displayTxt : val.displayTxt , _name : val._name , name : val.name , _idtxt : val._idtxt , img_url : val.img_url , class : val.class  }, (createErr , createRes)=>{
                            if ((i + 1) == configRes.length) createCategory();
                        });
                    });
                } else isSuccess();
            });

        } else isSuccess();
    };

    Drinkscategory.deleteDashAndSubLine = (params = {}, cb) => {
        let DrinksDashLine = app.models.DrinksDashLine, DrinksDashSubLine = app.models.DrinksDashSubLine,
            DrinksMixer = app.models.DrinksMixer, DrinksExtras = app.models.DrinksExtras;
        isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });
        if (params.groupId) {
            let groupId = params.groupId;
            DrinksDashLine.findOne({
                where: { groupId }, include: [{ relation: "drinksDashSubLines" },
                { relation: "drinksExtras" }, { relation: "drinksMixers" }]
            }, (err, res) => {
                if (err) isSuccess(true, "Successfully deleted");
                else {
                    res = JSON.parse(JSON.stringify(res));
                    DrinksDashLine.destroyById(res.id, ()=>{
                        res.drinksDashSubLines.forEach(val => DrinksDashSubLine.destroyById(val.id));
                        res.drinksExtras.forEach(val => DrinksMixer.destroyById(val.id));
                        res.drinksMixers.forEach(val => DrinksExtras.destroyById(val.id));
                        isSuccess(true, "Successfully deleted");
                    });
                }
            })
         }
        else isSuccess();
    }

    Drinkscategory.remoteMethod('deleteDashAndSubLine', {
        http: { path: '/deleteDashAndSubLine', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "DashLine and dashsubline item deleted"
    });

    Drinkscategory.remoteMethod('createAndUpdate', {
        http: { path: '/createAndUpdate', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "drinks menu create and update"
    });

};
