


module.exports = (Booking) => {

  Booking.validatesUniquenessOf("bId");

  Booking.observe('before save', function event(ctx, next) {
    prefix = (str, max) => { str = str.toString(); return str.length < max ? prefix("0" + str, max) : str; }
    if (!ctx.where && ctx.instance) Order.count((Err, Res) => { ctx.instance.bId = `BI${prefix((parseInt(Res) + 1), parseInt(Res.toString().length) + 6)}`; next(); })
    else next();
  });

  Booking.eventBooking = (details, cb) => {

   let  response = (isSuccess, message, resp = {}) => cb(null, { isSuccess, message, res: resp });

    if (details && 'customerId' in details && 'dashLineId' in details && 'date' in details) {
      Booking.create(details, (err, res) => { if (err) response(false, "Error in Booking create"); response(true, "Booking Successfull" , res); });
    } else response(false, "Missing properties from customerId, dashLineId or date in details");
  };

  Booking.remoteMethod('eventBooking', {
    http: { path: '/eventBooking', verb: 'post' }, accepts: { arg: 'details', type: 'object' },
    returns: { arg: 'data', type: 'object' },  description: "For event booking."
  });
};
