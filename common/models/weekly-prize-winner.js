'use strict';

module.exports = function (Weeklyprizewinner) {
  Weeklyprizewinner.createWeeklyprizewinner = function (weeklyprizewinnerDetails, cb) {
    let data = {};
    let date = weeklyprizewinnerDetails.date;
    let freebie = weeklyprizewinnerDetails.freebie;
    let customerId = weeklyprizewinnerDetails.customerId;

    if (date && freebie && customerId) {
      date = new Date(date);
      let year = date.getFullYear();
      let month1 = parseInt(date.getMonth()) + 1;
      let day = parseInt(date.getDate());
      let dateString = `${year}-${("0" + month1).slice(-2)}-${("0" + day).slice(-2)}T00:00:00.000Z`;
      let week;
      var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

      //console.log(date);
      let month = monthNames[date.getMonth()];
      let monthYear = month + "-" + year;

      if (day >= 1 && day <= 7) {
        week = "1";
      }
      else if (day >= 8 && day <= 14) {
        week = "2";
      }
      else if (day >= 15 && day <= 21) {
        week = "3";
      }
      else {
        week = "4";
      }

      let weeklyprizewinnerObj = {
        "date": dateString,
        "freebie": freebie,
        "dateWithHour": date,
        "monthYear": monthYear,
        "week": week || "4",
        "customerId": customerId
      };

      Weeklyprizewinner.create(weeklyprizewinnerObj, function (winnerErr, winnerRes) {
        if (winnerErr) {
          data.isSuccess = false;
          data.message = "Error in weeklyprizewinner create";
          data.error = winnerErr;
          cb(data);
        } else {
          data.isSuccess = true;
          data.message = "weeklyprizewinner created";
          cb(data);
        }
      });

    } else {
      data.isSuccess = false;
      data.message = "Something missing in date,freebie and customerId";
      cb(data);
    }

  }

  Weeklyprizewinner.remoteMethod('createWeeklyprizewinner', {
    http: { path: '/createWeeklyprizewinner', verb: 'post' },
    accepts: { arg: 'weeklyprizewinnerDetails', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Creates Weeklyprizewinner Instance using weeklyPrize details.."
  });
};
