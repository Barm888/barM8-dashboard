'use strict';
let app = require('../../server/server'),
  unique = require('array-unique').immutable,
  schedule = require('node-schedule'),
  cron = require('node-cron');

const FCM = require('fcm-push'),
  serverKey = 'AAAA-4BeD_8:APA91bEyi_SURDeuKRLqoDDWsde4wDNFP5TIFCDD8Je2fQBHr_21fpj8zmzZ0pjGW_mT1PWKYZB2QNgMdOJ4p6dhsjEVk-aQUJHV4vgL6VpJEDI4HCxPOhMwVl0qBz-47OGkzyOopaEe',
  fcm = new FCM(serverKey);

module.exports = function (Bulknotification) {

 

  Bulknotification.bulkNotificationCron = function (details, cb) {
    let data = {},
      date = new Date(details.date),
      // date = new Date(),
      details1 = details.data1,
      bulkNotificationId = details.bulkNotificationId;
    // date = new Date(date.getTime() + (2 * 60000));
    if (date && details1 && bulkNotificationId) {
      console.log(date.toString());
      console.log(bulkNotificationId);
      let j = schedule.scheduleJob(bulkNotificationId.toString(), date, function () {
        console.log(details1);
        Bulknotification.sendNotificationToAllLikedCustomersInBusiness(details1, function (e, notResp) {
          console.log(notResp);
        });

      });
      data.isSuccess = true;
      data.message = "Triggered Schedule on: " + date.toString();
      cb(null, data);
      // later on
      // var my_job = schedule.scheduledJobs[unique_name];
      // my_job.cancel();
    } else {
      data.isSuccess = false;
      data.message = "date, bulkNotificationId or notification details Missing";
      cb(null, data);
    }
  };

  Bulknotification.removeBulkNotificationCron = function (details, cb) {
    let data = {};

    if (details.cronUniqueId) {
      //Bulk Notification delete Function
      Bulknotification.deleteById(details.cronUniqueId, function (err, res) {
        if (res) {
          console.log("Done");
          data.isSuccess = true;
          data.message = "Delete Bulknotification success";
          cb(null, data);


        } else {
          if (err) {
            data.isSuccess = false;
            data.message = "BulkNotification delete Error";
            cb(null, data);
          } else {
            data.isSuccess = false;
            data.message = "BulkNotification delete Api gone wrong";
            cb(null, data);
          }
        }
      });

    } else {
      data.isSuccess = false;
      data.message = "cronUniqueId is missing";
      cb(null, data);
    }
  };

  Bulknotification.sendNotificationToAllLikedCustomersInBusiness = function (details, cb) {
    let data = {};
    const Business = app.models.Business,
      Customer = app.models.Customer,
      BulkPushNotification = app.models.BulkPushNotification;

    let businessId = details.businessId,
      notificationDetails = details.notificationDetails;
    if (businessId && notificationDetails) {
      Business.findOne({ "where": { "id": businessId }, "fields": ["id", "businessName", "likedCustArray"] }, function (bussErr, bussRes) {
        console.log(JSON.stringify(bussRes));
        console.log(bussRes.id, businessId);
        if (bussErr) {
          console.log(bussErr);
          data.isSuccess = false;
          data.message = "Error in Business findOne";
          data.errorMessage = bussErr.error;
          cb(null, data);
        } else if (bussRes && (bussRes.id).toString() === (businessId).toString()) {
          let customerIdArray = bussRes.likedCustArray || [],
            businessName = bussRes.businessName;

          console.log("Before Unique: " + JSON.stringify(customerIdArray));
          /* Using  "array-unique" NPM we can remove duplicates in Array*/
          customerIdArray = unique(customerIdArray);
          console.log("After Unique: " + JSON.stringify(customerIdArray));

          if (customerIdArray.length > 0) {
            for (let i = 0; i < customerIdArray.length; i++) {
              let custId = customerIdArray[i] || "";
              Customer.findOne({ "where": { "id": custId }, "fields": ["id", "firstName", "lastName", "deviceId"] }, function (custErr, custRes) {
                if (custErr) {
                  console.log("customer findOne Error" + custId);
                  console.log(custErr);
                } else if (custRes && (custRes.id).toString() === (custId).toString()) {
                  let token_id = custRes.deviceId || "bfbfdbdfb",
                    messageData = `Notification from ${businessName}, ${notificationDetails.message}`,
                    messageData1 = `Notification from ${businessName}, ${notificationDetails.message}. Use Promo code ${notificationDetails.promoCode} to use.`,
                    customerName = custRes.firstName + " " + custRes.lastName,
                    customId = custId,
                    notificationDate = new Date(notificationDetails.date),
                    bulkNotificationId = notificationDetails.bulkNotificationId;


                  //code for sending Mail to Admin
                  let sendBulkNotificationInfoToAdminObj = {
                    "customerDetails": {
                      "firstName": custRes.firstName,
                      "lastName": custRes.lastName
                    },
                    "businessDetails": {
                      "businessName": businessName
                    },
                    "promoMessage": notificationDetails.message,
                    "promoCode": notificationDetails.promoCode,
                    "date": notificationDate
                  };

                  Business.sendBulkNotificationInfoToAdmin(sendBulkNotificationInfoToAdminObj, function (BulkNotifToAdmin) {
                    console.log(BulkNotifToAdmin);
                  });

                  let data1 = {
                    "image": null,
                    "title": notificationDetails.title,
                    "message": messageData,
                    "body": messageData,
                    "type": "bulkNotification",
                    "priority": "high",
                    "content_available": true
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
                    console.log("bulkNotificationId: " + bulkNotificationId);
                    Bulknotification.destroyById(bulkNotificationId);

                    if (error) {
                      // console.log(message);
                      // alert(error);
                      // console.log(error.data);
                      console.log("Something has gone wrong!Please check Server key and credentials token..... ");
                      console.log("Customer Name failed: " + customerName);
                    } else {

                      let notificationObj = {
                        time: notificationDate,
                        expiryDate: notificationDate,
                        message: messageData1,
                        status: "active",
                        customerId: customId
                      };
                      BulkPushNotification.create(notificationObj);

                      console.log("Successfully sent with response: ", response);
                      console.log("Customer Name success: " + customerName);
                      // Reward.create();
                    }
                  });
                } else {
                  console.log("customerId not found " + custId);
                }
              })
            }
            data.isSuccess = true;
            data.message = "Notification sended to All Customers"
            cb(null, data);
          } else {
            data.isSuccess = false;
            data.message = "businessId have no liked customers " + businessId;
            cb(null, data);
          }
        } else {
          data.isSuccess = false;
          data.message = "businessId not found " + businessId;
          cb(null, data);
        }
      })
    } else {
      data.isSuccess = false;
      data.message = "Missing businessId or notification details";
      cb(null, data);
    }
  };

  Bulknotification.createandupdate = (details, cb) => {
    let data = {};
    if (details) {
      if (details.notificationData) {
        details.notificationData.forEach(async (val, key) => {
          
          await Bulknotification.create({
            date: new Date(Date.UTC(val.year, (val.month - 1), val.date, val._24notificationTime.split(':')[0], val._24notificationTime.split(':')[1])).toJSON(),
            time: val.notificationTime,
            _24time: val._24notificationTime,
            dateUTC: val.dateUtc,
            year: val.year,
            month: val.month,
            title: val.title,
            hour: val._24notificationTime.split(':')[0],
            minute: val._24notificationTime.split(':')[1],
            promoCode: val.promoCode,
            promoMessage: val.promoMessage,
            ownerId: val.businessId,
            singleDate: val.date
          }, function (err, res) {
            if (res) {
              //Scheduler part Start
              // let presentDate2 = new Date(res.dateUTC),
              //   message1 = res.promoMessage || "Default message for promoMessage",
              //   message3 = message1;
              // let detailsObj = {
              //   "date": presentDate2,
              //   "bulkNotificationId": res.id,
              //   "data1": {
              //     "businessId": res.ownerId,
              //     "notificationDetails": {
              //       "message": message3,
              //       "promoCode": res.promoCode,
              //       "date": presentDate2,
              //       "bulkNotificationId": res.id
              //     }
              //   }
              // };

              // Bulknotification.bulkNotificationCron(detailsObj, function(e, resCron) {
              //   console.log(resCron);
              // });
              //Scheduler part End


              if ((key + 1) == details.notificationData.length) {
                data.isSuccess = true;
                data.mesage = "Created has been successfully."
                cb(null, data);
              }
            } else {
              if ((key + 1) == details.notificationData.length) {
                data.isSuccess = false;
                data.mesage = "Not Created. Please try again!"
                cb(null, data);
              }
            }
          });
        });

      } else {
        data.isSuccess = false;
        data.mesage = "Not Created.Please try again."
        cb(null, data);
      }
    } else {
      data.isSuccess = false;
      data.mesage = "Not Created.Please try again."
      cb(null, data);
    }
  };

  Bulknotification.getMonthData = (details, cb) => {
    let data = {};
    if (details) {
      //var firstDay = new Date(parseInt(details.year), parseInt(details.month) - 1, 2);
      //var lastDay = new Date(parseInt(details.year), parseInt(details.month), 1);
      if (details.businessId != null && details.businessId != undefined && details.businessId != "") {
        Bulknotification.find({
          where: { year: details.year, month: details.month, ownerId: details.businessId },
          fields: { id: true, date: true }
        }, function (err, res) {
          data.isSuccess = true;
          data.result = res;
          cb(null, data);
        });
      } else {
        data.isSuccess = false;
        data.mesage = "Please try again!"
        cb(null, data);
      }

    } else {
      data.isSuccess = false;
      data.mesage = "Please try again!"
      cb(null, data);
    }
  };

  Bulknotification.getDateData = (details, cb) => {
    let data = {};
    if (details) {
      var date = `${details.date.year}-${("0" + details.date.month).slice(-2)}-${("0" + details.date.dates[0]).slice(-2)}`;
      Bulknotification.find({
        where: {
          singleDate: details.date.dates[0],
          month: details.date.month,
          year: details.date.year,
          ownerId: details.businessId
        }
      }, function (err, res) {
        if (err) {
          data.isSuccess = false;
          data.mesage = "Please try again!"
          cb(null, data);
        } else {
          if (res) {
            data.isSuccess = true;
            data.result = res;
            cb(null, data);
          }
        }
      });
    } else {
      data.isSuccess = false;
      data.mesage = "Please try again!"
      cb(null, data);
    }
  };

  Bulknotification.startBulknotificationCron = function (cb) {
    let data = {};
    const Business = app.models.Business;
    const Customer = app.models.Customer;
    let BulkNotification = app.models.BulkNotification;
    let InstantPrizeWinner = app.models.InstantPrizeWinner;
    let InstantPrizeNotification = app.models.InstantPrizeNotification;


    let j = cron.schedule('0 */10 * * * *', function () {
      let presentDate1 = new Date();
      let presentDate = new Date(presentDate1);
      // presentDate.setFullYear(1111);
      // presentDate.setDate(11);
      // presentDate.setMonth(10);
      // presentDate = new Date(presentDate);

      console.log("cron Triggered");


      BulkNotification.find({
        "where":
          {
            and: [{ "dateUTC": { "lte": presentDate } }]
          }


      }, function (err2, res2) {
        res2 = JSON.parse(JSON.stringify(res2));

        console.log(res2);

        if (err2) {
          console.log(err2);
        } else if (res2.length > 0) {

          for (let i = 0; i < res2.length; i++) {
            // console.log(res2[i].slots);                
            // console.log(res2[i].slots[0].id);
            let BulkNotificationId = res2[i].id;
            // let instantPrizeStartDate = res2[i].startTime;

            let dataObj = {
              "businessId": res2[i].ownerId,
              "notificationDetails": {
                "message": res2[i].promoMessage,
                "promoCode": res2[i].promoCode,
                "date": new Date(res2[i].dateUTC),
                "bulkNotificationId": BulkNotificationId,
                "title": res2[i].title
              }
            };

            console.log(dataObj);


            Bulknotification.sendNotificationToAllLikedCustomersInBusiness(dataObj, function (e, notResp) {
              console.log(notResp);
            });
          }
        } else {
          console.log("No Bulknotifications Found..");
        }
      })
    })
    data.isSuccess = true;
    data.message = "Bulk Notification trigger started for 10 minutes once";
    cb(data);
  }

  Bulknotification.remoteMethod('sendNotificationToAllLikedCustomersInBusiness', {
    http: { path: '/sendNotificationToAllLikedCustomersInBusiness', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "sends Notification to all Liked Customers in given BusinessId"
  });
  Bulknotification.remoteMethod('bulkNotificationCron', {
    http: { path: '/bulkNotificationCron', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Bulk Notification cron to send notifications to all Liked Customers in given BusinessId"
  });
  Bulknotification.remoteMethod('startBulknotificationCron', {
    http: { path: '/startBulknotificationCron', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Bulk Notification cron to send notifications to all Liked Customers in given BusinessId"
  });
  Bulknotification.remoteMethod('removeBulkNotificationCron', {
    http: { path: '/removeBulkNotificationCron', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Remove Bulk Notification cron to send notifications to all Liked Customers in given BusinessId"
  });
  Bulknotification.remoteMethod('createandupdate', {
    http: { path: '/createandupdate', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Notification create and update.."
  });
  Bulknotification.remoteMethod('getMonthData', {
    http: { path: '/getMonthData', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "get for month data..."
  });
  Bulknotification.remoteMethod('getDateData', {
    http: { path: '/getDateData', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "get particular date data"
  });
};
