
const voucher = require('voucher-code-generator'),
      app = require('../../server/server');

module.exports = function(Userticket) {
  Userticket.validatesUniquenessOf('ticketUid');	
  Userticket.observe('before save', (ctx, next) => {
    const Tickets = app.models.Tickets;
  //For genereting ticketUid 
    const ticketCodeGeneration = () => {
		return new Promise(resolve => {
			let uCode = voucher.generate({ length: 8, count: 1, prefix: "BM8", charset: voucher.charset("alphabetic") });
			if(uCode && uCode.length){
				Userticket.findOne({ "where": { "ticketUid": (uCode[0]).toUpperCase() } }, (err1, res1) => {
					if (err1) console.log(err1);
					if (res1) resolve(`${uCode[0]}1`); else resolve(uCode[0]);
				});
			}else resolve('');
		});
    }; 
 // For Updating Count in ticket
    const updateAvailCount = tId => {
    	return new Promise(resolve => {
            Tickets.findById(tId, { "fields": ["id", "availCount", "bookedCount"] }, (err, res) => {
		        if (res) {
					let availCount = (res.availCount && res.availCount > 0) ? (res.availCount - 1) : 0,
						bookedCount = (res.bookedCount) ? (res.bookedCount + 1) : 1;
		          res.updateAttributes({ availCount, bookedCount }, (uErr, uRes) => {
		               if (uErr) console.log(uErr); else resolve("ok");                        
		          });
		        }
		     });
    	});
    }

    if (ctx.isNewInstance && ctx.instance.ticketsId) {
	    start = async () => {
			ctx.instance.ticketUid = await ticketCodeGeneration();
			if(ctx.instance.ticketUid)
			await updateAvailCount(ctx.instance.ticketsId);
			next();
		};
    	start();
    } else {
    	next();
    }    
  });
};
