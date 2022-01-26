

module.exports = function (Categoriesforapp) {

    Categoriesforapp.getAllCategories = (params, cb) => {
        let isSuccess = (message = "Please try again", isSuccess = false, res = []) => cb(null, { message, isSuccess, res });
        Categoriesforapp.find((err, res) => {
            if (err) isSuccess();
            else {
                isSuccess("Success", true, res)
            }
        })
    }


    Categoriesforapp.remoteMethod('getAllCategories', {
        http: { path: '/getAllCategories', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "getAllCategories"
    });

};
