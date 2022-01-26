'use strict';
let app = require('../../server/server');

module.exports = function(Contract) {
    Contract.updateEmailInBusiness = function(cb){
    const Business = app.models.Business;

    	let data = {};
          Business.find(function(err, res){
            if(err){
            	console.log(err);
            	data.isSuccess = false;
            	data.message = "Error in Business find";
           cb(null, data);
            }else if(res && res.length > 0){
            	let count = 0,
            	   count1 = 0,
            	   count2 = 0;
               for(let i = 0;i < res.length;i++){
                  if(res[i].email == ""){
                         if(res[i].confirmEmail){
                            let bussId = res[i].id || "abcd";
                           Business.upsertWithWhere({"id": bussId},{"email": res[i].confirmEmail});
                            count++;
                            count1++; 
                         }else if(res[i].username){
                         	let un = res[i].username;
                         	un = un.replace(/\s/g,'');
                             let bussId = res[i].id || "abcd";                         	
                           Business.upsertWithWhere({"id": bussId},{"email": un});
                            count++;
                            count1++; 
                         }else{
                            let bussId = res[i].id || "abcd",
                                bussEmail = res[i].businessName;
                                bussEmail = bussEmail.replace(/\s/g,'');
                                bussEmail = bussEmail + "@barmate.com";
                           Business.upsertWithWhere({"id": bussId},{"email": bussEmail});
                            count++;
                            count1++; 
                         }
                       
                     if(count == res.length){
                       data.isSuccess = true;
                       data.total = count;
                       data.updatedEmailCount = count1;
                       data.existEmailCount = count2;
                       cb(null, data);
                     }
                  }else{
                  	 count++; 
                     count2++;
                      if(count == res.length){
                       data.isSuccess = true;
                       data.total = count;
                       data.emptyEmailCount = count1;
                       data.existEmailCount = count2;
                       cb(null, data);
                     }
                  }

               }
            }else{
            	console.log(res);
            	data.isSuccess = false;
            	data.message = "Error in Business find";
            	cb(null, data);
            }
          });
    }

    Contract.remoteMethod('updateEmailInBusiness', {
    http: { path: '/updateEmailInBusiness', verb: 'post' },
    returns: { arg: 'data', type: 'object' },
    description: "Bulk update of email in Businesses."
  });
};
