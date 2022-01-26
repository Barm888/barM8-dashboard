'use strict';
const app = require('../../server/server');
const voucher_codes = require('voucher-code-generator'),
  moment = require('moment-timezone'),
  FCM = require('fcm-push'),
  serverKey = 'AAAA-4BeD_8:APA91bEyi_SURDeuKRLqoDDWsde4wDNFP5TIFCDD8Je2fQBHr_21fpj8zmzZ0pjGW_mT1PWKYZB2QNgMdOJ4p6dhsjEVk-aQUJHV4vgL6VpJEDI4HCxPOhMwVl0qBz-47OGkzyOopaEe',
  fcm = new FCM(serverKey),
  cleanDeep = require('../../node_modules/clean-deep');



module.exports = function (Loyalty) {

  Loyalty.updateLoyaltyPoints = function (details, cb) {
    let data = {};
    let customerId = details.customerId;
    let addPoints = details.addPoints;
    Loyalty.findOne({ "where": { "customerId": customerId } }, function (err, res) {
      if (err) {
        data.isSuccess = false;
        data.message = "Error in Loyalty FindOne..";
        data.errorMessage = err;
        cb(null, data);
      } else if (res) {
        let oldPoints = res.points;
        let newPoints = parseInt(oldPoints) + parseInt(addPoints);
        let level = "Bronze";
        // console.log(newPoints, level);
        if (newPoints >= 1000) {
          level = "VIP"
        } else if (newPoints >= 750) {
          level = "Platinum"
        } else if (newPoints >= 500) {
          level = "Gold";
        } else if (newPoints >= 250) {
          level = "Silver";
        } else {
          level = "Bronze";
        }
        // console.log(newPoints, level);

        Loyalty.updateAll({ "customerId": customerId }, { "points": newPoints, "level": level }, function (err1, res1) {
          if (err1) {
            data.isSuccess = false;
            data.message = "Error in Loyalty updateAll..";
            data.errorMessage = err1;
            cb(null, data);
          } else {
            data.isSuccess = true;
            data.message = "Loyalty points Updated Successfully...";
            cb(null, data);
          }
        })
      } else {
        data.isSuccess = false;
        data.message = "CustomerId not Found..";
        cb(null, data);
      }


    })
  }

  Loyalty.getLoyaltyDetailsOfCustomer = (details, cb) => {

    let data = {};
    let customerId = details.customerId;

    if (customerId) {
      Loyalty.findOne({ "where": { customerId }, include: "customer" }, (err, res) => {
        if (err) {
          data.isSuccess = false;
          data.message = "Error in Loyalty FindOne..";
          data.errorMessage = err;
          cb(null, data);
        } else if (res && res.customerId == customerId) {

          res = JSON.parse(JSON.stringify(res));

          let points = parseInt(res.points);

          if (points >= 1000) {
            data.isSuccess = true;
            data.level = "VIP";
            data.nextLevel = "VIP";
            data.presentPoints = points;
            data.pointsNeedForNextLevel = 0;
          } else if (points >= 750) {
            let nextLevel = 1000 - points;
            data.isSuccess = true;
            data.level = "Platinum";
            data.nextLevel = "VIP";
            data.presentPoints = points;
            data.pointsNeedForNextLevel = nextLevel;
          } else if (points >= 500) {
            let nextLevel = 750 - points;
            data.isSuccess = true;
            data.level = "Gold";
            data.nextLevel = "Platinum";
            data.presentPoints = points;
            data.pointsNeedForNextLevel = nextLevel;
          } else if (points >= 250) {
            let nextLevel = 500 - points;
            data.isSuccess = true;
            data.level = "Silver";
            data.nextLevel = "Gold";
            data.presentPoints = points;
            data.pointsNeedForNextLevel = nextLevel;
          } else {
            let nextLevel = 250 - points;
            data.isSuccess = true;
            data.level = "Bronze";
            data.nextLevel = "Silver";
            data.presentPoints = points;
            data.pointsNeedForNextLevel = nextLevel;
          }
          data.message = `Hi ${res.customer.firstName} ${res.customer.lastName}\n\n Your Loyalty Status is ${data.level}. \n Next level is ${data.nextLevel}.`;
          cb(null, data);

        } else {
          data.isSuccess = false;
          data.message = "CustomerId not Found..";
          cb(null, data);
        }
      });
    } else {
      data.isSuccess = false;
      data.message = "CustomerId not Found..";
      cb(null, data);
    }
  }

  Loyalty.getScanMessageOfCustomer = function (details, cb) {
    let data = {};
    let businessId = details.businessId;
    let customerId = details.customerId;
    let businessName = details.businessName;
    let customerName = details.customerName;
    let date = details.date;
    let level, instantPrize, duration, weeklyPrize;
    let obj = {};
    if (businessId && customerId && businessName && customerName && date) {
      const DashDate = app.models.DashDate;
      const WeeklyPrize = app.models.WeeklyPrize;

      Loyalty.findOne({ "where": { "customerId": customerId } }, function (err, res) {
        if (err) {
          obj.customerName = customerName;
          obj.businessName = businessName;
          data.isSuccess = false;
          data.message = "Error in Loyalty FindOne..";
          data.message = `Welcome to ${businessName}. You are in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc. Good Luck!`;

          data.errorMessage = err;
          data.res = obj;
          cb(null, data);
        } else if (res && res.customerId == customerId) {
          // date = new Date(date);
          level = res.level;
          DashDate.findOne({
            "where": { and: [{ "ownerId": businessId }, { "date": date }] },
            "include": {
              "relation": "dashLines",
              "scope": {
                "where": { "category": "Freebie" }
              }
            },
          }, function (err1, res1) {
            if (err1) {
              WeeklyPrize.find({}, function (wErr, wRes) {
                if (wErr) {
                  obj.customerName = customerName;
                  obj.businessName = businessName;
                  obj.level = level;

                  data.isSuccess = false;
                  data.message = "Error in WeeklyPrize find and DashDate find..";
                  data.messageData = `Welcome to ${businessName}. You are in the draw to WIN a Cocktail every 30 mins. You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc. Good Luck!`;
                  data.errorMessage = wErr;
                  data.res = obj;
                  cb(null, data);
                } else if (wRes && wRes.length > 0) {
                  let weeklyPrizeObj = wRes[0];
                  level = level.toLowerCase();
                  weeklyPrize = weeklyPrizeObj[level];
                  obj.customerName = customerName;
                  obj.businessName = businessName;
                  obj.level = level;
                  obj.weeklyPrize = weeklyPrize;

                  data.isSuccess = false;
                  data.message = "Error in DashDate find..";
                  data.res = obj;
                  data.messageData = `Welcome to ${businessName}. You are in the Weekly Draw to Win a ${weeklyPrize}. Good Luck!`;
                  cb(null, data);
                } else {
                  obj.customerName = customerName;
                  obj.businessName = businessName;
                  obj.level = level;

                  data.isSuccess = false;
                  data.message = "WeeklyPrize Not Yet Created and error in DashDate find..";
                  data.messageData = `Welcome to ${businessName}. You are in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc. Good Luck!`;
                  data.res = obj;
                  cb(null, data);
                }
              })
            } else if (res1 && res1.ownerId == businessId) {
              res1 = JSON.parse(JSON.stringify(res1));
              if (res1.dashLines && res1.dashLines.length > 0) {
                let freebieObj = res1.dashLines[0];
                instantPrize = freebieObj.freebie;
                duration = freebieObj.frequency;
                WeeklyPrize.find({}, function (wErr, wRes) {
                  if (wErr) {
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;
                    obj.instantPrize = instantPrize;
                    obj.duration = duration;

                    data.isSuccess = false;
                    data.message = "Error in WeeklyPrize find..";
                    data.messageData = `Welcome to ${businessName}. You are in the draw to WIN a ${instantPrize} every ${duration} mins. You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc. Good Luck!`;
                    data.errorMessage = wErr;
                    data.res = obj;
                    cb(null, data);
                  } else if (wRes && wRes.length > 0) {
                    let weeklyPrizeObj = wRes[0];
                    level = level.toLowerCase();
                    weeklyPrize = weeklyPrizeObj[level];
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;
                    obj.instantPrize = instantPrize;
                    obj.duration = duration;
                    obj.weeklyPrize = weeklyPrize;

                    data.isSuccess = true;
                    data.res = obj;
                    data.messageData = `Welcome to ${businessName}. You are in the draw to WIN a ${instantPrize} every ${duration} mins. You are also in the Weekly Draw to Win a ${weeklyPrize}. Good Luck!`;
                    cb(null, data);
                  } else {
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;
                    obj.instantPrize = instantPrize;
                    obj.duration = duration;

                    data.isSuccess = false;
                    data.message = "WeeklyPrize Not Yet Created..";
                    data.messageData = `Welcome to ${businessName}. You are in the draw to WIN a ${instantPrize} every ${duration} mins. You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc. Good Luck!`;
                    data.res = obj;
                    cb(null, data);
                  }
                })

              } else {

                WeeklyPrize.find({}, function (wErr, wRes) {
                  if (wErr) {
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;

                    data.isSuccess = false;
                    data.message = "Error in WeeklyPrize find..";
                    data.messageData = `Welcome to ${businessName}. You are in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc. Good Luck!`;
                    data.errorMessage = wErr;
                    data.res = obj;
                    cb(null, data);
                  } else if (wRes && wRes.length > 0) {
                    let weeklyPrizeObj = wRes[0];
                    level = level.toLowerCase();
                    weeklyPrize = weeklyPrizeObj[level];
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;
                    obj.weeklyPrize = weeklyPrize;

                    data.isSuccess = false;
                    data.res = obj;
                    data.messageData = `Welcome to ${businessName}. You are in the Weekly Draw to Win a ${weeklyPrize}. Good Luck!`;
                    cb(null, data);
                  } else {
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;

                    data.isSuccess = false;
                    data.message = "WeeklyPrize Not Yet Created..";
                    data.messageData = `Welcome to ${businessName}. You are in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc. Good Luck!`;
                    data.res = obj;
                    cb(null, data);
                  }
                })
              }
            } else {
              WeeklyPrize.find({}, function (wErr, wRes) {
                if (wErr) {
                  obj.customerName = customerName;
                  obj.businessName = businessName;
                  obj.level = level;

                  data.isSuccess = false;
                  data.message = "Error in WeeklyPrize find..Freebie not found";
                  data.messageData = `Welcome to ${businessName}. You are in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc. Good Luck!`;
                  data.errorMessage = wErr;
                  data.res = obj;
                  cb(null, data);
                } else if (wRes && wRes.length > 0) {
                  let weeklyPrizeObj = wRes[0];
                  level = level.toLowerCase();
                  weeklyPrize = weeklyPrizeObj[level];
                  obj.customerName = customerName;
                  obj.businessName = businessName;
                  obj.level = level;
                  obj.weeklyPrize = weeklyPrize;

                  data.isSuccess = false;
                  data.res = obj;
                  data.messageData = `Welcome to ${businessName}. You are in the Weekly Draw to Win a ${weeklyPrize}. Good Luck!`;
                  cb(null, data);
                } else {
                  obj.customerName = customerName;
                  obj.businessName = businessName;
                  obj.level = level;

                  data.isSuccess = false;
                  data.message = "Freebie and WeeklyPrize Not Yet Created..";
                  data.messageData = `Welcome to ${businessName}. You are in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc. Good Luck!`;
                  data.res = obj;
                  cb(null, data);
                }
              })
            }
          })
        } else {
          obj.customerName = customerName;
          obj.businessName = businessName;
          data.isSuccess = false;
          data.message = "CustomerId not Found in Loyalty..";
          data.res = obj;
          data.messageData = `Welcome to ${businessName}. You are in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc. Good Luck!`;
          cb(null, data);
        }


      })


    } else {
      data.isSuccess = false;
      data.message = "Provide businessId, customerId, businessName, customerName and date";
      cb(null, data);
    }

  }




  Loyalty.getScanMessageOfCustomer2 = function (details, cb) {
    let data = {},
      data1 = {};
    if (details) {
      const WeeklyPrize = app.models.WeeklyPrize,
        Customer = app.models.Customer,
        InstantPrizeAdmin = app.models.InstantPrizeAdmin,
        DashDate = app.models.DashDate,
        DashLine = app.models.DashLine,
        Business = app.models.Business,
        InAppSpecial = app.models.InAppSpecial,
        InAppSpecialNotification = app.models.InAppSpecialNotification,
        InAppSpecialInterCustomer = app.models.InAppSpecialInterCustomer,
        WhatshotNotification = app.models.WhatshotNotification,
        CouponNotification = app.models.CouponNotification,
        CustomerInterestWhatshot = app.models.CustomerInterestWhatshot,
        LoyaltyLines = app.models.LoyaltyLines,
        LoyaltyRewards = app.models.LoyaltyRewards;
      let businessId = details.businessId,
        customerId = details.customerId,
        customerUid = details.customerUid,
        businessName = details.businessName,
        instantGiveaway = details.instantGiveaway,
        customerName = details.customerName,
        date = details.date,
        timeZone = details.timeZone,
        country = details.country,
        level,
        WhatshotGiveAway,
        instantPrize,
        duration,
        weeklyPrize,
        popupMsgAfterScan,
        obj = {},
        prDate = new Date();

      if (instantGiveaway && businessId && customerId && customerUid && businessName && customerName && date) {

        function inAppSpecialCheck(whatsHot, callback) {
          var isWhatsHotInterestOrNot = whatsHot;

          InAppSpecial.find({
            "where": {
              "and": [{ "ownerId": businessId },
              { date },
              { "endDateFormat": { "gte": prDate } }
              ]
            },
            "include": {
              "relation": "inAppSpecialInterCustomers",
              "scope": {
                "where": { customerId, "isScan": "no", "status": "Interested" },
                // "fields": ["id","customer"],
                "include": {
                  "relation": "customer",
                  "scope": {
                    "fields": ["id", "deviceId"]
                  }
                }
              }
            }
          }, function (iErr, iRes) {
            if (iErr) {
              console.log(iErr);

              let getScanMessageWithoutInAppSpecialObj = {
                businessId,
                customerId,
                businessName,
                instantGiveaway,
                customerName,
                date,
                "isWhatshotInterOrNot": isWhatsHotInterestOrNot || "no",
                "WhatshotGiveAway": WhatshotGiveAway || "DEFAULT",
                popupMsgAfterScan,
                timeZone
              };

              Loyalty.getScanMessageWithoutInAppSpecial(getScanMessageWithoutInAppSpecialObj, function (e, iResp) {
                if (iResp && iResp.messageData) {
                  data1 = iResp;
                  callback(data1);
                } else {
                  data1.isSuccess = false;
                  data1.message = "Error in InAppSpecial find and getScanMessageWithoutInAppSpecial Api..";
                  data1.messageData = ` Welcome to ${businessName}.\n• You are in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!!!`;
                  callback(data1);
                }
              });
            } else if (iRes.length > 0) {
              iRes = JSON.parse(JSON.stringify(iRes));

              let endDateInAppSpecial = iRes[0].endDateFormat;

              if (iRes[0] && iRes[0].inAppSpecialInterCustomers && iRes[0].inAppSpecialInterCustomers.length) {

                // inAppSpecialInterCustomers

                let promoCode = iRes[0].promoCode || "",
                  promoDesc = iRes[0].desc,
                  promoItem1 = iRes[0].item,
                  inAppSpecialfilteredId = iRes[0].id || "hgdcgdscv",
                  newDate = new Date(),
                  custExist = 0,
                  custCounter = 0,
                  inAppSpecialInterCustomersId = iRes[0].inAppSpecialInterCustomers[0].id,
                  custTokenId = iRes[0].inAppSpecialInterCustomers[0].customer.deviceId || "notFound";

                InAppSpecialInterCustomer.upsertWithWhere({ "id": inAppSpecialInterCustomersId }, { "isScan": "yes" });

                let CouponNotificationObj1 = {
                  date,
                  expiryDate: endDateInAppSpecial,
                  event: "InAppSpecial",
                  promoCode,
                  promoMessage: `Your Exclusive In App Offer Coupon with Promo Code for - ${promoItem1}`,
                  customerInterestId: inAppSpecialInterCustomersId,
                  status: "active",
                  ownerId: businessId,
                  customerId,
                  inAppSpecialId: inAppSpecialfilteredId

                };
                CouponNotification.create(CouponNotificationObj1);

                //Instant extra push notification end 
                obj.customerName = customerName;
                obj.businessName = businessName;

                let getScanMessageWithInAppSpecialObj = {
                  businessId,
                  customerId,
                  businessName,
                  instantGiveaway,
                  customerName,
                  date,
                  "isWhatshotInterOrNot": isWhatsHotInterestOrNot || "no",
                  "WhatshotGiveAway": WhatshotGiveAway || "DEFAULT",
                  popupMsgAfterScan,
                  timeZone
                };

                Loyalty.getScanMessageWithInAppSpecial(getScanMessageWithInAppSpecialObj, function (e, iResp) {
                  if (iResp && iResp.messageData) {
                    data1 = iResp;
                    data1.event = "InAppSpecial";
                    data1.customerInterestId = inAppSpecialInterCustomersId;
                    data1.promoCode = promoCode;
                    data1.promoMessage = promoDesc;
                    callback(data1);
                  } else {
                    data1.isSuccess = false;
                    data1.message = "Error in InAppSpecial find and getScanMessageWithoutInAppSpecial Api..";
                    data1.messageData = ` Welcome to ${businessName}.\n• You are in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!!!`;
                    callback(data1);
                  }
                });
              } else {

                console.log("inside else");
                let getScanMessageWithoutInAppSpecialObj = {
                  businessId,
                  customerId,
                  businessName,
                  instantGiveaway,
                  customerName,
                  date,
                  "isWhatshotInterOrNot": isWhatsHotInterestOrNot || "no",
                  "WhatshotGiveAway": WhatshotGiveAway || "DEFAULT",
                  popupMsgAfterScan,
                  timeZone

                };
                Loyalty.getScanMessageWithoutInAppSpecial(getScanMessageWithoutInAppSpecialObj, function (e, iResp) {
                  if (iResp && iResp.messageData) {
                    data1 = iResp;
                    callback(data1);
                  } else {
                    data1.isSuccess = false;
                    data1.message = "Error in getScanMessageWithoutInAppSpecial Api and In-App special not found..";
                    data1.messageData = ` Welcome to ${businessName}.\n• You are in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!!!`;
                    callback(data1);
                  }
                });
              }

            } else {

              let getScanMessageWithoutInAppSpecialObj = {
                businessId,
                customerId,
                businessName,
                instantGiveaway,
                customerName,
                date,
                "isWhatshotInterOrNot": isWhatsHotInterestOrNot || "no",
                "WhatshotGiveAway": WhatshotGiveAway || "DEFAULT",
                popupMsgAfterScan,
                timeZone
              };
              Loyalty.getScanMessageWithoutInAppSpecial(getScanMessageWithoutInAppSpecialObj, function (e, iResp) {
                if (iResp && iResp.messageData) {
                  data1 = iResp;
                  callback(data1);
                } else {
                  data1.isSuccess = false;
                  data1.message = "Error in getScanMessageWithoutInAppSpecial Api and InApp special not found..";
                  data1.messageData = ` Welcome to ${businessName}.\n• You are in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!!!`;
                  callback(data1);
                }
              });
            }
          })
        }
        //inAppSpecialCheck function end

        //whatsHotInterestedCustomerValid function Start
        function whatsHotInterestedCustomerValid(callback) {

          DashDate.find({
            "where": { "ownerId": businessId, date },
            "include": {
              "relation": "dashLines",
              "scope": { "where": { "and": [{ "category": "Whats_Hot" }, { "utcEndTime": { "gte": prDate } }] }, "include": { "relation": "customerInterestWhatshots", "scope": { "where": { "status": "Interested", "customerId": customerId, "isScan": "no" }, "include": "customer" } } }
            }
          }, function (err, res) {
            res = JSON.parse(JSON.stringify(res));
            if (res && res.length > 0 && res[0].dashLines.length) {

              let customerId,
                dlCounter = 0,
                cCounter = 0,
                dashLineLength = res[0].dashLines.length,
                promo,
                teaserMessage,
                promoMessage,
                notificationMessage,
                customerInterestWhatshotId,
                custTokId,
                dashLineCutoffDate,
                isEntryPromo = false,
                dashLineId,
                isScanCheck;
              for (let i = 0; i < dashLineLength; i++) {

                if (res[0].dashLines[i].customerInterestWhatshots && res[0].dashLines[i].customerInterestWhatshots.length > 0) {
                  dlCounter++;
                  cCounter++;
                  dashLineCutoffDate = new Date(res[0].dashLines[i].entryCutoffDateAndTimeUtc);
                  dashLineId = res[0].dashLines[i].id;
                  popupMsgAfterScan = res[0].dashLines[i].popupMsgAfterScan || "You are in the Draw to Win a Event offer.";
                  isEntryPromo = (res[0].dashLines[i].entryPromo && (dashLineCutoffDate >= prDate)) ? true : false;
                  WhatshotGiveAway = res[0].dashLines[i].giveaways || "DEFAULT";
                  promo = res[0].dashLines[i].promoCode || "DEFAULT";
                  teaserMessage = res[0].dashLines[i].teaserMessage || "Event";
                  promoMessage = res[0].dashLines[i].promoMessage || "Thanks for registering your interest.";
                  notificationMessage = `Use Promocode "${promo}" for ${teaserMessage}.`;
                  customerInterestWhatshotId = res[0].dashLines[i].customerInterestWhatshots[0].id;
                  isScanCheck = (res[0].dashLines[i].customerInterestWhatshots[0].isScan == "no") ? 0 : 1;
                  custTokId = res[0].dashLines[i].customerInterestWhatshots[0].customer.deviceId;
                  customerId = res[0].dashLines[i].customerInterestWhatshots[0].customer.id;
                } else {
                  dlCounter++;
                }
                if (dlCounter == dashLineLength) {
                  if (cCounter > 0) {
                    if (isEntryPromo) {
                      if (!timeZone) {
                        timeZone = "Australia/Sydney";
                      }
                      if (!country) {
                        country = "Australia";
                      }
                      let momentdate = new Date(),
                        countryTime = moment.tz(momentdate, timeZone).format('YYYY-MM-DD hh:mm A'),
                        countryDateFormat = moment.tz(momentdate, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z",
                        CouponNotificationObj = {
                          date: momentdate,
                          expiryDate: dashLineCutoffDate,
                          event: "WhatsHotPromo",
                          promoCode: promo,
                          promoMessage: `Congratulations! You have earned a Free Entry to ${teaserMessage}`,
                          customerInterestId: customerInterestWhatshotId,
                          status: "active",
                          ownerId: businessId,
                          customerId,
                          dashLineId
                        };
                      CouponNotification.create(CouponNotificationObj);

                      let newDate = new Date();
                      CustomerInterestWhatshot.upsertWithWhere({ "id": customerInterestWhatshotId }, { "isScan": "yes", "scanTimeDateUtc": newDate, "scanTimeString": countryTime, "scanTimeDate": countryDateFormat });
                      //Instant extra push notification end 
                    } else {
                      if (!timeZone) {
                        timeZone = "Australia/Sydney";
                      }
                      if (!country) {
                        country = "Australia";
                      }
                      let newDate = new Date(),
                        newDatePlusOneDay = newDate.setDate(newDate.getDate() + 1);

                      if (customerId) {
                        Loyalty.findOne({ where: { customerId } }, (LoyaltyErr, LoyaltyRes) => {
                          if (LoyaltyRes && LoyaltyRes.level) {
                            level = LoyaltyRes.level.toLowerCase();
                            if (level) {
                              WeeklyPrize.findOne({}, function (wErr, wRes) {
                                if (wRes) {
                                  CouponNotification.create({
                                    date: momentdate,
                                    expiryDate: newDatePlusOneDay,
                                    event: "WhatsHotPromo",
                                    promoCode: "Barm8",
                                    promoMessage: `Congratulations! You are in the Weekly Draw to Win a ${wRes[level]}.\n Good Luck!`,
                                    customerInterestId: customerInterestWhatshotId,
                                    status: "active",
                                    ownerId: businessId,
                                    customerId,
                                    dashLineId
                                  });
                                }
                              });
                            }
                          }
                        });
                      }

                      let momentdate = new Date(),
                        countryTime = moment.tz(momentdate, timeZone).format('YYYY-MM-DD hh:mm A'),
                        countryDateFormat = moment.tz(momentdate, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";

                      CustomerInterestWhatshot.upsertWithWhere({ "id": customerInterestWhatshotId }, { "isScan": "yes", "scanTimeDateUtc": newDate, "scanTimeString": countryTime, "scanTimeDate": countryDateFormat });

                    }

                    //yes
                    inAppSpecialCheck("yes", function (callbackRes) {
                      if (isEntryPromo) {
                        callbackRes.event = "WhatsHotPromo";
                        callbackRes.customerInterestId = customerInterestWhatshotId;
                        callbackRes.promoCode = promo;
                        callbackRes.promoMessage = `Congratulations! You won the Free Entry to ${teaserMessage}`;
                        callback(callbackRes);
                      } else {
                        callback(callbackRes);
                      }
                    });
                  } else {
                    //no
                    inAppSpecialCheck("no", function (callbackRes) {
                      callback(callbackRes);
                    });
                  }
                }
              }
            } else if (err) {
              //no            
              inAppSpecialCheck("no", function (callbackRes) {
                callback(callbackRes);
              });
            } else {
              //no         
              inAppSpecialCheck("no", function (callbackRes) {
                callback(callbackRes);
              });
            }
          });
        }
        //whatsHotInterestedCustomerValid function End

        //Loyalty Rewards check Start
        function loyaltyRewardsCheck(callback) {

          LoyaltyLines.findOne({ "where": { customerId, "ownerId": businessId } }, (llErr, llRes) => {
            if (llErr) {
              callback({ "isSuccess": false });
            } else if (llRes && llRes.level) {
              level = llRes.level.toLowerCase();
              if (level) {
                LoyaltyRewards.findOne({
                  "where": { "ownerId": businessId, "category": level, date, "endDateFormat": { "gte": prDate } }
                }, function (lrErr, lrRes) {
                  if (lrErr) {
                    callback({ "isSuccess": false });
                  } else if (lrRes) {
                    let dateP = new Date(),
                      momentdate = new Date(),
                      newDatePlusOneDay = dateP.setDate(dateP.getDate() + 1),
                      countryTime = moment.tz(momentdate, timeZone).format('YYYY-MM-DD hh:mm A'),
                      countryDateFormat = moment.tz(momentdate, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z",
                      CouponNotObj = {
                        date: momentdate,
                        expiryDate: newDatePlusOneDay,
                        event: "LoyaltyRewards",
                        promoCode: lrRes.promoCode,
                        promoMessage: lrRes.promoMessage,
                        status: "active",
                        ownerId: businessId,
                        customerId,
                        loyaltyRewardsId: lrRes.id
                      };
                    CouponNotification.create(CouponNotObj);

                    callback({ "isSuccess": true, "event": "LoyaltyRewards", "promoCode": lrRes.promoCode, "promoMessage": lrRes.promoMessage });

                  } else {
                    callback({ "isSuccess": false });
                  }
                })
              } else {
                callback({ "isSuccess": false });
              }
            } else {
              callback({ "isSuccess": false });
            }
          });
        }
        //Loyalty Rewards check End

        // businessName = "Barm8";
        if (businessName == "BarM8") {
          Customer.findOne({ "where": { "uid": customerUid } }, function (custErr, custRes) {
            if (custErr) {
              obj.customerName = customerName;
              obj.businessName = businessName;
              data.isSuccess = false;
              data.message = "Error in Customer FindOne..";
              data.messageData = ` Welcome to ${businessName}.\n• You are in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!!!`;

              data.errorMessage = custErr;
              data.res = obj;
              cb(null, data);
            } else {

              customerId = customerId || "rf";
              Customer.updateAll({ "id": customerId }, { "uid": customerUid });
              obj.customerName = customerName;
              obj.businessName = businessName;
              data.isSuccess = true;
              data.promoCode = "HOLIDAY";
              data.isBarm8 = true;
              data.promoMessage = "Welcome to BarM8!\n You are in the Draw to\n WIN a $2000 Holiday Voucher";
              data.messageData = " Welcome to BarM8!\n You are in the Draw to\n• WIN a $2000 Holiday Voucher\n• 1 of 500 Bottles of Wine from Warburn Estate\n• 1 of 40 Six Packs of beer from Brick Lane Brewing Co\n Turn On Bluetooth or Scan QR Code at the venue to \n WIN Instant & Weekly Prizes and giveaways.\n Good Luck!";
              data.message = "First time Scanned to Barm8";

              data.res = obj;
              cb(null, data);
            }
          });
        } else {
          if (instantGiveaway == "On") {
            Customer.findOne({ "where": { "uid": customerUid } }, function (custErr, custRes) {
              if (custErr) {
                obj.customerName = customerName;
                obj.businessName = businessName;
                data.isSuccess = false;
                data.message = "Error in Customer FindOne..";
                data.messageData = ` Welcome to ${businessName}.\n• You are in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!!!`;
                data.errorMessage = custErr;
                data.res = obj;
                cb(null, data);
              } else if (custRes && (custRes.uid).toString() == customerUid.toString()) {

                whatsHotInterestedCustomerValid(responseFromFunction => {
                  loyaltyRewardsCheck((lrcResp) => {
                    if (lrcResp.isSuccess) {
                      responseFromFunction.event = lrcResp.event;
                      responseFromFunction.promoCode = lrcResp.promoCode;
                      responseFromFunction.promoMessage = lrcResp.promoMessage;
                      cb(null, responseFromFunction);
                    } else {
                      cb(null, responseFromFunction);
                    }
                  })
                });
              } else {
                customerId = customerId || "r";

                Customer.updateAll({ "id": customerId }, { "uid": customerUid });

                const DashLine = app.models.DashLine;
                let preDate = new Date(),
                  timeZoneOffset = preDate.getTimezoneOffset();
                preDate.setTime(preDate.getTime() + ((5 * 60 * 60 * 1000) + (30 * 60 * 1000)));
                let year = preDate.getFullYear(),
                  month = preDate.getMonth(),
                  date1 = preDate.getDate();
                month = month + 1;
                let dateStr = `${year}-${("0" + month).slice(-2)}-${("0" + date1).slice(-2)}T00:00:00.000Z`;
                DashDate.find({
                  "where": {
                    and: [{ "ownerId": businessId },
                    { "date": dateStr }
                    ]
                  },
                  "include": {
                    "relation": "dashLines",
                    "scope": {
                      "where": {
                        and: [{ "category": "FreebieAdmin" },
                        { "startTimeDateFormat": { "lte": preDate } },
                        { "endTimeDateFormat": { "gte": preDate } }
                        ]
                      }
                    }
                  }
                }, function (dlErr, dlRes) {
                  if (dlErr) {
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    data.isSuccess = false;
                    data.message = "Error in Customer FindOne..";
                    data.messageData = ` Welcome to ${businessName}.\n• You are in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!!!`;
                    data.errorMessage = dlErr;
                    data.res = obj;
                    cb(null, data);
                  } else if (dlRes && dlRes.length > 0) {
                    dlRes = JSON.parse(JSON.stringify(dlRes));
                    let totLength = dlRes.length,
                      totCount = 0;
                    for (let i = 0; i < dlRes.length; i++) {

                      if (dlRes[i].dashLines && !dlRes[i].dashLines[0]) {
                        dlRes.splice(i, 1);
                        i--;
                        totCount++;
                      } else {
                        totCount++;
                      }
                      if (totCount == totLength) {
                        if (dlRes.length > 0) {

                          customerId = customerId || "rffffer";
                          Customer.updateAll({ "id": customerId }, { "uid": customerUid });
                          const InstantPrizeAdminNotification = app.models.InstantPrizeAdminNotification;
                          let voucher = voucher_codes.generate({
                            length: 8,
                            count: 1
                          });
                          let reffCode = `PROMO-${voucher[0]}`;
                          let messageData = `• Congratulations ${customerName},\n• You won Free Beer in First Scan draw prizes.\n• Show Referral code ${reffCode}`,
                            presentDate = new Date();

                          let notificationObj = {
                            time: presentDate,
                            expiryDate: presentDate,
                            message: messageData,
                            status: "active",
                            customerId,
                            businessId
                          };
                          InstantPrizeAdminNotification.create(notificationObj);
                          obj.customerName = customerName;
                          obj.businessName = businessName;
                          data.isSuccess = false;

                          data.messageData = "• Congratulations!\n• You have a Beer on us.\n• Show Promo Code in Notifications to redeem.\n• Expires in 5 mins.";
                          data.message = "First time Scanned to Business";

                          data.res = obj;
                          cb(null, data);
                        } else {
                          whatsHotInterestedCustomerValid(responseFromFunction => {
                            loyaltyRewardsCheck((lrcResp) => {
                              if (lrcResp.isSuccess) {
                                responseFromFunction.event = lrcResp.event;
                                responseFromFunction.promoCode = lrcResp.promoCode;
                                responseFromFunction.promoMessage = lrcResp.promoMessage;
                                cb(null, responseFromFunction);
                              } else {
                                cb(null, responseFromFunction);
                              }
                            })
                          });
                        }
                      }
                    }
                  } else {
                    whatsHotInterestedCustomerValid(responseFromFunction => {
                      loyaltyRewardsCheck((lrcResp) => {
                        if (lrcResp.isSuccess) {
                          responseFromFunction.event = lrcResp.event;
                          responseFromFunction.promoCode = lrcResp.promoCode;
                          responseFromFunction.promoMessage = lrcResp.promoMessage;
                          cb(null, responseFromFunction);
                        } else {
                          cb(null, responseFromFunction);
                        }
                      })
                    });
                  }
                });
              }
            });
          } else {
            whatsHotInterestedCustomerValid(responseFromFunction => {
              loyaltyRewardsCheck((lrcResp) => {
                if (lrcResp.isSuccess) {
                  responseFromFunction.event = lrcResp.event;
                  responseFromFunction.promoCode = lrcResp.promoCode;
                  responseFromFunction.promoMessage = lrcResp.promoMessage;
                  cb(null, responseFromFunction);
                } else {
                  cb(null, responseFromFunction);
                }
              })
            });
          }
        }
      } else {
        data.isSuccess = false;
        data.message = "Provide instantGiveaway, businessId, customerId, customerUid, businessName, customerName and date";
        cb(null, data);
      }
    } else {
      data.isSuccess = false;
      data.message = "Provide instantGiveaway, businessId, customerId, customerUid, businessName, customerName and date in details object";
      cb(null, data);
    }
  };

  Loyalty.getScanMessageWithoutInAppSpecial = function (details, cb) {
    let data = {};
    const Customer = app.models.Customer,
      InstantPrizeAdmin = app.models.InstantPrizeAdmin,
      DashDate = app.models.DashDate,
      DashLine = app.models.DashLine,
      Business = app.models.Business;
    let businessId = details.businessId,
      customerId = details.customerId,
      businessName = details.businessName,
      instantGiveaway = details.instantGiveaway,
      customerName = details.customerName,
      date = details.date,
      WhatshotGiveAway = details.WhatshotGiveAway,
      isWhatshot = details.isWhatshotInterOrNot,
      popupMsgAfterScan = details.popupMsgAfterScan || "-",
      timeZone = details.timeZone,
      level,
      instantPrize,
      duration,
      weeklyPrize,
      instantStartTime,
      instantEndTime,
      obj = {};

    if (businessId && customerId && businessName && customerName && instantGiveaway && date) {

      if (isWhatshot === "yes") {
        //paste
        const WeeklyPrize = app.models.WeeklyPrize;

        Loyalty.findOne({ "where": { "customerId": customerId } }, function (err, res) {
          if (err) {
            obj.customerName = customerName;
            obj.businessName = businessName;
            data.isSuccess = false;
            data.message = "Error in Loyalty FindOne..";
            data.message = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
            data.isWhatshot = true;
            data.errorMessage = err;
            data.res = obj;
            cb(null, data);
          } else if (res && res.customerId == customerId) {
            // date = new Date(date);
            level = res.level;
            DashDate.findOne({
              "where": { and: [{ "ownerId": businessId }, { "date": date }] },
              "include": {
                "relation": "dashLines",
                "scope": {
                  "where": { "category": "Freebie" }
                }
              },
            }, function (err1, res1) {
              if (err1) {
                WeeklyPrize.find({}, function (wErr, wRes) {
                  if (wErr) {
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;

                    data.isSuccess = false;
                    data.message = "Error in WeeklyPrize find and DashDate find..";
                    data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                    data.errorMessage = wErr;
                    data.isWhatshot = true;
                    data.res = obj;
                    cb(null, data);
                  } else if (wRes && wRes.length > 0) {
                    let weeklyPrizeObj = wRes[0];
                    level = level.toLowerCase();
                    weeklyPrize = weeklyPrizeObj[level];
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;
                    obj.weeklyPrize = weeklyPrize;

                    data.isSuccess = false;
                    data.message = "Error in DashDate find..";
                    data.isWhatshot = true;
                    data.res = obj;

                    data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• You are also in the Weekly Draw to Win a ${weeklyPrize}.\n Good Luck!`;
                    cb(null, data);
                  } else {
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;

                    data.isSuccess = false;
                    data.message = "WeeklyPrize Not Yet Created and error in DashDate find..";
                    data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                    data.isWhatshot = true;
                    data.res = obj;
                    cb(null, data);
                  }
                })
              } else if (res1 && res1.ownerId == businessId) {
                res1 = JSON.parse(JSON.stringify(res1));
                if (res1.dashLines && res1.dashLines.length > 0) {
                  let freebieObj = res1.dashLines[0];

                  instantPrize = freebieObj.freebie;
                  duration = freebieObj.frequency;
                  instantStartTime = new Date(freebieObj.startTimeDateFormat);
                  instantEndTime = new Date(freebieObj.endTimeDateFormat);
                  instantStartTime = moment.tz(instantStartTime, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";
                  instantEndTime = moment.tz(instantEndTime, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";
                  WeeklyPrize.find({}, function (wErr, wRes) {
                    if (wErr) {
                      obj.customerName = customerName;
                      obj.businessName = businessName;
                      obj.level = level;
                      obj.instantPrize = instantPrize;
                      obj.duration = duration;
                      obj.startTime = instantStartTime;
                      obj.endTime = instantEndTime;

                      data.isSuccess = false;
                      data.message = "Error in WeeklyPrize find..";
                      data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• WIN a ${instantPrize} every ${duration} mins between \n ${freebieObj.startTime} and ${freebieObj.endTime}.\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                      data.errorMessage = wErr;
                      data.isWhatshot = true;
                      data.res = obj;
                      cb(null, data);
                    } else if (wRes && wRes.length > 0) {
                      let weeklyPrizeObj = wRes[0];
                      level = level.toLowerCase();
                      weeklyPrize = weeklyPrizeObj[level];
                      obj.customerName = customerName;
                      obj.businessName = businessName;
                      obj.level = level;
                      obj.instantPrize = instantPrize;
                      obj.startTime = instantStartTime;
                      obj.endTime = instantEndTime;
                      obj.duration = duration;
                      obj.weeklyPrize = weeklyPrize;

                      data.isSuccess = false;
                      data.isWhatshot = true;
                      data.res = obj;
                      data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• WIN a ${instantPrize} every ${duration} mins between \n ${freebieObj.startTime} and ${freebieObj.endTime}.\n• You are also in the Weekly Draw to Win a ${weeklyPrize}.\n Good Luck!`;
                      cb(null, data);
                    } else {
                      obj.customerName = customerName;
                      obj.businessName = businessName;
                      obj.level = level;
                      obj.instantPrize = instantPrize;
                      obj.startTime = instantStartTime;
                      obj.endTime = instantEndTime;
                      obj.duration = duration;

                      data.isSuccess = false;
                      data.message = "WeeklyPrize Not Yet Created..";
                      data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• WIN a ${instantPrize} every ${duration} mins between \n ${freebieObj.startTime} and ${freebieObj.endTime}.\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                      data.isWhatshot = true;
                      data.res = obj;
                      cb(null, data);
                    }
                  })

                } else {

                  WeeklyPrize.find({}, function (wErr, wRes) {
                    if (wErr) {
                      obj.customerName = customerName;
                      obj.businessName = businessName;
                      obj.level = level;

                      data.isSuccess = false;
                      data.message = "Error in WeeklyPrize find..";
                      data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                      data.errorMessage = wErr;
                      data.isWhatshot = true;
                      data.res = obj;
                      cb(null, data);
                    } else if (wRes && wRes.length > 0) {
                      let weeklyPrizeObj = wRes[0];
                      level = level.toLowerCase();
                      weeklyPrize = weeklyPrizeObj[level];
                      obj.customerName = customerName;
                      obj.businessName = businessName;
                      obj.level = level;
                      obj.weeklyPrize = weeklyPrize;

                      data.isSuccess = false;
                      data.isWhatshot = true;
                      data.res = obj;
                      data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• You are also in the Weekly Draw to Win a ${weeklyPrize}.\n Good Luck!`;
                      cb(null, data);
                    } else {
                      obj.customerName = customerName;
                      obj.businessName = businessName;
                      obj.level = level;

                      data.isSuccess = false;
                      data.message = "WeeklyPrize Not Yet Created..";
                      data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                      data.isWhatshot = true;
                      data.res = obj;
                      cb(null, data);
                    }
                  })
                }
              } else {
                WeeklyPrize.find({}, function (wErr, wRes) {
                  if (wErr) {
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;

                    data.isSuccess = false;
                    data.message = "Error in WeeklyPrize find..Freebie not found";
                    data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                    data.errorMessage = wErr;
                    data.isWhatshot = true;
                    data.res = obj;
                    cb(null, data);
                  } else if (wRes && wRes.length > 0) {
                    let weeklyPrizeObj = wRes[0];
                    level = level.toLowerCase();
                    weeklyPrize = weeklyPrizeObj[level];
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;
                    obj.weeklyPrize = weeklyPrize;

                    data.isSuccess = false;
                    data.isWhatshot = true;
                    data.res = obj;
                    data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• You are also in the Weekly Draw to Win a ${weeklyPrize}.\n Good Luck!`;
                    cb(null, data);
                  } else {
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;

                    data.isSuccess = false;
                    data.message = "Freebie and WeeklyPrize Not Yet Created..";
                    data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                    data.isWhatshot = true;
                    data.res = obj;
                    cb(null, data);
                  }
                })
              }
            })
          } else {
            obj.customerName = customerName;
            obj.businessName = businessName;
            data.isSuccess = false;
            data.message = "CustomerId not Found in Loyalty..";
            data.isWhatshot = true;
            data.res = obj;
            data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
            cb(null, data);
          }


        })
        //paste
      } else {
        //paste
        const WeeklyPrize = app.models.WeeklyPrize;

        Loyalty.findOne({ "where": { "customerId": customerId } }, function (err, res) {
          if (err) {
            obj.customerName = customerName;
            obj.businessName = businessName;
            data.isSuccess = false;
            data.message = "Error in Loyalty FindOne..";
            data.message = `• Welcome to ${businessName}.\n• You are in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;

            data.errorMessage = err;
            data.isWhatshot = false;
            data.res = obj;
            cb(null, data);
          } else if (res && res.customerId == customerId) {
            level = res.level;
            DashDate.findOne({
              "where": { and: [{ "ownerId": businessId }, { "date": date }] },
              "include": {
                "relation": "dashLines",
                "scope": {
                  "where": { "category": "Freebie" }
                }
              },
            }, function (err1, res1) {
              if (err1) {
                WeeklyPrize.find({}, function (wErr, wRes) {
                  if (wErr) {
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;

                    data.isSuccess = false;
                    data.message = "Error in WeeklyPrize find and DashDate find..";
                    data.messageData = `• Welcome to ${businessName}.\n• You are in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                    data.errorMessage = wErr;
                    data.isWhatshot = false;
                    data.res = obj;
                    cb(null, data);
                  } else if (wRes && wRes.length > 0) {
                    let weeklyPrizeObj = wRes[0];
                    level = level.toLowerCase();
                    weeklyPrize = weeklyPrizeObj[level];
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;
                    obj.weeklyPrize = weeklyPrize;

                    data.isSuccess = false;
                    data.message = "Error in DashDate find..";
                    data.isWhatshot = false;
                    data.res = obj;
                    data.messageData = `• Welcome to ${businessName}.\n• You are in the Weekly Draw to Win a ${weeklyPrize}.\n Good Luck!`;
                    cb(null, data);
                  } else {
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;

                    data.isSuccess = false;
                    data.message = "WeeklyPrize Not Yet Created and error in DashDate find..";
                    data.messageData = `• Welcome to ${businessName}.\n• You are in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                    data.isWhatshot = false;
                    data.res = obj;
                    cb(null, data);
                  }
                })
              } else if (res1 && res1.ownerId == businessId) {
                res1 = JSON.parse(JSON.stringify(res1));
                if (res1.dashLines && res1.dashLines.length > 0) {
                  let freebieObj = res1.dashLines[0];
                  instantPrize = freebieObj.freebie;
                  duration = freebieObj.frequency;
                  instantStartTime = new Date(freebieObj.startTimeDateFormat);
                  instantEndTime = new Date(freebieObj.endTimeDateFormat);
                  instantStartTime = moment.tz(instantStartTime, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";
                  instantEndTime = moment.tz(instantEndTime, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";
                  WeeklyPrize.find({}, function (wErr, wRes) {
                    if (wErr) {
                      obj.customerName = customerName;
                      obj.businessName = businessName;
                      obj.level = level;
                      obj.instantPrize = instantPrize;
                      obj.duration = duration;
                      obj.startTime = instantStartTime;
                      obj.endTime = instantEndTime;

                      data.isSuccess = false;
                      data.message = "Error in WeeklyPrize find..";
                      data.messageData = `• Welcome to ${businessName}.\n• WIN a ${instantPrize} every ${duration} mins between \n ${freebieObj.startTime} and ${freebieObj.endTime}.\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                      data.errorMessage = wErr;
                      data.isWhatshot = false;
                      data.res = obj;
                      cb(null, data);
                    } else if (wRes && wRes.length > 0) {
                      let weeklyPrizeObj = wRes[0];
                      level = level.toLowerCase();
                      weeklyPrize = weeklyPrizeObj[level];
                      obj.customerName = customerName;
                      obj.businessName = businessName;
                      obj.level = level;
                      obj.instantPrize = instantPrize;
                      obj.duration = duration;
                      obj.startTime = instantStartTime;
                      obj.endTime = instantEndTime;
                      obj.weeklyPrize = weeklyPrize;

                      data.isSuccess = false;
                      data.isWhatshot = false;
                      data.res = obj;
                      data.messageData = `• Welcome to ${businessName}.\n• WIN a ${instantPrize} every ${duration} mins between \n ${freebieObj.startTime} and ${freebieObj.endTime}.\n• You are also in the Weekly Draw to Win a ${weeklyPrize}.\n Good Luck!`;
                      cb(null, data);
                    } else {
                      obj.customerName = customerName;
                      obj.businessName = businessName;
                      obj.level = level;
                      obj.instantPrize = instantPrize;
                      obj.duration = duration;
                      obj.startTime = instantStartTime;
                      obj.endTime = instantEndTime;

                      data.isSuccess = false;
                      data.message = "WeeklyPrize Not Yet Created..";
                      data.messageData = `• Welcome to ${businessName}.\n• WIN a ${instantPrize} every ${duration} mins between \n ${freebieObj.startTime} and ${freebieObj.endTime}.\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                      data.isWhatshot = false;
                      data.res = obj;
                      cb(null, data);
                    }
                  })
                } else {
                  WeeklyPrize.find({}, function (wErr, wRes) {
                    if (wErr) {
                      obj.customerName = customerName;
                      obj.businessName = businessName;
                      obj.level = level;

                      data.isSuccess = false;
                      data.message = "Error in WeeklyPrize find..";
                      data.messageData = `• Welcome to ${businessName}.\n• You are in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                      data.errorMessage = wErr;
                      data.isWhatshot = false;
                      data.res = obj;
                      cb(null, data);
                    } else if (wRes && wRes.length > 0) {
                      let weeklyPrizeObj = wRes[0];
                      level = level.toLowerCase();
                      weeklyPrize = weeklyPrizeObj[level];
                      obj.customerName = customerName;
                      obj.businessName = businessName;
                      obj.level = level;
                      obj.weeklyPrize = weeklyPrize;

                      data.isSuccess = false;
                      data.isWhatshot = false;
                      data.res = obj;
                      data.messageData = `• Welcome to ${businessName}.\n• You are in the Weekly Draw to Win a ${weeklyPrize}.\n Good Luck!`;
                      cb(null, data);
                    } else {
                      obj.customerName = customerName;
                      obj.businessName = businessName;
                      obj.level = level;

                      data.isSuccess = false;
                      data.message = "WeeklyPrize Not Yet Created..";
                      data.messageData = `• Welcome to ${businessName}.\n• You are in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                      data.isWhatshot = false;
                      data.res = obj;
                      cb(null, data);
                    }
                  })
                }
              } else {
                WeeklyPrize.find({}, function (wErr, wRes) {
                  if (wErr) {
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;

                    data.isSuccess = false;
                    data.message = "Error in WeeklyPrize find..Freebie not found";
                    data.messageData = `• Welcome to ${businessName}.\n• You are in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                    data.errorMessage = wErr;
                    data.isWhatshot = false;
                    data.res = obj;
                    cb(null, data);
                  } else if (wRes && wRes.length > 0) {
                    let weeklyPrizeObj = wRes[0];
                    level = level.toLowerCase();
                    weeklyPrize = weeklyPrizeObj[level];
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;
                    obj.weeklyPrize = weeklyPrize;

                    data.isSuccess = false;
                    data.isWhatshot = false;
                    data.res = obj;
                    data.messageData = `• Welcome to ${businessName}.\n• You are in the Weekly Draw to Win a ${weeklyPrize}.\n Good Luck!`;
                    cb(null, data);
                  } else {
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;

                    data.isSuccess = false;
                    data.message = "Freebie and WeeklyPrize Not Yet Created..";
                    data.messageData = `• Welcome to ${businessName}.\n• You are in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                    data.isWhatshot = false;
                    data.res = obj;
                    cb(null, data);
                  }
                })
              }
            })
          } else {
            obj.customerName = customerName;
            obj.businessName = businessName;
            data.isSuccess = false;
            data.message = "CustomerId not Found in Loyalty..";
            data.isWhatshot = false;
            data.res = obj;
            data.messageData = `• Welcome to ${businessName}.\n• You are in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
            cb(null, data);
          }
        })
        //paste
      }
    } else {
      data.isSuccess = false;
      data.message = "Properties missing in businessId, businessName, customerId, customerName, instantGiveaway and date";
      cb(null, data);
    }
  }

  Loyalty.getScanMessageWithInAppSpecial = function (details, cb) {
    let data = {};
    const Customer = app.models.Customer;
    const InstantPrizeAdmin = app.models.InstantPrizeAdmin;
    const DashDate = app.models.DashDate;
    const DashLine = app.models.DashLine;
    const Business = app.models.Business;
    let businessId = details.businessId,
      customerId = details.customerId,
      businessName = details.businessName,
      instantGiveaway = details.instantGiveaway,
      customerName = details.customerName,
      date = details.date,
      isWhatshot = details.isWhatshotInterOrNot,
      WhatshotGiveAway = details.WhatshotGiveAway,
      popupMsgAfterScan = details.popupMsgAfterScan || "-",
      timeZone = details.timeZone,
      level,
      instantPrize,
      duration,
      weeklyPrize,
      instantStartTime,
      instantEndTime,
      obj = {};

    if (businessId && customerId && businessName && customerName && instantGiveaway && date) {

      if (isWhatshot === "yes") {
        //paste
        const WeeklyPrize = app.models.WeeklyPrize;
        Loyalty.findOne({ "where": { "customerId": customerId } }, function (err, res) {
          if (err) {
            obj.customerName = customerName;
            obj.businessName = businessName;
            data.isSuccess = false;
            data.message = "Error in Loyalty FindOne..";
            data.message = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;

            data.errorMessage = err;
            data.isWhatshot = true;
            data.res = obj;
            cb(null, data);
          } else if (res && res.customerId == customerId) {
            // date = new Date(date);
            level = res.level;
            DashDate.findOne({
              "where": { and: [{ "ownerId": businessId }, { "date": date }] },
              "include": {
                "relation": "dashLines",
                "scope": {
                  "where": { "category": "Freebie" }
                }
              },
            }, function (err1, res1) {
              if (err1) {
                WeeklyPrize.find({}, function (wErr, wRes) {
                  if (wErr) {
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;

                    data.isSuccess = false;
                    data.message = "Error in WeeklyPrize find and DashDate find..";
                    data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                    data.errorMessage = wErr;
                    data.isWhatshot = true;
                    data.res = obj;
                    cb(null, data);
                  } else if (wRes && wRes.length > 0) {
                    let weeklyPrizeObj = wRes[0];
                    level = level.toLowerCase();
                    weeklyPrize = weeklyPrizeObj[level];
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;
                    obj.weeklyPrize = weeklyPrize;

                    data.isSuccess = false;
                    data.message = "Error in DashDate find..";
                    data.isWhatshot = true;
                    data.res = obj;
                    data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• You are also in the Weekly Draw to Win a ${weeklyPrize}.\n Good Luck!`;
                    cb(null, data);
                  } else {
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;

                    data.isSuccess = false;
                    data.message = "WeeklyPrize Not Yet Created and error in DashDate find..";
                    data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                    data.isWhatshot = true;
                    data.res = obj;
                    cb(null, data);
                  }
                })
              } else if (res1 && res1.ownerId == businessId) {
                res1 = JSON.parse(JSON.stringify(res1));
                if (res1.dashLines && res1.dashLines.length > 0) {
                  let freebieObj = res1.dashLines[0];
                  instantPrize = freebieObj.freebie;
                  duration = freebieObj.frequency;
                  instantStartTime = new Date(freebieObj.startTimeDateFormat);
                  instantEndTime = new Date(freebieObj.endTimeDateFormat);
                  instantStartTime = moment.tz(instantStartTime, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";
                  instantEndTime = moment.tz(instantEndTime, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";
                  WeeklyPrize.find({}, function (wErr, wRes) {
                    if (wErr) {
                      obj.customerName = customerName;
                      obj.businessName = businessName;
                      obj.level = level;
                      obj.instantPrize = instantPrize;
                      obj.duration = duration;
                      obj.startTime = instantStartTime;
                      obj.endTime = instantEndTime;

                      data.isSuccess = false;
                      data.message = "Error in WeeklyPrize find..";
                      data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• WIN a ${instantPrize} every ${duration} mins between \n ${freebieObj.startTime} and ${freebieObj.endTime}.\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                      data.errorMessage = wErr;
                      data.isWhatshot = true;
                      data.res = obj;
                      cb(null, data);
                    } else if (wRes && wRes.length > 0) {
                      let weeklyPrizeObj = wRes[0];
                      level = level.toLowerCase();
                      weeklyPrize = weeklyPrizeObj[level];
                      obj.customerName = customerName;
                      obj.businessName = businessName;
                      obj.level = level;
                      obj.instantPrize = instantPrize;
                      obj.duration = duration;
                      obj.startTime = instantStartTime;
                      obj.endTime = instantEndTime;
                      obj.weeklyPrize = weeklyPrize;

                      data.isSuccess = false;
                      data.isWhatshot = true;
                      data.res = obj;
                      data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• WIN a ${instantPrize} every ${duration} mins between \n ${freebieObj.startTime} and ${freebieObj.endTime}.\n• You are also in the Weekly Draw to Win a ${weeklyPrize}.\n Good Luck!`;
                      cb(null, data);
                    } else {
                      obj.customerName = customerName;
                      obj.businessName = businessName;
                      obj.level = level;
                      obj.instantPrize = instantPrize;
                      obj.duration = duration;
                      obj.startTime = instantStartTime;
                      obj.endTime = instantEndTime;

                      data.isSuccess = false;
                      data.message = "WeeklyPrize Not Yet Created..";
                      data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• WIN a ${instantPrize} every ${duration} mins between \n ${freebieObj.startTime} and ${freebieObj.endTime}.\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                      data.isWhatshot = true;
                      data.res = obj;
                      cb(null, data);
                    }
                  })

                } else {

                  WeeklyPrize.find({}, function (wErr, wRes) {
                    if (wErr) {
                      obj.customerName = customerName;
                      obj.businessName = businessName;
                      obj.level = level;

                      data.isSuccess = false;
                      data.message = "Error in WeeklyPrize find..";
                      data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                      data.errorMessage = wErr;
                      data.isWhatshot = true;
                      data.res = obj;
                      cb(null, data);
                    } else if (wRes && wRes.length > 0) {
                      let weeklyPrizeObj = wRes[0];
                      level = level.toLowerCase();
                      weeklyPrize = weeklyPrizeObj[level];
                      obj.customerName = customerName;
                      obj.businessName = businessName;
                      obj.level = level;
                      obj.weeklyPrize = weeklyPrize;

                      data.isSuccess = false;
                      data.isWhatshot = true;
                      data.res = obj;
                      data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• You are also in the Weekly Draw to Win a ${weeklyPrize}.\n Good Luck!`;
                      cb(null, data);
                    } else {
                      obj.customerName = customerName;
                      obj.businessName = businessName;
                      obj.level = level;

                      data.isSuccess = false;
                      data.message = "WeeklyPrize Not Yet Created..";
                      data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                      data.isWhatshot = true;
                      data.res = obj;
                      cb(null, data);
                    }
                  })
                }
              } else {
                WeeklyPrize.find({}, function (wErr, wRes) {
                  if (wErr) {
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;

                    data.isSuccess = false;
                    data.message = "Error in WeeklyPrize find..Freebie not found";
                    data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                    data.errorMessage = wErr;
                    data.isWhatshot = true;
                    data.res = obj;
                    cb(null, data);
                  } else if (wRes && wRes.length > 0) {
                    let weeklyPrizeObj = wRes[0];
                    level = level.toLowerCase();
                    weeklyPrize = weeklyPrizeObj[level];
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;
                    obj.weeklyPrize = weeklyPrize;

                    data.isSuccess = false;
                    data.isWhatshot = true;
                    data.res = obj;
                    data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• You are also in the Weekly Draw to Win a ${weeklyPrize}.\n Good Luck!`;
                    cb(null, data);
                  } else {
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;

                    data.isSuccess = false;
                    data.message = "Freebie and WeeklyPrize Not Yet Created..";
                    data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                    data.isWhatshot = true;
                    data.res = obj;
                    cb(null, data);
                  }
                })
              }
            })
          } else {
            obj.customerName = customerName;
            obj.businessName = businessName;
            data.isSuccess = false;
            data.message = "CustomerId not Found in Loyalty..";
            data.isWhatshot = true;
            data.res = obj;
            data.messageData = `• Welcome to ${businessName}.\n• ${popupMsgAfterScan}\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
            cb(null, data);
          }


        })
        //paste
      } else {
        //paste
        const WeeklyPrize = app.models.WeeklyPrize;

        Loyalty.findOne({ "where": { "customerId": customerId } }, function (err, res) {
          if (err) {
            obj.customerName = customerName;
            obj.businessName = businessName;
            data.isSuccess = false;
            data.message = "Error in Loyalty FindOne..";
            data.message = `• Welcome to ${businessName}.\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• You are in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;

            data.errorMessage = err;
            data.isWhatshot = false;
            data.res = obj;
            cb(null, data);
          } else if (res && res.customerId == customerId) {
            // date = new Date(date);
            level = res.level;
            DashDate.findOne({
              "where": { and: [{ "ownerId": businessId }, { "date": date }] },
              "include": {
                "relation": "dashLines",
                "scope": {
                  "where": { "category": "Freebie" }
                }
              },
            }, function (err1, res1) {
              if (err1) {
                WeeklyPrize.find({}, function (wErr, wRes) {
                  if (wErr) {
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;

                    data.isSuccess = false;
                    data.message = "Error in WeeklyPrize find and DashDate find..";
                    data.messageData = `• Welcome to ${businessName}.\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                    data.errorMessage = wErr;
                    data.isWhatshot = false;
                    data.res = obj;
                    cb(null, data);
                  } else if (wRes && wRes.length > 0) {
                    let weeklyPrizeObj = wRes[0];
                    level = level.toLowerCase();
                    weeklyPrize = weeklyPrizeObj[level];
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;
                    obj.weeklyPrize = weeklyPrize;

                    data.isSuccess = false;
                    data.message = "Error in DashDate find..";
                    data.isWhatshot = false;
                    data.res = obj;

                    data.messageData = `• Welcome to ${businessName}.\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• You are also in the Weekly Draw to Win a ${weeklyPrize}.\n Good Luck!`;
                    cb(null, data);
                  } else {
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;

                    data.isSuccess = false;
                    data.message = "WeeklyPrize Not Yet Created and error in DashDate find..";
                    data.messageData = `• Welcome to ${businessName}.\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                    data.isWhatshot = false;
                    data.res = obj;
                    cb(null, data);
                  }
                })
              } else if (res1 && res1.ownerId == businessId) {
                res1 = JSON.parse(JSON.stringify(res1));
                if (res1.dashLines && res1.dashLines.length > 0) {
                  let freebieObj = res1.dashLines[0];
                  instantPrize = freebieObj.freebie;
                  duration = freebieObj.frequency;
                  instantStartTime = new Date(freebieObj.startTimeDateFormat);
                  instantEndTime = new Date(freebieObj.endTimeDateFormat);
                  instantStartTime = moment.tz(instantStartTime, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";
                  instantEndTime = moment.tz(instantEndTime, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";
                  WeeklyPrize.find({}, function (wErr, wRes) {
                    if (wErr) {
                      obj.customerName = customerName;
                      obj.businessName = businessName;
                      obj.level = level;
                      obj.instantPrize = instantPrize;
                      obj.duration = duration;
                      obj.startTime = instantStartTime;
                      obj.endTime = instantEndTime;

                      data.isSuccess = false;
                      data.message = "Error in WeeklyPrize find..";
                      data.messageData = `• Welcome to ${businessName}.\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• WIN a ${instantPrize} every ${duration} mins between \n ${freebieObj.startTime} and ${freebieObj.endTime}.\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                      data.errorMessage = wErr;
                      data.isWhatshot = false;
                      data.res = obj;
                      cb(null, data);
                    } else if (wRes && wRes.length > 0) {
                      let weeklyPrizeObj = wRes[0];
                      level = level.toLowerCase();
                      weeklyPrize = weeklyPrizeObj[level];
                      obj.customerName = customerName;
                      obj.businessName = businessName;
                      obj.level = level;
                      obj.instantPrize = instantPrize;
                      obj.duration = duration;
                      obj.startTime = instantStartTime;
                      obj.endTime = instantEndTime;
                      obj.weeklyPrize = weeklyPrize;

                      data.isSuccess = false;
                      data.isWhatshot = false;
                      data.res = obj;
                      data.messageData = `• Welcome to ${businessName}.\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• WIN a ${instantPrize} every ${duration} mins between \n ${freebieObj.startTime} and ${freebieObj.endTime}.\n• You are also in the Weekly Draw to Win a ${weeklyPrize}.\n Good Luck!`;
                      cb(null, data);
                    } else {
                      obj.customerName = customerName;
                      obj.businessName = businessName;
                      obj.level = level;
                      obj.instantPrize = instantPrize;
                      obj.duration = duration;
                      obj.startTime = instantStartTime;
                      obj.endTime = instantEndTime;

                      data.isSuccess = false;
                      data.message = "WeeklyPrize Not Yet Created..";
                      data.messageData = `• Welcome to ${businessName}.\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• WIN a ${instantPrize} every ${duration} mins between \n ${freebieObj.startTime} and ${freebieObj.endTime}.\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                      data.isWhatshot = false;
                      data.res = obj;
                      cb(null, data);
                    }
                  })

                } else {

                  WeeklyPrize.find({}, function (wErr, wRes) {
                    if (wErr) {
                      obj.customerName = customerName;
                      obj.businessName = businessName;
                      obj.level = level;

                      data.isSuccess = false;
                      data.message = "Error in WeeklyPrize find..";
                      data.messageData = `• Welcome to ${businessName}.\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                      data.errorMessage = wErr;
                      data.isWhatshot = false;
                      data.res = obj;
                      cb(null, data);
                    } else if (wRes && wRes.length > 0) {
                      let weeklyPrizeObj = wRes[0];
                      level = level.toLowerCase();
                      weeklyPrize = weeklyPrizeObj[level];
                      obj.customerName = customerName;
                      obj.businessName = businessName;
                      obj.level = level;
                      obj.weeklyPrize = weeklyPrize;

                      data.isSuccess = false;
                      data.isWhatshot = false;
                      data.res = obj;
                      data.messageData = `• Welcome to ${businessName}.\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• You are also in the Weekly Draw to Win a ${weeklyPrize}.\n Good Luck!`;
                      cb(null, data);
                    } else {
                      obj.customerName = customerName;
                      obj.businessName = businessName;
                      obj.level = level;

                      data.isSuccess = false;
                      data.message = "WeeklyPrize Not Yet Created..";
                      data.messageData = `• Welcome to ${businessName}.\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                      data.res = obj;
                      cb(null, data);
                    }
                  })
                }
              } else {
                WeeklyPrize.find({}, function (wErr, wRes) {
                  if (wErr) {
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;

                    data.isSuccess = false;
                    data.message = "Error in WeeklyPrize find..Freebie not found";
                    data.messageData = `• Welcome to ${businessName}.\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                    data.errorMessage = wErr;
                    data.isWhatshot = false;
                    data.res = obj;
                    cb(null, data);
                  } else if (wRes && wRes.length > 0) {
                    let weeklyPrizeObj = wRes[0];
                    level = level.toLowerCase();
                    weeklyPrize = weeklyPrizeObj[level];
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;
                    obj.weeklyPrize = weeklyPrize;

                    data.isSuccess = false;
                    data.isWhatshot = false;
                    data.res = obj;
                    data.messageData = `• Welcome to ${businessName}.\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• You are also in the Weekly Draw to Win a ${weeklyPrize}.\n Good Luck!`;
                    cb(null, data);
                  } else {
                    obj.customerName = customerName;
                    obj.businessName = businessName;
                    obj.level = level;

                    data.isSuccess = false;
                    data.message = "Freebie and WeeklyPrize Not Yet Created..";
                    data.messageData = `• Welcome to ${businessName}.\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
                    data.isWhatshot = false;
                    data.res = obj;
                    cb(null, data);
                  }
                })
              }
            })
          } else {
            obj.customerName = customerName;
            obj.businessName = businessName;
            data.isSuccess = false;
            data.message = "CustomerId not Found in Loyalty..";
            data.isWhatshot = false;
            data.res = obj;
            data.messageData = `• Welcome to ${businessName}.\n• Redeem your Exclusive App Offer with Coupon in Notifications.\n• You are also in the Weekly Draw to Win a Bottle of Warburn Estate Sauvignon Blanc.\n Good Luck!`;
            cb(null, data);
          }
        })
        //paste
      }

    } else {
      data.isSuccess = false;
      data.message = "Properties missing in businessId, businessName, customerId, customerName, instantGiveaway and date";
      cb(null, data);
    }

  }


  Loyalty.getMessageByIBeaconCheck = function (details, cb) {
    let data = {},
      nameSpaceId = details.nameSpaceId,
      instanceId = details.instanceId;
    const Business = app.models.Business;

    Business.findOne({ "where": { and: [{ "eddystoneNameSpaceId": nameSpaceId }, { "eddystoneInstanceId": instanceId }] }, "fields": ["id", "businessName", "eddystoneNameSpaceId", "eddystoneInstanceId", "isBeacon", "isQrCode"] }, function (err, res) {
      if (err) {
        data.isSuccess = false;
        data.message = "Error in Business FindOne..";
        cb(null, data);
      } else if (res && res.eddystoneNameSpaceId === nameSpaceId && res.eddystoneInstanceId === instanceId) {
        let ownerId = res.id,
          bussName = res.businessName;

        cb(null, {
          businessId: ownerId, message: "Business Found", isSuccess: true, businessName: bussName,
          eddystoneNameSpaceId: res.eddystoneNameSpaceId, eddystoneInstanceId: res.eddystoneInstanceId,
          isBeacon: res.isBeacon, isQrCode: res.isQrCode
        });

      } else {
        data.isSuccess = false;
        data.message = "eddystoneNameSpaceId and eddystoneInstanceId not Found..";
        cb(null, data);
      }


    })
  }


  Loyalty.remoteMethod('updateLoyaltyPoints', {
    http: { path: '/updateLoyaltyPoints', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' }
  });

  Loyalty.remoteMethod('getLoyaltyDetailsOfCustomer', {
    http: { path: '/getLoyaltyDetailsOfCustomer', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' }
  });

  Loyalty.remoteMethod('getScanMessageOfCustomer', {
    http: { path: '/getScanMessageOfCustomer', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' }
  });

  Loyalty.remoteMethod('getScanMessageOfCustomer1', {
    http: { path: '/getScanMessageOfCustomer1', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' }
  });

  Loyalty.remoteMethod('getScanMessageOfCustomer2', {
    http: { path: '/getScanMessageOfCustomer2', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' }
  });


  Loyalty.remoteMethod('getScanMessageWithoutInAppSpecial', {
    http: { path: '/getScanMessageWithoutInAppSpecial', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' }
  });

  Loyalty.remoteMethod('getScanMessageWithInAppSpecial', {
    http: { path: '/getScanMessageWithInAppSpecial', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' }
  });

  Loyalty.remoteMethod('getMessageByIBeaconCheck', {
    http: { path: '/getMessageByIBeaconCheck', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' }
  });
};
