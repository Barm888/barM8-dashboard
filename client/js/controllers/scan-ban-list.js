angular
  .module('app')
  .controller('ScanBanListCtl', ['$scope', 'Business', '$http', 'AuthService', '$state', '$rootScope', 'UserLoginDetails','LoyaltyLines', function ($scope, Business, $http, AuthService, $state, $rootScope, UserLoginDetails, LoyaltyLines) {
    if (!$scope.userId) {
      $scope.userId = $rootScope.currentUser.id;
    }
    $scope.ownerId;

    $scope.useremail = $rootScope.currentUser.email;
    $scope.userId = ""; $scope.isBusinessSelected = false;
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
    }

    $scope.getBusinessName = () => {
      return $scope.businessDelection;
    };

    $scope.banList = [];
    $scope.getBanlist = () => {
      if ($scope.ownerId) {
        $scope.banList = [];
        LoyaltyLines.find({ filter: { where: { ownerId: $scope.ownerId }, include: { relation: 'customer' } } }).$promise.then((res) => {
          if (res && res.length > 0) {
            $scope.banList = res.filter(m => m.customer);
          }
        });
      }
    };

    $scope.submitBanReason = () => {
      let id = $("#banReasonSaveBtn").data('id');
      if(id){
        if ($("#banReasonTxt").val()) {
          let banReason = $("#banReasonTxt").val();
          LoyaltyLines.upsertWithWhere({ where: { id } }, { banReason, isBan: true , banDate : new Date() }).$promise.then((res)=>{
            $scope.getBanlist();
            toastr.success('Successfully updated!.');
            toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
          });
          $('#banReason').modal('hide');
        } else {
          $("#banReasonTxtError").css('display', 'block');
        }
      }else{
        $('#banReason').modal('hide');
        toastr.error('Please try again!');
        toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
      }
    };

    $scope.unBan = (id) => {
      if(id){
        LoyaltyLines.upsertWithWhere({ where: { id } }, { banReason : null, isBan: false , banDate : null }).$promise.then((res)=>{
          $scope.getBanlist();
          toastr.success('Successfully updated!.');
          toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
        });
      }
    };

    $scope.banModel = (id) => {
      $("#banReasonSaveBtn").data('id', id);
      $("#banReasonTxt").val('');
      $("#banReasonTxtError").css('display', 'none');
      $('#banReason').modal({ backdrop: 'static', keyboard: false });
    };

    $scope.BusinessSelected = (arg) => {
      $("#businessErr").text('');
      if (arg == 'scans') {
        if ($("#autocompleteBusiness").data('id')) {
          $scope.ownerId = $("#autocompleteBusiness").data('id');
          arg = $("#autocompleteBusiness").data('id');
          $scope.getBanlist();
          $scope.isBusinessSelected = true;
          if ($("#businessSubmit").hasClass('businessSubmit')) {
            $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset');
            $("#businessSubmit").removeClass('businessSubmit').addClass('businessReset');
          }
        } else {
          $("#businessErr").text('Please select the Business name');
        }
      }
    };
}]);