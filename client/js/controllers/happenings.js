
angular
    .module('app')
    .controller('happeningsEditCtl', ['$scope', '$state', 'Business', '$http', '$rootScope', 'HappeningsCategory', 'Happenings', 'loader', '$stateParams', 'getAllVenues',
        function ($scope, $state, Business, $http, $rootScope, HappeningsCategory, Happenings, loader, $stateParams, getAllVenues) {

            if ($rootScope.currentUser && $rootScope.currentUser.email) {
                $scope.useremail = $rootScope.currentUser.email;
            } else $state.go('logout');


            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

            toastMsg = (isVaild, msg) => {
                if (isVaild) toastr.success(msg);
                else toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            let groupByKey = (array, key) => {
                return array
                    .reduce((hash, obj) => {
                        if (obj[key] === undefined) return hash;
                        return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) })
                    }, {})
            }

            $scope.whatsOnEvents = [];
            $scope.whatsOnETitle = [];
            $scope.getAllHappenings = () => {
                //alert();
                loader.visible();
                let tDate = new Date();
                let date = `${tDate.getFullYear()}-${("0" + (tDate.getMonth() + 1)).slice(-2)}-${("0" + tDate.getDate()).slice(-2)}T00:00:00.000Z`;

                Happenings.find({ filter: { where: { ownerId: $scope.userId, isDeleted: false, date: { gte: date } }, include: [{ relation: "happeningsCategory" }], order: "date asc" } })
                    .$promise.then((res) => {
                        $scope.whatsOnEvents = res;
                        if (res && res.length == 0) {
                            $(".isEvent").css({ display: 'block' });
                        } else {
                            let grouVa = groupByKey(res, 'titleTxt');
                            $scope.whatsOnETitle = [];
                            Object.keys(grouVa).forEach((k, j) => {
                                let oSData = res.find(m => m.titleTxt == k);
                                let { titleTxt, title } = oSData;
                                $scope.whatsOnETitle.push({ titleTxt, title });
                            });
                        }
                        setTimeout(() => { loader.hidden(); }, 500);
                    }, () => {
                        loader.hidden();
                    });
            };

            if ($scope.userDetails.isAdmin == false) {
                localStorage.removeItem("selectedVenue");
                $scope.userId = $scope.userDetails.id;
                localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userDetails.id, venueId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
                $scope.getAllHappenings();
            }

            $scope.getBusinessFun = () => {
                loader.visible()
                setTimeout(function () {
                    $scope.businessSelection = getAllVenues.get();
                    loader.hidden();
                }, 1000)
            }

            $scope.happeningsCategory = []; $scope.happeningsCategoryF = [];
            $scope.getHappeningscategory = () => {
                HappeningsCategory.find({ filter: { where: { ownerId: $scope.userId } } }).$promise.then((res) => {
                    $scope.happeningsCategoryF = res;
                    $scope.happeningsCategory = res.filter(m => m._name != 'addnew');
                    $scope.happeningsCategory.push(res.find(m => m._name == 'addnew'));
                });
            }

            if (!$rootScope.selectedVenue) $rootScope.selectedVenue = JSON.parse(localStorage.getItem("selectedVenue"));
            if ($scope.userDetails.isAdmin) {
                if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId) {
                    $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                    $scope.userId = $rootScope.selectedVenue.venueId;
                    $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.venueId)
                    if ($("#businessSubmit").hasClass('businessSubmit')) {
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    }
                    $scope.getAllHappenings();
                    $scope.getHappeningscategory();
                }
                $scope.getBusinessFun();
            }

            $scope.getBusinessName = () => { return $scope.businessSelection; };

            $scope.BusinessSelected = (arg) => {
                $("#businessErr").text('');
                if ($("#autocompleteBusiness").data('id')) {
                    arg = $("#autocompleteBusiness").data('id');
                    if ($("#businessSubmit").hasClass('businessSubmit')) {
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    }
                    if (arg != "select") {
                        $scope.isBusinessSelect = true;
                        $scope.userId = arg;
                        $rootScope.selectedVenue = { ownerId: $scope.userId, venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                        $scope.getHappeningscategory();
                        $scope.getAllHappenings();
                        localStorage.removeItem("selectedVenue");
                        localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userId, venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }));
                    }
                } else $("#businessErr").text('Please select the Business name');
            }


            $scope.confirmDelete = () => {
                let ids = JSON.parse(localStorage.getItem('HH_remove_id'));
                if (ids) {
                    let id = ids.id;
                    loader.visible();
                    $("#deleteConfirmPopup").modal('hide');

                    Happenings.findOne({ filter: { where: { id } } }).$promise.then((Hres) => {
                        let result = Hres;
                        if (result.img && result.img.length)
                            $http.post('/spaceFileDelete', { fileName: result.img[0].name });

                        Happenings.removeHappenings({ params: { id } }).$promise.then((res) => {

                            if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId) $scope.userId = $rootScope.selectedVenue.venueId;
                            else if ($scope.userDetails && $scope.userDetails.id) $scope.userId = $scope.userDetails.id;

                            setTimeout(function () {
                                $scope.getAllHappenings();
                                loader.hidden();
                                toastMsg(true, 'Successfully deleted!');
                            }, 200)

                        }, () => { toastMsg(false, 'Please try again'); loader.hidden(); });

                    }, () => { toastMsg(false, 'Please try again'); loader.hidden(); });

                } else toastMsg(false, 'Please try again!');
            };


            $scope.ticketedReserClk = (id) => {
                $rootScope.happeningsId = id;
                $state.go('whatson-reservation');
            }

            $scope.eventsList = []; $scope.selectEventTitle;
            $scope.businessVaild = (isVaild = false) => {
                $scope.getAllHappenings();
            };

            $scope.showTheMiddle = (event, i) => {
                $(`.middle_${i}`).css({ 'display': 'block', 'position': 'absolute', 'right': '2%' });
            }

            $scope.hiddenTheMiddle = (i) => {
                $(`.middle_${i}`).css({ 'display': 'none' })
            }

            $scope.deleteHappenings = (id) => {
                if (id) {
                    if (localStorage.getItem("HH_remove_id")) localStorage.removeItem("HH_remove_id");
                    localStorage.setItem('HH_remove_id', JSON.stringify({ id }));
                    $('#deleteConfirmPopup').modal({ backdrop: 'static', keyboard: false });
                }
                else toastMsg(false, "please try again");
            };


            $scope.selectedTitle = '';
            $scope.filterEvents = () => {

                let titleTxt = $("#f-title").val();

                let tDate = new Date();
                let date = `${tDate.getFullYear()}-${("0" + (tDate.getMonth() + 1)).slice(-2)}-${("0" + tDate.getDate()).slice(-2)}T00:00:00.000Z`;

                let filter = { where: { ownerId: $scope.userId, date: { gte: date } } };

                if (titleTxt && titleTxt != 'select') {
                    filter.where.titleTxt = titleTxt;
                }

                if ($("#_happenings_s_view").val() == 7 || $("#_happenings_s_view").val() == 14) {
                    let LastDate = new Date();
                    LastDate.setDate(LastDate.getDate() + Number($("#_happenings_s_view").val()));
                    let ltdate = `${LastDate.getFullYear()}-${("0" + (LastDate.getMonth() + 1)).slice(-2)}-${("0" + LastDate.getDate()).slice(-2)}T00:00:00.000Z`;
                    filter.where.date = {
                        between: [date, ltdate]
                    };
                } else if ($("#_happenings_s_view").val() == "All") {
                    filter.where.date = { gte: date };
                }

                filter.include = [{ relation: "happeningsCategory" }];

                filter.order = "date asc";

                loader.visible();
                $scope.whatsOnEvents = [];

                Happenings.find({ filter }).$promise.then((res) => {
                    $scope.whatsOnEvents = [];
                    setTimeout(() => { loader.hidden(); }, 500);
                    if (res && res.length) {
                        if ($("#f-category option:selected").text() != 'All' && $("#f-category option:selected").val() != 'select') {
                            $scope.selectedTitle = $("#f-category option:selected").val();
                            $scope.whatsOnEvents = res.filter(m => m.happeningsCategory.name == $("#f-category option:selected").text());
                        } else {
                            $scope.whatsOnEvents = res;
                        }

                        let grouVa = groupByKey($scope.whatsOnEvents, 'titleTxt');
                        $scope.whatsOnETitle = [];
                        Object.keys(grouVa).forEach((k, j) => {
                            let oSData = $scope.whatsOnEvents.find(m => m.titleTxt == k);
                            let { titleTxt, title } = oSData;
                            $scope.whatsOnETitle.push({ titleTxt, title });
                        });
                    }
                }, () => {
                    setTimeout(() => { loader.hidden(); }, 500);
                });
            }

            $scope.gotoView = (id) => {
                if (id) {
                    localStorage.removeItem("happeningsEVid");
                    localStorage.setItem("happeningsEVid", JSON.stringify({ "id": id }));
                    $state.go('view-whats-on-events');
                } else toastMsg(false, "Please try again!");
            }

            $scope.gotoEdit = (id) => {
                if (id) {
                    localStorage.removeItem("happeningsEUid");
                    localStorage.setItem("happeningsEUid", JSON.stringify({ "id": id }));
                    $state.go('update-whatson-events');
                } else toastMsg(false, "Please try again!");
            }

            $scope.updateStatus = (id, status) => {
                if (id) {
                    loader.visible();
                    status = (status == 'Pending' ? 'Live' : 'Pending');
                    Happenings.upsertWithWhere({ where: { id } }, { status }).$promise.then(() => {
                        Happenings.updateLiveDateAndTime({ params: { id } });
                        $scope.getAllHappenings();
                        toastMsg(true, "Successfully updated!");
                        setTimeout(function () { loader.hidden() }, 600);
                    })
                } else toastMsg(false, "Please try again!");
            }

            $scope.checkedOffers = () => {
                let cCnt = $('.tw-s-box').filter(':checked').length;
                $(".deleteAllDiv").css('display', 'none');
                if (cCnt >= 1) $(".deleteAllDiv").css('display', 'block');
            }

            $scope.deleteAllNo = () => {
                $(".tw-s-box").prop('checked', false);
                $("#selectAllCheck").prop('checked', false);
            }

            $scope.confirmDeleteAll = () => {
                loader.visible();
                let values = $('input:checked').map(function (i, e) { return e.value }).toArray();
                if (values && values.length) {
                    if (values && values.length) {
                        loader.visible();
                        let ids = [];
                        for (let id of values) {
                            ids.push({ id })
                        }
                        if (ids && ids.length) {
                            Happenings.find({ filter: { where: { or: ids } } }).$promise.then((res_d) => {
                                if (res_d && res_d.length) {
                                    for (let { primaryImg, secondaryImg, primaryVideo } of res_d) {
                                        if (primaryImg && primaryImg.path) $http.post('/spaceFileDelete', { fileName: primaryImg.fileName });
                                        if (secondaryImg && secondaryImg.path) $http.post('/spaceFileDelete', { fileName: secondaryImg.fileName });
                                        if (primaryVideo && primaryVideo.path) $http.post('/spaceFileDelete', { fileName: primaryVideo.fileName });
                                    }
                                    setTimeout(function () {
                                        Happenings.deleteAllDrinksSpecial({ params: { values } }).$promise.then((res) => {
                                            $scope.getAllHappenings();
                                            $("#selectAllCheck").prop('checked', false);
                                            $(".deleteAllDiv").css('display', 'none');
                                            setTimeout(function () { loader.hidden(); toastMsg(true, "Successfully deleted!") }, 500)
                                        });
                                    }, 300);
                                }
                            });
                        } else {
                            setTimeout(function () { loader.hidden(); });
                            toastMsg(false, "Please try again!");
                        }

                    } else {
                        setTimeout(function () { loader.hidden(); });
                        toastMsg(false, "Please try again!");
                    }
                } else {
                    setTimeout(function () { loader.hidden(); }, 200);
                    toastMsg(false, "Please try again!");
                }
            }

            $scope.DeleteToAll = () => {
                loader.visible();
                let values = $('input:checked').map(function (i, e) { return e.value }).toArray();
                if (values && values.length) {
                    $('#deleteAllConfirmPopup').modal({ backdrop: 'static', keyboard: false });
                } else toastMsg(false, "Please try again!");
                setTimeout(function () { loader.hidden(); }, 200);

            }

        }])
    .controller('happeningsManageCtl', ['$scope', '$state', 'Business', '$http', '$rootScope', 'HappeningsCategory', 'Happenings', 'loader', '$stateParams', 'WhatsOnReservation',
        function ($scope, $state, Business, $http, $rootScope, HappeningsCategory, Happenings, loader, $stateParams, WhatsOnReservation) {

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

            $scope.isBusinessSelect = false;

            $scope.userId = "";

            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                $scope.isBusinessSelect = true;
                if ($rootScope.selectedVenue) {
                    Business.find({ filter: { where: { status: "active" }, "fields": ["businessName", "id", "email"] } }).$promise.then((res) => {
                        $scope.businessDelection = res;
                    });
                    $scope.userId = $rootScope.selectedVenue.venueId;
                    $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                    $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.venueId);
                    $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                } else {
                    Business.find({ filter: { where: { status: "active" }, "fields": ["businessName", "id", "email"] } }).$promise.then((res) => {
                        $scope.businessDelection = res;
                        $scope.userId = $rootScope.currentUser.id;
                    }, (err) => {
                        console.log(JSON.stringify());
                    });
                }
            }
            else {
                $scope.isBusinessSelect = true;
                $scope.userId = $rootScope.currentUser.id;
            }

            $scope.getBusinessName = () => { return $scope.businessDelection; };

            $scope.happeningsCategory = [];
            $scope.getHappeningscategory = () => {
                HappeningsCategory.find({ filter: { where: { ownerId: $scope.userId } } }).$promise.then((res) => {
                    $scope.happeningsCategory = res;
                });
            }


            $scope.requestDataForWhats = [];
            $scope.getWhatsOnRequest = () => {
                loader.visible();
                WhatsOnReservation.find({
                    filter: {
                        where: { ownerId: $scope.userId }, include: [{ relation: "happeningsCategory" }, {
                            relation: "customer"
                        }]
                    }
                }).$promise.then((res) => {
                    setTimeout(function () { loader.hidden() }, 500);
                    $scope.requestDataForWhats = res;
                })
            }

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

            if ($scope.userDetails.isAdmin == false) {
                $scope.getWhatsOnRequest();
                $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                $("#autocompleteBusiness").attr('disabled', true);
                $scope.getHappeningscategory();
                localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
            }

            $scope.changeStatus = (id) => {
                if (id) {
                    if (localStorage.getItem("HH_req_id")) localStorage.removeItem("HH_req_id");
                    localStorage.setItem('HH_req_id', JSON.stringify({ id }));
                    $('#changeTheStatus').modal({ backdrop: 'static', keyboard: false });
                } else toastMsg(false, "Please try again!");
            }

            $scope.confirmed = () => {
                if (localStorage.getItem("HH_req_id")) {
                    let ids = JSON.parse(localStorage.getItem("HH_req_id"));
                    if (ids && ids.id) {
                        loader.visible();
                        WhatsOnReservation.upsertWithWhere({ where: { id: ids.id } }, { status: "confirmed" }).$promise.then((res) => {
                            $scope.getWhatsOnRequest();
                            $('#changeTheStatus').modal('hide');
                            toastMsg(true, "Successfully updated");
                        }, () => {
                            $('#changeTheStatus').modal('hide');
                            $scope.getWhatsOnRequest();
                            toastMsg(false, "Please try again");
                        })
                    } else toastMsg(false, "Please try again");
                } else toastMsg(false, "Please try again");
            }

            $scope.rejected = () => {
                if (localStorage.getItem("HH_req_id")) {
                    let ids = JSON.parse(localStorage.getItem("HH_req_id"));
                    if (ids && ids.id) {
                        loader.visible();
                        WhatsOnReservation.upsertWithWhere({ where: { id: ids.id } }, { status: "rejected" }).$promise.then((res) => {
                            $scope.getWhatsOnRequest();
                            $('#changeTheStatus').modal('hide');
                            toastMsg(true, "Successfully updated");
                        }, () => {
                            $('#changeTheStatus').modal('hide');
                            $scope.getWhatsOnRequest();
                            toastMsg(false, "Please try again");
                        })
                    } else toastMsg(false, "Please try again");
                } else toastMsg(false, "Please try again");
            }

            $scope.showTheMiddle = (event, i) => {
                $(`.middle_${i}`).css({ 'display': 'block', 'position': 'absolute', 'right': '2%' });
            }

            $scope.hiddenTheMiddle = (i) => {
                $(`.middle_${i}`).css({ 'display': 'none' })
            }

            $scope.BusinessSelected = (arg) => {
                $("#businessErr").text('');
                if ($("#autocompleteBusiness").data('id')) {
                    arg = $("#autocompleteBusiness").data('id');
                    if ($("#businessSubmit").hasClass('businessSubmit')) {
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    }
                    if (arg != "select") {
                        $scope.isBusinessSelect = true;
                        $scope.userId = arg;
                        $rootScope.selectedVenue = { venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                        $scope.getWhatsOnRequest();
                        $scope.getHappeningscategory();
                    }
                } else $("#businessErr").text('Please select the Business name');
            }

            $scope.filterRequestEvents = () => {
                let filter = { where: { ownerId: $scope.userId }, include: [{ relation: "happeningsCategory" }, { relation: "customer" }] };
                if ($("#f-category").val() && $("#f-category").val() !== 'select') {
                    filter.include[0].scope = { where: { name: '' } };
                    filter.include[0].scope.where.name = $("#f-category").val()
                }
                if ($("#f-date").val()) filter.where.requestDate = $("#f-date").val() + 'T00:00:00.000Z';
                if ($("#f-type").val() && $("#f-type").val() !== 'select') filter.where.isTicketed = ($("#f-type").val() == 'Non-ticketed' ? false : true);
                loader.visible();
                WhatsOnReservation.find({
                    filter
                }).$promise.then((res) => {
                    let result = [];
                    res.forEach((val) => {
                        if (val && val.happeningsCategory) result.push(val);
                    });
                    setTimeout(function () { loader.hidden() }, 500);
                    $scope.requestDataForWhats = result;
                })
            }



        }])
    .controller('whatsOnReservationCtl', ['$scope', '$state', 'Business', '$http', '$rootScope', 'Happenings', 'loader', '$stateParams', 'WhatsOnReservation',
        function ($scope, $state, Business, $http, $rootScope, Happenings, loader, $stateParams, WhatsOnReservation) {

            if (!$rootScope.happeningsId) $state.go('whatson', { s: 'vticketed' })
            else {
                Happenings.findOne({ filter: { where: { id: $rootScope.happeningsId }, include: "happeningsDates" } }).$promise.then((res) => {
                    $scope.happeningsData = res;
                })
            }

            $scope.requestDetails = [];

            getData = (data) => {
                $scope.requestDetails = [];
                data.filter(m => m.whatsOnReservations && m.whatsOnReservations.length && m.whatsOnReservations.forEach((v) => {
                    $scope.requestDetails.push(v);
                }));
            }

            $scope.getReservation = () => {
                let id = $rootScope.happeningsId;
                Happenings.find({
                    filter: {
                        where: { id }, include: [{
                            relation: "happeningsDates",
                            scope: {
                                include: [{
                                    relation: "whatsOnReservations", scope: {
                                        include: [{
                                            relation: "whatsOnTeamMembers", scope: {
                                                relation: "customer", scope: { fields: ["firstName", "lastName", "mobile", "id", "age", "gender", "email"] }
                                            }
                                        }]
                                    }
                                }]
                            }
                        }]
                    }
                }).$promise.then((res) => {
                    res.filter(m => { m.happeningsDates && m.happeningsDates.length && getData(m.happeningsDates) });
                })
            }

            if ($rootScope.happeningsId) $scope.getReservation();

            $scope.reservationView = (arg) => {
                if (!$("#R_S_L_1").hasClass('show')) {
                    $("#R_S_L_1").removeClass().addClass('col-xs-8 col-sm-8 col-md-8 col-lg-8 col-xl-8 show');
                    $("#R_S_L_V_2").css({ display: 'block' });
                } else if ($("#R_S_L_1").hasClass('show')) {
                    $("#R_S_L_1").removeClass().addClass('col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12');
                    $("#R_S_L_V_2").css({ display: 'none' });
                }
                $scope.requestObj = $scope.requestDetails.find(m => m.id == arg);
            }

            $scope.closeView = () => {
                $("#R_S_L_1").removeClass('col-xs-8 col-sm-8 col-md-8 col-lg-8 col-xl-8 show').addClass('col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12');
                $("#R_S_L_V_2").css({ display: 'none' });
                // $("#reservationTable tbody tr").each(function (i, val) {
                //     if ($(val).data('isvisible')) $(val).attr('data-isvisible', false);
                // })
            };

            $scope.statusUpdate = (id, status) => {
                $scope.whatsOnStatus = status;
                $scope.whatsOnId = id;
                $('#confirmPopup').modal({ backdrop: 'static', keyboard: false })
            }

            $scope.confirmBtn = () => {
                if ($scope.whatsOnStatus && $scope.whatsOnId) {
                    loader.visible();
                    WhatsOnReservation.upsertWithWhere({ where: { id: $scope.whatsOnId } }, { status: $scope.whatsOnStatus }).$promise.then((res) => {
                        WhatsOnReservation.notifToCustomer({ params: { id: $scope.whatsOnId, happeningsId: $rootScope.happeningsId } });
                        $('#confirmPopup').modal('hide');
                        $scope.getReservation();
                        loader.hidden();
                    });
                }
            }

        }])
    .controller('whatsOnEventsView', ['$scope', '$state', 'Business', '$http', '$rootScope', 'Happenings', 'loader', '$stateParams',
        function ($scope, $state, Business, $http, $rootScope, Happenings, loader, $stateParams) {

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.getData = () => {
                var values = JSON.parse(localStorage.getItem('happeningsEVid'));
                var id = values.id;
                $scope.viewHappenings = {};
                loader.visible();
                Happenings.findOne({
                    filter: {
                        where: { id },
                        include: [{ relation: "happeningsCategory" }, { relation: "business", scope: { fields: ["businessName"] } }, { relation: "happeningsTickets" }]
                    }
                })
                    .$promise.then((res) => {
                        $scope.viewHappenings = res;
                        setTimeout(function () { loader.hidden(); }, 300)
                    })
            }

            if (localStorage.getItem('happeningsEVid')) $scope.getData();
            else $state.go("edit-happenings");

            $scope.ticketView = (id) => {
                if (id) {
                    $scope.ticketDisabled = true;
                    $("#ticket_header").text('View Ticket');
                    $scope.viewHappeningsModal = $scope.viewHappenings.happeningsTickets.find(m => m.id == id);
                    $scope.viewHappeningsModal.salesStartDate = new Date($scope.viewHappeningsModal.salesStartDate);
                    $scope.viewHappeningsModal.salesEndDate = new Date($scope.viewHappeningsModal.salesEndDate);
                    $("#ticketViewAndEditModal").modal({ backdrop: 'static', keyboard: false });
                } else toastMsg(false, "Please try again");
            }

            $scope.confirmToLive = () => {
                var values = JSON.parse(localStorage.getItem('happeningsEVid'));
                var id = values.id;
                if (id) {
                    loader.visible();
                    Happenings.upsertWithWhere({ where: { id } }, { status: 'Live' }).$promise.then((res) => {
                        Happenings.updateLiveDateAndTime({ params: { id } });
                        toastMsg(true, "Successfully updated.");
                        $("#liveConfirmPopup").modal('hide');
                        $scope.getData();
                    }, () => {
                        toastMsg(false, "Please try again");
                        loader.hidden();
                        $("#liveConfirmPopup").modal('hide');
                    });
                } else toastMsg(false, "Please try again");
            }

            $scope.confirmGoBackBtn = () => {
                var values = JSON.parse(localStorage.getItem('happeningsEVid'));
                var id = values.id;
                if (id) {
                    loader.visible();
                    Happenings.upsertWithWhere({ where: { id } }, { status: 'Upcoming' }).$promise.then((res) => {
                        toastMsg(true, "Successfully updated.");
                        $("#liveConfirmPopup").modal('hide');
                        $scope.getData();
                    }, () => {
                        toastMsg(false, "Please try again");
                        loader.hidden();
                        $("#liveConfirmPopup").modal('hide');
                    });
                } else toastMsg(false, "Please try again");
            }
        }])
    .controller('whatsOnEventsEdit', ['$scope', '$state', 'Business', '$http', '$rootScope', 'Happenings', 'loader', '$stateParams', 'WhatsOnReservation', 'HappeningsCategory', 'HappeningsTicket',
        function ($scope, $state, Business, $http, $rootScope, Happenings, loader, $stateParams, WhatsOnReservation, HappeningsCategory, HappeningsTicket) {

            let toastMsg = (isVaild, msg) => {
                if (isVaild) toastr.success(msg);
                else toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            const convertTime12to24 = (time12h) => moment(time12h, 'hh:mm A').format('HH:mm');

            $scope.ticketView = (id) => {
                if (id) {
                    $scope.ticketDisabled = true;
                    $("#ticket_header").text('View Ticket');
                    $scope.editTicket = $scope.editHappeningsTicket.find(m => m.id == id);
                    $scope.editTicket.salesStartDate = new Date($scope.editTicket.salesStartDate);
                    $scope.editTicket.salesEndDate = new Date($scope.editTicket.salesEndDate);
                    $("#ticketViewAndEditModal").modal({ backdrop: 'static', keyboard: false });
                } else toastMsg(false, "Please try again");
            }

            $scope.ticketDelete = (id) => {
                if (id) {
                    localStorage.removeItem("Ticket_delete_id");
                    localStorage.setItem("Ticket_delete_id", JSON.stringify({ id }))
                    $("#ticketDeleteModal").modal({ backdrop: 'static', keyboard: false });
                } else toastMsg(false, "Please try again");
            }

            $scope.ticketEdit = (id) => {
                if (id) {
                    $scope.ticketDisabled = false;
                    $("#ticket_header").text('Edit Ticket');
                    localStorage.removeItem("Ticket_e_update_id");
                    localStorage.setItem("Ticket_e_update_id", JSON.stringify({ id }))
                    $scope.editTicket = $scope.editHappeningsTicket.find(m => m.id == id);
                    $scope.editTicket.salesStartDate = new Date($scope.editTicket.salesStartDate);
                    $scope.editTicket.salesEndDate = new Date($scope.editTicket.salesEndDate);
                    $("#ticketViewAndEditModal").modal({ backdrop: 'static', keyboard: false });
                } else toastMsg(false, "Please try again");
            }

            $scope.chanCStatus = () => {
                if ($scope.editHappenings.happeningsCategory._name != "trivia") {
                    if ($scope.upAllStatus == "Pending") $scope.upAllStatus = "Live";
                    else $scope.upAllStatus = "Pending";
                } else {
                    if ($scope.triviaUpAllStatus == "Pending") $scope.triviaUpAllStatus = "Live";
                    else $scope.triviaUpAllStatus = "Pending";
                }
            }

            $scope.upAllStatus = "Pending";
            $scope.triviaUpAllStatus = "Pending";
            $scope.getData = () => {
                var values = JSON.parse(localStorage.getItem('happeningsEUid'));
                var id = values.id;
                $scope.viewHappenings = {};
                loader.visible();

                Happenings.find({
                    filter: {
                        where: { id }, include: [{ relation: "happeningsCategory" },
                        { relation: "happeningsTickets" }]
                    }
                }).$promise.then((res) => {
                    if (res && res.length) {

                        let { happeningsTickets, date, added, guarantee, buyIn, reBuy, addon, reEntry,
                            startingStack, reBuyStack, addOnStack, reEntryStack,
                            happeningsCategoryId } = res[0];
                        $scope.editHappenings = res[0];

                        if (res[0].happeningsCategory._name == "trivia") {
                            $scope.triviaUpAllStatus = res[0].status;
                        } else $scope.upAllStatus = res[0].status;

                        $scope.editHappeningsTicket = happeningsTickets;
                        $scope.editHappenings.date = new Date(date);
                        $scope.editHappenings.added = Number(added);
                        $scope.editHappenings.guarantee = Number(guarantee);
                        $scope.editHappenings.buyIn = Number(buyIn);
                        $scope.editHappenings.reBuy = Number(reBuy);
                        $scope.editHappenings.addon = Number(addon);
                        $scope.editHappenings.reEntry = Number(reEntry);
                        $scope.editHappenings.startingStack = Number(startingStack);
                        $scope.editHappenings.reBuyStack = Number(reBuyStack);
                        $scope.editHappenings.addOnStack = Number(addOnStack);
                        $scope.editHappenings.reEntryStack = Number(reEntryStack);
                        // if (res.happeningsCategory.name == "Poker") $("#poker_start_date").val(res.date.split('T')[0]);
                        // else $("#events_date").val(res.date.split('T')[0]);
                        $scope.happeningsCategoryId = happeningsCategoryId;
                        let selectedVenue = JSON.parse(localStorage.getItem("selectedVenue")), ownerId;
                        if (selectedVenue.ownerId) {
                            ownerId = selectedVenue.ownerId;
                            HappeningsCategory.find({ filter: { where: { ownerId } } }).$promise.then((res) => {
                                $scope.happeningsCategories = res;
                            });
                        }
                        setTimeout(function () { loader.hidden(); }, 300)
                    } else toastMsg(false, "Please try again!");

                });
            }

            $scope.edit_update_ticket = () => {
                let ids = JSON.parse(localStorage.getItem("Ticket_e_update_id"));
                if (ids && ids.id) {
                    let ticketType, ticketName, ticketQty, salePrice, ticketDesc, salesStartDate, salesStartTime, salesEndDate, salesEndTime, minTicket, maxTicket;
                    //T00:00:00.000Z
                    ticketType = $("#ticket_type").val();
                    ticketName = $("#ticket_name").val();
                    ticketQty = $("#ticket_sale_qty").val();
                    salePrice = $("#ticket_salePrice").val();
                    ticketDesc = $("#_ticket_desc_0").val();
                    salesStartDate = `${$("#ticket_salesStartDate").val()}T00:00:00.000Z`;
                    salesStartTime = $("#ticket_salesStartTime").val();
                    salesEndDate = `${$("#ticket_salesEndDate").val()}T00:00:00.000Z`;
                    salesEndTime = $("#ticket_salesEndTime").val();
                    maxTicket = $("#ticket_max").val();
                    minTicket = $("#ticket_min").val();

                    HappeningsTicket.upsertWithWhere({ where: { id: ids.id } }, { ticketName, ticketType, ticketQty, salePrice, ticketDesc, salesStartDate, salesStartTime, salesEndDate, salesEndTime, maxTicket, minTicket }).$promise.then((res) => {
                        $scope.getData();
                        toastMsg(true, "Successfully updated");
                        $("#ticketViewAndEditModal").modal('hide');
                    }, (err) => {
                        toastMsg(false, "Please try again!");
                        $("#ticketViewAndEditModal").modal('hide');
                    })

                } else toastMsg(false, "Please try again");
            }

            $scope.confirmTicketDelete = () => {
                let ids = JSON.parse(localStorage.getItem("Ticket_delete_id"));
                if (ids && ids.id) {
                    HappeningsTicket.deleteById({ id: ids.id }).$promise.then((res) => {
                        $("#ticketDeleteModal").modal('hide');
                        toastMsg(true, "Successfully deleted.");
                        $scope.getData();
                    }, (err) => {
                        toastMsg(false, "Please try again");
                        $("#ticketDeleteModal").modal('hide');
                    })

                } else toastMsg(false, "Please try again");
            }

            if (localStorage.getItem('happeningsEUid')) $scope.getData();
            else $state.go("edit-happenings");

            var now = new Date();

            var day = ("0" + now.getDate()).slice(-2);
            var month = ("0" + (now.getMonth() + 1)).slice(-2);

            $("input[type='date']").attr('min', now.getFullYear() + "-" + (month) + "-" + (day));

            $scope.delete = async (id, arg) => {
                if (id) {
                    Happenings.findOne({ filter: { where: { id } } }).$promise.then((data) => {
                        if (arg == 'primary') {
                            if (data.primaryImg && data.primaryImg.path) {
                                loader.visible();
                                $(`#delete_${id}`).html('<i class="fas fa-spinner fa-spin"></i>').prop('disabled', true);
                                $http.post('/spaceFileDelete', { fileName: data.primaryImg.fileName }).then((deleteImg) => {
                                    Happenings.upsertWithWhere({ where: { id } }, { primaryImg: {} }).$promise.then((res) => {
                                        $scope.getData();
                                        toastMsg(true, "Successfully deleted!");
                                        setTimeout(function () {
                                            $(`#delete_${id}`).html('<i class="far fa-trash-alt"></i>').prop('disabled', false);
                                        }, 1500)
                                    });
                                });
                            }
                            else toastMsg(false, "Please try again");
                        } else if (arg == 'secondary') {
                            if (data.secondaryImg && data.secondaryImg.path) {
                                loader.visible();
                                $(`#delete_${id}`).html('<i class="fas fa-spinner fa-spin"></i>').prop('disabled', true);
                                $http.post('/spaceFileDelete', { fileName: data.secondaryImg.fileName }).then((deleteImg) => {
                                    Happenings.upsertWithWhere({ where: { id } }, { secondaryImg: {} }).$promise.then((res) => {
                                        $scope.getData();
                                        toastMsg(true, "Successfully deleted!");
                                        setTimeout(function () {
                                            $(`#delete_${id}`).html('<i class="far fa-trash-alt"></i>').prop('disabled', false);
                                        }, 1500)
                                    });
                                });
                            }
                        } else if (arg == 'primaryVideo') {
                            if (data.primaryVideo && data.primaryVideo.path) {
                                loader.visible();
                                $(`#delete_${id}`).html('<i class="fas fa-spinner fa-spin"></i>').prop('disabled', true);
                                $http.post('/spaceFileDelete', { fileName: data.primaryVideo.fileName }).then((deleteImg) => {
                                    Happenings.upsertWithWhere({ where: { id } }, { primaryVideo: {} }).$promise.then((res) => {
                                        $scope.getData();
                                        toastMsg(true, "Successfully deleted!");
                                        setTimeout(function () {
                                            $(`#delete_${id}`).html('<i class="far fa-trash-alt"></i>').prop('disabled', false);
                                        }, 1500)
                                    });
                                });
                            }
                        }
                        else toastMsg(false, "Please try again");
                    }, () => { toastMsg(false, "Please try again"); });
                } else toastMsg(false, "Please try again");
            }

            function dataURItoBlob(dataURI) {
                var byteString;
                if (dataURI.split(',')[0].indexOf('base64') >= 0)
                    byteString = atob(dataURI.split(',')[1]);
                else byteString = unescape(dataURI.split(',')[1]);

                var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

                var ia = new Uint8Array(byteString.length);
                for (var i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                return new Blob([ia], { type: mimeString });
            };

            $scope.clickImageSection = (file) => {

                var result = document.querySelector('.result'),
                    cropbtn = document.querySelector('#crop-btn'),
                    cropper = '';

                const reader = new FileReader();
                reader.onload = (e) => {
                    if (e.target.result) {
                        $("#image-crop-md").modal({ backdrop: 'static', keyboard: false });
                        // create new image
                        let img = document.createElement('img');
                        img.id = 'image';
                        img.src = e.target.result;
                        result.innerHTML = '';
                        result.appendChild(img);
                        cropper = new Cropper(img, {
                            dragMode: 'move',
                            restore: false,
                            guides: false,
                            center: false,
                            highlight: false,
                            cropBoxMovable: false,
                            cropBoxResizable: false,
                            toggleDragModeOnDblclick: false,
                            minContainerWidth: 720,
                            minContainerHeight: 370,
                            minCropBoxWidth: 700,
                            minCropBoxHeight: 350
                        });
                    }
                };
                reader.readAsDataURL(file);

                // save on click
                cropbtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    let imgSrc = cropper.getCroppedCanvas({
                        width: 700,
                        height: 350
                    }).toDataURL();
                    $("#image-crop-md").modal('hide');
                    var fd = new FormData();
                    var uid = uuidv4();
                    $scope.pImgUpAll = [{ path: imgSrc }]
                    loader.visible();
                    fd.append(`happenings_0`, dataURItoBlob(imgSrc), `${uid}.png`);
                    $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess && res.data.result.length) {
                                let primaryImg = res.data.result[0];
                                var values = JSON.parse(localStorage.getItem('happeningsEUid'));
                                let id = values.id;
                                if (id) {
                                    Happenings.upsertWithWhere({ where: { id } }, { primaryImg }).$promise.then((res) => {
                                        $scope.getData();
                                        toastMsg(true, "Successfully updated!");
                                        setTimeout(function () {
                                            loader.hidden()
                                        }, 1500)
                                    });
                                }
                            } else loader.hidden()
                        }, () => loader.hidden())
                    cropper_2.destroy();
                    cropper_2.reset();
                    cropper_2.clear();
                    // $("#img-pre").attr('src', imgSrc);
                    // $(".img-h-s").css({ display: 'block' });
                    // $(".img-c-s").css({ display: 'none' });
                });

                $("#delete_i_index").on('click', function () {
                    $("#img-pre").attr('src', '');
                    $(".img-c-s").css({ display: 'block' })
                    $(".img-h-s").css({ display: 'none' })
                });

                $("#modalClose").on('click', function () {
                    $("#image-crop-md").modal('hide');
                });
            }

            $scope.clickImgSecond = (file) => {

                var result_1 = document.querySelector('.result-second'),
                    cropbtn = document.querySelector('#crop-s-btn'),
                    cropper_2 = '';

                const reader = new FileReader();
                reader.onload = (e) => {
                    if (e.target.result) {
                        $("#image-crop-second-md").modal({ backdrop: 'static', keyboard: false });
                        // create new image
                        let img = document.createElement('img');
                        img.id = 'image';
                        img.src = e.target.result;
                        result_1.innerHTML = '';
                        result_1.appendChild(img);
                        cropper_2 = new Cropper(img, {
                            dragMode: 'move',
                            restore: false,
                            guides: false,
                            center: false,
                            highlight: false,
                            cropBoxMovable: false,
                            cropBoxResizable: false,
                            toggleDragModeOnDblclick: false,
                            minContainerWidth: 650,
                            minContainerHeight: 475,
                            minCropBoxWidth: 600,
                            minCropBoxHeight: 450
                        });
                    }
                };
                reader.readAsDataURL(file);

                // save on click
                cropbtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    let imgSrc = cropper_2.getCroppedCanvas({
                        width: 600,
                        height: 450
                    }).toDataURL();
                    $("#image-crop-second-md").modal('hide');
                    var fd = new FormData();
                    var uid = uuidv4();
                    $scope.sImgUpAll = [{ path: imgSrc }]
                    loader.visible();
                    fd.append(`happenings_0`, dataURItoBlob(imgSrc), `${uid}.png`);
                    $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess && res.data.result.length) {
                                let secondaryImg = res.data.result[0];
                                var values = JSON.parse(localStorage.getItem('happeningsEUid'));
                                let id = values.id;
                                if (id) {
                                    Happenings.upsertWithWhere({ where: { id } }, { secondaryImg }).$promise.then((res) => {
                                        $scope.getData();
                                        toastMsg(true, "Successfully updated!");
                                        setTimeout(function () {
                                            loader.hidden()
                                        }, 1500)
                                    });
                                }
                            } else loader.hidden()
                        }, () => loader.hidden())
                    cropper_2.destroy();
                    cropper_2.reset();
                    cropper_2.clear();
                });

                $("#delete_i_s_index").on('click', function () {
                    $("#img-second-pre").attr('src', '');
                    $(".img-c-s-s").css({ display: 'block' })
                    $(".img-h-s-s").css({ display: 'none' })
                });

                $("#modalClose_second").on('click', function () {
                    $("#image-crop-second-md").modal('hide');
                });
            }

            uploadImg = () => {
                return new Promise((resolve, reject) => {
                    var fd = new FormData();
                    var uid = uuidv4();
                    fd.append(`happenings_0`, dataURItoBlob($("#img-pre").attr('src')), `${uid}.png`);
                    $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess) {
                                $scope.happeningsImage = [];
                                img = res.data.result;
                                resolve({ isSuccess: true, img });
                            } else loader.hidden()
                        }, () => loader.hidden())
                })
            }

            uploadSecondImg = () => {
                return new Promise((resolve, reject) => {
                    var fd = new FormData();
                    var uid = uuidv4();
                    fd.append(`happenings_0`, dataURItoBlob($("#img-second-pre").attr('src')), `${uid}.png`);
                    $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess) {
                                $scope.happeningsImage = [];
                                img = res.data.result;
                                resolve({ isSuccess: true, img });
                            } else loader.hidden()
                        }, () => loader.hidden())
                })
            }

            $scope.updateEvents = () => {
                var values = JSON.parse(localStorage.getItem('happeningsEUid'));
                id = values.id,
                    date = `${$("#events_date").val()}T00:00:00.000Z`,
                    dateF = $("#events_date").val().split('-'),
                    dateFormat = `${("0" + dateF[2]).slice(-2)}-${("0" + dateF[1]).slice(-2)}-${dateF[0]}`,
                    startTime = $("#events_start_time").val(),
                    endTime = $("#events_end_time").val(),
                    dateNo = dateF[2],
                    month = dateF[1],
                    year = dateF[0],
                    fullDesc = $("#desc").val(),
                    title = $("#event-title").val();
                let titleTxt = $("#event-title").val().toString().replace(/\s+/g, '');
                let s_date = new Date($("#events_date").val());
                s_date.setHours((convertTime12to24(startTime)).split(':')[0]);
                s_date.setMinutes((convertTime12to24(startTime)).split(':')[1]);
                startTimeFormat = s_date.getTime();
                let e_date = new Date($("#events_date").val());
                e_date.setHours((convertTime12to24(endTime)).split(':')[0]);
                e_date.setMinutes((convertTime12to24(endTime)).split(':')[1]);
                endTimeFormat = e_date.getTime();
                loader.visible();

                let create = (data) => {
                    Happenings.upsertWithWhere({ where: { id } }, data).$promise.then((res) => {
                        setTimeout(function () {
                            $scope.getData();
                            toastMsg(true, "Successfully updated");
                            $state.go("edit-happenings");
                        }, 300);
                    }, (err) => {
                        toastMsg(false, "Please try agian");
                    });
                }


                let afterVideo = () => {
                    if (id) {

                        let status = $scope.upAllStatus;
                        create({ date, dateFormat, startTime, endTime, dateNo, month, year, fullDesc, title, titleTxt, startTimeFormat, endTimeFormat, status });

                    } else toastMsg(false, "Please try agian");
                }

                if ($("#ticketAllEventVideo").val()) {

                    loader.visible();

                    var fd = new FormData();

                    var extension = '';
                    function openFile(file) {
                        extension = file.substr((file.lastIndexOf('.') + 1));
                    };
                    var uid = uuidv4();
                    openFile($('#ticketAllEventVideo')[0].files[0].name);
                    fd.append(`happenings_0`, $('#ticketAllEventVideo')[0].files[0], `${uid}.${extension}`);

                    $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                        .then(async (res) => {
                            if (res && res.data && res.data.isSuccess) {
                                let primaryVideo = {};
                                res.data.result.forEach(val => {
                                    if (val.path.includes('https://')) primaryVideo = { fileName: val.fileName, path: `${val.path}` };
                                    else primaryVideo = { fileName: val.fileName, path: `https://${val.path}` };
                                });
                                await Happenings.upsertWithWhere({ where: { id } }, { primaryVideo }).$promise.then(() => {
                                    afterVideo();
                                });

                            } else { toastMsg(false, "Video is not updated. Please try again!"); }
                        }, (err) => toastMsg(false, "Video is not updated. Please try again!"))
                } else afterVideo();
            }

            $scope.updateAllEvents = () => {
                var values = JSON.parse(localStorage.getItem('happeningsEUid'));
                let { id } = values;
                if (id) {
                    let status = $scope.upAllStatus;
                    loader.visible();
                    Happenings.find({ filter: { where: { id } } }).$promise.then((haRes) => {

                        let { titleTxt, happeningsCategoryId, ownerId } = haRes[0];

                        let titleN = $("#event-title").val();
                        let titleTxtN = $("#event-title").val().toString().replace(/\s+/g, '');
                        let descN = $("#desc").val();

                        let startTimeN = $("#events_start_time").val();
                        let endTimeN = $("#events_end_time").val();

                        let s_date = new Date($("#events_date").val());
                        s_date.setHours((convertTime12to24(startTimeN)).split(':')[0]);
                        s_date.setMinutes((convertTime12to24(startTimeN)).split(':')[1]);
                        let startTimeFormatN = s_date.getTime();
                        let e_date = new Date($("#events_date").val());
                        e_date.setHours((convertTime12to24(endTimeN)).split(':')[0]);
                        e_date.setMinutes((convertTime12to24(endTimeN)).split(':')[1]);
                        let endTimeFormatN = e_date.getTime();

                        let fDate = new Date();
                        let date = `${fDate.getFullYear()}-${("0" + (fDate.getMonth() + 1)).slice(-2)}-${("0" + fDate.getDate()).slice(-2)}T00:00:00.000Z`;

                        Happenings.find({
                            filter: {
                                where: {
                                    titleTxt, happeningsCategoryId,
                                    ownerId, date: { gte: date }
                                }
                            }
                        }).$promise.then((haRes_1) => {

                            let primaryVideos = [];
                            let primaryImgS = [];
                            let secondaryImgS = [];

                            let updateAllNewData = () => {
                                haRes_1.forEach((val, i) => {
                                    if (val && val.id) {
                                        if (primaryImgS && primaryImgS.length && secondaryImgS && secondaryImgS.length) {
                                            Happenings.upsertWithWhere({ where: { id: val.id } }, {
                                                title: titleN, titleTxt: titleTxtN, fullDesc: descN, startTime: startTimeN,
                                                startTimeFormat: startTimeFormatN, endTimeFormatN: endTimeFormatN, endTime: endTimeN,
                                                primaryImg: primaryImgS[i], secondaryImg: secondaryImgS[i], status
                                            })
                                        }
                                        else if (primaryVideos && primaryVideos.length) {
                                            Happenings.upsertWithWhere({ where: { id: val.id } }, {
                                                title: titleN, titleTxt: titleTxtN, fullDesc: descN, startTime: startTimeN,
                                                startTimeFormat: startTimeFormatN, endTimeFormatN: endTimeFormatN, endTime: endTimeN,
                                                primaryVideo: primaryVideos[i], status
                                            })
                                        } else if (primaryImgS && primaryImgS.length) {
                                            Happenings.upsertWithWhere({ where: { id: val.id } }, {
                                                title: titleN, titleTxt: titleTxtN, fullDesc: descN, startTime: startTimeN,
                                                startTimeFormat: startTimeFormatN, endTimeFormatN: endTimeFormatN, endTime: endTimeN,
                                                primaryImg: primaryImgS[i], status
                                            })
                                        } else if (secondaryImgS && secondaryImgS.length) {
                                            Happenings.upsertWithWhere({ where: { id: val.id } }, {
                                                title: titleN, titleTxt: titleTxtN, fullDesc: descN, startTime: startTimeN,
                                                startTimeFormat: startTimeFormatN, endTimeFormatN: endTimeFormatN, endTime: endTimeN,
                                                secondaryImg: secondaryImgS[i], status
                                            })
                                        }
                                        else {
                                            Happenings.upsertWithWhere({ where: { id: val.id } }, {
                                                title: titleN, titleTxt: titleTxtN, fullDesc: descN, startTime: startTimeN,
                                                startTimeFormat: startTimeFormatN, endTimeFormatN: endTimeFormatN, endTime: endTimeN,
                                                status
                                            })
                                        }
                                    }
                                    if ((i + 1) == haRes_1.length) {
                                        setTimeout(function () {
                                            $scope.getData();
                                            toastMsg(true, "Successfully updated!");
                                            loader.hidden();
                                            $state.go("edit-happenings");
                                        }, 300);
                                    }
                                })
                            }

                            if ($("#ticketAllEventVideo").val()) {

                                var fd = new FormData();
                                var extension = '';
                                function openFile(file) {
                                    extension = file.substr((file.lastIndexOf('.') + 1));
                                };
                                openFile($('#ticketAllEventVideo')[0].files[0].name);

                                for (let data in haRes_1) {
                                    var uid = uuidv4();
                                    fd.append(`happenings_0`, $('#ticketAllEventVideo')[0].files[0], `${uid}.${extension}`);
                                }

                                $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                                    .then(async (res_v) => {
                                        if (res_v && res_v.data && res_v.data.isSuccess) {

                                            primaryVideos = [];
                                            res_v.data.result.forEach(val => {
                                                if (val.path.includes('https://')) primaryVideos.push({ fileName: val.fileName, path: `${val.path}` });
                                                else primaryVideos.push({ fileName: val.fileName, path: `https://${val.path}` });
                                            });

                                            updateAllNewData();

                                        } else { toastMsg(false, "Video is not updated. Please try again!"); }
                                    }, (err) => toastMsg(false, "Video is not updated. Please try again!"));

                            } else if ($scope.pImgUpAll.length && $scope.sImgUpAll.length) {

                                if ($scope.pImgUpAll.length) {
                                    var fd = new FormData();

                                    for (let data in haRes_1) {
                                        var uid = uuidv4();
                                        fd.append(`happenings_0`, dataURItoBlob($scope.pImgUpAll[0]), `${uid}.png`);
                                    }

                                    $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                                        .then(async (res_i_1) => {
                                            if (res_i_1 && res_i_1.data && res_i_1.data.isSuccess) {

                                                primaryImgS = [];

                                                res_i_1.data.result.forEach(val => {
                                                    primaryImgS.push(val);
                                                });


                                                var fd_1 = new FormData();

                                                for (let data in haRes_1) {
                                                    var uid_1 = uuidv4();
                                                    fd.append(`happenings_0`, dataURItoBlob($scope.sImgUpAll[0]), `${uid_1}.png`);
                                                }

                                                $http.post('/happeningsImg', fd_1, { headers: { 'Content-Type': undefined } })
                                                    .then(async (res_s_1) => {
                                                        if (res_s_1 && res_s_1.data && res_s_1.data.isSuccess) {
                                                            secondaryImgS = [];
                                                            res_s_1.data.result.forEach(val => {
                                                                secondaryImgS.push(val);
                                                            });

                                                            updateAllNewData();
                                                        }
                                                    }, () => {
                                                        loader.hidden();
                                                        toastMsg();
                                                    });
                                            } else { toastMsg(false, "Please try again!"); }
                                        }, (err) => toastMsg(false, "Please try again!"));
                                }
                            } else if ($scope.pImgUpAll.length) {
                                var fd = new FormData();

                                for (let data in haRes_1) {
                                    var uid = uuidv4();
                                    fd.append(`happenings_0`, dataURItoBlob($scope.pImgUpAll[0]), `${uid}.png`);
                                }

                                $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                                    .then(async (res_i_1) => {
                                        if (res_i_1 && res_i_1.data && res_i_1.data.isSuccess) {

                                            primaryImgS = [];

                                            res_i_1.data.result.forEach(val => {
                                                primaryImgS.push(val);
                                            });
                                            updateAllNewData();
                                        }
                                    }, () => {
                                        loader.hidden();
                                        toastMsg(false, "Please try again!");
                                    })
                            } else if ($scope.sImgUpAll.length) {

                                var fd = new FormData();

                                for (let data in haRes_1) {
                                    var uid = uuidv4();
                                    fd.append(`happenings_0`, dataURItoBlob($scope.sImgUpAll[0]), `${uid}.png`);
                                }

                                $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                                    .then(async (res_i_1) => {
                                        if (res_i_1 && res_i_1.data && res_i_1.data.isSuccess) {

                                            secondaryImgS = [];

                                            res_i_1.data.result.forEach(val => {
                                                secondaryImgS.push(val);
                                            });
                                            updateAllNewData();
                                        }
                                    }, () => {
                                        loader.hidden();
                                        toastMsg(false, "Please try again!");
                                    })
                            }
                            else updateAllNewData();
                        });
                    })
                } else toastMsg(false, "Please try again!");
            }

            $scope.updatePoker = () => {
                var values = JSON.parse(localStorage.getItem('happeningsEUid'));
                id = values.id;
                let date, dateFormat, registrationCloses, lateRegoTime, startTime, endTime, dateNo, month, year, isTrue = true, gameType, buyIn, reBuy, guarantee, added, reEntry, startingStack, addon, reBuyStack, addOnStack, reEntryStack, buyInCloses, reBuyCloses, addOnCloses, reEntryCloses, maxNoOfReBuy, maxNoOfAddOns, maxNoOfReEntry, title, titleTxt;
                if (!$("#gameType").val()) {
                    isTrue = false;
                    $("#gameType-poker-err").text('Game type is required!');
                }
                if (!$("#poker_date").val()) {
                    isTrue = false;
                    $("#date-poker-err").text('Event date is required!');
                }
                if (!$("#event_time").val()) {
                    isTrue = false;
                    $("#poker-start-time-err").text('Time is required!');
                }
                if (!$("#closes_time").val()) {
                    isTrue = false;
                    $("#closes_time_err").text('Registration closes time is required!');
                }
                if (!$("#late_rego").val()) {
                    isTrue = false;
                    $("#late_rego_err").text('Late Rego is required!');
                }
                if (!$("#guarantee").val()) {
                    isTrue = false;
                    $("#guarantee_err").text('Guarantee is required!');
                }
                if (!$("#event_added").val()) {
                    isTrue = false;
                    $("#event_added_err").text('Event added is required!');
                }

                if (isTrue) {
                    gameType = $("#gameType").val();
                    date = $("#poker_date").val();
                    title = $("#event-title").val();
                    titleTxt = $("#event-title").val().toString().replace(/\s+/g, '');
                    let dateF = date.split('-');
                    dateFormat = `${dateF[2]}-${dateF[1]}-${dateF[0]}`;
                    startTime = $("#event_time").val(); endTime = "11:59 pm";
                    registrationCloses = $("#closes_time").val();
                    lateRegoTime = $("#late_rego").val(); guarantee = $("#guarantee").val();
                    added = $("#event_added").val(); buyIn = $("#buy-in").val();
                    reBuy = $("#re-buy-in").val(); addon = $("#add-ons-in").val();
                    reEntry = $("#re-entry-in").val(); startingStack = $("#starting-stack").val();
                    reBuyStack = $("#re-buy-stack").val(); addOnStack = $("#add-on-stack").val();
                    reEntryStack = $("#re-entry-stack").val(); buyInCloses = $("#buy_in_closes").val();
                    reBuyCloses = $("#re_buy_in_closes").val(); addOnCloses = $("#addon_closes").val();
                    reEntryCloses = $("#re_entry_closes").val(); maxNoOfReBuy = $("#maxNoOfReBuys").val();
                    maxNoOfAddOns = $("#maxNoOfAddons").val(); maxNoOfReEntry = $("#maxNoOfReEntry").val();
                    dateNo = dateF[2];
                    month = dateF[1];
                    year = dateF[0];
                    let s_date = new Date($("#poker_date").val());
                    s_date.setHours((convertTime12to24(startTime)).split(':')[0]);
                    s_date.setMinutes((convertTime12to24(startTime)).split(':')[1]);
                    startTimeFormat = s_date.getTime();
                    let e_date = new Date($("#poker_date").val());
                    e_date.setHours(23);
                    e_date.setMinutes(59);
                    endTimeFormat = e_date.getTime();

                }
                loader.visible();

                create = (data) => {
                    console.log(JSON.stringify(data));
                    Happenings.upsertWithWhere({ where: { id } }, data).$promise.then((res) => {
                        $scope.getData();
                        toastMsg(true, "Successfully updated");
                    }, (err) => {
                        toastMsg(false, "Please try agian");
                    });
                }

                if (id) {
                    let primaryImg = secondaryImg = {};
                    if ($("#img-pre").attr('src') && $("#img-second-pre").attr('src')) {
                        uploadImg().then((res) => {
                            if (res && res.isSuccess) {
                                primaryImg = res.img[0];
                                if ($("#img-second-pre").attr('src')) {
                                    uploadSecondImg().then((res) => {
                                        if (res && res.isSuccess) {
                                            secondaryImg = res.img[0];
                                            create({
                                                date, dateFormat, registrationCloses, lateRegoTime, startTime, endTime, dateNo, month, year, gameType, buyIn, reBuy, guarantee, added, reEntry, startingStack, addon, reBuyStack, addOnStack, reEntryStack, buyInCloses, reBuyCloses, addOnCloses, reEntryCloses, maxNoOfReBuy, maxNoOfAddOns, maxNoOfReEntry, primaryImg, secondaryImg, title, titleTxt
                                            });
                                        } else {
                                            create({
                                                date, dateFormat, registrationCloses, lateRegoTime, startTime, endTime, dateNo, month, year, gameType, buyIn, reBuy, guarantee, added, reEntry, startingStack, addon, reBuyStack, addOnStack, reEntryStack, buyInCloses, reBuyCloses, addOnCloses, reEntryCloses, maxNoOfReBuy, maxNoOfAddOns, maxNoOfReEntry, primaryImg, title, titleTxt
                                            });
                                        }
                                    });
                                } else {
                                    create({
                                        date, dateFormat, registrationCloses, lateRegoTime, startTime, endTime, dateNo, month, year, gameType, buyIn, reBuy, guarantee, added, reEntry, startingStack, addon, reBuyStack, addOnStack, reEntryStack, buyInCloses, reBuyCloses, addOnCloses, reEntryCloses, maxNoOfReBuy, maxNoOfAddOns, maxNoOfReEntry, primaryImg, titleTxt, title
                                    });
                                }
                            } else {
                                create({
                                    date, dateFormat, registrationCloses, lateRegoTime, startTime, endTime, dateNo, month, year, gameType, buyIn, reBuy, guarantee, added, reEntry, startingStack, addon, reBuyStack, addOnStack, reEntryStack, buyInCloses, reBuyCloses, addOnCloses, reEntryCloses, maxNoOfReBuy, maxNoOfAddOns, maxNoOfReEntry, titleTxt, title
                                });
                            }
                        })
                    } else if ($("#img-pre").attr('src')) {
                        uploadImg().then((res) => {
                            if (res && res.isSuccess) {
                                primaryImg = res.img[0];
                                create({
                                    date, dateFormat, registrationCloses, lateRegoTime, startTime, endTime, dateNo, month, year, gameType, buyIn, reBuy, guarantee, added, reEntry, startingStack, addon, reBuyStack, addOnStack, reEntryStack, buyInCloses, reBuyCloses, addOnCloses, reEntryCloses, maxNoOfReBuy, maxNoOfAddOns, maxNoOfReEntry, primaryImg, titleTxt, title
                                });
                            }
                        });

                    } else if ($("#img-second-pre").attr('src')) {
                        uploadSecondImg().then((res) => {
                            if (res && res.isSuccess) {
                                secondaryImg = res.img[0];
                                create({
                                    date, dateFormat, registrationCloses, lateRegoTime, startTime, endTime, dateNo, month, year, gameType, buyIn, reBuy, guarantee, added, reEntry, startingStack, addon, reBuyStack, addOnStack, reEntryStack, buyInCloses, reBuyCloses, addOnCloses, reEntryCloses, maxNoOfReBuy, maxNoOfAddOns, maxNoOfReEntry, secondaryImg, titleTxt, title
                                });
                            }
                        });
                    } else {
                        create({
                            date, dateFormat, registrationCloses, lateRegoTime, startTime, endTime, dateNo, month, year, gameType, buyIn, reBuy, guarantee, added, reEntry, startingStack, addon, reBuyStack, addOnStack, reEntryStack, buyInCloses, reBuyCloses, addOnCloses, reEntryCloses, maxNoOfReBuy, maxNoOfAddOns, maxNoOfReEntry, titleTxt, title
                        });
                    }

                } else toastMsg(false, "Please try agian");
            }

            $scope.updateTrivia = () => {
                let primaryImg = secondaryImg = {};
                var values = JSON.parse(localStorage.getItem('happeningsEUid'));
                id = values.id,
                    date = $("#events_date").val(),
                    dateF = date.split('-'),
                    dateFormat = `${dateF[2]}-${dateF[1]}-${dateF[0]}`,
                    startTime = $("#events_start_time").val(),
                    endTime = "11.59 pm",
                    dateNo = dateF[2],
                    month = dateF[1],
                    year = dateF[0],
                    e_date = new Date($("#events_date").val());
                e_date.setHours(23);
                e_date.setMinutes(59);
                endTimeFormat = e_date.getTime();
                registrationTime = $("#events_registrationTime_trivia").val(),
                    fullDesc = $("#desc").val(),
                    entryFee = $("#entry_fee").val(),
                    entryType = $("#entry_type").val(),
                    title = $("#event-title").val();
                let titleTxt = $("#event-title").val().toString().replace(/\s+/g, '');
                let s_date = new Date($("#events_date").val());
                s_date.setHours((convertTime12to24(startTime)).split(':')[0]);
                s_date.setMinutes((convertTime12to24(startTime)).split(':')[1]);
                startTimeFormat = s_date.getTime();
                loader.visible();

                create = (data) => {
                    Happenings.upsertWithWhere({ where: { id } }, data).$promise.then((res) => {
                        setTimeout(function () {
                            $state.go("edit-happenings");
                            toastMsg(true, "Successfully updated");
                        }, 300);
                    }, (err) => {
                        setTimeout(function () {
                            toastMsg(false, "Please try agian");
                        }, 300);
                    });
                }

                if (id) {
                    let status = $scope.triviaUpAllStatus;
                    if ($("#img-pre").attr('src') && $("#img-second-pre").attr('src')) {
                        uploadImg().then((res) => {
                            if (res && res.isSuccess) {
                                primaryImg = res.img[0];
                                if ($("#img-second-pre").attr('src')) {
                                    uploadSecondImg().then((res) => {
                                        if (res && res.isSuccess) {
                                            secondaryImg = res.img[0];
                                            create({
                                                startTime, endTime, fullDesc, title, titleTxt, startTimeFormat, endTimeFormat, img, registrationTime, entryFee, entryType, primaryImg, secondaryImg, status
                                            });
                                        } else {
                                            create({
                                                startTime, endTime, fullDesc, title, titleTxt, startTimeFormat, endTimeFormat, img, registrationTime, entryFee, entryType, primaryImg, status
                                            });
                                        }
                                    });
                                } else {
                                    create({
                                        startTime, endTime, fullDesc, title, titleTxt, startTimeFormat, endTimeFormat, img,
                                        registrationTime, entryFee, entryType, primaryImg, status
                                    });
                                }

                            }
                        })
                    } else if ($("#img-pre").attr('src')) {
                        uploadImg().then((res) => {
                            if (res && res.isSuccess) {
                                primaryImg = res.img[0];
                                create({
                                    startTime, endTime, fullDesc, title, titleTxt, startTimeFormat, endTimeFormat,
                                    registrationTime, entryFee, entryType, primaryImg, status
                                });
                            }
                        });
                    } else if ($("#img-second-pre").attr('src')) {
                        uploadSecondImg().then((res) => {
                            if (res && res.isSuccess) {
                                secondaryImg = res.img[0];
                                create({
                                    startTime, endTime, fullDesc, title, titleTxt, startTimeFormat, endTimeFormat,
                                    registrationTime, entryFee, entryType, secondaryImg, status
                                });
                            }
                        });
                    } else {
                        create({
                            startTime, endTime, fullDesc, title, titleTxt, startTimeFormat, endTimeFormat,
                            registrationTime, entryFee, entryType, status
                        });
                    }

                } else toastMsg(false, "Please try agian");
            }

            $scope.updateAllTrivia = () => {
                var values = JSON.parse(localStorage.getItem('happeningsEUid'));
                if (values.id) {
                    loader.visible();
                    Happenings.find({ filter: { where: { id: values.id } } })
                        .$promise.then((t_r_res) => {

                            let { ownerId, titleTxt, happeningsCategoryId } = t_r_res[0];
                            let fDate = new Date();
                            let date = `${fDate.getFullYear()}-${("0" + (fDate.getMonth() + 1)).slice(-2)}-${("0" + fDate.getDate()).slice(-2)}T00:00:00.000Z`;

                            Happenings.find({ filter: { where: { ownerId, titleTxt, date: { gte: date }, happeningsCategoryId } } })
                                .$promise.then((f_res) => {
                                    if (f_res && f_res.length) {

                                        let status = $scope.triviaUpAllStatus;

                                        let titleN = $("#event-title").val();
                                        let titleTxtN = $("#event-title").val().toString().replace(/\s+/g, '');
                                        let descN = $("#desc").val();

                                        let startTimeN = $("#events_start_time").val();
                                        let endTimeN = $("#events_end_time").val();

                                        let s_date = new Date($("#events_date").val());
                                        s_date.setHours((convertTime12to24(startTimeN)).split(':')[0]);
                                        s_date.setMinutes((convertTime12to24(startTimeN)).split(':')[1]);
                                        let startTimeFormatN = s_date.getTime();
                                        let e_date = new Date($("#events_date").val());
                                        e_date.setHours((convertTime12to24(endTimeN)).split(':')[0]);
                                        e_date.setMinutes((convertTime12to24(endTimeN)).split(':')[1]);
                                        let endTimeFormatN = e_date.getTime();

                                        f_res.forEach((val, i) => {
                                            Happenings.upsertWithWhere({ where: { id: val.id } }, {
                                                title: titleN, titleTxt: titleTxtN, fullDesc: descN, startTime: startTimeN,
                                                startTimeFormat: startTimeFormatN, endTimeFormatN: endTimeFormatN, endTime: endTimeN, status
                                            })
                                            if ((i + 1) == f_res.length) {
                                                setTimeout(function () {
                                                    toastMsg(true, "Successfully updated");
                                                    $state.go("edit-happenings");
                                                    loader.hidden();
                                                }, 300);
                                            }
                                        })
                                    }
                                })
                        })
                } else toastMsg(false, "Please try agian!");
            }

            $scope.entryTypeChange = () => {
                $("#entry_fee").prop('disabled', false);
                if ($("#entry_type").val() == 'Free') {
                    $("#entry_fee").val('');
                    $("#entry_fee").prop('disabled', true);
                } else $("#entry_fee").val($scope.editHappenings.entryFee);
            }

        }])
    .controller('whatsOnManageRequestCtl', ['$scope', '$state', 'Business', '$http', '$rootScope', 'Happenings', 'loader', '$stateParams', 'WhatsOnReservation', 'HappeningsCategory', '$location', function ($scope, $state, Business, $http, $rootScope, Happenings, loader, $stateParams, WhatsOnReservation, HappeningsCategory, $location) {

        if ($rootScope.currentUser && $rootScope.currentUser.email) {
            $scope.useremail = $rootScope.currentUser.email;
        } else $state.go('logout');


        let url = $location.url();
        var name = (url == '/manage-dj' ? 'DJ' :
            (url == '/manage-live' ? 'Live Music' :
                (url == '/manage-comedy' ? 'Comedy' :
                    (url == '/manage-karaoke' ? 'Karaoke' : ''))));

        $scope.typeName = name;

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

        $scope.userId = "";

        if (!$scope.userId) {
            $scope.userId = $rootScope.currentUser.id;
            $scope.useremail = $rootScope.currentUser.email;
        }

        $scope.requestDataForWhats = [];
        $scope.getWhatsOnRequest = () => {
            loader.visible();
            $scope.requestDataForWhats = [];
            WhatsOnReservation.find({
                filter: {
                    where: { ownerId: $scope.userId }, include: [{ relation: "happeningsCategory", scope: { where: { name } } }, { relation: "whatsOnTeamMembers", scope: { include: [{ relation: "customer" }, { relation: "paymentHistories" }] } }, { relation: "happenings" }, { relation: "whatsOnTickets", scope: { include: [{ relation: "happeningsTicket" }] } }],
                    order: "requestDate desc"
                }
            }).$promise.then((res) => {
                setTimeout(function () { loader.hidden() }, 500);
                $scope.requestDataForWhats = [];
                let data = res.filter(m => m.happeningsCategory && m.happeningsCategory.name == name);
                data.forEach(val => {
                    val.totalPeople = val.whatsOnTickets.reduce((p, c) => { return p + c.qty }, 0);
                    val.totalAmt = val.whatsOnTickets.reduce((p, c) => { return p + c.totalPrice }, 0);
                    $scope.requestDataForWhats.push(val);
                })
            })
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
                $scope.getWhatsOnRequest();
                $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
            }
        }
        else {
            $scope.isBusinessSelect = true;
            $scope.userId = $rootScope.currentUser.id;
        }

        $scope.getBusinessName = () => { return $scope.businessDelection; };


        if ($scope.userDetails.isAdmin == false) {
            $scope.getWhatsOnRequest();
            $("#autocompleteBusiness").val($scope.userDetails.businessName);
            localStorage.removeItem("selectedVenue");
            $("#autocompleteBusiness").attr('disabled', true);
            localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
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
                        $scope.getWhatsOnRequest();
                        $rootScope.selectedVenue = { venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                        localStorage.removeItem("selectedVenue");
                        localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }));
                    }
                } else $("#businessErr").text('Please select the Business name');
            }
        }

        $scope.changeStatus = (id) => {
            if (id) {
                if (localStorage.getItem("HH_req_id")) localStorage.removeItem("HH_req_id");
                localStorage.setItem('HH_req_id', JSON.stringify({ id }));
                let data = $scope.requestDataForWhats.find(m => m.id == id);
                $scope.eventTotalPrice = $scope.eventsData = $scope.eventsDataContact = {};
                if (data) {
                    $scope.eventsData = data;
                    $scope.eventTotalPrice = data.whatsOnTickets.reduce((p, c) => { return p + c.totalPrice }, 0);
                    $scope.eventsDataContact = data.whatsOnTeamMembers[0];
                }
            } else toastMsg(false, "Please try again!");
        }

        $scope.confirmed = () => {
            if (localStorage.getItem("HH_req_id")) {
                let ids = JSON.parse(localStorage.getItem("HH_req_id"));
                if (ids && ids.id) {
                    loader.visible();
                    WhatsOnReservation.upsertWithWhere({ where: { id: ids.id } }, { status: "confirmed" }).$promise.then((res) => {
                        $scope.getWhatsOnRequest();
                        $('#changeTheStatus').modal('hide');
                        toastMsg(true, "Successfully updated");
                    }, () => {
                        $('#changeTheStatus').modal('hide');
                        $scope.getWhatsOnRequest();
                        toastMsg(false, "Please try again");
                    })
                } else toastMsg(false, "Please try again");
            } else toastMsg(false, "Please try again");
        }

        $scope.rejected = () => {
            if (localStorage.getItem("HH_req_id")) {
                let ids = JSON.parse(localStorage.getItem("HH_req_id"));
                if (ids && ids.id) {
                    loader.visible();
                    WhatsOnReservation.upsertWithWhere({ where: { id: ids.id } }, { status: "rejected" }).$promise.then((res) => {
                        $scope.getWhatsOnRequest();
                        $('#changeTheStatus').modal('hide');
                        toastMsg(true, "Successfully updated");
                    }, () => {
                        $('#changeTheStatus').modal('hide');
                        $scope.getWhatsOnRequest();
                        toastMsg(false, "Please try again");
                    })
                } else toastMsg(false, "Please try again");
            } else toastMsg(false, "Please try again");
        }

        $scope.filterRequestEvents = () => {
            let filter = { where: { ownerId: $scope.userId }, include: [{ relation: "happeningsCategory", scope: { where: { name } } }, { relation: "customer" }] };
            $scope.requestDataForWhats = [];
            if ($("#f-date").val()) filter.where.requestDate = $("#f-date").val() + 'T00:00:00.000Z';
            if ($("#f-type").val() && $("#f-type").val() !== 'select') filter.where.isTicketed = ($("#f-type").val() == 'Non-ticketed' ? false : true);
            loader.visible();
            WhatsOnReservation.find({
                filter
            }).$promise.then((res) => {
                setTimeout(function () { loader.hidden() }, 500);
                $scope.requestDataForWhats = res.filter(m => m.happeningsCategory && m.happeningsCategory.name == name);
            })
        }

        $scope.showTheMiddle = (event, i) => {
            $(`.middle_${i}`).css({ 'display': 'block', 'position': 'absolute', 'right': '2%' });
        }

        $scope.hiddenTheMiddle = (i) => {
            $(`.middle_${i}`).css({ 'display': 'none' })
        }
    }])
    .controller('manageRequestTriviaCtl', ['$scope', '$state', 'Business', '$http', '$rootScope', 'Happenings', 'loader', '$stateParams', 'WhatsOnReservation', 'HappeningsCategory', '$location', function ($scope, $state, Business, $http, $rootScope, Happenings, loader, $stateParams, WhatsOnReservation, HappeningsCategory, $location) {


        let url = $location.url();
        var name = 'Trivia';

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

        $scope.userId = "";

        if (!$scope.userId) {
            $scope.userId = $rootScope.currentUser.id;
            $scope.useremail = $rootScope.currentUser.email;
        }

        $scope.requestDataForWhats = [];
        $scope.getWhatsOnRequest = () => {
            loader.visible();
            WhatsOnReservation.find({
                filter: {
                    where: { ownerId: $scope.userId }, include: [{ relation: "happenings" }, { relation: "happeningsCategory", scope: { where: { name: "Trivia" } } },
                    { relation: "whatsOnTeamMembers", scope: { include: [{ relation: "customer", fields: ["firstName", "lastName", "mobile", "gender", "email", "id"] }, { relation: "paymentHistories" }] } }], order: "requestDate desc"
                }
            }).$promise.then((res) => {
                setTimeout(function () { loader.hidden() }, 500);
                $scope.requestDataForWhats = res.filter(m => m.happeningsCategory && m.happeningsCategory.name == "Trivia");
            }, (err) => {
                console.log(err);
            });
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
                $scope.getWhatsOnRequest();
                $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
            }
        }
        else {
            $scope.isBusinessSelect = true;
            $scope.userId = $rootScope.currentUser.id;
        }

        $scope.getBusinessName = () => { return $scope.businessDelection; };


        if ($scope.userDetails.isAdmin == false) {
            $scope.getWhatsOnRequest();
            $("#autocompleteBusiness").val($scope.userDetails.businessName);
            localStorage.removeItem("selectedVenue");
            $("#autocompleteBusiness").attr('disabled', true);
            localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
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
                        $scope.getWhatsOnRequest();
                        $rootScope.selectedVenue = { venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                        localStorage.removeItem("selectedVenue");
                        localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }));
                    }
                } else $("#businessErr").text('Please select the Business name');
            }
        }

        $scope.changeStatus = (id) => {
            if (id) {
                if (localStorage.getItem("HH_req_id")) localStorage.removeItem("HH_req_id");
                localStorage.setItem('HH_req_id', JSON.stringify({ id }));
                let data = $scope.requestDataForWhats.find(m => m.id == id);

                if (data) {
                    $scope.triviaEvent = data;
                    $scope.triviaContact = data.whatsOnTeamMembers.find(m => m.isInviter == true);
                }
            } else toastMsg(false, "Please try again!");
        }

        $scope.confirmed = () => {
            if (localStorage.getItem("HH_req_id")) {
                let ids = JSON.parse(localStorage.getItem("HH_req_id"));
                if (ids && ids.id) {
                    loader.visible();
                    WhatsOnReservation.upsertWithWhere({ where: { id: ids.id } }, { status: "confirmed" }).$promise.then((res) => {
                        $scope.getWhatsOnRequest();
                        $('#eventsViewModal').modal('hide');
                        toastMsg(true, "Successfully updated");
                    }, () => {
                        $('#eventsViewModal').modal('hide');
                        $scope.getWhatsOnRequest();
                        toastMsg(false, "Please try again");
                    })
                } else toastMsg(false, "Please try again");
            } else toastMsg(false, "Please try again");
        }

        $scope.rejected = () => {
            if (localStorage.getItem("HH_req_id")) {
                let ids = JSON.parse(localStorage.getItem("HH_req_id"));
                if (ids && ids.id) {
                    loader.visible();
                    WhatsOnReservation.upsertWithWhere({ where: { id: ids.id } }, { status: "rejected" }).$promise.then((res) => {
                        $scope.getWhatsOnRequest();
                        $('#eventsViewModal').modal('hide');
                        toastMsg(true, "Successfully updated");
                    }, () => {
                        $('#eventsViewModal').modal('hide');
                        $scope.getWhatsOnRequest();
                        toastMsg(false, "Please try again");
                    })
                } else toastMsg(false, "Please try again");
            } else toastMsg(false, "Please try again");
        }

        $scope.filterRequestEvents = () => {
            let filter = { where: { ownerId: $scope.userId }, include: [{ relation: "happeningsCategory", scope: { where: { name } } }, { relation: "customer" }] };

            if ($("#f-date").val()) filter.where.requestDate = $("#f-date").val() + 'T00:00:00.000Z';
            if ($("#f-type").val() && $("#f-type").val() !== 'select') filter.where.isTicketed = ($("#f-type").val() == 'Non-ticketed' ? false : true);
            loader.visible();
            WhatsOnReservation.find({
                filter
            }).$promise.then((res) => {
                setTimeout(function () { loader.hidden() }, 500);
                $scope.requestDataForWhats = res.filter(m => m.happeningsCategory && m.happeningsCategory.name == name);
            })
        }

        $scope.showTheMiddle = (event, i) => {
            $(`.middle_${i}`).css({ 'display': 'block', 'position': 'absolute', 'right': '2%' });
        }

        $scope.hiddenTheMiddle = (i) => {
            $(`.middle_${i}`).css({ 'display': 'none' })
        }
    }])
    .controller('manageRequestPokerCtl', ['$scope', '$state', 'Business', '$http', '$rootScope', 'Happenings', 'loader', '$stateParams', 'WhatsOnReservation', 'HappeningsCategory', '$location', 'PokerExtraBooking', function ($scope, $state, Business, $http, $rootScope, Happenings, loader, $stateParams, WhatsOnReservation, HappeningsCategory, $location, PokerExtraBooking) {


        if ($rootScope.currentUser && $rootScope.currentUser.email) {
            $scope.useremail = $rootScope.currentUser.email;
        } else $state.go('logout');


        let url = $location.url();
        var name = 'Poker';

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

        $scope.userId = "";

        if (!$scope.userId) {
            $scope.userId = $rootScope.currentUser.id;
            $scope.useremail = $rootScope.currentUser.email;
        }

        $scope.requestDataForWhats = [];
        $scope.getWhatsOnRequest = () => {
            loader.visible();
            PokerExtraBooking.find({ filter: { where: { ownerId: $scope.userId }, include: [{ relation: "whatsOnReservation", scope: { include: [{ relation: "happenings" }] } }, { relation: "customer", fields: ["firstName", "lastName", "mobile", "gender", "email", "id"] }, { relation: "paymentHistories" }] } }).$promise.then((res) => {
                $scope.requestDataForWhats = res;
                setTimeout(function () { loader.hidden() }, 500);
            });
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
                $scope.getWhatsOnRequest();
                $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
            }
        }
        else {
            $scope.isBusinessSelect = true;
            $scope.userId = $rootScope.currentUser.id;
        }

        $scope.getBusinessName = () => { return $scope.businessDelection; };


        if ($scope.userDetails.isAdmin == false) {
            $scope.userId = $scope.userDetails.id;
            $scope.getWhatsOnRequest();
            $("#autocompleteBusiness").val($scope.userDetails.businessName);
            localStorage.removeItem("selectedVenue");
            $("#autocompleteBusiness").attr('disabled', true);
            localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userDetails.id, ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
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
                        $scope.getWhatsOnRequest();
                        $rootScope.selectedVenue = { venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                        localStorage.removeItem("selectedVenue");
                        localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userId, ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }));
                    }
                } else $("#businessErr").text('Please select the Business name');
            }
        }

        $scope.changeStatus = (id) => {
            if (id) {
                if (localStorage.getItem("HH_req_id")) localStorage.removeItem("HH_req_id");
                localStorage.setItem('HH_req_id', JSON.stringify({ id }));
                let data = $scope.requestDataForWhats.find(m => m.id == id);
                $scope.triviaContact = {};
                if (data) {
                    $scope.triviaEvent = data;
                    console.log(JSON.stringify(data));
                }
            } else toastMsg(false, "Please try again!");
        }

        $scope.confirmed = () => {
            if (localStorage.getItem("HH_req_id")) {
                let ids = JSON.parse(localStorage.getItem("HH_req_id"));
                if (ids && ids.id) {
                    loader.visible();
                    WhatsOnReservation.upsertWithWhere({ where: { id: ids.id } }, { status: "confirmed" }).$promise.then((res) => {
                        $scope.getWhatsOnRequest();
                        $('#eventsViewModal').modal('hide');
                        toastMsg(true, "Successfully updated");
                    }, () => {
                        $('#eventsViewModal').modal('hide');
                        $scope.getWhatsOnRequest();
                        toastMsg(false, "Please try again");
                    })
                } else toastMsg(false, "Please try again");
            } else toastMsg(false, "Please try again");
        }

        $scope.rejected = () => {
            if (localStorage.getItem("HH_req_id")) {
                let ids = JSON.parse(localStorage.getItem("HH_req_id"));
                if (ids && ids.id) {
                    loader.visible();
                    WhatsOnReservation.upsertWithWhere({ where: { id: ids.id } }, { status: "rejected" }).$promise.then((res) => {
                        $scope.getWhatsOnRequest();
                        $('#eventsViewModal').modal('hide');
                        toastMsg(true, "Successfully updated");
                    }, () => {
                        $('#eventsViewModal').modal('hide');
                        $scope.getWhatsOnRequest();
                        toastMsg(false, "Please try again");
                    })
                } else toastMsg(false, "Please try again");
            } else toastMsg(false, "Please try again");
        }

        $scope.filterRequestEvents = () => {
            let filter = { where: { ownerId: $scope.userId }, include: [] };

            let fields = ["firstName", "lastName", "mobile", "gender", "email", "id"];

            if ($("#f-date").val()) filter.where.requestFormat = $("#f-date").val() + 'T00:00:00.000Z';
            if ($("#name_f").val()) filter.include.push({ relation: "customer", scope: { where: { or: [{ firstName: { "like": `.*${$("#name_f").val()}.*`, "options": "i" } }, { lastName: { "like": `.*${$("#name_f").val()}.*`, "options": "i" } }] }, fields } })
            else filter.include.push({ relation: "customer", fields })
            filter.include.push({ relation: "whatsOnReservation", scope: { include: [{ relation: "happenings" }] } });

            loader.visible();
            PokerExtraBooking.find({ filter }).$promise.then((res) => {
                if (!$("#name_f").val()) $scope.requestDataForWhats = res;
                else {
                    $scope.requestDataForWhats = res.filter(m => m.customer);
                }
                setTimeout(function () { loader.hidden() }, 500);
            });
        }
    }]);