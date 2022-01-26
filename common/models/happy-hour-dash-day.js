
const app = require('../../server/server');
var moment = require('moment-timezone');
const cron = require('node-cron');
const imageToBase64 = require('image-to-base64');

module.exports = function (Happyhourdashday) {

    Happyhourdashday.getBase64 = (params, cb) => {
        if (params) {
            let { url } = params;
            imageToBase64(`${url}`).then((response) => {
                cb(null, { isSuccess: true, message: "Success", result: `data:image/png;base64,${response}` })
            }).catch((error) => {
                cb(null, { message: "Error", isSuccess: false, res: [] });
            })
        } else cb(null, { message: "Error", isSuccess: false, res: [] });
    }

    Happyhourdashday.createAndUpdate = (params, cb) => {

        let isSuccess = (message = "Please try again!", isSuccess = false, res = {}) => cb(null, { message, isSuccess, res });

        if (params) {
            let { ownerId, title, desc, category, groupId, mainCategory, titleTxt, dateValues, status, timeZone = "Australia/Sydney" } = params;

            dateValues.forEach(async (data, i) => {

                let { startTime, start_hour, start_minute, startTimeUnix, endTime, end_hour, end_minute,
                    endTimeUnix, dateFormat, date, dateNo, month, year, img, day } = data;

                let createObj = {
                    ownerId, title, desc, category, groupId, mainCategory,
                    titleTxt, startTime, start_hour, start_minute,
                    startTimeUnix, endTime, end_hour, end_minute, endTimeUnix,
                    dateFormat, date, dateNo, month, year, img, day, status
                }

                let momentdate = new Date();
                if (status == 'Live') {
                    createObj.liveDate = moment.tz(momentdate, timeZone).format('YYYY-MM-DD') + 'T00:00:00.000Z';
                    createObj.dateStr = moment.tz(momentdate, timeZone).format('DD-MM-YYYY');
                    createObj.liveTime = moment.tz(momentdate, timeZone).format('hh:mm A');
                    createObj.dateNo = Number(moment.tz(momentdate, timeZone).format('DD'));
                    createObj.month = Number(moment.tz(momentdate, timeZone).format('MM'));
                    createObj.year = Number(moment.tz(momentdate, timeZone).format('YYYY'));
                    createObj.hour = Number(moment.tz(momentdate, timeZone).format('HH'));
                    createObj.minute = Number(moment.tz(momentdate, timeZone).format('MM'));
                }

                await Happyhourdashday.create(createObj);

            });
            isSuccess("Success", true, {});
        } else isSuccess();
    }

    Happyhourdashday.remove = (params, cb) => {

        let isCallBack = (isSuccess, message, result = {}) => cb(null, { isSuccess, message, result });

        if (params && params.id) {
            Happyhourdashday.deleteById(params.id, (err, res) => isCallBack(true, "Success", {}));
        } else isCallBack();
    }


    // if (status == 'Live') {
    //     let momentdate = new Date();
    //     createObj.liveDate = moment.tz(momentdate, timeZone).format('YYYY-MM-DD') + 'T00:00:00.000Z';
    //     createObj.date = moment.tz(momentdate, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";
    //     createObj.dateStr = moment.tz(momentdate, timeZone).format('DD-MM-YYYY');
    //     createObj.liveTime = moment.tz(momentdate, timeZone).format('hh:mm A');
    //     createObj.dateNo = Number(moment.tz(momentdate, timeZone).format('DD'));
    //     createObj.month = Number(moment.tz(momentdate, timeZone).format('MM'));
    //     createObj.year = Number(moment.tz(momentdate, timeZone).format('YYYY'));
    //     createObj.hour = Number(moment.tz(momentdate, timeZone).format('HH'));
    //     createObj.minute = Number(moment.tz(momentdate, timeZone).format('MM'));
    // }

    Happyhourdashday.updateLiveDateAndTime = (params, cb) => {

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
            Happyhourdashday.upsertWithWhere({ id }, { liveDate, liveTime, live: { date, dateStr, time: liveTime, dateNo, month, year, hour, minute } }, (err, res) => {
                isCallBack(true, "Success", {});
            })

        } else isCallBack();
    }

    Happyhourdashday.statusUpdateToAll = (params, cb) => {

        let isCallBack = (isSuccess = false, message = "please try again", result = {}) => cb(null, { isSuccess, message, result });
        if (params) {
            let { id, timeZone = "Australia/Sydney", country = "Australia" } = params;
            let momentdate = new Date('2021-10-02'),
                liveDate = moment.tz(momentdate, timeZone).format('YYYY-MM-DD') + 'T00:00:00.000Z',
                date = moment.tz(momentdate, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z",
                dateStr = moment.tz(momentdate, timeZone).format('DD-MM-YYYY'),
                liveTime = moment.tz(momentdate, timeZone).format('hh:mm A'),
                dateNo = Number(moment.tz(momentdate, timeZone).format('DD')),
                month = Number(moment.tz(momentdate, timeZone).format('MM')),
                year = Number(moment.tz(momentdate, timeZone).format('YYYY')),
                hour = Number(moment.tz(momentdate, timeZone).format('HH')),
                minute = Number(moment.tz(momentdate, timeZone).format('MM'));
            Happyhourdashday.find({
                where: {
                    isCreated: { gte: "2021-12-01" }
                }
            }, (err, res) => {
                res = JSON.parse(JSON.stringify(res));
                res.forEach(async (val) => {
                    let newdate = val.dateFormat.split('-');
                    let date = `${newdate[2]}-${newdate[1]}-${newdate[0]}T00:00:00.000Z`;
                    // await Happyhourdashday.upsertWithWhere({ id: val.id }, { liveDate, liveTime, live: { date, dateStr, time: liveTime, dateNo, month, year, hour, minute } }, (err_1, res_1) => {
                    //     console.log(err_1);
                    //     console.log(res_1);
                    // })
                    await Happyhourdashday.upsertWithWhere({ id: val.id }, { date }, (err_1, res_1) => {
                        console.log(res_1.dateFormat, res_1.date);
                    })
                })
                setTimeout(function () {
                    isCallBack(true, "Success", {});
                }, 200);
            })

        } else isCallBack();
    }

    Happyhourdashday.deleteAllDrinksSpecial = (params = {}, cb) => {
        let isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });
        if (params) {
            let { values } = params;
            if (values && values.length) {
                values.forEach(async (id, i) => {
                    await Happyhourdashday.deleteById(id)
                    if ((i + 1) == values.length) setTimeout(() => { isSuccess(true, "Successfully deleted!"); }, 300)
                })

            } else isSuccess();
        } else isSuccess();
    }

    Happyhourdashday.getByIdData = (params, cb) => {

        let isCallBack = (isSuccess, message, result = {}) => cb(null, { isSuccess, message, result });

        let fields = ["email", "businessName", "location", "currentVisitCnt", "zipCode", "suburb", "venueCapacity", "id", "imageUrl", "primaryImage", "status"];

        try {
            if (params && params.id) {
                let { id } = params;
                Happyhourdashday.find({
                    where: { id },
                    include: [{ relation: "business", scope: { fields } }]
                }, (err, res) => {
                    if (err) isCallBack(false, "Error", err);
                    else if (res && res.length) {

                        res = JSON.parse(JSON.stringify(res))

                        let { titleTxt, date, business, ownerId } = res[0];

                        Happyhourdashday.find({ where: { titleTxt, date, ownerId } }, async (aErr, aRes) => {
                            if (aErr) isCallBack(false, "Error", aErr);
                            else {

                                let groupByKey = (array, key) => {
                                    return array
                                        .reduce((hash, obj) => {
                                            if (obj[key] === undefined) return hash;
                                            return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) })
                                        }, {})
                                }

                                let fData = await groupByKey(aRes, 'titleTxt');

                                let aArray = [];

                                Object.keys(fData).forEach((k, j) => {
                                    let oSData = aRes.find(m => m.titleTxt == k);
                                    let { desc, titleTxt, title, img, status, date } = oSData;
                                    aArray.push({ desc, titleTxt, title, img, status, date, business, data: aRes });
                                })

                                isCallBack(true, "Success", aArray);
                            }
                        });
                    }
                    else isCallBack(false, "No Data!", {});
                });
            } else isCallBack(false, "params is required", {});
        } catch (e) {
            isCallBack(false, "Error", e)
        }
    }

    Happyhourdashday.remoteMethod('getBase64', {
        http: { path: '/getBase64', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "getByIdData"
    });

    Happyhourdashday.remoteMethod('getByIdData', {
        http: { path: '/getByIdData', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "getByIdData"
    });

    Happyhourdashday.remoteMethod('statusUpdateToAll', {
        http: { path: '/statusUpdateToAll', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "update the live date and time"
    });

    Happyhourdashday.remoteMethod('deleteAllDrinksSpecial', {
        http: { path: '/deleteAllDrinksSpecial', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "update the live date and time"
    });

    Happyhourdashday.remoteMethod('updateLiveDateAndTime', {
        http: { path: '/updateLiveDateAndTime', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "update the live date and time"
    });

    Happyhourdashday.remoteMethod('remove', {
        http: { path: '/remove', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "remove the old data."
    });

    Happyhourdashday.remoteMethod('createAndUpdate', {
        http: { path: '/createAndUpdate', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Create and update the happyhour"
    });
};