'use strict';
let app = require('../../server/server');

module.exports = function (Whatshotnotification) {


  Whatshotnotification.getAllNotification1 = function (details, cb) {
    let data = {};
    let cid = details.customerId;
    let InstantPrizeNotification = app.models.InstantPrizeNotification;
    let WeeklyPrizeNotification = app.models.WeeklyPrizeNotification;

    if (cid) {

      Whatshotnotification.find({ "where": { "customerId": cid } }, function (err, res) {
        if (err) {
          data.isSuccess = false;
          data.errorMessage = err;
          data.message = "error in Whatshotnotification find";
          cb(null, data);
        } else {
          InstantPrizeNotification.find({ "where": { "customerId": cid } }, function (err1, res1) {
            if (err1) {
              data.isSuccess = false;
              data.errorMessage = err1;
              data.message = "error in InstantPrizeNotification find";
              cb(null, data);
            } else {

              WeeklyPrizeNotification.find({ "where": { "customerId": cid } }, function (err2, res2) {
                if (err2) {
                  data.isSuccess = false;
                  data.errorMessage = err2;
                  data.message = "error in WeeklyPrizeNotification find";
                  cb(null, data);
                } else {
                  let arr1 = res.concat(res1);
                  let arr = arr1.concat(res2);
                  data.isSuccess = true;
                  data.res = arr;
                  cb(null, data);
                }
              });

            }
          });
        }
      });
    } else {
      data.isSuccess = false;
      data.message = "Please Provide customerId...";
      cb(null, data);
    }
  }


  Whatshotnotification.getAllNotification = function (details, cb) {
    let data = {};
    let customerId = details.customerId;
    const InstantPrizeNotification = app.models.InstantPrizeNotification,
      WeeklyPrizeNotification = app.models.WeeklyPrizeNotification,
      InAppSpecialNotification = app.models.InAppSpecialNotification,
      BulkPushNotification = app.models.BulkPushNotification,
      InstantPrizeAdminNotification = app.models.InstantPrizeAdminNotification,
      Notification = app.models.Notification,
      PromoNotification = app.models.PromoNotification,
      CouponNotification = app.models.CouponNotification;

    if (customerId) {
      Whatshotnotification.find({ "where": { customerId } }, function (err, res) {
        if (err) {
          data.isSuccess = false;
          data.errorMessage = err;
          data.message = "error in Whatshotnotification find";
          cb(null, data);
        } else {
          // console.log("Whatshotnotification: " + res);
          InstantPrizeNotification.find({ "where": { customerId } }, function (err1, res1) {
            if (err1) {
              data.isSuccess = false;
              data.errorMessage = err1;
              data.message = "error in InstantPrizeNotification find";
              cb(null, data);
            } else {
              // console.log("InstantPrizeNotification: " + res1);
              WeeklyPrizeNotification.find({ "where": { customerId } }, function (err2, res2) {
                if (err2) {
                  data.isSuccess = false;
                  data.errorMessage = err2;
                  data.message = "error in WeeklyPrizeNotification find";
                  cb(null, data);
                } else {
                  // console.log("WeeklyPrizeNotification: " + res2);
                  InstantPrizeAdminNotification.find({ "where": { customerId } }, function (err3, res3) {
                    if (err3) {
                      data.isSuccess = false;
                      data.errorMessage = err3;
                      data.message = "error in InstantPrizeAdminNotification find";
                      cb(null, data);
                    } else {
                      // console.log("InstantPrizeAdminNotification: " + res3);
                      InAppSpecialNotification.find({ "where": { customerId } }, function (err4, res4) {
                        if (err4) {
                          data.isSuccess = false;
                          data.errorMessage = err4;
                          data.message = "error in InAppSpecialNotification find";
                          cb(null, data);
                        } else {
                          // console.log("InAppSpecialNotification: " + res4);
                          BulkPushNotification.find({ "where": { customerId } }, function (err5, res5) {
                            if (err5) {
                              data.isSuccess = false;
                              data.errorMessage = err5;
                              data.message = "error in BulkPushNotification find";
                              cb(null, data);
                            } else {
                              // console.log("BulkNotification: " + res5);
                              Notification.find({ "where": { customerId } }, function (err6, res6) {
                                if (err6) {
                                  data.isSuccess = false;
                                  data.errorMessage = err6;
                                  data.message = "error in Notification find";
                                  cb(null, data);
                                } else {
                                  // console.log("PromoNotification: " + res6);
                                  PromoNotification.find({ "where": { customerId } }, function (err7, res7) {
                                    if (err7) {
                                      data.isSuccess = false;
                                      data.errorMessage = err7;
                                      data.message = "error in PromoNotification find";
                                      cb(null, data);
                                    } else {
                                      // console.log("PromoNotification: " + res6);
                                      let arrFinal = res.concat(res1, res2, res3, res4, res5, res6, res7);
                                      CouponNotification.find({ "where": { customerId } }, (err8, res8) => {
                                        if (err8) {
                                          data.isSuccess = false;
                                          data.errorMessage = err8;
                                          data.message = "error in CouponNotification find";
                                          cb(null, data);
                                        } else {
                                          data.isSuccess = true;
                                          data.res = arrFinal;
                                          data.res1 = res8;
                                          cb(null, data);
                                        }
                                      });
                                    }
                                  });
                                }
                              });
                            }
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    } else {
      data.isSuccess = false;
      data.message = "Please Provide customerId...";
      cb(null, data);
    }
  }




  Whatshotnotification.remoteMethod('getAllNotification', {
    http: { path: '/getAllNotification', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get All Notifications of Customer"
  });

  Whatshotnotification.remoteMethod('getAllNotification1', {
    http: { path: '/getAllNotification1', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get All Notifications of Customer"
  });
};
