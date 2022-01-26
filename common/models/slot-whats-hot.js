

module.exports = function (Slotwhatshot) {

  Slotwhatshot.createSlot =  (details, cb) => {
    const app = require('../../server/server'),
      DashLine = app.models.DashLine;
    let data = {},
      endTime = details.endTime,
      ownerId = details.ownerId,
      offset = details.offset,
      dashLineId = details.dashLineId;
    if (endTime && ownerId && offset && dashLineId) {
      endTime = new Date(endTime);
      // slotArr.push(obj);
      Slotwhatshot.create({  "date": endTime, dashLineId , ownerId },  (swErr, swRes)  => {
        if (swErr) {
          data.isSuccess = false;
          data.message = "Error in Slotwhatshot create";
          cb(data);
        } else {
          data.isSuccess = true;
          data.message = "Slotwhatshot created";
          cb(data);
        }
      });
    } else {
      data.isSuccess = false;
      data.message = "Something missing,Please Provide all details";
      data.details = details;
      cb(data);
    }
  };



  Slotwhatshot.removeSlotForWhatshot = function (details, cb) {
    let data = {},
      dashLineId = details.dashLineId;

    if (dashLineId) {

      Slotwhatshot.findOne({ where: { dashLineId } }, (err, res) => {
        if (err) {
          console.log(err);
          data.isSuccess = false;
          data.message = "Error in Slotwhatshot findOne";
          cb(null, data);
        } else if (res && res.dashLineId == dashLineId) {

          if (res.id) {
            Slotwhatshot.destroyById(res.id);
            data.isSuccess = true;
            data.message = "Slotwhatshot Removed";
            cb(null, data);
          } else {
            data.isSuccess = false;
            data.message = "Please Provide dashLineId Property";
            data.details = details;
            cb(null, data);
          }
        } else {
          data.isSuccess = false;
          data.message = "No Slotwhatshot found with given dashLineId " + dashLineId;
          cb(null, data);
        }

      });
    } else {
      data.isSuccess = false;
      data.message = "Please Provide dashLineId Property";
      data.details = details;
      cb(null, data);
    }
  };



  Slotwhatshot.remoteMethod('createSlot', {
    http: { path: '/createSlot', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Create Slot by given details.."
  });

  Slotwhatshot.remoteMethod('removeSlotForWhatshot', {
    http: { path: '/removeSlotForWhatshot', verb: 'post' },
    accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "Remove Whatshot slot by given dashLineId.."
  });
};
