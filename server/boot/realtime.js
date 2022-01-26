'use strict';

let app = require('../server');

var es = require('event-stream');
module.exports = function (app) {
  var VisitHourCount = app.models.VisitHourCount;
  VisitHourCount.createChangeStream(function (err, changes) {
    changes.pipe(es.stringify()).pipe(process.stdout);
  });  
}
