

angular
    .module('app')
    .controller('createDailySpecialCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'DailySpecial', 'loader', 'DailySpecialCategory', 'BistroHours', 'getAllVenues', function ($scope, $state, $rootScope, Business, $http, DailySpecial, loader, DailySpecialCategory, BistroHours, getAllVenues) {

        $scope.weekDays = [{ name: 'Sun', txt: 'Sunday', val: 'sunday' }, { name: 'Mon', txt: 'Monday', val: 'monday' }, { name: 'Tue', txt: 'Tuesday', val: 'tuesday' },
        { name: 'Wed', txt: 'Wednesday', val: 'wednesday' }, { name: 'Thu', txt: 'Thursday', val: 'thursday' }, { name: 'Fri', txt: 'Friday', val: 'friday' },
        { name: 'Sat', txt: 'Saturday', val: 'saturday' }];

        $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

        if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

        $scope.categories = [];
        $scope.getCategories = () => {
            loader.visible();
            BistroHours.find({ filter: { where: { ownerId: $scope.userId } } }).$promise.then((res) => {
                $scope.categories = res;
                setTimeout(function () {
                    loader.hidden();
                }, 500);
            })
        }

        const convertTime12to24 = (time12h) => moment(time12h, 'hh:mm A').format('HH:mm');

        toastMsg = (isVaild, msg) => {
            if (isVaild)
                toastr.success(msg);
            else
                toastr.error(msg);
            toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
        }

        $scope.isBusinessCall = false;
        $scope.getBusiness = () => {
            if ($scope.isBusinessCall == false) {
                $scope.isBusinessCall = true;
                loader.visible()
                setTimeout(function () {
                    $scope.businessSelection = getAllVenues.get();
                    loader.hidden();
                }, 1000)
            }
        }

        $scope.isBusinessSelect = false;

        $scope.useremail = $rootScope.currentUser.email;
        $scope.userId = "";

        if (!$rootScope.selectedVenue) $rootScope.selectedVenue = JSON.parse(localStorage.getItem("selectedVenue"));

        if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
            $scope.isBusinessSelect = true;
            $scope.getBusiness();
        }

        if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId) {
            $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
            $scope.userId = $rootScope.selectedVenue.ownerId;
            $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.ownerId)
            if ($("#businessSubmit").hasClass('businessSubmit')) {
                $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
            }
            $scope.getCategories();
            $scope.getBusiness();
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
                    $rootScope.selectedVenue = { venueId: $scope.userId, ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                    localStorage.removeItem("selectedVenue");
                    localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userId, ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }));
                    $scope.getCategories();
                }
            } else {
                $("#businessErr").text('Please select the Business name');
            }
        }

        if ($scope.userDetails.isAdmin == false) {
            // $("#autocompleteBusiness").val($scope.userDetails.businessName);
            localStorage.removeItem("selectedVenue");
            // $("#autocompleteBusiness").attr('disabled', true);
            $scope.userId = $scope.userDetails.id;
            localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userDetails.id, ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
            $scope.getCategories();
        }


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
                $("#createBtn").prop('disabled', false);
                $("#image-crop-md").modal('hide');
                // $("#img-pre").attr('src', imgSrc);
                // $(".img-h-s").css({ display: 'block' });
                // $(".img-c-s").css({ display: 'none' });
                // console.log(imgSrc);
                $scope.primaryImgS = [];
                $scope.primaryImgS.push({ path: imgSrc });
                $scope.$apply();
                $("#primary-img").val('');
            });

            $("#modalClose").on('click', function () {
                $("#image-crop-md").modal('hide');
                $("#primary-img").val('');
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

        $scope.create = () => {

            $("#title_err,#desc_err,#image_err,#cate_err").css({ display: 'none' });

            if ($scope.userId) {
                let isTrue = true, title, desc, titleTxt;

                if (!$("#title").val()) {
                    isTrue = false;
                    $("#title_err").css({ display: 'block' })
                }
                if (!$("#desc").val()) {
                    isTrue = false;
                    $("#desc_err").css({ display: 'block' })
                }

                uploadImg = () => {
                    return new Promise((resolve, reject) => {
                        var fd = new FormData();
                        for (let c of $scope.dailySpecialDates) {
                            var uid = uuidv4();
                            fd.append(`dailySpecial_0`, dataURItoBlob($scope.primaryImgS[0].path), `${uid}.png`);
                        }
                        $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                            .then((res) => {
                                if (res && res.data && res.data.isSuccess) {
                                    resolve({ isSuccess: true, img: res.data.result });
                                } else loader.hidden()
                            }, () => loader.hidden())
                    })
                }


                if (isTrue) {
                    title = $("#title").val();
                    desc = $("#desc").val();
                    titleTxt = $("#title").val().toString().replace(/\s+/g, '');

                    let create = () => {
                        loader.visible();

                        let newCategories = []

                        uploadImg().then(({ isSuccess, img }) => {

                            let m = 0;
                            for (let daF of $scope.dailySpecialDates) {

                                let { id, category, _category, startTime, endTime, startHour, startMinute, endHour, endMinute,
                                    startUnixTime, endUnixTime, day, dateFormat, date, dateNo, month, year, isEmptyEndTime } = daF;

                                newCategories.push({
                                    id, category, _category, startTime, endTime, startHour, startMinute, endHour, endMinute,
                                    startUnixTime, endUnixTime, day, dateFormat, date, dateNo, month, year, img: [img[m]], isEmptyEndTime
                                });

                                m = m + 1;
                            }

                            let groupId = uuidv4();

                            let status = "Pending";
                            if ($("#dailyspecial_btn_status").is(':checked')) status = 'Live';

                            DailySpecial.createAndUpdate({
                                params: {
                                    ownerId: $scope.userId, titleTxt, title, desc,
                                    categories: newCategories, groupId, status,
                                    isSpecial: ($scope.offerType == 'Regular' ? false : true)
                                }
                            }).$promise.then((res) => {
                                $("#desc,#title").val('');
                                $('input[name=category]:checked').map(function () { $(this).prop('checked', false); });
                                $("#dailySpecialImage").val('');
                                $("#datePicker").val('');
                                setTimeout(function () {
                                    loader.hidden();
                                    $state.go("manage-daily-special");
                                }, 300);
                                toastMsg(true, "Successfully created!");
                            }, () => {
                                toastMsg(false, "Please try again!");
                            });
                        });
                    }

                    // $scope.dailySpecialDates.forEach((d, i) => {

                    //     loader.visible();

                    //     let fDateF = d.date;

                    //     DailySpecial.find({ filter: { where: { ownerId: $scope.userId, title, date: fDateF } } })
                    //         .$promise.then((res) => {
                    //             if (res && res.length >= 1) {
                    //                 isTrue = false;
                    //                 toastMsg(false, "This title already exists. Please try again!");
                    //             }
                    //             if ((i + 1) == $scope.dailySpecialDates.length && isTrue) create();
                    //         }, () => {
                    //             toastMsg(false, "Please try again!");
                    //             loader.hidden();
                    //         })
                    // })

                    create();
                    loader.visible();
                } else toastMsg(false, "Please try again!");

            } else toastMsg(false, "Please select the business!");
        }

        $scope.redirectBistro = () => {
            $state.go('manage-bistro-hours');
        }

        $scope.specialCateList = [];
        $scope.getSpecialCategory = (arg) => {

            if ($scope.userId) {
                if (arg != 'Special') {
                    loader.visible();
                    $scope.getCategories();
                    // DailySpecialCategory.find({ filter: { where: { ownerId: $scope.userId } } })
                    //     .$promise.then((res) => {
                    //         setTimeout(function () { loader.hidden() }, 300);
                    //         $scope.specialCateList = res;
                    //     })
                }

            } else toastMsg(false, "Please try again!");
        }


        $scope.offerTypeDelete = (id) => {
            if (id) {
                localStorage.removeItem('dail_TyPe_R_e_id');
                localStorage.setItem('dail_TyPe_R_e_id', id);
                $("#deleteConfirmPopup").modal('show');
            } else toastMsg(false, "Please try again!");
        }

        $scope.confirmTyeDelete = () => {
            let id = localStorage.getItem('dail_TyPe_R_e_id');
            if (id) {
                loader.visible();
                DailySpecialCategory.deleteById({ id: id }).$promise.then((res) => {
                    DailySpecialCategory.find({ filter: { where: { ownerId: $scope.userId } } })
                        .$promise.then((res) => {
                            $scope.specialCateList = res;
                        })
                    setTimeout(function () {
                        loader.hidden();
                        $("#deleteConfirmPopup").modal('hide');
                    }, 400);
                })

            }
        }


        $scope.saveSubCategory = () => {
            if ($scope.userId) {
                let name = $("#_en_category_val").val();
                $("#_en_category_val_err").html('');
                let _name = '';
                if (name) _name = name.replace(/\s/g, '');
                if (name) {
                    loader.visible();
                    DailySpecialCategory.create({ ownerId: $scope.userId, name, _name, isSpecial: true })
                        .$promise.then(() => {
                            $("#_en_category_val").val('');
                            DailySpecialCategory.find({ filter: { where: { ownerId: $scope.userId } } })
                                .$promise.then((res) => {
                                    toastMsg("Successfully added!");
                                    setTimeout(function () { loader.hidden() }, 300);
                                    $scope.specialCateList = res;
                                })
                        })
                } else $("#_en_category_val_err").html("category is required!");

            } else toastMsg(false, "Please try again!");
        }


        $scope.dailySpecialDates = [];
        $scope.addDateAndTime = () => {

            let dates = $("#datePicker").val().toString().split(',');
            let isTrue = true;
            if (dates && dates.length == 0) {
                isTrue = false;
                toastMsg(false, "Please select the dates!");
            }

            let categories = [];
            if ($scope.offerType == 'Regular') {
                $('input[name=category]:checked').map(function () { categories.push($(this).val()); });
            }
            else {
                categories.push({
                    name: "Special",
                    _name: "Special"
                });
            }

            if (categories && categories.length == 0) {
                $("#cate_err").css({ display: 'block' })
                isTrue = false;
                toastMsg(false, "Please select the categories!");
            }

            if (isTrue) {

                if (dates && dates.length) {
                    loader.visible();

                    for (let cId of categories) {

                        for (let daF of dates) {

                            daF = daF.split('-');

                            let month = daF[1];
                            let year = daF[2];

                            let dateF = new Date(`${year}-${("0" + month).slice(-2)}-${("0" + daF[0]).slice(-2)}`);
                            let dateE = new Date(`${year}-${("0" + month).slice(-2)}-${("0" + daF[0]).slice(-2)}`);
                            let startHour, startMinute, endHour, endMinute, startTime, endTime;
                            let weekd = $scope.weekDays[dateF.getDay()];


                            let cate_val, category, _category, isEmptyEndTime = false;

                            if ($scope.offerType == 'Regular') {
                                cate_val = $scope.categories.find(m => m.id == cId);
                                category = cate_val.menu;
                                _category = cate_val.menu.toLowerCase().replace(/\s/g, '');
                                if (cate_val) {

                                    let cat_obj = cate_val[weekd.val];

                                    if (cat_obj && cat_obj.startTime && cat_obj.endTime) {
                                        startTime = cat_obj.startTime;
                                        endTime = cat_obj.endTime;
                                    }
                                }
                            } else if ($scope.offerType == 'Special') {
                                startTime = $("#startTime").val();
                                endTime = $("#endTime").val();
                                // category = cId.name; _category = cId._name;
                                category = "Special"; _category = "Special";
                            }

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
                            } else if (category == 'Special' && !endTime) {
                                endTime = "11:59 pm";
                                let eTime = convertTime12to24("11:59 pm");
                                endHour = eTime.split(':')[0];
                                endMinute = eTime.split(':')[1];
                                dateE.setHours(endHour);
                                dateE.setMinutes(endMinute);
                                isEmptyEndTime = true;
                            }

                            if (startTime && endTime && $scope.offerType == 'Regular') {
                                $scope.dailySpecialDates.push({
                                    id: cId, category, _category, startTime, endTime, startHour, startMinute, endHour, endMinute,
                                    startUnixTime: dateF.getTime(), endUnixTime: dateE.getTime(), day: weekd.txt,
                                    dateFormat: `${("0" + daF[0]).slice(-2)}-${("0" + month).slice(-2)}-${year}`, isSpecial: false,
                                    dateNo: `${("0" + daF[0]).slice(-2)}`, month: `${("0" + month).slice(-2)}`, year, isEmptyEndTime
                                });
                            } else if (startTime && $scope.offerType == 'Special') {
                                $scope.dailySpecialDates.push({
                                    category, _category, startTime, endTime, startHour, startMinute, endHour, endMinute,
                                    startUnixTime: dateF.getTime(), endUnixTime: dateE.getTime(), day: weekd.txt, isSpecial: true,
                                    dateFormat: `${("0" + daF[0]).slice(-2)}-${("0" + month).slice(-2)}-${year}`, isEmptyEndTime,
                                    dateNo: `${("0" + daF[0]).slice(-2)}`, month: `${("0" + month).slice(-2)}`, year
                                });
                            } else toastMsg(false, "Start or end time is missing. Please try again!");
                        }
                    }

                    setTimeout(function () {
                        //$("#datePicker").val('');
                        $("#endTime,#startTime").val('');
                        loader.hidden();
                    }, 200);
                } else toastMsg(false, "Please select the dates!");

            } else toastMsg(false, "Please try again!");
        }

    }])
    .controller('editDailySpecialCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'loader', 'DailySpecialCategory', 'DailySpecial', function ($scope, $state, $rootScope, Business, $http, loader, DailySpecialCategory, DailySpecial) {

        $scope.weekDays = [{ name: 'Sun', txt: 'Sunday', val: 'sunday' }, { name: 'Mon', txt: 'Monday', val: 'monday' }, { name: 'Tue', txt: 'Tuesday', val: 'tuesday' },
        { name: 'Wed', txt: 'Wednesday', val: 'wednesday' }, { name: 'Thu', txt: 'Thursday', val: 'thursday' }, { name: 'Fri', txt: 'Friday', val: 'friday' },
        { name: 'Sat', txt: 'Saturday', val: 'saturday' }];

        $scope.categories = [];
        $scope.getCategories = () => {
            loader.visible();
            DailySpecialCategory.find().$promise.then((res) => {
                $scope.categories = res;
                setTimeout(function () {
                    loader.hidden();
                }, 500);
            })
        }
        $scope.getCategories();

        const convertTime12to24 = (time12h) => moment(time12h, 'hh:mm A').format('HH:mm');

        toastMsg = (isVaild, msg) => {
            if (isVaild)
                toastr.success(msg);
            else
                toastr.error(msg);
            toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
        }

        $scope.editDailySpecialData = {};
        $scope.initDailySpecial = () => {
            let data = JSON.parse(localStorage.getItem("daily_special_edit_id"));
            if (data && data.id) {
                let id = data.id;
                $scope.editDailySpecialData = {};
                loader.visible();
                DailySpecial.findOne({ filter: { where: { id }, include: [{ relation: "dailySpecialCategory" }] } })
                    .$promise.then((res) => {
                        $scope.editDailySpecialData = res;
                        $scope.statusEV = res.status;
                        setTimeout(() => {
                            loader.hidden();
                        }, 300);
                    });
            } else toastMsg(false, "Please try again!");
        }
        $scope.initDailySpecial();

        $scope.updateStatus = (status) => {
            if (status == 'Live') status = "Pending";
            else status = "Live";
            $scope.statusEV = status;
        }

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
                $("#image-crop-md").modal('hide');
                // $("#img-pre").attr('src', imgSrc);
                // $(".img-h-s").css({ display: 'block' });
                // $(".img-c-s").css({ display: 'none' });
                var fd = new FormData();
                var uid = uuidv4();
                loader.visible();
                fd.append(`sports`, dataURItoBlob(imgSrc), `${uid}.png`);
                $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                    .then((res) => {
                        if (res && res.data && res.data.isSuccess) {
                            if (localStorage.getItem("daily_special_edit_id")) {
                                let data = JSON.parse(localStorage.getItem("daily_special_edit_id"));
                                if (data && data.id) {
                                    let id = data.id;
                                    $scope.primaryImgS = [];
                                    $scope.primaryImgS.push({ path: imgSrc })
                                    DailySpecial.upsertWithWhere({ where: { id } }, {
                                        img: res.data.result
                                    }).$promise.then((res_1) => {
                                        $scope.initDailySpecial();
                                    });
                                }
                            }
                        } else loader.hidden()
                    }, () => loader.hidden())
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
                            if (localStorage.getItem("daily_special_edit_id")) {
                                let data = JSON.parse(localStorage.getItem("daily_special_edit_id"));
                                if (data && data.id) {
                                    let id = data.id;
                                    $scope.primaryImgS = [];
                                    $scope.primaryImgS.push({ path: imgSrc })
                                    DailySpecial.upsertWithWhere({ where: { id } }, {
                                        img: res.data.result
                                    }).$promise.then((res_1) => {
                                        $scope.initDailySpecial();
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


        $scope.updateAllSp = false;
        $scope.updateDailySpecial = () => {

            let title, titleTxtDFD, desc, img = [];

            title = $("#title").val();
            titleTxtDFD = $("#title").val().toString().replace(/\s+/g, '');
            desc = $("#desc").val();

            let data = JSON.parse(localStorage.getItem("daily_special_edit_id"));
            if (data && data.id) {
                let id = data.id;

                update = (updateObj) => {
                    if (id) {
                        DailySpecial.find({ filter: { where: { id } } }).$promise.then((dRes) => {
                            if (dRes) {
                                DailySpecial.upsertWithWhere({ where: { id } }, updateObj).$promise.then((res) => {
                                    setTimeout(() => {
                                        loader.hidden();
                                        $state.go("manage-daily-special");
                                        toastMsg(true, "Successfully updated!");
                                    }, 500);

                                }, (err) => {
                                    toastMsg(false, "Please try agian");
                                    loader.hidden();
                                });
                            }
                        }, (dErr) => {
                            toastMsg(false, "Please try agian");
                            loader.hidden();
                        })
                    }
                }

                loader.visible();
                if ($scope.updateAllSp) {
                    DailySpecial.find({ filter: { where: { id } } }).$promise.then((dRes) => {
                        if (dRes && dRes.length) {
                            let { dailySpecialCategoryId, titleTxt, ownerId } = dRes[0];
                            if (dailySpecialCategoryId && titleTxt && ownerId) {

                                let tDate = new Date();
                                let ftdate = `${tDate.getFullYear()}-${("0" + (tDate.getMonth() + 1)).slice(-2)}-${("0" + tDate.getDate()).slice(-2)}T00:00:00.000Z`;

                                DailySpecial.find({ filter: { where: { titleTxt, ownerId, dailySpecialCategoryId, date: { gte: ftdate } } } })
                                    .$promise.then((fFvals) => {
                                        if (fFvals && fFvals.length) {
                                            if ($scope.primaryImgS && $scope.primaryImgS.length && $scope.primaryImgS[0].path) {
                                                var fd = new FormData();
                                                for (let m in fFvals) {
                                                    var uid = uuidv4();
                                                    fd.append(`dailySpecial_0`, dataURItoBlob($scope.primaryImgS[0].path), `${uid}.png`);
                                                }
                                                setTimeout(function () {
                                                    $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                                                        .then((res) => {
                                                            if (res && res.data && res.data.isSuccess) {
                                                                fFvals.forEach(async (v, i) => {
                                                                    let dimg = [];
                                                                    dimg.push(res.data.result[i]);
                                                                    if (v.id) {
                                                                        await DailySpecial.upsertWithWhere({ where: { id: v.id } }, {
                                                                            img: dimg, title, desc, titleTxt: titleTxtDFD, status: $scope.statusEV
                                                                        })
                                                                        if (fFvals.length == (i + 1)) {
                                                                            setTimeout(function () {
                                                                                $state.go("manage-daily-special");
                                                                                toastMsg(true, "Successfully updated!");
                                                                                loader.hidden()
                                                                            }, 500);
                                                                        }
                                                                    }
                                                                });
                                                            } else loader.hidden()
                                                        }, () => loader.hidden())
                                                }, 300)
                                            }
                                            else {
                                                fFvals.forEach(async (val, i) => {
                                                    if (val.id) {
                                                        await DailySpecial.upsertWithWhere({ where: { id: val.id } }, {
                                                            desc, title, titleTxt: titleTxtDFD,
                                                            status: $scope.statusEV
                                                        })
                                                        if (fFvals.length == (i + 1)) {
                                                            setTimeout(function () {
                                                                $state.go("manage-daily-special");
                                                                toastMsg(true, "Successfully updated!");
                                                                loader.hidden()
                                                            }, 500);
                                                        }
                                                    }
                                                })
                                            }
                                        }
                                    })
                            } else toastMsg(false, "Please try again!");
                        } else toastMsg(false, "Please try again!");
                    });
                }
                else update({
                    title, desc, titleTxt: titleTxtDFD, status: $scope.statusEV
                });
            }
        }

        $scope.updateDailySpecialAll = () => {
            $scope.updateAllSp = true;
            $scope.updateDailySpecial();
        }

        $scope.deleteImage = () => {
            let data = JSON.parse(localStorage.getItem("daily_special_edit_id"));
            if (data && data.id) {
                let id = data.id;
                loader.visible();
                //  $(`#delete_${id}`).html('<i class="fas fa-spinner fa-spin"></i>').prop('disabled', true);
                DailySpecial.findOne({ filter: { where: { id } } }).$promise.then((res) => {
                    if (res) {
                        if (res && res.img && res.img.length) $http.post('/spaceFileDelete', { fileName: res.img[0].fileName });
                        DailySpecial.upsertWithWhere({ where: { id } }, { img: [] }).$promise.then(() => {
                            toastMsg(true, "Successfully deleted!");
                            $scope.initDailySpecial();
                            setTimeout(function () {
                                loader.hidden();
                                // $(`#delete_${id}`).html('<i class="far fa-trash-alt"></i>').prop('disabled', false);
                            }, 1500)
                        });
                    } else toastMsg(false, "Please try again");
                })
            }
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
    .controller('dailySpecialManageCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'DailySpecial', 'loader', 'DailySpecialCategory', 'BistroHours', 'getAllVenues',
        function ($scope, $state, $rootScope, Business, $http, DailySpecial, loader, DailySpecialCategory, BistroHours, getAllVenues) {

            $scope.weekDays = [{ name: 'Sun', txt: 'Sunday', val: 'sunday' }, { name: 'Mon', txt: 'Monday', val: 'monday' }, { name: 'Tue', txt: 'Tuesday', val: 'tuesday' },
            { name: 'Wed', txt: 'Wednesday', val: 'wednesday' }, { name: 'Thu', txt: 'Thursday', val: 'thursday' }, { name: 'Fri', txt: 'Friday', val: 'friday' },
            { name: 'Sat', txt: 'Saturday', val: 'saturday' }];

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));


            // if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

            $scope.categories = [];
            $scope.getCategories = () => {
                loader.visible();
                BistroHours.find({ filter: { where: { ownerId: $scope.userId } } }).$promise.then((res) => {
                    $scope.categories = res;
                    setTimeout(function () {
                        loader.hidden();
                    }, 300);
                })
            }
            // $scope.getCategories();

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.isBusinessSelect = false;

            if (!$scope.userId) $scope.userId = $rootScope.currentUser.id;

            $scope.dailySpecailList = [];
            $scope.getList = (isSelect = '') => {
                if ($scope.userId) {
                    loader.visible();

                    let fDate = new Date();
                    let date = `${fDate.getFullYear()}-${("0" + (fDate.getMonth() + 1)).slice(-2)}-${("0" + fDate.getDate()).slice(-2)}T00:00:00.000Z`;

                    let fFilter = {
                        filter: { where: { ownerId: $scope.userId, date: { gte: date } }, order: "date asc", include: [{ relation: "dailySpecialCategory" }] }
                    }

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
                        fFilter.filter.where.category = $("#f-category").find(':selected').data("val");
                    }

                    DailySpecial.find(fFilter).$promise.then((res) => {

                        function groupByKey(array, key) {
                            return array
                                .reduce((hash, obj) => {
                                    if (obj[key] === undefined) return hash;
                                    return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) })
                                }, {})
                        }

                        if (isSelect == 'category') {
                            let values = [];

                            for (var k in groupByKey(res, 'titleTxt')) values.push(k);
                            $scope.dailyNamesList = [];
                            values.forEach(v => {
                                $scope.dailyNamesList.push(res.find(m => m.titleTxt == v));
                            })
                        }


                        if ($("#f-title").val() && $("#f-title").val() != 'select') {
                            $scope.dailySpecailList = res.filter(m => m.titleTxt == $("#f-title").val());
                        } else $scope.dailySpecailList = res;

                        loader.hidden();
                    });
                }
            }

            $scope.isBusinessCall = false;
            $scope.getBusiness = () => {
                if ($scope.isBusinessCall == false) {
                    $scope.isBusinessCall = true;
                    loader.visible()
                    setTimeout(function () {
                        $scope.businessSelection = getAllVenues.get();
                        loader.hidden();
                    }, 1500)
                }
            }

            $scope.isBusinessSelect = false;

            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                $scope.isBusinessSelect = true;
                $scope.getBusiness();
            }
            if (!$rootScope.selectedVenue) $rootScope.selectedVenue = JSON.parse(localStorage.getItem("selectedVenue"));
            if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId) {
                $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                $scope.userId = $rootScope.selectedVenue.ownerId;
                $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.ownerId)
                if ($("#businessSubmit").hasClass('businessSubmit')) {
                    $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                }
                $scope.getBusiness();
                $scope.getList();
                $scope.getCategories();
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
                            $rootScope.selectedVenue = { venueId: $scope.userId, ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                            localStorage.removeItem("selectedVenue");
                            localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userId, ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }));
                            $("#f-category,#f-title").val('');
                            $scope.getList();
                            $scope.getCategories();
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
                localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userDetails.id, ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
                $scope.getList();
                $scope.getCategories();
            }

            $scope.showTheMiddle = (event, i) => {
                $(`.middle_${i}`).css({ 'display': 'block', 'position': 'absolute', 'right': '2%' });
            }
            $scope.hiddenTheMiddle = (i) => {
                $(`.middle_${i}`).css({ 'display': 'none' })
            }

            $scope.deleteId = null;
            $scope.delete = (id) => {
                $scope.deleteId = id;
                localStorage.removeItem('dailySDiD');
                if (id) {
                    localStorage.setItem('dailySDiD', JSON.stringify({ id }));
                    $("#deleteConfirmPopup").modal({ backdrop: 'static', keyboard: false });
                } else toastMsg(false, 'Please try again!');
            };

            var theMonths = ["January", "February", "March", "April", "May",
                "June", "July", "August", "September", "October", "November", "December"];

            $scope.firstOpenCal = () => {

                $("#datepicker_dd_s .datepicker-days .table-condensed tbody tr td").not('.old').not('.new').not('.disabled').removeClass('active').removeClass('cal-s');
                $('input[name^="r-s-check"]:checked').each(function (i) {
                    $(this).prop('checked', false);
                });
                $('input[name^="c-cal-check"]:checked').each(function (i) {
                    $(this).prop('checked', false);
                });

            }

            $scope.createDeal = (id) => {
                $("#create-Select-date").modal({ backdrop: 'static', keyboard: false });
                if (id) {

                    setTimeout(function () {

                        let d_values = $('.datepicker-switch').html();
                        let s_val = d_values.split(' ');
                        let monIndex = theMonths.findIndex(m => m == s_val[0]);
                        let current_index = (new Date()).getMonth();

                        if (current_index == monIndex) {

                            localStorage.setItem('c_d_va_s', id);
                            let data = $scope.dailySpecailList.find(m => m.id == id);
                            let fDate = new Date();
                            let date = `${fDate.getFullYear()}-${("0" + (fDate.getMonth() + 1)).slice(-2)}-${("0" + fDate.getDate()).slice(-2)}T00:00:00.000Z`;

                            var lastDate = new Date(fDate.getFullYear(), fDate.getMonth() + 1, 0).getDate();

                            let endDate = `${fDate.getFullYear()}-${("0" + (fDate.getMonth() + 1)).slice(-2)}-${lastDate}T00:00:00.000Z`;

                            loader.visible();
                            if (data && data.category) {
                                DailySpecial.find({
                                    filter: {
                                        where: {
                                            ownerId: $scope.userId, date: { between: [date, endDate] },
                                            _category: data._category, titleTxt: data.titleTxt
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

                            let id = localStorage.getItem('c_d_va_s');

                            let index = theMonths.findIndex(m => m == values[0]);

                            let data = $scope.dailySpecailList.find(m => m.id == id);

                            let fDate = new Date(`${values[1]}-${("0" + (index + 1)).slice(-2)}-01`);

                            var lastDate = new Date(fDate.getFullYear(), fDate.getMonth() + 1, 0).getDate();

                            let endDate = `${fDate.getFullYear()}-${("0" + (fDate.getMonth() + 1)).slice(-2)}-${lastDate}`;

                            let date = `${fDate.getFullYear()}-${("0" + (fDate.getMonth() + 1)).slice(-2)}-01`;

                            loader.visible();
                            if (data && data.category) {
                                DailySpecial.find({
                                    filter: {
                                        where: {
                                            ownerId: $scope.userId, date: { gte: date, lte: endDate },
                                            _category: data._category, titleTxt: data.titleTxt
                                        },
                                        fields: ["id", "date", "dateFormat"]
                                    }
                                }).$promise.then((res) => {

                                    console.log(res);

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

            $scope.special_dates = [];
            $scope.addDates = (arg) => {
                $scope.special_dates.push(arg);
            }

            const convertTime12to24 = (time12h) => moment(time12h, 'hh:mm A').format('HH:mm');

            $scope.confirmCreateDeal = () => {

                $scope.special_dates = [...new Set($scope.special_dates)];

                let id = localStorage.getItem('c_d_va_s');

                loader.visible();

                DailySpecial.find({
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

                            let startHour, startMinute, endHour, endMinute, startUnixTime, endUnixTime;

                            let date = `${year}-${("0" + month).slice(-2)}-${("0" + daF[0]).slice(-2)}T00:00:00.000Z`;

                            let dateFormat = `${("0" + daF[0]).slice(-2)}-${("0" + month).slice(-2)}-${year}`;

                            let status = "Pending";

                            let isLive = false;

                            let { isSpecial, category, _category, startTime, endTime, title, titleTxt, desc, ownerId, dailySpecialCategoryId } = res[0];

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

                            startUnixTime = dateF.getTime();
                            endUnixTime = dateE.getTime();

                            createDealObj.push({
                                date, dateFormat, isSpecial, category, _category, status, startTime, startHour, startMinute, startUnixTime,
                                endTime, endHour, endMinute, endUnixTime, year, month, day, isLive, title, titleTxt, desc, ownerId, monthTxt,
                                dailySpecialCategoryId
                            });
                        })


                        if (res[0].img[0].path) {
                            DailySpecial.getBase64({ params: { url: res[0].img[0].path } })
                                .$promise.then((res_img) => {
                                    if (res_img && res_img.data && res_img.data.result) {
                                        var fd = new FormData();
                                        createDealObj.forEach(v => {
                                            var uid = uuidv4();
                                            fd.append(`dailySpecial_0`, dataURItoBlob(res_img.data.result), `${uid}.png`);
                                        })

                                        $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                                            .then((res_1) => {
                                                if (res_1 && res_1.data && res_1.data.isSuccess) {
                                                    createDealObj.forEach(async (v, i) => {
                                                        v.img = [];
                                                        v.img.push(res_1.data.result[i]);
                                                        await DailySpecial.create(v).$promise.then(() => {
                                                            if (createDealObj.length == (i + 1)) {
                                                                loader.hidden();
                                                                $scope.getList();
                                                                $('#datepicker_dd_s').datepicker('setDates', []);
                                                                setTimeout(function () {
                                                                    toastMsg(true, 'Successfully created!');
                                                                    $('#create-Select-date').modal('hide');
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
                    let id = localStorage.getItem('c_d_va_s');
                    $scope.createDeal(id);
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

                    let id = localStorage.getItem('c_d_va_s');

                    let data_v = $scope.dailySpecailList.find(m => m.id == id);

                    DailySpecial.find({
                        filter: {
                            where: {
                                ownerId: $scope.userId,
                                date: { gte: fDate, lte: endDate },
                                _category: data_v._category, titleTxt: data_v.titleTxt
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

            $scope.clickDateAndFind = (data) => {

                let n_date = new Date(data.date);
                var lastDate = new Date(n_date.getFullYear(), n_date.getMonth() + 1, 0).getDate();
                let c_date = new Date();

                let endDate = `${n_date.getFullYear()}-${("0" + (n_date.getMonth() + 1)).slice(-2)}-${("0" + lastDate).slice(-2)}`;

                let fDate = `${n_date.getFullYear()}-${("0" + (n_date.getMonth() + 1)).slice(-2)}-01`;

                if (n_date.getMonth() == c_date.getMonth()) {
                    //current month
                    loader.visible();
                    let id = localStorage.getItem('c_d_va_s');
                    $scope.createDeal(id);
                } else {
                    let id = localStorage.getItem('c_d_va_s');
                    loader.visible();

                    let data_v = $scope.dailySpecailList.find(m => m.id == id);
                    DailySpecial.find({
                        filter: {
                            where: {
                                ownerId: $scope.userId,
                                date: { gte: fDate, lte: endDate },
                                _category: data_v._category, titleTxt: data_v.titleTxt
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

            $scope.confirmDelete = () => {
                if (localStorage.getItem('dailySDiD')) {
                    var ids = JSON.parse(localStorage.getItem('dailySDiD'));
                    if (ids.id) {
                        loader.visible();
                        $("#deleteConfirmPopup").modal('hide');
                        DailySpecial.findOne({ filter: { where: { id: ids.id } } }).$promise.then((res) => {
                            if (res.id) {
                                if (res.img && res.img.length) $http.post('/spaceFileDelete', { fileName: res.img[0].fileName });
                                DailySpecial.removeOldData({ params: { id: ids.id } }).$promise.then((res) => {
                                    $scope.getList();
                                    toastMsg(true, 'Successfully deleted!');
                                    setTimeout(function () {
                                        loader.hidden();
                                    }, 200);
                                }, () => { loader.hidden(); });
                            } else toastMsg(false, 'Please try again!');
                        }, (err) => {
                            loader.hidden();
                            toastMsg(false, 'Please try again!');
                        });
                    } else toastMsg(false, 'Please try again!');
                }
            };

            $scope.dailySpecial_view = {};
            $scope.viewHappyHours = (id) => {
                if (id) {
                    loader.visible();
                    $scope.dailySpecial_view = {};
                    DailySpecial.findOne({ filter: { where: { id }, include: [{ relation: "dailySpecialCategory" }] } })
                        .$promise.then((res) => {
                            $scope.dailySpecial_view = res;
                            loader.hidden();
                            $("#viewPopup").modal({ backdrop: 'static', keyboard: false });
                        })
                } else toastMsg(false, 'Please try again!');
            }


            $scope.updateStatus = (id, status) => {
                if (id) {
                    loader.visible();
                    status = (status == 'Pending' ? 'Live' : 'Pending');
                    DailySpecial.upsertWithWhere({ where: { id } }, { status }).$promise.then(() => {
                        DailySpecial.updateLiveDateAndTime({ params: { id } }).$promise.then(() => {
                            $scope.getList();
                        });
                        toastMsg(true, "Successfully updated!");
                        setTimeout(function () { loader.hidden() }, 500);
                    }, () => {
                        toastMsg(false, "Please try again!");
                        setTimeout(function () { loader.hidden() }, 200);
                    })
                } else toastMsg(false, "Please try again!");
            }

            $scope.editDailySpecial = (id) => {
                if (id) {
                    localStorage.removeItem("daily_special_edit_id");
                    localStorage.setItem("daily_special_edit_id", JSON.stringify({ id }))
                    $state.go("edit-daily-special");
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
                        DailySpecial.find({ filter: { where: { or: ids } } }).$promise.then((res_d) => {
                            if (res_d && res_d.length) {
                                for (let { img } of res_d) {
                                    if (img && img.length) $http.post('/spaceFileDelete', { fileName: img[0].fileName });
                                }
                                setTimeout(function () {
                                    DailySpecial.deleteAllDailySpecial({ params: { values } }).$promise.then((res) => {
                                        $scope.getList();
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