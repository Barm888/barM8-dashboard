angular
    .module('app')
    .controller('accountListCtl', ['$scope', 'Business', '$http', '$state', '$rootScope', '$stateParams', '$location', 'VenueAccounts', 'AppConfig', 'loader',
        function ($scope, Business, $http, $state, $rootScope, $stateParams, $location, VenueAccounts, AppConfig, loader) {

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

            $scope.stripedata = {}; $scope.strips = [];
            $scope.isStripeShow = false;
            $scope.appConfigData = {};

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.getAppConfig = () => {
                $scope.appConfigData = {};
                AppConfig.findOne().$promise.then((live) => {
                    $scope.appConfigData = live;
                    setTimeout(function () {
                        loader.hidden();
                    }, 300);
                });
            }

            $scope.getStripedata = () => {
                loader.visible();
                $scope.strips = [];
                AppConfig.findOne().$promise.then((live) => {
                    VenueAccounts.find({ filter: { where: { stripeMode: live.stripeMode }, include: [{ relation: "business" }] } }).$promise.then((res) => {
                        $scope.strips = res;
                        $scope.getAppConfig();
                    });
                })
            }

            if ($scope.userDetails && $scope.userDetails.isAdmin) {
                $scope.isBusinessSelect = $scope.userDetails.isAdmin;
                $scope.getStripedata();
            }

            $scope.modeUpdate = () => {
                if ($scope.appConfigData && $scope.appConfigData.id) {
                    let id = $scope.appConfigData.id, stripeMode = false, stripeModeTxt = 'Test';
                    if (!$scope.appConfigData.stripeMode) {
                        stripeMode = true;
                        stripeModeTxt = 'Live';
                    }
                    loader.visible();
                    AppConfig.upsertWithWhere({ where: { id } }, { stripeMode, stripeModeTxt }, (LiveData) => {
                        toastMsg(true, "Updated successfully!");
                        $scope.strips = [];
                        VenueAccounts.find({ filter: { where: { stripeMode: LiveData.stripeMode }, include: [{ relation: "business" }] } }).$promise.then((res) => {
                            $scope.strips = res;
                            $scope.appConfigData = LiveData;
                            setTimeout(function(){
                                loader.hidden();
                            }, 200)
                        });
                    }, () => {
                        toastMsg(false, "Please try again!");
                    })
                }
            }

        }])
    .controller('vanueAccountListCtl', ['$scope', 'Business', '$http', '$state', '$rootScope', '$stateParams', '$location', 'VenueAccounts', 'AppConfig', 'loader',
        function ($scope, Business, $http, $state, $rootScope, $stateParams, $location, VenueAccounts, AppConfig, loader) {

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

            $scope.getBusinessName = () => { return $scope.businessDelection; };

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                $scope.isBusinessSelect = true;
                getBusinessData = () => {
                    Business.find({ filter: { where: { status: "active" }, "fields": ["businessName", "id", "email"] } }).$promise.then((res) => {
                        $scope.businessDelection = res;
                    });
                }
                getBusinessData();
                $scope.userId = $rootScope.currentUser.id;
                if ($rootScope && $rootScope.selectedVenue) {
                    $scope.userId = $rootScope.selectedVenue.venueId;
                    $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                    $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.venueId);
                    $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                }
            }



            $scope.v_data = {};
            $scope.getData = (arg) => {

                var t;

                function getBusinessData() {
                    Business.findOne({ filter: { where: { id: $scope.userId } } }).$promise.then((res) => {
                        AppConfig.findOne().$promise.then((sMode) => {
                            let stripeMode = sMode.stripeMode;
                            if (res) {
                                let { stripeTestId, stripeTestUrl, stripeLiveId, stripeLiveUrl, isAccountCreated } = res;
                                if (!stripeMode) {
                                    if (stripeTestId && stripeTestUrl) {
                                        $('body').append(`<a id="link" href="${stripeTestUrl}">&nbsp;</a>`);
                                        $('#link')[0].click();
                                        loader.hidden();
                                        clearInterval(t);
                                    }
                                }
                                if (stripeMode) {
                                    if (stripeLiveId && stripeLiveUrl) {
                                        $('body').append(`<a id="link" href="${stripeLiveUrl}">&nbsp;</a>`);
                                        $('#link')[0].click();
                                        loader.hidden();
                                        clearInterval(t);
                                    }
                                }
                            }
                        })
                    })
                }

                t = setInterval(getBusinessData, 500);
            }


            $scope.userId = $scope.userDetails.id;

            $scope.createStripeAccount = () => {
                if ($scope.userId) {
                    loader.visible();
                    VenueAccounts.createStripeAccount({ params: { ownerId: $scope.userId } })
                    setTimeout(function () {
                        $scope.getData();
                    }, 1000);
                }
            }

            $scope.stripedata = {}; $scope.strips = [];
            $scope.appConfigMode = {};
            $scope.isStripeShow = false;
            $scope.getStripedata = () => {
                loader.visible();
                AppConfig.findOne().$promise.then((sMode) => {
                    $scope.appConfigMode = sMode;
                    $scope.isStripeShow = false;
                    $scope.stripeAccountsdata = [];
                    VenueAccounts.find({ filter: { where: { ownerId: $scope.userId, stripeMode: sMode.stripeMode } } })
                        .$promise.then((res) => {
                            if (res && res.length) $scope.stripeAccountsdata = res;
                            if (res.length == 0) $scope.isStripeShow = true;
                            setTimeout(function () {
                                loader.hidden();
                            }, 300);
                        })
                })
            }

            if (localStorage.getItem("selectedVenue")) {
                $rootScope.selectedVenue = JSON.parse(localStorage.getItem("selectedVenue"));
            }

            if ($scope.userDetails.isAdmin == false) {
                $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                $("#autocompleteBusiness").attr('disabled', true);
                $scope.userId = $scope.userDetails.id;
                localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userId, ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
                $scope.getStripedata();
            } else if ($scope.userDetails.isAdmin) {
                if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId) {
                    $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                    $scope.userId = $rootScope.selectedVenue.venueId;
                    $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.venueId)
                    if ($("#businessSubmit").hasClass('businessSubmit')) {
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    }
                    $scope.isBusinessSelect = true;
                    $rootScope.selectedVenue = { venueId: $scope.userId, ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                    $scope.getStripedata();
                }
            }

            $scope.BusinessSelected = (arg) => {
                $("#businessErr").text('');
                if (arg) {
                    if ($("#autocompleteBusiness").data('id')) {
                        arg = $("#autocompleteBusiness").data('id');
                        if ($("#businessSubmit").hasClass('businessSubmit')) {
                            $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                        }
                        if (arg != "select") {
                            $scope.isBusinessSelect = true;
                            $scope.userId = arg;
                            $rootScope.selectedVenue = { venueId: $scope.userId, ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                            localStorage.removeItem("selectedVenue");
                            localStorage.setItem("selectedVenue", JSON.stringify({
                                venueId: $scope.userId,
                                ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val()
                            }));
                            $scope.getStripedata();
                        }
                    } else $("#businessErr").text('Please select the Business name');
                }
            }

        }]);