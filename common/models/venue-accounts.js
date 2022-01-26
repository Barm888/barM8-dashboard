

const app = require('../../server/server');

module.exports = function (Venueaccounts) {

    Venueaccounts.createStripeAccount = async (params, cb) => {

        app.models.AppConfig.findOne((err, aPcFres) => {
            if (aPcFres) {
                var stripe, stripeMode = aPcFres.stripeMode;
                if (!aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeTestKey);
                if (aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeLiveKey);

                const Business = app.models.Business;

                const createAccount = new Promise((resolve, rejcect) => {
                    stripe.accounts.create({
                        type: 'standard',
                        country: 'AU'
                    }, async (aErr, ares) => {
                        if (ares) resolve(ares);
                    });
                });

                const createAccountLink = (id) => new Promise((resolve, rejcect) => {
                    stripe.accountLinks.create({
                        account: id,
                        refresh_url: `https://barm8.com.au/stripe-reauth?venueid=${params.ownerId}&stripeid=${id}`,
                        return_url: `https://barm8.com.au/stripe-return?venueid=${params.ownerId}&stripeid=${id}`,
                        type: "account_onboarding"
                    }, (aLErr, aLRes) => {
                        if (aLRes) resolve(aLRes);
                    });
                });



                if (params) {
                    let { ownerId } = params;
                    if (ownerId) {

                        let createF = () => {
                            createAccount.then((res) => {
                                if (res && res.id) {
                                    createAccountLink(res.id).then((aaLRe) => {
                                        if (stripeMode) {
                                            Business.upsertWithWhere({ id: ownerId }, { stripeLiveId: res.id, stripeLiveUrl: aaLRe.url })
                                        } else if (!stripeMode) {
                                            Business.upsertWithWhere({ id: ownerId }, { stripeTestId: res.id, stripeTestUrl: aaLRe.url })
                                        }
                                    })
                                }
                            })
                        }

                        Business.findOne({ where: { id: ownerId } }, (bErr, bRes) => {
                            if (bRes) {
                                let { stripeTestId, stripeLiveId } = bRes;
                                if (stripeMode) {
                                    if (stripeLiveId) {
                                        createAccountLink(stripeLiveId).then((aaLRe) => {
                                            Business.upsertWithWhere({ id: ownerId }, { stripeLiveId, stripeLiveUrl: aaLRe.url })
                                        })
                                    } else createF();
                                } else if (!stripeMode) {
                                    if (stripeTestId) {
                                        createAccountLink(stripeTestId).then((aaLRe) => {
                                            Business.upsertWithWhere({ id: ownerId }, { stripeTestId, stripeTestUrl: aaLRe.url })
                                        })
                                    } else createF();
                                }
                            }
                        })
                    }
                }

            }
        });

    }

    Venueaccounts.getStripeData = (params, cb) => {
        if (params) {
            let { id, ownerId } = params;

            app.models.AppConfig.findOne((err, aPcFres) => {
                if (aPcFres) {
                    var stripe, stripeMode = aPcFres.stripeMode;
                    if (!aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeTestKey);
                    if (aPcFres.stripeMode) stripe = require('stripe')(aPcFres.stripeLiveKey);

                    if (id) {
                        stripe.accounts.retrieve(id, (err, res) => {
                            if (ownerId) {
                                if (stripeMode) {
                                    Venueaccounts.upsertWithWhere({ ownerId, stripeMode },
                                        { stripe_live_data: res, ownerId, stripeMode })
                                } else if (!stripeMode) {
                                    Venueaccounts.upsertWithWhere({ ownerId, stripeMode },
                                        { stripe_test_data: res, ownerId, stripeMode })
                                }
                            }
                        });
                    }
                }
            });
        }

        
    }

    Venueaccounts.remoteMethod('createStripeAccount', {
        http: { path: '/createStripeAccount', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "get accounts users"
    });

    Venueaccounts.remoteMethod('getStripeData', {
        http: { path: '/getStripeData', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });

};
