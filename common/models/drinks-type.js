let app = require('../../server/server');

module.exports = function (Drinkstype) {

    Drinkstype.createValueInBusiness = (params = {}, cb) => {
        var Business = app.models.Business, DrinksSpecial = app.models.DrinksSpecial;
        Business.find((err, res) => {

            // res.forEach(val => {
            //     let drinkSpe = [{ type : "Happy Hour" , _type : "happyHour" ,  "ownerId": val.id },
            //     { type : "Most Popular" , _type : "mostPopular" ,  "ownerId": val.id }, 
            //     { type : "Cocktail Special" , _type : "cocktailSpecial" ,  "ownerId": val.id },
            //     { type : "Add New" , _type : "addNew" ,  "ownerId": val.id }];
            //     console.log(val.id);
            //     DrinksSpecial.create(drinkSpe);
            // });

            //types
            // if (res && res.length) {
            //     res.forEach(val => {
            //         let spiritValues = [
            //             { "category": "Beer", "type": "Beer", "_type": "beer", "drinksConfigId": "5da58cc7d7041f0550686187", "order": 1, "ownerId": val.id },
            //             { "category": "Beer", "type": "Cider", "_type": "cider", "drinksConfigId": "5da58cc7d7041f0550686187", "order": 2, "ownerId": val.id },
            //             { "category": "Beer", "type": "Add New", "_type": "addNew", "drinksConfigId": "5da58cc7d7041f0550686187", "order": 3, "ownerId": val.id },
            //             { "category": "Spirit", "type": "Gin", "_type": "gin", "drinksConfigId": "5da58cc7d7041f0550686189", "order": 1, "ownerId": val.id },
            //             { "category": "Spirit", "type": "Bourbon", "_type": "bourbon", "drinksConfigId": "5da58cc7d7041f0550686189", "order": 2, "ownerId": val.id },
            //             { "category": "Spirit", "type": "Liqueurs", "_type": "liqueurs", "drinksConfigId": "5da58cc7d7041f0550686189", "order": 3, "ownerId": val.id },
            //             { "category": "Spirit", "type": "Tequila", "_type": "tequila", "drinksConfigId": "5da58cc7d7041f0550686189", "order": 4, "ownerId": val.id },
            //             { "category": "Spirit", "type": "Rum", "_type": "rum", "drinksConfigId": "5da58cc7d7041f0550686189", "order": 5, "ownerId": val.id },
            //             { "category": "Spirit", "type": "Vodka", "_type": "vodka", "drinksConfigId": "5da58cc7d7041f0550686189", "order": 6, "ownerId": val.id },
            //             { "category": "Spirit", "type": "Whiskey", "_type": "whiskey", "drinksConfigId": "5da58cc7d7041f0550686189", "order": 7, "ownerId": val.id },
            //             { "category": "Spirit", "type": "Pre-mix", "_type": "preMix", "drinksConfigId": "5da58cc7d7041f0550686189", "order": 8, "ownerId": val.id },
            //             { "category": "Spirit", "type": "Add New", "_type": "addNew", "drinksConfigId": "5da58cc7d7041f0550686189", "order": 9, "ownerId": val.id },
            //             { "category": "Wine", "type": "White", "_type": "white", "drinksConfigId": "5dc128fa66f9370ce883b3aa", "order": 1, "ownerId": val.id },
            //             { "category": "Wine", "type": "Red", "_type": "red", "drinksConfigId": "5dc128fa66f9370ce883b3aa", "order": 2, "ownerId": val.id },
            //             { "category": "Wine", "type": "Rose", "_type": "rose", "drinksConfigId": "5dc128fa66f9370ce883b3aa", "order": 3, "ownerId": val.id },
            //             { "category": "Wine", "type": "Prosecco", "_type": "prosecco", "drinksConfigId": "5dc128fa66f9370ce883b3aa", "order": 4, "ownerId": val.id },
            //             { "category": "Wine", "type": "Sparkling", "_type": "sparkling", "drinksConfigId": "5dc128fa66f9370ce883b3aa", "order": 5, "ownerId": val.id },
            //             { "category": "Wine", "type": "Bubbles", "_type": "bubbles", "drinksConfigId": "5dc128fa66f9370ce883b3aa", "order": 6, "ownerId": val.id },
            //             { "category": "Wine", "type": "Champagne", "_type": "champagne", "drinksConfigId": "5dc128fa66f9370ce883b3aa", "order": 7, "ownerId": val.id },
            //             { "category": "Wine", "type": "Add New", "_type": "addNew", "drinksConfigId": "5dc128fa66f9370ce883b3aa", "order": 8, "ownerId": val.id }];
            //         console.log(val.id);
            //         Drinkstype.create(spiritValues);
            //     });
            // }
        });
        cb(null, { isSuccess: true });
    };

    Drinkstype.remoteMethod('createValueInBusiness', {
        http: { path: '/createValueInBusiness', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "drinks menu create and update"
    });

};
