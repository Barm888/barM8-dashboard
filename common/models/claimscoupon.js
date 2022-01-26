const app = require('../../server/server');
var moment = require('moment-timezone');


module.exports = function (Claimscoupon) {

    Claimscoupon.isVaildAndUpdateClaim = (params, cb) => {

        const convertTime12to24 = (time12h) => moment(time12h, 'hh:mm A').format('HH:mm');

        let isSuccess = (message = "Please try again", isSuccess = false, res = {}) => cb(null, { message, isSuccess });

        try {
            if (params) {

                const Customer = app.models.Customer,
                    ExclusiveOffer = app.models.ExclusiveOffer,
                    ChartForExclusiveOffer = app.models.ChartForExclusiveOffer;

                let { exclusiveOfferId, customerId, timeZone, cnt } = params;

                if (exclusiveOfferId && customerId) {

                    if (cnt >= 1) {

                        if (!timeZone) timeZone = 'Australia/Sydney';
                        let dateFormat = moment.tz(new Date(), timeZone).format('DD-MM-YYYY'),
                            time = moment.tz(new Date(), timeZone).format('hh:mm a'),
                            dateNo = moment.tz(new Date(), timeZone).format('DD'),
                            month = moment.tz(new Date(), timeZone).format('MM'),
                            year = moment.tz(new Date(), timeZone).format('YYYY'),
                            date = moment.tz(new Date(), timeZone).toJSON(),
                            cliamTimesCnvt = convertTime12to24(time),
                            claimHour = cliamTimesCnvt[0], claimMinute = cliamTimesCnvt[1];

                        Customer.findById(customerId, (cusErr, cusRes) => {
                            if (cusErr) isSuccess("Invalid Customer", false, cusErr);
                            else if (cusRes) {

                                dateNo = dateNo.replace(/^0+/, '');
                                month = month.replace(/^0+/, '');

                                ExclusiveOffer.findOne({ where: { id: exclusiveOfferId } }, (eOErr, eORes) => {
                                    if (eOErr) isSuccess("Invalid coupon", false, eOErr);
                                    else if (eORes) {

                                        eORes = JSON.parse(JSON.stringify(eORes));

                                        Claimscoupon.findOne({ where: { exclusiveOfferId, customerId } }, (err, res) => {

                                            res = JSON.parse(JSON.stringify(res));
                                            if (err) isSuccess("Error", false, err);
                                            // else if (res && res.isClaim) {
                                            //     isSuccess("Claimed", false, {});
                                            // } 
                                            else {
                                                let availableCnt = Number(eORes.availableCnt);
                                                cnt = Number(cnt);

                                                if (availableCnt >= cnt) {
                                                    if (availableCnt > 0) {

                                                        ExclusiveOffer.upsertWithWhere({ id: exclusiveOfferId }, { availableCnt: (availableCnt - cnt) }, (cpDaErr, cpDaRes) => {
                                                            Claimscoupon.create({
                                                                exclusiveOfferId, customerId, dateFormat, cnt,
                                                                time, dateNo, month, year, date, isClaim: true,
                                                                claimTime: time, claimHour, claimMinute,
                                                                claimDateFormat: date
                                                            }, (ClaimscouponErr, ClaimscouponRes) => {
                                                                ClaimscouponRes.availableCnt = cpDaRes.availableCnt;
                                                                ChartForExclusiveOffer.createAnalytics({ customerId, exclusiveOfferId, type: 'claim', ClaimscouponRes }, cb)
                                                            });
                                                        });

                                                    } else isSuccess("Available count is zero", false, {});
                                                }
                                                else isSuccess(`Available count is ${availableCnt}. Please try again`, false, {});
                                            }
                                        })
                                    } else isSuccess("Invalid coupon", false, eOErr);
                                })
                            } else isSuccess("Invalid Customer", false, cusErr);
                        })
                    } else isSuccess("Cnt is greater than 1!", false);

                } else isSuccess("exclusiveOfferId && customerId && couponDateId is required", false);

            } else isSuccess("Params is required", false);
        } catch (e) {
            isSuccess("Params is required", false);
        }

    }

    Claimscoupon.getCurrentDateClaimed = (params, cb) => {

        let isSuccess = (message = "Please try again", isSuccess = false, res = {}) => cb(null, { message, isSuccess });

        if (params) {

            const convertTime12to24 = (time12h) => moment(time12h, 'hh:mm A').format('HH:mm');

            let { customerId, timeZone } = params;
            if (!timeZone) timeZone = 'Australia/Sydney';
            let date = moment.tz(new Date(), timeZone).format('D'),
                month = moment.tz(new Date(), timeZone).format('M'),
                year = moment.tz(new Date(), timeZone).format('YYYY');
            let dateForMat = new Date(moment.tz(new Date(), timeZone).format('YYYY-MM-DD'));
            dateForMat.setHours(Number(moment.tz(new Date(), timeZone).format('HH')));
            dateForMat.setMinutes(Number(moment.tz(new Date(), timeZone).format('mm')));

            const Customer = app.models.Customer;
            const ExclusiveOffer = app.models.ExclusiveOffer;

            let fields = ["email", "businessName", "location", "currentVisitCnt", "venueCapacity", "openingHoursStatus", "addressLine1", "addressLine2", "suburb", "zipCode", "startTime", "endTime", "id", "imageUrl", "venueInformation", "website"];

            Customer.findById(customerId, (cusErr, cusRes) => {
                if (cusErr) isSuccess("Invalid Customer", false, cusErr);
                else if (cusRes) {

                    ExclusiveOffer.find({
                        include: [{
                            relation: "claimscoupons",
                            scope: {
                                where: { customerId }
                            }
                        }, { relation: "business", scope: { fields } }]
                    }, (err, res) => {
                        if (err) isSuccess("Error", false, err);
                        else {

                            let resda = [];
                            res = JSON.parse(JSON.stringify(res));

                            let couponDResult = res.filter(m => m.claimscoupons && m.claimscoupons.length)

                            if (couponDResult && couponDResult.length) {

                                couponDResult.forEach((m, k) => {

                                    let callAddValues = () => {
                                        m.claimscoupons.forEach((v, i) => {
                                            if (v && v.customerId == customerId) {

                                                let { title, titleTxt, desc, img, minCustomer, maxCustomer, price, date, month, year, start, end, availableCnt, offerDate, offerType, subOfferType, status, offerDateTxt, startTimeTxt, offerExpiryTimeTxt, liveDate, liveTime, live, ownerId, id, business } = m;

                                                v.exclusiveOffer = { title, titleTxt, desc, img, minCustomer, maxCustomer, price, date, month, year, start, end, availableCnt, offerDate, offerType, subOfferType, status, offerDateTxt, startTimeTxt, offerExpiryTimeTxt, liveDate, liveTime, live, ownerId, id, business };

                                                resda.push(v);
                                            }
                                            if ((i + 1) == m.claimscoupons.length && (k + 1) == couponDResult.length) {
                                                cb(null, { message: "Success", isSuccess: true, res: resda })
                                            }
                                        })
                                    }

                                    let offerDate = new Date(m.offerDate.split('T')[0]);

                                    offerDate.setHours(Number(m.end.hour));
                                    offerDate.setMinutes(Number(m.end.minutes));

                                    if (offerDate.getTime() > dateForMat.getTime()) {
                                        callAddValues();
                                    } else if (k + 1 == couponDResult.length) {
                                        cb(null, { message: "Success", isSuccess: true, res: resda })
                                    }
                                })
                            } else cb(null, { message: "No Data", isSuccess: false, res: [] })
                        }
                    })

                } else isSuccess("Invalid Customer", false, cusErr);
            })
        } else isSuccess("Params is required", false);
    }


    Claimscoupon.updateRedeem = (params, cb) => {

        const ChartForExclusiveOffer = app.models.ChartForExclusiveOffer;

        let isSuccess = (message = "Please try again", isSuccess = false, res = {}) => cb(null, { message, isSuccess, res });

        if (params) {
            let { claimId, timeZone, exclusiveDateId } = params;
            if (claimId) {
                const convertTime12to24 = (time12h) => {
                    const [time, modifier] = time12h.split(' ');
                    let [hours, minutes] = time.split(':');
                    (hours === '12' ? hours = '00' : ((modifier === 'PM' || modifier === 'pm') ? hours = parseInt(hours, 10) + 12 : ""));
                    return `${hours}:${minutes}`;
                }
                if (!timeZone) timeZone = 'Australia/Sydney';
                let time = moment.tz(new Date(), timeZone).format('hh:mm a'),
                    redeemedTimesCnvt = convertTime12to24(time),
                    date = moment.tz(new Date(), timeZone).toJSON(),
                    redeemedHour = redeemedTimesCnvt[0], redeemedMinute = redeemedTimesCnvt[1];
                Claimscoupon.findOne({ where: { id: claimId } }, (err, res) => {
                    if (err) isSuccess("Error", false, err);
                    else if (res) {
                        if (res.isRedeemed) isSuccess("Redeemed", false);
                        else {
                            Claimscoupon.upsertWithWhere({ id: claimId },
                                { isRedeemed: true, redeemedTime: time, redeemedHour, redeemedMinute, redeemedDateFormat: date }, (couponErr, couponRes) => {
                                    if (couponErr) isSuccess("Error", false, err);
                                    else {
                                        if (exclusiveDateId) {
                                            if (couponRes && couponRes.customerId) {
                                                let customerId = couponRes.customerId;
                                                ChartForExclusiveOffer.createAnalytics({ customerId, exclusiveDateId, type: 'redeem' }, cb)
                                            } else {
                                                isSuccess("Success", true, couponRes);
                                            }

                                        } else {
                                            isSuccess("Success", true, couponRes);
                                        }
                                    }
                                });
                        }
                    } else isSuccess("Invaild claimId", false);
                })
            } else isSuccess("ClaimId is required", false);
        } else isSuccess("Params is required", false);
    }

    Claimscoupon.getClaimById = (params, cb) => {

        let isSuccess = (message = "Please try again", isSuccess = false, res = {}) => cb(null, { message, isSuccess, res });

        let fields = ["email", "businessName", "location", "currentVisitCnt", "venueCapacity", "openingHoursStatus", "addressLine1", "addressLine2", "suburb", "zipCode", "startTime", "endTime", "id", "imageUrl", "venueInformation", "website"];

        if (params) {

            let { claimId, timeZone = 'Australia/Sydney', readed = false } = params;

            if (claimId) {
                Claimscoupon.findOne({
                    where: { id: claimId }, include: [{
                        relation: "exclusiveOffer",
                        scope: {
                            include: [{ relation: "business", scope: { fields } }]
                        }
                    }]
                }, (err, res) => {
                    if (err) isSuccess("Error", false, err);
                    else {
                        Claimscoupon.upsertWithWhere({ id: claimId }, { readed })
                        isSuccess("Success", true, res);
                    }
                })
            } else isSuccess("ClaimId is required!", false, {});
        } else isSuccess("Params is required!", false, {});
    }

    Claimscoupon.unReadClaimCount = (params, cb) => {

        const Customer = app.models.Customer;

        let isSuccess = (message = "Please try again", isSuccess = false, res = {}) => cb(null, { message, isSuccess, res });

        if (params) {
            let { customerId } = params;
            if (customerId) {
                Customer.findById(customerId, (cusErr, cusRes) => {
                    if (cusErr) isSuccess("Invalid Customer", false, cusErr);
                    else if (cusRes) {
                        Claimscoupon.find({ where: { customerId, readed: false } }, (err, res) => {
                            if (cusErr) isSuccess("Invalid Claims coupon", false, cusErr);
                            else {
                                if (Claimscoupon && Claimscoupon.length) {
                                    isSuccess("Success", true, { count: Claimscoupon.length });
                                } else {
                                    isSuccess("Success", true, { count: 0 });
                                }
                            }
                        })
                    } else isSuccess("Please try again. No Customer data!", false, {});
                })
            } else isSuccess("customerId is required!", false, {});
        } else isSuccess("Params is required!", false, {});
    }


    Claimscoupon.remoteMethod('unReadClaimCount', {
        http: { path: '/unReadClaimCount', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });

    Claimscoupon.remoteMethod('getClaimById', {
        http: { path: '/getClaimById', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });

    Claimscoupon.remoteMethod('updateRedeem', {
        http: { path: '/updateRedeem', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });

    Claimscoupon.remoteMethod('getCurrentDateClaimed', {
        http: { path: '/getCurrentDateClaimed', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });

    Claimscoupon.remoteMethod('isVaildAndUpdateClaim', {
        http: { path: '/isVaildAndUpdateClaim', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });
};
