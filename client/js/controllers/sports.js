


angular
    .module('app')
    .controller('ManageSportsCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'Sports', 'loader', 'SportsCategory',
        function ($scope, $state, $rootScope, Business, $http, Sports, loader, SportsCategory) {

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.sportsD = [];
            $scope.getSports = () => {

                loader.visible();

                let tDate = new Date();
                let date = `${tDate.getFullYear()}-${("0" + (tDate.getMonth() + 1)).slice(-2)}-${("0" + tDate.getDate()).slice(-2)}T00:00:00.000Z`;

                let where = { date: { gte: date, } };
                if ($("#_happenings_category_f").val() != 'select') {
                    where.sportsTypeId = $("#_happenings_category_f").val();
                }

                Sports.find({
                    filter: {
                        where: { ownerId: $scope.userId },
                        include: [{
                            relation: "sportsScheduleForAdmin",
                            scope: {
                                where, order: "date asc",
                                include: [{ relation: "sportsSchedule" },
                                { relation: "competitionSchedule" },
                                { relation: "sponsorDetails" },
                                { relation: "sportsTeamA" },
                                { relation: "sportsTeamB" }]
                            }
                        }]
                    }
                }).$promise.then((res) => {
                    $scope.sportsD = res.filter(m => m.sportsScheduleForAdmin && m.sportsScheduleForAdmin.sportsSchedule && m.sportsScheduleForAdmin.sportsTeamA && m.sportsScheduleForAdmin.sportsTeamB);
                    setTimeout(function () {
                        loader.hidden();
                    }, 300);
                })
            }


            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

            $scope.isBusinessSelect = false;

            if (!$scope.userId) $scope.userId = $rootScope.currentUser.id;

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
                    $scope.getSports();
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
                $scope.userId = $scope.userDetails.id;
                $scope.isBusinessSelect = true;
                $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                $("#autocompleteBusiness").attr('disabled', true);
                localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userDetails.id, ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
                $scope.getSports();
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
                            localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userId, ownerId: $scope.userId, venueName: $scope.userDetails.businessName }));
                            $scope.getSports();
                        }
                    } else {
                        $("#businessErr").text('Please select the Business name');
                    }
                }
            }


            $scope.delete = (id) => {
                if (id) {
                    localStorage.removeItem('s_s_r_id');
                    localStorage.setItem('s_s_r_id', JSON.stringify({ id }));
                    $("#deleteConfirmPopup").modal({ backdrop: 'static', keyboard: false });
                } else toastMsg(false, 'Please try again!');
            };


            $scope.confirmDelete = () => {
                let ids = '';
                ids = JSON.parse(localStorage.getItem('s_s_r_id'));
                if (ids) {
                    loader.visible();
                    $("#deleteConfirmPopup").modal('hide');
                    Sports.removeSports({ params: { id: ids.id } }).$promise.then((res) => {
                        setTimeout(function () {
                            $scope.getSports();
                            toastMsg(true, 'Successfully deleted!');
                        }, 200);

                    }, () => { loader.hidden(); });
                } else toastMsg(false, 'Please try again!');
            };


            $scope.SportsCategoryList = [], $scope.parentCategory = [];
            $scope.SportsCategory = () => {
                SportsCategory.find().$promise.then((res) => {
                    $scope.parentCategory = res;
                    $scope.SportsCategoryList = res.filter(m => m.group == 'Sports');
                    $scope.SportsCategoryList.push({ name: 'Add New', _name: 'Add_New', group: 'Sports' });
                });
            }
            $scope.SportsCategory();

            $scope.showTheMiddle = (event, i) => {
                $(`.middle_${i}`).css({ 'display': 'block', 'position': 'absolute', 'right': '2%' });
            }
            $scope.hiddenTheMiddle = (i) => {
                $(`.middle_${i}`).css({ 'display': 'none' })
            }

            $scope.chanageCategory = (arg) => {
                $scope.sportsDataList = $scope.parentsportsDataList.filter(m => m.sportsCategoryId == arg.id);
            }

            $scope.viewSportsD = {};
            $scope.viewSports = (id) => {
                if (id) {
                    loader.visible();
                    $scope.viewSportsD = {};
                    Sports.find({
                        filter: {
                            where: { id },
                            include: [{
                                relation: "sportsScheduleForAdmin",
                                scope: {
                                    include: [{ relation: "sportsSchedule" },
                                    { relation: "competitionSchedule" },
                                    { relation: "sponsorDetails" },
                                    { relation: "sportsTeamA" },
                                    { relation: "sportsTeamB" }]
                                }
                            }]
                        }
                    })
                        .$promise.then((res) => {
                            if (res && res[0].sportsScheduleForAdmin) {
                                $scope.viewSportsD = res[0];
                                setTimeout(function () {
                                    loader.hidden();
                                    $("#viewPopup").modal({ backdrop: 'static', keyboard: false });
                                }, 300)
                            }
                        })
                }
            }


            $scope.updateStatus = (id) => {
                if (id) {
                    loader.visible();
                    Sports.find({ filter: { where: { id } } })
                        .$promise.then((res) => {
                            let status = (res[0].status == 'Live' ? 'Pending' : 'Live');
                            Sports.updateLive({ params: { id, status } }).$promise.then((res) => {
                                $scope.getSports();
                                setTimeout(() => {
                                    toastMsg(true, "Successfully updated!");
                                }, 400);
                            })
                        });
                } else toastMsg(false, "Please try again!");
            }

            $scope.editSports = (id) => {
                if (id) {
                    if (localStorage.getItem('e-Sports-ID')) {
                        localStorage.removeItem('e-Sports-ID');
                    }
                    localStorage.setItem('e-Sports-ID', JSON.stringify({ id }));
                    $state.go('edit-sports');
                }
            }
        }])
    .controller('CreateSportsCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'SportsCategory', 'Sports', 'loader', 'SportsScheduleForAdmin',
        function ($scope, $state, $rootScope, Business, $http, SportsCategory, Sports, loader, SportsScheduleForAdmin) {

            let toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

            $scope.isBusinessSelect = false;

            if (!$scope.userId) $scope.userId = $rootScope.currentUser.id;

            $scope.useremail = $rootScope.currentUser.email;
            $scope.userId = "";
            if (!$rootScope.selectedVenue) $rootScope.selectedVenue = JSON.parse(localStorage.getItem("selectedVenue"));
            if ($rootScope && $rootScope.currentUser && $scope.userDetails.isAdmin) {
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
                $scope.userId = $scope.userDetails.id;
                $scope.isBusinessSelect = true;
                // $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                // $("#autocompleteBusiness").attr('disabled', true);
                localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userDetails.id, ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
            }

            const convertTime12to24 = (time12h) => moment(time12h, 'hh:mm A').format('HH:mm');

            $scope.BusinessSelected = (arg) => {
                $("#businessErr").text('');
                if (arg) {
                    if (arg == 'manageEvent') {
                        if ($("#autocompleteBusiness").data('id')) {
                            arg = $("#autocompleteBusiness").data('id');
                            if ($("#businessSubmit").hasClass('businessSubmit')) {
                                $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                            }
                            if (arg != "select") {
                                $scope.isBusinessSelect = true;
                                $scope.userId = arg;
                                $rootScope.selectedVenue = { ownerId: $scope.userId, venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                            }
                        } else {
                            $("#businessErr").text('Please select the Business name');
                        }
                    }
                }
            }


            $scope.sportsList = [];
            $scope.competitionList = [];
            $scope.getSports = () => {
                loader.visible();
                SportsCategory.find({ filter: { where: { isSports: true } } }).$promise.then((res) => {
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
                        $scope.competitionList = res;
                        setTimeout(function () {
                            loader.hidden();
                        }, 300);
                    })
                }
            }

            $scope.matchDatesList = [];
            $scope.getMatchDates = () => {
                if ($("#sp_competion").val()) {
                    let competitionId = $("#sp_competion").find(':selected').attr('data-id');
                    loader.visible();

                    let tDate = new Date();
                    let date = `${tDate.getFullYear()}-${("0" + (tDate.getMonth() + 1)).slice(-2)}-${("0" + tDate.getDate()).slice(-2)}T00:00:00.000Z`;

                    SportsScheduleForAdmin.find({ filter: { where: { competitionId, status: 'Live', date: { gte: date } } } }).$promise.then((res) => {

                        $scope.matchDatesList = res.filter((s => o => (k => !s.has(k) && s.add(k))
                            (['date'].map(k => o[k]).join('|')))(new Set));

                        setTimeout(function () {
                            loader.hidden();
                        }, 600);
                    })
                }
            }

            $scope.matchesData = [];
            $scope.selectMacthClick = (match) => {
                loader.visible();
                if ($scope.matchesData && $scope.matchesData.length) {
                    if ($scope.matchesData.find(m => m.id == match.id)) {
                        $(`.match-show`).html('Select');
                        toastMsg(false, "Already exists!. Please try again.");
                    } else {
                        let index = $scope.matchList.findIndex(m => m.id == match.id)
                        let data = $scope.matchList.find(m => m.id == match.id);
                        $scope.matchesData.push(data);
                        $scope.matchList.splice(index, 1);
                        data.isSelected = true;
                        $scope.matchList.push(data);
                        $(`.match-show`).html('Select');
                    }
                } else {
                    let index = $scope.matchList.findIndex(m => m.id == match.id)
                    let data = $scope.matchList.find(m => m.id == match.id);
                    $scope.matchesData.push(data);
                    $scope.matchList.splice(index, 1);
                    data.isSelected = true;
                    $scope.matchList.push(data);
                    $(`.match-show`).html('Select');
                }
                setTimeout(function () { loader.hidden(); }, 300);
            }

            $scope.selectMacthDelete = (i) => {
                loader.visible();
                $scope.matchesData.splice(i, 1);
                setTimeout(function () { loader.hidden(); }, 200);
            }

            $scope.showTheMiddle = (event, i) => {
                $(`.middle_${i}`).css({ 'display': 'block', 'position': 'absolute', 'right': '2%' });
            }
            $scope.hiddenTheMiddle = (i) => {
                $(`.middle_${i}`).css({ 'display': 'none' })
            }

            $scope.matchList = [];
            $scope.getMatch = () => {
                if ($("#sp_date").val()) {
                    let competitionId = $("#sp_competion").find(':selected').attr('data-id');
                    let date = $("#sp_date").val();
                    loader.visible();

                    SportsScheduleForAdmin.find({ filter: { where: { competitionId, status: 'Live', date }, include: [{ relation: "sportsTeamA" }, { relation: "sportsTeamB" }] } }).$promise.then((res) => {
                        for (let data of res) {
                            data.isSelected = false;
                            $scope.matchList.push(data)
                        }
                        setTimeout(function () {
                            loader.hidden();
                        }, 400);
                    })
                }
            }

            $scope.createSports = () => {

                loader.visible();

                let primaryImg = secondaryImg = [];

                let uploadImg = (ids) => {
                    return new Promise((resolve, reject) => {
                        var fd = new FormData();
                        var extension = '';
                        function openFile(file) {
                            extension = file.substr((file.lastIndexOf('.') + 1));
                        };

                        openFile($(`${ids}`)[0].files[0].name);

                        var uid = uuidv4();
                        fd.append(`happenings`, $(`${ids}`)[0].files[0], `${uid}.${extension}`);

                        $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                            .then((res) => {
                                if (res && res.data && res.data.isSuccess) {
                                    if ("#primary-img" == ids) primaryImg = res.data.result;
                                    else if ("#secondary-img" == ids) secondaryImg = res.data.result;
                                    resolve({ isSuccess: true });
                                } else {
                                    loader.hidden()
                                }
                            }, () => loader.hidden())

                    })
                }

                let createSFun = () => {
                    let fullDesc = $("#sports_desc").val();
                    let status = "Pending";
                    // if ($("#sports_btn_status").is(":checked")) status = "Live";
                    Sports.createAndUpdate({ params: { matches: $scope.matchesData, fullDesc, ownerId: $scope.userId, status } }).$promise.then(() => {
                        $(`.match-show`).attr('data-id', '').html('Select');
                        $state.go('sports');
                        setTimeout(function () {
                            toastMsg(true, "Successfully created!");
                            loader.hidden();
                        }, 300);
                    })
                }

                try {
                    if ($scope.matchesData && $scope.matchesData.length) {
                        createSFun();
                        // if ($scope.userDetails.isAdmin) {
                        //     if ($("input[name=BusinessName]").val()) {
                        //         if ($("#primary-img").val() || $("#secondary-img").val()) {
                        //             if ($("#primary-img").val() && $("#secondary-img").val()) {
                        //                 uploadImg("#primary-img").then(() => {
                        //                     uploadImg("#secondary-img").then(() => {
                        //                         createSFun();
                        //                     })
                        //                 })
                        //             } else if ($("#primary-img").val()) {
                        //                 uploadImg("#primary-img").then(() => {
                        //                     createSFun();
                        //                 })
                        //             } else if ($("#secondary-img").val()) {
                        //                 uploadImg("#secondary-img").then(() => {
                        //                     createSFun();
                        //                 })
                        //             } else createSFun();
                        //         } else createSFun();
                        //     } else toastMsg(false, "Please select the venue!");
                        // } else if ($("#primary-img").val() || $("#secondary-img").val()) {
                        //     if ($("#primary-img").val() || $("#secondary-img").val()) {
                        //         if ($("#primary-img").val() && $("#secondary-img").val()) {
                        //             uploadImg("#primary-img").then(() => {
                        //                 uploadImg("#secondary-img").then(() => {
                        //                     createSFun();
                        //                 })
                        //             })
                        //         } else if ($("#primary-img").val()) {
                        //             uploadImg("#primary-img").then(() => {
                        //                 createSFun();
                        //             })
                        //         } else if ($("#secondary-img").val()) {
                        //             uploadImg("#secondary-img").then(() => {
                        //                 createSFun();
                        //             })
                        //         } else createSFun();
                        //     } else createSFun();
                        // } else createSFun();
                    } else {
                        toastMsg(false, "Please select the match!");
                        loader.hidden();
                    }
                } catch (e) {
                    toastMsg(false, "Please try again!");
                    loader.hidden();
                }
            }

        }])
    .controller('EditSportsCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'Sports', 'loader', '$stateParams', 'SportsCategory', 'SportsScheduleForAdmin',
        function ($scope, $state, $rootScope, Business, $http, Sports, loader, $stateParams, SportsCategory, SportsScheduleForAdmin) {

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            const convertTime12to24 = (time12h) => moment(time12h, 'hh:mm A').format('HH:mm');

            $scope.SportsCategoryList = [], $scope.parentCategory = [];
            $scope.SportsCategory = () => {
                SportsCategory.find().$promise.then((res) => {
                    $scope.parentCategory = res;
                    $scope.SportsCategoryList = res.filter(m => m.group == 'Sports');
                });
            }
            $scope.SportsCategory();

            $scope.sportsRes = {};
            $scope.getEdit = () => {
                $scope.sportsRes = {};
                loader.visible();
                let data = JSON.parse(localStorage.getItem('e-Sports-ID'));
                if (data && data.id) {
                    Sports.findOne({
                        filter: {
                            where: { id: data.id },
                            include: [{
                                relation: "sportsScheduleForAdmin",
                                scope: {
                                    include: [{ relation: "sportsSchedule" },
                                    { relation: "competitionSchedule" },
                                    { relation: "sponsorDetails" },
                                    { relation: "sportsTeamA" },
                                    { relation: "sportsTeamB" }]
                                }
                            }]
                        }
                    }).$promise.then((res) => {
                        $scope.sportsRes = res;
                        $scope.sDate = new Date(res.sportsScheduleForAdmin.date.split('T')[0])
                        setTimeout(function () {
                            loader.hidden();
                        }, 300);
                    });
                }

            }
            $scope.getEdit();


            $scope.deleteImage = (id, img, arg) => {
                loader.visible();
                if (img && img.path && img.fileName) {
                    $http.post('/spaceFileDelete', { fileName: img.fileName }).then(() => {
                        if (arg == 'primary') {
                            Sports.upsertWithWhere({ where: { id } }, { primaryImg: [] }).$promise.then(() => {
                                $scope.getEdit();
                                setTimeout(function () {
                                    loader.hidden();
                                    toastMsg(true, "Successfully deleted!");
                                }, 500);
                            });

                        } else if (arg == 'secondary') {
                            Sports.upsertWithWhere({ where: { id } }, { secondaryImg: [] }).$promise.then(() => {
                                $scope.getEdit();
                                setTimeout(function () {
                                    loader.hidden();
                                    toastMsg(true, "Successfully deleted!");
                                }, 500);
                            });

                        }
                    }, () => {
                        setTimeout(function () {
                            loader.hidden();
                            toastMsg(false, "Please try again!");
                        }, 500);
                    });


                }
            };

            $scope.imageDetails = {};
            $scope.getFilenameandType = (arg, e) => {
                if (e.data('name') == "sports") {
                    $scope.imageDetails.ImageAddCrop = '';
                    $scope.imageDetails.ImageAddCrop = Math.random().toString(36).substring(2) + "_" + arg.replace(/ /g, "_");
                }
            };

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
                    $("#img-pre").attr('src', imgSrc);
                    $(".img-h-s").css({ display: 'block' });
                    $(".img-c-s").css({ display: 'none' });
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
                    $("#img-second-pre").attr('src', imgSrc);
                    $(".img-h-s-s").css({ display: 'block' });
                    $(".img-c-s-s").css({ display: 'none' });
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


            $scope.uploadSports = (data) => {
                if (data.id) {
                    loader.visible();

                    let dateSet = new Date($("#sport-date").val());
                    let primaryImg = [], secondaryImg = [];

                    uploadImg = () => {
                        return new Promise((resolve, reject) => {
                            var fd = new FormData();
                            var uid = uuidv4();
                            fd.append(`happenings_0`, dataURItoBlob($("#img-pre").attr('src')), `${uid}.png`);

                            $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                                .then((res) => {
                                    if (res && res.data && res.data.isSuccess) {
                                        if (res.data.result && res.data.result.length) {
                                            primaryImg = res.data.result;
                                        }
                                        resolve({ isSuccess: true });
                                    } else loader.hidden()
                                }, () => loader.hidden())
                        })
                    }

                    uploadSecondaryImg = () => {

                        return new Promise((resolve, reject) => {
                            var fd = new FormData();
                            var uid = uuidv4();
                            fd.append(`happenings_0`, dataURItoBlob($("#img-second-pre").attr('src')), `${uid}.png`);

                            $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                                .then((res) => {
                                    if (res && res.data && res.data.isSuccess) {
                                        if (res.data.result && res.data.result.length) {
                                            secondaryImg = res.data.result;
                                        }
                                        resolve({ isSuccess: true });
                                    } else loader.hidden()
                                }, () => loader.hidden())
                        })
                    }

                    let date = $("#sport-date").val();
                    let time = $("#sport-time").val();
                    let sTime = convertTime12to24(time);
                    let dateTxt = date.split('-');
                    startHour = startMinute = 0, timeNo = 0;
                    if (sTime.includes(':')) {
                        startHour = sTime.split(':')[0];
                        startMinute = sTime.split(':')[1];
                        dateSet.setHours(startHour);
                        dateSet.setMinutes(startMinute);
                        timeNo = dateSet.getTime();
                    }

                    let fullDesc = $("#sports_desc").val();

                    let cUpdate = (creObj) => {
                        Sports.upsertWithWhere({ where: { id: data.id } }, creObj).$promise.then(() => {
                            setTimeout(function () {
                                loader.hidden();
                                toastMsg(true, "Successfully updated!");
                                $state.go("sports");
                            }, 300);
                        })
                    }

                    if ($("#img-pre").attr('src') && $("#img-second-pre").attr('src')) {
                        uploadImg().then(() => {
                            uploadSecondaryImg().then(() => {
                                cUpdate({ fullDesc, secondaryImg, primaryImg });
                            })
                        })
                    } else if ($("#img-pre").attr('src')) {
                        uploadImg().then(() => {
                            cUpdate({ fullDesc, primaryImg });
                        })
                    } else if ($("#img-second-pre").attr('src')) {
                        uploadSecondaryImg().then(() => {
                            cUpdate({ fullDesc, secondaryImg });
                        })
                    } else cUpdate({ fullDesc });


                } else toastMsg(false, "Please try again!");
            }



        }]);