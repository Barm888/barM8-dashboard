
let app = require('../../server/server'),
  moment = require('moment-timezone');

module.exports = function (Mealsdashline) {

  Mealsdashline.getMealsCategory = (details, cb) => {
    const MealsCategory = app.models.MealsCategory;

    let isSuccess = (message, isSuccess, result = [], err = {}) => cb(null, { message, isSuccess, result, err });

    if (details && details.ownerId) {
      let ownerId = details.ownerId;
      MealsCategory.find({ where: { ownerId }, include: [{ relation: "mealsDashLines", scope: { include: [{ relation: "dashSubLines" }] } }], order: 'order asc' }, (err, res) => {
        if (err) isSuccess("No Data", false, [], err);
        else isSuccess("Success", true, res);
      });
    } else isSuccess("Details is required!", false);
  };

  Mealsdashline.updateInAppSpecialHeaderLevel = (params, cb) => {
    const MealsDashSubLine = app.models.MealsDashSubLine;

    let isSuccess = (message = "Please try again", isSuccess = false) => cb(null, { isSuccess, message });

    if (params && params.categories) {
      id = params.id, isAvailable = inAppSpecial = false;
      Mealsdashline.find({ where: { or: params.categories }, include: "dashSubLines" }, (err, res) => {
        res = JSON.parse(JSON.stringify(res));
        if (err) isSuccess()
        else if (res && res.length) {
          res.forEach((val, i) => {
            if (val && val.isSpecial && params.isTrue) Mealsdashline.upsertWithWhere({ id: val.id }, { isAvailable: true, inAppSpecial: true });
            else if (val && val.isSpecial && !params.isTrue) Mealsdashline.upsertWithWhere({ id: val.id }, { isAvailable: false, inAppSpecial: false });
            else if (val && !val.isSpecial && params.isTrue) Mealsdashline.upsertWithWhere({ id: val.id }, { isAvailable: false, inAppSpecial: true });
            else if (val && !val.isSpecial && !params.isTrue) Mealsdashline.upsertWithWhere({ id: val.id }, { isAvailable: true, inAppSpecial: false });
            if (val && val.isSpecial && val.dashSubLines && val.dashSubLines.length) {
              val.dashSubLines.forEach((subline, j) => {
                if (params.isTrue && subline && subline.id) MealsDashSubLine.upsertWithWhere({ id: subline.id }, { isAvailable: true, inAppSpecial: true })
                else if (!params.isTrue && subline && subline.id) MealsDashSubLine.upsertWithWhere({ id: subline.id }, { isAvailable: false, inAppSpecial: false })
              });
            } else if (val && !val.isSpecial && val.dashSubLines && val.dashSubLines.length) {
              val.dashSubLines.forEach((subline, j) => {
                if (params.isTrue && subline && subline.id) MealsDashSubLine.upsertWithWhere({ id: subline.id }, { isAvailable: false, inAppSpecial: true })
                else if (!params.isTrue && subline && subline.id) MealsDashSubLine.upsertWithWhere({ id: subline.id }, { isAvailable: true, inAppSpecial: false })
              });
            }
          });
          isSuccess()
        } else isSuccess()
      });
    } else isSuccess()
  };

  Mealsdashline.createAndUpdate = (details, cb) => {

    let isSuccess = (message = "Please try again", isSuccess = false) => cb(null, { isSuccess, message });

    if (details) {
      if (details.categories && details.categories.length) {
        details.categories.forEach(async (v, i) => {
          v.menuHeaderId = (v.menuHeaderId).trim();
          await Mealsdashline.create(v, (err, res) => {
            if (err) isSuccess();
            else if (res) {
              if ((i + 1) == details.categories.length) isSuccess("Menu Header Successfully created", true);
            }
          });
        });
      } else isSuccess("Categories is required", false);
    } else isSuccess("Details object is required", false);
  };


  Mealsdashline.itemLevelDaysUpdate = (params, cb) => {
    const MealsDashSubLine = app.models.MealsDashSubLine;

   let isSuccess = (message = "Please try again", isSuccess = false) => cb(null, { isSuccess, message });

    if (params && params.id && params.day && params.mealsDashLineId) {

      let { id, day, value, mealsDashLineId, ownerId } = params;

      Mealsdashline.findOne({ where: { id: mealsDashLineId, ownerId }, include: [{ relation: "dashSubLines", scope: { where: { id } } }] }, (err, res) => {
        res = JSON.parse(JSON.stringify(res));
        if (res) {
          if (res.dashSubLines && res.dashSubLines.length) {
            res.dashSubLines.forEach(val => {
              let category;
              MealsDashSubLine.upsertWithWhere({ id: val.id }, { [day]: value });
              if (res.category == 'Lunch Special') category = 'Lunch';
              if (res.category == 'Breakfast Special') category = 'Breakfast';
              if (res.category == 'Dinner Special') category = 'Dinner';
              if (res.category == 'Allday Special') category = 'Allday';
              if (res.category == 'Lunch') category = 'Lunch Special';
              if (res.category == 'Breakfast') category = 'Breakfast Special';
              if (res.category == 'Dinner') category = 'Dinner Special';
              if (res.category == 'Allday') category = 'Allday Special';
              let menuId = val.menuId.trim(), menuHeaderId = res.menuHeaderId.trim();
              Mealsdashline.findOne({ where: { category, menuHeaderId, ownerId }, include: [{ relation: "dashSubLines", scope: { where: { menuId } } }] }, (mealsErr, mealsRes) => {
                mealsRes = JSON.parse(JSON.stringify(mealsRes));
                if (mealsRes) mealsRes.dashSubLines.forEach(dashSubLineRes => MealsDashSubLine.upsertWithWhere({ id: dashSubLineRes.id }, { [day]: !value }));
              });
            });
          }
        }
      });
      isSuccess(true, "Successfully updated");
    } else isSuccess();
  }

  Mealsdashline.menuHeaderRemove = (details, cb) => {

    const MealsDashSubLine = app.models.MealsDashSubLine;

   let isSuccess = (message = "Please try again", isSuccess = false) => cb(null, { isSuccess, message });

    if (details) {
      if (details.id) {
        let id = details.id;
        Mealsdashline.destroyById(id);
        MealsDashSubLine.destroyAll({ mealsDashLineId: id });
        isSuccess("Mealsdash line is successfully removed.!", true);
      } else isSuccess("Please try again", false);
    } else isSuccess("Please try again", false);
  };

  Mealsdashline.getBusinessesWithMeals = (cb) => {
    let data = {};
    const Business = app.models.Business;
    Business.find({ "fields": ["businessName", "id"], "include": "mealsDashLines" }, (err, res) => {
      if (err) {
        data.isSuccess = false;
        data.message = "No data";
        cb(null, data);
      } else {
        res = JSON.parse(JSON.stringify(res));
        let businessNames = [];
        res = res.filter((resObj) => {
          if (resObj.mealsDashLines && resObj.mealsDashLines.length) {
            businessNames.push(resObj.businessName);
            return resObj;
          }
        });
        data.isSuccess = true;
        data.count = res.length;
        data.businesses = businessNames;
        cb(null, data);
      }
    });
  };

  Mealsdashline.getSubMenuData = (params, cb) => {

    const MealsDashSubLine = app.models.MealsDashSubLine;

    let isCallBack = (isSuccess = false, message = "Please try again!", result = {}) => cb(null, { isSuccess, message, result });

    if (params) {
      let { subLineId } = params;
      MealsDashSubLine.findOne({
        where: { id: subLineId }, include: [{
          relation: "mealsDashLine",
          scope: { include: [{ relation: "mealsCategory" }] }
        },
        { relation: "mealsExtraDashLines" }]
      }, (err, res) => {
        if (err) isCallBack(false, "Error", err);
        else isCallBack(true, "Success", res);
      })
    } else isCallBack(false, "Params is required");
  };

  Mealsdashline.remoteMethod('getSubMenuData', {
    http: { path: '/getSubMenuData', verb: 'get' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "getSubMenuData"
  });

  Mealsdashline.remoteMethod('itemLevelDaysUpdate', {
    http: { path: '/itemLevelDaysUpdate', verb: 'post' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Item level days status change"
  });

  Mealsdashline.remoteMethod('updateInAppSpecialHeaderLevel', {
    http: { path: '/updateInAppSpecialHeaderLevel', verb: 'post' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Hide special item"
  });

  Mealsdashline.remoteMethod('createAndUpdate', {
    http: { path: '/createAndUpdate', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Meals create and update"
  });

  Mealsdashline.remoteMethod('menuHeaderRemove', {
    http: { path: '/menuHeaderRemove', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Menu Header Remove in meals part."
  });

  Mealsdashline.remoteMethod('getMealsCategory', {
    http: { path: '/getMealsCategory', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get Meals category."
  });

  Mealsdashline.remoteMethod('getBusinessesWithMeals', {
    http: { path: '/getBusinessesWithMeals', verb: 'get' },
    returns: { arg: 'data', type: 'object' },
    description: "Get Businesses With Meals"
  });

};
