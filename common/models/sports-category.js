'use strict';

module.exports = function(Sportscategory) {
    Sportscategory.createCategory = (params = {}, cb) => {
        const capitalize = (string) => {
            return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
        }
        let res_3 = ["NRL", "AFL", "Rugby", "Soccer", "Cricket", "Basketball", "UFC", "Surfing", "NFL"]
        res_3.forEach((val, i) => {
            Sportscategory.create({ name: val, _name: val.toLowerCase(), group: "Sports" })
        });
        let res = ["STORM", "ROOSTERS", "RABBITOHS", "SHARKS", "PANTHERS", "DRAGONS", "BRONCOS", "WARRIORS", "TIGERS", "RAIDERS", "KNIGHTS", "BULLDOGS", "TITANS", "COWBOYS", "SEA EAGLES", "EELS"]
        res.forEach((val, i) => {
            val = capitalize(val);
            Sportscategory.create({ name: val, _name: val.toLowerCase(), group: "NRlTeam" })
        });
        let res_1 = ["Richmond", "West Coast Eagles", "Collingwood", "Hawthorn", "Melbourne", "Sydney Swans", "GWS Giants", "Geelong Cats", "North Melbourne", "Port Adelaide", "Essendon", "Adelaide Crows", "Western Bulldogs", "Fremantle", "Brisbane Lions", "St Kilda", "Gold Coast Suns", "Carlton"]
        res_1.forEach((val, i) => {
            val = capitalize(val);
            Sportscategory.create({ name: val, _name: val.toLowerCase(), group: "AFLTeam" })
        });
        let res_2 = ["Western Force", "The Sharks", "Hurricanes", "Cheetahs", "Waratahs", "Reds", "Highlanders", "Bulls", "Stormers", "Melbourne Rebels", "Crusaders", "Brumbies Rugby", "Southern Kings", "Lions", "Chiefs", "Blues", "Sunwolves", "Jaguares"]
        res_2.forEach((val, i) => {
            val = capitalize(val);
            Sportscategory.create({ name: val, _name: val.toLowerCase(), group: "RugbyTeam" })
        });
        cb(null, { data: { isSuccess: true } });
    }

    Sportscategory.remoteMethod('createCategory', {
        http: { path: '/createCategory', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "create category"
    });
};
