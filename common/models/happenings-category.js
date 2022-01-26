

let app = require('../../server/server');

module.exports = function (Happeningscategory) {

    Happeningscategory.createCategory = (params = {}, cb) => {
        let Business = app.models.Business;
        Business.find((err, res) => {
            res.forEach((val, i) => {
                // Happeningscategory.create([{ "name": "Live Music", "ownerId": val.id, "_name": "live_Music" },
                // { "name": "DJ", "_name": "dj", "ownerId": val.id },
                // { "name": "Karaoke", "_name": "karaoke", "ownerId": val.id },
                // { "name": "Trivia", "_name": "trivia", "ownerId": val.id },
                // { "name": "Poker", "_name": "poker", "ownerId": val.id },
                // { "name": "Comedy", "_name": "comedy", "ownerId": val.id }])
                Happeningscategory.create([{ "name": "Other", "ownerId": val.id, "_name": "other" }])
            });
        });
        cb(null, { data: { isSuccess: true } });
    }

    Happeningscategory.removecategory = (params = {}, cb) => {
        Happeningscategory.find({ where: { _name: "karaoke" } }, (err, res) => {
            res = JSON.parse(JSON.stringify(res));
            console.log(res);
            res.forEach(async v => {
                await Happeningscategory.deleteById(v.id);
            })
        })
        cb(null, { data: { isSuccess: true } });
    }

    Happeningscategory.remoteMethod('removecategory', {
        http: { path: '/removecategory', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "remove category"
    });

    Happeningscategory.remoteMethod('createCategory', {
        http: { path: '/createCategory', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "create category"
    });
};
