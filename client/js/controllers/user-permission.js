angular
    .module('app')
    .controller('userPermissionListCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'loader', 'VenueUser',
        function ($scope, $state, $rootScope, Business, $http, loader, VenueUser) {

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.useremail = $rootScope.currentUser.email;
            $scope.userId = "";
            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                Business.find({ filter: { where: { status: "active" }, "fields": ["businessName", "id", "email"] } }).$promise.then((res) => {
                    $scope.businessDelection = res;
                    $scope.userId = $rootScope.currentUser.id;
                }, (err) => {
                    console.log(JSON.stringify());
                });
            }
            else $scope.userId = $rootScope.currentUser.id;

            $scope.getBusinessName = () => {
                return $scope.businessDelection;
            };

            $scope.venueUserList = [];
            $scope.getUser = () => {
                $scope.venueUserList = [];
                VenueUser.find({ filter: { where: { ownerId: $scope.userId }, include: [{ relation: "venuePermissions" }] } }).$promise.then((res) => {
                    $scope.venueUserList = res;
                })
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
                            localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val(), venueId: $scope.userId }));
                            $scope.getUser();
                        }
                    } else $("#businessErr").text('Please select the Business name');
                }
            }

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

            if ($scope.userDetails.isAdmin == false) {
                $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                $("#autocompleteBusiness").attr('disabled', true);
                $scope.userId = $scope.userDetails.id;
                localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName, venueId: $scope.userDetails.id }));
                $scope.isBusinessSelect = true;
                $scope.getUser();
            } else if ($scope.userDetails.isAdmin) {
                if (localStorage.getItem("selectedVenue")) {
                    $rootScope.selectedVenue = JSON.parse(localStorage.getItem("selectedVenue"));
                }
                if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId) {
                    $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                    $scope.userId = $rootScope.selectedVenue.venueId;
                    $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.venueId)
                    if ($("#businessSubmit").hasClass('businessSubmit')) {
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    }
                    $scope.getUser();
                  
                }
                $scope.isBusinessSelect = true;
            }


            $scope.requestDelete = (id) => {
                if (id) {
                    localStorage.removeItem("deleteIdUserP_m");
                    localStorage.setItem("deleteIdUserP_m", JSON.stringify({ id }));
                    $('#deleteConfirm').modal({ backdrop: 'static', keyboard: false })
                } else toastMsg(false, "Please try again!");
            }

            $scope.confirmDelete = () => {
                let ids = JSON.parse(localStorage.getItem("deleteIdUserP_m"));
                if (ids && ids.id) {
                    loader.visible();
                    VenueUser.deleteUser({ params: { id: ids.id } }).$promise.then((res) => {
                        $('#deleteConfirm').modal('hide')
                        setTimeout(function () {
                            loader.hidden();
                            $scope.getUser();
                        }, 300);
                    })
                } else toastMsg(false, "Please try again!");
            }

     

            $scope.userPMData = {};
            $scope.viewUserData = (id) => {
                if (id) {
                    $scope.userPMData = $scope.venueUserList.find(m => m.id == id);
                    $('#viewUsers').modal({ backdrop: 'static', keyboard: false })
                } else toastMsg(false, "Please try again!");
            }

            $scope.editPermission = (id) => {
                if (id) {
                    localStorage.removeItem("editIdUserP_m");
                    localStorage.setItem("editIdUserP_m", JSON.stringify({ id }));
                    $state.go("update-user-permission");
                } else toastMsg(false, "Please try again!");
            }

        }])
    .controller('userPermissionCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'loader', 'VenueUser',
        function ($scope, $state, $rootScope, Business, $http, loader, VenueUser) {

            $scope.userCarts = [{ name: 'Is this user an admin', _name: 'is_this_user_an_admin', isAdmin: true, isChecked: false },
            { name: 'Exclusive Offer', _name: 'exclusive_Offer', isAdmin: false, isCreate: true, isEdit: true, isDelete: true, isChecked: false },
            { name: 'Cart', _name: 'cart', isAdmin: false, isCreate: true, isEdit: true, isDelete: true, isChecked: false },
            { name: 'Daily Special', _name: 'daily_Special', isAdmin: false, isCreate: true, isEdit: true, isDelete: true, isChecked: false },
            { name: 'Order', _name: 'order', isAdmin: false, isCreate: true, isEdit: true, isDelete: true, isChecked: false, isChecked: false },
            { name: 'Drinks Special', _name: 'drinks_Special', isAdmin: false, isCreate: true, isEdit: true, isDelete: true, isChecked: false },
            { name: 'Food', _name: 'food', isAdmin: false, isCreate: true, isEdit: true, isDelete: true, isChecked: false },
            { name: 'Events', _name: 'events', isAdmin: false, isCreate: true, isEdit: true, isDelete: true, isChecked: false },
            { name: 'Drinks Menu', _name: 'drinks_Menu', isAdmin: false, isCreate: true, isEdit: true, isDelete: true, isChecked: false },
            { name: 'Sports', _name: 'sports', isAdmin: false, isCreate: true, isEdit: true, isDelete: true, isChecked: false }];

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }


            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                $scope.isBusinessSelect = true;
                $scope.userId = $rootScope.currentUser.id;
                Business.find({ filter: { where: { status: "active" }, "fields": ["businessName", "id", "email"] } }).$promise.then((res) => {
                    $scope.businessDelection = res;

                }, (err) => {
                    console.log(JSON.stringify());
                });
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
                            $rootScope.selectedVenue = { venueId: $scope.userId, ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                            localStorage.removeItem("selectedVenue");
                            localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val(), venueId: $scope.userId }));
                        }
                    } else $("#businessErr").text('Please select the Business name');
                }
            }

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

            if ($scope.userDetails.isAdmin == false) {
                $scope.isBusinessSelect = true;
                $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                $("#autocompleteBusiness").attr('disabled', true);
                $scope.userId = $scope.userDetails.id;
                localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName, venueId: $scope.userDetails.id }));
            } else if ($scope.userDetails.isAdmin) {
                $scope.isBusinessSelect = true;
                if (localStorage.getItem("selectedVenue")) {
                    $rootScope.selectedVenue = JSON.parse(localStorage.getItem("selectedVenue"));
                }
                if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId) {
                    $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                    $scope.userId = $rootScope.selectedVenue.venueId;
                    $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.venueId)
                    if ($("#businessSubmit").hasClass('businessSubmit')) {
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    }
                }
            }


            $scope.create = () => {
                let isTrue = true;
                $("#login_password_Err,#login_email_Err,#phoneNoErr,#emailErr,#lastNameErr,#firstNameErr").html('');
                if (!$("#firstName").val()) {
                    isTrue = false;
                    $("#firstNameErr").html('First name is required!');
                }
                if (!$("#lastName").val()) {
                    isTrue = false;
                    $("#lastNameErr").html('Last name is required!');
                }
                if (!$("#email").val()) {
                    isTrue = false;
                    $("#emailErr").html('Email is required!');
                }
                if (!$("#phoneNo").val()) {
                    isTrue = false;
                    $("#phoneNoErr").html('Phone no is required!');
                }
                if (!$("#login_email").val()) {
                    isTrue = false;
                    $("#login_email_Err").html('Email is required!');
                }
                if (!$("#login_possword").val() && !$("#login_pin").val()) {
                    isTrue = false;
                    $("#login_password_Err").html('Password or Pin is required!');
                }
                if (isTrue) {
                    let firstName, lastName, email, phoneNo, username, pin, password, isAdmin = false, userType, permissions = [];
                    firstName = $("#firstName").val();
                    lastName = $("#lastName").val();
                    email = $("#email").val();
                    phoneNo = $("#phoneNo").val();
                    username = $("#email").val();
                    pin = $("#login_pin").val();
                    password = ($("#login_possword").val() ? $("#login_possword").val() : pin);
                    isAdmin = $("#is_this_user_an_admin").prop('checked');
                    userType = (isAdmin ? 'Admin' : 'User');
                    loader.visible();
                    for (let data of $scope.userCarts) {
                        permissions.push({
                            isChecked: $(`#${data._name}`).prop('checked') || false, _name: data._name, name: data.name,
                            isCreate: $(`#${data._name}_create`).prop('checked') || false, isEdit: $(`#${data._name}_edit`).prop('checked') || false,
                            isDelete: $(`#${data._name}_delete`).prop('checked') || false
                        });
                    }

                    VenueUser.createAndUpdate({
                        params: {
                            firstName, lastName, email, username,
                            phoneNo, pin, password, isAdmin, userType, ownerId: $scope.userId, permissions
                        }
                    }).$promise.then((res) => {
                        $("#firstName,#lastName,#email,#phoneNo,#email,#login_pin,#login_possword").val('')
                        $("#is_this_user_an_admin").prop('checked', false);
                        $(".is-a-ch").prop('checked', false);
                        toastMsg(true, "Successfully created!");
                        setTimeout(function () {
                            loader.hidden();
                        }, 300);
                    });
                }
            }

        }])
        .controller('userUpdateCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'loader', 'VenueUser',
        function ($scope, $state, $rootScope, Business, $http, loader, VenueUser) { 

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.userCarts = [{ name: 'Is this user an admin', _name: 'is_this_user_an_admin', isAdmin: true, isChecked: false },
            { name: 'Exclusive Offer', _name: 'exclusive_Offer', isAdmin: false, isCreate: true, isEdit: true, isDelete: true, isChecked: false },
            { name: 'Cart', _name: 'cart', isAdmin: false, isCreate: true, isEdit: true, isDelete: true, isChecked: false },
            { name: 'Daily Special', _name: 'daily_Special', isAdmin: false, isCreate: true, isEdit: true, isDelete: true, isChecked: false },
            { name: 'Order', _name: 'order', isAdmin: false, isCreate: true, isEdit: true, isDelete: true, isChecked: false, isChecked: false },
            { name: 'Drinks Special', _name: 'drinks_Special', isAdmin: false, isCreate: true, isEdit: true, isDelete: true, isChecked: false },
            { name: 'Food', _name: 'food', isAdmin: false, isCreate: true, isEdit: true, isDelete: true, isChecked: false },
            { name: 'Events', _name: 'events', isAdmin: false, isCreate: true, isEdit: true, isDelete: true, isChecked: false },
            { name: 'Drinks Menu', _name: 'drinks_Menu', isAdmin: false, isCreate: true, isEdit: true, isDelete: true, isChecked: false },
            { name: 'Sports', _name: 'sports', isAdmin: false, isCreate: true, isEdit: true, isDelete: true, isChecked: false }];
           
            $scope.venueUP = {};
            $scope.getData = () => {
                if (localStorage.getItem("editIdUserP_m")) {
                    let ids = JSON.parse(localStorage.getItem("editIdUserP_m"));
                    if (ids && ids.id) {
                        loader.visible();
                        VenueUser.findOne({ filter: { where: { id: ids.id }, include: [{ relation: "venuePermissions" }] } }).$promise.then((res) => {
                            $scope.venueUP = res;
                            setTimeout(function () {
                                loader.hidden();
                            }, 500);
                        })
                    } else $state.go("venue-users");
                } else $state.go("venue-users");
            }
            $scope.getData();

            $scope.updateUser = () => {
                let ids = JSON.parse(localStorage.getItem("editIdUserP_m"));
                if (ids && ids.id) {
                    loader.visible();
                    let firstName, lastName, email, phoneNo, username, pin, password, isAdmin = false, userType, permissions = [];
                    firstName = $("#firstName").val();
                    lastName = $("#lastName").val();
                    email = $("#email").val();
                    phoneNo = $("#phoneNo").val();
                    isAdmin = $("#is_this_user_an_admin").prop('checked');
                    userType = (isAdmin ? 'Admin' : 'User');
                    for (let data of $scope.userCarts) {
                        permissions.push({
                            isChecked: $(`#${data._name}`).prop('checked') || false, _name: data._name, name: data.name,
                            isCreate: $(`#${data._name}_create`).prop('checked') || false, isEdit: $(`#${data._name}_edit`).prop('checked') || false,
                            isDelete: $(`#${data._name}_delete`).prop('checked') || false
                        });
                    }
                    VenueUser.updateUser({ params : { id : ids.id , firstName , lastName , email , phoneNo  , isAdmin , userType , permissions } })
                    .$promise.then((res)=>{ 
                        setTimeout(function(){
                            $scope.getData();
                            loader.hidden();
                            toastMsg(true , "Successfully updated!");
                        }, 500);
                    });
                } else $state.go("venue-users");
            }
        }]);    