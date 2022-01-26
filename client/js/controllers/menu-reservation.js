angular
    .module('app')
    .controller('reservationCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'Reservation', 'loader', 'socket',
        function ($scope, $state, $rootScope, Business, $http, Reservation, loader, socket) {

            if ($rootScope.currentUser && $rootScope.currentUser.email) {
                $scope.useremail = $rootScope.currentUser.email;
            } else $state.go('logout');

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.reservationList = [];
            var d = new Date();
            var strDate = d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + + d.getDate()).slice(-2);
            $scope.getReservation = () => {
                loader.visible();
                Reservation.find({ filter: { where: { ownerId: $scope.userId, requestDate: { gte: strDate } }, include: [{ relation: 'customer' }], order: "requestDate desc" } }).$promise.then((res) => {
                    setTimeout(() => { loader.hidden(); }, 500);
                    if (res && res.length) $scope.reservationList = res;
                }, (err) => { loader.hidden(); })
            }

            socket.on('pushMealsReservation', function (data) {
                loader.visible();
                Reservation.find({ filter: { where: { ownerId: $scope.userId }, include: [{ relation: 'customer' }], order: "requestDate desc" } }).$promise.then((res) => {
                    setTimeout(() => { loader.hidden(); }, 500);
                    if (res && res.length) $scope.reservationList = res;
                }, (err) => { loader.hidden(); })
            });

            $scope.isBusinessSelect = false;

            if (!$scope.userId) $scope.userId = $rootScope.currentUser.id;

            $scope.useremail = $rootScope.currentUser.email;
            $scope.userId = "";
            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                $scope.isBusinessSelect = true;
                Business.find({ filter: { where: { status: "active" }, "fields": ["businessName", "id", "email"] } })
                    .$promise.then((res) => { $scope.businessSelection = res; });
            }
            if (!$rootScope.selectedVenue) $rootScope.selectedVenue = JSON.parse(localStorage.getItem("selectedVenue"));

            if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId) {
                $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                $scope.userId = $rootScope.selectedVenue.venueId;
                $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.venueId)
                if ($("#businessSubmit").hasClass('businessSubmit')) {
                    $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                }
                $scope.isBusinessSelect = true;
                $scope.getReservation();
                $rootScope.selectedVenue = { ownerId: $scope.userId, venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
            }

            $scope.getBusinessName = () => { return $scope.businessDelection; };

            $scope.confirmPopup = (id, status, customerId) => {
                $scope.status = status;
                $('#confirmPopup').modal({ backdrop: 'static', keyboard: false })
                $("#reservationConfirmBtn").attr('data-details', JSON.stringify({ id, status, customerId }))
            }

            $scope.confirmUpdate = (id, status, customerId) => {
                let tableNo, allocateTime = null;
                $('#confirmPopup').modal('hide');
                loader.visible();
                tableNo = $("#alloCateTableNo").val();
                allocateTime = $("#alloCateTableTime").val();
                if (status == 'cancelled') { tableNo = null; allocateTime = null; }
                Reservation.upsertWithWhere({ where: { id } }, { status, tableNo, allocateTime }).$promise.then((res) => {
                    Reservation.find({ filter: { where: { ownerId: $scope.userId, requestDate: { gte: strDate } }, include: [{ relation: 'customer' }], order: "requestDate desc" } }).$promise.then((res) => {
                        if (res && res.length) {
                            Reservation.notifToCustomer({ params: { ownerId: $scope.userId, id, customerId } });
                            setTimeout(() => { loader.hidden(); toastr.success('Successfully updated'); }, 500);
                            $scope.reservationList = res;
                            $scope.reservationObj = $scope.reservationList.find(m => m.id == id);
                        }
                    }, (err) => { loader.hidden(); })
                });
            };

            $scope.closeView = () => {
                $("#R_S_L_1").css({ display: 'block' }).removeClass('col-xs-8 col-sm-8 col-md-8 col-lg-8 col-xl-8').addClass('col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12');
                $("#R_Single_O_D_L").css({ display: 'none' });
                $("#reservationTable tbody tr").each(function (i, val) {
                    if ($(val).data('isvisible')) $(val).attr('data-isvisible', false);
                })
            };

            $scope.BusinessSelected = (arg) => {
                $("#businessErr").text('');
                if (arg && $("#autocompleteBusiness").data('id')) {
                    arg = $("#autocompleteBusiness").data('id');
                    if ($("#businessSubmit").hasClass('businessSubmit')) {
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    }
                    if (arg != "select") {
                        $scope.isBusinessSelect = true;
                        $scope.userId = arg;
                        $rootScope.selectedVenue = { venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                        $scope.getReservation();
                    }
                } else $("#businessErr").text('Please select the Business name');
            }

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

            if ($scope.userDetails.isAdmin == false) {
                $scope.getReservation();
                // $scope.isBusinessSelect = true;
                // $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                // $("#autocompleteBusiness").attr('disabled', true);
                localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
            }

            $scope.reservationClk = (id) => {
                $scope.reservationObj = {}; $scope.reservationObj.allocateTime = null;
                $scope.reservationObj = $scope.reservationList.find(m => m.id == id);

                let isvisible = false;

                if ($(`#_reser_tr_${id}`).attr('data-isvisible') == undefined) {
                    isvisible = true;
                } else {
                    let isCondition = $(`#_reser_tr_${id}`).attr('data-isvisible') == "true" ? true : false;
                    isvisible = (isCondition == false ? true : false);
                }

                if ($(window).width() <= 960) {
                    $("#R_S_L_1").css({ display: 'none' });
                    $("#R_Single_O_D_L").addClass('col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12').css({ display: 'block' });
                } else if (isvisible) {
                    $("#R_S_L_1").css({ display: 'block' }).removeClass('col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12').addClass('col-xs-8 col-sm-8 col-md-8 col-lg-8 col-xl-8');
                    $("#R_Single_O_D_L").addClass('col-xs-4 col-sm-4 col-md-4 col-lg-4 col-xl-4').css({ display: 'block' });
                }

                if ($(`#_reser_tr_${id}`).attr('data-isvisible')) $(`#_reser_tr_${id}`).attr('data-isvisible', false);
                else $(`#_reser_tr_${id}`).attr('data-isvisible', true);
            };


            $scope.searchClk = () => {
                getFilterData = (arg) => {
                    Reservation.find(arg).$promise.then((res) => {
                        $scope.reservationList = [];
                        $scope.reservationList = res.filter(m => m.customer);
                    });
                };
                let status = $('#Status_fil').val(), date = $("#reservation_date_fil").val(), filterOr = [], customer;
                if (date) {
                    var dsplit = date.split("-");
                    date = `${dsplit[2]}-${dsplit[1]}-${dsplit[0]}`;
                    filterOr.push({ "request.date": date })
                }
                if (status && status != 'select') filterOr.push({ status })
                if ($("#customer_name_mobile_fil").val()) customer = $("#customer_name_mobile_fil").val();
                if (filterOr && filterOr.length) {
                    if ($("#customer_name_mobile_fil").val()) {
                        getFilterData({
                            filter: {
                                where: { ownerId: $scope.userId, requestDate: { gte: strDate }, and: filterOr }, include: [{
                                    relation: 'customer',
                                    scope: { where: { or: [{ firstName: customer }, { lastName: customer }, { mobile: customer }] } }
                                }], order: "requestDate desc"
                            }
                        });
                    } else {
                        getFilterData({ filter: { where: { ownerId: $scope.userId, requestDate: { gte: strDate }, and: filterOr }, include: [{ relation: 'customer' }], order: "requestDate desc" } });
                    }
                } else {
                    if ($("#customer_name_mobile_fil").val()) {
                        getFilterData({
                            filter: {
                                where: { ownerId: $scope.userId, requestDate: { gte: strDate } },
                                include: [{
                                    relation: 'customer',
                                    scope: { where: { or: [{ firstName: customer }, { lastName: customer }, { mobile: customer }] } }
                                }], order: "requestDate desc"
                            }
                        });
                    } else {
                        getFilterData({ filter: { where: { ownerId: $scope.userId, requestDate: { gte: strDate } }, include: [{ relation: 'customer' }], order: "requestDate desc" } });
                    }
                }
            };
        }]);