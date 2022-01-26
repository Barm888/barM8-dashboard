angular
    .module('app')
    .controller('venueSignupCtl', ['$scope', '$state', '$rootScope', '$http', 'loader', 'VenueSignUp', function ($scope, $state, $rootScope, $http, loader, VenueSignUp) {

        $scope.signupsDs = [];
        $scope.getVenueSignUp = () => {
            loader.visible();
            VenueSignUp.find({ filter: { order: "isCreate desc" } }).$promise.then((res) => {
                $scope.signupsDs = res;
                setTimeout(function () { loader.hidden(); }, 300)
            })
        }

        $scope.getVenueSignUp();

    }]);