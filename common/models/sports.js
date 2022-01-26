
let app = require('../../server/server');
const cron = require('node-cron');
const moment = require('moment-timezone');
const { clearCache } = require('ejs');

module.exports = function (Sports) {

    Sports.updateLive = (params = {}, cb) => {

        let isCallBack = (isSuccess = false, message = "please try again", result = {}) => cb(null, { isSuccess, message, result });

        if (params) {
            let { id, timeZone = "Australia/Sydney", country = "Australia", status } = params;
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
            Sports.upsertWithWhere({ id }, { status, liveDate, liveTime, live: { date, dateStr, time: liveTime, dateNo, month, year, hour, minute } }, (err, res) => {
                isCallBack(true, "Success", {});
            })

        } else isCallBack();
    }



    Sports.createAndUpdate = (params, cb) => {
        let isCallBack = (isSuccess, message, result = {}) => cb(null, { isSuccess, message, result });
        if (params && params.ownerId && params.matches) {

            let { matches, fullDesc, ownerId, status } = params;

            matches.forEach((val, i) => {
                Sports.create({ sportsScheduleForAdminId: val.id, fullDesc, ownerId, status }, (err, res) => {
                    if (err) isCallBack();
                    else if (res) {
                        if ((i + 1) == matches.length) {
                            setTimeout(function () { isCallBack(true, "Success"); }, 100);
                        }
                    }
                })
            })

        } else isCallBack();
    }

    Sports.removeSports = (params, cb) => {
        let isCallBack = (isSuccess, message, result = {}) => cb(null, { isSuccess, message, result });
        if (params && params.id) {
            Sports.deleteById(params.id, (err, res) => {
                console.log(err);
                console.log(res);
            })
            setTimeout(function () {
                isCallBack();
            }, 300);
        } else isCallBack();
    }



    Sports.getSportById = (params, cb) => {

        let isCallBack = (isSuccess = false, message = "please try again", result = {}) => cb(null, { isSuccess, message, result });

        const Customer = app.models.Customer;

        let fields = ["email", "businessName", "location", "currentVisitCnt", "venueCapacity", "openingHoursStatus", "addressLine1", "addressLine2", "suburb", "zipCode", "startTime", "endTime", "id", "imageUrl", "venueInformation", "website"];

        if (params) {
            let { sportsId, customerId } = params;
            if (sportsId && customerId) {

                try {
                    Customer.findOne({ where: { id: customerId } }, async (cusErr, cusRes) => {
                        cusRes = JSON.parse(JSON.stringify(cusRes));
                        if (cusErr) {
                            isCallBack(false, "Error", cusErr);
                        } else if (cusRes.id == customerId) {

                            try {
                                Sports.findOne({
                                    where: { id: sportsId }, include: [{ relation: "business", scope: { fields } }, {
                                        relation: "sportsScheduleForAdmin", scope: {
                                            include: [{ relation: "sportsSchedule" },
                                            { relation: "competitionSchedule" },
                                            { relation: "sponsorDetails" },
                                            { relation: "sportsTeamA" },
                                            { relation: "sportsTeamB" }]
                                        }
                                    }, { relation: "sportsReservations" }]
                                }, (err, res) => {
                                    if (err) isCallBack(false, "Error", err);
                                    else {
                                        res = JSON.parse(JSON.stringify(res));
                                        if (res && res.sportsReservations && res.sportsReservations.length) {
                                            res.interested = res.sportsReservations.some(s => s.isInterest);
                                            isCallBack(true, "Success", res);
                                        } else {
                                            res.interested = false;
                                            isCallBack(true, "Success", res);
                                        }
                                    }
                                })
                            } catch (e) { isCallBack(false, "No Sports", {}); }

                        } else isCallBack(false, "Invaild customerId", {});
                    });
                } catch (e) {
                    console.log(e);
                    isCallBack(false, "Error", e);
                }
            } else isCallBack(false, "sportsId and customerId is required!", {});
        } else isCallBack(false, "Params is required!", {});
    }


    Sports.remoteMethod('updateLive', {
        http: { path: '/updateLive', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "updateLive"
    });

    Sports.remoteMethod('getSportById', {
        http: { path: '/getSportById', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "get sports by id"
    });

    Sports.remoteMethod('removeSports', {
        http: { path: '/removeSports', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "remove the old data."
    });

    Sports.remoteMethod('createAndUpdate', {
        http: { path: '/createAndUpdate', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Create happenings and update"
    });
};
