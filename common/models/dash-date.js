

const cron = require('node-cron')
  , pickRandom = require('pick-random')
  , app = require('../../server/server')
  , FCM = require('fcm-push')
  , serverKey = 'AAAA-4BeD_8:APA91bEyi_SURDeuKRLqoDDWsde4wDNFP5TIFCDD8Je2fQBHr_21fpj8zmzZ0pjGW_mT1PWKYZB2QNgMdOJ4p6dhsjEVk-aQUJHV4vgL6VpJEDI4HCxPOhMwVl0qBz-47OGkzyOopaEe'
  , fcm = new FCM(serverKey);
var moment = require('moment-timezone');
const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, //true --> will use ssl
  auth: {
    "user": "barm8global@gmail.com",
    "pass": "Everest@123"
  }
});


function convert12to24(time12h) {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') {
    hours = '00';
  }
  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }
  return hours + ':' + minutes;
}

module.exports = function (Dashdate) {


  Dashdate.observe('before save', (ctx, next) => {
    if (ctx.instance) {
      if (ctx.instance.date) {
        ctx.instance.day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][(new Date(ctx.instance.date)).getDay()];

      }
    }
    next();
  });

  //Meals Menu Header

  Dashdate.getMenuHeader = (details, cb) => {
    let data = {};
    if (details) {
      if (details.date) {
        let date = details.date.dates[0], month = details.date.month, year = details.date.year, id = details.businessId;
        Dashdate.find({ where: { dateNo: date, month, year, ownerId: id }, include: [{ relation: "dashLines", scope: { where: { mainCategory: "Meals" }, include: "dashSubLines" } }] }, (err, res) => {
          if (err) {
            data.isSuccess = false;
            data.message = "date is required!";
          } else if (res) {
            data.isSuccess = true;
            data.result = res;
            cb(null, data);
          }
        });
      } else {
        data.isSuccess = false;
        data.message = "date is required!";
        cb(null, data);
      }
    } else {
      data.isSuccess = false;
      data.message = "Details is required!";
      cb(null, data);
    }
  };

  Dashdate.menuHeaderCreateAndUpdate = (details, cb) => {
    let data = {}, ownerId = details.ownerId, DashLine = app.models.DashLine;
    if (details) {
      if (details.menu) {
        let month = ("0" + details.month).slice(-2), year = details.year;

        let update = (date, dateNo) => {
          return new Promise((resolve, reject) => {
            Dashdate.upsertWithWhere({ date, ownerId }, { month, dateNo, year, date, dateString: date, ownerId }, (err, res) => {
              if (err) {
                data.isSuccess = false;
              } else if (res) {
                if (res && res.id) {
                  DashLine.upsertWithWhere({ mainCategory: "Meals", category: details.menu, dashDateId: res.id }, { mainCategory: "Meals", category: details.menu, dashDateId: res.id }, (dashLineErr, dashLineRes) => {
                    if (dashLineErr) {
                      data.isSuccess = false;
                    }
                    else if (dashLineRes) {
                      data.isSuccess = true;
                      resolve(data);
                    }
                  });
                }
              }
            });
          });
        };

        details.dates.forEach((v, k) => {
          let date = `${year}-${month}-${("0" + v).slice(-2)}T00:00:00.000Z`, dateNo = ("0" + v).slice(-2);
          update(date, dateNo).then((data) => {
            if (data.isSuccess && (k + 1 == details.dates.length)) {
              cb(null, data);
            }
          });
        });
      } else {
        data.isSuccess = false;
        data.message = "Menu is required!";
        cb(null, data);
      }
    } else {
      data.isSuccess = false;
      data.message = "Details is required!";
      cb(null, data);
    }
  };
  //End

  Dashdate.upsertDashDateForLoyalty = (details, cb) => {
    let DashLine = app.models.DashLine, loyaltyNotificationCron = app.models.loyaltyNotificationCron, data = {};
    if (details) {
      if (details.dateArray) {
        details.dateArray.forEach(async (val, key) => {
          await Dashdate.upsertWithWhere({ dateString: val.dateFormat, ownerId: val.businessId }, { year: val.year, month: val.month, dateOnly: val.date, dateString: val.dateFormat, date: val.dateFormat, ownerId: val.businessId }, async (DashdateErr, DashdateRes) => {
            if (DashdateRes) {
              await DashLine.upsertWithWhere({ category: val.category, mainCategory: val.mainCategory, dashDateId: DashdateRes.id, _12_time: val.time12Format }, {
                dashDateId: DashdateRes.id, mainCategory: val.mainCategory, category: val.category, date: val.dateFormat, timeZoneOffSet: val.timeZoneOffSet,
                price: val.price, isGroup: "no", _24_time: val.time24Format, _12_time: val.time12Format, timeUtc: val.loyaltyTimeUTC
              }, (dashLineErr, dashLineRes) => {
                var utcDateandTime = new Date(val.loyaltyTimeUTC);
                loyaltyNotificationCron.create({
                  businessId: val.businessId, dateTimeUtc: val.loyaltyTimeUTC, category: val.category, price: val.price,
                  year: utcDateandTime.getFullYear(), month: utcDateandTime.getMonth(), date: utcDateandTime.getDate(), hour: utcDateandTime.getHours(), minute: utcDateandTime.getMinutes(), second: utcDateandTime.getSeconds()
                }, (notificitionErr, notificitionRes) => {
                  if ((key + 1) == details.dateArray.length) {
                    data.isSuccess = true;
                    data.message = "Data has been inserted";
                    cb(null, data);
                  }
                });
              });
            }
          });
        });
      } else {
        data.isSuccess = false;
        data.message = "details is empty";
        cb(null, data);
      }
    } else {
      data.isSuccess = false;
      data.message = "details is empty";
      cb(null, data);
    }
  };

  Dashdate.getLoyaltyData = (details, cb) => {
    let data = {}
      , businessId = details.businessId
      , date = `${details.date.year}-${("0" + details.date.month).slice(-2)}-${("0" + details.date.dates[0]).slice(-2)}T00:00:00.000Z`;
    Dashdate.find({ where: { dateString: date, ownerId: businessId }, include: { relation: 'dashLines', scope: { fields: ['id', 'category', '_12_time', 'price'] } }, fields: { id: true, dateString: true } }, (err, res) => {
      if (res && res.length > 0) {
        data.isSuccess = true;
        data.result = res;
        data.message = "data has been got successfully.";
        cb(null, data);
      } else {
        data.isSuccess = false;
        data.message = "No data.Please try again";
        cb(null, data);
      }
    });
  };

  Dashdate.getMonthDataInLoyalty = (details, cb) => {
    let data = {};
    if (details) {
      if (details.businessId) {
        Dashdate.find({
          where: { year: details.year, month: details.month, ownerId: details.businessId },
          fields: { id: true, date: true, dateOnly: true }
        }, (err, res) => {
          data.isSuccess = true;
          data.result = res;
          cb(null, data);
        });
      } else {
        data.isSuccess = false;
        data.mesage = "Please try again!"
        cb(null, data);
      }

    } else {
      data.isSuccess = false;
      data.mesage = "Please try again!"
      cb(null, data);
    }
  };

  Dashdate.deleteLoyaltyData = (details, cb) => {
    let DashLine = app.models.DashLine, data = {};
    if (details) {
      if (details.dashLineId) {
        DashLine.find({ where: { id: details.dashLineId } }, (err, res) => {
          if (res && res.length > 0) {
            if (res.length == 1) {
              DashLine.count({ dashDateId: res[0].dashDateId }, (dashLineCounterr, dashLineCountres) => {
                if (dashLineCountres == 1) {
                  Dashdate.count({ id: res[0].dashDateId }, (dashDateCounterr, dashDateCountres) => {
                    if (dashDateCountres == 1) {
                      Dashdate.deleteById(res[0].dashDateId);
                    }
                  });
                } else {
                  DashLine.deleteById(details.dashLineId);
                }
              });
            } else {
              DashLine.deleteById(details.dashLineId);
            }
            data.isSuccess = true;
            data.mesage = "Deleted has been successfully.."
            cb(null, data);
          }
        });
      } else {
        data.isSuccess = false;
        data.mesage = "Please try again!"
        cb(null, data);
      }

    } else {
      data.isSuccess = false;
      data.mesage = "Please try again!"
      cb(null, data);
    }
  };


  Dashdate.upsertMultipleCategoryInMeals = (details, cb) => {
    //Initializing objects
    let data = {};

    const Business = app.models.Business, DashDate = app.models.DashDate, DashLine = app.models.DashLine, DashSubLine = app.models.DashSubLine, bistroHours = app.models.bistroHours;
    var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    //Extracting input properties
    let category, businessId = details.businessId, month = details.month, isServedIn = details.dashSubLine[0].isServedIn, year = details.year, price = details.dashSubLine[0].price, menu = details.dashSubLine[0].menu,
      ingredients = details.dashSubLine[0].ingredients,
      mainCategory = details.mainCategory, sequence, isGroup;
    if (details) {
      var arrayObj = [];

      function ValidIsServedIn(arg) {
        return new Promise((resolve, reject) => {
          isServedIn = { breakfast: false, lunch: false, dinner: false, allDay: false };
          if (arg[0].breakfastStartTime && arg[0].breakfastEndTime) {
            isServedIn.breakfast = true;
          }
          if (arg[0].lunchStartTime && arg[0].lunchEndTime) {
            isServedIn.lunch = true;
          }
          if (arg[0].dinnerStartTime && arg[0].dinnerEndTime) {
            isServedIn.dinner = true;
          }
          if (arg[0].alldayStartTime && arg[0].alldayEndTime) {
            isServedIn.allDay = true;
          }
          resolve(isServedIn);
        });
      }


      details.date.forEach(async (dateVal, datekey) => {

        let monthString = ("0" + month).slice(-2);

        let date = `${year}-${month}-${("0" + dateVal).slice(-2)}T00:00:00.000Z`,
          dateString = `${year}-${month}-${("0" + dateVal).slice(-2)}T00:00:00.000Z`;

        await DashDate.find({ where: { ownerId: businessId, dateString: dateString } }, async (err, res) => {

          if (res && res.length == 0) {

            await DashDate.upsertWithWhere({ ownerId: businessId, dateString: dateString }, { date: date, dateString: dateString, ownerId: businessId, dateNo: dateVal, month: monthString, year: year }, async (dashDateErr, dashDateRes) => {

              await details.startAndEndTime.forEach(async (val, key) => {
                let startTime = null, endTime = null;

                if (val.category == 'Allday') {
                  val.category = 'All_Day';
                }

                switch (val.category) {
                  case 'Breakfast':
                    isGroup = "no";
                    sequence = 60;
                    startTime = val.startTime;
                    endTime = val.endTime;
                    break;
                  case 'Lunch':
                    isGroup = "no";
                    sequence = 70;
                    startTime = val.startTime;
                    endTime = val.endTime;
                    break;
                  case 'Dinner':
                    isGroup = "no";
                    sequence = 80;
                    startTime = val.startTime;
                    endTime = val.endTime;
                    break;
                  case 'All_Day':
                    isGroup = "no";
                    sequence = 90;
                    startTime = val.startTime;
                    endTime = val.endTime;
                    break;
                  default:
                    isGroup = "no";
                    sequence = 300;
                    startTime = val.startTime;
                    endTime = val.endTime;
                }

                if (dashDateRes) {

                  var day = weekday[(new Date(`${monthString}/${("0" + dateVal).slice(-2)}/${year}`)).getDay()],
                    isTrue = false;
                  await bistroHours.find({ where: { day, ownerId: businessId } }, async (bistroErr, bistroRes) => {

                    if (bistroRes && bistroRes.length > 0) {
                      if (val.category == 'Breakfast') {
                        if (bistroRes[0].breakfastStartTime && bistroRes[0].breakfastEndTime) {
                          isTrue = true;
                        } else {
                          isTrue = false;
                        }
                      }
                      if (val.category == 'Lunch') {
                        if (bistroRes[0].lunchStartTime && bistroRes[0].lunchEndTime) {
                          isTrue = true;
                        } else {
                          isTrue = false;
                        }
                      }
                      if (val.category == 'Dinner') {
                        if (bistroRes[0].dinnerStartTime && bistroRes[0].dinnerEndTime) {
                          isTrue = true;
                        } else {
                          isTrue = false;
                        }
                      }
                      if (val.category == 'All_Day' || val.category == 'Allday') {
                        if (bistroRes[0].alldayStartTime && bistroRes[0].alldayEndTime) {
                          isTrue = true;
                        } else {
                          isTrue = false;
                        }
                      }

                      if (isTrue) {
                        await DashLine.find({ where: { "category": val.category, "date": date, "dashDateId": dashDateRes.id } }, async (dashLineFindErr, dashLineFindRes) => {
                          if (dashLineFindRes && dashLineFindRes.length == 0) {
                            await DashLine.upsertWithWhere({ "category": val.category, "date": date, "dashDateId": dashDateRes.id }, { "category": val.category, "dashDateId": dashDateRes.id, "startTime": startTime, "endTime": endTime, sequence: sequence, mainCategory: "Meals", isGroup: isGroup, date: date }, async (dashLineErr, dashLineRes) => {

                              if (dashLineRes) {
                                ValidIsServedIn(bistroRes).then(async (isServedIn) => {
                                  await DashSubLine.create({ price, menu, ingredients, isServedIn, "dashLineId": dashLineRes.id }, (dashSubLineErr, dashSubLineRes) => {
                                    if (dashSubLineRes) {
                                      if (details.date.length == (datekey + 1) && details.startAndEndTime.length == (key + 1)) {
                                        data.isSuccess = true;
                                        data.message = "Data has been created.";
                                        cb(null, data);
                                      }
                                    }
                                  });
                                });
                              }
                            });
                          } else {
                            await DashLine.upsertWithWhere({ "category": val.category, "date": date, "dashDateId": dashDateRes.id }, { "category": val.category, "dashDateId": dashDateRes.id, "startTime": startTime, "endTime": endTime, sequence: sequence, mainCategory: "Meals", isGroup: isGroup, date: date }, async (dashLineErr, dashLineRes) => {
                              if (dashLineRes) {
                                ValidIsServedIn(bistroRes).then(async (isServedIn) => {
                                  await DashSubLine.upsertWithWhere({ price, menu, ingredients, isServedIn, "dashLineId": dashLineRes.id }, (dashSubLineErr, dashSubLineRes) => {
                                    if (dashSubLineRes) {
                                      if (details.date.length == (datekey + 1) && details.startAndEndTime.length == (key + 1)) {
                                        data.isSuccess = true;
                                        data.message = "Data has been created.";
                                        cb(null, data);
                                      }
                                    }
                                  });
                                });
                              }
                            });
                          }
                        });
                      } else {
                        if (details.date.length == (datekey + 1) && details.startAndEndTime.length == (key + 1)) {
                          data.isSuccess = true;
                          data.message = "Data has been created.";
                          cb(null, data);
                        }
                      }
                    }

                  });
                }
              });
            });

          } else {
            if (res && res.length > 0) {

              await details.startAndEndTime.forEach(async (val, key) => {
                let startTime = null, endTime = null;
                if (val.category == 'Allday') {
                  val.category = 'All_Day';
                }
                switch (val.category) {
                  case 'Breakfast':
                    isGroup = "no";
                    sequence = 60;
                    startTime = val.startTime;
                    endTime = val.endTime;
                    break;
                  case 'Lunch':
                    isGroup = "no";
                    sequence = 70;
                    startTime = val.startTime;
                    endTime = val.endTime;
                    break;
                  case 'Dinner':
                    isGroup = "no";
                    sequence = 80;
                    startTime = val.startTime;
                    endTime = val.endTime;
                    break;
                  case 'All_Day':
                    isGroup = "no";
                    sequence = 90;
                    startTime = val.startTime;
                    endTime = val.endTime;
                    break;
                  default:
                    isGroup = "no";
                    sequence = 300;
                    startTime = val.startTime;
                    endTime = val.endTime;
                }

                var day = weekday[(new Date(`${monthString}/${("0" + dateVal).slice(-2)}/${year}`)).getDay()],
                  isTrue = false;

                await bistroHours.find({ where: { day, ownerId: businessId } }, async (bistroErr, bistroRes) => {
                  if (bistroRes && bistroRes.length > 0) {
                    if (val.category == 'Breakfast') {
                      if (bistroRes[0].breakfastStartTime && bistroRes[0].breakfastEndTime) {
                        isTrue = true;
                      } else {
                        isTrue = false;
                      }
                    }
                    if (val.category == 'Lunch') {
                      if (bistroRes[0].lunchStartTime && bistroRes[0].lunchEndTime) {
                        isTrue = true;
                      } else {
                        isTrue = false;
                      }
                    }
                    if (val.category == 'Dinner') {
                      if (bistroRes[0].dinnerStartTime && bistroRes[0].dinnerEndTime) {
                        isTrue = true;
                      } else {
                        isTrue = false;
                      }
                    }
                    if (val.category == 'All_Day' || val.category == 'Allday') {
                      if (bistroRes[0].alldayStartTime && bistroRes[0].alldayEndTime) {
                        isTrue = true;
                      } else {
                        isTrue = false;
                      }
                    }

                    if (isTrue) {
                      await DashLine.find({ where: { "category": val.category, "dashDateId": res[0].id, date: date } }, async (dashLineFindErr, dashNewLineFindRes) => {

                        if (dashNewLineFindRes && dashNewLineFindRes.length == 0) {
                          await DashLine.create({ "category": val.category, "dashDateId": res[0].id, "startTime": startTime, "endTime": endTime, sequence: sequence, mainCategory: "Meals", isGroup: isGroup, date: date }, async (dashLineErr, dashLineRes) => {
                            if (dashLineRes) {
                              ValidIsServedIn(bistroRes).then(async (isServedIn) => {
                                await DashSubLine.upsertWithWhere({ dashLineId: dashLineRes.id, menu }, { price, menu, ingredients, isServedIn, dashLineId: dashLineRes.id }, (dashSubLineErr, dashSubLineRes) => {
                                  if (details.date.length == (datekey + 1) && details.startAndEndTime.length == (key + 1)) {
                                    data.isSuccess = true;
                                    data.message = "Data has been created.";
                                    cb(null, data);
                                  }
                                });
                              });
                            }
                            else {
                              if (details.date.length == (datekey + 1) && details.startAndEndTime.length == (key + 1)) {
                                data.isSuccess = true;
                                data.message = "Data has been created.";
                                cb(null, data);
                              }
                            }
                          });
                        } else {
                          ValidIsServedIn(bistroRes).then(async (isServedIn) => {
                            await DashSubLine.upsertWithWhere({ dashLineId: dashNewLineFindRes[0].id, menu }, { price, menu, ingredients, isServedIn, dashLineId: dashNewLineFindRes[0].id }, (dashSubLineErr, dashSubLineRes) => {
                              if (details.date.length == (datekey + 1) && details.startAndEndTime.length == (key + 1)) {
                                data.isSuccess = true;
                                data.message = "Data has been created.";
                                cb(null, data);
                              }
                            });
                          });
                        }
                      });
                    } else {
                      if (details.date.length == (datekey + 1) && details.startAndEndTime.length == (key + 1)) {
                        data.isSuccess = true;
                        data.message = "Data has been created.";
                        cb(null, data);
                      }
                    }
                  }
                });
              });
            }
          }
        });
      });
    } else {
      data.isSuccess = false;
      data.message = "Please provide categoryArray and upsertDashDateObj in details Object";
      cb(null, data);
    }
  };

  Dashdate.deleteByMenuInMeals = (details, cb) => {
    let data = {};
    const DashSubLine = app.models.DashSubLine,
      DashDate = app.models.DashDate,
      DashLine = app.models.DashLine;
    let dates = details.dates, month = ("0" + details.month).slice(-2), year = details.year, menu = details.menu;
    if (details && details.menu) {

      if (dates && details.businessId) {
        if (month && year) {
          for (let date in dates) {

            DashDate.find({ where: { dateNo: dates[date], month, year, ownerId: details.businessId } }, (err, res) => {
              if (err) {
                data.message = "Not delete.Please try again!";
                data.isSuccess = false;
                cb(null, data);
              }
              if (res && res.length > 0) {

                let index = date;

                DashLine.find({ where: { dashDateId: res[0].id, mainCategory: "Meals" } }, (dashLineErr, dashLineRes) => {
                  if (dashLineErr) {
                    data.message = "Not delete.Please try again!";
                    data.isSuccess = false;
                    cb(null, data);
                  }
                  if (dashLineRes && dashLineRes.length > 0) {
                    dashLineRes.forEach((data, i) => {
                      DashSubLine.find({ where: { menu, dashLineId: data.id } }, (DashSuberr, DashSubres) => {
                        if (DashSuberr) {
                          data.message = "Not delete.Please try again!";
                          data.isSuccess = false;
                          cb(null, data);
                        }
                        if (DashSubres && DashSubres.length > 0) {
                          DashSubres.forEach((subLineData, index) => {
                            DashSubLine.deleteById(subLineData.id, (errSubLine, subLineRes) => {
                              if (errSubLine) {
                                data.message = "Not delete.Please try again!";
                                data.isSuccess = false;
                                cb(null, data);
                              } else {
                                let dashLineId = subLineData.dashLineId;
                                if ((index + 1) == DashSubres.length) {
                                  DashLine.find({ where: { id: dashLineId, mainCategory: "Meals" }, "include": "dashSubLines" }, (dashLineError, dashLineResult) => {
                                    if (dashLineError) {
                                      data.message = "Not delete.Please try again!";
                                      data.isSuccess = false;
                                      cb(null, data);
                                    } else {
                                      dashLineResult = JSON.parse(JSON.stringify(dashLineResult));
                                      if (dashLineResult && dashLineResult[0].dashSubLines && dashLineResult[0].dashSubLines.length == 0) {
                                        DashLine.deleteById(dashLineResult[0].id, (dashLineE, dashLineR) => {
                                          if (dashLineE) {
                                            data.message = "Not delete.Please try again!";
                                            data.isSuccess = false;
                                            cb(null, data);
                                          } else {
                                            DashDate.find({ where: { id: dashLineResult[0].dashDateId }, "include": "dashLines" }, (dDateE, dDateR) => {
                                              if (dDateE) {
                                                data.message = "Not delete.Please try again!";
                                                data.isSuccess = false;
                                                cb(null, data);
                                              } else {
                                                dDateR = JSON.parse(JSON.stringify(dDateR));
                                                if (dDateR && dDateR.length > 0 && dDateR[0].dashLines && dDateR[0].dashLines.length == 0) {
                                                  DashDate.deleteById(dDateR[0].id);
                                                }
                                              }
                                            });
                                          }
                                        });
                                      }
                                    }
                                  });
                                }
                              }
                            });
                          });

                        }
                      });
                    });
                    if ((index + 1) == dates.length) {
                      data.res = res;
                      data.isSuccess = true;
                      cb(null, data);
                    }

                  } else {
                    data.message = "Not delete.Please try again!";
                    data.isSuccess = false;
                    cb(null, data);
                  }

                });
              } else {
                data.message = "Not delete.Please try again!";
                data.isSuccess = false;
                cb(null, data);
              }
            });
          }
        } else {
          data.message = "month and year is required!";
          data.isSuccess = false;
          cb(null, data);
        }
      } else {
        data.message = "date and businessId is required!";
        data.isSuccess = false;
        cb(null, data);
      }
    } else {
      data.isSuccess = false;
      data.message = "Details or Menu is empty.Please try again";
      cb(null, data);
    }
  };

  Dashdate.upsertDashDate = function (details, cb) {

    //Initializing objects
    let data = {};
    const Business = app.models.Business,
      DashDate = app.models.DashDate,
      DashLine = app.models.DashLine,
      DashSubLine = app.models.DashSubLine;

    //Extracting input properties
    let category = details.category,
      businessId = details.businessId,
      month = details.month,
      year = details.year,
      startTime = details.startTime,
      endTime = details.endTime,
      mainCategory = details.mainCategory,
      sequence,
      isGroup;
    //Finding isGroup Property by Category Name....

    //Assigning Priority based on Category....
    switch (category) {
      case 'Beer':
        sequence = 10;
        isGroup = "yes";
        break;
      case 'Wine':
        isGroup = "yes";
        sequence = 20;
        break;
      case 'Spirit':
        isGroup = "yes";
        sequence = 30;
        break;
      case 'Cocktail':
        isGroup = "yes";
        sequence = 40;
        break;
      case 'Cider':
        isGroup = "yes";
        sequence = 50;
        break;
      case 'Breakfast':
        isGroup = "no";
        sequence = 60;
        break;
      case 'Lunch':
        isGroup = "no";
        sequence = 70;
        break;
      case 'Dinner':
        isGroup = "no";
        sequence = 80;
        break;
      case 'All_Day':
        isGroup = "no";
        sequence = 90;
        break;
      default:
        isGroup = "no";
        sequence = 300;
    }

    let count = 0;
    // let kCount = 0;
    let subLineArr = details.dashSubLine;

    let existDates = [];

    let dateArray = details.date;
    let lenDate = dateArray.length;
    let fullCount = parseInt(subLineArr.length) * lenDate;

    if (subLineArr.length > 0) {
      for (let i = 0; i < dateArray.length; i++) {

        let date = `${year}-${("0" + month).slice(-2)}-${("0" + dateArray[i]).slice(-2)}T00:00:00.000Z`;
        let dateString = `${year}-${("0" + month).slice(-2)}-${("0" + dateArray[i]).slice(-2)}T00:00:00.000Z`;

        let dashDateObj = { date: date, dateString: dateString, ownerId: businessId, dateNo: ("0" + dateArray[i]).slice(-2), month: ("0" + month).slice(-2), year: year };
        data.res = [];

        let whereObj = { "ownerId": businessId, "dateString": dateString };

        DashDate.upsertWithWhere(whereObj, dashDateObj, function (err, res) {
          if (err) {
            data.isSuccess = false;
            data.errorMessage = err;
            console.log(err);
            count++;
          } else {
            data.isSuccess = true;
            data.message = "dashdate created sucessfully";
            let dashDateId = res.id;

            let whereObjDashLine = {
              "category": category,
              "dashDateId": dashDateId,
              "startTime": startTime,
              "endTime": endTime
            };


            DashLine.find({
              "where": {
                and: [{ "category": category }, { "dashDateId": dashDateId }, { "startTime": startTime }, { "endTime": endTime }]
              }
            }, function (err5, resForFindDashLine) {
              if (err5) {
                data.isSuccess = false;
                data.errorMessage = err5;
                console.log(err5);
                count++;
              } else if (resForFindDashLine.length > 0) {

                let dashLineObj = {
                  category: category,
                  startTime: startTime,
                  endTime: endTime,
                  sequence: sequence,
                  mainCategory: mainCategory || "",
                  isGroup: isGroup,
                  date: date
                };

                DashLine.upsertWithWhere(whereObjDashLine, dashLineObj, function (err1, resForDashLine) {

                  if (err1) {
                    data.isSuccess = false;
                    data.errorMessage = err1;
                    console.log(err1);
                    count++;
                  } else {

                    data.isSuccess = true;
                    data.message = "dashline updated sucessfully";
                    let dashLineId = resForDashLine.id;

                    let startTime1 = subLineArr[0].startTime,
                      endTime1 = subLineArr[0].endTime,
                      price = subLineArr[0].price || 0,
                      size = subLineArr[0].size,
                      brand = subLineArr[0].brand,
                      type = subLineArr[0].type,
                      menu = subLineArr[0].menu,
                      ingredients = subLineArr[0].ingredients,
                      description = subLineArr[0].description;

                    if (price) {
                      price = (parseFloat(price)).toFixed(2)
                    }


                    let whereObjSubline = {};
                    if (category == "Beer" || category == "Wine" || category == "Cider" || category == "Spirit" || category == "Cocktail") {
                      whereObjSubline = { "dashLineId": dashLineId, "price": price, "size": size, "brand": brand, "type": type };
                    } else if (category == "Lunch" || category == "Dinner" || category == "Breakfast" || category == "All_Day") {
                      whereObjSubline = { "dashLineId": dashLineId, "price": price, "menu": menu, "ingredients": ingredients };

                    } else {
                      whereObjSubline = { "dashLineId": dashLineId };
                    }

                    DashSubLine.find({
                      "where": whereObjSubline
                    }, function (err6, resForFindDashSubLine) {
                      if (err6) {
                        data.isSuccess = false;
                        data.errorMessage = err6;
                        count++;
                      } else if (resForFindDashSubLine.length > 0) {
                        let dateTs = new Date();
                        let ts = dateTs.getTime();
                        let dashSublineObj = {
                          startTime: startTime1,
                          endTime: endTime1,
                          size: size,
                          price: price,
                          brand: brand,
                          type: type,
                          menu: menu,
                          ingredients: ingredients,
                          description: description,
                          date: date,
                          modifiedTs: ts
                        };

                        DashSubLine.upsertWithWhere(whereObjSubline, dashSublineObj, function (err2, responseForSubline) {
                          if (err2) {
                            data.isSuccess = false;
                            data.errorMessage = err2;
                            console.log(whereObjSubline, err2);
                            count++;
                          } else {
                            count++;
                            responseForSubline.category = category;

                            if (dateArray.length == count) {
                              data.isSuccess = true;
                              data.message = "DashDate upserted sucessfully";
                              cb(null, data);
                            }
                          }
                        })

                      } else {
                        let dateTs = new Date();
                        let ts = dateTs.getTime();
                        let dashSublineObj = {
                          startTime: startTime1,
                          endTime: endTime1,
                          size: size,
                          price: price,
                          brand: brand,
                          type: type,
                          menu: menu,
                          ingredients: ingredients,
                          description: description,
                          dashLineId: dashLineId,
                          date: date,
                          createTs: ts,
                          modifiedTs: ts
                        };
                        DashSubLine.upsertWithWhere(whereObjSubline, dashSublineObj, function (err2, responseForSubline) {
                          if (err2) {
                            data.isSuccess = false;
                            data.errorMessage = err2;
                            count++;
                          } else {
                            count++;
                            responseForSubline.category = category;

                            if (dateArray.length == count) {
                              data.isSuccess = true;
                              data.message = "DashDate upserted sucessfully";
                              cb(null, data);
                            }
                          }
                        });
                      }
                    });

                  }
                });

              } else {

                let dashLineObj = {
                  category: category,
                  startTime: startTime,
                  endTime: endTime,
                  sequence: sequence,
                  mainCategory: mainCategory || "",
                  isGroup: isGroup,
                  dashDateId: dashDateId,
                  date: date
                };

                DashLine.upsertWithWhere(whereObjDashLine, dashLineObj, function (err1, resForDashLine) {
                  if (err1) {
                    data.isSuccess = false;
                    data.errorMessage = err1;
                    count++;
                  } else {
                    let dashLineId = resForDashLine.id;


                    let startTime1 = subLineArr[0].startTime,
                      endTime1 = subLineArr[0].endTime,
                      price = subLineArr[0].price,
                      size = subLineArr[0].size,
                      brand = subLineArr[0].brand,
                      type = subLineArr[0].type,
                      menu = subLineArr[0].menu,
                      ingredients = subLineArr[0].ingredients,
                      description = subLineArr[0].description;

                    if (price) {
                      price = (parseFloat(price)).toFixed(2)
                    }

                    let whereObjSubline;
                    if (category == "Beer" || category == "Wine" || category == "Cider" || category == "Spirit" || category == "Cocktail") {
                      whereObjSubline = { "dashLineId": dashLineId, "price": price, "size": size, "brand": brand, "type": type };
                    } else if (category == "Lunch" || category == "Dinner" || category == "Breakfast" || category == "All_Day") {
                      whereObjSubline = { "dashLineId": dashLineId, "price": price, "menu": menu, "ingredients": ingredients };

                    } else {
                      whereObjSubline = { "dashLineId": dashLineId };
                    }



                    DashSubLine.find({
                      "where": whereObjSubline,
                    }, function (err6, resForFindDashSubLine) {
                      if (err6) {
                        data.isSuccess = false;
                        data.errorMessage = err6;
                        count++;

                      } else if (resForFindDashSubLine.length > 0) {
                        let dateTs = new Date();
                        let ts = dateTs.getTime();
                        let dashSublineObj = {
                          startTime: startTime1,
                          endTime: endTime1,
                          size: size,
                          price: price,
                          brand: brand,
                          type: type,
                          menu: menu,
                          ingredients: ingredients,
                          description: description,
                          date: date,
                          modifiedTs: ts
                        };

                        DashSubLine.upsertWithWhere(whereObjSubline, dashSublineObj, function (err2, responseForSubline) {

                          if (err2) {
                            data.isSuccess = false;
                            data.errorMessage = err2;
                            console.log(err2);
                            count++;
                          } else {
                            count++;
                            responseForSubline.category = category;
                            data.res.push({ "dashSubLine": responseForSubline });

                            if (dateArray.length == count) {
                              data.isSuccess = true;
                              data.message = "DashDate upserted sucessfully";
                              cb(null, data);
                            }
                          }
                        })
                      } else {
                        let dateTs = new Date();
                        let ts = dateTs.getTime();
                        let dashSublineObj = {
                          startTime: startTime1,
                          endTime: endTime1,
                          size: size,
                          price: price,
                          brand: brand,
                          type: type,
                          menu: menu,
                          ingredients: ingredients,
                          description: description,
                          dashLineId: dashLineId,
                          date: date,
                          createTs: ts,
                          modifiedTs: ts
                        };

                        DashSubLine.upsertWithWhere(whereObjSubline, dashSublineObj, function (err2, responseForSubline) {

                          if (err2) {
                            data.isSuccess = false;
                            data.errorMessage = err2;
                            console.log(err2);
                            count++;
                          } else {
                            count++;
                            responseForSubline.category = category;

                            if (dateArray.length == count) {
                              data.isSuccess = true;
                              data.message = "DashDate upserted sucessfully";
                              cb(null, data);
                            }
                          }
                        });
                      }
                    });

                  }
                });
              }
            });
          }
        });

      }

    } else {
      data.isSuccess = false;
      data.message = "Dashsubline Array is Empty";
      cb(null, data);
    }

  }

  Dashdate.upsertDashDateForAllEvents = function (details, cb) {

    //Initializing objects
    let data = {};
    const Business = app.models.Business
      , DashDate = app.models.DashDate
      , DashLine = app.models.DashLine
      , DashSubLine = app.models.DashSubLine;

    //Extracting input properties
    let businessId = details.businessId
      , month = details.month
      , year = details.year
      , mainCategory = details.mainCategory
      , isGroup
      , dashLineArr = details.dashLine
      , subLineArr = details.dashSubLine
      , existDates = []
      , dateArray = details.date;

    if (dateArray.length > 0) {
      if ((dashLineArr.length > 0) && (subLineArr.length > 0)) {
        for (let i = 0; i < dateArray.length; i++) {

          let date = `${year}-${("0" + month).slice(-2)}-${("0" + dateArray[i]).slice(-2)}T00:00:00.000Z`
            , dateString = `${year}-${("0" + month).slice(-2)}-${("0" + dateArray[i]).slice(-2)}T00:00:00.000Z`
            , dashDateObj = { date , dateString , ownerId: businessId }
            , whereObj = { "ownerId": businessId, dateString  };

          DashDate.upsertWithWhere(whereObj, dashDateObj, function (err, res) {
            if (err) {
              data.isSuccess = false;
              data.errorMessage = err;
              console.log(err);
              data.message = err;
              if ((dateArray.length - 1) == i) {
                cb(null, data);
              }
            } else {
              data.isSuccess = true;
              data.message = "dashdate created sucessfully";
              let dashDateId = res.id;
              // console.log("DashDateID after dash date is created " + dashDateId);

              let category = dashLineArr[0].category,
                startTime = dashLineArr[0].startTime,
                endTime = dashLineArr[0].endTime,
                description = subLineArr[0].description;

              //Assigning Priority based on Category....

              let categories = [{ name: "Australia_Day", isGroup: "no", sequence: 100 },
              { name: "Anzac_Day", isGroup: "no", sequence: 110 }, { name: "Mothers_Day", isGroup: "no", sequence: 120 },
              { name: "Fathers_Day", isGroup: "no", sequence: 130 }, { name: "Oktoberfest", isGroup: "no", sequence: 140 },
              { name: "Melbourne_Cup", isGroup: "no", sequence: 150 }, { name: "Boxing_Day", isGroup: "no", sequence: 160 },
              { name: "St_Patrick’s_Day", isGroup: "no", sequence: 170 }, { name: "New_Year’s", isGroup: "no", sequence: 180 },
              { name: "Live_Band", isGroup: "no", sequence: 190 }, { name: "DJ", isGroup: "no", sequence: 200 },
              { name: "Karaoke", isGroup: "no", sequence: 210 }, { name: "Rugby_League", isGroup: "no", sequence: 220 },
              { name: "AFL", isGroup: "no", sequence: 230 }, { name: "Rugby_Union", isGroup: "no", sequence: 240 },
              { name: "Soccer", isGroup: "no", sequence: 250 }, { name: "UFC", isGroup: "no", sequence: 260 },
              { name: "Cricket", isGroup: "no", sequence: 270 }, { name: "Basketball", isGroup: "no", sequence: 280 },
              { name: "Surfing", isGroup: "no", sequence: 290 }, { name: "NFL", isGroup: "no", sequence: 300 },
              { name: "Poker_Night", isGroup: "no", sequence: 310 }, { name: "Trivia_Night", isGroup: "no", sequence: 320 },
              { name: "Ladies_Night", isGroup: "no", sequence: 330 }]

              let { isGroup = null, sequence = 400 } = categories.find((m) => m.name == category);

              let whereObjDashLine = { category, dashDateId, startTime, endTime };


              DashLine.find({
                "where": {
                  and: [whereObjDashLine]
                }
              }, function (errForFindDashLine, resForFindDashLine) {
                if (errForFindDashLine) {
                  data.isSuccess = false;
                  data.errorMessage = errForFindDashLine;
                  data.message = err1;
                  if ((dateArray.length - 1) == i) {
                    cb(null, data);
                  }
                } else if (resForFindDashLine.length > 0) {

                  let dashLineObj = { category, startTime, endTime, sequence, isGroup, mainCategory, date };

                  DashLine.upsertWithWhere(whereObjDashLine, dashLineObj, function (err1, resForDashLine) {
                    if (err1) {
                      data.isSuccess = false;
                      data.errorMessage = err1;
                      console.log(err1);
                      data.message = err1;
                      if ((dateArray.length - 1) == i) {
                        cb(null, data);
                      }
                    } else {

                      data.isSuccess = true;
                      data.message = "dashline updated sucessfully";
                      let dashLineId = resForDashLine.id;

                      let whereObjSubline = { dashLineId };

                      DashSubLine.find({
                        "where": whereObjSubline,
                      }, function (err6, resForFindDashSubLine) {
                        if (err6) {
                          data.isSuccess = false;
                          data.errorMessage = err6;
                          data.message = err6;
                          if ((dateArray.length - 1) == i) {
                            cb(null, data);
                          }
                        } else if (resForFindDashSubLine.length > 0) {

                          let ts = (new Date()).getTime();
                          let dashSublineObj = { description, date, modifiedTs: ts };

                          DashSubLine.upsertWithWhere(whereObjSubline, dashSublineObj, function (err2, responseForSubline) {

                            if (err2) {
                              data.isSuccess = false;
                              data.errorMessage = err2;
                              data.isSuccess = true;
                              data.message = err2;
                              if ((dateArray.length - 1) == i) {
                                cb(null, data);
                              }
                            } else {
                              data.isSuccess = true;
                              data.message = "dashline Created sucessfully";
                              if ((dateArray.length - 1) == i) {
                                cb(null, data);
                              }
                            }
                          })
                        } else {

                          let ts = (new Date()).getTime();
                          let dashSublineObj = {  description , dashLineId, date , createTs: ts, modifiedTs: ts };

                          DashSubLine.upsertWithWhere(whereObjSubline, dashSublineObj, function (err2, responseForSubline) {

                            if (err2) {
                              data.isSuccess = false;
                              data.errorMessage = err2;
                              data.isSuccess = true;
                              data.message = err2;
                              if ((dateArray.length - 1) == i) {
                                cb(null, data);
                              }
                            } else {
                              data.isSuccess = true;
                              data.message = "dashline Created sucessfully";
                              if ((dateArray.length - 1) == i) {
                                cb(null, data);
                              }
                            }
                          });
                        }
                      });
                    }
                  }) //dashLine upsert
                } else {

                  let dashLineObj = { category, startTime, endTime, sequence, isGroup, mainCategory, dashDateId, date }

                  DashLine.upsertWithWhere(whereObjDashLine, dashLineObj, function (err1, resForDashLine) {
                    if (err1) {
                      data.isSuccess = false;
                      data.errorMessage = err1;
                      if ((dateArray.length - 1) == i) {
                        cb(null, data);
                      }
                    } else {

                      data.isSuccess = true;
                      data.message = "dashline Created sucessfully";
                      let dashLineId = resForDashLine.id;

                      let whereObjSubline = { dashLineId };
                      
                      DashSubLine.find({
                        "where": whereObjSubline,
                      }, function (err6, resForFindDashSubLine) {
                        if (err6) {
                          data.isSuccess = false;
                          data.errorMessage = err6;
                          console.log(err6);
                          data.isSuccess = true;
                          data.message = err6;
                          if ((dateArray.length - 1) == i) {
                            cb(null, data);
                          }
                        } else if (resForFindDashSubLine.length > 0) {

                          let dashSublineObj = { description, date };

                          DashSubLine.upsertWithWhere(whereObjSubline, dashSublineObj, function (err2, responseForSubline) {

                            if (err2) {
                              data.isSuccess = false;
                              data.errorMessage = err2;
                              data.isSuccess = true;
                              data.message = err2;
                              if ((dateArray.length - 1) == i) {
                                cb(null, data);
                              }
                            } else {
                              data.isSuccess = true;
                              data.message = "DashDate upserted sucessfully";
                              if ((dateArray.length - 1) == i) {
                                cb(null, data);
                              }
                            }
                          })
                        } else {

                          let ts = (new Date()).getTime();
                          let dashSublineObj = { description, dashLineId, date, createTs: ts, modifiedTs: ts };

                          DashSubLine.upsertWithWhere(whereObjSubline, dashSublineObj, function (err2, responseForSubline) {

                            if (err2) {
                              data.isSuccess = false;
                              data.errorMessage = err2;
                              console.log(err2);
                              data.isSuccess = true;
                              data.message = err2;
                              if ((dateArray.length - 1) == i) {
                                cb(null, data);
                              }
                            } else {
                              data.isSuccess = true;
                              data.message = "DashLine upserted sucessfully";
                              if ((dateArray.length - 1) == i) {
                                cb(null, data);
                              }
                            }
                          });
                        }
                      });

                    }
                  }); //dashLine upsert
                }
              }); //dashLine find
            }
          });
        }
      } else {
        data.isSuccess = false;
        data.message = "DashLine or Dashsubline Array is Empty";
        cb(null, data);
      }
    } else {
      data.isSuccess = false;
      data.message = "dateArray is Empty";
      cb(null, data);
    }
  }

  Dashdate.upsertDashDateForFreebie = function (details, cb) {

    //Initializing objects
    let data = {};
    const Business = app.models.Business,
      DashDate = app.models.DashDate,
      DashLine = app.models.DashLine,
      Slot = app.models.slot;

    //Extracting input properties
    let businessId = details.businessId,
      month = details.month,
      year = details.year,
      offset = details.offset;

    let dashLineArr = details.dashLine;

    let dateArray = details.date;

    if (dateArray.length > 0) {
      if (dashLineArr.length > 0) {



        for (let i = 0; i < dateArray.length; i++) {

          let date = `${year}-${("0" + month).slice(-2)}-${("0" + dateArray[i]).slice(-2)}T00:00:00.000Z`;
          let dateString = `${year}-${("0" + month).slice(-2)}-${("0" + dateArray[i]).slice(-2)}T00:00:00.000Z`;

          DashDate.upsertWithWhere({ "ownerId": businessId, "dateString": dateString }, { date: date, dateString: dateString, ownerId: businessId }, function (err, res) {
            if (err) {
              data.isSuccess = false;
              data.errorMessage = err;
              console.log(err);
            } else {
              data.isSuccess = true;
              data.message = "dashdate created sucessfully";
              let dashDateId = res.id;

              for (let j = 0; j < dashLineArr.length; j++) {

                let date1 = `${year}-${("0" + month).slice(-2)}-${("0" + dateArray[i]).slice(-2)}T00:00:00.000Z`;

                DashLine.create({
                  category: dashLineArr[j].category,
                  startTime: dashLineArr[j].startTime,
                  endTime: dashLineArr[j].endTime,
                  startTimeDateFormat: dashLineArr[j].startTimeDateFormat,
                  endTimeDateFormat: dashLineArr[j].endTimeDateFormat,
                  freebie: dashLineArr[j].freebie,
                  frequency: dashLineArr[j].frequency,
                  promoCode: dashLineArr[j].promoCode,
                  promoMessage: dashLineArr[j].promoMessage,
                  dashDateId: dashDateId,
                  date: date
                }, (dashLineErr, dashLineRes) => {
                  if (dashLineErr) {
                    console.log("Error in DashLine Create..");
                  } else {

                    Slot.createSlots({
                      startTime: dashLineArr[j].startTimeDateFormat,
                      endTime: dashLineArr[j].endTimeDateFormat,
                      frequency: dashLineArr[j].frequency,
                      promoCode: dashLineArr[j].promoCode,
                      promoMessage: dashLineArr[j].promoMessage,
                      datesArray: [date1],
                      ownerId: businessId,
                      freebie: dashLineArr[j].freebie,
                      offset: offset,
                      dashLineId: dashLineRes.id,
                      giveawayMessage: `• WIN a ${dashLineArr[j].freebie} every ${dashLineArr[j].frequency} mins between \n ${dashLineArr[j].startTime} and ${dashLineArr[j].endTime}.\n\n Turn On Bluetooth or Scan QR Code to Enter the Draw. Good luck!`
                    }, (resCb) => {

                    });
                  }
                });
              }
            }
          });

        }

        data.isSuccess = true;
        data.message = "DashDate upserted sucessfully";
        cb(null, data);
      } else {
        data.isSuccess = false;
        data.message = "DashLine Array is Empty";
        cb(null, data);
      }
    } else {
      data.isSuccess = false;
      data.message = "DateArray is Empty";
      cb(null, data);
    }
  }

  Dashdate.upsertDashDateForFreebieAdmin = function (details, cb) {

    //Initializing objects
    let data = {};
    const Business = app.models.Business,
      DashDate = app.models.DashDate,
      DashLine = app.models.DashLine,
      SlotAdmin = app.models.slotAdmin;

    //Extracting input properties
    let businessId = details.businessId,
      month = details.month,
      year = details.year;

    let dashLineArr = details.dashLine;


    let existDates = [];

    let dateArray = details.date;
    let fullDateArray = [];
    //     for(let d = 0;d < dateArray.length;d++){


    //   // let dateString = `${year}-${("0" + month).slice(-2)}-${("0" + dateArray[i]).slice(-2)}T00:00:00.000Z`;
    // fullDateArray.push(date1);
    // }
    if (dateArray.length > 0) {
      if (dashLineArr.length > 0) {



        for (let i = 0; i < dateArray.length; i++) {

          let date = `${year}-${("0" + month).slice(-2)}-${("0" + dateArray[i]).slice(-2)}T00:00:00.000Z`;
          let dateString = `${year}-${("0" + month).slice(-2)}-${("0" + dateArray[i]).slice(-2)}T00:00:00.000Z`;

          let dashDateObj = { date: date, dateString: dateString, ownerId: businessId };
          let whereObj = { "ownerId": businessId, "dateString": dateString };

          DashDate.upsertWithWhere(whereObj, dashDateObj, function (err, res) {
            if (err) {
              data.isSuccess = false;
              data.errorMessage = err;
              console.log(err);
            } else {
              data.isSuccess = true;
              data.message = "dashdate created sucessfully";
              let dashDateId = res.id;
              console.log("DashDateID after dash date is created " + dashDateId);



              for (let j = 0; j < dashLineArr.length; j++) {
                console.log("inside else if");
                let dashLineObj = {
                  category: dashLineArr[j].category,
                  startTime: dashLineArr[j].startTime,
                  endTime: dashLineArr[j].endTime,
                  startTimeDateFormat: dashLineArr[j].startTimeDateFormat,
                  endTimeDateFormat: dashLineArr[j].endTimeDateFormat,
                  freebieAdmin: dashLineArr[j].freebieAdmin,
                  frequency: dashLineArr[j].frequency,
                  dashDateId: dashDateId,
                  date: date
                };
                let date1 = `${year}-${("0" + month).slice(-2)}-${("0" + dateArray[i]).slice(-2)}T00:00:00.000Z`;


                DashLine.create(dashLineObj, function (dashLineErr, dashLineRes) {
                  if (dashLineErr) {
                    console.log("Error in DashLine Create..");
                  } else {
                    let details = {
                      startTime: dashLineArr[j].startTimeDateFormat,
                      endTime: dashLineArr[j].endTimeDateFormat,
                      frequency: dashLineArr[j].frequency,
                      datesArray: [date1],
                      ownerId: businessId,
                      freebieAdmin: dashLineArr[j].freebieAdmin,
                      dashLineId: dashLineRes.id
                    };
                    // SlotAdmin.createSlots(details, function (resCb) {
                    //   console.log("resFromCreateSlot: " + JSON.stringify(resCb));
                    // });
                  }
                });
              }
            }
          });

        }

        data.isSuccess = true;
        data.message = "DashDate upserted sucessfully";
        cb(null, data);
      } else {
        data.isSuccess = false;
        data.message = "DashLine Array is Empty";
        cb(null, data);
      }
    } else {
      data.isSuccess = false;
      data.message = "DateArray is Empty";
      cb(null, data);
    }
  }

  Dashdate.upsertDashDateForWhatshot = function (details, cb) {
    //Initializing objects
    let data = {};
    const Business = app.models.Business
      , DashDate = app.models.DashDate
      , DashLine = app.models.DashLine
      , Premium = app.models.Premium
      , WhatshotAnalytics = app.models.WhatshotAnalytics
      , SlotWhatsHot = app.models.SlotWhatsHot,
      WhatshotCategory = app.models.WhatshotCategory,
      TicketType = app.models.TicketType;

    //Extracting input properties
    let businessId = details.businessId
      , month = details.month
      , year = details.year
      , dateArray = details.dateArray
      , country = details.country
      , timeZone = details.timeZone
      , whatshotCategoryId = details.whatshotCategoryId
      , eventType = details.eventCategoryType
      , eventTickets = details.eventTickets
      , images = details.images
      , venue = details.venue 
      , organiser = details.organiser
      , teaserMessage = details.teaserMessage
      , promoMessage = details.promoMessage
      , promoCode = details.promoCode
      , desc = details.desc
      , category = details.category
      , eventHeader = details.eventHeader;

    if (!country) {
      country = "Australia";
    }
    if (!timeZone) {
      timeZone = "Australia/Sydney";
    }

    if (dateArray.length > 0) {
      dateArray.forEach(async (val, key) => {

        let dateString = `${val.year}-${("0" + val.month).slice(-2)}-${("0" + val.date).slice(-2)}T00:00:00.000Z`
          , dateObj = val
          , newStartDate = new Date(Date.UTC(val.year, val.month, val.date, val.startTime24h.split(':')[0], val.startTime24h.split(':')[1])).toJSON()
          , newEndDate = new Date(Date.UTC(val.year, val.month, val.date, val.endTime24h.split(':')[0], val.endTime24h.split(':')[1])).toJSON()
          , dashDateObj = { date: dateString, dateString , ownerId: businessId, dateNo: val.date, year: val.year, month: val.month }
          , whereObj = { ownerId : businessId, dateString };


        var momentdate = new Date()
          , CountryDate = moment.tz(momentdate, timeZone).format('YYYY-MM-DD hh:mm A')
          , CountryDateFormat = moment.tz(momentdate, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z"
          , countryStartTime = moment.tz(val.startTimeUtc, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z"
          , countryEndTime = moment.tz(val.endTimeUtc, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";


        dateObj.startDateTimeFormat = newStartDate;
        dateObj.endDateTimeFormat = newEndDate;

        if (!val.timeZoneOffSet) val.timeZoneOffSet = "600";

        primaryImage = (images && images.length ? images.filter(m => m.from == 'whatsHot') : []);

        await DashDate.upsertWithWhere(whereObj, dashDateObj, async  (err1, res1) => {
          if (err1) {
            if ((key + 1) == dateArray.length) {
              data.isSuccess = false;
              data.errorMessage = err1;
              data.message = err1;
              cb(null, data);
            }
          } else {
            if (res1) {

              await DashLine.create({
                whatshotCategoryId, eventType,
                category , _24_startTime: val.startTime24h, _24_endTime: val.endTime24h, startTime: val.startTime12h,
                endTime: val.endTime12h, startTimeDateFormat: newStartDate, endTimeDateFormat: newEndDate, utcStartTime: val.startTimeUtc,
                utcEndTime: val.endTimeUtc, primaryImage, venue, organiser, eventHeader, teaserMessage, promoMessage, desc,
                date: dateString, promoCode , dashDateId: res1.id , 
                country, timeZone, countryWhatshotStartTime: countryStartTime, countryWhatshotEndTime: countryEndTime,
                timeZoneOffSet: val.timeZoneOffSet, drawDuration: val.drawDuration, giveaways: val.giveaways, drawDateAndTimeUtc: val.drawUTCTimeFormat,
                isDraw: val.isDraw, isCutoff: val.isCutoff, entryMessage: val.entryMessage, entryCutoffDateAndTimeUtc: val.cutOofTimeUTCTimeFormat,
                entryCutofftime: val.cutOofTime, entryPromo: val.entryPromo, whatshotFullMsg: val.whatshotFullMsg, popupMsgAfterScan: val.popupMsgAfterScan
              }, async function (err, res) {
                if (err) { } else {

                  for (let ticket of eventTickets) 
                  TicketType.create({ dashLineId: res.id, type: ticket.type, price: ticket.price, availabilityCnt: ticket.availabilityCnt });

                  await WhatshotAnalytics.create({
                    dashDate: res1.dateString, dashDateString: res1.dateString, dateNo: res1.dateNo, year: res1.year, month: res1.month,
                    category , _24_startTime: val.startTime24h, _24_endTime: val.endTime24h, startTime: val.startTime12h,
                    endTime: val.endTime12h, startTimeDateFormat: newStartDate, endTimeDateFormat: newEndDate, utcStartTime: val.startTimeUtc,
                    utcEndTime: val.endTimeUtc, primaryImage, teaserMessage , promoMessage ,  desc , date: dateString, promoCode ,
                    country: country, timeZone: timeZone, countryWhatshotStartTime: countryStartTime, countryWhatshotEndTime: countryEndTime,
                    timeZoneOffSet: val.timeZoneOffSet, drawDuration: val.drawDuration, giveaways: val.giveaways, drawDateAndTimeUtc: val.drawUTCTimeFormat,
                    isDraw: val.isDraw, isCutoff: val.isCutoff, entryMessage: val.entryMessage, entryCutoffDateAndTimeUtc: val.cutOofTimeUTCTimeFormat,
                    entryCutofftime: val.cutOofTime, entryPromo: val.entryPromo, whatshotFullMsg: val.whatshotFullMsg, popupMsgAfterScan: val.popupMsgAfterScan,
                    ownerId: businessId, dashLineId: res.id
                  });

                  await SlotWhatsHot.createSlot({
                    endTime: res.drawDateAndTimeUtc,
                    ownerId: businessId,
                    offset: res.timeZoneOffSet,
                    dashLineId: res.id
                  }, (resCb) => {
                    console.log("Slot is sucessfully Created.");
                  });
                }
                if ((key + 1) == dateArray.length) {
                  data.isSuccess = true;
                  data.message = "DashDate upserted sucessfully";
                  cb(null, data);
                }
              });

            } else {
              if ((key + 1) == dateArray.length) {
                data.isSuccess = false;
                data.errorMessage = err;
                data.message = err;
                cb(null, data);
              }
            }
          }
        });
      });
    } else {
      data.isSuccess = false;
      data.message = "DateArray is Empty";
      cb(null, data);
    }
  }

  Dashdate.removeDashModels = function (details, cb) {
    const DashLine = app.models.DashLine
      , DashSubLine = app.models.DashSubLine;

    let dashSubLineId = details.dashSubLineId
      , dashLineId = details.dashLineId
      , data = {};

    if (dashLineId && dashSubLineId) {

      DashLine.findOne({ "where": { "id": dashLineId }, "include": "dashSubLines" }, function (err, res) {

        if (err) {
          console.log(err);
          data.isSuccess = true;
          data.errorMessage = err;
          data.message = "Error in Dashdate find";
          cb(null, data);
        } else {
          res = JSON.parse(JSON.stringify(res));
          if (res.dashSubLines) {
            if (res.dashSubLines.length > 0 && res.dashSubLines.length == 1) {

              let dashDateId = res.dashDateId;

              Dashdate.findOne({ "where": { "id": dashDateId }, "include": "dashLines" },
                function (errDashDateFind, resDashDateFind) {
                  resDashDateFind = JSON.parse(JSON.stringify(resDashDateFind));
                  if (errDashDateFind) {
                    data.isSuccess = false;
                    data.message = "Error in dashDate findOne";
                    cb(null, data);
                  } else if (resDashDateFind.dashLines.length > 0 && resDashDateFind.dashLines.length == 1) {
                    DashLine.deleteById(dashLineId);
                    DashSubLine.deleteById(dashSubLineId);
                    Dashdate.deleteById(dashDateId);
                    data.res = [resDashDateFind];
                    data.isSuccess = true;
                    data.message = "deleted dashDate,dashLine and dashSubLine instances";
                    cb(null, data);
                  } else if (resDashDateFind.dashLines.length > 0) {
                    DashLine.deleteById(dashLineId);
                    DashSubLine.deleteById(dashSubLineId);
                    data.res = [resDashDateFind];
                    data.isSuccess = true;
                    data.message = "deleted dashLine and dashSubLine instances";
                    cb(null, data);
                  } else {
                    Dashdate.deleteById(dashDateId);
                    data.res = [resDashDateFind];
                    data.isSuccess = false;
                    data.message = "No dashlines found in dashdate id....Dashdate Deleted";
                    cb(null, data);
                  }
                });

            } else if (res.dashSubLines.length > 0) {
              DashLine.findOne({ "where": { "id": dashLineId }, "include": "dashSubLines" }, function (error, result) {
              });
              DashSubLine.deleteById(dashSubLineId, function (err, res) {
                if (res.count == 1) {
                  DashLine.findOne({ "where": { "id": dashLineId }, "include": "dashSubLines" }, function (err1, res1) {
                    data.res = [res1];
                    data.isSuccess = true;
                    data.message = "deleted dashsubline instance";
                    cb(null, data);
                  });
                }
              });
            } else {
              DashLine.deleteById(dashLineId);
              data.isSuccess = false;
              data.message = "No sublines found in dashline id....Dashline Deleted";
              cb(null, data);
            }
          } else {
            data.isSuccess = false;
            data.message = "No delete";
            cb(null, data);
          }
        }
      });
    } else {
      data.isSuccess = false;
      data.message = "Provide dashSubline Id and dashLine Id";
      cb(null, data);
    }
  }

  Dashdate.removeDashModelsForFreebie = function (details, cb) {
    let data = {};
    const DashLine = app.models.DashLine;
    const InstantPrizes = app.models.InstantPrizes;
    let dashLineId = details.dashLineId;
    let dashDateId = details.dashDateId;

    if (dashLineId && dashDateId) {
      Dashdate.findOne({ "where": { "id": dashDateId }, "include": "dashLines" },
        function (errDashDateFind, resDashDateFind) {
          resDashDateFind = JSON.parse(JSON.stringify(resDashDateFind));
          console.log(resDashDateFind);
          if (errDashDateFind) {
            data.isSuccess = false;
            data.message = "Error in dashDate findOne";
            cb(null, data);
          } else if (resDashDateFind && resDashDateFind.dashLines && resDashDateFind.dashLines.length > 0 && resDashDateFind.dashLines.length == 1) {
            DashLine.deleteById(dashLineId);
            Dashdate.deleteById(dashDateId);
            InstantPrizes.removeInstantPrizeByDashLineId(dashLineId);
            data.res = [resDashDateFind];
            data.isSuccess = true;
            data.message = "deleted dashDate and dashLine instance";
            cb(null, data);
          } else if (resDashDateFind && resDashDateFind.dashLines && resDashDateFind.dashLines.length > 0) {
            DashLine.deleteById(dashLineId);
            InstantPrizes.removeInstantPrizeByDashLineId(dashLineId);
            data.res = [resDashDateFind];
            data.isSuccess = true;
            data.message = "deleted dashLine instance";
            cb(null, data);
          } else {
            Dashdate.deleteById(dashDateId);
            data.res = [resDashDateFind];
            data.isSuccess = false;
            data.message = "No dashlines found in dashdate id....Dashdate Deleted";
            cb(null, data);
          }
        });

    } else {
      data.isSuccess = false;
      data.message = "Provide dashDate Id and dashLine Id";
      cb(null, data);
    }
  }

  Dashdate.getDashdateByMonthAndId = function (details, cb) {

    let data = {};
    let businessId = details.businessId;

    let category = details.category;
    let month = details.month - 1;

    let FirstDay = new Date(details.year, month, 1);
    let LastDay = new Date(details.year, (parseInt(month) + 1), 1);

    Dashdate.find({
      "where": {
        and: [{ "ownerId": businessId },
        { "date": { "between": [FirstDay, LastDay] } }
        ]
      },
      "include": {
        "relation": "dashLines",
        "scope": {
          "where": { "category": category },
          "include": {
            "relation": "dashSubLines"
          }
        }
      }
    },
      function (err, res) {
        if (err) {
          data.isSuccess = false;
          data.errorMessage = err;
          data.message = "Error in Dashdate find";
          cb(null, data);
        } else {

          res = JSON.parse(JSON.stringify(res));
          if (res.length > 0) {
            for (let i = 0; i < res.length; i++) {

              if (res[i].dashLines && !res[i].dashLines[0]) {
                res.splice(i, 1);
                i--;
              }
              if ((i + 1) == res.length) {
                data.isSuccess = true;
                data.res = res;
                cb(null, data);
              }
            }
          } else {
            data.isSuccess = true;
            data.res = res;
            cb(null, data);
          }

        }
      });
  }

  Dashdate.getMealsByMonth = function (details, cb) {
    let data = {};
    let businessId = details.businessId;

    Dashdate.find({
      "where": {
        and: [{ "ownerId": businessId },
        { "month": details.month }, { "year": details.year }
        ]
      }, include: {
        relation: "dashLines",
        "scope": {
          "where": { mainCategory: "Meals" }
        }
      }
    }, function (err, res) {
      if (err) {
        console.log(err);
        data.isSuccess = error;
        data.errorMessage = err;
        data.message = "Error in Dashdate find";
        cb(null, data);
      } else {
        data.isSuccess = true;
        data.res = res;
        cb(null, data);
      }
    });

  };



  Dashdate.getMealsByDate = function (details, cb) {
    let data = {};
    let businessId = details.businessId;
    let date = `${details.date.year}-${("0" + details.date.month).slice(-2)}-${("0" + details.date.dates[0]).slice(-2)}T00:00:00.000Z`;

    Dashdate.find({
      "where": {
        and: [{ "ownerId": businessId },
        { "dateString": date }
        ]
      },
      "include": [{
        "relation": "dashLines",
        "scope": {
          "where": { mainCategory: "Meals" },
          "include": {
            "relation": "dashSubLines"
          }
        }
      }]
    },
      function (err, res) {
        if (err) {
          console.log(err);
          data.isSuccess = true;
          data.errorMessage = err;
          data.message = "Error in Dashdate find";
          cb(null, data);
        } else {
          data.isSuccess = true;
          data.res = res;
          cb(null, data);
        }
      });
  };

  Dashdate.getDashdateByDateAndId = function (details, cb) {

    let data = {};
    let businessId = details.businessId;
    let date = `${details.date.year}-${("0" + details.date.month).slice(-2)}-${("0" + details.date.dates[0]).slice(-2)}T00:00:00.000Z`;

    Dashdate.find({
      "where": {
        and: [{ "ownerId": businessId },
        { "dateString": date }]
      },
      "include": [{
        "relation": "dashLines",
        "scope": {
          "where": { "category": details.category },
          "include": {
            "relation": "dashSubLines"
          }
        }
      }]
    },
      function (err, res) {
        if (err) {
          console.log(err);
          data.isSuccess = true;
          data.errorMessage = err;
          data.message = "Error in Dashdate find";
          cb(null, data);
        } else {
          data.isSuccess = true;
          data.res = res;
          cb(null, data);
        }
      });
  }

  Dashdate.getDashdateByDateAndIdForAllEvents = function (details, cb) {
    let data = {};
    let businessId = details.businessId;
    let date = `${details.date.year}-${("0" + details.date.month).slice(-2)}-${("0" + details.date.dates[0]).slice(-2)}T00:00:00.000Z`;

    Dashdate.find({
      "where": {
        and: [{ "ownerId": businessId },
        { "dateString": date }
        ]
      },
      "include": [{
        "relation": "dashLines",
        "scope": {
          "where": { "mainCategory": details.mainCategory },
          "include": {
            "relation": "dashSubLines"
          }
        }
      }]
    },
      function (err, res) {
        if (err) {
          console.log(err);
          data.isSuccess = true;
          data.errorMessage = err;
          data.message = "Error in Dashdate find";
          cb(null, data);
        } else {
          data.isSuccess = true;
          data.res = res;
          cb(null, data);
        }
      });
  }

  Dashdate.getDashdateByMonthAndIdForAllEvents = function (details, cb) {

    let data = {}
      , businessId = details.businessId
      , mainCategory = details.mainCategory
      , month = details.month - 1
      , year = details.year
      , FirstDay = new Date(year, month, 1)
      , LastDay = new Date(year, (month + 1), 0);


    Dashdate.find({
      "where": {
        and: [{ "ownerId": businessId },
        { "date": { "gte": (FirstDay.getFullYear() + "-" + ("0" + (FirstDay.getMonth() + 1)).slice(-2) + "-" + ("0" + FirstDay.getDate()).slice(-2)) + "T00:00:00.000Z", "lte": (LastDay.getFullYear() + "-" + ("0" + (LastDay.getMonth() + 1)).slice(-2) + "-" + ("0" + LastDay.getDate()).slice(-2)) + "T23:59:59.000Z" } }
        ]
      },
      "include": {
        "relation": "dashLines",
        "scope": {
          "where": { "mainCategory": mainCategory },
          "include": {
            "relation": "dashSubLines"
          }
        }
      }
    },
      function (err, res) {

        // console.log(res);

        if (err) {
          data.isSuccess = false;
          data.errorMessage = err;
          data.message = "Error in Dashdate find";
          cb(null, data);
        } else {

          res = JSON.parse(JSON.stringify(res));
          if (res.length > 0) {
            for (let i = 0; i < res.length; i++) {

              if (res[i].dashLines && !res[i].dashLines[0]) {
                res.splice(i, 1);
                i--;
              }
              if ((i + 1) == res.length) {
                data.isSuccess = true;
                data.res = res;
                cb(null, data);
              }
            }
          } else {
            data.isSuccess = true;
            data.res = res;
            cb(null, data);
          }

        }
      });
  }

  Dashdate.startDailyprizesNotification = function (cb) {

    

    let data = {};
    // let Business = app.models.Business;
    let Customer = app.models.Customer;
    let CurrentVisit = app.models.CurrentVisit;
    let InstantPrizeWinner = app.models.InstantPrizeWinner;


    let j = cron.schedule('0 */2 * * * *', function () {
      let presentDate1 = new Date();
      let presentDate = new Date(presentDate1);
      // let presentDate2 = new Date(presentDate1);
      let month = parseInt(presentDate.getMonth()) + 1;
      if (month < 10) {
        month = "0" + month;  
      }
      let year = presentDate.getFullYear();

      let day = presentDate.getDate();
      if (day < 10) {
        day = "0" + day;
      }


      let dateString = `${year}-${month}-${day}T00:00:00.000Z`;
      // presentDate2.setFullYear(1111);
      // presentDate2.setDate(11);
      // presentDate2.setMonth(10);
      // presentDate2 = new Date(presentDate2);

      console.log("cron Triggered");
      console.log(dateString);

      let vari = {
        "where": { "date": dateString },
        "include": ["business",
          {
            "relation": "dashLines",
            "scope": {
              "where": { and: [{ "startTimeDateFormat": { "lte": presentDate } }, { "endTimeDateFormat": { "gte": presentDate } }] }
            }
          }
        ]

      };
      Dashdate.find(vari, function (err2, res2) {
        res2 = JSON.parse(JSON.stringify(res2));

        if (err2) {
          console.log(err2);
        } else if (res2.length > 0) {
          for (let i = 0; i < res2.length; i++) {
            if (!res2[i].dashLines.length) {
              res2.splice(i, 1);
              i--;
            }
          }
          if (res2.length) {
            for (let i = 0; i < res2.length; i++) {

              CurrentVisit.find({ "where": { "ownerId": res2[i].ownerId } }, function (err, res) {

                if (err) {
                  console.log(err);
                } else if (res.length > 0) {
                  let pre = new Date();
                  let preDate = new Date(pre);
                  // let preDateHours = preDate.getHours();
                  // let preDateMinutes = preDate.getMinutes();
                  let selectedVisit = pickRandom(res, { count: 1 });
                  selectedVisit = selectedVisit[0];
                  let startTime = new Date(selectedVisit.startTime);

                  Customer.findOne({ "where": { "id": selectedVisit.customerId } }, function (err1, res1) {
                    if (err1) {
                      console.log(err1);

                    } else if (res1) {
                      let deviceId = res1.deviceId;
                      let token_id = deviceId;
                      let customerName = res1.firstName;
                      let changedDate = new Date(startTime.getTime() - (24 * 60 * 60 * 1000));

                      let instantPrizeWinnerObj = {
                        "freebie": res2[i].freebie,
                        "date": presentDate,
                        "customerId": selectedVisit.customerId,
                        "ownerId": res2[i].ownerId
                      };
                      InstantPrizeWinner.create(instantPrizeWinnerObj);

                      let a = [];
                      a.push(customerName);
                      let data1 = {
                        "image": null,
                        "title": 'sendInstantRewardsNotification',
                        "message": `Congratulations ${customerName}, You won ${res2[i].freebie} in Instant draw prizes.`
                      };

                      let message = {
                        to: token_id,
                        priority: "high",
                        time_to_live: 2219100,


                        data: {
                          data: data1
                        }

                      };

                      fcm.send(message, function (error, response) {

                        if (error) {

                        } else {
                          let custId = selectedVisit.customerId || 'fdgtbnrnrnrtnrnnrtnt';
                          CurrentVisit.destroyAll({ "customerId": custId }, function (err3, res3) {
                            if (err3) {
                              console.log(err3);
                            } else {
                              console.log(res3.count + " records updated in CurrentVisit");
                            }
                          });
                        }
                      });



                    } else {

                      console.log("CustomerId not found...");

                    }
                  })

                } else {
                  console.log("Sorry Still no Scans....");
                }
              });
            }
          } else {
            console.log("No Businesses Found");
          }

        } else {
          console.log("No Businessess Found..");
        }
      })
    })
    data.isSuccess = true;
    data.message = "Notifications for Daily Prizes trigger started for 15 minutes once";
    cb(null, data);
  };

  Dashdate.getTeaserMessages = function (details, cb) {
    let data = {};
    let businessId = details.businessId;



    Dashdate.find({
      "where": { "ownerId": businessId },
      include: {
        "relation": "dashLines",
        "scope": {
          "where": { "category": "Whats_Hot" },
          fields: { teaserMessage: true, id: true }
        }
      }

    }, function (err, res) {

      if (err) {
        data.isSuccess = false;
        data.errorMessage = err;
        console.log(err);
        cb(null, data);
      } else if (res.length > 0) {
        let result = JSON.parse(JSON.stringify(res));
        data.isSuccess = true;
        var arrayList = [];
        if (res.length != 0) {
          for (let i = 0; i < res.length; i++) {

            if (result[i].dashLines.length > 0) {
              if (result[i].dashLines[0].teaserMessage) {
                arrayList.push({ "teaserMessage": result[i].dashLines[0].teaserMessage, "id": result[i].dashLines[0].id });
              }
            }


            if ((i + 1) == res.length) {
              data.premiums = arrayList;
              cb(null, data);
            }
          }
        } else {
          if (res.length == 0) {
            data.premiums = arrayList;
            cb(null, data);
          }
        }

      } else {
        data.isSuccess = false;
        data.errorMessage = "Premium not found for this businessId";

        cb(null, data);

      }
    })
  }


  Dashdate.remoteMethod('getMenuHeader', {
    http: { path: '/getMenuHeader', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get menu header"
  });

  Dashdate.remoteMethod('menuHeaderCreateAndUpdate', {
    http: { path: '/menuHeaderCreateAndUpdate', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Meals Create and Update"
  });

  Dashdate.remoteMethod('deleteByMenuInMeals', {
    http: { path: '/deleteByMenuInMeals', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Meals delete"
  });

  Dashdate.remoteMethod('getMealsByMonth', {
    http: { path: '/getMealsByMonth', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Meals get month data"
  });

  Dashdate.remoteMethod('getMealsByDate', {
    http: { path: '/getMealsByDate', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Meals get  date data"
  });

  Dashdate.remoteMethod('getTeaserMessages', {
    http: { path: '/getTeaserMessages', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "add Interested Count of premium and send notification to customer for given id..."
  });

  Dashdate.remoteMethod('startDailyprizesNotification', {
    http: { path: '/startDailyprizesNotification', verb: 'post' },
    returns: { arg: 'data', type: 'object' }
  });

  Dashdate.remoteMethod('upsertMultipleCategoryInMeals', {
    http: { path: '/upsertMultipleCategoryInMeals', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Multiple category create of DashDate for happyhours and Meals with given data...."
  });

  Dashdate.remoteMethod('upsertDashDate', {
    http: { path: '/upsertDashDate', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "create the DashDate for happyhours and Meals with given data...."
  });

  Dashdate.remoteMethod('upsertDashDateForAllEvents', {
    http: { path: '/upsertDashDateForAllEvents', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "create the DashDate for All Events with given data...."
  });

  Dashdate.remoteMethod('upsertDashDateForFreebie', {
    http: { path: '/upsertDashDateForFreebie', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "create the DashDate for Freebie with given data...."
  });

  Dashdate.remoteMethod('upsertDashDateForFreebieAdmin', {
    http: { path: '/upsertDashDateForFreebieAdmin', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "create the DashDate for Freebie with given data...."
  });

  Dashdate.remoteMethod('upsertDashDateForWhatshot', {
    http: { path: '/upsertDashDateForWhatshott', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "create the DashDate for Whatshot with given data...."
  });

  Dashdate.remoteMethod('getDashdateByMonthAndId', {
    http: { path: '/getDashdateByMonthAndId', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get the dashDates for given criteria...."
  });

  Dashdate.remoteMethod('getDashdateByDateAndId', {
    http: { path: '/getDashdateByDateAndId', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get the dashDates for given criteria...."
  });

  Dashdate.remoteMethod('removeDashModels', {
    http: { path: '/removeDashModels', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Removes dashLines for given criteria...."
  });

  Dashdate.remoteMethod('getDashdateByDateAndIdForAllEvents', {
    http: { path: '/getDashdateByDateAndIdForAllEvents', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get the dashDates for all events by given criteria ...."
  });

  Dashdate.remoteMethod('getDashdateByMonthAndIdForAllEvents', {
    http: { path: '/getDashdateByMonthAndIdForAllEvents', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get the dashDates for all events by given criteria ...."
  });

  Dashdate.remoteMethod('removeDashModelsForFreebie', {
    http: { path: '/removeDashModelsForFreebie', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Removes dashLines in Freebie for given criteria...."
  });

  Dashdate.remoteMethod('upsertDashDateForLoyalty', {
    http: { path: '/upsertDashDateForLoyalty', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Loyalty create and update..."
  });

  Dashdate.remoteMethod('getLoyaltyData', {
    http: { path: '/getLoyaltyData', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Loyalty data get api..."
  });

  Dashdate.remoteMethod('getMonthDataInLoyalty', {
    http: { path: '/getMonthDataInLoyalty', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Loyalty month data get api..."
  });

  Dashdate.remoteMethod('deleteLoyaltyData', {
    http: { path: '/deleteLoyaltyData', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Loyalty delete api..."
  });

};
