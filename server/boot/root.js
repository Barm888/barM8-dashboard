
let fs = require("fs");
let path = require("path");
const aws = require('aws-sdk'),
  express = require('express'),
  multer = require('multer'),
  multerS3 = require('multer-s3'),
  stripe = require('stripe')('sk_test_2jkQSIGwM6IEM3PGWegCXx5x00FjeVSPzQ');
let bodyParser = require('body-parser');
let app = require('../server');

const endpoint = new aws.Endpoint('sgp1.digitaloceanspaces.com');

const s3 = new aws.S3({ endpoint });

let storage = multerS3({ s3, bucket: 'barm8-space1/uploads', acl: 'public-read', key: (request, file, cb) => {
  console.log("test");
   cb(null, file.originalname); }
   });

const upload = multer({ storage });

module.exports = function (server) {
  console.log(server);
  // Install a `/` route that returns server status
  let router = server.loopback.Router();
   console.log(router);
  router.use(bodyParser.urlencoded({ extended: false }));
  router.use(bodyParser.json());
  let Slot = app.models.Slot;
  // let Order = app.models.Order;

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
    console.log("test");
    let result = [];
    if (req.files && req.files.length) {
      for (let v of req.files) result.push({ fileName: v.originalname, path: v.location });
      res.json({ isSuccess: true, result });
    } else res.json({ isSuccess: false });
  });

  router.post('/whatson', upload.any('file'), (req, res) => {
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
    console.log(req.files);
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
  server.use(router);
};
