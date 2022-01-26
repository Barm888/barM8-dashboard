angular.module('app').controller('registerController', ['$scope', 'Business', '$state', '$http', function ($scope, Business, $state, $http) {

  $scope.newBusiness = {
    "businessName": "", "abn": "", "email": "", "password": "", "phone": "", "location": {
      "lat": 0, "lng": 0
    }, "city": "", "state": "", "zipCode": "", "landmark": "", "addressLine1": "", "addressLine2": "","country":""
  };

  $scope.mapgetdata = function (e) {
  
    $scope.newBusiness.location.lat = e.geometry.location.lat();
    $scope.newBusiness.location.lng = e.geometry.location.lng();
    $.each(e.address_components, function (key, val) {
      //zipcode
      if (val.types[0] == "postal_code") {
        $scope.newBusiness.zipCode = val.long_name;
      }
      //country
      else if (val.types[0] == "political") {
        $scope.newBusiness.country = val.long_name;
      }
      //state
      else if (val.types[0] == "administrative_area_level_1") {
        $scope.newBusiness.state = val.long_name;
      }
      //city
      else if (val.types[0] == "locality") {
        $scope.newBusiness.city = val.long_name;
      }
      //address1
      else if (val.types[0] == "sublocality_level_1") {
        $scope.newBusiness.addressLine1 = val.long_name;
      }
      //address2
      else if (val.types[0] == "route") {
        $scope.newBusiness.addressLine2 = val.long_name;
      }
      //country
      else if (val.types[0] == "country") {
        $scope.newBusiness.country = val.long_name;
      }
    });
  };

  $scope.createNewRegister = function () {

    // Send the data to Server
    var file = $("#upload__btn1")[0].files[0];
    var fd = new FormData();
    fd.append('file', file);
    return $http.post('/registerUpload', fd, { headers: { 'Content-Type': undefined } })
      .then(function (res) {
        var url = res.data.imageUrl;
       
        $scope.newBusiness["imageUrl"] = url;
        //console.log(JSON.stringify($scope.newBusiness));
        Business
          .create($scope.newBusiness)
          .$promise
          .then(function (response) {
            $scope.msg = "success";
            $scope.successMsg = "User has been created.!";
            $('#msgShow').modal({ backdrop: 'static', keyboard: false });
          }, function (error) {
            $scope.msg = "error";
            $scope.successMsg = "Business not created.Please try again.!";
            $('#msgShow').modal({ backdrop: 'static', keyboard: false });
          });
      }, function (error) {
        $scope.msg = "error";
        $scope.successMsg = "Business not created.Please try again.!";
        $('#msgShow').modal({ backdrop: 'static', keyboard: false });
      });

  };
  $scope.modalClose = function (e) {
    if (e == "success") {
      $state.go('login');
    }
  };
  $scope.goback = function () {
    $state.go('login');
  };
}]);
