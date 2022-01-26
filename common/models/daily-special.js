
const app = require('../../server/server');
const moment = require('moment-timezone');
const imageToBase64 = require('image-to-base64');

module.exports = function (Dailyspecial) {

    Dailyspecial.getBase64 = (params, cb) => {
        if (params) {
            let { url } = params;
            imageToBase64(`${url}`).then((response) => {
                cb(null, { isSuccess: true, message: "Success", result: `data:image/png;base64,${response}` })
            }).catch((error) => {
                cb(null, { message: "Error", isSuccess: false, res: [] });
            })
        } else cb(null, { message: "Error", isSuccess: false, res: [] });
    }

    Dailyspecial.createAndUpdate = (params, cb) => {

        let isSuccess = (message = "Please try again!", isSuccess = false, res = {}) => cb(null, { message, isSuccess, res });

        if (params) {
            let { ownerId, title, titleTxt, desc, categories, groupId, status, timeZone = "Australia/Sydney", isSpecial } = params;

            categories.forEach(async (val) => {

                let createObj = {};

                if (!isSpecial) {
                    createObj = {
                        category: val.category, _category: val._category,
                        ownerId, img: val.img, dateFormat: val.dateFormat, startTime: val.startTime, titleTxt, startUnixTime: val.startUnixTime,
                        endTime: val.endTime, endHour: val.endHour, endMinute: val.endMinute, startHour: val.startHour, isSpecial: val.isSpecial,
                        startMinute: val.startMinute, title, desc, groupId, monthTxt: val.month, year: val.year, month: val.month,
                        dateNo: val.dateNo, dailySpecialCategoryId: val.id, date: val.date, endUnixTime: val.endUnixTime, status, isEmptyEndTime: val.isEmptyEndTime
                    }
                } else {
                    createObj = {
                        category: val.category, _category: val._category,
                        ownerId, img: val.img, dateFormat: val.dateFormat, startTime: val.startTime, titleTxt, startUnixTime: val.startUnixTime,
                        endTime: val.endTime, endHour: val.endHour, endMinute: val.endMinute, startHour: val.startHour, isSpecial: val.isSpecial,
                        startMinute: val.startMinute, title, desc, groupId, monthTxt: val.month, year: val.year, month: val.month,
                        dateNo: val.dateNo, date: val.date, endUnixTime: val.endUnixTime, status, isEmptyEndTime: val.isEmptyEndTime
                    }
                }

                if (status == 'Live') {
                    let momentdate = new Date();
                    createObj.liveDate = moment.tz(momentdate, timeZone).format('YYYY-MM-DD') + 'T00:00:00.000Z';
                    createObj.dateStr = moment.tz(momentdate, timeZone).format('DD-MM-YYYY');
                    createObj.liveTime = moment.tz(momentdate, timeZone).format('hh:mm A');
                    createObj.dateNo = Number(moment.tz(momentdate, timeZone).format('DD'));
                    createObj.month = Number(moment.tz(momentdate, timeZone).format('MM'));
                    createObj.year = Number(moment.tz(momentdate, timeZone).format('YYYY'));
                    createObj.hour = Number(moment.tz(momentdate, timeZone).format('HH'));
                    createObj.minute = Number(moment.tz(momentdate, timeZone).format('MM'));
                }
                if (createObj.dateFormat) {
                    let sdate = createObj.dateFormat.split('-');
                    createObj.date = `${sdate[2]}-${sdate[1]}-${sdate[0]}T00:00:00.000Z`;
                    await Dailyspecial.create(createObj);
                }

            });
            setTimeout(function () { isSuccess("Success", true, {}); }, 200);
        } else isSuccess("params is required", false, {});
    }

    Dailyspecial.removeOldData = (params, cb) => {

        let isCallBack = (isSuccess, message, result = {}) => cb(null, { isSuccess, message, result });

        if (params && params.id) {
            Dailyspecial.deleteById(params.id);
            isCallBack(true, "success", {});
        } else isCallBack(false, "params is required", {});
    }

    Dailyspecial.updateToAllTime = (cb) => {

        let isCallBack = (isSuccess, message, result = {}) => cb(null, { isSuccess, message, result });

        Dailyspecial.find((dErr, dRes) => {

            dRes = JSON.parse(JSON.stringify(dRes));

            dRes.forEach(async val => {

                let sDate = val.dateFormat.split('-');

                let fsDate = new Date(val.date.split('T')[0]);

                fsDate.setHours(val.startHour);
                fsDate.setMinutes(val.startMinute);

                let esDate = new Date(val.date.split('T')[0]);

                if (val.startHour < val.endHour) {
                    esDate.setDate(esDate.getDate() + 1);
                }

                esDate.setHours(val.endHour);
                esDate.setMinutes(val.endMinute);

                await Dailyspecial.upsertWithWhere({ id: val.id }, { startUnixTime: fsDate.getTime(), endUnixTime: esDate.getTime() });
            })
        })

        isCallBack();
    }

    Dailyspecial.updateLiveDateAndTime = (params, cb) => {
        let isCallBack = (isSuccess = false, message = "please try again", result = {}) => cb(null, { isSuccess, message, result });
        if (params) {
            let { id, timeZone = "Australia/Sydney", country = "Australia" } = params;
            let momentdate = new Date(),
                liveDate = moment.tz(momentdate, timeZone).format('YYYY-MM-DD') + 'T00:00:00.000Z',
                date = moment.tz(momentdate, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z",
                dateStr = moment.tz(momentdate, timeZone).format('DD-MM-YYYY'),
                liveTime = moment.tz(momentdate, timeZone).format('hh:mm A'),
                dateNo = Number(moment.tz(momentdate, timeZone).format('DD')),
                month = Number(moment.tz(momentdate, timeZone).format('MM')),
                year = Number(moment.tz(momentdate, timeZone).format('YYYY')),
                hour = Number(moment.tz(momentdate, timeZone).format('HH')),
                minute = Number(moment.tz(momentdate, timeZone).format('MM'));
            Dailyspecial.upsertWithWhere({ id }, { liveDate, liveTime, live: { date, dateStr, time: liveTime, dateNo, month, year, hour, minute } }, (err, res) => {
                isCallBack(true, "Success", {});
            })

        } else isCallBack();
    }

    Dailyspecial.deleteAllDailySpecial = (params = {}, cb) => {
        let isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });
        if (params) {
            let { values } = params;
            if (values && values.length) {
                values.forEach(async (id, i) => {
                    await Dailyspecial.deleteById(id)
                    if ((i + 1) == values.length) setTimeout(() => { isSuccess(true, "Successfully deleted!"); }, 300)
                })

            } else isSuccess();
        } else isSuccess();
    }

    Dailyspecial.updateToDate = (params, cb) => {

        let isSuccess = (message = "Please try again!", isSuccess = false, res = {}) => cb(null, { message, isSuccess, res });

        Dailyspecial.find((err, res) => {
            if (err) isSuccess("Error", false, {});
            else {
                res.forEach(async val => {
                    // console.log(JSON.stringify(val))
                    if (val && val.dateFormat) {
                        let date_1 = val.dateFormat.split('-');
                        let date = `${date_1[2]}-${date_1[1]}-${date_1[0]}T00:00:00.000Z`;
                        console.log(date);
                        await Dailyspecial.upsertWithWhere({ id: val.id }, { date: date })
                    }
                })
            }
        })

        setTimeout(function () {
            isSuccess();
        }, 300);
    }

    Dailyspecial.getByIdData = (params, cb) => {

        let isCallBack = (isSuccess, message, result = {}) => cb(null, { isSuccess, message, result });

        let fields = ["email", "businessName", "location", "currentVisitCnt", "zipCode", "suburb", "venueCapacity", "id", "imageUrl", "primaryImage", "status"];

        try {
            if (params && params.id) {
                let { id } = params;
                Dailyspecial.find({
                    where: { id },
                    include: [{ relation: "business", scope: { fields } },
                    { relation: "dailySpecialCategory" }]
                }, (err, res) => {
                    if (err) isCallBack(false, "Error", err);
                    else if (res && res.length) {
                        res = JSON.parse(JSON.stringify(res))

                        let { titleTxt, date, business, ownerId } = res[0];

                        Dailyspecial.find({ where: { titleTxt, date, ownerId } }, async (aErr, aRes) => {
                            if (aErr) isCallBack(false, "Error", aErr);
                            else {

                                let groupByKey = (array, key) => {
                                    return array
                                        .reduce((hash, obj) => {
                                            if (obj[key] === undefined) return hash;
                                            return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) })
                                        }, {})
                                }

                                let fData = await groupByKey(aRes, 'titleTxt'); let aArray = [];

                                Object.keys(fData).forEach((k, j) => {
                                    let oSData = aRes.find(m => m.titleTxt == k);
                                    let { desc, titleTxt, title, img, status, date } = oSData;
                                    aArray.push({ desc, titleTxt, title, img, status, date, business, data: aRes });
                                })

                                isCallBack(true, "Success", aArray);
                            }
                        })
                    }
                    else isCallBack(false, "No Data!", {});
                });
            } else isCallBack(false, "params is required", {});
        } catch (e) {
            isCallBack(false, "Error", e)
        }
    }

    Dailyspecial.remoteMethod('getBase64', {
        http: { path: '/getBase64', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "getByIdData"
    });

    Dailyspecial.remoteMethod('getByIdData', {
        http: { path: '/getByIdData', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "getByIdData"
    });

    Dailyspecial.remoteMethod('updateToDate', {
        http: { path: '/updateToDate', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "updateToDate"
    });

    Dailyspecial.remoteMethod('deleteAllDailySpecial', {
        http: { path: '/deleteAllDailySpecial', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "remove the old data."
    });

    Dailyspecial.remoteMethod('updateLiveDateAndTime', {
        http: { path: '/updateLiveDateAndTime', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "update the live date and time"
    });

    Dailyspecial.remoteMethod('removeOldData', {
        http: { path: '/removeOldData', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "remove the old data."
    });

    Dailyspecial.remoteMethod('updateToAllTime', {
        http: { path: '/updateToAllTime', verb: 'get' },
        returns: { arg: 'data', type: 'object' },
        description: "updateToAllTime"
    });

    Dailyspecial.remoteMethod('createAndUpdate', {
        http: { path: '/createAndUpdate', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Create and update the data"
    });
};
