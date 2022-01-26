

var loopback = require('loopback');
var boot = require('loopback-boot');
var bodyParser = require('body-parser');
var path = require('path');
var http = require('http');
const express = require('express');
var https = require('https');
var sslConfig = require('./ssl-config');
var app = module.exports = loopback();
var jwt = require('jsonwebtoken');
let fs = require("fs");
var jwtKey = require('./private/jwtPrivateCode.js');




const aws = require('aws-sdk'),
  multer = require('multer'),
  multerS3 = require('multer-s3');
let stripe = require('stripe')('sk_test_2jkQSIGwM6IEM3PGWegCXx5x00FjeVSPzQ');

const endpoint = new aws.Endpoint('sgp1.digitaloceanspaces.com');

const s3 = new aws.S3({ endpoint });

let storage = multerS3({
  s3, bucket: 'barm8-space1/uploads', acl: 'public-read', key: (request, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
var compression = require('compression');
let router = loopback.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());


router.post('/spaceFileDelete', function (req, res) {
  s3.deleteObject({ Bucket: 'barm8-space1/uploads', Key: req.body.fileName }, function (err, data) {
    if (!err)
      res.json(data);
    else
      res.json(err);
  });
});


router.post('/registerUpload', upload.single('file'), function (req, res) {
  var resF = {};
  resF.imageUrl = `uploads/${req.file.key}`;
  res.json(resF);
});

router.post('/sponsorUpload', upload.single('file'), function (req, res) {
  var resF = {};
  resF.fileUrl = `uploads/${req.file.key}`;
  res.json(resF);
});


router.post('/uploadCategory', upload.single('file'), function (req, res) {

  let resp = {};


  resp.imageUrl = `uploads/${req.file.key}`;
  resp.name = req.body.name;
  resp.description = req.body.description;

  resp.ownerId = req.body.businessId;

  res.json(resp);


});

router.post('/uploadEventsImg', upload.any('file'), (req, res) => {
  let result = [];
  if (req.files && req.files.length) {
    for (let v of req.files) {
      let from = '';
      if (v.fieldname.includes('whatsHot'))
        from = 'whatsHot';
      else if (v.fieldname.includes('organiser'))
        from = 'organiser';
      else if (v.fieldname.includes('events'))
        from = 'events';
      result.push({ fileName: v.originalname, from, path: v.location });
    }
    res.json({ isSuccess: true, result });
  } else
    res.json({ isSuccess: false });
});

router.post('/happeningsImg', upload.any('file'), (req, res) => {
  let result = [];
  if (req.files && req.files.length) {
    for (let v of req.files) result.push({ fileName: v.originalname, path: v.location });
    res.json({ isSuccess: true, result });
  } else res.json({ isSuccess: false });
});

router.post('/whatsonImg', upload.any('file'), (req, res) => {
  let result = [];
  if (req.files && req.files.length) {
    for (let v of req.files) result.push({ fileName: v.originalname, path: v.location });
    res.json({ isSuccess: true, result });
  } else res.json({ isSuccess: false });
});

router.post('/happyHourImg', upload.any('file'), (req, res) => {
  let result = [];
  if (req.files && req.files.length) {
    for (let v of req.files) result.push({ fileName: v.originalname, path: v.location });
    res.json({ isSuccess: true, result });
  } else res.json({ isSuccess: false });
});

router.post('/uploadPremium', upload.any('file'), function (req, res) {

  let resp = {};
  for (let i in req.files)
    resp[`img${i}`] = `uploads/${req.files[i].key}`;

  // for (var i = 1; i < reqFiles.length; i++) {
  //   resp[`img${i}`] = `uploads/${req.files[i].key}`;
  // }

  resp.name = req.body.name;
  res.json(resp);
});

router.post('/uploadSponsor', upload.any('file'), function (req, res) {
  let reqFiles = req.files;

  let resp = {};

  for (var i = 1; i < reqFiles.length; i++) {
    resp[`img${i}`] = `uploads/${req.files[i].key}`;
  }

  resp.name = req.body.name;
  resp.startDate = req.body.startDate;
  resp.endDate = req.body.endDate;
  res.json(resp);
});


router.post('/updateCustomerProfileImage', upload.single('file'), function (req, res) {

  let resp = {};

  let customerId = req.body.customerId;
  let imageOriginalname = req.file.key;
  const Customer = app.models.Customer;

  if (customerId && imageOriginalname) {
    let imageUrl = `uploads/${imageOriginalname}`;
    customerId = customerId || "asds"; //Validation for null value due to updateAll
    Customer.updateAll({ "id": customerId }, { "imageUrl": imageUrl }, function (uErr, uRes) {
      if (uErr) {
        resp.isSuccess = false;
        resp.message = "UpdateAll Error in Customer";
        res.json(resp);
      } else if (uRes.count == 1) {
        resp.isSuccess = true;
        resp.message = "Customer Image Updated";
        res.json(resp);
      } else {
        resp.isSuccess = false;
        resp.message = "Customer Image not Updated";
        res.json(resp);
      }
    });

  } else {
    resp.isSuccess = false;
    resp.message = "ImageFile or customerId missing";
    res.json(resp);
  }

});

router.post('/uploadCustomerProfileImage', upload.single('file'), function (req, res) {

  let resp = {};

  let customerId = req.body.customerId;
  let imageOriginalname = req.file.key;
  const Customer = app.models.Customer;

  if (customerId && imageOriginalname) {
    let imageUrl = `uploads/${imageOriginalname}`;
    customerId = customerId || "asds"; //Validation for null value due to updateAll
    Customer.updateAll({ "id": customerId }, { "imageUrl": imageUrl }, function (uErr, uRes) {
      if (uErr) {
        resp.isSuccess = false;
        resp.message = "UpdateAll Error in Customer";
        res.json(resp);
      } else if (uRes.count == 1) {
        resp.isSuccess = true;
        resp.message = "Customer Image Updated";
        res.json(resp);
      } else {
        resp.isSuccess = false;
        resp.message = "Customer Image not Updated";
        res.json(resp);
      }
    });

  } else {
    resp.isSuccess = false;
    resp.message = "ImageFile or customerId missing";
    res.json(resp);
  }
});

router.post('/uploadCustomerProfileImage1', upload.any('file'), (req, res) => {

  let resp = {}, imgObj = {};

  const customerId = req.body.customerId,
    Customer = app.models.Customer;
  let filesArr = req.files;

  if (customerId && filesArr.length) {
    const start = async () => {
      await filesArr.forEach(async (obj) => {
        imgObj[obj.fieldname] = `uploads/${obj.key}`;
      })
      Customer.upsertWithWhere({ "id": customerId }, imgObj, (uErr, uRes) => {
        if (uErr) {
          resp.isSuccess = false;
          resp.message = "upsertWithWhere Error in Customer";
          res.json(resp);
        } else {
          resp.isSuccess = true;
          resp.message = "Customer Image Updated";
          res.json(resp);
        }
      });
    }

    start();
  } else {
    resp.isSuccess = false;
    resp.message = "ImageFile or customerId missing";
    res.json(resp);
  }
});


router.post('/stripeEphemeralKey', (req, res) => {
  if (!req.body.api_version || !req.body.customerId) {
    res.status(400).end();
    return;
  }
  // This function assumes that some previous middleware has determined the
  // correct customerId for the session and saved it on the request object.
  stripe.ephemeralKeys.create(
    { customer: req.body.customerId },
    { stripe_version: req.body.api_version }
  ).then((key) => {
    res.status(200).json(key);
  }).catch((err) => {
    res.status(500).end();
  });
});

router.post('/happeningsImg', upload.any('file'), (req, res) => {
  let result = [];
  if (req.files && req.files.length) {
    for (let v of req.files) result.push({ fileName: v.originalname, path: v.location });
    res.json({ isSuccess: true, result });
  } else res.json({ isSuccess: false });
});

app.use(express.static(path.join(__dirname, "build")));

app.use(router);

// boot scripts mount components like REST API
boot(app, __dirname);

function shouldCompress(req, res) {
  if (req.headers['x-no-compression']) {
    return false
  }
  return compression.filter(req, res);
}

app.use(compression({ filter: shouldCompress }))

var server = null;

app.start = function (httpOnly) {

  if (httpOnly === undefined) {
    httpOnly = process.env.HTTP;
  }

  if (!httpOnly) {
    server = https.createServer({ key: sslConfig.privateKey, cert: sslConfig.certificate, }, app);
  } else {
    server = http.createServer(app);
  }

  server.listen(app.get('port'), function () {

    var baseUrl = (httpOnly ? 'http://' : 'https://') + app.get('host') + ':' + app.get('port');

    // app.models.Sports.DeleteOldData((items3) => { });

    // app.models.Happenings.DeleteOldData((items3) => { });

    // app.models.ExclusiveOffer.DeleteOldData((items3) => { });

    app.emit('started', baseUrl);
    console.log('LoopBack server listening @ %s%s', baseUrl, '/');
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
  return server;
};

// start the server if `$ node server.js`
if (require.main === module) {
  app.io = require('socket.io')(app.start());
  app.io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('disconnect', function () {
      console.log('user disconnected');
    });
  });
}


app.get('/drink-special-details', (req, res) => {
  result = () => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`<!DOCTYPE html>
    <html>
    <meta http-equiv="content-type" content="text/html;charset=utf-8" />
    <body>
        <script src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.4.1.min.js"></script>
        <script type="text/javascript">
            $(document).ready(function () {
                var link = document.createElement('a');
                var deviceDetect = navigator.platform;
                var appleDevicesArr = ['MacIntel', 'MacPPC', 'Mac68K', 'Macintosh', 'iPhone',
                    'iPod', 'iPad', 'iPhone Simulator', 'iPod Simulator', 'iPad Simulator', 'Pike v7.6 release 92', 'Pike v7.8 release 517'];
                if (appleDevicesArr.includes(deviceDetect)) link.href = 'https://apps.apple.com/au/app/barm8/id1402470106';
                else link.href = 'https://play.google.com/store/apps/details?id=com.barm8';
                document.body.appendChild(link);
                link.click();
            });
        </script>
    </body>
    </html>`);
    res.end();
  }
  result();
})

