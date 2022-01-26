let app = require('../../server/server'),
  moment = require('moment-timezone');

module.exports = function(Drinksdashline) {

    Drinksdashline.getDashLineData = (params, cb) => {

        const DrinksSpecialDashLine = app.models.DrinksSpecialDashLine;

       let isCallBack = (isSuccess, message, result = {}) => cb(null, { isSuccess, message, result });

        if (params) {
            let { dashLineId , isSpecial = false } = params;
            if (dashLineId) {
                let filter = {};
                if(isSpecial){
                    DrinksSpecialDashLine.findOne({ where: { id: dashLineId }, include: [{ relation: "drinksSpecialDashSubLines" }, { relation: "drinksMixers" }, { relation: "drinksExtras" }, { relation : "drinksType" } , { relation : "drinksSpecialCategory"  , scope : { include : [{ relation : "drinksCategory" }] }, fields : ["category", "_category", "inAppSpecial", "order", "engaged", "ownerId", "id"] }] }, (err, res) => {
                        if (err) isCallBack(false, "error", err);
                        else if(res) isCallBack(true, "Success", res);
                        else isCallBack(false, "No Data. Please enter vaild id!", {}); 
                    });
                } else {
                    Drinksdashline.findOne({
                        where: { id: dashLineId }, include: [{
                            relation: "drinksDashSubLines",
                            scope: { include: [{ relation: "drinksSpecialCategory" }] }
                        }, { relation: "drinksMixers" }, { relation: "drinksExtras" }, { relation: "drinksType" }]
                    }, (err, res) => {
                        if (err) isCallBack(false, "error", err);
                        else if (res) isCallBack(true, "Success", res);
                        else isCallBack(false, "No Data. Please enter vaild id!", {});
                    })
                }
               
            } else isCallBack(false, "Dashline id is required!");
        } else isCallBack(false, "Params is required!");
    }


    Drinksdashline.remoteMethod('getDashLineData', {
        http: { path: '/getDashLineData', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "getDashLineData"
    });
};
