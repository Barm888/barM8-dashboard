angular
    .module('app')
    .controller('happyHoursCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'HappyHourDashDay', 'loader', 'getAllVenues',
        function ($scope, $state, $rootScope, Business, $http, HappyHourDashDay, loader, getAllVenues) {

            $scope.weekDays = [{ name: 'Sun', txt: 'Sunday', val: 'sunday' }, { name: 'Mon', txt: 'Monday', val: 'monday' }, { name: 'Tue', txt: 'Tuesday', val: 'tuesday' },
            { name: 'Wed', txt: 'Wednesday', val: 'wednesday' }, { name: 'Thu', txt: 'Thursday', val: 'thursday' }, { name: 'Fri', txt: 'Friday', val: 'friday' },
            { name: 'Sat', txt: 'Saturday', val: 'saturday' }];

            $scope.categories = ["Happy Hour", "Beer", "Wine", "Cocktail", "Spirit", "Cider"];

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

            if (!$scope.userId) $scope.userId = $rootScope.currentUser.id;

            $scope.useremail = $rootScope.currentUser.email;
            $scope.userId = "";
            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                $scope.isBusinessSelect = true;
                loader.visible()
                setTimeout(function () {
                    $scope.businessSelection = getAllVenues.get();
                    loader.hidden();
                }, 1000)
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
                $rootScope.selectedVenue = { ownerId: $scope.userId, venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
            }

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
                            $scope.isBusinessSelect = true;
                            $scope.userId = arg;
                            $rootScope.selectedVenue = { ownerId: $scope.userId, venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                            localStorage.removeItem("selectedVenue");
                            localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userId, ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }));
                        }
                    } else {
                        $("#businessErr").text('Please select the Business name');
                    }
                }
            }

            if ($scope.userDetails.isAdmin == false) {
                // $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                // $("#autocompleteBusiness").attr('disabled', true);
                $scope.userId = $scope.userDetails.id;
                localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userId, ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
            }

            const convertTime12to24 = (time12h) => moment(time12h, 'hh:mm A').format('HH:mm');

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

            $scope.primaryImgS = [];
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
                            aspectRatio: 1 / 1,
                            autoCropArea: 0.65,
                            restore: false,
                            guides: false,
                            center: false,
                            highlight: false,
                            cropBoxMovable: false,
                            cropBoxResizable: false,
                            toggleDragModeOnDblclick: false,
                            minContainerWidth: 300,
                            minContainerHeight: 300,
                            minCropBoxWidth: 300,
                            minCropBoxHeight: 300
                        });
                    }
                };
                reader.readAsDataURL(file);

                // save on click
                cropbtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    let imgSrc = cropper.getCroppedCanvas({
                        width: 300,
                        height: 300
                    }).toDataURL();
                    $scope.primaryImgS = [];
                    $scope.primaryImgS.push({ path: imgSrc });
                    $scope.$apply();
                    $("#createBtn").prop('disabled', false);
                    $("#image-crop-md").modal('hide');
                    // $("#img-pre").attr('src', imgSrc);
                    // $(".img-h-s").css({ display: 'block' });
                    // $(".img-c-s").css({ display: 'none' });
                    $("#primary-img").val('');
                });

                // $("#delete_i_index").on('click', function () {
                //     $("#img-pre").attr('src', '');
                //     $(".img-c-s").css({ display: 'block' })
                //     $(".img-h-s").css({ display: 'none' })
                // });

                $("#modalClose").on('click', function () {
                    $("#image-crop-md").modal('hide');
                });
            }


            $scope.imageDelete = (data) => {
                loader.visible();
                let i = $scope.primaryImgS.findIndex(m => m.path == data.path);
                $scope.primaryImgS.splice(i, 1);
                setTimeout(function () { loader.hidden() }, 200)
            }

            $scope.replaceImg = () => {
                $("#primary-img").trigger('click'); return false;
            }

            $scope.createHappyHour = () => {

                let isTrue = true, img = [], title, desc, titleTxt,
                    category = [], mainCategory;

                mainCategory = $("#category").val();

                $("#category_err,#title_err,#desc_err,#image_err").css({ display: "none" });

                $('.l-categoey:checked').each(function () {
                    if ($(this).data('values') != 'select') category.push($(this).data('values'));
                });

                if (!category) {
                    $("#category_err").css({ display: 'block' });
                    isTrue = false;
                }
                if (!$("#title").val()) {
                    $("#title_err").css({ display: 'block' })
                    isTrue = false;
                }
                if (!$("#desc").val()) {
                    $("#desc_err").css({ display: 'block' })
                    isTrue = false;
                }

                uploadImg = () => {

                    return new Promise((resolve, reject) => {
                        var fd = new FormData();
                        for (let val of $scope.hapHourDate) {
                            var uid = uuidv4();
                            fd.append(`sports`, dataURItoBlob($scope.primaryImgS[0].path), `${uid}.png`);
                        }

                        $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                            .then((res) => {
                                if (res && res.data && res.data.isSuccess) {
                                    img = res.data.result;
                                    resolve({ isSuccess: true });
                                } else loader.hidden()
                            }, () => loader.hidden())
                    })
                }

                if (isTrue) {

                    title = $("#title").val();
                    desc = $("#desc").val();
                    titleTxt = $("#title").val().toString().replace(/\s+/g, '');

                    loader.visible();

                    uploadImg().then(() => {

                        let groupId = uuidv4();

                        let dateValues = [];

                        $scope.hapHourDate.forEach((val, i) => {

                            let { startTime, endTime, start_hour, start_minute, end_hour, end_minute, day, startUnixTime, endUnixTime, dateFormat,
                                date, dateNo, month, year } = val

                            dateValues.push({
                                startTime, endTime, start_hour, start_minute, end_hour, end_minute, day, startUnixTime, endUnixTime, dateFormat,
                                date, dateNo, month, year, img: [img[i]]
                            });

                        })

                        if (category && category.length) {
                            if (mainCategory == 'select' || mainCategory == 'Select') mainCategory = category[0]
                        }

                        if (category && category.length && mainCategory != 'select') {

                            let status = "Pending";
                            if ($("#happyhour_btn_status").is(':checked')) status = 'Live';
                            console.log(status);
                            HappyHourDashDay.createAndUpdate({
                                params: {
                                    ownerId: $scope.userId, title, desc, category,
                                    mainCategory, groupId, titleTxt, status, dateValues
                                }
                            }).$promise.then((res) => {
                                $("#desc,#title").val('');
                                $("#category_err,#title_err,#desc_err,#image_err").css({ display: "none" });
                                $('input[name=category]:checked').map(function () { $(this).prop('checked', false); });
                                // $("#img-pre").attr('src', '');
                                // $(".img-c-s").css({ display: 'block' })
                                // $(".img-h-s").css({ display: 'none' })
                                loader.hidden();
                                toastMsg(true, "Successfully created!");
                                $state.go('manage-happy-hours');
                            }, (err) => {
                                toastMsg(false, "Please try agian");
                                loader.hidden();
                            });
                        } else {
                            toastMsg(false, "Please select the category!");
                            loader.hidden();
                        }
                    }).catch((err) => {
                        toastMsg(false, `${err}`);
                        loader.hidden();
                    });
                } else {
                    toastMsg(false, "Something wrong.Please try again!");
                    loader.hidden();
                }
            }

            $scope.hapHourDate = [];
            $scope.addDateAndTime = () => {

                if ($("#happy_hour_date").val()) {
                    let dates = $("#happy_hour_date").val().toString().split(',');
                    if (dates && dates.length == 0) {
                        isTrue = false;
                        toastMsg(false, "Please select the date!");
                    } else {
                        loader.visible();
                    }

                    let startTime = $("#startTime").val();
                    let endTime = $("#endTime").val();

                    for (let daF of dates) {

                        daF = daF.split('-');

                        let month = daF[1];
                        let year = daF[2];

                        let dateF = new Date(`${year}-${("0" + month).slice(-2)}-${("0" + daF[0]).slice(-2)}`);
                        let dateE = new Date(`${year}-${("0" + month).slice(-2)}-${("0" + daF[0]).slice(-2)}`);
                        let startHour, startMinute, endHour, endMinute;
                        let dValues = $scope.hapHourDate.find(m => m.date == `${year}-${("0" + month).slice(-2)}-${("0" + daF[0]).slice(-2)}T00:00:00.000Z`);
                        let isMsg = true;
                        if (!dValues || dValues.startTime != startTime || dValues.endTime != endTime) {

                            let day = $scope.weekDays[dateF.getDay()].txt;

                            if (startTime) {
                                let sTime = convertTime12to24(startTime);
                                startHour = sTime.split(':')[0];
                                startMinute = sTime.split(':')[1];
                                dateF.setHours(startHour);
                                dateF.setMinutes(startMinute);
                            }
                            if (endTime) {
                                let eTime = convertTime12to24(endTime);
                                endHour = eTime.split(':')[0];
                                endMinute = eTime.split(':')[1];
                                dateE.setHours(endHour);
                                dateE.setMinutes(endMinute);
                            }

                            if (startTime && endTime) {

                                $scope.hapHourDate.push({
                                    startTime, endTime, start_hour: startHour, start_minute: startMinute,
                                    end_hour: endHour, end_minute: endMinute, day,
                                    startUnixTime: dateF.getTime(), endUnixTime: dateE.getTime(),
                                    dateFormat: `${("0" + daF[0]).slice(-2)}-${("0" + month).slice(-2)}-${year}`,
                                    date: `${year}-${("0" + month).slice(-2)}-${("0" + daF[0]).slice(-2)}T00:00:00.000Z`,
                                    dateNo: `${("0" + daF[0]).slice(-2)}`, month: `${("0" + month).slice(-2)}`, year
                                });

                            } else toastMsg(false, "Start or end time is missing. Please try again!");
                        } else {
                            if (isMsg) toastMsg(false, "Please add the different start and end time.");
                            isMsg = false
                        }
                    }

                    setTimeout(function () {
                        $("#startTime,#endTime").val('');
                        //$("#happy_hour_date").val('');
                        loader.hidden();
                    }, 200);
                } else {
                    toastMsg(false, "Please try again!");
                }
            }

        }])
    .controller('happyHoursEditCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'HappyHourDashDay', 'loader',
        function ($scope, $state, $rootScope, Business, $http, HappyHourDashDay, loader) {

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            $scope.editInit = () => {
                $scope.editHappyHoursData = {};
                if (localStorage.getItem("edit_happy_hours_id")) {
                    let data = JSON.parse(localStorage.getItem("edit_happy_hours_id"));
                    if (data && data.id) {
                        let id = data.id;
                        loader.visible()
                        HappyHourDashDay.findOne({ filter: { where: { id } } }).$promise.then((res) => {
                            $scope.editHappyHoursData = res;
                            $scope.statusEV = res.status;
                            setTimeout(function () { loader.hidden() }, 300);
                        });
                    }
                }
            }
            $scope.editInit();

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            const convertTime12to24 = (time12h) => moment(time12h, 'hh:mm A').format('HH:mm');

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


            $scope.primaryImgS = [];

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
                            aspectRatio: 1 / 1,
                            autoCropArea: 0.65,
                            restore: false,
                            guides: false,
                            center: false,
                            highlight: false,
                            cropBoxMovable: false,
                            cropBoxResizable: false,
                            toggleDragModeOnDblclick: false,
                            minContainerWidth: 300,
                            minContainerHeight: 300,
                            minCropBoxWidth: 300,
                            minCropBoxHeight: 300
                        });
                    }
                };
                reader.readAsDataURL(file);

                // save on click
                cropbtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    let imgSrc = cropper.getCroppedCanvas({
                        width: 300,
                        height: 300
                    }).toDataURL();
                    var fd = new FormData();
                    var uid = uuidv4();
                    loader.visible();
                    fd.append(`sports`, dataURItoBlob(imgSrc), `${uid}.png`);
                    $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess) {
                                if (localStorage.getItem("edit_happy_hours_id")) {
                                    let data = JSON.parse(localStorage.getItem("edit_happy_hours_id"));
                                    if (data && data.id) {
                                        let id = data.id;
                                        $scope.primaryImgS = [];
                                        $scope.primaryImgS.push({ path: imgSrc })
                                        HappyHourDashDay.upsertWithWhere({ where: { id } }, {
                                            img: res.data.result
                                        }).$promise.then((res_1) => {
                                            $scope.editInit();
                                        });
                                    }
                                }
                            } else loader.hidden()
                        }, () => loader.hidden())
                    $("#createBtn").prop('disabled', false);
                    $("#image-crop-md").modal('hide');
                    // $("#img-pre").attr('src', imgSrc);
                    // $(".img-h-s").css({ display: 'block' });
                    // $(".img-c-s").css({ display: 'none' });
                    $("#primary-img").val('');
                });

                // $("#delete_i_index").on('click', function () {
                //     $("#img-pre").attr('src', '');
                //     $(".img-c-s").css({ display: 'block' })
                //     $(".img-h-s").css({ display: 'none' })
                // });

                $("#modalClose").on('click', function () {
                    $("#image-crop-md").modal('hide');
                });
            }

            $scope.imgReplaceSection = (file) => {

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
                            aspectRatio: 1 / 1,
                            autoCropArea: 0.65,
                            restore: false,
                            guides: false,
                            center: false,
                            highlight: false,
                            cropBoxMovable: false,
                            cropBoxResizable: false,
                            toggleDragModeOnDblclick: false,
                            minContainerWidth: 300,
                            minContainerHeight: 300,
                            minCropBoxWidth: 300,
                            minCropBoxHeight: 300
                        });
                    }
                };
                reader.readAsDataURL(file);

                // save on click
                cropbtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    let imgSrc = cropper.getCroppedCanvas({
                        width: 300,
                        height: 300
                    }).toDataURL();
                    var fd = new FormData();
                    var uid = uuidv4();
                    loader.visible();
                    fd.append(`sports`, dataURItoBlob(imgSrc), `${uid}.png`);
                    $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess) {
                                if (localStorage.getItem("edit_happy_hours_id")) {
                                    let data = JSON.parse(localStorage.getItem("edit_happy_hours_id"));
                                    if (data && data.id) {
                                        let id = data.id;
                                        $scope.primaryImgS = [];
                                        $scope.primaryImgS.push({ path: imgSrc })
                                        HappyHourDashDay.upsertWithWhere({ where: { id } }, {
                                            img: res.data.result
                                        }).$promise.then((res_1) => {
                                            $scope.editInit();
                                        });
                                    }
                                }
                            } else loader.hidden()
                        }, () => loader.hidden())
                    //$("#createBtn").prop('disabled', false);
                    $("#image-crop-md").modal('hide');
                    $("#primary-img").val('');
                });

                $("#modalClose").on('click', function () {
                    $("#image-crop-md").modal('hide');
                });
            }

            $scope.updateHappyHour = () => {
                let title, desc, startTime, start_hour, start_minute, endTime, end_hour, end_minute;
                let img = [], titleTxt, dateF, dateE;

                let start, end;
                if ($(`#start_time`).val()) start = convertTime12to24($(`#start_time`).val());
                if ($(`#end_time`).val()) end = convertTime12to24($(`#end_time`).val());
                if (start && end) {
                    let daF = $scope.editHappyHoursData.dateFormat.split('-');

                    dateF = new Date(`${daF[2]}-${("0" + daF[1]).slice(-2)}-${("0" + daF[0]).slice(-2)}`);
                    dateE = new Date(`${daF[2]}-${("0" + daF[1]).slice(-2)}-${("0" + daF[0]).slice(-2)}`);

                    startTime = $(`#start_time`).val();
                    start_hour = start.split(':')[0];
                    start_minute = start.split(':')[1];
                    dateF.setHours(start_hour);
                    dateF.setMinutes(start_minute);

                    endTime = $(`#end_time`).val();
                    end_hour = end.split(':')[0];
                    end_minute = end.split(':')[1];
                    dateE.setHours(end_hour);
                    dateE.setMinutes(end_minute);
                }

                uploadToAlltitle = () => {
                    return new Promise((resolve, reject) => {

                        let data = JSON.parse(localStorage.getItem("edit_happy_hours_id"));
                        if (data && data.id) {

                            let id = data.id;
                            let title = $("#title").val();
                            let desc = $("#desc").val();
                            let titleTxtVal = $("#title").val().toString().replace(/\s+/g, '');

                            var fd = new FormData();

                            HappyHourDashDay.find({ filter: { where: { id } } }).$promise.then((hddRes) => {
                                if (hddRes && hddRes.length) {
                                    let { titleTxt, mainCategory, ownerId } = hddRes[0];

                                    let tDate = new Date();
                                    let ftdate = `${tDate.getFullYear()}-${("0" + (tDate.getMonth() + 1)).slice(-2)}-${("0" + tDate.getDate()).slice(-2)}T00:00:00.000Z`;

                                    HappyHourDashDay.find({
                                        filter: {
                                            where: {
                                                titleTxt, ownerId, mainCategory,
                                                date: { gte: ftdate }
                                            }
                                        }
                                    }).$promise.then((hddRes_1) => {
                                        if (hddRes_1 && hddRes_1.length) {
                                            if ($scope.primaryImgS && $scope.primaryImgS.length && $scope.primaryImgS[0].path) {
                                                for (let m in hddRes_1) {
                                                    var uid = uuidv4();
                                                    fd.append(`sports`, dataURItoBlob($scope.primaryImgS[0].path), `${uid}.png`);
                                                }
                                                setTimeout(function () {
                                                    $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                                                        .then((res) => {
                                                            if (res && res.data && res.data.isSuccess) {
                                                                hddRes_1.forEach(async (v, i) => {
                                                                    let dimg = [];
                                                                    dimg.push(res.data.result[i]);
                                                                    if (v.id) {
                                                                        await HappyHourDashDay.upsertWithWhere({ where: { id: v.id } }, {
                                                                            img: dimg, title, desc, titleTxt: titleTxtVal, startTime, start_hour,
                                                                            start_minute, startTimeUnix: dateF.getTime(), endTime, end_hour, end_minute,
                                                                            endTimeUnix: dateE.getTime(), status: $scope.statusEV
                                                                        })
                                                                        if (hddRes_1.length == (i + 1)) {
                                                                            setTimeout(function () {
                                                                                resolve({ isSuccess: true });
                                                                            }, 500);
                                                                        }
                                                                    }
                                                                });
                                                            } else loader.hidden()
                                                        }, () => loader.hidden())
                                                }, 300)
                                            } else {
                                                hddRes_1.forEach(async (v, i) => {
                                                    if (v.id) {
                                                        await HappyHourDashDay.upsertWithWhere({ where: { id: v.id } }, {
                                                            title, desc, titleTxt: titleTxtVal, startTime, start_hour,
                                                            start_minute, startTimeUnix: dateF.getTime(), endTime, end_hour, end_minute,
                                                            endTimeUnix: dateE.getTime(), status: $scope.statusEV
                                                        })
                                                        if (hddRes_1.length == (i + 1)) {
                                                            setTimeout(function () {
                                                                resolve({ isSuccess: true });
                                                            }, 500);
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    });
                                } else toastMsg(false, "Please try again!");
                            })
                        }
                    })
                }

                update = (updateObj) => {
                    let data = JSON.parse(localStorage.getItem("edit_happy_hours_id"));
                    if (data && data.id) {
                        let id = data.id;
                        HappyHourDashDay.upsertWithWhere({ where: { id } }, updateObj).$promise.then((res) => {
                            setTimeout(function () { $scope.editInit() }, 200);
                            loader.hidden();
                            $state.go("manage-happy-hours");
                            toastMsg(true, "Successfully updated!");
                        }, (err) => {
                            toastMsg(false, "Please try agian");
                            loader.hidden();
                        });
                    } else {
                        toastMsg(false, "Please try agian");
                        loader.hidden();
                    }
                }

                title = $("#title").val();
                desc = $("#desc").val();
                loader.visible();
                titleTxt = title.toString().replace(/\s+/g, '');
                if ($scope.updateAllHHour) {
                    uploadToAlltitle().then(() => {
                        setTimeout(function () {
                            $state.go("manage-happy-hours");
                        }, 200);
                    })
                } else {
                    update({
                        title, desc, startTime, start_hour, start_minute, endTime, end_hour, end_minute, titleTxt,
                        startTimeUnix: dateF.getTime(), endTimeUnix: dateE.getTime(), status: $scope.statusEV
                    });
                }
            }


            $scope.deleteImage = () => {
                let data = JSON.parse(localStorage.getItem("edit_happy_hours_id"));
                if (data && data.id) {
                    let id = data.id;
                    loader.visible();
                    // $(`#delete_${id}`).html('<i class="fas fa-spinner fa-spin"></i>').prop('disabled', true);
                    HappyHourDashDay.findOne({ filter: { where: { id } } }).$promise.then((res) => {
                        if (res) {
                            if (res && res.img && res.img.length) {
                                $http.post('/spaceFileDelete', { fileName: res.img[0].fileName });
                            }
                            HappyHourDashDay.upsertWithWhere({ where: { id } }, { img: [] }).$promise.then(() => {
                                toastMsg(true, "Successfully deleted!");
                                $scope.editInit();
                                setTimeout(function () {
                                    loader.hidden();
                                }, 500)
                            }, () => {
                                toastMsg(false, "Please try again!");
                                loader.hidden();
                            });
                        } else toastMsg(false, "Please try again");
                    })
                }
            }


            $scope.updateStatus = (status) => {
                if (status == 'Live') status = "Pending";
                else status = "Live";
                $scope.statusEV = status;
            }

            $scope.updateAllHappyHour = () => {
                $scope.updateAllHHour = true;
                $scope.updateHappyHour();
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
            }


        }])
    .controller('happyHoursManageCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'HappyHourDashDay', 'loader', 'getAllVenues',
        function ($scope, $state, $rootScope, Business, $http, HappyHourDashDay, loader, getAllVenues) {

            $scope.weekDays = [{ name: 'Sun', txt: 'Sunday', val: 'sunday' }, { name: 'Mon', txt: 'Monday', val: 'monday' }, { name: 'Tue', txt: 'Tuesday', val: 'tuesday' },
            { name: 'Wed', txt: 'Wednesday', val: 'wednesday' }, { name: 'Thu', txt: 'Thursday', val: 'thursday' }, { name: 'Fri', txt: 'Friday', val: 'friday' },
            { name: 'Sat', txt: 'Saturday', val: 'saturday' }];

            $scope.categories = ["Happy Hour", "Beer", "Wine", "Cocktail", "Spirit", "Cider"]

            toastMsg = (isVaild, msg) => {
                if (isVaild) toastr.success(msg);
                else toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.isBusinessSelect = false;

            $scope.happyHoursList = [];
            $scope.getHappyHours = (isSelect = '') => {
                if ($scope.userId) {
                    loader.visible();
                    let fDate = new Date();
                    let date = `${fDate.getFullYear()}-${("0" + (fDate.getMonth() + 1)).slice(-2)}-${("0" + fDate.getDate()).slice(-2)}T00:00:00.000Z`;

                    let fFilter = { filter: { where: { ownerId: $scope.userId, date: { gte: date } }, order: 'date asc' } };

                    if ($("#_daily_s_view").val() == 7 || $("#_daily_s_view").val() == 14) {
                        let LastDate = new Date();
                        LastDate.setDate(LastDate.getDate() + Number($("#_daily_s_view").val()));
                        let ltdate = `${LastDate.getFullYear()}-${("0" + (LastDate.getMonth() + 1)).slice(-2)}-${("0" + LastDate.getDate()).slice(-2)}T00:00:00.000Z`;
                        fFilter.filter.where.date = {
                            between: [date, ltdate]
                        };
                    } else if ($("#_daily_s_view").val() == "All") {
                        fFilter.filter.where.date = { gte: date };
                    }

                    if ($("#f-category").val() && $("#f-category").val() != 'select') {
                        fFilter.filter.where.mainCategory = $("#f-category").val();
                    }

                    HappyHourDashDay.find(fFilter).$promise.then((res) => {

                        function groupByKey(array, key) {
                            return array
                                .reduce((hash, obj) => {
                                    if (obj[key] === undefined) return hash;
                                    return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) })
                                }, {})
                        }

                        if (isSelect == 'category') {
                            $("#f-title").val('')
                            let values = [];

                            for (var k in groupByKey(res, 'titleTxt')) values.push(k);
                            $scope.dailyNamesList = [];
                            values.forEach(v => {
                                $scope.dailyNamesList.push(res.find(m => m.titleTxt == v));
                            })
                        }


                        if ($("#f-title").val() && $("#f-title").val() != 'select') {
                            $scope.happyHoursList = res.filter(m => m.titleTxt == $("#f-title").val());
                        } else $scope.happyHoursList = res;

                        setTimeout(function () {
                            loader.hidden();
                        }, 400)
                    });
                }
            }

            if (!$scope.userId) $scope.userId = $rootScope.currentUser.id;

            $scope.useremail = $rootScope.currentUser.email;
            $scope.userId = "";
            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                $scope.isBusinessSelect = true;
                loader.visible()
                setTimeout(function () {
                    $scope.businessSelection = getAllVenues.get();
                    loader.hidden();
                }, 1000)
            }

            if (!$rootScope.selectedVenue) $rootScope.selectedVenue = localStorage.getItem("selectedVenue");
            if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId) {
                $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                $scope.userId = $rootScope.selectedVenue.venueId;
                $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.venueId)
                if ($("#businessSubmit").hasClass('businessSubmit')) {
                    $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                }
                $scope.getHappyHours();
            }

            $scope.getBusinessName = () => {
                return $scope.businessSelection;
            };

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
                        $scope.getHappyHours();
                        $("#f-category,#f-title").val('');
                        $rootScope.selectedVenue = { ownerId: $scope.userId, venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                        localStorage.removeItem("selectedVenue");
                        localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userId, ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }));
                    }
                } else {
                    $("#businessErr").text('Please select the Business name');
                }
            }

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            //if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

            if ($scope.userDetails.isAdmin == false) {
                // $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                // $("#autocompleteBusiness").attr('disabled', true);
                $scope.userId = $scope.userDetails.id;
                $scope.getHappyHours();
                localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
            }

            $scope.firstOpenCal = () => {

                $("#datepicker_dd_s .datepicker-days .table-condensed tbody tr td").not('.old').not('.new').not('.disabled').removeClass('active').removeClass('cal-s');
                $('input[name^="r-s-check"]:checked').each(function (i) {
                    $(this).prop('checked', false);
                });
                $('input[name^="c-cal-check"]:checked').each(function (i) {
                    $(this).prop('checked', false);
                });

            }

            $scope.initiallDeal = (id) => {
                $("#create-Select-date").modal({ backdrop: 'static', keyboard: false });
                if (id) {

                    setTimeout(function () {

                        let d_values = $('.datepicker-switch').html();
                        let s_val = d_values.split(' ');
                        let monIndex = theMonths.findIndex(m => m == s_val[0]);
                        let current_index = (new Date()).getMonth();

                        localStorage.setItem('h_h_d_s', id);

                        if (current_index == monIndex) {

                            let data = $scope.happyHoursList.find(m => m.id == id);

                            let fDate = new Date();
                            let date = `${fDate.getFullYear()}-${("0" + (fDate.getMonth() + 1)).slice(-2)}-${("0" + fDate.getDate()).slice(-2)}T00:00:00.000Z`;

                            var lastDate = new Date(fDate.getFullYear(), fDate.getMonth() + 1, 0).getDate();

                            let endDate = `${fDate.getFullYear()}-${("0" + (fDate.getMonth() + 1)).slice(-2)}-${lastDate}T00:00:00.000Z`;

                            loader.visible();

                            if (data && data.mainCategory) {
                                HappyHourDashDay.find({
                                    filter: {
                                        where: {
                                            ownerId: $scope.userId, date: { between: [date, endDate] },
                                            mainCategory: data.mainCategory, titleTxt: data.titleTxt
                                        },
                                        fields: ["id", "date", "dateFormat"]
                                    }
                                }).$promise.then((res) => {
                                    if (res && res.length) {
                                        $(`#datepicker_dd_s .datepicker-days table tbody tr td`).each((i, v) => {
                                            if (!$(v).hasClass('old') && !$(v).hasClass('new') && !$(v).hasClass('disabled')) {
                                                let filDate = `${("0" + $(v).html()).slice(-2)}-${("0" + (fDate.getMonth() + 1)).slice(-2)}-${fDate.getFullYear()}`;
                                                if (res.some(m => m.dateFormat === filDate)) {
                                                    $(v).addClass('cal-s');
                                                }
                                            }
                                        });
                                        setTimeout(function () { loader.hidden(); }, 400);
                                    } else {
                                        toastMsg(false, 'Please try again!');
                                        loader.hidden();
                                    }
                                }, (err) => {
                                    toastMsg(false, 'Please try again!');
                                    loader.hidden();
                                })
                            }
                        } else {
                            let values = $(".datepicker-switch").html();
                            values = values.split(' ');

                            let index = theMonths.findIndex(m => m == values[0]);

                            let data = $scope.happyHoursList.find(m => m.id == id);

                            let fDate = new Date(`${values[1]}-${("0" + (index + 1)).slice(-2)}-01`);

                            var lastDate = new Date(fDate.getFullYear(), fDate.getMonth() + 1, 0).getDate();

                            let endDate = `${fDate.getFullYear()}-${("0" + (fDate.getMonth() + 1)).slice(-2)}-${lastDate}`;

                            let date = `${fDate.getFullYear()}-${("0" + (fDate.getMonth() + 1)).slice(-2)}-01`;

                            loader.visible();
                            if (data && data.mainCategory) {
                                HappyHourDashDay.find({
                                    filter: {
                                        where: {
                                            ownerId: $scope.userId, date: { gte: date, lte: endDate },
                                            mainCategory: data.mainCategory, titleTxt: data.titleTxt
                                        },
                                        fields: ["id", "date", "dateFormat"]
                                    }
                                }).$promise.then((res) => {

                                    setTimeout(function () {
                                        $("#datepicker_dd_s .datepicker-days .table-condensed tbody tr td").each(v => {
                                            $(v).removeClass('active');
                                            $(v).removeClass('cal-s');
                                        });
                                    }, 200);

                                    if (res && res.length) {
                                        setTimeout(function () {
                                            $(`#datepicker_dd_s .datepicker-days table tbody tr td`).each((i, v) => {
                                                if (!$(v).hasClass('old') && !$(v).hasClass('new') && !$(v).hasClass('disabled')) {
                                                    let filDate = `${("0" + $(v).html()).slice(-2)}-${("0" + (fDate.getMonth() + 1)).slice(-2)}-${fDate.getFullYear()}`;
                                                    if (res.some(m => m.dateFormat === filDate)) {
                                                        $(v).addClass('cal-s');
                                                    }
                                                }
                                            });
                                        }, 300);
                                        setTimeout(function () { loader.hidden(); }, 500);
                                    } else {
                                        toastMsg(false, 'Please try again!');
                                        loader.hidden();
                                    }
                                }, (err) => {
                                    toastMsg(false, 'Please try again!');
                                    loader.hidden();
                                })
                            }
                        }


                    }, 400);

                } else toastMsg(false, 'Please try again!');
            }

            $scope.getMonthData = (data) => {
                let n_date = new Date();

                $(`#datepicker_dd_s .datepicker-days table tbody tr td`).each((i, v) => {
                    if ($(v).hasClass('cal-s') || $(v).hasClass('active')) {
                        $(v).removeClass('cal-s');
                        $(v).removeClass('active');
                    }
                });

                if (n_date.getMonth() == data.split('_')[0]) {
                    //current month
                    loader.visible();
                    //h_h_d_s
                    let id = localStorage.getItem('h_h_d_s');
                    $scope.initiallDeal(id);

                } else {
                    //current month
                    loader.visible();

                    let year = data.split('_')[1];
                    let month = `${("0" + (parseInt(data.split('_')[0]) + 1)).slice(-2)}`;
                    let fDatef = '01';

                    let n_date = new Date(`${year}-${month}-${fDatef}`);

                    var lastDate = new Date(n_date.getFullYear(), n_date.getMonth() + 1, 0).getDate();

                    let endDate = `${n_date.getFullYear()}-${("0" + (n_date.getMonth() + 1)).slice(-2)}-${("0" + lastDate).slice(-2)}`;

                    let fDate = `${n_date.getFullYear()}-${("0" + (n_date.getMonth() + 1)).slice(-2)}-01`;

                    let id = localStorage.getItem('h_h_d_s');

                    let data_v = $scope.happyHoursList.find(m => m.id == id);

                    console.log(JSON.stringify({
                        filter: {
                            where: {
                                ownerId: $scope.userId,
                                date: { gte: `${fDate}T00:00:00.000Z`, lte: `${endDate}T00:00:00.000Z` },
                                mainCategory: data_v.mainCategory, titleTxt: data_v.titleTxt
                            },
                            fields: ["id", "date", "dateFormat"]
                        }
                    }));

                    HappyHourDashDay.find({
                        filter: {
                            where: {
                                ownerId: $scope.userId,
                                date: { gte: `${fDate}T00:00:00.000Z`, lte: `${endDate}T00:00:00.000Z` },
                                mainCategory: data_v.mainCategory, titleTxt: data_v.titleTxt
                            },
                            fields: ["id", "date", "dateFormat"]
                        }
                    }).$promise.then((res_l) => {
                        console.log(JSON.stringify(res_l));
                        $(`#datepicker_dd_s .datepicker-days table tbody tr td`).each((i, v) => {
                            if (!$(v).hasClass('old') && !$(v).hasClass('new') && !$(v).hasClass('disabled')) {
                                let filDate = `${("0" + $(v).html()).slice(-2)}-${("0" + (n_date.getMonth() + 1)).slice(-2)}-${n_date.getFullYear()}`;
                                if (res_l.some(m => m.dateFormat === filDate)) {
                                    $(v).addClass('cal-s');
                                }
                            }
                        });
                        setTimeout(function () { loader.hidden(); }, 400);
                    })
                }
            }

            $scope.modelClose = () => {
                $("#datepicker_dd_s .datepicker-days .table-condensed tbody tr td").removeClass('active').removeClass('cal-s');
                $('input[name^="r-s-check"]:checked').each(function (i) {
                    $(this).prop('checked', false);
                });
                $('input[name^="c-cal-check"]:checked').each(function (i) {
                    $(this).prop('checked', false);
                });
                $("#create-Select-date").modal('hide');
            }

            const convertTime12to24 = (time12h) => moment(time12h, 'hh:mm A').format('HH:mm');

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

            $scope.confirmCreateDeal = () => {

                $scope.special_dates = [...new Set($scope.special_dates)];

                let id = localStorage.getItem('h_h_d_s');

                loader.visible();

                HappyHourDashDay.find({
                    filter: {
                        where: {
                            id
                        }
                    }
                }).$promise.then((res) => {
                    if (res && res.length) {

                        let createDealObj = [];

                        $scope.special_dates.forEach(v => {

                            let daF = v.split('-');

                            let month = daF[1];
                            let year = daF[2];

                            let dateF = new Date(`${year}-${("0" + month).slice(-2)}-${("0" + daF[0]).slice(-2)}`);
                            let dateE = new Date(`${year}-${("0" + month).slice(-2)}-${("0" + daF[0]).slice(-2)}`);

                            let weekd = $scope.weekDays[dateF.getDay()];

                            let day = weekd.txt;

                            let monthTxt = ("0" + month).slice(-2);

                            let dateNo = ("0" + daF[0]).slice(-2);

                            let start_hour, start_minute, startTimeUnix, end_hour, end_minute, endTimeUnix;

                            let date = `${year}-${("0" + month).slice(-2)}-${("0" + daF[0]).slice(-2)}T00:00:00.000Z`;

                            let dateFormat = `${("0" + daF[0]).slice(-2)}-${("0" + month).slice(-2)}-${year}`;

                            let status = "Pending";

                            let isLive = false;

                            let { category, startTime, endTime, title, titleTxt, desc, ownerId, mainCategory, groupId } = res[0];

                            if (startTime) {
                                let sTime = convertTime12to24(startTime);
                                start_hour = sTime.split(':')[0];
                                start_minute = sTime.split(':')[1];
                                dateF.setHours(start_hour);
                                dateF.setMinutes(start_minute);
                            }
                            if (endTime) {
                                let eTime = convertTime12to24(endTime);
                                end_hour = eTime.split(':')[0];
                                end_minute = eTime.split(':')[1];
                                dateE.setHours(end_hour);
                                dateE.setMinutes(end_minute);
                            }

                            startTimeUnix = dateF.getTime();
                            endTimeUnix = dateE.getTime();

                            createDealObj.push({
                                date, dateFormat, category, status, startTime, start_hour, start_minute,
                                startTimeUnix, endTime, end_hour, end_minute, endTimeUnix, dateNo, year,
                                month, day, isLive, title, titleTxt, desc, ownerId, monthTxt, mainCategory, groupId
                            });
                        })


                        if (res[0].img[0].path) {

                            HappyHourDashDay.getBase64({ params: { url: res[0].img[0].path } })
                                .$promise.then((res_img) => {

                                    if (res_img && res_img.data && res_img.data.result) {

                                        var fd = new FormData();

                                        createDealObj.forEach(v => {
                                            var uid = uuidv4();
                                            fd.append(`happyHourDashDay_0`, dataURItoBlob(res_img.data.result), `${uid}.png`);
                                        })

                                        $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                                            .then((res_1) => {
                                                if (res_1 && res_1.data && res_1.data.isSuccess) {

                                                    createDealObj.forEach(async (v, i) => {
                                                        v.img = [];
                                                        v.img.push(res_1.data.result[i]);
                                                        await HappyHourDashDay.create(v).$promise.then(() => {
                                                            if (createDealObj.length == (i + 1)) {
                                                                $scope.getHappyHours();
                                                                $('#datepicker_dd_s').datepicker('setDates', []);
                                                                setTimeout(function () {
                                                                    toastMsg(true, 'Successfully created!');
                                                                    //toastMsg(true, 'Successfully created!');
                                                                    $('#create-Select-date').modal('hide');
                                                                    loader.hidden();
                                                                }, 300);
                                                            }
                                                        }, (err) => {
                                                            loader.hidden();
                                                            toastMsg(false, 'Please try again!');
                                                        });
                                                    });

                                                } else {
                                                    loader.hidden();
                                                    toastMsg(false, 'Please try again!');
                                                }
                                            }, () => {
                                                loader.hidden();
                                                toastMsg(false, 'Please try again!');
                                            })
                                    } else {
                                        loader.hidden();
                                        toastMsg(false, 'Please try again!');
                                    }
                                }, () => {
                                    loader.hidden();
                                    toastMsg(false, 'Please try again!');
                                })
                        } else {
                            loader.hidden();
                            toastMsg(false, 'Please try again!');
                        }
                    } else {
                        loader.hidden();
                        toastMsg(false, 'Please try again!');
                    }
                }, (err) => {
                    loader.hidden();
                    toastMsg(false, 'Please try again!');
                });

                //$('#create-Select-date').modal('hide');
            }

            $scope.special_dates = [];
            $scope.addDates = (arg) => {
                $scope.special_dates.push(arg);
            }

            $scope.clickDateAndFind = (data) => {

                let n_date = new Date(data.date);
                var lastDate = new Date(n_date.getFullYear(), n_date.getMonth() + 1, 0).getDate();
                let c_date = new Date();

                let endDate = `${n_date.getFullYear()}-${("0" + (n_date.getMonth() + 1)).slice(-2)}-${("0" + lastDate).slice(-2)}`;

                let fDate = `${n_date.getFullYear()}-${("0" + (n_date.getMonth() + 1)).slice(-2)}-01`;

                if (n_date.getMonth() == c_date.getMonth()) {
                    //current month
                    loader.visible();
                    let id = localStorage.getItem('h_h_d_s');
                    $scope.initiallDeal(id);
                } else {
                    let id = localStorage.getItem('h_h_d_s');
                    loader.visible();

                    let data_v = $scope.happyHoursList.find(m => m.id == id);
                    HappyHourDashDay.find({
                        filter: {
                            where: {
                                ownerId: $scope.userId,
                                date: { gte: fDate, lte: endDate },
                                mainCategory: data_v.mainCategory, titleTxt: data_v.titleTxt
                            }
                        }
                    }).$promise.then((res_l) => {
                        $(`#datepicker_dd_s .datepicker-days table tbody tr td`).each((i, v) => {
                            if (!$(v).hasClass('old') && !$(v).hasClass('new') && !$(v).hasClass('disabled')) {
                                let filDate = `${("0" + $(v).html()).slice(-2)}-${("0" + (n_date.getMonth() + 1)).slice(-2)}-${n_date.getFullYear()}`;
                                if (res_l.some(m => m.dateFormat === filDate)) {
                                    $(v).addClass('cal-s');
                                }
                            }
                        });
                        setTimeout(function () { loader.hidden(); }, 400);
                    })
                }
            }

            $scope.showTheMiddle = (event, i) => {
                $(`.middle_${i}`).css({ 'display': 'block', 'position': 'absolute', 'right': '2%' });
            }
            $scope.hiddenTheMiddle = (i) => {
                $(`.middle_${i}`).css({ 'display': 'none' })
            }

            $scope.deleteId = '';
            $scope.delete = (id) => {
                $scope.deleteId = '';
                $scope.deleteId = id;
                if (id) {
                    $("#deleteConfirmPopup").modal({ backdrop: 'static', keyboard: false });
                } else toastMsg(false, 'Please try again!');
            };

            $scope.confirmDelete = () => {
                let id = $scope.deleteId;
                if (id) {
                    loader.visible();
                    $("#deleteConfirmPopup").modal('hide');
                    HappyHourDashDay.findOne({ filter: { where: { id } } }).$promise.then((res) => {
                        if (res && res.img.length && res.img[0] && res.img[0].fileName) $http.post('/spaceFileDelete', { fileName: res.img[0].fileName });
                        HappyHourDashDay.remove({ params: { id } }).$promise.then((res) => {
                            $scope.getHappyHours();
                            toastMsg(true, 'Successfully deleted!');
                            loader.hidden();
                        }, () => { loader.hidden(); });
                    }, () => {
                        loader.hidden();
                        toastMsg(false, 'Please try again!');
                    });
                } else toastMsg(false, 'Please try again!');
            };

            $scope.hapyHours_view = {};
            $scope.viewHappyHours = (id) => {
                if (id) {
                    $scope.hapyHours_view = {};
                    loader.visible();
                    HappyHourDashDay.findOne({ filter: { where: { id } } }).$promise.then((res) => {
                        $scope.hapyHours_view = res;
                        $("#viewPopup").modal({ backdrop: 'static', keyboard: false });
                        setTimeout(function () { loader.hidden(); }, 200)
                    }, (err) => {
                        toastMsg(false, "Please try again!");
                        setTimeout(function () { loader.hidden(); }, 200)
                    })

                } else toastMsg(false, 'Please try again!');
            }

            $scope.edithappyHours = (id) => {
                if (id) {
                    localStorage.removeItem("edit_happy_hours_id");
                    localStorage.setItem("edit_happy_hours_id", JSON.stringify({ id }));
                    $state.go("edit-happy-hours");
                } else toastMsg(false, 'Please try again!');
            }

            $scope.changeStatus = (status, id) => {
                if (status && id) {
                    loader.visible();
                    status = (status == 'Pending' ? 'Live' : 'Pending');
                    HappyHourDashDay.upsertWithWhere({ where: { id } }, { status }).$promise.then(() => {
                        HappyHourDashDay.updateLiveDateAndTime({ params: { id } });
                        $("#goLiveOrPendingConfirm").modal('hide');
                        $scope.getHappyHours();
                        toastMsg(true, "Successfully updated!");
                        setTimeout(function () { loader.hidden() }, 500);
                    })
                } else toastMsg(false, 'Please try again!');
            }

            $scope.checkedOffers = () => {
                let cCnt = $('.tw-s-box').filter(':checked').length;
                $(".deleteAllDiv").css('display', 'none');
                if (cCnt >= 1) $(".deleteAllDiv").css('display', 'block');
            }

            $scope.DeleteToAll = () => {
                let values = $('input:checked').map(function (i, e) { return e.value }).toArray();
                if (values && values.length) {
                    loader.visible();
                    let ids = [];
                    for (let id of values) {
                        ids.push({ id })
                    }
                    if (ids && ids.length) {
                        HappyHourDashDay.find({ filter: { where: { or: ids } } }).$promise.then((res_d) => {
                            if (res_d && res_d.length) {
                                for (let { img } of res_d) {
                                    if (img && img.length) $http.post('/spaceFileDelete', { fileName: img[0].fileName });
                                }
                                setTimeout(function () {
                                    HappyHourDashDay.deleteAllDrinksSpecial({ params: { values } }).$promise.then((res) => {
                                        $scope.getHappyHours();
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
            }

        }]);