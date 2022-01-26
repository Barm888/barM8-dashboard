angular
    .module('app')
    .controller('createbistroHourCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'BistroHours', 'loader', 'getAllVenues',
        function ($scope, $state, $rootScope, Business, $http, BistroHours, loader, getAllVenues) {

            toastMsg = (isVaild, msg) => {
                if (isVaild) toastr.success(msg);
                else toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.daysSelected = (arg, day, sday) => {
                if ($(`#${arg}${day}`).attr('data-selected') == "true")
                    $(`#${arg}${day}`).attr('data-selected', false).addClass('btnBeforemenu').removeClass('btnAfterMenu').css({ 'background-color': '#757575' }).html(`${sday}`);
                else
                    $(`#${arg}${day}`).attr('data-selected', true).css({ 'background-color': '#4caf50' }).removeClass('btnBeforemenu').addClass('btnAfterMenu').html(`<i class="fas fa-check"></i> ${sday}`);
            }

            $scope.showTheMiddle = (event, i) => {
                $(`.middle_${i}`).css({ 'display': 'block', 'position': 'absolute', 'right': '2%' });
            }
            $scope.hiddenTheMiddle = (i) => {
                $(`.middle_${i}`).css({ 'display': 'none' })
            }


            $scope.initCall = () => {
                $scope.menus = [{ "name": "Breakfast", disabled: false },
                { "name": "Brunch", disabled: false },
                { "name": "Lunch", disabled: false },
                { "name": "Dinner", disabled: false },
                { "name": "Allday", disabled: false },
                { "name": "Late Night", disabled: false },
                { "name": "Bar Food", disabled: false },
                { "name": "Takeaway", disabled: false }];


                $scope.days = [{ name: 'Sun', day: 'Sunday', isSeleced: false, val: 'sunday' },
                { name: 'Mon', day: 'Monday', isSeleced: false, val: 'monday' },
                { name: 'Tue', day: 'Tuesday', isSeleced: false, val: 'tuesday' },
                { name: 'Wed', day: 'Wednesday', isSeleced: false, val: 'wednesday' },
                { name: 'Thu', day: 'Thursday', isSeleced: false, val: 'thursday' },
                { name: 'Fri', day: 'Friday', isSeleced: false, val: 'friday' },
                { name: 'Sat', day: 'Saturday', isSeleced: false, val: 'saturday' }];


            }
            $scope.initCall();

            $scope.bistros = [];
            $scope.getBistroData = () => {
                try {
                    loader.visible();
                    BistroHours.find({ "filter": { "where": { "ownerId": $scope.userId }, order: 'order asc', } }).$promise.then((res) => {

                        $scope.bistros = res;

                        setTimeout(function () {
                            loader.hidden();
                        }, 300);
                    }, function (err) {
                        toastMsg(false, 'Bistro hour not created.');
                    });
                } catch (e) { }
            };



            $scope.getMenus = (menu) => {
                loader.visible();
                try {
                    BistroHours.findOne({ filter: { where: { ownerId: $scope.userId, menu } } })
                        .$promise.then((res) => {

                            $scope.days = [];
                            $scope.days = [{ day: 'Sunday', isSeleced: false, val: 'sunday', name: 'Sun' }, { day: 'Monday', isSeleced: false, val: 'monday', name: 'Mon' },
                            { day: 'Tuesday', isSeleced: false, val: 'tuesday', name: 'Tue' }, { day: 'Wednesday', isSeleced: false, val: 'wednesday', name: 'Wed' },
                            { day: 'Thursday', isSeleced: false, val: 'thursday', name: 'Thu' }, { day: 'Friday', isSeleced: false, val: 'friday', name: 'Fri', },
                            { day: 'Saturday', isSeleced: false, val: 'saturday', name: 'Sat' }]

                            for (let k in res) {
                                let i = $scope.days.findIndex(m => m.val == k);
                                try {
                                    if (res[k].startTime && res[k].endTime) {
                                        $scope.days[i].isSeleced = true;
                                        $scope.days[i].time = `<div style="text-align:center;"><b>${$scope.days[i].day}</b><p>${res[k].startTime} - ${res[k].endTime}</p></div>`;
                                        $scope.days[i].isSeleced = true;
                                    } else $scope.days[i].time = `<div><b>${$scope.days[i].day}</b></div>`;
                                } catch (e) {

                                }
                            }
                            setTimeout(function () {
                                loader.hidden();
                            }, 300);
                        }, () => {
                            setTimeout(function () {
                                loader.hidden();
                            }, 200);
                        })
                } catch (e) { }

            }

            $scope.deleteBistroHours = (id) => {
                if (id) {
                    localStorage.removeItem('delete_id_Bis_hou');
                    localStorage.setItem('delete_id_Bis_hou', JSON.stringify({ id }));
                    $("#deleteConfirm").modal('show');
                } else toastMsg(false, 'Please try again!');
            }

            $scope.confirmDelete = () => {
                if (localStorage.getItem('delete_id_Bis_hou')) {
                    var ids = JSON.parse(localStorage.getItem('delete_id_Bis_hou'));
                    if (ids.id) {
                        loader.visible();
                        BistroHours.removeOldData({ params: { id: ids.id } }).$promise.then(() => {
                            $scope.getBistroData();
                            setTimeout(function () {
                                loader.hidden();
                                $("#deleteConfirm").modal('hide');
                                toastMsg(true, 'Successfully deleted');
                            }, 300)
                        })
                    }
                }
            }

            $scope.isBusinessSelect = false;

            const convertTime12to24 = (time12h) => moment(time12h, 'hh:mm A').format('HH:mm');


            $scope.times = [];
            $scope.addTime = () => {
                loader.visible();
                let menu = $("#selectedMenu").val();
                let startTime, endTime;
                startTime = $(`#_start_time`).val();
                endTime = $(`#_end_time`).val();
                let startHour, startMinute;
                let endHour, endMinute;
                if (startTime) {
                    let sTime = convertTime12to24(startTime);
                    startHour = sTime.split(':')[0];
                    startMinute = sTime.split(':')[1];
                }
                if (endTime) {
                    let eTime = convertTime12to24(endTime);
                    endHour = eTime.split(':')[0];
                    endMinute = eTime.split(':')[1];
                }
                $('[name="days"]:checked').each(function () {
                    let data = $scope.times.find(m => m.menu == menu && m.day == $(this).val());
                    let day = $(this).val().toString().toLowerCase();
                    if (data && data.startTime && data.endTime) {
                        toastMsg(false, 'Already added!');
                    } else $scope.times.push({ menu, startTime, startHour, startMinute, endTime, endHour, endMinute, ownerId: $scope.userId, day })
                });
                setTimeout(function () {
                    $('[name="days"]:checked').each(function () {
                        $(this).prop('checked', false);
                    });
                    $(`#_start_time,#_end_time`).val('');
                    loader.hidden();
                }, 200);
            }

            function toTitleCase(str) {
                var lcStr = str.toLowerCase();
                return lcStr.replace(/(?:^|\s)\w/g, function (match) {
                    return match.toUpperCase();
                });
            }

            $scope.bistroHours = [];
            $scope.createBistro = () => {

                var startTime = $.trim($("#_start_time").val()),
                    endTime = $.trim($("#_end_time").val());

                let createObj = {}, istrue = true;

                if ($('.btnAfterMenu').length == 0) {
                    istrue = false;
                    toastMsg(false, "Please select the days!");
                }

                if (startTime && endTime) {
                    $('.btnAfterMenu').each(function () {

                        let startConvert = (convertTime12to24(startTime)).split(':'),
                            endConvert = (convertTime12to24(endTime)).split(':');

                        let day = $(this).attr('data-dayname');

                        createObj[day] = {
                            startTime, "startHour": startConvert[0],
                            "startMinute": startConvert[1], endTime, "endHour": endConvert[0], "endMinute": endConvert[1]
                        }
                    });
                } else {
                    istrue = false;
                    toastMsg(false, "Start and end time is required!");
                }


                let menu = $("#selectedMenu").val();

                if (menu) createObj.menu = menu;
                else {
                    istrue = false;
                    toastMsg(false, "Menu is required!");
                }

                createObj.ownerId = $scope.userId;

                if (menu && createObj.ownerId) {
                    BistroHours.upsertWithWhere({ where: { menu, ownerId: createObj.ownerId } }, createObj).$promise.then(() => {
                        $('[name="days"]:checked').each(function () {
                            $(this).prop('checked', false);
                        });
                        $(`#_start_time,#_end_time`).val('');
                        toastMsg(true, "Successfully created!")
                        $scope.getBistroData();
                        $scope.initCall();
                        loader.hidden();
                    }, () => {
                        toastMsg(false, "Please try again!")
                        loader.hidden();
                    })
                }


            }

            $scope.updateiSLive = (id) => {
                if ($(`#isLive_${id}`).is(':checked')) {
                    loader.visible();
                    BistroHours.upsertWithWhere({ where: { id } }, { isAppLive: true }).$promise.then(() => {
                        setTimeout(function () {
                            loader.hidden();
                            toastMsg(true, "Successfully updated!");
                        }, 300);
                        $scope.getBistroData();
                    }, () => {
                        setTimeout(function () {
                            loader.hidden();
                            toastMsg(false, "Please try again!");
                        }, 300);
                    });

                } else {
                    loader.visible();
                    BistroHours.upsertWithWhere({ where: { id } }, { isAppLive: false }).$promise.then(() => {
                        setTimeout(function () {
                            loader.hidden();
                            toastMsg(true, "Successfully updated!");
                        }, 300);
                        $scope.getBistroData();
                    }, () => {
                        setTimeout(function () {
                            loader.hidden();
                            toastMsg(false, "Please try again!");
                        }, 300);
                    });
                }
            }

            $scope.useremail = $rootScope.currentUser.email;
            $scope.userId = "";
            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId) {
                    $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                    $scope.userId = $rootScope.selectedVenue.venueId;
                    $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.venueId)
                    if ($("#businessSubmit").hasClass('businessSubmit')) {
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    }
                    $scope.getBistroData();
                }
            }

            loader.visible()
            setTimeout(function () {
                $scope.businessSelection = getAllVenues.get();
                if ($scope.businessSelection && $scope.businessSelection.length == 0) {
                    setTimeout(function () {
                        $scope.businessSelection = getAllVenues.get();
                        loader.hidden();
                    }, 1000)
                } else {
                    loader.hidden();
                }
            }, 1000)

            $scope.getBusinessName = () => {
                return $scope.businessSelection;
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
                            // $scope.isBusinessSelect = true;
                            $scope.userId = arg;
                            $scope.getBistroData();
                            $scope.initCall();
                            let venueName = $.trim($("#autocompleteBusiness").val());
                            $rootScope.selectedVenue = { venueId: $scope.userId, ownerId: $scope.userId, venueName }
                            localStorage.removeItem("selectedVenue");
                            localStorage.setItem("selectedVenue", JSON.stringify($rootScope.selectedVenue));
                        }
                    } else {
                        $("#businessErr").text('Please select the Business name');
                    }
                }
            }

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

            if ($scope.userDetails.isAdmin == false) {
                // $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                // $("#autocompleteBusiness").attr('disabled', true);
                $scope.userId = $scope.userDetails.id;
                $scope.getBistroData();
                localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userDetails.id, ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
            }

        }])