angular
  .module('app')

  .controller('new_business_create', ['$scope', 'Business', '$http', '$state', '$rootScope', 'Customer', function ($scope, Business, $http, $state, $rootScope, Customer) {

    // $scope.requestUser = {};
    $scope.LoginBusiness = () => {
      $state.go('loginNew');
    };

    if ($rootScope.activateNoLandline) {
      $('html, body').animate({
        scrollTop: $('#businessReg').offset().top
      }, 0);
    }

    if ($rootScope.login) {
      $("#loginPage").css('display', 'block');
      $('html, body').animate({
        scrollTop: $("#loginPage").offset().top
      }, 0);
    }else{
      $("#loginPage").css('display', 'none');
    }

    function dataURItoBlob(dataURI) {
      var byteString;
      if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
      else
        byteString = unescape(dataURI.split(',')[1]);

      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

      var ia = new Uint8Array(byteString.length);
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ia], { type: mimeString });
    }


    $scope.imageDetails = {};
    $scope.getFilenameandType = (arg, e) => {
      if (e.data('name') == "Profilewebsite") {
        $scope.imageDetails.profileImage = '';
        $scope.imageDetails.profileImage = arg;
      }
    }

    //Sponsors image convert a base64 image into a image file
    $scope.profileImage = [];
    $scope.imageconverttofile = (data) => {

      $('#imageCropModal').modal('hide');
      if ($(".action #btnCrop").data('name') === "Profilewebsite") {
        $scope.profileImage = [];
        $("#upload__btn__wrap1").html('');
        $(".container .imageBox").css('background-image', '');
        $("#upload__btn__wrap1").append(`<img src=${data} id="profileImageCropAndUrl" data-name="${$scope.imageDetails.profileImage}" style="height: 153px;margin-top: -0px;margin-left: -0px;object-fit: cover;" />`);
        if (data != null && data != undefined && data != "") {
          $scope.profileImage.push(dataURItoBlob(data));
        }
      }
    }

    $scope.newBusiness = {};

    $scope.$watch('newBusiness.businessName', function (newValue, oldValue) {
      if (newValue) {
        if (newValue.length > 0) {
          $scope.venue_nameErr = false;
        }
      }
    });
    $scope.$watch('newBusiness.abn', function (newValue, oldValue) {
      if (newValue) {
        if (newValue.length > 0) {
          $scope.abnErr = false;
        }
      }
    });
    $scope.$watch('newBusiness.landline', function (newValue, oldValue) {
      if (newValue) {
        if (newValue.length > 0) {
          $scope.landlineErr = false;
        }
      }
    });
    $scope.$watch('newBusiness.addressLine1', function (newValue, oldValue) {
      if (newValue) {
        if (newValue.length > 0) {
          $scope.address1Err = false;
        }
      }
    });
    $scope.$watch('newBusiness.zipCode', function (newValue, oldValue) {
      if (newValue) {
        if (newValue.length > 0) {
          $scope.postcodeErr = false;
        }
      }

    });
    $scope.$watch('newBusiness.state', function (newValue, oldValue) {
      if (newValue) {
        if (newValue.length > 0) {
          $scope.stateErr = false;
        }
      }
    });
  //  $scope.$watch('newBusiness.mobile', function (newValue, oldValue) {
  //    if (newValue) {
  //      if (newValue.length > 0) {
  //        $scope.mobileErr = false;
 //       }
  //    }
 //   });
    $scope.$watch('newBusiness.country', function (newValue, oldValue) {
      if (newValue) {
        if (newValue.length > 0) {
          $scope.countryErr = false;
        }
      }
    });
    $scope.$watch('newBusiness.email', function (newValue, oldValue) {
      if (newValue) {
        if (newValue.length > 0) {
          $scope.emailErr = false;
        }
      }
    });
    $scope.$watch('newBusiness.phone', function (newValue, oldValue) {
      if (newValue) {
        if (newValue.length > 0) {
          $scope.mobileErr = false;
        }
      }
    });
    $scope.$watch('newBusiness.username', function (newValue, oldValue) {
      if (newValue) {
        if (newValue.length > 0) {
          $scope.usernameErr = false;
        }
      }
    });
    $scope.pwdSpecialErr = false;
    $scope.confirmSpecialErr = false;
    $scope.$watch('newBusiness.password', function (newValue, oldValue) {
      if (newValue) {
        if (newValue.length > 0) {
          $scope.pwdErr = false;
        }
      }

      if (newValue) {
        var validated = true;
        if (newValue.length < 8)
          validated = false;
        if (!/\d/.test(newValue))
          validated = false;
        if (!/[a-z]/.test(newValue))
          validated = false;
        if (/[^0-9a-zA-Z]/.test(newValue))
          validated = false;
        $scope.pwdSpecialErr = (validated ? false : true);
      }
    });
    $scope.$watch('confirmpwd', function (newValue, oldValue) {
      if (newValue) {
        if (newValue.length > 0) {
          $scope.confirmpwdErr = false;
        }
      }
      if (newValue) {
        if (newValue.length > 0) {
          $scope.confirmpwdErr = false;
          if (newValue) {
            var validated = true;
            if (newValue.length < 8)
              validated = false;
            if (!/\d/.test(newValue))
              validated = false;
            if (!/[a-z]/.test(newValue))
              validated = false;
            if (/[^0-9a-zA-Z]/.test(newValue))
              validated = false;
            $scope.confirmSpecialErr = (validated ? false : true);
          }
        }
      }
    });

    $scope.validateEmail = (email) => {
      var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
      if (!emailReg.test(email)) {
        return false;
      } else {
        return true;
      }
    };

    //Form Submit

    $scope.businessCreate = () => {

      $("#business_submit").prop('disabled', true);
      $("#venue_nameErr,#addressLine1Err,#postalcodeErr,#stateErr,#countryErr,#emailErr12,#mobileErr,#userNameErr,#passwordErr,#confirmpasswordErr,#confirmpasswordMatchErr").css('display','none');
      $scope.isVaild = true;
      $scope.newBusiness.businessName = $("#venue_txt").val();
      if (!$scope.newBusiness.businessName) {
        $("#venue_nameErr").css('display','block');
        $scope.isVaild = false;
      }

      $scope.newBusiness.addressLine1 = $("#addressLine1").val();
      if(!$scope.newBusiness.addressLine1){
        $("#addressLine1Err").css('display','block');
        $scope.isVaild = false;
      }

      $scope.newBusiness.zipCode = $("#postalcode").val();
      if(!$scope.newBusiness.zipCode){
        $("#postalcodeErr").css('display','block');
        $scope.isVaild = false;
      }

      $scope.newBusiness.state = $("#requestState option:selected").text();
      if(!$scope.newBusiness.state){
        $("#stateErr").css('display','block');
        $scope.isVaild = false;
      }

      $scope.newBusiness.country = $("#country option:selected").text();
      if(!$scope.newBusiness.country){
        $("#countryErr").css('display','block');
        $scope.isVaild = false;
      }

      $scope.newBusiness.email = $("#email123").val();
      if(!$scope.newBusiness.email){
        $("#emailErr12").css('display','block');
        $scope.isVaild = false;
      }

      $scope.newBusiness.phone = $("#mobile").val();
      if(!$scope.newBusiness.phone){
        $("#mobileErr").css('display','block');
        $scope.isVaild = false;
      }

      $scope.newBusiness.username = $("#username").val();
      if(!$scope.newBusiness.username){
        $("#userNameErr").css('display','block');
        $scope.isVaild = false;
      }

      $scope.newBusiness.password = $("#password").val();
      if(!$scope.newBusiness.password){
        $("#passwordErr").css('display','block');
        $scope.isVaild = false;
      }

      $scope.newBusiness.confirmpassword = $("#confirmpassword").val();
      if(!$scope.newBusiness.confirmpassword){
        $("#confirmpasswordErr").css('display','block');
        $scope.isVaild = false;
      }

      $scope.newBusiness.landline = $("#landline").val();
      if(!$scope.newBusiness.landline){
        $("#LandlineErr").css('display','block');
        $scope.isVaild = false;
      }
      $scope.profileImage=[];
      if ($("#profileImageCropAndUrl").attr('src') != null && $("#profileImageCropAndUrl").attr('src') != "" && $("#profileImageCropAndUrl").attr('src') != undefined) {
        $scope.profileImage.push(dataURItoBlob($("#profileImageCropAndUrl").attr('src')));
        $scope.imageDetails.profileImage = $("#profileImageCropAndUrl").data('name');
      }

      if ($scope.imageDetails.profileImage) {
        $scope.newBusiness.imageUrl = "/uploads/" + $scope.imageDetails.profileImage;
      } else {
        $scope.newBusiness.imageUrl = "";
      }

      if($scope.isVaild){
        if ($scope.newBusiness.confirmpassword == $scope.newBusiness.password) {

          if ($scope.imageDetails.profileImage) {
            $scope.newBusiness.imageUrl = "/uploads/" + $scope.imageDetails.profileImage;
            var fd = new FormData();
            var cnt = 1;
            console.log($scope.profileImage[0]);
            console.log($scope.imageDetails.profileImage);
            fd.append(`file${cnt}`, $scope.profileImage[0], $scope.imageDetails.profileImage);

            console.log(fd);
    
            $http.post('/uploadPremium', fd, { headers: { 'Content-Type': undefined } }).then((res) => {
              console.log(JSON.stringify(res));
              $("#profileImageCropAndUrl").val(null);
            }, (err) => {
              console.log(JSON.stringify(err))
            });
          } else {
            $scope.newBusiness.imageUrl = "";
          }

          Business.create($scope.newBusiness).$promise.then((data) => {
            $scope.newBusiness = {};
            $scope.confirmpwd = {};
            $("#upload__btn1").val(null);
            $scope.newBusiness = {};
            $("#confirmpwd").val('');
            $("#loginPage").css('display', 'block');
            $('html, body').animate({
              scrollTop: $("#loginPage").offset().top
            }, 0);
            toastr.success('Your Registration has been submitted. A confirmation email will be sent shortly.');
            toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
          }, (err) => {
            if (err.data.error.statusCode == "422") {
              toastr.error('Email already exists.');
              toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
              $scope.errorTxt = "Email already exists.";
            }
            else {
              toastr.error('Business has been not created. Please try again!');
              toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
              $scope.errorTxt = "Business has been not created. Please try again!";
            }
          });
        } else {
          $("#confirmpasswordMatchErr").css('display', 'block');
        }
       
      }

      $("#business_submit").prop('disabled', false);
    };


    $scope.requestDemo = () => {
      $("#requestBtn").attr('disabled','disabled');
      var isTrue = true, rBname = $("#requestBusinessName").val(), rBLocation = $("#requestLocation").val(), rBState = $("#requestState").val(), rBContactNumber = $("#requestContactNumber").val(), rBYourName = $("#requestContactyourName").val(), rBAEmailddress = $("#requestContactadderss").val();
      $("#rBNameErr").text(''); $("#rBContactErr").text(''); $("#rBYourNameErr").text('');

      if (rBname == "" || rBname == null || rBname == undefined) {
        isTrue = false;
        $("#rBNameErr").text('Business Name is required!');
      }
      if (rBContactNumber == "" || rBContactNumber == null || rBContactNumber == undefined) {
        isTrue = false;
        $("#rBContactErr").text('Contact Number is required!');
      }
      if (rBYourName == "" || rBYourName == null || rBYourName == undefined) {
        isTrue = false;
        $("#rBYourNameErr").text('Your Name is required!');
      }
      if (isTrue) {
        Customer.requestforDemo({ details: { businessName: rBname, location: rBLocation, state: rBState, conatctNo: rBContactNumber, Name: rBYourName, Email: rBAEmailddress } }).$promise.then((res) => {
          toastr.success('Your request has been sent.We will contact soon.');
          toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
          $("#requestBusinessName").val(''); $("#requestLocation").val(''); $("#requestState").val(''); $("#requestContactNumber").val(''); $("#requestContactyourName").val(''); $("#requestContactadderss").val('');
          $("#requestBtn").removeAttr('disabled');
        }, (err) => {
          toastr.success('Your request not sent. Please try again!');
          toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
          $("#requestBtn").removeAttr('disabled');
        })
      }

    }
  }]);
