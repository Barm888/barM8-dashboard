var moment = require('moment-timezone');
const app = require('../../server/server');

module.exports = function (Pokerextrabooking) {

    Pokerextrabooking.createExtras = (params, cb) => {

        const Customer = app.models.Customer,
            Happenings = app.models.Happenings,
            VenueSettings = app.models.VenueSettings,
            PaymentHistory = app.models.PaymentHistory,
            Business = app.models.Business,
            WhatsOnReservation = app.models.WhatsOnReservation;

        let isSuccess = (message = "Please try again", success = false, result = {}) => {
            if (params && !params.isBuyIn) cb(null, { message, success, result })
            else if (params && params.isRepayment) cb(null, { message, success, result })
        };

        app.models.AppConfig.findOne((err, aPcFres) => {
            if (aPcFres) {

                var stripe, stripeMode = aPcFres.stripeMode;
                if (!aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeTestKey);
                if (aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeLiveKey);

                if (params) {

                    try {
                        let { currency = 'AUD', timeZone, isReBuy = false, isAddOn = false, isReEntry = false, isBuyIn = false, whatsOnReservationId, customerId } = params;

                        if (!timeZone) timeZone = 'Australia/Sydney';

                        var isEnabled, category, isAbsorb, absorbFee, isFixed, fixedFee, isPercentage, percentageFee, serviceType;

                        let getvenueSettingsData = (ownerId) => new Promise((resolve, reject) => {

                            VenueSettings.find({ where: { ownerId, category: 'EventTicketing' } }, (transActionErr, VenueSettingsRes) => {

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
                                resolve(true);
                            });
                        })




                        let date = moment.tz(new Date(), timeZone).format('DD-MM-YYYY'),
                            time = moment.tz(new Date(), timeZone).format('hh:mm a'),
                            dateFormat = moment.tz(new Date(), timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z",
                            requestFormat = moment.tz(new Date(), timeZone).format('YYYY-MM-DD') + 'T00:00:00.000Z';

                        if (whatsOnReservationId && customerId) {
                            Customer.findOne({ where: { id: customerId } }, (cErr, cRes) => {
                                if (cErr) isSuccess("Invaild customer", false, err);
                                else if (cRes) {
                                    WhatsOnReservation.findOne({ where: { id: whatsOnReservationId } }, (wErr, wres) => {

                                        if (wErr) isSuccess("Invaild WhatsOnReservation", false, err);
                                        else if (wres) {

                                            let { happeningsId } = wres;

                                            Happenings.findOne({ where: { id: happeningsId } }, async (hErr, hRes) => {
                                                if (hErr) isSuccess("Happenings Error", false, hErr);
                                                else {
                                                    let { reBuy, addon, reEntry, buyIn, ownerId } = hRes;
                                                    let price = 0;

                                                    if (isBuyIn) price = Number(buyIn);
                                                    if (isReBuy) price = Number(reBuy);
                                                    if (isAddOn) price = Number(addon);
                                                    if (isReEntry) price = Number(reEntry);

                                                    await getvenueSettingsData(ownerId).then(() => {


                                                        let serviceFee = 0, subTotalAmt = 0;

                                                        subTotalAmt = price;

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

                                                        //toatlAmt
                                                        let totalAmt = Number(subTotalAmt) + Number(serviceFee);

                                                        let payNow = (pokerExtraBookingId, res, serviceFee = 0) => {

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

                                                                    let stripeTestId, isAccountCreated, stripeLiveId;

                                                                    if (venueRes) {
                                                                        stripeTestId = venueRes.stripeTestId;
                                                                        isAccountCreated = venueRes.isAccountCreated;
                                                                        stripeLiveId = venueRes.stripeLiveId;
                                                                    }

                                                                    if (businessName) businessName = `Venue name : ${businessName}`;
                                                                    else businessName = '';

                                                                    let amount = (financial(totalAmt)) * 100;

                                                                    if (validDecimal(amount) > 2) amount = Number((amount).toFixed(2));

                                                                    let typeOfPay = '';

                                                                    if (isReBuy) typeOfPay = ", ReBuy";
                                                                    if (isBuyIn) typeOfPay = ", BuyIn";
                                                                    if (isAddOn) typeOfPay = ", AddOn";
                                                                    if (isReEntry) typeOfPay = ", ReEntry";



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
                                                                                description: `${businessName} , Customer name : ${cusData.firstName} ${cusData.lastName}, Happening id : ${whatsOnReservationId} ${typeOfPay}`,
                                                                                transfer_data: {
                                                                                    destination: stripeAccount,
                                                                                }
                                                                            }
                                                                        } else {
                                                                            chargeObj = {
                                                                                amount, currency: 'aud',
                                                                                customer: stripeId,
                                                                                description: `${businessName} , Customer name : ${cusData.firstName} ${cusData.lastName}, Happening id : ${whatsOnReservationId} ${typeOfPay}`
                                                                            }
                                                                        }

                                                                        stripe.charges.create(chargeObj, async function (pperr, charge) {

                                                                            let status = 'failed';

                                                                            if (charge && charge.status) status = charge.status;

                                                                            PaymentHistory.create({
                                                                                pokerExtraBookingId, provider: "Stripe", createFrom: "Happenings",
                                                                                totalAmt, status, timeZone, resultSuccess: charge || { status: "failed" },
                                                                                resultError: pperr || { status: "succeeded" },
                                                                                countryDate: date, countryTime: time, countryDateFormat: requestFormat
                                                                            }, () => {
                                                                                Pokerextrabooking.upsertWithWhere({ id: pokerExtraBookingId }, { paymentStatus: status }, () => {
                                                                                    isSuccess("Success", true, res);
                                                                                })
                                                                            })
                                                                        });
                                                                    } catch (e) {

                                                                        PaymentHistory.create({
                                                                            pokerExtraBookingId, status: 'failed',
                                                                            totalAmt, timeZone, resultSuccess: { status: 'failed' },
                                                                            resultError: { status: "failed" },
                                                                            countryDate: date, countryTime: time, countryDateFormat: requestFormat,
                                                                            createFrom: "Happenings", provider: "Stripe"
                                                                        }, () => {
                                                                            Pokerextrabooking.upsertWithWhere({ id: pokerExtraBookingId }, { paymentStatus: "failed" }, () => {
                                                                                isSuccess("Success", true, res);
                                                                            })
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

                                                        Pokerextrabooking.create({
                                                            arrival: { date, time, dateFormat }, requestFormat, currency, isReBuy, isBuyIn, isAddOn, isReEntry, ownerId, whatsOnReservationId, customerId, price, totalAmt, serviceFee, serviceType, subTotalAmt, countryDate: date,
                                                            countryTime: time,
                                                            serviceData: { isEnabled, category, isAbsorb, absorbFee, isFixed, fixedFee, isPercentage, percentageFee }
                                                        }, async (err, res) => {
                                                            if (res && res.id) {
                                                                // payNow(res.id, res, serviceFee);

                                                                PaymentHistory.create({
                                                                    pokerExtraBookingId: res.id, provider: "Stripe", createFrom: "Happenings",
                                                                    totalAmt, status, timeZone, resultSuccess: { status: 'succeeded' },
                                                                    resultError: { status: "succeeded" },
                                                                    countryDate: date, countryTime: time, countryDateFormat: requestFormat
                                                                }, () => {
                                                                    Pokerextrabooking.upsertWithWhere({ id: res.id }, { paymentStatus: status }, () => {
                                                                        isSuccess("Success", true, res);
                                                                    })
                                                                })
                                                            }
                                                            else if (err) isSuccess("Error", false, err);
                                                            else isSuccess();
                                                        });
                                                    })
                                                }
                                            })

                                        } else isSuccess("Invaild WhatsOnReservation", false, {});
                                    })
                                } else isSuccess("Invaild customer", false, {});
                            });

                        } else isSuccess = (message = "WhatsOnId or CustomerId is required", isSuccess = false, data = {}) => cb(null, { message, isSuccess, data });
                    } catch (e) {
                        cb(null, { message: "Error", success: false, result: e })
                    }


                } else cb(null, { message: "Params is required", success: false, result: {} })

            } else cb(null, { message: "AppConfig is missing!", success: false, result: {} })
        });
    };

    Pokerextrabooking.getEventReservationDetails = (params, cb) => {

        const WhatsOnReservation = app.models.WhatsOnReservation;

        let isSuccess = (message = "Please try again", isSuccess = false, result = {}) => cb(null, { message, isSuccess, result });

        if (params) {
            let { whatsOnReservationId } = params;
            if (whatsOnReservationId) {
                WhatsOnReservation.findOne({
                    where: { id: whatsOnReservationId },
                    include: [{ relation: "pokerExtraBookings" }, { relation: "happeningsCategory" },
                    { relation: "business" }, { relation: "happenings" }, { relation: "whatsOnTeamMembers", scope: { include: [{ relation: "customer" }] } }, { relation: "whatsOnTickets", scope: { include: [{ relation: "happeningsTicket" }] } }]
                }, (err, res) => {
                    if (res) {
                        res = JSON.parse(JSON.stringify(res));
                        let { eventTitle, tickets, isTicketed, requestDate, request, partySize, status, isCreate, id, happeningsId, ownerId, happeningsCategoryId, happeningsCategory, whatsOnTeamMembers } = res;
                        if (res.pokerExtraBookings && res.pokerExtraBookings.length && res.happeningsCategory.name && res.happeningsCategory.name == 'Poker') {

                            let reBuy = res.pokerExtraBookings.filter(m => m.isReBuy == true);
                            let addOns = res.pokerExtraBookings.filter(m => m.isAddOn == true);
                            let reEntry = res.pokerExtraBookings.filter(m => m.isReEntry == true);
                            let buyIn = res.pokerExtraBookings.filter(m => m.isBuyIn == true);

                            isSuccess("Success", true, {
                                eventTitle, tickets, isTicketed, requestDate, request, partySize, status, isCreate, id, happeningsId, ownerId, happeningsCategoryId, happeningsCategory, reBuy, addOns, buyIn, whatsOnTeamMembers, reEntry,
                                business: res.business, happenings: res.happenings
                            });

                        } else isSuccess("Success", true, res);
                    }
                    else if (err) isSuccess("Error", false, res);
                    else isSuccess("Error", false, {});
                });
            } else isSuccess("WhatsOnReservation id is required!", false, {});
        } else isSuccess();
    };

    Pokerextrabooking.remoteMethod('getEventReservationDetails', {
        http: { path: '/getEventReservationDetails', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });

    Pokerextrabooking.remoteMethod('createExtras', {
        http: { path: '/createExtras', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });
};
