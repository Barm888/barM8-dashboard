angular
    .module('app')
    .controller('openingHoursCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'WeeklyTiming', 'loader',
        function ($scope, $state, $rootScope, Business, $http, WeeklyTiming, loader) {

            $scope.mealsWeekDays = [{ name: 'Sun', txt: 'Sunday', val: 'sunday' }, { name: 'Mon', txt: 'Monday', val: 'monday' }, { name: 'Tue', txt: 'Tuesday', val: 'tuesday' },
            { name: 'Wed', txt: 'Wednesday', val: 'wednesday' }, { name: 'Thu', txt: 'Thursday', val: 'thursday' }, { name: 'Fri', txt: 'Friday', val: 'friday' },
            { name: 'Sat', txt: 'Saturday', val: 'saturday' }];

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.isBusinessSelect = false;

            $scope.weeklyTimingListD = [];
            $scope.getOpeningHours = () => {
                loader.visible();
                WeeklyTiming.find({ filter: { where: { ownerId: $scope.userId }, order: 'sequence asc' } }).$promise.then((res) => {
                    $scope.weeklyTimingListD = res;
                    setTimeout(function () {
                        loader.hidden();
                    }, 200);
                }, (err) => {
                    setTimeout(function () {
                        loader.hidden();
                    }, 200);
                });
            }

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            // if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                $scope.isBusinessSelect = true;
                Business.find({ filter: { where: { status: "active" }, "fields": ["businessName", "id", "email"] } }).$promise.then((res) => {
                    $scope.businessSelection = res;
                });
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
                $scope.getOpeningHours();
            }

            $scope.getBusinessName = () => {
                return $scope.businessSelection;
            };

            if ($scope.userDetails.isAdmin == false) {
                $scope.userId = $scope.userDetails.id;
                // $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                // $("#autocompleteBusiness").attr('disabled', true);
                localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userDetails.id, ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
                $scope.getOpeningHours();
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
                        $scope.getOpeningHours();
                        $rootScope.selectedVenue = { venueId: $scope.userId, ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                    }
                } else {
                    $("#businessErr").text('Please select the Business name');
                }
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

            $scope.weeklyDaysDelete = (id) => {
                loader.visible();
                if (id) {
                    WeeklyTiming.removeWeekly({ params: { id } }).$promise.then((res_1) => {
                        WeeklyTiming.find({ filter: { where: { ownerId: $scope.userId }, order: 'sequence asc' } }).$promise.then((res) => {
                            $scope.weeklyTimingListD = res;
                            setTimeout(function () {
                                loader.hidden();
                            }, 200);
                        }, (err) => {
                            setTimeout(function () {
                                loader.hidden();
                            }, 200);
                        });
                        toastMsg(true, "Successfully Deleted!");
                    }, function (err) {
                        toastMsg(false, "Please try again!");
                        loader.hidden();
                    })
                }
            };

            const convertTime12to24 = (time12h) => moment(time12h, 'hh:mm A').format('HH:mm');



            $scope.weeklyTimingList = []; $scope.weekArrayObj = [];
            $scope.addOpeningHoursTiming = () => {

                var startTime = $.trim($("#opening_hours_starttime").val()),
                    endTime = $.trim($("#opening_hours_endtime").val()),
                    sequence = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'Public Holiday'];

                $("#weeklystarttimingErr,#weeklyendtimingErr").text('');
                if ($scope.isBusinessSelect) {
                    var isTrue = true;
                    if (!startTime) {
                        $("#weeklystarttimingErr").text('Start time is required!');
                        isTrue = false;
                    }
                    if (!endTime) {
                        $("#weeklyendtimingErr").text('End time is required!');
                        isTrue = false;
                    }
                    if ($('.btnAfterMenu').length <= 0) {
                        toastMsg(false, "Please select the days!");
                        isTrue = false;
                    }

                    function toTitleCase(str) {
                        var lcStr = str.toLowerCase();
                        return lcStr.replace(/(?:^|\s)\w/g, function (match) {
                            return match.toUpperCase();
                        });
                    }

                    $scope.openingHoursData = [];
                    if (isTrue) {
                        loader.visible();
                        $('.btnAfterMenu').each(function (i, val) {
                            let startConvert = (convertTime12to24(startTime)).split(':'),
                                endConvert = (convertTime12to24(endTime)).split(':');
                            $scope.openingHoursData.push({
                                "day": toTitleCase($(val).data('dayname')), startTime, "startHour": startConvert[0],
                                "startMinute": startConvert[1], endTime, "endHour": endConvert[0], "endMinute": endConvert[1],
                                sequence: (sequence.findIndex(m => m == $(val).data('dayname'))) + 1,
                                "ownerId": $scope.userId
                            });
                        });
                        if ($scope.openingHoursData.length) {
                            WeeklyTiming.createAndUpdate({ params: { openingsHours: $scope.openingHoursData } })
                                .$promise.then((res) => {
                                    if (res.data.isSuccess) {
                                        setTimeout(function () {
                                            $scope.getOpeningHours();
                                            $('.oHoursDaysBtn').each(function (i, val) {
                                                let daysValues = $scope.mealsWeekDays.find(m => m.val == $(val).data('dayname'));
                                                $(val).attr('data-selected', false).addClass('btnBeforemenu').removeClass('btnAfterMenu').css({ 'background-color': '#757575' }).html(`${daysValues.name}`);
                                            });
                                            $("#opening_hours_starttime,#opening_hours_endtime").val('');
                                            $("#addOpeningHoursBtn").attr('disabled', false).css('pointer-events', '');
                                            toastMsg(true, "Successfully created!");
                                            loader.hidden();
                                        }, 500)
                                    } else {
                                        toastMsg(false, "Please try again!");
                                        loader.hidden();
                                    }
                                })
                        }
                    }
                }
                else toastMsg(false, "Please select the business!");
            };


            $scope.viewOpenHoursData = {};
            $scope.viewOpeningHours = (id) => {
                loader.visible();
                WeeklyTiming.find({ filter: { where: { id } } }).$promise.then((res) => {
                    if (res && res.length) {
                        $scope.viewOpenHoursData = res[0];
                        $('#viewPopup').modal({
                            backdrop: 'static',
                            keyboard: false
                        })
                        setTimeout(function () { loader.hidden(); }, 300);
                    } else toastMsg(false, "Please try again!");
                })
            }

            $scope.editOpenHoursData = {};
            $scope.editOpeningHours = (id) => {
                if (id) {
                    loader.visible();
                    localStorage.removeItem("Op_ho_ed_up_id");
                    localStorage.setItem("Op_ho_ed_up_id", JSON.stringify({ id }))
                    WeeklyTiming.find({ filter: { where: { id } } }).$promise.then((res) => {
                        if (res && res.length) {
                            $scope.editOpenHoursData = res[0];
                            $scope.statusOpen = res[0].status;
                            $('#editPopup').modal({
                                backdrop: 'static',
                                keyboard: false
                            })
                            setTimeout(function () { loader.hidden(); }, 300);
                        } else toastMsg(false, "Please try again!");
                    })
                } else toastMsg(false, "Please try again!");

            }

            $scope.updateOpeningHours = () => {
                let startTime = $("#startTime_up_v").val();
                let endTime = $("#endTime_up_v").val();
                let startConvert = (convertTime12to24($("#startTime_up_v").val())).split(':'),
                    endConvert = (convertTime12to24($("#endTime_up_v").val())).split(':');
                let updatedata = {
                    startTime, "startHour": startConvert[0],
                    "startMinute": startConvert[1], endTime, "endHour": endConvert[0], "endMinute": endConvert[1]
                }
                let ids = JSON.parse(localStorage.getItem("Op_ho_ed_up_id"));
                if (ids && ids.id) {
                    loader.visible();
                    updatedata.status = $scope.statusOpen;
                    WeeklyTiming.upsertWithWhere({ where: { id: ids.id } }, updatedata).$promise.then(() => {
                        $('#editPopup').modal('hide');
                        setTimeout(function () {
                            loader.hidden();
                            $scope.getOpeningHours();
                        }, 200);
                    }, () => {
                        loader.hidden();
                        toastMsg(false, "Please try again!");
                    })
                } else {
                    loader.hidden();
                    toastMsg(false, "Please try again!");
                }
            }

            $scope.updateChangeStaus = (status) => {
                loader.visible();
                if (status == "Open") status = "Closed";
                else if (status == "Closed") status = "Open";
                $scope.statusOpen = status;
                setTimeout(function () {
                    loader.hidden();
                }, 200);
            }

            $scope.updateStaus = (id, status) => {
                loader.visible();
                WeeklyTiming.upsertWithWhere({ where: { id } }, { status }).$promise.then((res) => {
                    $scope.getOpeningHours();
                    setTimeout(function () {
                        toastMsg(true, "Successfully updated!");
                        loader.hidden();
                    }, 500);
                }, () => {
                    $scope.getOpeningHours();
                    setTimeout(function () {
                        toastMsg(false, "Please try again!");
                        loader.hidden();
                    }, 300);
                });
            }

            $scope.updateOpeningAllHours = () => {
                let startTime = $("#startTime_up_v").val();
                let endTime = $("#endTime_up_v").val();
                let startConvert = (convertTime12to24($("#startTime_up_v").val())).split(':'),
                    endConvert = (convertTime12to24($("#endTime_up_v").val())).split(':');
                loader.visible();
                WeeklyTiming.updateAllWithStatus({
                    params: {
                        startTime, "startHour": startConvert[0], status: $scope.statusOpen, ownerId: $scope.userId,
                        "startMinute": startConvert[1], endTime, "endHour": endConvert[0], "endMinute": endConvert[1]
                    }
                }).$promise.then((res_56) => {
                    setTimeout(function () {
                        $('#editPopup').modal('hide');
                        loader.hidden();
                        $scope.getOpeningHours();
                    }, 100);
                }, () => {
                    setTimeout(function () {
                        loader.hidden();
                        toastMsg(false, "Please try again!");
                    }, 100);
                });
            }

        }]);