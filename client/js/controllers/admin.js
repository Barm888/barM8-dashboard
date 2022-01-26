'use strict';
(function () {
	angular.module('app')
		.controller('AdminController', ['$scope', function ($scope) {
			$scope.login = {};
			$scope.Login = function () {
				if ($scope.login.username == "admin" && $scope.login.password == "admin1234") {
					$scope.login.isSuccess = true;
					$scope.login.message = "success";
				}
				else {
					$scope.login.isSuccess = false;
					$scope.login.message = "Unothorized Access";
				}
			};
		}]);
})();




