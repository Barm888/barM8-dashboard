

let app = require('../../server/server'),
  moment = require('moment-timezone');
const cron = require('node-cron');
var unique = require('../../node_modules/array-unique');
const cleanDeep = require('../../node_modules/clean-deep');
const nodemailer = require("nodemailer");
const FCM = require('fcm-push');
const serverKey = 'AAAA-4BeD_8:APA91bEyi_SURDeuKRLqoDDWsde4wDNFP5TIFCDD8Je2fQBHr_21fpj8zmzZ0pjGW_mT1PWKYZB2QNgMdOJ4p6dhsjEVk-aQUJHV4vgL6VpJEDI4HCxPOhMwVl0qBz-47OGkzyOopaEe';
const pushnotif = new FCM(serverKey);

const excelToJson = require('convert-excel-to-json');
var path = require('path');

let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, //true --> will use ssl
  auth: {
    "user": "barm8global@gmail.com",
    "pass": "Everest@123"
  }
});

module.exports = function (Customer) {

  // delete Customer.validations.email;
  // delete Customer.validations.password;

  Customer.setDefaultCard = (params = {}, cb) => {

    let isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });

    app.models.AppConfig.findOne((err, aPcFres) => {
      if (aPcFres) {
        var stripe, stripeMode = aPcFres.stripeMode;
        if (!aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeTestKey);
        if (aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeLiveKey);

        if (params) {
          let { cardId, stripeId } = params;
          if (cardId && stripeId) {
            stripe.customers.update(stripeId, { default_source: cardId }, function (customerErr, customerRes) {
              if (customerErr) isSuccess();
              else isSuccess(true, "Successfully updated");
            });
          } else isSuccess(false, "cardId and customerId has been required!");
        } else isSuccess();
      } else isSuccess(false, "AppConfig is missing!");
    })
  }

  Customer.updateCard = (params = {}, cb) => {

    let isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });

    app.models.AppConfig.findOne((err, aPcFres) => {
      if (aPcFres) {
        var stripe, stripeMode = aPcFres.stripeMode;
        if (!aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeTestKey);
        if (aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeLiveKey);

        if (params) {
          let { stripeId, cardId, updateAttributes } = params;
          if (stripeId && cardId) {
            stripe.customers.updateSource(stripeId, cardId, updateAttributes, function (customerErr, customerRes) {
              if (customerErr) isSuccess();
              else isSuccess(true, "Successfully updated");
            });
          } else isSuccess(false, "stripeId and cardId is required!");
        } else isSuccess();
      } else isSuccess(false, "AppConfig is missing!");
    });

  }

  Customer.createCard = (params = {}, cb) => {

    let isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });

    app.models.AppConfig.findOne((err, aPcFres) => {
      if (aPcFres) {
        var stripe, stripeMode = aPcFres.stripeMode;
        if (!aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeTestKey);
        if (aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeLiveKey);

        if (params) {

          let { createAttributes, stripeId } = params;

          if (stripeId) {
            stripe.tokens.create({ card: createAttributes },
              function (err, token) {
                if (token && token.id) {
                  let tokenId = token.id;
                  stripe.customers.createSource(stripeId, { source: tokenId },
                    function (err, card) {
                      if (card) isSuccess(true, "Successfully created");
                      else isSuccess();
                    });
                } else isSuccess(false, "The token has not generated. Please try again!");
              });
          } else isSuccess(false, "Stripe Id is required");
        } else isSuccess(false, "All properties has been required!");
      } else isSuccess(false, "AppConfig is missing!");
    });
  };



  Customer.getCustomerCards = (params = {}, cb) => {

    let isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });

    app.models.AppConfig.findOne((err, aPcFres) => {
      if (aPcFres) {
        var stripe, stripeMode = aPcFres.stripeMode;
        if (!aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeTestKey);
        if (aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeLiveKey);

        if (params) {
          let { customerId } = params;

          if (customerId) {
            try {
              Customer.findOne({ where: { id: customerId } }, (err, res) => {

                createStripeAccount = () => {
                  stripe.customers.create({ email: res.email }, (stripeErr, stripeRes) => {
                    if (stripeRes && stripeRes.id) {
                      if (stripeMode) Customer.upsertWithWhere({ id: res.id }, { stripeLiveId: stripeRes.id });
                      else if (!stripeMode) Customer.upsertWithWhere({ id: res.id }, { stripeTestId: stripeRes.id });
                      getStripeData(stripeRes.id);
                    } else isSuccess(false, "Stripe Id is not generated. Please try again.");
                  })
                }

                getStripeData = (stripeId) => {
                  stripe.customers.retrieve(stripeId, function (errCustomer, customerRes) {
                    if (customerRes) cb(null, { isSuccess: true, customer: customerRes });
                    else createStripeAccount();
                  });
                }

                if (err) isSuccess();
                else {
                  if (res && stripeMode && res.stripeLiveId) getStripeData(res.stripeLiveId);
                  else if (res && stripeMode == false && res.stripeTestId) getStripeData(res.stripeTestId);
                  else createStripeAccount();
                }
              })
            } catch (e) {
              isSuccess(false, e);
            }

          } else isSuccess(true, "Customer Id is required!");
        } else isSuccess();
      } else isSuccess(false, "AppConfig is missing!");
    });
  }

  Customer.deleteCard = (params = {}, cb) => {

    let isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });

    app.models.AppConfig.findOne((err, aPcFres) => {
      if (aPcFres) {
        var stripe, stripeMode = aPcFres.stripeMode;
        if (!aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeTestKey);
        if (aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeLiveKey);


        if (params) {
          let { stripeId, cardId } = params;
          if (stripeId && cardId) {
            stripe.customers.deleteSource(stripeId, cardId, (cardErr, confirmation) => {
              if (cardErr) isSuccess();
              else isSuccess(true, "Successfully deleted");
            });
          } else isSuccess(false, "Stripe and Card Id is required!");
        } else isSuccess();
      } else isSuccess(false, "AppConfig is missing!");
    });

  };

  Customer.loginUseMobileNo = (params, cb) => {

    var tokenTimeToLive = 12096000;

    let isSuccess = (isSuccess = false, message = 'Please try again!', result = {}) => cb(null, { isSuccess, message, result });

    if (params) {
      let { mobile, uuid, deviceId } = params;
      if (mobile) {
        Customer.findOne({ where: { mobile } }, (err, user) => {
          if (err) isSuccess();
          else if (user) {

            updateData = () => {
              user.createAccessToken(tokenTimeToLive, function (error, token) {
                if (error) isSuccess();
                else {
                  Customer.upsertWithWhere({ id: user.id }, { uuid, deviceId }, (findErr, cusFindRes) => {
                    if (findErr) isSuccess();
                    else isSuccess(true, "Success", { uuid, deviceId, token, user: cusFindRes });
                  });
                }
              });
            }

            if (uuid != user.uuid) {
              pushnotif.send({
                to: user.deviceId,
                priority: "high",
                time_to_live: 0,
                content_available: true,
                data: {
                  "image": null, "title": 'login', "message": "",
                  "body": "", "priority": "high", "type": "logout"
                }
              }, (error, response12) => {
                updateData();
              });
            } else updateData();

          } else isSuccess(false, "Invalids mobile no. Please try again!.");
        })
      } else isSuccess(false, "Mobile no is required!.");
    } else isSuccess();
  }



  Customer.remoteMethod('loginUseMobileNo', {
    http: { path: '/loginUseMobileNo', verb: 'post' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "login use mobile no"
  });



  Customer.customLogin = (params, cb) => {

    let isSuccess = (isSuccess = false, message = 'Please try again!', result = {}) => cb(null, { isSuccess, message, result });

    if (params) {
      let { isFacebook, email, password, uuid, deviceId } = params;

      updateCustomerData = (cusRes = {}) => {
        cusRes = JSON.parse(JSON.stringify(cusRes));
        let { userId, id } = cusRes;
        if (userId) {
          Customer.upsertWithWhere({ id: userId }, { uuid, deviceId }, (findErr, cusFindRes) => {
            if (findErr) isSuccess();
            else isSuccess(true, "Success", { uuid, deviceId, userId, tokenId: id, user: cusFindRes });
          })
        } else isSuccess();
      }

      if (!isFacebook) {
        try {
          Customer.login({ email, password }, (cusErr, cusRes) => {
            if (cusErr) isSuccess();
            else updateCustomerData(cusRes);
          })
        } catch (err) {
          isSuccess();
        }
      } else {
        try {
          Customer.login({ email: "facebook@gmail.com", password: "facebookgamil" }, (cusErr, cusRes) => {
            if (cusErr) isSuccess();
            else {
              Customer.findOne({ where: { email } }, (cusFindErr, cusFindRes) => {
                if (cusFindErr) isSuccess();
                else {
                  if (cusFindRes) {
                    Customer.upsertWithWhere({ id: cusFindRes.id }, { uuid, deviceId }, (findErr, cusFindRes) => {
                      if (findErr) isSuccess();
                      else isSuccess(true, "Success", { uuid, deviceId, userId: cusFindRes.id, tokenId: cusRes.id, user: cusFindRes });
                    });
                  } else isSuccess();
                }
              })
            }
          })
        } catch (err) {
          isSuccess();
        }
      }
    } else isSuccess();
  }

  Customer.observe('before save', function event(ctx, next) {
    if (!ctx.where && ctx.instance) {
      var today = new Date();
      var birthDate = new Date(ctx.instance.dob);
      var age = today.getFullYear() - birthDate.getFullYear();
      var m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      ctx.instance.age = age;
      next();
    }
    else next();
  });

  let senderAddress = "barm8global@gmail.com";
  Customer.validatesUniquenessOf('email', { message: 'Email already exists.' });


  Customer.generateEphemeralKey = (details, cb) => {

    app.models.AppConfig.findOne((err, aPcFres) => {
      if (aPcFres) {
        var stripe, stripeMode = aPcFres.stripeMode;
        if (!aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeTestKey);
        if (aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeLiveKey);


        let data = {};
        let api_version = details.apiVersion,
          customerId = details.customerId;
        if (api_version && customerId) {

          stripe.ephemeralKeys.create({ customer: customerId }, { stripe_version: api_version }).then((key) => {
            data.isSuccess = true;
            data.key = key;
            cb(null, data);
          }).catch((err) => {
            console.log(err);
            data.isSuccess = false;
            data.message = "Errro in creating emphemeral key";
            cb(null, data);
          });
        } else {
          data.isSuccess = false;
          data.message = "Please Provide details object with apiVersion and customerId properties";
          cb(null, data);
        }
      }
    });


  };


  Customer.register = (details, cb) => {

    try {
      if (details && details.mobile) {
        const Loyalty = app.models.Loyalty;

        app.models.AppConfig.findOne((err, aPcFres) => {
          if (aPcFres) {
            var stripe, stripeMode = aPcFres.stripeMode;
            if (!aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeTestKey);
            if (aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeLiveKey);


            let data = {};
            //Function for creating customer with loyalty creation
            function createCustomer(custObj) {
              Customer.create(custObj, (err, res) => {
                if (err) {
                  data.isSuccess = false;
                  data.message = "Email already exists.";
                  cb(null, data);
                } else if (res) {
                  data.isSuccess = true;
                  data.result = res;
                  if (res.id) {
                    //For Creating Loyalty for Customer            
                    // Loyalty.create({
                    //   "date": new Date(),
                    //   "points": 10,
                    //   "multiplicationFactor": 0.1,
                    //   "level": "Bronze",
                    //   "customerId": res.id
                    // });
                  }
                  data.message = `Congratulations ${details.firstName} ${details.lastName}! \n You are a BarM8\n\n You are in the Draw to WIN\n* $2000 Holiday Voucher\n* One of Fourty (40) Six Packs from Brick Lane Brewing\n* One of Five Hundred (500) bottles of Warburn Estate Wines\nScan the QR code on the Flyer to receive Promo Code.\nGood Luck`;
                  cb(null, data);
                }
              });
            }

            if (details && details.email) {

              Customer.find({ where: { email: details.email } }, (ferr, fRes) => {
                if (ferr) {
                  data.isSuccess = false;
                  data.message = "Please try again!";
                  cb(null, data);
                } else if (fRes && fRes.length == 0) {
                  if (details.dob) {
                    details.age = Math.floor(((new Date()) - (new Date(details.dob))) / (365.25 * 24 * 60 * 60 * 1000));
                  }
                  let { email } = details;
                  //For Stripe Customer Create
                  stripe.customers.create({ email },
                    (sErr, sRes) => {
                      if (sErr) {
                        console.log("Error in stripe customer Create");
                        console.log(sErr);
                        createCustomer(details);
                      } else if (sRes) {
                        console.log("Stripe Customer Create Success");
                        details.stripeId = sRes.id;
                        createCustomer(details);
                      }
                    });
                } else {
                  data.isSuccess = false;
                  data.message = "Email already exists.";
                  cb(null, data);
                }
              });

            } else {
              data.isSuccess = false;
              data.message = "Details object is empty.Please try again!";
              cb(null, data);
            }
          }
        });
      } else {
        cb(null, { data: { isSuccess: false, message: "details is required!" } });
      }
    } catch (e) {
      cb(null, { data: { isSuccess: false, message: "Error" } });
    }
  };

  Customer.sendPasswordTomail = function (details, cb) {
    let data = {};
    let email = details.email;
    let customerId = details.customerId;
    // let url = 'https://barm8.com.au/#!/customerforgotpassword';
    let url = 'https://barm8.com.au/#!/customerforgotpassword';

    // let url = 'https://localhost/#!/customerforgotpassword';
    let html = 'Click <a href="' + url + '?id=' +
      customerId + '">here</a> to reset your password';
    //let html = 'Click <a href="' + url+ '">here</a> to reset your password';
    Customer.app.models.Email.send({
      to: email,
      from: senderAddress,
      subject: 'Barm8 Customer Password reset',
      html: html
    }, function (err, res) {
      if (err) {
        data.isSuccess = false;
        return console.log('> error sending password reset email');
        cb(null, data);
      } else {
        console.log(res);
        data.isSuccess = true;
        console.log('> sending password reset email to:', email);
        cb(null, data);
      }


    });

  }


  Customer.requestforDemo = function (details, cb) {
    let data = {},
      htmlFormat = "";

    htmlFormat = `<div style="background-color: #f1f1f1;    width: 30%;padding: 20px;    box-shadow: 0 2px 4px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12)!important;">
  <div><h2>Request Details</h2></div>
  <div>
    <br><table>
      <tbody style="text-align:left;">
        <tr>
          <td style="padding-top:10px" valign="top">
            <center><img src="https://barm8.com.au/assets/images/barm_login_logo.png" width="120px" height="70px"></center>
          </td>
        </tr>
        <tr><th> Business Name</th><td>:</td><td>${details.businessName}</td></tr>
        <tr><th>Location</th><td>:</td><td>${details.location}</td></tr>
        <tr><th>State</th><td>:</td><td>${details.state}</td></tr>
        <tr><th>Conatct Number</th><td>:</td><td>${details.conatctNo}</td></tr>
        <tr><th>Name</th><td>:</td><td>${details.Name}</td></tr>
        <tr><th>Email</th><td>:</td><td>${details.Email}</td></tr>
      </tbody>
    </table>
  </div>
</div>`

    transporter.sendMail({
      from: 'barm8global@gmail.com',
      to: `barm8global@gmail.com`,
      bcc: 'suresh@gdiaprixapps.com, emonitani@gmail.com, simplykshiteej@gmail.com, gary28singh@gmail.com',
      subject: `Request for Business`,
      text: `Dear,`,
      html: htmlFormat
    }, (error, info) => {
      if (error) {
        console.log(error);
        data.isSuccess = false;
        data.res = "not sent.Try again!";
        cb(null, data);
      } else {
        console.log('Message sent: ' + info.response);
        transporter.close();
        data.isSuccess = true;
        data.res = "mail Sent";
        cb(null, data);
      }
    });

  };

  Customer.addLikes = function (details, cb) {
    let data = {};
    let customerId = details.customerId,
      businessId = details.businessId;
    const Business = app.models.Business;


    if (customerId && businessId) {
      Business.findOne({
        "where": { "id": businessId },
        "fields": ["likesCount", "likedCustArray"]

      }, function (err, res) {
        if (err) {
          data.isSuccess = false;
          data.res = "Try Again Later";
          data.errorMessage = "Error in Business findOne..";
          data.error = err;
          cb(null, data);
        } else if (res) {
          let oldCount = (res.likesCount) ? ((res.likesCount >= 0) ? res.likesCount : 0) : 0,
            oldCustArray = res.likedCustArray || [];
          oldCustArray.push(customerId);
          // console.log(oldCount);
          let newCount = oldCount + 1;
          // console.log(newCount);
          businessId = businessId || "dsgsfgsf";
          Business.updateAll({ "id": businessId }, { "likesCount": newCount, "likedCustArray": oldCustArray }, function (err1, res1) {
            if (err1) {
              data.isSuccess = false;
              data.res = "Try Again Later";
              data.errorMessage = "Error in Business updateAll..";
              data.error = err1;
              cb(null, data);
            } else if (res1.count > 0) {
              Customer.findOne({
                "where": { "id": customerId },
                "fields": ["likesBusinessIdArray"]

              }, function (err2, res2) {
                if (err2) {
                  data.isSuccess = false;
                  data.res = "Try Again Later";
                  data.errorMessage = "Error in Customer findOne..";
                  data.error = err2;
                  cb(null, data);
                } else if (res2) {
                  let arr = res2.likesBusinessIdArray || [];
                  // console.log(arr);
                  arr.push(businessId);
                  // console.log(arr);

                  if (customerId) {
                    Customer.updateAll({ "id": customerId }, { "likesBusinessIdArray": arr }, function (err3, res3) {
                      if (err3) {
                        data.isSuccess = false;
                        data.res = "Try Again Later";
                        data.errorMessage = "Error in Customer updateAll..";
                        data.error = err3;
                        cb(null, data);
                      } else if (res3.count > 0) {
                        data.isSuccess = true;
                        data.res = "Likes updated successfully in customer and business";
                        cb(null, data);
                      } else {
                        data.isSuccess = false;
                        data.res = "Try Again Later";
                        data.res1 = "Likes updated successfully in Business and not updated in Customer(error in updateAll filter)";
                        cb(null, data);
                      }
                    })
                  } else {
                    data.isSuccess = false;
                    data.res = "Try Again Later";
                    data.res1 = "Likes updated successfully in Business and not updated in Customer(error in updateAll filter)";
                    cb(null, data);
                  }


                } else {
                  data.isSuccess = false;
                  data.res = "Try Again Later";
                  data.res1 = "Likes updated successfully in business and customerId not found to update";
                  cb(null, data);
                }

              })

            } else {
              data.isSuccess = false;
              data.res = "Try Again Later";
              data.res1 = "Error in updateAll Business";
              cb(null, data);
            }
          })

        } else {
          data.isSuccess = false;
          data.res = "Try Again Later";
          data.res1 = "BusinessId not Found";
          cb(null, data);
        }
      })
    } else {
      data.isSuccess = false;
      data.res = "Try Again Later";
      data.res1 = "customerId or businessId missing";
      cb(null, data);
    }


  }

  Customer.removeLikes = function (details, cb) {
    let data = {};


    if (details && details.customerId && details.businessId) {
      let customerId = details.customerId,
        businessId = details.businessId;
      const Business = app.models.Business;



      if (customerId && businessId) {
        Business.findOne({
          "where": { "id": businessId },
          "fields": ["likesCount", "likedCustArray"]

        }, function (err, res) {
          if (err) {
            data.isSuccess = false;
            data.res = "Try Again Later";
            data.errorMessage = "Error in Business findOne..";
            data.error = err;
            cb(null, data);
          } else if (res) {
            let oldCount = (res.likesCount) ? ((res.likesCount >= 0) ? res.likesCount : 0) : 0,
              oldCustArray = res.likedCustArray || [];
            // console.log(oldCount);
            let newCount = (oldCount > 0) ? (oldCount - 1) : 0;
            // console.log(newCount);


            businessId = businessId || "dsgsfgsf";

            let customerId1 = JSON.stringify(customerId);
            let counter1 = 0,
              totalLength1 = oldCustArray.length;
            if (totalLength1 > 0) {
              for (let j = 0; j < totalLength1; j++) {
                let cuss = JSON.stringify(oldCustArray[j]);
                if (cuss == customerId1) {
                  oldCustArray.splice(j, 1);
                  j--;
                  counter1++;
                } else {
                  counter1++;
                }
                if (counter1 == totalLength1) {
                  Business.updateAll({ "id": businessId }, { "likesCount": newCount, "likedCustArray": oldCustArray }, function (err1, res1) {
                    if (err1) {
                      data.isSuccess = false;
                      data.res = "Try Again Later";
                      data.errorMessage = "Error in Business updateAll..";
                      data.error = err1;
                      cb(null, data);
                    } else if (res1.count > 0) {
                      Customer.findOne({
                        "where": { "id": customerId },
                        "fields": ["likesBusinessIdArray"]

                      }, function (err2, res2) {
                        if (err2) {
                          data.isSuccess = false;
                          data.res = "Try Again Later";
                          data.errorMessage = "Error in Customer findOne..";
                          data.error = err2;
                          cb(null, data);
                        } else if (res2) {
                          let arr = res2.likesBusinessIdArray;
                          // console.log(arr);
                          let businessId1 = JSON.stringify(businessId);
                          let counter = 0,
                            totalLength = arr.length;
                          if (totalLength > 0) {
                            for (let i = 0; i < totalLength; i++) {
                              let buss = JSON.stringify(arr[i]);
                              if (buss == businessId1) {
                                arr.splice(i, 1);
                                i--;
                                counter++;
                              } else {
                                counter++;
                              }
                              if (counter == totalLength) {
                                // console.log(arr);
                                customerId = customerId || "gsfrgdfdf";
                                Customer.updateAll({ "id": customerId }, { "likesBusinessIdArray": arr }, function (err3, res3) {
                                  if (err3) {
                                    data.isSuccess = false;
                                    data.res = "Try Again Later";
                                    data.errorMessage = "Error in Customer updateAll..";
                                    data.error = err3;
                                    cb(null, data);
                                  } else if (res3.count > 0) {
                                    data.isSuccess = true;
                                    data.res = "Likes updated successfully in customer and business";
                                    cb(null, data);
                                  } else {
                                    data.isSuccess = false;
                                    data.res = "Try Again Later";
                                    data.res1 = "Likes updated successfully in Business and not updated in Customer(error in updateAll filter)";
                                    cb(null, data);
                                  }
                                })
                              }
                            }
                          } else {
                            data.isSuccess = false;
                            data.res = "Try Again Later";
                            data.res1 = "likesBusinessIdArray in customer is Empty";
                            cb(null, data);
                          }

                        } else {
                          data.isSuccess = false;
                          data.res = "Try Again Later";
                          data.res1 = "Likes updated successfully in business and customerId not found to update";
                          cb(null, data);
                        }
                      });

                    } else {
                      data.isSuccess = false;
                      data.res = "Try Again Later";
                      data.res1 = "Error in updateAll Business";
                      cb(null, data);
                    }
                  })
                }
              }
            } else {
              data.isSuccess = false;
              data.res = "Try Again Later";
              data.res1 = "likedCustArray in business is Empty";
              cb(null, data);
            }
          } else {
            data.isSuccess = false;
            data.res = "Try Again Later";
            data.res1 = "BusinessId not Found";
            cb(null, data);
          }
        })
      } else {
        data.isSuccess = false;
        data.res = "Try Again Later";
        data.res1 = "customerId or businessId missing";
        cb(null, data);
      }
    } else {
      data.isSuccess = false;
      data.res = "Try Again Later";
      data.res1 = "customerId or businessId missing";
      cb(null, data);
    }



  };

  Customer.getCustomers = function (details, cb) {
    let data = {};

    let custObjArray = [];


    //customerId = ["5a5c4256ea1c0deba0013b13","5a585d4aa49a6415a4ac5d3d","5a5c7e4a05a69b258803f6e9"];
    let customerIds = details.customerIds;
    let businessId = details.businessId;
    let queryArray = [];
    for (let i = 0; i < customerIds.length; i++) {
      let obj = {};
      obj.id = customerIds[i];
      queryArray.push(obj);
    }
    console.log(queryArray);
    Customer.find({
      "where": { or: queryArray },
      "fields": ["firstName", "age", "gender"]

    }, function (err, res) {
      if (err) {
        console.log("error in customer find");
        data.isSuccess = false;
        data.message = "error in customer find";
        cb(null, data);
      } else {
        data.isSuccess = true;
        data.res = res;
        cb(null, data);

      }

    })

  };

  //loyality customer details get
  Customer.loyaltyCustomerDetailsget = function (details, cb) {
    let data = {};
    let customerIds = cleanDeep(unique(details.customerIds));
    data.isSuccess = true;
    data.res = customerIds;
    cb(null, data);
  }


  Customer.getCustomersDetailsByDateAndBusinessId = function (details, cb) {
    let data = {};
    const VisitDateCustomer = app.models.VisitDateCustomer;

    let custObjArray = [];


    //customerId = ["5a5c4256ea1c0deba0013b13","5a585d4aa49a6415a4ac5d3d","5a5c7e4a05a69b258803f6e9"];
    // let customerIds = cleanDeep(unique(details.customerIds));
    let customerIds = details.customerIds;
    console.log(customerIds);
    let businessId = details.businessId;
    let date = new Date(details.date);
    let queryArray = [];
    let responseData = [];
    let count = 0;
    for (let i = 0; i < customerIds.length; i++) {
      VisitDateCustomer.findOne({
        "where": { "customerId": customerIds[i], "date": date },
        "include": [{
          "relation": "customer",
          "scope": {
            "fields": ["firstName", "age", "gender", "lastName", "mobile", "email"]
          }
        }, {
          "relation": "visits",
          "scope": {
            "where": { "ownerId": businessId }
          }
        }]
      }, function (err1, res1) {
        console.log(res1);
        if (err1) {
          console.log(err1);
        } else {
          // console.log("hai");
          if (res1) {
            let resp = JSON.stringify(res1);
            let resp1 = JSON.parse(resp);
            // console.log(resp1); 
            let obj = {};
            if (resp1.customer) {
              obj.firstName = resp1.customer.firstName || null;
              obj.lastName = resp1.customer.lastName || null;
              obj.age = resp1.customer.age || null;
              obj.gender = resp1.customer.gender || null;
              obj.mobile = resp1.customer.mobile || null;
              obj.email = resp1.customer.email || null;
              obj.id = resp1.customer.id || null;
            } else {
              obj.firstName = null;
              obj.age = null;
              obj.gender = null;
              obj.lastName = null;
              obj.mobile = null;
              obj.email = null;
              obj.id = null;
            }

            // console.log(resp1); 
            if (resp1.visits[0]) {
              obj.startTime = resp1.visits[0].startTime || null;
              obj.endTime = resp1.visits[0].lastScanTime || null;
            } else {
              obj.startTime = null;
              obj.endTime = null;
            }
            // console.log(obj); 

            responseData.push(obj);
            count++;

          } else {
            // console.log("hai1"); 
            let obj = {};

            obj.firstName = null;
            obj.lastName = null;
            obj.age = null;
            obj.gender = null;
            obj.mobile = null;
            obj.email = null;
            obj.startTime = null;
            obj.endTime = null;
            obj.id = null;
            // console.log(obj);
            responseData.push(obj);
            count++;

          }
          // console.log(customerIds.length, count);
          if (customerIds.length == count) {
            data.isSuccess = true;
            data.res = responseData;
            cb(null, data);
          }
        }
      });
    }
  }


  Customer.getTrendingBusiness = function (details, cb) {
    let data = {};
    const Business = app.models.Business;
    const VisitHourCount = app.models.VisitHourCount;

    let lat = details.location.lat;
    let lng = details.location.lng;
    let pDate = new Date();

    console.log(pDate.getTimezoneOffset());
    let timezoneOffset = pDate.getTimezoneOffset();


    if (timezoneOffset == 0) {
      pDate.setTime(pDate.getTime() + ((5 * 60 * 60 * 1000) + (30 * 60 * 1000)));
    }


    let year = pDate.getFullYear(),
      month = pDate.getMonth(),
      date = pDate.getDate(),
      hour = pDate.getHours();
    month = month + 1;
    let hourString;
    if (hour == 0) {
      hourString = "_12amto1am";
    } else if (hour < 12) {
      hourString = `_${hour}amto${hour + 1}am`;
    } else if (hour == 12) {
      hourString = "_12pmto1pm";
    } else if (hour == 23) {
      hourString = "_11pmto12am";
    } else {
      hour = hour - 12;
      hourString = `_${hour}pmto${hour + 1}pm`;
    }
    console.log(hourString);

    let dateStr = `${year}-${("0" + month).slice(-2)}-${("0" + date).slice(-2)}T00:00:00.000Z`;
    console.log(dateStr);

    if (lat && lng) {
      Business.find({
        "where": {
          and: [{ "location": { near: { lat: lat, lng: lng } } }, { "status": "approved" }]
        },
        "fields": ["businessName", "location", "imageUrl", "hourlyVisitCount", "openingHoursStatus", "addressLine1", "addressLine2", "suburb", "zipCode", "id"],
        "limit": 30
      }, function (err, res) {
        if (err) {
          data.isSuccess = false;
          data.errorMessage = err;
          console.log(err);
          cb(null, data);
        } else if (res.length > 0) {


          res = JSON.parse(JSON.stringify(res));
          let len = res.length;
          let hCount = 0;
          for (let i = 0; i < res.length; i++) {
            let bussId = res[i].id;

            VisitHourCount.findOne({
              "where": { "and": [{ "date": dateStr }, { "ownerId": bussId }] }
            }, function (bhcErr, bhcRes) {
              if (bhcErr) {
                console.log("error in BusinessHourCount find");
                console.log(bhcErr);
                res[i].presentHourCount = 0;
                hCount++;
                if (res.length == hCount) {
                  // function for sorting the res array of object by hourlyVisitCount property

                  function compare(a, b) {
                    if (a.presentHourCount < b.presentHourCount)
                      return 1;
                    if (a.presentHourCount > b.presentHourCount)
                      return -1;
                    return 0;
                  }


                  res.sort(compare);
                  res = res.slice(0, 10);



                  data.isSuccess = true;
                  data.message = "Trending Business List";
                  data.buisnesses = res;
                  cb(null, data);
                }
              } else if (bhcRes && bhcRes.ownerId == bussId) {
                let hourCount = bhcRes[hourString];
                console.log(hourCount);
                res[i].presentHourCount = hourCount;
                hCount++;
                if (res.length == hCount) {
                  // function for sorting the res array of object by hourlyVisitCount property

                  function compare(a, b) {
                    if (a.presentHourCount < b.presentHourCount)
                      return 1;
                    if (a.presentHourCount > b.presentHourCount)
                      return -1;
                    return 0;
                  }


                  res.sort(compare);

                  res = res.slice(0, 10);


                  data.isSuccess = true;
                  data.message = "Trending Business List";
                  data.buisnesses = res;
                  cb(null, data);
                }
              } else {
                console.log("date not found");
                res[i].presentHourCount = 0;
                hCount++;
                if (res.length == hCount) {
                  // function for sorting the res array of object by hourlyVisitCount property

                  function compare(a, b) {
                    if (a.presentHourCount < b.presentHourCount)
                      return 1;
                    if (a.presentHourCount > b.presentHourCount)
                      return -1;
                    return 0;
                  }


                  res.sort(compare);

                  res = res.slice(0, 10);

                  data.isSuccess = true;
                  data.message = "Trending Business List";
                  data.buisnesses = res;
                  cb(null, data);
                }
              }
            });


          }

        } else {
          data.isSuccess = false;
          data.message = "Businesses not found in your range";
          cb(null, data);

        }
      })
    } else {
      data.isSuccess = false;
      data.message = "Location object with lat and ang missing";
      cb(null, data);
    }
  }

  Customer.updateCustomerFromApp = function (details, cb) {
    let data = {},
      customerDetails = details.customerDetails,
      customerId = details.customerId;

    if (typeof customerDetails === "object" && typeof customerId === "string") {
      Customer.upsertWithWhere({ "id": customerId }, customerDetails, function (custErr, custIns) {
        if (custErr) {
          console.log(custErr);
          cb(null, { "isSuccess": false, "message": "Error in customer Update" });

        } else {
          data.isSuccess = true;
          data.message = "Update Success";
          cb(null, data);
        }
      });

    } else {
      cb(null, { "isSuccess": false, "message": "Please provide customerId and customerDetails object in details" });
    }

  }

  Customer.updateRedeemCouponTimeOfCustomer = function (details, cb) {
    let data = {},
      eventData = details.eventData,
      event = eventData.event,
      businessId = details.businessId,
      couponNotificationId = details.couponNotificationId,
      customerInterestId = eventData.customerInterestId,
      date = details.date,
      timeZone = details.timeZone || "Australia/Sydney";
    const CustomerInterestWhatshot = app.models.CustomerInterestWhatshot,
      CouponNotification = app.models.CouponNotification,
      InAppSpecialInterCustomer = app.models.InAppSpecialInterCustomer,
      VisitHourCount = app.models.VisitHourCount,
      CustomerScan = app.models.CustomerScan;
    if (couponNotificationId) CouponNotification.destroyById(couponNotificationId); //For Removing used Coupon

    if (event && customerInterestId && date) {
      let momentdate = new Date(date),
        countryTime = moment.tz(momentdate, timeZone).format('YYYY-MM-DD hh:mm A'),
        countryDateFormat = moment.tz(momentdate, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z",
        dateFormat = moment.tz(momentdate, timeZone).format('YYYY-MM-DD') + "T00:00:00.000Z";

      if (event === "WhatsHotGiveaway") {
        CustomerInterestWhatshot.upsertWithWhere({ "id": customerInterestId }, { "redeemCouponDateUtc": momentdate, "redeemCouponTimeString": countryTime, "redeemCouponTimeDate": countryDateFormat });
        data.isSucess = true;
        data.message = "Redeem Time Updated in CustomerInterestWhatshot";
        cb(null, data);
      } else if (event === "WhatsHotPromo") {
        if (couponNotificationId) {
          CustomerInterestWhatshot.upsertWithWhere({ "id": customerInterestId }, { "redeemCouponDateUtc": momentdate, "redeemCouponTimeString": countryTime, "redeemCouponTimeDate": countryDateFormat });
          data.isSucess = true;
          data.message = "Redeem Time Updated in CustomerInterestWhatshot.";
          cb(null, data);
        } else {
          data.isSuccess = false;
          data.message = "For WhatsHotPromo you must send couponNotificationId property";
          cb(null, data);
        }

      } else if (event === "InAppSpecial") {
        if (couponNotificationId) {
          InAppSpecialInterCustomer.upsertWithWhere({ "id": customerInterestId }, { "redeemCouponDateUtc": momentdate, "redeemCouponTimeString": countryTime, "redeemCouponTimeDate": countryDateFormat });
          data.isSucess = true;
          data.message = "Redeem Time Updated in InAppSpecialInterCustomer";
          cb(null, data);
        } else {
          data.isSuccess = false;
          data.message = "For InAppSpecial you must send couponNotificationId property";
          cb(null, data);
        }
      } else if (event === "InstantPrize") {
        if (businessId && dateFormat && customerInterestId) {
          VisitHourCount.findOne({
            "where": { "date": dateFormat, "ownerId": businessId },
            "include": {
              "relation": "customerScans",
              "scope": {
                "where": { "customerId": customerInterestId },
                "order": 'scanDateTimeFormat DESC',
                "fields": ["id"]
              }
            }
          }, function (err, res) {
            if (err) {
              console.log(err);
              data.isSuccess = false;
              data.message = "Error in VisitHourCount";
              cb(null, data);
            } else if (res && (res.ownerId).toString() === businessId.toString()) {
              res = JSON.parse(JSON.stringify(res));
              if (res.customerScans.length) {
                let customerScansArray = res.customerScans,
                  customerScansArrayLength = customerScansArray.length;
                console.log(customerScansArrayLength);
                console.log(customerScansArray);
                // for(let i = 0;i < customerScansArrayLength;i++){
                let customerScanId = customerScansArray[0].id;
                CustomerScan.upsertWithWhere({ "id": customerScanId }, { "redeemCouponDateUtc": momentdate, "redeemCouponTimeString": countryTime, "redeemCouponTimeDate": countryDateFormat });
                // }
                data.isSucess = true;
                data.message = "Redeem Time Updated in Customer scans for Instant Prize";
                cb(null, data);
              } else {
                data.isSuccess = false;
                data.message = "No Customer Scans Found for Customer VisitHourCount";
                cb(null, data);
              }
            } else {
              data.isSuccess = false;
              data.message = "No VisitHourCount date Found for given Date";
              cb(null, data);
            }
          });
        } else {
          data.isSuccess = false;
          data.message = "For InstantPrize you must send businessId property";
          cb(null, data);
        }
      } else if (event === "LoyaltyRewards") {
        if (couponNotificationId) {
          data.isSucess = true;
          data.message = "LoyaltyRewards Coupon Removed";
          cb(null, data);
        } else {
          data.isSuccess = false;
          data.message = "For LoyaltyRewards you must send couponNotificationId property";
          cb(null, data);
        }
      } else {
        data.isSucess = true;
        data.message = "event Name Not Matched use any one(WhatsHotGiveaway, WhatsHotPromo, InAppSpecial or InstantPrize)";
        cb(null, data);
      }
    } else {
      cb(null, { "isSuccess": false, "message": "Please provide customerInterestId, date and event in details" });
    }
  }


  Customer.pwdReset = (details, cb) => {
    let data = {},
      id, password;
    if (details && details.id && details.password) {
      id = details.id, password = details.password;
      Customer.findOne({ where: { id } }, function (err, cusRes) {
        if (err) {
          data.isSucess = false;
          data.message = "Please try again!";
          cb(null, data);
        } else if (cusRes) {
          if (cusRes) {
            cusRes.updateAttribute('password', Customer.hashPassword(password), function (err, res) {
              if (err) {
                data.isSuccess = false;
                data.message = err;
                cb(null, data);
              } else {
                data.isSuccess = true;
                data.user = res;
                data.message = "Customer Password has been changed.";
                cb(null, data);
              }
            });
          } else {
            data.isSucess = false;
            data.message = "Please try again!";
            cb(null, data);
          }
        }
      });
    }
  };

  Customer.validateCustomer = function (details, cb) {
    let data = {};

    const findCustomerByMobileNo = (mobile) => {
      return new Promise((resolve) => {
        Customer.findOne({
          "where": { mobile },
          "fields": ["id"]

        }, function (err, res) {
          let isRes = (res) ? true : false;
          resolve(isRes)
        })
      });
    }


    if (details && 'mobileNumbers' in details && details.mobileNumbers.length) {
      const start = async () => {
        let respArr = [];
        for (let i = 0, len = details.mobileNumbers.length; i < len; i++) {
          let resp = await findCustomerByMobileNo(details.mobileNumbers[i]),
            formObj = { "no": details.mobileNumbers[i], "available": resp };
          respArr.push(formObj);
        }
        data.res = respArr;
        cb(null, data)
      };
      start();

    } else {
      data.message = "Missing details object or mobileNumbers Array";
      data.res = [];
      cb(null, data)
    }

  };


  Customer.remoteMethod('customLogin', {
    http: { path: '/customLogin', verb: 'post' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "customer login and logout another device"
  });

  Customer.remoteMethod('updateCard', {
    http: { path: '/updateCard', verb: 'post' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "updateCard"
  });

  Customer.remoteMethod('setDefaultCard', {
    http: { path: '/setDefaultCard', verb: 'post' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "set default card"
  });

  Customer.remoteMethod('deleteCard', {
    http: { path: '/deleteCard', verb: 'post' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "delete credit card"
  });

  Customer.remoteMethod('getCustomerCards', {
    http: { path: '/getCustomerCards', verb: 'post' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "get Customer cards"
  });


  Customer.remoteMethod('createCard', {
    http: { path: '/createCard', verb: 'post' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Create credit card"
  });


  Customer.remoteMethod('generateEphemeralKey', {
    http: { path: '/generateEphemeralKey', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "For generating Ephemeral Key for Stripe Payment"
  });

  Customer.remoteMethod('stripeCustomerCreate', {
    http: { path: '/stripeCustomerCreate', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Stripe Customer Create"
  });

  Customer.remoteMethod('pwdReset', {
    http: { path: '/pwdReset', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "password rest"
  });

  Customer.remoteMethod('register', {
    http: { path: '/register', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Customer register API"
  });

  Customer.remoteMethod('addLikes', {
    http: { path: '/addLikes', verb: 'post' },

    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Add the likes count inside Business and insert businessId inside customer."
  });

  Customer.remoteMethod('removeLikes', {
    http: { path: '/removeLikes', verb: 'post' },

    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Reduce the likes count inside Business and remove businessId inside customer."
  });

  Customer.remoteMethod('loyaltyCustomerDetailsget', {
    http: { path: '/loyaltyCustomerDetailsget', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Cusgtomer details get..."
  });

  Customer.remoteMethod('getCustomers', {
    http: { path: '/getCustomers', verb: 'get' },

    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get the Customers Details by given Ids...."
  });

  Customer.remoteMethod('getCustomersDetailsByDateAndBusinessId', {
    http: { path: '/getCustomersDetailsByDateAndBusinessId', verb: 'get' },

    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get the Customers Details in the given criteria...."
  });

  Customer.remoteMethod('sendPasswordTomail', {
    http: { path: '/sendPasswordTomail', verb: 'post' },

    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get the Customers Details by given Ids...."
  });

  Customer.remoteMethod('getTrendingBusiness', {
    http: { path: '/getTrendingBusiness', verb: 'get' },

    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get the trending Businesses by given Location of customer...."
  });


  Customer.remoteMethod('requestforDemo', {
    http: { path: '/requestforDemo', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Business request for demo..."
  });


  Customer.remoteMethod('updateCustomerFromApp', {
    http: { path: '/updateCustomerFromApp', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Update Customer from App side..."
  });

  Customer.remoteMethod('updateRedeemCouponTimeOfCustomer', {
    http: { path: '/updateRedeemCouponTimeOfCustomer', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Update Redeem Coupon Time of Customer..."
  });

  Customer.remoteMethod('validateCustomer', {
    http: { path: '/validateCustomer', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Validate Customer by Mobile no"
  });

};
