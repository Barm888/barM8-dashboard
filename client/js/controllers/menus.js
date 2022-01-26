angular
    .module('app')
    .controller('menuHoursCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'MenuCategory', 'MenuHours', 'MealsCategory',
        function ($scope, $state, $rootScope, Business, $http, MenuCategory, MenuHours, MealsCategory) {

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.isBusinessSelect = false;

            $scope.menuHoursList = [];
            $scope.getMenuHours = () => {
                MenuHours.find({ filter: { where: { ownerId: $scope.userId }, order: "order asc" } }).$promise.then((res) => {
                    $scope.menuHoursList = []; $scope.menuHoursList = res;
                    setTimeout(() => { $("#menuHours").css({ "opacity": "" }); }, 100)
                });
            }

            if (!$scope.userId) {
                $scope.userId = $rootScope.currentUser.id;
            }

            if($scope.userDetails && $scope.userDetails.isAdmin == false) {
                $scope.userId = $scope.userDetails.id;
                $scope.getMenuHours();
                $("#autocompleteBusiness").val($scope.userDetails.businessName);
                $("#autocompleteBusiness").attr('disabled' , true);
                $("#businessSubmit").css({ display : 'none' })
                $("#businessSubmit").addClass('businessReset');
            }  else if ($scope.userDetails.isAdmin) {
                if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId) {
                    $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                    $scope.userId = $rootScope.selectedVenue.venueId;
                    $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.venueId)
                    if ($("#businessSubmit").hasClass('businessSubmit')) {
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    }
                    $scope.isBusinessSelect = true;
                    $rootScope.selectedVenue = { venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                    $scope.getMenuHours();
                }
            }

            $scope.useremail = $rootScope.currentUser.email;
            $scope.userId = "";
            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
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

            $scope.getMenuCategory = () => MenuCategory.find().$promise.then((res) => $scope.categories = res);

            $scope.getMenuCategory();

            $scope.weekday = [{ name: 'Sun', txt: 'Sunday', val: 'sunday' }, { name: 'Mon', txt: 'Monday', val: 'monday' }, { name: 'Tue', txt: 'Tuesday', val: 'tuesday' },
            { name: 'Wed', txt: 'Wednesday', val: 'wednesday' }, { name: 'Thu', txt: 'Thursday', val: 'thursday' }, { name: 'Fri', txt: 'Friday', val: 'friday' },
            { name: 'Sat', txt: 'Saturday', val: 'saturday' }];

            $scope.daysSelected = (arg, day, sday) => {
                if ($(`#${arg}${day}`).attr('data-selected') == "true")
                    $(`#${arg}${day}`).attr('data-selected', false).addClass('btnBeforemenu').removeClass('btnAfterMenu').css({ 'background-color': '#757575' }).html(`${sday}`);
                else
                    $(`#${arg}${day}`).attr('data-selected', true).css({ 'background-color': '#4caf50' }).removeClass('btnBeforemenu').addClass('btnAfterMenu').html(`<i class="fas fa-check"></i> ${sday}`);
            }

            $scope.categoryChange = () => {
                if ($("#businessSubmit").hasClass('businessReset')) {
                    $("#weekdays_sunday,#weekdays_monday,#weekdays_tuesday,#weekdays_wednesday,#weekdays_thursday,#weekdays_friday,#weekdays_saturday").prop('disabled', false);
                    if ($scope.category) {
                        MenuHours.find({ filter: { where: { menuCategoryId: $scope.category.id, ownerId: $scope.userId } } }).$promise.then((res) => {
                            if (res && res.length) {
                                for (let menu of res) {
                                    if (menu && menu.sunday && menu.sunday.value) $("#weekdays_sunday").prop('disabled', true);
                                    if (menu && menu.monday && menu.monday.value) $("#weekdays_monday").prop('disabled', true);
                                    if (menu && menu.tuesday && menu.tuesday.value) $("#weekdays_tuesday").prop('disabled', true);
                                    if (menu && menu.wednesday && menu.wednesday.value) $("#weekdays_wednesday").prop('disabled', true);
                                    if (menu && menu.thursday && menu.thursday.value) $("#weekdays_thursday").prop('disabled', true);
                                    if (menu && menu.friday && menu.friday.value) $("#weekdays_friday").prop('disabled', true);
                                    if (menu && menu.saturday && menu.saturday.value) $("#weekdays_saturday").prop('disabled', true);
                                }
                            }
                        });
                        $("#category_err").css({ 'display': 'none' });
                    }
                } else {
                    toastMsg(false, "Please select the Business!");
                }
            }

            convertTime12to24 = (time12h) => {
                const [time, modifier] = time12h.split(' ');

                let [hours, minutes] = time.split(':');

                if (hours === '12') hours = '00';

                if (modifier === 'PM') hours = parseInt(hours, 10) + 12;

                return `${hours}:${minutes}`;
            }


            $scope.create = () => {
                $("#menuHours_add_btn").html('<i class="fas fa-spinner fa-spin"></i> Save').prop('disabled', true);
                $("#category_err,#startTime_err,#endTime_err,#days_err").css({ 'display': 'none' });
                let isVaild = true;
                    if (!$scope.category) {
                        $("#category_err").css({ 'display': 'block' });
                        isVaild = false;
                    }
                    if (!$("#startTime").val()) {
                        isVaild = false;
                        $("#startTime_err").css({ 'display': 'block' });
                    }
                    if (!$("#endTime").val()) {
                        isVaild = false;
                        $("#endTime_err").css({ 'display': 'block' });
                    }
                    if ($(".btnAfterMenu").length == 0) {
                        isVaild = false;
                        $("#days_err").css({ 'display': 'block' });
                    }

                    afterSuccess = () => {
                        $scope.getMenuHours();
                        toastMsg(true, "Successfully Created!");
                        $("#startTime,#endTime").val('');
                        $(".daysBtn").each(function (i) {
                            if ($(this).attr('data-dayname') == "sunday") $(this).attr('data-selected', false).addClass('btnBeforemenu').removeClass('btnAfterMenu').css({ 'background-color': '#757575' }).html('Sun');
                            else if ($(this).attr('data-dayname') == "monday") $(this).attr('data-selected', false).addClass('btnBeforemenu').removeClass('btnAfterMenu').css({ 'background-color': '#757575' }).html('Mon');
                            else if ($(this).attr('data-dayname') == "tuesday") $(this).attr('data-selected', false).addClass('btnBeforemenu').removeClass('btnAfterMenu').css({ 'background-color': '#757575' }).html('Tue');
                            else if ($(this).attr('data-dayname') == "wednesday") $(this).attr('data-selected', false).addClass('btnBeforemenu').removeClass('btnAfterMenu').css({ 'background-color': '#757575' }).html('Wed');
                            else if ($(this).attr('data-dayname') == "thursday") $(this).attr('data-selected', false).addClass('btnBeforemenu').removeClass('btnAfterMenu').css({ 'background-color': '#757575' }).html('Thu');
                            else if ($(this).attr('data-dayname') == "friday") $(this).attr('data-selected', false).addClass('btnBeforemenu').removeClass('btnAfterMenu').css({ 'background-color': '#757575' }).html('Fri');
                            else if ($(this).attr('data-dayname') == "saturday") $(this).attr('data-selected', false).addClass('btnBeforemenu').removeClass('btnAfterMenu').css({ 'background-color': '#757575' }).html('Sat');
                        });
                        $("#menuHours_add_btn").html('<i class="far fa-save"></i>  Save').prop('disabled', false);
                        $scope.categoryChange();
                    }

                    if (isVaild) {
                        let menu = $scope.category.name, startTime = $("#startTime").val(), endTime = $("#endTime").val();
                        if (menu) {
                            let menuHoursFilter = {}, menus = [];
                            menuHoursFilter = { filter: { where: { or: [{ name: menu }] } } };

                            MenuCategory.find(menuHoursFilter).$promise.then((res) => {
                                if (res && res.length) {

                                    let menuHoursCArr = [];
                                    res.forEach((obj, i) => {
                                        let dayValue = { value: false, startTime: null, _24startTime: null, endTime: null, _24endTime: null },
                                            menuHoursObj = {
                                                ownerId: $scope.userId, category: null, menu: null, shortName: null, menuCategoryId: null,
                                                sunday: dayValue, monday: dayValue, tuesday: dayValue, wednesday: dayValue, thursday: dayValue, friday: dayValue, saturday: dayValue
                                            };

                                        $(".daysBtn").each(function (i) {
                                            if ($(this).attr('data-selected') == "true") {
                                                isVaild = daysErr = true;
                                                if ($(this).attr('data-dayname') == "sunday")
                                                    menuHoursObj.sunday = { value: true, startTime, _24startTime: convertTime12to24(startTime), endTime, _24endTime: convertTime12to24(endTime) };
                                                else if ($(this).attr('data-dayname') == "monday")
                                                    menuHoursObj.monday = { value: true, startTime, _24startTime: convertTime12to24(startTime), endTime, _24endTime: convertTime12to24(endTime) };
                                                else if ($(this).attr('data-dayname') == "tuesday")
                                                    menuHoursObj.tuesday = { value: true, startTime, _24startTime: convertTime12to24(startTime), endTime, _24endTime: convertTime12to24(endTime) };
                                                else if ($(this).attr('data-dayname') == "wednesday")
                                                    menuHoursObj.wednesday = { value: true, startTime, _24startTime: convertTime12to24(startTime), endTime, _24endTime: convertTime12to24(endTime) };
                                                else if ($(this).attr('data-dayname') == "thursday")
                                                    menuHoursObj.thursday = { value: true, startTime, _24startTime: convertTime12to24(startTime), endTime, _24endTime: convertTime12to24(endTime) };
                                                else if ($(this).attr('data-dayname') == "friday")
                                                    menuHoursObj.friday = { value: true, startTime, _24startTime: convertTime12to24(startTime), endTime, _24endTime: convertTime12to24(endTime) };
                                                else if ($(this).attr('data-dayname') == "saturday")
                                                    menuHoursObj.saturday = { value: true, startTime, _24startTime: convertTime12to24(startTime), endTime, _24endTime: convertTime12to24(endTime) };
                                            }
                                        });
                                        menuHoursObj.menu = obj.name; menuHoursObj.category = obj.name, menuHoursObj.menuCategoryId = obj.id; menuHoursObj.shortName = obj.shortName;
                                        menuHoursCArr.push(menuHoursObj);

                                        if (res && (res.length == (i + 1))) {
                                            MenuHours.createAndUpdate({ params: { menuHours: menuHoursCArr } })
                                            setTimeout(function () { afterSuccess(); }, 3000);
                                        }

                                    });
                                } else $("#menuHours_add_btn").html('<i class="far fa-save"></i>  Save').prop('disabled', false);
                            });
                        } else $("#menuHours_add_btn").html('<i class="far fa-save"></i>  Save').prop('disabled', false);
                    } else $("#menuHours_add_btn").html('<i class="far fa-save"></i>  Save').prop('disabled', false);
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
                            $scope.getMenuHours();
                            $rootScope.selectedVenue = {  ownerId : $scope.userId, venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                            if ($scope.category && $scope.category.id) $scope.categoryChange();
                        }
                    } else {
                        $("#businessErr").text('Please select the Business name');
                    }
                }
            }

            $scope.daysClick = (i, day) => {
                $(`#edit_${i}`).prop('disabled', true);
                $(`#delete_${i}`).prop('disabled', true);
                $(`#${day}_${i}`).toggleClass('btnSeleted');
                if ($(`#${day}_${i}`).hasClass('btnSeleted')) {
                    $(`#edit_${i}`).prop('disabled', false);
                    $(`#delete_${i}`).prop('disabled', false);
                }
            };

            $scope.update = () => {

                if ($(".btnSeleted").length == 1) {
                    let id = $(".btnSeleted").attr('data-menuid'), day = $(".btnSeleted").attr('data-day'),
                        category = $.trim($(".btnSeleted").attr('data-menu')), categoryId = $.trim($(".btnSeleted").attr('data-menuid'));
                    if (id) {
                        $("#menuHours_update_btn").html('<i class="fas fa-spinner fa-spin"></i> Update').prop('disabled', true);
                        let startTime = $("#startTime").val(), endTime = $("#endTime").val();
                        MenuHours.updateMenuHours({
                            params: {
                                id, startTime, endTime, _24startTime: convertTime12to24(startTime),
                                _24endTime: convertTime12to24(endTime), day, category, categoryId,
                                ownerId: $scope.userId
                            }
                        }).$promise.then((res) => {
                            setTimeout(function () {
                                toastMsg(true, "Successfully updated");
                                $("#menuHours_add_btn").css({ display: 'block' });
                                $("#menuHours_update_btn").css({ display: 'none' });
                                $("#startTime,#endTime").val('');
                                $(".daysBtn").each(function (i) {
                                    if ($(this).attr('data-dayname') == "sunday") $(this).prop('disabled', false).attr('data-selected', false).addClass('btnBeforemenu').removeClass('btnAfterMenu').css({ 'background-color': '#757575' }).html('Sun');
                                    else if ($(this).attr('data-dayname') == "monday") $(this).prop('disabled', false).attr('data-selected', false).addClass('btnBeforemenu').removeClass('btnAfterMenu').css({ 'background-color': '#757575' }).html('Mon');
                                    else if ($(this).attr('data-dayname') == "tuesday") $(this).prop('disabled', false).attr('data-selected', false).addClass('btnBeforemenu').removeClass('btnAfterMenu').css({ 'background-color': '#757575' }).html('Tue');
                                    else if ($(this).attr('data-dayname') == "wednesday") $(this).prop('disabled', false).attr('data-selected', false).addClass('btnBeforemenu').removeClass('btnAfterMenu').css({ 'background-color': '#757575' }).html('Wed');
                                    else if ($(this).attr('data-dayname') == "thursday") $(this).prop('disabled', false).attr('data-selected', false).addClass('btnBeforemenu').removeClass('btnAfterMenu').css({ 'background-color': '#757575' }).html('Thu');
                                    else if ($(this).attr('data-dayname') == "friday") $(this).prop('disabled', false).attr('data-selected', false).addClass('btnBeforemenu').removeClass('btnAfterMenu').css({ 'background-color': '#757575' }).html('Fri');
                                    else if ($(this).attr('data-dayname') == "saturday") $(this).prop('disabled', false).attr('data-selected', false).addClass('btnBeforemenu').removeClass('btnAfterMenu').css({ 'background-color': '#757575' }).html('Sat');
                                });
                                $scope.getMenuHours();
                                $("#menuHours_update_btn").html('Update').prop('disabled', false);
                            }, 1000)


                        });
                    } else toastMsg(false, "Please try again!");
                } else if ($(".btnSeleted").length > 1) toastMsg(false, "Do not select multiple day!");
                else toastMsg(false, "Please try again");
            }

            $scope.editMenuHours = (id, i) => {
                if ($(".btnSeleted").length == 1) {
                    let day = $(".btnSeleted").attr('data-day');
                    if (id) {
                        MenuHours.find({ filter: { where: { id } } }).$promise.then((res) => {
                            if (res && res.length) {
                                $(".daysBtn").each(function () {
                                    if ($(this).attr('data-dayname') != day)
                                        $(this).prop('disabled', true);
                                    if ($(this).attr('data-dayname') == day) {
                                        let displayDay = '';
                                        if (day == "sunday") displayDay = "Sun";
                                        else if (day == "monday") displayDay = "Mon";
                                        else if (day == "tuesday") displayDay = "Tue";
                                        else if (day == "wednesday") displayDay = "Wed";
                                        else if (day == "thursday") displayDay = "Thu";
                                        else if (day == "friday") displayDay = "Fri";
                                        else if (day == "saturday") displayDay = "Sat";
                                        $(this).css({ 'background-color': '#4caf50' }).removeClass('btnBeforemenu').addClass('btnAfterMenu').html(`<i class="fas fa-check"></i> ${displayDay}`);
                                    }
                                });
                                let data = res.find(m => m[day]);
                                $("#startTime").val(data[day].startTime);
                                $("#endTime").val(data[day].endTime)
                                $("#menuHours_add_btn").css({ display: 'none' });
                                $("#menuHours_update_btn").css({ display: 'block' });
                            } else toastMsg(false, "Please try again");
                        });
                    }
                } else toastMsg(false, "Do not select multiple day!");
            }

            $scope.deleteMenuHours = (id, i) => {
                if ($(".btnSeleted").length == 1) {
                    let day = $(".btnSeleted").attr('data-day'),
                        category = $.trim($(".btnSeleted").attr('data-menu')), categoryId = $.trim($(".btnSeleted").attr('data-menuid'));
                    if (id) {
                        $(`#delete_${i}`).html('<i class="fas fa-spinner fa-spin"></i>').prop('disabled', true);
                        MenuHours.delete({ params: { id, day, category, categoryId, ownerId: $scope.userId } }).$promise.then((res) => {
                            setTimeout(function () {
                                $scope.getMenuHours();
                                toastMsg(true, "Successfully deleted");
                                $(`#delete_${i}`).html('<i class="fas fa-trash-alt"></i>').prop('disabled', false);
                            }, 500);
                        });
                    } else toastMsg(false, "Please try again!");
                } else if ($(".btnSeleted").length > 1) toastMsg(false, "Do not select multiple day!");
                else toastMsg(false, "Please try again");
            };

        }])
    .controller('menuManagerCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'MealsDashLine', 'MealsCategory', 'MealsDashSubLine', 'MealsDashLineAddons', 'MealsExtraDashLine', 'loader',
        function ($scope, $state, $rootScope, Business, $http, MealsDashLine, MealsCategory, MealsDashSubLine, MealsDashLineAddons, MealsExtraDashLine, loader) {

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.mealsCategoryArray = [];
            $scope.getMealsHeader = () => {
                if ($scope.userId) {
                    MealsDashLine.getMealsCategory({ details: { ownerId: $scope.userId } }).$promise.then((res) => {
                        $scope.mealsCategoryArray = [];
                        $scope.mealsParentIndex = $scope.mealsChildIndex = 0;
                        if (res && res.data && res.data.isSuccess) $scope.mealsCategoryArray = res.data.result;
                        $("#businessSubmit").html('<i class="fa fa-check"></i> Reset').prop('disabled', false);
                    }, (err) => $scope.mealsCategoryArray = []);
                } else $scope.mealsCategoryArray = [];
            };

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if(!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display : 'none' });

            if ($scope.userDetails.isAdmin == false) {
                $scope.getMealsHeader();
                $("#autocompleteBusiness").val($scope.userDetails.businessName);
                $("#autocompleteBusiness").attr('disabled' , true);
                $("#businessSubmit").addClass('businessReset');
            }  else if ($scope.userDetails.isAdmin) {
                if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId) {
                    $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                    $scope.userId = $rootScope.selectedVenue.venueId;
                    $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.venueId)
                    if ($("#businessSubmit").hasClass('businessSubmit')) {
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    }
                    $scope.isBusinessSelect = true;
                    $rootScope.selectedVenue = { venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                    $scope.getMealsHeader();
                }
            }

            $scope.isBusinessSelect = false;

            if (!$scope.userId) {
                $scope.userId = $rootScope.currentUser.id;
            }

            $scope.useremail = $rootScope.currentUser.email;
            $scope.userId = "";
            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                $scope.isBusinessSelect = true;
                Business.find({ filter: { where: { status: "active" }, "fields": ["businessName", "id", "email"] } }).$promise.then((res) => {
                    $scope.businessDelection = res;
                    $scope.userId = $rootScope.currentUser.id;
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
                            $("#businessSubmit").html('<i class="fas fa-spinner fa-spin"></i> Reset').prop('disabled', true);
                            $scope.getMealsHeader();
                            $rootScope.selectedVenue = { venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                        }
                    } else {
                        $("#businessErr").text('Please select the Business name');
                    }
                }
            }

            $scope.Add_Menu_Header_OPENMODAL = (index, id, category) => {

                if (id) {
                    $(`#addMenuHeader_${id}`).html('<i class="fas fa-spinner fa-spin"></i> &nbsp; Add Header').prop('disabled', true);
                    MealsCategory.find({ filter: { where: { ownerId : $scope.userId } } }).$promise.then((res) => {
                        $scope.mealsCategoryDaysObj = res;
                        let monday = false, tuesday = false, wednesday = false, thursday = false, friday = false, saturday = false, sunday = false;
                        res.filter((m) => {
                            if (m.monday) monday = true;
                            if (m.tuesday) tuesday = true;
                            if (m.wednesday) wednesday = true;
                            if (m.thursday) thursday = true;
                            if (m.friday) friday = true;
                            if (m.saturday) saturday = true;
                            if (m.sunday) sunday = true;
                        });
                        $scope.mealsDays = { monday, tuesday, wednesday, thursday, friday, saturday, sunday };
                        $("#meals_header_add_btn").attr('onclick', `Save_Menu_Header_Btn_Clk('${index}','${id}','${category}')`);
                        $("#meals_menu_Header_MODAL").modal({ backdrop: 'static', keyboard: false });
                        $(`#addMenuHeader_${id}`).html('<i class="fas fa-plus"></i> &nbsp; Add Header').prop('disabled', false);
                    }, (err) => { });
                }
            };

            String.prototype.camelCase = function () {
                return this.toLowerCase().replace(/\b[a-z]/g, function (letter) {
                    return letter.toUpperCase();
                });
            };

            String.prototype.toCamelCase = function () {
                return this.replace(/^([A-Z])|\s(\w)/g, function (match, p1, p2, offset) {
                    if (p2) return p2.toUpperCase();
                    return p1.toLowerCase();
                });
            };


            $scope.addMealsMenuHeader = (i, mealsCategoryId, category) => {
                $("#meals_Menu_Header_Error").text("");
                if ($("#businessSubmit").hasClass('businessReset')) {

                    let menuHeader = $("#meals_menu_header_txt").val(), menuHeaderId, mainCategory = "meals", monday = false, tuesday = false, wednesday = false, thursday = false, friday = false,
                        saturday = false, sunday = false, isAvailable = false, inAppSpecial = false, isSpecial = false;

                    if (menuHeader) menuHeaderId = $.trim(menuHeader.toCamelCase());

                    if (menuHeader) {
                        let categories = [];

                        $(".menu_Header_days.checked").each(function (i, v) {
                            if ($(this).data('day') == 'monday') monday = true;
                            else if ($(this).data('day') == 'tuesday') tuesday = true;
                            else if ($(this).data('day') == 'wednesday') wednesday = true;
                            else if ($(this).data('day') == 'thursday') thursday = true;
                            else if ($(this).data('day') == 'friday') friday = true;
                            else if ($(this).data('day') == 'saturday') saturday = true;
                            else if ($(this).data('day') == 'sunday') sunday = true;
                        });

                        if (menuHeader) menuHeader = (menuHeader).camelCase();
                        $(".meals_menu_header_radio_btn.checked").each(function (i, v) {
                            isAvailable = false; isSpecial = false;
                            let category = $(this).data('menu'), mealsCategoryId = $(this).data('id'), shortName = $(this).data('shortname');
                            if (shortName == "breakfast") isAvailable = true; if (shortName == "breakfastSpecial") isSpecial = true;
                            if (shortName == "lunch") isAvailable = true; if (shortName == "lunchSpecial") isSpecial = true;
                            if (shortName == "dinner") isAvailable = true; if (shortName == "dinnerSpecial") isSpecial = true;
                            if (shortName == "allday") isAvailable = true; if (shortName == "alldaySpecial") isSpecial = true;
                            categories.push({ category, mealsCategoryId, ownerId: $scope.userId, mainCategory, menuHeader, menuHeaderId, [shortName]: true, inAppSpecial, isAvailable, isSpecial, monday, tuesday, wednesday, thursday, friday, saturday, sunday });
                        });

                        if (categories && categories.length > 0) {
                            $(`#meals_header_add_btn`).html('<i class="fas fa-spinner fa-spin"></i> Add').prop('disabled', true);
                            MealsDashLine.createAndUpdate({ details: { categories } }).$promise.then((res) => {
                                if (res.data.isSuccess) {
                                    $("#meals_menu_header_txt").val('');
                                    $scope.getMealsHeader();
                                    $scope.categories = [];
                                    $("#meals_menu_Header_MODAL").modal('hide');
                                    $(`#meals_header_add_btn`).html('<i class="fas fa-plus"></i> Add').prop('disabled', false);
                                    toastMsg(res.data.isSuccess, res.data.message);
                                } else toastMsg(res.data.isSuccess, res.data.message);
                            });
                        } else toastMsg(false, "Please select the category");

                    } else $("#meals_Menu_Header_Error").text("Menu header is required!");
                } else toastMsg(false, "Please select the Business!");
            };

            $scope.Add_Menu_Item_OPENMODAL = (index, id, headerId, category) => {
                $scope.categoryDashSublineIncludes = (category == "Breakfast" || category == "Breakfast Special" ? ["Breakfast", "Breakfast Special"] :
                category == "Lunch" || category == "Lunch Special" ? ["Lunch", "Lunch Special"] : category == "Dinner" || category == "Dinner Special" ? ["Dinner", "Dinner Special"] :
                    category == "Allday" || category == "Allday Special" ? ["Allday", "Allday Special"] : "");
                if (id) {
                    $(`#addItem_${id}`).html('<i class="fas fa-spinner fa-spin"></i> &nbsp; Add Item').prop('disabled', true);
                    MealsDashLine.findById({ id }).$promise.then((res) => {
                        MealsCategory.findOne({ filter : { where : { id : res.mealsCategoryId } } }).$promise.then((categoryRes) => {
                            $scope.mealsItemDashLineObj = res;
                            if (res && res.length)  $scope.mealsDashLineDays = res[0];
                            $scope.mealscategoryDashLineDays = categoryRes;
                            localStorage.removeItem("add_Meals_Item_id");
                            localStorage.setItem('add_Meals_Item_id', JSON.stringify({ id , menuHeaderId : headerId }));
                            $("#meals_menu_item_modal").attr('onclick', `Save_Menu_Header_Clk('${index}','${id}','${headerId}')`);
                            $("#mealsMenuItem").modal({ backdrop: 'static', keyboard: false });
                            $(`#addItem_${id}`).html('<i class="fas fa-plus"></i> &nbsp; Add Item').prop('disabled', false);
                        });
                    }, () => { });
                } else toastMsg(false, "Please try again!");
            };


            $scope.meals_add_on_Header_clk = (i, id) => {
                if (id) {
                    $(`#header_level_addons_${id}`).html('<i class="fas fa-spinner fa-spin"></i> Add-ons').prop('disabled', true);
                    $scope.getAddonsLineLevel(id);
                    $("#modal_Add_header_ons_add_btn").attr(`onclick`, `addOnsModelHeaderClk('${i}','${id}')`);
                    $('#meals_Add_Ons_Line_Level').modal({ backdrop: 'static', keyboard: false });
                    $(`#header_level_addons_${id}`).html('<i  class="fas fa-puzzle-piece"></i> Add-ons').prop('disabled', false);
                } else toastMsg(false, "Please try again!");
            };


            $scope.addMealsItems = () => {
                let { id , menuHeaderId } = JSON.parse(localStorage.getItem('add_Meals_Item_id'));
                console.log(id, menuHeaderId);
                if (id) {


                    $scope.meals = {};

                    let monday = tuesday = wednesday = thursday = friday = saturday = sunday = false;
                    $scope.meals = { categories: [] };

                    $(".meals-menu-item-for-week-days.checked").each(function () {
                        if ($(this).data('value') == 'monday') monday = true;
                        if ($(this).data('value') == 'tuesday') tuesday = true;
                        if ($(this).data('value') == 'wednesday') wednesday = true;
                        if ($(this).data('value') == 'thursday') thursday = true;
                        if ($(this).data('value') == 'friday') friday = true;
                        if ($(this).data('value') == 'saturday') saturday = true;
                        if ($(this).data('value') == 'sunday') sunday = true;
                    });


                    $(".meals_menu_Item_radio_Create.checked").each(function () {
                        if ($(this).data('shortname') == 'breakfast') { $scope.meals.inAppSpecial = false; $scope.meals.isAvailable = true; }
                        else if ($(this).data('shortname') == 'breakfastSpecial') { $scope.meals.inAppSpecial = false; $scope.meals.isAvailable = false; }
                        else if ($(this).data('shortname') == 'lunch') { $scope.meals.inAppSpecial = false; $scope.meals.isAvailable = true; }
                        else if ($(this).data('shortname') == 'lunchSpecial') { $scope.meals.inAppSpecial = false; $scope.meals.isAvailable = false; }
                        else if ($(this).data('shortname') == 'dinner') { $scope.meals.inAppSpecial = false; $scope.meals.isAvailable = true; }
                        else if ($(this).data('shortname') == 'dinnerSpecial') { $scope.meals.inAppSpecial = false; $scope.meals.isAvailable = false; }
                        else if ($(this).data('shortname') == 'allday') { $scope.meals.inAppSpecial = false; $scope.meals.isAvailable = true; }
                        else if ($(this).data('shortname') == 'alldaySpecial') { $scope.meals.inAppSpecial = false; $scope.meals.isAvailable = false; }
                        $scope.meals.categories.push({ [$(this).data('shortname')]: true, id: $(this).data('id'), value: $(this).data('shortname'), menuHeaderId });
                    });

                    $scope.meals.price = $(`#meals_price_MenuItem`).val();
                    $scope.meals.specialPrice = $(`#meals_special_price_MenuItem`).val();
                    $scope.meals.menu = $(`#meals_menu_MenuItem`).val(); if ($(`#meals_menu_MenuItem`).val()) $scope.meals.menuId = $.trim($(`#meals_menu_MenuItem`).val().toCamelCase());
                    $scope.meals.monday = monday; $scope.meals.tuesday = tuesday; $scope.meals.wednesday = wednesday; $scope.meals.thursday = thursday;
                    $scope.meals.friday = friday; $scope.meals.saturday = saturday; $scope.meals.sunday = sunday;

                    if ($scope.meals.menu) $scope.meals.menu = ($scope.meals.menu).camelCase();
                    $scope.meals.ingredients = $(`#meals_ingredients_MenuItem`).val();
                    if ($scope.meals.ingredients) $scope.meals.ingredients = ($scope.meals.ingredients).camelCase();

                    $scope.meals.mealsDashLineId = id;
                    $scope.meals.ownerId = $scope.userId;
                    $(`#meals_price_MenuItem_Error`).text('');
                    $(`#meals_ingredients_Error_MenuItem,#meals_menu_Error_MenuItem`).css({ display: "none" });

                    if ($scope.meals.price) {
                        if ($scope.meals.menu) {
                            if ($scope.meals.ingredients) {
                                $(`#meals_menu_item_modal`).html('<i class="fas fa-spinner fa-spin"></i> Submit').prop('disabled', true);
                                $scope.meals.addons = [];
                                $scope.meals.addons = $scope.addonsItemArray;

                                MealsDashSubLine.createAndUpdate({ details: $scope.meals }).$promise.then((res) => {
                                    if (res && res.data.isSuccess) {
                                        $scope.getMealsHeader();
                                        $("#meals_price_MenuItem,#meals_menu_MenuItem,#meals_ingredients_MenuItem").val('');
                                        $(`#meals_menu_item_modal`).html('<i class="fas fa-plus"></i> Submit').prop('disabled', false);
                                        $("#mealsMenuItem").modal('hide');
                                        $scope.addonsItemArray = []; $scope.meals = {};
                                        $('.itemaddonstable').css({ display: 'none' });
                                        $("#addons-item").empty();
                                        toastMsg(true, 'Successfully added!');
                                    }
                                }, (err)=>{
                                    console.log(JSON.stringify(err));
                                    $("#meals_price_MenuItem,#meals_menu_MenuItem,#meals_ingredients_MenuItem").val('');
                                    $(`#meals_menu_item_modal`).html('<i class="fas fa-plus"></i> Submit').prop('disabled', false);
                                    $("#mealsMenuItem").modal('hide');
                                    $scope.addonsItemArray = []; $scope.meals = {};
                                    $('.itemaddonstable').css({ display: 'none' });
                                    $("#addons-item").empty();
                                    toastMsg(false, 'Please try again!');
                                });

                            } else $(`#meals_ingredients_Error_MenuItem`).css({ display: "block" });
                        } else $(`#meals_menu_Error_MenuItem`).css({ display: "block" });
                    } else $(`#meals_price_MenuItem_Error`).text('Price is required!');
                } else toastMsg(false, 'Please try again');
            };

            $scope.addOnsHeaderLineLevelList = [];
            $scope.getAddonsLineLevel = (mealsDashLineId) => {
                if (mealsDashLineId) {
                    MealsDashLineAddons.find({ filter: { where: { mealsDashLineId } } }).$promise.then((res) => {
                        $scope.addOnsHeaderLineLevelList = [];
                        if (res && res.length > 0) $scope.addOnsHeaderLineLevelList = res;
                    }, (err) => toastMsg(false, 'Please try again'));
                } else $scope.addOnsHeaderLineLevelList = [];
            };

            $scope.AddonsAddHeaderLevel = (i, mealsDashLineId) => {
                if (mealsDashLineId) {
                    let desc = $(`#meals_header_desc_ADD_ONS`).val(), price = $(`#meals_header_price_ADD_ONS`).val(), isTrue = true;
                    $("#meals_header_price_Error_ADD_ONS,#meals_header_desc_Error_ADD_ONS").hide();
                    if (!desc) {
                        isTrue = false;
                        $("#meals_header_desc_Error_ADD_ONS").show();
                    }
                    if (!price) {
                        isTrue = false;
                        $("#meals_header_price_Error_ADD_ONS").show();
                    }
                    if (isTrue) {
                        $(`#modal_Add_header_ons_add_btn`).html('<i class="fas fa-spinner fa-spin"></i> Add').prop('disabled', true);
                        MealsDashLineAddons.upsertWithWhere({ where: { price, desc, mealsDashLineId } }, { price, desc, mealsDashLineId }).$promise.then((res) => {
                            toastMsg(true, 'Add-ons successfully added!');
                            $(`#meals_header_desc_ADD_ONS,#meals_header_price_ADD_ONS`).val(null);
                            $scope.getAddonsLineLevel(mealsDashLineId);
                            $(`#modal_Add_header_ons_add_btn`).html('<i class="fas fa-plus"></i> Add').prop('disabled', false);
                            MealsDashLineAddons.CreateAndUpdate({ details: { mealsDashLineId, price, desc, ownerId: $scope.userId } }).$promise.then((mealsRes) => {
                                console.log(JSON.stringify(mealsRes));
                            });
                        }, (err) => toastMsg(false, 'Please try again'));
                    } else toastMsg(false, 'Please try again');
                } else toastMsg(false, 'Please try again');
            };

            $scope.meals_addons_L_Level_delete_Clk = (id, parentId) => {
                let deleteObj = {};
                if (id) {
                    $(`#menu_header_addons_delete_${id}`).html('<i class="fas fa-spinner fa-spin"></i> Delete').prop('disabled', true);
                    MealsDashLineAddons.find({ filter: { where: { id } } }).$promise.then((res) => {
                        MealsDashLineAddons.deleteById({ id }).$promise.then((deleteRes) => {
                            if (deleteRes && deleteRes.count == 1) {
                                toastMsg(true, 'Add-ons successfully deleted!');
                                $scope.getAddonsLineLevel(parentId);
                            }
                        }, (err) => toastMsg(false, 'Please try again'));
                        if (res && res.length > 0) {
                            deleteObj = res[0];
                            deleteObj.mealsDashLineId = parentId;
                            MealsExtraDashLine.removeAddons({ details: deleteObj });
                        }
                    });
                } else toastMsg(false, 'Please try again');
            };

            $scope.mealsHeaderEdit = (i, id) => {
                if (id) {
                    let value = ($(`#sub_menu_header_${id}`).data('submenuheader')).trim();
                    $(`#sub_menu_header_${id}`).html(`<div class="form-group"  style="margin-bottom: 0px;">
                <input type="text" class="form-control" id="menuHeader_edit_${id}" style="border: 1px solid #fff!important; background-color: #f3f3f4!important;margin-top: -1.5px;color: #0a0a0a!important;height: 24px;" value="${value}" id="usr">
              </div>`);
                    $(`#meals_menuHeader_edit_Btn_${id}`).hide();
                    $(`#meals_menuHeader_update_Btn_${id}`).show();
                } else toastMsg(false, 'Please try again');
            };

            $scope.mealsHeaderUpdate = (i, id) => {
                let menuHeaderId = menuHeader = ($(`#menuHeader_edit_${id}`).val()).trim();
                if (menuHeaderId) {
                    menuHeaderId = menuHeaderId.toCamelCase();
                    $(`#sub_menu_header_${id}`).attr('data-submenuheader', menuHeaderId);
                    $("#menuManager").css({ "opacity": "0.1" });
                    MealsDashLine.upsertWithWhere({ where: { id } }, { menuHeaderId, menuHeader }).$promise.then((res) => {
                        toastMsg(true, 'Successfully Updated!');
                        $scope.getMealsHeader();
                        setTimeout(function () { $("#menuManager").css({ "opacity": "" }); }, 1000)
                    }, (err) => toastMsg(false, 'Please try again'));
                    $(`#sub_menu_header_${id}`).html(`<i class="fas fa-utensils"></i><span>&nbsp; ${menuHeader} </span>`);
                    $(`#meals_menuHeader_edit_Btn_${id}`).show();
                    $(`#meals_menuHeader_update_Btn_${id}`).hide();
                } else toastMsg(false, 'Please try again');
            };

            $scope.mealsHeaderDelete = (i, id) => {
                if (id) {
                    $scope.mealsIndex = i;
                    $(`#menu_header_delete_${id}`).html('<i class="fas fa-spinner fa-spin"></i> Delete').prop('disabled', true);
                    MealsDashLine.menuHeaderRemove({ details: { id } }).$promise.then((res) => {
                        if (res.data.isSuccess) {
                            $scope.getMealsHeader();
                            toastMsg(true, 'Successfully Deleted!');
                        } else toastMsg(false, 'Not Deleted.Please try again');
                    }, (err) => toastMsg(false, 'Please try again!'));
                } else toastMsg(false, 'Please try again!');
            };

            $scope.addOnsList = [];
            $scope.getAddonsItem = (mealsDashSubLineId) => {
                if (mealsDashSubLineId) {
                    MealsExtraDashLine.find({ filter: { where: { mealsDashSubLineId } } }).$promise.then((res) => {
                        $scope.addOnsList = [];
                        if (res && res.length > 0) $scope.addOnsList = res;
                    });
                }
            };

            $scope.meals_add_on_Modal_click = (i, id) => {
                if (id) {
                    $(`#item_level_addons_${id}`).html('<i class="fas fa-spinner fa-spin"></i> Add-ons').prop('disabled', true);
                    MealsExtraDashLine.find({ filter: { where: { mealsDashSubLineId: id } } }).$promise.then((res) => {
                        $scope.addOnsList = res;
                        $("#modal_Add_ons_add_btn").attr(`onclick`, `addOnsModelClk('${i}','${id}')`);
                        $('#meals_Add_ons_MODAL').modal({ backdrop: 'static', keyboard: false });
                        $(`#item_level_addons_${id}`).html('<i  class="fas fa-puzzle-piece"></i> Add-ons').prop('disabled', false);
                    }, (err) => { toastMsg(false, 'Please try again!'); });

                } else toastMsg(false, 'Please try again!');
            };

            $scope.addMealsSubMenuHeader = (i, mealsDashSubLineId) => {

                let desc = $(`#meals_sub_menu_header_ADD_ONS`).val(), price = $(`#meals_sub_menu_price_ADD_ONS`).val(), isTrue = true;
                $("#meals_sub_menu_header_Error_ADD_ONS,#meals_sub_menu_price_Error_ADD_ONS").hide();
                if (!desc) {
                    isTrue = false;
                    $("#meals_sub_menu_header_Error_ADD_ONS").show();
                }
                if (!price) {
                    isTrue = false;
                    $("#meals_sub_menu_price_Error_ADD_ONS").show();
                }

                if (isTrue) {
                    if (mealsDashSubLineId) {
                        $(`#modal_Add_ons_add_btn`).html('<i class="fas fa-spinner fa-spin"></i> Add').prop('disabled', true);
                        MealsExtraDashLine.create({ mealsDashSubLineId, desc, price }).$promise.then((res) => {
                            $(`#meals_sub_menu_header_ADD_ONS,#meals_sub_menu_price_ADD_ONS`).val(null);
                            $scope.getAddonsItem(mealsDashSubLineId);
                            $(`#modal_Add_ons_add_btn`).html('<i class="fas fa-plus"></i> Add').prop('disabled', false);
                            toastMsg(true, 'Addons successfully Added!');
                        }, (err) => {
                            $(`#modal_Add_ons_add_btn`).html('<i class="fas fa-plus"></i> Add').prop('disabled', false);
                            toastMsg(true, 'Please try again');
                        });
                    } else toastMsg(true, 'Please try again');
                }
            };

            $scope.mealsItemDelete = (i, id) => {
                if (id) {
                    $(`#menu_item_delete_${id}`).html('<i class="fas fa-spinner fa-spin"></i> Delete').prop('disabled', true);
                    MealsDashSubLine.destroyById({ id }).$promise.then((res) => {
                        if (res.count == 1) {
                            toastMsg(true, 'Successfully Deleted!');
                            $scope.getMealsHeader();
                            $scope.mealsIndex = i;
                        } else toastMsg(false, 'Not Delete.Please try again!');
                        $(`#menu_item_delete_${id}`).html('<i class="far fa-trash-alt"></i> Delete').prop('disabled', true);
                    });
                } else toastMsg(false, 'Please try again');
            };


            $scope.mealsItemsEdit = (i, id, headerId) => {
                if (id) {
                    $(`#melas_items_editBtn_${id}_${i}`).html('<i class="fas fa-spinner fa-spin"></i> Update').prop('disabled', true);
                    $(`#melas_items_editBtn_${id}_${i}`).css('display', 'none');
                    $(`#melas_items_saveBtn_${id}_${i}`).css('display', 'block');
                    $('#meals_header_table_' + headerId + ' tbody tr:nth-child(' + (i + 1) + ') td').each((e, v) => {
                        var html = '';
                        if ($(v).data('name') === 'price') {
                            html = `<div class="form-group" style = "margin-bottom: 0px !important;" > <input id="meals_item_price_edit_${i}_${id}" class="form-control" type="text" name="price" value="${$.trim($(v).html())}" placeholder="Price"> </div>`;
                            $(v).html('');
                            $(v).append(html);
                        }
                        if ($(v).data('name') === 'menu') {
                            html = `<div class="form-group" style = "margin-bottom: 0px !important;" > <input id="meals_item_menu_edit_${i}_${id}" class="form-control" type="text" name="menu" value="${$.trim($(v).html())}" placeholder="Menu"> </div>`;
                            $(v).html('');
                            $(v).append(html);
                        }
                        if ($(v).data('name') === 'ingredients') {
                            html = `<div class="form-group" style = "margin-bottom: 0px !important;" > <input id="meals_item_ingredients_edit_${i}_${id}" class="form-control" type="text" name="ingredients" value="${$.trim($(v).html())}" placeholder="ingredients"> </div>`;
                            $(v).html('');
                            $(v).append(html);
                        }
                    });
                    $(`#melas_items_editBtn_${id}_${i}`).html('<i class="far fa-edit"></i> Update').prop('disabled', false);
                }
            };

            $scope.mealsItemUpdate = (i, id, parentIndex) => {
                if (id) {
                    $scope.mealsIndex = parentIndex;
                    $(`#melas_items_editBtn_${id}_${i}`).css('display', 'block');
                    $(`#melas_items_saveBtn_${id}_${i}`).css('display', 'none');
                    $scope.meals = {};
                    $scope.meals.price = $.trim($(`#meals_item_price_edit_${i}_${id}`).val());
                    if ($scope.meals.price) $scope.meals.price = (parseFloat($scope.meals.price)).toFixed(2);

                    $scope.meals.menu = $.trim($(`#meals_item_menu_edit_${i}_${id}`).val());
                    if ($scope.meals.menu) $scope.meals.menu = ($scope.meals.menu).camelCase();

                    $scope.meals.ingredients = $.trim($(`#meals_item_ingredients_edit_${i}_${id}`).val());
                    if ($scope.meals.ingredients) $scope.meals.ingredients = ($scope.meals.ingredients).camelCase();

                    $(`#melas_items_editBtn_${id}_${i}`).html('<i class="fas fa-spinner fa-spin"></i> Update').prop('disabled', true);
                    MealsDashSubLine.upsertWithWhere({ where: { id } }, $scope.meals).$promise.then((res) => {
                        $(`#melas_items_editBtn_${id}_${i}`).html('<i class="far fa-edit"></i> Edit').prop('disabled', false);
                        toastMsg(true, 'Successfully Updated!.');
                    }, (err) => {
                        $(`#melas_items_editBtn_${id}_${i}`).html('<i class="far fa-edit"></i> Edit').prop('disabled', false);
                        toastMsg(false, 'Please try again');
                    });

                    $('#meals_header_table_' + parentIndex + ' tbody tr:nth-child(' + (i + 1) + ') td').each((e, v) => {
                        if ($(v).data('name') === 'price') {
                            $(v).html(''); $(v).append($scope.meals.price);
                        }
                        else if ($(v).data('name') === 'menu') {
                            $(v).html(''); $(v).append($scope.meals.menu);
                        }
                        else if ($(v).data('name') === 'ingredients') {
                            $(v).html(''); $(v).append($scope.meals.ingredients);
                        }
                    });
                }
            };


            $scope.addons_Edit_Meals = (e) => {
                if (e) {
                    let id = $(e).data('i'), i = $(e).data('index');
                    $(`#meals_menuHeader_edit_Btn_${id}`).hide();
                    $(`#meals_menuHeader_update_Btn_${id}`).show();
                    $(`#add_ons_table_meals tbody tr:nth-child(${(i + 1)}) td`).each((e, v) => {
                        var html = '';
                        if ($(v).data('price') === 'price') {
                            html = `<div class="form-group" style = "margin-bottom: 0px !important;" > <input id="meals_addons_price_edit_${id}" class="form-control" type="number" name="price" value="${($(v).html().trim()).camelCase()}" placeholder="Price"> </div>`;
                            $(v).html('');
                            $(v).append(html);
                        }
                        if ($(v).data('desc') === 'desc') {
                            html = `<div class="form-group" style = "margin-bottom: 0px !important;" > <input id="meals_addons_desc_edit_${id}" class="form-control" type="text" name="price" value="${($(v).html().trim()).camelCase()}" placeholder="Price"> </div>`;
                            $(v).html('');
                            $(v).append(html);
                        }
                    });
                }
            };

            $scope.addons_Update_Meals = (e) => {
                if (e) {
                    let id = $(e).data('i'), i = $(e).data('index');
                    $(`#meals_menuHeader_edit_Btn_${id}`).show();
                    $(`#meals_menuHeader_update_Btn_${id}`).hide();
                    $scope.addons = {};
                    $scope.addons.price = $(`#meals_addons_price_edit_${id}`).val();
                    $scope.addons.desc = $(`#meals_addons_desc_edit_${id}`).val();

                    $(`#meals_addons_price_edit_${id}`).html('<i class="fas fa-spinner fa-spin"></i> Update').prop('disabled', true);
                    MealsExtraDashLine.upsertWithWhere({ where: { id } }, $scope.addons).$promise.then((res) => {
                        if (res) {
                            toastMsg(true, 'Addons Successfully updated!.');
                            $(`#meals_addons_price_edit_${id}_${i}`).html('<i class="far fa-edit"></i> Edit').prop('disabled', false);
                        }
                    }, (err) => {
                        toastMsg(false, 'Please try again!');
                        $(`#meals_addons_price_edit_${id}_${i}`).html('<i class="far fa-edit"></i> Edit').prop('disabled', false);
                    });


                    $(`#add_ons_table_meals tbody tr:nth-child(${(i + 1)}) td`).each((e, v) => {
                        if ($(v).data('price') === 'price') {
                            $(v).html(''); $(v).append($scope.addons.price);
                        }
                        if ($(v).data('desc') === 'desc') {
                            $(v).html(''); $(v).append($scope.addons.desc);
                        }
                    });
                }
            };


            $('.itemaddonstable').css({ display: 'none' });

            $scope.addonsItemArray = [];
            $scope.addAddonsToArray = () => {
                let isVaild = true, addOnsItem = {}; $("#header_level_price_addons_special_error,#header_level_desc_addons_special_addons_err").css({ display: "none" });

                addOnsItem = { price: $("#header_level_price_addons_special").val(), desc: $("#header_level_desc_addons_special").val() }
                if (!$("#header_level_price_addons_special").val()) {
                    isVaild = false;
                    $("#header_level_price_addons_special_error").css({ display: "block" });
                }
                if (!$("#header_level_desc_addons_special").val()) {
                    isVaild = false;
                    $("#header_level_desc_addons_special_addons_err").css({ display: "block" });
                }
                if (isVaild) {
                    $scope.addonsItemArray.push(addOnsItem);
                }
                let tr = '', i = 0;
                for (let addons of $scope.addonsItemArray) {
                    i++;
                    tr += `<tr><td> ${addons.price} </td><td>${addons.desc}</td>
                    <td>
                    <button type="button" id="addons_item_edit_Btn_${i}" onclick="addons_item_edit_fun(this)"
                                            data-i="${i}" data-index="${i}" name="delete" title="Delete" class="btn btn-primary"
                                            style="background-color: #2084c6 !important;padding:4px 13px !important;">
                                            <i class="fas fa-pencil-alt"></i> &nbsp;Edit
                                          </button>
                    </td><td>
                    <button type="button" data-addonsid="${i}"
                    data-parentid="${i}"
                    id="addons_delete_btn_${i}"
                    onclick="addons_delete_fun(this)" name="delete"
                    title="Delete" class="btn btn-primary">
                    <i class="far fa-trash-alt"
                        aria-hidden="true"></i>&nbsp;Delete
                </button>
                    </td></tr>`
                }
                if ($scope.addonsItemArray && $scope.addonsItemArray.length) {
                    $('.itemaddonstable').css({ display: 'block' });
                    $("#header_level_price_addons_special,#header_level_desc_addons_special").val('')
                    $("#addons-item").empty();
                    $("#addons-item").append(tr)
                }
            }

            $scope.itemLevelInappSpecial = (arg) => {
                let menuid = $(arg).data('menuid'), isTrue = $(arg).hasClass('checked'), shortname = $(arg).data('shortname'), category = $(arg).data('category'),
                    menuheaderid = $(arg).data('menuheaderid');
                if (menuid) {
                    loader.visible();
                    MealsDashSubLine.inAppSpecialUpdate({ params: { menuid, isTrue, shortname, category, menuheaderid, ownerId: $scope.userId } }).$promise.then((res) => {
                        setTimeout(function () { loader.hidden(); }, 2600);
                        setTimeout(function () { $scope.getMealsHeader() }, 2500);
                        let index = $(arg).data('index');
                        if(index && index) { $scope.menuParentI = index[0]; $scope.menuChildI = index[1]; }
                    }, () => { loader.hidden(); })
                } else toastMsg(false, 'Please try again!');
            }

            $scope.itemChgAvailableUpdate = (arg) => {
                let isTrue = $(arg).hasClass('checked'),
                id = $(arg).attr('id'),
                 index = $(arg).data('index');
                if(index && index) { $scope.menuParentI = index[0]; $scope.menuChildI = index[1]; }
                if(id){
                    MealsDashSubLine.upsertWithWhere({ where : { id } }, { isAvailable : isTrue });
                } else toastMsg(false, 'Please try again!');
            };

            $scope.headerAddonsStausChng = (arg) => {
                let id = $(arg).data('id'), isTrue = $(arg).hasClass('checked'), category = $(arg).data('category'), categories, menuHeader = $(arg).data('menuheader');
                if (category == "Lunch Special") { categories = [{ menuHeader, category: "Lunch Special" }, { menuHeader, category: "Lunch" }] }
                else if(category == "Dinner Special") { categories = [{ menuHeader, category: "Dinner Special" }, { menuHeader, category: "Dinner" }] }
                else if(category == "Breakfast Special") { categories = [{ menuHeader, category: "Breakfast Special" }, { menuHeader, category: "Breakfast" }] }
                else if(category == "Allday Special") { categories = [{ menuHeader, category: "Allday Special" }, { menuHeader, category: "Allday" }] }
                if (id) {
                    let index = $(arg).data('index');
                    $scope.menuParentI = index[0]; $scope.menuChildI = index[1];
                    loader.visible();
                    MealsDashLine.updateInAppSpecialHeaderLevel({ params: { id, isTrue, categories } }).$promise.then((res) => {
                        $scope.getMealsHeader();
                        toastMsg(true, 'Successfully updated!');
                        setTimeout(function () { loader.hidden(); }, 500);
                    }, () => { loader.hidden(); })
                } else toastMsg(false, 'Please try again!');
            }

            $scope.mealsMenuHeaderDaysUpdate = (id, day, value) => {
                if (id) {
                    MealsDashLine.upsertWithWhere({ where: { id } }, { [day]: value });
                    MealsDashLine.findOne({ filter: { where: { id } } }).$promise.then((res) => {
                        let category;
                        if (res.category == 'Lunch Special') {
                            value = (value ? false : true); category = "Lunch";
                        } else if (res.category == 'Dinner Special') {
                            value = (value ? false : true); category = "Dinner";
                        } else if (res.category == 'Allday Special') {
                            value = (value ? false : true); category = "Allday";
                        } else if (res.category == 'Break Special') {
                            value = (value ? false : true); category = "Allday";
                        }
                        MealsDashLine.upsertWithWhere({ where : { category , menuHeaderId : res.menuHeaderId } }, { [day]: value })
                    })
                }
            };

            $scope.mealsItemDaysUpdate = (id, day, value, mealsDashLineId) => {
                if (id)  MealsDashLine.itemLevelDaysUpdate({ params : { id, day , value , mealsDashLineId  , ownerId : $scope.userId } });
            };

            $scope.updateMenuHeaderRefresh = () =>{
                $("#menuManager").css('opacity', '0.2');
                $scope.getMealsHeader();
                setTimeout(function() {
                    toastMsg(true, 'Successfully Updated!');
                    $("#menuManager").css('opacity', '');
                },500);
            };

            $scope.setIndex = (i, j) =>{
                $scope.menuParentI = i; $scope.menuChildI = j;
            };

            $scope.deleteMealsCategory = (i, category) => {
                let categoryName = category.category, id = category.id;
                $(`#_delete_menuHeader_${category.id}`).html('<i class="fas fa-spinner fa-spin"></i>').prop('disabled', true);
                MealsCategory.deleteCategory({ details: { category: categoryName, id, ownerId: $scope.userId } }).$promise.then((res) => {
                    setTimeout(function () { toastMsg(true, 'Successfully Deleted!'); $scope.getMealsHeader(); }, 500);
                });
            };
        }]);