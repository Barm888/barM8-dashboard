'use strict';
const cron = require('node-cron'),
  pickRandom = require('pick-random'),
  app = require('../../server/server'),
  U = require('underscore'),
  FCM = require('fcm-push'),
  serverKey = 'AAAA-4BeD_8:APA91bEyi_SURDeuKRLqoDDWsde4wDNFP5TIFCDD8Je2fQBHr_21fpj8zmzZ0pjGW_mT1PWKYZB2QNgMdOJ4p6dhsjEVk-aQUJHV4vgL6VpJEDI4HCxPOhMwVl0qBz-47OGkzyOopaEe',
  fcm = new FCM(serverKey),
  moment = require('moment-timezone');

module.exports = function (Instantprizes) {
  Instantprizes.startInstantprizesNotification = function (cb) {
    let data = {};
    const Business = app.models.Business,
      Customer = app.models.Customer,
      slot = app.models.slot,
      CurrentVisit = app.models.CurrentVisit,
      DashLine = app.models.DashLine,
      InstantPrizeWinner = app.models.InstantPrizeWinner,
      InstantPrizeNotification = app.models.InstantPrizeNotification,
      PromoGiveaway = app.models.PromoGiveaway,
      LoyaltyRewards = app.models.LoyaltyRewards;


    let j = cron.schedule('0 */15 * * * *', function () {
      let presentDate1 = new Date();
      let presentDate = new Date(presentDate1);

      // DashLine.whatshotSlotCheck(function (dummy, whatshotSlotCheckRes) {
      // });

      //For Promo Slots check
      PromoGiveaway.promoSlotCheck(function (dummy1, promoSlotCheckRes) {
      });

      //For Loyalty Reward Slots check
      LoyaltyRewards.loyaltySlotCheck(function (dummy1, loyaltySlotCheckRes) {
      });

      Instantprizes.find({
        "include": ["business",
          {
            "relation": "slots",
            "scope": {
              "where": { and: [{ "date": { "lte": presentDate } }] }
            }
          }]

      }, function (err2, res2) {
        if(res2)
        res2 = JSON.parse(JSON.stringify(res2));

        if (err2) {
          console.log(err2);
        } else if (res2.length > 0) {

          for (let i = 0; i < res2.length; i++) {
            if (!res2[i].slots.length) {
              res2.splice(i, 1);
              i--;
            }
          }

          if (res2.length) {
            let res2Length = res2.length;
            for (let i = 0; i < res2Length; i++) {
              let slotId = res2[i].slots[0].id,
                isFirstSlot = res2[i].slots[0].isFirstSlot,
                promoCode = res2[i].promoCode || "PROMOIN",
                promoMessage = res2[i].promoMessage || "Congratulations! You Won a Prize in Loyalty Rewards Draw",
                customerTimeZone = res2[i].timeZone || "Australia/Sydney",
                instantStartTime = res2[i].startTime,
                instantEndTime = res2[i].endTime,
                ownerId = res2[i].ownerId,
                instantPId = res2[i].id;

              // let instantPrizeStartDate = res2[i].startTime;

              slot.destroyById(slotId);

              let CurrentVisitOwnerId = ownerId || "dfdsfdsf";

              if (isFirstSlot) {

                let deleteCustomersAndNotifyToRescanByOwnerIdObj = {
                  "ownerId": CurrentVisitOwnerId,
                  "startTime": instantStartTime,
                  "endTime": instantEndTime
                };
                //Delete Customers And Notify To Rescan By OwnerId part start
                CurrentVisit.deleteCustomersAndNotifyToRescanByOwnerId(deleteCustomersAndNotifyToRescanByOwnerIdObj, function (d, delRes) {
                  console.log(delRes);
                })

              } else {
                CurrentVisit.find({ "where": { "isWinner": "false", "ownerId": ownerId } }, async function (err, res) {

                  if (err) {
                    console.log(err);
                  } else if (res.length > 0) {
                    res = JSON.parse(JSON.stringify(res));
                    let pre = new Date();
                    let preDate = new Date(pre);

                    res = await U.uniq(res, function (p) { return p.customerId; });
                    let selectedVisit = pickRandom(res, { count: 1 });
                    selectedVisit = selectedVisit[0];
                    let startTime = new Date(selectedVisit.startTime),
                      customerId = selectedVisit.customerId || "dferge";

                    Customer.findOne({ "where": { "id": customerId } }, function (err1, res1) {
                      if (err1) {
                        console.log(err1);

                      } else if (res1) {
                        let deviceId = res1.deviceId;
                        let token_id = deviceId;
                        let customerName = res1.firstName;
                        let changedDate = new Date(startTime.getTime() - (24 * 60 * 60 * 1000));

                        let instantPrizeWinnerObj = {
                          "freebie": res2[i].freebie,
                          "date": presentDate,
                          "customerId": customerId,
                          "ownerId": ownerId,
                          "instantPrizeId": instantPId 
                        };


                        let sendInstantPrizeWinnersInfoToAdminObj = {
                          "customerDetails": {
                            "firstName": res1.firstName,
                            "lastName": res1.lastName,
                            "mobile": res1.mobile,
                            "email": res1.email,
                            "dob": res1.dob,
                            "postCode": res1.postCode,
                            "addressLine1": res1.addressLine1
                          },
                          "businessDetails": {
                            "businessName": res2[i].business.businessName,
                            "email": res2[i].business.email
                          },
                          "freebie": res2[i].freebie,
                          "date": presentDate
                        };

                        Business.sendInstantPrizeWinnersInfoToAdmin(sendInstantPrizeWinnersInfoToAdminObj, function (WinnerNotifToAdmin) {
                        
                        });

                        InstantPrizeWinner.createInstantPrizeWinner(instantPrizeWinnerObj, function (WinnerResp) {
                         
                        });

                        let a = [];
                        a.push(customerName);
                        let messageData = `Congratulations! You won a '${res2[i].freebie}' in Loyalty Rewards draw.`;
                        let data1 = {
                          "image": null,
                          "title": 'You are a winner!',
                          "message": messageData,
                          "body": messageData,
                          "priority": "high",
                          "type": " ",
                          "content_available": true,
                          "click_action": ".activity.WinnerHolidayActivity",
                          "event": "InstantPrize",
                          "customerInterestId": customerId,
                          "promoCode": promoCode,
                          "promoMessage": messageData,
                          "businessId": ownerId,
                          "instantPrizeId": instantPId
                        };

                        let message = {
                          to: token_id,
                          priority: "high",
                          time_to_live: 600000,
                          notification: data1,
                          data: data1
                        };

                        // //Keep Notifying Customer to Scan again for Business start    
                        //      let notifyScannedCustomersForRescanObj = {
                        //                            "ownerId": res2[i].ownerId,
                        //                            "customerId": customerId,
                        //                            "timeZone": customerTimeZone,
                        //                            "momentdate": new Date(),
                        //                            "dateByTimeZone": moment.tz(momentdate, customerTimeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z",
                        //                            "yearByTimeZone": moment.tz(momentdate, customerTimeZone).year(),
                        //                            "monthByTimeZone": moment.tz(momentdate, customerTimeZone).month(),
                        //                            "hourByTimeZone": moment.tz(momentdate, customerTimeZone).hour(),
                        //                            "dateByTimeZone": moment.tz(momentdate, customerTimeZone).date();  
                        //                          };


                        //      console.log("notifyScannedCustomersForRescanObj: "+JSON.stringify(notifyScannedCustomersForRescanObj));

                        //      Instantprizes.notifyScannedCustomersForRescan(notifyScannedCustomersForRescanObj, function(d, notifyScannedCustomersForRescanRes){
                        //         console.log(notifyScannedCustomersForRescanRes);
                        //      });

                        // //Keep Notifying Customer to Scan again for Business end  


                        fcm.send(message, function (error, response) {

                          if (error) {
                            // console.log(message);
                            // alert(error);
                            // console.log(error.data);
                            console.log("Something has gone wrong!Please check Server key and credentials token..... ");
                            console.log("Customer Selected in Random : " + customerName);
                          } else {
                            //                             let notificationObj = {
                            //                               time: presentDate,
                            //                               expiryDate: presentDate,
                            //                               message: messageData,
                            //                               status: "active",
                            //                               customerId: customerId
                            //                             };
                            //                             InstantPrizeNotification.create(notificationObj);


                            // //Extra Push Notification for notification count code start
                            //                             let instantPrizePushNotification = {
                            //                          "image": null,
                            //                           "title": 'You are a winner!',
                            //                           "message": messageData,
                            //                           "body": messageData,
                            //                           "priority": "high",
                            //                           "type": "silent",
                            //                           "eventData": {"event": "InstantPrize", "customerInterestId": "waiting"}  
                            //                         };

                            //                         fcm.send({
                            //                           to: token_id,
                            //                           priority: "high",
                            //                           time_to_live: 600000,
                            //                           data: instantPrizePushNotification 
                            //                         }, function (error5, response5) {
                            //                           if (error5) {
                            //                             console.log(error5);
                            //                             console.log("---Instant prize push Notification not sent " + error5);
                            //                           } else {
                            //                             console.log(response5);
                            //                             console.log("---Instant prize push Notification has been sent " + response5);
                            //                           }
                            //                         });

                            // //Extra Push Notification for notification count code end
                            let deleteCustomersAndNotifyToRescanByOwnerIdObj = {
                              "ownerId": CurrentVisitOwnerId,
                              "customerId": customerId,
                              "startTime": instantStartTime,
                              "endTime": instantEndTime
                            };
                            //Delete Customers And Notify To Rescan By OwnerId part start
                            CurrentVisit.deleteCustomersAndNotifyToRescanByOwnerId(deleteCustomersAndNotifyToRescanByOwnerIdObj, function (d, delRes) {
                              console.log(delRes);
                            })
                            //Delete Customers And Notify To Rescan By OwnerId part end

                            console.log("Successfully sent with response: ", response);
                            console.log("Customer Selected in Random : " + customerName);
                            // Reward.create();
                          }
                        });

                      } else {

                        console.log("CustomerId not found...");

                      }
                    })

                  } else {
                    console.log("Sorry Still no Scans....");
                  }
                });
              }
            }
          } else {
            console.log("No Businesses Found");
          }

        } else {
          console.log("No Businessess Found..");
        }
      })
    })
    data.isSuccess = true;
    data.message = "Notifications for InstantPrizes trigger started for 15 minutes once";
    cb(data);
  }

  Instantprizes.removeInstantPrizeByDashLineId = function (dashLineId) {
    const Slot = app.models.slot;
    Instantprizes.findOne({ "where": { "dashLineId": dashLineId } },
      function (errInstantprizesFindOne, resInstantprizesFindOne) {
        if (errInstantprizesFindOne) {
          console.log(errInstantprizesFindOne);
        } else if (resInstantprizesFindOne && resInstantprizesFindOne.dashLineId == dashLineId) {
          let instantPrizeId = resInstantprizesFindOne.id;
          Slot.destroyAll({ "instantPrizesId": instantPrizeId }, function (errSlotDestroyAll, infoSlotDestroyAll) {
            if (errSlotDestroyAll) {
              console.log("Error in Slot destroyAll..");
              console.log(errSlotDestroyAll);
            } else {
              let deleteCount = infoSlotDestroyAll.count;
              console.log(deleteCount + " Slots Removed");
            }
          });
          Instantprizes.deleteById(instantPrizeId);

        } else {
          console.log("No Instantprizes Instance found by dashLineId ");
        }
      });
  }

  Instantprizes.remoteMethod('startInstantprizesNotification', {
    http: { path: '/startInstantprizesNotification', verb: 'post' },
    returns: { arg: 'data', type: 'object' }
  });
  Instantprizes.remoteMethod('removeInstantPrizeByDashLineId', {
    http: { path: '/removeInstantPrizeByDashLineId', verb: 'post' },
    accepts: { arg: 'dashLineId', type: 'string' },
    returns: { arg: 'data', type: 'object' },
    description: "Remove InstantPrice by dashLineId matched"
  });
};
