

const app = require('../../server/server');
const FCM = require('fcm-push');
const serverKey = 'AAAA-4BeD_8:APA91bEyi_SURDeuKRLqoDDWsde4wDNFP5TIFCDD8Je2fQBHr_21fpj8zmzZ0pjGW_mT1PWKYZB2QNgMdOJ4p6dhsjEVk-aQUJHV4vgL6VpJEDI4HCxPOhMwVl0qBz-47OGkzyOopaEe';
const fcm = new FCM(serverKey);
let pubsub = require('../../server/pubsub');
var moment = require('moment-timezone');

module.exports = function (Reservation) {

    Reservation.validatesUniquenessOf('reservationId');

    Reservation.observe('before save', async function event(ctx, next) {
        const AppConfig = app.models.AppConfig;
        prefix = (str, max) => { str = str.toString(); return str.length < max ? prefix("0" + str, max) : str; }
        if (!ctx.where && ctx.instance) {
            AppConfig.findOne({ type: "barm8" }, (appConfigErr , appConfigRes)=>{
                if (appConfigRes) {
                    let cnt = (parseFloat(appConfigRes.reservationCnt) + 1);
                    ctx.instance.reservationId = `BR${prefix(cnt, cnt.toString().length + 7)}`;
                    appConfigRes.updateAttributes({ reservationCnt: cnt });
                } else {
                }
            })
            
        } else if (ctx.where) {
            let date = moment.tz(new Date(), 'Australia/Sydney').format('DD-MM-YYYY'),
                time = moment.tz(new Date(), 'Australia/Sydney').format('hh:mm a'),
                countryFormat = moment.tz(new Date(), 'Australia/Sydney').format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";
            if (ctx.data.status == 'confirmed') ctx.data.confirm = { date, time, countryFormat }
            if (ctx.data.status == 'cancelled') ctx.data.cancel = { date, time, countryFormat }
            next();
        }
    });

    // Reservation.observe('after save', function (ctx, next) {
    //     if (ctx.isNewInstance) pubsub.reservationPublish(Reservation.app.io);
    //     next();
    // });

    Reservation.notifToCustomer = (params = {}, cb) => {

       let isSuccess = (message = "Please try again", isSuccess = false, data = {}) => cb(null, { message, isSuccess, data });

        let message = date = time = '';

        if (params.ownerId && params.id && params.customerId) {

            let { ownerId, id, customerId } = params;

            Reservation.findOne({ where: { id }, include: [{ relation: "customer" }, { relation: "business" }, { relation: "order" }] }, (reservationErr, reservationRes) => {
                if (reservationErr) isSuccess();
                else if (reservationRes) {
                    reservationRes = JSON.parse(JSON.stringify(reservationRes));

                    let { business: { businessName }, status, category, noPeople, customer: { deviceId } } = reservationRes;

                    if (reservationRes.status == 'confirmed' && reservationRes.confirm) {
                        date = reservationRes.confirm.date;
                        time = reservationRes.confirm.time;
                    } else if (reservationRes.status == 'cancelled' && reservationRes.cancel) {
                        date = reservationRes.cancel.date;
                        time = reservationRes.cancel.time;
                    }

                    message = `${category} for ${noPeople} on ${date} at ${time}`;

                    let orderId = (reservationRes.order && reservationRes.order.id ? reservationRes.order.id : '');

                    let data = {
                        image: null,
                        title: `${businessName} ${status} your request`,
                        message, body: message,
                        status, orderId, priority: "high",
                        type: "reservation", content_available: true
                    };
                    
                    fcm.send({
                        to: deviceId,
                        priority: "high",
                        time_to_live: 600000,
                        notification: data, data
                    }, function (error, response) {
                        if (error) console.log(error); else console.log(response);
                    })
                    isSuccess("Success" , true);
                }
            });


        } else isSuccess();
    };

    Reservation.remoteMethod('notifToCustomer', {
        http: { path: '/notifToCustomer', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });
};
