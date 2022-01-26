
const app = require('../../server/server');

module.exports = (Tickets) => {

    Tickets.createAndUpdate = (params = {}, cb) => {

       let isCallBack = (isSuccess = false, message = "please try again") => cb(null, { isSuccess, message });

        let eventsId, ticketSettings;
        const TicketGeneralSetting = app.models.TicketGeneralSetting, EventDates = app.models.EventDates, Tickets = app.models.Tickets;

        save = (result) => {
            return new Promise((resolve, reject) => {
                result.forEach((val, i) => {

                    TicketGeneralSetting.create({
                        isCheckedPercent: ticketSettings.isCheckedPercent, isCheckedFixedFee: ticketSettings.isCheckedFixedFee,
                        fixedFee: ticketSettings.fixedFee, fixedFee: ticketSettings.fixedFee, percent: ticketSettings.percent,
                        salesChannel: ticketSettings.salesChannel, restrictionsMin: ticketSettings.restrictionsMin,
                        restrictionsMax: ticketSettings.restrictionsMax, returnPolicy: ticketSettings.returnPolicy, eventDatesId: val.id
                    });

                    params.tickets.forEach((ticket, j) => {

                        Tickets.create({
                            type: ticket.type, name: ticket.name, group: ticket.group, qty: ticket.qty, basePrice: ticket.basePrice,
                            totalPrice: ticket.totalPrice, desc: ticket.desc, salesStartDate: ticket.salesStartDate, promoCode: ticket.promoCode,
                            salesStartTime: ticketSettings.salesStartTime, salesStartUTC: ticket.salesStartUTC, salesEndDate: ticket.salesEndDate,
                            salesEndTime: ticket.salesEndTime, salesEndUTC: ticket.salesEndUTC, visibility: ticket.visibility,
                            eventDatesId: val.id , eventTicketGroupId : ticket.eventTicketGroupId , eventTicketTypeId : ticket.eventTicketTypeId
                        });

                        if ((i + 1) == result.length && (j + 1) == params.tickets.length)
                            resolve({ isSuccess: true });
                    });
                });
            });
        };

        if (params.ticketSettings && params.tickets && params.tickets.length && params.eventsId) {
            if (params.eventsId) {
                eventsId = params.eventsId;
                ticketSettings = params.ticketSettings;
                EventDates.find({ where: { eventsId } }, (err, res) => {
                    if (err) isCallBack();
                    else if (res && res.length) {
                        save(res);
                        isCallBack(true , "Successfully created.");
                    }
                });
            }
        } else isCallBack();
    };

    
    Tickets.remoteMethod('createAndUpdate', {
        http: { path: '/createAndUpdate', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Create tickets and update"
    });
};
