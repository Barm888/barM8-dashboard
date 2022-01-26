const app = require('../../server/server');

module.exports = function (Venueuser) {

    Venueuser.createAndUpdate = (params, cb) => {

        const VenuePermission = app.models.VenuePermission;

        let isSuccess = (message = "Please try again", isSuccess = false) => cb(null, { message, isSuccess });

        if (params) {

            let { firstName, lastName, email, username, phoneNo, pin, password, isAdmin, userType, ownerId, permissions } = params;

            Venueuser.create({ firstName, lastName, email, username, phoneNo, pin, password, isAdmin, userType, ownerId }, (err, res) => {
                if (err) isSuccess("Error", false);
                else {
                    permissions.forEach(val => {
                        VenuePermission.create({
                            venueUserId: res.id, isChecked: val.isChecked,
                            _name: val._name, name: val.name, isCreate: val.isCreate, isEdit: val.isEdit, isDelete: val.isDelete
                        });
                    })
                    isSuccess("Success", true);
                }
            })

        } else isSuccess("Params is required!", false);
    }

    Venueuser.deleteUser = (params, cb) => { 

        const VenuePermission = app.models.VenuePermission;

        let isSuccess = (message = "Please try again", isSuccess = false) => cb(null, { message, isSuccess });

        if(params){

            let { id } = params;

            Venueuser.deleteById(id, (err , res)=>{
                VenuePermission.destroyAll({ venueUserId: id }, (err , res)=>{
                    isSuccess("Success", true);
                })
            });

        } else isSuccess("Params is required!", false);
    }

    Venueuser.updateUser = (params, cb) => {

        const VenuePermission = app.models.VenuePermission;

        let isSuccess = (message = "Please try again", isSuccess = false) => cb(null, { message, isSuccess });

        if (params) {
            let { id , firstName , lastName , email , phoneNo , isAdmin , userType , permissions  } = params;
            if (id) {
                Venueuser.upsertWithWhere({ id }, { firstName , lastName , email , phoneNo , username : email , isAdmin , userType }, (err , res)=>{
                    if(res){
                        VenuePermission.destroyAll({ venueUserId: id }, (err , Deleres)=>{
                            console.log(Deleres);
                            permissions.forEach(val => {
                                VenuePermission.create({
                                    venueUserId: id, isChecked: val.isChecked,
                                    _name: val._name, name: val.name, isCreate: val.isCreate, isEdit: val.isEdit, isDelete: val.isDelete
                                });
                            })
                            setTimeout(function(){
                                isSuccess("Success", true);
                            }, 500);
                        });
                    }
                });
                
            } else isSuccess("Params is required!", false);
        } else isSuccess("Params is required!", false);
    }

    Venueuser.remoteMethod('updateUser', {
        http: { path: '/updateUser', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });

    Venueuser.remoteMethod('deleteUser', {
        http: { path: '/deleteUser', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });

    Venueuser.remoteMethod('createAndUpdate', {
        http: { path: '/createAndUpdate', verb: 'post' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' }
    });

};
