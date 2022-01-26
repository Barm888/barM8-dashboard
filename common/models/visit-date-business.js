'use strict';
let app = require('../../server/server');

module.exports = function (Visitdatebusiness) {

	Visitdatebusiness.getCustomerCount = function (details, cb) {
		const Business = app.models.Business;

		let data = {};
		let id = details.businessId;
		let date = details.date;


		Visitdatebusiness.findOne({
			"where": { "ownerId": id, "date": date }
		}, function (err, res) {
			if (err) {
				data.isSuccess = false;
				data.errorMessage = err;
				cb(null, data);
			}
			else {
				data.isSuccess = true;
				data.res = res;
				let visitArr = res.visitse;
				let custArr = [];
				cb(null, data);
			}
		})
	}
	Visitdatebusiness.remoteMethod('getCustomerCount', {
		http: { path: '/getCustomerCount', verb: 'get' },
		accepts: { arg: 'details', type: 'object' },
		returns: { arg: 'data', type: 'object' },
		description: "find Chart data ...."
	});


};
