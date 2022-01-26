
let app = require('../../server/server');
const moment = require('moment-timezone');

module.exports = function (Bistrohours) {

  Bistrohours.getData = (params, cb) => {
    let isCallBack = (isSuccess, message, result = []) => cb(null, { isSuccess, message, result });

    if (params) {
      let { ownerId, day, isToday = false, timeZone = "Australia/Sydney" } = params;
      Bistrohours.find({ where: { ownerId, isAppLive: true } }, (err, res) => {
        if (err) isCallBack(false, "Error", err);
        else {
          res = JSON.parse(JSON.stringify(res));
          let reData = [];
          if (res && res.length) {

            let mntdate = new Date(),
              hour = Number(moment.tz(mntdate, timeZone).format('HH')),
              minute = Number(moment.tz(mntdate, timeZone).format('MM'));

            if (hour) hour = ("0" + hour).slice(-2);
            if (minute) minute = ("0" + minute).slice(-2);

            res.forEach((v, i) => {
              if (v[day] && v[day].startTime && v[day].endTime) {
                let { id, menu, isAppLive, isCreate, ownerId } = v;
                if (!isToday) {
                  reData.push({ [day]: v[day], id, menu, isAppLive, isCreate, ownerId });
                }
                else {
                  if (v[day].endHour >= hour) {
                    if (v[day].endMinute <= minute) {
                      reData.push({ [day]: v[day], id, menu, isAppLive, isCreate, ownerId });
                    }
                  }
                }
              }
              if ((i + 1) == res.length) isCallBack(true, "success", reData);
            })
          } else {
            isCallBack(false, "No Data", []);
          }
        }
      })
    } else isCallBack(false, "Params is required.", {})
  }

  Bistrohours.createAndUpdate = (params, cb) => {

    let isCallBack = (isSuccess, message, result = {}) => cb(null, { isSuccess, message, result });

    if (params && params.data) {

      // params.data.forEach(async (val) => {
      //   let { menu, startTime, startHour, startMinute, endTime, endHour, endHour, ownerId, day } = params;


      //   await Bistrohours.find({ where: { ownerId, menu } }, (err, res) => {
      //     if (err) isCallBack(false, "Error", {});
      //     else if (res && res.length) {
      //       let { }
      //     } else {
      //       Bistrohours.create({ [day]: { startTime, startHour, startMinute, endTime, endHour, endHour }, ownerId, menu })
      //     }
      //   })

      // })

      var arr = params.data;


      const unique = [...new Set(params.data.map(item => item.menu))];

      if (unique && unique.length) {
        unique.forEach(async (val) => {
          await Bistrohours.find({ where: { ownerId: params.data[0].ownerId, menu: val } }, (err, res) => {
            if (err) isCallBack(false, "Error", {});
            else if (res && res.length) {
              let unData = params.data.filter(m => m.menu == val);
              //console.log(unData);
              let sunday = {}, monday = {}, tuesday = {}, wednesday = {}, thursday = {}, friday = {}, saturday = {};
              let createObj = {};
              unData.forEach((v) => {
                let { startTime, startHour, startMinute, endTime, endHour, endMinute, day } = v;
                res[0][day] = { startTime, startHour, startMinute, endTime, endHour, endMinute }
              })
              console.log(res);
              //Bistrohours.upsertWithWhere({ menu: val, ownerId: params.data[0].ownerId }, {  })
            } else {
              let unData = params.data.filter(m => m.menu == val);
              let createObj = {};
              unData.forEach((v) => {
                let { startTime, startHour, startMinute, endTime, endHour, endMinute, day } = v;
                createObj[day] = { startTime, startHour, startMinute, endTime, endHour, endMinute, day }
              })
              console.log(createObj);
              //Bistrohours.create({})
            }
          })
        })
      }


      isCallBack(false, "Params is required.", {})

      //console.log(newarr);

      // Bistrohours.upsertWithWhere({ menu, ownerId }, { menu, sunday, monday, tuesday, wednesday, thursday, friday, saturday, ownerId }, () => {
      //   setTimeout(function () {
      //     isCallBack(true, "Success", {});
      //   }, 300)
      // })

      //  let { menu, sunday, monday, tuesday, wednesday, thursday, friday, saturday, ownerId } = params;



      // Bistrohours.upsertWithWhere({ menu, ownerId }, { menu, sunday, monday, tuesday, wednesday, thursday, friday, saturday, ownerId }, () => {
      //   setTimeout(function () {
      //     isCallBack(true, "Success", {});
      //   }, 300)
      // })

    } else isCallBack(false, "Params is required.", {})
  }

  Bistrohours.removeOldData = (params, cb) => {

    let isCallBack = (isSuccess, message, result = {}) => cb(null, { isSuccess, message, result });

    if (params && params.id) {
      Bistrohours.deleteById(params.id, () => {
        setTimeout(function () {
          isCallBack(true, "success", {});
        }, 100)
      });

    } else isCallBack(false, "params is required", {});
  }

  Bistrohours.remoteMethod('getData', {
    http: { path: '/getData', verb: 'get' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "remove the old data"
  });

  Bistrohours.remoteMethod('removeOldData', {
    http: { path: '/remove', verb: 'post' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "remove the old data."
  });

  Bistrohours.remoteMethod('createAndUpdate', {
    http: { path: '/createAndUpdate', verb: 'post' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Create new bistro hours"
  });
};
