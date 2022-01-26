const app = require('../../server/server'),
    moment = require('moment-timezone');

module.exports = (Events) => {

    Events.createAndUpdate = (params, cb) => {

        let eventsId;
        const EventDates = app.models.EventDates;

       let isCallBack = (isSuccess, message , result = {}) => cb(null, { isSuccess, message , result});

        createEventsDates = (dates) => {
            return new Promise((resolve, reject) => {
                dates.forEach((item, i) => {
                    if (item) {
                        item.eventsId = eventsId;
                        if (item.eventsId) {
                            EventDates.create(item, (err, res) => {
                                if (res && dates.length == (i + 1)) resolve({ isSuccess: true, result: res });
                                else if (dates.length == (i + 1)) resolve({ isSuccess: false, result: "please try again" });
                            });
                        } else
                            resolve({ isSuccess: false, result: "please try again" });
                    }
                    else
                        resolve({ isSuccess: false, result: "please try again" });
                });
            });
        };

        if (params && params.events && params.EventDates && params.events.eventCategoryId) {
            Events.create(params.events, (eventErr, evnentRes) => {
                if (evnentRes && evnentRes.id) {
                    eventsId = evnentRes.id;
                    createEventsDates(params.EventDates);
                    isCallBack(true, 'Success' , evnentRes);
                } else isCallBack(false, 'Please try again!');
            });
        } else isCallBack(false, 'EventDates and categoryId is required');
    }

    Events.updateLikes = (details, cb) => {
      let  isCallBack = (isSuccess, message) => cb(null, { isSuccess, message });
        if (details && 'eventId' in details && 'customerId' in details && 'status' in details) {
            const EventLikes = app.models.EventLikes,
                eventsId = details.eventId,
                customerId = details.customerId,
                status = details.status;
            if (status == "Add" || status == "Remove") {
                if (status == "Add") {
                    EventLikes.upsertWithWhere({ eventsId, customerId }, { eventsId, customerId }, (eventErr, eventRes) => {
                        if (eventErr) {
                            isCallBack(false, 'Error in Adding Like for Event');
                        } else {
                            isCallBack(true, 'Event Like Added');
                        }
                    });
                } else {
                    EventLikes.findOne({ "where": { eventsId, customerId } }, (eventErr, eventRes) => {
                        if (eventErr) {
                            console.log(eventErr);
                            isCallBack(false, 'Error in Removing Like for Event');
                        } else if (eventRes) {
                            eventRes.destroy();
                            isCallBack(true, 'Event Like Removed');
                        } else {
                            isCallBack(true, 'Event is Not Liked by Customer');
                        }
                    });
                }
            } else {
                isCallBack(false, 'status Property should be Add or Remove String');
            }

        } else isCallBack(false, 'eventId, customerId and status is required');
    }

    Events.getLikedEventsByCustomer = (details, cb) => {
        let isCallBack = (isSuccess, message, data = []) => cb(null, { isSuccess, message, data });
        if (details && 'customerId' in details) {
            const EventLikes = app.models.EventLikes,
                customerId = details.customerId,
                pDate = new Date(moment().utcOffset(0).format()),
                businessFields = ["suburb", "zipCode", "state", "city", "website", "contact2", "contact1", "country", "qrImageUrl", "qrCode", "email", "phone", "abn", "businessName", "username", "confirmEmail", "id", "mobile", "eddystoneNameSpaceId", "eddystoneInstanceId", "location", "addressLine2", "addressLine1", "imageUrl", "landline"],
                includeFilter = [{ "relation": "business", "scope": { "fields": businessFields } },
                {
                    "relation": "eventDates",
                    "scope": {
                        "where": { "startDateUTC": { "gte": pDate } },
                        "include": { "relation": "tickets", "scope": { "where": { "salesEndUTC": { "gt": pDate } } } },
                        "order": 'startDateUTC ASC'
                    }
                }];
            EventLikes.find({ "where": { customerId }, "include": { "relation": "events", "scope": { "include": includeFilter } } }, (eventErr, eventRes) => {
                if (eventErr) isCallBack(false, 'Error in Removing Like for Event');
                else isCallBack(true, 'EventLikes List', JSON.parse(JSON.stringify(eventRes)));
            });
        } else isCallBack(false, 'customerId is required', []);
    }

    Events.removeEvent = (params = {}, cb) => {
        const EventDates = app.models.EventDates;
        isCallBack = (isSuccess, message) => cb(null, { isSuccess, message });

        if (params && params.id) {
            let id = params.id;
            Events.destroyById(id)
            EventDates.destroyAll({ eventsId: id });
            isCallBack(true, "Success");
        } else
            isCallBack(false, "Event id is required!");
    }

    Events.remoteMethod('removeEvent', {
        http: { path: '/removeEvent', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "remove events."
    });

    Events.remoteMethod('createAndUpdate', {
        http: { path: '/createAndUpdate', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Create events and update"
    });

    Events.remoteMethod('updateLikes', {
        http: { path: '/updateLikes', verb: 'post' },
        accepts: { arg: 'details', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "For Add or Remove Likes for Event"
    });

    Events.remoteMethod('getLikedEventsByCustomer', {
        http: { path: '/getLikedEventsByCustomer', verb: 'get' },
        accepts: { arg: 'details', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "Get Liked Events list by customerId"
    });
};
