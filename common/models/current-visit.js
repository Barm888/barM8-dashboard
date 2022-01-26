
let app = require('../../server/server');
let geolib = require('geolib');
const moment = require('moment-timezone'),
  U = require('underscore'),
  FCM = require('fcm-push'),
  serverKey = 'AAAA-4BeD_8:APA91bEyi_SURDeuKRLqoDDWsde4wDNFP5TIFCDD8Je2fQBHr_21fpj8zmzZ0pjGW_mT1PWKYZB2QNgMdOJ4p6dhsjEVk-aQUJHV4vgL6VpJEDI4HCxPOhMwVl0qBz-47OGkzyOopaEe',
  fcm = new FCM(serverKey);

module.exports = function (Currentvisit) {

  Currentvisit.getCustomers = (details, cb) => {

    let data = {};
    const Business = app.models.Business;
    if (details.ownerId) {
      let ownerId = details.ownerId, filter = { where: { id: ownerId }, include: { relation: "currentvisitsh", scope: { include: { relation: "customer" } } } };
      if (ownerId) {

        if (details.date && Object.entries(details.date).length != 0 && details.date.startDate && details.date.endDate) {
          filter = { where: { id: ownerId }, include: { relation: "currentvisitsh", scope: { include: { relation: "customer" }, where: { 'startTime': { between: [`${details.date.startDate}T00:00:00.000Z`, `${details.date.endDate}T23:59:00.000Z`] } } } } };
        }
        if (details.customer && Object.entries(details.customer).length != 0) {
          let customerFilter = {};
          if (details.customer.name) {
            customerFilter.firstName = {
              like: `${details.customer.name}`,
              options: "i"
            };
          } else if (details.customer.mobile) {
            customerFilter.mobile = details.customer.mobile.toString();
          } else if (details.customer.age) {
            customerFilter.age = parseInt(details.customer.age);
          }
          if (customerFilter && Object.entries(customerFilter).length != 0) {
            filter = { where: { id: ownerId }, include: { relation: "currentvisitsh", scope: { include: { relation: "customer", scope: { where: customerFilter } } } } };
          }
        }

        if (details.date && Object.entries(details.date).length != 0 && details.date.startDate && details.date.endDate && details.customer && Object.entries(details.customer).length != 0) {
          let customerFilter = {};
          if (details.customer.name) {
            customerFilter.firstName = {
              like: details.customer.name,
              options: "i"
            };
          } else if (details.customer.mobile) {
            customerFilter.mobile = details.customer.mobile.toString();
          } else if (details.customer.age) {
            customerFilter.age = parseInt(details.customer.age);
          }
          filter = { where: { id: ownerId }, include: { relation: "currentvisitsh", scope: { include: { relation: "customer", scope: { where: customerFilter } }, where: { 'startTime': { between: [`${details.date.startDate}T00:00:00.000Z`, `${details.date.endDate}T23:59:00.000Z`] } } } } };
        }

        Business.find(filter, (err, res) => {
          if (err) {
            data.msg = "please try again.";
            data.isSuccess = false;
            cb(null, data);
          } else {
            data.isSuccess = true;
            data.result = res;
            cb(null, data);
          }
        });
      } else {
        data.msg = "please try again.";
        data.isSuccess = false;
        cb(null, data);
      }
    } else {
      data.msg = "please try again.";
      data.isSuccess = false;
      cb(null, data);
    }
  };

  Currentvisit.observe('before save', function (ctx, next) {
    if (ctx && ctx.instance) {
      let { timeZone } = ctx.instance;
      if (!timeZone) {
        timeZone = 'Australia/Sydney';
        ctx.instance.timeZone = 'Australia/Sydney';
      }
      ctx.instance.date = moment.tz(new Date(), timeZone).format('DD');
      ctx.instance.month = moment.tz(new Date(), timeZone).format('MM');
      ctx.instance.year = moment.tz(new Date(), timeZone).format('YYYY');
      ctx.instance.hour = moment.tz(new Date(), timeZone).format('hh');
      ctx.instance.minute = moment.tz(new Date(), timeZone).format('mm');
      if (ctx.instance.isScanIn) {
        ctx.instance.scanInTime = moment.tz(new Date(), timeZone).toJSON();
        ctx.instance.scanInDate = moment.tz(new Date(), timeZone).format('DD-MMM-YYYY');
        ctx.instance.scanInTimeTxt = moment.tz(new Date(), timeZone).format('hh:mm a');
      }
    }
    next();
  });

  Currentvisit.scanFromBusinessApp = (params, cb) => {

    const Business = app.models.Business;
    const Customer = app.models.Customer;
    const VisitCount = app.models.VisitCount;

    let isSuccess = (message = "Please try again", isSuccess = false, data = {}) => cb(null, { message, isSuccess, data });

    if (params) {
      let { location, ownerId, customerId, timeZone, country } = params;
      if (!timeZone) timeZone = 'Australia/Sydney';
      let date = moment.tz(new Date(), timeZone).format('DD'),
        month = moment.tz(new Date(), timeZone).format('MM'),
        year = moment.tz(new Date(), timeZone).format('YYYY'),
        scanOutTimeTxt = moment.tz(new Date(), timeZone).format('hh:mm a');

      getBusinessData = () => {
        Currentvisit.find({ where: { ownerId, date, month, year, isScanIn: true } }, (VErr, vRes) => {
          vRes = JSON.parse(JSON.stringify(vRes));
          if (VErr) isSuccess();
          else {
            let customer = {};
            Customer.findById(customerId, (customerErr, customerRes) => {
              if (customerErr) isSuccess("Invaild Customer. Please try again!", false, {});
              else if (customerRes) {
                Business.findOne({ where: { id: ownerId } }, (errFind, resFind) => {
                  if (errFind) isSuccess("Error", false, errFind);
                  else {
                    resFind = JSON.parse(JSON.stringify(resFind));
                    let currentVisitCount = (vRes.filter((m) => { if (m.isScanIn && m.isScanOut == false) return m })).length,
                      scanCount = currentVisitCount,
                      currentVisitCnt = parseInt(scanCount || 0) + parseInt(resFind.manualCount || 0);
                    Business.upsertWithWhere({ id: ownerId }, { businessScan: true, month, date, year, scanCount, currentVisitCnt }, (uErr, ures) => {
                      if (ures) {
                        let { businessName, email, qrCode, qrImageUrl, country, contact1, contact2, website, venueInformation, city,
                          state, zipCode, suburb, contactperson, landline, imageUrl, addressLine1, addressLine2, location, status, eddystoneNameSpaceId, eddystoneInstanceId, eddystoneUrl, iBeaconId, minorId, majorId, username, id, currentVisitCnt, venueCapacity, isQrCode, isBeacon } = ures;
                        if (customerRes) customer = customerRes;
                        isSuccess("Success", true, {
                          businessName, currentVisitCnt, venueCapacity,
                          email, qrCode, qrImageUrl, country, contact1, contact2, website, venueInformation, city,
                          state, zipCode, suburb, contactperson, landline, imageUrl, addressLine1, addressLine2, location, status, eddystoneNameSpaceId, eddystoneInstanceId, eddystoneUrl, iBeaconId, minorId, majorId, username, id, customer, isQrCode, isBeacon
                        });
                      } else isSuccess();
                    });
                  }
                });
              } else isSuccess("Invaild Customer. Please try again!", false, {});
            });
          }
        });
      }

      VisitCount.customerScan({ customerId, ownerId });

      Customer.findById(customerId, (customerErr, customerRes) => {

        if (customerErr) isSuccess("Invaild Customer. Please try again!", false, {});
        else if (customerRes) {

          Currentvisit.find({ where: { customerId, ownerId, date, month, year, isScanIn: true, isScanOut: false } }, (err, res) => {

            createNew = () => {
              let isScanIn = true;
              Currentvisit.create({ location, ownerId, customerId, timeZone, country, isScanIn, isBusinessScan: true }, (cErr, cRes) => {
                if (cErr) isSuccess();
                else if (cRes) getBusinessData();
                else isSuccess();
              });
            }

            if (err) isSuccess();
            else {
              if (res && res.length) {
                if (res[0].isScanIn && res[0].isScanOut) {
                  createNew();
                } else {
                  Currentvisit.upsertWithWhere({ id: res[0].id }, { isScanOut: true, scanOutTimeTxt }, (cErr, cRes) => {
                    if (cErr) isSuccess();
                    else if (cRes) getBusinessData();
                    else isSuccess();
                  });
                }
              } else createNew();
            }
          });
        } else isSuccess("Invaild Customer. Please try again!", false, {});
      });


    } else isSuccess();
  }

  Currentvisit.getVisitCount = (params, cb) => {

    const Business = app.models.Business;
    let isSuccess = (message = "Please try again", isSuccess = false, data = {}) => cb(null, { message, isSuccess, data });

    if (params) {
      let { ownerId } = params;
      if (ownerId) {
        let id = ownerId;
        Business.findById(id, (err, res) => {
          if (err) isSuccess("Business count is not found", true, {});
          else {
            let { businessName, email, qrCode, qrImageUrl, country, contact1, contact2, website, venueInformation, city,
              state, zipCode, suburb, contactperson, landline, imageUrl, addressLine1, addressLine2, location, status, eddystoneNameSpaceId, eddystoneInstanceId, eddystoneUrl, iBeaconId, minorId, majorId, username, id, currentVisitCnt, venueCapacity } = res;
            isSuccess("Success", true, {
              businessName, currentVisitCnt, venueCapacity,
              email, qrCode, qrImageUrl, country, contact1, contact2, website, venueInformation, city,
              state, zipCode, suburb, contactperson, landline, imageUrl, addressLine1, addressLine2, location, status, eddystoneNameSpaceId, eddystoneInstanceId, eddystoneUrl, iBeaconId, minorId, majorId, username, id
            });
          }
        })
      } else isSuccess("Owner Id is required", false, {});
    } else isSuccess();
  }

  Currentvisit.Inc_DecreaseCountFromApp = (params, cb) => {

    const Business = app.models.Business;
    let isSuccess = (message = "Please try again", isSuccess = false, data = {}) => cb(null, { message, isSuccess, data });

    if (params) {
      let { ownerId, timeZone, isIncrease = false, isDecrease = false } = params;
      let scanCount;
      if (!timeZone) timeZone = 'Australia/Sydney';
      let date = moment.tz(new Date(), timeZone).format('DD'),
        month = moment.tz(new Date(), timeZone).format('MM'),
        year = moment.tz(new Date(), timeZone).format('YYYY'),
        manualCount, currentVisitCnt;
      function isPositive(number) {
        if (number > 0) {
          return true;
        }
        if (number < 0) {
          return false;
        }
        if (1 / number === Number.POSITIVE_INFINITY) {
          return true;
        }
        return false;
      }
      Business.findOne({ where: { id: ownerId } }, (err, res) => {
        if (err) isSuccess("Error from find", false, err);
        else {
          res = JSON.parse(JSON.stringify(res));
          if (isIncrease) {
            manualCount = parseInt(res.manualCount || 0) + 1;
            res.venueCapacity
            currentVisitCnt = parseInt(res.scanCount || 0) + parseInt(manualCount || 0);
            scanCount = res.scanCount;
          } else if (isDecrease) {
            manualCount = parseInt(res.manualCount || 0) - 1;
            if (!isPositive(manualCount)) { manualCount = 0; }
            if (manualCount == 0 && res.scanCount == 1) {
              currentVisitCnt = 0; scanCount = 0;
            } else {
              currentVisitCnt = parseInt(res.scanCount || 0) + parseInt(res.manualCount || 0);
              scanCount = res.scanCount;
            }
            if (!isPositive(currentVisitCnt)) { currentVisitCnt = 0; }
          }
          Business.upsertWithWhere({ id: ownerId }, { date, month, year, isIncrease, isDecrease, isManualScan: true, scanCount, manualCount, currentVisitCnt }, (uerr, ures) => {
            if (ures) {
              let { businessName, email, qrCode, qrImageUrl, country, contact1, contact2, website, venueInformation, city,
                state, zipCode, suburb, contactperson, landline, imageUrl, addressLine1, addressLine2, location, status, eddystoneNameSpaceId, eddystoneInstanceId, eddystoneUrl, iBeaconId, minorId, majorId, username, id, currentVisitCnt, venueCapacity } = ures;
              isSuccess("Success", true, {
                businessName, currentVisitCnt, venueCapacity,
                email, qrCode, qrImageUrl, country, contact1, contact2, website, venueInformation, city,
                state, zipCode, suburb, contactperson, landline, imageUrl, addressLine1, addressLine2, location, status, eddystoneNameSpaceId, eddystoneInstanceId, eddystoneUrl, iBeaconId, minorId, majorId, username, id
              });
            }
          });
        }
      });
    } else isSuccess();
  }

  Currentvisit.deleteCustomersAndNotifyToRescanByOwnerId = function (details, cb) {
    let data = {},
      ownerId = details.ownerId,
      customerId = details.customerId || "hvbfivbf",
      startTime = details.startTime,
      endTime = details.endTime;

    if (ownerId) {
      Currentvisit.find({ "where": { "ownerId": ownerId }, "include": "customer" }, function (err, res) {
        if (err) {
          console.log(err);
        } else if (res.length) {
          console.log(res.length);
          res = JSON.parse(JSON.stringify(res));
          ownerId = ownerId || "dfdrger";
          Currentvisit.destroyAll({ ownerId });

          let start = async () => {
            let resp = await U.uniq(res, function (p) { return p.customerId; }),
              respLength = resp.length;
            console.log("deleteCustomersAndNotifyToRescanByOwnerId Inside after using Underscore: " + JSON.stringify(resp));
            for (let i = 0; i < respLength; i++) {
              let tokenId = (resp[i].customer) ? resp[i].customer.deviceId : "",
                customerId1 = resp[i].customerId || "";
              if (tokenId && (customerId != customerId1)) {
                let data1 = {
                  "image": null,
                  "title": 'Participate in the draw!',
                  "message": `Click to participate in the next draw. Goodluck!`,
                  "body": `Click to participate in the next draw. Goodluck!`,
                  "priority": "high",
                  "type": "reminder",
                  "content_available": true,
                  "startTime": startTime,
                  "endTime": endTime
                };

                let message = {
                  to: tokenId,
                  priority: "high",
                  time_to_live: 0,
                  notification: data1,
                  data: data1
                };
                console.log("message from push notification for reminder: " + JSON.stringify(message));
                fcm.send(message, function (pushError, pushResponse) {
                  if (pushError) {
                    console.log(pushError);
                    console.log("---Scan Reminder push Notification not sent " + pushError);
                  } else {
                    console.log(pushResponse);
                    console.log("---Scan Reminder push Notification has been sent " + pushResponse);
                  }
                });

              }
            }
          };

          start();
          data.isSuccess = true;
          data.message = "deleteCustomersAndNotifyToRescanByOwnerId called"
          cb(null, data);

        } else {
          data.isSuccess = false;
          data.message = "No Scans For Business";
          cb(null, data);
        }
      });

    } else {
      data.isSuccess = false;
      data.message = "Please Provide ownerId Property";
      cb(null, data);
    }
  }

  Currentvisit.remoteMethod('Inc_DecreaseCountFromApp', {
    http: { path: '/Inc_DecreaseCountFromApp', verb: 'post' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "increase and decrease count from APP Side"
  });

  Currentvisit.remoteMethod('getVisitCount', {
    http: { path: '/getVisitCount', verb: 'post' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Current scan customer count"
  });

  Currentvisit.remoteMethod('scanFromBusinessApp', {
    http: { path: '/scanFromBusinessApp', verb: 'post' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Scan from Business app"
  });


  Currentvisit.remoteMethod('getCustomers', {
    http: { path: '/getCustomers', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "get scans details to dashboard"
  });


  Currentvisit.remoteMethod('deleteCustomersAndNotifyToRescanByOwnerId', {
    http: { path: '/deleteCustomersAndNotifyToRescanByOwnerId', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Delete Customers And Notify To Rescan By OwnerId."
  });
};
