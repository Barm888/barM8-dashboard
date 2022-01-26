
let app = require('../../server/server');
let pubsub = require('../../server/pubsub');
var moment = require('moment-timezone');

module.exports = function (Drinksorder) {

    Drinksorder.validatesUniquenessOf('orderId');

    Drinksorder.observe('before save', async function event(ctx, next) {
        const AppConfig = app.models.AppConfig;
        prefix = (str, max) => { str = str.toString(); return str.length < max ? prefix("0" + str, max) : str; }
        let orderCnt = await AppConfig.findOne({ type: "barm8" })
        if (orderCnt && !ctx.where && ctx.instance) {
            ctx.instance.orderId = `BD${prefix((parseInt(orderCnt.drinksOrderCnt) + 1), (parseInt(orderCnt.drinksOrderCnt)).toString().length + 7)}`;
            orderCnt.updateAttributes({ drinksOrderCnt: (parseInt(orderCnt.drinksOrderCnt) + 1) });
        } else if (!ctx.where && ctx.instance) Drinksorder.count((Err, Res) => {
            ctx.instance.orderId = `BD${prefix((parseInt(Res) + 1), parseInt(Res.toString().length) + 7)}`;
            next();
        })
    });

    Drinksorder.cartServiceFeeCalc = (params, cb) => {

        const DrinksDashLine = app.models.DrinksDashLine,
            VenueSettings = app.models.VenueSettings,
            DrinksSpecialDashLine = app.models.DrinksSpecialDashLine;

        let isCallBack = (message = "Error", isSuccess = false, result = {}) => cb(null, { message, isSuccess, result });

        if (params) {
            let { ownerId, dashLine, tipAmt, timeZone, currency } = params;

            VenueSettings.find({ where: { ownerId, category: 'DrinksOrder' } }, (transActionErr, VenueSettingsRes) => {


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

                if (dashLine && dashLine.length) {

                    let getData = (v, i) => new Promise(async (resolve, reject) => {
                        if (v) {
                            if (v.isSpecial == false) {
                                let filter = { where: { id: v.id } };
                                if (v.dashSubLine && v.dashSubLine.length) {
                                    filter.include = [];
                                    let ids = [];
                                    v.dashSubLine.forEach(d => { ids.push({ id: d.id }) });
                                    filter.include.push({ relation: "drinksDashSubLines", scope: { where: { or: ids } } })
                                }
                                await DrinksDashLine.findOne(filter, (err, res) => {
                                    res = JSON.parse(JSON.stringify(res));
                                    resolve({ isCallb: true, res, i });
                                });
                            } else {
                                let filter = { where: { id: v.id } };
                                if (v.dashSubLine && v.dashSubLine.length) {
                                    filter.include = [];
                                    let ids = [];
                                    v.dashSubLine.forEach(d => { ids.push({ id: d.id }) });
                                    filter.include.push({ relation: "drinksSpecialDashSubLines", scope: { where: { or: ids } } })
                                }
                                await DrinksSpecialDashLine.findOne(filter, (err, res) => {
                                    res = JSON.parse(JSON.stringify(res));
                                    resolve({ isCallb: true, res, i });
                                })
                            }
                        } else resolve(false, res);
                    })

                    let serviceFeeCall = async (sData) => {
                        let result = { ownerId, tipAmt, timeZone, currency, dashLine: [], subTotal: 0, subTotalAndTip: 0, serviceFee: 0, paidAmount: 0 };

                        await sData.forEach((v, i) => {
                            result.dashLine.push({ id: v.item.id, isSpecial: v.item.isSpecial, dashSubLine: [] });
                            v.item.dashSubLine.forEach((f, j) => {
                                if (v.fData.drinksSpecialDashSubLines) {
                                    let df = v.fData.drinksSpecialDashSubLines.find(m => m.id == f.id);
                                    let qty = 0, price = 0, totalPrice = 0;
                                    if (df) {
                                        qty = Number(f.qty);
                                        price = Number(df.price);
                                        totalPrice = qty * price;
                                    }
                                    result.subTotal += totalPrice;
                                    result.dashLine[i].dashSubLine.push({ id: f.id, qty, price, totalPrice });
                                } else if (v.fData.drinksDashSubLines) {
                                    let df = v.fData.drinksDashSubLines.find(m => m.id == f.id);
                                    let qty = 0, price = 0, totalPrice = 0;
                                    if (df) {
                                        qty = Number(f.qty);
                                        price = Number(df.price);
                                        totalPrice = qty * price;
                                    }
                                    result.subTotal += totalPrice;
                                    result.dashLine[i].dashSubLine.push({ id: f.id, qty, price, totalPrice });
                                } else {
                                    result.dashLine[i].dashSubLine.push({ id: f.id, qty: 0, price: 0, totalPrice: 0 });
                                }

                                if ((i + 1) == sData.length && v.item.dashSubLine.length == (j + 1)) {

                                    result.subTotalAndTip = result.subTotal + tipAmt || 0;

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
                        })

                    }

                    const start = async () => {
                        let allData = [];
                        await dashLine.forEach(async (data, i) => {
                            await getData(data, i).then(async (v) => {
                                if (v.isCallb) {
                                    allData.push({ item: data, fData: v.res });
                                    if ((v.i + 1) == dashLine.length) {
                                        await setTimeout(async () => {
                                            await serviceFeeCall(allData);
                                        }, 600);
                                    }
                                } else {
                                    if ((v.i + 1) == dashLine.length) await isCallBack();
                                }
                            });
                        });
                    }

                    start();


                } else isCallBack();
            })

        } else isCallBack();
    }

    Drinksorder.updateStatus = (params, cb) => {

        let dateFormat = moment.tz(new Date(), 'Australia/Sydney').format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z",
            time = moment.tz(new Date(), 'Australia/Sydney').format('hh:mm a');

        let isSuccess = (isSuccess = false, message = 'Please try again!', data = {}) => cb(null, { isSuccess, message, data });

        if (params && params.id && params.status) {
            let { id, status, tableNo, reason } = params, updateObj = {};
            if (tableNo && reason) updateObj = { status, [status]: { time, dateFormat, reason }, tableNo };
            else if (reason) updateObj = { status, [status]: { time, dateFormat, reason }, tableNo };
            else if (tableNo) updateObj = { status, [status]: { time, dateFormat }, tableNo };
            else updateObj = { status, [status]: { time, dateFormat } };

            Drinksorder.upsertWithWhere({ id }, updateObj, (err, res) => {
                if (err) isSuccess(true, `please try again`);
                else if (res) { isSuccess(true, `successfully created.`); }
            });
        } else isSuccess(true, `Details Object is required`);
    };

    Drinksorder.createOrder = (params, cb) => {

        var socket = Drinksorder.app.io;

        let isSuccess = (isSuccess = false, message = 'Please try again!', data = {}) => cb(null, { isSuccess, message, data });

        app.models.AppConfig.findOne((err, aPcFres) => {
            if (aPcFres) {

                var stripe, stripeMode = aPcFres.stripeMode;
                if (!aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeTestKey);
                if (aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeLiveKey);


                if (params) {
                    const DrinksOrderLine = app.models.DrinksOrderLine, DrinksOrderSubLine = app.models.DrinksOrderSubLine,
                        DrinksCategory = app.models.DrinksCategory, DrinksOrderCategory = app.models.DrinksOrderCategory,
                        DrinksSpecialDashLine = app.models.DrinksSpecialDashLine,
                        DrinksDashSubLine = app.models.DrinksDashSubLine, DrinksSpecialDashSubLine = app.models.DrinksSpecialDashSubLine,
                        DrinksExtras = app.models.DrinksExtras, DrinksMixer = app.models.DrinksMixer,
                        PaymentHistory = app.models.PaymentHistory,
                        Business = app.models.Business,
                        Customer = app.models.Customer,
                        DrinksDashLine = app.models.DrinksDashLine;
                    const VenueSettings = app.models.VenueSettings;

                    let { ownerId, customerId, currency = "AUD", timeZone = "Australia/Sydney", deliveryType, tableNo, comments, dashLine, tipAmt = 0 } = params;

                    let stripeId;

                    if (ownerId && customerId && dashLine && dashLine.length) {

                        let orderDate = moment.tz(new Date(), 'Australia/Sydney').format('DD-MM-YYYY'),
                            orderTime = moment.tz(new Date(), 'Australia/Sydney').format('hh:mm a'),
                            date = moment.tz(new Date(), 'Australia/Sydney').format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";

                        updateTotalPriceAndQty = (order) => {

                            if (order && order.id) {

                                VenueSettings.find({ where: { ownerId, category: 'DrinksOrder' } }, (VenueSettingsErr, VenueSettingsRes) => {
                                    var isEnabled, category, isAbsorb, absorbFee, isFixed, fixedFee, isPercentage, percentageFee;

                                    if (VenueSettingsRes && VenueSettingsRes.length) {
                                        VenueSettingsRes = VenueSettingsRes[0]
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

                                    let serviceFeeType = (isAbsorb ? 'AbsorbFee' : (isFixed ? 'FixedFee' : (isPercentage ? 'PercentageFee' : 0)));

                                    Drinksorder.findOne({ where: { id: order.id }, include: [{ relation: "drinksOrderLines", scope: { include: "drinksOrderSubLines" } }] }, (dOrderErr, dOrderres) => {
                                        if (dOrderres) {

                                            let ltotalPrice = 0, ltotalQty = 0;
                                            dOrderres = JSON.parse(JSON.stringify(dOrderres));
                                            dOrderres.drinksOrderLines.forEach((val, m) => {
                                                let totalPrice = val.drinksOrderSubLines.map((v, i) => { return v.qty * v.price }).reduce((a, b) => a + b, 0);
                                                let totalQty = val.drinksOrderSubLines.reduce((a, b) => a + b.qty, 0);
                                                ltotalQty += totalQty;
                                                ltotalPrice += totalPrice;
                                                DrinksOrderLine.upsertWithWhere({ id: val.id }, { totalPrice, totalQty })
                                            });

                                            tipAmt = Number(tipAmt);
                                            let orderTotal = Number(ltotalPrice),
                                                subTotal = Number(ltotalPrice + tipAmt);
                                            let serviceFee = 0;

                                            if (isPercentage) {
                                                serviceFee = Number(((orderTotal + tipAmt) / 100) * Number(percentageFee));
                                            } else if (isFixed) {
                                                serviceFee = fixedFee;
                                            } else if (isAbsorb) {
                                                serviceFee = absorbFee;
                                            }
                                            //subTotal = Tip + price

                                            serviceFee = Number(serviceFee);

                                            let totalAmt = Number(ltotalPrice) + Number(tipAmt) + Number(serviceFee);
                                            ltotalPrice = Number(ltotalPrice) + Number(tipAmt);

                                            Drinksorder.upsertWithWhere({ id: order.id }, {
                                                tipAmt, orderTotal,
                                                totalQty: ltotalQty, subTotal, totalAmt,
                                                serviceFee, serviceFeeType
                                            });


                                            function financial(x) {
                                                return Number.parseFloat(x).toFixed(2);
                                            }

                                            function validDecimal(value) {
                                                if (Math.floor(value) !== value)
                                                    return value.toString().split(".")[1].length || 0;
                                                return 0;
                                            }


                                            let payNow = (cusData) => {

                                                let stripeTestId, isAccountCreated, stripeLiveId;

                                                Business.findOne({ where: { id: ownerId } }, (venueErr, venueRes) => {
                                                    let { businessName } = venueRes;


                                                    if (venueRes) {
                                                        stripeTestId = venueRes.stripeTestId;
                                                        isAccountCreated = venueRes.isAccountCreated;
                                                        stripeLiveId = venueRes.stripeLiveId;
                                                    }

                                                    if (businessName) businessName = `Venue name : ${businessName}`;
                                                    else businessName = '';

                                                    let amount = 0, serviceFeePay = 0
                                                    if (totalAmt > 0) {
                                                        amount = (financial(totalAmt)) * 100;
                                                        if (validDecimal(amount) > 2) amount = Number((amount).toFixed(2));
                                                    }
                                                    if (serviceFee > 0) {
                                                        serviceFeePay = (financial(serviceFee)) * 100;
                                                        if (validDecimal(serviceFeePay) > 2) serviceFeePay = Number((serviceFeePay).toFixed(2));
                                                    }

                                                    let stripeAccount;
                                                    if (stripeMode == false && stripeTestId && isAccountCreated == true) {
                                                        stripeAccount = stripeTestId;
                                                    }
                                                    else if (stripeMode == true && stripeLiveId && isAccountCreated == true) {
                                                        stripeAccount = stripeLiveId;
                                                    }


                                                    try {

                                                        let chargeObj = {};
                                                        if (stripeAccount) {
                                                            chargeObj = {
                                                                amount, currency: 'aud',
                                                                customer: stripeId,
                                                                application_fee_amount: serviceFeePay,
                                                                description: `${businessName} , Customer name : ${cusData.firstName}
                                                             ${cusData.lastName}, Drinks Order : ${order.id} `,
                                                                transfer_data: {
                                                                    destination: stripeAccount,
                                                                }
                                                            }
                                                        } else {
                                                            chargeObj = {
                                                                amount, currency: 'aud',
                                                                customer: stripeId,
                                                                description: `${businessName} , Customer name : ${cusData.firstName}
                                                             ${cusData.lastName}, Drinks Order : ${order.id} `
                                                            }
                                                        }

                                                        stripe.charges.create(chargeObj, async function (pperr, charge) {

                                                            let status = 'failed';

                                                            if (charge && charge.status) status = charge.status;

                                                            await Drinksorder.upsertWithWhere({ id: order.id }, { paymentStatus: status || 'failed' });

                                                            await PaymentHistory.create({
                                                                drinksOrderId: order.id, status,
                                                                totalAmt, timeZone, resultSuccess: charge || { status: "failed" },
                                                                resultError: pperr || { status: "succeeded" },
                                                                countryDate: orderDate, countryTime: orderTime,
                                                                countryDateFormat: date, createFrom: "Drinks Order",
                                                                provider: "Stripe"
                                                            });

                                                            await pubsub.publish(socket, order.id);
                                                        });
                                                    } catch (e) {

                                                        Drinksorder.upsertWithWhere({ id: order.id }, { paymentStatus: 'failed' });

                                                        PaymentHistory.create({
                                                            drinksOrderId: order.id, status: 'failed',
                                                            totalAmt, timeZone, resultSuccess: { status: 'failed' },
                                                            countryDate: orderDate, countryTime: orderTime,
                                                            countryDateFormat: date, createFrom: "Drinks Order",
                                                            provider: "Stripe"
                                                        });

                                                        pubsub.publish(socket, order.id);
                                                    }


                                                })


                                            }


                                            Customer.findOne({ where: { id: customerId } }, async (cusErr, cusRes) => {
                                                if (stripeMode && cusRes && cusRes.stripeLiveId) stripeId = cusRes.stripeLiveId;
                                                else if (!stripeMode && cusRes && cusRes.stripeTestId) stripeId = cusRes.stripeTestId;
                                                if (!stripeId) {
                                                    await stripe.customers.create({ email: cusRes.email }, (stripeErr, stripeRes) => {
                                                        if (stripeRes && stripeRes.id) {
                                                            let updateObJ = {};
                                                            if (stripeMode) updateObJ.stripeLiveId = stripeRes.id;
                                                            else if (!stripeMode) updateObJ.stripeTestId = stripeRes.id;

                                                            Customer.upsertWithWhere({ id: customerId }, updateObJ);

                                                            stripeId = stripeRes.id;
                                                            payNow(cusRes);
                                                        }
                                                    });
                                                } else if (stripeId) payNow(cusRes);
                                            })

                                        }
                                    })
                                })


                            }
                        }


                        create = async () => {
                            await Drinksorder.create({
                                ownerId, customerId, timeZone, currency, tableNo,
                                comments, deliveryType, orderDate, orderTime, date,
                                awaiting: { time: orderTime, date }
                            }, (err, res) => {
                                if (err) isSuccess(false, "failed", err);
                                else if (res) {

                                    let categoriesIds = [], dashLineIds = [], dashSubLinesIds = [],
                                        dashSpecialLineIds = [], dashSpecialSubLinesIds = [];

                                    if (dashLine && dashLine.length) {

                                        dashLine.forEach(v => {
                                            categoriesIds.push({ id: v.categoryId });
                                            if (v.isSpecial == false) {
                                                dashLineIds.push({ id: v.id });
                                                v.dashSubLine.forEach(sl => {
                                                    dashSubLinesIds.push({ id: sl.id })
                                                })
                                            } else if (v.isSpecial) {
                                                dashSpecialLineIds.push({ id: v.id });
                                                v.dashSubLine.forEach(sl => {
                                                    dashSpecialSubLinesIds.push({ id: sl.id })
                                                })
                                            }
                                        });

                                        DrinksCategory.find({ where: { or: categoriesIds } }, async (cateErr, cateRes) => {

                                            for (let i in dashLine) dashLine[i].category = cateRes.find(m => m.id == dashLine[i].categoryId);

                                            createDashLine = (categoriesArr) => {

                                                if (dashLineIds && dashLineIds.length) {

                                                    DrinksDashLine.find({ where: { or: dashLineIds } }, (dLSubLineErr, dLSubLineData) => {

                                                        dLSubLineData = JSON.parse(JSON.stringify(dLSubLineData));

                                                        DrinksDashSubLine.find({ where: { or: dashSubLinesIds } }, (sUbLErr, sUbLRES) => {

                                                            sUbLRES = JSON.parse(JSON.stringify(sUbLRES));

                                                            if (dLSubLineData && dLSubLineData.length) {

                                                                dashLine.forEach(async (line, li) => {

                                                                    if (line.isSpecial == false) {

                                                                        let dashLineIds = dLSubLineData.find(m => m.id == line.id);
                                                                        let cGories = categoriesArr.find(m => m._category == line.category._category);

                                                                        if (cGories && dashLineIds && dashLineIds.id) {

                                                                            await DrinksOrderLine.create({
                                                                                drinksOrderId: res.id,
                                                                                drinksOrderCategoryId: cGories.id, drinksDashLineId: line.id
                                                                            }, (drinksDashLineErr, drinksDashLineRes) => {
                                                                                if (drinksDashLineRes && drinksDashLineRes.id) {
                                                                                    line.dashSubLine.forEach(async (sLineRes, si) => {
                                                                                        if (sLineRes && sLineRes.id) {
                                                                                            let subLineBD = sUbLRES.find(m => m.id == sLineRes.id);
                                                                                            if (subLineBD) {

                                                                                                await DrinksOrderSubLine.create({ drinksOrderLineId: drinksDashLineRes.id, drinksDashSubLineId: sLineRes.id, totalPrice: Number(sLineRes.qty) * Number(subLineBD.price), price: Number(subLineBD.price), qty: Number(sLineRes.qty), noGlass: sLineRes.noGlass }, async () => {
                                                                                                    if (line.dashSubLine.length == (si + 1) && (dashLine.length == (li + 1))) {
                                                                                                        setTimeout(function () { updateTotalPriceAndQty(res); }, 600);
                                                                                                    }
                                                                                                });


                                                                                            }
                                                                                        }
                                                                                    })
                                                                                }
                                                                            })
                                                                        }
                                                                    }


                                                                })
                                                            }
                                                        })

                                                    })
                                                }

                                                if (dashSpecialLineIds && dashSpecialLineIds.length) {

                                                    DrinksSpecialDashLine.find({ where: { or: dashSpecialLineIds } }, (dLSubLineErr, dLSubLineData) => {

                                                        dLSubLineData = JSON.parse(JSON.stringify(dLSubLineData));

                                                        DrinksSpecialDashSubLine.find({ where: { or: dashSpecialSubLinesIds } }, (sUbLErr, sUbLRES) => {

                                                            sUbLRES = JSON.parse(JSON.stringify(sUbLRES));

                                                            if (dLSubLineData && dLSubLineData.length) {

                                                                dashLine.forEach(async (line, li) => {

                                                                    if (line.isSpecial) {

                                                                        let dashLineIds = dLSubLineData.find(m => m.id == line.id);
                                                                        let cGories = categoriesArr.find(m => m._category == line.category._category);

                                                                        if (cGories && dashLineIds && dashLineIds.id) {
                                                                            await DrinksOrderLine.create({
                                                                                drinksOrderId: res.id, isSpecial: true,
                                                                                drinksOrderCategoryId: cGories.id, drinksSpecialDashLineId: line.id
                                                                            }, (drinksDashLineErr, drinksDashLineRes) => {
                                                                                if (drinksDashLineRes && drinksDashLineRes.id) {
                                                                                    line.dashSubLine.forEach(async (sLineRes, si) => {
                                                                                        if (sLineRes && sLineRes.id) {
                                                                                            let subLineBD = sUbLRES.find(m => m.id == sLineRes.id);
                                                                                            if (subLineBD) {

                                                                                                await DrinksOrderSubLine.create({ drinksOrderLineId: drinksDashLineRes.id, drinksSpecialDashSubLineId: sLineRes.id, totalPrice: Number(sLineRes.qty) * Number(subLineBD.price), price: Number(subLineBD.price), qty: Number(sLineRes.qty), noGlass: sLineRes.noGlass }, () => {
                                                                                                    if (line.dashSubLine.length == (si + 1) && (dashLine.length == (li + 1))) {
                                                                                                        setTimeout(function () {
                                                                                                            updateTotalPriceAndQty(res);
                                                                                                        }, 600);
                                                                                                    }
                                                                                                });


                                                                                            }
                                                                                        }
                                                                                    })
                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    })
                                                }


                                            };

                                            let categoriesArr = [];
                                            cateRes.forEach(async (v, i) => {
                                                let { category, _category, shortName, order, displayTxt, _name, name, _idtxt, img_url } = v;
                                                await DrinksOrderCategory.upsertWithWhere({ category }, {
                                                    category, _category, shortName, order, displayTxt,
                                                    _name, name, _idtxt, img_url, class: v.class
                                                }, (dOCateErr, dOCateRes) => {
                                                    categoriesArr.push(dOCateRes);
                                                    if ((i + 1) == cateRes.length && dOCateRes) { createDashLine(categoriesArr); }
                                                })
                                            });

                                        });
                                    }
                                    isSuccess(true, "Success", res);
                                }
                                else isSuccess();
                            });
                        }

                        create();

                    } else isSuccess(false, "ownerId && customerId && dashLine is required. Please try again");
                } else isSuccess(false, "Params is required!");
            } else isSuccess(false, "AppConfig is missing!", {});
        });
    };


    Drinksorder.getOrdersForCustomer = (params, cb) => {

        if (params) {
            let { customerId, orderId } = params;
            if (customerId) {

                var where = { customerId };
                if (orderId) where.id = orderId;

                let fields = ["suburb", "zipCode", "state", "city", "website", "contact2", "contact1", "country", "qrImageUrl", "qrCode", "email", "phone", "abn", "businessName", "username", "confirmEmail", "id", "mobile", "eddystoneNameSpaceId", "eddystoneInstanceId", "location", "addressLine2", "addressLine1", "imageUrl", "landline", "venueInformation"];

                Drinksorder.find({
                    where,
                    include: [{ relation: "customer" },
                    {
                        relation: "drinksOrderLines",
                        scope: {
                            include: [{
                                relation: "drinksDashLine"
                            }, {
                                relation: "drinksOrderSubLines",
                                scope: { include: [{ relation: "drinksDashSubLine" }] }
                            }]
                        }
                    }, {
                        relation: "business",
                        scope: {
                            fields,
                            include: [{ relation: "weeklyTimings" }, { relation: "bistroHours" }]
                        }
                    }]
                }, (err, res) => {
                    if (err) cb(null, { isSuccess: false, message: "Error", data: err });
                    else if (res && res.length) cb(null, { isSuccess: true, message: "Success", data: res });
                    else cb(null, { isSuccess: false, message: "No Data!", data: [] });
                })
            } else cb(null, { isSuccess: false, message: "customerId is required!", data: [] });
        } else cb(null, { isSuccess: false, message: "Params is required!", data: [] });
    };


    Drinksorder.getOrders = (params, cb) => {

        let isSuccess = (isSuccess = false, message = 'Please try again!', data = []) => cb(null, { isSuccess, message, data });

        if (params && params.ownerId) {
            let { ownerId } = params;
            Drinksorder.find({
                where: { ownerId }, include: [{
                    relation: "drinksOrderLines", scope: {
                        include: [{ relation: "drinksOrderSubLines", scope: { include: [{ relation: "drinksDashSubLine" }, { relation: "drinksSpecialDashSubLine" }] } },
                        { relation: "drinksExtras" }, { relation: "drinksMixers" },
                        { relation: "drinksOrderCategory" }, { relation: "drinksDashLine" }, { relation: "drinksSpecialDashLine" }]
                    }
                }, { relation: "customer" }, { relation: "drinksOrderType" }], "order": "isCreate desc"
            }, (err, res) => {
                if (err) isSuccess();
                else if (res && res.length) {
                    res = JSON.parse(JSON.stringify(res));
                    isSuccess(true, "Success", res);
                }
            });
        } else isSuccess(false, "Owner id is required");
    }

    Drinksorder.remoteMethod('cartServiceFeeCalc', {
        http: { path: '/cartServiceFeeCalc', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "cartServiceFeeCalc"
    });

    Drinksorder.remoteMethod('getOrdersForCustomer', {
        http: { path: '/getOrdersForCustomer', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "update status"
    });

    Drinksorder.remoteMethod('updateStatus', {
        http: { path: '/updateStatus', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "update status"
    });

    Drinksorder.remoteMethod('getOrders', {
        http: { path: '/getOrders', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "get orders"
    });

    Drinksorder.remoteMethod('createOrder', {
        http: { path: '/createOrder', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Create drinks order"
    });
};