app.get('/business-details', (req, res) => {
  result = () => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`<!DOCTYPE html>
    <html>
    <meta http-equiv="content-type" content="text/html;charset=utf-8" />
    <body>
        <script src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.4.1.min.js"></script>
        <script type="text/javascript">
            $(document).ready(function () {
                var link = document.createElement('a');
                var deviceDetect = navigator.platform;
                var appleDevicesArr = ['MacIntel', 'MacPPC', 'Mac68K', 'Macintosh', 'iPhone',
                    'iPod', 'iPad', 'iPhone Simulator', 'iPod Simulator', 'iPad Simulator', 'Pike v7.6 release 92', 'Pike v7.8 release 517'];
                if (appleDevicesArr.includes(deviceDetect)) link.href = 'https://apps.apple.com/au/app/barm8/id1402470106';
                else link.href = 'https://play.google.com/store/apps/details?id=com.barm8';
                document.body.appendChild(link);
                link.click();
            });
        </script>
    </body>
    </html>`);
    res.end();
  }
  result();
})

app.get('/daily-special-details', (req, res) => {
  result = () => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`<!DOCTYPE html>
    <html>
    <meta http-equiv="content-type" content="text/html;charset=utf-8" />
    <body>
        <script src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.4.1.min.js"></script>
        <script type="text/javascript">
            $(document).ready(function () {
                var link = document.createElement('a');
                var deviceDetect = navigator.platform;
                var appleDevicesArr = ['MacIntel', 'MacPPC', 'Mac68K', 'Macintosh', 'iPhone',
                    'iPod', 'iPad', 'iPhone Simulator', 'iPod Simulator', 'iPad Simulator', 'Pike v7.6 release 92', 'Pike v7.8 release 517'];
                if (appleDevicesArr.includes(deviceDetect)) link.href = 'https://apps.apple.com/au/app/barm8/id1402470106';
                else link.href = 'https://play.google.com/store/apps/details?id=com.barm8';
                document.body.appendChild(link);
                link.click();
            });
        </script>
    </body>
    </html>`);
    res.end();
  }
  result();
})


