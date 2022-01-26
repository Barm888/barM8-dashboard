angular
  .module('app')
  .controller('PremiumController', ['$scope', '$state', '$http', 'Premium', '$rootScope', 'Business', function ($scope,
    $state, $http, Premium, $rootScope, Business) {

    if ($rootScope.currentUser.email) {
      $scope.useremail = $rootScope.currentUser.email;
    }

    $scope.userId = "";
    if ($rootScope.currentUser.email == "admin@barm8.com.au") {
      Business.find({ filter: { where: { status: "active" }, "fields": ["businessName", "id", "email"] } }).$promise.then((res) => {
        $scope.businessDelection = res;
        $scope.userId = $rootScope.currentUser.id;
      }, (err) => {
        console.log(JSON.stringify());
      })
    }
    else {
      $scope.userId = $rootScope.currentUser.id;
      Premium.find({ filter: { where: { ownerId: $scope.userId, isActive: "yes" } } }).$promise.then(function (data) {
        if (data) {
          console.log(JSON.stringify(data));
          $scope.newPremium = data[0];
        }
        else {
          $scope.newPremium = [];
        }
      }, function (err) {
        console.log(JSON.stringify(err));
      });
    }

    if ($scope.userId == "" || $scope.userId == null || $scope.userId == undefined) {
      $scope.userId = $rootScope.currentUser.id;
    }
    $scope.BusinessSelected = (arg) => {
      $scope.userId = arg;
      Premium.find({ filter: { where: { ownerId: arg, isActive: "yes" } } }).$promise.then(function (data) {
        if (data) {
          $scope.newPremium = data[0];
        }
        else {
          $scope.newPremium = [];
        }
      }, function (err) {
        console.log(JSON.stringify(err));
      });
    };
    $scope.error = "";
    $scope.errorClass = "";
    $scope.premiums = [];
    function getPremiums() {
      Premium
        .find()
        .$promise
        .then(function (results) {
          $scope.premiums = results;
        });
    }
    getPremiums();


    $scope.imgFile = [];

    $('#filePhoto').click(function () {
      document.getElementById('filePhoto').addEventListener('change', function cb(event) {
        $scope.imgFile = this.files[0];
      });
    });


    $scope.deleteIndex = [];

    $scope.imgDelete = (id, i, p, n) => {
      for (j = 0; j < $scope.newPremium.primaryImage.length; j++) {
        if (j == i) {
          $scope.deleteIndex.push(j);
          $scope.newPremium.primaryImage[j].path = null;
          $scope.newPremium.primaryImage[j].name = null;
        }
      }
    };


    $scope.imgFiles = [];
    $scope.name = [];
    $scope.length = 0;

    $scope.$watch('newPremium.name', function () {
      $scope.nameerror = "";
      $scope.errorNameClass = false;
    });

    $scope.newPremium = { "name": "", "startDate": "", "endDate": "" }


    $scope.$watch('newPremium.name', function () {
      $scope.nameerror = "";
      $scope.errorNameClass = false;
    });


    var premiumStartDate = "", premiumEndDate = "";
    $scope.dateselected = function (val, txt) {
      var date = val.split('-');
      if (txt == "startdate") {
        $scope.starterror = "";
        $scope.errorStartClass = false;
        premiumStartDate = date[2] + "-" + date[1] + "-" + date[0];
      }
      if (txt == "enddate") {
        $scope.errorEndClass = false;
        $scope.enderror = "";
        premiumEndDate = date[2] + "-" + date[1] + "-" + date[0];
      }
    };
    var _URL = window.URL || window.webkitURL;

    $scope.fileSizevalidation = function (w, h) {
      var isValid = true;
      if (w >= 400 && w <= 600) {
        if (h >= 180 && h <= 220) {
          return "true";
        } else {
          return "height";
        }
      } else {
        return "width";
      }
    }

    $scope.imgaeUpload = (id, data, parentId) => {
      $scope.isSave = false;
      $scope.imageUploadIndex = [];
      if (id == "img1") {
        var image = new Image();
        image.onload = function () {
          var val = $scope.fileSizevalidation(this.width, this.height);  
          if (val == "true") {
            $scope.isSave = true;
            $scope.imageUploadIndex.push(0);
            $scope.name.push({ "name": data.name, "path": "uploads/" + data.name });
            $scope.imgFiles.push(data);
          }
          else {
            if (val == "height") {
              $("#msgShowHeight").modal({ backdrop: 'static', keyboard: false });
            }
            if (val == "width") {
              $("#msgShowWidth").modal({ backdrop: 'static', keyboard: false });
            } 
          }
        };
        image.src = _URL.createObjectURL(data);
      }
      if (id == "img2") {
        var image = new Image();
        image.onload = function () {
          var val = $scope.fileSizevalidation(this.width, this.height);
          if (val == "true") {
            $scope.isSave = true;
            $scope.imageUploadIndex.push(1);
            $scope.name.push({ "name": data.name, "path": "uploads/" + data.name });
            $scope.imgFiles.push(data);
          }
          else {
            if (val == "height") {
              $("#msgShowHeight").modal({ backdrop: 'static', keyboard: false });
            }
            if (val == "width") {
              $("#msgShowWidth").modal({ backdrop: 'static', keyboard: false });
            }
          }
        };
        image.src = _URL.createObjectURL(data);
      
      }
      if (id == "img3") {
        var image = new Image();
        image.onload = function () {
          var val = $scope.fileSizevalidation(this.width, this.height);
          if (val == "true") {
            $scope.isSave = true;
            $scope.imageUploadIndex.push(2);
            $scope.name.push({ "name": data.name, "path": "uploads/" + data.name });
            $scope.imgFiles.push(data);
          }
          else {
            if (val == "height") {
              $("#msgShowHeight").modal({ backdrop: 'static', keyboard: false });
            }
            if (val == "width") {
              $("#msgShowWidth").modal({ backdrop: 'static', keyboard: false });
            }
          }
        };
        image.src = _URL.createObjectURL(data);
       
      }
    };

    $scope.premiumUpdate = () => {
      var valid = true;
      if ($scope.isSave)
      {
        if ($scope.imgFiles.length != 0) {
          if (premiumStartDate == "") {
            premiumStartDate = $scope.newPremium.startDate;
          }
          if (premiumEndDate == "") {
            premiumEndDate = $scope.newPremium.endDate;
          }
         

          var premiumObj = { "teaserMessage": $scope.newPremium.teaserMessage, "startDate": premiumStartDate, "endDate": premiumEndDate, primaryImage: $scope.name };
          console.log(JSON.stringify(premiumObj));
          var fd1 = new FormData();
          for (i = 0; i < $scope.imgFiles.length; i++) {
            fd1.append(`file${i + 1}`, $scope.imgFiles[i]);
          }
          return $http.post('/uploadPremium', fd1, { headers: { 'Content-Type': undefined } })
            .then(function (res) {
              Premium.updateAll({ where: { "ownerId": $scope.userId, "isActive": "yes" } }, premiumObj, function (data, info) {
                if (data.count == "1") {
                  $("#msgShow").modal({ backdrop: 'static', keyboard: false });
                  $scope.successMsg = "What's hot has been Updated.";
                }
              });
            });
        }
      } else {
        $("#msgShow").modal({ backdrop: 'static', keyboard: false });
        $scope.successMsg = "What's hot not created. Try again!";
      }
     
    };

    $scope.addPremium = function () {
      var valid = true;


      if ($scope.isSave) {
        if ($scope.imgFiles.length == 0) {
          $scope.Imgerror = "Primary image is required!";
          $scope.errorImgClass = true;
          valid = false;
        }
        if ($scope.newPremium.teaserMessage == "") {
          valid = false;
          $scope.nameerror = "Description is required!";
          $scope.errorNameClass = true;
        }
        if (premiumStartDate == "") {
          valid = false;
          $scope.starterror = "Start date is required!";
          $scope.errorStartClass = true;
        }
        if (premiumEndDate == "") {
          valid = false;
          $scope.errorEndClass = true;
          $scope.enderror = "End date is required!";
        }
        if (valid) {
          $("#msgShow").modal({ backdrop: 'static', keyboard: false });
          $scope.successMsg = "What's hot has been created.";
          var fd1 = new FormData();
          var nc = $scope.newPremium || {};
          fd1.append('file', $scope.imgFile);


          for (i = 0; i < $scope.imgFiles.length; i++) {
            fd1.append(`file${i + 1}`, $scope.imgFiles[i]);
          }
          return $http.post('/uploadPremium', fd1, { headers: { 'Content-Type': undefined } })
            .then(function (res) {
              Premium.updateAll({ where: { "ownerId": $scope.userId, "isActive": "yes" } }, { "isActive": "no" }, function (data, info) {
                var premiumObj = { "isActive": "yes", "teaserMessage": $scope.newPremium.teaserMessage, "startDate": premiumStartDate, "endDate": premiumEndDate, primaryImage: $scope.name, "businessId": $scope.userId, "ownerId": $scope.userId };
                console.log(JSON.stringify(premiumObj));
                Premium
                  .create(premiumObj)
                  .$promise
                  .then(function (premium) {
                    $scope.newPremium = {};
                    $state.go('add-premium');
                    names = [];
                    $("#upload__btn1").val('');
                  });
              });
            });
        }
      } else {
        $("#msgShow").modal({ backdrop: 'static', keyboard: false });
        $scope.successMsg = "What's hot not created. Try again!";
      }
    
    }
    $scope.removePremium = function (item) {
      Premium
        .deleteById(item)
        .$promise
        .then(function () {
          getPremiums();
        });
    };
  }])
  .controller('EditPremiumController', ['$scope', '$q', 'Premium', '$state',
    '$stateParams', function ($scope, $q, Premium, $state, $stateParams) {
      Premium
        .findById({ id: $stateParams.id })
        .$promise
        .then(function (Premium) {
          $scope.Premium = Premium;
          $state.go('edit-Premium');
        });
      $scope.Premium = {};

      $scope.savePremium = function (item) {
        Premium
          .replaceById(item)
          .$promise
          .then(function () {
            $state.go('Premium');
          });
      };
    }])
  .controller('ViewPremiumController', ['$scope', 'Premium', '$state',
    '$stateParams', function ($scope, Premium, $state, $stateParams) {
      Premium
        .findById({ id: $stateParams.id })
        .$promise
        .then(function (premium) {
          $scope.premium = premium;
          $state.go('view-premium');
        });
    }]);
