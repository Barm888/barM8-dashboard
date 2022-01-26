'use strict';
const app = require('../../server/server');
const cleanDeep = require('clean-deep');
const unique = require('array-unique');

module.exports = function (Slot) {
  Slot.createSlots = function (details, cb) {
    let data = {},
        InstantPrizes = app.models.InstantPrizes,
        startTime = details.startTime,
        endTime = details.endTime,
        frequency = details.frequency,
        promoCode = details.promoCode,
        promoMessage = details.promoMessage,
        datesArray = details.datesArray,
        ownerId = details.ownerId,
        freebie = details.freebie,
        offset = details.offset,
        dashLineId = details.dashLineId,
        giveawayMessage = details.giveawayMessage;

    if (startTime && endTime && frequency && datesArray && ownerId && freebie && dashLineId) {
      startTime = new Date(startTime);
      endTime = new Date(endTime);
      frequency = parseInt(frequency);


      let startTimeHour = startTime.getTime();

      let endTimeHour = endTime.getTime();
     
      let totalMinutesStart = (((startTime.getHours()) * 60) + (startTime.getMinutes()));
      let totalMinutesEnd = (((endTime.getHours()) * 60) + (endTime.getMinutes()));

      let totalMinutes = (parseInt(endTimeHour) - parseInt(startTimeHour)) / 60000;
      if (totalMinutes >= frequency) {
        let noOfSlots = (parseInt(totalMinutes) / frequency) + 1;

        let arrayStart = [];

        let countStart = 0;
        for (let k = 0; k < noOfSlots; k++) {

          let slotStart = parseInt(totalMinutesStart) + parseInt(countStart);

          countStart = countStart + frequency;

          let hrStart = parseInt(slotStart / 60);
          let minStart = parseInt(slotStart % 60);
          let obj1 = { "h": hrStart, "m": minStart };

          arrayStart.push(obj1);
        }
        // console.log(arrayStart);
        let instantPrizesObj = {
          "startTime": startTime,
          "endTime": endTime,
          "frequency": frequency,
          "promoCode": promoCode || "",
          "promoMessage": promoMessage || "",
          "datesArray": datesArray,
          "freebie": freebie,
          "offset": offset || 600,
          "giveawayMessage": giveawayMessage,
          "ownerId": ownerId,
          "dashLineId": dashLineId
        };
        // console.log(instantPrizesObj);
        InstantPrizes.create(instantPrizesObj, function (err, InstPrize) {
          if (err) {
            data.isSuccess = false;
            data.message = "Error in InstantPrize create";
            console.log(err);
            cb(null, data);
          } else {
            // console.log(InstPrize);
            let instPrizeId = InstPrize.id;
            let slotArr = [];

            function setHourAndMinute(slotDate, hour, minute, firstSlotCheck) {
              let sd = new Date(slotDate);
              let timeZoneOffset = sd.getTimezoneOffset();
              let totalMinutes = (hour * 60) + minute + offset;
              if(timeZoneOffset == 0 && (totalMinutes >= 1440)){
                      sd.setDate((sd.getDate()) - 1); 
              sd.setHours(hour);
              sd.setMinutes(minute);
              let obj = {
                "date": sd,
                "instantPrizesId": instPrizeId,
                "isFirstSlot": firstSlotCheck
              };
              Slot.create(obj);

              }else{
              sd.setHours(hour);
              sd.setMinutes(minute);
              let obj = {
                "date": sd,
                "instantPrizesId": instPrizeId,
                "isFirstSlot": firstSlotCheck
              };
              Slot.create(obj);
              }
              

            }
            for (let i = 0; i < datesArray.length; i++) {
              let slotDate = new Date(datesArray[i]);
              for (let j = 0; j < arrayStart.length; j++) {
                // console.log(arrayStart[j].h, arrayStart[j].m);
                let hour = parseInt(arrayStart[j].h),
                    minute = parseInt(arrayStart[j].m),
                    isFirstSlot = (i == 0 && j == 0)? true : false;
                setHourAndMinute(slotDate, hour, minute, isFirstSlot);
              }
            }
            data.isSuccess = true;
            data.message = "Successfully Done";
            cb(data);
          }

        })

      } else {
        data.isSuccess = false;
        data.message = "Please give proper startTime and endTime";
        cb(data);
      }
    } else {
      data.isSuccess = false;
      data.message = "Something missing,Please Provide all details";
      cb(data);
    }
  }



  Slot.getInstantPrizeDetailsBySlotDateAndBusinessId = function (details, cb) {
    let data = {};
    let date = details.date;
    let businessId = details.businessId;
    const InstantPrizes = app.models.InstantPrizes;
    if (date && businessId) {
      let date1 = new Date(date);
      let date2 = new Date(date1);
      date2.setDate(date2.getDate() + 1);
      // console.log(date1, date2);

      InstantPrizes.find({
        "where": { "ownerId": businessId },
        "include": [{
          "relation": "slots",
          "scope": {
            "where": { and: [{ "date": { "gte": date1 } }, { "date": { "lt": date2 } }] }
          }
        }]
      }, function (err, res) {
        if (err) {
          data.isSuccess = false;
          data.errorMessage = err;
          data.message = "Error in InstantPrizes find";
          cb(null, data);
        } else if (res.length > 0) {
          res = JSON.parse(JSON.stringify(res));
          for (let i = 0; i < res.length; i++) {
            if (res[i].slots && res[i].slots.length == 0) {
              res.splice(i, 1);
              i--;
            }
            if (res.length == (i + 1)) {
              data.isSuccess = true;
              data.response = res[0] || "No InstantPrizes found for this date";
              cb(null, data);
            }
          }
        } else {
          data.isSuccess = false;
          data.message = "No InstantPrizes found for this date";
          cb(null, data);
        };
      })
    } else {
      data.isSuccess = true;
      data.message = "Please provide date and businessId";
      cb(null, data);
    }

  }


  Slot.getInstantPrizeDatesOfMonthByBusinessId = function (details, cb) {
    let data = {};
    let businessId = details.businessId;
    let month = parseInt(details.month);
    let year = parseInt(details.year);
    const InstantPrizes = app.models.InstantPrizes;
    if (businessId && month && year) {
      // let day = 1;
      // let dateStr = year+"/"+month+"/"+day;
      //  var date = new Date(dateStr);
      //     var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      //     var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0); 
      InstantPrizes.find({ "where": { "ownerId": businessId } }, function (err, res) {
        if (err) {
          data.isSuccess = false;
          data.errorMessage = err;
          data.message = "Error in InstantPrizes find";
          cb(null, data);
        } else if (res.length > 0) {
          let datesArr = [];
          res = JSON.parse(JSON.stringify(res));

          for (let i = 0; i < res.length; i++) {
            datesArr = datesArr.concat(res[i].datesArray);

            if (res.length == (i + 1)) {
              datesArr = cleanDeep(unique(datesArr));
              let datesArr1 = [];

              for (let j = 0; j < datesArr.length; j++) {
                let d = new Date(datesArr[j]);
                let m = d.getMonth();
                let y = d.getFullYear();
                m = parseInt(m) + 1;
                y = parseInt(y);

                if (m == month && y == year) {
                  datesArr1.push(datesArr[j]);

                }
                if (datesArr.length == (j + 1)) {
                  data.isSuccess = true;
                  data.response = datesArr1;
                  cb(null, data);
                }
              }

            }
          }

        } else {
          data.isSuccess = false;
          data.message = "No InstantPrizes found for this BusinessId";
          cb(null, data);
        };
      })
    } else {
      data.isSuccess = true;
      data.message = "Please provide businessId,month and year";
      cb(null, data);
    }

  }

  Slot.remoteMethod('createSlots', {
    http: { path: '/createSlots', verb: 'post' },

    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Create Slots by given details.."
  });

  Slot.remoteMethod('getInstantPrizeDetailsBySlotDateAndBusinessId', {
    http: { path: '/getInstantPrizeDetailsBySlotDateAndBusinessId', verb: 'get' },

    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "get Instant Prize Details by SlotDate  and BusinessId"
  });

  Slot.remoteMethod('getInstantPrizeDatesOfMonthByBusinessId', {
    http: { path: '/getInstantPrizeDatesOfMonthByBusinessId', verb: 'get' },

    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "get Instant Prize Dates by BusinessId"
  });
};







