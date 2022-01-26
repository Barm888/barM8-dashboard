const app = require('../../server/server');
var moment = require('moment-timezone');
const cron = require('node-cron');
const imageToBase64 = require('image-to-base64');

module.exports = function (Exclusiveoffer) {

    Exclusiveoffer.getBase64 = (params, cb) => {
        if (params) {
            let { url } = params;
            imageToBase64(`${url}`).then((response) => {
                cb(null, { isSuccess: true, message: "Success", result: `data:image/png;base64,${response}` })
            }).catch((error) => {
                cb(null, { message: "Error", isSuccess: false, res: [] });
            })
        } else cb(null, { message: "Error", isSuccess: false, res: [] });
    }

    Exclusiveoffer.customApi = (cb) => {

        const convertTime12to24 = (time12h) => moment(time12h, 'hh:mm A').format('HH:mm');

        Exclusiveoffer.find({ where: { offerDate: { gte: '2021-09-20' } } }, (err, res) => {
            if (err) cb(null, { isSuccess: true })
            else {
                res.forEach(v => {
                    if (v) {
                        let { offerDateTxt, startTimeTxt, offerExpiryTimeTxt, start, end } = v;
                        console.log(offerDateTxt, startTimeTxt, offerExpiryTimeTxt, start, end);

                        console.log(convertTime12to24(startTimeTxt));

                        console.log(convertTime12to24(offerExpiryTimeTxt));

                        // let titleTxt = v.title.toString().replace(/\s+/g, '');
                        // Exclusiveoffer.upsertWithWhere({ id: v.id }, { titleTxt })
                    }
                })
                cb(null, { isSuccess: true })
            }
        })
    }

    Exclusiveoffer.createAndUpdate = (params = {}, cb) => {

        let isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });

        if (params) {

            let { title, desc, availableCnt, img, ownerId, price, minCustomer, maxCustomer, titleTxt, dateAndCate, status = 'Pending', isBooking, timeZone = "Australia/Sydney", country = "Australia" } = params;

            let createData = [];

            let momentdate = new Date(),
                liveDate = moment.tz(momentdate, timeZone).format('YYYY-MM-DD') + 'T00:00:00.000Z',
                dateStr = moment.tz(momentdate, timeZone).format('DD-MM-YYYY'),
                liveTime = moment.tz(momentdate, timeZone).format('hh:mm A'),
                dateNo = Number(moment.tz(momentdate, timeZone).format('DD')),
                hour = Number(moment.tz(momentdate, timeZone).format('HH')),
                minute = Number(moment.tz(momentdate, timeZone).format('MM'));

            dateAndCate.forEach((val, m) => {

                let { offerDate, offerDateTxt, month, date, year,
                    offerType, subOfferType, startTimeTxt, startHour, offerExpiryTimeTxt,
                    startMinute, endHour, endMinute, startTime, endTime } = val;

                let images = [];
                images.push(img[m])

                if (status == 'Live') {
                    createData.push({
                        title, titleTxt, desc, ownerId, img: images, price, maxCustomer, minCustomer, date, month, year, availableCnt,
                        start: { hour: startHour, minutes: startMinute, time: startTime },
                        end: { hour: endHour, minutes: endMinute, time: endTime }, offerDate,
                        offerDateTxt, startTimeTxt, offerExpiryTimeTxt, offerType, subOfferType, status, isLive: true,
                        liveDate, liveTime, live: { date, dateStr, time: liveTime, dateNo, month, year, hour, minute },
                        isBooking
                    });
                } else {
                    createData.push({
                        title, titleTxt, desc, ownerId, img: images, price, maxCustomer, minCustomer, date, month, year, availableCnt,
                        start: { hour: startHour, minutes: startMinute, time: startTime },
                        end: { hour: endHour, minutes: endMinute, time: endTime }, offerDate,
                        offerDateTxt, startTimeTxt, offerExpiryTimeTxt, offerType, subOfferType, isBooking
                    });
                }

                if ((m + 1) == dateAndCate.length) {
                    Exclusiveoffer.create(createData, (err, res) => {
                        console.log(err)
                    })
                }
            })

            setTimeout(function () {
                isSuccess(true, "Success");
            }, 100)


        } else isSuccess();
    }

    Exclusiveoffer.getAllCoupon = (params = {}, cb) => {

        let isSuccess = (isSuccess = false, message = 'Please try again!', res = {}) => cb(null, { isSuccess, message, res });

        if (params) {

            const convertTime12to24 = (time12h) => moment(time12h, 'hh:mm A').format('HH:mm');

            let { customerId, timeZone } = params;

            if (customerId) {
                if (!params.timeZone) timeZone = 'Australia/Sydney';
                else timeZone = params.timeZone;

                let currentDate = moment.tz(new Date(), timeZone).format('DD-MM-YYYY'),
                    currentTime = moment.tz(new Date(), timeZone).format('hh:mm a'),
                    Sdate = currentDate.split('-'), date = Sdate[0], month = Sdate[1], year = Sdate[2];

                let sTime = convertTime12to24(currentTime);
                const Customer = app.models.Customer;

                let offerDate = `${moment.tz(new Date(), timeZone).format('YYYY-MM-DD')}T00:00:00.000Z`;

                let cuDataTime = new Date(`${year}-${month}-${date}`);
                cuDataTime.setHours(moment.tz(new Date(), timeZone).format('HH'));
                cuDataTime.setMinutes(moment.tz(new Date(), timeZone).format('mm'));

                let fields = ["email", "businessName", "location", "currentVisitCnt", "venueCapacity", "openingHoursStatus", "addressLine1", "addressLine2", "suburb", "zipCode", "startTime", "endTime", "id", "imageUrl", "venueInformation", "website", "isAppLive", "status"];

                Customer.findOne({ where: { id: customerId } }, (cusErr, cusRes) => {
                    if (cusErr) isSuccess("Invalid Customer", false, cusErr);
                    else if (cusRes) {

                        const groupBy = (array, key) => {
                            return array.reduce((result, currentValue) => {
                                (result[currentValue[key]] = result[currentValue[key]] || []).push(
                                    currentValue
                                );
                                return result;
                            }, {});
                        };

                        Exclusiveoffer.find({
                            where: { offerDate, status: "Live" }, include: [{
                                relation: "claimscoupons"
                            }, {
                                relation: "business", scope: {
                                    fields,
                                    where: {
                                        isAppLive: true,
                                        status: 'active',
                                    }
                                }
                            }]
                        }, (err, res) => {

                            res = JSON.parse(JSON.stringify(res));
                            if (err) isSuccess();
                            else {
                                if (res && res.length) {
                                    let resValues = [];
                                    res.forEach((val, i) => {
                                        if (val.business && val.business.isAppLive && val.business.status == 'active') {
                                            val.isClaim = false;
                                            val.claimscoupons.forEach((claim) => {
                                                if (claim.exclusiveOfferId == val.id && claim.isClaim) val.isClaim = true;
                                            });
                                            delete val.claimscoupons;
                                            if (val && val.offerDate) {
                                                let offerDate = new Date(val.offerDate.split('T')[0]);

                                                offerDate.setHours(Number(val.start.hour));
                                                offerDate.setMinutes(Number(val.start.minutes));

                                                if (offerDate.getTime() > cuDataTime.getTime()) resValues.push(val);
                                            }
                                            if ((i + 1) == res.length) {

                                                let values = groupBy(resValues.sort(function (a, b) {
                                                    return a.start.hour - b.start.hour;
                                                }), 'titleTxt');

                                                values = JSON.parse(JSON.stringify(values));

                                                let retrunArray = [];
                                                Object.keys(values).forEach(m => {
                                                    let data = {};
                                                    data = resValues.find(v => v.titleTxt == m);
                                                    data.offers = []
                                                    data.offers = values[m];
                                                    retrunArray.push(data);
                                                })
                                                isSuccess(true, "Success", retrunArray);
                                            }
                                        } else {
                                            if ((i + 1) == res.length) {

                                                let values = groupBy(resValues.sort(function (a, b) {
                                                    return a.start.hour - b.start.hour;
                                                }), 'titleTxt');



                                                values = JSON.parse(JSON.stringify(values));

                                                let retrunArray = [];
                                                Object.keys(values).forEach(m => {
                                                    let data = {};
                                                    data = resValues.find(v => v.titleTxt == m);
                                                    data.offers = []
                                                    data.offers = values[m];
                                                    retrunArray.push(data);
                                                })

                                                isSuccess(true, "Success", retrunArray);
                                            }
                                        }
                                    });
                                } else isSuccess(true, "No Data!", []);
                            }
                        })
                    } else isSuccess("Invalid Customer", false, cusErr);
                });
            } else isSuccess("Customerid is required!", false, {});
        } else isSuccess("Params is required", false, {});
    }

    Exclusiveoffer.deleteCoupon = (params = {}, cb) => {
        let isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });
        if (params) {
            let { id } = params;
            Exclusiveoffer.deleteById(id, (err, res) => {
                if (err) isSuccess();
                else isSuccess(true, "Success");
            });
        } else isSuccess();
    }

    Exclusiveoffer.deleteAllOffers = (params = {}, cb) => {
        let isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });
        if (params) {
            let { values } = params;
            if (values && values.length) {
                values.forEach(async (id, i) => {
                    await Exclusiveoffer.deleteById(id)
                    if ((i + 1) == values.length) setTimeout(() => { isSuccess(true, "Successfully deleted!"); }, 300)
                })

            } else isSuccess();
        } else isSuccess();
    }

    Exclusiveoffer.updateLiveDateAndTime = (params, cb) => {
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
            Exclusiveoffer.upsertWithWhere({ id }, { liveDate, liveTime, live: { date, dateStr, time: liveTime, dateNo, month, year, hour, minute } }, (err, res) => {
                isCallBack(true, "Success", {});
            })

        } else isCallBack();
    }

    Exclusiveoffer.updateToAllOffer = (params, cb) => {


        let timeZone = "Australia/Sydney", country = "Australia";
        let momentdate = new Date(),
            todayDate = moment.tz(momentdate, timeZone).format('YYYY-MM-DD') + 'T00:00:00.000Z';

        let isSuccess = (isSuccess = false, message = 'Please try again!', res = {}) => cb(null, { isSuccess, message });

        if (params) {
            let { id, end, start, offerExpiryTimeTxt, startTimeTxt, offerDate, offerDateTxt,
                titleTxt, price, year, month, date, maxCustomer, minCustomer, desc, title, img } = params;

            Exclusiveoffer.findOne({ where: { id } }, (fErr, fRes) => {
                if (fErr) isSuccess(true, "Success", {});
                else {

                    let { ownerId } = fRes;

                    let cuDataTime = new Date(moment.tz(new Date(), timeZone).format('YYYY-MM-DD'));
                    cuDataTime.setHours(moment.tz(new Date(), timeZone).format('HH'));
                    cuDataTime.setMinutes(moment.tz(new Date(), timeZone).format('mm'));

                    Exclusiveoffer.find({ where: { ownerId, titleTxt: fRes.titleTxt, offerDate: { gte: todayDate } } }, (gErr, gRes) => {
                        if (gErr) isSuccess(true, "Success", {});
                        else {
                            gRes.forEach((val, i) => {
                                if (val && val.offerDate && val.start.time > cuDataTime.getTime()) {
                                    if (img && img.length) {
                                        Exclusiveoffer.upsertWithWhere({ id: val.id }, {
                                            end, start, offerExpiryTimeTxt, startTimeTxt, offerDate, offerDateTxt, img: img[i],
                                            titleTxt, price, year, month, date, maxCustomer, minCustomer, desc, title
                                        })
                                    } else {
                                        Exclusiveoffer.upsertWithWhere({ id: val.id }, {
                                            end, start, offerExpiryTimeTxt, startTimeTxt, offerDate, offerDateTxt,
                                            titleTxt, price, year, month, date, maxCustomer, minCustomer, desc, title
                                        })
                                    }
                                }
                            })
                        }
                    })

                    setTimeout(function () {
                        isSuccess(true, "Success", {});
                    }, 100);

                }
            })
        } else isSuccess(false, "Params is required!", {});
    }

    Exclusiveoffer.remoteMethod('getBase64', {
        http: { path: '/getBase64', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "getByIdData"
    });

    Exclusiveoffer.remoteMethod('updateToAllOffer', {
        http: { path: '/updateToAllOffer', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "update to all offers"
    });

    Exclusiveoffer.remoteMethod('updateLiveDateAndTime', {
        http: { path: '/updateLiveDateAndTime', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "update the live date and time"
    });

    Exclusiveoffer.remoteMethod('customApi', {
        http: { path: '/customApi', verb: 'post' },
        returns: { arg: 'data', type: 'object' },
        description: "customApi"
    });

    Exclusiveoffer.remoteMethod('deleteCoupon', {
        http: { path: '/deleteCoupon', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "get all delete coupon"
    });

    Exclusiveoffer.remoteMethod('deleteAllOffers', {
        http: { path: '/deleteAllOffers', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "deleteAllOffers all"
    });

    Exclusiveoffer.remoteMethod('getAllCoupon', {
        http: { path: '/getAllCoupon', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "get all coupon"
    });

    Exclusiveoffer.remoteMethod('createAndUpdate', {
        http: { path: '/createAndUpdate', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "create and update"
    });
};
