

module.exports = function (Notification) {


  Notification.getNotification = (params, cb) => {
    let isCallBack = (isSuccess, message, result = []) => cb(null, { isSuccess, message, result });
    Notification.find({ where: { category: "Special", status: "Open" } }, (err, res) => {
      if (err) isCallBack(false, "Error", result)
      else isCallBack(true, "Success", res)
    })
  }

  Notification.removeNotification = (params, cb) => {
    let isCallBack = (isSuccess, message, result = {}) => cb(null, { isSuccess, message, result });
    if (params && params.id) {
      Notification.deleteById(params.id)
      setTimeout(function () {
        isCallBack();
      }, 300);
    } else isCallBack();
  }

  Notification.remoteMethod('getNotification', {
    http: { path: '/getNotification', verb: 'get' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "getNotification"
  });

  Notification.remoteMethod('removeNotification', {
    http: { path: '/removeNotification', verb: 'post' },
    accepts: { arg: 'params', type: 'object' },
    returns: { arg: 'data', type: 'object' },
    description: "remove the old data."
  });
};
