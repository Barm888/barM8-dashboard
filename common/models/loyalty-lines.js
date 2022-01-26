'use strict';
let app = require('../../server/server');
var moment = require('moment-timezone');

module.exports = function(Loyaltylines) {

  Loyaltylines.addLoyaltyLines = function(loyaltyDetails, cb) {

    const CustomerScanLoyalty = app.models.CustomerScanLoyalty;
    let customerId = loyaltyDetails.customerId,
      businessId = loyaltyDetails.businessId,
      country = loyaltyDetails.country,
      timeZone = loyaltyDetails.timeZone;

    if (typeof businessId == "object") {
      customerId = customerId.toString();
      businessId = businessId.toString();
    }

    if (customerId && businessId) {
      Loyaltylines.findOne({
        "where": {
          and: [{ "customerId": customerId },
            { "ownerId": businessId }
          ]
        }
      }, function(loyaltyLinesErr, loyaltyLinesRes) {

        if (country == "" && country == null && country == undefined) {
          country = "Australia";
        }

        if (timeZone == null || timeZone == "" || timeZone == undefined) {
          timeZone = "Australia/Sydney";
        }

        var momentdate = new Date(),
          scanCountryDate = moment.tz(momentdate, timeZone).format('YYYY-MM-DD hh:mm A'),
          scanCountryDateFormat = moment.tz(momentdate, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";

        if (loyaltyLinesErr) {
          console.log(loyaltyLinesErr);
          cb("Error in Loyaltylines findOne");
        } else if (loyaltyLinesRes && loyaltyLinesRes.customerId == customerId && loyaltyLinesRes.ownerId == businessId) {

          let newPoints = parseInt(loyaltyLinesRes.points) + 10;

          let level;
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

          let loyaltyLinesObj = {
            "points": 10,
            "level": level
          };
          Loyaltylines.upsertWithWhere({ where: { "customerId": customerId, "ownerId": businessId } }, { "customerId": customerId, "points": newPoints, "level": level, "ownerId": businessId }, function(luErr, luRes) {
            if (luErr) {
              cb("Error in Loyaltylines Update");
            } else {
              CustomerScanLoyalty.create({
                scanTime: scanCountryDate,
                scanDateTimeFormat: scanCountryDateFormat,
                country: country,
                timeZone: timeZone,
                points: newPoints,
                level: level,
                customerId: customerId,
                loyaltyLinesId: luRes.id,
                ownerId: businessId
              });
              cb("Loyaltylines Updated");
            }
          })
        } else {

          Loyaltylines.create({ "points": 10, "level": "Bronze", "customerId": customerId, "ownerId": businessId }, function(lErr, lRes) {
            if (lErr) {
              console.log(lErr);
              cb("Error in Loyaltylines create");
            } else {
              CustomerScanLoyalty.create({
                scanTime: scanCountryDate,
                scanDateTimeFormat: scanCountryDateFormat,
                country: country,
                timeZone: timeZone,
                points: "10",
                level: "Bronze",
                customerId: customerId,
                loyaltyLinesId: lRes.id,
                ownerId: businessId
              });
              cb("New Loyaltylines Created");
            }
          });
        }
      });
    } else {
      cb("customerId or businessId not found");
    }
  };

  Loyaltylines.getLoyaltyLevel = (details, cb) => {
    let data = {};
    if (details && details.customerId && details.ownerId) {
      Loyaltylines.findOne({
        "where": { "customerId": details.customerId, "ownerId": details.ownerId },
        "include": ["customer","business"]
      }, (loyaltyLinesErr, loyaltyLinesRes) => {
        if (loyaltyLinesErr) {
          data.isSuccess = false;
          data.message = "Error in Loyaltylines findOne";
          cb(null, data);
        } else if (loyaltyLinesRes) {
          data.isSuccess = true;
          data.res = loyaltyLinesRes
          cb(null, data);
        } else {
          data.isSuccess = false;
          data.message = "customerId and ownerId not found in Loyalty";
          cb(null, data);
        }
      });
    } else {
      data.isSuccess = false;
      data.message = "Please Provide details object with customerId and ownerId";
      cb(null, data);
    }
  };


  Loyaltylines.remoteMethod('addLoyaltyLines', {
    http: { path: '/addLoyaltyLines', verb: 'post' },
    accepts: { arg: 'loyaltyDetails', type: 'object' },
    returns: { arg: 'data', type: 'string' },
    description: "upsert the Loyaltylines on scan ...."
  });

  Loyaltylines.remoteMethod('getLoyaltyLevel', {
    http: { path: '/getLoyaltyLevel', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'string' },
    description: "Get the Loyalty level of customer for business"
  });
};