app.get('/reservation-invite', (req, res) => {

  result = () => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`<!DOCTYPE html>
    <html>
    <meta http-equiv="content-type" content="text/html;charset=utf-8" />
    <body>
        <script src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.4.1.min.js"></script>
        <script type="text/javascript">
            $(document).ready(function () {
                var link = document.createElement('a');
                var deviceDetect = navigator.platform;
                var appleDevicesArr = ['MacIntel', 'MacPPC', 'Mac68K', 'Macintosh', 'iPhone',
                    'iPod', 'iPad', 'iPhone Simulator', 'iPod Simulator', 'iPad Simulator', 'Pike v7.6 release 92', 'Pike v7.8 release 517'];
                if (appleDevicesArr.includes(deviceDetect)) link.href = 'https://apps.apple.com/au/app/barm8/id1402470106';
                else link.href = 'https://play.google.com/store/apps/details?id=com.barm8';
                document.body.appendChild(link);
                link.click();
            });
        </script>
    </body>
    </html>`);
    res.end();
  }

  if (req.query && req.query.id) {
    let id = req.query.id;
    app.models.Order.findOne({ where: { id }, include: [{ relation: 'business' }, { relation: 'reservations' }] }, (err, Ores) => {
      Ores = JSON.parse(JSON.stringify(Ores));
      if (Ores) {
        let date, time = '';
        if (Ores.reservations.status == 'confirmed' && Ores.reservations.confirm) {
          date = Ores.reservations.confirm.date;
          time = Ores.reservations.confirm.time;
        } else if (Ores.reservations.status == 'cancelled' && Ores.reservations.cancel) {
          date = Ores.reservations.cancel.date;
          time = Ores.reservations.cancel.time;
        }
        let { business: { businessName, imageUrl }, reservations: { status, category, noPeople } } = Ores,
          message = `${category} for ${noPeople} on ${date} at ${time}
               Check out the menu and order ahead on Barm8.`;

        let image = `https://barm8-space1.sgp1.cdn.digitaloceanspaces.com${imageUrl.replace(/ /g, '%20')}`;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(`<!DOCTYPE html>
        <html>
        <meta http-equiv="content-type" content="text/html;charset=utf-8" />
        <head >
        <script src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.4.1.min.js"></script>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
        <meta name="description" content="${message}" />
        <meta name="keywords" content="${message}" />
        <meta name="author" content="Barm8" />
        <meta name="og:description" content="${message}" />
        <meta name="og:title" content="${message}" />
        <meta name="og:site_name" content="Barm8" />
        <meta property="og:type" content="website" /> 
        <meta property="og:url" content="https://barm8.com.au/reservation-invite" />
        <meta property="og:image" content="https://barm8-space1.sgp1.cdn.digitaloceanspaces.com/uploads/barm8Logo.png" />
        <meta property="og:image:width" content="600" />
        <meta property="og:image:height" content="600" />
        <title>${message}</title>
          </head>
        <body>
            <script type="text/javascript">
                $(document).ready(function () {
                    var link = document.createElement('a');
                    var deviceDetect = navigator.platform;
                    var appleDevicesArr = ['MacIntel', 'MacPPC', 'Mac68K', 'Macintosh', 'iPhone',
                        'iPod', 'iPad', 'iPhone Simulator', 'iPod Simulator', 'iPad Simulator', 'Pike v7.6 release 92', 'Pike v7.8 release 517'];
                    if (appleDevicesArr.includes(deviceDetect)) link.href = 'https://apps.apple.com/au/app/barm8/id1402470106';
                    else link.href = 'https://play.google.com/store/apps/details?id=com.barm8';
                    document.body.appendChild(link);
                    link.click();
                });
            </script>
        </body>
        </html>`);
        res.end();

      } else result();
    });
  } else result();
});


