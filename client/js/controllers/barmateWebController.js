angular
  .module('app')
  .controller('barmateWebController', ['$scope','$state', function ($scope,$state) {
    $scope.loginbtnclk = () => {
      $state.go('loginNew');
    };
  }]);
