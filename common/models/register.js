'use strict';
const qrcode = require('qrcode-js');
const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, //true --> will use ssl
  auth: {
    user: 'abilash641@gmail.com',
    pass: "friendsfriends"
  }
});

module.exports = function (Register) {
  var app = require('../../server/server');


  Register.registerBusiness = function (details, cb) {
    var data = {};
    var count = 0;
    var obj = {
      "profileName": details.profileName,
      "businessName": details.businessName,
      "businessNumber": details.businessNumber,
      "address": details.address,
      "email": details.email,
      "contactName": details.contactName,
      "phone": details.phone,
      "password": details.password
    };
    var obj1 = {
      "businessName": details.profileName,
      "abn": details.businessNumber,
      "contact": details.contactName,
      "phone": details.phone,
      "email": details.email
    };





    Register.findOne({ where: { email: details.email } }, function (e, docu) {
      if (e) {
        data.isSuccess = false;
        data.info = e;
        cb(null, data);
      } else if (docu) {
        data.isSuccess = false;
        data.info = "Already Registered Email";
        cb(null, data);
      } else {


        Register.create(obj, function (err, res) {
          if (err) {
            data.isSuccess = false;
            data.info = err;
            cb(null, data);
          } else {

            var Business = app.models.Business;
            
            Business.create(obj1, function (err, resp) {
              if (err) {
                data.isSuccess = false;
                data.info = err;
                cb(null, data);
              } else {
                var qrc = String(resp.id);
                obj1.qrCode = qrcode.toDataURL(qrc, 7);
                var mailOptions = {
                  from: 'abilash641@gmail.com',
                  to: details.email,
                  subject: 'Welcome To BarMate',
                  text: `Hi ${details.profileName}, Your QR Scanning Image is attached below `,
                  html: 'Your QR Scanning Image: <br/><img src="cid:abilash641@gmail.com"/>',
                  attachments: [{
                    filename: 'image.gif',
                    path: obj1.qrCode,
                    cid: 'abilash641@gmail.com'
                  }]
                };

                transporter.sendMail(mailOptions, function (error, info) {
                  if (error) {
                    data.isSuccess = false;
                    data.info = error;
                    cb(null, data);

                  } else {
                    console.log('Message sent: ' + info.response);
                  }
                  transporter.close();
                });
              }
            });
            data.isSuccess = true;
            data.info = "Successfully Registered";
            data.response = res;
            cb(null, data);

          }
        })
      }
    });
  }


  Register.remoteMethod('registerBusiness', {
    http: { path: '/registerBusiness', verb: 'post' },

    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Register Business."
  });
};
