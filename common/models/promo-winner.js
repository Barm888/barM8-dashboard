'use strict';

module.exports = function (Promowinner) {
  Promowinner.createPromoWinner = function (promoWinnerDetails, cb) {
    let data = {},
      date = promoWinnerDetails.date,
      freebie = promoWinnerDetails.freebie,
      customerId = promoWinnerDetails.customerId,
      ownerId = promoWinnerDetails.ownerId;

    if (date && freebie && customerId && ownerId) {
      date = new Date(date);
      let year = date.getFullYear(),
        month1 = parseInt(date.getMonth()) + 1,
        day = parseInt(date.getDate()),
        dateString = `${year}-${("0" + month1).slice(-2)}-${("0" + day).slice(-2)}T00:00:00.000Z`,
        week;
      var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

      
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

      let promoWinnerObj = {
        "date": dateString,
        "freebie": freebie,
        "dateWithHour": date,
        "monthYear": monthYear,
        "week": week || "4",
        "customerId": customerId,
        "ownerId": ownerId
      };

      Promowinner.create(promoWinnerObj, function (winnerErr, winnerRes) {
        if (winnerErr) {
          data.isSuccess = false;
          data.message = "Error in Promowinner create..";
          data.error = winnerErr;
          cb(data);
        } else {
          data.isSuccess = true;
          data.message = "Promowinner created";
          cb(data);
        }
      });
    } else {
      data.isSuccess = false;
      data.message = "Something missing in date,freebie,customerId and ownerId";
      cb(data);
    }

  }

  Promowinner.remoteMethod('createPromoWinner', {
    http: { path: '/createPromoWinner', verb: 'post' },
    accepts: { arg: 'promoWinnerDetails', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Creates PromoWinner Instance using PromoWinner details.."
  });
};
