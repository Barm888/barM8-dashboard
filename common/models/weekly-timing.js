
const cron = require('node-cron');
const app = require('../../server/server');


module.exports = function (Weeklytiming) {

  Weeklytiming.updateAllWithStatus = (params, cb) => {

    let isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });

    if (params) {
      let { ownerId, startTime, startHour, startMinute, endTime, endHour, endMinute, status } = params;

      if (ownerId && ownerId.length) {
        Weeklytiming.find({ where: { ownerId } }, (err, res) => {
          if (err) isSuccess(false, "Please try again!")
          else {
            res = JSON.parse(JSON.stringify(res));
            res.forEach((val, i) => {
              if (val && val.id) {
                let { id } = val;
                Weeklytiming.upsertWithWhere({ id }, {
                  startTime, startHour, startMinute,
                  endTime, endHour, endMinute, status
                }, (errU, resU) => {
                  if (res.length == (i + 1)) {
                    setTimeout(function () {
                      isSuccess(true, "Successfully updated!")
                    }, 300);
                  }
                })
              }
            })
          }
        })
      } else isSuccess(false, "ownerId is required!")
    } else isSuccess(false, "Params is required!")

  };


  Weeklytiming.createAndUpdate = (params, cb) => {

    let isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });

    if (params) {
      let { openingsHours } = params;

      if (openingsHours && openingsHours.length) {
        openingsHours.forEach(async (val, i) => {
          await Weeklytiming.upsertWithWhere({ ownerId: val.ownerId, day: val.day }, val)
          if ((i + 1) == openingsHours.length) isSuccess(true, "Successfully created.");
        })
      } else isSuccess(false, "openingsHours is required!")
    } else isSuccess(false, "Params is required!")

  };

  Weeklytiming.removeWeekly = (params, cb) => {

    let isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });

    if (params) {
      let { id } = params;

      if (id) {
        Weeklytiming.deleteById(id, (err, res) => {
          console.log(err);
          console.log(res);
          setTimeout(function () {
            isSuccess();
          }, 100);
        })
      } else isSuccess(false, "openingsHours is required!")
    } else isSuccess(false, "Params is required!")

  };

  Weeklytiming.remoteMethod('updateAllWithStatus', {
    http: { path: '/updateAllWithStatus', verb: 'post' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "updateAllWithStatus"
  });

  Weeklytiming.remoteMethod('removeWeekly', {
    http: { path: '/removeWeekly', verb: 'post' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "removeWeekly"
  });

  Weeklytiming.remoteMethod('createAndUpdate', {
    http: { path: '/createAndUpdate', verb: 'post' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Weekly timing create and update"
  });

  Weeklytiming.remoteMethod('weeklytimingUpsertWithWhere', {
    http: { path: '/weeklytimingUpsertWithWhere', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get the dashDates for all events by given criteria ...."
  });
};
