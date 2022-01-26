let app = require('../../server/server');

module.exports = function (Mealscategory) {

    Mealscategory.observe('before save', function event(ctx, next) {
        if (!ctx.where && ctx.instance) {
            if (ctx.instance.menu == "Breakfast") { ctx.instance.order = "1"; ctx.instance.isSpecial = false; }
            if (ctx.instance.menu == "Breakfast Special") { ctx.instance.order = "2"; ctx.instance.isSpecial = true; }
            if (ctx.instance.menu == "Lunch") { ctx.instance.order = "3"; ctx.instance.isSpecial = false; }
            if (ctx.instance.menu == "Lunch Special") { ctx.instance.order = "4"; ctx.instance.isSpecial = true; }
            if (ctx.instance.menu == "Dinner") { ctx.instance.order = "5"; ctx.instance.isSpecial = false; }
            if (ctx.instance.menu == "Dinner Special") { ctx.instance.order = "6"; ctx.instance.isSpecial = true; }
            if (ctx.instance.menu == "Allday") { ctx.instance.order = "7"; ctx.instance.isSpecial = false; }
            if (ctx.instance.menu == "Allday Special") { ctx.instance.order = "8"; ctx.instance.isSpecial = true; }
            next();
        } else next();
    });

    Mealscategory.CreateAndConfig = (params = {}, cb) => {

       let  isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });

        createAndUpdate = () => {
            if (params.MealsCategories) {
                params.MealsCategories.forEach(async (val, i) => {
                    if (val) {
                        const category = await Mealscategory.findOne({ where: { menu: val.menu, ownerId: val.ownerId } });
                        if (category) {
                            for (let property in val) if (val[property].value) await category.updateAttributes({ [property]: val[property] });
                            if (params.MealsCategories.length == (i + 1)) isSuccess(true, "Successfully created.");
                        } else {
                            await Mealscategory.create(val);
                            if (params.MealsCategories.length == (i + 1)) isSuccess(true, "Successfully created.");
                        }
                    } else isSuccess();
                });
            } else isSuccess();
        }
        createAndUpdate();
    }

    Mealscategory.CreateAndUpdate = (details, cb) => {
        let data = {};

        let isSuccess = (arg = false, message = 'Please try again!', cb) => {
            data.isSuccess = arg;
            data.message = message;
            cb(null, data);
        };

        if (details) {
            if (details.ownerId) {
                if (details.categorySpam && details.categorySpam.length > 0) {
                    details.categorySpam.forEach((item, i) => {
                        Mealscategory.upsertWithWhere(item, item, (err, res) => {
                            if (res && (i + 1) == details.categorySpam.length) {
                                isSuccess(true, "Successfully Created.", cb);
                            }
                        });
                    });
                } else {
                    isSuccess(false, "Category is required", cb);
                }
            } else {
                isSuccess(false, "Owner Id is required.", cb);
            }
        } else {
            isSuccess(false, "Please try again. Details object is empty.", cb);
        }
    };

    Mealscategory.deleteCategory = (details, cb) => {

        let id, MealsDashSubLine = app.models.MealsDashSubLine, MealsDashLine = app.models.MealsDashLine, MenuHours = app.models.MenuHours;

       let  isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });

        if (details && details.id) {
            id = details.id , category =  details.category , ownerId = details.ownerId;
            MenuHours.findOne({ where : { category , ownerId } }, (err, res) => { if (res && res.id) MenuHours.destroyById(res.id) });
            Mealscategory.find({ where: { id }, include: [{ relation: "mealsDashLines", scope: { include: [{ relation: "dashSubLines" }] } }] }, (err, res) => {
                if (res && res.length) {
                    res = JSON.parse(JSON.stringify(res));
                    res.forEach((v, i) => {
                        if (v && v.mealsDashLines && v.mealsDashLines.length > 0) {
                            v.mealsDashLines.forEach((j, k) => {
                                if (j && j.dashSubLines && j.dashSubLines.length > 0 && j.id)  MealsDashSubLine.destroyAll({ mealsDashLineId: j.id });
                            });
                            if (v.mealsCategoryId) MealsDashLine.destroyById(v.mealsCategoryId);
                        }
                        if (v.id)  Mealscategory.destroyById(v.id);
                    });
                    isSuccess(true, "Successfully deleted.");
                } else isSuccess();
            });
        } else isSuccess();
    };

    Mealscategory.remoteMethod('CreateAndConfig', {
        http: { path: '/CreateAndConfig', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "meals config"
    });

    Mealscategory.remoteMethod('deleteCategory', {
        http: { path: '/deleteCategory', verb: 'post' },
        accepts: { arg: 'details', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "meals categories delete"
    });

    Mealscategory.remoteMethod('CreateAndUpdate', {
        http: { path: '/CreateAndUpdate', verb: 'post' },
        accepts: { arg: 'details', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "meals categories create and update"
    });
};
