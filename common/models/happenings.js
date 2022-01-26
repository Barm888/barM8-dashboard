


const app = require('../../server/server');
const cron = require('node-cron');
const moment = require('moment-timezone');

module.exports = function (Happenings) {

    Happenings.ticketedEventRePayment = (params, cb) => {

        let WhatsOnTeamMember = app.models.WhatsOnTeamMember,
            PaymentHistory = app.models.PaymentHistory,
            Customer = app.models.Customer,
            WhatsOnReservation = app.models.WhatsOnReservation,
            Business = app.models.Business;

        let isCallBack = (isSuccess = false, message = "Please try again!", result = {}) => cb(null, { isSuccess, message, result });

        let timeZone;

        app.models.AppConfig.findOne((err, aPcFres) => {
            if (aPcFres) {
                var stripe, stripeMode = aPcFres.stripeMode;
                if (!aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeTestKey);
                if (aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeLiveKey);

                if (!timeZone) timeZone = "Australia/Sydney";
                let date = moment.tz(new Date(), timeZone).format('DD-MM-YYYY'),
                    time = moment.tz(new Date(), timeZone).format('hh:mm a'),
                    countryFormat = moment.tz(new Date(), timeZone).format('YYYY-MM-DD') + 'T00:00:00.000Z';

                if (params) {

                    if (params.whatsOnTeamMemberId) {

                        let { isGroupPayment = false } = params;

                        let payNow = (whatsOnTeamMemberId, totalAmt = 0, ownerId, customerId, happenings, happeningsCategory, serviceFee = 0) => {

                            function financial(x) {
                                return Number.parseFloat(x).toFixed(2);
                            }

                            function validDecimal(value) {
                                if (Math.floor(value) !== value)
                                    return value.toString().split(".")[1].length || 0;
                                return 0;
                            }

                            let createPayment = (stripeId, cusData) => {

                                Business.findOne({ where: { id: ownerId } }, (venueErr, venueRes) => {
                                    let { businessName } = venueRes;

                                    let stripeTestId, isAccountCreated, stripeLiveId, stripeMode;

                                    if (venueRes) {
                                        stripeTestId = venueRes.stripeTestId;
                                        isAccountCreated = venueRes.isAccountCreated;
                                        stripeLiveId = venueRes.stripeLiveId;
                                        stripeMode = venueRes.stripeMode;
                                    }

                                    if (businessName) businessName = `Venue name : ${businessName}`;
                                    else businessName = '';

                                    let amount = (financial(totalAmt)) * 100;

                                    if (validDecimal(amount) > 2) amount = Number((amount).toFixed(2));

                                    let groupPaymentTxt = '';


                                    if (happeningsCategory.name == 'Trivia') {
                                        if (isGroupPayment) groupPaymentTxt = ", Group payment of Trivia.";
                                        else if (!isGroupPayment) groupPaymentTxt = ", Individual payment of Trivia.";
                                    } else {
                                        groupPaymentTxt = ` , ${happeningsCategory.name}`;
                                    }

                                    try {

                                        let stripeAccount;
                                        if (stripeMode == false && stripeTestId && isAccountCreated == true) {
                                            stripeAccount = stripeTestId;
                                        }
                                        else if (stripeMode == true && stripeLiveId && isAccountCreated == true) {
                                            stripeAccount = stripeLiveId;
                                        }

                                        let serviceFeeStripe = 0;

                                        serviceFeeStripe = (financial(serviceFee)) * 100;

                                        if (validDecimal(serviceFeeStripe) > 2) serviceFeeStripe = Number((serviceFeeStripe).toFixed(2));

                                        let chargeObj = {};
                                        if (stripeAccount) {
                                            chargeObj = {
                                                amount, currency: 'aud',
                                                customer: stripeId,
                                                application_fee_amount: serviceFeeStripe,
                                                description: `${businessName} , Customer name : ${cusData.firstName} ${cusData.lastName}, Happening id : ${whatsOnTeamMemberId} ${groupPaymentTxt} `,
                                                transfer_data: {
                                                    destination: stripeAccount,
                                                }
                                            }
                                        } else {
                                            chargeObj = {
                                                amount, currency: 'aud',
                                                customer: stripeId,
                                                description: `${businessName} , Customer name : ${cusData.firstName} ${cusData.lastName}, Happening id : ${whatsOnTeamMemberId} ${groupPaymentTxt}`
                                            }
                                        }

                                        stripe.charges.create(chargeObj, async function (pperr, charge) {

                                            let status = 'failed';

                                            if (charge && charge.status) status = charge.status;

                                            PaymentHistory.create({
                                                whatsOnTeamMemberId, provider: "Stripe", createFrom: "Happenings",
                                                totalAmt, status, timeZone, resultSuccess: charge || { status: "failed" },
                                                resultError: pperr || { status: "succeeded" },
                                                countryDate: date, countryTime: time, countryDateFormat: countryFormat
                                            }, () => {
                                                WhatsOnTeamMember.upsertWithWhere({ id: whatsOnTeamMemberId }, { paymentStatus: status || 'failed' }, (tErr, tRes) => {
                                                    WhatsOnReservation.upsertWithWhere({ id: happenings.id }, { paymentStatus: status || 'failed' }, () => {
                                                        isCallBack(true, "Success", tRes);
                                                    })
                                                });
                                            })
                                        });
                                    } catch (e) {

                                        PaymentHistory.create({
                                            whatsOnTeamMemberId, status: 'failed',
                                            totalAmt, timeZone, resultSuccess: { status: 'failed' },
                                            resultError: { status: "failed" },
                                            countryDate: date, countryTime: time, countryDateFormat: countryFormat,
                                            createFrom: "Happenings", provider: "Stripe"
                                        }, () => {
                                            WhatsOnTeamMember.upsertWithWhere({ id: whatsOnTeamMemberId }, { paymentStatus: 'failed' }, (tErr, tRes) => {
                                                WhatsOnReservation.upsertWithWhere({ id: happenings.id }, { paymentStatus: status || 'failed' }, () => {
                                                    isCallBack(true, "Success", tRes);
                                                })
                                            });
                                        });
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
                                            createPayment(stripeId, cusRes);
                                        }
                                    });
                                } else if (stripeId) createPayment(stripeId, cusRes);
                            })
                        }

                        try {
                            let { whatsOnTeamMemberId } = params;
                            WhatsOnTeamMember.findOne({
                                where: { id: whatsOnTeamMemberId },
                                include: [{
                                    relation: "whatsOnReservation", scope: {
                                        include: [{
                                            relation: "happenings", scope: {
                                                include: [{ relation: "happeningsCategory" }]
                                            }
                                        }]
                                    }
                                }, { relation: "paymentHistories" }]
                            }, (err, res) => {
                                if (err) isCallBack(false, "Error", {});
                                else {
                                    res = JSON.parse(JSON.stringify(res));
                                    if (res && res.whatsOnReservation) {
                                        let { totalAmt, whatsOnReservation: { ownerId, happenings }, customerId, paymentHistories, serviceFee } = res;
                                        if (paymentHistories && paymentHistories.length) {
                                            let data = paymentHistories.find(m => m.status == "succeeded");
                                            if (totalAmt && (!data || data.status == "failed")) {
                                                WhatsOnTeamMember.upsertWithWhere({ id: whatsOnTeamMemberId }, { paymentStatus: 'Pending' }, () => {
                                                    payNow(whatsOnTeamMemberId, totalAmt, ownerId, customerId, happenings, happenings.happeningsCategory, serviceFee);
                                                });
                                            } else if (totalAmt == 0) {
                                                isCallBack(false, "Total amount is zero.Please try agina", {});
                                            } else {
                                                isCallBack(false, "Already Paid", data);
                                            }
                                        } else {
                                            payNow(whatsOnTeamMemberId, totalAmt, ownerId, customerId, happenings, happenings.happeningsCategory, serviceFee);
                                        }
                                    } else isCallBack(false, "Whats On reservation is required!", {});
                                }
                            })
                        } catch (e) {
                            isCallBack(false, "Error", e);
                        }

                    } else isCallBack(false, "Whats On TeamMember Id is required!", {});
                } else isCallBack(false, "Params is required!", {});

            } else isSuccess(false, "AppConfig is missing!", {});
        });
    }

    Happenings.cartServiceFeeCalc = (params, cb) => {

        const VenueSettings = app.models.VenueSettings;

        let isCallBack = (isSuccess = false, message = "Please try again!", result = {}) => cb(null, { isSuccess, message, result });

        if (params) {
            let { tickets, timeZone, ownerId, happeningsId, partySize = 0, isAccept = false, isGroupPayment = false, isBuyin = false, isReBuy = false, isAddon = false, isReEntry = false } = params;

            if (happeningsId && ownerId && !isAccept) {

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

                    let filter = { where: { id: happeningsId }, include: [] }
                    if (tickets && tickets.length) {
                        let ids = [];
                        tickets.forEach(m => { ids.push({ id: m.ticketId }) });
                        filter.include.push({ relation: "happeningsTickets", scope: { where: { or: ids } } });
                        filter.include.push({ relation: "happeningsCategory" });
                    } else {
                        filter.include.push({ relation: "happeningsCategory" });
                    }

                    Happenings.findOne(filter, (err, res) => {
                        if (err) isCallBack(false, "Error", err);
                        else if (res) {
                            let result = { tickets: [], timeZone, ownerId, happeningsId, partySize, subTotal: 0, serviceFee: 0, paidAmount: 0 };
                            res = JSON.parse(JSON.stringify(res));

                            if (res.happeningsCategory && res.happeningsCategory._name != 'trivia' && res.happeningsCategory._name != 'poker') {
                                tickets.forEach(l => {
                                    let { qty = 0, ticketId } = l;
                                    let tObj = res.happeningsTickets.find(m => m.id == ticketId);
                                    let totalPrice = qty * tObj.salePrice || 0;
                                    result.subTotal += totalPrice;
                                    result.tickets.push({ ticketId, qty, price: tObj.salePrice || 0, totalPrice })
                                })
                            } else if (res.happeningsCategory && res.happeningsCategory._name == 'trivia') {
                                if (res.entryType == 'Paid' && isGroupPayment) {
                                    result.price = res.entryFee;
                                    result.subTotal = Number(partySize) * Number(res.entryFee);
                                } else if (res.entryType == 'Paid' && !isGroupPayment) {
                                    result.price = res.entryFee;
                                    result.subTotal = Number(res.entryFee);
                                } else result.price = 0;

                            } else if (res.happeningsCategory && res.happeningsCategory._name == 'poker') {
                                if (isBuyin) {
                                    result.price = Number(res.buyIn);
                                    result.subTotal = Number(partySize) * Number(result.price);
                                } else if (isReBuy) {
                                    result.price = Number(res.reBuy);
                                    result.subTotal = Number(partySize) * Number(result.price);
                                } else if (isAddon) {
                                    result.price = Number(res.addon);
                                    result.subTotal = Number(partySize) * Number(result.price);
                                } else if (isReEntry) {
                                    result.price = Number(res.reEntry);
                                    result.subTotal = Number(partySize) * Number(result.price);
                                }
                            }


                            if (isPercentage) {
                                result.serviceFee = Number((result.subTotal / 100) * Number(percentageFee));
                                result.percentageFee = percentageFee;
                                result.transActionFeeType = "PercentageFee";
                            } else if (isFixed) {
                                result.serviceFee = result.fixedFee = fixedFee;
                                result.transActionFeeType = "FixedFee";
                            } else if (isAbsorb) {
                                result.serviceFee = result.absorbFee = absorbFee;
                                result.transActionFeeType = "AbsorbFee";
                            }

                            result.paidAmount = result.serviceFee + result.subTotal;

                            isCallBack(true, "Success", result);
                        }
                    })
                })

            } else if (happeningsId && isAccept) {
                Happenings.findOne({ where: { id: happeningsId } }, (err, res) => {
                    if (res) {

                        let { ownerId, entryFee, entryType } = res;
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

                            let result = { tickets: [], timeZone, ownerId, happeningsId, partySize, subTotal: 0, serviceFee: 0, paidAmount: 0 };

                            if (res.entryType == 'Paid' && !isGroupPayment) {
                                result.price = res.entryFee * partySize;
                                result.subTotal = Number(res.entryFee);

                                if (isPercentage) {
                                    result.serviceFee = Number((result.subTotal / 100) * Number(percentageFee));
                                    result.percentageFee = percentageFee;
                                    result.transActionFeeType = "PercentageFee";
                                } else if (isFixed) {
                                    result.serviceFee = result.fixedFee = fixedFee;
                                    result.transActionFeeType = "FixedFee";
                                } else if (isAbsorb) {
                                    result.serviceFee = result.absorbFee = absorbFee;
                                    result.transActionFeeType = "AbsorbFee";
                                }

                                result.paidAmount = result.serviceFee + result.subTotal;

                            } else result.price = res.entryFee;

                            isCallBack(true, "Success", result);

                        });
                    } else {
                        isCallBack(false, "No Happenings", {});
                    }
                })
            } else isCallBack(false, "No Happenings", {});
        } else {
            isCallBack(false, "Params is required", {});
        }
    }

    Happenings.requestForWhatsOn = (params, cb) => {

        const WhatsOnReservation = app.models.WhatsOnReservation,
            WhatsOnTickets = app.models.WhatsOnTickets,
            HappeningsTicket = app.models.HappeningsTicket,
            WhatsOnTeamMember = app.models.WhatsOnTeamMember,
            VenueSettings = app.models.VenueSettings,
            PaymentHistory = app.models.PaymentHistory,
            Customer = app.models.Customer,
            Business = app.models.Business,
            PokerExtraBooking = app.models.PokerExtraBooking;

        let isCallBack = (isSuccess = false, message = "Please try again!", result = {}) => cb(null, { isSuccess, message, result });


        if (params) {
            app.models.AppConfig.findOne((err, aPcFres) => {

                if (aPcFres) {
                    var stripe, stripeMode = aPcFres.stripeMode;
                    if (!aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeTestKey);
                    if (aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeLiveKey);

                    let { happeningsId, customerId, partySize = 0, tickets, timeZone, ownerId, isGroupPayment, teamName, interested = false } = params;

                    if (happeningsId && customerId) {

                        if (!timeZone) timeZone = "Australia/Sydney";
                        let date = moment.tz(new Date(), timeZone).format('DD-MM-YYYY'),
                            time = moment.tz(new Date(), timeZone).format('hh:mm a'),
                            countryFormat = moment.tz(new Date(), timeZone).format('YYYY-MM-DD') + 'T00:00:00.000Z',
                            currency = 'AUD', isReBuy = false, isAddOn = false, isReEntry = false;

                        Happenings.findOne({
                            where: { id: happeningsId },
                            include: [{ relation: "happeningsCategory" }]
                        }, (hErr, hres) => {
                            hres = JSON.parse(JSON.stringify(hres));
                            if (hErr) isCallBack(false, "Error", hErr);
                            else if (hres && hres.title) {

                                let eventTitle, happeningsCategoryId, isTicketedEvent;
                                eventTitle = hres.title;
                                isTicketedEvent = hres.isTicketedEvent;
                                happeningsCategoryId = hres.happeningsCategoryId,

                                    status = 'confirmed', totalAmt = 0;

                                VenueSettings.find({ where: { ownerId, category: 'EventTicketing' } }, (transActionErr, VenueSettingsRes) => {


                                    var isEnabled, category, isAbsorb, absorbFee, isFixed, fixedFee, isPercentage, percentageFee, serviceType;


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

                                    WhatsOnReservation.create({ partySize, tickets, requestDate: countryFormat, isGroupPayment, teamName, request: { date, time, countryFormat }, happeningsId, ownerId, isTicketedEvent, eventTitle, status, happeningsCategoryId }, (err, res) => {

                                        if (err) isCallBack();
                                        else if (res) {

                                            let stripeTestId, isAccountCreated, stripeLiveId;

                                            let payNow = (whatsOnTeamMemberId, totalAmt = 0, serviceFee = 0) => {

                                                function financial(x) {
                                                    return Number.parseFloat(x).toFixed(2);
                                                }

                                                function validDecimal(value) {
                                                    if (Math.floor(value) !== value)
                                                        return value.toString().split(".")[1].length || 0;
                                                    return 0;
                                                }

                                                let createPayment = (stripeId, cusData) => {

                                                    Business.findOne({ where: { id: ownerId } }, (venueErr, venueRes) => {
                                                        let { businessName } = venueRes;

                                                        if (venueRes) {
                                                            stripeTestId = venueRes.stripeTestId;
                                                            isAccountCreated = venueRes.isAccountCreated;
                                                            stripeLiveId = venueRes.stripeLiveId;
                                                        }

                                                        if (businessName) businessName = `Venue name : ${businessName}`;
                                                        else businessName = '';

                                                        let amount = (financial(totalAmt)) * 100;

                                                        if (validDecimal(amount) > 2) amount = Number((amount).toFixed(2));

                                                        let groupPaymentTxt = '';

                                                        if (hres.happeningsCategory.name == 'Trivia') {
                                                            if (isGroupPayment) groupPaymentTxt = ", Group payment of Trivia.";
                                                            else if (!isGroupPayment) groupPaymentTxt = ", Individual payment of Trivia.";
                                                        }

                                                        try {

                                                            let serviceFeeStripe = 0;

                                                            serviceFeeStripe = (financial(serviceFee)) * 100;

                                                            if (validDecimal(serviceFeeStripe) > 2) serviceFeeStripe = Number((serviceFeeStripe).toFixed(2));

                                                            let stripeAccount;
                                                            if (stripeMode == false && stripeTestId && isAccountCreated == true) {
                                                                stripeAccount = stripeTestId;
                                                            }
                                                            else if (stripeMode == true && stripeLiveId && isAccountCreated == true) {
                                                                stripeAccount = stripeLiveId;
                                                            }

                                                            let chargeObj = {};
                                                            if (stripeAccount) {
                                                                chargeObj = {
                                                                    amount, currency: 'aud',
                                                                    customer: stripeId,
                                                                    application_fee_amount: serviceFeeStripe,
                                                                    description: `${businessName} , Customer name : ${cusData.firstName} ${cusData.lastName}, 
                                                                Happening id : ${whatsOnTeamMemberId} ${groupPaymentTxt}`,
                                                                    transfer_data: {
                                                                        destination: stripeAccount,
                                                                    }
                                                                }
                                                            } else {
                                                                chargeObj = {
                                                                    amount, currency: 'aud',
                                                                    customer: stripeId,
                                                                    description: `${businessName} , Customer name : ${cusData.firstName} ${cusData.lastName}, 
                                                                Happening id : ${whatsOnTeamMemberId} ${groupPaymentTxt}`
                                                                }
                                                            }

                                                            stripe.charges.create(chargeObj, async function (pperr, charge) {

                                                                let status = 'failed';

                                                                if (charge && charge.status) status = charge.status;

                                                                PaymentHistory.create({
                                                                    whatsOnTeamMemberId, provider: "Stripe", createFrom: "Happenings",
                                                                    totalAmt, status, timeZone, resultSuccess: charge || { status: "failed" },
                                                                    resultError: pperr || { status: "succeeded" },
                                                                    countryDate: date, countryTime: time, countryDateFormat: countryFormat
                                                                }, () => {
                                                                    WhatsOnTeamMember.upsertWithWhere({ id: whatsOnTeamMemberId }, { paymentStatus: status || 'failed' }, () => {
                                                                        WhatsOnReservation.upsertWithWhere({ id: res.id }, { paymentStatus: status || 'failed' })
                                                                    });
                                                                })
                                                            });
                                                        } catch (e) {

                                                            PaymentHistory.create({
                                                                whatsOnTeamMemberId, status: 'failed',
                                                                totalAmt, timeZone, resultSuccess: { status: 'failed' },
                                                                resultError: { status: "failed" },
                                                                countryDate: date, countryTime: time, countryDateFormat: countryFormat,
                                                                createFrom: "Happenings", provider: "Stripe"
                                                            }, () => {
                                                                WhatsOnTeamMember.upsertWithWhere({ id: whatsOnTeamMemberId }, { paymentStatus: 'failed' }, () => {
                                                                    WhatsOnReservation.upsertWithWhere({ id: res.id }, { paymentStatus: status || 'failed' })
                                                                });
                                                            });
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
                                                                createPayment(stripeId, cusRes);
                                                            }
                                                        });
                                                    } else if (stripeId) createPayment(stripeId, cusRes);
                                                })
                                            }

                                            WhatsOnTeamMember.create({ whatsOnReservationId: res.id, customerId, isInviter: true, interested }, (wTMErr, wTMRes) => {
                                                if (res.id && hres.happeningsCategory && hres.happeningsCategory.name != 'Trivia' && hres.happeningsCategory.name != 'Poker') {
                                                    let ticketIds = [];
                                                    tickets.forEach((m) => { ticketIds.push({ id: m.ticketId }) });
                                                    if (ticketIds && ticketIds.length) {
                                                        HappeningsTicket.find({ where: { or: ticketIds } }, (happeningsErr, happeningsRes) => {
                                                            var subTotalAmt = 0;

                                                            let addServiceFee = () => {

                                                                let serviceFee = 0;

                                                                if (isPercentage) {
                                                                    serviceFee = Number((subTotalAmt / 100)) * Number(percentageFee);
                                                                    serviceType = "PercentageFee";
                                                                } else if (isFixed) {
                                                                    serviceFee = fixedFee;
                                                                    serviceType = "FixedFee";
                                                                } else if (isAbsorb) {
                                                                    serviceFee = absorbFee;
                                                                    serviceType = "AbsorbFee";
                                                                }

                                                                let totalAmt = Number(subTotalAmt) + Number(serviceFee);

                                                                WhatsOnTeamMember.upsertWithWhere({ id: wTMRes.id }, { serviceData: { isEnabled, category, isAbsorb, absorbFee, isFixed, fixedFee, isGroupPayment, isPercentage, percentageFee }, subTotalAmt, serviceFee, serviceType, totalAmt, isTicketedEvent: true }, (wTErr, wTRes) => {

                                                                    //DJ,Karaoke,Live Music,Comedy 


                                                                    PaymentHistory.create({
                                                                        whatsOnTeamMemberId: wTRes.id, status: 'succeeded',
                                                                        totalAmt, timeZone, resultSuccess: { status: 'succeeded' },
                                                                        resultError: { status: "succeeded" },
                                                                        countryDate: date, countryTime: time, countryDateFormat: countryFormat,
                                                                        createFrom: "Happenings", provider: "Stripe"
                                                                    }, () => {
                                                                        WhatsOnReservation.upsertWithWhere({ id: res.id }, { paymentStatus: 'succeeded' }, () => {
                                                                            WhatsOnTeamMember.upsertWithWhere({ id: wTRes.id }, { paymentStatus: 'succeeded' });
                                                                        })
                                                                    });

                                                                    // if (wTRes && wTRes.id && totalAmt > 0) {
                                                                    //     payNow(wTRes.id, totalAmt, serviceFee);
                                                                    // } else if (wTRes && wTRes.id) {

                                                                    //     PaymentHistory.create({
                                                                    //         whatsOnTeamMemberId: wTRes.id, status: 'succeeded',
                                                                    //         totalAmt: 0, timeZone, resultSuccess: { status: 'succeeded' },
                                                                    //         resultError: { status: "succeeded" },
                                                                    //         countryDate: date, countryTime: time, countryDateFormat: countryFormat,
                                                                    //         createFrom: "Happenings", provider: "Stripe"
                                                                    //     }, () => {
                                                                    //         WhatsOnReservation.upsertWithWhere({ id: res.id }, { paymentStatus: 'succeeded' }, () => {
                                                                    //             WhatsOnTeamMember.upsertWithWhere({ id: wTRes.id }, { paymentStatus: 'succeeded' });
                                                                    //         })
                                                                    //     });
                                                                    // }

                                                                })
                                                            }

                                                            tickets.forEach((val, i) => {
                                                                let happeningsObj = happeningsRes.find(m => m.id == val.ticketId);
                                                                if (happeningsObj) {
                                                                    let totalPrice = 0;
                                                                    totalPrice = (Number(happeningsObj.salePrice) * Number(val.qty));
                                                                    subTotalAmt += totalPrice;
                                                                    WhatsOnTickets.create({ whatsOnReservationId: res.id, qty: val.qty, price: happeningsObj.salePrice, totalPrice, happeningsTicketId: val.ticketId });
                                                                    if ((i + 1) == tickets.length) {
                                                                        addServiceFee();
                                                                    }
                                                                }
                                                            })
                                                        });
                                                    } else {
                                                        PaymentHistory.create({
                                                            whatsOnTeamMemberId: wTMRes.id, status: 'succeeded',
                                                            totalAmt: 0, timeZone, resultSuccess: { status: 'succeeded' },
                                                            resultError: { status: "succeeded" },
                                                            countryDate: date, countryTime: time, countryDateFormat: countryFormat,
                                                            createFrom: "Happenings", provider: "Stripe"
                                                        }, () => {
                                                            WhatsOnReservation.upsertWithWhere({ id: res.id }, { paymentStatus: 'succeeded' }, () => {
                                                                WhatsOnTeamMember.upsertWithWhere({ id: wTMRes.id }, { paymentStatus: 'succeeded' });
                                                            })
                                                        });
                                                    }
                                                } else if (hres.happeningsCategory.name == 'Poker') {
                                                    PokerExtraBooking.createExtras({ currency, timeZone, isBuyIn: true, isReBuy: false, isAddOn: false, isReEntry: false, whatsOnReservationId: res.id, customerId, isRepayment: false });
                                                    WhatsOnTeamMember.upsertWithWhere({ id: wTMRes.id }, { isTicketedEvent: false })
                                                } else if (hres.happeningsCategory.name == 'Trivia') {
                                                    if (hres) {


                                                        let { entryFee, entryType } = hres;
                                                        entryFee = Number(entryFee);

                                                        let serviceFee = 0, subTotalAmt = 0;

                                                        if (isGroupPayment) subTotalAmt = entryFee * Number(partySize);
                                                        else subTotalAmt = entryFee;

                                                        if (isPercentage) {
                                                            serviceFee = Number((subTotalAmt / 100)) * Number(percentageFee);
                                                            serviceType = "PercentageFee";
                                                        } else if (isFixed) {
                                                            serviceFee = fixedFee;
                                                            serviceType = "FixedFee";
                                                        } else if (isAbsorb) {
                                                            serviceFee = absorbFee;
                                                            serviceType = "AbsorbFee";
                                                        }

                                                        let totalAmt = Number(subTotalAmt) + Number(serviceFee);

                                                        if (entryType == 'free' || totalAmt == 0) {
                                                            PaymentHistory.create({
                                                                whatsOnTeamMemberId: wTMRes.id, status: 'succeeded',
                                                                totalAmt: 0, timeZone, resultSuccess: { status: 'succeeded' },
                                                                resultError: { status: "succeeded" },
                                                                countryDate: date, countryTime: time, countryDateFormat: countryFormat,
                                                                createFrom: "Happenings", provider: "Stripe"
                                                            }, () => {
                                                                WhatsOnReservation.upsertWithWhere({ id: res.id }, { entryType, paymentStatus: 'succeeded' }, () => {
                                                                    WhatsOnTeamMember.upsertWithWhere({ id: wTMRes.id }, { serviceData: { isEnabled, category, isAbsorb, absorbFee, isFixed, fixedFee, isPercentage, percentageFee }, entryType, paymentStatus: "succeeded", subTotalAmt, serviceFee, serviceType, totalAmt, isGroupPayment, isTicketedEvent: false });
                                                                })
                                                            });
                                                        } else if (totalAmt > 0) {
                                                            // WhatsOnTeamMember.upsertWithWhere({ id: wTMRes.id }, { serviceData: { isEnabled, category, isAbsorb, absorbFee, isFixed, fixedFee, isPercentage, percentageFee }, subTotalAmt, serviceFee, serviceType, totalAmt, isGroupPayment, isTicketedEvent: false }, () => {
                                                            //     payNow(wTMRes.id, totalAmt, serviceFee);
                                                            // })

                                                            PaymentHistory.create({
                                                                whatsOnTeamMemberId: wTMRes.id, status: 'succeeded',
                                                                totalAmt, timeZone, resultSuccess: { status: 'succeeded' },
                                                                resultError: { status: "succeeded" },
                                                                countryDate: date, countryTime: time, countryDateFormat: countryFormat,
                                                                createFrom: "Happenings", provider: "Stripe"
                                                            }, () => {
                                                                WhatsOnReservation.upsertWithWhere({ id: res.id }, { entryType, paymentStatus: 'succeeded' }, () => {
                                                                    WhatsOnTeamMember.upsertWithWhere({ id: wTMRes.id }, { serviceData: { isEnabled, category, isAbsorb, absorbFee, isFixed, fixedFee, isPercentage, percentageFee }, entryType, paymentStatus: "succeeded", subTotalAmt, serviceFee, serviceType, totalAmt, isGroupPayment, isTicketedEvent: false });
                                                                })
                                                            });
                                                        }
                                                    }
                                                }
                                            });

                                            setTimeout(function () {
                                                isCallBack(true, "Successfully created", res);
                                            }, 400);
                                        }
                                    });
                                });


                            } else isCallBack(false, "No happenings");
                        });
                    } else isCallBack(false, "happeningsId or customerId is required.Please try again.");

                } else isSuccess(false, "AppConfig is missing!", {});
            });
        } else isCallBack(false, "Params required!")





    }

    Happenings.createAndUpdate = (params, cb) => {

        let isCallBack = (isSuccess, message, result = []) => cb(null, { isSuccess, message, result });
        let happeningsIds = [];
        if (params && params.dates && params.ownerId && params.happeningsCategoryId) {

            let { fullDesc, title, happeningsCategoryId, ownerId, isTicketedEvent, dates, groupId, primaryImg = [], primaryVideo = [], secondaryImg = [], titleTxt, status = "Pending", isBarm8Ticket = false, isThirdPartyTicket = false, urlTxt = '', isBooking } = params;

            dates.forEach((val, i) => {

                let primaryImg_1 = primaryImg[i] || {};
                let secondaryImg_1 = secondaryImg[i] || {};
                let primaryVideo_1 = primaryVideo[i] || {};

                let { date, dateFormat, startTime, endTime, startTimeFormat, endTimeFormat, dateNo, month, year, lateRegoTime, registrationTime, buyIn = 0, gameType, reBuy = 0, guarantee = 0, addon = 0, entryFee = 0, entryType = 'Free',
                    added, reEntry, startingStack, reBuyStack, addOnStack, reEntryStack, buyInCloses, reBuyCloses,
                    addOnCloses, reEntryCloses, maxNoOfReBuy, maxNoOfAddOns, maxNoOfReEntry, registrationCloses, isEmptyEndTime } = val;

                Happenings.create({
                    fullDesc, title, primaryImg: primaryImg_1, happeningsCategoryId, ownerId, isTicketedEvent, date, dateFormat, registrationCloses, secondaryImg: secondaryImg_1, titleTxt, primaryVideo: primaryVideo_1,
                    lateRegoTime, guarantee, added, reEntry, startingStack, reBuyStack, addOnStack, reEntryStack, buyInCloses, reBuyCloses, addOnCloses, reEntryCloses, maxNoOfReBuy, maxNoOfAddOns, maxNoOfReEntry,
                    startTime, endTime, startTimeFormat, endTimeFormat, dateNo, month, year, registrationTime, groupId,
                    gameType, buyIn, reBuy, addon, startingStack, entryType, entryFee, status,
                    isBarm8Ticket, isThirdPartyTicket, urlTxt, isBooking, isEmptyEndTime
                }, (err, res) => {
                    if (res && res.id) {
                        happeningsIds.push({ happeningsId: res.id, dateFormat });
                        if ((i + 1) == dates.length) {
                            setTimeout(function () {
                                isCallBack(true, "Success", happeningsIds);
                            }, 300);
                        }
                    } else if (err && dates.length == (i + 1)) {
                        setTimeout(function () {
                            isCallBack(true, "Success", happeningsIds);
                        }, 300);
                    }
                });
            });
        } else isCallBack(false, "Please try again!");
    }

    Happenings.removeHappenings = (params, cb) => {

        const HappeningsTicket = app.models.HappeningsTicket;

        let isCallBack = (isSuccess = false, message = "please try again", result = {}) => cb(null, { isSuccess, message, result });

        if (params && params.id) {
            let id = params.id;

            Happenings.findOne({ where: { id }, include: [{ relation: "happeningsTickets" }] }, (HErr, res) => {
                res = JSON.parse(JSON.stringify(res));
                if (res) Happenings.deleteById(id, (hErr, hres) => {
                    console.log(hErr, hres);
                });
                if (res && res.happeningsTickets && res.happeningsTickets.length) {
                    res.happeningsTickets.forEach(val => {
                        HappeningsTicket.deleteById(val.id, (aErr, aRes) => {
                            console.log(aErr)
                            console.log(aRes)
                        });
                    });
                }
                isCallBack(true, "Success", {});
            })

        } else isCallBack();
    }

    Happenings.DeleteOldData = (cb) => {

        let country = "Australia", timeZone = "Australia/Sydney";

        getHappenings = () => {
            Happenings.find({ where: { isDeleted: false } }, (err, res) => {
                if (res && res.length) {
                    res = JSON.parse(JSON.stringify(res));
                    res.forEach(async (val) => {
                        if (val && val.endTimeFormat) {
                            let newDate = new Date();
                            if ((newDate.getTime() > val.endTimeFormat) && val.id) {
                                await Happenings.upsertWithWhere({ id: val.id }, { isDeleted: true });
                            }
                        }
                    })
                }
            })
        }

        cron.schedule('*/5 * * * *', function () { getHappenings(); });

        cb();
    }

    Happenings.updateLiveDateAndTime = (params, cb) => {

        let isCallBack = (isSuccess = false, message = "please try again", result = {}) => cb(null, { isSuccess, message, result });

        if (params) {
            let { id, timeZone = "Australia/Sydney", country = "Australia" } = params;
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
            Happenings.upsertWithWhere({ id }, { liveDate, liveTime, live: { date, dateStr, time: liveTime, dateNo, month, year, hour, minute } }, (err, res) => {
                isCallBack(true, "Success", {});
            })

        } else isCallBack();
    }

    Happenings.statusUpdate = (params, cb) => {

        let isCallBack = (isSuccess = false, message = "please try again", result = {}) => cb(null, { isSuccess, message, result });

        if (params && params.ids) {
            let { ids } = params;
            ids.forEach(async val => {
                if (val.happeningsId) await Happenings.upsertWithWhere({ id: val.happeningsId }, { status: "Live", isLive: true })
            })
            isCallBack(true, "Success", {});
        } else isCallBack();
    }

    Happenings.vaildInterested = (params, cb) => {

        let isCallBack = (isSuccess = false, message = "please try again", result = {}) => cb(null, { isSuccess, message, result });

        if (params) {
            let { happeningsId, customerId } = params;
            if (happeningsId && customerId) {

                const Customer = app.models.Customer;

                try {
                    Customer.findOne({ where: { id: customerId } }, async (cusErr, cusRes) => {
                        cusRes = JSON.parse(JSON.stringify(cusRes));
                        if (cusErr) {
                            isCallBack(false, "Error", cusErr);
                        } else if (cusRes.id == customerId) {

                            Happenings.findOne({
                                where: { id: happeningsId },
                                include: [{
                                    relation: "whatsOnReservations",
                                    scope: { include: [{ relation: "whatsOnTeamMembers", scope: { where: { customerId } } }] }
                                }]
                            }, (err, res) => {
                                if (err) isCallBack(false, "Error", err);
                                else if (res) {
                                    res = JSON.parse(JSON.stringify(res));
                                    if (res && res.whatsOnReservations && res.whatsOnReservations.length) {
                                        let interested = false;
                                        res.whatsOnReservations.forEach(m => {
                                            if (m && m.whatsOnTeamMembers && m.whatsOnTeamMembers.length) {
                                                interested = m.whatsOnTeamMembers.some(s => s.interested);
                                            }
                                        })
                                        isCallBack(true, "Success", { interested });
                                    } else isCallBack(true, "Success", { interested: false });

                                } else isCallBack(true, "Success", { interested: false });
                            })

                        } else isCallBack(false, "Invaild customerId", {});
                    });
                } catch (e) {
                    isCallBack();
                }
            } else isCallBack(false, "happeningsId and customerId is required!", {});
        } else isCallBack(false, "Params is required!", {});
    }

    Happenings.createTitleTxt = (cb) => {
        Happenings.find((err, res) => {
            if (err) cb(null, { isSuccess: true })
            else {
                res.forEach(v => {
                    if (v && v.title) {
                        let titleTxt = v.title.toString().replace(/\s+/g, '');
                        Happenings.upsertWithWhere({ id: v.id }, { titleTxt })
                    }
                })
                cb(null, { isSuccess: true })
            }
        })
    }

    Happenings.getHappeningById = (params, cb) => {

        let isCallBack = (isSuccess = false, message = "please try again", result = {}) => cb(null, { isSuccess, message, result });

        const Customer = app.models.Customer;

        let fields = ["email", "businessName", "location", "currentVisitCnt", "venueCapacity", "openingHoursStatus", "addressLine1", "addressLine2", "suburb", "zipCode", "startTime", "endTime", "id", "imageUrl", "venueInformation", "website"];

        if (params) {
            let { happeningsId, customerId } = params;
            if (happeningsId && customerId) {

                try {
                    Customer.findOne({ where: { id: customerId } }, async (cusErr, cusRes) => {
                        cusRes = JSON.parse(JSON.stringify(cusRes));
                        if (cusErr) {
                            isCallBack(false, "Error", cusErr);
                        } else if (cusRes.id == customerId) {

                            Happenings.findOne({
                                where: { id: happeningsId },
                                include: [{
                                    relation: "whatsOnReservations",
                                    scope: {
                                        include: [{ relation: "whatsOnTeamMembers", scope: { where: { customerId } } },
                                        { relation: "happeningsCategory" }, { relation: "whatsOnTickets" }]
                                    }
                                }, { relation: "business", scope: { fields, include: [{ relation: "venueSettings" }] } }, { relation: "happeningsCategory" }]
                            }, (err, res) => {
                                if (err) isCallBack(false, "Error", err);
                                else if (res) {
                                    res = JSON.parse(JSON.stringify(res));
                                    if (res && res.whatsOnReservations && res.whatsOnReservations.length) {
                                        let interested = false;
                                        res.whatsOnReservations.forEach(m => {
                                            if (m && m.whatsOnTeamMembers && m.whatsOnTeamMembers.length) {
                                                interested = m.whatsOnTeamMembers.some(s => s.interested);
                                            }
                                        })
                                        res.interested = interested;
                                        isCallBack(true, "Success", res);
                                    } else {
                                        res.interested = false;
                                        isCallBack(true, "Success", res);
                                    }

                                } else {
                                    res = {};
                                    res.interested = false;
                                    isCallBack(true, "Success", res);
                                }
                            })

                        } else isCallBack(false, "Invaild customerId", {});
                    });
                } catch (e) {
                    console.log(e);
                    isCallBack(false, "Error", e);
                }
            } else isCallBack(false, "happeningsId and customerId is required!", {});
        } else isCallBack(false, "Params is required!", {});
    }

    Happenings.deleteAllDrinksSpecial = (params = {}, cb) => {
        let isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });
        if (params) {
            let { values } = params;
            if (values && values.length) {
                values.forEach(async (id, i) => {
                    await Happenings.deleteById(id)
                    if ((i + 1) == values.length) setTimeout(() => { isSuccess(true, "Successfully deleted!"); }, 300)
                })

            } else isSuccess();
        } else isSuccess();
    }

    Happenings.getBaseOnCategory = (params = {}, cb) => {

        let isCallBack = (isSuccess = false, message = "please try again", result = {}) => cb(null, { isSuccess, message, result });

        let timeZone, country;

        if (!timeZone) timeZone = "Australia/Sydney";
        if (!country) country = "Australia";

        let { pDate = moment.tz(new Date(), timeZone).format('YYYY-MM-DD') } = params;

        if (pDate) {

            let fields = ["email", "businessName", "location", "currentVisitCnt", "venueCapacity", "openingHoursStatus", "addressLine1", "addressLine2", "suburb", "zipCode", "startTime", "endTime", "id", "imageUrl", "venueInformation", "website", "isAppLive", "status"];

            let date = `${pDate}T00:00:00.000Z`;
            let hours = Number(moment.tz(new Date(), timeZone).format('HH'));

            let minutes = Number(moment.tz(new Date(), timeZone).format('mm'));

            Happenings.find({
                where: { date, status: "Live" },
                include: [{
                    relation: "business", scope: {
                        where: {
                            and: [{ isAppLive: true }]
                        }, fields
                    }
                }, { relation: "happeningsCategory" }]
            }, (err, res) => {

                let data = [];

                let resValues = JSON.parse(JSON.stringify(res));

                const convertTime12to24 = (time12h) => moment(time12h, 'hh:mm A').format('HH:mm');

                if (resValues && resValues.length) {

                    resValues = resValues.filter(m => m.business && m.business.id && m.business.isAppLive);

                    let _L_M_Data = resValues.filter(m => m.happeningsCategory._name == "live_Music");
                    if (_L_M_Data && _L_M_Data.length) {
                        data.push({ category: "Live Music", data: _L_M_Data });
                    }

                    let _D_J_Data = resValues.filter(m => m.happeningsCategory._name == "dj");
                    if (_D_J_Data && _D_J_Data.length) {
                        data.push({ category: "DJ", data: _D_J_Data });
                    }

                    let _tri_Data = resValues.filter(m => m.happeningsCategory._name == "trivia");
                    if (_tri_Data && _tri_Data.length) {
                        data.push({ category: "Trivia", data: _tri_Data });
                    }

                    let _pok_Data = resValues.filter(m => m.happeningsCategory._name == "poker");
                    if (_pok_Data && _pok_Data.length) {
                        data.push({ category: "Poker", data: _pok_Data });
                    }

                    let _com_Data = resValues.filter(m => m.happeningsCategory._name == "comedy");
                    if (_com_Data && _com_Data.length) {
                        data.push({ category: "Comedy", data: _com_Data });
                    }

                    let _O_Data = resValues.filter(m => m.happeningsCategory._name == "other");
                    if (_O_Data && _O_Data.length) {
                        data.push({ category: "Special", data: _O_Data });
                    }

                    isCallBack(true, "Success", data);
                } else isCallBack(false, "No Data", data);
            })
        } else isCallBack(false, "Date is required", data);

    }


    Happenings.getIndividualCategory = (params = {}, cb) => {

        let isCallBack = (isSuccess = false, message = "please try again", result = []) => cb(null, { isSuccess, message, result });

        let timeZone, country;

        let fields = ["email", "businessName", "location", "currentVisitCnt", "venueCapacity", "openingHoursStatus", "addressLine1", "addressLine2", "suburb", "zipCode", "startTime", "endTime", "id", "imageUrl", "venueInformation", "website", "isAppLive", "status"];

        if (!timeZone) timeZone = "Australia/Sydney";
        if (!country) country = "Australia";

        let { fDate = moment.tz(new Date(), timeZone).format('YYYY-MM-DD'), pNo = 0, category } = params;

        if (Object.keys(params).length) {
            if (category) {
                fDate = `${fDate}T00:00:00.000Z`;
                Happenings.find({
                    where: { date: { gte: fDate, status: "Live" } }, order: "date asc",
                    include: [{
                        relation: "happeningsCategory",
                        scope: { where: { name: category } }
                    }, {
                        relation: "business", scope: {
                            where: {
                                and: [{ isAppLive: true }]
                            }, fields
                        }
                    }]
                }, (err, res) => {
                    if (err) isCallBack(false, "Error", {})
                    else {
                        res = JSON.parse(JSON.stringify(res));

                        if (res && res.length) {
                            res = res.filter(m => m.happeningsCategory && m.happeningsCategory.name && m.business && m.business.id);
                            if (res && res.length) {
                                pNo = pNo === 0 || pNo == 1 ? 1 : pNo;
                                let start = 0, end = 0;
                                if (pNo == 1 || pNo == 0) start = 0;
                                else start = (pNo * 10) - 10;
                                end = pNo * 10;
                                console.log(start, end);
                                let result = res.slice(start, end);
                                cb(null, { isSuccess: true, message: "Success", totalCnt: res.length, result })
                            } else {
                                isCallBack(false, "No Data!", {});
                            }
                        } else isCallBack(false, "No Data!", {});
                    }
                })
            } else isCallBack(false, "category is required", {});
        } else isCallBack(false, "Params is required", {});

    }


    Happenings.remoteMethod('getIndividualCategory', {
        http: { path: '/getIndividualCategory', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "getIndividualCategory"
    });

    Happenings.remoteMethod('deleteAllDrinksSpecial', {
        http: { path: '/deleteAllDrinksSpecial', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "update the live date and time"
    });

    Happenings.remoteMethod('getHappeningById', {
        http: { path: '/getHappeningById', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "get Happening data and interested vaild"
    });

    Happenings.remoteMethod('createTitleTxt', {
        http: { path: '/createTitleTxt', verb: 'post' },
        returns: { arg: 'data', type: 'object' },
        description: "createTitleTxt"
    });

    Happenings.remoteMethod('vaildInterested', {
        http: { path: '/vaildInterested', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "vaildInterested"
    });

    Happenings.remoteMethod('ticketedEventRePayment', {
        http: { path: '/ticketedEventRePayment', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "ticketedEventRePayment"
    });

    Happenings.remoteMethod('cartServiceFeeCalc', {
        http: { path: '/cartServiceFeeCalc', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "cartServiceFeeCalc"
    });

    Happenings.remoteMethod('updateLiveDateAndTime', {
        http: { path: '/updateLiveDateAndTime', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "update the live date and time"
    });

    Happenings.remoteMethod('statusUpdate', {
        http: { path: '/statusUpdate', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Status update for to live"
    });

    Happenings.remoteMethod('DeleteOldData', {
        http: { path: '/DeleteOldData', verb: 'post' },
        returns: { arg: 'data', type: 'string' },
        description: "DeleteOldData"
    });

    Happenings.remoteMethod('requestForWhatsOn', {
        http: { path: '/requestForWhatsOn', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "requestForWhatsOn"
    });

    Happenings.remoteMethod('removeHappenings', {
        http: { path: '/removeHappenings', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "remove the old data."
    });

    Happenings.remoteMethod('createAndUpdate', {
        http: { path: '/createAndUpdate', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Create happenings and update"
    });

    Happenings.remoteMethod('getBaseOnCategory', {
        http: { path: '/getBaseOnCategory', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "get data base on category (Like DJ, Comedy)"
    });
};
