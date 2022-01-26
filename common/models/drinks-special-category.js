
let app = require('../../server/server');

module.exports = function (Drinksspecialcategory) {

    Drinksspecialcategory.createAndUpdate = (params = {}, cb) => {

        isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });

        let category = params.category, _category = params._category, drinksSpecialId = params.drinksSpecialId;

        if (category && _category && drinksSpecialId) {
            Drinksspecialcategory.upsertWithWhere({ category, _category, drinksSpecialId }, params, (err, res) => {
                if (err) isSuccess();
                else if (res) isSuccess(true, "success");
                else isSuccess();
            });
        } else isSuccess();
    }

    Drinksspecialcategory.createSpiritSpecial = (params = {}, cb) => {
        

        let DrinksDashLine = app.models.DrinksDashLine,
            DrinksSpecialDashLine = app.models.DrinksSpecialDashLine,
            DrinksSpecialDashSubLine = app.models.DrinksSpecialDashSubLine,
            DrinksDashSubLine = app.models.DrinksDashSubLine,
            DrinksMixer = app.models.DrinksMixer,
            DrinksExtras = app.models.DrinksExtras;

        isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });

        let groupId = params.groupId, drinksSpecialCategoryId = params.drinksSpecialCategoryId;
        DrinksDashLine.findOne({
            where: { groupId }, include: [{ relation: "drinksDashSubLines", scope: { where: { id: params.itemId } } },
            { relation: "drinksExtras" }, { relation: "drinksMixers" }]
        }, (err, res) => {
            res = JSON.parse(JSON.stringify(res));
            if (res) {

                let {brandTxt , brand , desc , drinksTypeId , type } = res;

                DrinksSpecialDashLine.upsertWithWhere({ groupId }, { brandTxt, brand , type , desc, drinksSpecialCategoryId, drinksTypeId , groupId },  async(specialErr, specialres) => {
                    if (specialres) {
                        await DrinksDashSubLine.upsertWithWhere({ id : params.itemId }, { inAppSpecial: params.inAppSpecial });
                        res.drinksDashSubLines.forEach(async (val) => {
                            await DrinksSpecialDashSubLine.upsertWithWhere({ dispense : val.dispense , dispenseType: 'Spirit' }, { inAppSpecial: params.inAppSpecial, drinksSpecialDashLineId: specialres.id , dispense : val.dispense , dispenseTxt : val.dispenseTxt ,
                                dispenseType : val.dispenseType , _dispenseType : val._dispenseType , price : val.price
                            })
                        });
                        res.drinksMixers.forEach(async (val) => {
                            await DrinksMixer.upsertWithWhere({ drinksSpecialDashLineId: specialres.id },
                                { name: val.name, _name: val._name, isSpecial: true, drinksSpecialDashLineId: specialres.id })
                        })
                        res.drinksExtras.forEach(async (val) => {
                            await DrinksExtras.upsertWithWhere({ drinksSpecialDashLineId: specialres.id },
                                { name: val.name, _name: val._name, isSpecial: true, drinksSpecialDashLineId: specialres.id })
                        })
                    }
                });
            }
        })

        isSuccess(true, "Success");
    }

    Drinksspecialcategory.createSpecial = (params = {}, cb) => {

        let DrinksDashLine = app.models.DrinksDashLine,
            DrinksSpecialDashLine = app.models.DrinksSpecialDashLine,
            DrinksSpecialDashSubLine = app.models.DrinksSpecialDashSubLine,
            DrinksDashSubLine = app.models.DrinksDashSubLine;

        isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });

        create = () => {

            let { drinksSpecialCategoryId , groupId } = params;

            DrinksDashLine.findOne({ where: { groupId }, include: [{ relation: "drinksDashSubLines", scope: { where: { id: params.itemId } } }] }, (err, res) => {
                res = JSON.parse(JSON.stringify(res));
                if (res) {
                    let { brandTxt , brand , desc , drinksTypeId , type , dispenseType , _dispenseType } = res;
                    
                    DrinksSpecialDashLine.upsertWithWhere({ groupId }, {
                        brandTxt, brand, desc, type, drinksSpecialCategoryId,
                        drinksTypeId, dispenseType, _dispenseType, groupId
                    }, (specialErr, specialres) => {
                        if (specialres) {
                            DrinksDashSubLine.upsertWithWhere({ id: params.itemId }, {
                                inAppSpecial: params.inAppSpecial,
                                groupId, drinksSpecialCategoryId
                            });
                            res.drinksDashSubLines.forEach((val) => {
                                DrinksSpecialDashSubLine.upsertWithWhere({ dispense : val.dispense, drinksSpecialDashLineId: specialres.id }, {
                                    dispense: val.dispense, dispenseTxt: val.dispenseTxt, extra: val.extra,
                                    _extra: val._extra, mixer: val.mixer, _mixer: val._mixer, order: val.order,
                                    inAppSpecial: params.inAppSpecial, price: val.price, drinksSpecialDashLineId: specialres.id,
                                    dispenseType: val.dispenseType, _dispenseType: val._dispenseType
                                })
                            });
                        }
                    });
                }
            });

            isSuccess(true, "Success.")
        };
        create();
    };

    Drinksspecialcategory.deleteDashAndSubLine = (params = {}, cb) => {
        let DrinksSpecialDashLine = app.models.DrinksSpecialDashLine,
            DrinksSpecialDashSubLine = app.models.DrinksSpecialDashSubLine,
            DrinksDashSubLine = app.models.DrinksDashSubLine;
            DrinksMixer = app.models.DrinksMixer, DrinksExtras = app.models.DrinksExtras,
            DrinksDashLine = app.models.DrinksDashLine;
        isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });
        if (params && params.groupId) {
            let groupId = params.groupId;
            DrinksSpecialDashLine.findOne({ where : { groupId } , include : [{ relation : "drinksSpecialDashSubLines" }, { relation : "drinksMixers" }, { relation : "drinksExtras" }] }, (err , res)=>{
                if (err) isSuccess(false, "Please try again!");
                else {
                    res = JSON.parse(JSON.stringify(res));
                    DrinksSpecialDashLine.destroyById(res.id, ()=>{
                        res.drinksSpecialDashSubLines.forEach(val => DrinksSpecialDashSubLine.destroyById(val.id))
                        res.drinksExtras.forEach(val => DrinksMixer.destroyById(val.id))
                        res.drinksMixers.forEach(val => DrinksExtras.destroyById(val.id))
                        DrinksDashLine.findOne({
                            where: { groupId }, include: [{ relation: "drinksDashSubLines" }]
                        }, (dashLineErr, dashLineRes) => {
                            dashLineRes = JSON.parse(JSON.stringify(dashLineRes));
                            if(dashLineRes && dashLineRes.drinksDashSubLines && dashLineRes.drinksDashSubLines.length){
                                dashLineRes.drinksDashSubLines.forEach(val=> {
                                    DrinksDashSubLine.upsertWithWhere({ id : val.id }, { inAppSpecial : false });
                                })
                            }
                        })
                        isSuccess(true, "Successfully deleted");
                    });
                }
            })
        }
        else isSuccess();
    };

    Drinksspecialcategory.remoteMethod('createSpiritSpecial', {
        http: { path: '/createSpiritSpecial', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "create spirit special"
    });

    Drinksspecialcategory.remoteMethod('createSpecial', {
        http: { path: '/createSpecial', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "create special"
    });

    Drinksspecialcategory.remoteMethod('deleteDashAndSubLine', {
        http: { path: '/deleteDashAndSubLine', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "drinks special category deleted"
    });

    Drinksspecialcategory.remoteMethod('createAndUpdate', {
        http: { path: '/createAndUpdate', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Create and update"
    });
};
