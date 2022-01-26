'use strict';
const app = require('../../server/server');

module.exports = function (Reward) {


  Reward.afterRemote('create', function (ctx, result) {
    if (ctx.result.ownerId && ctx.result.customerId) {
      let dataObj = ctx.result;
      let businessId = dataObj.ownerId;
      let customerId = dataObj.customerId;
      let rewardObj = {
        promoCode: dataObj.promoCode,
        name: dataObj.name,
        startDate: dataObj.startDate,
        stopDate: dataObj.stopDate,
        startDateString: dataObj.startDateString,
        stopDateString: dataObj.stopDateString,
        customerId: dataObj.customerId,
        ownerId: dataObj.ownerId,
        id: dataObj.id
      };
      let Business = app.models.Business;
      let Customer = app.models.Customer;

      Business.findById(businessId, function (err, business) {
        if (business) {
          business.rewards.create(rewardObj);
        } else {
        }


      });

      Customer.findById(customerId, function (err, customer) {
        if (customer) {
          customer.rewards.create(rewardObj);
        } else {
        }

      });
      ctx.result.message = "Hook for creating reward in Business and Customer is success"
      ctx.res.send(ctx.result);
    } else {
      ctx.result.message = "Hook for creating reward in Business and Customer is failed"
      ctx.res.send(ctx.result);
    }
  });



};
