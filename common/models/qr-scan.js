'use strict';

module.exports = function (Qrscan) {
    var app = require('../../server/server');

    Qrscan.addQrScan = function (details, cb) {
        var data = {};
        var date1 = new Date();
        var date = new Date(date1);
        var offset = date.getTimezoneOffset();
        if (offset == 0) {
            var newDate1 = date.getTime() + 19800000;

        } else {
            var newDate1 = date.getTime();

        }
        var endDate1 = new Date(newDate1);
        date1.setHours(date1.getHours() + 3);
        var endDate = new Date(date1);
        var dateTime = endDate1.toLocaleTimeString();
        var Customer = app.models.Customer;
        var VisitHistory = app.models.VisitHistory;


        var obj = {
            "userId": details.userId,
            "clientId": details.clientId,
            "date": date,
            "isSelected": false
        };


        Customer.findOne({ where: { 'id': details.userId } }, function (e, cust) {
            if (cust) {
                if (cust._visit) {
                    var cus = date;
                    var custTime1 = cust._visit.endTime;
                    var offset1 = custTime1.getTimezoneOffset();
                    if (offset1 == 0) {
                        var newDate = cus.getTime() + 30600000;
                    } else {
                        var newDate = cus.getTime() + 10800000;

                    }
                    var custTime = new Date(newDate);
                    var vet = custTime.toLocaleTimeString();
                } else {
                    var custTime1 = date;
                    var offset1 = custTime1.getTimezoneOffset();
                    // var d = new Date();
                    if (offset == 0) {
                        var newDate = custTime1.getTime() + 30600000;
                    } else {
                        var newDate = cusTime.getTime() + 10800000;

                    }
                    var custTime = new Date(newDate);
                    var vet = custTime.toLocaleTimeString();
                }
                if (custTime1.getTime() <= date.getTime()) {
                    Qrscan.create(obj, function (err, res) {
                        if (err) {
                            data.isSuccess = false;
                            data.info = err;
                            cb(null, data);
                        } else {

                            var newVisit = {
                                "startTime": date,
                                "endTime": endDate,
                                "visitEndTime": vet,
                                "visitNo": "",
                                "clientId": details.clientId,
                                "hasReceivedAward": false
                            };
                            var newVisitHistory = {
                                "clientId": details.clientId,
                                "userId": details.userId,
                                "visitStartTime": dateTime,
                                "visitDate": date
                            };

                            cust._visitHistory.push(newVisitHistory);
                            var obj1 = {
                                "_visit": newVisit,
                                "_visitHistory": cust._visitHistory
                            };

                            Customer.updateAll({ id: details.userId }, obj1, function (err2, info) {
                                if (err2) {
                                    data.isSuccess = false;
                                    data.info = err2;

                                    cb(null, data);
                                } else {
                                    VisitHistory.create(newVisitHistory, function (err3, visitHistory) {
                                        if (err3) {
                                            data.isSuccess = false;
                                            data.info = err;
                                            cb(null, data);
                                        } else {
                                            data.isSuccess = true;
                                            data.info = "Successfully Saved";
                                            data.response = res;
                                            cb(null, data);
                                        }
                                    })

                                }
                            });
                        }
                    })
                } else {
                    data.isSuccess = false;
                    data.info = "Already Scanned. Please try after " + cust._visit.visitEndTime;
                    cb(null, data);
                }
            } else if (e) {
                data.isSuccess = false;
                data.info = err;
                cb(null, data);
            } else {
                data.isSuccess = false;
                data.info = "UserId not Found. Unregistered UserId...";
                cb(null, data);
            }
        });
    }


    Qrscan.remoteMethod('addQrScan', {
        http: { path: '/addQrScan', verb: 'post' },
        accepts: { arg: 'details', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Create New Qrscan."
    });
};
