angular
    .module('app')
    .controller('dashboardHomeCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'loader', 'Happenings', 'HappyHourDashDay', 'DailySpecial', 'ExclusiveOffer', function ($scope, $state, $rootScope, Business, $http, loader, Happenings, HappyHourDashDay, DailySpecial, ExclusiveOffer) {

        loader.visible();

        let userDetails = JSON.parse(localStorage.getItem("userSession"));
        $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));
        $scope.isAdmin = (userDetails.isAdmin ? true : false);
        $scope.whatsOnData = [];
        $scope.todayDate = new Date();

        if (!$rootScope.selectedVenue) $rootScope.selectedVenue = JSON.parse(localStorage.getItem("selectedVenue"));

        if ($scope.isAdmin) {
            $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
            $scope.userId = $rootScope.selectedVenue.ownerId;
            $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.ownerId)
            if ($("#businessSubmit").hasClass('businessSubmit')) {
                $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
            }
        }

        let fDate = new Date();
        let date = `${fDate.getFullYear()}-${("0" + (fDate.getMonth() + 1)).slice(-2)}-${("0" + fDate.getDate()).slice(-2)}T00:00:00.000Z`;

        $scope.whatsOnData = [];
        $scope.getHappenings = () => {
            let where = { date, status: "Live" }
            if (userDetails && userDetails.id && $scope.isAdmin == false) where.ownerId = userDetails.id;
            else {
                where.ownerId = $rootScope.selectedVenue.ownerId;
            }
            Happenings.find({ filter: { where, order: "date asc", fields: ["title", "date", "id", "primaryImg", "secondaryImg", "startTime", "endTime"] } })
                .$promise.then((res) => {
                    $scope.whatsOnData = res;
                });
        }
        $scope.getHappenings();

        $scope.HappyHourData = [];
        $scope.getDrinkSpecials = () => {
            let where = { date, status: "Live" }
            if (userDetails && userDetails.id && $scope.isAdmin == false) where.ownerId = userDetails.id;
            else {
                where.ownerId = $rootScope.selectedVenue.ownerId;
            }
            HappyHourDashDay.find({ filter: { where, order: "date asc", fields: ["img", "title", "date", "id", "img", "startTime", "endTime"] } })
                .$promise.then((res) => {
                    $scope.HappyHourData = res;
                });
        }
        $scope.getDrinkSpecials();

        $scope.DailySpecialData = [];
        $scope.getDailypecials = () => {
            let where = { date, status: "Live" }
            if (userDetails && userDetails.id && $scope.isAdmin == false) where.ownerId = userDetails.id;
            else {
                where.ownerId = $rootScope.selectedVenue.ownerId;
            }
            DailySpecial.find({ filter: { where, order: "date asc", fields: ["img", "title", "date", "id", "img", "startTime", "endTime"], } })
                .$promise.then((res) => {
                    $scope.DailySpecialData = res;
                });
        }
        $scope.getDailypecials();

        $scope.LimitedOfferData = [];
        $scope.getLimitedOffers = () => {

            let where = { offerDate: date, status: "Live" }
            if (userDetails && userDetails.id && $scope.isAdmin == false) where.ownerId = userDetails.id;
            else {
                where.ownerId = $rootScope.selectedVenue.ownerId;
            }

            ExclusiveOffer.find({ filter: { where, order: "date asc", fields: ["img", "title", "date", "id", "img", "startTimeTxt", "offerExpiryTimeTxt"] } })
                .$promise.then((res) => {
                    $scope.LimitedOfferData = res;
                });
        }
        $scope.getLimitedOffers();



        setTimeout(function () { loader.hidden(); }, 600);
    }]);