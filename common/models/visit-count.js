const excelToJson = require('convert-excel-to-json');
const fs = require('fs');
const request = require("request");
var path = require('path');
const cron = require('node-cron');
const app = require('../../server/server');
const FCM = require('fcm-push');
const serverKey = 'AAAA-4BeD_8:APA91bEyi_SURDeuKRLqoDDWsde4wDNFP5TIFCDD8Je2fQBHr_21fpj8zmzZ0pjGW_mT1PWKYZB2QNgMdOJ4p6dhsjEVk-aQUJHV4vgL6VpJEDI4HCxPOhMwVl0qBz-47OGkzyOopaEe';
const fcm = new FCM(serverKey);
let pubsub = require('../../server/pubsub');
const moment = require('moment-timezone');

module.exports = (Visitcount) => {


    Visitcount.customerScan = (params, cb) => {
        
        let Customer = app.models.Customer,
            CustomerScan = app.models.CustomerScan,  list = {};
        let { customerId, ownerId } = params;

        let findVisit = (values = {}) => {
            return new Promise(async (resolve, reject) => {
                let { ownerId, date, month, year, dateZero, countryDate, dateStr, timeStr, country, timeZone, hour, minute, customerId, age, gender } = values;
                let visit = await Visitcount.upsertWithWhere({ ownerId, date, month, year }, { ownerId, date, month, year, dateZero, countryDate, dateStr, timeStr, country, timeZone });
                if (visit && visit.id) {
                    let updateObj = {};

                    //Visit Count
                    let _hoursPlus = ("0" + (parseFloat(hour) + 1)).slice(-2),
                        vCnt = parseFloat(visit[`_${hour}to${_hoursPlus}`]); ++vCnt;
                    updateObj[`_${hour}to${_hoursPlus}`] = vCnt;

                    //Age Count
                    age = parseInt(age);
                    if (age >= 18 && age <= 100) {
                        var ageCnt = 0, propertiesName = '';
                        if (age >= 18 && age <= 23) { ageCnt = visit[`_18to23_Age`]; propertiesName = '_18to23_Age'; };
                        if (age >= 24 && age <= 29) { ageCnt = visit[`_24to29_Age`]; propertiesName = '_24to29_Age'; }
                        if (age >= 30 && age <= 35) { ageCnt = visit[`_30to35_Age`]; propertiesName = '_30to35_Age'; };
                        if (age >= 36 && age <= 41) { ageCnt = visit[`_36to41_Age`]; propertiesName = '_36to41_Age'; };
                        if (age >= 42 && age <= 100) { ageCnt = visit[`_42toPlus_Age`]; propertiesName = '_42toPlus_Age'; }
                        updateObj[propertiesName] = ++ageCnt;
                    }

                    if (gender && gender == 'Male') {
                        let maleCnt = parseInt(visit.male || 0);
                        updateObj.male = maleCnt + 1;
                    }
                    else if (gender && gender == 'Female') {
                        let femaleCnt = parseInt(visit.female || 0);
                        updateObj.female = femaleCnt + 1;
                    }

                    let visitUpdate = await Visitcount.upsertWithWhere({ id: visit.id }, updateObj);
                    if (visitUpdate && visitUpdate.id) {
                        CustomerScan.create({
                            visitCountId: visitUpdate.id, customerId, scanDateZero: dateZero, date, month, year,
                            scanDate: dateStr, scanTime: timeStr, country, timeZone
                        }, (err, res) => {
                            resolve(true);
                        })
                    } else resolve(false);
                } else resolve(false);
            });
        }

        let country = "Australia", timeZone = "Australia/Sydney";

        let momentdate = new Date(),
            dateZero = moment.tz(momentdate, timeZone).format('YYYY-MM-DD') + 'T00:00:00.000Z',
            countryDate = moment.tz(momentdate, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z",
            dateStr = moment.tz(momentdate, timeZone).format('DD-MM-YYYY'),
            timeStr = moment.tz(momentdate, timeZone).format('hh:mm A'),
            date = parseFloat(moment.tz(momentdate, timeZone).format('DD')),
            month = parseFloat(moment.tz(momentdate, timeZone).format('MM')),
            year = parseFloat(moment.tz(momentdate, timeZone).format('YYYY')),
            hour = moment.tz(momentdate, timeZone).format('HH'),
            minute = moment.tz(momentdate, timeZone).format('MM'),
            day = moment.tz(momentdate, timeZone).format('dddd');

        updateNewAndReturn = async (customerId) => {
            return new Promise(async (resolve, reject) => {
                if (ownerId && date && month && year) {
                    let visitres = await Visitcount.findOne({ where: { ownerId, date, month, year }, include: [{ relation: "customerScans" }] });
                    visitres = JSON.parse(JSON.stringify(visitres));
                    if (visitres && visitres.customerScans && visitres.id) {
                        let newCnt = visitres.customerScans.filter(m => m.customerId == customerId);
                        if (newCnt && newCnt.length > 1) {
                            let returning = parseInt(visitres.returning || 0) + 1;
                            Visitcount.upsertWithWhere({ id: visitres.id }, { returning })
                        } else {
                            let newCount = parseInt(visitres.new || 0) + 1;
                            Visitcount.upsertWithWhere({ id: visitres.id }, { new : newCount })
                        }
                    }
                } else resolve({ isSuccess: true });
            });
        }

        pushSocketIO = async () => {
            pubsub.analyticsPublish(Visitcount.app.io);
            return;
        }

        if (ownerId && day) {
            Customer.findOne({ where: { id: customerId } }, { fields: ["id", "firstName", "lastName", "mobile", "postCode", "dob", "age", "state", "city", "gender"] }, (err, res) => {
                if (res) {
                    list = res;
                    if (list && list.id && list.age && list.gender) {
                        findVisit({ ownerId, date, month, year, dateZero, countryDate, dateStr, timeStr, country, timeZone, hour, minute, customerId: list.id, age: list.age, gender: list.gender }).then((res) => {
                            updateNewAndReturn(list.id);
                            pushSocketIO();
                        }).catch((err) => {
                            console.log(err);
                            updateNewAndReturn(list.id);
                            pushSocketIO();
                        });
                    } else pushSocketIO();
                }
            })
            
        }
    };

    Visitcount.remoteMethod('customerScan', {
        http: { path: '/customerScan', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Customer Scan Cron"
    });
};
