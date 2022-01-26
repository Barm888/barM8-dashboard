
var stripeTestKey = (require('../../server/config')).stripeTestKey;
var stripeLiveKey = (require('../../server/config')).stripeLiveKey;
var stripeMode = (require('../../server/config')).stripeMode;
var stripe;
if(!stripeMode) stripe = require('stripe')(stripeTestKey);
if(stripeMode) stripe = require('stripe')(stripeLiveKey);
var servicePercentage = (require('../../server/config')).servicePercentage;

const app = require('../../server/server');
const FCM = require('fcm-push');
var moment = require('moment-timezone');
const serverKey = 'AAAA-4BeD_8:APA91bEyi_SURDeuKRLqoDDWsde4wDNFP5TIFCDD8Je2fQBHr_21fpj8zmzZ0pjGW_mT1PWKYZB2QNgMdOJ4p6dhsjEVk-aQUJHV4vgL6VpJEDI4HCxPOhMwVl0qBz-47OGkzyOopaEe';
const fcm = new FCM(serverKey);

module.exports = function (Grouporder) {

    Grouporder.createPreOrder = function (params = {}, cb) {
        const MealsDashSubLine = app.models.MealsDashSubLine,
            OrderLine = app.models.OrderLine,
            orderExtraLines = app.models.OrderExtraLine;

       let isSuccess = (message = "Please try again", isSuccess = false) => cb(null, { isSuccess, message });

        if (params && params.timeZone && params.customerId && params.ownerId && params.items && params.items.length > 0) {
            let { groupOrderId, orderId, customerId, instruction, currency, deliverType, ownerId, timeZone, items,
                paymentDescription, paymentType, token } = params, groupOrderTotalAmt = 0;

            if (items && items.length) {
                let itemIds = [], addOnsIds = [], addOnsOrIds = [];

                items.map(m => m.productId).forEach(val => { itemIds.push({ id: val }) })

                items.forEach(val => {
                    if (val.addOns && val.addOns.length) {
                        if (val.addOns && val.addOns.length) addOnsIds.push(...val.addOns.map(m => m.productId))
                    }
                })

                addOnsIds.forEach(m => { addOnsOrIds.push({ id: m }) });

                createOrderAddOns = (addOnsArg) => {
                    addOnsArg.addons.forEach((val, i) => {
                        items.forEach(item => {
                            let addOnsObj;
                            if (item.addOns && item.addOns.length) addOnsObj = item.addOns.find(m => m.productId == val.id);
                            if (addOnsObj) {
                                let totalPrice = 0, price = 0, qty = 0;
                                qty = parseFloat(addOnsObj.qty); price = parseFloat(val.price);
                                totalPrice = qty * price; groupOrderTotalAmt = groupOrderTotalAmt + totalPrice;
                                orderExtraLines.create({ orderLineId: addOnsArg.orderline.id, mealsExtraDashLineId: val.id, totalPrice, price, qty });
                                if (addOnsArg.addons.length == (i + 1)) {
                                    let serviceFee = (groupOrderTotalAmt / 100) * parseFloat(servicePercentage);
                                    chargeAmt = groupOrderTotalAmt + serviceFee;
                                    Grouporder.upsertWithWhere({ id: groupOrderId }, { totalAmt: groupOrderTotalAmt, serviceFee, chargeAmt });
                                }
                            }
                        })
                    });
                }

                creatOrderLine = (arg, resItem, i) => {
                    return new Promise((resolve, reject) => {
                        let orderLineFilter = items.find(m => m.productId == arg.id),
                            totalPrice = 0, qty = parseFloat(orderLineFilter.qty | 0), price = parseFloat(arg.price | 0);
                        totalPrice = price * qty;
                        groupOrderTotalAmt = groupOrderTotalAmt + totalPrice;
                        OrderLine.create({ orderId, mealsDashSubLineId: arg.id, customerId, groupOrderId, totalPrice, price, qty }, (err, res) => {
                            if (res && arg.mealsExtraDashLines && arg.mealsExtraDashLines.length) {
                                createOrderAddOns({ addons: arg.mealsExtraDashLines, orderline: res })
                                resolve({ isSuccess: true });
                            }
                            else if (resItem.length == (i + 1)) {
                                let serviceFee = (groupOrderTotalAmt / 100) * parseFloat(servicePercentage),
                                    chargeAmt = groupOrderTotalAmt + serviceFee;
                                Grouporder.upsertWithWhere({ id: groupOrderId }, { totalAmt: groupOrderTotalAmt, serviceFee, chargeAmt });
                                resolve({ isSuccess: true });
                            }
                            resolve({ isSuccess: false });
                        })
                    })
                }

                if (itemIds && itemIds.length) {
                    MealsDashSubLine.find({
                        where: { or: itemIds },
                        include: [{ relation: "mealsExtraDashLines", scope: { where: { or: addOnsOrIds } } }]
                    }, (errItem, resItem) => {
                        resItem = JSON.parse(JSON.stringify(resItem));
                        Grouporder.upsertWithWhere({ id: groupOrderId }, { instruction })
                        if (resItem && resItem.length) resItem.forEach((val, i) => creatOrderLine(val, resItem, i))
                    })
                }
            }
            isSuccess(true, "Success");
        } else isSuccess();
    }

    Grouporder.getGroupsFromOrder = function (params = {}, cb) {
        const Order = app.models.Order;

        let isSuccess = (message = "Please try again", isSuccess = false, res = []) => cb(null, { isSuccess, message, res });

        if (params.orderId) {
            let orderId = params.orderId;
            Order.find({
                where: { id: orderId }, include: [{
                    relation: "groupOrders", scope: {
                        include: [{
                            relation: "orderLines",
                            scope: {
                                include: [{
                                    relation: "orderExtraLines",
                                    scope: { include: [{ relation: "mealsExtraDashLine" }] }
                                },
                                {
                                    relation: "mealsDashSubLine",
                                    scope: {
                                        fields: ["price", "isAvailable", "isSpecial", "inAppSpecial", "menu", "ingredients", "id"]
                                    }
                                }]
                            }
                        }, { relation: "customer" }]
                    }
                }]
            }, (err, res) => {
                if (err) isSuccess()
                else {
                    res = JSON.parse(JSON.stringify(res));
                    isSuccess("Success", true, res);
                }
            })
        } else isSuccess("OrderId is required!", false, []);

    }

    Grouporder.getGroupOrders = (params = {}, cb) => {
        let isSuccess = (message = "Please try again", isSuccess = false, res = []) => cb(null, { isSuccess, message, res });
        if (params) {
            let id = params.groupOrderId;
            Grouporder.find({
                where: { id }, include: [{
                    relation: "orderLines",
                    scope: {
                        include: [{
                            relation: "orderExtraLines",
                            scope: { include: [{ relation: "mealsExtraDashLine" }] }
                        },
                        {
                            relation: "mealsDashSubLine",
                            scope: {
                                fields: ["price", "isAvailable", "isSpecial", "inAppSpecial", "menu", "ingredients", "id"]
                            }
                        }]
                    }
                }, { relation: "customer" }]
            }, (err, res) => {
                if (err) isSuccess();
                else {
                    res = JSON.parse(JSON.stringify(res));
                    isSuccess("Success", true, res);
                }
            })
        } else isSuccess();

    }


    Grouporder.chargeForGroups = (params = {}, cb) => {
        const Order = app.models.Order,
            Customer = app.models.Customer,
            PaymentHistory = app.models.PaymentHistory;
        let timeZone = '', momentdate = new Date(),
            errMessage = [];
        if (!timeZone) timeZone = "Australia/Sydney";
        let countryDateFormat = moment.tz(momentdate, timeZone).format(),
            countryDate = moment.tz(momentdate, timeZone).format('DD-MM-YYYY'),
            countryTime = moment.tz(momentdate, timeZone).format('hh:mm a'),
            isSuccess = (isSuccess = false, message = "Please try again", result = {}) => {
                if (errMessage && errMessage.length)
                    cb(null, { isSuccess: false, message, result, errMessage });
                else cb(null, { isSuccess, message, result, errMessage });
            }

        app.models.AppConfig.findOne((err, aPcFres) => {
            if (aPcFres) {

                var stripe, stripeMode = aPcFres.stripeMode;
                if (!aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeTestKey);
                if (aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeLiveKey);

                let { orderId } = params;
                if (orderId) {

                    function financial(x) {
                        return Number.parseFloat(x).toFixed(2);
                    }

                    Order.findOne({
                        where: { id: orderId },
                        include: [{ relation: "reservations" },
                        { relation: "groupOrders" }]
                    },
                        async (err, res) => {
                            res = JSON.parse(JSON.stringify(res));
                            if (err) isSuccess();
                            else if (res) {
                                Order.upsertWithWhere({ id: orderId }, { isSubmit: true })
                                let payingTogether = false, payingSeparately = false;
                                if (res && res.reservations) {
                                    payingTogether = res.reservations.payingTogether;
                                    payingSeparately = res.reservations.payingSeparately;
                                }
                                console.log(`payingTogether ${payingTogether}`)
                                console.log(`payingSeparately ${payingSeparately}`)
                                if (res && res.groupOrders && res.groupOrders.length) {
                                    let totalAmt = 0, customerId, groupOrderId, serviceFee = 0;
                                    if (payingTogether) {

                                        paymentStatusForGroups = groupList =>

                                            groupList.forEach(groupVal => Grouporder.upsertWithWhere({ id: groupVal.id }, { paymentStatus: 'succeeded' }));

                                        await res.groupOrders.forEach((val, i) => {
                                            if (val.isInviter) { customerId = val.customerId; groupOrderId = val.id; }
                                            totalAmt = totalAmt + val.totalAmt;
                                            serviceFee = serviceFee + val.serviceFee;
                                            if (res.groupOrders.length == (i + 1)) {
                                                if (customerId) {
                                                    Customer.findOne({ where: { id: customerId } }, (customerErr, customerRes) => {
                                                        if (customerErr) isSuccess(false, "StripeId find error!");
                                                        else {
                                                            if (customerRes) {
                                                                let stripeId, amount = 0;
                                                                if (stripeMode) stripeId = customerRes.stripeLiveId;
                                                                else if (!stripeMode) stripeId = customerRes.stripeTestId;

                                                                if (stripeId) {
                                                                    amount = totalAmt + serviceFee;
                                                                    amount = financial(amount) * 100;
                                                                    amount = parseInt(amount);
                                                                    if (totalAmt >= 1) {
                                                                        stripe.charges.create({
                                                                            amount, currency: 'aud',
                                                                            customer: stripeId
                                                                        }, function (err, charge) {
                                                                            if (charge) {
                                                                                updatePaymentStatus = (status = "Not Paid", resultSuccess = {}) => {
                                                                                    PaymentHistory.create({
                                                                                        groupOrderId, status, totalAmt: financial(totalAmt + serviceFee), timeZone, resultSuccess,
                                                                                        countryDate, countryTime, countryDateFormat
                                                                                    });
                                                                                    Grouporder.upsertWithWhere({ id: groupOrderId },
                                                                                        { paymentStatus: status, servicePercentage });
                                                                                    paymentStatusForGroups(res.groupOrders)
                                                                                    let chargeAmt = financial(totalAmt + serviceFee);
                                                                                    Order.upsertWithWhere({ id: orderId }, { paymentStatus: status, totalAmt, serviceFee, chargeAmt })
                                                                                    isSuccess(true, "Success", charge);
                                                                                }
                                                                                try {
                                                                                    if (charge) updatePaymentStatus(charge.status, charge);
                                                                                    else updatePaymentStatus();
                                                                                } catch (err) {
                                                                                    updatePaymentStatus();
                                                                                }
                                                                            } else {
                                                                                console.log(err);
                                                                                if (err && err.message) isSuccess(false, err.message);
                                                                                else isSuccess(false, "try again", err);
                                                                            }
                                                                        });
                                                                    } else isSuccess(false, "Please maintain the amount above 1 AUD or 1 USD.");
                                                                } else isSuccess(false, "stripeId is required");
                                                            } else isSuccess(false, "Customer object is required");
                                                        }
                                                    })

                                                } else isSuccess(false, "CustomerId is required!");
                                            }
                                        })
                                    } else if (payingSeparately) {

                                        res.groupOrders = res.groupOrders.filter(m => m.paymentStatus == 'Not Paid');

                                        await res.groupOrders.forEach(async (val, i) => {
                                            if (val && val.totalAmt && val.customerId && val.paymentStatus == 'Not Paid') {
                                                let totalAmt = val.totalAmt | 0, serviceFee = val.serviceFee | 0, groupTotalAmt = 0,
                                                    stripeId, amount = 0, groupOrderId = val.id;
                                                await Customer.findOne({ where: { id: val.customerId } }, async (customerErr, customerRes) => {

                                                    if (customerRes) {

                                                        if (stripeMode) stripeId = customerRes.stripeLiveId;
                                                        else if (!stripeMode) stripeId = customerRes.stripeTestId;

                                                        if (stripeId) {
                                                            groupTotalAmt = totalAmt + serviceFee;
                                                            amount = financial(groupTotalAmt) * 100;
                                                            if (totalAmt >= 1) {
                                                                await stripe.charges.create({
                                                                    amount, currency: 'aud',
                                                                    customer: stripeId
                                                                }, function (err, charge) {
                                                                    if (charge) {
                                                                        updatePaymentStatus = (status = "Not Paid", resultSuccess = {}) => {
                                                                            PaymentHistory.create({
                                                                                groupOrderId, status, totalAmt: financial(groupTotalAmt), timeZone, resultSuccess,
                                                                                countryDate, countryTime, countryDateFormat
                                                                            });
                                                                            Grouporder.upsertWithWhere({ id: groupOrderId },
                                                                                { paymentStatus: status, servicePercentage });
                                                                            let chargeAmt = financial(totalAmt + serviceFee);
                                                                            Order.upsertWithWhere({ id: orderId }, { paymentStatus: status, totalAmt: groupTotalAmt, serviceFee, chargeAmt });

                                                                            if (res.groupOrders && res.groupOrders.length == (i + 1)) isSuccess(true, "Success");
                                                                        }
                                                                        try {
                                                                            if (charge) updatePaymentStatus(charge.status, charge);
                                                                            else updatePaymentStatus();
                                                                        } catch (err) {
                                                                            updatePaymentStatus();
                                                                        }
                                                                    } else {
                                                                        err = JSON.parse(JSON.stringify(err));
                                                                        if (err && err.message)
                                                                            errMessage.push({ customerId: customerRes.id, orderId: orderId, message: err.message, isSuccess: false })
                                                                        else errMessage.push({ customerId: customerRes.id, orderId: orderId, message: "try again", error: err });
                                                                        if (res.groupOrders && res.groupOrders.length == (i + 1)) isSuccess();

                                                                    }
                                                                });
                                                            } else {
                                                                if (res.groupOrders && res.groupOrders.length == (i + 1)) await isSuccess();
                                                            }
                                                        } else {
                                                            if (res.groupOrders && res.groupOrders.length == (i + 1)) await isSuccess();
                                                        }
                                                    } else {
                                                        if (res.groupOrders && res.groupOrders.length == (i + 1)) await isSuccess();
                                                    }
                                                });
                                            } else {
                                                if (res.groupOrders && res.groupOrders.length == (i + 1)) await isSuccess();
                                            }
                                        });
                                    } else isSuccess();
                                } else isSuccess();
                            } else if (!res) isSuccess();
                        })
                } else isSuccess();

            } else isSuccess(false, "AppConfig is missing!");
        });

    }

    Grouporder.remoteMethod('chargeForGroups', {
        http: { path: '/chargeForGroups', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "charge for group order"
    });

    Grouporder.remoteMethod('getGroupOrders', {
        http: { path: '/getGroupOrders', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Get Group Order"
    });

    Grouporder.remoteMethod('createPreOrder', {
        http: { path: '/createPreOrder', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Create Pre Order"
    });

    Grouporder.remoteMethod('getGroupsFromOrder', {
        http: { path: '/getGroupsFromOrder', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Get Group order"
    });
};
