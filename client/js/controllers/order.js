angular
    .module('app')
    .controller('OrdersCtl', ['$scope', '$state', '$http', 'Premium', '$rootScope', 'Business', 'Order', '$rootScope', 'loader', 
    function ($scope, $state, $http, Premium, $rootScope, Business, Order, $rootScope, loader) {

        $scope.cntDetails = { noOrder: 0, new: 0, inPreparation: 0, readyForDelivery: 0, delivered: 0, cancelled: 0 };

        $('#startDate,#endDate').datepicker({ multidate: true, startDate: new Date() });

        $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

        if(!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display : 'none' });

        $scope.isBusinessSelect = false;

        $scope.productsDetails = [];
        $scope.getAllOrders = () => {
            $scope.productsDetails = [];
            if ($scope.userId) {
                Order.getOrders({ details: { ownerId: $scope.userId } }).$promise.then((res) => {
                    if (res && res.data && res.data.isSuccess) {
                        $scope.productsDetails = res.data.result;
                    }
                });
            }
        };

        if (!$scope.userId)  $scope.userId = $rootScope.currentUser.id;

        var d = new Date();
        var strDate = d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + + d.getDate()).slice(-2);

        $scope.useremail = $rootScope.currentUser.email;
        $scope.userId = "";
        if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.email == "admin@barm8.com.au") {
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
                $scope.getAllOrders();
            }
        }
        else {
            $scope.isBusinessSelect = true;
            $scope.userId = $rootScope.currentUser.id;
        }

        $scope.getBusinessName = () => {
            return $scope.businessDelection;
        };

        if ($scope.userDetails.isAdmin == false) {
            $scope.getAllOrders();
            $scope.isBusinessSelect = true;
            $("#autocompleteBusiness").val($scope.userDetails.businessName);
            localStorage.removeItem("selectedVenue");
            $("#autocompleteBusiness").attr('disabled' , true);
            localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
        }

        $scope.listClk = (id, status) => {

            // if ($("#O_F_L_1").hasClass('col-md-12')) {
            //     $("#O_F_L_1").removeClass('col-md-12 col-sm-12 col-xs-12 col-lg-12').addClass('col-md-8 col-sm-12 col-xs-12 col-lg-8');
            //     $("#BAR_O_D_L").addClass('col-md-4 col-sm-12 col-xs-12 col-lg-4').css({ display: 'block' });
            // }
            if (!status) {
                $("#O_S_B_E_4").empty().css({ "background-color": "#f57c00"  }).removeClass('pre-o-text').addClass('d-in-text')
                .html('<span class="dine-order-round"></span> Dine-in');
                if ($("#_B_B_L").hasClass('pre-order-border')) {
                    $("#_B_B_L").removeClass('pre-order-border').addClass('dine-border');
                } else {
                    $("#_B_B_L").addClass('dine-border');
                }
            } else if (status) {
                $("#O_S_B_E_4").empty().css({ "background-color": "#0e2cd1"  }).removeClass('d-in-text').addClass('pre-o-text')
                .html('<span class="pre-order-round"></span> Pre-order');
                $("#_B_B_L").removeClass('dine-border').addClass('pre-order-border');
                $("#pre-order-table-div").css('display','block');
            }

            $scope.order_product = $scope.productsDetails.find(m => m && m.id == id);

             $("#table-no-dine-order,#table-no-pre-order").css({ display : 'none' });

            if($scope.order_product.isReservation) $("#table-no-pre-order").css({ display : 'block' });
            else $("#table-no-dine-order").css({ display : 'block' });

            $('#foodOrderViewModal').modal({backdrop: 'static', keyboard: false})  

            // if ($(window).width() <= 800) {
            //     $('html,body').animate({
            //         scrollTop: $("#BAR_O_D_L").offset().top
            //     },200);
            // }
        };

        $scope.updateStatus = (id, status, type) => {
            if (id) {
                loader.visible();
                //table-no-pre-order
                let obj = {},  tableNo = $("#tableNo_txt").val();

                Order.updateStatus({ details: { id, status, tableNo } }).$promise.then((res) => {
                    // $scope.order_product = {};
                    // $scope.order_product= res;
                  
                    if (status == 'rejected') {
                        toastr.success('Order has been Rejected.');
                    } else if (status == 'accepted') {
                        toastr.success('Order has been Accepted.');
                    } else {
                        toastr.success('Status has been updated.');
                    }
                    if (res.data.isSuccess) {
                        toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
                        // $("#O_F_L_1").removeClass('col-md-8 col-sm-12 col-xs-12 col-lg-8').addClass('col-md-12 col-sm-12 col-xs-12 col-lg-12');
                        // $("#BAR_O_D_L").removeClass('col-md-4 col-sm-12 col-xs-12 col-lg-4').css({ display: 'none' });
                        //
                        if ($scope.userId) {
                            Order.getOrders({ details: { ownerId: $scope.userId, date: strDate } }).$promise.then((res) => {
                                $scope.cntDetails = { noOrder: 0, new: 0, inPreparation: 0, readyForDelivery: 0, delivered: 0, cancelled: 0 };
                                $scope.productsDetails = [];
                                if (res && res.data && res.data.isSuccess) {
                                    $scope.productsDetails = res.data.result;
                                    if(status == 'rejected')   $('#foodOrderViewModal').modal('hide');
                                    $scope.listClk(id);
                                    setTimeout(() => { loader.hidden(); }, 200)
                                } else   loader.hidden();
                            });
                        }
                    }
                }, (err) => {
                    toastr.error('Not updated. Please try again!');
                    toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
                    loader.hidden();
                });
            }
        };

        $scope.searchClk = () => {
            let filterObj = {};
            if ($("#O_T_F").val()) filterObj.type = $("#O_T_F").val();
            if ($("#O_D_F").val()) {
                let date_order = ($("#O_D_F").val()).split('-');
                filterObj.and = [{ date: { gte: `${date_order[2]}-${date_order[1]}-${date_order[0]}T00:00:00.000Z` } },
                {
                    date: {
                        lte: `${date_order[2]}-${date_order[1]}-${date_order[0]}T23:59:59.000Z`
                    }
                }]
            }
            if ($("#O_T_F_TIME").val()) {
                // filterObj.time = $("#O_T_F_TIME").val();
            }
            if ($("#O_OI_F").val())  filterObj.orderId = $("#O_OI_F").val();
            if ($("#O_CU_F").val())  filterObj.customer = $("#O_CU_F").val();
            if ($("#O_S_F").val())  filterObj.status = $("#O_S_F").val();
            if ($scope.userId)   filterObj.ownerId = $scope.userId;
            if ($scope.userId) {
                $scope.productsDetails = [];
                Order.find({ filter: { where: filterObj, include: [{ relation: "orderLines", scope: { include: [{ relation: "mealsDashSubLine" }, { relation: "orderExtraLines" }] } }, { relation: "customer" }] } }).$promise.then((res) => {
                   console.log(JSON.stringify(res));
                    $scope.productsDetails = res;
                }, (err) => {
                    console.log(JSON.stringify(err));
                });
            } else {
                toastr.error('Please select the business!');
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }
        };

        $scope.BusinessSelected = (arg) => {
            $("#businessErr").text('');
            if (arg != "") {
                if (arg == 'BusinessManager') {
                    if ($("#autocompleteBusiness").data('id')) {
                        arg = $("#autocompleteBusiness").data('id');
                        if ($("#businessSubmit").hasClass('businessSubmit')) {
                            $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                        }
                    } else {
                        $("#businessErr").text('Please select the Business name');
                    }
                }

                if (arg != "select") {
                    $scope.isBusinessSelect = true;
                    $scope.userId = arg;
                    $scope.getAllOrders();
                    $rootScope.selectedVenue = { venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                }
            }
        }

        $scope.typeFilter = (arg) => {
            $scope.products = [];
            if ($scope.userId) {
                Order.getOrders({ details: { ownerId: $scope.userId } }).$promise.then((res) => {
                    if (res && res.data.isSuccess) {
                        $scope.products = res.data.result.filter(m => m.status == arg);
                    }
                });
            }
        };

        if ($rootScope.orderUserId) {
            $scope.isBusinessSelect = true;
            $scope.userId = $rootScope.orderUserId;
            $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
            $("#autocompleteBusiness").val($rootScope.orderBusinessName);
            $scope.getAllOrders();
            $scope.typeFilter("New");
        }

    }])
    .controller('orderViewCtl', ['$scope', '$state', '$http', 'Premium', '$rootScope', 'Business', 'Order', '$stateParams', 'OrderLine', '$rootScope', function ($scope,
        $state, $http, Premium, $rootScope, Business, Order, $stateParams, OrderLine, $rootScope) {
        if ($stateParams.id) {
            $scope.products = [];
            OrderLine.find({ filter: { where: { orderId: $stateParams.id }, include: [{ relation: "mealsDashSubLine" }, { relation: "orderExtraLines" }] } }).$promise.then((res) => {
                $scope.products = res;
            });
        }
    }]);