
const app = require('../../server/server');
const moment = require('moment-timezone');

module.exports = function(Sportsdate) {


    Sportsdate.updateLive = (params = {}, cb) => {

        let isCallBack = (isSuccess = false, message = "please try again", result = {}) => cb(null, { isSuccess, message, result });

        if(params){
            let { id , timeZone = "Australia/Sydney" ,  country = "Australia"  , status } = params;
            let momentdate = new Date(),
            liveDate = moment.tz(momentdate, timeZone).format('YYYY-MM-DD') + 'T00:00:00.000Z',
            date =  moment.tz(momentdate, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z",
            dateStr = moment.tz(momentdate, timeZone).format('DD-MM-YYYY'),
            liveTime = moment.tz(momentdate, timeZone).format('hh:mm A'),
            dateNo = Number(moment.tz(momentdate, timeZone).format('DD')),
            month = Number(moment.tz(momentdate, timeZone).format('MM')),
            year = Number(moment.tz(momentdate, timeZone).format('YYYY')),
            hour = Number(moment.tz(momentdate, timeZone).format('HH')),
            minute = Number(moment.tz(momentdate, timeZone).format('MM'));
            Sportsdate.upsertWithWhere({ id }, { status , liveDate  , liveTime , live : { date  , dateStr , time : liveTime , dateNo , month , year , hour , minute } }, (err , res)=>{
                isCallBack(true , "Success" , {});
            })
          
        } else isCallBack();
    }

    Sportsdate.remoteMethod('updateLive', {
        http: { path: '/updateLive', verb: 'get' },
        accepts: { arg: 'params', type: 'object' },
        returns: { arg: 'data', type: 'object' },
        description: "updateLive"
    });
};
