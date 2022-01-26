'use strict';
const cron = require('node-cron');
const pickRandom = require('pick-random');
const app = require('../../server/server');
const FCM = require('fcm-push');
const serverKey = 'AAAA-4BeD_8:APA91bEyi_SURDeuKRLqoDDWsde4wDNFP5TIFCDD8Je2fQBHr_21fpj8zmzZ0pjGW_mT1PWKYZB2QNgMdOJ4p6dhsjEVk-aQUJHV4vgL6VpJEDI4HCxPOhMwVl0qBz-47OGkzyOopaEe';
const fcm = new FCM(serverKey);

module.exports = function(Loyaltynotificationcron) {
    Loyaltynotificationcron.loyaltyWinnerNotification = (cb) => {
        let j = cron.schedule('/1 * * * * *', function () {
            
        });
        data.isSuccess = true;
        data.message = "Notifications for Weeklyprize trigger started for weekly once";
        cb(data);
    };
    Loyaltynotificationcron.remoteMethod('loyaltyWinnerNotification', {
        http: { path: '/loyaltyWinnerNotification', verb: 'post' },
        returns: { arg: 'data', type: 'string' },
        description: "Triggers the cron for checking business is closed or open...."
      });
  
};
