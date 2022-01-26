angular
    .module('app')
    .controller('settingsCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'loader', 'VenueSettings',
        function ($scope, $state, $rootScope, Business, $http, loader, VenueSettings) {

            var userSession = JSON.parse(localStorage.getItem("userSession"));

            $scope.isBusinessSection = userSession.isAdmin;

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.isBusinessSelect = false;

            if (!$scope.userId) $scope.userId = $rootScope.currentUser.id;

            $scope.useremail = $rootScope.currentUser.email;
            $scope.userId = "";
            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.email == "admin@barm8.com.au") {
                $scope.isBusinessSelect = true;
                Business.find({ filter: { where: { status: "active" }, "fields": ["businessName", "id", "email"] } }).$promise.then((res) => {
                    $scope.businessDelection = res;
                    $scope.userId = $rootScope.currentUser.id;
                }, (err) => {
                    console.log(JSON.stringify());
                });
            }
            else {
                $scope.isBusinessSelect = true;
                $scope.userId = $rootScope.currentUser.id;
            }

            $scope.getBusinessName = () => {
                return $scope.businessDelection;
            };

            $scope.updateData = () => {
                let drinksOrder = $("#drinks_order").is(":checked") , mealsOrder = $("#meals_order").is(":checked"), 
                eventBooking = $("#event_order").is(":checked");
                loader.visible();
                VenueSettings.upsertWithWhere({ where: { ownerId: $scope.userId } }, {
                    drinksOrder, mealsOrder,
                    eventBooking , ownerId: $scope.userId
                }).$promise.then((res) => {
                    toastMsg(true, "successfully updated.");
                    setTimeout(function () { loader.hidden() }, 200);
                });
            }

            $scope.getData = () => {
                loader.visible();
                VenueSettings.find({ filter: { where: { ownerId: $scope.userId } } }).$promise.then((res) => {
                    setTimeout(function () { loader.hidden() }, 200);
                    if (res && res.length){
                       if(res[0].drinksOrder) $("#drinks_order").prop( "checked", true );
                       else  $("#drinks_order").prop(":checked", false);
                       if(res[0].mealsOrder) $("#meals_order").prop( "checked", true );
                       else  $("#meals_order").prop(":checked", false);
                       if(res[0].eventBooking) $("#event_order").prop( "checked", true );
                       else  $("#event_order").prop(":checked", false);
                    }
                    else {
                        $("#drinks_order").prop(":checked", false);
                        $("#meals_order").prop(":checked", false);
                        $("#event_order").prop(":checked", false);
                    }
                });
            }


            $scope.settingEnable = true;
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
                            $rootScope.selectedVenue = { venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                            $scope.settingEnable = false;
                            $scope.getData();
                        }
                    } else {
                        $("#businessErr").text('Please select the Business name');
                    }
                }
            }
        }]);