app.get('/events-invite', (req, res) => {

  result = () => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`<!DOCTYPE html>
    <html>
    <meta http-equiv="content-type" content="text/html;charset=utf-8" />
    <body>
        <script src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.4.1.min.js"></script>
        <script type="text/javascript">
            $(document).ready(function () {
                var link = document.createElement('a');
                var deviceDetect = navigator.platform;
                var appleDevicesArr = ['MacIntel', 'MacPPC', 'Mac68K', 'Macintosh', 'iPhone',
                    'iPod', 'iPad', 'iPhone Simulator', 'iPod Simulator', 'iPad Simulator', 'Pike v7.6 release 92', 'Pike v7.8 release 517'];
                if (appleDevicesArr.includes(deviceDetect)) link.href = 'https://apps.apple.com/au/app/barm8/id1402470106';
                else link.href = 'https://play.google.com/store/apps/details?id=com.barm8';
                document.body.appendChild(link);
                link.click();
            });
        </script>
    </body>
    </html>`);
    res.end();
  }

  if (req.query && req.query.id) {
    let id = req.query.id;
    app.models.Order.requestForEvent(id, (err, Rres) => {
      if (Rres && Rres.result && Rres.result.happenings) {
        let { business: { businessName, imageUrl }, title, dateFormat, startTime } = Rres.result.happenings;
        let message = `Great news, Our booking has been confirmed for ${title} @ ${businessName} on ${dateFormat} at ${startTime}.`;

        let image = `https://barm8-space1.sgp1.cdn.digitaloceanspaces.com${imageUrl.replace(/ /g, '%20')}`;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(`<!DOCTYPE html>
        <html>
        <meta http-equiv="content-type" content="text/html;charset=utf-8" />
        <head >
        <script src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.4.1.min.js"></script>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
        <meta name="description" content="${message}" />
        <meta name="keywords" content="${message}" />
        <meta name="author" content="Barm8" />
        <meta name="og:description" content="${message}" />
        <meta name="og:title" content="${message}" />
        <meta name="og:site_name" content="Barm8" />
        <meta property="og:type" content="website" /> 
        <meta property="og:url" content="https://barm8.com.au/reservation-invite" />
        <meta property="og:image" content="https://barm8-space1.sgp1.cdn.digitaloceanspaces.com/uploads/barm8Logo.png" />
        <meta property="og:image:width" content="600" />
        <meta property="og:image:height" content="600" />
        <title>${message}</title>
          </head>
        <body>
            <script type="text/javascript">
                $(document).ready(function () {
                    var link = document.createElement('a');
                    var deviceDetect = navigator.platform;
                    var appleDevicesArr = ['MacIntel', 'MacPPC', 'Mac68K', 'Macintosh', 'iPhone',
                        'iPod', 'iPad', 'iPhone Simulator', 'iPod Simulator', 'iPad Simulator', 'Pike v7.6 release 92', 'Pike v7.8 release 517'];
                    if (appleDevicesArr.includes(deviceDetect)) link.href = 'https://apps.apple.com/au/app/barm8/id1402470106';
                    else link.href = 'https://play.google.com/store/apps/details?id=com.barm8';
                    document.body.appendChild(link);
                    link.click();
                });
            </script>
        </body>
        </html>`);
        res.end();
      } else result();
    })
  } else result();
});


