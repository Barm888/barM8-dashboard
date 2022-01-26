
const app = require('../../server/server');

module.exports = (Eventtickettype) => {
    

    // Eventtickettype.createValues = (params = {}, cb) => {
    //     let Business = app.models.Business;
    //     let EventTicketGroup = app.models.EventTicketGroup;
    //     Business.find({ fields : ["businessName", "id"] } ,(err, res) => {
    //        if(res && res.length){
    //           for(let business of res){
    //             Eventtickettype.create([{ ownerId : business.id , value : "Early Bird" , name : "Early Bird" }, { ownerId : res.id , value : "AREA A" , name : "AREA A" },
    //             { ownerId : res.id , value : "AREA B" , name : "AREA A" }, { ownerId : res.id , value : "Barm8 Platinum Members" , name : "Barm8 Platinum Members" }]);
    //             EventTicketGroup.create([{ ownerId : business.id , value : "General admission" , name : "General admission" }, 
    //             { ownerId : res.id , value : "VIP 1" , name : "VIP 1" }, { ownerId : res.id , value : "VIP 1" , name : "VIP 1" }])
    //           }
    //        }
    //     });
    //     cb(null, { isSucess: true });
    // }

    // Eventtickettype.remoteMethod('createValues', {
    //     http: { path: '/createValues', verb: 'post' },
    //     accepts: { arg: 'params', type: 'object' },
    //     returns: { arg: 'data', type: 'object' },
    //     description: "Create tickets and update"
    // });
};
