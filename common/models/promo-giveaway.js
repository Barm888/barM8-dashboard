'use strict';
const pickRandom = require('pick-random'),
  app = require('../../server/server');

const FCM = require('fcm-push'),
  serverKey = 'AAAA-4BeD_8:APA91bEyi_SURDeuKRLqoDDWsde4wDNFP5TIFCDD8Je2fQBHr_21fpj8zmzZ0pjGW_mT1PWKYZB2QNgMdOJ4p6dhsjEVk-aQUJHV4vgL6VpJEDI4HCxPOhMwVl0qBz-47OGkzyOopaEe',
  fcm = new FCM(serverKey);


module.exports = function (Promogiveaway) {
  Promogiveaway.observe('after save', function (ctx, next) {
    const SlotPromo = app.models.SlotPromo;
    if (ctx.isNewInstance) {
      let date = ctx.instance.slotTimeUtc,
        promoGiveawayId = ctx.instance.id;
      if (date && promoGiveawayId) {
        SlotPromo.create({ date, promoGiveawayId });
      }
    } else if (!ctx.isNewInstance && ctx.instance && ctx.instance.id) {
      Promogiveaway.findById(ctx.instance.id, function (err, pInstance) {
        if (err) console.log(err);
        //destroy all ModelB instance related to modelAInstance.
        if (pInstance.slotPromos && pInstance.slotPromos.id) {
          pInstance.slotPromos.destroy();
        }
        let date = pInstance.slotTimeUtc,
          promoGiveawayId = pInstance.id;
        if (date && promoGiveawayId) {
          SlotPromo.create({ date, promoGiveawayId });
        }
      });
    } else if (ctx.where && ctx.where.id) {
      Promogiveaway.findById(ctx.where.id, function (err, pInstance) {
        if (err) console.log(err);
        //destroy all ModelB instance related to modelAInstance.
        if (pInstance.slotPromos && pInstance.slotPromos.id) {
          pInstance.slotPromos.destroy();
        }
        let date = pInstance.slotTimeUtc,
          promoGiveawayId = pInstance.id;
        if (date && promoGiveawayId) {
          SlotPromo.create({ date, promoGiveawayId });
        }
      });
    }
    next();
  });

  Promogiveaway.observe('before delete', function (ctx, next) {
    if (ctx.where.id) {
      Promogiveaway.findById(ctx.where.id, function (err, pInstance) {
        if (err) console.log(err);
        //destroy the slot Instance.
        if (pInstance.slotPromos && pInstance.slotPromos.id) {
          pInstance.slotPromos.destroy();
          next();
        } else {
          next();
        }
      });
    } else {
      next();
    }
  });


  Promogiveaway.promoSlotCheck = function (cb) {
    let data = {};
    // let dashLineIdArray = details.dashLineIdArray;
    const SlotPromo = app.models.SlotPromo,
      VisitDateBusiness = app.models.VisitDateBusiness,
      PromoWinner = app.models.PromoWinner,
      PromoNotification = app.models.PromoNotification,
      Business = app.models.Business,
      Customer = app.models.Customer;
    let presentDate = new Date();
    SlotPromo.find({
      "where": { "date": { "lte": presentDate } },
      "include": [{
        "relation": "promoGiveaway",
        "scope": {
          "include": {
            "relation": "business",
            "scope": {
              "fields": ["id", "businessName", "email"]
            }
          }
        }
      }]
    }, function (spErr, spRes) {
      if (spErr) {
        data.isSuccess = false;
        data.message = "Error in SlotPromo find";
        cb(null, data);
      } else if (spRes && spRes.length) {
        spRes = JSON.parse(JSON.stringify(spRes));
        let slotLen = spRes.length;
        const start = async () => {
          for (let i = 0; i < slotLen; i++) {
            SlotPromo.destroyById(spRes[i].id);
            if (spRes[i].promoGiveaway && spRes[i].promoGiveaway.business) {
              let bussId = spRes[i].promoGiveaway.ownerId,
                sStart = spRes[i].promoGiveaway.startTime;
              await VisitDateBusiness.find({ "where": { "ownerId": bussId, "date": { "gte": sStart } } }, async (vdbErr, vdbRes) => {
                if (vdbRes && vdbRes.length) {
                  vdbRes = JSON.parse(JSON.stringify(vdbRes));
                  let custArr = [];
                  await vdbRes.forEach(async o => {
                    if (o.visitse && o.visitse.length) {
                      await o.visitse.forEach(async o1 => {
                        if (o1.customerId) custArr.push(o1.customerId);
                      })
                    }
                  });
                  // console.log(custArr.length);
                  if (custArr.length) {
                    let uCustArr = await custArr.filter(async (elem, index, self) => {
                      return index === self.indexOf(elem);
                    });
                    if (uCustArr.length) {
                      let promoGiveawayObj = spRes[i].promoGiveaway,
                        freebie = promoGiveawayObj.freebie || "",
                        promoCode = promoGiveawayObj.promoCode,
                        promoMessage = promoGiveawayObj.promoMessage,
                        slotPromoId = spRes[i].id,
                        businessId = spRes[i].promoGiveaway.ownerId,
                        businessName = spRes[i].promoGiveaway.business.businessName,
                        emailBuss = spRes[i].promoGiveaway.business.email,
                        selectedCustomerIds = pickRandom(uCustArr, { count: 1 }),
                        selectedCustomerId = selectedCustomerIds[0];

                      Customer.findById(selectedCustomerId, { "fields": ["id", "deviceId", "firstName", "lastName", "mobile", "email", "postCode", "addressLine1"] }, (custErr, custRes) => {
                        if (custRes) {
                          let custObj = custRes,
                            custId = custObj.id,
                            token_id = custObj.deviceId,
                            customerName = custObj.firstName,
                            promoWinnerObj = {
                              "freebie": freebie,
                              "date": presentDate,
                              "customerId": custObj.id,
                              "ownerId": businessId
                            },
                            sendPromoWinnersInfoToAdminObj = {
                              "customerDetails": {
                                "firstName": custObj.firstName,
                                "lastName": custObj.lastName,
                                "mobile": custObj.mobile,
                                "email": custObj.email,
                                "postCode": custObj.postCode,
                                "addressLine1": custObj.addressLine1
                              },
                              "businessDetails": {
                                "businessName": businessName,
                                "email": emailBuss
                              },
                              "freebie": freebie,
                              "date": presentDate
                            };
                          Business.sendPromoWinnersInfoToAdmin(sendPromoWinnersInfoToAdminObj, function (WinnerNotifToAdmin) {
                            console.log(WinnerNotifToAdmin);
                          });

                          PromoWinner.createPromoWinner(promoWinnerObj, function (WinnerResp) {
                            console.log(WinnerResp);
                          });

                          let a = [];
                          a.push(customerName);
                          let messageData = `Congratulations! You won ${freebie}.`;
                          let data1 = {
                            "image": null,
                            "title": 'You are a winner!',
                            "message": messageData,
                            "body": messageData,
                            "priority": "high",
                            "type": " ",
                            "content_available": true,
                            "event": "PromoGiveaway",
                            "customerInterestId": "waiting",
                            "promoCode": promoCode,
                            "promoMessage": messageData
                          };

                          let message = {
                            to: token_id,
                            priority: "high",
                            time_to_live: 600000,
                            notification: data1,
                            data: data1
                          };
                          // console.log(message);
                          fcm.send(message, function (error, response) {
                            if (error) {
                            } else {
                              let notificationObj = {
                                time: presentDate,
                                expiryDate: presentDate,
                                message: messageData,
                                status: "active",
                                customerId: custId
                              };
                              PromoNotification.create(notificationObj);
                              //Extra Push Notification for notification count code start
                              let promoPushNotification = {
                                "image": null,
                                "title": 'You are a winner!',
                                "message": messageData,
                                "body": messageData,
                                "priority": "high",
                                "type": "silent",
                                // "click_action": ".activity.WinnerHolidayActivity",
                                "eventData": { "event": "PromoGiveaway", "customerInterestId": "waiting" }
                              };
                              fcm.send({
                                to: token_id,
                                priority: "high",
                                time_to_live: 600000,
                                data: promoPushNotification
                              }, function (error5, response5) {
                                if (error5) {
                                } else {
                                }
                              });
                            }
                          });
                        }
                      });
                    } else {
                    }
                  } else {
                  }
                } else {
                }
              });
            } else {
            }
          }
          data.isSuccess = true;
          data.message = "promoSlotCheck callback";
          cb(null, data);
        };
        start();
      } else {
        data.isSuccess = false;
        data.message = "No business Found in Promo slots";
        cb(null, data);
      }
    });
  };

  Promogiveaway.remoteMethod('promoSlotCheck', {
    http: { path: '/promoSlotCheck', verb: 'post' },
    returns: { arg: 'data', type: 'object' },
    description: "promoSlotCheck for all business."
  });
};