app.get('/business-qrcode', (req, res) => {

  result = () => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`<!DOCTYPE html>
    <html>
    <meta http-equiv="content-type" content="text/html;charset=utf-8" />
    <body>
        <script src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.4.1.min.js"></script>
        <script type="text/javascript">
            $(document).ready(function () {
                var link = document.createElement('a');
                var deviceDetect = navigator.platform;
                var appleDevicesArr = ['MacIntel', 'MacPPC', 'Mac68K', 'Macintosh', 'iPhone',
                    'iPod', 'iPad', 'iPhone Simulator', 'iPod Simulator', 'iPad Simulator', 'Pike v7.6 release 92', 'Pike v7.8 release 517'];
                if (appleDevicesArr.includes(deviceDetect)) link.href = 'https://apps.apple.com/au/app/barm8/id1402470106';
                else link.href = 'https://play.google.com/store/apps/details?id=com.barm8';
                document.body.appendChild(link);
                link.click();
            });
        </script>
    </body>
    </html>`);
    res.end();
  }
  result();

});

app.get('/event-details', (req, res) => {

  result = () => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`<!DOCTYPE html>
    <html>
    <meta http-equiv="content-type" content="text/html;charset=utf-8" />
    <body>
        <script src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.4.1.min.js"></script>
        <script type="text/javascript">
            $(document).ready(function () {
                var link = document.createElement('a');
                var deviceDetect = navigator.platform;
                var appleDevicesArr = ['MacIntel', 'MacPPC', 'Mac68K', 'Macintosh', 'iPhone',
                    'iPod', 'iPad', 'iPhone Simulator', 'iPod Simulator', 'iPad Simulator', 'Pike v7.6 release 92', 'Pike v7.8 release 517'];
                if (appleDevicesArr.includes(deviceDetect)) link.href = 'https://apps.apple.com/au/app/barm8/id1402470106';
                else link.href = 'https://play.google.com/store/apps/details?id=com.barm8';
                document.body.appendChild(link);
                link.click();
            });
        </script>
    </body>
    </html>`);
    res.end();
  }
  result();

});

app.get('/qr-download', (req, res) => {

  result = () => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`<!DOCTYPE html>
    <html>
    <meta http-equiv="content-type" content="text/html;charset=utf-8" />
    <body>
        <script src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.4.1.min.js"></script>
        <script type="text/javascript">
            $(document).ready(function () {
                var link = document.createElement('a');
                var deviceDetect = navigator.platform;
                var appleDevicesArr = ['MacIntel', 'MacPPC', 'Mac68K', 'Macintosh', 'iPhone',
                    'iPod', 'iPad', 'iPhone Simulator', 'iPod Simulator', 'iPad Simulator', 'Pike v7.6 release 92', 'Pike v7.8 release 517'];
                if (appleDevicesArr.includes(deviceDetect)) {
                  $.getJSON("https://barm8.com.au/api/QRdownloadCnts/updatedwnCnt?params=%7B%22isIos%22%20%3A%20true%7D",
                    function(data) {}); 
                  link.href = 'https://apps.apple.com/au/app/barm8/id1402470106';
                }
                else {
                  $.getJSON("https://barm8.com.au/api/QRdownloadCnts/updatedwnCnt?params=%7B%22isAndroid%22%20%3A%20true%7D",
                    function(data) {}); 
                  link.href = 'https://play.google.com/store/apps/details?id=com.barm8';
                }
                document.body.appendChild(link);
                link.click();
            });
        </script>
    </body>
    </html>`);
    res.end();
  }
  result();

});

app.get('/exclusive-offer-details', (req, res) => {

  result = () => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`<!DOCTYPE html>
    <html>
    <meta http-equiv="content-type" content="text/html;charset=utf-8" />
    <body>
        <script src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.4.1.min.js"></script>
        <script type="text/javascript">
            $(document).ready(function () {
                var link = document.createElement('a');
                var deviceDetect = navigator.platform;
                var appleDevicesArr = ['MacIntel', 'MacPPC', 'Mac68K', 'Macintosh', 'iPhone',
                    'iPod', 'iPad', 'iPhone Simulator', 'iPod Simulator', 'iPad Simulator', 'Pike v7.6 release 92', 'Pike v7.8 release 517'];
                if (appleDevicesArr.includes(deviceDetect)) link.href = 'https://apps.apple.com/au/app/barm8/id1402470106';
                else link.href = 'https://play.google.com/store/apps/details?id=com.barm8';
                document.body.appendChild(link);
                link.click();
            });
        </script>
    </body>
    </html>`);
    res.end();
  }
  result();

});

app.get('/takeaway-details', (req, res) => {

  result = () => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(`<!DOCTYPE html>
    <html>
    <meta http-equiv="content-type" content="text/html;charset=utf-8" />
    <body>
        <script src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.4.1.min.js"></script>
        <script type="text/javascript">
            $(document).ready(function () {
                var link = document.createElement('a');
                var deviceDetect = navigator.platform;
                var appleDevicesArr = ['MacIntel', 'MacPPC', 'Mac68K', 'Macintosh', 'iPhone',
                    'iPod', 'iPad', 'iPhone Simulator', 'iPod Simulator', 'iPad Simulator', 'Pike v7.6 release 92', 'Pike v7.8 release 517'];
                if (appleDevicesArr.includes(deviceDetect)) link.href = 'https://apps.apple.com/au/app/barm8/id1402470106';
                else link.href = 'https://play.google.com/store/apps/details?id=com.barm8';
                document.body.appendChild(link);
                link.click();
            });
        </script>
    </body>
    </html>`);
    res.end();
  }
  result();

});

