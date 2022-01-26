
const qrcode = require('qrcode-js');
var loopback = require('loopback');
const U = require('underscore');
var qr = require('qr-image');
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require('uuid');
let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, //true --> will use ssl
  auth: {
    "user": "barm8global@gmail.com",
    "pass": "Everest@123"
  }
});
let app = require('../../server/server');
let config = require('../../server/config.json');
var unique = require('../../node_modules/array-unique');
const cleanDeep = require('../../node_modules/clean-deep'),
  client = require('../../server/boot/redisDB.js'),
  jwtKey = require('../../server/private/jwtPrivateCode.js'),
  moment = require('moment-timezone');
let path = require('path');
let senderAddress = "barm8global@gmail.com";
var jwt = require('jsonwebtoken');


// verify a token symmetric - synchronous
//var decoded = jwt.verify(token, `${jwtKey.key}`);

module.exports = function (Business) {

  Business.validatesUniquenessOf('businessName');


  Business.afterRemote('create', function (context, user, next) {

    let bussId = context.result.id;
    let bussName1 = context.result.businessName;
    let bussEmail = context.result.email;
    let qrc = String(bussId);
    // let qrCode = qrcode.toDataURL(qrc, 3);
    let pathf = path.resolve(__dirname, '..', '..');

    const HappeningsCategory = app.models.HappeningsCategory;

    // { "name": "Karaoke", "_name": "karaoke", "ownerId": bussId },

    let hCData = [{ "name": "Live Music", "_name": "live_Music", "ownerId": bussId },
    { "name": "DJ", "_name": "dj", "ownerId": bussId },
    { "name": "Trivia", "_name": "trivia", "ownerId": bussId },
    { "name": "Poker", "_name": "poker", "ownerId": bussId },
    { "name": "Comedy", "_name": "comedy", "ownerId": bussId },
    { "name": "Other", "_name": "other", "ownerId": bussId }];

    for (let obD of hCData) {
      let { name, _name, ownerId } = obD;
      HappeningsCategory.create({ name, _name, ownerId });
    }

    let bussName = bussName1.replace(/\s/g, '');

    var qrc_png = qr.image(qrc, { type: 'png', ec_level: 'H', size: 20, margin: 0 });

    qrc_png.pipe(require('fs').createWriteStream(`${pathf}/client/uploads/qr-images/${uuidv4()}.png`));

    var png_string = qr.imageSync(qrc, { type: 'png' });
    png_string = 'data:image/png;base64,' + png_string.toString('base64')


    let qrImageUrl = `uploads/qr-images/${uuidv4()}.png`;
    let dateStr = new Date();
    dateStr = dateStr.toDateString();
    let senderMail = bussEmail;
    Business.upsertWithWhere({ "id": qrc }, { "qrCode": png_string, "qrImageUrl": qrImageUrl });
    let mailFormat = `<table style="border:1px solid #fba241" width="700" cellspacing="0" cellpadding="0" bgcolor="#ffffff">
        <tbody>
        <tr>
            <td style="background-color:#ffffff;border-bottom:1px solid #fba241" valign="top">
                <table cellspacing="0" cellpadding="0" border="0">
                    <tbody><tr>
                        <td style="padding-left:200px;padding-top:15px;padding-bottom:15px;padding-right:100px;font-weight:bold;font-size:24px;color:#fba241;text-align:center" valign="top">
                           BarM8 Business Registration
                        </td>
                    </tr>
                </tbody></table>
            </td>
        </tr>
        <tr>
            <td style="padding-top:10px" valign="top">
                <center><img src="https://barm8.com.au/assets/images/barm_login_logo.png" width="120px" height="70px"></center>
            </td>
        </tr>
        <tr>
             <td style="padding-left:20px;font-size:14px;padding-top:10px;padding-bottom:10px" valign="top">
                   Hi ${bussName1},<br> 
                   Welcome to BarM8. Thank you for registering with us. Your account will be activated shortly.<br><br>
                    Cheers,<br>
                    The BarM8 team
                </td>
        </tr>
        <tr>
        <td style="padding:10px 10px 10px 10px;font-family:Arial,Helvetica,sans-serif;font-weight:bold;font-size:20px;border-top:1px solid #fba241;background-color:#000000;color:#ffffff;border:0px;width:700px" valign="top">
            <a href="http://everestcybertech.com/" style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#ffffff" target="_blank"><center>Copyright 2018 Bar M8, All Rights Reserved</center></a>
        </td>
        </tr>
    </tbody></table>`;

    transporter.sendMail({
      from: 'barm8global@gmail.com',
      to: `${bussEmail}`,
      bcc: 'sureshmcangl@gmail.com, emonitani@gmail.com, simplykshiteej@gmail.com, gary28singh@gmail.com',
      subject: 'Important Information about your membership',
      text: `Hello ${bussName1}.`,
      html: mailFormat
    }, (error, info) => {
      if (error) {

      } else {
        transporter.close();
      }
    });

    next();
  });

  //send password reset link when requested
  Business.on('resetPasswordRequest', function (info) {
    // console.log(info);
    let url = 'https://barm8.com.au/reset-password';
    //let url = 'http://localhost/#!/resetpassword';
    //let html = 'Click <a href="' + url + '?token=' +
    let html = 'Click <a href="' + url + '?access_token=' +
      info.accessToken.id + '">here</a> to reset your password';

    Business.app.models.Email.send({
      to: info.email,
      from: senderAddress,
      subject: 'Password reset',
      html: html
    }, function (err) {
      if (err) return console.log('> error sending password reset email');
      console.log('> sending password reset email to:', info.email);
    });
  });

  //render UI page after password change
  Business.afterRemote('changePassword', function (context, user, next) {
    context.res.render('response', {
      title: 'Password changed successfully',
      content: 'Login again with updated password',
      redirectTo: '/index.html',
      redirectToLinkText: 'proceed'
    });
  });


  Business.afterRemote('setPassword', function (context, user, next) {
    context.res.render('response', {
      title: 'Password reset success',
      content: 'Your password has been reset successfully',
      redirectTo: '/index.html',
      redirectToLinkText: 'proceed'
    });
  });


  Business.sendToInfoBarm8 = (params, cb) => {
    isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });
    if (params) {
      let { businessName, name, email, phone } = params;
      let html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>Demystifying Email Design</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      </head>
      <body style="margin: 0; padding: 0;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%"> 
              <tr>
                  <td style="padding: 10px 0 30px 0;">
                      <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border: 1px solid #cccccc; border-collapse: collapse;">
                          <tr>
                              <td align="center" bgcolor="#ffffff" style="padding: 10px 0 10px 0; color: #153643; font-size: 28px; font-weight: bold; font-family: Arial, sans-serif;">
                              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIUAAAAyCAMAAABFy+jDAAAAclBMVEVHcEz1oxn6qRf7qRj6pxv7qRj0nwP8qxn7qRj7qRj6qBf+qRv7qRj7qRj7qRj6qRj7qBj7qRj7qBj7qRj7qBj7qRj7qRj7qRj7qRj7qRj7qRj7qRj7qRj7qRj7qRj7qRj8qRj7qRj8qhn/rBn/rxr/sxoKa7TjAAAAInRSTlMABQ5rEuoC/PjxFwger+EoT7ijMprUWHbagMfARTtgzomSIKC5fgAABbVJREFUWMPtWNmW4koOlJfcbKf3FWNjh+T//8V5AKqoaorq7rlzX6b05gOkQxFSSAnRT/zET/zEPxDJ8j87uojatgx+55tx3f0XMEJff43BK2etG9JvIRTNYLD9NYh0Ni56h9SeireHIFKWWZjViySLdfNdrpRygJun5u9Q1AaY7w+ZNxLd+U8nBzG+TPZj+EKTZh+VswYswgALWzf/jSyRBXC6g6gMpI6vD7q3DN+EQeiPPX5K464smEXU3G4586UfvJX8/McgGgXATm9M4B1FfBEXhZposEf7FEXkmMX6qEjisDesoiANi+pokz8EEZwAQGXXTqsNACn1DZPYPSWiyOGYnpbnYI8xysKAiOKReU6J6NwdD5X1e7FZAMZrIqJ4NwDE3zNJDDxR0lowyudEnrbsCi+YmFVPFG/KyPyHKM4KANz5WosW1rI963u7VKKGtbPAF4KQju8UFQ6oKIg6Cxx7+Pxt/b7op00KALgERKQjK5cLPx6xWDgHMO/fCa0rcH5eLw7g41To532Q2+7ZQZPl3MBGRESlk1PrJH/vs6IFAMilDL/jtLSA6xzAkkfJcxDJzO8m8BDLyM5buJiIFiX55OXY3jiulQXAbkq+9W/dAQDAtuqTr2z2nB/bM2G9kWkEaiIqOnZDZGW8UZG0VwzM43fdn5T7DQTUtnyJWJ/zI3re7eqsgDNRPLPZm9MbFUNuAQgunZj2BRV69Z1y9gYCxqncRx+07+tquCqUVuJ+rfLixEcUOeQBpa3hKoyEr7ZXzA6A2HaJS8t5+cJuZgO+qXEL61SbvWl+cda44Yp4zq0ZPzfxbrhLWouW9GC5y4qTHHtKRP1oALZbEWqK20PaFwN1sAcsAFtVVVXNl9zKISbvr+mvChCer2mUVePB/uNh5cjHShegpNKxWiiSa9pRDoDbIiUi0uV7rTydJFmWtBZmiq+RJNl5OLErNRH1Dsy+ub23nqhiPn1AEdYipyzM2cSFYhfpbJajDonKnMH5OXzTTUz0erPIgfxdb63TuFd5RtQosFvDphoCImp8c85ZpuBTaUqvG8Vd0sHsKfWG3UqUzQyZ330nqUX2lzvOZIFPOLWXXgcXQC1BMl8LY5/iytwn1j3FWaTKqHTsK2AOKfEiVUY0WPDjNIpbEZ+9omIE8k+2ll2OTQ8WbtGhN6x6oqVuIgdZPzjaZMC9ptXBWeQZ0WLZDppSL7CPdZDd0H3Zq5EDr59AVEa2JAd6ndYG4lPS+5DMLD7+5JriM6LVAbALUTiJXBqi4iTSPma2KJY6ebUaMLqPVPSdwdFHFj5IawNWEVG0h71i2xBReJcv3IVtr4lKB2DVRNnI3AZEzUWOXn8QBDLpr1H0iuXxB9R4B0iXeIMmrszYHl1Bq29oM1LHRMmpv1u646NOiChULFNKpMtbm2azHA8ulW4W8nK/94YvDzSfvbKAqLMeYaIOl2Y6unK7lJp2SB1QOd4XpqSWW0dT300hEcW1SJUSkW6vsG55VRZsnw1CKtqeiKgZH6jIhpOzAI5uCSgHHFeJ7g/YrgyIVsWuy1V0l6+3OG7LZXDdUwrLN59tOnFXMtLSKwOxz+8izdhqItrsnYpmqJQDALFbpolaFjvERMl22orgutEf8Ev6VsLC6sNwCCLhrriPPnHVNOxz7ixYxvK5WWTe1AsFs8iaLetW5coZACxub0Iionhds5SIdBiHd58tsvithFYDqT+cHVfM/vZ5UNQQay1YRLroq+VCl4pVPlpAKeWsAcAsmKPiznjwci3JZvk8JxPL6uF6VkT1aexO9bAkX7tmsHg+hBnMzCIiPNZrEX97lbyPsV+ooAzSPTiTTsM4SeLw9Yk6bqJ6HvM8705+j85ZEgb021Eev6wMYSVe/80VN4yTJEmSOA7TP/x9MR6fqCDdzP2//F9HUM6/bE/Bb+v5z8H491/5Ez/xE/+H8R+cuocxoLwwXgAAAABJRU5ErkJggg==" alt="Request from New Venue" width="150" height="70" style="display:block" class="CToWUd a6T" tabindex="0">
                              </td>
                          </tr>
                          <tr>
                              <td bgcolor="#faa141" style="padding: 40px 30px 40px 30px;">
                                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                      <tr>
                                          <td>
                                              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                  <tr>
                                                      <td width="260" valign="top">
                                                          <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                              <tr>
                                                                  <td>
                                                                     <b style="font-size: 17px;
                                                                     color: #fff;">Your venue Name</b>
                                                                  </td>
                                                              </tr>
                                                              <tr>
                                                                  <td>
                                                                  <b style="font-size: 17px;
                                                                  color: #fff;">Your name</b>
                                                                  </td>
                                                              </tr>
                                                              <tr>
                                                                  <td>
                                                                  <b style="font-size: 17px;
                                                                  color: #fff;">Mobile No</b>
                                                                  </td>
                                                              </tr>
                                                              <tr>
                                                                  <td>
                                                                  <b style="font-size: 17px;
                                                                  color: #fff;">Email</b>
                                                                  </td>
                                                              </tr>
                                                          </table>
                                                      </td>
                                                      <td style="font-size: 0; line-height: 0;" width="20">
                                                          &nbsp;
                                                      </td>
                                                      <td width="260" valign="top">
                                                          <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                             <tr>
                                                                  <td>
                                                                  <b style="font-size: 17px;
                                                                  color: #fff;">${businessName}</b>
                                                                  </td>
                                                              </tr>
                                                             <tr>
                                                                  <td>
                                                                  <b style="font-size: 17px;
                                                                  color: #fff;">${name}</b>
                                                                  </td>
                                                              </tr>
                                                              <tr>
                                                                  <td>
                                                                  <b style="font-size: 17px;
                                                                  color: #fff;">${phone}</b>
                                                                  </td>
                                                              </tr>
                                                              <tr>
                                                                  <td>
                                                                  <b style="font-size: 17px;
                                                                  color: #fff;">${email}</b>
                                                                  </td>
                                                              </tr>
                                                          </table>
                                                      </td>
                                                  </tr>
                                              </table>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>`;
      let emails = 'emonitani@gmail.com, simplykshiteej@gmail.com, gary28singh@gmail.com, sureshmcangl@gmail.com';

      var mailOptions = {
        from: 'barm8global@gmail.com',
        to: `info@barm8.com.au`,
        subject: 'Request from New Venue', html
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) { console.log(error); }
        else { transporter.close(); console.log(info); }
      });

      isSuccess(true, "Success");

    } else isSuccess();
  }

  Business.contactUS = (params, cb) => {
    isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });
    if (params) {
      let { msg, name, email, phone, subject } = params;
      let html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>Demystifying Email Design</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      </head>
      <body style="margin: 0; padding: 0;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%"> 
              <tr>
                  <td style="padding: 10px 0 30px 0;">
                      <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border: 1px solid #cccccc; border-collapse: collapse;">
                          <tr>
                              <td align="center" bgcolor="#ffffff" style="padding: 10px 0 10px 0; color: #153643; font-size: 28px; font-weight: bold; font-family: Arial, sans-serif;">
                              <img src="https://www.barm8.com.au/views/web-site/images/barm_login_logo.png" alt="Request from New Venue" width="150" height="70" style="display:block" class="CToWUd a6T" tabindex="0">
                              </td>
                          </tr>
                          <tr>
                              <td bgcolor="#faa141" style="padding: 40px 30px 40px 30px;">
                                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                      <tr>
                                          <td>
                                              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                  <tr>
                                                      <td width="260" valign="top">
                                                          <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                             
                                                              <tr>
                                                                  <td>
                                                                  <b style="font-size: 17px;
                                                                  color: #fff;">Your name</b>
                                                                  </td>
                                                              </tr>
                                                              <tr>
                                                                  <td>
                                                                  <b style="font-size: 17px;
                                                                  color: #fff;">Mobile No</b>
                                                                  </td>
                                                              </tr>
                                                              <tr>
                                                                  <td>
                                                                  <b style="font-size: 17px;
                                                                  color: #fff;">Email</b>
                                                                  </td>
                                                              </tr>
                                                              <tr>
                                                              <td>
                                                              <b style="font-size: 17px;
                                                              color: #fff;">Subject</b>
                                                              </td>
                                                          </tr>
                                                              <tr>
                                                              <td>
                                                              <b style="font-size: 17px;
                                                              color: #fff;">Message</b>
                                                              </td>
                                                          </tr>
                                                          </table>
                                                      </td>
                                                      <td style="font-size: 0; line-height: 0;" width="20">
                                                          &nbsp;
                                                      </td>
                                                      <td width="260" valign="top">
                                                          <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                             <tr>
                                                                  <td>
                                                                  <b style="font-size: 17px;
                                                                  color: #fff;">${name}</b>
                                                                  </td>
                                                              </tr>
                                                              <tr>
                                                                  <td>
                                                                  <b style="font-size: 17px;
                                                                  color: #fff;">${phone}</b>
                                                                  </td>
                                                              </tr>
                                                              <tr>
                                                                  <td>
                                                                  <b style="font-size: 17px;
                                                                  color: #fff;">${email}</b>
                                                                  </td>
                                                              </tr>
                                                              <tr>
                                                              <td>
                                                              <b style="font-size: 17px;
                                                              color: #fff;">${subject}</b>
                                                              </td>
                                                          </tr>
                                                              <tr>
                                                                  <td>
                                                                  <b style="font-size: 17px;
                                                                  color: #fff;">${msg}</b>
                                                                  </td>
                                                              </tr>
                                                          </table>
                                                      </td>
                                                  </tr>
                                              </table>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>`;
      let emails = 'emonitani@gmail.com, simplykshiteej@gmail.com, gary28singh@gmail.com, sureshmcangl@gmail.com';

      var mailOptions = {
        from: 'barm8global@gmail.com',
        to: `info@barm8.com.au`,
        subject: 'Contact-US', html
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) { console.log(error); }
        else { transporter.close(); console.log(info); }
      });

      isSuccess(true, "Success");

    } else isSuccess();
  }

  Business.errorSendToMe = (params, cb) => {

    isSuccess = (isSuccess = false, message = 'Please try again!') => cb(null, { isSuccess, message });

    let text = params.error;

    var mailOptions = {
      from: 'barm8global@gmail.com',
      to: `sureshmcangl@gmail.com`,
      subject: 'Error find', text
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) { console.log(error); }
      else { transporter.close(); console.log(info); }
    });

    isSuccess(true, "Success");
  }

  Business.getVenueConfig = (params, cb) => {
    if (params) {
      let { ownerId } = params;
      Business.findOne({
        where: { id: ownerId },
        include: [{ relation: "venueSettings" },
        { relation: "venueServiceOptions" },
        { relation: "bistroHours" },
        { relation: "weeklyTimings" }]
      }, (err, res) => {
        if (err) cb(null, { isSuccess: false, message: "Error", err })
        else cb(null, { isSuccess: true, message: "Success", res })
      })
    }
  }

  Business.updateStatus = (params, cb) => {
    let isCallBack = (isSuccess, message, result = {}) => cb(null, { isSuccess, message, result });
    if (params) {
      let { id, status } = params;
      if (id) {
        let updateObj = { status };
        if (status != 'active') updateObj = { status, isAppLive: false }

        Business.upsertWithWhere({ id }, updateObj, (err, res) => {

          if (err) isCallBack(false, "Error", err);
          else {

            const HappeningsCategory = app.models.HappeningsCategory;

            // { "name": "Karaoke", "_name": "karaoke", "ownerId": id },

            let hCData = [{ "name": "Live Music", "ownerId": id, "_name": "live_Music" },
            { "name": "DJ", "_name": "dj", "ownerId": id },
            { "name": "Trivia", "_name": "trivia", "ownerId": id },
            { "name": "Poker", "_name": "poker", "ownerId": id },
            { "name": "Comedy", "_name": "comedy", "ownerId": id },
            { "name": "Other", "_name": "other", "ownerId": id }];

            hCData.forEach(async v => {
              let { name, _name, ownerId } = v;
              await HappeningsCategory.upsertWithWhere({ ownerId, _name, name }, { name, _name, ownerId }, (chErr, chRes) => {
              });
            })

            isCallBack(true, "Successfully updated", res);
          }
        })
      } else isCallBack(false, "Id is required!", {});
    } else isCallBack(false, "Params is required!", {});
  }

  Business.updateAppStatus = (params, cb) => {
    let isCallBack = (isSuccess, message, result = {}) => cb(null, { isSuccess, message, result });
    if (params) {
      let { id, isAppLive } = params;
      if (id) {

        Business.upsertWithWhere({ id }, { isAppLive }, (err, res) => {

          if (err) isCallBack(false, "Error", err);
          else {
            isCallBack(true, "Successfully updated", res);
          }
        })
      } else isCallBack(false, "Id is required!", {});
    } else isCallBack(false, "Params is required!", {});
  }

  Business.getAllDataOnToday = (params, cb) => {

    let isCallBack = (isSuccess, message, result = {}) => cb(null, { isSuccess, message, result });

    const ExclusiveOffer = app.models.ExclusiveOffer;
    const DailySpecial = app.models.DailySpecial;
    const HappyHourDashDay = app.models.HappyHourDashDay;

    const convertTime12to24 = (time12h) => moment(time12h, 'hh:mm A').format('HH:mm');

    if (params) {

      let { timeZone, country, location } = params;

      if (!timeZone) timeZone = "Australia/Sydney";
      if (!country) country = "Australia";
      if (!location) location = { lat: -33.863644, lng: 151.19466 };

      let offerDate = `${moment.tz(new Date(), timeZone).format('YYYY-MM-DD')}T00:00:00.000Z`;

      let dateNo = Number(moment.tz(new Date(), timeZone).format('DD'));
      let month = Number(moment.tz(new Date(), timeZone).format('MM'));
      let year = Number(moment.tz(new Date(), timeZone).format('YYYY'));

      let cuDataTime = new Date(`${year}-${month}-${dateNo}`);

      let hours = Number(moment.tz(new Date(), timeZone).format('HH'));

      let minutes = Number(moment.tz(new Date(), timeZone).format('mm'));

      cuDataTime.setHours(Number(moment.tz(new Date(), timeZone).format('HH')));
      cuDataTime.setMinutes(Number(moment.tz(new Date(), timeZone).format('mm')));

      let findDistance = (data) => {
        return new Promise((resolve, reject) => {
          // data = JSON.parse(JSON.stringify(data));
          data.forEach((val, i) => {
            try {
              if (location && val.business.location) {
                var here = new loopback.GeoPoint(location);
                var there = new loopback.GeoPoint(val.business.location);
                data[i].distance = here.distanceTo(there, { type: 'meters' });
              }
            } catch (e) {
              console.log(e);
            }
            if ((i + 1) == data.length) resolve(data);
          });
        })
      }

      let fields = ["email", "businessName", "location", "currentVisitCnt", "venueCapacity", "openingHoursStatus", "addressLine1", "addressLine2", "suburb", "zipCode", "startTime", "endTime", "id", "imageUrl", "venueInformation", "website", "isAppLive", "status"];

      let getAllOffers = () => {
        return new Promise(resolve => {
          ExclusiveOffer.find({
            where: { offerDate, status: "Live" }, include: [{
              relation: "business", scope: {
                fields,
                where: {
                  isAppLive: true,
                  status: 'active',
                }
              }
            }]
          }, (err, res) => {
            if (err) resolve([])
            else {

              res = JSON.parse(JSON.stringify(res));
              let rData = res.filter(m => m && m.business && m.business.isAppLive && m.business.status == 'active');
              let resValues = [];
              if (rData && rData.length) {
                rData.forEach((val, i) => {
                  if (val && val.offerDate && val.start.time > cuDataTime.getTime()) {
                    resValues.push(val);
                  }
                  if ((i + 1) == rData.length) resolve(resValues);
                })
              } else resolve(resValues);
            }
          });
        });
      }

      let getAllDailySpecials = () => {
        return new Promise(resolve => {

          DailySpecial.find({
            where: {
              date: offerDate, status: "Live"
            },
            include: [
              { relation: "dailySpecialCategory" }, {
                relation: "business", scope: {
                  fields,
                  where: {
                    isAppLive: true,
                    status: 'active',
                  }
                }
              }]
          }, async (err, res) => {
            if (err) resolve([])
            else {

              res = JSON.parse(JSON.stringify(res));
              let rData = res.filter(m => m && m.business && m.business.isAppLive && m.business.status == 'active');

              if (rData && rData.length) {


                findDistance(rData).then(async (res_1) => {

                  let bData = res_1.sort((a, b) => (a.distance > b.distance) ? 1 : -1);

                  let resValues = [];
                  await bData.forEach(async (val, i) => {

                    if (hours < val.endHour) resValues.push(val);
                    else if (hours == val.endHour && minutes <= val.endMinute) resValues.push(val);

                    if (rData.length == (i + 1)) {

                      let groupByKey = (array, key) => {
                        return array
                          .reduce((hash, obj) => {
                            if (obj[key] === undefined) return hash;
                            return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) })
                          }, {})
                      }

                      let fData = await groupByKey(resValues, 'titleTxt');

                      let aArray = [];

                      await Object.keys(fData).forEach((k, j) => {
                        let oSData = res.find(m => m.titleTxt == k);
                        let { desc, titleTxt, title, img, status, date } = oSData;
                        aArray.push({ desc, titleTxt, title, img, status, date, values: fData[k] });
                      })

                      resolve(aArray);
                    }
                  })

                });
              } else resolve([])

            }
          })
        });
      }

      let getAllHappyhours = () => {
        return new Promise(resolve => {
          HappyHourDashDay.find({
            where: { date: offerDate, status: "Live" }, include: [{
              relation: "business", scope: {
                fields,
                where: {
                  isAppLive: true,
                  status: 'active',
                }
              }
            }]
          }, async (err, res) => {
            if (err) resolve([])
            else {
              res = JSON.parse(JSON.stringify(res));
              let rData = await res.filter(m => m && m.business && m.business.isAppLive && m.business.status == 'active');

              rData = rData;

              let resValues = [];

              if (rData && rData.length) {

                await findDistance(rData).then((res) => {
                  rData = res.sort((a, b) => (a.distance > b.distance) ? 1 : -1);

                  rData.forEach((val, i) => {
                    if (hours < val.end_hour) resValues.push(val);
                    else if (hours == val.end_hour && minutes <= val.end_minute) resValues.push(val);
                    if ((i + 1) == rData.length) resolve(resValues);
                  })
                });

              } else resolve(resValues);
            }
          })
        });
      }


      let findData = async () => {
        // let offersDataF = await getAllOffers().then(offers => { return offers });
        let dailySpecialData = await getAllDailySpecials(sepcial => { return sepcial });
        let happyHours = await getAllHappyhours().then(happy => { return happy });
        cb(null, { isSuccess: true, message: "Success", dailySpecials: dailySpecialData, happyHours });
      }

      findData();

    } else isCallBack(false, "Params is required!", {});
  }

  Business.getOffersByCategory = (params, cb) => {

    let isCallBack = (isSuccess, message, result = {}) => cb(null, { isSuccess, message, result });

    const ExclusiveOffer = app.models.ExclusiveOffer;
    const Takeaway = app.models.Takeaway;
    const DailySpecial = app.models.DailySpecial;
    const HappyHourDashDay = app.models.HappyHourDashDay;

    if (params) {

      let { timeZone, country, location, type } = params;


      if (!timeZone) timeZone = "Australia/Sydney";
      if (!country) country = "Australia";
      if (!location) location = { lat: -33.863644, lng: 151.19466 };

      let offerDate = `${moment.tz(new Date(), timeZone).format('YYYY-MM-DD')}T00:00:00.000Z`;

      let hours = Number(moment.tz(new Date(), timeZone).format('HH'));

      let minutes = Number(moment.tz(new Date(), timeZone).format('mm'));

      let findDistance = (data) => {
        return new Promise((resolve, reject) => {
          data.forEach((val, i) => {
            try {
              if (location && val.business.location) {
                var here = new loopback.GeoPoint(location);
                var there = new loopback.GeoPoint(val.business.location);
                data[i].distance = here.distanceTo(there, { type: 'meters' });
              }
            } catch (e) {
              console.log(e);
            }
            if ((i + 1) == data.length) resolve(data);
          });
        })
      }

      let fields = ["email", "businessName", "location", "currentVisitCnt", "venueCapacity", "openingHoursStatus", "addressLine1", "addressLine2", "suburb", "zipCode", "startTime", "endTime", "id", "imageUrl", "venueInformation", "website", "isAppLive", "status"];

      let getTakeawaySpecials = () => {
        return new Promise(resolve => {
          let category = (type == "drinksSpecial" ? "Drinks" : "Food");
          Takeaway.find({
            where: {
              date: offerDate,
              status: "Live", category
            }, include: [{
              relation: "business", scope: {
                fields, where: {
                  isAppLive: true,
                  or: [{ status: 'active' }, { status: 'Active L1' }, { status: 'Active L2' }]
                }
              }
            }]
          }, (err, res) => {
            if (err) resolve([]);
            else {
              res = JSON.parse(JSON.stringify(res));
              res = res.filter(m => m.business && m.business.id);
              resolve(res);
            }
          })
        });
      }

      let getAllDailySpecials = () => {
        return new Promise(resolve => {

          DailySpecial.find({
            where: {
              date: offerDate, status: "Live"
            },
            include: [
              { relation: "dailySpecialCategory" }, {
                relation: "business", scope: {
                  fields,
                  where: {
                    isAppLive: true,
                    or: [{ status: 'active' }, { status: 'Active L1' }, { status: 'Active L2' }]
                  }
                }
              }]
          }, async (err, res) => {
            if (err) resolve([])
            else {

              res = JSON.parse(JSON.stringify(res));
              let rData = res.filter(m => m && m.business && m.business.id);

              if (rData && rData.length) {

                findDistance(rData).then(async (res_1) => {

                  let bData = res_1.sort((a, b) => (a.distance > b.distance) ? 1 : -1);

                  let resValues = [];
                  await bData.forEach(async (val, i) => {
                    val.isPast = false;
                    if (hours < val.endHour) resValues.push(val);
                    else if (hours == val.endHour && minutes <= val.endMinute) resValues.push(val);
                    else {
                      val.isPast = true;
                      resValues.push(val);
                    }
                    if ((i + 1) == bData.length) {

                      let groupByKey = (array, key) => {
                        return array
                          .reduce((hash, obj) => {
                            if (obj[key] === undefined) return hash;
                            return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) })
                          }, {})
                      }

                      let fData = await groupByKey(resValues, 'titleTxt');

                      let aArray = [];

                      await Object.keys(fData).forEach((k, j) => {
                        let oSData = res.find(m => m.titleTxt == k);
                        let { desc, titleTxt, title, img, status, date } = oSData;
                        aArray.push({ desc, titleTxt, title, img, status, date, values: fData[k] });
                      })

                      resolve(aArray);
                    }
                  });


                });
              } else resolve([])

            }
          })
        });
      }

      let getAllHappyhours = () => {
        return new Promise(resolve => {
          HappyHourDashDay.find({
            where: { date: offerDate, status: "Live" }, include: [{
              relation: "business", scope: {
                fields,
                where: {
                  isAppLive: true,
                  or: [{ status: 'active' }, { status: 'Active L1' }, { status: 'Active L2' }]
                }
              }
            }]
          }, async (err, res) => {
            if (err) resolve([])
            else {
              res = JSON.parse(JSON.stringify(res));
              let rData = await res.filter(m => m && m.business && m.business.id);

              if (rData && rData.length) {

                let resValues = [];
                await findDistance(rData).then((res_1) => {
                  let fVal = res_1.sort((a, b) => (a.distance > b.distance) ? 1 : -1);
                  fVal.forEach((val, i) => {
                    val.isPast = false;
                    if (hours < val.end_hour) resValues.push(val);
                    else if (hours == val.end_hour && minutes <= val.end_minute) resValues.push(val);
                    else {
                      val.isPast = true;
                      resValues.push(val);
                    }
                    if ((i + 1) == fVal.length) resolve(resValues);
                  })
                });

              } else resolve([]);
            }
          })
        });
      }


      let findData = async () => {
        if (type == "drinksSpecial") {
          let happyHours = await getAllHappyhours().then(happy => { return happy });
          let takeawayData = await getTakeawaySpecials(sepcial => { return sepcial });
          cb(null, { isSuccess: true, message: "Success", dailySpecials: [], happyHours, takeaway: takeawayData });
        } else if (type == "dailySpecial") {
          let dailySpecialData = await getAllDailySpecials(sepcial => { return sepcial });
          let takeawayData = await getTakeawaySpecials(sepcial => { return sepcial });
          cb(null, { isSuccess: true, message: "Success", dailySpecials: dailySpecialData, happyHours: [], takeaway: takeawayData });
        } else {
          cb(null, { isSuccess: true, message: "Success", dailySpecials: [], happyHours: [], takeawayData: [] });
        }
      }

      findData();

    } else isCallBack(false, "Params is required!", {});
  }

  Business.getOffersByCategory_V2 = (params, cb) => {

    let isCallBack = (isSuccess, message, result = {}) => cb(null, { isSuccess, message, result });

    const ExclusiveOffer = app.models.ExclusiveOffer;
    const Takeaway = app.models.Takeaway;
    const DailySpecial = app.models.DailySpecial;
    const HappyHourDashDay = app.models.HappyHourDashDay;

    if (params) {

      let { timeZone, country, location, type } = params;


      if (!timeZone) timeZone = "Australia/Sydney";
      if (!country) country = "Australia";
      if (!location) location = { lat: -33.863644, lng: 151.19466 };

      let offerDate = `${moment.tz(new Date(), timeZone).format('YYYY-MM-DD')}T00:00:00.000Z`;

      let hours = Number(moment.tz(new Date(), timeZone).format('HH'));

      let minutes = Number(moment.tz(new Date(), timeZone).format('mm'));

      let findDistance = (data) => {
        return new Promise((resolve, reject) => {
          data.forEach((val, i) => {
            try {
              if (location && val.business.location) {
                var here = new loopback.GeoPoint(location);
                var there = new loopback.GeoPoint(val.business.location);
                data[i].distance = here.distanceTo(there, { type: 'meters' });
              }
            } catch (e) {
              console.log(e);
            }
            if ((i + 1) == data.length) resolve(data);
          });
        })
      }

      let fields = ["email", "businessName", "location", "currentVisitCnt", "venueCapacity", "openingHoursStatus", "addressLine1", "addressLine2", "suburb", "zipCode", "startTime", "endTime", "id", "imageUrl", "venueInformation", "website", "isAppLive", "status"];

      let getTakeawaySpecials = () => {
        return new Promise(resolve => {
          let category = (type == "drinksSpecial" ? "Drinks" : "Food");
          Takeaway.find({
            where: {
              date: offerDate,
              status: "Live", category
            }, include: [{
              relation: "business", scope: {
                fields, where: {
                  isAppLive: true,
                  or: [{ status: 'active' }, { status: 'Active L1' }, { status: 'Active L2' }]
                }
              }
            }]
          }, (err, res) => {
            if (err) resolve([]);
            else {
              res = JSON.parse(JSON.stringify(res));
              res = res.filter(m => m.business && m.business.id);
              resolve(res);
            }
          })
        });
      }

      let getAllDailySpecials = () => {
        return new Promise(resolve => {

          DailySpecial.find({
            where: {
              date: offerDate, status: "Live"
            },
            include: [
              { relation: "dailySpecialCategory" }, {
                relation: "business", scope: {
                  fields,
                  where: {
                    isAppLive: true,
                    or: [{ status: 'active' }, { status: 'Active L1' }, { status: 'Active L2' }]
                  }
                }
              }]
          }, async (err, res) => {
            if (err) resolve([])
            else {

              res = JSON.parse(JSON.stringify(res));
              let rData = res.filter(m => m && m.business && m.business.id);

              if (rData && rData.length) {

                findDistance(rData).then(async (res_1) => {

                  let bData = res_1.sort((a, b) => (a.distance > b.distance) ? 1 : -1);

                  let resValues = [];
                  await bData.forEach(async (val, i) => {
                    val.isPast = false;
                    if (hours < val.endHour) resValues.push(val);
                    else if (hours == val.endHour && minutes <= val.endMinute) resValues.push(val);
                    else {
                      val.isPast = true;
                      resValues.push(val);
                    }
                    if ((i + 1) == bData.length) {

                      let groupByKey = (array, key) => {
                        return array
                          .reduce((hash, obj) => {
                            if (obj[key] === undefined) return hash;
                            return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) })
                          }, {})
                      }

                      let fData = await groupByKey(resValues, 'titleTxt');

                      let aArray = [];

                      await Object.keys(fData).forEach((k, j) => {
                        let oSData = res.find(m => m.titleTxt == k);
                        let { desc, titleTxt, title, img, status, date } = oSData;
                        aArray.push({ desc, titleTxt, title, img, status, date, values: fData[k] });
                      })

                      resolve(aArray);
                    }
                  });


                });
              } else resolve([])

            }
          })
        });
      }

      let getAllHappyhours = () => {
        return new Promise(resolve => {
          HappyHourDashDay.find({
            where: { date: offerDate, status: "Live" }, include: [{
              relation: "business", scope: {
                fields,
                where: {
                  isAppLive: true,
                  or: [{ status: 'active' }, { status: 'Active L1' }, { status: 'Active L2' }]
                }
              }
            }]
          }, async (err, res) => {
            if (err) resolve([])
            else {
              res = JSON.parse(JSON.stringify(res));
              let rData = await res.filter(m => m && m.business && m.business.id);

              if (rData && rData.length) {

                let resValues = [];
                await findDistance(rData).then(async (res_1) => {

                  let fVal = await res_1.sort((a, b) => (a.distance > b.distance) ? 1 : -1);

                  await fVal.forEach(async (val, i) => {

                    val.isPast = false;

                    if (hours < val.end_hour) resValues.push(val);
                    else if (hours == val.end_hour && minutes <= val.end_minute) resValues.push(val);
                    else {
                      val.isPast = true;
                      resValues.push(val);
                    }

                    if ((i + 1) == fVal.length) {

                      let groupByKey = (array, key) => {
                        return array
                          .reduce((hash, obj) => {
                            if (obj[key] === undefined) return hash;
                            return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) })
                          }, {})
                      }

                      //console.log(resValues)

                      //   let fData = await groupByKey(resValues, 'titleTxt');

                      let fData = await groupByKey(resValues, 'ownerId');


                      // console.log(fData);

                      let aArray = [];

                      await Object.keys(fData).forEach(async (k, j) => {

                        let oSData = res.filter(m => m.ownerId == k);

                        let mArray = await groupByKey(oSData, 'titleTxt');

                        await Object.keys(mArray).forEach((s, y) => {
                          let oSFData = oSData.find(m => m.titleTxt == s);
                          let oSFAData = oSData.filter(m => m.titleTxt == s && m.ownerId == k);
                          let { desc, titleTxt, title, img, status, date } = oSFData;
                          aArray.push({ desc, titleTxt, title, img, status, date, values: oSFAData });
                        });

                      })

                      resolve(aArray);
                    }
                  })
                });

              } else resolve([]);
            }
          })
        });
      }


      let findData = async () => {
        if (type == "drinksSpecial") {
          let happyHours = await getAllHappyhours().then(happy => { return happy });
          let takeawayData = await getTakeawaySpecials(sepcial => { return sepcial });
          cb(null, { isSuccess: true, message: "Success", dailySpecials: [], happyHours, takeaway: takeawayData });
        } else if (type == "dailySpecial") {
          let dailySpecialData = await getAllDailySpecials(sepcial => { return sepcial });
          let takeawayData = await getTakeawaySpecials(sepcial => { return sepcial });
          cb(null, { isSuccess: true, message: "Success", dailySpecials: dailySpecialData, happyHours: [], takeaway: takeawayData });
        } else {
          cb(null, { isSuccess: true, message: "Success", dailySpecials: [], happyHours: [], takeawayData: [] });
        }
      }

      findData();

    } else isCallBack(false, "Params is required!", {});
  }

  Business.userLogin = (params, cb) => {

    let isSuccess = (isSuccess = false, message = 'Please try again!', result = {}) => cb(null, { isSuccess, message, result });

    const VenueAccounts = app.models.VenueAccounts;

    if (params) {
      let { email, password } = params;

      Business.login({ email, password }, (err, res) => {

        if (err) isSuccess(false, err);
        else {
          if (res && res.userId) {
            // VenueAccounts.createStripeAccount({ ownerId: res.userId });
            Business.findById(res.userId, (bErr, bRes) => {
              if (bErr) isSuccess(true, "success", res);
              else {
                res.business = bRes;
                isSuccess(true, "success", res);
              }
            })
          } else isSuccess(true, "success", res);
        }
      });
    } else isSuccess();
  }

  Business.isInActive = (cb) => {
    isSuccess = (isSuccess = false, message = 'Please try again!', result = {}) => cb(null, { isSuccess, message, result });
    Business.find((err, res) => {
      res = JSON.parse(JSON.stringify(res));
      res.forEach(async (val) => {
        await Business.upsertWithWhere({ id: val.id }, { status: 'inactive' });
      })
    });
    isSuccess();
  }

  Business.currentVisitReset = (params, cb) => {
    isSuccess = (isSuccess = false, message = 'Please try again!', result = {}) => cb(null, { isSuccess, message, result });
    if (params) {
      let { ownerId } = params;
      if (ownerId) {
        let timeZone = 'Australia/Sydney',
          date = moment.tz(new Date(), timeZone).format('DD'),
          month = moment.tz(new Date(), timeZone).format('MM'),
          year = moment.tz(new Date(), timeZone).format('YYYY');
        Business.upsertWithWhere({ id: ownerId }, { date, month, year, currentVisitCnt: 0, manualCount: 0, scanCount: 0 }, (err, res) => {
          if (err) isSuccess(false, "Not updated. Please try again!", {});
          else isSuccess(true, "Success", res);
        });
      } else isSuccess(false, "OwnerId is required", {});
    } else isSuccess(false, "Params is required", {});
  }


  Business.updateEmailAndPwd = (params, cb) => {
    isCallBack = (isSuccess = false, message = "please try again", result = {}) => cb(null, { isSuccess, message, result });
    if (params) {
      let { id, email, password } = params;
      Business.findOne({ where: { id } }, (err, res) => {
        if (err) isCallBack();
        else {
          if (password) {
            res.updateAttribute('password', Business.hashPassword(password));
          }
          res.updateAttributes({ email }, (updateErr, updateRes) => {
            isCallBack(true, "Success");
          });
        }
      });

    } else isCallBack(false, "params is required!");
  }

  Business.updateBusinessAttributes = (params, cb) => {
    isCallBack = (isSuccess = false, message = "please try again", result = {}) => cb(null, { isSuccess, message, result });
    if (params) {
      let id = params.ownerId;
      let { businessName, abn, venueInformation, website, phone, addressLine1, addressLine2, city, state, zipCode, country,
        eddystoneNameSpaceId, contactFirstName,
        contactLastName, contactEmail, eddystoneInstanceId, eddystoneUrl, iBeaconId, majorId, minorId, bookingUrl,
        contactPhoneNo, location, placeId, primaryImage, isQrCode, isBeacon } = params;
      if (id) {
        Business.findOne({ where: { id } }, (err, res) => {
          if (err) isCallBack();
          else {

            let updateObj = {
              businessName, abn, venueInformation, website, phone, addressLine1, addressLine2, city, state, zipCode, country, eddystoneNameSpaceId, eddystoneInstanceId, eddystoneUrl, iBeaconId, majorId, minorId, bookingUrl,
              contactPhoneNo, location, placeId, suburb: city, isQrCode, isBeacon, contactFirstName,
              contactLastName, contactEmail
            };
            if (primaryImage && primaryImage.length) {
              updateObj.primaryImage = primaryImage;
            }

            res.updateAttributes(updateObj, (updateErr, updateRes) => {
              isCallBack(true, "Success");
            });
          }
        });
      } else isCallBack();
    }
  };

  Business.updateBookingURl = (params, cb) => {
    isCallBack = (isSuccess = false, message = "please try again", result = {}) => cb(null, { isSuccess, message, result });
    if (params) {
      let id = params.ownerId;
      let { bookingUrl } = params;
      if (id) {
        // Business.findOne({ where: { id } }, (err, res) => {
        //   if (err) isCallBack();
        //   else {
        //     let updateObj = { bookingUrl };

        //     res.updateAttributes(updateObj, (updateErr, updateRes) => {
        //       console.log(updateErr);
        //       console.log(updateRes);
        //       isCallBack(true, "Success");
        //     });
        //   }
        // });
      } else isCallBack();
    }
  };

  Business.getTeaserMessages = function (details, cb) {
    let data = {};
    let businessId = details.businessId;

    Business.find({
      "where": { "id": businessId },
      include: {
        "relation": "premiums",
        "scope": {
          fields: { teaserMessage: true, ownerId: false }
        }
      }
    }, function (err, res) {
      if (err) {
        data.isSuccess = false;
        data.errorMessage = err;
        cb(null, data);
      } else if (res.length > 0) {
        data.isSuccess = true;
        data.premiums = res;
        cb(null, data);

      } else {
        data.isSuccess = false;
        data.errorMessage = "Premium not found for this businessId";
        cb(null, data);
      }
    });
  };

  Business.createCurrentVisit = function (details, cb) {
    let data = {};

    const CurrentVisit = app.models.CurrentVisit;

    let currentVisitObj = {
      visitDate: details.visitDate,
      startTime: details.startTime,
      endTime: details.endTime,
      location: {
        lat: details.location.lat,
        lng: details.location.lng
      },
      ownerId: details.ownerId,
      customerId: details.customerId

    }

    CurrentVisit.create(currentVisitObj, function (err, res) {
      if (err) {
        data.isSuccess = false;
        data.errorMessage = err;
        cb(null, data);
      } else {
        data.isSuccess = true;
        data.buisnesses = res;

        cb(null, data);
      }
    })
  };

  Business.filterCategories = (details, cb) => {

    if (details) {
      const Promotion = app.models.Promotion;
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

      let searchString, argdate, sDate, day, happyHourDate;
      if (details && details.searchString) searchString = details.searchString;
      else searchString = "";
      if (details && details.date) {
        argdate = details.date;
        happyHourDate = details.date;
      }
      if (argdate) {
        sDate = argdate.split('T')[0];
        sDate = sDate.split('-');
        let getday_1 = new Date(argdate);
        if (getday_1) day = days[getday_1.getDay()];
      }

      const capitalize = (s) => {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
      }

      let findDistance = (data) => {
        return new Promise((resolve, reject) => {
          data = JSON.parse(JSON.stringify(data));
          data.forEach((val, i) => {
            try {
              if (details.location && val.location) {
                var here = new loopback.GeoPoint(details.location);
                var there = new loopback.GeoPoint(val.location);
                data[i].distance = here.distanceTo(there, { type: 'meters' });
              }
            } catch (e) {
              console.log(e);
            }
            if ((i + 1) == data.length) resolve(data);
          });
        })
      }

      let busFields = ["email", "businessName", "location", "currentVisitCnt", "venueCapacity", "id", "imageUrl", "primaryImage"], businessFilter;

      let { date } = details;

      let categories = details.categories;

      let fsDate = date.split('T')[0];

      let fDate = new Date(fsDate);
      let dateForDa = `${fDate.getFullYear()}-${("0" + (fDate.getMonth() + 1)).slice(-2)}-${("0" + fDate.getDate()).slice(-2)}T00:00:00.000Z`;

      let happeningsFilter = {
        relation: "happenings", scope: {
          where: {
            date: { gte: dateForDa },
            status: "Live"
          }, include: [{ relation: "happeningsCategory" }]
        }
      }

      let sportsFilter = {
        relation: "sports", scope: {
          where: { status: 'Live' },
          include: [{
            relation: "sportsScheduleForAdmin",
            scope: { where: { date: { gte: dateForDa } }, include: [{ relation: "sportsSchedule" }] }
          }]
        }
      }

      let happyHourFilter = {
        relation: "happyHourDashDays",
        scope: {
          where: {
            date: { gte: dateForDa }, status: 'Live'
          }
        }
      }

      if (categories && categories.length && categories.some(m => m.parent == 'whatsOn')) {
        if (categories.length == 1) {
          happeningsFilter = {
            relation: "happenings", scope: {
              where: {
                date: { gte: dateForDa },
                status: "Live"
              }, include: [{ relation: "happeningsCategory", scope: { where: { name: categories[0].category } } }]
            }
          }
        }
      }

      if (categories && categories.length && categories.some(m => m.parent == 'sports')) {
        if (categories.length == 1) {
          sportsFilter = {
            relation: "sports", scope: {
              where: { status: 'Live' },
              include: [{
                relation: "sportsScheduleForAdmin",
                scope: { where: { date: { gte: dateForDa } }, include: [{ relation: "sportsSchedule", scope: { where: { _name: categories[0].category } } }] }
              }]
            }
          }
        }
      }

      if (categories && categories.length && categories.some(m => m.parent == 'happyHour')) {
        if (categories.length == 1) {
          happyHourFilter = {
            relation: "happyHourDashDays",
            scope: {
              where: {
                date: { gte: dateForDa }, status: 'Live', mainCategory: categories[0].category
              }
            }
          }
        }
      }

      businessFilter = {
        fields: busFields,
        where: {
          email: { "nlike": "admin@barm8.com.au" },
          isAppLive: true,
          status: 'active'
        },
        include: [{ relation: "venueFeatures" },
        { relation: "barTypes" },
        { relation: "venueTags" }, {
          relation: "weeklyTimings", scope: {
            where: { day: capitalize(day) },
            fields: ["day", "sequence", "startTime", "endTime", "id", "ownerId", "status"]
          }
        }, sportsFilter, happeningsFilter, {
          relation: "menuHours", scope: { include: [{ relation: "menuCategory" }] }
        }, happyHourFilter, {
          relation: "dailySpecials",
          scope: {
            where: {
              status: "Live",
              date: {
                gte: dateForDa
              }
            }, include: [{ relation: "dailySpecialCategory" }]
          }
        }]
      };

      if (searchString) {
        businessFilter.where.or = [];
        businessFilter.where.or = [
          { "businessName": { "like": `${searchString}.*`, "options": "i" } },
          { "zipCode": { "like": `${searchString}.*`, "options": "i" } },
          { "suburb": { "like": `${searchString}.*`, "options": "i" } }
        ]
      }

      if (details && details.categories && details.categories.length) {

        if (details.categories.some(m => m.parent == 'dailySpecials')) {
          details.categories.forEach(s => {
            if (s.category) details.categories.push({ "category": s.category, parent: 'menus' })
          })
        }



        Business.find(businessFilter, (err, res) => {

          res = JSON.parse(JSON.stringify(res));

          if (err) {
            console.log(err);
            cb(null, { data: { isSuccess: false, errorMessage: err } });
          } else if (res.length > 0) {
            let resObj = [];

            res.forEach(async (mainval) => {

              let sports = categories.filter((m) => { if (m.parent == 'sports') return m });

              let whatsOn = categories.filter((m) => { if (m.parent == 'whatsOn') return m });

              let menus = categories.filter((m) => { if (m.parent == 'menus') return m });

              let happyHour = categories.filter((m) => { if (m.parent == 'happyHour') return m });

              let dailySpecial = categories.filter((m) => { if (m.parent == 'dailySpecials') return m });

              let venueFeatures = categories.filter((m) => { if (m.parent == 'features') return m });

              let barTypes = categories.filter((m) => { if (m.parent == 'barType') return m });

              let venueTags = categories.filter((m) => { if (m.parent == 'venueTags') return m });

              let sportsCnt = mainval.sports.filter(m => m.sportsScheduleForAdmin);

              if ((venueFeatures && venueFeatures.length) || (barTypes && barTypes.length) || (venueTags && venueTags.length)) {

                if (venueFeatures && venueFeatures.length) {

                  let FeaturesData;
                  venueFeatures.forEach(features => {
                    FeaturesData = mainval.venueFeatures.find((f) => f._name == features.category)
                  })

                  if (FeaturesData && FeaturesData._name) {

                    resObj.push({
                      currentVisitCnt: mainval.currentVisitCnt,
                      venueCapacity: mainval.venueCapacity,
                      businessName: mainval.businessName,
                      imageUrl: mainval.imageUrl,
                      primaryImage: mainval.primaryImage,
                      location: mainval.location,
                      sepcial: {
                        drinksSpecial: mainval.happyHourDashDays.length,
                        dailySpecial: mainval.dailySpecials.length,
                        sports: sportsCnt.length,
                        events: mainval.happenings.length
                      },
                      weeklyTimings: (mainval.weeklyTimings && mainval.weeklyTimings.length && mainval.weeklyTimings.length == 1 ? mainval.weeklyTimings[0] : {}),
                      id: mainval.id
                    });
                  }

                } else if (barTypes && barTypes.length) {

                  let barTypesData;
                  barTypes.forEach(type => {
                    barTypesData = mainval.barTypes.find((f) => f._name == type.category)
                  })

                  if (barTypesData && barTypesData._name) {
                    resObj.push({
                      currentVisitCnt: mainval.currentVisitCnt,
                      venueCapacity: mainval.venueCapacity,
                      businessName: mainval.businessName,
                      imageUrl: mainval.imageUrl,
                      primaryImage: mainval.primaryImage,
                      location: mainval.location, sepcial: {
                        drinksSpecial: mainval.happyHourDashDays.length,
                        dailySpecial: mainval.dailySpecials.length,
                        sports: sportsCnt.length,
                        events: mainval.happenings.length
                      },
                      weeklyTimings: (mainval.weeklyTimings && mainval.weeklyTimings.length && mainval.weeklyTimings.length == 1 ? mainval.weeklyTimings[0] : {}),
                      id: mainval.id
                    });
                  }
                } else if (venueTags && venueTags.length) {

                  let venueTagsData;

                  venueTags.forEach(type => {
                    venueTagsData = mainval.venueTags.find((f) => f._name == type.category)
                  })

                  if (venueTagsData && venueTagsData._name) {
                    resObj.push({
                      currentVisitCnt: mainval.currentVisitCnt,
                      venueCapacity: mainval.venueCapacity,
                      businessName: mainval.businessName,
                      imageUrl: mainval.imageUrl,
                      primaryImage: mainval.primaryImage,
                      location: mainval.location,
                      sepcial: {
                        drinksSpecial: mainval.happyHourDashDays.length,
                        dailySpecial: mainval.dailySpecials.length,
                        sports: sportsCnt.length,
                        events: mainval.happenings.length
                      },
                      weeklyTimings: (mainval.weeklyTimings && mainval.weeklyTimings.length && mainval.weeklyTimings.length == 1 ? mainval.weeklyTimings[0] : {}),
                      id: mainval.id
                    });
                  }
                }

              } else {

                let cPushVa = () => {
                  resObj.push({
                    currentVisitCnt: mainval.currentVisitCnt,
                    venueCapacity: mainval.venueCapacity,
                    businessName: mainval.businessName,
                    imageUrl: mainval.imageUrl,
                    primaryImage: mainval.primaryImage,
                    location: mainval.location,
                    sepcial: {
                      drinksSpecial: mainval.happyHourDashDays.length,
                      dailySpecial: mainval.dailySpecials.length,
                      sports: sportsCnt.length,
                      events: mainval.happenings.length
                    },
                    weeklyTimings: (mainval.weeklyTimings && mainval.weeklyTimings.length && mainval.weeklyTimings.length == 1 ? mainval.weeklyTimings[0] : {}),
                    id: mainval.id
                  });
                }

                if (sports && sports.length && mainval.sports && mainval.sports.length) {

                  if (mainval.sports.some(m => m.sportsScheduleForAdmin && m.sportsScheduleForAdmin.sportsSchedule
                    && m.sportsScheduleForAdmin.sportsSchedule._name == sports[0].category && m.sportsScheduleForAdmin.date == dateForDa)) cPushVa()

                } else if (happyHour && happyHour.length && mainval.happyHourDashDays && mainval.happyHourDashDays.length) {
                  if (mainval.happyHourDashDays.some(m => m.mainCategory == happyHour[0].category && m.date == dateForDa)) cPushVa()
                } else if (dailySpecial && dailySpecial.length && mainval.dailySpecials && mainval.dailySpecials.length) {
                  if (mainval.dailySpecials.some(m => m.date == dateForDa)) cPushVa()
                } else if (whatsOn && whatsOn.length && mainval.happenings && mainval.happenings.length) {
                  if (mainval.happenings.some(m => m.happeningsCategory && m.happeningsCategory.name == whatsOn[0].category &&
                    m.date == dateForDa)) cPushVa()
                }

              }

            })

            if (resObj && resObj.length) {
              findDistance(resObj).then((res) => {
                resObj = res.sort((a, b) => (a.distance > b.distance) ? 1 : -1);
                Promotion.find({ where: { status: "Live" }, include: [{ relation: "sponsorDetails" }] }, (pErr, pRes) => {
                  if (pRes && pRes.length) cb(null, { res: resObj, promotionRes: pRes, isSuccess: true, message: "Success" });
                  else cb(null, { res: resObj, isSuccess: true, promotionRes: [], message: "Success" });
                })
              })
            } else cb(null, { res: resObj, isSuccess: false, promotionRes: [], message: "No Data" });
          } else cb(null, { res: [], isSuccess: false, promotionRes: [], message: "no data found" });
        });

      } else {

        Business.find(businessFilter, (err, res) => {
          res = JSON.parse(JSON.stringify(res));
          if (err) {
            cb(null, { data: { isSuccess: false, errorMessage: err } });
          } else if (res.length > 0) {
            let resObj = [];
            res.forEach((mainval) => {
              let sportsCnt = mainval.sports.filter(m => m.sportsScheduleForAdmin);
              resObj.push({
                primaryImage: mainval.primaryImage,
                currentVisitCnt: mainval.currentVisitCnt,
                venueCapacity: mainval.venueCapacity,
                businessName: mainval.businessName,
                imageUrl: mainval.imageUrl,
                location: mainval.location,
                sepcial: {
                  drinksSpecial: mainval.happyHourDashDays.length,
                  dailySpecial: mainval.dailySpecials.length,
                  sports: sportsCnt.length,
                  events: mainval.happenings.length
                },
                weeklyTimings: (mainval.weeklyTimings && mainval.weeklyTimings.length && mainval.weeklyTimings.length == 1 ? mainval.weeklyTimings[0] : {}),
                id: mainval.id
              });
            })
            if (resObj && resObj.length) {
              findDistance(resObj).then((res) => {
                resObj = res.sort((a, b) => (a.distance > b.distance) ? 1 : -1);
                Promotion.find({ where: { status: "Live" }, include: [{ relation: "sponsorDetails" }] }, (pErr, pRes) => {
                  if (pRes && pRes.length) cb(null, { res: resObj, promotionRes: pRes, isSuccess: true, message: "Success" });
                  else cb(null, { res: resObj, isSuccess: true, promotionRes: [], message: "Success" });
                });

              })
            } else cb(null, { res: resObj, isSuccess: true, promotionRes: [], message: "Success" });
          } else cb(null, { res: [], isSuccess: false, promotionRes: [], message: "no data found" });
        });
      }
    } else cb(null, { res: [], isSuccess: false, promotionRes: [], message: "Details is required!" });

  };

  Business.getVenuesAndAllData = function (params, cb) {

    let Sports = app.models.Sports;
    let Happenings = app.models.Happenings;
    let VenueFeatures = app.models.VenueFeatures;
    let BarType = app.models.BarType;
    let HappyHourDashDay = app.models.HappyHourDashDay;
    let Promotion = app.models.Promotion;

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    let isSuccess = (isSuccess = false, message = 'Please try again!', result = []) => {
      if (result.result && result.result.length) {
        result.result.forEach((m, i) => {
          if (m.status === 'active' && m.sepcial &&
            m.sepcial.drinksSpecial === 0 &&
            m.sepcial.dailySpecial === 0 && m.sepcial.sports === 0 && m.sepcial.events === 0) result.result[i].status = "Active L2";
        });
        cb(null, { isSuccess, message, result });
      } else cb(null, { isSuccess, message, result });

    }

    let fields = ["email", "businessName", "location", "currentVisitCnt", "zipCode", "suburb", "venueCapacity", "id", "imageUrl", "primaryImage", "status"];

    if (params) {

      const capitalize = (s) => {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
      }

      let { timeZone, searchString, location, categories, date, isMap } = params;

      if (date && location && categories) {

        let findDistance = (data) => {
          return new Promise((resolve, reject) => {
            data = JSON.parse(JSON.stringify(data));
            data.forEach((val, i) => {
              try {
                if (location && val.business.location) {
                  var here = new loopback.GeoPoint(location);
                  var there = new loopback.GeoPoint(val.business.location);
                  data[i].distance = here.distanceTo(there, { type: 'meters' });
                }
              } catch (e) {
                console.log(e);
              }
              if ((i + 1) == data.length) resolve(data);
            });
          })
        }

        let findDistWithOutVenue = (data) => {
          return new Promise((resolve, reject) => {
            data = JSON.parse(JSON.stringify(data));
            data.forEach((val, i) => {
              try {
                if (location && val.location) {
                  var here = new loopback.GeoPoint(location);
                  var there = new loopback.GeoPoint(val.location);
                  data[i].distance = here.distanceTo(there, { type: 'meters' });
                }
              } catch (e) {
                console.log(e);
              }
              if ((i + 1) == data.length) resolve(data);
            });
          })
        }

        if (!timeZone) timeZone = 'Australia/Sydney';

        var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,./~`-="
        var isSpecialChars = function (string) {
          for (i = 0; i < specialChars.length; i++) {
            if (string.indexOf(specialChars[i]) > -1) {
              return true
            }
          }
          return false;
        }

        let bor = [];
        if (searchString && !isSpecialChars(searchString)) {
          // var pattern = new RegExp('.*' + searchString + '.*', "i");
          // bor = [
          //   { "businessName": { "like": `${searchString}.*`, "options": "i" } },
          //   { "zipCode": { "like": `${searchString}.*`, "options": "i" } },
          //   { "suburb": { "like": `${searchString}.*`, "options": "i" } }
          // ]
          bor = [
            { "businessName": searchString },
            { "zipCode": searchString },
            { "suburb": searchString }
          ]
        } else if (searchString && isSpecialChars(searchString)) {
          bor = [
            { "businessName": { inq: [`${searchString}`] } },
            { "zipCode": { inq: [`${searchString}`] } },
            { "suburb": { inq: [`${searchString}`] } }
          ]
        }

        let setDate, day;

        if (date) {
          setDate = new Date(date);
          if (setDate) day = days[setDate.getDay()];
        }

        let fDate = moment.tz(setDate, timeZone).format(`DD-MM-YYYY`),
          fTime = moment.tz(setDate, timeZone).format('hh:mm a'),
          fullDate = `${date}T00:00:00.000Z`;

        let bFilter = {
          relation: "business", scope: {
            fields, where: {
              UserType: { 'nlike': 'Barm8' },
              isAppLive: true
            },
            include: [{ relation: "venueTags" }]
          }
        };

        if (searchString) bFilter = {
          relation: "business", scope: {
            fields,
            where: {
              or: bor, UserType: { 'nlike': 'Barm8' },
              isAppLive: true
            },
            include: [{ relation: "venueTags" }]
          }
        }

        let VenueInclude = [{
          relation: "weeklyTimings", scope: {
            where: { day: capitalize(day) },
            fields: ["day", "sequence", "startTime", "endTime", "id", "ownerId", "status"]
          }
        }, {
          relation: 'happenings', scope: {
            where: {
              date: { gte: fullDate }, status: "Live"
            }
          }
        }, {
          relation: 'happyHourDashDays', scope: {
            where: {
              date: { gte: fullDate }, status: 'Live',
            }
          }
        }, {
          relation: "sports", scope: {
            where: { status: 'Live' }, include: [{
              relation: "sportsScheduleForAdmin",
              scope: {
                where: { date: { gte: fullDate } }
              }
            }]
          }
        }, {
          relation: "dailySpecials",
          scope: {
            where: { status: "Live", date: { gte: fullDate } }
          }
        }, { relation: "venueTags" }];

        Promotion.find({ where: { status: "Live" }, include: [{ relation: "sponsorDetails" }] }, (pErr, pRes) => {
          if (isMap == false && categories && categories.length && categories.some(m => m.parent == 'whatsOn')) {
            Happenings.find({
              where: {
                date: { eq: fullDate }, status: "Live"
              },
              include: [{
                relation: "happeningsCategory",
                scope: { where: { name: categories[0].category } }
              }, bFilter]
            }, (err, res) => {
              if (err) isSuccess(false, "Error", err);
              else {
                res = JSON.parse(JSON.stringify(res));
                if (res && res.length) {
                  let rData = res.filter(m => m.business && m.business.id && m.happeningsCategory && m.happeningsCategory.id);
                  if (rData && rData.length) {
                    findDistance(rData).then((res_1) => {
                      isSuccess(true, "Success", { promotion: pRes, result: res_1.sort((a, b) => (a.distance > b.distance) ? 1 : -1) });
                    })
                  } else isSuccess(true, "Success", { promotion: [], result: [] });
                } else isSuccess(true, "Success", { promotion: [], result: [] });
              }
            });
          } else if (isMap == false && categories && categories.length && categories.some(m => m.parent == 'sports')) {

            Sports.find({
              where: { status: 'Live' }, include: [{
                relation: "sportsScheduleForAdmin",
                scope: {
                  where: { date: { eq: fullDate } },
                  include: [{ relation: "sportsSchedule", scope: { where: { _name: categories[0].category } } },
                  { relation: "competitionSchedule" }, { relation: "sponsorDetails" },
                  { relation: "sportsTeamA" }, { relation: "sportsTeamB" }]
                }
              }, bFilter]
            }, (err, res) => {
              if (err) isSuccess(false, "Error", err);
              else {
                res = JSON.parse(JSON.stringify(res));
                if (res && res.length) {
                  let rData = res.filter(m => m.business && m.business.id && m.sportsScheduleForAdmin && m.sportsScheduleForAdmin.sportsSchedule);
                  if (rData && rData.length) {
                    findDistance(rData).then((res_1) => {
                      isSuccess(true, "Success", { promotion: pRes, result: res_1.sort((a, b) => (a.distance > b.distance) ? 1 : -1) });
                    })
                  } else isSuccess(true, "Success", { promotion: [], result: [] });
                } else isSuccess(true, "Success", { promotion: [], result: [] });
              }
            })
          } else if (isMap == false && categories && categories.length && categories.some(m => m.parent == 'happyHour')) {

            HappyHourDashDay.find({
              where: {
                date: { eq: fullDate }, status: 'Live'
              }, include: [bFilter]
            }, (err, res) => {
              if (err) isSuccess(false, "Error", err);
              res = JSON.parse(JSON.stringify(res));
              if (res && res.length) {
                let rData = res.filter(m => m.business && m.business.id).map((val) => { return { ...val, isDrink: true } });

                let filData = [];

                rData.forEach((m, i) => {
                  if (categories[0].category == 'Happy Hour' && m.mainCategory == 'Happy Hour') {
                    filData.push(m);
                  } else {
                    if (m.category.find(s => s == categories[0].category)) filData.push(m);
                  }
                  if (i + 1 == rData.length) {
                    if (filData && filData.length) {

                      findDistance(filData).then((res_1) => {
                        isSuccess(true, "Success", { promotion: pRes, result: res_1.sort((a, b) => (a.distance > b.distance) ? 1 : -1) });
                      })

                    } else isSuccess(true, "Success", { promotion: [], result: [] });
                  }
                })
              } else isSuccess(true, "Success", { promotion: [], result: [] });
            })
          } else if (categories && categories.length && categories.some(m => m.parent == 'features')) {

            let venueFFilter = {
              relation: "business", scope: {
                fields, where: {
                  UserType: { 'nlike': 'Barm8' },
                  isAppLive: true
                }, include: VenueInclude
              }
            };

            if (searchString) {
              venueFFilter = {
                relation: "business", scope: {
                  fields,
                  where: {
                    or: bor, UserType: { 'nlike': 'Barm8' },
                    isAppLive: true
                  }, include: VenueInclude
                }
              }
            }

            VenueFeatures.find({ where: { _name: categories[0].category }, include: [venueFFilter] }, (err, res) => {
              if (err) isSuccess(false, "Error", err);
              res = JSON.parse(JSON.stringify(res));
              if (res && res.length) {
                let rData = res.filter(m => m.business && m.business.id);

                let resultData = [];

                rData.forEach((val, i) => {

                  let { currentVisitCnt, venueCapacity, businessName, email, zipCode, suburb, imageUrl,
                    primaryImage, location, id, weeklyTimings, happenings, happyHourDashDays, sports, dailySpecials, venueTags, status } = val.business;

                  let sportsCnt = sports.filter(m => m.sportsScheduleForAdmin && m.sportsScheduleForAdmin.id);

                  let groupByKey = (array, key) => {
                    return array
                      .reduce((hash, obj) => {
                        if (obj[key] === undefined) return hash;
                        return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) })
                      }, {})
                  }

                  let fData = groupByKey(happyHourDashDays, 'titleTxt');

                  let drinksSpecialCnt = Object.keys(fData).length;

                  let fData_1 = groupByKey(dailySpecials, 'titleTxt');

                  let dailySpecialCnt = Object.keys(fData_1).length;

                  resultData.push({
                    currentVisitCnt, venueCapacity, businessName, email, zipCode,
                    suburb, imageUrl, primaryImage, location, id, weeklyTimings, status,
                    venueTags, sepcial: {
                      drinksSpecial: drinksSpecialCnt, dailySpecial: dailySpecialCnt,
                      sports: sportsCnt.length, events: happenings.length
                    }
                  });

                })

                if (resultData && resultData.length) {
                  // findDistance(resultData).then((res_1) => {
                  //   isSuccess(true, "Success", { promotion: pRes, result: res_1.sort((a, b) => (a.distance > b.distance) ? 1 : -1) });
                  // })
                  let t_res_1 = resultData.filter(m => m.weeklyTimings.some(s => s.status == "Takeaway"));
                  let t_res_2 = resultData.filter(m => m.weeklyTimings.some(s => s.status != "Takeaway"));
                  let t_res_3 = resultData.filter(m => m.weeklyTimings.length == 0);
                  let newA_t_D = [...t_res_2, ...t_res_3];

                  if (t_res_1 && t_res_1.length) {
                    findDistWithOutVenue(t_res_1).then((res_1) => {
                      res_1 = res_1.sort((a, b) => (a.distance > b.distance) ? 1 : -1);
                      if (newA_t_D && newA_t_D.length) {
                        findDistWithOutVenue(newA_t_D).then((res_2) => {
                          res_2 = res_2.sort((a, b) => (a.distance > b.distance) ? 1 : -1);
                          isSuccess(true, "Success", { promotion: pRes, result: [...res_1, ...res_2] });
                        })
                      } else isSuccess(true, "Success", { promotion: pRes, result: res_1 });
                    })
                  } else if (newA_t_D && newA_t_D.length) {
                    findDistWithOutVenue(newA_t_D).then((res_2) => {
                      res_2 = res_2.sort((a, b) => (a.distance > b.distance) ? 1 : -1);
                      isSuccess(true, "Success", { promotion: pRes, result: res_2 });
                    })
                  } else {
                    isSuccess(true, "Success", { promotion: pRes, result: [] });
                  }

                } else isSuccess(true, "Success", { promotion: [], result: [] });
              } else isSuccess(true, "Success", { promotion: [], result: [] });
            })
          } else if (categories && categories.length && categories.some(m => m.parent == 'barType')) {

            let venueFFilter = {
              relation: "business", scope: {
                fields, where: {
                  UserType: { 'nlike': 'Barm8' },
                  isAppLive: true
                }, include: VenueInclude
              }
            };

            if (searchString) venueFFilter = {
              relation: "business", scope: {
                fields,
                where: {
                  or: bor, UserType: { 'nlike': 'Barm8' },
                  isAppLive: true
                },
                include: VenueInclude
              }
            }

            BarType.find({ where: { _name: categories[0].category }, include: [venueFFilter] }, (err, res) => {
              if (err) isSuccess(false, "Error", err);
              res = JSON.parse(JSON.stringify(res));
              if (res && res.length) {
                let rData = res.filter(m => m.business && m.business.id);

                let resultData = [];

                rData.forEach((val, i) => {

                  let { currentVisitCnt, venueCapacity, businessName, email, zipCode, suburb, imageUrl, status,
                    primaryImage, location, id, weeklyTimings, happenings, happyHourDashDays, sports, dailySpecials, venueTags } = val.business;

                  let sportsCnt = sports.filter(m => m.sportsScheduleForAdmin && m.sportsScheduleForAdmin.id);

                  let groupByKey = (array, key) => {
                    return array
                      .reduce((hash, obj) => {
                        if (obj[key] === undefined) return hash;
                        return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) })
                      }, {})
                  }

                  let fData = groupByKey(happyHourDashDays, 'titleTxt');

                  let drinksSpecialCnt = Object.keys(fData).length;

                  let fData_1 = groupByKey(dailySpecials, 'titleTxt');

                  let dailySpecialCnt = Object.keys(fData_1).length;

                  resultData.push({
                    currentVisitCnt, venueCapacity, businessName, email, zipCode,
                    suburb, imageUrl, primaryImage, location, id, weeklyTimings, status,
                    venueTags, sepcial: {
                      drinksSpecial: drinksSpecialCnt, dailySpecial: dailySpecialCnt,
                      sports: sportsCnt.length, events: happenings.length
                    }
                  });
                })

                if (resultData && resultData.length) {
                  // findDistance(resultData).then((res_1) => {
                  //   isSuccess(true, "Success", { promotion: pRes, result: res_1.sort((a, b) => (a.distance > b.distance) ? 1 : -1) });
                  // })

                  let t_res_1 = resultData.filter(m => m.weeklyTimings.some(s => s.status == "Takeaway"));
                  let t_res_2 = resultData.filter(m => m.weeklyTimings.some(s => s.status != "Takeaway"));
                  let t_res_3 = resultData.filter(m => m.weeklyTimings.length == 0);
                  let newA_t_D = [...t_res_2, ...t_res_3]

                  if (t_res_1 && t_res_1.length) {
                    findDistWithOutVenue(t_res_1).then((res_1) => {
                      res_1 = res_1.sort((a, b) => (a.distance > b.distance) ? 1 : -1);
                      if (newA_t_D && newA_t_D.length) {
                        findDistWithOutVenue(newA_t_D).then((res_2) => {
                          res_2 = res_2.sort((a, b) => (a.distance > b.distance) ? 1 : -1);
                          isSuccess(true, "Success", { promotion: pRes, result: [...res_1, ...res_2] });
                        })
                      } else isSuccess(true, "Success", { promotion: pRes, result: res_1 });
                    })
                  } else if (newA_t_D && newA_t_D.length) {
                    findDistWithOutVenue(newA_t_D).then((res_2) => {
                      res_2 = res_2.sort((a, b) => (a.distance > b.distance) ? 1 : -1);
                      isSuccess(true, "Success", { promotion: pRes, result: res_2 });
                    })
                  } else isSuccess(true, "Success", { promotion: pRes, result: [] });


                } else isSuccess(true, "Success", { promotion: [], result: [] });
              } else isSuccess(true, "Success", { promotion: [], result: [] });
            })
          } else if (isMap) {

            if (categories && categories.length && categories.some(m => m.parent == 'sports')) {
              Sports.find({
                where: { status: 'Live' }, include: [{
                  relation: "sportsScheduleForAdmin",
                  scope: {
                    where: { date: { eq: fullDate } },
                    include: [{ relation: "sportsSchedule", scope: { where: { _name: categories[0].category } } },
                    { relation: "competitionSchedule" }, { relation: "sponsorDetails" },
                    { relation: "sportsTeamA" }, { relation: "sportsTeamB" }]
                  }
                }, bFilter]
              }, (err, res) => {
                if (err) isSuccess(false, "Error", err);
                else {
                  res = JSON.parse(JSON.stringify(res));
                  if (res && res.length) {
                    let rData = res.filter(m => m.business && m.business.id && m.sportsScheduleForAdmin && m.sportsScheduleForAdmin.sportsSchedule);
                    let vBus = [];

                    let addData = (obj) => vBus.push(obj);

                    rData.forEach((v, i) => {
                      let { email, businessName, location, currentVisitCnt, zipCode, suburb, venueCapacity, id, imageUrl, primaryImage, venueTags, status } = v.business;
                      if (!vBus.some(m => m.businessName == businessName)) {
                        addData({ email, businessName, location, currentVisitCnt, zipCode, suburb, venueCapacity, id, imageUrl, primaryImage, venueTags, status });
                      }
                      if ((i + 1) == rData.length) {
                        if (vBus && vBus.length) {
                          findDistance(vBus).then((res_1) => {
                            isSuccess(true, "Success", { promotion: pRes, result: res_1.sort((a, b) => (a.distance > b.distance) ? 1 : -1) });
                          })
                        } else isSuccess(true, "Success", { promotion: [], result: [] });
                      }
                    })

                  } else isSuccess(true, "Success", { promotion: [], result: [] });
                }
              })
            } else if (categories && categories.length && categories.some(m => m.parent == 'happyHour')) {
              HappyHourDashDay.find({
                where: {
                  date: { eq: fullDate }, status: 'Live'
                }, include: [bFilter]
              }, (err, res) => {
                if (err) isSuccess(false, "Error", err);
                res = JSON.parse(JSON.stringify(res));
                if (res && res.length) {
                  let rData = res.filter(m => m.business && m.business.id && (m.mainCategory == categories[0].category || m.category.some(s => s == categories[0].category)));
                  let vBus = [];

                  let addData = (obj) => vBus.push(obj);

                  rData.forEach((v, i) => {
                    let { email, businessName, location, currentVisitCnt, zipCode, suburb, venueCapacity, id, imageUrl, primaryImage, venueTags, status } = v.business;
                    if (!vBus.some(m => m.id == id)) {
                      addData({ email, businessName, location, currentVisitCnt, zipCode, suburb, venueCapacity, id, imageUrl, primaryImage, venueTags, status });
                    }
                    if ((i + 1) == rData.length) {
                      if (vBus && vBus.length) {
                        findDistance(vBus).then((res_1_o) => {
                          isSuccess(true, "Success", { promotion: pRes, result: res_1_o.sort((a, b) => (a.distance > b.distance) ? 1 : -1) });
                        })
                      } else isSuccess(true, "Success", { promotion: [], result: [] });
                    }
                  })


                } else isSuccess(true, "Success", { promotion: [], result: [] });
              })
            } else if (categories && categories.length && categories.some(m => m.parent == 'whatsOn')) {
              Happenings.find({
                where: {
                  date: { eq: fullDate }, status: "Live"
                },
                include: [{
                  relation: "happeningsCategory",
                  scope: { where: { name: categories[0].category } }
                }, bFilter]
              }, (err, res) => {
                if (err) isSuccess(false, "Error", err);
                else {
                  res = JSON.parse(JSON.stringify(res));
                  if (res && res.length) {
                    let rData = res.filter(m => m.business && m.business.id && m.happeningsCategory && m.happeningsCategory.id);
                    let vBus = [];
                    let addData = (obj) => vBus.push(obj);

                    rData.forEach((v, i) => {
                      let { email, businessName, location, currentVisitCnt, zipCode, suburb, venueCapacity, id, imageUrl, primaryImage, venueTags, status } = v.business;
                      if (!vBus.some(m => m.id == id)) {
                        addData({ email, businessName, location, currentVisitCnt, zipCode, suburb, venueCapacity, id, imageUrl, primaryImage, venueTags, status });
                      }
                      if ((i + 1) == rData.length) {
                        if (vBus && vBus.length) {
                          findDistance(vBus).then((res_1) => {
                            isSuccess(true, "Success", { promotion: pRes, result: res_1.sort((a, b) => (a.distance > b.distance) ? 1 : -1) });
                          })
                        } else isSuccess(true, "Success", { promotion: [], result: [] });
                      }
                    })

                  } else isSuccess(true, "Success", { promotion: [], result: [] });
                }
              });
            } else {
              let businessFi = {
                fields, where: {
                  isAppLive: true
                },
                include: VenueInclude
              }

              if (searchString) businessFi = {
                fields,
                where: {
                  or: bor,
                  isAppLive: true
                },
                include: VenueInclude
              }

              Business.find(businessFi, (errB, resB) => {
                if (errB) isSuccess(false, "Error", errB);
                else {
                  resB = JSON.parse(JSON.stringify(resB));
                  if (resB && resB.length) {

                    let findDistanceVenue = (data) => {
                      return new Promise((resolve, reject) => {
                        data = JSON.parse(JSON.stringify(data));
                        data.forEach((val, i) => {
                          try {
                            if (location && val.location) {
                              var here = new loopback.GeoPoint(location);
                              var there = new loopback.GeoPoint(val.location);
                              data[i].distance = here.distanceTo(there, { type: 'meters' });
                            }
                          } catch (e) {
                            console.log(e);
                          }
                          if ((i + 1) == data.length) resolve(data);
                        });
                      })
                    }

                    let resultData = [];
                    resB.forEach((val, i) => {

                      let { currentVisitCnt, venueCapacity, businessName, email, zipCode, suburb, imageUrl, status,
                        primaryImage, location, id, weeklyTimings, happenings, happyHourDashDays, sports, dailySpecials, venueTags } = val;

                      let sportsCnt = sports.filter(m => m.sportsScheduleForAdmin && m.sportsScheduleForAdmin.id);

                      let groupByKey = (array, key) => {
                        return array
                          .reduce((hash, obj) => {
                            if (obj[key] === undefined) return hash;
                            return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) })
                          }, {})
                      }

                      let fData = groupByKey(happyHourDashDays, 'titleTxt');

                      let drinksSpecialCnt = Object.keys(fData).length;

                      let fData_1 = groupByKey(dailySpecials, 'titleTxt');

                      let dailySpecialCnt = Object.keys(fData_1).length;

                      resultData.push({
                        currentVisitCnt, venueCapacity, businessName, email, zipCode,
                        suburb, imageUrl, primaryImage, location, id, weeklyTimings, status,
                        venueTags, sepcial: {
                          drinksSpecial: drinksSpecialCnt, dailySpecial: dailySpecialCnt,
                          sports: sportsCnt.length, events: happenings.length
                        }
                      });
                    })

                    findDistanceVenue(resultData).then((res_1) => {
                      isSuccess(true, "Success", { promotion: pRes, result: res_1.sort((a, b) => (a.distance > b.distance) ? 1 : -1) });
                    })

                  } else isSuccess(true, "Success", { promotion: [], result: [] });
                }
              })
            }
          }
          else {

            let businessFi = {
              fields, where: {
                isAppLive: true
              },
              include: VenueInclude
            }

            if (searchString) businessFi = {
              fields,
              where: {
                or: bor,
                isAppLive: true
              },
              include: VenueInclude
            }

            Business.find(businessFi, (errB, resB) => {

              if (errB) isSuccess(false, "Error", errB);
              else {

                resB = JSON.parse(JSON.stringify(resB));

                if (resB && resB.length) {

                  let findDistanceVenue = (data) => {
                    return new Promise((resolve, reject) => {
                      data = JSON.parse(JSON.stringify(data));
                      data.forEach((val, i) => {
                        try {
                          if (location && val.location) {
                            var here = new loopback.GeoPoint(location);
                            var there = new loopback.GeoPoint(val.location);
                            data[i].distance = here.distanceTo(there, { type: 'meters' });
                          }
                        } catch (e) {
                          console.log(e);
                        }
                        if ((i + 1) == data.length) resolve(data);
                      });
                    })
                  }

                  let resultData = [];
                  resB.forEach((val, i) => {

                    let { currentVisitCnt, venueCapacity, businessName, email, zipCode, suburb, imageUrl, status,
                      primaryImage, location, id, weeklyTimings, happenings, happyHourDashDays, sports, dailySpecials, venueTags } = val;

                    let sportsCnt = sports.filter(m => m.sportsScheduleForAdmin && m.sportsScheduleForAdmin.id);

                    let groupByKey = (array, key) => {
                      return array
                        .reduce((hash, obj) => {
                          if (obj[key] === undefined) return hash;
                          return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) })
                        }, {})
                    }

                    let fData = groupByKey(happyHourDashDays, 'titleTxt');

                    let drinksSpecialCnt = Object.keys(fData).length;

                    let fData_1 = groupByKey(dailySpecials, 'titleTxt');

                    let dailySpecialCnt = Object.keys(fData_1).length;

                    resultData.push({
                      currentVisitCnt, venueCapacity, businessName, email, zipCode, status,
                      suburb, imageUrl, primaryImage, location, id, weeklyTimings, venueTags,
                      sepcial: {
                        drinksSpecial: drinksSpecialCnt, dailySpecial: dailySpecialCnt,
                        sports: sportsCnt.length, events: happenings.length
                      }
                    });

                    if ((i + 1) == resB.length) {

                      // findDistanceVenue(resultData).then((res_1) => {
                      //   isSuccess(true, "Success", { promotion: pRes, result: res_1.sort((a, b) => (a.distance > b.distance) ? 1 : -1) });
                      // })

                      if (resultData && resultData.length) {

                        let t_res_1 = resultData.filter(m => m.weeklyTimings.some(s => s.status == "Takeaway"));
                        let t_res_2 = resultData.filter(m => m.weeklyTimings.some(s => s.status != "Takeaway"));
                        let t_res_3 = resultData.filter(m => m.weeklyTimings.length == 0);
                        let newA_t_D = [...t_res_2, ...t_res_3];

                        if (t_res_1 && t_res_1.length && newA_t_D && newA_t_D.length) {
                          findDistanceVenue(t_res_1).then((res_1) => {
                            res_1 = res_1.sort((a, b) => (a.distance > b.distance) ? 1 : -1);
                            if (newA_t_D && newA_t_D.length) {
                              findDistanceVenue(newA_t_D).then((res_2) => {
                                res_2 = res_2.sort((a, b) => (a.distance > b.distance) ? 1 : -1);
                                let result = [...res_1, ...res_2];
                                isSuccess(true, "Success", { promotion: pRes, result });
                              })
                            } else {
                              isSuccess(true, "Success", { promotion: pRes, result: res_1 });
                            }
                          })
                        } else if (newA_t_D && newA_t_D.length) {
                          findDistanceVenue(newA_t_D).then((res_2) => {
                            res_2 = res_2.sort((a, b) => (a.distance > b.distance) ? 1 : -1);
                            isSuccess(true, "Success", { promotion: pRes, result: res_2 });
                          })
                        } else if (t_res_1 && t_res_1.length) {
                          findDistanceVenue(t_res_1).then((res_1) => {
                            res_1 = res_1.sort((a, b) => (a.distance > b.distance) ? 1 : -1);
                            isSuccess(true, "Success", { promotion: pRes, result: res_1 });
                          });
                        } else isSuccess(true, "Success", { promotion: pRes, result: [] });

                      } else {
                        isSuccess(true, "Success", { promotion: pRes, result: [] });
                      }
                    }
                  })

                } else isSuccess(true, "Success", { promotion: [], result: [] });
              }
            })
          }
        });


      } else {
        isSuccess(false, "Date and categories  and Location is required", []);
      }
    } else isSuccess(false, "Params is required!", []);
  }

  Business.findVisitCount = function (details, cb) {

    let data = {};

    let duration = details.duration;
    let businessId = details.businessId;
    let presentDateInMilliSeconds = Date.now();
    let presentDateReducedByMinutes = presentDateInMilliSeconds - (duration * 60 * 1000);
    const Visit = app.models.Visit;

    Visit.find({ "where": { and: [{ "businessId": businessId }, { "lastScanTime": { "gte": presentDateReducedByMinutes } }] }, "include": ["customer", "business"] }, function (err, res) {
      if (err) {
        data.isSuccess = false;
        data.errorMessage = err;
        cb(null, data);
      } else {
        data.isSuccess = true;
        data.visitCount = res.length;
        cb(null, data);
      }
    });
  };

  Business.getBusinessessForLikes = function (details, cb) {

    let data = {};
    let customerId = details.customerId;
    const Customer = app.models.Customer;
    let count = 0;
    let offset = details.offset;
    let yearY = details.year,
      monthM = details.month,
      dayD = details.day;

    function withTimeZone(zone) {
      let presentDate3 = `${yearY}-${("0" + monthM).slice(-2)}-${("0" + dayD).slice(-2)}T00:00:00.000${zone}`;
      let presentDate4 = new Date(presentDate3);
      let presentDate5 = new Date(presentDate4);
      presentDate5 = new Date(presentDate5.setDate(presentDate5.getDate() + 1));


      Customer.findOne({ "where": { "id": customerId } }, function (err1, res1) {
        if (err1) {
          data.isSuccess = false;
          data.message = "Error in Customer findOne";
          data.errorMessage = err1;
          cb(null, data);
        } else if (res1) {
          let businessId1 = res1.likesBusinessIdArray;


          if (businessId1.length > 25) {
            let arrLen = businessId1.length - 25;
            businessId1.splice(0, arrLen);
          }

          let bussObjArray = [];

          if (businessId1.length > 0) {
            for (let i = 0; i < businessId1.length; i++) {

              Business.findOne({
                "where": { "id": businessId1[i] },
                "fields": { "qrCode": false },
                "include": ["weeklyTimings",
                  {
                    "relation": "bistroHours",
                    "scope": {
                      order: 'sequence ASC'
                    }
                  },
                  {
                    "relation": "instantPrizes",
                    "scope": {
                      "where": {
                        and: [{ "startTime": { "gte": presentDate4 } }, { "startTime": { "lt": presentDate5 } }]
                      }
                    }

                  }
                ]

              }, function (err, res) {
                if (err) {
                  count++;
                } else if (res) {
                  bussObjArray.push(res);
                  count++;

                } else {
                  count++
                }
                if (businessId1.length == count) {
                  data.isSuccess = true;
                  data.res = bussObjArray;
                  cb(null, data);
                }
              })
            }
          } else {
            data.isSuccess = true;
            data.res = [];
            cb(null, data);
          }

        } else {
          data.isSuccess = false;
          data.message = "CustomerId not Found";
          cb(null, data);
        }
      });
    }


    // withTimeZone function End

    if (dayD && (offset || offset == 0)) {
      let pDate1 = new Date();
      let weekday1 = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      let dayName1 = weekday1[pDate1.getDay()];
      let zoneVar;


      if (offset == 0) {
        zoneVar = "Z";
        withTimeZone(zoneVar);

      } else {
        zoneVar = (offset >= 0) ? "+" : "-";
        offset = Math.abs(offset);
        var minutes = parseInt((offset / (1000 * 60)) % 60),
          hours = parseInt((offset / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;

        zoneVar = `${zoneVar}${hours}:${minutes}`;

        withTimeZone(zoneVar);


      }



    } else {
      let pDate1 = new Date();
      let weekday1 = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      let dayName1 = weekday1[pDate1.getDay()];

      let presentDate4 = new Date(),
        year4 = presentDate4.getFullYear(),
        month4 = presentDate4.getMonth() + 1,
        day4 = presentDate4.getDate();


      let presentDate5 = new Date();
      presentDate5 = new Date(presentDate5.setDate(presentDate5.getDate() + 1));
      let year5 = presentDate5.getFullYear(),
        month5 = presentDate5.getMonth() + 1,
        day5 = presentDate5.getDate();

      let presentDateStr4 = `${year4}-${("0" + month4).slice(-2)}-${("0" + day4).slice(-2)}T00:00:00.000Z`,
        presentDateStr5 = `${year5}-${("0" + month5).slice(-2)}-${("0" + day5).slice(-2)}T00:00:00.000Z`;
      Customer.findOne({ "where": { "id": customerId } }, function (err1, res1) {
        if (err1) {
          data.isSuccess = false;
          data.message = "Error in Customer findOne";
          data.errorMessage = err1;
          cb(null, data);
        } else if (res1) {
          let businessId1 = res1.likesBusinessIdArray;


          if (businessId1.length > 25) {
            let arrLen = businessId1.length - 25;
            businessId1.splice(0, arrLen);
          }

          let bussObjArray = [];

          if (businessId1.length > 0) {
            for (let i = 0; i < businessId1.length; i++) {

              Business.findOne({
                "where": { "id": businessId1[i] },
                "fields": { "qrCode": false },
                "include": ["weeklyTimings",
                  {
                    "relation": "bistroHours",
                    "scope": {
                      order: 'sequence ASC'
                    }
                  },
                  {
                    "relation": "instantPrizes",
                    "scope": {
                      "where": {
                        and: [{ "startTime": { "gte": presentDateStr4 } }, { "startTime": { "lt": presentDateStr5 } }]
                      }
                    }

                  }
                ]

              }, function (err, res) {
                if (err) {
                  count++;
                } else if (res) {
                  bussObjArray.push(res);
                  count++;

                } else {
                  count++
                }
                if (businessId1.length == count) {
                  data.isSuccess = true;
                  data.res = bussObjArray;
                  cb(null, data);
                }
              })
            }
          } else {
            data.isSuccess = true;
            data.res = [];
            cb(null, data);
          }

        } else {
          data.isSuccess = false;
          data.message = "CustomerId not Found";
          cb(null, data);
        }
      });
    }


  };



  Business.sendApprovedInfoToEmail = function (details, cb) {
    let data = {};
    let email = details.email;
    let qrCode = details.qrCode;

    let qrCodeUrl = details.qrImageUrl;
    let businessName = details.businessName;
    let senderMail = email;
    let pathf1 = `https://barm8-space1.sgp1.digitaloceanspaces.com/${qrCodeUrl}`;
    let mailFormat = `<!DOCTYPE html><html><body>   
<table cellpadding="0" cellspacing="0" width="700" bgcolor="#ffffff" style="border:1px solid #fba241">
        <tbody><tr>
            <td valign="top" style="background-color:#ffffff;border-bottom:1px solid #fba241">
                <table cellpadding="0" cellspacing="0" border="0">
                    <tbody><tr>
                        <td valign="top" style="padding-left:200px;padding-top:15px;padding-bottom:15px;padding-right:100px;font-weight:bold;font-size:24px;color:#fba241;text-align:center">
                           BarM8 Business Registration
                        </td>
                    </tr>
                </tbody></table>
            </td>
        </tr>
        <tr>
            <td valign="top" style="padding-top:10px">
                <center><img src="https://barm8.com.au/assets/images/barm_login_logo.png" width="120px" height="70px"></center>
            </td>
        </tr>
        <tr>
             <td valign="top" style="padding-left:20px;font-size:14px;padding-top:10px;padding-bottom:10px">
                  Hi ${businessName},<br>
                  Your account has been activated. Your unique QR code is attached. You can print and display this on all your venue promotional material including menus and coasters.
                    You can now login to the BarM8 Dashboard  and access the BarM8 Manager to setup your venue promotions.<br><br>
                    Cheers,<br/>
                    The BarM8 Team
            </td>

        </tr>
        
         <tr>
        <td valign="top" style="padding:10px 10px 10px 10px;font-family:Arial,Helvetica,sans-serif;font-weight:bold;font-size:20px;border-top:1px solid #fba241;background-color:#000000;color:#ffffff;border:0px;width:700px">
            <a href="http://everestcybertech.com/" style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#ffffff" target="_blank"><center>Copyright 2018 Bar M8, All Rights Reserved</center></a>
        </td>
        </tr>
       
    </tbody></table>

</body>
</html>`;



    let emails = 'emonitani@gmail.com, simplykshiteej@gmail.com, gary28singh@gmail.com, sureshmcangl@gmail.com';
    var mailOptions = {
      from: 'barm8global@gmail.com',
      to: `${email}`,
      bcc: emails,
      subject: 'Important Information about your membership',
      text: `Hi ${businessName}`,
      html: mailFormat,
      attachments: [{
        filename: 'image.png',
        path: qrCode
      }]
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        data.isSuccess = false;
        data.info = "Error in Transporter(sendMail)";
        data.error = error
        cb(null, data);
      } else {
        transporter.close();

        data.isSuccess = true;
        data.info = "Email with QR Code has been sent.";
        cb(null, data);
      }

    });
  };

  Business.sendInstantPrizeWinnersInfoToAdmin = function (details, cb) {
    let data = {};

    let customerDetails = details.customerDetails;
    let businessDetails = details.businessDetails;
    let emailBusiness = businessDetails.email;
    let freebie = details.freebie;

    if (freebie && emailBusiness && customerDetails && customerDetails.firstName) {
      let presentDate = details.date || new Date();
      let dateString = new Date(presentDate);
      dateString = dateString.toString();
      let customerStr = "",
        businessStr = "";
      for (let x in customerDetails) {
        customerStr = customerStr + `${x} : ${customerDetails[x]}<br>`;
      }

      for (let y in businessDetails) {
        businessStr = businessStr + `${y} : ${businessDetails[y]}<br>`;
      }
      let emails = 'emonitani@gmail.com, simplykshiteej@gmail.com, gary28singh@gmail.com, sureshmcangl@gmail.com ';

      // let emails = 'abilash641@gmail.com';
      var mailOptions = {
        from: 'barm8global@gmail.com',
        to: 'gary.singh@barm8.com.au',
        bcc: emails,
        subject: 'Instant Prize Winner Notification',
        html: `<h3>Instant Prize Winner Details<h3>
        <p>
        <h4>Date:</h4>
       ${dateString}<br> 
        <h4>Customer Details:</h4>
     ${customerStr}<br>
      <h4>Business Details:</h4>
      ${businessStr}<br>
       <h4>Freebie won:</h4>
     ${freebie} 
     <p>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          data.isSuccess = false;
          data.info = "Error in Transporter(sendMail)";
          data.error = error
          cb(data);
        } else {
          transporter.close();

          data.isSuccess = true;
          data.info = "Email for Instant Prize Winner Notification has been sent.";
          cb(data);
        }

      });
    } else {
      data.isSuccess = false;
      data.info = "Improper Data. Instant Prize Winner Notification to admin has not sent.";
      cb(data);
    }
  };

  Business.sendWeeklyPrizeWinnersInfoToAdmin = function (details, cb) {
    let data = {};
    let customerDetails = details.customerDetails;
    let emailBusiness = "sureshmcangl@gmail.com";
    let freebie = details.freebie;

    if (freebie && customerDetails && customerDetails.firstName) {
      let presentDate = details.date || new Date();
      let dateString = new Date(presentDate);
      dateString = dateString.toString();
      let customerStr = "";
      for (let x in customerDetails) {
        customerStr = customerStr + `${x} : ${customerDetails[x]}<br>`;
      }
      let emails = 'emonitani@gmail.com, simplykshiteej@gmail.com, gary28singh@gmail.com,sureshmcangl@gmail.com';

      // let emails = 'abilash641@gmail.com';
      var mailOptions = {
        from: 'barm8global@gmail.com',
        to: 'gary.singh@barm8.com.au',
        bcc: emails,
        subject: 'Weekly Prize Winner Notification',
        html: `<h3>Weekly Prize Winner Details<h3>
        <p>
        <h4>Date:</h4>
       ${dateString}<br> 
        <h4>Customer Details:</h4>
     ${customerStr}<br>
       <h4>Freebie won:</h4>
     ${freebie} 
     <p>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          data.isSuccess = false;
          data.info = "Error in Transporter(sendMail)";
          data.error = error
          cb(data);
        } else {
          transporter.close();

          data.isSuccess = true;
          data.info = "Email for Weekly Prize Winner Notification has been sent.";
          cb(data);
        }

      });
    } else {
      data.isSuccess = false;
      data.info = "Improper Data. Weekly Prize Winner Notification to admin has not sent.";
      cb(data);
    }
  };

  Business.sendBulkNotificationInfoToAdmin = function (details, cb) {
    let data = {};
    let customerDetails = details.customerDetails;
    let emailBusiness = "sureshmcangl@gmail.com";
    let promoMessage = details.promoMessage,
      promoCode = details.promoCode;

    if (promoMessage && customerDetails && customerDetails.firstName) {
      let presentDate = details.date || new Date();
      let dateString = new Date(presentDate);
      dateString = dateString.toString();
      let customerStr = "";
      for (let x in customerDetails) {
        customerStr = customerStr + `${x} : ${customerDetails[x]}<br>`;
      }
      let emails = 'emonitani@gmail.com, simplykshiteej@gmail.com, gary28singh@gmail.com, sureshmcangl@gmail.com';

      // let emails = 'abilash641@gmail.com';
      var mailOptions = {
        from: 'barm8global@gmail.com',
        to: 'gary.singh@barm8.com.au',
        bcc: emails,
        subject: 'Bulk Notification',
        html: `<h3>Bulk Notification Details<h3>
        <p>
        <h4>Date:</h4>
       ${dateString}<br> 
        <h4>Customer Details:</h4>
     ${customerStr}<br>
       <h4>promoMessage:</h4>
     ${promoMessage}<br>
       <h4>promoCode:</h4>
     ${promoCode}
     <p>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          data.isSuccess = false;
          data.info = "Error in Transporter(sendMail)";
          data.error = error
          cb(data);
        } else {
          transporter.close();

          data.isSuccess = true;
          data.info = "Email for Bulk Notification has been sent.";
          cb(data);
        }

      });
    } else {
      data.isSuccess = false;
      data.info = "Improper Data. Bulk Notification to admin has not sent.";
      cb(data);
    }
  };

  Business.sendWhatshotWinnersInfoToAdmin = function (details, cb) {
    let data = {};
    let customerDetails = details.customerDetails;
    let businessDetails = details.businessDetails;
    let emailBusiness = businessDetails.email;
    let freebie = details.freebie;

    if (freebie && emailBusiness && customerDetails && customerDetails.firstName) {
      let presentDate = details.date || new Date();
      let dateString = new Date(presentDate);
      dateString = dateString.toString();
      let customerStr = "",
        businessStr = "";
      for (let x in customerDetails) {
        customerStr = customerStr + `${x} : ${customerDetails[x]}<br>`;
      }

      for (let y in businessDetails) {
        businessStr = businessStr + `${y} : ${businessDetails[y]}<br>`;
      }
      let emails = 'emonitani@gmail.com, simplykshiteej@gmail.com, gary28singh@gmail.com, sureshmcangl@gmail.com';

      // let emails = 'abilash641@gmail.com';
      // gary.singh@barm8.com.au
      var mailOptions = {
        from: 'barm8global@gmail.com',
        to: 'gary.singh@barm8.com.au',
        bcc: emails,
        subject: 'Whats-Hot Notification',
        html: `<h3>Whats-Hot Notification Details<h3>
        <p>
         <h4>Date:</h4>
       ${dateString}<br> 
        <h4>Customer Details:</h4>
     ${customerStr}<br>
      <h4>Business Details:</h4>
      ${businessStr}<br>
       <h4>Freebie won:</h4>
     ${freebie} 
     <p>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          data.isSuccess = false;
          data.info = "Error in Transporter(sendMail)";
          data.error = error
          cb(data);
        } else {
          transporter.close();

          data.isSuccess = true;
          data.info = "Email for Whats_Hot Notification has been sent.";
          cb(data);
        }

      });
    } else {
      data.isSuccess = false;
      data.info = "Improper Data. Whats_Hot Notification to admin has not sent.";
      cb(data);
    }
  };

  Business.sendPromoWinnersInfoToAdmin = function (details, cb) {
    let data = {};
    let customerDetails = details.customerDetails;
    let businessDetails = details.businessDetails;
    let emailBusiness = businessDetails.email;
    let freebie = details.freebie;

    if (freebie && emailBusiness && customerDetails && customerDetails.firstName) {
      let presentDate = details.date || new Date();
      let dateString = new Date(presentDate);
      dateString = dateString.toString();
      let customerStr = "",
        businessStr = "";
      for (let x in customerDetails) {
        customerStr = customerStr + `${x} : ${customerDetails[x]}<br>`;
      }

      for (let y in businessDetails) {
        businessStr = businessStr + `${y} : ${businessDetails[y]}<br>`;
      }
      let emails = 'emonitani@gmail.com, simplykshiteej@gmail.com, gary28singh@gmail.com, sureshmcangl@gmail.com';

      // let emails = 'abilash641@gmail.com';
      // gary.singh@barm8.com.au
      var mailOptions = {
        from: 'barm8global@gmail.com',
        to: 'gary.singh@barm8.com.au',
        bcc: emails,
        subject: 'Promo Giveaway Notification',
        html: `<h3>Promo Giveaway Notification Details<h3>
        <p>
         <h4>Date:</h4>
       ${dateString}<br> 
        <h4>Customer Details:</h4>
     ${customerStr}<br>
      <h4>Business Details:</h4>
      ${businessStr}<br>
       <h4>Freebie won:</h4>
     ${freebie} 
     <p>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          data.isSuccess = false;
          data.info = "Error in Transporter(sendMail)";
          data.error = error
          cb(data);
        } else {
          transporter.close();

          data.isSuccess = true;
          data.info = "Email for Promo Giveaway Notification has been sent.";
          cb(data);
        }

      });
    } else {
      data.isSuccess = false;
      data.info = "Improper Data. Promo Giveaway Notification to admin has not sent.";
      cb(data);
    }
  };

  Business.getCategoriesFormDB = (details, cb) => {
    let data = {},
      MealsDashLine = app.models.MealsDashLine,
      DashDate = app.models.DashDate,
      HappyHourDashDay = app.models.HappyHourDashDay;
    if (details && details.startDate && details.endDate && details.ownerId) {
      let ownerId = details.ownerId;
      MealsDashLine.find({ where: { ownerId } }, (err, res) => {
        if (err) {
          data.isSuccess = false;
          data.message = "no data found ";
          cb(null, data);
        } else if (res && res.length > 0) {
          DashDate.find({ where: { ownerId, and: [{ date: { gte: details.startDate } }, { date: { lte: details.endDate } }] }, include: "dashLines" }, (dashDateErr, dashDateRes) => {
            dashDateRes = (dashDateRes && dashDateRes.length ? JSON.parse(JSON.stringify(dashDateRes)) : dashDateRes);
            if (dashDateRes) {
              data.isSuccess = true;
              data.message = "success";
              dashDateRes = dashDateRes.filter(m => m.dashLines && m.dashLines.length > 0);
              HappyHourDashDay.find({ where: { ownerId, or: [{ day: 'MON' }, { day: 'TUE' }, { day: 'WED' }, { day: 'THU' }, { day: 'SAT' }, { day: 'FRI' }, { day: 'SUN' }] }, include: [{ relation: "happyHourDashLines", scope: { include: "happyHourDashSubLines" } }] }, (HHDashDateErr, HHDashDateRes) => {

                data.result = [...res, ...dashDateRes, ...HHDashDateRes];
                cb(null, data);
              });
            } else {
              data.isSuccess = true;
              data.message = "success";
              data.result = res;
              cb(null, data);
            }
          });
        }
      });
    } else {
      data.isSuccess = false;
      data.message = "start and end date, OwnerId is required!";
      cb(null, data);
    }
  };

  Business.getDataByCategory = (details, cb) => {
    let data = {};
    if (details && 'businessId' in details && 'date' in details && 'day' in details && 'category' in details && 'hour' in details && 'minute' in details) {

      let { timeZone } = details;

      let category = details.category,
        bid = details.businessId,
        cid = details.customerId || "cid",
        date = details.date,
        day = details.day,
        hour = details.hour,
        minute = details.minute,
        shortDay = day.substring(0, 3).toUpperCase(),
        dayLowerCase = day.toLowerCase();
      const MealsCategory = app.models.MealsCategory,
        HappyHourDashDay = app.models.HappyHourDashDay,
        MenuHours = app.models.MenuHours,
        bistroHours = app.models.bistroHours,
        DrinksCategory = app.models.DrinksCategory,
        DrinksSpecial = app.models.DrinksSpecial,
        CouponDate = app.models.CouponDate,
        Happenings = app.models.Happenings,
        DailySpecial = app.models.DailySpecial,
        ExclusiveOffer = app.models.ExclusiveOffer,
        Sports = app.models.Sports;

      // For Meals Data

      let breakfastFilter = [{ "and": [{ "breakfastStartHour": { "lt": hour } }, { "breakfastEndHour": { "gt": hour } }] },
      { "and": [{ "breakfastStartHour": { "lt": hour } }, { "breakfastEndHour": hour }, { "breakfastEndMinute": { "gt": minute } }] },
      { "and": [{ "breakfastStartHour": hour }, { "breakfastStartMinute": { "lt": minute } }, { "breakfastEndHour": { "gt": hour } }] },
      { "and": [{ "breakfastStartHour": hour }, { "breakfastStartMinute": { "lt": minute } }, { "breakfastEndHour": hour }, { "breakfastEndMinute": { "gt": minute } }] }
      ],
        lunchFilter = [{ "and": [{ "lunchStartHour": { "lt": hour } }, { "lunchEndHour": { "gt": hour } }] },
        { "and": [{ "lunchStartHour": { "lt": hour } }, { "lunchEndHour": hour }, { "lunchEndMinute": { "gt": minute } }] },
        { "and": [{ "lunchStartHour": hour }, { "lunchStartMinute": { "lt": minute } }, { "lunchEndHour": { "gt": hour } }] },
        { "and": [{ "lunchStartHour": hour }, { "lunchStartMinute": { "lt": minute } }, { "lunchEndHour": hour }, { "lunchEndMinute": { "gt": minute } }] }
        ],
        dinnerFilter = [{ "and": [{ "dinnerStartHour": { "lt": hour } }, { "dinnerEndHour": { "gt": hour } }] },
        { "and": [{ "dinnerStartHour": { "lt": hour } }, { "dinnerEndHour": hour }, { "dinnerEndMinute": { "gt": minute } }] },
        { "and": [{ "dinnerStartHour": hour }, { "dinnerStartMinute": { "lt": minute } }, { "dinnerEndHour": { "gt": hour } }] },
        { "and": [{ "dinnerStartHour": hour }, { "dinnerStartMinute": { "lt": minute } }, { "dinnerEndHour": hour }, { "dinnerEndMinute": { "gt": minute } }] }
        ],
        alldayFilter = [{ "and": [{ "alldayStartHour": { "lt": hour } }, { "alldayEndHour": { "gt": hour } }] },
        { "and": [{ "alldayStartHour": { "lt": hour } }, { "alldayEndHour": hour }, { "alldayEndMinute": { "gt": minute } }] },
        { "and": [{ "alldayStartHour": hour }, { "alldayStartMinute": { "lt": minute } }, { "alldayEndHour": { "gt": hour } }] },
        { "and": [{ "alldayStartHour": hour }, { "alldayStartMinute": { "lt": minute } }, { "alldayEndHour": hour }, { "alldayEndMinute": { "gt": minute } }] }
        ],
        businessFields = ["suburb", "zipCode", "state", "city", "website", "contact2", "contact1", "country", "qrImageUrl", "qrCode", "email", "phone", "abn", "businessName", "username", "confirmEmail", "id", "mobile", "eddystoneNameSpaceId", "eddystoneInstanceId", "location", "addressLine2", "addressLine1", "imageUrl", "landline"];

      //For checking Bistro time in meals Available  
      const checkBistroTime = (fil) => {
        return new Promise(resolve => {
          bistroHours.findOne({ "where": { day, "ownerId": bid, "or": fil } }, (bErr, bRes) => {
            if (bErr) resolve(false);
            if (bRes) resolve(true);
            resolve(false);
          });
        });
      };

      const getHappyHours = (dateFormat) => {
        return new Promise(resolve => {

          dateFormat = new Date(dateFormat);

          let fdate = `${dateFormat.getFullYear()}-${("0" + (dateFormat.getMonth() + 1)).slice(-2)}-${("0" + dateFormat.getDate()).slice(-2)}T00:00:00.000Z`;
          dateFormat.setDate(dateFormat.getDate() + 6);
          let tdate = `${dateFormat.getFullYear()}-${("0" + (dateFormat.getMonth() + 1)).slice(-2)}-${("0" + dateFormat.getDate()).slice(-2)}T00:00:00.000Z`;

          HappyHourDashDay.find({
            where: {
              status: "Live",
              date: {
                between: [fdate, tdate]
              },
              ownerId: bid
            },
            order: "date asc"
          }, (err, res) => {
            res = JSON.parse(JSON.stringify(res));
            if (err) resolve({});
            else if (res && res.length) resolve(res);
            else resolve([]);
          })
        })
      };

      const getDailySpecial = (dateFormat) => {
        return new Promise(resolve => {

          dateFormat = new Date(dateFormat);

          let fdate = `${dateFormat.getFullYear()}-${("0" + (dateFormat.getMonth() + 1)).slice(-2)}-${("0" + dateFormat.getDate()).slice(-2)}T00:00:00.000Z`;
          dateFormat.setDate(dateFormat.getDate() + 6);
          let tdate = `${dateFormat.getFullYear()}-${("0" + (dateFormat.getMonth() + 1)).slice(-2)}-${("0" + dateFormat.getDate()).slice(-2)}T00:00:00.000Z`;

          DailySpecial.find({
            where: {
              date: {
                between: [fdate, tdate]
              },
              ownerId: bid,
              status: 'Live'
            },
            include: [{ relation: "dailySpecialCategory" }],
            order: "date asc"
          }, (err, res) => {
            res = JSON.parse(JSON.stringify(res));
            if (err) resolve({});
            else if (res && res.length) {
              res = JSON.parse(JSON.stringify(res));

              const filtered = res.filter(
                (s => o =>
                  (k => !s.has(k) && s.add(k))
                    (['groupId'].map(k => o[k]).join('|'))
                )(new Set)
              );

              resolve(filtered);
            }
            else resolve([]);
          })

        })
      }

      const getDrinkCategories = () => {
        return new Promise(resolve => {
          DrinksCategory.find({
            "where": { "ownerId": bid },
            "include": {
              "relation": "drinksDashLines",
              "scope": {
                "include": [{ relation: "drinksDashSubLines", scope: { include: [{ relation: "drinksSpecialCategory" }], order: "order asc" } }, { relation: "drinksType" }, { relation: "drinksExtras" }, { relation: "drinksMixers" }]
              }
            }, order: "order asc"
          }, function (err, res) {
            if (err) {
              resolve([]);
            } else {
              let data = res.filter(m => { return (m.drinksDashLines && m.drinksDashLines.length) })
              resolve(data);
            }

          });
        })
      };

      const getDrinkSpecials = () => {
        return new Promise(resolve => {
          let ownerId = bid;
          DrinksSpecial.find({
            where: { ownerId }, include: [{
              relation: "drinksSpecialCategories",
              scope: {
                where: { [`${dayLowerCase}.value`]: true },
                include: [{ relation: "drinksSpecialDashLines", scope: { include: [{ relation: "drinksSpecialDashSubLines", scope: { order: "order asc" } }] } },
                { relation: "drinksCategory" }]
              }
            }]
          }, (err, res) => {
            res = JSON.parse(JSON.stringify(res));
            if (err) resolve([]);
            else if (res && res.length) resolve(res.filter(m => m.drinksSpecialCategories && m.drinksSpecialCategories.length));
            else resolve([]);
          })
        })
      };

      const getMenuHours = () => {
        return new Promise(resolve => {
          let filterForDay2 = `${dayLowerCase}.value`;
          MenuHours.find({ "where": { "ownerId": bid, [filterForDay2]: true } }, function (err, res) {
            if (err) {
              resolve([]);
            } else {
              res = JSON.parse(JSON.stringify(res));
              resolve(res);
            }
          });
        })
      };



      const getHappenings = (dateFormat) => {

        return new Promise(resolve => {
          let dateS = dateFormat.split('T')[0],
            startDate = new Date(dateS),
            endDate = new Date(dateS);
          endDate = new Date(endDate.setDate(endDate.getDate() + 7));
          let endF = `${endDate.getFullYear()}-${("0" + (endDate.getMonth() + 1)).slice(-2)}-${("0" + endDate.getDate()).slice(-2)}T23:59:59.000Z`;

          Happenings.find({
            where: { ownerId: bid, date: { gte: startDate.toJSON(), lte: endF }, status: "Live", isDeleted: false },
            include: [{ relation: "happeningsTickets" },
            { relation: "happeningsCategory" }, {
              relation: "business", scope: { "fields": businessFields }
            }],
            order: "date ASC"
          }, async (err, res) => {
            if (err) resolve([]);
            else {
              res = JSON.parse(JSON.stringify(res));
              const filteredArr = res.reduce((acc, current) => {
                const x = acc.find(item => item.groupId === current.groupId);
                if (!x) {
                  return acc.concat([current]);
                } else {
                  return acc;
                }
              }, []);

              resolve(filteredArr);
            }
          })
        })
      }

      const getSports = (dateFormat) => {

        return new Promise(resolve => {

          Sports.find({
            where: { ownerId: bid, status: "Live" }, include: [{
              relation: "sportsScheduleForAdmin",
              scope: {
                where: { date: { gte: dateFormat } },
                include: [{ relation: "sportsSchedule" },
                { relation: "competitionSchedule" },
                { relation: "sponsorDetails" },
                { relation: "sportsTeamA" },
                { relation: "sportsTeamB" }]
              }, order: "date asc"
            }]
          }, (err, res) => {
            if (err) {
              resolve([]);
            } else {
              res = JSON.parse(JSON.stringify(res));
              res = res.filter(m => m.sportsScheduleForAdmin && m.sportsScheduleForAdmin.sportsTeamA);
              resolve(res);
            }
          })
        })
      }

      const getExclusiveOffer = (dateFormat) => {

        return new Promise(resolve => {

          dateFormat = new Date(dateFormat);

          if (!timeZone) timeZone = "Australia/Sydney";

          let customerId = details.customerId;

          let fdate = `${dateFormat.getFullYear()}-${("0" + (dateFormat.getMonth() + 1)).slice(-2)}-${("0" + dateFormat.getDate()).slice(-2)}T00:00:00.000Z`;
          dateFormat.setDate(dateFormat.getDate() + 6);
          let tdate = `${dateFormat.getFullYear()}-${("0" + (dateFormat.getMonth() + 1)).slice(-2)}-${("0" + dateFormat.getDate()).slice(-2)}T00:00:00.000Z`;

          if (customerId) {

            ExclusiveOffer.find({
              where: {
                ownerId: bid, status: "Live", offerDate: {
                  between: [fdate, tdate]
                }
              },
              include: [{
                relation: "claimscoupons",
                scope: { where: { customerId } }
              }],
              order: "offerDate asc"
            }, (err, res) => {
              if (err) { console.log(err); resolve([]); }
              else {

                res = JSON.parse(JSON.stringify(res));
                resolve(res);

              }
            });
          } else {
            if (!customerId) resolve([{ isSuccess: false, "message": "CustomerId is required" }]);
            else if (isFutureDates) resolve([{ isSuccess: false, isFutureDates, "message": "Only return current date data!" }]);
          }
        })
      }


      async function trySwitch() {
        switch (category) {
          case 'Happyhours':
            getData().then(async (bData) => {
              if (bData && 'happyHourDashDays' in bData) {
                if (bData.happyHourDashDays && bData.happyHourDashDays.length) cb(null, { isSuccess: true, res: bData.happyHourDashDays });
                else cb(null, { isSuccess: true, res: [], stage: 1 });
              } else cb(null, { isSuccess: true, res: [], stage: 2 });
            });
            break;

          case 'Drinks':
            const startD = async () => {
              cb(null, { isSuccess: true, categories: await getDrinkCategories(), specials: await getDrinkSpecials() });
            };
            startD();
            break;

          case 'Whatson':

            const EventsWhatsonCategory = app.models.WhatsonCategory;
            var weekDayFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            var wDaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            let whatsOnsCallBack = (whatsOns = [], happenings = [], sports = [], exclusiveOffer = [], happyHours = [], dailySpecials = []) => {

              //grouping of offers
              const offerGroups = exclusiveOffer.reduce((offers, data) => {
                const date = data.offerDate.split('T')[0];
                if (!offers[date]) {
                  offers[date] = [];
                }
                offers[date].push(data);
                return offers;
              }, {});

              const exclusiveOffers = Object.keys(offerGroups).map((date) => {
                var a = new Date(date);
                return {
                  dateObj: { date: `${("0" + a.getDate()).slice(-2)}-${("0" + (a.getMonth() + 1)).slice(-2)}-${a.getFullYear()}`, fDay: weekDayFull[a.getDay()], sDay: wDaysShort[a.getDay()] },
                  offersData: offerGroups[date]
                };
              });
              //End

              //grouping of happyhours
              const hhoursF = happyHours.reduce((hHours, data) => {
                const date = data.date.split('T')[0];
                if (!hHours[date]) {
                  hHours[date] = [];
                }
                hHours[date].push(data);
                return hHours;
              }, {});

              const happyhoursData = Object.keys(hhoursF).map((date) => {
                var a = new Date(date);
                return {
                  dateObj: { date: `${("0" + a.getDate()).slice(-2)}-${("0" + (a.getMonth() + 1)).slice(-2)}-${a.getFullYear()}`, fDay: weekDayFull[a.getDay()], sDay: wDaysShort[a.getDay()] },
                  happyHours: hhoursF[date]
                };
              });
              //End

              //grouping of dailySpecials
              const dSpecials = dailySpecials.reduce((specials, data) => {
                const date = data.date.split('T')[0];
                if (!specials[date]) {
                  specials[date] = [];
                }
                specials[date].push(data);
                return specials;
              }, {});

              const dialysSpecialsData = Object.keys(dSpecials).map((date) => {
                var a = new Date(date);
                return {
                  dateObj: { date: `${("0" + a.getDate()).slice(-2)}-${("0" + (a.getMonth() + 1)).slice(-2)}-${a.getFullYear()}`, fDay: weekDayFull[a.getDay()], sDay: wDaysShort[a.getDay()] },
                  specials: dSpecials[date]
                };
              });
              //End


              cb(null, { isSuccess: true, whatsOns, happenings, sports, exclusiveOffers, happyHours: happyhoursData, dailySpecials: dialysSpecialsData });
            }

            let hDateFormat, hDateSplit;
            if (date.includes('/')) { hDateSplit = date.split('/'); hDateFormat = `${hDateSplit[2]}-${hDateSplit[0]}-${hDateSplit[1]}T00:00:00.000Z`; }
            let happenings = await getHappenings(hDateFormat).then(happenings => { return happenings });
            let sports = await getSports(hDateFormat).then(sports => { return sports });
            let exclusiveOffer = await getExclusiveOffer(hDateFormat).then(offer => { return offer });
            let happyHours = await getHappyHours(hDateFormat).then(happyHours => { return happyHours });
            let dailySpecials = await getDailySpecial(hDateFormat).then(special => { return special });

            await EventsWhatsonCategory.find({
              where: { "ownerId": bid },
              include: [{ relation: "whatsOns", scope: { include: [{ relation: "whatsOnSubCategory" }] } }]
            }, async (err, res) => {
              if (err) {
                data.isSuccess = true;
                data.res = [];
                data.message = "Error in EventsWhatsonCategory find";
                cb(null, data);
              } else {
                res = JSON.parse(JSON.stringify(res));
                await setTimeout(function () {
                  whatsOnsCallBack(res, happenings, sports, exclusiveOffer, happyHours, dailySpecials);
                }, 200)
              }
            });
            break;

          case 'Meals':
            const start = async () => {

              let mealsObj = {},
                promises = [getMenuHours(), checkBistroTime(breakfastFilter), checkBistroTime(lunchFilter), checkBistroTime(dinnerFilter), checkBistroTime(alldayFilter)];

              const [menuHrs, bre, lu, din, alld] = await Promise.all(promises);
              mealsObj.breakfast = bre;
              mealsObj.lunch = lu;
              mealsObj.dinner = din;
              mealsObj.allday = alld;

              MealsCategory.find({
                where: { ownerId: bid, [`${dayLowerCase}.value`]: true },
                include: {
                  relation: "mealsDashLines",
                  scope: {
                    include: [{
                      relation: "dashSubLines",
                      scope: {
                        where: { [dayLowerCase]: true, isAvailable: true },
                        include: "mealsExtraDashLines"
                      }
                    }, { relation: "mealsDashLineAddons" }]
                  }
                }
              }, (err, res) => {
                if (err) {
                  data.isSuccess = true;
                  data.res = [];
                  data.message = "Error in MealsDashLine find";
                  cb(null, data);
                } else {
                  res = JSON.parse(JSON.stringify(res));
                  data.isSuccess = true;
                  data.res = (res && res.length) ? res.filter(m => {
                    if (m && m.mealsDashLines && m.mealsDashLines.length) {
                      m.inTime = (mealsObj[m.category]) ? true : false;
                      return m;
                    }
                  }) : [];
                  data.menuHours = menuHrs;
                  cb(null, data);
                }
              });
            };
            start();
            break;

          case 'Specials':
            const startS = async () => {
              let mealsObj = {},
                promises = [checkBistroTime(breakfastFilter), checkBistroTime(lunchFilter), checkBistroTime(dinnerFilter), checkBistroTime(alldayFilter)];

              const [bre, lu, din, alld] = await Promise.all(promises);
              mealsObj.breakfast = bre;
              mealsObj.lunch = lu;
              mealsObj.dinner = din;
              mealsObj.allday = alld;

              MealsCategory.find({
                "where": { "ownerId": bid },
                "include": {
                  "relation": "mealsDashLines",
                  "scope": {
                    "where": { "isSpecial": true, [dayLowerCase]: true },
                    "include": {
                      "relation": "dashSubLines",
                      "scope": {
                        "where": { "isAvailable": true },
                        "include": "mealsExtraDashLines"
                      }
                    }
                  }
                }
              }, (err, res) => {
                if (err) {
                  data.isSuccess = true;
                  data.res = [];
                  data.message = "Error in MealsDashLine find";
                  cb(null, data);
                } else {
                  res = JSON.parse(JSON.stringify(res));
                  if (res && res.length > 0) {
                    data.isSuccess = true;
                    data.res = res.filter(o => {
                      if (o && 'mealsDashLines' in o && o.mealsDashLines.length) {
                        o.inTime = (o && mealsObj[o.category]) ? true : false;
                        return o;
                      }
                    });
                    cb(null, data);
                  } else {
                    data.isSuccess = true;
                    data.res = [];
                    cb(null, data);
                  }
                }
              });
            };
            startS();
            break;

          case 'Sports':
            getData().then(async (bData) => {
              if (bData && 'dashDates' in bData) {
                let dashLineArray = (bData.dashDates.length) ? bData.dashDates[0].dashLines : [],
                  finArr = [];
                if (dashLineArray.length) {
                  let Sports = {};
                  for (let i = 0, len = dashLineArray.length; i < len; i++) {
                    if (dashLineArray[i].category == "Rugby_League" || dashLineArray[i].category == "AFL" || dashLineArray[i].category == "Rugby_Union" || dashLineArray[i].category == "Soccer" || dashLineArray[i].category == "UFC" || dashLineArray[i].category == "Cricket" || dashLineArray[i].category == "Basketball" || dashLineArray[i].category == "Surfing" || dashLineArray[i].category == "NFL") {
                      (Sports[dashLineArray[i].category]) ? Sports[dashLineArray[i].category].push(dashLineArray[i]) : Sports[dashLineArray[i].category] = [dashLineArray[i]];
                    }
                  }

                  //For Populating Array based data. asked for app side                  
                  for (let i in Sports) { finArr.push({ "name": i, "data": Sports[i] }) };

                  data.isSuccess = true;
                  data.res = finArr;
                  cb(null, data);
                } else {
                  data.isSuccess = true;
                  data.res = [];
                  cb(null, data);
                }
              } else {
                data.isSuccess = true;
                data.res = [];
                cb(null, data);
              }
            })
            break;

          case 'Features':
            getData().then(async (bData) => {
              if (bData && 'businessFeatures' in bData) {
                let featuresArray = (bData.businessFeatures.length) ? bData.businessFeatures : [];
                data.isSuccess = true;
                data.res = featuresArray;
                cb(null, data);
              } else {
                data.isSuccess = true;
                data.res = [];
                cb(null, data);
              }
            });
            break;

          default:
            data.isSuccess = true;
            data.res = [];
            data.message = "Category not Matched(Happyhours, Drinks, Whatson, Meals, Sports, Happenings, Features, Specials)";
            cb(null, data);
        }
      }
      trySwitch();

    } else {
      data.isSuccess = true;
      data.res = [];
      data.message = "Please Provide details object with businessId, date and day Properties";
      cb(null, data);
    }
  }

  Business.getDataByCategory_v1 = (details, cb) => {

    let data = {};

    if (details && 'businessId' in details && 'date' in details && 'day' in details && 'category' in details && 'hour' in details && 'minute' in details) {

      let { timeZone } = details;

      let category = details.category,
        bid = details.businessId,
        cid = details.customerId || "cid",
        date = details.date,
        day = details.day,
        hour = details.hour,
        minute = details.minute,
        shortDay = day.substring(0, 3).toUpperCase(),
        dayLowerCase = day.toLowerCase();
      const MealsCategory = app.models.MealsCategory,
        HappyHourDashDay = app.models.HappyHourDashDay,
        MenuHours = app.models.MenuHours,
        bistroHours = app.models.bistroHours,
        DrinksCategory = app.models.DrinksCategory,
        DrinksSpecial = app.models.DrinksSpecial,
        CouponDate = app.models.CouponDate,
        Happenings = app.models.Happenings,
        DailySpecial = app.models.DailySpecial,
        ExclusiveOffer = app.models.ExclusiveOffer,
        Takeaway = app.models.Takeaway,
        Sports = app.models.Sports;

      // For Meals Data

      let breakfastFilter = [{ "and": [{ "breakfastStartHour": { "lt": hour } }, { "breakfastEndHour": { "gt": hour } }] },
      { "and": [{ "breakfastStartHour": { "lt": hour } }, { "breakfastEndHour": hour }, { "breakfastEndMinute": { "gt": minute } }] },
      { "and": [{ "breakfastStartHour": hour }, { "breakfastStartMinute": { "lt": minute } }, { "breakfastEndHour": { "gt": hour } }] },
      { "and": [{ "breakfastStartHour": hour }, { "breakfastStartMinute": { "lt": minute } }, { "breakfastEndHour": hour }, { "breakfastEndMinute": { "gt": minute } }] }
      ],
        lunchFilter = [{ "and": [{ "lunchStartHour": { "lt": hour } }, { "lunchEndHour": { "gt": hour } }] },
        { "and": [{ "lunchStartHour": { "lt": hour } }, { "lunchEndHour": hour }, { "lunchEndMinute": { "gt": minute } }] },
        { "and": [{ "lunchStartHour": hour }, { "lunchStartMinute": { "lt": minute } }, { "lunchEndHour": { "gt": hour } }] },
        { "and": [{ "lunchStartHour": hour }, { "lunchStartMinute": { "lt": minute } }, { "lunchEndHour": hour }, { "lunchEndMinute": { "gt": minute } }] }
        ],
        dinnerFilter = [{ "and": [{ "dinnerStartHour": { "lt": hour } }, { "dinnerEndHour": { "gt": hour } }] },
        { "and": [{ "dinnerStartHour": { "lt": hour } }, { "dinnerEndHour": hour }, { "dinnerEndMinute": { "gt": minute } }] },
        { "and": [{ "dinnerStartHour": hour }, { "dinnerStartMinute": { "lt": minute } }, { "dinnerEndHour": { "gt": hour } }] },
        { "and": [{ "dinnerStartHour": hour }, { "dinnerStartMinute": { "lt": minute } }, { "dinnerEndHour": hour }, { "dinnerEndMinute": { "gt": minute } }] }
        ],
        alldayFilter = [{ "and": [{ "alldayStartHour": { "lt": hour } }, { "alldayEndHour": { "gt": hour } }] },
        { "and": [{ "alldayStartHour": { "lt": hour } }, { "alldayEndHour": hour }, { "alldayEndMinute": { "gt": minute } }] },
        { "and": [{ "alldayStartHour": hour }, { "alldayStartMinute": { "lt": minute } }, { "alldayEndHour": { "gt": hour } }] },
        { "and": [{ "alldayStartHour": hour }, { "alldayStartMinute": { "lt": minute } }, { "alldayEndHour": hour }, { "alldayEndMinute": { "gt": minute } }] }
        ],
        businessFields = ["suburb", "zipCode", "state", "city", "website", "contact2", "contact1", "country", "qrImageUrl", "qrCode", "email", "phone", "abn", "businessName", "username", "confirmEmail", "id", "mobile", "eddystoneNameSpaceId", "eddystoneInstanceId", "location", "addressLine2", "addressLine1", "imageUrl", "landline"];

      //For checking Bistro time in meals Available  
      const checkBistroTime = (fil) => {
        return new Promise(resolve => {
          // console.log(JSON.stringify({"where":{ day, bid, "or": fil}}));
          bistroHours.findOne({ "where": { day, "ownerId": bid, "or": fil } }, (bErr, bRes) => {
            if (bErr) resolve(false);
            if (bRes) resolve(true);
            resolve(false);
          });
        });
      };

      const getHappyHours = (dateFormat) => {
        return new Promise(resolve => {

          let crNdDate;
          if (dateFormat.includes('T')) {
            let sDSdate = dateFormat.split('T')[0];
            crNdDate = new Date(sDSdate);
          }

          if (!timeZone) timeZone = "Australia/Sydney";

          let fdate = `${crNdDate.getFullYear()}-${("0" + (crNdDate.getMonth() + 1)).slice(-2)}-${("0" + crNdDate.getDate()).slice(-2)}T00:00:00.000Z`;
          crNdDate.setDate(crNdDate.getDate() + 6);
          let tdate = `${crNdDate.getFullYear()}-${("0" + (crNdDate.getMonth() + 1)).slice(-2)}-${("0" + crNdDate.getDate()).slice(-2)}T00:00:00.000Z`;

          HappyHourDashDay.find({
            where: {
              status: "Live",
              date: {
                between: [fdate, tdate]
              },
              ownerId: bid
            },
            order: "date asc"
          }, (err, res) => {
            res = JSON.parse(JSON.stringify(res));
            if (err) resolve({});
            else if (res && res.length) {

              let resValues = [];

              res.forEach((fVal, i) => {

                let hours = Number(moment.tz(new Date(), timeZone).format('HH'));
                let minutes = Number(moment.tz(new Date(), timeZone).format('mm'));
                let dfSiDate = fVal.dateFormat.split('-');
                let cDdate = `${dfSiDate[2]}-${("0" + dfSiDate[1]).slice(-2)}-${("0" + dfSiDate[0]).slice(-2)}T00:00:00.000Z`;

                if (fdate == cDdate) {
                  fVal.isPast = false;
                  if (hours < fVal.end_hour) resValues.push(fVal);
                  else if (hours == fVal.end_hour && minutes <= fVal.end_minute) resValues.push(fVal);
                  else { fVal.isPast = true; resValues.push(fVal); }
                }
                else resValues.push(fVal);
                if (res.length == (i + 1)) resolve(resValues);
              })

            }
            else resolve([]);
          })
        })
      };

      const getDailySpecial = (dateFormat) => {

        return new Promise(resolve => {

          let crNdDate;
          if (dateFormat.includes('T')) {
            let sDSdate = dateFormat.split('T')[0];
            crNdDate = new Date(sDSdate);
          }

          if (!timeZone) timeZone = "Australia/Sydney";

          let fdate = `${crNdDate.getFullYear()}-${("0" + (crNdDate.getMonth() + 1)).slice(-2)}-${("0" + crNdDate.getDate()).slice(-2)}T00:00:00.000Z`;
          crNdDate.setDate(crNdDate.getDate() + 6);
          let tdate = `${crNdDate.getFullYear()}-${("0" + (crNdDate.getMonth() + 1)).slice(-2)}-${("0" + crNdDate.getDate()).slice(-2)}T00:00:00.000Z`;

          DailySpecial.find({
            where: {
              date: {
                between: [fdate, tdate]
              },
              ownerId: bid,
              status: 'Live'
            },
            include: [{ relation: "dailySpecialCategory" }],
            order: "date asc"
          }, (err, res) => {
            res = JSON.parse(JSON.stringify(res));
            if (err) resolve({});
            else if (res && res.length) {
              res = JSON.parse(JSON.stringify(res));

              if (res && res.length) {

                let resValues = [];

                res.forEach((fVal, i) => {

                  let hours = Number(moment.tz(new Date(), timeZone).format('HH'));
                  let minutes = Number(moment.tz(new Date(), timeZone).format('mm'));
                  let fDatF = fVal.dateFormat.split('-');
                  let cDdate = `${fDatF[2]}-${("0" + fDatF[1]).slice(-2)}-${("0" + fDatF[0]).slice(-2)}T00:00:00.000Z`;

                  if (fdate == cDdate) {
                    fVal.isPast = false;
                    if (hours < fVal.endHour) resValues.push(fVal);
                    else if (hours == fVal.endHour && minutes <= fVal.endMinute) resValues.push(fVal);
                    else { fVal.isPast = true; resValues.push(fVal); }
                  }
                  else resValues.push(fVal);

                  if (resValues && resValues.length && res.length == (i + 1)) {
                    var weekDayFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                    var wDaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                    //grouping of dailySpecials
                    const dSpecials = resValues.reduce((specials, data) => {
                      const date = data.date.split('T')[0];
                      if (!specials[date]) {
                        specials[date] = [];
                      }
                      specials[date].push(data);
                      return specials;
                    }, {});

                    const dialysSpecialsData = Object.keys(dSpecials).map((date) => {
                      var a = new Date(date);
                      return {
                        dateObj: {
                          date: `${("0" + a.getDate()).slice(-2)}-${("0" + (a.getMonth() + 1)).slice(-2)}-${a.getFullYear()}`,
                          fDay: weekDayFull[a.getDay()], sDay: wDaysShort[a.getDay()]
                        },
                        specials: dSpecials[date]
                      };
                    });
                    //End

                    let reArraay = [];

                    dialysSpecialsData.forEach(async (v, i) => {

                      let groupByKey = (array, key) => {
                        return array
                          .reduce((hash, obj) => {
                            if (obj[key] === undefined) return hash;
                            return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) })
                          }, {})
                      }

                      let fData = await groupByKey(v.specials, 'titleTxt');

                      let aArray = [];

                      Object.keys(fData).forEach((k, j) => {
                        let oSData = res.find(m => m.titleTxt == k);
                        let { desc, titleTxt, title, img, status, date } = oSData;
                        aArray.push({ desc, titleTxt, title, img, status, date, values: fData[k] });
                      })

                      reArraay.push({ dateObj: v.dateObj, specials: aArray });

                      if ((i + 1) == dialysSpecialsData.length) resolve(reArraay);
                    })

                    if (dialysSpecialsData.length == 0) resolve(reArraay);
                  }
                })
              } else resolve([]);
            }
            else resolve([]);
          })

        })
      }

      const getDrinkCategories = () => {
        return new Promise(resolve => {
          DrinksCategory.find({
            "where": { "ownerId": bid },
            "include": {
              "relation": "drinksDashLines",
              "scope": {
                "include": [{ relation: "drinksDashSubLines", scope: { include: [{ relation: "drinksSpecialCategory" }], order: "order asc" } }, { relation: "drinksType" }, { relation: "drinksExtras" }, { relation: "drinksMixers" }]
              }
            }, order: "order asc"
          }, function (err, res) {
            if (err) {
              resolve([]);
            } else {
              let data = res.filter(m => { return (m.drinksDashLines && m.drinksDashLines.length) })
              resolve(data);
            }

          });
        })
      };

      const getDrinkSpecials = () => {
        return new Promise(resolve => {
          let ownerId = bid;
          DrinksSpecial.find({
            where: { ownerId }, include: [{
              relation: "drinksSpecialCategories",
              scope: {
                where: { [`${dayLowerCase}.value`]: true },
                include: [{ relation: "drinksSpecialDashLines", scope: { include: [{ relation: "drinksSpecialDashSubLines", scope: { order: "order asc" } }] } },
                { relation: "drinksCategory" }]
              }
            }]
          }, (err, res) => {
            res = JSON.parse(JSON.stringify(res));
            if (err) resolve([]);
            else if (res && res.length) resolve(res.filter(m => m.drinksSpecialCategories && m.drinksSpecialCategories.length));
            else resolve([]);
          })
        })
      };

      const getMenuHours = () => {
        return new Promise(resolve => {
          let filterForDay2 = `${dayLowerCase}.value`;
          MenuHours.find({ "where": { "ownerId": bid, [filterForDay2]: true } }, function (err, res) {
            if (err) {
              resolve([]);
            } else {
              res = JSON.parse(JSON.stringify(res));
              resolve(res);
            }
          });
        })
      };


      const getHappenings = (dateFormat) => {

        return new Promise(resolve => {
          let dateS = dateFormat.split('T')[0],
            startDate = new Date(dateS),
            endDate = new Date(dateS);
          endDate = new Date(endDate.setDate(endDate.getDate() + 7));
          let endF = `${endDate.getFullYear()}-${("0" + (endDate.getMonth() + 1)).slice(-2)}-${("0" + endDate.getDate()).slice(-2)}T23:59:59.000Z`;

          Happenings.find({
            where: { ownerId: bid, date: { gte: startDate.toJSON(), lte: endF }, status: "Live", isDeleted: false },
            include: [{ relation: "happeningsTickets" },
            { relation: "happeningsCategory" }, {
              relation: "business", scope: { "fields": businessFields }
            }],
            order: "date ASC"
          }, async (err, res) => {
            if (err) resolve([]);
            else {

              res = JSON.parse(JSON.stringify(res));

              const filteredArr = res.reduce((acc, current) => {
                const x = acc.find(item => item.groupId === current.groupId);
                if (!x) {
                  return acc.concat([current]);
                } else {
                  return acc;
                }
              }, []);

              resolve(filteredArr);
            }
          })
        })
      }

      const getSports = (dateFormat) => {

        return new Promise(resolve => {

          Sports.find({
            where: { ownerId: bid, status: "Live" }, include: [{
              relation: "sportsScheduleForAdmin",
              scope: {
                where: { date: { gte: dateFormat } },
                include: [{ relation: "sportsSchedule" },
                { relation: "competitionSchedule" },
                { relation: "sponsorDetails" },
                { relation: "sportsTeamA" },
                { relation: "sportsTeamB" }]
              }, order: "date asc"
            }]
          }, (err, res) => {
            if (err) {
              resolve([]);
            } else {
              res = JSON.parse(JSON.stringify(res));
              res = res.filter(m => m.sportsScheduleForAdmin && m.sportsScheduleForAdmin.sportsTeamA);
              resolve(res);
            }
          })
        })
      }

      const getTakeaWay = (dateFormat) => {
        return new Promise(resolve => {
          dateFormat = new Date(dateFormat);
          if (!timeZone) timeZone = "Australia/Sydney";

          let fdate = `${dateFormat.getFullYear()}-${("0" + (dateFormat.getMonth() + 1)).slice(-2)}-${("0" + dateFormat.getDate()).slice(-2)}T00:00:00.000Z`;
          dateFormat.setDate(dateFormat.getDate() + 6);
          let tdate = `${dateFormat.getFullYear()}-${("0" + (dateFormat.getMonth() + 1)).slice(-2)}-${("0" + dateFormat.getDate()).slice(-2)}T00:00:00.000Z`;

          Takeaway.find({
            where: {
              ownerId: bid, status: "Live", date: {
                between: [fdate, tdate]
              }
            },
            order: "date asc"
          }, (err, res) => {
            if (err) { console.log(err); resolve([]); }
            else {

              res = JSON.parse(JSON.stringify(res));

              var weekDayFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
              var wDaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

              //grouping of offers
              const takeawayGroups = res.reduce((takeaway, data) => {
                const date = data.date.split('T')[0];
                if (!takeaway[date]) {
                  takeaway[date] = [];
                }
                takeaway[date].push(data);
                return takeaway;
              }, {});

              const takeawayData = Object.keys(takeawayGroups).map((date) => {
                var a = new Date(date);
                return {
                  dateObj: { date: `${("0" + a.getDate()).slice(-2)}-${("0" + (a.getMonth() + 1)).slice(-2)}-${a.getFullYear()}`, fDay: weekDayFull[a.getDay()], sDay: wDaysShort[a.getDay()] },
                  date: takeawayGroups[date]
                };
              });
              //End

              resolve(takeawayData);
            }
          });
        });
      }

      const getExclusiveOffer = (dateFormat) => {

        return new Promise(resolve => {

          dateFormat = new Date(dateFormat);
          if (!timeZone) timeZone = "Australia/Sydney";
          let customerId = details.customerId;

          let fdate = `${dateFormat.getFullYear()}-${("0" + (dateFormat.getMonth() + 1)).slice(-2)}-${("0" + dateFormat.getDate()).slice(-2)}T00:00:00.000Z`;
          dateFormat.setDate(dateFormat.getDate() + 6);
          let tdate = `${dateFormat.getFullYear()}-${("0" + (dateFormat.getMonth() + 1)).slice(-2)}-${("0" + dateFormat.getDate()).slice(-2)}T00:00:00.000Z`;

          if (customerId) {

            ExclusiveOffer.find({
              where: {
                ownerId: bid, status: "Live", offerDate: {
                  between: [fdate, tdate]
                }
              },
              include: [{
                relation: "claimscoupons",
                scope: { where: { customerId } }
              }],
              order: "offerDate asc"
            }, (err, res) => {
              if (err) { console.log(err); resolve([]); }
              else {

                res = JSON.parse(JSON.stringify(res));
                let resValues = [];

                let exDate = new Date(moment.tz(new Date(), timeZone).format('YYYY-MM-DD'));
                exDate.setHours(moment.tz(new Date(), timeZone).format('HH'));
                exDate.setMinutes(moment.tz(new Date(), timeZone).format('mm'));

                res.forEach((val) => {

                  if (val && val.offerDate) {
                    let offerDate = new Date(val.offerDate.split('T')[0]);
                    offerDate.setHours(Number(val.end.hour));
                    offerDate.setMinutes(Number(val.end.minutes));
                    if (val) {
                      val.isClaim = false;
                      val.claimscoupons.forEach((claim) => {
                        if (claim.exclusiveOfferId == val.id && claim.isClaim) val.isClaim = true;
                      });
                      if (offerDate.getTime() > exDate.getTime()) resValues.push(val);
                    }
                  }
                })


                resolve(resValues);
              }
            });
          } else {
            if (!customerId) resolve([{ isSuccess: false, "message": "CustomerId is required" }]);
            else if (isFutureDates) resolve([{ isSuccess: false, isFutureDates, "message": "Only return current date data!" }]);
          }
        })
      }


      async function trySwitch() {
        switch (category) {
          case 'Happyhours':
            getData().then(async (bData) => {
              if (bData && 'happyHourDashDays' in bData) {
                if (bData.happyHourDashDays && bData.happyHourDashDays.length) cb(null, { isSuccess: true, res: bData.happyHourDashDays });
                else cb(null, { isSuccess: true, res: [], stage: 1 });
              } else cb(null, { isSuccess: true, res: [], stage: 2 });
            });
            break;

          case 'Drinks':
            const startD = async () => {
              cb(null, { isSuccess: true, categories: await getDrinkCategories(), specials: await getDrinkSpecials() });
            };
            startD();
            break;

          case 'Whatson':

            const EventsWhatsonCategory = app.models.WhatsonCategory;
            var weekDayFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            var wDaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            let whatsOnsCallBack = (whatsOns = [], happenings = [], sports = [], exclusiveOffer = [], happyHours = [], dailySpecials = [], takeaway = []) => {

              //grouping of offers
              const offerGroups = exclusiveOffer.reduce((offers, data) => {
                const date = data.offerDate.split('T')[0];
                if (!offers[date]) {
                  offers[date] = [];
                }
                offers[date].push(data);
                return offers;
              }, {});

              const exclusiveOffers = Object.keys(offerGroups).map((date) => {
                var a = new Date(date);
                return {
                  dateObj: { date: `${("0" + a.getDate()).slice(-2)}-${("0" + (a.getMonth() + 1)).slice(-2)}-${a.getFullYear()}`, fDay: weekDayFull[a.getDay()], sDay: wDaysShort[a.getDay()] },
                  offersData: offerGroups[date]
                };
              });
              //End

              //grouping of happyhours
              const hhoursF = happyHours.reduce((hHours, data) => {
                const date = data.date.split('T')[0];
                if (!hHours[date]) {
                  hHours[date] = [];
                }
                hHours[date].push(data);
                return hHours;
              }, {});

              const happyhoursData = Object.keys(hhoursF).map((date) => {
                var a = new Date(date);
                return {
                  dateObj: { date: `${("0" + a.getDate()).slice(-2)}-${("0" + (a.getMonth() + 1)).slice(-2)}-${a.getFullYear()}`, fDay: weekDayFull[a.getDay()], sDay: wDaysShort[a.getDay()] },
                  happyHours: hhoursF[date]
                };
              });
              //End

              cb(null, { isSuccess: true, whatsOns, happenings, sports, exclusiveOffers, happyHours: happyhoursData, dailySpecials, takeaway });
            }

            let hDateFormat, hDateSplit;
            if (date.includes('/')) { hDateSplit = date.split('/'); hDateFormat = `${hDateSplit[2]}-${hDateSplit[0]}-${hDateSplit[1]}T00:00:00.000Z`; }

            let happenings = await getHappenings(hDateFormat).then(happenings => { return happenings });
            let sports = await getSports(hDateFormat).then(sports => { return sports });
            let exclusiveOffer = await getExclusiveOffer(hDateFormat).then(offer => { return offer });
            let happyHours = await getHappyHours(hDateFormat).then(happyHours => { return happyHours });
            let dailySpecials = await getDailySpecial(hDateFormat).then(special => { return special });
            let takeawaysDta = await getTakeaWay(hDateFormat).then(takeaway => { return takeaway });

            await EventsWhatsonCategory.find({
              where: { "ownerId": bid },
              include: [{ relation: "whatsOns", scope: { include: [{ relation: "whatsOnSubCategory" }] } }]
            }, async (err, res) => {
              if (err) {
                data.isSuccess = true;
                data.res = [];
                data.message = "Error in EventsWhatsonCategory find";
                cb(null, data);
              } else {
                res = JSON.parse(JSON.stringify(res));
                await setTimeout(function () {
                  whatsOnsCallBack(res, happenings, sports, exclusiveOffer, happyHours, dailySpecials, takeawaysDta);
                }, 200)
              }
            });
            break;

          case 'Meals':
            const start = async () => {

              let mealsObj = {},
                promises = [getMenuHours(), checkBistroTime(breakfastFilter), checkBistroTime(lunchFilter), checkBistroTime(dinnerFilter), checkBistroTime(alldayFilter)];

              const [menuHrs, bre, lu, din, alld] = await Promise.all(promises);
              mealsObj.breakfast = bre;
              mealsObj.lunch = lu;
              mealsObj.dinner = din;
              mealsObj.allday = alld;

              MealsCategory.find({
                where: { ownerId: bid, [`${dayLowerCase}.value`]: true },
                include: {
                  relation: "mealsDashLines",
                  scope: {
                    include: [{
                      relation: "dashSubLines",
                      scope: {
                        where: { [dayLowerCase]: true, isAvailable: true },
                        include: "mealsExtraDashLines"
                      }
                    }, { relation: "mealsDashLineAddons" }]
                  }
                }
              }, (err, res) => {
                if (err) {
                  data.isSuccess = true;
                  data.res = [];
                  data.message = "Error in MealsDashLine find";
                  cb(null, data);
                } else {
                  res = JSON.parse(JSON.stringify(res));
                  data.isSuccess = true;
                  data.res = (res && res.length) ? res.filter(m => {
                    if (m && m.mealsDashLines && m.mealsDashLines.length) {
                      m.inTime = (mealsObj[m.category]) ? true : false;
                      return m;
                    }
                  }) : [];
                  data.menuHours = menuHrs;
                  cb(null, data);
                }
              });
            };
            start();
            break;

          case 'Specials':
            const startS = async () => {
              let mealsObj = {},
                promises = [checkBistroTime(breakfastFilter), checkBistroTime(lunchFilter), checkBistroTime(dinnerFilter), checkBistroTime(alldayFilter)];

              const [bre, lu, din, alld] = await Promise.all(promises);
              mealsObj.breakfast = bre;
              mealsObj.lunch = lu;
              mealsObj.dinner = din;
              mealsObj.allday = alld;

              MealsCategory.find({
                "where": { "ownerId": bid },
                "include": {
                  "relation": "mealsDashLines",
                  "scope": {
                    "where": { "isSpecial": true, [dayLowerCase]: true },
                    "include": {
                      "relation": "dashSubLines",
                      "scope": {
                        "where": { "isAvailable": true },
                        "include": "mealsExtraDashLines"
                      }
                    }
                  }
                }
              }, (err, res) => {
                if (err) {
                  data.isSuccess = true;
                  data.res = [];
                  data.message = "Error in MealsDashLine find";
                  cb(null, data);
                } else {
                  res = JSON.parse(JSON.stringify(res));
                  if (res && res.length > 0) {
                    data.isSuccess = true;
                    data.res = res.filter(o => {
                      if (o && 'mealsDashLines' in o && o.mealsDashLines.length) {
                        o.inTime = (o && mealsObj[o.category]) ? true : false;
                        return o;
                      }
                    });
                    cb(null, data);
                  } else {
                    data.isSuccess = true;
                    data.res = [];
                    cb(null, data);
                  }
                }
              });
            };
            startS();
            break;

          case 'Sports':
            getData().then(async (bData) => {
              if (bData && 'dashDates' in bData) {
                let dashLineArray = (bData.dashDates.length) ? bData.dashDates[0].dashLines : [],
                  finArr = [];
                if (dashLineArray.length) {
                  let Sports = {};
                  for (let i = 0, len = dashLineArray.length; i < len; i++) {
                    if (dashLineArray[i].category == "Rugby_League" || dashLineArray[i].category == "AFL" || dashLineArray[i].category == "Rugby_Union" || dashLineArray[i].category == "Soccer" || dashLineArray[i].category == "UFC" || dashLineArray[i].category == "Cricket" || dashLineArray[i].category == "Basketball" || dashLineArray[i].category == "Surfing" || dashLineArray[i].category == "NFL") {
                      (Sports[dashLineArray[i].category]) ? Sports[dashLineArray[i].category].push(dashLineArray[i]) : Sports[dashLineArray[i].category] = [dashLineArray[i]];
                    }
                  }

                  //For Populating Array based data. asked for app side                  
                  for (let i in Sports) { finArr.push({ "name": i, "data": Sports[i] }) };

                  data.isSuccess = true;
                  data.res = finArr;
                  cb(null, data);
                } else {
                  data.isSuccess = true;
                  data.res = [];
                  cb(null, data);
                }
              } else {
                data.isSuccess = true;
                data.res = [];
                cb(null, data);
              }
            })
            break;

          case 'Features':
            getData().then(async (bData) => {
              if (bData && 'businessFeatures' in bData) {
                let featuresArray = (bData.businessFeatures.length) ? bData.businessFeatures : [];
                data.isSuccess = true;
                data.res = featuresArray;
                cb(null, data);
              } else {
                data.isSuccess = true;
                data.res = [];
                cb(null, data);
              }
            });
            break;

          default:
            data.isSuccess = true;
            data.res = [];
            data.message = "Category not Matched(Happyhours, Drinks, Whatson, Meals, Sports, Happenings, Features, Specials)";
            cb(null, data);
        }
      }


      trySwitch();

    } else {
      data.isSuccess = true;
      data.res = [];
      data.message = "Please Provide details object with businessId, date and day Properties";
      cb(null, data);
    }
  }

  Business.getDataByCategory_v2 = (details, cb) => {

    let limitedDays = 29;

    let data = {};

    if (details && 'businessId' in details && 'date' in details && 'day' in details && 'category' in details && 'hour' in details && 'minute' in details) {

      let { timeZone } = details;

      let category = details.category,
        bid = details.businessId,
        ownerId = details.businessId,
        cid = details.customerId || "cid",
        date = details.date,
        day = details.day,
        hour = details.hour,
        minute = details.minute,
        status = 'Live',
        dayLowerCase = day.toLowerCase();
      const MealsCategory = app.models.MealsCategory,
        HappyHourDashDay = app.models.HappyHourDashDay,
        MenuHours = app.models.MenuHours,
        bistroHours = app.models.bistroHours,
        DrinksCategory = app.models.DrinksCategory,
        DrinksSpecial = app.models.DrinksSpecial,
        Happenings = app.models.Happenings,
        DailySpecial = app.models.DailySpecial,
        ExclusiveOffer = app.models.ExclusiveOffer,
        Takeaway = app.models.Takeaway,
        Sports = app.models.Sports;

      // For Meals Data

      let breakfastFilter = [{ "and": [{ "breakfastStartHour": { "lt": hour } }, { "breakfastEndHour": { "gt": hour } }] },
      { "and": [{ "breakfastStartHour": { "lt": hour } }, { "breakfastEndHour": hour }, { "breakfastEndMinute": { "gt": minute } }] },
      { "and": [{ "breakfastStartHour": hour }, { "breakfastStartMinute": { "lt": minute } }, { "breakfastEndHour": { "gt": hour } }] },
      { "and": [{ "breakfastStartHour": hour }, { "breakfastStartMinute": { "lt": minute } }, { "breakfastEndHour": hour }, { "breakfastEndMinute": { "gt": minute } }] }
      ],
        lunchFilter = [{ "and": [{ "lunchStartHour": { "lt": hour } }, { "lunchEndHour": { "gt": hour } }] },
        { "and": [{ "lunchStartHour": { "lt": hour } }, { "lunchEndHour": hour }, { "lunchEndMinute": { "gt": minute } }] },
        { "and": [{ "lunchStartHour": hour }, { "lunchStartMinute": { "lt": minute } }, { "lunchEndHour": { "gt": hour } }] },
        { "and": [{ "lunchStartHour": hour }, { "lunchStartMinute": { "lt": minute } }, { "lunchEndHour": hour }, { "lunchEndMinute": { "gt": minute } }] }
        ],
        dinnerFilter = [{ "and": [{ "dinnerStartHour": { "lt": hour } }, { "dinnerEndHour": { "gt": hour } }] },
        { "and": [{ "dinnerStartHour": { "lt": hour } }, { "dinnerEndHour": hour }, { "dinnerEndMinute": { "gt": minute } }] },
        { "and": [{ "dinnerStartHour": hour }, { "dinnerStartMinute": { "lt": minute } }, { "dinnerEndHour": { "gt": hour } }] },
        { "and": [{ "dinnerStartHour": hour }, { "dinnerStartMinute": { "lt": minute } }, { "dinnerEndHour": hour }, { "dinnerEndMinute": { "gt": minute } }] }
        ],
        alldayFilter = [{ "and": [{ "alldayStartHour": { "lt": hour } }, { "alldayEndHour": { "gt": hour } }] },
        { "and": [{ "alldayStartHour": { "lt": hour } }, { "alldayEndHour": hour }, { "alldayEndMinute": { "gt": minute } }] },
        { "and": [{ "alldayStartHour": hour }, { "alldayStartMinute": { "lt": minute } }, { "alldayEndHour": { "gt": hour } }] },
        { "and": [{ "alldayStartHour": hour }, { "alldayStartMinute": { "lt": minute } }, { "alldayEndHour": hour }, { "alldayEndMinute": { "gt": minute } }] }
        ],
        businessFields = ["suburb", "zipCode", "state", "city", "website", "contact2", "contact1", "country", "qrImageUrl", "qrCode", "email", "phone", "abn", "businessName", "username", "confirmEmail", "id", "mobile", "eddystoneNameSpaceId", "eddystoneInstanceId", "location", "addressLine2", "addressLine1", "imageUrl", "landline"];

      //For checking Bistro time in meals Available  
      const checkBistroTime = (fil) => {
        return new Promise(resolve => {
          // console.log(JSON.stringify({"where":{ day, bid, "or": fil}}));
          bistroHours.findOne({ "where": { day, "ownerId": bid, "or": fil } }, (bErr, bRes) => {
            if (bErr) resolve(false);
            if (bRes) resolve(true);
            resolve(false);
          });
        });
      };

      const getHappyHours = () => {
        return new Promise(resolve => {

          let crNdDate;

          if (date.includes('/')) {
            let dateF = date.split('/');
            crNdDate = new Date(`${dateF[2]}-${dateF[0]}-${dateF[1]}`);
          }

          if (!timeZone) timeZone = "Australia/Sydney";

          let fdate = `${crNdDate.getFullYear()}-${("0" + (crNdDate.getMonth() + 1)).slice(-2)}-${("0" + crNdDate.getDate()).slice(-2)}T00:00:00.000Z`;
          crNdDate.setDate(crNdDate.getDate() + 6);
          let tdate = `${crNdDate.getFullYear()}-${("0" + (crNdDate.getMonth() + 1)).slice(-2)}-${("0" + crNdDate.getDate()).slice(-2)}T00:00:00.000Z`;

          HappyHourDashDay.find({
            where: {
              date: {
                between: [fdate, tdate]
              },
              ownerId, status
            },
            order: "date asc"
          }, (err, res) => {
            res = JSON.parse(JSON.stringify(res));
            if (err) resolve({});
            else if (res && res.length) {

              let resValues = [];

              res.forEach((fVal, i) => {

                let hours = Number(moment.tz(new Date(), timeZone).format('HH'));
                let minutes = Number(moment.tz(new Date(), timeZone).format('mm'));
                let dfSiDate = fVal.dateFormat.split('-');
                let cDdate = `${dfSiDate[2]}-${("0" + dfSiDate[1]).slice(-2)}-${("0" + dfSiDate[0]).slice(-2)}T00:00:00.000Z`;

                if (fdate == cDdate) {
                  fVal.isPast = false;
                  if (hours < fVal.end_hour) resValues.push(fVal);
                  else if (hours == fVal.end_hour && minutes <= fVal.end_minute) resValues.push(fVal);
                  else { fVal.isPast = true; resValues.push(fVal); }
                }
                else resValues.push(fVal);
                if (res.length == (i + 1)) resolve(resValues);
              })

            }
            else resolve([]);
          })
        })
      };

      const getDailySpecial = () => {

        return new Promise(resolve => {

          let crNdDate;

          if (date.includes('/')) {
            let dateF = date.split('/');
            crNdDate = new Date(`${dateF[2]}-${dateF[0]}-${dateF[1]}`);
          }

          if (!timeZone) timeZone = "Australia/Sydney";

          let fdate = `${crNdDate.getFullYear()}-${("0" + (crNdDate.getMonth() + 1)).slice(-2)}-${("0" + crNdDate.getDate()).slice(-2)}T00:00:00.000Z`;
          crNdDate.setDate(crNdDate.getDate() + 6);
          let tdate = `${crNdDate.getFullYear()}-${("0" + (crNdDate.getMonth() + 1)).slice(-2)}-${("0" + crNdDate.getDate()).slice(-2)}T00:00:00.000Z`;

          DailySpecial.find({
            where: {
              date: {
                between: [fdate, tdate]
              },
              ownerId, status
            },
            include: [{ relation: "dailySpecialCategory" }],
            order: "date asc"
          }, (err, res) => {
            res = JSON.parse(JSON.stringify(res));
            if (err) resolve({});
            else if (res && res.length) {

              let resValues = [];

              res.forEach((fVal, i) => {

                let hours = Number(moment.tz(new Date(), timeZone).format('HH'));
                let minutes = Number(moment.tz(new Date(), timeZone).format('mm'));
                let fDatF = fVal.dateFormat.split('-');
                let cDdate = `${fDatF[2]}-${("0" + fDatF[1]).slice(-2)}-${("0" + fDatF[0]).slice(-2)}T00:00:00.000Z`;

                if (fdate == cDdate) {
                  fVal.isPast = false;
                  if (hours < fVal.endHour) resValues.push(fVal);
                  else if (hours == fVal.endHour && minutes <= fVal.endMinute) resValues.push(fVal);
                  else { fVal.isPast = true; resValues.push(fVal); }
                }
                else resValues.push(fVal);
                if (res.length == (i + 1)) resolve(resValues);
              })

            } else resolve([]);
          })

        })
      }

      const getDrinkCategories = () => {
        return new Promise(resolve => {
          DrinksCategory.find({
            "where": { "ownerId": bid },
            "include": {
              "relation": "drinksDashLines",
              "scope": {
                "include": [{ relation: "drinksDashSubLines", scope: { include: [{ relation: "drinksSpecialCategory" }], order: "order asc" } }, { relation: "drinksType" }, { relation: "drinksExtras" }, { relation: "drinksMixers" }]
              }
            }, order: "order asc"
          }, function (err, res) {
            if (err) {
              resolve([]);
            } else {
              let data = res.filter(m => { return (m.drinksDashLines && m.drinksDashLines.length) })
              resolve(data);
            }

          });
        })
      };

      const getDrinkSpecials = () => {
        return new Promise(resolve => {
          let ownerId = bid;
          DrinksSpecial.find({
            where: { ownerId }, include: [{
              relation: "drinksSpecialCategories",
              scope: {
                where: { [`${dayLowerCase}.value`]: true },
                include: [{ relation: "drinksSpecialDashLines", scope: { include: [{ relation: "drinksSpecialDashSubLines", scope: { order: "order asc" } }] } },
                { relation: "drinksCategory" }]
              }
            }]
          }, (err, res) => {
            res = JSON.parse(JSON.stringify(res));
            if (err) resolve([]);
            else if (res && res.length) resolve(res.filter(m => m.drinksSpecialCategories && m.drinksSpecialCategories.length));
            else resolve([]);
          })
        })
      };

      const getMenuHours = () => {
        return new Promise(resolve => {
          let filterForDay2 = `${dayLowerCase}.value`;
          MenuHours.find({ "where": { "ownerId": bid, [filterForDay2]: true } }, function (err, res) {
            if (err) {
              resolve([]);
            } else {
              res = JSON.parse(JSON.stringify(res));
              resolve(res);
            }
          });
        })
      };


      const getHappenings = (dateFormat) => {

        return new Promise(resolve => {
          let dateS = dateFormat.split('T')[0],
            startDate = new Date(dateS),
            endDate = new Date(dateS);
          endDate = new Date(endDate.setDate(endDate.getDate() + 7));
          let endF = `${endDate.getFullYear()}-${("0" + (endDate.getMonth() + 1)).slice(-2)}-${("0" + endDate.getDate()).slice(-2)}T23:59:59.000Z`;

          Happenings.find({
            where: { ownerId: bid, date: { gte: startDate.toJSON(), lte: endF }, status: "Live", isDeleted: false },
            include: [{ relation: "happeningsTickets" },
            { relation: "happeningsCategory" }, {
              relation: "business", scope: { "fields": businessFields }
            }],
            order: "date ASC"
          }, async (err, res) => {
            if (err) resolve([]);
            else {

              res = JSON.parse(JSON.stringify(res));

              const filteredArr = res.reduce((acc, current) => {
                const x = acc.find(item => item.groupId === current.groupId);
                if (!x) {
                  return acc.concat([current]);
                } else {
                  return acc;
                }
              }, []);

              resolve(filteredArr);
            }
          })
        })
      }

      const getSports = (dateFormat) => {

        return new Promise(resolve => {

          Sports.find({
            where: { ownerId: bid, status: "Live" }, include: [{
              relation: "sportsScheduleForAdmin",
              scope: {
                where: { date: { gte: dateFormat } },
                include: [{ relation: "sportsSchedule" },
                { relation: "competitionSchedule" },
                { relation: "sponsorDetails" },
                { relation: "sportsTeamA" },
                { relation: "sportsTeamB" }]
              }, order: "date asc"
            }]
          }, (err, res) => {
            if (err) {
              resolve([]);
            } else {
              res = JSON.parse(JSON.stringify(res));
              res = res.filter(m => m.sportsScheduleForAdmin && m.sportsScheduleForAdmin.sportsTeamA);
              resolve(res);
            }
          })
        })
      }

      const getTakeaWay = (dateFormat) => {
        return new Promise(resolve => {
          dateFormat = new Date(dateFormat);
          if (!timeZone) timeZone = "Australia/Sydney";

          let fdate = `${dateFormat.getFullYear()}-${("0" + (dateFormat.getMonth() + 1)).slice(-2)}-${("0" + dateFormat.getDate()).slice(-2)}T00:00:00.000Z`;
          dateFormat.setDate(dateFormat.getDate() + 6);
          let tdate = `${dateFormat.getFullYear()}-${("0" + (dateFormat.getMonth() + 1)).slice(-2)}-${("0" + dateFormat.getDate()).slice(-2)}T00:00:00.000Z`;

          Takeaway.find({
            where: {
              ownerId: bid, status: "Live", date: {
                between: [fdate, tdate]
              }
            },
            order: "date asc"
          }, (err, res) => {
            if (err) { console.log(err); resolve([]); }
            else {

              res = JSON.parse(JSON.stringify(res));

              var weekDayFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
              var wDaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

              //grouping of offers
              const takeawayGroups = res.reduce((takeaway, data) => {
                const date = data.date.split('T')[0];
                if (!takeaway[date]) {
                  takeaway[date] = [];
                }
                takeaway[date].push(data);
                return takeaway;
              }, {});

              const takeawayData = Object.keys(takeawayGroups).map((date) => {
                var a = new Date(date);
                return {
                  dateObj: { date: `${("0" + a.getDate()).slice(-2)}-${("0" + (a.getMonth() + 1)).slice(-2)}-${a.getFullYear()}`, fDay: weekDayFull[a.getDay()], sDay: wDaysShort[a.getDay()] },
                  date: takeawayGroups[date]
                };
              });
              //End

              resolve(takeawayData);
            }
          });
        });
      }

      const getExclusiveOffer = (dateFormat) => {

        return new Promise(resolve => {

          dateFormat = new Date(dateFormat);
          if (!timeZone) timeZone = "Australia/Sydney";
          let customerId = details.customerId;

          let fdate = `${dateFormat.getFullYear()}-${("0" + (dateFormat.getMonth() + 1)).slice(-2)}-${("0" + dateFormat.getDate()).slice(-2)}T00:00:00.000Z`;
          dateFormat.setDate(dateFormat.getDate() + limitedDays);
          let tdate = `${dateFormat.getFullYear()}-${("0" + (dateFormat.getMonth() + 1)).slice(-2)}-${("0" + dateFormat.getDate()).slice(-2)}T00:00:00.000Z`;

          if (customerId) {

            ExclusiveOffer.find({
              where: {
                ownerId: bid, status: "Live", offerDate: {
                  between: [fdate, tdate]
                }
              },
              include: [{
                relation: "claimscoupons",
                scope: { where: { customerId } }
              }],
              order: "offerDate asc"
            }, (err, res) => {
              if (err) { console.log(err); resolve([]); }
              else {

                res = JSON.parse(JSON.stringify(res));
                let resValues = [];

                let exDate = new Date(moment.tz(new Date(), timeZone).format('YYYY-MM-DD'));
                exDate.setHours(moment.tz(new Date(), timeZone).format('HH'));
                exDate.setMinutes(moment.tz(new Date(), timeZone).format('mm'));

                res.forEach((val) => {

                  if (val && val.offerDate) {
                    let offerDate = new Date(val.offerDate.split('T')[0]);
                    offerDate.setHours(Number(val.end.hour));
                    offerDate.setMinutes(Number(val.end.minutes));
                    if (val) {
                      val.isClaim = false;
                      val.claimscoupons.forEach((claim) => {
                        if (claim.exclusiveOfferId == val.id && claim.isClaim) val.isClaim = true;
                      });
                      if (offerDate.getTime() > exDate.getTime()) resValues.push(val);
                    }
                  }
                });

                resolve(resValues);
              }
            });
          } else {
            if (!customerId) resolve([{ isSuccess: false, "message": "CustomerId is required" }]);
            else if (isFutureDates) resolve([{ isSuccess: false, isFutureDates, "message": "Only return current date data!" }]);
          }
        })
      }


      async function trySwitch() {
        switch (category) {
          case 'Happyhours':
            getData().then(async (bData) => {
              if (bData && 'happyHourDashDays' in bData) {
                if (bData.happyHourDashDays && bData.happyHourDashDays.length) cb(null, { isSuccess: true, res: bData.happyHourDashDays });
                else cb(null, { isSuccess: true, res: [], stage: 1 });
              } else cb(null, { isSuccess: true, res: [], stage: 2 });
            });
            break;

          case 'Drinks':
            const startD = async () => {
              cb(null, { isSuccess: true, categories: await getDrinkCategories(), specials: await getDrinkSpecials() });
            };
            startD();
            break;

          case 'Whatson':

            const EventsWhatsonCategory = app.models.WhatsonCategory;
            var weekDayFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            var wDaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            let whatsOnsCallBack = async (whatsOns = [], happenings = [], sports = [], exclusiveOffer = [], takeaway = [], drinksFoodSpecial = []) => {

              //grouping of offers
              const offerGroups = await exclusiveOffer.reduce((offers, data) => {
                const date = data.offerDate.split('T')[0];
                if (!offers[date]) {
                  offers[date] = [];
                }
                offers[date].push(data);
                return offers;
              }, {});

              const exclusiveOffers = await Object.keys(offerGroups).map((date) => {
                var a = new Date(date);
                return {
                  dateObj: { date: `${("0" + a.getDate()).slice(-2)}-${("0" + (a.getMonth() + 1)).slice(-2)}-${a.getFullYear()}`, fDay: weekDayFull[a.getDay()], sDay: wDaysShort[a.getDay()] },
                  offersData: offerGroups[date]
                };
              });

              let exArray = [];

              exclusiveOffers.forEach(async (v, i) => {

                let groupByKey = (array, key) => {
                  return array
                    .reduce((hash, obj) => {
                      if (obj[key] === undefined) return hash;
                      return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) })
                    }, {})
                }

                let fData = await groupByKey(v.offersData, 'titleTxt');

                let aArray = [];

                Object.keys(fData).forEach((k, j) => {
                  let oSData = exclusiveOffer.find(m => m.titleTxt == k);
                  let { desc, titleTxt, title, img, status, date } = oSData;
                  aArray.push({ desc, titleTxt, title, img, status, date, values: fData[k] });
                })

                exArray.push({ dateObj: v.dateObj, offers: aArray });

                if ((i + 1) == exclusiveOffers.length) {
                  cb(null, { isSuccess: true, whatsOns, happenings, sports, exclusiveOffers: exArray, takeaway, drinksFoodSpecial });
                }
              })

              if (exclusiveOffers.length == 0) {
                cb(null, { isSuccess: true, whatsOns, happenings, sports, exclusiveOffers: exArray, takeaway, drinksFoodSpecial });
              }


            }

            let hDateFormat, hDateSplit;
            if (date.includes('/')) { hDateSplit = date.split('/'); hDateFormat = `${hDateSplit[2]}-${hDateSplit[0]}-${hDateSplit[1]}T00:00:00.000Z`; }

            let happenings = await getHappenings(hDateFormat).then(happenings => { return happenings });
            let sports = await getSports(hDateFormat).then(sports => { return sports });
            let exclusiveOffer = await getExclusiveOffer(hDateFormat).then(offer => { return offer });
            // let happyHours = await getHappyHours(hDateFormat).then(happyHours => { return happyHours });
            //  let dailySpecials = await getDailySpecial(hDateFormat).then(special => { return special });
            let takeawaysDta = await getTakeaWay(hDateFormat).then(takeaway => { return takeaway });


            let specialData = () => {
              return new Promise(async resolve => {
                await getHappyHours().then(async (hres) => {


                  hres = hres.map(obj => ({ ...obj, isDrink: true }));

                  await getDailySpecial().then((Sres) => {

                    Sres = Sres.map(obj => ({ ...obj, isDaily: true }));

                    //console.log(Sres);

                    let newData = [...Sres, ...hres];

                    if (newData && newData.length) {
                      var weekDayFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                      var wDaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


                      let groupByKey = (array, key) => {
                        return array
                          .reduce((hash, obj) => {
                            if (obj[key] === undefined) return hash;
                            return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) })
                          }, {})
                      }

                      // console.log(newData);

                      //grouping of dailySpecials
                      // const dSpecials = newData.reduce((specials, data) => {
                      //   const date = data.date.split('T')[0];
                      //   if (!specials[date]) {
                      //     specials[date] = [];
                      //   }
                      //   specials[date].push(data);
                      //   return specials;
                      // }, {});

                      const dSpecials = groupByKey(newData, 'dateFormat')

                      //console.log(dSpecials);

                      const newSpecialsData = Object.keys(dSpecials).map((date) => {

                        // console.log(date);
                        let daSpl = date.split('-');
                        var a = new Date(`${daSpl[2]}-${daSpl[1]}-${daSpl[0]}`);
                        return {
                          dateObj: {
                            date: `${("0" + a.getDate()).slice(-2)}-${("0" + (a.getMonth() + 1)).slice(-2)}-${a.getFullYear()}`,
                            fDay: weekDayFull[a.getDay()], sDay: wDaysShort[a.getDay()],
                            dateFormat: `${a.getFullYear()}-${("0" + (a.getMonth() + 1)).slice(-2)}-${("0" + a.getDate()).slice(-2)}`
                          },
                          specials: dSpecials[date]
                        };
                      });
                      //End

                      let reArraay = [];

                      // console.log(newSpecialsData);

                      newSpecialsData.forEach(async (v, i) => {



                        let fData = await groupByKey(v.specials, 'titleTxt');

                        let aArray = [];

                        Object.keys(fData).forEach((k, j) => {
                          let oSData = newData.find(m => m.titleTxt == k);
                          let { desc, titleTxt, title, img, status, date, isDrink = false, isDaily = false, ownerId } = oSData;
                          aArray.push({ desc, titleTxt, title, img, status, date, isDrink, isDaily, values: fData[k] });
                        })

                        reArraay.push({ dateObj: v.dateObj, specials: aArray });

                        if ((i + 1) == newSpecialsData.length) {
                          resolve(reArraay.sort(function (a, b) {
                            var c = new Date(a.dateObj.dateFormat);
                            var d = new Date(b.dateObj.dateFormat);
                            return c - d;
                          }))
                        }
                      })

                      if (newSpecialsData.length == 0) {
                        resolve(reArraay.sort(function (a, b) {
                          var c = new Date(a.dateObj.dateFormat);
                          var d = new Date(b.dateObj.dateFormat);
                          return c - d;
                        }))
                      }


                    } else resolve([])
                  })
                })
              });
            }

            let specialMergeRe = await specialData().then(specialMerge => { return specialMerge });

            await EventsWhatsonCategory.find({
              where: { "ownerId": bid },
              include: [{ relation: "whatsOns", scope: { include: [{ relation: "whatsOnSubCategory" }] } }]
            }, async (err, res) => {
              if (err) {
                data.isSuccess = true;
                data.res = [];
                data.message = "Error in EventsWhatsonCategory find";
                cb(null, data);
              } else {
                res = JSON.parse(JSON.stringify(res));
                await whatsOnsCallBack(res, happenings, sports, exclusiveOffer, takeawaysDta, specialMergeRe);
              }
            });
            break;

          case 'Meals':
            const start = async () => {

              let mealsObj = {},
                promises = [getMenuHours(), checkBistroTime(breakfastFilter), checkBistroTime(lunchFilter), checkBistroTime(dinnerFilter), checkBistroTime(alldayFilter)];

              const [menuHrs, bre, lu, din, alld] = await Promise.all(promises);
              mealsObj.breakfast = bre;
              mealsObj.lunch = lu;
              mealsObj.dinner = din;
              mealsObj.allday = alld;

              MealsCategory.find({
                where: { ownerId: bid, [`${dayLowerCase}.value`]: true },
                include: {
                  relation: "mealsDashLines",
                  scope: {
                    include: [{
                      relation: "dashSubLines",
                      scope: {
                        where: { [dayLowerCase]: true, isAvailable: true },
                        include: "mealsExtraDashLines"
                      }
                    }, { relation: "mealsDashLineAddons" }]
                  }
                }
              }, (err, res) => {
                if (err) {
                  data.isSuccess = true;
                  data.res = [];
                  data.message = "Error in MealsDashLine find";
                  cb(null, data);
                } else {
                  res = JSON.parse(JSON.stringify(res));
                  data.isSuccess = true;
                  data.res = (res && res.length) ? res.filter(m => {
                    if (m && m.mealsDashLines && m.mealsDashLines.length) {
                      m.inTime = (mealsObj[m.category]) ? true : false;
                      return m;
                    }
                  }) : [];
                  data.menuHours = menuHrs;
                  cb(null, data);
                }
              });
            };
            start();
            break;

          case 'Specials':
            const startS = async () => {
              let mealsObj = {},
                promises = [checkBistroTime(breakfastFilter), checkBistroTime(lunchFilter), checkBistroTime(dinnerFilter), checkBistroTime(alldayFilter)];

              const [bre, lu, din, alld] = await Promise.all(promises);
              mealsObj.breakfast = bre;
              mealsObj.lunch = lu;
              mealsObj.dinner = din;
              mealsObj.allday = alld;

              MealsCategory.find({
                "where": { "ownerId": bid },
                "include": {
                  "relation": "mealsDashLines",
                  "scope": {
                    "where": { "isSpecial": true, [dayLowerCase]: true },
                    "include": {
                      "relation": "dashSubLines",
                      "scope": {
                        "where": { "isAvailable": true },
                        "include": "mealsExtraDashLines"
                      }
                    }
                  }
                }
              }, (err, res) => {
                if (err) {
                  data.isSuccess = true;
                  data.res = [];
                  data.message = "Error in MealsDashLine find";
                  cb(null, data);
                } else {
                  res = JSON.parse(JSON.stringify(res));
                  if (res && res.length > 0) {
                    data.isSuccess = true;
                    data.res = res.filter(o => {
                      if (o && 'mealsDashLines' in o && o.mealsDashLines.length) {
                        o.inTime = (o && mealsObj[o.category]) ? true : false;
                        return o;
                      }
                    });
                    cb(null, data);
                  } else {
                    data.isSuccess = true;
                    data.res = [];
                    cb(null, data);
                  }
                }
              });
            };
            startS();
            break;

          case 'Sports':
            getData().then(async (bData) => {
              if (bData && 'dashDates' in bData) {
                let dashLineArray = (bData.dashDates.length) ? bData.dashDates[0].dashLines : [],
                  finArr = [];
                if (dashLineArray.length) {
                  let Sports = {};
                  for (let i = 0, len = dashLineArray.length; i < len; i++) {
                    if (dashLineArray[i].category == "Rugby_League" || dashLineArray[i].category == "AFL" || dashLineArray[i].category == "Rugby_Union" || dashLineArray[i].category == "Soccer" || dashLineArray[i].category == "UFC" || dashLineArray[i].category == "Cricket" || dashLineArray[i].category == "Basketball" || dashLineArray[i].category == "Surfing" || dashLineArray[i].category == "NFL") {
                      (Sports[dashLineArray[i].category]) ? Sports[dashLineArray[i].category].push(dashLineArray[i]) : Sports[dashLineArray[i].category] = [dashLineArray[i]];
                    }
                  }

                  //For Populating Array based data. asked for app side                  
                  for (let i in Sports) { finArr.push({ "name": i, "data": Sports[i] }) };

                  data.isSuccess = true;
                  data.res = finArr;
                  cb(null, data);
                } else {
                  data.isSuccess = true;
                  data.res = [];
                  cb(null, data);
                }
              } else {
                data.isSuccess = true;
                data.res = [];
                cb(null, data);
              }
            })
            break;

          case 'Features':
            getData().then(async (bData) => {
              if (bData && 'businessFeatures' in bData) {
                let featuresArray = (bData.businessFeatures.length) ? bData.businessFeatures : [];
                data.isSuccess = true;
                data.res = featuresArray;
                cb(null, data);
              } else {
                data.isSuccess = true;
                data.res = [];
                cb(null, data);
              }
            });
            break;

          default:
            data.isSuccess = true;
            data.res = [];
            data.message = "Category not Matched(Happyhours, Drinks, Whatson, Meals, Sports, Happenings, Features, Specials)";
            cb(null, data);
        }
      }


      trySwitch();

    } else {
      data.isSuccess = true;
      data.res = [];
      data.message = "Please Provide details object with businessId, date and day Properties";
      cb(null, data);
    }
  }

  Business.sendMail = (...args) => {
    let auth = {}, port, host, secure, stop, from, to, subject, text;
    for (let arg of args) {
      if (arg.auth) auth = arg.auth;
      if (arg.port) port = arg.port;
      if (arg.host) host = arg.host;
      if (arg.secure) secure = arg.secure;
      if (arg.from) from = arg.from;
      if (arg.to) to = arg.to;
      if (arg.subject) subject = arg.subject;
      if (arg.text) text = arg.text;
      if (typeof arg == "function") stop = arg;
    }
    if (auth && port && host && secure && from && to && subject && text)
      require("nodemailer").createTransport({ host, port, secure, auth })
        .sendMail({ from, to, subject, text });
    stop(null, { isSuccess: true });
  }

  Business.deleteBusinessById = function (details, cb) {
    let data = {};
    let businessId = details.businessId;
    const DashDate = app.models.DashDate;
    let count = 0;
    if (businessId) {
      Business.findOne({ "where": { "id": businessId }, "include": "dashDates" }, function (err1, res1) {
        if (err1) {
          data.isSuccess = false;
          data.message = "Error in Customer findOne";
          data.errorMessage = err1;
          cb(null, data);
        } else if (res1 && res1.id == businessId) {
          res1 = JSON.parse(JSON.stringify(res1));
          let dashDates = res1.dashDates;
          if (dashDates && dashDates.length > 0) {
            for (let i = 0; i < dashDates.length; i++) {
              DashDate.deleteById(dashDates[i].id);
            }
            Business.deleteById(businessId);
            data.isSuccess = true;
            data.message = "Business and DashDates Deleted Successfully";
            cb(null, data);


          } else {
            Business.deleteById(businessId);

            data.isSuccess = true;
            data.message = "Business Deleted Successfully";
            cb(null, data);
          }

        } else {
          data.isSuccess = false;
          data.message = "BusinessId not Found";
          cb(null, data);
        }
      })
    } else {
      data.isSuccess = false;
      data.message = "Please Provide businessId";
      cb(null, data);
    }
  };

  Business.changePasswordById = function (details, cb) {
    let data = {},
      businessId = details.businessId;
    password1 = details.password1;
    if (businessId) {
      Business.findOne({ "where": { "id": businessId } }, function (err1, user) {
        if (err1) {
          data.isSuccess = false;
          data.message = "Error in Customer findOne";
          data.errorMessage = err1;
          cb(null, data);
        } else if (user && user.id == businessId) {
          user.updateAttribute('password', Business.hashPassword(password1), function (err, userInstance) {
            if (err) {
              data.isSuccess = false;
              data.message = "Error in user updateAttribute";
              data.errorMessage = err;
              cb(null, data);
            } else {
              data.isSuccess = true;
              data.user = userInstance;
              data.message = "Business password Changed Successfully";
              cb(null, data);
            }
          });

        } else {
          data.isSuccess = false;
          data.message = "BusinessId not Found";
          cb(null, data);
        }
      })
    } else {
      data.isSuccess = false;
      data.message = "Please Provide businessId";
      cb(null, data);
    }
  };

  Business.filterBusinesses = function (params, cb) {


    let isCallBack = (isSuccess = false, message = "please try again", res = []) => cb(null, { isSuccess, message, res });


    if (params) {
      let { searchTxt, type } = params;
      if (type && searchTxt) {

        let filter = {}, fields = ["suburb", "zipCode", "businessName", "status"], isAppLive = true;
        if (type == 'nearBy') {
          filter = { where: { isAppLive, or: [{ suburb: { like: `${searchTxt}.*`, "options": "i" } }, { businessName: { like: `${searchTxt}.*`, "options": "i" } }] }, fields }
        } else if (type == 'venue') {
          filter = { where: { isAppLive, or: [{ businessName: { like: `${searchTxt}.*`, "options": "i" } }] }, fields }
        } else if (type == 'suburb') {
          filter = { where: { isAppLive, or: [{ suburb: { like: `${searchTxt}.*`, "options": "i" } }] }, fields }
        }

        Business.find(filter, (err, res) => {
          if (err) isCallBack(false, 'Error', []);
          else {
            res = JSON.parse(JSON.stringify(res));

            res = res.filter(m => m.status == 'active' || m.status == 'Active L1' || m.status == 'Active L2');

            let result = [];

            res.forEach(m => {
              if (type == 'nearBy') {
                if (m.zipCode) result.push(`${m.suburb}|${m.zipCode}`)
                result.push(`${m.businessName}|${m.suburb}`)
              } else {
                result.push(`${m.businessName}|${m.suburb}`)
              }
            })

            result = [...new Set(result)]

            isCallBack(true, 'Success', result);
          }
        })

      } else {
        isCallBack(false, 'Type and searchTxt is required', []);
      }
    } else {
      isCallBack(false, 'Params is required!', []);
    }
  };

  Business.getAllConfig = (params, cb) => {

    let isSuccess = (isSuccess = false, message = 'Please try again!', result = {}) => cb(null, { isSuccess, message, result });

    if (params) {
      let { ownerId, customerId } = params;

      if (ownerId) {

        const Customer = app.models.Customer;

        let filter = {
          where: { id: ownerId }, include: [{ relation: "venueSettings" },
          { relation: "venueTags" },
          { relation: "bistroHours" },
          { relation: "weeklyTimings" }],
          fields: ["email", "businessName", "location", "addressLine1", "addressLine2", "zipcode", "suburb", "weeklyTimings", "venueSettings", "bistroHours", "venueTags", "imageUrl", "primaryImage", "secondaryImage", "videos", "id", "venueInformation", "website", "status", "isQrCode", "isBeacon"]
        }

        let callVenue = () => {
          Business.findOne(filter, (err, res) => {
            if (err) isSuccess(false, "Error", err);
            else {
              res = JSON.parse(JSON.stringify(res));
              let days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
              if (customerId) {
                if (res && res.venueAccessLevels.length && res.venueAccessLevels[0].ownerId == ownerId && res.venueAccessLevels[0].customerId == customerId) {
                  res.venueAccess = { interest: true }
                } else res.venueAccess = { interest: false }
              }
              res.secondaryImage = res.secondaryImage.filter(value => Object.keys(value).length !== 0);
              if (res.bistroHours && res.bistroHours.length) {
                let bistroHours = { sunday: [], monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [] }
                let data = res.bistroHours;
                data.forEach(v => {
                  days.forEach(m => {
                    if (v[m] && v[m].startTime && v[m].endTime) {
                      bistroHours[m].push({
                        startTime: v[m].startTime, endTime: v[m].endTime,
                        menu: v['menu'], ownerId: v['ownerId'], id: v['id']
                      })
                    }
                  })
                })
                delete res.bistroHours;
                res.bistroHours = bistroHours;
                isSuccess(true, "Success", res);
              } else {
                isSuccess(true, "Success", res);
              }
            }
          })
        }

        if (customerId) {
          Customer.find({ where: { id: customerId } }, (cerr, cres) => {
            if (cerr) isSuccess(false, "Error", cerr);
            else if (cres && cres.length) {
              filter = {
                where: { id: ownerId }, include: [{ relation: "venueAccessLevels" }, { relation: "venueSettings" },
                { relation: "venueTags" },
                { relation: "bistroHours" },
                { relation: "weeklyTimings" }],
                fields: ["email", "businessName", "location", "addressLine1", "addressLine2", "zipcode", "suburb", "weeklyTimings", "venueSettings", "bistroHours", "venueTags", "imageUrl", "primaryImage", "secondaryImage", "videos", "id", "venueInformation", "website", "status", "isQrCode", "isBeacon"]
              }
              callVenue();
            } else {
              isSuccess(false, "Please enter vaild customerId", {});
            }
          })
        } else callVenue();


      } else isSuccess(false, "Owner id is required!");

    } else isSuccess();
  }

  Business.createQrCode = (params, cb) => {
    let isSuccess = (isSuccess = false, message = 'Please try again!', result = {}) => cb(null, { isSuccess, message, result });
    if (params) {
      let { id } = params;
      if (id) {

        let qrc = String(id);
        let pathf = path.resolve(__dirname, '..', '..');

        var qrc_png = qr.image(qrc, { type: 'png', ec_level: 'H', size: 20, margin: 0 });

        qrc_png.pipe(require('fs').createWriteStream(`${pathf}/client/uploads/qr-images/${uuidv4()}.png`));

        let qrImageUrl = `uploads/qr-images/${uuidv4()}.png`;

        var qrCode = 'data:image/png;base64,' + qr.imageSync(qrc, { type: 'png' }).toString('base64');

        Business.upsertWithWhere({ id }, { qrImageUrl, qrCode }, (err, res) => {
          if (err) isSuccess(false, "Error", err)
          else {
            isSuccess(true, "Success", res)
          }
        })
      } else isSuccess(false, "Id is required!", {})
    } else isSuccess(false, "Params is required!", {})
  }

  Business.reset_pwd_g_link = (params, cb) => {

    let { email } = params;

    const TokenSession = app.models.TokenSession;

    Business.find({ where: { email } }, (err, res) => {

      res = JSON.parse(JSON.stringify(res));

      if (res && res.length == 1) {

        var token = jwt.sign({ email }, `${jwtKey.key}`, { expiresIn: '30m' });

        TokenSession.find({ where: { email } }, (t_err, t_res) => {
          if (t_res && t_res.length) {
            cb(null, { message: "Already sent token!" });
          } else {

            TokenSession.create({ token, email });

            transporter.sendMail({
              from: 'barm8global@gmail.com',
              to: `${email}`,
              bcc: 'sureshmcangl@gmail.com',
              subject: 'Complete your password reset request',
              text: `Complete your password reset request`,
              html: `<table class="m_2190800401465001921container-table m_2190800401465001921-important" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0;background-color:rgb(234,234,234)">
              <tbody>
                <tr>
                  <td class="m_2190800401465001921container" align="center" style="margin-top:0;background-color:rgb(234,234,234)">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0"> 
                  <tbody>
                   <tr> 
                    <td class="m_-8896756187286798627spacer" style="padding:40px 0 0 0;font-size:0;line-height:0"> &nbsp; </td> 
                   </tr> 
                  </tbody>
                 </table>
                    <table class="m_2190800401465001921content-shell-table" width="500" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0;background-color:rgb(255,255,255)">
                      <tbody>
                        <tr>
                          <td class="m_2190800401465001921pixel">
                            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIUAAAAyCAMAAABFy+jDAAAAclBMVEVHcEz1oxn6qRf7qRj6pxv7qRj0nwP8qxn7qRj7qRj6qBf+qRv7qRj7qRj7qRj6qRj7qBj7qRj7qBj7qRj7qBj7qRj7qRj7qRj7qRj7qRj7qRj7qRj7qRj7qRj7qRj7qRj8qRj7qRj8qhn/rBn/rxr/sxoKa7TjAAAAInRSTlMABQ5rEuoC/PjxFwger+EoT7ijMprUWHbagMfARTtgzomSIKC5fgAABbVJREFUWMPtWNmW4koOlJfcbKf3FWNjh+T//8V5AKqoaorq7rlzX6b05gOkQxFSSAnRT/zET/zEPxDJ8j87uojatgx+55tx3f0XMEJff43BK2etG9JvIRTNYLD9NYh0Ni56h9SeireHIFKWWZjViySLdfNdrpRygJun5u9Q1AaY7w+ZNxLd+U8nBzG+TPZj+EKTZh+VswYswgALWzf/jSyRBXC6g6gMpI6vD7q3DN+EQeiPPX5K464smEXU3G4586UfvJX8/McgGgXATm9M4B1FfBEXhZposEf7FEXkmMX6qEjisDesoiANi+pokz8EEZwAQGXXTqsNACn1DZPYPSWiyOGYnpbnYI8xysKAiOKReU6J6NwdD5X1e7FZAMZrIqJ4NwDE3zNJDDxR0lowyudEnrbsCi+YmFVPFG/KyPyHKM4KANz5WosW1rI963u7VKKGtbPAF4KQju8UFQ6oKIg6Cxx7+Pxt/b7op00KALgERKQjK5cLPx6xWDgHMO/fCa0rcH5eLw7g41To532Q2+7ZQZPl3MBGRESlk1PrJH/vs6IFAMilDL/jtLSA6xzAkkfJcxDJzO8m8BDLyM5buJiIFiX55OXY3jiulQXAbkq+9W/dAQDAtuqTr2z2nB/bM2G9kWkEaiIqOnZDZGW8UZG0VwzM43fdn5T7DQTUtnyJWJ/zI3re7eqsgDNRPLPZm9MbFUNuAQgunZj2BRV69Z1y9gYCxqncRx+07+tquCqUVuJ+rfLixEcUOeQBpa3hKoyEr7ZXzA6A2HaJS8t5+cJuZgO+qXEL61SbvWl+cda44Yp4zq0ZPzfxbrhLWouW9GC5y4qTHHtKRP1oALZbEWqK20PaFwN1sAcsAFtVVVXNl9zKISbvr+mvChCer2mUVePB/uNh5cjHShegpNKxWiiSa9pRDoDbIiUi0uV7rTydJFmWtBZmiq+RJNl5OLErNRH1Dsy+ub23nqhiPn1AEdYipyzM2cSFYhfpbJajDonKnMH5OXzTTUz0erPIgfxdb63TuFd5RtQosFvDphoCImp8c85ZpuBTaUqvG8Vd0sHsKfWG3UqUzQyZ330nqUX2lzvOZIFPOLWXXgcXQC1BMl8LY5/iytwn1j3FWaTKqHTsK2AOKfEiVUY0WPDjNIpbEZ+9omIE8k+2ll2OTQ8WbtGhN6x6oqVuIgdZPzjaZMC9ptXBWeQZ0WLZDppSL7CPdZDd0H3Zq5EDr59AVEa2JAd6ndYG4lPS+5DMLD7+5JriM6LVAbALUTiJXBqi4iTSPma2KJY6ebUaMLqPVPSdwdFHFj5IawNWEVG0h71i2xBReJcv3IVtr4lKB2DVRNnI3AZEzUWOXn8QBDLpr1H0iuXxB9R4B0iXeIMmrszYHl1Bq29oM1LHRMmpv1u646NOiChULFNKpMtbm2azHA8ulW4W8nK/94YvDzSfvbKAqLMeYaIOl2Y6unK7lJp2SB1QOd4XpqSWW0dT300hEcW1SJUSkW6vsG55VRZsnw1CKtqeiKgZH6jIhpOzAI5uCSgHHFeJ7g/YrgyIVsWuy1V0l6+3OG7LZXDdUwrLN59tOnFXMtLSKwOxz+8izdhqItrsnYpmqJQDALFbpolaFjvERMl22orgutEf8Ev6VsLC6sNwCCLhrriPPnHVNOxz7ixYxvK5WWTe1AsFs8iaLetW5coZACxub0Iionhds5SIdBiHd58tsvithFYDqT+cHVfM/vZ5UNQQay1YRLroq+VCl4pVPlpAKeWsAcAsmKPiznjwci3JZvk8JxPL6uF6VkT1aexO9bAkX7tmsHg+hBnMzCIiPNZrEX97lbyPsV+ooAzSPTiTTsM4SeLw9Yk6bqJ6HvM8705+j85ZEgb021Eev6wMYSVe/80VN4yTJEmSOA7TP/x9MR6fqCDdzP2//F9HUM6/bE/Bb+v5z8H491/5Ez/xE/+H8R+cuocxoLwwXgAAAABJRU5ErkJggg==" style="display:block;border:none;outline:none;border-collapse:collapse;overflow:hidden;height:1px;width:1px;border:0;margin:0;padding:0" border="0" class="CToWUd" /> </td>
                        </tr>
        
                        <tr>
                          <td class="m_2190800401465001921content-shell" align="center">
                            <table class="m_2190800401465001921gem-element-nflxLogo" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0">
                              <tbody>
                                <tr>
                                  <td class="m_2190800401465001921content-padding" style="padding-top:20px;padding-left:40px;padding-right:40px" align="left"> <a href="https://barm8.com.au/" style="color:inherit" target="_blank" data-saferedirecturl="https://barm8.com.au/"> <img alt="BarM8" src="http://barm8.com.au/logo.png" width="100" border="0" style="display:block;border:none;outline:none;border-collapse:collapse;border-style:none" class="CToWUd"> </a> </td>
                                </tr>
                              </tbody>
                            </table>
                            <table align="left" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0">
                              <tbody>
                                <tr>
                                  <td class="m_2190800401465001921gem-copy m_2190800401465001921content-padding m_2190800401465001921gem-h1" align="left" style="padding-top:20px;color:#221f1f;font-family:NetflixSans-Bold,Helvetica,Roboto,Segoe UI,sans-serif;font-weight:700;padding-left:40px;padding-right:40px;font-size:36px;line-height:42px;letter-spacing:-1px"> Reset your password </td>
                                </tr>
                              </tbody>
                            </table>
                            <table align="left" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0">
                              <tbody>
                                <tr>
                                  <td class="m_2190800401465001921gem-copy m_2190800401465001921content-padding m_2190800401465001921gem-p" align="left" style="padding-top:20px;color:#221f1f;padding-left:40px;padding-right:40px;font-family:NetflixSans-Light,Helvetica,Roboto,Segoe UI,sans-serif;font-weight:300;font-size:16px;line-height:21px;font-size:16px;line-height:21px"> Hi ${res.businessName ? res.businessName : ''} </td>
                                </tr>
                              </tbody>
                            </table>
                            <table align="left" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0">
                              <tbody>
                                <tr>
                                  <td class="m_2190800401465001921gem-copy m_2190800401465001921content-padding m_2190800401465001921gem-p" align="left" style="padding-top:20px;color:#221f1f;padding-left:40px;padding-right:40px;font-family:NetflixSans-Light,Helvetica,Roboto,Segoe UI,sans-serif;font-weight:300;font-size:16px;line-height:21px;font-size:16px;line-height:21px"> Let's reset your password so you can get back to watch. </td>
                                </tr>
                              </tbody>
                            </table>
                            <table class="m_2190800401465001921gem-single-button-shell m_2190800401465001921button-mobile-flex" width="100%" align="center" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0">
                              <tbody>
                                <tr>
                                  <td class="m_2190800401465001921gem-single-button m_2190800401465001921content-padding" style="padding-top:20px;padding-left:40px;padding-right:40px" align="center">
                                    <table class="m_2190800401465001921gem-single-button m_2190800401465001921button-1-table" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0;width:100%">
                                      <tbody>
                                        <tr>
                                          <td class="m_2190800401465001921gem-single-button m_2190800401465001921button-1-text m_2190800401465001921gem-h5 m_2190800401465001921button-text-light" style="background-color:#faa141;border:solid 1px #faa141;font-family:NetflixSans-Bold,Helvetica,Roboto,Segoe UI,sans-serif;font-weight:700;color:rgb(255,255,255);border-radius:4px;text-decoration:none;text-align:center;padding:13px 0 13px 0;width:100%;font-size:14px;line-height:17px;letter-spacing:-0.2px"> <a class="m_2190800401465001921gem-single-button m_2190800401465001921button-text-light m_2190800401465001921gem-h5" href="https://barm8.com.au/request-to-reset-password?pwdtoken=${token}" style="text-decoration:none;display:block;padding-left:20px;padding-right:20px;font-family:NetflixSans-Bold,Helvetica,Roboto,Segoe UI,sans-serif;font-weight:700;color:inherit;color:rgb(255,255,255);font-size:14px;line-height:17px;letter-spacing:-0.2px" target="_blank">Reset Password</a> </td>
                                        </tr>
                                      </tbody>
                                    </table> </td>
                                </tr>
                              </tbody>
                            </table>
                            <table align="left" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0">
                              <tbody>
                                <tr>
                                  <td class="m_2190800401465001921gem-copy m_2190800401465001921content-padding m_2190800401465001921gem-p" align="left" style="padding-top:20px;color:#221f1f;padding-left:40px;padding-right:40px;font-family:NetflixSans-Light,Helvetica,Roboto,Segoe UI,sans-serif;font-weight:300;font-size:16px;line-height:21px;font-size:16px;line-height:21px"> If you did not ask to reset your password, you may want to review your <a href="https://barm8.com.au/login" style="text-decoration:underline;color:inherit" target="_blank" data-saferedirecturl="https://barm8.com.au/login">recent account access</a> for any unusual activity. </td>
                                </tr>
                              </tbody>
                            </table>
                            <table align="left" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0">
                              <tbody>
                                <tr>
                                  <td class="m_2190800401465001921gem-copy m_2190800401465001921content-padding m_2190800401465001921gem-p" align="left" style="padding-top:20px;color:#221f1f;padding-left:40px;padding-right:40px;font-family:NetflixSans-Light,Helvetica,Roboto,Segoe UI,sans-serif;font-weight:300;font-size:16px;line-height:21px;font-size:16px;line-height:21px"> We're here to help if you need it. Visit the <a href="https://barm8.com.au/contact" style="text-decoration:underline;color:inherit" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://barm8.com.au/contact">contact us</a>. </td>
                                </tr>
                              </tbody>
                            </table>
        
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0">
                              <tbody>
                                <tr>
                                  <td class="m_2190800401465001921spacer" style="padding:25px 0 0 0;font-size:0;line-height:0"> &nbsp; </td>
                                </tr>
                              </tbody>
                            </table>
        
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0">
                              <tbody>
                                <tr>
                                  <td class="m_2190800401465001921content-padding" style="padding-top:0;padding-left:40px;padding-right:40px">
                                    <table align="left" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0">
                                      <tbody>
                                        <tr>
                                          <td class="m_2190800401465001921empty" style="border-top:2px solid #221f1f;font-size:0;line-height:0"> &nbsp; </td>
                                        </tr>
                                      </tbody>
                                    </table> </td>
                                </tr>
                              </tbody>
                            </table>
                            <table cellpadding="0" cellspacing="0" border="0" style="border-spacing:0">
                            </table> 
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing:0"> 
                       <tbody>
                        <tr> 
                         <td class="m_-8896756187286798627spacer" style="padding:40px 0 0 0;font-size:0;line-height:0"> &nbsp; </td> 
                        </tr> 
                       </tbody>
                      </table>
                            </td>
                      </tr>
                    </tbody>
                  </table>`
            });
            setTimeout(function () {
              cb(null, { message: "Success" })
            }, 200);
          }
        })
      } else if (res.length == 0) {
        cb(null, { message: "Invaild mail address!" });
      }
    })


  }

  //updateEmailAndPwd

  Business.remoteMethod('reset_pwd_g_link', {
    http: { path: '/reset_pwd_g_link', verb: 'get' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "reset_pwd_g_link"
  });

  Business.remoteMethod('updateEmailAndPwd', {
    http: { path: '/updateEmailAndPwd', verb: 'POST' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "updateEmailAndPwd"
  });

  Business.remoteMethod('createQrCode', {
    http: { path: '/createQrCode', verb: 'POST' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "createQrCode"
  });

  //updateBookingURl
  Business.remoteMethod('updateBookingURl', {
    http: { path: '/updateBookingURl', verb: 'POST' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "updateBookingURl"
  });

  Business.remoteMethod('getDataByCategory_v2', {
    http: { path: '/getDataByCategory_v2', verb: 'GET' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "get Data By Category_v2"
  });

  Business.remoteMethod('getVenuesAndAllData', {
    http: { path: '/getVenuesAndAllData', verb: 'GET' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "get All venues and events & Sports"
  });

  Business.remoteMethod('userLogin', {
    http: { path: '/userLogin', verb: 'GET' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "user login from web site"
  });

  Business.remoteMethod('isInActive', {
    http: { path: '/isInActive', verb: 'get' },
    returns: { arg: 'data', type: 'object' },
    description: "IN Active all business"
  });

  Business.remoteMethod('getOffersByCategory', {
    http: { path: '/getOffersByCategory', verb: 'get' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "getOffersByCategory"
  });

  Business.remoteMethod('getOffersByCategory_V2', {
    http: { path: '/getOffersByCategory_V2', verb: 'get' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "getOffersByCategory_V2"
  });

  Business.remoteMethod('currentVisitReset', {
    http: { path: '/currentVisitReset', verb: 'post' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "current visit is reset the API"
  });

  Business.remoteMethod('getAllConfig', {
    http: { path: '/getAllConfig', verb: 'get' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get config data for Bistro, weeklytimings , venue settings , venue features"
  });

  Business.remoteMethod('updateBusinessAttributes', {
    http: { path: '/updateBusinessAttributes', verb: 'post' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "update business attributes"
  });

  Business.remoteMethod('sendMail', {
    http: { path: '/sendMail', verb: 'get' },
    accepts: { arg: 'args', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "send mail"
  });

  Business.remoteMethod('getAllCategory1', {
    http: { path: '/getAllCategory1', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get the Business details by Date and businessId."
  });

  Business.remoteMethod('getSpecials', {
    http: { path: '/getSpecials', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get Specials by present time for business."
  });

  Business.remoteMethod('getAllCategory', {
    http: { path: '/getAllCategory', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get the Business details by Date and businessId."
  });

  //Specials Added
  Business.remoteMethod('getDataByCategory', {
    http: { path: '/getDataByCategory', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get the Business details by category."
  });

  //01-06-2021- 
  Business.remoteMethod('getDataByCategory_v1', {
    http: { path: '/getDataByCategory_v1', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get the Business details by category."
  });

  Business.remoteMethod('sendApprovedInfoToEmail', {
    http: { path: '/sendApprovedInfoToEmail', verb: 'post' },
    accepts: { arg: 'details', type: 'object', http: { source: 'body' } },
    returns: { arg: 'data', type: 'object' },
    description: "Sends Qrcode and other info of Business to their emailId after Admin Approved."
  });

  Business.remoteMethod('getCategoriesFormDB', {
    http: { path: '/getCategoriesFormDB', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "get all categories for dashboard display."
  });

  Business.remoteMethod('sendApprovedInfoToEmail1', {
    http: { path: '/sendApprovedInfoToEmail1', verb: 'post' },
    accepts: { arg: 'details', type: 'object', http: { source: 'body' } },
    returns: { arg: 'data', type: 'object' },
    description: "Sends Qrcode and other info of Business to their emailId after Admin Approved."
  });

  Business.remoteMethod('sendInstantPrizeWinnersInfoToAdmin', {
    http: { path: '/sendInstantPrizeWinnersInfoToAdmin', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "sends Instant Prize Winners Info to Admin."
  });

  Business.remoteMethod('sendWeeklyPrizeWinnersInfoToAdmin', {
    http: { path: '/sendWeeklyPrizeWinnersInfoToAdmin', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "sends Weekly Prize Winners Info to Admin."
  });

  Business.remoteMethod('sendBulkNotificationInfoToAdmin', {
    http: { path: '/sendBulkNotificationInfoToAdmin', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "sends Bulk notification Info to Admin."
  });

  Business.remoteMethod('sendWhatshotWinnersInfoToAdmin', {
    http: { path: '/sendWhatshotWinnersInfoToAdmin', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "sends Whats hot Winners Info To Admin."
  });

  Business.remoteMethod('sendPromoWinnersInfoToAdmin', {
    http: { path: '/sendPromoWinnersInfoToAdmin', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "sends Promo giveaway Winners Info To Admin."
  });

  Business.remoteMethod('findVisitCount', {
    http: { path: '/findVisitCount', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Finds Count of Visits for the BusinessId in the given Duration...."
  });

  Business.remoteMethod('createCurrentVisit', {
    http: { path: '/createCurrentVisit', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "create CurrentVisit...."
  });

  Business.remoteMethod('filterCategories', {
    http: { path: '/filterCategories', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get  the Businessess in the given criteria...."
  });

  Business.remoteMethod('getBusinessessForLikes', {
    http: { path: '/getBusinessessForLikes', verb: 'get' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get the Businessess in the given Array of Ids got by customer Id...."
  });

  Business.remoteMethod('deleteBusinessById', {
    http: { path: '/deleteBusinessById', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Deletes Business by Id...."
  });

  Business.remoteMethod('changePasswordById', {
    http: { path: '/changePasswordById', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Change Business password by Id..."
  });

  Business.remoteMethod('getTeaserMessages', {
    http: { path: '/getTeaserMessages', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "add Interested Count of premium and send notification to customer for given id..."
  });

  Business.remoteMethod('filterBusinesses', {
    http: { path: '/filterBusinesses', verb: 'get' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Get matched instance of businesses in the given properties..."
  });


  Business.remoteMethod('getAllDataOnToday', {
    http: { path: '/getAllDataOnToday', verb: 'get' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "getAllDataOnToday"
  });

  Business.remoteMethod('updateAppStatus', {
    http: { path: '/updateAppStatus', verb: 'post' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "updateAppStatus"
  });

  Business.remoteMethod('updateStatus', {
    http: { path: '/updateStatus', verb: 'post' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "updateStatus"
  });

  Business.remoteMethod('getVenueConfig', {
    http: { path: '/getVenueConfig', verb: 'get' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "getVenueConfig"
  });

  Business.remoteMethod('errorSendToMe', {
    http: { path: '/errorSendToMe', verb: 'get' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Send to mail info@barm8.com.au"
  });

  Business.remoteMethod('sendToInfoBarm8', {
    http: { path: '/sendToInfoBarm8', verb: 'get' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Send to mail info@barm8.com.au"
  });

  Business.remoteMethod('contactUS', {
    http: { path: '/contactUS', verb: 'get' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Send to mail info@barm8.com.au"
  });
};
