'use strict';
const app = require('../../server/server');
var moment = require('moment-timezone');

module.exports = function (Visit) {
  let data = {};
  Visit.addScanVisit = function (details, cb) {
    let customerId = details.customerId;
    let businessId = details.businessId;
    let location = details.location;
    if (customerId && businessId && location) {
      let presentDate1 = new Date();
      let presentDate = new Date(presentDate1);
      let startTime = presentDate.toLocaleTimeString();
      presentDate.setHours(0, 0, 0, 0);
      let visitDate = presentDate;
      let startTimeDate = new Date(presentDate1);

      Visit.findOne({ "where": { "customerId": customerId, "visitDate": presentDate } }, function (err, res) {
        if (err) {
          data.isSuccess = false;
          data.errorMessage = err;
          data.message = "Error in Visit findOne";
          cb(null, data);
        } else if (res) {
          let scanFrequency = res.scanFrequency + 1;
          Visit.updateAll({ "customerId": customerId, "visitDate": presentDate }, { "scanFrequency": scanFrequency, "lastScanTime": startTimeDate }, function (err1, res1) {
            if (err1) {
              data.isSuccess = false;
              data.errorMessage = err1;
              data.message = "Error in Visit updateAll";
              cb(null, data);
            } else if (res1.count == 1) {
              data.isSuccess = true;
              data.message = "Already Scanned Today, Scan frequency updated";
              cb(null, data);

            } else {
              data.isSuccess = false;
              data.message = "Already Scanned Today, update filter is not find...";
              cb(null, data);
            }
          })
        } else {
          let visitObj = {
            "visitDate": visitDate,
            "lastScanTime": startTimeDate,
            "startTime": startTime,
            "location": location,
            "customerId": customerId,
            "businessId": businessId
          };


          Visit.create(visitObj, function (err2, obj) {
            if (err2) {
              data.isSuccess = false;
              data.errorMessage = err2;
              data.message = "Error in Visit create";
              cb(null, data);
            } else {
              let Loyalty = app.models.Loyalty;
              Loyalty.findOne({ "where": { "customerId": customerId } }, function (err3, res3) {
                if (err3) {
                  data.isSuccess = false;
                  data.message = "Error in Loyalty FindOne..";
                  data.errorMessage = err3;
                  cb(null, data);
                } else if (res3) {
                  let addPoints = 10;
                  let oldPoints = res3.points;
                  let newPoints = parseInt(oldPoints) + parseInt(addPoints);
                  let level = "Bronze";
                  // console.log(newPoints, level);
                  if (newPoints >= 1000) {
                    level = "VIP"
                  } else if (newPoints >= 700) {
                    level = "Platinum"
                  } else if (newPoints >= 300) {
                    level = "Gold";
                  } else if (newPoints >= 100) {
                    level = "Silver";
                  } else {
                    level = "Bronze";
                  }
                  // console.log(newPoints, level);

                  Loyalty.updateAll({ "customerId": customerId }, { "points": newPoints, "level": level }, function (err4, res4) {
                    if (err4) {
                      data.isSuccess = false;
                      data.message = "Error in Loyalty updateAll..";
                      data.errorMessage = err4;
                      cb(null, data);
                    } else {
                      data.isSuccess = true;
                      data.message = "Successfully created Visit and Loyalty points Updated Successfully...";
                      cb(null, data);
                    }
                  })
                } else {
                  data.isSuccess = false;
                  data.message = "CustomerId not Found for updating Loyalty points..";
                  cb(null, data);
                }


              })
            }
          });

        }
      })
    } else {
      data.isSuccess = false;
      data.message = "Please provide customerId, businessId, location...";
      cb(null, data);
    }

  }



  Visit.remoteMethod('addScanVisit', {
    http: { path: '/addScanVisit', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' }
  });
};
