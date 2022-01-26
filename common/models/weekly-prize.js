
const cron = require('node-cron');
const pickRandom = require('pick-random');
const app = require('../../server/server');
const FCM = require('fcm-push');
const serverKey = 'AAAA-4BeD_8:APA91bEyi_SURDeuKRLqoDDWsde4wDNFP5TIFCDD8Je2fQBHr_21fpj8zmzZ0pjGW_mT1PWKYZB2QNgMdOJ4p6dhsjEVk-aQUJHV4vgL6VpJEDI4HCxPOhMwVl0qBz-47OGkzyOopaEe';
const fcm = new FCM(serverKey);


module.exports = function (Weeklyprize) {

  function sendWeeklyPrizeNotification(date, customerId, prize) {
    let Customer = app.models.Customer;
    let WeeklyPrizeNotification = app.models.WeeklyPrizeNotification;
    let weeklyPrizeWinner = app.models.weeklyPrizeWinner;
    let Business =  app.models.Business;
    let data = new Date(date);
    let presentDate3 = new Date();
    let presentDate4 = new Date();
    presentDate4.setDate(presentDate4.getDate() + 21);
    Customer.findOne({ "where": { "id": customerId } }, function (err1, res1) {

      if (err1) {

      } else if (res1 && (JSON.stringify(res1.id) == JSON.stringify(customerId))) {
        let deviceId = res1.deviceId;
        let token_id = deviceId;
        let customerName = res1.firstName;

        let weeklyPrizeWinnerObj = {
          "freebie": prize,
          "date": date,
          "customerId": customerId
        };

        let sendWeeklyPrizeWinnersInfoToAdminObj = {
          "customerDetails": {
            "firstName": res1.firstName,
            "lastName": res1.lastName,
            "mobile": res1.mobile,
            "email": res1.email,
            "dob": res1.dob,
            "postCode": res1.postCode,
            "addressLine1": res1.addressLine1
          },
          "freebie": prize,
          "date": date
        };

        Business.sendWeeklyPrizeWinnersInfoToAdmin(sendWeeklyPrizeWinnersInfoToAdminObj, function (WinnerNotifToAdmin) {
        });



        weeklyPrizeWinner.createWeeklyprizewinner(weeklyPrizeWinnerObj, function (winnerResponse) {
        });

        let a = [];
        a.push(customerName);
        let messageData = `Congratulations ${customerName}, You won ${prize} in Weekly draw prizes.`;
        let data1 = {
          "image": null,
          "title": 'You are a winner!',
          "message": messageData,
          "body": messageData,
          "priority": "high",
          "type": " ",
          "content_available": true
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
              time: presentDate3,
              expiryDate: presentDate4,
              message: messageData,
              status: "active",
              customerId: customerId
            };
            WeeklyPrizeNotification.create(notificationObj);


            //Extra Push Notification for notification count code start
            let weeklyPrizePushNotification = {
              "image": null,
              "title": 'You are a winner!',
              "message": messageData,
              "body": messageData,
              "priority": "high",
              "type": "silent",
              "eventData": { "event": "WeeklyPrize", "customerInterestId": "waiting" }
            };

            fcm.send({
              to: token_id,
              priority: "high",
              time_to_live: 0,
              data: weeklyPrizePushNotification
            }, function (error5, response5) {
              if (error5) {
              } else {
              }
            });
          }
        });
      } else {
      }
    });
  };



  Weeklyprize.startWeeklyprizeNotification = function (cb) {
    let data = {};
    // let Business = app.models.Business;
    let Loyalty = app.models.Loyalty;


    let j1 = cron.schedule('10 18 * * Sun', function () {
      let presentDate1 = new Date();
      let presentDate = new Date(presentDate1);

      let customerObj = {};

      Loyalty.find({
        "fields": ["customerId"],
        "where": { "level": "Bronze" }
      }, function (err1, res1) {
        if (err1) {

        } else {
          // console.log(res1);
          if (res1.length) {
            let selectedCustomer1 = pickRandom(res1, { count: 1 });
            selectedCustomer1 = selectedCustomer1[0];
            customerObj.Bronze = selectedCustomer1.customerId;
          }


          Loyalty.find({
            "fields": ["customerId"],
            "where": { "level": "Silver" }
          }, function (err2, res2) {
            if (err2) {
            } else {

              if (res2.length) {
                let selectedCustomer2 = pickRandom(res2, { count: 1 });
                selectedCustomer2 = selectedCustomer2[0];
                customerObj.Silver = selectedCustomer2.customerId;

              }

              Loyalty.find({
                "fields": ["customerId"],
                "where": { "level": "Gold" }
              }, function (err3, res3) {
                if (err3) {

                } else {

                  if (res3.length) {
                    let selectedCustomer3 = pickRandom(res3, { count: 1 });
                    selectedCustomer3 = selectedCustomer3[0];
                    customerObj.Gold = selectedCustomer3.customerId;

                  }

                  Loyalty.find({
                    "fields": ["customerId"],
                    "where": { "level": "Platinum" }
                  }, function (err4, res4) {
                    if (err4) {
                      console.log(err4, "err4");
                    } else {
                      // console.log(res4);
                      if (res4.length) {
                        let selectedCustomer4 = pickRandom(res4, { count: 1 });
                        selectedCustomer4 = selectedCustomer4[0];
                        customerObj.Platinum = selectedCustomer4.customerId;

                      }

                      Loyalty.find({
                        "fields": ["customerId"],
                        "where": { "level": "VIP" }
                      }, function (err5, res5) {
                        if (err5) {
                        } else {
                          if (res5.length) {
                            let selectedCustomer5 = pickRandom(res5, { count: 1 });
                            selectedCustomer5 = selectedCustomer5[0];
                            customerObj.VIP = selectedCustomer5.customerId;

                          }
                          Weeklyprize.findOne({}, function (err6, res6) {
                            // console.log(res6);
                            if (err6) {
                            } else {
                              if (res6) {
                                // console.log("hello6");
                                let levelObj = {
                                  Bronze: res6.bronze,
                                  Silver: res6.silver,
                                  Gold: res6.gold,
                                  Platinum: res6.platinum,
                                  VIP: res6.vip
                                };

                                let Customer = app.models.Customer;
                                let weeklyPrizeWinner = app.models.weeklyPrizeWinner;




                                for (let x in customerObj) {
                                  sendWeeklyPrizeNotification(presentDate, customerObj[x], levelObj[x]);
                                }


                              } else {

                              }
                            }
                          })

                        }



                      })

                    }


                  })

                }


              })

            }


          })

        }



      })
    })

    data.isSuccess = true;
    data.message = "Notifications for Weeklyprize trigger started for weekly once";
    cb(data);
  }

  Weeklyprize.loyaltyWinnerNotification = (cb) => {
    let data = {};
    let loyaltyNotificationCron = app.models.loyaltyNotificationCron;
    let loyaltyLine = app.models.LoyaltyLines;

    let loyaltyCron = cron.schedule('0 */30 * * * *', function () {

      let presentdate = new Date();
      let pdate = (presentdate).getDate()
        , pmonth = (presentdate).getMonth()
        , pyear = (presentdate).getFullYear()
        , pminutes = (presentdate).getMinutes()
        , phour = (presentdate).getHours()
        , psecond = (presentdate).getSeconds();

      loyaltyNotificationCron.find({ where: { year: pyear, month: pmonth, date: pdate, hour: phour, minute: pminutes, second: psecond } }, (loyaltyErr, loyaltyRes) => {

        if (loyaltyRes && loyaltyRes.length > 0) {
          let loyaltydate = new Date(loyaltyRes[0].dateTimeUtc)
            , ldate = loyaltydate.getDate()
            , lmonth = loyaltydate.getMonth()
            , lyear = loyaltydate.getFullYear()
            , lhour = loyaltydate.getHours()
            , lminutes = loyaltydate.getMinutes()
            , lsecond = loyaltydate.getSeconds()
            , category = loyaltyRes[0].category;

          if ((pdate == ldate) && (pmonth == lmonth) && (pyear == lyear) && (phour == lhour) && (pminutes == lminutes) && (0 == psecond)) {
            let level = (category == 'brone' ? "Bronze" : (category == 'silver' ? "Silver" : (category == 'gold' ? "Gold" : (category == 'platinum' ? "Platinum" : (category == 'vip' ? "VIP" : "Others")))));
            loyaltyLine.find({ where: { ownerId: loyaltyRes.businessId, level: level }, include: { relation: 'customer' } }, (loyaltyLineErr, loyaltyLineRes) => {
              if (loyaltyLineRes) {
                let points = 0, obj = {};
                for (var data of loyaltyLineRes) {
                  if (points < data.points) {
                    points = data.points;
                    obj = JSON.parse(JSON.stringify(data));
                  }
                }
                if (obj && obj.customer) {

                  let deviceId = obj.customer.deviceId;
                  //  let messageData = `Congratulations ${customerName}, You won ${prize} in Weekly draw prizes.`;
                  let messageData = `Congratulations ${obj.customer.firstName} ${obj.customer.firstName}, You won ${loyaltyRes[0].price}`;


                  // console.log(message);
                  fcm.send({
                    to: deviceId,
                    priority: "high",
                    time_to_live: 600000,
                    notification: data1,
                    data: {
                      "image": null,
                      "title": 'You are a winner!',
                      "message": messageData,
                      "body": messageData,
                      "priority": "high",
                      "type": " ",
                      "content_available": true
                    }
                  }, function (error, response12) {
                  });
                }
              }
            });
          }
        }
      });
    });
    loyaltyCron.start();
    data.isSuccess = true;
    data.message = "Notifications for Weeklyprize trigger started for weekly once";
    cb(data);
  };

  Weeklyprize.remoteMethod('loyaltyWinnerNotification', {
    http: { path: '/loyaltyWinnerNotification', verb: 'post' },
    returns: { arg: 'data', type: 'string' },
    description: "Triggers the cron for checking business is closed or open...."
  });



  Weeklyprize.remoteMethod('startWeeklyprizeNotification', {
    http: { path: '/startWeeklyprizeNotification', verb: 'post' },
    returns: { arg: 'data', type: 'object' }
  });
};





