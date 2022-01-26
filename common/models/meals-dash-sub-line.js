let app = require('../../server/server'),
    moment = require('moment-timezone');

module.exports = function (Mealsdashsubline) {

    Mealsdashsubline.observe('before save', (ctx, next) => {
        if (ctx.instance) {
            if (ctx.instance.price) ctx.instance.price = (parseFloat(ctx.instance.price)).toFixed(2);
        } else {
            if (ctx.data) if (ctx.data.price) ctx.data.price = (parseFloat(ctx.data.price)).toFixed(2);
        }
        next();
    });



    Mealsdashsubline.createAndUpdate = (details = {}, cb) => {

        let mealsDashLineId, menu, price, ingredients, categories, ownerId, category, isAvailable, inAppSpecial, 
        monday, tuesday, wednesday, thursday, friday, saturday, sunday,  addons = details.addons, isSpecial, menuId ,
        specialPrice = 0;
        const MealsCategory = app.models.MealsCategory, MealsDashLine = app.models.MealsDashLine, MealsExtraDashLine = app.models.MealsExtraDashLine;


        createAddOns = (dashsublineRes) => {
            return new Promise((resolve, reject) => {
                addons.forEach((addon, i) => {
                    MealsExtraDashLine.upsertWithWhere({ mealsDashSubLineId: dashsublineRes.id, desc: addon.desc, price: addon.price }, { mealsDashSubLineId: dashsublineRes.id, desc: addon.desc, price: addon.price })
                })
            })
        };

        specialDaysStatus = () => monday = tuesday = wednesday = thursday = friday = saturday = sunday = false;

        normalDaysStatus = () => {
            monday = details.monday; tuesday = details.tuesday; wednesday = details.wednesday;
            thursday = details.thursday; friday = details.friday; saturday = details.saturday; sunday = details.sunday;
        }


        createMealsLineItem = (val) => {
            return new Promise((resolve, reject) => {
                if (mealsDashLineId && menu && price) {

                    if (!val.value.includes('Special')) { isAvailable = true, inAppSpecial = false; isSpecial = false; normalDaysStatus(); }
                    else if (val.value.includes('Special')) { isAvailable = true, inAppSpecial = true, isSpecial = true; specialDaysStatus();  }
                    menuId = (menuId).trim();
                    if (val.value == 'breakfastSpecial') { category = 'breakfastSpecial'; isSpecial = true; price = specialPrice; }
                    else if (val.value == 'lunchSpecial') { category = 'lunchSpecial'; isSpecial = true; price = specialPrice; }
                    else if (val.value == 'dinnerSpecial') { category = 'dinnerSpecial'; isSpecial = true; price = specialPrice; }
                    else if (val.value == 'alldaySpecial') { category = 'alldaySpecial'; isSpecial = true; price = specialPrice; }
                    else price = details.price;
                    Mealsdashsubline.upsertWithWhere({ mealsDashLineId, menuId },
                        { mealsDashLineId, menu, menuId, price, ingredients, 
                            monday, tuesday, wednesday, thursday, friday, saturday, sunday, 
                            isAvailable, isSpecial, inAppSpecial }, (err, res) => {

                            if (err) resolve({ isSuccess: false });
                            else {
                                createAddOns(res);
                                resolve({ isSuccess: true });
                            }
                        });
                } else resolve({ isSuccess: false });
            });
        };

        createMealsLine = (val) => {
            return new Promise((resolve, reject) => {

                if (val.value == 'breakfast') { category = 'breakfast'; isSpecial = false; }
                else if (val.value == 'breakfastSpecial') { category = 'breakfastSpecial'; isSpecial = true; price = specialPrice; }
                else if (val.value == 'lunch') { category = 'lunch'; isSpecial = false; }
                else if (val.value == 'lunchSpecial') { category = 'lunchSpecial'; isSpecial = true; price = specialPrice; }
                else if (val.value == 'dinner') { category = 'dinner'; isSpecial = false; }
                else if (val.value == 'dinnerSpecial') { category = 'dinnerSpecial'; isSpecial = true; price = specialPrice; }
                else if (val.value == 'allday') { category = 'allday'; isSpecial = false; }
                else if (val.value == 'alldaySpecial') { category = 'alldaySpecial'; isSpecial = true; price = specialPrice; }

                if (category) {
                    MealsDashLine.findOne({ where: { menuHeaderId: val.menuHeaderId, mealsCategoryId: val.id } }, (lineErr, lineRes) => {
                        if (lineErr) resolve({ isSuccess: false });
                        else if (lineRes) {
                            mealsDashLineId = lineRes.id;
                            createMealsLineItem(val).then((res) => resolve({ isSuccess: true })).catch(error => resolve({ isSuccess: false }));
                        } else {
                            if(isSpecial){
                                MealsDashLine.create({ menuHeader: val.menuHeader, mealsCategoryId: val.id, [category]: true, isSpecial, 
                                    menuHeaderId: val.menuHeaderId , monday : false , tuesday : false , wednesday : false , thursday : false, friday : false , 
                                    saturday : false , sunday : false, lunchSpecial : true , isAvailable : true  }, (lineNewErr, lineNewRes) => {
                                    mealsDashLineId = lineNewRes.id;
                                    createMealsLineItem(val).then((res) => resolve({ isSuccess: true })).catch(error => resolve({ isSuccess: false }));
                                })
                            }else {
                                MealsDashLine.create({ menuHeader: val.menuHeader, mealsCategoryId: val.id, [category]: true, isSpecial, menuHeaderId: val.menuHeaderId ,
                                    lunchSpecial : true , isAvailable : true , monday , tuesday , wednesday , thursday , friday , saturday , sunday }, (lineNewErr, lineNewRes) => {
                                    mealsDashLineId = lineNewRes.id;
                                    createMealsLineItem(val).then((res) => resolve({ isSuccess: true })).catch(error => resolve({ isSuccess: false }));
                                })
                            }
                        }
                    })
                } else resolve({ isSuccess: false });
            });
        };

        createMealsCategory = (val) => {
            return new Promise(async (resolve, reject) => {
                if (val) {
                    await MealsDashLine.findOne({ where: { id: mealsDashLineId } }, (mealsErr, mealsRes) => {
                        if (mealsErr) resolve({ isSuccess: false });
                        else if (mealsRes) {
                            MealsCategory.findOne({
                                where: { id: val.id, ownerId },
                                include: [{ relation: "mealsDashLines", scope: { include: [{ relation: "dashSubLines" }] } }]
                            }, (err, res) => {
                                    res = JSON.parse(JSON.stringify(res));
                                    if (res && res.mealsDashLines.length > 0) {
                                        res.mealsDashLines.forEach(async (v, i) => {
                                            if (v && mealsRes.menuHeaderId == v.menuHeaderId) {
                                                mealsDashLineId = v.id;
                                                await createMealsLineItem(val).then((itemRes) => resolve({ isSuccess: true })).catch(error => resolve({ isSuccess: false })); 
                                            } else if ((i+1) == res.mealsDashLines.length) resolve({ isSuccess: false });
                                        });
                                    } else {
                                        createMealsLine(val).then((mealsLineRes) => {
                                            if (mealsLineRes.isSuccess) resolve({ isSuccess: true })
                                            else resolve({ isSuccess: false });
                                        }).catch(error => resolve({ isSuccess: false }));
                                    }
                                });
                        } else resolve({ isSuccess: false });
                    });
                } else resolve({ isSuccess: false });
            });
        };

        let isSuccess = (message, isSuccess) => cb(null, { isSuccess, message });

        if (details) {

            mealsDashLineId = details.mealsDashLineId; menu = details.menu; menuId = details.menuId; price = details.price; ingredients = details.ingredients,
            specialPrice = details.specialPrice;
            categories = details.categories; isAvailable = details.isAvailable; inAppSpecial = details.inAppSpecial;
            ownerId = details.ownerId; monday = details.monday; tuesday = details.tuesday; wednesday = details.wednesday;
            thursday = details.thursday; friday = details.friday; saturday = details.saturday; sunday = details.sunday;
            if (menu && price) {
                categories.forEach(async (val, i) => {
                    await createMealsCategory(val).then((res) => {
                        if (res.isSuccess) {
                            if (categories.length == (i + 1)) isSuccess(cb, "Meals dash subline Successfully Created!", true);
                        } else {
                            if (categories.length == (i + 1)) isSuccess(cb, "Please try again", false);
                        }
                    }).catch(error => {
                        if (categories.length == (i + 1)) isSuccess(cb, "Please try again", false);
                    });
                });
            } else isSuccess(cb, "Menu and Price is required!", false);
        } else isSuccess(cb, "Details is required!", false);
    };


    Mealsdashsubline.updateIsAvailAndInApp = (cb) => {

       let  isSuccess = (message = false, isSuccess = "Please try again") => cb(null, { isSuccess, message });
       
        Mealsdashsubline.find((err, res) => {
            if (res) {
                res = JSON.parse(JSON.stringify(res));
                res.forEach((val) => {
                    if (val.isSpecial) {
                        Mealsdashsubline.upsertWithWhere({ id: val.id }, {
                            inAppSpecial: true, isAvailable: true,
                            monday: false, tuesday: false, wednesday: false,
                            thursday: false, friday: false, saturday: false,
                            sunday: false
                        });
                    } else {
                        Mealsdashsubline.upsertWithWhere({ id: val.id }, {
                            inAppSpecial: true, isAvailable: true,
                            monday: true, tuesday: true, wednesday: true,
                            thursday: true, friday: true, saturday: true,
                            sunday: true
                        });
                    }
                })
            }
        })
        isSuccess();
    }
   

    Mealsdashsubline.remoteMethod('updateIsAvailAndInApp', {
        http: { path: '/updateIsAvailAndInApp', verb: 'post' },
        returns: { arg: 'data', type: 'object' },
        description: "Available is Update"
    });

    Mealsdashsubline.remoteMethod('createAndUpdate', {
        http: { path: '/createAndUpdate', verb: 'post' },
        accepts: { arg: 'details', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Menu Sub Item Create and Update"
    });
};
