angular
  .module('app')
.controller('resetpassword', ['$scope', '$state', 'Business', '$stateParams','$rootScope', '$http', function ($scope,
  $state, Business, $stateParams, $rootScope, $http) {



}])
  .controller('forgotpassword', ['$scope', '$state', 'Business', function ($scope,
      $state, Business) {
    $scope.forgotClk = () => {
      if ($scope.email == "" || $scope.email == null || $scope.email == undefined) {
        $scope.err = "Email is required.";
      }
      else {
        Business.resetPassword({ "email": $scope.email }).$promise.then(function (res) {
          $scope.successMsg = "Your request has been processed. You will receive an e-mail with instructions for changing your password.";
          $('#msgShow').modal({ backdrop: 'static', keyboard: false });
        }, function (err) {
          $scope.successMsg = "Email not found."
          $('#msgShow').modal({ backdrop: 'static', keyboard: false });
        })
      }
    };
  }]);
