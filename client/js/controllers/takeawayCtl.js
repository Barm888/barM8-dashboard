angular
    .module('app')
    .controller('manageTakeawayCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'loader', 'Takeaway',
        function ($scope, $state, $rootScope, Business, $http, loader, Takeaway) {

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.takeawayList = [];
            $scope.getTakeaway = (isSelect = '') => {
                let fDate = new Date();
                let date = `${fDate.getFullYear()}-${("0" + (fDate.getMonth() + 1)).slice(-2)}-${("0" + fDate.getDate()).slice(-2)}T00:00:00.000Z`;

                let fFilter = {
                    filter: { where: { ownerId: $scope.userId, date: { gte: date } }, order: "date asc" }
                }

                if ($("#_takeaway_view").val() == 7 || $("#_takeaway_view").val() == 14) {
                    let LastDate = new Date();
                    LastDate.setDate(LastDate.getDate() + Number($("#_takeaway_view").val()));
                    let ltdate = `${LastDate.getFullYear()}-${("0" + (LastDate.getMonth() + 1)).slice(-2)}-${("0" + LastDate.getDate()).slice(-2)}T00:00:00.000Z`;
                    fFilter.filter.where.date = {
                        between: [date, ltdate]
                    };
                } else if ($("#_takeaway_view").val() == "All") {
                    fFilter.filter.where.date = { gte: date };
                }

                if ($("#_Takeaway_type").val() && $("#_Takeaway_type").val() != 'All') {
                    fFilter.filter.where.category = $("#_Takeaway_type").val();
                }

                Takeaway.find(fFilter).$promise.then((res) => {

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
                        $scope.takeAwayNamesList = [];
                        values.forEach(v => {
                            $scope.takeAwayNamesList.push(res.find(m => m.titleTxt == v));
                        })
                    }

                    if ($("#_takeaway_name").val() && $("#_takeaway_name").val() != 'select') {
                        $scope.takeawayList = res.filter(m => m.titleTxt == $("#_takeaway_name").val());
                    } else $scope.takeawayList = res;
                })
            }

            $scope.isBusinessSelect = false;

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

            $scope.userId = '';
            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                $scope.isBusinessSelect = true;
                Business.find({ filter: { where: { status: "active" }, fields: ["businessName", "id", "email"] } })
                    .$promise.then((res) => {
                        $scope.businessDelection = res;
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
                $scope.getTakeaway();
            }

            if ($scope.userDetails.isAdmin == false) {
                // $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                // $("#autocompleteBusiness").attr('disabled', true);
                $scope.userId = $scope.userDetails.id;
                localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
                $scope.getTakeaway();
            }

            $scope.getBusinessName = () => {
                return $scope.businessDelection;
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
                        $scope.getTakeaway();
                    }
                } else {
                    $("#businessErr").text('Please select the Business name');
                }
            }

            $scope.deleteId = null;
            $scope.delete = (id) => {
                $scope.deleteId = id;
                localStorage.removeItem('takeawaySDiD');
                if (id) {
                    localStorage.setItem('takeawaySDiD', JSON.stringify({ id }));
                    $("#deleteConfirmPopup").modal({ backdrop: 'static', keyboard: false });
                } else toastMsg(false, 'Please try again!');
            };

            $scope.checkedOffers = () => {
                let cCnt = $('.tw-s-box').filter(':checked').length;
                $(".deleteAllDiv").css('display', 'none');
                if (cCnt >= 1) $(".deleteAllDiv").css('display', 'block');
            }

            $scope.confirmDelete = () => {
                if (localStorage.getItem('takeawaySDiD')) {
                    var ids = JSON.parse(localStorage.getItem('takeawaySDiD'));
                    if (ids.id) {
                        loader.visible();
                        $("#deleteConfirmPopup").modal('hide');
                        Takeaway.findOne({ filter: { where: { id: ids.id } } }).$promise.then((res) => {
                            if (res.id) {
                                if (res.img && res.img.length) $http.post('/spaceFileDelete', { fileName: res.img[0].fileName });
                                Takeaway.removeOldData({ params: { id: ids.id } }).$promise.then((res) => {
                                    $scope.getTakeaway();
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

            $scope.showTheMiddle = (event, i) => {
                $(`.middle_${i}`).css({ 'display': 'block', 'position': 'absolute', 'right': '2%' });
            }
            $scope.hiddenTheMiddle = (i) => {
                $(`.middle_${i}`).css({ 'display': 'none' })
            }

            $scope.updateStatus = (id, status) => {
                if (id) {
                    loader.visible();
                    status = (status == 'Pending' ? 'Live' : 'Pending');
                    Takeaway.upsertWithWhere({ where: { id } }, { status }).$promise.then(() => {
                        Takeaway.updateLiveDateAndTime({ params: { id } });
                        $scope.getTakeaway();
                        toastMsg(true, "Successfully updated!");
                        setTimeout(function () { loader.hidden() }, 500);
                    })
                } else toastMsg(false, "Please try again!");
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
                        Takeaway.find({ filter: { where: { or: ids } } }).$promise.then((res_d) => {
                            if (res_d && res_d.length) {
                                for (let { img } of res_d) {
                                    if (img && img.length) $http.post('/spaceFileDelete', { fileName: img[0].fileName });
                                }
                                setTimeout(function () {
                                    Takeaway.deleteAllTakeaway({ params: { values } }).$promise.then((res) => {
                                        $scope.getTakeaway();
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


            $scope.takeawayView = (id) => {
                if (id) {
                    loader.visible();
                    Takeaway.find({ filter: { where: { id } } }).$promise.then((res) => {
                        if (res && res.length) {
                            $scope.tyVObj = res[0]
                            $("#viewPopup").modal({ backdrop: 'static', keyboard: false });
                            setTimeout(function () { loader.hidden(); }, 300);
                        } else {
                            toastMsg(false, "Please try again!");
                            setTimeout(function () { loader.hidden(); }, 300);
                        }
                    });
                } else toastMsg(false, "Please try again!");
            }

            $scope.editTakeaway = (id) => {
                if (id) {
                    localStorage.removeItem("take_away_edit_id");
                    localStorage.setItem("take_away_edit_id", JSON.stringify({ id }))
                    $state.go("edit-takeaway");
                } else toastMsg(false, 'Please try again!');
            }

        }])
    .controller('createTakeawayCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'loader', 'Takeaway',
        function ($scope, $state, $rootScope, Business, $http, loader, Takeaway) {

            $scope.weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            $scope.userId = '';
            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                Business.find({ filter: { where: { status: "active" }, "fields": ["businessName", "id", "email"] } }).$promise.then((res) => {
                    $scope.businessDelection = res;
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
            }

            if ($scope.userDetails.isAdmin == false) {
                localStorage.removeItem("selectedVenue");
                $scope.userId = $scope.userDetails.id;
                localStorage.setItem("selectedVenue", JSON.stringify({
                    ownerId: $scope.userDetails.id, venueId: $scope.userId,
                    venueName: $scope.userDetails.businessName
                }));
            }

            $scope.getBusinessName = () => {
                return $scope.businessDelection;
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
                    }
                } else {
                    $("#businessErr").text('Please select the Business name');
                }
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

            $scope.uploadImages = [];
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
                    $scope.uploadImages = [];
                    $scope.uploadImages.push(imgSrc);
                    $scope.$apply();
                    $("#create_takeaway_btn").prop("disabled", false);
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
                    $("#primary-img").val('');
                });
            }

            $scope.imageDelete = () => {
                loader.visible();
                $scope.uploadImages.splice(0, 1);
                setTimeout(function () { loader.hidden() }, 200)
            }

            $scope.replaceImg = () => {
                $("#primary-img").trigger('click'); return false;
            }

            $scope.saveTakeaway = () => {

                $("#startTimeErr,#endTimeErr,#title_err,#desc_err,#image_err").css({ display: 'none' });

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
                    if ($scope.uploadImages && $scope.uploadImages.length == 0) {
                        $("#image_err").css({ display: 'block' })
                        islTrue = false;
                    }

                    uploadImg = () => {
                        return new Promise((resolve, reject) => {
                            var fd = new FormData();

                            for (let i in $scope.taKeaDate) {
                                var uid = uuidv4();
                                fd.append(`takeaway_${i}`, dataURItoBlob($scope.uploadImages[0]), `${uid}.png`);
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
                        let category = $("#takeawayCategory").val();
                        let valueTxt = $('#valueTxt :selected').val();
                        let price = $("#price").val() || 0;

                        let create = () => {
                            loader.visible();

                            let newCategories = []

                            if ($scope.uploadImages && $scope.uploadImages.length) {
                                uploadImg().then(({ isSuccess, img }) => {

                                    let m = 0;
                                    for (let daF of $scope.taKeaDate) {

                                        if (daF.startTime && daF.endTime) {
                                            newCategories.push({
                                                category, _category: category.toLowerCase().replace(/\s/g, ''),
                                                startTime: daF.startTime, endTime: daF.endTime, startHour: daF.startHour,
                                                startMinute: daF.startMinute, endHour: daF.endHour, endMinute: daF.endMinute, day: daF.day,
                                                startUnixTime: daF.startUnixTime, endUnixTime: daF.endUnixTime,
                                                dateFormat: daF.dateFormat, date: daF.date,
                                                dateNo: daF.dateNo, year: daF.year, img: [img[m]]
                                            });
                                        } else toastMsg(false, "Start or end time is missing. Please try again!");
                                        m = m + 1;
                                    }

                                    let groupId = uuidv4();

                                    let status = "Pending";
                                    if ($("#takeaway_status").is(':checked')) status = 'Live';

                                    Takeaway.createAndUpdate({
                                        params: {
                                            ownerId: $scope.userId, titleTxt, title, desc, valueTxt,
                                            categories: newCategories, groupId, status, price
                                        }
                                    }).$promise.then((res) => {
                                        $("#desc,#title").val('');
                                        $("#dailySpecialImage").val('');
                                        $(".time").val();
                                        $("#datePicker .datepicker-days .table-condensed tbody tr td").each((i, v) => {
                                            if ($(v).hasClass('active')) $(v).removeClass('active');
                                        });
                                        $(".styled-checkbox").prop('checked', false);
                                        setTimeout(function () {
                                            loader.hidden();
                                            $state.go("manage-takeaway");
                                        }, 300);
                                        toastMsg(true, "Successfully created!");
                                    });
                                });
                            } else {
                                toastMsg(false, "Image is required!");
                                setTimeout(function () {
                                    loader.hidden();
                                }, 300);
                            }
                        }

                        create();
                    }

                } else toastMsg(false, "Please select the business!");
            }

            $scope.taKeaDate = [];
            $scope.addDateAndTime = () => {

                let dates = $("#takeaway_date").val().toString().split(',');
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
                    let dValues = $scope.taKeaDate.find(m => m.date == `${year}-${("0" + month).slice(-2)}-${("0" + daF[0]).slice(-2)}T00:00:00.000Z`);
                    if (!dValues) {
                        let day = $scope.weekDays[dateF.getDay()];

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
                            $scope.taKeaDate.push({
                                startTime, endTime, startHour, startMinute, endHour, endMinute, day,
                                startUnixTime: dateF.getTime(), endUnixTime: dateE.getTime(),
                                dateFormat: `${("0" + daF[0]).slice(-2)}-${("0" + month).slice(-2)}-${year}`,
                                date: `${year}-${("0" + month).slice(-2)}-${("0" + daF[0]).slice(-2)}T00:00:00.000Z`,
                                dateNo: `${("0" + daF[0]).slice(-2)}`, month: `${("0" + month).slice(-2)}`, year
                            });
                        } else toastMsg(false, "Start or end time is missing. Please try again!");
                    }
                }

                setTimeout(function () {
                    $("#startTime,#endTime").val('');
                    $("#takeaway_date").val('');
                    loader.hidden();
                }, 200);

            }
        }])
    .controller('editTakeawayCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'loader', 'Takeaway',
        function ($scope, $state, $rootScope, Business, $http, loader, Takeaway) {

            $scope.weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

            $scope.uploadImages = [];
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
                    loader.visible();
                    $("#image-crop-md").modal('hide');
                    $scope.uploadImages = [];
                    $scope.uploadImages.push(imgSrc);
                    var fd = new FormData();
                    var uid = uuidv4();
                    let data = JSON.parse(localStorage.getItem("take_away_edit_id"));
                    if (data && data.id) {
                        let id = data.id;
                        fd.append(`sports`, dataURItoBlob($scope.uploadImages[0]), `${uid}.png`);
                        $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                            .then((res) => {
                                if (res && res.data && res.data.isSuccess) {
                                    Takeaway.upsertWithWhere({ where: { id } }, {
                                        img: res.data.result
                                    }).$promise.then(() => {
                                        $scope.initTakeaway();
                                    })
                                    // img = res.data.result;
                                    // resolve({ isSuccess: true });
                                } else loader.hidden()
                            }, () => loader.hidden())
                        $("#primary-img").val('');
                    } else {
                        toastMsg(false, "Please try again!");
                        loader.hidden()
                    }

                    // $("#img-pre").attr('src', imgSrc);
                    // $(".img-h-s").css({ display: 'block' });
                    // $(".img-c-s").css({ display: 'none' });

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
                    $scope.uploadImages = [];
                    $scope.uploadImages.push(imgSrc);
                    var fd = new FormData();
                    var uid = uuidv4();
                    let data = JSON.parse(localStorage.getItem("take_away_edit_id"));
                    if (data && data.id) {
                        let id = data.id;
                        fd.append(`sports`, dataURItoBlob($scope.uploadImages[0]), `${uid}.png`);
                        $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                            .then((res) => {
                                if (res && res.data && res.data.isSuccess) {
                                    Takeaway.upsertWithWhere({ where: { id } }, {
                                        img: res.data.result
                                    }).$promise.then(() => {
                                        $scope.initTakeaway();
                                    })
                                    // img = res.data.result;
                                    // resolve({ isSuccess: true });
                                } else loader.hidden()
                            }, () => loader.hidden())
                        $("#replace-i-img").val('');
                    } else {
                        toastMsg(false, "Please try again!");
                        loader.hidden()
                    }
                    //$("#createBtn").prop('disabled', false);
                    $("#image-crop-md").modal('hide');
                });

                $("#modalClose").on('click', function () {
                    $("#image-crop-md").modal('hide');
                });
            }

            $scope.updateTakeaway = () => {

                let title, desc, startTime, startHour, startMinute, endTime, endHour, endMinute;
                let img = [], titleTxt, dateF, dateE, price;

                let start, end;
                if ($(`#start_time`).val()) start = convertTime12to24($(`#start_time`).val());
                if ($(`#end_time`).val()) end = convertTime12to24($(`#end_time`).val());
                if (start && end) {
                    let daF = $scope.editTWObj.dateFormat.split('-');

                    dateF = new Date(`${daF[2]}-${("0" + daF[1]).slice(-2)}-${("0" + daF[0]).slice(-2)}`);
                    dateE = new Date(`${daF[2]}-${("0" + daF[1]).slice(-2)}-${("0" + daF[0]).slice(-2)}`);

                    startTime = $(`#start_time`).val();
                    startHour = start.split(':')[0];
                    startMinute = start.split(':')[1];
                    dateF.setHours(startHour);
                    dateF.setMinutes(startMinute);

                    endTime = $(`#end_time`).val();
                    endHour = end.split(':')[0];
                    endMinute = end.split(':')[1];
                    dateE.setHours(endHour);
                    dateE.setMinutes(endMinute);
                }

                update = (updateObj) => {
                    let data = JSON.parse(localStorage.getItem("take_away_edit_id"));
                    if (data && data.id) {
                        let id = data.id;
                        Takeaway.upsertWithWhere({ where: { id } }, updateObj).$promise.then((res) => {
                            setTimeout(function () { $scope.editInit() }, 200);
                            loader.hidden();
                            $state.go("manage-takeaway");
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
                price = $("#price").val();
                update({
                    title, desc, startTime, startHour, startMinute, endTime, endHour, endMinute, titleTxt,
                    startTimeUnix: dateF.getTime(), endTimeUnix: dateE.getTime(), price, status: $scope.statusEV
                });
            }

            $scope.updateStatus = (status) => {
                if (status == 'Live') status = "Pending";
                else status = "Live";
                $scope.statusEV = status;
            }

            $scope.updateAllTakeaway = () => {

                let title, desc, startTime, startHour, startMinute, endTime, endHour, endMinute;
                let img = [], titleText, dateF, dateE, price;

                let start, end;
                if ($(`#start_time`).val()) start = convertTime12to24($(`#start_time`).val());
                if ($(`#end_time`).val()) end = convertTime12to24($(`#end_time`).val());
                if (start && end) {
                    let daF = $scope.editTWObj.dateFormat.split('-');

                    dateF = new Date(`${daF[2]}-${("0" + daF[1]).slice(-2)}-${("0" + daF[0]).slice(-2)}`);
                    dateE = new Date(`${daF[2]}-${("0" + daF[1]).slice(-2)}-${("0" + daF[0]).slice(-2)}`);

                    startTime = $(`#start_time`).val();
                    startHour = start.split(':')[0];
                    startMinute = start.split(':')[1];
                    dateF.setHours(startHour);
                    dateF.setMinutes(startMinute);

                    endTime = $(`#end_time`).val();
                    endHour = end.split(':')[0];
                    endMinute = end.split(':')[1];
                    dateE.setHours(endHour);
                    dateE.setMinutes(endMinute);
                }

                title = $("#title").val();
                desc = $("#desc").val();
                loader.visible();
                titleText = title.toString().replace(/\s+/g, '');
                price = $("#price").val();


                let data = JSON.parse(localStorage.getItem("take_away_edit_id"));
                if (data && data.id) {
                    let id = data.id;
                    Takeaway.find({ filter: { where: { id } } }).$promise.then((res) => {
                        let { ownerId, titleTxt, category } = res[0];

                        let tDate = new Date();
                        let ftdate = `${tDate.getFullYear()}-${("0" + (tDate.getMonth() + 1)).slice(-2)}-${("0" + tDate.getDate()).slice(-2)}T00:00:00.000Z`;

                        Takeaway.find({ filter: { where: { titleTxt, ownerId, category, date: { gte: ftdate } } } })
                            .$promise.then((fFvals) => {
                                if (fFvals && fFvals.length) {
                                    if ($scope.uploadImages && $scope.uploadImages.length) {
                                        var fd = new FormData();
                                        for (let m in fFvals) {
                                            var uid = uuidv4();
                                            fd.append(`dailySpecial_0`, dataURItoBlob($scope.uploadImages[0]), `${uid}.png`);
                                        }

                                        $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                                            .then((res) => {
                                                if (res && res.data && res.data.isSuccess) {
                                                    fFvals.forEach(async (v, i) => {
                                                        let dimg = [];
                                                        dimg.push(res.data.result[i]);
                                                        if (v.id) {
                                                            await Takeaway.upsertWithWhere({ where: { id: v.id } }, {
                                                                img: dimg, title, desc, titleTxt: titleText, startTime, startHour,
                                                                startMinute, startTimeUnix: dateF.getTime(), endTimeUnix: dateE.getTime(),
                                                                endTime, endHour, endMinute, status: $scope.statusEV, price
                                                            })
                                                            if (fFvals.length == (i + 1)) {
                                                                setTimeout(function () {
                                                                    $state.go("manage-takeaway");
                                                                    toastMsg(true, "Successfully updated!");
                                                                    loader.hidden()
                                                                }, 500);
                                                            }
                                                        }
                                                    })
                                                }
                                            });
                                    } else {
                                        fFvals.forEach(async (v, i) => {
                                            if (v.id) {
                                                await Takeaway.upsertWithWhere({ where: { id: v.id } }, {
                                                    title, desc, titleTxt: titleText, startTime, startHour,
                                                    startMinute, startTimeUnix: dateF.getTime(), endTimeUnix: dateE.getTime(),
                                                    endTime, endHour, endMinute, status: $scope.statusEV, price
                                                })
                                                if (fFvals.length == (i + 1)) {
                                                    setTimeout(function () {
                                                        $state.go("manage-takeaway");
                                                        toastMsg(true, "Successfully updated!");
                                                        loader.hidden()
                                                    }, 500);
                                                }
                                            }
                                        })
                                    }
                                } else toastMsg(false, "Please try again!");
                            });
                    })
                } else toastMsg(false, "Please try again!");
            }

            $scope.editTWObj = {};
            $scope.initTakeaway = () => {
                let data = JSON.parse(localStorage.getItem("take_away_edit_id"));
                if (data && data.id) {
                    let id = data.id;
                    $scope.editTWObj = {};
                    loader.visible();
                    Takeaway.findOne({ filter: { where: { id } } })
                        .$promise.then((res) => {
                            $scope.editTWObj = res;
                            $scope.statusEV = res.status;
                            setTimeout(() => {
                                loader.hidden();
                            }, 300);
                        });
                } else toastMsg(false, "Please try again!");
            }
            $scope.initTakeaway();

            $scope.deleteImage = () => {
                let data = JSON.parse(localStorage.getItem("take_away_edit_id"));
                if (data && data.id) {
                    let id = data.id;
                    loader.visible();
                    //  $(`#delete_${id}`).html('<i class="fas fa-spinner fa-spin"></i>').prop('disabled', true);
                    Takeaway.findOne({ filter: { where: { id } } }).$promise.then((res) => {
                        if (res) {
                            if (res && res.img && res.img.length) $http.post('/spaceFileDelete', { fileName: res.img[0].fileName });
                            Takeaway.upsertWithWhere({ where: { id } }, { img: [] }).$promise.then(() => {
                                toastMsg(true, "Successfully deleted!");
                                $scope.initTakeaway();
                                loader.hidden();
                                setTimeout(function () {
                                    //$(`#delete_${id}`).html('<i class="far fa-trash-alt"></i>').prop('disabled', false);
                                    loader.hidden();
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

        }]);