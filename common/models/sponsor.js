'use strict';

module.exports = function (Sponsor) {

  //Sponsor create api
  Sponsor.createAndUpsertWithWhere = async function (details, cb) {
    var data = {};
    if (details) {
      if (details.dateArray.length > 0) {
        var arrLength = details.dateArray.length - 1, year = details.year, month = details.month;
        let i = 0;
        for (var val in details.dateArray) {
          details.sponsordata.date = `${year}-${("0" + month).slice(-2)}-${("0" + details.dateArray[val]).slice(-2)}T00:00:00.000Z`;
          details.sponsordata.dateStringFormat = `${year}-${("0" + month).slice(-2)}-${("0" + details.dateArray[val]).slice(-2)}T00:00:00.000Z`;
          await Sponsor.create(details.sponsordata, function (err, res) {
            i = val;
          });
        }
        if (i == arrLength) {
          data.isSuccess = true;
          data.message = "Created successfully.";
          cb(null, data);
        }
      } else {
        data.isSuccess = false;
        data.message = "Not created. Try again!";
        cb(null, data);
      }
    } else {
      data.isSuccess = false;
      data.message = "Not created. Try again!";
      cb(null, data);
    }
  };


  Sponsor.getSponsorByMonthsDates = async function (details, cb) {
    let data = {};

    let month = details.month - 1;
    let year = details.year;
    let FirstDay = new Date(year, (month + 1), 1);
    let LastDay = new Date(year, month + 2, 0);

    await Sponsor.find({
      where: {
        date: { between: [(FirstDay.getFullYear() + "-" + FirstDay.getMonth() + "-" + FirstDay.getDate()), (LastDay.getFullYear() + "-" + LastDay.getMonth() + "-" + LastDay.getDate())] }
      }
    })
      .then(function (res) {
        data.isSuccess = true;
        data.result = res;
        cb(null, data);

      }).catch(function (err) {
        data.isSuccess = false;
        data.message = err;
        cb(null, data);
      }); 
  }


  Sponsor.getSponsorByDateandId = async function (details, cb) {

    let data = {};

    let date = `${details.date.year}-${("0" + details.date.month).slice(-2)}-${("0" + details.date.dates[0]).slice(-2)}T00:00:00.000Z`;
    await Sponsor.find({
      where: {
        dateStringFormat: date
      }
    })
      .then(function (res) {
        data.isSuccess = true;
        data.result = res;
        cb(null, data);

      }).catch(function (err) {
        data.isSuccess = false;
        data.message = err;
        cb(null, data);
      }); 
  }



  Sponsor.remoteMethod('createAndUpsertWithWhere', {
    http: { path: '/createAndUpsertWithWhere', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "create and upaertwithwhere in sponsor"
  });

  Sponsor.remoteMethod('getSponsorByMonthsDates', {
    http: { path: '/getSponsorByMonthsDates', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "get month dates in sponsor"
  });

  Sponsor.remoteMethod('getSponsorByDateandId', {
    http: { path: '/getSponsorByDateandId', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "get date  in sponsor"
  });

};
