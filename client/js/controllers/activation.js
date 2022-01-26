angular
  .module('app')
  .controller('ActivationCtl', ['$scope', 'Business', '$http', 'AuthService', '$state', '$rootScope', 'UserLoginDetails', function ($scope, Business, $http, AuthService, $state, $rootScope, UserLoginDetails) {
    $scope.user = {};
    $scope.userDeatis = [];
    $("#landlineEnter").css('display', 'block');
    $("#email_pwd").css('display', 'none');
    $scope.landlineSubmit = () => {
      $("#landlineBtn").attr("disabled", true);
      $("#landLineErr").text('');
      if ($scope.user.landline) {
        var userDetails = {};
        Business.find({ filter: { where: { landline: $scope.user.landline }, fields: ["id", "email", "businessName", "username"] } }).$promise.then((res) => {
          if (res.length > 0) {
            $scope.userDeatis = res;
            var email = "";
            if (res[0].email) {
              if (res[0].email != "" && res[0].email != null && res[0].email != undefined) {
                email = res[0].email;
              } else {
                email = res[0].username;
              }
            } else {
              email = res[0].username;
            }
            userDetails = {
              "id": res[0].id,
              "tokenId": "",
              "email": email,
              "businessName": res[0].businessName,
              "loginId": res[0].id
            };
            $rootScope.currentUser = userDetails;
            localStorage.setItem("userSession", JSON.stringify(userDetails));
            $state.go('activationprofile');
          } else {
            $state.go('business-register');
            $rootScope.activateNoLandline = true;
            // toastr.error('You are being redirected to the registration page.');
            // toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            // $("#landLineErr").text('Invalid Landline Number. Please try again!');
          }
        }, (err) => {
          $state.go('business-register');
          $rootScope.activateNoLandline = true;
          //$("#landLineErr").text('Invalid Landline Number. Please try again!');
          // toastr.error('You are being redirected to the registration page.');
          // toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
        });
      } else {
        $state.go('business-register');
        $rootScope.activateNoLandline = true;
       // $("#landLineErr").text('Landline is required!');
        // $("#landLineErr").css('display', 'block');
      }
      $("#landlineBtn").attr("disabled", false);
    };


    function validateEmail(sEmail) {
      var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
      if (filter.test(sEmail)) {
        return true;
      }
      else {
        return false;
      }
    }

    $scope.email_password_Submit = () => {
      $("#emailPwdChanged").attr("disabled", true);
      $("#emailErr,#passwordErr,#emailvalidErr").css('display', 'none');
      var isTrue = true;
      if ($scope.user.email == null || $scope.user.email == undefined || $scope.user.email == "") {
        isTrue = false;
        $("#emailErr").css('display', 'block');
      }
      //pwd
      if ($scope.user.pwd == null || $scope.user.pwd == undefined || $scope.user.pwd == "") {
        isTrue = false;
        $("#passwordErr").css('display', 'block');
      }
      if (isTrue) {
        if (validateEmail($scope.user.email)) {
          if ($scope.userDeatis.length > 0) {
            $scope.updateUser = { email: $scope.user.email, id: $scope.userDeatis[0].id, username: $scope.user.email };
            if ($scope.updateUser.id != "") {
              Business.updateAttributes($scope.updateUser, (res) => {
                if (res) {
                  Business.changePasswordById({ details: { businessId: $scope.updateUser.id, password: $scope.user.pwd } }).$promise.then((res) => {
                    if (res) {
                      $state.go('business-register');
                      toastr.success('Email and Password has been updated.');
                      toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
                    } else {
                      toastr.error('Not updated. Please try again!');
                      toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
                    }
                  }, (err) => {
                    toastr.error('Not updated. Please try again!');
                    toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
                  });
                }
              }, (err) => {
                toastr.error('Not updated. Please try again!');
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
              });
            } else {
              toastr.error('Not updated. Please try again!');
              toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }
          } else {
            toastr.error('Not updated. Please try again!');
            toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
          }
        } else {
          $("#emailvalidErr").css('display', 'block');
        }
      }
      $("#emailPwdChanged").attr("disabled", false);
    };

  }])
  .controller('activateProfileCtl', ['$scope', 'Business', '$http', 'AuthService', '$state', '$rootScope', 'UserLoginDetails', function ($scope, Business, $http, AuthService, $state, $rootScope, UserLoginDetails) {

    //alert();

    $scope.userId = $rootScope.currentUser.id;
    Business.find({ filter: { where: { id: $scope.userId } } }).$promise.then(function (res) {

      $scope.business = res[0];
      $scope.parentBusinessName = $scope.business.email;
      if (!res[0].location) {
        $scope.business.location = {};
        $scope.business.location.lat = "";
        $scope.business.location.lng = "";
      }
    }, function (err) {
      $("#msgTxt").text("Please Try again!.");
      $("#msgShow").modal('show');
    });

    $scope.imgDelete = (id, userid, imgUrl) => {
      var img = imgUrl.split('/')[2];
      $http.post('/spaceFileDelete', { fileName: img })
        .then(function (res) {
        });
      $scope.business.imageUrl = "";
      Business.upsertWithWhere({ where: { id: $scope.userId } }, { "imageUrl": "" }, function (data, info) {
        toastr.success('Profile image has been deleted.');
        toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
      });
    };

    $scope.addressUpdate = (arg, lat, lng, address) => {

      $scope.business.location = { "lat": $("#lat").val().toString(), "lng": $("#lng").val().toString() };

      if (address != "") {
        $scope.business.addressLine1 = address;
      }


      for (var i = 0; i < arg.length; i++) {

        if (arg[i].types[0] == "administrative_area_level_2") {
          if (arg[i].long_name == "") {
            $scope.business.city = "";
          } else {
            $scope.business.city = arg[i].long_name;
          }
        }
        if (arg[i].types[0] == "administrative_area_level_1") {
          //state
          if (arg[i].long_name == "") {
            $scope.business.state = "";
          } else {
            $scope.business.state = arg[i].long_name;
          }
        }
        if (arg[i].types[0] == "country") {
          if (arg[i].long_name == "") {
            $scope.business.country = "";
          } else {
            $scope.business.country = arg[i].long_name;
          }
        }
        //postal_code
        if (arg[i].types[0] == "postal_code") {
          if (arg[i].long_name == "") {
            $scope.business.zipCode = "";
          } else {
            $scope.business.zipCode = arg[i].long_name;
          }
        }
      }
    };


    $scope.updateProfile = () => {

      if ($("#inputPassword").val() != "" && $("#inputPassword").val() != null && $("#inputPassword").val() != undefined) {
        if ($scope.userId != "" && $scope.userId != null && $scope.userId != undefined) {
          var passGot = $("#inputPassword").val();
          Business.changePasswordById({ details: { businessId: $scope.userId, password: $("#inputPassword").val() } }).$promise.then((res) => {
            if (res.data.isSuccess) {



              var params = {
                "businessName": $scope.business.businessName,
                "qrCode": $scope.business.qrCode,
                "email": $scope.business.email,
                "password": passGot
              };
              // console.log(params);
              Business.sendApprovedInfoToEmail1(params, (mailApiRes) => {
                if (mailApiRes.data.isSuccess) {
                  toastr.success('Password has been updated and email sent.');
                  toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };

                } else {
                  console.log(mailApiRes);
                  toastr.success('Password updated but error in email sendind. Please try again!.');
                  toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };

                }


              }, (mailApiErr) => {
                console.log(mailApiErr);
                toastr.success('Password updated but error in email sendind.. Please try again!.');
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
              });



            }
          }, (err) => {
            toastr.success('Password not updated. Please try again!.');
            toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
          })
        }
      }

      $scope.business.businessName = $("#venuename").val();
      $scope.business.abn = $("#abn").val();
      $scope.business.addressLine1 = $("#address1").val();
      $scope.business.addressLine2 = $("#address2").val();
      $scope.business.suburb = $("#suburb").val();
      $scope.business.zipCode = $("#postal_code").val();
      $scope.business.state = $("#state").val();
      $scope.business.country = $("#country option:selected").text();
      $scope.business.phone = $("#phone").val();
      $scope.business.landline = $("#landline").val();
      $scope.business.website = $("#website").val();
      $scope.business.contact1 = $("#contact1").val();
      $scope.business.contact2 = $("#contact2").val();
      $scope.business.email = $("#inputEmail").val();

      $scope.business.location = { "lat": $("#lat").val().toString(), "lng": $("#lng").val().toString() };


      //console.log($scope.profileImage[0]);
      //console.log($scope.imageDetails.profileImage);

      if ($scope.profileImage) {
        if ($scope.profileImage.length != 0) {
          var fd1 = new FormData();
          fd1.append(`file${1}`, $scope.profileImage[0], $scope.imageDetails.profileImage);
          $http.post('/uploadPremium', fd1, { headers: { 'Content-Type': undefined } })
            .then(function (res) {
              $scope.business.imageUrl = "/uploads/" + $scope.imageDetails.profileImage;

              delete $scope.business.password;

              //Business.upsertWithWhere({ where: { id: $scope.userId } }, $scope.business).$promise
              //  .then(function (res) {
              //    toastr.success('Profile has been Updated.');
              //    toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
              //  });
              Business.updateAttributes($scope.business).$promise
                .then(function (res) {
                  toastr.success('Profile has been Updated.');
                  toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
                });
            });
        }
        else {
          delete $scope.business.password;
          Business.updateAttributes($scope.business).$promise
            .then(function (res) {
              toastr.success('Profile has been Updated.');
              toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            });
        }
      } else {
        delete $scope.business.password;
        Business.updateAttributes($scope.business).$promise
          .then(function (res) {
            toastr.success('Profile has been Updated.');
            toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
          });
      }
    };
  }]);
