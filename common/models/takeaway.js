const app = require('../../server/server');
const moment = require('moment-timezone');

module.exports = function (Takeaway) {

    Takeaway.createAndUpdate = (params, cb) => {

        let isSuccess = (message = "Please try again!", isSuccess = false, res = {}) => cb(null, { message, isSuccess, res });

        if (params) {
            let { ownerId, title, titleTxt, desc, categories, groupId, status, price, valueTxt } = params;
            categories.forEach(async (val) => {
                await Takeaway.create({
                    category: val.category, _category: val._category,
                    ownerId, img: val.img, dateFormat: val.dateFormat, startTime: val.startTime, titleTxt, startUnixTime: val.startUnixTime,
                    endTime: val.endTime, endHour: val.endHour, endMinute: val.endMinute, startHour: val.startHour,
                    startMinute: val.startMinute, title, desc, groupId, monthTxt: val.month, year: val.year, month: val.month,
                    dateNo: val.dateNo, date: val.date, endUnixTime: val.endUnixTime, status, price, valueTxt
                });
            });
            isSuccess("Success", true, {});
        } else isSuccess("params is required", false, {});
    }

    Takeaway.updateToAllTime = (cb) => {

        let isCallBack = (isSuccess, message, result = {}) => cb(null, { isSuccess, message, result });

        Takeaway.find((dErr, dRes) => {

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

                await Takeaway.upsertWithWhere({ id: val.id }, { startUnixTime: fsDate.getTime(), endUnixTime: esDate.getTime() });
            })
        })

        isCallBack();
    }

    Takeaway.removeOldData = (params, cb) => {

        let isCallBack = (isSuccess, message, result = {}) => cb(null, { isSuccess, message, result });

        if (params && params.id) {
            Takeaway.deleteById(params.id);
            isCallBack(true, "success", {});
        } else isCallBack(false, "params is required", {});
    }

    Takeaway.getTakeawayById = (params, cb) => {

        let isCallBack = (isSuccess, message, result = {}) => cb(null, { isSuccess, message, result });

        if (params) {
            let { id } = params;
            if (id) {
                try {
                    Takeaway.find({
                        where: { id },
                        include: [{
                            relation: "business",
                            scope: { include: [{ relation: "venueSettings" }] }
                        }]
                    }, (err, res) => {
                        res = JSON.parse(JSON.stringify(res));
                        if (err) isCallBack(false, "Error", err);
                        else if (res.length) {
                            isCallBack(true, "Success", res[0]);
                        } else isCallBack(false, "Invaild id", {});
                    })
                } catch (e) {
                    isCallBack(false, "Error", e);
                }
            } else isCallBack(false, "Params is required!", {});
        } else isCallBack(false, "Params is required!", {});
    }

    Takeaway.deleteAllTakeaway = (params = {}, cb) => {
        let isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });
        if (params) {
            let { values } = params;
            if (values && values.length) {
                values.forEach(async (id, i) => {
                    await Takeaway.deleteById(id)
                    if ((i + 1) == values.length) setTimeout(() => { isSuccess(true, "Successfully deleted!"); }, 300)
                })

            } else isSuccess();
        } else isSuccess();
    }

    Takeaway.remoteMethod('deleteAllTakeaway', {
        http: { path: '/deleteAllTakeaway', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "remove the old data."
    });

    Takeaway.remoteMethod('getTakeawayById', {
        http: { path: '/getTakeawayById', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "getTakeawayById"
    });

    Takeaway.remoteMethod('removeOldData', {
        http: { path: '/removeOldData', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "remove the old data."
    });

    Takeaway.remoteMethod('updateLiveDateAndTime', {
        http: { path: '/updateLiveDateAndTime', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "update the live date and time"
    });

    Takeaway.remoteMethod('createAndUpdate', {
        http: { path: '/createAndUpdate', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Create and update the data"
    });

};
