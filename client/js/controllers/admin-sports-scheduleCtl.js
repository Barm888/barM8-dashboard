angular
    .module('app')
    .controller('manageSportsScheduleCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'DailySpecial', 'loader', 'SportsScheduleForAdmin', 'Sports', 'SportsCategory', function ($scope, $state, $rootScope, Business, $http, DailySpecial, loader, SportsScheduleForAdmin, Sports, SportsCategory) {

        let toastMsg = (isVaild, msg) => {
            if (isVaild)
                toastr.success(msg);
            else
                toastr.error(msg);
            toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
        }

        $scope.scheduleAllData = [];
        $scope.getAllData = () => {
            loader.visible();
            let tDate = new Date();
            let date = `${tDate.getFullYear()}-${("0" + (tDate.getMonth() + 1)).slice(-2)}-${("0" + tDate.getDate()).slice(-2)}T00:00:00.000Z`;
            let where = {}
            let filterData = () => {
                SportsScheduleForAdmin.find({
                    filter: {
                        where,
                        order: "date asc",
                        include: [{
                            relation: "sportsSchedule"
                        }, { relation: "competitionSchedule" },
                        { relation: "sponsorDetails" },
                        { relation: "sportsTeamA" },
                        { relation: "sportsTeamB" }]
                    }
                }).$promise.then((res) => {
                    $scope.scheduleAllData = res;
                    setTimeout(function () { loader.hidden(); }, 300);
                })
            }

            where = { date: { gte: date } };
            if ($("#sports_name").val() != 'select') {
                where.sportsTypeId = $("#sports_name").find(':selected').attr('data-id');
            }
            if ($("#sp_competion").val() != 'select') {
                where.competitionId = $("#sp_competion").find(':selected').attr('data-id');
            }
            filterData();
        }
        $scope.sportsList = [];
        $scope.competitionList = [];
        $scope.getSports = () => {
            loader.visible();
            SportsCategory.find({ filter: { where: { isSports: true } } }).$promise.then((res) => {
                $scope.sportsList = [];
                $scope.sportsList = res;
                setTimeout(function () {
                    loader.hidden();
                }, 300);
            })
        }
        $scope.getSports();


        $scope.getCompetition = () => {
            if ($("#sports_name").val()) {
                let group = $("#sports_name").val();
                loader.visible();
                SportsCategory.find({ filter: { where: { isCompetition: true, group } } }).$promise.then((res) => {
                    $scope.competitionList = [];
                    $scope.competitionList = res;
                    setTimeout(function () {
                        loader.hidden();
                    }, 300);
                })
            }
        }

        $scope.showTheMiddle = (event, i) => {
            $(`.middle_${i}`).css({ 'display': 'block', 'position': 'absolute', 'right': '2%' });
        }
        $scope.hiddenTheMiddle = (i) => {
            $(`.middle_${i}`).css({ 'display': 'none' })
        }

        $scope.deleteObj = {};
        $scope.delete = (id) => {
            if (id) {
                loader.visible();
                localStorage.removeItem('s_s_r_ad_sh_id');
                localStorage.setItem('s_s_r_ad_sh_id', JSON.stringify({ id }));
                $("#deleteConfirmPopup").modal({ backdrop: 'static', keyboard: false });
                setTimeout(function () {
                    loader.hidden();
                }, 200);
            } else {
                toastMsg(false, "Please try again");
                setTimeout(function () {
                    loader.hidden();
                }, 200);
            }
        }

        $scope.confirmDelete = () => {
            let ids = '';
            ids = JSON.parse(localStorage.getItem('s_s_r_ad_sh_id'));
            if (ids) {
                loader.visible();
                $("#deleteConfirmPopup").modal('hide');
                SportsScheduleForAdmin.remove({ params: { id: ids.id } }).$promise.then((res) => {
                    $scope.getAllData();
                    toastMsg(true, 'Successfully deleted!');
                    setTimeout(function () {
                        loader.hidden();
                    }, 300);
                }, () => {
                    setTimeout(function () {
                        loader.hidden();
                    }, 300);
                });
            }
        }

        $scope.updateStatus = (id) => {
            if (id) {
                loader.visible();
                SportsScheduleForAdmin.find({ filter: { where: { id } } })
                    .$promise.then((res) => {
                        let status = (res[0].status == 'Live' ? 'Pending' : 'Live');
                        SportsScheduleForAdmin.updateLive({ params: { id, status } }).$promise.then((res) => {
                            $scope.getAllData();
                            setTimeout(() => {
                                toastMsg(true, "Successfully updated!");
                            }, 400);
                        })
                    });
            } else toastMsg(false, "Please try again!");
        }

        $scope.viewSportsSchedule = (id) => {
            if (id) {
                loader.visible();
                SportsScheduleForAdmin.find({
                    filter: {
                        where: { id },
                        order: "date asc",
                        include: [{
                            relation: "sportsSchedule"
                        }, { relation: "competitionSchedule" },
                        { relation: "sponsorDetails" },
                        { relation: "sportsTeamA" },
                        { relation: "sportsTeamB" }]
                    }
                }).$promise.then((res) => {
                    if (res && res.length) {
                        $scope.scheduleASView = res[0];
                        $scope.scheduleASView.timeDataTxt = `${res[0].time} ${res[0].timeTxt}`
                        console.log(JSON.stringify($scope.scheduleASView));
                        $('#viweSportsPopup').modal({
                            backdrop: 'static',
                            keyboard: false
                        })
                        setTimeout(function () { loader.hidden(); }, 300);
                    } else {
                        toastMsg(false, "Please try again!");
                        loader.hidden();
                    }
                })
            }
        }

    }])
    .controller('createSportsScheduleCtl', ['$scope', '$state', '$rootScope', 'SportsCategory', '$http', 'loader', 'SportsTeamAndLogo', 'SponsorDetails', 'SportsScheduleForAdmin', function ($scope, $state, $rootScope, SportsCategory, $http, loader, SportsTeamAndLogo, SponsorDetails, SportsScheduleForAdmin) {

        toastMsg = (isVaild, msg) => {
            if (isVaild)
                toastr.success(msg);
            else
                toastr.error(msg);
            toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
        }

        $scope.sportsList = [];
        $scope.competitionList = [];
        $scope.getSports = () => {
            loader.visible();
            SportsCategory.find({ filter: { where: { isSports: true } } }).$promise.then((res) => {
                $scope.sportsList = [];
                $scope.sportsList = res;
                setTimeout(function () {
                    loader.hidden();
                }, 300);
            })
        }
        $scope.getSports();

        $scope.sponsorList = [];
        $scope.getSponsors = () => {
            loader.visible();
            SponsorDetails.find().$promise.then((res) => {
                $scope.sponsorList = [];
                $scope.sponsorList = res;
                setTimeout(function () {
                    loader.hidden();
                }, 300);
            })
        }
        $scope.getSponsors();

        $scope.getCompetition = () => {
            if ($("#sports_name").val()) {
                let group = $("#sports_name").val();
                loader.visible();
                SportsCategory.find({ filter: { where: { isCompetition: true, group } } }).$promise.then((res) => {
                    $scope.competitionList = [];
                    $scope.competitionList = res;
                    setTimeout(function () {
                        loader.hidden();
                    }, 300);
                })
            }
        }

        $scope.teamList = [];
        $scope.getTeam = () => {
            if ($("#sp_competion").val()) {
                let _sportGroup = $("#sports_name").val();
                let _competitionGroup = $("#sp_competion").val();
                loader.visible();
                SportsTeamAndLogo.find({ filter: { where: { _sportGroup, _competitionGroup } } }).$promise.then((res) => {
                    $scope.teamList = [];
                    $scope.teamList = res;
                    setTimeout(function () {
                        loader.hidden();
                    }, 300);
                })
            }
        }

        const convertTime12to24 = (time12h) => moment(time12h, 'hh:mm A').format('HH:mm');

        $scope.addSDAndTime = [];
        $scope.addSportsDateTime = () => {
            let date = $("#sport-date").val();
            let time = $("#sport-time").val();
            let teamA = $(".team-a-tag").html();
            let teamB = $(".team-b-tag").html();
            let dateTxt = date.split('-');
            let round = $("#sp_round").val() == 'select' ? 0 : $("#sp_round").val();
            if (date && time && teamA != 'Select' && teamB != 'Select') {

                let dateSet = new Date($("#sport-date").val());

                let sTime = convertTime12to24(time);
                startHour = startMinute = 0, timeNo = 0;
                if (sTime.includes(':')) {
                    startHour = sTime.split(':')[0];
                    startMinute = sTime.split(':')[1];
                    dateSet.setHours(startHour);
                    dateSet.setMinutes(startMinute);
                    timeNo = dateSet.getTime();
                }

                $scope.addSDAndTime.push({
                    teamA: { name: $(teamA).find('span').html(), id: $(".team-a-tag").attr('data-id'), path: $(teamA).find('img').attr('src') },
                    teamB: { name: $(teamB).find('span').html(), id: $(".team-b-tag").attr('data-id'), path: $(teamB).find('img').attr('src') },
                    teamAId: $(".team-a-tag").attr('data-id'), teamBId: $(".team-b-tag").attr('data-id'),
                    time: time.split(' ')[0], timeTxt: time.split(' ')[1], date: `${date}T00:00:00.000Z`, timeNo,
                    dateTxt: `${dateTxt[2]}-${dateTxt[1]}-${dateTxt[0]}`, dateNo: dateTxt[2], month: dateTxt[1],
                    year: dateTxt[0], sponsorId: $(`.spon-show`).attr('data-id'), round,
                    sportsTypeId: $("#sports_name").find(':selected').attr('data-id'),
                    competitionId: $("#sp_competion").find(':selected').attr('data-id')
                });

                $("#schedule_add_btn").prop('disabled', true);
                $("#sports_add_btn").prop('disabled', false);
                $("#sport-date,#sport-time").val('');
                $(".team-a-tag,.team-b-tag").html('Select');
            } else toastMsg(false, "Please try again!")

        }


        $scope.createSportsSchedule = () => {
            if ($scope.addSDAndTime && $scope.addSDAndTime.length) {
                loader.visible();
                SportsScheduleForAdmin.createAndUpdate({ params: { values: $scope.addSDAndTime } })
                    .$promise.then(() => {
                        setTimeout(function () {
                            $scope.addSDAndTime = [];
                            $state.go('manage-sports-scheduling');
                            loader.hidden();
                            toastMsg(true, "Successfully created!");
                        }, 300);
                    })
            } else toastMsg(false, "Please try again!");
        }


        $scope.teamClk = (team, s) => {
            $("#schedule_add_btn").prop('disabled', true);
            $(`.team-${s}-tag`).attr('data-id', team.id).html(`<div><img src="${team.img.path}" class="l-img"> <span>${team.name}</span></div>`);
            if (s == "b" || ($(`.team-a-tag`).html() && $(`.team-a-tag`).html() != 'Select')) $("#schedule_add_btn").prop('disabled', false);
        }

        $scope.sponsorClick = (sponsor) => {
            $(`.spon-show`).attr('data-id', sponsor.id)
                .html(`<div><img src="${sponsor.sponsorLogo.path}" class="l-img"> <span>${sponsor.sponsorName}</span></div>`);
        }


    }]);