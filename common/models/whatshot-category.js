module.exports = function (Whatshotcategory) {
  Whatshotcategory.validatesUniquenessOf("category");

  Whatshotcategory.getEventsByCategories = (details, cb) => {
    let response = (isSuccess, message, res) => {
      cb(null, { isSuccess, message, res });
    }

    if (details) {
      let filter = {};
      // Formation of filter based on given data in details
      if ((('categoryIds' in details && details.categoryIds.length) && details.searchStr)) {
        let idsFilterArray = [];
        details.categoryIds.forEach(id => idsFilterArray.push({ id }));
        filter.where = { "or": idsFilterArray };
        filter.include = { "relation": "dashLines", "scope": { "where": { "or": [{ "eventHeader": { "like": `${details.searchStr}.*`, "options": "i" } }, { "venue.address": { "like": `${details.searchStr}.*`, "options": "i" } }] } } };
      } else if (('categoryIds' in details && details.categoryIds.length)) {
        let idsFilterArray = [];
        details.categoryIds.forEach(id => idsFilterArray.push({ id }));
        filter.where = { "or": idsFilterArray };
        filter.include = { "relation": "dashLines" };
      } else if (details.searchStr) {
        filter.include = { "relation": "dashLines", "scope": { "where": { "or": [{ "eventHeader": { "like": `${details.searchStr}.*`, "options": "i" } }, { "venue.address": { "like": `${details.searchStr}.*`, "options": "i" } }] } } };
      } else {
        filter.include = { "relation": "dashLines" };
      }


      // console.log("Filter: "+ JSON.stringify(filter));
      Whatshotcategory.find(filter, (err, res) => {
        if (err) response(false, "Error in Whatshotcategory find", []);
        res = JSON.parse(JSON.stringify(res));
        if (res && res.length) {
          res.filter(o => {
            if (o.dashLines && o.dashLines.length) {
              //Grouping the data based on header property
              let groupedData = o.dashLines.reduce((rv, x) => {
                (rv[x.eventHeader] = rv[x.eventHeader] || []).push(x);
                return rv;
              }, {});
              //Iteration of object for forming object data by array form 
              let rearrangedData = [];
              for (let x in groupedData) {
                rearrangedData.push({ "name": x, "array": groupedData[x] });
              }
              o.dashLines = rearrangedData;
            }
          });
          response(true, "Success", res);
        } else {
          response(true, "No Whatshotcategories Found", res);
        }
      });
    } else {
      response(false, "categoryIds property Missing", []);
    }
  };

  Whatshotcategory.remoteMethod('getEventsByCategories', {
    http: { path: '/getEventsByCategories', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get whatsHot Events by Categories."
  });
};
