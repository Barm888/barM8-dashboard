'use strict';
let app = require('../../server/server');
const FCM = require('fcm-push');
const serverKey = 'AAAA-4BeD_8:APA91bEyi_SURDeuKRLqoDDWsde4wDNFP5TIFCDD8Je2fQBHr_21fpj8zmzZ0pjGW_mT1PWKYZB2QNgMdOJ4p6dhsjEVk-aQUJHV4vgL6VpJEDI4HCxPOhMwVl0qBz-47OGkzyOopaEe';
const fcm = new FCM(serverKey);

module.exports = function (Premium) {

  Premium.addInterestedCountAndSendNotification = function (details, cb) {
    let data = {};
    let pid = details.premiumId;
    let cid = details.customerId;
    let Customer = app.models.Customer;
    let WhatshotNotification = app.models.WhatshotNotification;

    //console.log(pid);
    if (pid && cid) {

      Premium.findOne({ "where": { "id": pid } }, function (err, res) {
        if (err) {
          data.isSuccess = false;
          data.errorMessage = err;
          data.message = "error in Premium findOne";
          //console.log("error in Customer findOne in line 91");
          cb(null, data);
        } else if (res && res.id == pid) {
          let interestedCount1 = res.interestedCount;
          let promo = res.promoCode;
          let custArray = res.interestedCustArray;

          if (custArray.length > 0) {
            let exists = 0;
            for (let i = 0; i < custArray.length; i++) {
              if (cid == custArray[i]) {
                exists++;
              }
              if ((i + 1) == custArray.length) {
                if (exists == 0) {
                  interestedCount1 = interestedCount1 + 1;
                  custArray.push(cid);
                  Customer.findOne({ "where": { "id": cid } }, function (custErr, custRes) {
                    if (custErr) {
                      data.isSuccess = false;
                      data.errorMessage = custErr;
                      cb(null, data);
                    } else if (custRes && custRes.id == cid) {
                      let token_id = custRes.deviceId;
                      let customerName = custRes.firstName;
                      let messageData = `Congratulations ${customerName}, Use PromoCode Sent to your notification List for Special Discounts in the Event...For you Only.`;
                      let messageData1 = `Use PromoCode ${promo}`;

                      let presentDate2 = new Date();
                      let notificationObj = {
                        time: presentDate2,
                        expiryDate: presentDate2,
                        message: messageData1,
                        status: "active",
                        customerId: cid
                      };
                      WhatshotNotification.create(notificationObj, function (notErr, notRes) {
                        if (notErr) {
                          data.isSuccess = false;
                          data.errorMessage = notErr;
                          console.log("error in Notification Create");
                          cb(null, data);
                        } else {
                          let notificationId = notRes.id;
                          let data1 = {
                            "image": null,
                            "title": 'PremiumNotification',
                            "message": messageData
                          };

                          let message = {
                            to: token_id,
                            priority: "high",
                            time_to_live: 2219100,
                            data: {
                              data: data1
                            }
                          };

                          fcm.send(message, function (error, response) {

                            if (error) {
                            } else {
                              // Reward.create();
                            }
                          });
                        }
                      });




                      Premium.updateAll({ "id": pid }, { "interestedCount": interestedCount1, "interestedCustArray": custArray }, function (err1, res1) {
                        if (err1) {
                          data.isSuccess = false;
                          data.errorMessage = err1;
                          cb(null, data);
                        } else if (res1.count > 0) {
                          data.isSuccess = true;
                          data.message = " Updated Successfully";
                          cb(null, data);
                        } else {
                          data.isSuccess = false;
                          data.message = "error in Premium UpdateAll";
                          cb(null, data);
                        }
                      });

                    } else {
                      data.isSuccess = false;
                      data.message = "CustomerId not Found";
                      cb(null, data);
                    }
                  });
                } else {
                  data.isSuccess = false;
                  data.message = "Already Liked...";
                  cb(null, data);
                }
                break;
              }
            }
          } else {
            interestedCount1 = interestedCount1 + 1;
            custArray.push(cid);
            Customer.findOne({ "where": { "id": cid } }, function (custErr, custRes) {
              if (custErr) {
                data.isSuccess = false;
                data.errorMessage = custErr;
                cb(null, data);
              } else if (custRes && custRes.id == cid) {
                let token_id = custRes.deviceId;
                let customerName = custRes.firstName;
                let messageData = `Congratulations ${customerName}, Use PromoCode Sent to your notification List for Special Discounts in the Event...For you Only.`;
                let messageData1 = `Use PromoCode ${promo}`;

                let presentDate2 = new Date();
                let notificationObj = {
                  time: presentDate2,
                  expiryDate: presentDate2,
                  message: messageData1,
                  status: "active",
                  customerId: cid
                };
                WhatshotNotification.create(notificationObj, function (notErr, notRes) {
                  if (notErr) {
                    data.isSuccess = false;
                    data.errorMessage = notErr;
                    cb(null, data);
                  } else {
                    let notificationId = notRes.id;
                    let data1 = {
                      "image": null,
                      "title": 'PremiumNotification',
                      "message": messageData
                    };

                    let message = {
                      to: token_id,
                      priority: "high",
                      time_to_live: 2219100,


                      data: {
                        data: data1
                      }

                    };

                    // console.log(message);
                    fcm.send(message, function (error, response) {

                      if (error) {
                      } else {
                      }
                    });
                  }
                });




                Premium.updateAll({ "id": pid }, { "interestedCount": interestedCount1, "interestedCustArray": custArray }, function (err1, res1) {
                  if (err1) {
                    data.isSuccess = false;
                    data.errorMessage = err1;
                    cb(null, data);
                  } else if (res1.count > 0) {
                    data.isSuccess = true;
                    data.message = " Updated Successfully";
                    cb(null, data);
                  } else {
                    data.isSuccess = false;
                    data.message = "error in Premium UpdateAll";
                    cb(null, data);
                  }
                });

              } else {
                data.isSuccess = false;
                data.message = "CustomerId not Found";
                cb(null, data);
              }
            });
          }





        } else {
          data.isSuccess = false;
          data.message = "Premium id not found...";
          cb(null, data);
        }
      });
    } else {
      data.isSuccess = false;
      data.message = "Please Provide premiumId and customerId...";
      cb(null, data);
    }



  }


  Premium.addNotInterestedCount = function (details, cb) {
    let data = {};
    let pid = details.premiumId;
    let cid = details.customerId;
    let Customer = app.models.Customer;

    if (pid && cid) {

      Premium.findOne({ "where": { "id": pid } }, function (err, res) {
        if (err) {
          data.isSuccess = false;
          data.errorMessage = err;
          data.message = "error in Premium findOne";
          cb(null, data);
        } else if (res && res.id == pid) {
          let notInterestedCount1 = res.notInterestedCount;
          let custArray = res.notInterestedCustArray;
          let exists = 0;

          if (custArray.length > 0) {
            for (let i = 0; i < custArray.length; i++) {
              if (cid == custArray[i]) {
                exists++;
              }
              if ((i + 1) == custArray.length) {
                if (exists == 0) {
                  custArray.push(cid);
                  notInterestedCount1 = notInterestedCount1 + 1;

                  Premium.updateAll({ "id": pid }, { "notInterestedCount": notInterestedCount1, "notInterestedCustArray": custArray }, function (err1, res1) {
                    if (err1) {
                      data.isSuccess = false;
                      data.errorMessage = err1;
                      cb(null, data);
                    } else if (res1.count > 0) {
                      data.isSuccess = true;
                      data.message = " Updated Successfully";
                      cb(null, data);
                    } else {
                      data.isSuccess = false;
                      data.message = "error in Premium UpdateAll";
                      cb(null, data);
                    }
                  });
                } else {
                  data.isSuccess = false;
                  data.message = "Already Disliked";
                  cb(null, data);
                }
                break;
              }
            }
          } else {
            custArray.push(cid);
            notInterestedCount1 = notInterestedCount1 + 1;

            Premium.updateAll({ "id": pid }, { "notInterestedCount": notInterestedCount1, "notInterestedCustArray": custArray }, function (err1, res1) {
              if (err1) {
                data.isSuccess = false;
                data.errorMessage = err1;
                cb(null, data);
              } else if (res1.count > 0) {
                data.isSuccess = true;
                data.message = " Updated Successfully";
                cb(null, data);
              } else {
                data.isSuccess = false;
                data.message = "error in Premium UpdateAll";
                cb(null, data);
              }
            });
          }

        } else {
          data.isSuccess = false;
          data.message = "Premium id not found...";
          cb(null, data);
        }
      });
    } else {
      data.isSuccess = false;
      data.message = "Please Provide premiumId and customerId...";
      cb(null, data);
    }
  }


  Premium.getTeaserMessages = function (details, cb) {
    let data = {};
    let businessId = details.businessId;



    Premium.find({
      "where": { "ownerId": businessId }, fields: { teaserMessage: true, id: true }

    }, function (err, res) {
      if (err) {
        data.isSuccess = false;
        data.errorMessage = err;
        console.log(err);
        cb(null, data);
      } else if (res.length > 0) {
        data.isSuccess = true;
        data.premiums = res;
        cb(null, data);

      } else {
        data.isSuccess = false;
        data.errorMessage = "Premium not found for this businessId";

        cb(null, data);

      }
    })
  }


  Premium.remoteMethod('getTeaserMessages', {
    http: { path: '/getTeaserMessages', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "add Interested Count of premium and send notification to customer for given id..."
  });



  Premium.getPremiumDetails = function (details, cb) {
    let data = {};
    let premiumId = details.premiumId;



    Premium.find({
      "where": { "id": premiumId }, fields: { interestedCount: true, notInterestedCount: true, interestedCustArray: true, notInterestedCustArray: true }

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
        data.errorMessage = "Premium not found for this businessId";

        cb(null, data);

      }
    })
  }

  Premium.remoteMethod('getPremiumDetails', {
    http: { path: '/getPremiumDetails', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "add Interested Count of premium and send notification to customer for given id..."
  });

  Premium.remoteMethod('addInterestedCountAndSendNotification', {
    http: { path: '/addInterestedCountAndSendNotification', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "add Interested Count of premium and send notification to customer for given id..."
  });

  Premium.remoteMethod('addNotInterestedCount', {
    http: { path: '/addNotInterestedCount', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "add Not Interested Count of premium and add customerId..."
  });
};