app.get('/account-created-hook', (req, res) => {
  res.json({ isSuccess: true });
});

app.get('/fb-deletion', (req, res) => {
  res.json({ isSuccess: true });
});

app.get('/stripe-return', (req, res) => {
  if (req.query.venueid) {
    app.models.Business.findOne({ where: { id: req.query.venueid } }, (bErr, bRes) => {
      if (bRes && bRes.id) {
        app.models.Business.upsertWithWhere({ id: req.query.venueid }, { isAccountCreated: true })
      }
      app.models.VenueAccounts.getStripeData({ id: req.query.stripeid, ownerId: req.query.venueid });
    })
  }
  res.sendFile(path.join(__dirname, '/afterstripe/stripereturn.html'));
});


app.get('/stripe-reauth', (req, res) => {
  res.writeHead(301,
    { Location: 'https://barm8.com.au/login' }
  );
  res.end();
});

app.get('/stripe-accounts-hook', (req, res) => {
  //app.models.VenueAccounts.createdNewAccounts((items3) => { });
  res.json({ isSuccess: true });
});

// app.get('/test', (req, res) => {
//   res.sendFile(path.join(__dirname, '/..', '/client/views/n-w-business/index.html'));
// });



app.get('/thank-you', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/views/thank-you/index.html'));
});

app.get('/manage-customers', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/venue-e-u', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/promotion', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/create-promotion', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/edit-promotion', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/manage-trivia', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/manage-poker', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/update-user-permission', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/new-user-permission', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/venue-users', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/manage-waitlist', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/venue-accounts', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/manage-dj', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/manage-live', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/manage-comedy', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/manage-karaoke', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/active-venue', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/view-business', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/dashboard-home', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/request-offers', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/create-new-offer', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/manage-offer', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/book-analytics', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/feedback', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/qr-download-cnt', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/edit-sports', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/view-sports', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/events-analytics', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
})

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/venueinform', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/manage-sports-scheduling', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/create-sports-scheduling', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/create-sports', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/sports', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/manage-sport-config', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/view-happenings', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/edit-happenings', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/create-happenings', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/sports-analytics', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/special-analytics', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/happenings', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/reservation', (req, res) => {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/drinks-order', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/venue-images', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/whatson-reservation', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/create-whats-on', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/create-whats-on-events/karaoke', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/create-whats-on-events/other', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/create-whats-on-events/dj', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/create-whats-on-events/live_Music', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/create-whats-on-events/comedy', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/create-trivia', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/create-poker', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/view-whats-on-events', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/update-whatson-events', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/edit-happenings', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/manage-events', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/edit-whatson', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/drinks-manager', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/drinks-menu', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/menu-manager', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/menu-hours', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/view-events', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/edit-events', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/create-events', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/manage-events', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/happy-hours', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/edit-happy-hours', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/manage-happy-hours', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/manage-daily-special', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/create-daily-special', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/drinks-service-option', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/food-service-option', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/edit-daily-special', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/opening-hours', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/create-bistro-hour', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/edit-bistro-hours', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/manage-bistro-hours', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/businessmanager', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/partners-login', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/edit-coupon-offer', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/view-coupon-offer', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/contact', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/views/w-site-new/contact.html'));
});

app.get('/terms', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/views/w-site-new/terms.html'));
});

app.get('/privacy', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/views/w-site-new/privacy.html'));
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/token-expired', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get("/forgot-password", function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
})

app.get('/partners', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
  // res.sendFile(path.join(__dirname, '/..', '/client/views/w-site-new/partners.html'));
});

app.get('/partner-signup', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/views/w-site-new/partner-signup.html'));
});

app.get('/img-crop', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/views/image-crop.html'));
});

app.get('/login', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/views/w-site-new/login.html'));
});

app.get('/patron-analytics', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/venue-analytics', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/manage-takeaway', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/create-takeaway', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/edit-takeaway', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/business', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/manage-venue-signup', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/special-notifications', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/new-venue', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/orders', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/booking', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/profile-update', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});



app.get('/business-register', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/forgot_password', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/activation', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/page-not-found', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/vip-list', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/view-venue-profile', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/accounts-details', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/scan-report', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/ban-list', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/transaction-setting', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/scans', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});

app.get('/logout', function (req, res) {
  res.sendFile(path.join(__dirname, '/..', '/client/index.html'));
});


