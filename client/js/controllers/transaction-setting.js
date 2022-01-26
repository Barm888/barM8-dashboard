angular
    .module('app')
    .controller('transactionSettingCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'loader', 'VenueSettings', 'VenueAccounts', 'AppConfig', 'getAllVenues',
        function ($scope, $state, $rootScope, Business, $http, loader, VenueSettings, VenueAccounts, AppConfig, getAllVenues) {

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.isBusinessSelect = false;

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            $scope.businessDelection = [];
            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                loader.visible()
                setTimeout(function () {
                    $scope.businessDelection = getAllVenues.get();
                    loader.hidden();
                }, 1500)
            }

            $scope.getBusinessName = () => {
                return $scope.businessDelection;
            };


            $scope.getVenueSettings = () => {
                if ($scope.userId) {
                    loader.visible();
                    VenueSettings.find({
                        filter: {
                            where: { ownerId: $scope.userId },
                            include: [{ relation: "business", scope: { fields: ["id", "bookingUrl"] } }]
                        }
                    }).$promise.then((res) => {
                        if (res && res.length) {

                            $("#create-btn").html('Update');
                            // console.log(JSON.stringify(res));
                            for (let data of res) {
                                if (data.category == 'DrinksOrder') {
                                    if (data.isEnabled) { $scope.drinksChecked = true; $("#drinks_order").prop('checked', true); }
                                    else {
                                        $scope.drinksChecked = false;
                                        $("#drinks_order").prop('checked', false);
                                        $(".chb-drinks").prop('disabled', true);
                                    }
                                    if (data.isAbsorb) $("#drinks_order_absorb_fee").prop('checked', true);
                                    if (data.isFixed) {
                                        $("#drinks_order_fixed_fee_txt").val(data.fixedFee);
                                        $("#drinks_order_fixed_fee").prop('checked', true);
                                    }
                                    if (data.isPercentage) {
                                        $(`#drinks_order_per_select  option[value="${data.percentageFee}"]`).prop("selected", true);
                                        $("#drinks_order_perc_fee").prop('checked', true);
                                    }
                                }
                                if (data.category == 'MealsOrder') {
                                    if (data.isEnabled) { $scope.meals_order_checked = true; $("#meals_order").prop('checked', true); }
                                    else {
                                        $scope.meals_order_checked = false;
                                        $("#meals_order").prop('checked', false);
                                        $(".chb-meals").prop('disabled', true);
                                    }
                                    if (data.isAbsorb) $("#meals_order_absorb_fee").prop('checked', true);
                                    if (data.isFixed) {
                                        $("#meals_order_fixed_fee_txt").val(data.fixedFee);
                                        $("#meals_order_fixed_fee").prop('checked', true);
                                    }
                                    if (data.isPercentage) {
                                        $(`#meals_order_per_select  option[value="${data.percentageFee}"]`).prop("selected", true);
                                        $("#meals_order_perc_fee").prop('checked', true);
                                    }
                                }
                                if (data.category == 'EventTicketing') {
                                    if (data.isEnabled) { $scope.event_ticket_checked = true; $("#event_ticket").prop('checked', true); }
                                    else {
                                        $scope.event_ticket_checked = false;
                                        $("#event_ticket").prop('checked', false);
                                        $(".chb-event").prop('disabled', true);
                                    }
                                    if (data.isAbsorb) $("#event_ticket_absorb_fee").prop('checked', true);
                                    if (data.isFixed) {
                                        $("#event_ticket_fixed_fee_txt").val(data.fixedFee);
                                        $("#event_ticket_fixed_fee").prop('checked', true);
                                    }
                                    if (data.isPercentage) {
                                        $(`#event_ticket_order_select  option[value="${data.percentageFee}"]`).prop("selected", true);
                                        $("#event_ticket_perc_fee").prop('checked', true);
                                    }
                                }
                                if (data.category == 'BookingReservation') {

                                    console.log(JSON.stringify(data));

                                    if (data.isEnabled) { $scope.booking_reser_order_checked = true; $("#booking_reser_order").prop('checked', true); }
                                    else {
                                        $scope.booking_reser_order_checked = false;
                                        $("#booking_reser_order").prop('checked', false);
                                        $(".chb-booking-reservation").prop('disabled', true);
                                    }
                                    if (data.isAbsorb) $("#reservation_order_absorb_fee").prop('checked', true);
                                    if (data.isFixed) $("#reservation_fixed_fee").prop('checked', true);
                                    if (data.isPercentage) $("#reservation_order_perc_fee").prop('checked', true);

                                    if (data.business && data.business.bookingUrl) $("#booking-reservation-url").val(data.business.bookingUrl);
                                    else if (data.url) $("#booking-reservation-url").val(data.url);


                                    $("#reservation_order_url").prop('checked', data.isUrl);

                                    if (data.isFixed) {
                                        $("#reservation_fixed_fee_txt").val(data.fixedFee);
                                        $("#reservation_fixed_fee").prop('checked', true);
                                    }
                                    if (data.isPercentage) {
                                        $(`#booking_reser_order_select  option[value="${data.percentageFee}"]`).prop("selected", true);
                                        $("#reservation_order_perc_fee").prop('checked', true);
                                    }
                                    if (data.business.phone || data.phoneNumber) {
                                        if (data.business.phone) $("#booking_res_order_phone_number").val(data.business.phone);
                                        else $("#booking_res_order_phone_number").val(data.phoneNumber);
                                        $("#res_order_phone_number").prop('checked', data.isPhoneNumber);
                                    }
                                }

                                if (data.category == 'TakeawaySpecialOffer') {
                                    if (data.isEnabled) {
                                        $scope._takeaway_special_offer = true;
                                        $("#_takeaway_Special_offer").prop('checked', true);
                                    }
                                    else {
                                        $scope._takeaway_special_offer = false;
                                        $("#_takeaway_Special_offer").prop('checked', false)
                                        $("#_takeaway_url").prop('checked', false).prop('disabled', true);
                                        $("#_takeaway_url_txt,#_takeaway_phone_number_txt,#_takeaway_desc_txt").val('');
                                        $("#_takeaway_phone_number").prop('checked', false).prop('disabled', true);
                                        $("#_takeaway_desc").prop('checked', false).prop('disabled', true);
                                    }
                                    if (data.isUrl) $("#_takeaway_url").prop('checked', true);
                                    if (data.url) $("#_takeaway_url_txt").val(data.url);
                                    if (data.isDesc) $("#_takeaway_desc").prop('checked', true);
                                    if (data.desc) $("#_takeaway_desc_txt").val(data.desc);
                                    if (data.isPhoneNumber) $("#_takeaway_phone_number").prop('checked', true);
                                    if (data.phoneNumber) $("#_takeaway_phone_number_txt").val(data.phoneNumber);
                                }
                            }
                        } else {
                            $scope._takeaway_special_offer = false;
                            $("#_takeaway_Special_offer").prop('checked', false)
                            $("#_takeaway_url").prop('checked', false).prop('disabled', true);
                            $("#_takeaway_phone_number").prop('checked', false).prop('disabled', true);
                            $("#_takeaway_desc").prop('checked', false).prop('disabled', true);
                        } setTimeout(function () { loader.hidden() }, 300);
                    }, (err) => {
                        toastMsg(false, 'No Data. Please try again!');
                    })
                } else {
                    toastMsg(false, "Please try again!");
                }
            }

            var elm;
            var isValidURL = (u) => {
                if (!elm) {
                    elm = document.createElement('input');
                    elm.setAttribute('type', 'url');
                }
                elm.value = u;
                return elm.validity.valid;
            }

            $scope.saveAndUpdate = () => {

                let createData = [];

                $(`#_drinks_order_perc_fee_err,#_drinks_order_fixed_fee_err,#_meals_order_fixed_fee_err,
                #_meals_order_perc_fee_err,#_event_ticket_fixed_fee_err,#_event_ticket_perc_fee_err,
                #_booking_re_perc_fee_err,#_booking_re_fixed_fee_err`).css({ display: 'none' });

                if ($("#drinks_order").is(':checked')) {
                    let isAbsorb = false, absorbFee = 0, isFixed = false, fixedFee = 0, isPercentage = false, percentageFee = 0;
                    isAbsorb = $("#drinks_order_absorb_fee").is(':checked');
                    isFixed = $("#drinks_order_fixed_fee").is(':checked');
                    isPercentage = $("#drinks_order_perc_fee").is(':checked');
                    if (isFixed) {
                        if ($("#drinks_order_fixed_fee_txt").val()) {
                            fixedFee = Number($("#drinks_order_fixed_fee_txt").val()) || 0;
                        }
                        else $("#_drinks_order_fixed_fee_err").css({ display: 'block' });
                    }

                    if (isPercentage) {
                        if ($("#drinks_order_per_select").val() != 'select') {
                            percentageFee = Number($("#drinks_order_per_select").val()) || 0;
                        } else $("#_drinks_order_perc_fee_err").css({ display: 'block' });
                    }
                    createData.push({ ownerId: $scope.userId, isEnabled: true, category: "DrinksOrder", isAbsorb, absorbFee, isFixed, fixedFee, isPercentage, percentageFee });
                } else {
                    createData.push({ ownerId: $scope.userId, isEnabled: false, category: "DrinksOrder", isAbsorb: false, absorbFee: 0, isFixed: false, fixedFee: 0, isPercentage: false, percentageFee: 0 });
                }


                if ($("#meals_order").is(':checked')) {
                    let isAbsorb = false, absorbFee = 0, isFixed = false, fixedFee = 0, isPercentage = false, percentageFee = 0;
                    isAbsorb = $("#meals_order_absorb_fee").is(':checked');
                    isFixed = $("#meals_order_fixed_fee").is(':checked');
                    isPercentage = $("#meals_order_perc_fee").is(':checked');
                    if (isFixed) {
                        if ($("#meals_order_fixed_fee_txt").val()) {
                            fixedFee = Number($("#meals_order_fixed_fee_txt").val()) || 0;
                        }
                        else $("#_meals_order_fixed_fee_err").css({ display: 'block' });
                    }

                    if (isPercentage) {
                        if ($("#meals_order_per_select").val() != 'select') {
                            percentageFee = Number($("#meals_order_per_select").val()) || 0;
                        } else $("#_meals_order_perc_fee_err").css({ display: 'block' });
                    }
                    createData.push({ ownerId: $scope.userId, isEnabled: true, category: "MealsOrder", isAbsorb, absorbFee, isFixed, fixedFee, isPercentage, percentageFee });
                } else {
                    createData.push({ ownerId: $scope.userId, isEnabled: false, category: "MealsOrder", isAbsorb: false, absorbFee: 0, isFixed: false, fixedFee: 0, isPercentage: false, percentageFee: 0 });
                }

                if ($("#event_ticket").is(':checked')) {
                    let isAbsorb = false, absorbFee = 0, isFixed = false, fixedFee = 0, isPercentage = false, percentageFee = 0;
                    isAbsorb = $("#event_ticket_absorb_fee").is(':checked');
                    isFixed = $("#event_ticket_fixed_fee").is(':checked');
                    isPercentage = $("#event_ticket_perc_fee").is(':checked');
                    if (isFixed) {
                        if ($("#event_ticket_fixed_fee_txt").val()) {
                            fixedFee = Number($("#event_ticket_fixed_fee_txt").val()) || 0;
                        }
                        else $("#_event_ticket_fixed_fee_err").css({ display: 'block' });
                    }

                    if (isPercentage) {
                        if ($("#event_ticket_order_select").val() != 'select') {
                            percentageFee = Number($("#event_ticket_order_select").val()) || 0;
                        } else $("#_event_ticket_perc_fee_err").css({ display: 'block' });
                    }
                    createData.push({ ownerId: $scope.userId, isEnabled: true, category: "EventTicketing", isAbsorb, absorbFee, isFixed, fixedFee, isPercentage, percentageFee });
                } else {
                    createData.push({ ownerId: $scope.userId, isEnabled: false, category: "EventTicketing", isAbsorb: false, absorbFee: 0, isFixed: false, fixedFee: 0, isPercentage: false, percentageFee: 0 });
                }

                $scope.isBookingUrl = true;

                $("#url_error").css({ display: 'none' })

                if ($("#booking_reser_order").is(':checked')) {
                    let isAbsorb = false, absorbFee = 0, isFixed = false, fixedFee = 0, isPercentage = false, percentageFee = 0, isUrl = false, url = '',
                        isPhoneNumber = false, phoneNumber = '';
                    isAbsorb = $("#reservation_order_absorb_fee").is(':checked');
                    isFixed = $("#reservation_fixed_fee").is(':checked');
                    isPercentage = $("#reservation_order_perc_fee").is(':checked');
                    isUrl = $("#reservation_order_url").is(':checked');
                    isPhoneNumber = $("#res_order_phone_number").is(':checked');

                    if (isFixed) {
                        if ($("#reservation_fixed_fee_txt").val()) {
                            fixedFee = Number($("#reservation_fixed_fee_txt").val()) || 0;
                        }
                        else $("#_booking_re_fixed_fee_err").css({ display: 'block' });
                    }

                    if (isPercentage) {
                        if ($("#booking_reser_order_select").val() != 'select') {
                            percentageFee = Number($("#booking_reser_order_select").val()) || 0;
                        } else $("#_booking_re_perc_fee_err").css({ display: 'block' });
                    }

                    url = $("#booking-reservation-url").val();
                    phoneNumber = $("#booking_res_order_phone_number").val();

                    if (isUrl) {

                        if (url && isValidURL(url) && phoneNumber) {
                            createData.push({ ownerId: $scope.userId, isEnabled: true, category: "BookingReservation", isAbsorb, absorbFee, isFixed, fixedFee, isPercentage, percentageFee, isUrl, url, isPhoneNumber: false, phoneNumber });
                        }
                        else if (isUrl && url && isValidURL(url)) {
                            createData.push({ ownerId: $scope.userId, isEnabled: true, category: "BookingReservation", isAbsorb, absorbFee, isFixed, fixedFee, isPercentage, percentageFee, isUrl, url, isPhoneNumber: false, phoneNumber: '' });
                        } else if (isPhoneNumber) {
                            createData.push({ ownerId: $scope.userId, isEnabled: true, category: "BookingReservation", isAbsorb, absorbFee, isFixed, fixedFee, isPercentage, percentageFee, isUrl: false, url, isPhoneNumber, phoneNumber });
                        }
                        else {
                            $("#url_error").css({ display: 'block' })
                            $scope.isBookingUrl = false;
                            let isEnabled = true;
                            if (!isAbsorb && !isFixed && !isPercentage && !isUrl) isEnabled = false
                            createData.push({ ownerId: $scope.userId, isEnabled, category: "BookingReservation", isAbsorb, absorbFee, isFixed, fixedFee, isPercentage, percentageFee, isUrl: false, url: '', isPhoneNumber, phoneNumber });
                        }
                    } else {
                        createData.push({ ownerId: $scope.userId, isEnabled: true, category: "BookingReservation", isAbsorb, absorbFee, isFixed, fixedFee, isPercentage, percentageFee, isUrl, url, isPhoneNumber, phoneNumber });
                    }

                    let bCreate = {
                        bookingUrl: '',
                        phone: ''
                    }
                    if ($("#booking_res_order_phone_number").val()) {
                        bCreate.phone = $("#booking_res_order_phone_number").val()
                    }
                    if ($("#booking-reservation-url").val()) {
                        bCreate.bookingUrl = $("#booking-reservation-url").val()
                    }

                    Business.upsertWithWhere({ where: { id: $scope.userId } }, bCreate)

                } else {

                    let obj = { ownerId: $scope.userId, isEnabled: false, category: "BookingReservation", isAbsorb: false, absorbFee: 0, isFixed: false, fixedFee: 0, isPercentage: false, percentageFee: 0, isUrl: false, url: '' };

                    if ($("#booking_res_order_phone_number").val() && $("#booking-reservation-url").val()) {
                        obj = {
                            ownerId: $scope.userId, isEnabled: true, category: "BookingReservation", isAbsorb: false, absorbFee: 0, isFixed: false, fixedFee: 0, isPercentage: false, percentageFee: 0, isUrl: true, url: $("#booking-reservation-url").val(), isPhoneNumber: false,
                            phoneNumber: $("#booking_res_order_phone_number").val()
                        }
                    } else if ($("#booking-reservation-url").val()) {
                        obj = {
                            ownerId: $scope.userId, isEnabled: true, category: "BookingReservation", isAbsorb: false, absorbFee: 0, isFixed: false, fixedFee: 0, isPercentage: false, percentageFee: 0, isUrl: true,
                            url: $("#booking-reservation-url").val(), isPhoneNumber: false, phoneNumber: ''
                        }
                    } else if ($("#booking_res_order_phone_number").val()) {
                        obj = {
                            ownerId: $scope.userId, isEnabled: true, category: "BookingReservation", isAbsorb: false, absorbFee: 0, isFixed: false, fixedFee: 0, isPercentage: false, percentageFee: 0, isUrl: false, url: '', isPhoneNumber: true,
                            phoneNumber: $("#booking_res_order_phone_number").val()
                        }
                    }

                    createData.push(obj);

                    let bCreate = {
                        bookingUrl: '',
                        phone: ''
                    }
                    if ($("#booking_res_order_phone_number").val()) {
                        bCreate.phone = $("#booking_res_order_phone_number").val()
                    }
                    if ($("#booking-reservation-url").val()) {
                        bCreate.bookingUrl = $("#booking-reservation-url").val()
                    }

                    Business.upsertWithWhere({ where: { id: $scope.userId } }, bCreate)
                }



                if ($("#_takeaway_Special_offer").is(':checked')) {
                    let isDesc = false, desc = '', isUrl = false, url = '', isPhoneNumber = false, phoneNumber = '';
                    isDesc = $("#_takeaway_desc").is(':checked');
                    desc = $("#_takeaway_desc_txt").val();
                    if (!desc || isDesc == false) { isDesc = false; desc = '' }
                    isUrl = $("#_takeaway_url").is(':checked');
                    url = $("#_takeaway_url_txt").val();
                    if (!url || isUrl == false) { isUrl = false; url = '' }
                    isPhoneNumber = $("#_takeaway_phone_number").is(':checked');
                    phoneNumber = $("#_takeaway_phone_number_txt").val();
                    if (!phoneNumber || isPhoneNumber == false) { isPhoneNumber = false; phoneNumber = '' }

                    createData.push({ ownerId: $scope.userId, isEnabled: true, category: "TakeawaySpecialOffer", isDesc, desc, isUrl, url, isPhoneNumber, phoneNumber });

                } else {
                    createData.push({ ownerId: $scope.userId, isEnabled: false, category: "TakeawaySpecialOffer", isDesc: false, desc: '', isUrl: false, url: '', isPhoneNumber: false, phoneNumber: '' });
                }


                if ($scope.userId && $scope.isBookingUrl) {
                    loader.visible();
                    AppConfig.findOne().$promise.then((aCM) => {
                        if (aCM) {
                            let stripeMode = aCM.stripeMode;
                            Business.find({ filter: { where: { id: $scope.userId } } }).$promise.then((bRes) => {
                                VenueAccounts.find({ filter: { where: { ownerId: $scope.userId } } }).$promise.then((vaRes) => {
                                    if (bRes && bRes.length) {
                                        let busData = bRes[0];
                                        let sCReate = () => {

                                            VenueSettings.createAndUpdate({ params: { createData } }).$promise.then((res) => {
                                                $(".all-checkbox").prop('checked', false);
                                                $(".all-textbox").val('' || null);
                                                $(".all-selectbox").val('select');
                                                toastMsg(true, "Successfuly created");
                                                $scope.getVenueSettings();
                                                setTimeout(function () { loader.hidden(); }, 300);
                                            })
                                            // if ((busData.stripeTestId || busData.stripeLiveId)) {
                                            //     VenueSettings.createAndUpdate({ params: { createData } }).$promise.then((res) => {
                                            //         $(".all-checkbox").prop('checked', false);
                                            //         $(".all-textbox").val('' || null);
                                            //         $(".all-selectbox").val('select');
                                            //         toastMsg(true, "Successfuly created");
                                            //         $scope.getVenueSettings();
                                            //         setTimeout(function () { loader.hidden(); }, 300);
                                            //     })
                                            // } else {
                                            //     loader.hidden();
                                            //     $('#errorModal').modal({
                                            //         backdrop: 'static',
                                            //         keyboard: false
                                            //     })
                                            // }
                                        }

                                        // if (stripeMode) {
                                        //     let chardata = vaRes.find(m => m.stripe_live_data && m.stripe_live_data.charges_enabled);
                                        //     if (chardata && chardata.stripe_live_data.charges_enabled) {
                                        //         sCReate();
                                        //     } else {
                                        //         loader.hidden();
                                        //         $('#errorModal').modal({
                                        //             backdrop: 'static',
                                        //             keyboard: false
                                        //         })
                                        //     }
                                        // } else {
                                        //     let chardata = vaRes.find(m => m.stripe_test_data && m.stripe_test_data.charges_enabled);
                                        //     if (chardata && chardata.stripe_test_data.charges_enabled) {
                                        //         sCReate();
                                        //     } else {
                                        //         loader.hidden();
                                        //         $('#errorModal').modal({
                                        //             backdrop: 'static',
                                        //             keyboard: false
                                        //         })
                                        //     }
                                        // }

                                        sCReate();

                                    }
                                })
                            })
                        }
                    })

                }

            }


            $scope.gotoAccounts = () => {
                loader.visible()
                $('#errorModal').modal('hide');
                setTimeout(function () {
                    $state.go("venue-accounts");
                    loader.hidden()
                }, 400);
            }

            if (!$rootScope.selectedVenue) $rootScope.selectedVenue = localStorage.getItem("selectedVenue");
            if (!$scope.userDetails.isAdmin) {
                // $("#businessSubmit").css({ display: 'none' });
                //$("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                // $("#autocompleteBusiness").attr('disabled', true);
                $scope.userId = $scope.userDetails.id;
                localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userDetails.id, ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
                $scope.getVenueSettings();
            } else if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId) {
                $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                $scope.userId = $rootScope.selectedVenue.venueId;
                $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.venueId)
                if ($("#businessSubmit").hasClass('businessSubmit')) {
                    $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                }
                $scope.isBusinessSelect = true;
                $rootScope.selectedVenue = { ownerId: $scope.userId, venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                $scope.getVenueSettings();
            }


            $scope.BusinessSelected = (arg) => {
                $("#businessErr").text('');
                if ($("#autocompleteBusiness").data('id')) {
                    arg = $("#autocompleteBusiness").data('id');
                    $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    if (arg != "select") {
                        $scope.isBusinessSelect = true;
                        $scope.userId = arg;
                        $rootScope.selectedVenue = { venueId: $scope.userId, ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                        localStorage.removeItem("selectedVenue")
                        localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userId, ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }));
                        $scope.getVenueSettings();
                    }
                } else {
                    $("#businessErr").text('Please select the Business name');
                }
            }




        }]);