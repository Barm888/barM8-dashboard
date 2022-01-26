'use strict';
const app = require('../../server/server');
const cron = require('node-cron');

module.exports = function (Businesspulsecount) {

  Businesspulsecount.getBusinesspulsecount = function (details, cb) {
    let data = {};


    Businesspulsecount.find({ order: 'counts DESC', "include": "business" }, function (err, res) {
      if (err) {
        data.isSuccess = false;
        data.errorMessage = err;
        console.log(err);
        cb(null, data);
      } else {
        data.isSuccess = true;
        data.buisnesses = res;
        cb(null, data);
      }
    })
  }


  Businesspulsecount.pulseChartHourlyResetCountCron = function (cb) {

    let data = {};
    let cronJob = cron.schedule('0 0 */1 * * *', function () {
      let presentDate1 = new Date();
      Businesspulsecount.find({}, function (errBusinesspulsecount, resBusinesspulsecount) {
        if (errBusinesspulsecount) {
          console.log("Error in Businesspulsecount find in cron");
          console.log(errBusinesspulsecount);
        } else if (resBusinesspulsecount.length > 0) {
          for (let i = 0; i < resBusinesspulsecount.length; i++) {
            let pulseId = resBusinesspulsecount[i].id || "hvft";
            Businesspulsecount.updateAll({ "id": pulseId }, { "counts": 10 });
          }
        } else {
          console.log("No Records found in Businesspulsecount in Hourly Count reset cron Api...");
        }

      })
    })
    data.isSuccess = true;
    data.message = "PulseCount Hourly Count reset Api Triggered...";
    cb(data);
  }


  Businesspulsecount.savePulseCharts = function (details) {
    // console.log(details);
    const Business = app.models.Business;
    const businessName = details.businessName;
    const businessId = details.businessId;
    let t = details.date;
    t = new Date(details.date);
    let date = new Date(t);
    date.setMinutes(0);
    date.setSeconds(0);
    // let hour = date.getHours();
    // hour = parseInt(hour);


    //  let seconds = date.getSeconds();
    // seconds = parseInt(seconds);

    // let minutes = date.getMinutes();
    // minutes = parseInt(minutes);

    // let day = date.getDate();
    // day = parseInt(day);

    //  let month = date.getMonth();
    // month = parseInt(day);

    // let year = date.getFullYear();
    // year = parseInt(year);

    // console.log(seconds, minutes, hour, day, month, year);

    let pulseObj1 = {
      businessName: businessName,
      time: date
    };

    Businesspulsecount.findOne({ "where": { "businessName": businessName } }, function (err, res) {
      if (err) {
        console.log("error in Businesspulsecount findOne...");
      } else if (res) {
        let oldCount = res.counts;
        let newCount = oldCount + 1;
        pulseObj1.counts = newCount;
        Businesspulsecount.updateAll({ "businessName": businessName }, pulseObj1, function (err1, res1) {
          // console.log(res1);
          let data = "Successfully Updated the count businessName exists condition"
          // cb(null, data);
          console.log(data);
        })
      } else {
        Businesspulsecount.find({}, function (err1, res1) {
          let count = res1.length;
          if (count < 10) {
            pulseObj1.counts = 1;
            pulseObj1.ownerId = businessId;
            Businesspulsecount.create(pulseObj1, function (e, r) {
              if (e) console.log("error in Businesspulsecount Create", e);
              console.log(r, 1);
              let data = "Successfully Created new record in pulse model"
              console.log(data);
              // cb(null, data);
            })
          } else {
            Businesspulsecount.findOne({ "where": { "time": { "lt": date } } }, function (e, r) {
              if (e) console.log("error in Businesspulsecount findOne2", e);
              if (r) {
                let businessNameDate = r.businessName;
                // console.log(businessNameDate);
                pulseObj1.counts = 1;
                Businesspulsecount.updateAll({ "businessName": businessNameDate }, pulseObj1, function (e1, r1) {
                  console.log(r1, 2);
                  let data = "Successfully Updated the count by lessthan date condition"
                  // cb(null, data);
                  console.log(data);

                })
              } else {
                Business.findOne({ "where": { "id": businessId } }, function (e1, r1) {
                  // console.log(r1);
                  if (e1) console.log("error in Business findOne", e1);
                  let hourlyVisitCount = r1.hourlyVisitCount;
                  // console.log(hourlyVisitCount)
                  Businesspulsecount.findOne({ "where": { "counts": { "lt": hourlyVisitCount } } }, function (e2, r2) {
                    // console.log(r2);
                    if (e2) console.log("error in Businesspulsecount findOne3", e2);
                    if (r2) {
                      let pulseId = r2.id;
                      pulseObj1.counts = hourlyVisitCount;
                      // console.log(pulseObj1);
                      // console.log("last");

                      Businesspulsecount.updateAll({ "id": pulseId }, pulseObj1, function (e1, r1) {
                        console.log(r1);
                        let data = "Successfully Updated the count by Business HourCount condition"
                        // cb(null, data);
                        console.log(data);
                      })
                    } else {

                      console.log("Business Count is not Minimum to enter inside pulse chart.");
                      let data = "count not reached to minimum level";
                      console.log(data);
                      // cb(null, data);                
                    }

                  })
                })
              }
            })
          }

        })


      }
    })
  }


  Businesspulsecount.remoteMethod('getBusinesspulsecount', {
    http: { path: '/getBusinesspulsecount', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Finds Businesspulsecount in descending order based on counts...."
  });

  Businesspulsecount.remoteMethod('pulseChartHourlyResetCountCron', {
    http: { path: '/pulseChartHourlyResetCountCron', verb: 'post' },
    description: "Reset the Pulse Chart data count to 10 every Hour...."
  });

  Businesspulsecount.remoteMethod('savePulseCharts', {
    http: { path: '/savePulseCharts', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    description: "Post Pulse Chart data for each Visit...."
  });
};
