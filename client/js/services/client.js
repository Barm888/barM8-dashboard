'use strict';

(function () {
  angular.module('myApp')

    .factory('ClientServ', ['$window', '$http', ClientServ]);

  function ClientServ($window, $http) {


    function verifyRegister(profilename, businessname, businessnumber, address, contactname, phone, email, password) {
      // console.log("hello");
      // console.log(firstname);
      let params = {
        details: {
          profileName: profilename,
          businessName: businessname,
          businessNumber: businessnumber,
          address: address,
          contactName: contactname,
          phone: phone,
          email: email,
          password: password  
        }

      };
      // console.log("hello server");

      return $http.post('http://139.59.71.224:3009/api/Registers/registerBusiness', params)
        // console.log(params);
        //return $http.post('http://0.0.0.0:3009/api/Registers/registerBusiness' ,  params)
        //return $http.post('http://localhost:3009/api/Registers/registerBusiness' ,  params)
        .then(function (res) {


          if (res.data.data.isSuccess == true) {
            res.isSuccess = true;
            res.message = res.data.data.info;
          }
          else {
            res.isSuccess = false;
            res.message = res.data.data.info;
          }
          return res;
        })
    }

    function login(email, password) {
      var response = {};
      var params = {
        email: email,
        password: password
      };

      //return $http.get('http://localhost:3009/api/Registers?'+ 'filter[where][and][0][email]='+ email +  '&filter[where][and][1][password]=' + password)
      //return $http.get('http://0.0.0.0:3009/api/Registers?'+ 'filter[where][and][0][email]='+ email +  '&filter[where][and][1][password]=' + password)
      return $http.get('http://139.59.71.224:3009/api/Registers?' + 'filter[where][and][0][email]=' + email + '&filter[where][and][1][password]=' + password)
        .then(function (data) {
          //console.log("response log "+data)
          //console.log(JSON.stringify(data));
          //alert(data.length);



          if (data.data.length > 0) {

            response.isSuccess = true;
            response.email = data.data[0].email || "";
          }
          else {
            response.isSuccess = false;
            response.message = "No response from Api"
          }

          var token = data.token;
          var tokenStore = $window.sessionStorage;
          tokenStore.setItem('token', token);
          // console.log(token);
          //console.log(JSON.stringify(response));
          return response;
        })
    }







    return {
      verifyRegister: verifyRegister,
      login: login
    }
  }

})();
