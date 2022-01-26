

const app = require('../../server/server');
const FCM = require('fcm-push');
const serverKey = 'AAAA-4BeD_8:APA91bEyi_SURDeuKRLqoDDWsde4wDNFP5TIFCDD8Je2fQBHr_21fpj8zmzZ0pjGW_mT1PWKYZB2QNgMdOJ4p6dhsjEVk-aQUJHV4vgL6VpJEDI4HCxPOhMwVl0qBz-47OGkzyOopaEe';
const fcm = new FCM(serverKey);
var moment = require('moment-timezone');
var path = require('path');

module.exports = (Order) => {

    // Order.validatesUniquenessOf('orderId');

    Order.observe('before save', function event(ctx, next) {
        prefix = (str, max) => { str = str.toString(); return str.length < max ? prefix("0" + str, max) : str; }
        if (!ctx.where && ctx.instance) Order.count((Err, Res) => { ctx.instance.orderId = `B${prefix((parseInt(Res) + 1), parseInt(Res.toString().length) + 5)}`; next(); })
        else next();
    });

    Order.cartServiceFeeCalc = (params, cb) => {

        let isCallBack = (message = "Error", isSuccess = false, result = {}) => cb(null, { message, isSuccess, result });

        if (params) {
            const MealsDashSubLine = app.models.MealsDashSubLine,
                VenueSettings = app.models.VenueSettings;

            let { items, tipAmt, ownerId, paymentType, currency } = params;

            let calCulate = (data) => {
                VenueSettings.find({ where: { ownerId, category: 'MealsOrder' } }, (transActionErr, VenueSettingsRes) => {


                    var isEnabled, category, isAbsorb, absorbFee, isFixed, fixedFee, isPercentage, percentageFee;


                    if (VenueSettingsRes && VenueSettingsRes.length) {

                        VenueSettingsRes = VenueSettingsRes[0];

                        if (VenueSettingsRes && VenueSettingsRes.isEnabled) {
                            isEnabled = VenueSettingsRes.isEnabled;
                            category = VenueSettingsRes.category;
                            isAbsorb = VenueSettingsRes.isAbsorb;
                            absorbFee = VenueSettingsRes.absorbFee;
                            isFixed = VenueSettingsRes.isFixed;
                            fixedFee = VenueSettingsRes.fixedFee;
                            isPercentage = VenueSettingsRes.isPercentage;
                            percentageFee = VenueSettingsRes.percentageFee;
                        } else {
                            isAbsorb = true;
                            absorbFee = 0;
                        }
                    } else {
                        isAbsorb = true;
                        absorbFee = 0;
                    }

                    let result = { tipAmt, ownerId, items: [], paymentType, currency, subTotal: 0, subTotalAndTip: 0, serviceFee: 0, paidAmount: 0 };
                    data.forEach((m, i) => {

                        if (m && m.item && m.item.qty) {
                            let addOns = [];
                            if (m.item.addOns && m.item.addOns.length) {
                                m.item.addOns.forEach(aR => {
                                    let addOnsData = m.backData.mealsExtraDashLines.find(ex => ex.id == aR.productId);
                                    result.subTotal += addOnsData.price * aR.qty;
                                    addOns.push({ productId: aR.productId, qty: aR.qty, price: addOnsData.price, totalPrice: addOnsData.price * aR.qty });
                                })
                            }
                            result.subTotal += m.backData.price * m.item.qty;
                            result.items.push({
                                qty: m.item.qty, productId: m.item.productId, price: m.backData.price,
                                totalPrice: m.backData.price * m.item.qty, addOns
                            });
                        }

                        if ((i + 1) == data.length) {

                            result.subTotalAndTip = result.subTotal + tipAmt;

                            if (isPercentage) {
                                result.serviceFee = Number((result.subTotalAndTip / 100) * Number(percentageFee));
                                result.percentageFee = percentageFee;
                                result.transActionFeeType = "PercentageFee";
                            } else if (isFixed) {
                                result.serviceFee = result.fixedFee = fixedFee;
                                result.transActionFeeType = "FixedFee";
                            } else if (isAbsorb) {
                                result.serviceFee = result.absorbFee = absorbFee;
                                result.transActionFeeType = "AbsorbFee";
                            }

                            result.paidAmount = result.serviceFee + result.subTotalAndTip;

                            isCallBack("Success", true, result);
                        }
                    })

                });

            }

            let allData = [];


            items.forEach(async (val, i) => {

                let filter = { where: { id: val.productId } }, addonsIdsValues = [];
                if (val.productId) {
                    if (val && val.addOns && val.addOns.length) {
                        val.addOns.forEach(n => { addonsIdsValues.push({ id: n.productId }) })
                        filter = {
                            where: { id: val.productId },
                            include: [{ relation: "mealsExtraDashLines", scope: { where: { or: addonsIdsValues } } }]
                        }
                    }

                    let backData = JSON.parse(JSON.stringify(await MealsDashSubLine.findOne(filter)))

                    allData.push({ item: val, backData });

                    if ((i + 1) == items.length) {
                        calCulate(allData);
                    }
                } else {
                    if ((i + 1) == items.length) {
                        calCulate(allData);
                    }
                }
            })

        } else isCallBack();
    }

    Order.updateStatus = (details, cb) => {
        let data = {}, id, status, tableNo,
            dateFormat = moment.tz(new Date(), 'Australia/Sydney').format('DD-MM-YYYY'),
            time = moment.tz(new Date(), 'Australia/Sydney').format('hh:mm a');

        let isSuccess = (cb, message, isSuccess) => {
            data.isSuccess = isSuccess;
            data.message = message;
            cb(null, data);
        };

        if (details) {
            if (details.id && details.status) {
                id = details.id; status = details.status; tableNo = details.tableNo;
                let updateObj = {};
                if (tableNo) updateObj = { status, [status]: { time, dateFormat }, tableNo };
                else updateObj = { status, [status]: { time, dateFormat } };

                Order.upsertWithWhere({ id }, updateObj, (err, res) => {
                    if (err) isSuccess(cb, `please try again`, true);
                    else if (res) isSuccess(cb, `successfully updated.`, true);
                });
            }
        } else isSuccess(cb, `Details Object is required`, true);
    };

    Order.createReservation = (params = {}, cb) => {

        let timeZone; if (!params.timeZone) timeZone = 'Australia/Sydney';
        else timeZone = params.timeZone;

        let orderDate = moment.tz(new Date(), timeZone).format('DD-MM-YYYY'),
            orderTime = moment.tz(new Date(), timeZone).format('hh:mm a'),
            dateJson = moment.tz(new Date(), timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";

        const Reservation = app.models.Reservation,
            GroupOrder = app.models.GroupOrder;

        const convertTime12to24 = (time12h) => {
            const [time, modifier] = time12h.split(' ');
            let [hours, minutes] = time.split(':');
            (hours === '12' ? hours = '00' : ((modifier === 'PM' || modifier === 'pm') ? hours = parseInt(hours, 10) + 12 : ""));
            return `${hours}:${minutes}`;
        }

        if (params && params.customerId && params.ownerId) {
            let { customerId, ownerId, noPeople, date, time, paymentType, category, isTableOrder } = params;
            Order.create({ customerId, ownerId, isReservation: true, orderDate, orderTime, timeZone, date: dateJson }, (err, res) => {
                if (res) {
                    let convertTime = convertTime12to24(time);
                    let reserve_hour = convertTime[0], reserve_minute = convertTime[1];
                    let countryFormat = JSON.stringify(moment.tz(`${date} ${convertTime}`)),
                        requestDate = `${date}T00:00:00.000Z`;
                    let payingSeparately = false, payingTogether = false;
                    if (paymentType == 'Paying together') payingTogether = true;
                    else if (paymentType == 'Paying separately') payingSeparately = true;
                    GroupOrder.create({ ownerId, customerId, isInviter: true, orderId: res.id, payingTogether, payingSeparately, isReservation: true });
                    Reservation.create({ noPeople, requestDate, reserve_hour, reserve_minute, request: { date, time, countryFormat }, isTableOrder, dateFormat: dateJson, paymentType, category, orderId: res.id, customerId, ownerId, payingTogether, payingSeparately }, () => {
                        cb(null, { message: "Successfully created", isSuccess: true, res })
                    });

                }

            });
        } else {
            cb(null, { message: "Customer Id and OwnerId is required", isSuccess: false, err: {} })
        }
    }


    Order.getCustomerOrders = (details, cb) => {

        let isSuccess = (message = "Please try again!", isSuccess = false) => cb(null, { isSuccess, message });

        if (details && details.customerId) {
            let customerId = details.customerId;

            Order.find({
                "where": { customerId },
                "order": 'date DESC',
                "include": ["reservations",
                    { "relation": "business", "scope": { "fields": ["id", "businessName", "imageUrl", "addressLine1", "addressLine2"] } },
                ]
            }, (err, res) => {
                if (err) cb(null, { "isSuccess": true, "message": 'Error in Order find', "res": [] });
                else cb(null, { "isSuccess": true, res });
            });
        } else isSuccess(`Customer Id is required`, false);
    };

    Order.getOrderDetails = (details, cb) => {

        if (details && details.orderId) {
            let id = details.orderId;
            Order.findOne({
                where: { id },
                order: 'date DESC',
                include: [{ relation: "customer", "scope": { "fields": ["id", "firstName", "lastName", "mobile", "gender"] } },
                { relation: "reservations" },
                {
                    relation: "business", "scope": {
                        include: [{ relation: "weeklyTimings" }, { relation: "bistroHours" }],
                        "fields": ["id", "businessName", "imageUrl", "addressLine1", "addressLine2", "venueInformation", "website", "location"]
                    }
                },
                {
                    relation: "groupOrders", scope: {
                        include: [{
                            "relation": "orderLines",
                            "scope": {
                                "include": [{ "relation": "mealsDashSubLine" },
                                {
                                    "relation": "orderExtraLines",
                                    "scope": { "include": "mealsExtraDashLine" }
                                }]
                            }
                        }]
                    }
                }]
            }, (err, res) => {
                if (err) cb(null, { "isSuccess": true, "message": 'Error in Order find', "res": [] });
                else {
                    res = JSON.parse(JSON.stringify(res));
                    cb(null, { "isSuccess": true, res });
                }
            });
        } else cb(null, { "isSuccess": false, "message": "orderId & customerId is required" });
    };

    Order.createOrder = (params, cb) => {

        let isCallback = (isSuccess = false, message = "Please try again!", res = {}) => cb(null, { isSuccess, message, res });

        const OrderLine = app.models.OrderLine,
            OrderExtraLine = app.models.OrderExtraLine,
            Customer = app.models.Customer,
            Business = app.models.Business,
            MealsDashSubLine = app.models.MealsDashSubLine,
            PaymentHistory = app.models.PaymentHistory,
            GroupOrder = app.models.GroupOrder,
            VenueSettings = app.models.VenueSettings;
        let momentdate = new Date();

        let createOrderLine = (obj) => {
            return new Promise((resolve, reject) => {
                if (obj) {
                    OrderLine.create(obj, (err, res) => {
                        if (res) resolve({ isSuccess: true, result: res });
                        else reject({ isSuccess: false, msg: "Please try again" });
                    });
                } else reject({ isSuccess: false, msg: "qty and price is required." });
            });
        };

        app.models.AppConfig.findOne((err, aPcFres) => {
            if (aPcFres) {
                var stripe, stripeMode = aPcFres.stripeMode;
                if (!aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeTestKey);
                if (aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeLiveKey);

                if (params) {
                    let { customerId, timeZone, arrival, items, ownerId, currency, tableNo, paymentDescription, token, instruction, deliveryType, tipAmt = 0 } = params;
                    let orderTotalAmount = 0;
                    if (!timeZone) timeZone = "Australia/Sydney";
                    let date = moment.tz(momentdate, timeZone).format(),
                        orderDate = moment.tz(momentdate, timeZone).format('DD-MM-YYYY'),
                        orderTime = moment.tz(momentdate, timeZone).format('hh:mm a'),
                        cnt = params.items.length;

                    if (items && items.length) {

                        function financial(x) {
                            return Number.parseFloat(x).toFixed(2);
                        }

                        function validDecimal(value) {
                            if (Math.floor(value) !== value)
                                return value.toString().split(".")[1].length || 0;
                            return 0;
                        }

                        let createOrderLineAndExtraLine = (createRes) => {

                            Business.findOne({ where: { id: ownerId } }, (bGErr, bGRes) => {

                                VenueSettings.find({ where: { ownerId, category: 'MealsOrder' } }, (transActionErr, VenueSettingsRes) => {

                                    VenueSettingsRes = JSON.parse(JSON.stringify(VenueSettingsRes));

                                    var isEnabled, category, isAbsorb, absorbFee, isFixed, fixedFee, isPercentage, percentageFee, stripeTestId, isAccountCreated, stripeLiveId;


                                    if (VenueSettingsRes && VenueSettingsRes.length) {

                                        VenueSettingsRes = VenueSettingsRes[0];

                                        if (bGRes) {
                                            stripeTestId = bGRes.stripeTestId;
                                            isAccountCreated = bGRes.isAccountCreated;
                                            stripeLiveId = bGRes.stripeLiveId;
                                        }

                                        if (VenueSettingsRes && VenueSettingsRes.isEnabled) {
                                            isEnabled = VenueSettingsRes.isEnabled;
                                            category = VenueSettingsRes.category;
                                            isAbsorb = VenueSettingsRes.isAbsorb;
                                            absorbFee = VenueSettingsRes.absorbFee;
                                            isFixed = VenueSettingsRes.isFixed;
                                            fixedFee = VenueSettingsRes.fixedFee;
                                            isPercentage = VenueSettingsRes.isPercentage;
                                            percentageFee = VenueSettingsRes.percentageFee;
                                        } else {
                                            isAbsorb = true;
                                            absorbFee = 0;
                                        }
                                    } else {
                                        isAbsorb = true;
                                        absorbFee = 0;
                                    }

                                    GroupOrder.create({
                                        customerId, orderId: createRes.id, isInviter: true, paymentDescription, token, instruction
                                    }, (errGroupOrder, resGroupOrder) => {
                                        if (resGroupOrder && resGroupOrder.id) {
                                            items.forEach(async (val, itemIndex) => {

                                                let filter = { where: { id: val.productId } }, addonsIdsValues = [];

                                                if (val && val.addOns && val.addOns.length) {
                                                    val.addOns.forEach(n => { addonsIdsValues.push({ id: n.productId }) })
                                                    filter = {
                                                        where: { id: val.productId },
                                                        include: [{ relation: "mealsExtraDashLines", scope: { where: { or: addonsIdsValues } } }]
                                                    }
                                                }

                                                let valData = await MealsDashSubLine.findOne(filter);

                                                valData = JSON.parse(JSON.stringify(valData));

                                                let qty = val.qty,
                                                    totalPrice = (Number(qty)) * (Number(valData.price));
                                                orderTotalAmount = orderTotalAmount + totalPrice;

                                                await createOrderLine({
                                                    groupOrderId: resGroupOrder.id, qty, mealsDashSubLineId: valData.id,
                                                    price: valData.price, customerId, totalPrice, notes: val.notes
                                                }).then((orderDashLineRes) => {

                                                    orderDashLineRes = JSON.parse(JSON.stringify(orderDashLineRes));

                                                    let createAndUpdateStrpi = (totalAmt) => {

                                                        Order.upsertWithWhere({ id: createRes.id }, { totalAmt, tipAmt });
                                                        if (customerId) {
                                                            Customer.findOne({ where: { id: customerId } },
                                                                async (customerErr, customerres) => {
                                                                    let stripeId;
                                                                    if (customerres) {

                                                                        //create strapi payment
                                                                        let createStrapiPayment = () => {

                                                                            let serviceFee = 0;

                                                                            if (isPercentage) {
                                                                                serviceFee = Number(((totalAmt + tipAmt) / 100) * Number(percentageFee));
                                                                                transActionFeeType = "PercentageFee";
                                                                            } else if (isFixed) {
                                                                                serviceFee = fixedFee;
                                                                                transActionFeeType = "FixedFee";
                                                                            } else if (isAbsorb) {
                                                                                serviceFee = absorbFee;
                                                                                transActionFeeType = "AbsorbFee";
                                                                            }

                                                                            let amount = totalAmt + tipAmt;

                                                                            let serviceFeePay = 0;

                                                                            if (serviceFee > 0) {
                                                                                serviceFeePay = (financial(serviceFee)) * 100;
                                                                                if (validDecimal(serviceFeePay) > 2) serviceFeePay = Number((serviceFeePay).toFixed(2));
                                                                            }

                                                                            amount = (financial(amount)) * 100;

                                                                            if (validDecimal(amount) > 2) amount = Number((amount).toFixed(2));

                                                                            let stripeAccount;
                                                                            if (stripeMode == false && stripeTestId && isAccountCreated == true) {
                                                                                stripeAccount = stripeTestId;
                                                                            }
                                                                            else if (stripeMode == true && stripeLiveId && isAccountCreated == true) {
                                                                                stripeAccount = stripeLiveId;
                                                                            }

                                                                            let { businessName } = bGRes;

                                                                            if (businessName) businessName = `Venue name : ${businessName}`;
                                                                            else businessName = '';

                                                                            let chargeObj = {};
                                                                            if (stripeAccount) {
                                                                                chargeObj = {
                                                                                    amount, currency: 'aud',
                                                                                    customer: stripeId,
                                                                                    application_fee_amount: serviceFeePay,
                                                                                    description: `${businessName} , Meals order , Customer Name : ${customerres.firstName} ${customerres.lastName}`,
                                                                                    transfer_data: {
                                                                                        destination: stripeAccount,
                                                                                    }
                                                                                }
                                                                            } else {
                                                                                chargeObj = {
                                                                                    amount, currency: 'aud',
                                                                                    customer: stripeId,
                                                                                    description: `${businessName} , Meals order , Customer Name : ${customerres.firstName} ${customerres.lastName}`
                                                                                }
                                                                            }

                                                                            stripe.charges.create(chargeObj, function (pperr, charge) {

                                                                                let updatePaymentStatus = (status = "Not Paid", resultSuccess = {}) => {

                                                                                    PaymentHistory.create({
                                                                                        groupOrderId: resGroupOrder.id, status,
                                                                                        totalAmt: totalAmt, timeZone, resultSuccess: resultSuccess || { status: "failed" },
                                                                                        resultError: pperr || { status: "succeeded" },
                                                                                        countryDate: orderDate, countryTime: orderTime,
                                                                                        countryDateFormat: date, createFrom: "Meals",
                                                                                        provider: "Stripe"
                                                                                    });

                                                                                    let orderTotal = totalAmt;
                                                                                    totalAmt = financial(totalAmt + serviceFee + tipAmt);
                                                                                    let chargeAmt = totalAmt,
                                                                                        subTotal = orderTotal + tipAmt;

                                                                                    GroupOrder.upsertWithWhere({ id: resGroupOrder.id }, {
                                                                                        serviceFee, paymentStatus: status, orderTotal, tipAmt,
                                                                                        chargeAmt, totalAmt, orderTotal, subTotal, transActionFeeType
                                                                                    });

                                                                                }
                                                                                try {
                                                                                    if (charge) updatePaymentStatus(charge.status, charge);
                                                                                    else updatePaymentStatus("failed", {});
                                                                                } catch (pperr) {
                                                                                    updatePaymentStatus("failed", {});
                                                                                }
                                                                            });
                                                                        }

                                                                        if (stripeMode) stripeId = customerres.stripeLiveId;
                                                                        else if (!stripeMode) stripeId = customerres.stripeTestId;
                                                                        if (!stripeId) {
                                                                            await stripe.customers.create({ email: customerres.email }, (stripeErr, stripeRes) => {
                                                                                if (stripeRes && stripeRes.id) {
                                                                                    if (stripeMode) Customer.upsertWithWhere({ id: customerres.id }, { stripeLiveId: stripeRes.id });
                                                                                    else if (!stripeMode) Customer.upsertWithWhere({ id: customerres.id }, { stripeTestId: stripeRes.id });
                                                                                    stripeId = stripeRes.id;
                                                                                    createStrapiPayment();
                                                                                } else createStrapiPayment();
                                                                            });
                                                                        } else if (stripeId) createStrapiPayment();

                                                                    }
                                                                });
                                                        }
                                                    }

                                                    let orderLinePriceUpdate = () => {
                                                        OrderLine.upsertWithWhere({ id: orderDashLineRes.result.id }, { totalPrice: Number(totalPrice) }, () => {
                                                            if (items.length == (itemIndex + 1)) createAndUpdateStrpi(orderTotalAmount);
                                                        })
                                                    }

                                                    if (val && val.addOns && val.addOns.length) {
                                                        val.addOns.forEach((extraVal, extraIndex) => {

                                                            if (extraVal && extraVal.productId) {

                                                                let lineExtraObj = valData.mealsExtraDashLines.find(m => m.id == extraVal.productId);

                                                                if (lineExtraObj) {

                                                                    let extratotalPrice = Number(lineExtraObj.price) * Number(val.qty);

                                                                    totalPrice = totalPrice + extratotalPrice;

                                                                    orderTotalAmount = orderTotalAmount + extratotalPrice;

                                                                    OrderExtraLine.create({
                                                                        qty: Number(extraVal.qty), price: Number(lineExtraObj.price)
                                                                        , totalPrice: Number(extraVal.qty * lineExtraObj.price),
                                                                        mealsExtraDashLineId: extraVal.productId,
                                                                        orderLineId: orderDashLineRes.result.id
                                                                    });

                                                                    if ((val.addOns.length == (extraIndex + 1))) orderLinePriceUpdate();
                                                                }
                                                            }
                                                        });
                                                    }
                                                    else orderLinePriceUpdate();
                                                });
                                            });
                                        }
                                    })
                                })
                            })




                        }

                        Order.create({
                            ownerId, customerId, timeZone, date, orderDate, orderTime, cnt, tableNo, deliveryType,
                            currency, arrival, awaiting: { time: orderTime, date: orderDate }, isSubmit: true
                        }, (createErr, createRes) => {
                            if (createRes && createRes.id) {
                                setTimeout(function () {
                                    isCallback(true, "Success", createRes);
                                }, 500);
                            } else {
                                setTimeout(function () {
                                    isCallback(false, "failed", createErr);
                                }, 500);
                            }
                            if (createRes && createRes.id) createOrderLineAndExtraLine(createRes);
                        });

                    }
                } else isCallback();

            } else isSuccess(false, "AppConfig is missing!", {});
        });
    };

    Order.addItemsToGroupedOrder = (details, cb) => {
        let data = {};

        let callback = (isSuccess, message) => {
            data.isSuccess = isSuccess;
            data.message = message;
            cb(null, data);
        };

        if (details && 'orderLines' in details && details.orderLines.length && 'orderId' in details && 'customerId' in details) {
            const OrderLine = app.models.OrderLine,
                GroupOrder = app.models.GroupOrder;

            GroupOrder.findOne({ "where": { "orderId": details.orderId, "customerId": details.customerId } }, (gErr, gRes) => {
                if (gErr) {
                    console.log("Error in GroupOrder findOne(addItemsToGroupedOrder Api)");
                    callback(false, "Error in GroupOrder");
                } else if (gRes) {
                    gRes.updateAttributes({ "isOrdered": true });
                    details.orderLines.forEach(o => {
                        OrderLine.create(o.orderLine, (e, r) => {
                            if (r && o.addOns && o.addOns.length) {
                                o.addOns.forEach(o1 => {
                                    r.orderExtraLines.create(o1);
                                });
                            }
                        })
                    });
                    callback(true, "Items Added successfully");
                } else {
                    callback(false, "Grouped order for customer not found");
                }
            });
        } else {
            callback(false, "Missing details object with orderLines");
        }
    }

    Order.getMealsByCategoryName = (details, cb) => {
        let data = {};
        if (details.categoryName && details.ownerId && details.day) {
            const bid = details.ownerId,
                categoryName = details.categoryName,
                dayLowerCase = details.day.toLowerCase(),
                MealsCategory = app.models.MealsCategory,
                MenuHours = app.models.MenuHours;

            const getMenuHours = () => {
                return new Promise(resolve => {
                    MenuHours.find({ "where": { "ownerId": bid, [`${dayLowerCase}.value`]: true } }, function (err, res) {
                        if (res) resolve(JSON.parse(JSON.stringify(res)));
                        resolve([]);
                    });
                })
            };

            const start = async () => {
                let mealsObj = {},
                    promises = [getMenuHours()];

                const [menuHrs] = await Promise.all(promises);

                MealsCategory.find({
                    where: { "category": { "like": `${categoryName}.*`, "options": "i" }, ownerId: bid, [`${dayLowerCase}.value`]: true },
                    include: {
                        relation: "mealsDashLines",
                        scope: {
                            where: { [dayLowerCase]: true, isAvailable: true },
                            include: [{
                                relation: "dashSubLines",
                                scope: {
                                    where: { [dayLowerCase]: true },
                                    include: "mealsExtraDashLines"
                                }
                            }, { relation: "mealsDashLineAddons" }]
                        }
                    }
                }, (err, res) => {
                    if (err) {
                        console.log(err);
                        data.isSuccess = true;
                        data.res = [];
                        data.message = "Error in MealsDashLine find";
                        cb(null, data);
                    } else {
                        res = JSON.parse(JSON.stringify(res));
                        data.res = (res && res.length) ? res.filter(m => {
                            if (m && m.mealsDashLines && m.mealsDashLines.length) {
                                m.inTime = (mealsObj[m.category]) ? true : false;
                                return m;
                            }
                        }) : [];
                        data.isSuccess = true;
                        data.menuHours = menuHrs;
                        cb(null, data);
                    }
                });
            };
            start();
        } else {
            data.isSuccess = true;
            data.res = [];
            data.message = "Missing ownerId, categoryName, day, hour or minute properties";
            cb(null, data);
        }
    }

    Order.getCustomerGroupOrder = (params = {}, cb) => {

        let isSuccess = (message = "Please try again", isSuccess = false, res = []) => cb(null, { message, isSuccess, res });

        if (params && params.customerId) {

            let customerId = params.customerId;

            const GroupOrder = app.models.GroupOrder;

            GroupOrder.find({
                where: { customerId }, include: [{
                    relation: "order",
                    scope: {
                        include: [{ relation: "reservations" }, {
                            relation: "business", "scope": {
                                "fields": ["id", "businessName", "imageUrl",
                                    "addressLine1", "addressLine2", "location", "state", "id", "zipCode", "suburb", "city", "country"]
                            }
                        }]
                    }
                }]
            }, (err, res) => {
                res = JSON.parse(JSON.stringify(res));
                if (err) isSuccess("Error", false, []);
                else if (res && res.length) isSuccess("Success", true, res);
                else isSuccess("No Data!", false, []);
            })
        } else isSuccess("Please try again. CustomerId is required!", false, []);
    };

    Order.acceptInvitation = (params = {}, cb) => {
        const GroupOrder = app.models.GroupOrder;
        let isSuccess = (message = "Please try again", isSuccess = false) => cb(null, { message, isSuccess });
        if (params && params.ownerId && params.customerId && params.orderId) {
            let ownerId = params.ownerId, customerId = params.customerId, orderId = params.orderId;
            GroupOrder.create({ ownerId, customerId, orderId });
            isSuccess("Success", true)
        } else isSuccess("ownerId && customerId && orderId is required", false);
    }

    Order.isVaildGroupOrder = (params = {}, cb) => {
        const GroupOrder = app.models.GroupOrder;
        let isSuccess = (message = "Please try again", isSuccess = false) => cb(null, { message, isSuccess });
        if (params && params.customerId && params.orderId) {
            let customerId = params.customerId, orderId = params.orderId;
            GroupOrder.find({ where: { customerId, orderId } }, (err, res) => {
                if (err) isSuccess()
                else {
                    if (res && res.length) cb(null, { isAvailable: true, res });
                    else cb(null, { isAvailable: false });
                }
            });
        } else isSuccess("customerId && orderId is required", false);
    }

    Order.getOrders = (details, cb) => {
        let data = {};

        let isSuccess = (cb, message, isSuccess) => {
            data.isSuccess = isSuccess;
            data.message = message;
            cb(null, data);
        };

        if (details && details.ownerId) {
            let ownerId = details.ownerId, date;
            if (details.date) {
                date = {
                    gte: new Date(details.date),
                    lt: new Date(details.date)
                }
            }
            Order.find({
                where: { ownerId, isSubmit: true },
                include: [{
                    relation: "groupOrders", scope: {
                        include: [{
                            relation: "orderLines",
                            scope: {
                                include: [{ relation: "mealsDashSubLine" }, {
                                    relation: "orderExtraLines",
                                    scope: { include: "mealsExtraDashLine" }
                                }]
                            }
                        }, { relation: "customer" },
                        { relation: "paymentHistories" }]
                    }
                }, { relation: "customer" },
                { relation: "reservations" }]
            }, (err, res) => {
                if (res && res.length) {
                    data.result = [];
                    data.result = res.reverse();
                    isSuccess(cb, `successfully created.`, true);
                } else isSuccess(cb, `No data. Please try again`, false);
            });
        } else isSuccess(cb, `OwnerId is required`, false);
    };

    Order.requestForEvent = (id, cb) => {
        const WhatsOnReservation = app.models.WhatsOnReservation;
        let isSuccess = (message = "Please try again", isSuccess = false) => cb(null, { message, isSuccess });
        if (id) {
            WhatsOnReservation.find({
                where: { id },
                include: [{
                    relation: "happenings",
                    scope: { include: [{ relation: "business", scope: { fields: ["businessName", "imageUrl"] } }] }
                }]
            }, (err, res) => {
                if (err) isSuccess()
                else {
                    if (res && res.length) {
                        let result = JSON.parse(JSON.stringify(res));
                        cb(null, { isSuccess: true, result: result[0] });
                    }
                    else cb(null, { isSuccess: false, result: {} });
                }
            });
        } else isSuccess("Id is required", false);
    };

    Order.remoteMethod('cartServiceFeeCalc', {
        http: { path: '/cartServiceFeeCalc', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });

    Order.remoteMethod('requestForEvent', {
        http: { path: '/requestForEvent', verb: 'post' },
        accepts: { arg: 'params', type: 'string' },
        returns: { arg: 'data', type: 'object' }
    });

    Order.remoteMethod('isVaildGroupOrder', {
        http: { path: '/isVaildGroupOrder', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });

    Order.remoteMethod('acceptInvitation', {
        http: { path: '/acceptInvitation', verb: 'post' },
        accepts: { arg: 'id', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });

    Order.remoteMethod('getCustomerGroupOrder', {
        http: { path: '/getCustomerGroupOrder', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });

    Order.remoteMethod('createReservation', {
        http: { path: '/createReservation', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });

    Order.remoteMethod('updateStatus', {
        http: { path: '/updateStatus', verb: 'post' },
        accepts: { arg: 'details', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });

    Order.remoteMethod('getOrders', {
        http: { path: '/getOrders', verb: 'get' },
        accepts: { arg: 'details', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });

    Order.remoteMethod('getCustomerOrders', {
        http: { path: '/getCustomerOrders', verb: 'get' },
        accepts: { arg: 'details', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });

    Order.remoteMethod('getOrderDetails', {
        http: { path: '/getOrderDetails', verb: 'get' },
        accepts: { arg: 'details', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });

    Order.remoteMethod('createOrder', {
        http: { path: '/createOrder', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });

    Order.remoteMethod('addItemsToGroupedOrder', {
        http: { path: '/addItemsToGroupedOrder', verb: 'post' },
        accepts: { arg: 'details', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });

    Order.remoteMethod('getMealsByCategoryName', {
        http: { path: '/getMealsByCategoryName', verb: 'get' },
        accepts: { arg: 'details', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });
};
