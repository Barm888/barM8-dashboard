angular
    .module('app')
    .controller('drinksServiceCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'loader', 'VenueServiceOption',
        function ($scope, $state, $rootScope, Business, $http, loader, VenueServiceOption) {

            $scope.initData = () => {
                loader.visible();
                VenueServiceOption.find({ filter: { where: { ownerId: $scope.userId, type: 'Drinks' } } }).$promise.then((res) => {
                    if (res && res.length) {
                        let data = res[0];
                        if (res[0].services && res[0].services.length) {
                            let service = res[0].services;
                            if (service.find(m => m.type == 'Table Service')) $("#_table_service").prop('checked', true);
                            else $("#_table_service").prop('checked', false);
                            if (service.find(m => m.type == 'Collect @ Bar')) $("#_collect_bar").prop('checked', true);
                            else $("#_collect_bar").prop('checked', false);
                        }
                        $("#table-start").val(data.tableNo_Start);
                        $("#table-end").val(data.tableNo_End);
                        setTimeout(() => { loader.hidden() }, 200);
                        $("#drinksCreateBtn").html('Update');
                    } else setTimeout(() => { loader.hidden() }, 200)
                }, (err) => {
                    loader.hidden();
                })
            }

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

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
            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                $scope.isBusinessSelect = true;
                Business.find({ filter: { where: { status: "active" }, "fields": ["businessName", "id", "email"] } }).$promise.then((res) => {
                    $scope.businessDelection = res;
                    $scope.userId = $rootScope.currentUser.id;
                    if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId && $rootScope.selectedVenue.venueName) {
                        $scope.userId = $rootScope.selectedVenue.venueId;
                        $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                        $("#autocompleteBusiness").data('id', $scope.userId);
                        $scope.initData();
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    }
                });
            }
            else {
                $scope.isBusinessSelect = true;
                $scope.userId = $rootScope.currentUser.id;
            }

            $scope.getBusinessName = () => {
                return $scope.businessDelection;
            };

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
                            $scope.initData();
                            $rootScope.selectedVenue = { venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                        }
                    } else {
                        $("#businessErr").text('Please select the Business name');
                    }
                }
            }

            if ($scope.userDetails.isAdmin == false) {
                $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                $("#autocompleteBusiness").attr('disabled', true);
                localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
                $scope.initData();
            }

            $scope.saveServiceOption = () => {

                createOrUpdate = () => {
                    if ($("#_collect_bar").is(':checked') || $("#_table_service").is(':checked')) {
                        let isTrue = true;
                        if (!$("#table-start").val()) {
                            isTrue = false;
                            $("#table-start-err").text('Required');
                        }
                        if (!$("#table-end").val()) {
                            isTrue = false;
                            $("#table-end-err").text('Required');
                        }
                        if (isTrue) {
                            let ownerId = $scope.userId;
                            let tableNo_End = $("#table-end").val(), tableNo_Start = $("#table-start").val();
                            let services = [];
                            if ($("#_collect_bar").is(':checked')) services.push({ type: "Collect @ Bar" })
                            if ($("#_table_service").is(':checked')) services.push({ type: "Table Service" })
                            loader.visible();
                            VenueServiceOption.upsertWithWhere({ where: { ownerId, type: 'Drinks' } }, {
                                ownerId, services, tableNo_Start, tableNo_End, type: 'Drinks'
                            }).$promise.then((res) => {
                                $("#_collect_bar,#_table_service").prop('checked', false);
                                $("#table-end,#table-start").val('');
                                toastMsg(true, "Successfully updated");
                                $scope.initData();
                            }, (err) => {
                                $("#_collect_bar,#_table_service").prop('checked', false);
                                $("#table-end,#table-start").val('');
                                toastMsg(false, "Please try again!");
                                loader.hidden();
                            });
                            // VenueServiceOption
                        }
                    } else toastMsg(false, "Please select the table service or collect@bar");
                }

                if ($scope.userDetails.isAdmin) {
                    $("#table-start-err,#table-end-err").text('');
                    if ($("#businessSubmit").hasClass('businessReset')) {
                        createOrUpdate();
                    } else toastMsg(false, "Please select the venue!");
                }
                else if (!$scope.userDetails.isAdmin) createOrUpdate();
            }
        }])
    .controller('foodServiceCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'loader', 'VenueServiceOption',
        function ($scope, $state, $rootScope, Business, $http, loader, VenueServiceOption) {

            $scope.initData = () => {
                loader.visible();
                VenueServiceOption.find({ filter: { where: { ownerId: $scope.userId, type: 'Food' } } }).$promise.then((res) => {
                    if (res && res.length) {
                        let data = res[0];
                        if (res[0].services && res[0].services.length) {
                            let service = res[0].services;
                            if (service.find(m => m.type == 'Table Service')) $("#_table_service").prop('checked', true);
                            else $("#_table_service").prop('checked', false);
                            if (service.find(m => m.type == 'Collect @ Bar')) $("#_collect_bar").prop('checked', true);
                            else $("#_collect_bar").prop('checked', false);
                        }
                        $("#table-start").val(data.tableNo_Start);
                        $("#table-end").val(data.tableNo_End);
                        setTimeout(() => { loader.hidden() }, 200)
                        $("#foodCreateBtn").html('Update');
                    } else setTimeout(() => { loader.hidden() }, 200)
                }, (err) => {
                    loader.hidden();
                })
            }

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

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
            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                $scope.isBusinessSelect = true;
                Business.find({ filter: { where: { status: "active" }, "fields": ["businessName", "id", "email"] } }).$promise.then((res) => {
                    $scope.businessDelection = res;
                    $scope.userId = $rootScope.currentUser.id;
                    if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId && $rootScope.selectedVenue.venueName) {
                        $scope.userId = $rootScope.selectedVenue.venueId;
                        $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                        $("#autocompleteBusiness").data('id', $scope.userId);
                        $scope.initData();
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    }
                });
            }
            else {
                $scope.isBusinessSelect = true;
                $scope.userId = $rootScope.currentUser.id;
            }

            $scope.getBusinessName = () => {
                return $scope.businessDelection;
            };

            $scope.BusinessSelected = (arg) => {
                $("#businessErr").text('');
                if (arg) {
                    if ($("#autocompleteBusiness").data('id')) {
                        arg = $("#autocompleteBusiness").data('id');
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                        if (arg != "select") {
                            $scope.isBusinessSelect = true;
                            $scope.userId = arg;
                            $rootScope.selectedVenue = { venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                            $scope.initData();
                        }
                    } else {
                        $("#businessErr").text('Please select the Business name');
                    }
                }
            }



            if ($scope.userDetails.isAdmin == false) {
                $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                $("#autocompleteBusiness").attr('disabled', true);
                $scope.userId = $scope.userDetails.id;
                $scope.initData();
                localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
            }



            $scope.saveServiceOption = () => {

                createOrUpdate = () => {
                    if ($("#_collect_bar").is(':checked') || $("#_table_service").is(':checked')) {
                        let isTrue = true;
                        if (!$("#table-start").val()) {
                            isTrue = false;
                            $("#table-start-err").text('Required');
                        }
                        if (!$("#table-end").val()) {
                            isTrue = false;
                            $("#table-end-err").text('Required');
                        }
                        if (isTrue) {
                            let ownerId = $scope.userId;
                            let tableNo_End = $("#table-end").val(), tableNo_Start = $("#table-start").val();
                            let services = [];
                            if ($("#_collect_bar").is(':checked')) services.push({ type: "Collect @ Bar" })
                            if ($("#_table_service").is(':checked')) services.push({ type: "Table Service" })
                            loader.visible();
                            VenueServiceOption.upsertWithWhere({ where: { ownerId, type: 'Food' } }, {
                                ownerId, services, tableNo_Start, tableNo_End, type: 'Food'
                            }).$promise.then((res) => {
                                $("#_collect_bar,#_table_service").prop('checked', false);
                                $("#table-end,#table-start").val('');
                                toastMsg(true, "Successfully updated");
                                $scope.initData();
                            }, (err) => {
                                $("#_collect_bar,#_table_service").prop('checked', false);
                                $("#table-end,#table-start").val('');
                                toastMsg(false, "Please try again!");
                                loader.hidden();
                            });
                        }
                    } else toastMsg(false, "Please select the table service or collect@bar");
                }

                if ($scope.userDetails.isAdmin) {
                    $("#table-start-err,#table-end-err").text('');
                    if ($("#businessSubmit").hasClass('businessReset')) {
                        createOrUpdate();
                    } else toastMsg(false, "Please select the venue!");
                }
                else if (!$scope.userDetails.isAdmin) createOrUpdate();
            }
        }]);