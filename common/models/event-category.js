const app = require('../../server/server'),
  moment = require('moment-timezone');
module.exports = (Eventcategory) => {

  Eventcategory.validatesUniquenessOf("category");

  Eventcategory.getEvents = (details, cb) => {
    if (details && 'customerId' in details) {


      const Events = app.models.Events,
        Customer = app.models.Customer,
        pDate = new Date(moment().utcOffset(0).format());
        
    let  response = (isSuccess, message, res) => cb(null, { isSuccess, message, res });

      Customer.findById(details.customerId, { "fields": ["id"], "include": "loyalty" }, (err, res) => {
        if (err) {
          console.log(err);
          response(false, "Error in Customer findById filter", []);
        } else {
          res = JSON.parse(JSON.stringify(res));
          let level = (res && 'loyalty' in res && res.loyalty.level) ? res.loyalty.level : "Bronze",
            businessFields = ["suburb", "zipCode", "state", "city", "website", "contact2", "contact1", "country", "qrImageUrl", "qrCode", "email", "phone", "abn", "businessName", "username", "confirmEmail", "id", "mobile", "eddystoneNameSpaceId", "eddystoneInstanceId", "location", "addressLine2", "addressLine1", "imageUrl", "landline", "website", "venueInformation"],
            andFilterArray = [{ "status": "available" }, { "SellTicketToBarM8": true }];
            filter = {
              "where": { "and": andFilterArray },
              "include": [{ "relation": "business", "scope": { "include": "weeklyTimings", "fields": businessFields } },
              {
                "relation": "eventDates",
                "scope": {
                  "include": {
                    "relation": "tickets"
                  }
                }
              }
              ]
            };

          if ((('categoryIds' in details) && details.categoryIds.length)) andFilterArray.push({ "or": details.categoryIds });

          if ('searchStr' in details) andFilterArray.push({ "or": [{ "title": { "like": `${details.searchStr}.*`, "options": "i" } }] });

          Events.find(filter, (cErr, cRes) => {
            if (cErr) response(false, "Error in events find filter", []);
            else response(true, "Events List", JSON.parse(JSON.stringify(cRes)));
          });
        }
      });
    } else {
      response(false, "Missing customerId in details object", []);
    }

  };

  Eventcategory.remoteMethod('getEvents', {
    http: { path: '/getEvents', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get Events by given data."
  });
};
