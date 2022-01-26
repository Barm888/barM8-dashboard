angular
    .module('app')
    .controller('qrDwnlCnt', ['$scope', 'Business', '$http', '$state', '$rootScope', 'loader', 'QRdownloadCnt', function ($scope, Business, $http, $state, $rootScope, loader, QRdownloadCnt) {
        $scope.getAllData = () => {
            $scope.iosdcnt = 0;
            $scope.andrioddcnt = 0;
            loader.visible();
            QRdownloadCnt.find().$promise.then((res) => {
                $scope.iosdcnt = res.filter(m => m.isIos == true).length;
                $scope.andrioddcnt = res.filter(m => m.isAndroid == true).length
                setTimeout(() => {
                    loader.hidden();
                }, 200)
            })
        }
        $scope.getAllData();
    }]);