app.get("/request-to-reset-password", (req, res) => {
  if (req.query && req.query.pwdtoken) {
    let token = req.query.pwdtoken;
    let isUpdateErr = false;
    const Business = app.models.Business;
    const TokenSession = app.models.TokenSession;
    if (req.query.isUpdateErr) {
      isUpdateErr = true;
    }
    if (token) {
      try {
        var decoded = jwt.verify(token, `${jwtKey.key}`);
        let { email } = decoded;
        if (email) {
          TokenSession.find({ where: { email } }, (t_eer, t_res) => {
            if (t_res && t_res.length) {
              Business.find({ where: { email } }, (err, res_1) => {
                if (err) res.redirect('/page-not-found');
                else if (res_1 && res_1.length) {
                  res.send(`<!DOCTYPE html>
                  <html lang="en">
                  <head>
                      <title>Barm8-Change Password</title>
                      <link rel="shortcut icon" href="https://barm8.com.au/favicon-16x16.png" type="image/x-icon">
                      <link rel="icon" href="https://barm8.com.au/favicon-16x16.png" type="image/x-icon">
                      <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.0/jquery.min.js"></script>
                      <meta charset="UTF-8">
                      <meta name="description" content="Change Password">
                      <meta name="keywords" content="Change Password">
                      <meta name="author" content="Change Password">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <meta property="og:url" content="Change Password" />
                      <meta property="og:type" content="website" />
                      <meta property="og:title" content="Change Password" />
                      <meta property="og:description" content="Change Password" />
                      <meta property="og:image" content="https://barm8.com.au/favicon-16x16.png" />
                      <link rel="stylesheet"
                          href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;400;500;600;700&display=swap">
                  
                      <script type="text/javascript" src="https://www.barm8.com.au/assets/js/toastr.min.js"></script>
                      <link href="https://www.barm8.com.au/assets/css/toastr.min.css" rel="stylesheet">
                  
                      <script>
                          !function (f, b, e, v, n, t, s) {
                              if (f.fbq) return; n = f.fbq = function () {
                                  n.callMethod ?
                                      n.callMethod.apply(n, arguments) : n.queue.push(arguments)
                              };
                              if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
                              n.queue = []; t = b.createElement(e); t.async = !0;
                              t.src = v; s = b.getElementsByTagName(e)[0];
                              s.parentNode.insertBefore(t, s)
                          }(window, document, 'script',
                              'https://connect.facebook.net/en_US/fbevents.js');
                          fbq('init', '4384478564975112');
                          fbq('track', 'PageView');
                      </script>
                      <noscript><img height="1" width="1" style="display:none"
                              src="https://www.facebook.com/tr?id=4384478564975112&ev=PageView&noscript=1" /></noscript>
                  
                      <style>
                          #loader {
                              width: 50px;
                              height: 50px;
                              left: 50%;
                              position: fixed;
                              z-index: 999999;
                              background: url("/../loader/loader.gif") no-repeat center center rgba(255, 255, 255, 0.67);
                              background-size: 170px 138px;
                              top: 50%;
                              border-radius: 50%;
                              background-color: black !important;
                          }
                  
                          @media (max-width: 767.98px) {
                              .login-box {
                                  position: relative;
                                  z-index: 99;
                                  top: 20px;
                              }
                          }
                  
                          body {
                              background: #fff;
                              font-family: sans-serif;
                              font-size: 10px;
                          }
                  
                          form {
                              background: #000;
                              padding: 1em 4em 2em;
                              max-width: 400px;
                              margin: 0px auto 0;
                              box-shadow: 0 0 1em #222;
                              border-radius: 6px;
                              color:#fff;
                          }
              
                          span{
                            font-size: 14px;
                          }
              
                          img{
                            max-width:100%;
                          }
                  
                          p {
                              margin: 0 0 2rem 0;
                              position: relative;
                          }
                  
                          label {
                              display: block;
                              font-size: 1.6em;
                              margin: 0 0 0.5em;
                              color: #fff;
                          }
                  
                          input {
                              display: block;
                              box-sizing: border-box;
                              width: 100%;
                              outline: none;
                          }
                  
                          input[type="text"],
                          input[type="password"] {
                              background: #f5f5f5;
                              border: 1px solid #e5e5e5;
                              font-size: 1.6em;
                              padding: 0.8em 0.5em;
                              border-radius: 5px;
                          }
                  
                          input[type="text"]:focus,
                          input[type="password"]:focus {
                              background: #fff;
                          }
                  
                          input[type="submit"] {
                              background: #faa140;
                              box-shadow: 0 3px 0 0 #faa140;
                              border-radius: 5px;
                              border: none;
                              color: #fff;
                              cursor: pointer;
                              display: block;
                              font-size: 2em;
                              line-height: 1.6em;
                              margin: 2em 0 0;
                              outline: none;
                              padding: 0.8em 0;
                              text-shadow: 0 1px #68b25b;
                          }
                          .logo-section {
                            max-width: 250px;
                            margin: 0 auto;
                        }
                        .login-outer {
                          min-height: 100vh;
                          padding: 0;
                          background: #000;
                          position: relative;
                          background-image: url(https://www.barm8.com.au/views/w-site-new/images/login.jpg);
                          background-repeat: no-repeat;
                          background-size: cover;
                          background-position: center;
                      }
                      </style>
                  </head>
                  
                  <body class="login-outer">
                      <div class="loader" data-loader="dashboard">
                          <div id="loader"> </div>
                      </div>
                      <script>
                       let toastMsg = (isVaild, msg) => {
                        if (isVaild)
                          toastr.success(msg);
                        else
                          toastr.error(msg);
                        toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
                      }
              
                      if(${isUpdateErr}) {
                        toastMsg(false, "Password not updated. Please try again!");
                      }
              
                          setTimeout(function () {
                              $(".loader").fadeOut('slow', function () {
                                  $(this).css({ display: 'none' })
                              });
                          }, 500)
                  
                          $('body').bind('keypress', function (event) {
                              if (event.keyCode === 13) angular.element(document.getElementById('loginCtl')).scope().login();
                          });
                  
                          $(document).ready(function() { 
                              $("#update-form").submit(function(e){
                                $(".btn-submit-1").css({ display: 'none' })
                                $(".pwd-error").css({ display : 'none' });
                                $(".pwd-confirm-error").css({ display : 'none' });
                                $(".pwd-con-err-1").css({ display : 'none' });
                                if($("#password").val() && $("#confirm_password").val()) {
                                  if($("#password").val() === $("#confirm_password").val()){
                                    if($("#password").val().length<=8){
                                      $(".pwd-con-err-1").css({ display : 'block' });
                                      e.preventDefault();
                                    } else {
                                      $(".btn-submit").css({ display: 'none' })
                                      $(".loader").css({ display: 'block' })
                                      $(".btn-submit-1").css({ display: 'block' })
                                    }
                                  } else  {
                                    e.preventDefault();
                                    $(".pwd-con-err").css({ display : 'block' });
                                  }
                                }else {
                                  e.preventDefault();
                                  if(!$("#password").val()) $(".pwd-error").css({ display : 'block' });
                                  if(!$("#confirm_password").val()) $(".pwd-confirm-error").css({ display : 'block' });
                                }
                              });
                          }); 
                      </script>
                      <div class="logo-section">
                      <a href="/"><img src="views/w-site-new/images/logo-l.png"></a>
                    </div>
                      <form action="/update-password?token=${token}" id="update-form" method="POST">
                     
                    <p style="font-size:24px;text-align:center;margin:1rem 0 1rem 0;">Change Password</p>
                          <p>
                              <label for="username">Username</label>
                              <input id="username" value="${email}" name="username" disabled type="text">
                          </p>
                          <p>
                              <label for="password">Password</label>
                              <input id="password" name="password" type="password">
                              <span class="pwd-error" style="display:none;color:red;">Required!</span>
                          </p>
                          <p>
                              <label for="confirm_password">Confirm Password</label>
                              <input id="confirm_password" name="confirm_password" type="password">
                              <span class="pwd-confirm-error" style="display:none;color:red;">Required!</span>
                              <span class="pwd-con-err" style="display:none;color:red;">Confirm password not match!</span>
                              <span class="pwd-con-err-1" style="display:none;color:red;">The password must contain at least 8 characters!</span>
                          </p>
                          <p class="btn-submit">
                              <input id="submit" type="submit" value="SUBMIT">
                          </p>
                          <p class="btn-submit-1" style="display:none;">
                          <input id="submit" type="submit" disabled value="Loading...">
                      </p>
                      </form>
                  
                  </body>
                  
                  </html>`);
                } else res.redirect('/page-not-found');
              })
            } else res.redirect('/token-expired');
          });


        } else {
          res.redirect('/page-not-found');
        }
      } catch (e) {
        res.redirect('/token-expired');
        // res.status(403).send({
        //   success: false,
        //   message: e
        // })
      }

    } else res.redirect('/page-not-found');
  } else res.redirect('/page-not-found');
})

