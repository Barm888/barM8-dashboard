
const app = require('../../server/server'),
    moment = require('moment-timezone');
const FCM = require('fcm-push');
const serverKey = 'AAAA-4BeD_8:APA91bEyi_SURDeuKRLqoDDWsde4wDNFP5TIFCDD8Je2fQBHr_21fpj8zmzZ0pjGW_mT1PWKYZB2QNgMdOJ4p6dhsjEVk-aQUJHV4vgL6VpJEDI4HCxPOhMwVl0qBz-47OGkzyOopaEe';
const fcm = new FCM(serverKey);
let pubsub = require('../../server/pubsub');

module.exports = function (Whatsonreservation) {

    Whatsonreservation.getEventsForCustomer = (params, cb) => {

        const WhatsOnTeamMember = app.models.WhatsOnTeamMember;
        const Customer = app.models.Customer;

        let businessFields = ["suburb", "zipCode", "state", "city", "website", "contact2", "contact1", "country", "qrImageUrl", "qrCode", "email", "phone", "abn", "businessName", "username", "confirmEmail", "id", "mobile", "eddystoneNameSpaceId", "eddystoneInstanceId", "location", "addressLine2", "addressLine1", "imageUrl", "landline"];

        try {
            if (params) {

                let { customerId, isTicketed, timeZone = 'Australia/Sydney' } = params

                if (customerId) {
                    Customer.findById(customerId, (cusErr, cusRes) => {
                        if (cusErr) isSuccess("Invalid Customer", false, cusErr);
                        else if (cusRes) {

                            WhatsOnTeamMember.find({
                                where: { customerId }, include: [{
                                    relation: "whatsOnReservation",
                                    scope: {
                                        where: { isTicketedEvent: isTicketed },
                                        include: [{ relation: "happenings", scope: { include: [{ relation: "business", scope: { fields: businessFields } }] } }, {
                                            relation: "whatsOnTickets", scope: {
                                                include: [{
                                                    relation: "happeningsTicket"
                                                }]
                                            }
                                        }]
                                    }
                                }]
                            }, (err, res) => {
                                if (err) cb(null, { isSuccess: false, message: "Error", result: {} })
                                else if (res && res.length) {

                                    let past = []; let future = [];

                                    res = JSON.parse(JSON.stringify(res));

                                    res.forEach((val, i) => {

                                        if (val.whatsOnReservation && val.whatsOnReservation.happenings && val.whatsOnReservation.happenings.business) {

                                            let hDate = new Date(val.whatsOnReservation.happenings.date);

                                            let cDate = new Date(moment.tz(new Date(), timeZone).format('YYYY-MM-DD'));

                                            if (hDate < cDate) { past.push(val) }
                                            else { future.push(val) }
                                        }

                                        if ((i + 1) == res.length) {

                                            future.sort(function (a, b) {
                                                return new Date(b.whatsOnReservation.happenings.date) - new Date(a.whatsOnReservation.happenings.date);
                                            });

                                            past.sort(function (a, b) {
                                                return new Date(b.whatsOnReservation.happenings.date) - new Date(a.whatsOnReservation.happenings.date);
                                            });

                                            future.reverse();

                                            cb(null, { isSuccess: true, isTicketed, message: "Success", result: { future, past } });
                                        }
                                    });

                                } else {
                                    cb(null, { isSuccess: false, isTicketed, message: "No Data. Please try again!", result: {} });
                                }
                            });
                        }
                    });
                } else {
                    cb(null, { isSuccess: false, message: "Customerid is required!", result: {} });
                }
            } else cb(null, { isSuccess: false, message: "Params is required!", result: {} });
        } catch (e) {
            cb(null, { isSuccess: false, message: "Error", result: {} });
        }

    }

    Whatsonreservation.notifToCustomer = (params, cb) => {
        const Happenings = app.models.Happenings;
        let isCallBack = (isSuccess = false, message = "Please try again!", result = {}) => cb(null, { isSuccess, message, result });
        if (params) {
            let { id, happeningsId } = params;
            Whatsonreservation.findOne({ where: { id }, include: { relation: "customer" } }, (err, res) => {
                if (res) {
                    res = JSON.parse(JSON.stringify(res));

                    let message = `Whatson for ${res.partySize} on ${res.request.date} at ${res.request.time}`;

                    Happenings.findOne({ where: { id: happeningsId }, include: [{ relation: "business" }] }, (happeningsErr, happeningsRes) => {
                        if (happeningsRes) {

                            happeningsRes = JSON.parse(JSON.stringify(happeningsRes));

                            let businessName = happeningsRes.business.businessName, status, whatsOnId, deviceId;

                            deviceId = res.customer.deviceId;

                            whatsOnId = id;

                            let data = {
                                image: null,
                                title: `${businessName} confirm your request`,
                                message, body: message,
                                status, whatsOnId, priority: "high",
                                type: "whatsOnConfirm", content_available: true
                            };

                            fcm.send({
                                to: deviceId,
                                priority: "high",
                                time_to_live: 600000,
                                notification: data, data
                            }, function (error, response) {
                                if (error) console.log(error); else console.log(response);
                            })

                            isCallBack();

                        }
                    });
                }
            });
        } else isCallBack();
    }

    Whatsonreservation.acceptInvitation = (params = {}, cb) => {

        const WhatsOnTeamMember = app.models.WhatsOnTeamMember,
            PaymentHistory = app.models.PaymentHistory,
            Customer = app.models.Customer,
            Business = app.models.Business,
            VenueSettings = app.models.VenueSettings;

        let isSuccess = (message = "Please try again", isSuccess = false) => cb(null, { message, isSuccess });


        app.models.AppConfig.findOne((err, aPcFres) => {
            if (aPcFres) {

                var stripe, stripeMode = aPcFres.stripeMode;
                if (!aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeTestKey);
                if (aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeLiveKey);

                if (params) {
                    if (params && params.customerId && params.whatsOnReservationId) {

                        let { whatsOnReservationId, customerId, timeZone = "Australia/Sydney" } = params;

                        if (!timeZone) timeZone = "Australia/Sydney";
                        let date = moment.tz(new Date(), timeZone).format('DD-MM-YYYY'),
                            time = moment.tz(new Date(), timeZone).format('hh:mm a'),
                            countryFormat = moment.tz(new Date(), timeZone).format('YYYY-MM-DD') + 'T00:00:00.000Z',
                            currency = 'AUD';

                        try {
                            Whatsonreservation.findOne({ where: { id: whatsOnReservationId }, include: [{ relation: "whatsOnTeamMembers" }, { relation: "happenings" }] }, (err, res) => {
                                if (err) isSuccess("Please try again!", false);
                                else {
                                    res = JSON.parse(JSON.stringify(res));

                                    if (res) {

                                        let data = res.whatsOnTeamMembers.find(m => m.customerId == customerId && m.paymentStatus == "succeeded");

                                        if (data && data.customerId) isSuccess("This event already accepted of this customer!", false);
                                        else {

                                            let { isGroupPayment, happenings: { entryFee, ownerId, entryType }, partySize = 0 } = res;

                                            VenueSettings.find({ where: { ownerId, category: 'EventTicketing' } }, (transActionErr, VenueSettingsRes) => {


                                                var isEnabled, category, isAbsorb, absorbFee, isFixed, fixedFee, isPercentage, percentageFee, serviceType;

                                                let payNow = (whatsOnTeamMemberId, totalAmt = 0) => {

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

                                                            if (businessName) businessName = `Venue name : ${businessName}`;
                                                            else businessName = '';

                                                            let amount = (financial(totalAmt)) * 100;

                                                            if (validDecimal(amount) > 2) amount = Number((amount).toFixed(2));

                                                            try {
                                                                stripe.charges.create({
                                                                    amount, currency: 'aud',
                                                                    customer: stripeId,
                                                                    description: `${businessName} , Customer name : ${cusData.firstName} ${cusData.lastName}, Happening id : ${whatsOnTeamMemberId} , Individual payment of Trivia.`
                                                                }, async function (pperr, charge) {

                                                                    let status = 'failed';

                                                                    if (charge && charge.status) status = charge.status;

                                                                    PaymentHistory.create({
                                                                        whatsOnTeamMemberId, provider: "Stripe", createFrom: "Happenings",
                                                                        totalAmt, status, timeZone, resultSuccess: charge || { status: "failed" },
                                                                        resultError: pperr || { status: "succeeded" },
                                                                        countryDate: date, countryTime: time, countryDateFormat: countryFormat
                                                                    }, () => {
                                                                        WhatsOnTeamMember.upsertWithWhere({ id: whatsOnTeamMemberId }, { paymentStatus: status || 'failed' }, () => {
                                                                            Whatsonreservation.upsertWithWhere({ id: res.id }, { paymentStatus: status || 'failed' })
                                                                            setTimeout(function () {
                                                                                isSuccess("Success", true);
                                                                            }, 200);
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
                                                                        Whatsonreservation.upsertWithWhere({ id: res.id }, { paymentStatus: 'failed' })
                                                                        setTimeout(function () {
                                                                            isSuccess("Success", true);
                                                                        }, 200);
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


                                                let updateTeamMember = () => {
                                                    if (!isGroupPayment) {
                                                        entryFee = Number(entryFee);
                                                    } else entryFee = 0;

                                                    let serviceFee = 0, subTotalAmt = 0, qty = 1;

                                                    subTotalAmt = entryFee * Number(qty);

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

                                                    let toatlAmt = Number(subTotalAmt) + Number(serviceFee);

                                                    if (entryType == 'free' || toatlAmt == 0) {
                                                        WhatsOnTeamMember.create({ customerId, qty, whatsOnReservationId, entryType, serviceData: { isEnabled, category, isAbsorb, absorbFee, isFixed, fixedFee, isPercentage, percentageFee }, subTotalAmt, serviceFee, serviceType, toatlAmt, isGroupPayment, isTicketedEvent: false }, (wTMErr, wTMRes) => {
                                                            if (wTMRes && wTMRes.id) {
                                                                PaymentHistory.create({
                                                                    whatsOnTeamMemberId: wTMRes.id, status: 'succeeded',
                                                                    totalAmt: 0, timeZone, resultSuccess: { status: 'succeeded' },
                                                                    resultError: { status: "succeeded" },
                                                                    countryDate: date, countryTime: time, countryDateFormat: countryFormat,
                                                                    createFrom: "Happenings", provider: "Stripe"
                                                                }, () => {
                                                                    Whatsonreservation.upsertWithWhere({ id: res.id }, { paymentStatus: 'succeeded' });
                                                                    WhatsOnTeamMember.upsertWithWhere({ id: wTMRes.id }, { paymentStatus: 'succeeded' });
                                                                    setTimeout(function () {
                                                                        isSuccess("Success", true);
                                                                    }, 200);
                                                                })
                                                            }
                                                        });
                                                    } else {
                                                        WhatsOnTeamMember.upsertWithWhere({ customerId, whatsOnReservationId }, { customerId, qty, whatsOnReservationId, serviceData: { isEnabled, category, isAbsorb, absorbFee, isFixed, fixedFee, isPercentage, percentageFee }, subTotalAmt, serviceFee, serviceType, toatlAmt, isGroupPayment, isTicketedEvent: false }, (wTMErr, wTMRes) => {
                                                            if (wTMRes && wTMRes.id && !isGroupPayment && toatlAmt > 0) {
                                                                payNow(wTMRes.id, toatlAmt);
                                                            } else {
                                                                PaymentHistory.create({
                                                                    whatsOnTeamMemberId: wTMRes.id, status: 'succeeded',
                                                                    totalAmt: 0, timeZone, resultSuccess: { status: 'succeeded' },
                                                                    resultError: { status: "succeeded" },
                                                                    countryDate: date, countryTime: time, countryDateFormat: countryFormat,
                                                                    createFrom: "Happenings", provider: "Stripe"
                                                                }, () => {
                                                                    Whatsonreservation.upsertWithWhere({ id: res.id }, { paymentStatus: 'succeeded' });
                                                                    WhatsOnTeamMember.upsertWithWhere({ id: wTMRes.id }, { paymentStatus: 'succeeded' });
                                                                    setTimeout(function () {
                                                                        isSuccess("Success", true);
                                                                    }, 200);
                                                                })
                                                            }
                                                        });
                                                    }
                                                }

                                                partySize = Number(partySize); let teamCnt = 0;

                                                if (res.whatsOnTeamMembers && res.whatsOnTeamMembers.length) {
                                                    let whTFCnt = res.whatsOnTeamMembers.filter(m => m.paymentStatus == 'succeeded');
                                                    teamCnt = whTFCnt.length;
                                                } else teamCnt = res.whatsOnTeamMembers.length;

                                                if (partySize > teamCnt) updateTeamMember();
                                                else isSuccess("Party size is filled!.", true);

                                            })
                                        }
                                    }
                                    else {
                                        WhatsOnTeamMember.upsertWithWhere({ customerId, whatsOnReservationId }, {
                                            customerId, whatsOnReservationId, qty: 1,
                                            toatlAmt: 0, isGroupPayment: false, isTicketedEvent: false, subTotalAmt: 0, paymentStatus: 'failed'
                                        }, (wTMErr, wTMRes) => {
                                            PaymentHistory.create({
                                                whatsOnTeamMemberId: wTMRes.id, status: 'failed',
                                                totalAmt: 0, timeZone, resultSuccess: { status: 'failed' },
                                                resultError: { status: "failed" },
                                                countryDate: date, countryTime: time, countryDateFormat: countryFormat,
                                                createFrom: "Happenings", provider: "Stripe"
                                            }, () => {
                                                Whatsonreservation.upsertWithWhere({ id: res.id }, { paymentStatus: 'failed' });
                                                isSuccess("Success", true);
                                            })
                                        });
                                    }
                                }
                            })
                        } catch (err) {
                            isSuccess("Invaild Whatson reservation Id", false);
                        }

                    } else isSuccess("customerId && whatsOnReservationId is required", false);
                } else isSuccess("Params is required");

            } else isSuccess(false, "AppConfig is missing!");
        });
    }

    Whatsonreservation.setUnInterested = (params, cb) => {

        let isSuccess = (message = "Please try again", isSuccess = false) => cb(null, { message, isSuccess });

        const WhatsOnTeamMember = app.models.WhatsOnTeamMember;

        if (params) {
            let { teamMemberId, interested } = params;
            if (teamMemberId) {
                //  WhatsOnTeamMember
                WhatsOnTeamMember.find({ where: { id: teamMemberId } }, (err, res) => {
                    if (err) isSuccess("Error", false);
                    else if (res && res.length) {
                        WhatsOnTeamMember.upsertWithWhere({ id: teamMemberId }, { interested }, (u_err, u_res) => {
                            if (u_err) isSuccess("Error", false);
                            else isSuccess("Successfully updated", true);
                        })
                    } else isSuccess("Invaild teamMember Id", false);
                })
            } else isSuccess("Team Member Id required!", false);
        } else isSuccess("Params required!", false);
    }

    Whatsonreservation.remoteMethod('setUnInterested', {
        http: { path: '/setUnInterested', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Set UnInterested"
    });


    Whatsonreservation.remoteMethod('acceptInvitation', {
        http: { path: '/acceptInvitation', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Whats on reservation accept api"
    });

    Whatsonreservation.remoteMethod('notifToCustomer', {
        http: { path: '/notifToCustomer', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "confirm reservation and notification"
    });

    Whatsonreservation.remoteMethod('getEventsForCustomer', {
        http: { path: '/getEventsForCustomer', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "getEvents for Customer"
    });
};
