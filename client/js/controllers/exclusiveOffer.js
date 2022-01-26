angular
    .module('app')
    .controller('createExclusiveOfferCtl', ['$scope', '$state', '$rootScope', 'Business', 'ExclusiveOffer', '$http', 'loader', 'ExclusiveSubCategory', 'BistroHours', 'getAllVenues', function ($scope, $state, $rootScope, Business, ExclusiveOffer, $http, loader, ExclusiveSubCategory, BistroHours, getAllVenues) {

        let weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

        $scope.offerTypes = [];
        $scope.getOfferTypes = (type) => {
            $scope.isEventOne = false;
            $scope.offerTypes = [];
            loader.visible();
            if (type == 'Drinks' || type == 'Event') {
                ExclusiveSubCategory.find({ filter: { where: { ownerId: $scope.userId } } }).$promise.then((res) => {
                    $scope.offerTypes = [{ name: "Happy Hour", _name: "happyHour", type: "Drinks", id: "happyHour_Drinks" },
                    { name: "Beer", _name: "beer", type: "Drinks", id: "beer_Drinks" },
                    { name: "Wine", _name: "wine", type: "Drinks", id: "wine_Drinks" },
                    { name: "Cocktail", _name: "cocktail", type: "Drinks", id: "cocktail_Drinks" },
                    { name: "Spirit", _name: "spirit", type: "Drinks", id: "spirit_Drinks" },
                    { name: "Cider", _name: "cider", type: "Drinks", id: "cider_Drinks" }];
                    if (res && res.length) {
                        for (let val of res) {
                            $scope.offerTypes.push(val);
                        }
                    }
                    setTimeout(function () { loader.hidden(); $scope.isEventOne = $scope.offerTypes.some(m => m.type == type); $scope.$apply(); }, 500)
                })
            } else if (type == 'Food') {
                BistroHours.find({ filter: { where: { ownerId: $scope.userId } } }).$promise.then((res_b) => {
                    if (res_b && res_b.length) {
                        for (let val of res_b) {
                            let { menu, monday, tuesday, wednesday, thursday, friday, saturday, sunday, id } = val;
                            $scope.offerTypes.push({ name: menu, _name: menu.toLowerCase(), monday, tuesday, wednesday, thursday, friday, saturday, sunday, id, type: "Food" });
                            $scope.isEventOne = true;
                        }
                    }
                    setTimeout(function () { loader.hidden(); $scope.isEventOne = $scope.offerTypes.some(m => m.type == type); }, 500)
                });
            }
        }

        $scope.redirectBistro = () => {
            $state.go('manage-bistro-hours');
        }

        $scope.offerTypeDelete = (id) => {
            if (id) {
                localStorage.removeItem('o_TyPe_R_e_id');
                localStorage.setItem('o_TyPe_R_e_id', id);
                $("#deleteConfirmPopup").modal('show');
            } else toastMsg(false, "Please try again!");
        }

        $scope.confirmTyeDelete = () => {
            let id = localStorage.getItem('o_TyPe_R_e_id');
            if (id) {
                loader.visible();
                ExclusiveSubCategory.deleteById({ id: id }).$promise.then((res) => {
                    $scope.getOfferTypes('Event');
                    setTimeout(function () {
                        loader.hidden();
                        $("#deleteConfirmPopup").modal('hide');
                    }, 400);
                })

            }
        }


        toastMsg = (isVaild, msg) => {
            if (isVaild)
                toastr.success(msg);
            else
                toastr.error(msg);
            toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
        }

        $scope.isBusinessSelect = false;

        $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

        if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

        $scope.userId = '';
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
            // $scope.getOfferTypes();
            //$scope.isBusinessSelect = true;
        }

        if ($scope.userDetails.isAdmin == false) {
            // $("#autocompleteBusiness").val($scope.userDetails.businessName);
            localStorage.removeItem("selectedVenue");
            //  $("#autocompleteBusiness").attr('disabled', true);
            $scope.userId = $scope.userDetails.id;
            localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
            // $scope.getOfferTypes();
        }

        $scope.getBusinessName = () => {
            return $scope.businessSelection;
        };

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
                $("#create_exclusive_btn").prop('disabled', false);
                $("#image-crop-md").modal('hide');
                // $("#img-pre").attr('src', imgSrc);
                // $(".img-h-s").css({ display: 'block' });
                // $(".img-c-s").css({ display: 'none' });
                $scope.primaryImgS = [];
                $scope.primaryImgS.push({ path: imgSrc });
                $scope.$apply();
                $("#OfferImage").val('');
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
            $("#OfferImage").trigger('click'); return false;
        }

        $scope.saveExclusiveOffer = () => {
            $("#title_err,#desc_err,#img-error,#available-err,#date-error,#per-customer-err-min").html('');
            let title, desc, availableCnt, isTrue = true, price, minCustomer, maxCustomer, titleTxt, isBooking = false;

            if (!$("#title").val()) {
                isTrue = false;
                $("#title_err").html('Name is required!');
            }
            if (!$("#desc").val()) {
                isTrue = false;
                $("#desc_err").html('Description is required!');
            }
            if ($scope.primaryImgS.length == 0) {
                isTrue = false;
                $("#img-error").html('Image is required!');
            }
            if (!$("#availableCnt").val()) {
                isTrue = false;
                $("#available-err").html('Available is required!');
            }
            if (!$("#perCustomerCntMin").val()) {
                isTrue = false;
                $("#per-customer-err-min").html('Required!');
            }
            if (!$("#perCustomerCntMax").val()) {
                isTrue = false;
                $("#per-customer-err-max").html('Required!');
            }
            if (!$("#price").val()) {
                isTrue = false;
                $("#price-err").html('Price is required!');
            }
            if (!$scope.userId) {
                isTrue = false;
                toastMsg(false, "Select the venue!");
            }

            uploadImg = () => {
                return new Promise((resolve, reject) => {
                    var fd = new FormData();

                    for (let j in $scope.dateAndCate) {
                        var uid = uuidv4();
                        fd.append(`sports`, dataURItoBlob($scope.primaryImgS[0].path), `${uid}.png`);
                    }

                    $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess) {
                                img = res.data.result;
                                resolve({ isSuccess: true, img });
                            } else {
                                loader.hidden()
                            }
                        }, () => loader.hidden())

                })
            }

            if (isTrue) {
                title = $("#title").val();
                desc = $("#desc").val();
                availableCnt = $("#availableCnt").val();
                minCustomer = $("#perCustomerCntMin").val();
                maxCustomer = $("#perCustomerCntMax").val();
                titleTxt = $("#title").val().toString().replace(/\s+/g, '');
                isBooking = $("#isBooking_req").is(':checked');

                loader.visible();

                if ($scope.dateAndCate && $scope.dateAndCate.length) {

                    if ($scope.primaryImgS && $scope.primaryImgS.length && $scope.primaryImgS[0].path) {
                        uploadImg().then((res) => {
                            if (res && res.isSuccess) {
                                let img = res.img;

                                price = $("#price").val();

                                let status = 'Pending';

                                if ($("#offer_btn_status").is(':checked')) status = 'Live';

                                ExclusiveOffer.createAndUpdate({
                                    params: {
                                        title, desc, availableCnt, img, ownerId: $scope.userId, dateAndCate: $scope.dateAndCate,
                                        price, minCustomer, maxCustomer, titleTxt, status, isBooking
                                    }
                                }).$promise.then(() => {
                                    setTimeout(function () {
                                        toastMsg(true, "Successfully created!");
                                        $("#title,#desc,#availableCnt").val(null);
                                        $(".img-bkg").attr('src', '');
                                        $("#perCustomerCntMin,#perCustomerCntMax,#price").val('');
                                        $state.go('manage-offer');
                                        loader.hidden();
                                    }, 400)
                                }, () => {
                                    loader.hidden();
                                    toastMsg(false, "Please try again!");
                                });
                            }
                        });
                    } else {
                        loader.hidden();
                        toastMsg(false, "Image is required!");
                    }

                } else {
                    loader.hidden();
                    toastMsg(false, "Please select the dates and type!");
                }
            } else {
                loader.hidden();
                toastMsg(false, "Please try again!");
            }
        }

        $scope.offerTypeOnChange = (arg) => {
            if ($(`#${$(arg.target).val()}`).is(':checked')) {
                let id = $(`#${$(arg.target).val()}`).data('idvalues');
                $(`#_start_time_${id},#_end_time_${id}`).val('').prop('disabled', false);
            } else {
                let id = $(`#${$(arg.target).val()}`).data('idvalues');
                $(`#_start_time_${id},#_end_time_${id}`).val('').prop('disabled', true);
            }
        }

        $scope.saveSubCategory = () => {
            if ($scope.userId) {
                $("#_en_category_val_err,#_en_category_st_time_err,#_en_category_end_time_err").text('');
                let type = $("#offerTypeCategory").val();
                let name = $("#_en_category_val").val();
                let _name = '';
                if (name) _name = name.replace(/\s/g, '');

                let start = {}, end = {};
                if ($("#_en_category_val").val()) {
                    loader.visible();
                    ExclusiveSubCategory.create({ ownerId: $scope.userId, type, _name, name, start, end })
                        .$promise.then((res) => {
                            $("#_en_category_val,#_en_category_end_time,#_en_category_st_time").val('')
                            toastMsg(true, "Successfully added!");
                            setTimeout(function () { loader.hidden(); }, 300);
                            $scope.getOfferTypes('Event');
                        }, () => {
                            toastMsg(false, "Please try again!");
                            setTimeout(function () { loader.hidden(); }, 300)
                        })
                } else {
                    toastMsg(false, "Type is required!");
                }
            } else toastMsg(false, "Please try again!");
        }

        $scope.addDateAndTime = () => {

            let startTimeTxt, offerExpiryTimeTxt, startHour, startMinute, endHour,
                endMinute, offerType, subOfferType;

            if ($("#datePicker").val()) {
                let dates = $("#datePicker").val().toString().split(',');

                $scope.dateAndCate = [];
                for (let daF of dates) {

                    daF = daF.split('-');

                    let date = daF[0];

                    let month = daF[1];
                    let year = daF[2];

                    let offerDate = `${year}-${("0" + `${month}`).slice(-2)}-${("0" + `${date}`).slice(-2)}T00:00:00.000Z`;
                    let offerDateTxt = `${("0" + `${date}`).slice(-2)}-${("0" + `${month}`).slice(-2)}-${year}`;

                    let dateSet = new Date(`${year}-${("0" + `${month}`).slice(-2)}-${("0" + `${date}`).slice(-2)}`);

                    let dateEndSet = new Date(`${year}-${("0" + `${month}`).slice(-2)}-${("0" + `${date}`).slice(-2)}`);

                    offerType = $("#offerTypeCategory").val();

                    let isErrorDE = true;

                    if (offerType == 'Food') {
                        let chLength = $('input[name="sub_category_offer"]:checked').length;
                        if (chLength != 0) {
                            $('input[name="sub_category_offer"]:checked').each(function () {
                                if (this.value && $("#datePicker").val()) {

                                    loader.visible();

                                    setTimeout(function () {
                                        $("#datePicker").val('');
                                        loader.hidden();
                                    }, 300);

                                    let id = this.value;
                                    startTimeTxt = offerExpiryTimeTxt = subOfferType = '';

                                    subOfferType = $(`#${this.value}`).data('cname');

                                    let weekd = weekdays[dateSet.getDay()];

                                    let data = $scope.offerTypes.find(m => m.id == id);

                                    if (data) {
                                        let times = data[weekd];
                                        if (times && times.startTime && times.endTime) {

                                            startTimeTxt = times.startTime;
                                            offerExpiryTimeTxt = times.endTime;

                                            let startTimeCvt = convertTime12to24(times.startTime);
                                            let endTimeCvt = convertTime12to24(times.endTime);
                                            let startTimeCvt_1 = startTimeCvt.split(':');
                                            let endTimeCvt_1 = endTimeCvt.split(':');

                                            if (startTimeCvt) {
                                                dateSet.setHours(startTimeCvt_1[0]);
                                                dateSet.setMinutes(startTimeCvt_1[1]);
                                            }
                                            if (offerExpiryTimeTxt) {
                                                dateEndSet.setHours(endTimeCvt_1[0]);
                                                dateEndSet.setMinutes(endTimeCvt_1[1]);
                                            }

                                            if (offerExpiryTimeTxt && startTimeTxt) {
                                                $scope.dateAndCate.push({
                                                    offerDate, offerDateTxt, month, date, year,
                                                    offerType, subOfferType, startTimeTxt, startHour: startTimeCvt_1[0], startMinute: startTimeCvt_1[1],
                                                    offerExpiryTimeTxt, endHour: endTimeCvt_1[0], endMinute: endTimeCvt_1[1], startTime: dateSet.getTime(),
                                                    endTime: dateEndSet.getTime()
                                                });
                                            }
                                        }
                                    }
                                } else {
                                    isErrorDE = false;
                                    isTrue = false;
                                    toastMsg(false, "Please select the type or date!");
                                }
                            });
                        } else {
                            isErrorDE = false;
                            isTrue = false;
                            toastMsg(false, "Please select the type!");
                        }

                    } else {
                        if ($("#rE_sA_time").val() && $("#rE_En_time").val()) {

                            startTimeTxt = offerExpiryTimeTxt = subOfferType = '';

                            isTrue = true;
                            startTimeTxt = $("#rE_sA_time").val();
                            offerExpiryTimeTxt = $("#rE_En_time").val();

                            loader.visible();

                            setTimeout(function () {
                                $("#datePicker").val('');
                                $("#rE_sA_time,#rE_En_time").val('');
                                loader.hidden();
                            }, 300);

                            $('input[name="sub_category_offer"]:checked').each(function () {
                                if (this.value) {

                                    subOfferType = $(`#${this.value}`).data('cname');

                                    let startTimeTxtConT = convertTime12to24(startTimeTxt);
                                    let endTimeTxtConT = convertTime12to24(offerExpiryTimeTxt);

                                    if (startTimeTxt) {
                                        startTimeTxtConT = startTimeTxtConT.split(':');
                                        if (startTimeTxtConT.length) {
                                            startHour = startTimeTxtConT[0];
                                            startMinute = startTimeTxtConT[1];
                                            dateSet.setHours(startHour);
                                            dateSet.setMinutes(startMinute);
                                        }
                                    }
                                    if (offerExpiryTimeTxt) {
                                        endTimeTxtConT = endTimeTxtConT.split(':');
                                        if (endTimeTxtConT.length) {
                                            endHour = endTimeTxtConT[0];
                                            endMinute = endTimeTxtConT[1];
                                            dateEndSet.setHours(endHour);
                                            dateEndSet.setMinutes(endMinute);
                                        }
                                    }

                                    if (offerExpiryTimeTxt && startTimeTxt) {
                                        $scope.dateAndCate.push({
                                            offerDate, offerDateTxt, month, date, year, offerType, subOfferType,
                                            startTimeTxt, startHour, startMinute, offerExpiryTimeTxt, endHour, endMinute,
                                            startTime: dateSet.getTime(), endTime: dateEndSet.getTime()
                                        });
                                    }
                                } else {
                                    isErrorDE = false;
                                    isTrue = false;
                                    toastMsg(false, "Please select the type!");
                                }
                            });
                        } else if (isErrorDE) {
                            isErrorDE = false;
                            isTrue = false;
                            toastMsg(false, "Start and End time is required!");
                        }
                    }
                }
            } else {
                isErrorDE = false;
                isTrue = false;
                toastMsg(false, "Please try again!");
            }

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
                        // $scope.isBusinessSelect = true;
                        $scope.userId = arg;
                        $rootScope.selectedVenue = { ownerId: $scope.userId, venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                        localStorage.removeItem("selectedVenue");
                        localStorage.setItem("selectedVenue", JSON.stringify({
                            venueId: $scope.userId, ownerId: $scope.userId,
                            venueName: $("#autocompleteBusiness").val()
                        }));
                        // $scope.getOfferTypes();
                    }
                } else {
                    $("#businessErr").text('Please select the Business name');
                }
            }
        }
    }])
    .controller('manageExclusiveOfferCtl', ['$scope', '$state', '$rootScope', 'Business', 'ExclusiveOffer', '$http', 'loader', 'ExclusiveSubCategory', 'getAllVenues', function ($scope, $state, $rootScope, Business, ExclusiveOffer, $http, loader, ExclusiveSubCategory, getAllVenues) {

        toastMsg = (isVaild, msg) => {
            if (isVaild)
                toastr.success(msg);
            else
                toastr.error(msg);
            toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
        }

        $("#_offer_type,#_offer_category").prop('disabled', true);
        $scope.offerTypes = [];
        $scope.getOfferTypes = () => {
            $scope.offerType = 'Food';
            $scope.offerTypes = [];
            loader.visible();
            $("#_offer_type,#_offer_category").prop('disabled', false);
            ExclusiveSubCategory.find({ filter: { where: { ownerId: $scope.userId } } }, (res) => {
                $scope.offerTypes = [{ name: "Happy Hour", _name: "happyHour", type: "Drinks" },
                { name: "Beer", _name: "beer", type: "Drinks" },
                { name: "Wine", _name: "wine", type: "Drinks" },
                { name: "Cocktail", _name: "cocktail", type: "Drinks" },
                { name: "Spirit", _name: "spirit", type: "Drinks" },
                { name: "Cider", _name: "cider", type: "Drinks" },
                { name: "Breakfast", _name: "breakfast", type: "Food" },
                { name: "Lunch", _name: "lunch", type: "Food" },
                { name: "Dinner", _name: "dinner", type: "Food" },
                { name: "Allday", _name: "allday", type: "Food" },
                { name: "Brunch", _name: "brunch", type: "Food" }];
                if (res && res.length) for (let val of res) $scope.offerTypes.push(val);
                setTimeout(function () { loader.hidden(); }, 500)
            })
        }

        $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

        $scope.couponsList = [];
        $scope.offerNamesList = [];
        $scope.getAllOffers = () => {
            loader.visible();
            let tDate = new Date();

            let ftdate = `${tDate.getFullYear()}-${("0" + (tDate.getMonth() + 1)).slice(-2)}-${("0" + tDate.getDate()).slice(-2)}T00:00:00.000Z`;

            let filterData = { filter: { where: { ownerId: $scope.userId }, order: "offerDate asc" } };

            if ($("#_offer_view").val() == 7 || $("#_offer_view").val() == 14) {
                let LastDate = new Date();
                LastDate.setDate(LastDate.getDate() + Number($("#_offer_view").val()));
                let ltdate = `${LastDate.getFullYear()}-${("0" + (LastDate.getMonth() + 1)).slice(-2)}-${("0" + LastDate.getDate()).slice(-2)}T00:00:00.000Z`;
                filterData.filter.where.offerDate = { between: [ftdate, ltdate] };
            } else if ($("#_offer_view").val() == "All") {
                filterData.filter.where.offerDate = { gte: ftdate };
            }

            let filterFun = () => {
                ExclusiveOffer.find(filterData)
                    .$promise.then((res) => {

                        if ($("#_offer_type").val() && $("#_offer_type").val() != 'select' &&
                            $("#_offer_category").val() && $("#_offer_category").val() != 'select') {

                            function groupByKey(array, key) {
                                return array
                                    .reduce((hash, obj) => {
                                        if (obj[key] === undefined) return hash;
                                        return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) })
                                    }, {})
                            }

                            if ($("#_offer_offer_name").val() && $("#_offer_offer_name").val() == 'select') {
                                $scope.offerNamesList = [];
                                let values = [];

                                for (var k in groupByKey(res, 'titleTxt')) values.push(k);

                                values.forEach(v => {
                                    $scope.offerNamesList.push(res.find(m => m.titleTxt == v));
                                })
                            }
                        }
                        setTimeout(function () { loader.hidden(); }, 400);
                        $scope.couponsList = res;
                    }, (err) => {
                        setTimeout(function () { loader.hidden(); }, 100);
                    })
            }
            if ($("#_offer_type").val() && $("#_offer_type").val() != 'All') {
                filterData.filter.where.offerType = $("#_offer_type").val();
            }
            if ($("#_offer_category").val() && $("#_offer_category").val() != 'select') {
                filterData.filter.where.subOfferType = $("#_offer_category").val();
            }
            if ($("#_offer_offer_name").val() && $("#_offer_offer_name").val() != 'select') {
                filterData.filter.where.titleTxt = $("#_offer_offer_name").val();
            }
            filterFun();
        }

        if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
            $scope.isBusinessSelect = true;
            loader.visible()
            setTimeout(function () {
                $scope.businessSelection = getAllVenues.get();
                loader.hidden();
            }, 1500)
        }

        $scope.isBusinessSelect = false;

        if (!$rootScope.selectedVenue) $rootScope.selectedVenue = JSON.parse(localStorage.getItem("selectedVenue"));
        if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId) {
            $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
            $scope.userId = $rootScope.selectedVenue.ownerId;
            $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.ownerId)
            if ($("#businessSubmit").hasClass('businessSubmit')) {
                $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
            }
            $scope.getAllOffers();
            $scope.getOfferTypes();
        }

        $scope.getBusinessName = () => {
            return $scope.businessSelection;
        };

        if ($scope.userDetails.isAdmin == false) {
            localStorage.removeItem("selectedVenue");
            $scope.userId = $scope.userDetails.id;
            localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userDetails.id, ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
            $scope.getAllOffers();
            $scope.getOfferTypes();
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
                        localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userId, ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }));
                        $scope.getAllOffers();
                        $scope.getOfferTypes();
                    }
                } else {
                    $("#businessErr").text('Please select the Business name');
                }
            }
        }

        $scope.showTheMiddle = (event, i) => {
            $(`.middle_${i}`).css({ 'display': 'block', 'position': 'absolute', 'right': '2%' });
        }
        $scope.hiddenTheMiddle = (i) => {
            $(`.middle_${i}`).css({ 'display': 'none' })
        }

        $scope.couponView = (id) => {
            if (id) {
                localStorage.removeItem('c-view-id');
                localStorage.setItem("c-view-id", JSON.stringify({ id }));
                $state.go('view-coupon-offer');
            }
        }

        $scope.couponEdit = (id) => {
            if (id) {
                localStorage.removeItem('c-edit-id');
                localStorage.setItem("c-edit-id", JSON.stringify({ id }));
                $state.go('edit-coupon-offer');
            }
        }

        $scope.deleteConfirm = (id) => {
            if (id) {
                localStorage.removeItem('c-delete-id');
                localStorage.setItem("c-delete-id", JSON.stringify({ id }));
                $('#deleteConfirmPopup').modal({ backdrop: 'static', keyboard: false });
            } else toastMsg(true, "Please try again!");
        }

        $scope.updateStatus = (id, status) => {
            if (id) {
                loader.visible();
                status = (status == 'Pending' ? 'Live' : 'Pending');
                ExclusiveOffer.upsertWithWhere({ where: { id } }, { status }).$promise.then(() => {
                    ExclusiveOffer.updateLiveDateAndTime({ params: { id } });
                    setTimeout(function () { $scope.getAllOffers(); }, 300);
                    toastMsg(true, "Successfully updated!");
                    setTimeout(function () { loader.hidden() }, 500);
                })
            } else toastMsg(false, "Please try again!");
        }

        $scope.couponDelete = () => {
            let ids = JSON.parse(localStorage.getItem('c-delete-id'));
            if (ids && ids.id) {
                loader.visible();
                ExclusiveOffer.findOne({ id: ids.id }, (gRes) => {
                    if (gRes && gRes.img.length) $http.post('/spaceFileDelete', { fileName: gRes.img[0].fileName });
                    ExclusiveOffer.deleteCoupon({ params: { id: ids.id } }).$promise.then((res) => {
                        setTimeout(function () { loader.hidden(); }, 100);
                        toastMsg(true, "Successfully deleted!");
                        $('#deleteConfirmPopup').modal('hide');
                        $scope.getAllOffers();
                    }, (err) => {
                        toastMsg(false, "Please try again!");
                        $('#deleteConfirmPopup').modal('hide');
                        setTimeout(function () { loader.hidden(); }, 100);
                    });
                }, (err) => {
                    toastMsg(false, "Please try again!");
                    $('#deleteConfirmPopup').modal('hide');
                    setTimeout(function () { loader.hidden(); }, 100);
                })
            }
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
                    ExclusiveOffer.find({ filter: { where: { or: ids } } }).$promise.then((res_d) => {
                        if (res_d && res_d.length) {
                            for (let { img } of res_d) {
                                if (img && img.length) $http.post('/spaceFileDelete', { fileName: img[0].fileName });
                            }
                            setTimeout(function () {
                                ExclusiveOffer.deleteAllOffers({ params: { values } }).$promise.then((res) => {
                                    $scope.getAllOffers();
                                    $("#selectAllCheck").prop('checked', false);
                                    $(".deleteAllDiv").css('display', 'none');
                                    setTimeout(function () { loader.visible(); toastMsg(true, "Successfully deleted!") }, 500)
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

        $scope.firstOpenCal = () => {
            $("#datepicker_dd_s .datepicker-days .table-condensed tbody tr td").not('.old').not('.new').not('.disabled').removeClass('active').removeClass('cal-s');
            $('input[name^="r-s-check"]:checked').each(function (i) {
                $(this).prop('checked', false);
            });
            $('input[name^="c-cal-check"]:checked').each(function (i) {
                $(this).prop('checked', false);
            });
        }

        var theMonths = ["January", "February", "March", "April", "May",
            "June", "July", "August", "September", "October", "November", "December"];

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

                        let data = $scope.couponsList.find(m => m.id == id);

                        let fDate = new Date();
                        let date = `${fDate.getFullYear()}-${("0" + (fDate.getMonth() + 1)).slice(-2)}-${("0" + fDate.getDate()).slice(-2)}T00:00:00.000Z`;

                        var lastDate = new Date(fDate.getFullYear(), fDate.getMonth() + 1, 0).getDate();

                        let endDate = `${fDate.getFullYear()}-${("0" + (fDate.getMonth() + 1)).slice(-2)}-${lastDate}T00:00:00.000Z`;

                        loader.visible();

                        if (data && data.offerType && data.subOfferType) {
                            ExclusiveOffer.find({
                                filter: {
                                    where: {
                                        ownerId: $scope.userId, offerDate: { between: [date, endDate] },
                                        subOfferType: data.subOfferType, titleTxt: data.titleTxt,
                                        offerType: data.offerType
                                    },
                                    fields: ["id", "offerDate", "offerDateTxt"]
                                }
                            }).$promise.then((res) => {
                                if (res && res.length) {
                                    $(`#datepicker_dd_s .datepicker-days table tbody tr td`).each((i, v) => {
                                        if (!$(v).hasClass('old') && !$(v).hasClass('new') && !$(v).hasClass('disabled')) {
                                            let filDate = `${("0" + $(v).html()).slice(-2)}-${("0" + (fDate.getMonth() + 1)).slice(-2)}-${fDate.getFullYear()}`;
                                            if (res.some(m => m.offerDateTxt === filDate)) {
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

                        let data = $scope.couponsList.find(m => m.id == id);

                        let fDate = new Date(`${values[1]}-${("0" + (index + 1)).slice(-2)}-01`);

                        var lastDate = new Date(fDate.getFullYear(), fDate.getMonth() + 1, 0).getDate();

                        let endDate = `${fDate.getFullYear()}-${("0" + (fDate.getMonth() + 1)).slice(-2)}-${lastDate}`;

                        let date = `${fDate.getFullYear()}-${("0" + (fDate.getMonth() + 1)).slice(-2)}-01`;

                        loader.visible();

                        if (data && data.offerType) {

                            ExclusiveOffer.find({
                                filter: {
                                    where: {
                                        ownerId: $scope.userId, offerDate: { gte: date, lte: endDate },
                                        subOfferType: data.subOfferType, titleTxt: data.titleTxt,
                                        offerType: data.offerType
                                    },
                                    fields: ["id", "offerDate", "offerDateTxt"]
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
                                                if (res.some(m => m.offerDateTxt === filDate)) {
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

                let data_v = $scope.couponsList.find(m => m.id == id);

                ExclusiveOffer.find({
                    filter: {
                        where: {
                            ownerId: $scope.userId,
                            offerDate: { gte: `${fDate}T00:00:00.000Z`, lte: `${endDate}T00:00:00.000Z` },
                            subOfferType: data_v.subOfferType, titleTxt: data_v.titleTxt, offerType: data_v.offerType
                        },
                        fields: ["id", "offerDate", "offerDateTxt"]
                    }
                }).$promise.then((res_l) => {

                    $(`#datepicker_dd_s .datepicker-days table tbody tr td`).each((i, v) => {
                        if (!$(v).hasClass('old') && !$(v).hasClass('new') && !$(v).hasClass('disabled')) {
                            let filDate = `${("0" + $(v).html()).slice(-2)}-${("0" + (n_date.getMonth() + 1)).slice(-2)}-${n_date.getFullYear()}`;
                            if (res_l.some(m => m.offerDateTxt === filDate)) {
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

            ExclusiveOffer.find({
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

                        let date = ("0" + daF[0]).slice(-2);

                        let offerDate = `${year}-${("0" + month).slice(-2)}-${("0" + daF[0]).slice(-2)}T00:00:00.000Z`;

                        let offerDateTxt = `${("0" + daF[0]).slice(-2)}-${("0" + month).slice(-2)}-${year}`;

                        let status = "Pending";

                        let isLive = false;

                        let start = {}, end = {};

                        let { startTimeTxt, offerExpiryTimeTxt, title, titleTxt, desc, ownerId,
                            isBooking, minCustomer, maxCustomer, price, subOfferType, offerType, availableCnt } = res[0];

                        if (startTimeTxt) {
                            let sTime = convertTime12to24(startTimeTxt);
                            start.hour = sTime.split(':')[0];
                            start.minutes = sTime.split(':')[1];
                            dateF.setHours(start.hour);
                            dateF.setMinutes(start.minutes);
                            start.time = dateF.getTime();
                        }
                        if (offerExpiryTimeTxt) {
                            let eTime = convertTime12to24(offerExpiryTimeTxt);
                            end.hour = eTime.split(':')[0];
                            end.minutes = eTime.split(':')[1];
                            dateE.setHours(end.hour);
                            dateE.setMinutes(end.minutes);
                            end.time = dateE.getTime();
                        }

                        createDealObj.push({
                            offerDate, offerDateTxt, isBooking, minCustomer, maxCustomer, price, subOfferType, offerType,
                            startTimeTxt, offerExpiryTimeTxt, start, end, status, date, year, month, isLive, title,
                            titleTxt, desc, ownerId, availableCnt
                        });
                    })


                    if (res[0].img[0].path) {

                        ExclusiveOffer.getBase64({ params: { url: res[0].img[0].path } })
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
                                                    await ExclusiveOffer.create(v).$promise.then(() => {
                                                        if (createDealObj.length == (i + 1)) {
                                                            $scope.getAllOffers();
                                                            setTimeout(function () {
                                                                $('#datepicker_dd_s').datepicker('setDates', []);
                                                                toastMsg(true, 'Successfully created!');
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

                let data_v = $scope.couponsList.find(m => m.id == id);

                ExclusiveOffer.find({
                    filter: {
                        where: {
                            ownerId: $scope.userId,
                            offerDate: { gte: fDate, lte: endDate }, subOfferType: data_v.subOfferType,
                            titleTxt: data_v.titleTxt, offerType: data_v.offerType
                        },
                        fields: ["id", "offerDate", "offerDateTxt"]
                    }
                }).$promise.then((res_l) => {
                    $(`#datepicker_dd_s .datepicker-days table tbody tr td`).each((i, v) => {
                        if (!$(v).hasClass('old') && !$(v).hasClass('new') && !$(v).hasClass('disabled')) {
                            let filDate = `${("0" + $(v).html()).slice(-2)}-${("0" + (n_date.getMonth() + 1)).slice(-2)}-${n_date.getFullYear()}`;
                            if (res_l.some(m => m.offerDateTxt === filDate)) {
                                $(v).addClass('cal-s');
                            }
                        }
                    });
                    setTimeout(function () { loader.hidden(); }, 400);
                })
            }
        }

    }])
    .controller('EditExclusiveOfferCtl', ['$scope', '$state', '$rootScope', 'Business', 'ExclusiveOffer', '$http', 'loader', 'CouponDate', 'ExclusiveSubCategory', function ($scope, $state, $rootScope, Business, ExclusiveOffer, $http, loader, CouponDate, ExclusiveSubCategory) {


        const convertTime12to24 = (time12h) => moment(time12h, 'hh:mm A').format('HH:mm');

        toastMsg = (isVaild, msg) => {
            if (isVaild)
                toastr.success(msg);
            else
                toastr.error(msg);
            toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
        }

        $scope.offerTypes = [];
        $scope.getOfferTypes = () => {
            loader.visible();
            ExclusiveSubCategory.find({ filter: { where: { ownerId: $scope.userId } } }, (res) => {
                $scope.offerTypes = [{ name: "Happy Hour", _name: "happyHour", type: "Drinks" },
                { name: "Beer", _name: "beer", type: "Drinks" },
                { name: "Wine", _name: "wine", type: "Drinks" },
                { name: "Cocktail", _name: "cocktail", type: "Drinks" },
                { name: "Spirit", _name: "spirit", type: "Drinks" },
                { name: "Cider", _name: "cider", type: "Drinks" },
                { name: "Breakfast", _name: "breakfast", type: "Food" },
                { name: "Lunch", _name: "lunch", type: "Food" },
                { name: "Dinner", _name: "dinner", type: "Food" },
                { name: "Allday", _name: "allday", type: "Food" },
                { name: "Brunch", _name: "brunch", type: "Food" }];
                if (res && res.length) for (let val of res) $scope.offerTypes.push(val);
                else $scope.offerTypes = [];
                setTimeout(function () { loader.hidden(); console.log(JSON.stringify($scope.offerTypes)); }, 500)
            })

        }

        $scope.editOffer = {};
        var ids = JSON.parse(localStorage.getItem('c-edit-id'));

        $scope.getData = () => {
            var id = ids.id;
            loader.visible();
            ExclusiveOffer.findOne({ filter: { where: { id } } }).$promise.then((res) => {
                if (res) {
                    $scope.editOffer = res;
                    $scope.editOffer.offerDate = new Date(res.offerDate);
                    $scope.offerType = res.offerType;
                    $scope.subOfferType = res.subOfferType;
                    $scope.userId = res.ownerId;
                    $scope.statusEV = res.status;
                    $scope.getOfferTypes();
                    setTimeout(function () { loader.hidden(); }, 400);
                }
            })
        }

        if (ids && ids.id) {
            $scope.getData();
        } else $state.go('manage-offer');

        $scope.imageDelete = async (id) => {
            if (id) {
                let data = $scope.editOffer;
                if (data.img && data.img.length) {
                    loader.visible();
                    // $(`#delete_${id}`).html('<i class="fas fa-spinner fa-spin"></i>').prop('disabled', true);
                    $http.post('/spaceFileDelete', { fileName: data.img[0].fileName }).then((deleteImg) => {
                        ExclusiveOffer.upsertWithWhere({ where: { id } }, { img: [] }).$promise.then((res) => {
                            $scope.getData();
                            toastMsg(true, "Successfully deleted!");
                        });
                    });
                } else toastMsg(false, "Please try again");
            } else toastMsg(false, "Please try again");
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
                //$("#create_exclusive_btn").prop('disabled', false);
                $("#image-crop-md").modal('hide');
                var fd = new FormData();
                var uid = uuidv4();
                loader.visible();
                $scope.primaryImgS = [];
                $scope.primaryImgS.push({ path: imgSrc });
                fd.append(`happeningsImg`, dataURItoBlob(imgSrc), `${uid}.png`);
                $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                    .then((res) => {
                        if (res && res.data && res.data.isSuccess) {
                            let id;
                            if (ids && ids.id) {
                                id = ids.id;
                            }
                            ExclusiveOffer.upsertWithWhere({ where: { id } }, { img: res.data.result }).$promise.then(() => {
                                $scope.getData();
                            })
                            // $scope.offerImg = [];
                            // resolve({ isSuccess: true, img: res.data.result });
                        } else loader.hidden()
                    }, () => loader.hidden())
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
                            if (localStorage.getItem("c-edit-id")) {
                                let data = JSON.parse(localStorage.getItem("c-edit-id"));
                                if (data && data.id) {
                                    let id = data.id;
                                    $scope.primaryImgS = [];
                                    $scope.primaryImgS.push({ path: imgSrc });
                                    ExclusiveOffer.upsertWithWhere({ where: { id } }, {
                                        img: res.data.result
                                    }).$promise.then((res_1) => {
                                        $scope.getData();
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


        $scope.updateOffer = () => {

            var ids = JSON.parse(localStorage.getItem('c-edit-id')); let img = [];

            let title, desc, availableCnt, price, minCustomer, maxCustomer, titleTxtVal,
                startTimeTxt, offerExpiryTimeTxt, start = { hour: 0, minutes: 0, time: 0 },
                end = { hour: 0, minutes: 0, time: 0 };

            title = $("#title").val();
            desc = $("#desc").val();
            minCustomer = $("#perCustomerCntMin").val();
            maxCustomer = $("#perCustomerCntMax").val();
            price = $("#price").val();
            titleTxtVal = $("#title").val().toString().replace(/\s+/g, '');

            loader.visible();

            ExclusiveOffer.find({ filter: { where: { id: ids.id } } }).$promise.then((res) => {

                let { ownerId, offerType, subOfferType, offerDateTxt, titleTxt } = res[0];

                if ($("#Offer_date_edit").val()) {

                    let dateSplit = offerDateTxt.split('-');

                    if ($("#Offer_start_time_edit").val() && $("#Offer_end_time_edit").val()) {

                        startTimeTxt = $("#Offer_start_time_edit").val();
                        offerExpiryTimeTxt = $("#Offer_end_time_edit").val();

                        let sTime = convertTime12to24(startTimeTxt);
                        sTime = sTime.split(':');
                        start.hour = sTime[0];
                        start.minutes = sTime[1];

                        let eTime = convertTime12to24(offerExpiryTimeTxt);
                        eTime = eTime.split(':');
                        end.hour = eTime[0];
                        end.minutes = eTime[1];

                        let sDate = new Date(`${dateSplit[2]}-${dateSplit[1]}-${dateSplit[0]}`);
                        let eDate = new Date(`${dateSplit[2]}-${dateSplit[1]}-${dateSplit[0]}`);

                        sDate.setHours(start.hour);
                        sDate.setMinutes(start.minutes);
                        eDate.setHours(end.hour);
                        eDate.setMinutes(end.minutes);

                        start.time = sDate.getTime();
                        end.time = eDate.getTime();


                        let updateData = (updateObj = {}) => {
                            if (ids && ids.id) {

                                updateObj.id = ids.id;

                                let fDate = new Date();
                                let date = `${fDate.getFullYear()}-${("0" + (fDate.getMonth() + 1)).slice(-2)}-${fDate.getDate()}`;

                                ExclusiveOffer.find({
                                    filter: {
                                        where: {
                                            ownerId, offerType, subOfferType, titleTxt, offerDate: { gte: date }
                                        }
                                    }
                                }).$promise.then((resExc) => {

                                    if (resExc && resExc.length) {

                                        if ($scope.primaryImgS && $scope.primaryImgS.length) {

                                            var fd = new FormData();

                                            for (let m in resExc) {
                                                var uid = uuidv4();
                                                fd.append(`happeningsImg`, dataURItoBlob($scope.primaryImgS[0].path), `${uid}.png`);
                                            }

                                            setTimeout(function () {
                                                $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                                                    .then((res) => {
                                                        if (res && res.data && res.data.isSuccess) {
                                                            resExc.forEach(async (v, i) => {
                                                                let dimg = [];
                                                                dimg.push(res.data.result[i]);

                                                                if (v.id) {

                                                                    await ExclusiveOffer.upsertWithWhere({ where: { id: v.id } }, {
                                                                        img: dimg, title: updateObj.title, desc: updateObj.desc,
                                                                        titleTxt: updateObj.titleTxt, status: $scope.statusEV,
                                                                        availableCnt, minCustomer, maxCustomer, price,
                                                                        startTimeTxt, offerExpiryTimeTxt, start, end
                                                                    });

                                                                    if (resExc.length == (i + 1)) {
                                                                        setTimeout(function () {
                                                                            toastMsg(true, "Successfully updated!");
                                                                            $state.go("manage-offer");
                                                                            loader.hidden();
                                                                        }, 500);
                                                                    }

                                                                }
                                                            });
                                                        } else loader.hidden()
                                                    }, () => loader.hidden())
                                            }, 300);
                                        } else {
                                            resExc.forEach(async (v, i) => {
                                                if (v.id) {

                                                    await ExclusiveOffer.upsertWithWhere({ where: { id: v.id } }, {
                                                        title: updateObj.title, desc: updateObj.desc, availableCnt,
                                                        minCustomer, maxCustomer, price,
                                                        titleTxt: updateObj.titleTxt, status: $scope.statusEV,
                                                        startTimeTxt, offerExpiryTimeTxt, start, end
                                                    });

                                                    if (resExc.length == (i + 1)) {
                                                        setTimeout(function () {
                                                            toastMsg(true, "Successfully updated!");
                                                            $state.go("manage-offer");
                                                            loader.hidden();
                                                        }, 500);
                                                    }

                                                }
                                            });
                                        }
                                    } else toastMsg(false, "Please try again!")
                                });

                            } else {
                                setTimeout(() => {
                                    loader.hidden();
                                }, 200);
                                toastMsg(false, "Please try again!");
                            }
                        }

                        if ($scope.updateAllOffersValid) {
                            updateData({
                                title, desc, availableCnt, minCustomer, maxCustomer,
                                price, titleTxt: titleTxtVal, startTimeTxt, offerExpiryTimeTxt, start, end
                            });
                        } else {
                            ExclusiveOffer.upsertWithWhere({ where: { id: ids.id } }, {
                                title, desc, availableCnt, minCustomer, maxCustomer, price, status: $scope.statusEV,
                                titleTxt: titleTxtVal, startTimeTxt, offerExpiryTimeTxt, start, end
                            }, () => {
                                setTimeout(function () {
                                    toastMsg(true, "Successfully updated!");
                                    $state.go("manage-offer");
                                    loader.hidden();
                                }, 300);
                            });
                        }

                    } else {
                        loader.hidden();
                        toastMsg(false, "Start and expiry time is required!");
                    }
                } else {
                    loader.hidden();
                    toastMsg(false, "Offer date is required!");
                }

            });

        }


        $scope.updateAllOffersValid = false;
        $scope.updateAllOffer = () => {
            $scope.updateOffer();
            $scope.updateAllOffersValid = true;
        }

        $scope.updateStatus = (status) => {
            if (status == 'Live') status = "Pending";
            else status = "Live";
            $scope.statusEV = status;
        }

    }])
    .controller('ViewExclusiveOfferCtl', ['$scope', '$state', '$rootScope', 'Business', 'ExclusiveOffer', '$http', 'loader', function ($scope, $state, $rootScope, Business, ExclusiveOffer, $http, loader) {

        toastMsg = (isVaild, msg) => {
            if (isVaild)
                toastr.success(msg);
            else
                toastr.error(msg);
            toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
        }

        $scope.viewOffer = {};
        var ids = JSON.parse(localStorage.getItem('c-view-id'));
        if (ids && ids.id) {
            let id = ids.id;
            loader.visible();
            ExclusiveOffer.findOne({ filter: { where: { id } } }).$promise.then((res) => {
                $scope.viewOffer = res;
                setTimeout(function () { loader.hidden(); }, 200);
            })
        } else $state.go('manage-offer');


    }])
    .controller('requestOfferCtl', ['$scope', '$state', '$rootScope', 'Business', 'ExclusiveOffer', '$http', 'loader', function ($scope, $state, $rootScope, Business, ExclusiveOffer, $http, loader) {

        toastMsg = (isVaild, msg) => {
            if (isVaild)
                toastr.success(msg);
            else
                toastr.error(msg);
            toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
        }


        $scope.requestOfferList = [];
        $scope.getRequestOffer = () => {
            $scope.requestOfferList = [];
            ExclusiveOffer.find({
                filter: {
                    where: { ownerId: $scope.userId },
                    include: [{
                        relation: "claimscoupons", scope: {
                            include: [{
                                relation: "customer"
                            }],
                            order: "offerDate desc"
                        }
                    }]
                }
            }).$promise.then((res) => {
                res.forEach((val) => {
                    val.claimscoupons.forEach((coupons) => {
                        $scope.requestOfferList.push({
                            title: val.title, desc: val.desc, minCustomer: val.minCustomer, availableCnt: val.availableCnt, maxCustomer: val.maxCustomer,
                            price: val.price, isCreate: val.isCreate, id: val.id, ownerId: val.ownerId, img: val.img, coupons
                        });
                    });
                });
                $scope.requestOfferList = $scope.requestOfferList.sort((a, b) => b.coupons.date - a.coupons.date);
            });
        }

        $scope.isBusinessSelect = false;

        $scope.useremail = $rootScope.currentUser.email;
        $scope.userId = "";
        if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
            $scope.isBusinessSelect = true;
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
            $scope.getRequestOffer();
            $scope.isBusinessSelect = true;
            $rootScope.selectedVenue = { ownerId: $scope.userId, venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
        }

        $scope.getBusinessName = () => {
            return $scope.businessDelection;
        };


        $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

        if (!$scope.userDetails.isAdmin) {
            $scope.getRequestOffer();
            $("#businessSubmit").css({ display: 'none' });
            $("#autocompleteBusiness").val($scope.userDetails.businessName);
            $("#autocompleteBusiness").attr('disabled', true);
        }

        $scope.filterClk = () => {
            let filterObj = {
                filter: {
                    where: { ownerId: $scope.userId },
                    include: [{
                        relation: "claimscoupons", scope: {
                            include: [{
                                relation: "customer"
                            }]
                        }
                    }]
                }
            }
            if ($("#f-date").val()) {
                let date = $("#f-date").val().split('-');
                filterObj.filter.include[0].scope.where = {};
                filterObj.filter.include[0].scope.where.dateNo = Number(date[2]).toString();
                filterObj.filter.include[0].scope.where.month = Number(date[1]);
                filterObj.filter.include[0].scope.where.year = Number(date[0]);
            }
            if ($("#f-offer-name").val()) {
                filterObj.filter.where.title = { "like": `${$("#f-offer-name").val()}.*`, "options": "i" };
            }
            if ($("#f-type").val() && $("#f-type").val() != 'select') {
                if ($("#f-type").val() == 'Claimed') {
                    filterObj.filter.include[0].scope.where.isClaim = true;
                    filterObj.filter.include[0].scope.where.isRedeemed = false;
                }
                else if ($("#f-type").val() == "Redeemed") {
                    filterObj.filter.include[0].scope.where.isRedeemed = true;
                }
            }

            ExclusiveOffer.find(filterObj).$promise.then((res) => {
                $scope.requestOfferList = [];
                res.forEach((val) => {
                    val.claimscoupons.forEach((coupons) => {
                        $scope.requestOfferList.push({
                            title: val.title, desc: val.desc, minCustomer: val.minCustomer, availableCnt: val.availableCnt, maxCustomer: val.maxCustomer,
                            price: val.price, isCreate: val.isCreate, id: val.id, ownerId: val.ownerId, img: val.img, coupons
                        });
                    });
                });
            });
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
                        $scope.getRequestOffer();
                        $rootScope.selectedVenue = { ownerId: $scope.userId, venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                        localStorage.removeItem("selectedVenue");
                        localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userId, ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }));
                    }
                } else $("#businessErr").text('Please select the Business name');
            }
        }

        $scope.showTheMiddle = (event, i) => {
            $(`.middle_${i}`).css({ 'display': 'block', 'position': 'absolute', 'right': '2%' });
        }


        $scope.hiddenTheMiddle = (i) => {
            $(`.middle_${i}`).css({ 'display': 'none' })
        }
    }]);