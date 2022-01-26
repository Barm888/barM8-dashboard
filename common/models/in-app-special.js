'use strict';

let app = require('../../server/server');
var moment = require('moment-timezone');

const FCM = require('fcm-push')
  , serverKey = 'AAAA-4BeD_8:APA91bEyi_SURDeuKRLqoDDWsde4wDNFP5TIFCDD8Je2fQBHr_21fpj8zmzZ0pjGW_mT1PWKYZB2QNgMdOJ4p6dhsjEVk-aQUJHV4vgL6VpJEDI4HCxPOhMwVl0qBz-47OGkzyOopaEe'
  , fcm = new FCM(serverKey);

module.exports = function (Inappspecial) {

  Inappspecial.observe('before save', (ctx, next) => {
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

  Inappspecial.createandupdate = (details, cb) => {
    let data = {}; var resArray = [];
    if (details && details.dates.length > 0) {
      if (details.businessId) {
        details.startDateformat.forEach(async (val, i) => {
          var objData = {};
          objData.startTime = details.startTime; objData.ownerId = details.businessId; objData.endTime = details.endTime; objData.price = details.price; objData.desc = details.inappdetails;
          var monthCustom = (("0" + details.month).slice(-2));
          objData.isGroup = "yes";
          objData.message = "Turn on Bluetooth or Scan QR Code at the venue to receive Coupon with Promo Code.";
          objData.category = details.category; objData.promoCode = details.promoCode, objData.desc = details.desc; objData.item = details.item;
          objData.month = details.month; objData.year = details.year; objData.date = val.date; objData._24startTimeFormat = val._24startTimeformat;
          objData._24endTimeFormat = details.endDateformat[i]._24endTimeformat; objData.startDateFormat = val.startTimeFormat; objData.endDateFormat = details.endDateformat[i].endTimeFormat;
          await Inappspecial.create(objData, function (err, res) {
            if (res) {
              var j = i;
              if (details.dates.length == (j + 1)) {
                data.isSuccess = true;
                data.message = "Inappspecial create sucessfully";
                cb(null, data);
              }
            }
          });
        });
      }
      else {
        data.isSuccess = false;
        data.message = "Please try again";
        cb(null, data);
      }
    } else {
      data.isSuccess = false;
      data.message = "Please try again";
      cb(null, data);
    }

  };

  Inappspecial.getMonthInAppSpecial = (details, cb) => {
    let data = {};
    if (details.month && details.year) {
        Inappspecial.find({ where: { month: ("0" + (details.month)).slice(-2), year: parseInt(details.year), ownerId: details.businessId }, fields: { id: true, date: true , dateNo : true } }, (err, res) => {
        data.result = res;
        data.isSuccess = true;
        data.message = "In app special has been successfully.";
        cb(null, data);
      });
    } else {
      data.isSuccess = false;
      data.message = "Not find data";
      cb(null, data);
    }
  };

  Inappspecial.getDatebyInAppSpecial = (details, cb) => {
    let data = {}, date = `${details.date.year}-${("0" + details.date.month).slice(-2)}-${("0" + details.date.dates[0]).slice(-2)}`;
    if (details.date.dates.length > 0) {
      Inappspecial.find({ "where": { "date": date + "T00:00:00.000Z", "ownerId": details.businessId } }, (err, res) => {
        data.result = res;
        data.isSuccess = true;
        data.message = "In app special has been successfully.";
        cb(null, data);
      });
    } else {
      data.isSuccess = false;
      data.message = "Not find data";
      cb(null, data);
    }
  };

  Inappspecial.removedata = (details, cb) => {
    let data = {};
    if (details.id) {
      Inappspecial.destroyById(details.id, (err, res) => {
        data.isSuccess = true;
        data.message = "Deleted has been successfully.";
        cb(null, data);
      });
    } else {
      data.isSuccess = true;
      data.message = "Not delete data!.";
      cb(null, data);
    }

  };

  Inappspecial.addInAppSpecialInterestedCustomer = (details, cb) => {

    const Business = app.models.Business,
      Customer = app.models.Customer,
      InAppSpecialInterCustomer = app.models.InAppSpecialInterCustomer;

    let data = {},
      inAppSpecialIds = details.inAppSpecialIds || [],
      customerId = details.customerId,
      timeZone = details.timeZone,
      country = details.country;

    if (timeZone == null || timeZone == "" || timeZone == undefined) {
      timeZone = "Australia/Sydney";
    }

    if (country == null || country == "" || country == undefined) {
      country = "Australia";
    }

    var status = details.status || ""
      , momentdate = new Date()
      , interestCountryTime = moment.tz(momentdate, timeZone).format('YYYY-MM-DD hh:mm A')
      , interestCountryDateandTimeFormat = moment.tz(momentdate, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";

    if (inAppSpecialIds.length && customerId) {

      for (let i = 0; i < inAppSpecialIds.length; i++) {
        InAppSpecialInterCustomer.upsertWithWhere({ customerId: customerId, inAppSpecialId: inAppSpecialIds[i] }, {
          customerId: customerId, inAppSpecialId: inAppSpecialIds[i], status: status, interestTime: interestCountryTime,
          interestDateTimeFormat: interestCountryDateandTimeFormat, timeZone: timeZone, country: country
        });
      }





      Customer.findOne({ "where": { "id": customerId } },  (custErr, custRes) => {

        if (custRes) {

          let customerName = custRes.firstName + " " + custRes.lastName
            , device_Id = custRes.deviceId;


          if (device_Id && status == 'Interested') {

            fcm.send({
              to: device_Id,
              priority: "high",
              time_to_live: 0,
              data: {
                "image": null,
                "title": 'PremiumNotification',
                "message": "Your selection has been saved.\n Turn on Bluetooth or Scan QR Code at the venue to receive Coupon with Promo Code.",
                "body": "Your selection has been saved.\n Turn on Bluetooth or Scan QR Code at the venue to receive Coupon with Promo Code.",
                "priority": "high",
                "type": ""
              }
            }, function (error, response) {
              if (error) {
                console.log("Something has gone wrong!Please check Server key and credentials token..... ");
                console.log("Customer: " + customerName);
              } else {
              }
            });
          }
        } else {
        }
      });

      data.isSuccess = true;
      cb(null, data);


    } else {
      data.isSuccess = false;
      data.message = "Please Provide inAppSpecialIds Array and customerId...";
      cb(null, data);
    }
  };

  Inappspecial.getInterestedCount = async (details, cb) => {
    await Inappspecial.find({ "where": { "and": [{ "date": { "gte": "2018-09-06T00:00:00.000Z" } }, { "date": { "lte": "2018-09-06T23:59:00.000Z" } }, { "ownerId": "5b10bb88d196033d1052b340" }] }, fields: { interestedCount: true, interestedCustomers: true, interestedCustomersScan: true, id: true, ownerId: true } }, (err, res) => {
      if (err) {
        data.isSuccess = false;
        data.message = "Not data!.";
        cb(null, data);
      } else {
        if (res) {
          data.isSuccess = true;
          data.result = res;
          cb(null, data);
        } else {
          data.isSuccess = false;
          data.message = "Not data!.";
          cb(null, data);
        }
      }
    });
  };

  Inappspecial.remoteMethod('createandupdate', {
    http: { path: '/createandupdate', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Create and Update in InappSpecial"
  });

  Inappspecial.remoteMethod('getMonthInAppSpecial', {
    http: { path: '/getMonthInAppSpecial', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Find month data"
  });

  Inappspecial.remoteMethod('getDatebyInAppSpecial', {
    http: { path: '/getDatebyInAppSpecial', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Find date data"
  });

  Inappspecial.remoteMethod('removedata', {
    http: { path: '/removedata', verb: 'Delete' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Delete"
  });

  Inappspecial.remoteMethod('getInterestedCount', {
    http: { path: '/getInterestedCount', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get Interested count"
  });

  Inappspecial.remoteMethod('addInAppSpecialInterestedCustomer', {
    http: { path: '/addInAppSpecialInterestedCustomer', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "add In App Special Interested Count"
  });
};



