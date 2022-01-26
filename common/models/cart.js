'use strict';
let app = require('../../server/server');
var moment = require('moment-timezone');

module.exports = function (Cart) {

    Cart.createAndUpsert = (details, cb) => {
        const CartItem = app.models.CartItem, CartAddons = app.models.CartAddons, MealsDashSubLine = app.models.MealsDashSubLine, MealsExtraDashSubLine = app.models.MealsExtraDashSubLine;
        let data = {}
            , momentdate = new Date()
            , date = moment.tz(momentdate, details.timeZone).format('YYYY-MM-DD hh:mm A');
        if (details && details.ownerId) {
            if (details.timeZone && details.customerId && details.items && details.items.length > 0) {
                let timeZone = details.timeZone, customerId = details.customerId, ownerId = details.ownerId, cartTotalAmt = 0, cartTotalPay = 0, cartTaxAmt = 0;

                let createOrder = () => {
                    Cart.create({ date, timeZone, customerId, ownerId }, (err, res) => {
                        if (err) {
                            cb(null, { msg: "Please try again", isSuccess: false, errorMsg: err });
                        } else if (res) {
                            details.items.forEach(async (v, i) => {

                                if (v && v.productId) {
                                    
                                    await MealsDashSubLine.findById(v.productId, async (MealsDashLineErr, mealsItemsRes) => {
                                        if (MealsDashLineErr) {
                                            cb(null, { msg: "Please try again", isSuccess: false, errorMsg: MealsDashLineErr });
                                        }
                                        else if (mealsItemsRes) {

                                            let mealsItems = JSON.parse(JSON.stringify(mealsItemsRes)), price = (parseFloat(mealsItems.price ? mealsItems.price : 0)), taxPer = 10,
                                                totalAmt = price * (v.qty), taxAmt = 0, totalPay = totalAmt - taxAmt;
                                            cartTotalAmt = cartTotalAmt + totalAmt; cartTotalPay = cartTotalPay + totalPay; cartTaxAmt = (parseFloat(cartTaxAmt)) + (parseFloat(taxAmt));

                                            await CartItem.create({ date, timeZone, mealsDashSubLineId: v.productId, qty: v.qty, cartId: res.id, price, totalAmt, totalPay, taxAmt, taxPer }, (cartItemErr, cartItemRes) => {
                                                if (cartItemErr) {
                                                    cb(null, { msg: "Please try again", isSuccess: false, errorMsg: cartItemErr });
                                                } else if (cartItemRes) {
                                                    if (v.addOns && v.addOns.length) {
                                                        v.addOns.forEach(async (a, k) => {
                                                            if (a) {
                                                                if (a && a.productId) {
                                                                    await MealsExtraDashSubLine.findById(a.productId, async (mealsExtraErr, mealsExtraRes) => {

                                                                        if (mealsExtraErr) {
                                                                            cb(null, { msg: "Please try again", isSuccess: false, errorMsg: mealsExtraErr });
                                                                        } else if (mealsExtraRes) {
                                                                            let mealsExtraItems = JSON.parse(JSON.stringify(mealsExtraRes)), AddOnsPrice = (parseFloat(mealsExtraItems.price ? mealsExtraItems.price : 0)),
                                                                                AddOnstaxPer = 10, AddOnsTotalAmt = AddOnsPrice * (a.qty), AddOnsTaxAmt = 0, AddOnsTotalPay = AddOnsTotalAmt - AddOnsTaxAmt;

                                                                            cartTotalAmt = cartTotalAmt + AddOnsTotalAmt; cartTotalPay = (parseFloat(cartTotalPay) + parseFloat(AddOnsTotalPay)).toFixed(2); cartTaxAmt = (parseFloat(cartTaxAmt) + (parseFloat(AddOnsTaxAmt))).toFixed(2);

                                                                            await CartAddons.create({ date, cartItemId: cartItemRes.id, timeZone, taxPer: AddOnstaxPer, price: AddOnsPrice, qty: a.qty, totalAmt: AddOnsTotalAmt, totalPay: AddOnsTotalPay, taxAmt: AddOnsTaxAmt, taxPer: AddOnstaxPer }, (cartAddonsErr, cartAddonsRes) => {
                                                                                if (cartAddonsErr) {
                                                                                    cb(null, { msg: "Please try again", isSuccess: false, errorMsg: cartAddonsErr });
                                                                                } else if (cartAddonsRes) {
                                                                                    if (v.addOns.length == (k + 1) && details.items.length == (i + 1)) {
                                                                                        if (res && res.id) {
                                                                                            let taxAmountTotal = (cartTotalPay / 100) * 10;
                                                                                            cartTotalPay = parseFloat(cartTotalPay) + parseFloat(taxAmountTotal);
                                                                                            Cart.upsertWithWhere({ id: res.id }, { totalAmt: cartTotalAmt, totalPay: cartTotalPay, taxAmt: taxAmountTotal, taxPer: 10, totalCnt: details.items.length }, (cartUpdateErr, cartUpdateRes) => {
                                                                                                Cart.findOne({ where: { id: res.id }, include: [{ relation: "cartItems", scope: { include: [{ relation: "cartAddons" }] } }] }, (cartErr, cartRes) => {
                                                                                                    if (cartRes) {
                                                                                                        cb(null, { msg: "success", isSuccess: true, result: cartRes });
                                                                                                    } else {
                                                                                                        cb(null, { msg: "false", isSuccess: false, result: cartErr });
                                                                                                    }
                                                                                                });
                                                                                            });
                                                                                        }
                                                                                    }
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                } else {
                                                                    data.isSuccess = false;
                                                                    data.message = "Product Id is required!";
                                                                    cb(null, data);
                                                                }
                                                            }
                                                        });
                                                    } else {
                                                        if (details.items.length == (i + 1)) {
                                                            if (res && res.id) {
                                                                let taxAmountTotal = (cartTotalPay / 100) * 10;
                                                                cartTotalPay = parseFloat(cartTotalPay) + parseFloat(taxAmountTotal);
                                                                Cart.upsertWithWhere({ id: res.id }, { totalAmt: cartTotalAmt, totalPay: cartTotalPay, taxAmt: taxAmountTotal, taxPer: 10, totalCnt: details.items.length }, (cartUpdateErr, cartUpdateRes) => {
                                                                    Cart.findOne({ where: { id: res.id }, include: [{ relation: "cartItems", scope: { include: [{ relation: "cartAddons" }] } }] }, (cartErr, cartRes) => {
                                                                        if (cartRes) {
                                                                            cb(null, { msg: "success", isSuccess: true, result: cartRes });
                                                                        } else {
                                                                            cb(null, { msg: "false", isSuccess: false, result: cartErr });
                                                                        }
                                                                    });
                                                                });

                                                            }
                                                        }
                                                    }
                                                }
                                            });
                                        }
                                    });

                                } else {
                                    data.isSuccess = false;
                                    data.message = "Product id is required!";
                                    cb(null, data);
                                }
                            });
                        }
                    });
                };

                Cart.find({ where: { customerId: details.customerId }, include: [{ relation: "cartItems", scope: { include: "cartAddons" } }] }, (err, CartResult) => {
                    let res = JSON.parse(JSON.stringify(CartResult));
                    if (err) {
                        data.isSuccess = false;
                        data.message = err;
                        cb(null, data);
                    } else if (res && res.length) {
                        if (res && res.length > 0) {
                            for (let result of res) {
                                Cart.destroyById(result.id);
                                if (result.cartItems && result.cartItems.length > 0) {
                                    for (let item of result.cartItems) {
                                        CartItem.destroyById(item.id);
                                        if (item.cartAddons && item.cartAddons.length > 0) {
                                            for (let addons of item.cartAddons) {
                                                CartAddons.destroyById(addons.id);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        createOrder();
                    }
                });

            } else {
                data.isSuccess = false;
                data.message = "customerId && timeZone && items is required!";
                cb(null, data);
            }
        } else {
            data.isSuccess = false;
            data.message = "OwnerId is required";
            cb(null, data);
        }
    };

    Cart.remoteMethod('createAndUpsert', {
        http: { path: '/createAndUpsert', verb: 'post' },
        accepts: { arg: 'details', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });
};
