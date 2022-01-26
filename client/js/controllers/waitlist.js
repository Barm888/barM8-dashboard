angular
    .module('app')
    .controller('WaitListCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'WaitList', 'loader',
        function ($scope, $state, $rootScope, Business, $http, WaitList , loader) {

            $scope.waitListData = [];
            $scope.getData = () =>{
                $scope.waitListData = [];
                loader.visible();
                WaitList.find({ filter : { order : "date desc" } }).$promise.then((res) => { 
                    $scope.waitListData = res;
                    setTimeout(function(){  loader.hidden(); }, 200);
                });
            }
            $scope.getData();
        }]);