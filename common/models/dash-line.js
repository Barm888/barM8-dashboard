'use strict';
const pickRandom = require('pick-random');

let app = require('../../server/server'),
  moment = require('moment-timezone');

const FCM = require('fcm-push')
  , unique = require('../../node_modules/array-unique')
  , serverKey = 'AAAA-4BeD_8:APA91bEyi_SURDeuKRLqoDDWsde4wDNFP5TIFCDD8Je2fQBHr_21fpj8zmzZ0pjGW_mT1PWKYZB2QNgMdOJ4p6dhsjEVk-aQUJHV4vgL6VpJEDI4HCxPOhMwVl0qBz-47OGkzyOopaEe'
  , fcm = new FCM(serverKey)
  , cleanDeep = require('../../node_modules/clean-deep');

module.exports = function (Dashline) {

  Dashline.observe('before save', (ctx, next) => {
    if (ctx.instance) {
      if (ctx.instance.price) {
        ctx.instance.price = (parseFloat(ctx.instance.price)).toFixed(2);
      }
    } else {
      if (ctx.data) {
        if (ctx.data.price) {
          ctx.data.price = (parseFloat(ctx.data.price)).toFixed(2);
        }
      }
    }
    next();
  });

  Dashline.menuHeaderRemove = (details, cb) => {
    let data = {}, DashSubLine = app.models.DashSubLine;
    if (details) {
      if (details.id) {
        let id = details.id;
        Dashline.find({ where: { id } , include : "dashSubLines" }, (err, res) => {
          if (err) {
            data.isSuccess = false;
            data.message = "Not Deleted. Please try again!";
            cb(null, data);
          }
          else if (res && res.length > 0) {
            if (res[0].dashSubLines && res[0].dashSubLines.length > 0) {
              DashSubLine.destroyAll({ dashLineId: id }, (err, res) => {
                Dashline.destroyById(id);
              });
            } else {
              Dashline.destroyById(id);
            }
            data.isSuccess = true;
            data.message = "dashLine id is required!";
            cb(null, data);
          }
        });
      } else {
        data.isSuccess = false;
        data.message = "dashLine id is required!";
        cb(null, data);
      }
    } else {
      data.isSuccess = false;
      data.message = "details is required!";
      cb(null, data);
    }
  };

  Dashline.whatshotInterestandNotInterestfromMobile = function (details, cb) {

    let data = {}
      , did = details.dashLineId
      , cid = details.customerId
      , timeZone = details.timeZone
      , country = details.country
      , status = details.status
      , Customer = app.models.Customer;

    const WhatshotNotification = app.models.WhatshotNotification
      , CustomerInterestWhatshot = app.models.CustomerInterestWhatshot;

    if (did && cid) {

        Dashline.findOne({ "where": { "id": did }, "include": [{"relation":"whatshotAnalytics", "scope":{"fields":["id","category"]}}] }, function (err, res) {
          if (res) {
            res = JSON.parse(JSON.stringify(res)); 
            let promo = res.promoCode || "DEFAULT"
              , cutOffTime = res.entryCutofftime
              , teaserMessage = res.teaserMessage
              , entryPromo = res.entryPromo || " "
              , giveaways = res.giveaways || " "
              , promoMessage = res.giveaways 
              , eventGiveaway = res.giveaways
              , finalMessage = `${(teaserMessage?`${teaserMessage}\n\n`:``)} ${(eventGiveaway?`• You are in the Draw to Win a ${eventGiveaway}.\n\n `:``)} ${(cutOffTime?`• Free Entry before ${cutOffTime}\n\n • ${entryPromo}\n\n`:``)}• Turn on Bluetooth or Scan QR Code at the venue. Check Notifications for Coupon with Promo Code.`
             
             
              , isDraw = res.isDraw || false
              , isCutoff = res.isCutoff || false
              , whatshotAnalyticsId = (res.whatshotAnalytics)?res.whatshotAnalytics.id:"";

            if (!timeZone) {
              timeZone = "Australia/Sydney";
            }

            if (!country) {
              country = "Australia";
            }

            var momentdate = new Date()
              , countryTime = moment.tz(momentdate, timeZone).format('YYYY-MM-DD hh:mm A')
              , countryDateFormat = moment.tz(momentdate, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";

            Customer.findOne({ "where": { "id": cid } }, function (custErr, custRes) {

              if (custRes) {

                let customerName = custRes.firstName + " " + custRes.lastName
                  , device_Id = custRes.deviceId
                  , notificationMessage = finalMessage || entryPromo;

                if (device_Id && status == 'Interested') {

                    fcm.send({
                      to: custRes.deviceId,
                      priority: "high",
                      time_to_live: 0,
                      data: {
                        "image": null,
                        "title": 'PremiumNotification',
                        "message": notificationMessage,
                        "body": notificationMessage,
                        "priority": "high",
                        "type":""
                      }
                    }, function (error, response) {
                      if (error) {
                      } else {
                      }
                    });
                  }

                if (promo) {

                  CustomerInterestWhatshot.upsertWithWhere({ dashLineId: res.id, customerId: cid }, {
                    status: status, isScan: "no", interestTime: countryTime, interestDateTime: countryDateFormat,
                    country: country, timeZone: timeZone, dashLineId: res.id, customerId: cid, whatshotAnalyticsId: whatshotAnalyticsId
                  }, function (customerErr, customerRes) {
                    if (customerRes) {
                      if (status != 'Interested') {
                        data.isSuccess = true;
                        data.errorMessage = customerName + " is not Interested.";
                        cb(null, data);
                      }
                      else {
                        data.isSuccess = true;
                        data.errorMessage = customerName + " is Interested.";
                        cb(null, data);
                      }
                    } else {
                      if (status != 'Interested') {
                        data.isSuccess = true;
                        data.errorMessage = customerName + " is not Interested.";
                        cb(null, data);
                      }
                      else {
                        data.isSuccess = true;
                        data.errorMessage = customerName + " is Interested.";
                        cb(null, data);
                      }
                    }
                  });
                
                } else {
                  data.isSuccess = false;
                  data.message = "Promo code is empty";
                  cb(null, data);
                }
              } else {
                data.isSuccess = false;
                data.message = "error in customer find";
                cb(null, data);
              }
            });
          }
          else {
            data.isSuccess = false;
            data.message = "error in Dashline findOne";
            cb(null, data);
          }
        });

     
    } else {
      data.isSuccess = false;
      data.message = "DashLine and Customer Id is required!";
      cb(null, data);
    }
  }

  Dashline.getPremiumDetails = function (details, cb) {
    let data = {};
    let dashLineId = details.dashLineId;

    Dashline.find({
      "where": { "id": dashLineId }, fields: { interestedCount: true, notInterestedCount: true, interestedCustArray: true, notInterestedCustArray: true }


    }, function (err, res) {
      if (err) {
        data.isSuccess = false;
        data.errorMessage = err;
        cb(null, data);
      } else if (res.length > 0) {
        data.isSuccess = true;
        data.premiums = res;
        cb(null, data);

      } else {
        data.isSuccess = false;
        data.errorMessage = "Whatshot not found for this dashLineid";

        cb(null, data);

      }
    })
  };

  Dashline.getPremiumCustomerDetails = function (details, cb) {
    let data = {};
    // let dashLineIdArray = details.dashLineIdArray;
    let Customer = app.models.Customer;
    let dashLineIdArray = cleanDeep(unique(details.dashLineIdArray));

    let Arr = [];
    for (let k = 0; k < dashLineIdArray.length; k++) {
      let Obj = { "id": dashLineIdArray[k] };
      Arr.push(Obj);
      if ((k + 1) == dashLineIdArray.length) {
        Dashline.find({
          "where": { "or": Arr }, fields: { interestedCount: true, notInterestedCount: true, interestedCustArray: true, notInterestedCustArray: true }


        }, function (err, res) {
          if (err) {
            data.isSuccess = false;
            data.errorMessage = err;
            cb(null, data);
          } else if (res.length > 0) {
            data.isSuccess = true;

            let interestedCustArray = res[0].interestedCustArray;
            let notInterestedCustArray = res[0].notInterestedCustArray;
            let interestedCustomers = []; let notInterestedCustomers = [];

            for (let i = 0; i < interestedCustArray.length; i++) {
              Customer.findOne({ "where": { "id": interestedCustArray[i] } }, function (err1, res1) {
                if (err1) {
                  data.isSuccess = false;
                  data.errorMessage = err1;
                  cb(null, data);
                } else {

                  interestedCustomers.push(res1);
                  if (i + 1 == interestedCustArray.length) {
                    for (let j = 0; j < notInterestedCustArray.length; j++) {

                      Customer.findOne({ "where": { "id": notInterestedCustArray[j] } }
                        , function (err2, res2) {
                          if (err2) {
                            data.isSuccess = false;
                            data.errorMessage = err2;
                            console.log(err2);
                            cb(null, data);
                          } else {
                            notInterestedCustomers.push(res2);
                            if ((j + 1 == notInterestedCustArray.length)) {
                              data.isSuccess = true;
                              data.interestedCustomers = interestedCustomers;
                              data.notInterestedCustomers = notInterestedCustomers;
                              cb(null, data);
                            }

                          }
                        });
                    }
                  }
                }
              });
            }
          } else {
            data.isSuccess = false;
            data.errorMessage = "Whatshot not found for this dashLineid";
            cb(null, data);
          }
        });
      }
    }
  };

  Dashline.whatshotSlotCheck = function (cb) {
    let data = {};
    // let dashLineIdArray = details.dashLineIdArray;
    const Dashline = app.models.DashLine,
      SlotWhatsHot = app.models.SlotWhatsHot,
      WhatshotWinner = app.models.WhatshotWinner,
      WhatshotNotification = app.models.WhatshotNotification,
      Business = app.models.Business;
    let presentDate = new Date();
    SlotWhatsHot.find({
      "where": { "date": { "lte": presentDate } },
      "include": [{
        "relation": "dashLine",
        "scope": {
          "include": {
            "relation": "customerInterestWhatshots",
            "scope": {
              "where": { "status": "Interested", "isScan": "yes" },
              "include": "customer"
            }
          }
        }
      },
      {
        "relation": "business",
        "scope": {
          "fields": ["id", "businessName", "email"]
        }
      }]
    }, function (swErr, swRes) {
      if (swErr) {
        data.isSuccess = false;
        data.message = "Error in SlotWhatsHot find";
        cb(null, data);
      } else if (swRes && swRes.length) {
        swRes = JSON.parse(JSON.stringify(swRes));

        for (let i = 0; i < swRes.length; i++) {

          let customerInterestWhatshotsArr = (swRes[i].dashLine) ? swRes[i].dashLine.customerInterestWhatshots : [];


          if (customerInterestWhatshotsArr.length) {
            let dashLineObj = swRes[i].dashLine,
              freebie = dashLineObj.giveaways || "",
              promoCode = dashLineObj.promoCode,
              promoMessage = dashLineObj.promoMessage,
              slotWhatsHotId = swRes[i].id,
              businessId = swRes[i].ownerId,
              businessName = swRes[i].business.businessName,
              emailBuss = swRes[i].business.email;

            SlotWhatsHot.destroyById(slotWhatsHotId);


            let selectedCustomer = pickRandom(customerInterestWhatshotsArr, { count: 1 });
            selectedCustomer = selectedCustomer[0];
            let customerInterestWhatshotsId = selectedCustomer.id || "";

            let custObj = selectedCustomer.customer,
              custId = custObj.id;

            let token_id = custObj.deviceId;
            let customerName = custObj.firstName;
            //             let changedDate = new Date(startTime.getTime() - (24 * 60 * 60 * 1000));

            let whatshotWinnerObj = {
              "freebie": freebie,
              "date": presentDate,
              "customerId": custObj.id,
              "ownerId": businessId
            };


            let sendWhatshotWinnersInfoToAdminObj = {
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


            Business.sendWhatshotWinnersInfoToAdmin(sendWhatshotWinnersInfoToAdminObj, function (WinnerNotifToAdmin) {
            });

            WhatshotWinner.createWhatshotWinner(whatshotWinnerObj, function (WinnerResp) {
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
              "event":"WhatsHotGiveaway",
              "customerInterestId": customerInterestWhatshotsId,
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
             
                WhatshotNotification.create(notificationObj);


                //Extra Push Notification for notification count code start
                let whatsHotPushNotification = {
                  "image": null,
                  "title": 'You are a winner!',
                  "message": messageData,
                  "body": messageData,
                  "priority": "high",
                  "type": "silent",
                  "click_action": ".activity.WinnerHolidayActivity",
                  "eventData": {"event":"WhatsHotGiveaway","customerInterestId": customerInterestWhatshotsId}
                };

                fcm.send({
                  to: token_id,
                  priority: "high",
                  time_to_live: 600000,
                  data: whatsHotPushNotification
                }, function (error5, response5) {
                  if (error5) {
                  } else {
                  }
                });
                // Reward.create();
              }
            });
          } else {
            console.log("No Interested customers found for Whatshot...");
          }
        }
        data.isSuccess = true;
        data.message = "whatshotSlotCheck callback";
        cb(null, data);

      } else {
        data.isSuccess = false;
        data.message = "No business Found in Whats-hot slots";
        cb(null, data);
      }
    });

  };

  //menuHeaderRemove
  Dashline.remoteMethod('menuHeaderRemove', {
    http: { path: '/menuHeaderRemove', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Remove dashLine data"
  });

  Dashline.remoteMethod('getPremiumCustomerDetails', {
    http: { path: '/getPremiumCustomerDetails', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "returns Customer details for premiumId..."
  });

  Dashline.remoteMethod('whatshotInterestandNotInterestfromMobile', {
    http: { path: '/whatshotInterestandNotInterestfromMobile', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Whatshot interest and Not Interest from mobile..."
  });

  Dashline.remoteMethod('getPremiumDetails', {
    http: { path: '/getPremiumDetails', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "returns premium details for given id..."
  });

  // Dashline.remoteMethod('addWhatshotInterestedCountAndSendNotification', {
  //   http: { path: '/addWhatshotInterestedCountAndSendNotification', verb: 'post' },
  //   accepts: { arg: 'details', type: 'object' },
  //   returns: { arg: 'data', type: 'object' },
  //   description: "add Interested Count of Dashline and send notification to customer."
  // });

  // Dashline.remoteMethod('addWhatshotInterestedCountAndSendNotification1', {
  //   http: { path: '/addWhatshotInterestedCountAndSendNotification1', verb: 'post' },
  //   accepts: { arg: 'details', type: 'object' },
  //   returns: { arg: 'data', type: 'object' },
  //   description: "add Interested Count of Dashline and send notification to customer."
  // });

  // Dashline.remoteMethod('addWhatshotNotInterestedCount', {
  //   http: { path: '/addWhatshotNotInterestedCount', verb: 'post' },
  //   accepts: { arg: 'details', type: 'object' },
  //   returns: { arg: 'data', type: 'object' },
  //   description: "add Not Interested Count of Dashline and add customerId."
  // });

  Dashline.remoteMethod('whatshotSlotCheck', {
    http: { path: '/whatshotSlotCheck', verb: 'post' },
    returns: { arg: 'data', type: 'object' },
    description: "whatshotSlotCheck for all business."
  });
};