app.post("/update-password", async (req, res, next) => {
  if (req.query.token) {
    let token = req.query.token;
    var decoded = await jwt.verify(token, `${jwtKey.key}`);
    const Business = app.models.Business;
    const TokenSession = app.models.TokenSession;
    if (decoded) {
      let password = req.body.password;
      let { email } = decoded;
      TokenSession.find({ where: { email } }, (t_eer, t_res) => {
        if (t_res && t_res.length) {
          Business.findOne({ where: { email } }, (err, res_1) => {
            if (err) isCallBack();
            else {
              if (password) {
                res_1.updateAttribute('password', Business.hashPassword(password));
                setTimeout(function () {

                  if (t_res && t_res.length) TokenSession.deleteById(t_res[0].id);
                  res.redirect(`/successfully-updated`);
                }, 200);
              } else res.redirect(`/request-to-reset-password?pwdtoken=${req.query.token}&isUpdateErr=true`);
            }
          });
        } else res.redirect(`/request-to-reset-password?pwdtoken=${req.query.token}&isUpdateErr=true`);
      })

    } else res.redirect(`/request-to-reset-password?pwdtoken=${req.query.token}&isUpdateErr=true`);
  } else res.redirect(`/request-to-reset-password?pwdtoken=${req.query.token}&isUpdateErr=true`);

});

app.get("/successfully-updated", async (req, res, next) => {
  res.sendFile(path.join(__dirname, '/..', '/password/success.html'));
});






