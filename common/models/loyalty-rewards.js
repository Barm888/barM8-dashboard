'use strict';
const app = require('../../server/server'),
  moment = require('moment-timezone'),
  FCM = require('fcm-push'),
  serverKey = 'AAAA-4BeD_8:APA91bEyi_SURDeuKRLqoDDWsde4wDNFP5TIFCDD8Je2fQBHr_21fpj8zmzZ0pjGW_mT1PWKYZB2QNgMdOJ4p6dhsjEVk-aQUJHV4vgL6VpJEDI4HCxPOhMwVl0qBz-47OGkzyOopaEe',
  fcm = new FCM(serverKey)

module.exports = function (Loyaltyrewards) {

  Loyaltyrewards.observe('after save', (ctx, next) => {
    const SlotLoyalty = app.models.SlotLoyalty;

    if (ctx.isNewInstance) {
      let date = ctx.instance.date,
        offsetFormat = ctx.instance.offsetFormat,
        promoMessage = ctx.instance.promoMessage,
        loyaltyRewardsId = ctx.instance.id;
      if (date && offsetFormat && promoMessage && loyaltyRewardsId) {
        let utcSlot = new Date(date);
        //setting 10 AM as hour to save a slot(already date in o format of exact date in utc)
        utcSlot.setHours(utcSlot.getHours() + 10);
        // utcSlot.setMinute(0);
        // utcSlot.setSecond(0);
        let utcMilliSec = utcSlot.getTime(),
          countryMilliSec = utcMilliSec + (offsetFormat * 60 * 1000),
          countryDate = new Date(countryMilliSec);

        if (countryDate) {
          SlotLoyalty.create({ date: countryDate, loyaltyRewardsId });
        }
      }
    } else if (!ctx.isNewInstance && ctx.instance && ctx.instance.id) {
      Loyaltyrewards.findById(ctx.instance.id, (lrErr, lrRes) => {
        if (lrErr) console.log(lrErr);
        if (lrRes) {
          if (lrRes.slotLoyalties && lrRes.slotLoyalties.id) {
            lrRes.slotLoyalties.destroy();
          }
          let date = lrRes.date,
            offsetFormat = lrRes.offsetFormat,
            promoMessage = lrRes.promoMessage,
            loyaltyRewardsId = lrRes.id;
          if (date && offsetFormat && promoMessage && loyaltyRewardsId) {
            let utcSlot = new Date(date);
            //setting 10 AM as hour to save a slot(already date in o format of exact date in utc)
            utcSlot.setHours(utcSlot.getHours() + 10);
            // utcSlot.setMinutes(0);
            // utcSlot.setSeconds(0);
            let utcMilliSec = utcSlot.getTime(),
              countryMilliSec = utcMilliSec + (offsetFormat * 60 * 1000),
              countryDate = new Date(countryMilliSec);

            if (countryDate) {
              SlotLoyalty.create({ date: countryDate, loyaltyRewardsId });
            }
          }
        }
      });
    } else if (ctx.where && ctx.where.id) {
      Loyaltyrewards.findById(ctx.where.id, (lrErr, lrRes) => {
        if (lrErr) console.log(lrErr);
        if (lrRes) {
          if (lrRes.slotLoyalties && lrRes.slotLoyalties.id) {
            lrRes.slotLoyalties.destroy();
          }
          let date = lrRes.date,
            offsetFormat = lrRes.offsetFormat,
            promoMessage = lrRes.promoMessage,
            loyaltyRewardsId = lrRes.id;
          if (date && offsetFormat && promoMessage && loyaltyRewardsId) {
            let utcSlot = new Date(date);
            //setting 10 AM as hour to save a slot(already date in o format of exact date in utc)
            utcSlot.setHours(utcSlot.getHours() + 10);
            // utcSlot.setMinute(0);
            // utcSlot.setSecond(0);
            let utcMilliSec = utcSlot.getTime(),
              countryMilliSec = utcMilliSec + (offsetFormat * 60 * 1000),
              countryDate = new Date(countryMilliSec);

            if (countryDate) {
              SlotLoyalty.create({ date: countryDate, loyaltyRewardsId });
            }
          }
        }
      });
    }
    next();
  });

  Loyaltyrewards.loyaltySlotCheck = (cb) => {
    let data = {};

    const SlotLoyalty = app.models.SlotLoyalty,
      Notification = app.models.Notification,
      LoyaltyLines = app.models.LoyaltyLines,
      presentDate = new Date();

    const sendNotif = (detNot) => {
      let token_id = detNot.cDeviceID,
        nStartTime = detNot.nStart,
        nEndTime = detNot.nEnd,
        nEndDate = detNot.nEndDate,
        messageData = `Notification from ${detNot.bName}, ${detNot.nMsg} from ${nStartTime} to ${nEndTime}.`,
        customerName = detNot.cFirstName + " " + detNot.cLastName,
        customId = detNot.cId;

      let data1 = {
        "image": null,
        "title": "Loyalty Reward Notification",
        "message": messageData,
        "body": messageData,
        "type": "loyaltyNotification",
        "priority": "high",
        "content_available": true
      };

      let message = {
        to: token_id,
        // to: "e_kkppJ78qw:APA91bEnSnT3xMA6RGEydNv3uWdHYHE6e48RAZpj1NWppZ91fu5T1Cy6LRjLwtHIEj_QgujBBJqJl3YwLLGFUdSsNtE0Q4ESqtOYGebv_oOvZQ0w5V72mVIIaNGbjJhUr0_h6RV8RYpD",
        priority: "high",
        time_to_live: 600000,
        notification: data1,
        data: data1
      };
      // console.log(message);
      fcm.send(message, (error, response) => {
        if (error) {
          console.log("Something has gone wrong!Please check Server key and credentials token..... ");
          console.log("Customer Name failed: " + customerName);
        } else {
          let notificationObj = {
            time: new Date(),
            expiryDate: nEndDate,
            message: messageData,
            status: "active",
            customerId: customId
          };
          Notification.create(notificationObj);
          //Extra Push Notification for notification count code start
          let LoyaltyNotification = {
            "image": null,
            "title": 'Loyalty Reward Notification',
            "message": messageData,
            "body": messageData,
            "priority": "high",
            "type": "silent",
            "eventData": { "event": "LoyaltyNotification", "customerInterestId": "waiting" }
          };

          fcm.send({
            to: token_id,
            priority: "high",
            time_to_live: 600000,
            data: LoyaltyNotification
          }, function (error5, response5) {
            if (error5) {
              console.log(error5);
              console.log("---Extra Loyalty Notification not sent " + error5);
            } else {
            }
          });

          //Extra Push Notification for notification count code end
        }
      });
      return true;
    };

    SlotLoyalty.find({
      "where": { "date": { "lte": presentDate } },
      "include": [{
        "relation": "loyaltyRewards",
        "scope": {
          "include": {
            "relation": "business",
            "scope": {
              "fields": ["id", "businessName", "email"]
            }
          }
        }
      }]
    }, function (slErr, slRes) {
      if (slErr) {
        data.isSuccess = false;
        data.message = "Error in SlotLoyalty find";
        cb(null, data);
      } else if (slRes && slRes.length) {
        slRes = JSON.parse(JSON.stringify(slRes));
        for (let i = 0, slotLen = slRes.length; i < slotLen; i++) {
          if (slRes[i]) {
            SlotLoyalty.destroyById(slRes[i].id);
            let lInstance = slRes[i].loyaltyRewards;

            if (lInstance && lInstance.startTime && lInstance.endTime && lInstance.ownerId) {
              let startTime = lInstance.startTime,
                endTime = lInstance.endTime,
                endDate = lInstance.endDateFormat,
                loyaltyMessage = lInstance.promoMessage,
                ownerId = lInstance.ownerId;

              LoyaltyLines.find({ "where": { ownerId }, "include": [{ "relation": "customer", "scope": { "fields": ["id", "firstName", "lastName", "deviceId"] } }, { "relation": "business", "scope": { "fields": ["id", "businessName"] } }] }, (llErr, llRes) => {
                if (llErr) console.log(llErr);
                if (llRes && llRes.length) {
                  llRes = JSON.parse(JSON.stringify(llRes));
                  llRes.forEach(o => {
                    if (o.customer && o.business) {
                      let notDetails = {
                        cId: o.customer.id,
                        cFirstName: o.customer.firstName,
                        cLastName: o.customer.lastName,
                        cDeviceID: o.customer.deviceId,
                        bName: o.business.businessName,
                        nMsg: loyaltyMessage,
                        nStart: startTime,
                        nEnd: endTime,
                        nEndDate: endDate
                      };
                      sendNotif(notDetails);
                    }
                  })
                } else {
                  console.log("No Customers found for that Business");
                }
              });
            }
          }
        }
        data.isSuccess = true;
        data.message = "loyaltySlotCheck callback";
        cb(null, data);
      } else {
        data.isSuccess = false;
        data.message = "No business Found in Loyalty slots";
        cb(null, data);
      }
    });
  };

  Loyaltyrewards.createandupdate = (details, cb) => {
    let data = {};
    if (details && details.data) {
      Loyaltyrewards.create(details.data, (err, res) => {
        if (res) {
          data.isSuccess = true;
          data.message = "Successfully Updated.";
          data.res = res;
          cb(null, data);
        } else {
          data.isSuccess = false;
          data.message = "Please try again";
          cb(null, data);
        }
      });
    } else {
      data.isSuccess = false;
      data.message = "Please try again";
      cb(null, data);
    }
  };

  Loyaltyrewards.remoteMethod('loyaltySlotCheck', {
    http: { path: '/loyaltySlotCheck', verb: 'post' },
    returns: { arg: 'data', type: 'object' },
    description: "Loyalty Slot Check in LoyaltyRewards"
  });

  Loyaltyrewards.remoteMethod('createandupdate', {
    http: { path: '/createandupdate', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Create and Update in LoyaltyRewards"
  });
};
