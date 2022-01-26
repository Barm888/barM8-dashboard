const moment = require('moment-timezone');
const voucher = require('voucher-code-generator');
const app = require('../../server/server');

module.exports = (Eventbooking) => {

  Eventbooking.validatesUniquenessOf('bid');

  Eventbooking.observe('before save', (ctx, next) => {
    if (ctx.isNewInstance) {
      ctx.instance.bid = `BM8${(Date.now().toString(36) + Math.random().toString(36).substr(-3)).toUpperCase()}`;
      next();
    } else next();
  });

  Eventbooking.bookEventTickets = (details = {}, cb) => {

    let EventPayment = app.models.EventPayment;

    let response = (isSuccess, message, res) => cb(null, { isSuccess, message, res });

    if (details && 'customerId' in details && details.totalQty && 'eventId' in details 
    && 'eventDate' in details && 'eventDateId' in details && 'ticketsArray' in details && details.ticketsArray.length) {

      if (details.eventTicketTypeId && details.eventTicketGroupId) {
        let { customerId , eventDatesId , eventDate , eventsId , 
          ticketsArray , totalQty , eventTicketTypeId , eventTicketGroupId } = details;

        Eventbooking.create({ eventDate , eventDatesId, customerId, eventsId, totalQty, eventTicketGroupId, eventTicketTypeId }, (bErr, bRes) => {
          if (bErr) {
            response(false, "Error in Eventbooking create", []);
          } else {

            EventPayment.create({ eventBookingId: bRes.id });

            let tickets = [];
            const createUserTicket = (seatNo, ticketsId) => {
              return new Promise(resolve => {
                bRes.userTickets.create({ seatNo, ticketsId }, (tErr, tRes) => {
                  if (tErr) console.log(seatNo, "is not Booked. Try Again", "Error issue", tErr);
                  else
                    resolve(tRes);
                });
              });
            };

            const start = async () => {
              for (let i = 0, len = ticketsArray.length; i < len; i++) {
                let ticketsId = ticketsArray[i].ticketId;
                for (let j = 0, lenj = ticketsArray[i].seats.length; j < lenj; j++) {
                  if (ticketsArray[i].seats[j].sNo && ticketsId) {
                    let UTRes = await createUserTicket(ticketsArray[i].seats[j].sNo, ticketsId);
                    tickets.push(UTRes);
                  }
                }
              }
              response(true, "Booking Success", { "bookingId": bRes.id, tickets });
            };
            start();

          }
        });
      } else response(false, "Event Ticket GroupId and Event Ticket TypeId is required", []);
    } else
      response(false, "Missing customerId, totalQty , eventId, eventDate, eventDateId or ticketsArray in details object", []);
  };

  Eventbooking.getEventBookingsForCustomer = (details, cb) => {
    if (details && 'customerId' in details) {
      const customerId = details.eventDateId,
        pDate = new Date(moment().utcOffset(0).format());

     let response = (isSuccess, message, res) => cb(null, { isSuccess, message, res });

      Eventbooking.find({
        "where": { customerId },
        "include": ["eventDates", "events", { "relation": "userTickets", "scope": { "include": "tickets" } }],
        "order": 'eventDate ASC'
      }, (bErr, bRes) => {
        if (bErr) {
          response(false, "Error in Eventbooking create", []);
        } else {
          let upcomming = [],
            past = [];


          const start = async () => {
            for (let i = 0, len = bRes.length; i < len; i++) {
              if (bRes[i].eventDate >= pDate) {
                upcomming.push(bRes[i]);
              } else {
                past.push(bRes[i]);
              }
            }
            response(true, "Booked Events Success", { upcomming, past });
          };
          start();

        }
      });
    } else  response(false, "Missing customerId in details object", []);
  };


  Eventbooking.remoteMethod('bookEventTickets', {
    http: { path: '/bookEventTickets', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get Events by given data."
  });

  Eventbooking.remoteMethod('getEventBookingsForCustomer', {
    http: { path: '/getEventBookingsForCustomer', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get Booked Events by given customer."
  });
};
