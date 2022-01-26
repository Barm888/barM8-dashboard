
let app = require('../../server/server');

module.exports = function (Menuhours) {

    Menuhours.observe('before save', function event(ctx, next) {
        if (!ctx.where && ctx.instance) {
            if (ctx.instance.menu == "Breakfast") ctx.instance.order = "1";
            if (ctx.instance.menu == "Lunch") ctx.instance.order = "3";
            if (ctx.instance.menu == "Dinner") ctx.instance.order = "5";
            if (ctx.instance.menu == "Allday") ctx.instance.order = "7";
            next();
        } else next();
    });

    Menuhours.createAndUpdate = (params = {}, cb) => {

        let MealsCategory = app.models.MealsCategory;

       let isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });

        createAndUpdate = () => {
            if (params.menuHours) {
                params.menuHours.forEach(async (val, i) => {
                    if (val) {
                        Menuhours.findOne({ where: { menu: val.menu, ownerId: val.ownerId } }, (err, res) => {
                            if (err) isSuccess();
                            else if (res) for (let property in val) {
                                if (val[property].value) res.updateAttributes({ [property]: val[property] });
                            }
                            else Menuhours.create(val)
                        });
                        MealsCategory.findOne({ where: { menu: val.menu, ownerId: val.ownerId } }, (err, res) => {
                            if (err) isSuccess();
                            else if (res) for (let property in val) {
                                if (val[property].value) res.updateAttributes({ [property]: val[property] });
                            }
                            else MealsCategory.create(val)
                        });
                    }
                });
                isSuccess();
            } else isSuccess();
        }
        createAndUpdate();
    };

    Menuhours.updateMenuHours = async (params = {}, cb) => {

        let MealsCategory = app.models.MealsCategory;

       let  isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });

        if (params.id && params.day && params.startTime && params.endTime && params.category && params.ownerId) {
            let id = params.id, day = params.day, startTime = params.startTime, endTime = params.endTime,
                _24startTime = params._24startTime, _24endTime = params._24endTime, ownerId = params.ownerId, category = params.category;

            MealsCategory.findOne({ where: { category, ownerId } }, (err, res) => {
                if (res) {
                    res.updateAttributes({ [day]: { value: true, startTime, _24startTime, endTime, _24endTime } });
                    Menuhours.findOne({ where: { id } }, (menuErr, menuRes) => {
                        if (menuRes)  menuRes.updateAttributes({ [day]: { value: true, startTime, _24startTime, endTime, _24endTime } })
                    });
                }
            })
        }

        isSuccess();
    }

    Menuhours.delete = async (params = {}, cb) => {

        let MealsCategory = app.models.MealsCategory;

        let id, day, category;
        
        let isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });

        id = params.id, day = params.day, category = params.category, ownerId = params.ownerId;

        MealsCategory.findOne({ where: { category, ownerId } } , (err , mealsCategory)=>{
            if(mealsCategory) mealsCategory.updateAttributes({ [day]: { value: false, startTime: null, _24startTime: null, endTime: null, _24endTime: null } });
            Menuhours.findOne({ where: { id } }, (menuErr , menuHoursRes)=>{
                if(menuHoursRes) menuHoursRes.updateAttributes({ [day]: { value: false, startTime: null, _24startTime: null, endTime: null, _24endTime: null } });
            });
        });

        isSuccess(true , "Success");
    }

    Menuhours.remoteMethod('updateMenuHours', {
        http: { path: '/updateMenuHours', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "updateAttributes in menuhours"
    });

    Menuhours.remoteMethod('delete', {
        http: { path: '/delete', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "updateAttributes in menuhours"
    });


    Menuhours.remoteMethod('createAndUpdate', {
        http: { path: '/createAndUpdate', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Menu hours create and update"
    });

    Menuhours.remoteMethod('createMealsCategory', {
        http: { path: '/createMealsCategory', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "create category and update"
    });
};
