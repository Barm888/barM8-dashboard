'use strict';

module.exports = function (Instantprizewinner) {
  Instantprizewinner.createInstantPrizeWinner = function (instantprizewinnerDetails, cb) {
    let data = {},
      date = instantprizewinnerDetails.date,
      freebie = instantprizewinnerDetails.freebie,
      customerId = instantprizewinnerDetails.customerId,
      ownerId = instantprizewinnerDetails.ownerId,
      instantPrizeId = instantprizewinnerDetails.instantPrizeId;

    if (date && freebie && customerId && ownerId) {
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

      let instantprizewinnerObj = {
        "date": dateString,
        "freebie": freebie,
        "dateWithHour": date,
        "monthYear": monthYear,
        "week": week || "4",
        "customerId": customerId,
        "ownerId": ownerId,
        "instantPrizesId": instantPrizeId
      };

      Instantprizewinner.create(instantprizewinnerObj, function (winnerErr, winnerRes) {
        if (winnerErr) {
          data.isSuccess = false;
          data.message = "Error in Instantprizewinner create..";
          data.error = winnerErr;
          cb(data);
        } else {
          data.isSuccess = true;
          data.message = "Instantprizewinner created";
          cb(data);
        }
      });
    } else {
      data.isSuccess = false;
      data.message = "Something missing in date,freebie,customerId and ownerId";
      cb(data);
    }

  }

  Instantprizewinner.remoteMethod('createInstantPrizeWinner', {
    http: { path: '/createInstantPrizeWinner', verb: 'post' },
    accepts: { arg: 'instantprizewinnerDetails', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Creates InstantPrizeWinner Instance using instantPrize details.."
  });
};
