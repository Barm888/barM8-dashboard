let app = require('../../server/server');
const cron = require('node-cron');
const moment = require('moment-timezone');

module.exports = function (Sportsscheduleforadmin) {

    Sportsscheduleforadmin.remove = (params, cb) => {

        let isCallBack = (isSuccess, message, result = {}) => cb(null, { isSuccess, message, result });

        if (params && params.id) {
            Sportsscheduleforadmin.deleteById(params.id, (err, res) => isCallBack(true, "Success", {}));
        } else isCallBack();
    }

    Sportsscheduleforadmin.createAndUpdate = (params, cb) => {

        let isCallBack = (isSuccess, message, result = {}) => cb(null, { isSuccess, message, result });

        try {
            if (params) {
                let { values } = params;
                if (values) {
                    values.forEach((v, i) => {

                        let { teamBId, teamAId, sponsorId, competitionId, sportsTypeId, round,
                            year, month, dateNo, date, dateTxt, timeTxt, time, timeNo } = v;

                        Sportsscheduleforadmin.create({ teamBId, teamAId, sponsorId, competitionId, sportsTypeId, round, year, month, dateNo, date, dateTxt, timeTxt, time, timeNo })

                        if ((i + 1) == values.length) {
                            isCallBack(true, "Successfully created!");
                        }
                    })
                } else isCallBack();
            } else isCallBack(false, "params is required", false);
        } catch (e) {
            isCallBack(false, "Error", e);
        }
    }


    Sportsscheduleforadmin.updateLive = (params = {}, cb) => {

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
            Sportsscheduleforadmin.upsertWithWhere({ id }, { status, liveDate, liveTime, live: { date, dateStr, time: liveTime, dateNo, month, year, hour, minute } }, (err, res) => {
                isCallBack(true, "Success", {});
            })

        } else isCallBack();
    }

    Sportsscheduleforadmin.remoteMethod('remove', {
        http: { path: '/remove', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "remove the old data."
    });

    Sportsscheduleforadmin.remoteMethod('updateLive', {
        http: { path: '/updateLive', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "updateLive"
    });


    Sportsscheduleforadmin.remoteMethod('createAndUpdate', {
        http: { path: '/createAndUpdate', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "create sports schedule for admin"
    });
};
