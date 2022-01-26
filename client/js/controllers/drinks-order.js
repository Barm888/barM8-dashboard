angular
    .module('app')
    .controller('drinksOrderCtl', ['$scope', '$state', '$http', 'Business', '$rootScope' , 'DrinksOrder' , 'socket', 'loader','VenueServiceOption',
        function ($scope, $state, $http, Business, $rootScope , DrinksOrder , socket , loader, VenueServiceOption) {

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            socket.on('pushDrinksOrders', function (data) {
                if ($scope.userId) {
                    DrinksOrder.find({
                        filter: {
                            where: { ownerId: $scope.userId }, include: [{
                                relation: "drinksOrderLines", scope: {
                                    include: [{ relation: "drinksOrderSubLines", scope: { include: [{ relation: "drinksDashSubLine" }, { relation: "drinksSpecialDashSubLine" }] } },
                                    { relation: "drinksExtras" }, { relation: "drinksMixers" },
                                    { relation: "drinksOrderCategory" }, { relation: "drinksDashLine" }, { relation: "drinksSpecialDashLine" }]
                                }
                            }, { relation: "customer" }], "order": "isCreate desc"
                        }
                    }).$promise.then((res) => {
                        if (res && res.length) {
                            toastMsg(true, 'We have got new Order.');
                            $scope.drinksOrdersList = res;
                        }
                    });
                }
            });

            $(".drinks-sub-menu").addClass('in slowDown');
            $(".drinks-menu").html(`<i class="fas fa-cocktail"></i> <span class="nav-label"> &nbsp; Drinks Menu </span> <i class="fas fa-angle-down pull-right"></i>`);

            $scope.isBusinessSelect = false;

            if (!$scope.userId) $scope.userId = $rootScope.currentUser.id;

            $scope.drinksOrdersList = [];
            $scope.getOrders = () => {
                if ($scope.userId) {
                    loader.visible();
                    DrinksOrder.find({
                        filter: {
                            where: { ownerId: $scope.userId }, include: [{
                                relation: "drinksOrderLines", scope: {
                                    include: [{ relation: "drinksOrderSubLines", scope: { include: [{ relation: "drinksDashSubLine" }, { relation: "drinksSpecialDashSubLine" }] } },
                                    { relation: "drinksExtras" }, { relation: "drinksMixers" },
                                    { relation: "drinksOrderCategory" }, {
                                        relation: "drinksDashLine",
                                        scope: { include: [{ relation: "drinksType" }] }
                                    }, { relation: "drinksSpecialDashLine" }]
                                }
                            }, { relation: "customer" }], "order": "isCreate desc"
                        }
                    }).$promise.then((res) => {
                        setTimeout(() => { loader.hidden(); }, 500);
                        if (res && res.length) $scope.drinksOrdersList = res;
                        console.log(JSON.stringify($scope.drinksOrdersList));
                    });
                }
            };

            $scope.numberGlassCount = function (arg) {
               if(arg.drinksOrderSubLines && arg.drinksOrderSubLines.length) {
                   return arg.drinksOrderSubLines.reduce((prev, cur) => prev + cur.noGlass, 0);
               } 
               return 0
            }; 

            $scope.useremail = $rootScope.currentUser.email;
            $scope.userId = "";
            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                $scope.isBusinessSelect = true;
                Business.find({ filter: { where: { status: "active" }, "fields": ["businessName", "id", "email"] } }).$promise.then((res) => {
                    $scope.businessDelection = res;
                }, (err) => {
                    console.log(JSON.stringify());
                });
                if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId) {
                    $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                    $scope.userId = $rootScope.selectedVenue.venueId;
                    $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.venueId)
                    if ($("#businessSubmit").hasClass('businessSubmit')) {
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    }
                    $scope.isBusinessSelect = true;
                    $rootScope.selectedVenue = { venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                    $scope.getOrders();
                }
            }
            else {
                $scope.isBusinessSelect = true;
                $scope.userId = $rootScope.currentUser.id;
            }

            $scope.getBusinessName = () => {
                return $scope.businessDelection;
            };

             $scope.drinksServiceOption = [];
             $scope.getdrinksServiceOption = () => {
                VenueServiceOption.find({
                     filter: {
                         where: { ownerId: $scope.userId, type: "Drinks" }, fields: ["services"]
                     }
                 }).$promise.then((res) => { 
                     if(res && res.length) $scope.drinksServiceOption = res[0].services;
                 })
             }
             $scope.getdrinksServiceOption();

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
                        $scope.getOrders();
                        $scope.getdrinksServiceOption();
                        $rootScope.selectedVenue = { venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                    }
                } else $("#businessErr").text('Please select the Business name');
            }

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if(!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display : 'none' });

            if ($scope.userDetails.isAdmin == false) {
                $scope.getOrders();
                $scope.isBusinessSelect = true;
                $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                $("#autocompleteBusiness").attr('disabled' , true);
                localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
            }


            $scope.listClk = (id, status) => {
                if (status && status == 'collect@Bar') {
                    $("#O_S_B_E_4").empty().removeClass('table-s-text').addClass('collect-in-text').html('<span class="dine-order-round"></span> Collect @ Bar');
                    if ($("#_B_B_L").hasClass('table-s-border')) {
                        $("#_B_B_L").removeClass('table-s-border').addClass('collect-in-border');
                    } else $("#_B_B_L").addClass('table-s-border');
                } else if (status && status == 'tableServe') {
                    $("#O_S_B_E_4").empty().removeClass('collect-in-text').addClass('table-s-text').html('<span class="pre-order-round"></span> Table Serve');
                    $("#_B_B_L").removeClass('collect-in-border').addClass('table-s-border');
                }

                $('#foodOrderViewModal').modal({backdrop: 'static', keyboard: false});
    
                $scope.order_product = $scope.drinksOrdersList.find(m => m && m.id == id);

                $(`#table-tr-${id}`).css('background-color', '#80808038');

                DrinksOrder.upsertWithWhere({ where : { id } },{ isOpen : true });

                // if ($(window).width() <= 800) {
                //     $('html,body').animate({
                //         scrollTop: $("#BAR_O_D_L").offset().top
                //     },200);
                // }
            };

            $scope.getReasonforreject = (id, status, type) =>{
                $("#reject-Save-Btn").attr('data-update-status', JSON.stringify({ id, status, type }));
                $("#getReasonsforReject").modal({backdrop: 'static', keyboard: false})
            }

            $scope.updateStatus = (id, status) => {
                if (id) {

                    if (status == 'rejected') $("#getReasonsforReject").modal('hide');

                    let tableNo = $("#tableNoDrinks").val(), reason = null;
                    if ($('#drinks-order-r-reason').val()) reason = $('#drinks-order-r-reason').val();

                    loader.visible();
                    DrinksOrder.updateStatus({ params: { id, status, tableNo, reason } }).$promise.then((res) => {
                        if (status == 'rejected') toastMsg(true, 'Order has been Successfully Rejected.');
                        else if (status == 'accepted') toastMsg(true, 'Order has been Successfully Accepted.');
                        else toastMsg(true, 'Successfully Updated.');
                        if (res.data.isSuccess  && $scope.userId) {
                            $scope.getOrders();
                            DrinksOrder.findOne({
                                filter: {
                                    where: { ownerId: $scope.userId , id }, include: [{
                                        relation: "drinksOrderLines", scope: {
                                            include: [{ relation: "drinksOrderSubLines", scope: { include: [{ relation: "drinksDashSubLine" }, { relation: "drinksSpecialDashSubLine" }] } },
                                            { relation: "drinksExtras" }, { relation: "drinksMixers" },
                                            { relation: "drinksOrderCategory" }, { relation: "drinksDashLine" }, { relation: "drinksSpecialDashLine" }]
                                        }
                                    }, { relation: "customer" }], "order": "isCreate desc"
                                }
                            }).$promise.then((drinksRes)=>{
                                $scope.order_product =  drinksRes;
                            });

                            setTimeout(function () { loader.hidden(); }, 500);
                        }
                    }, (err) => {
                        toastMsg(false, 'Not updated. Please try again!');
                        setTimeout(function () { loader.hidden(); }, 500);
                    });
                }
            };

        }]);