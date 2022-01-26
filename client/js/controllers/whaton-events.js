

angular
    .module('app')
    .controller('whatsoncreateCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'loader', 'HappeningsCategory',
        function ($scope, $state, $rootScope, Business, $http, loader, HappeningsCategory) {

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            $scope.isTicktedShow = false;

            $scope.happeningsCategory = [];
            $scope.getHappeningscategory = () => {
                HappeningsCategory.find({ filter: { where: { ownerId: $scope.userId } } }).$promise.then((res) => {
                    $scope.happeningsCategory = res;
                    $rootScope.happeningsCategory = res;
                    localStorage.removeItem("h_hgs_ca_ory");
                    localStorage.setItem("h_hgs_ca_ory", JSON.stringify(res));
                });
            }

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.isBusinessSelect = false;

            $scope.isBusinessCall = false;
            $scope.getBusiness = () => {
                if ($scope.isBusinessCall == false) {
                    $scope.isBusinessCall = true;
                    Business.find({ filter: { where: { status: "active" }, "fields": ["businessName", "id", "email"] } }).$promise.then((res) => {
                        $scope.businessSelection = res;
                    });
                }
            }


            if (!$rootScope.selectedVenue) $rootScope.selectedVenue = JSON.parse(localStorage.getItem("selectedVenue"));
            if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId) {
                $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName.trimRight());
                $scope.userId = $rootScope.selectedVenue.ownerId;
                $scope.isBusinessSelect = true;
                $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.ownerId)
                if ($("#businessSubmit").hasClass('businessSubmit')) {
                    $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                }
                $scope.getHappeningscategory();
                $scope.getBusiness();
            }

            $scope.getBusinessName = () => {
                return $scope.businessSelection;
            };

            if ($scope.userDetails.isAdmin == false) {
                $("#autocompleteBusiness").val($scope.userDetails.businessName.trimRight());
                localStorage.removeItem("selectedVenue");
                $("#autocompleteBusiness").attr('disabled', true);
                $scope.userId = $scope.userDetails.id;
                localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userDetails.id, ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
                $scope.getHappeningscategory();
                $scope.isBusinessSelect = true;
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
                        $rootScope.selectedVenue = { venueId: $scope.userId, ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                        localStorage.setItem("selectedVenue", JSON.stringify({
                            venueId: $scope.userId,
                            ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val().trimRight()
                        }));
                        $scope.getHappeningscategory();
                    }
                } else $("#businessErr").text('Please select the Business name');
            }

            $scope.happingsChange = (event) => {
                $scope.isTicktedShow = false;
                if (event._name == 'live_Music'
                    || event._name == 'dj'
                    || event._name == 'comedy'
                    || event._name == 'other') {
                    $scope.isTicktedShow = true;
                }

                // || event._name == 'karaoke'
            };

            $scope.createContinue = () => {
                let whatson_title = $("#_whatson_title").val(), isTrue = true;
                $rootScope.isTicketedEvent = false;

                $("#_ticket_url_error").html('');

                $("#_whatson_title_error,#_whatson_category_Error").html(null);

                if (!whatson_title) {
                    $("#_whatson_title_error").html('Event title is required!');
                    isTrue = false;
                }

                $('input[name="_selling_ticket"]').each(function (i, e) {
                    if ($(e).prop('checked') && $(e).data('val') == 'yes') $rootScope.isTicketedEvent = true;
                });

                var elm;
                var isValidURL = (u) => {
                    if (!elm) {
                        elm = document.createElement('input');
                        elm.setAttribute('type', 'url');
                    }
                    elm.value = u;
                    return elm.validity.valid;
                }

                if ($scope.event && $scope.event._name) {
                    $rootScope.whatson_title = whatson_title;
                    localStorage.removeItem('h_events_title');
                    localStorage.setItem('h_events_title', JSON.stringify({ title: whatson_title }));
                    if (isTrue) {
                        if ($scope.event._name == 'live_Music'
                            || $scope.event._name == 'dj'
                            // || $scope.event._name == 'karaoke'
                            || $scope.event._name == 'comedy'
                            || $scope.event._name == 'other') {
                            let isBarm8Ticket = false, isThirdPartyTicket = false, urlTxt = '';
                            let isBooking = false;
                            isBooking = $("#_ticket_enabled_booked").is(':checked');
                            isBarm8Ticket = $("#_ticket_barm8").is(':checked');
                            isThirdPartyTicket = $("#_ticket_third_party").is(':checked');
                            if (isThirdPartyTicket) {
                                urlTxt = $("#_ticket_url").val();
                                if (urlTxt && isValidURL(urlTxt)) {
                                    localStorage.removeItem('h_c_event_name');
                                    localStorage.setItem('h_c_event_name', JSON.stringify({ eventName: $scope.event._name, isTicketedEvent: $rootScope.isTicketedEvent, isBarm8Ticket, isThirdPartyTicket, urlTxt, isBooking }));
                                    $state.go('create-whats-on-events', { arg: $scope.event._name });
                                } else {
                                    if (!urlTxt) $("#_ticket_url_error").html('URL is required!');
                                    else $("#_ticket_url_error").html('Invalid URL!');
                                }
                            } else {
                                localStorage.removeItem('h_c_event_name');
                                localStorage.setItem('h_c_event_name', JSON.stringify({ eventName: $scope.event._name, isTicketedEvent: $rootScope.isTicketedEvent, isBarm8Ticket, isThirdPartyTicket, urlTxt, isBooking }));
                                $state.go('create-whats-on-events', { arg: $scope.event._name });
                            }
                        } else if ($scope.event._name == 'trivia') {
                            $state.go('create-trivia');
                        } else if ($scope.event._name == 'poker') {
                            $state.go('create-poker');
                        }
                    }
                }
                else {
                    $("#_whatson_category_Error").html('Please select an event type!'); isTrue = false;
                }

            }

        }])
    .controller('whatsonAllEventsCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'loader', '$stateParams', 'Happenings', 'HappeningsTicket', 'getAllVenues',
        function ($scope, $state, $rootScope, Business, $http, loader, $stateParams, Happenings, HappeningsTicket, getAllVenues) {

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            let HCdata = JSON.parse(localStorage.getItem('h_c_event_name'));
            let whEvTitle = JSON.parse(localStorage.getItem('h_events_title'));
            $scope.isTicketedEvent = false;

            if (!HCdata.eventName) $state.go('create-whats-on');
            if (HCdata.isTicketedEvent && HCdata.isBarm8Ticket) $scope.isTicketedEvent = HCdata.isTicketedEvent;

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.dateBtnDisabled = true;

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
            $rootScope.selectedVenue = JSON.parse(localStorage.getItem("selectedVenue"));
            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                $scope.isBusinessSelect = true;
                $scope.getBusiness();
                $scope.userId = $rootScope.currentUser.id;
            }
            if (!$rootScope.selectedVenue) $rootScope.selectedVenue = JSON.parse(localStorage.getItem("selectedVenue"));
            if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId) {
                $scope.isBusinessSelect = true;
                $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                $scope.userId = $rootScope.selectedVenue.ownerId;
                $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.ownerId)
                if ($("#businessSubmit").hasClass('businessSubmit')) {
                    $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                }
                $scope.getBusiness();
            }

            $scope.getBusinessName = () => {
                return $scope.businessSelection;
            };

            $scope.rootCal = () => {
                if ($stateParams.arg) {
                    if ($stateParams.arg == 'live_Music') $scope.rootTitle = 'Live Music';
                    else if ($stateParams.arg == 'dj') $scope.rootTitle = 'DJ';
                    else if ($stateParams.arg == 'karaoke') $scope.rootTitle = 'Karaoke';
                    else if ($stateParams.arg == 'comedy') $scope.rootTitle = 'Comedy';
                    else if ($stateParams.arg == 'other') $scope.rootTitle = 'Other';
                }
            }
            $scope.rootCal();

            $scope.title = whEvTitle.title;

            $scope.primEvnImg = [];
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
                    $scope.primEvnImg = [];
                    $scope.primEvnImg.push({ path: imgSrc });
                    $scope.$apply();
                    cropper.destroy();
                    cropper.reset();
                    cropper.clear();

                    $("#ticketEventImg").val('');
                    // $(".img-h-s").css({ display: 'block' });
                    // $(".img-c-s").css({ display: 'none' });
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


            $scope.seEvImg = [];
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
                            minContainerWidth: 400,
                            minContainerHeight: 300,
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
                    $scope.seEvImg = [];
                    $("#image-crop-second-md").modal('hide');
                    // $("#img-second-pre").attr('src', imgSrc);
                    // $(".img-h-s-s").css({ display: 'block' });
                    // $(".img-c-s-s").css({ display: 'none' });

                    $scope.seEvImg.push({ path: imgSrc });
                    $scope.$apply();
                    cropper_2.destroy();
                    cropper_2.reset();
                    cropper_2.clear();

                    $("#ticketEventSeImg").val('');
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

            $scope.BusinessSelected = (arg) => {
                $("#businessErr").text('');
                if (arg && arg == 'manageEvent') {
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
                    } else $("#businessErr").text('Please select the Business name');
                }
            }
            //$("#e-ticket-price-0").prop('disabled', true); 

            $scope.whatsonticketList = [];
            $scope.saveShow = true;
            $scope.ticketbtnclk = (type) => {
                $scope.whatsonticketList = [];
                $scope.saveShow = false;
                $scope.eventTtype = type;
                $("#e-ticket-price-0").val("0.00");
                $scope.whatsonticketList.push({ type });
            }

            $scope.deleteTickets = (i) => {
                $scope.whatsonticketList.splice(i, 1);
                toastMsg(true, "Deleted successfully.");
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

            uploadImg = () => {
                return new Promise((resolve, reject) => {
                    var fd = new FormData();

                    for (let da of $scope.eventDates) {
                        var uid = uuidv4();
                        fd.append(`happenings_0`, dataURItoBlob($scope.primEvnImg[0].path), `${uid}.png`);
                    }

                    $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess) {
                                $scope.happeningsImage = res.data.result;
                                resolve({ isSuccess: true, img: res.data.result });
                            } else loader.hidden()
                        }, (err) => loader.hidden())
                })
            }

            uploadSecondImg = () => {
                return new Promise((resolve, reject) => {
                    var fd = new FormData();

                    for (let da of $scope.eventDates) {
                        var uid = uuidv4();
                        fd.append(`happenings_0`, dataURItoBlob($scope.seEvImg[0].path), `${uid}.png`);
                    }

                    $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess) {
                                $scope.happeningsImage = res.data.result;
                                resolve({ isSuccess: true, img: res.data.result });
                            } else loader.hidden()
                        }, (err) => loader.hidden())
                })
            }

            uploadPrimaryVideo = () => {
                return new Promise((resolve, reject) => {
                    var fd = new FormData();

                    for (let da of $scope.eventDates) {
                        var extension = '';
                        function openFile(file) {
                            extension = file.substr((file.lastIndexOf('.') + 1));
                        };
                        var uid = uuidv4();
                        openFile($('#ticketEventVideo')[0].files[0].name);
                        fd.append(`happenings_0`, $('#ticketEventVideo')[0].files[0], `${uid}.${extension}`);
                    }

                    $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess) {
                                let video = [];
                                res.data.result.forEach(val => {
                                    if (val.path.includes('https://')) video.push({ fileName: val.fileName, path: `${val.path}`, image: true })
                                    else video.push({ fileName: val.fileName, path: `https://${val.path}`, image: true })
                                });
                                resolve({ isSuccess: true, video });
                            } else loader.hidden()
                        }, (err) => loader.hidden())
                })
            }

            $scope.ticketDisabled = true;

            const convertTime12to24 = (time12h) => moment(time12h, 'hh:mm A').format('HH:mm');

            $scope.eventDates = [];
            $scope.savedEventDates = [];
            $scope.addDates = () => {
                let dateFormat, startTime, endTime, dateNo, month, year, startTimeFormat, endTimeFormat, isTrue = true;
                let isEmptyEndTime = false;
                $("#date-error,#start-time-error,#end-time-error").text(null);
                if (!$("#events_date").val()) {
                    isTrue = false;
                    $("#date-error").text('Event date is required!');
                }
                if (!$("#events_start_time").val()) {
                    isTrue = false;
                    $("#start-time-error").text('Start time is required!');
                }
                // if (!$("#events_end_time").val()) {
                //     isTrue = false;
                //     $("#end-time-error").text('End time is required!');
                // }
                if (isTrue) {
                    let mDate = ($("#events_date").val()).split(',');
                    for (let date of mDate) {
                        let dateF = date.split('-');
                        dateFormat = `${("0" + dateF[0]).slice(-2)}-${("0" + dateF[1]).slice(-2)}-${dateF[2]}`;
                        startTime = $("#events_start_time").val();
                        endTime = $("#events_end_time").val();
                        let s_date = new Date(`${dateF[2]}-${("0" + dateF[1]).slice(-2)}-${("0" + dateF[0]).slice(-2)}`);
                        s_date.setHours((convertTime12to24(startTime)).split(':')[0]);
                        s_date.setMinutes((convertTime12to24(startTime)).split(':')[1]);
                        startTimeFormat = s_date.getTime();
                        let e_date = new Date(`${dateF[2]}-${("0" + dateF[1]).slice(-2)}-${("0" + dateF[0]).slice(-2)}`);
                        let _12_hours = convertTime12to24(startTime);
                        if (endTime) {
                            e_date.setHours((convertTime12to24(endTime)).split(':')[0]);
                            e_date.setMinutes((convertTime12to24(endTime)).split(':')[1]);
                            endTimeFormat = e_date.getTime();
                        } else {
                            isEmptyEndTime = true;
                            endTime = moment.utc(`${_12_hours}`, 'hh:mm').add(1, 'hour').format('hh:mm a');
                            e_date.setHours((convertTime12to24(endTime)).split(':')[0]);
                            e_date.setMinutes((convertTime12to24(endTime)).split(':')[1]);
                            endTimeFormat = e_date.getTime();
                        }

                        dateNo = ("0" + dateF[0]).slice(-2);
                        month = ("0" + dateF[1]).slice(-2);
                        year = dateF[2];
                        $scope.eventDates.push({
                            date: `${dateF[2]}-${("0" + dateF[1]).slice(-2)}-${("0" + dateF[0]).slice(-2)}T00:00:00.000Z`,
                            dateFormat, startTime, endTime, startTimeFormat, endTimeFormat, dateNo, month, year, isEmptyEndTime
                        });
                    }

                    $("#events_date,#events_start_time,#events_end_time").val(null);
                    toastMsg(true, "Successfully added!");
                }
            }

            $scope.removeDateValues = (i) => {
                $scope.eventDates.splice(i, 1);
                toastMsg(true, "Successfully deleted!");
            }


            $scope.saveEvents = () => {

                let isTrue = true, img = [], title, fullDesc, happeningsCategoryId;
                img = $scope.happeningsImage;

                $("#desc-error").text(null);

                if (!$("#desc").val()) {
                    isTrue = false;
                    $("#desc-error").text("Description is required!");
                }

                clearData = () => {
                    $("#desc,#events_start_time,#events_end_time,#events_date").val(null);
                }

                if (isTrue && HCdata.eventName) {

                    // $scope.addDates();

                    if ($scope.eventDates && $scope.eventDates.length) {
                        fullDesc = $("#desc").val();

                        let gCateDat2_1 = JSON.parse(localStorage.getItem("h_hgs_ca_ory"));

                        let category = gCateDat2_1.find(m => m._name == $stateParams.arg);

                        if (category && category.id) happeningsCategoryId = category.id;
                        else {
                            toastMsg(false, "Please select the category!");
                            $state.go('create-whats-on');
                        }
                        if (happeningsCategoryId) {
                            loader.visible();

                            uploadImg().then((res) => {
                                if (res && res.isSuccess) {
                                    let primaryImg = secondaryImg = [];
                                    let primaryVideo = [];
                                    primaryImg = res.img;

                                    let createHappenings = () => {
                                        title = whEvTitle.title;
                                        let titleTxt = title.toString().replace(/\s+/g, '');
                                        let isTicketedEvent = HCdata.isTicketedEvent;
                                        let isBooking = HCdata.isBooking;
                                        let isBarm8Ticket = false;
                                        let isThirdPartyTicket = false;
                                        let urlTxt = '';
                                        if (isTicketedEvent) {
                                            isBarm8Ticket = HCdata.isBarm8Ticket;
                                            isThirdPartyTicket = HCdata.isThirdPartyTicket;
                                            urlTxt = HCdata.urlTxt;
                                        }
                                        let groupId = uuidv4();
                                        let status = "Pending";
                                        if ($("#non-ticket-go-live").is(':checked')) status = "Live";
                                        Happenings.createAndUpdate({ params: { fullDesc, title, primaryImg, secondaryImg, primaryVideo, dates: $scope.eventDates, happeningsCategoryId, ownerId: $scope.userId, isTicketedEvent, groupId, titleTxt, status, isBarm8Ticket, isThirdPartyTicket, urlTxt, isBooking } })
                                            .$promise.then((res) => {
                                                if (res && res.data && res.data.result) $scope.savedEventDates = res.data.result;
                                                localStorage.removeItem('happeningsIdAFT');
                                                localStorage.setItem('happeningsIdAFT', JSON.stringify(res.data.result));
                                                loader.hidden();
                                                toastMsg(true, "Successfully created!.");
                                                clearData();
                                                if (HCdata.isTicketedEvent && isBarm8Ticket) {
                                                    $(".nav-event-details").removeClass('active');
                                                    $("#nav-whatson-details").removeClass('active in');
                                                    $(".nav-ticket-type").addClass('active');
                                                    $("#nav-whatson-tickets").addClass('active in');
                                                } else {
                                                    setTimeout(function () {
                                                        $state.go("edit-happenings");
                                                    }, 400)
                                                }
                                                $scope.eventDates = [];

                                            }, (err) => {
                                                loader.hidden();
                                                clearData();
                                                toastMsg(false, "Please try again!");
                                            });
                                    }

                                    let checkVideo = () => {
                                        if ($('#ticketEventVideo').val()) {
                                            uploadPrimaryVideo().then((viPRes) => {
                                                primaryVideo = viPRes.video;
                                                if ($scope.seEvImg && $scope.seEvImg.length && $scope.seEvImg[0].path) {
                                                    uploadSecondImg().then((seRes) => {
                                                        if (seRes && seRes.isSuccess) {
                                                            secondaryImg = seRes.img;
                                                            createHappenings();
                                                        } else createHappenings();
                                                    })
                                                } else createHappenings();
                                            });

                                        } else {
                                            if ($scope.seEvImg && $scope.seEvImg.length && $scope.seEvImg[0].path) {
                                                uploadSecondImg().then((seRes) => {
                                                    if (seRes && seRes.isSuccess) {
                                                        secondaryImg = seRes.img;
                                                        createHappenings();
                                                    } else createHappenings();
                                                })
                                            } else createHappenings();
                                        }
                                    }

                                    checkVideo();
                                }
                            });
                        }
                    } else {
                        toastMsg(false, "Date is required!. Please try again!");
                    }

                } else if (!HCdata.eventName) {
                    toastMsg(false, "Event title is required!. Please try again!");
                    $state.go('create-whats-on');
                } else {
                    toastMsg(false, "Please try again!");
                }
            }

            $scope.ticketTabClk = (i) => {

                $('.tap-t-setting').each(function () {
                    if ($(this).hasClass('active')) $(this).removeClass('active')
                })
                $('.tap-t-setting-p').each(function () {
                    if ($(this).hasClass('active')) $(this).removeClass('active').removeClass('in');
                })
            }

            $scope.ticketTabPreClk = (i) => {
                $(`.ticket-tab-preview-${i}`).toggleClass('active');
                if (!$(`.ticket-tab-preview-${i}`).hasClass('active')) {
                    setTimeout(function () {
                        $(`#whatson-ticket-preview-${i}`).toggleClass('active in');
                    }, 200);
                }
            }

            $scope.gotoLive = () => {
                $state.go("edit-happenings");
            }

            $scope.isTicktedVisible = true;
            $scope.allTicketArray = [];
            $scope.saveTicket = () => {
                let ticketType = null, ticketName = null, ticketQty = 0, salePrice = 0, ticketDesc = null,
                    salesStartDate = null, salesStartTime = null,
                    salesEndDate = null, salesEndTime = null, minTicket = 0, maxTicket = 0,
                    isTrue = true, ticketArray = [];

                $scope.whatsonticketList.forEach((val, i) => {
                    $(`#ticket-name-err-${i},#ticket-qty-err-${i},#ticket-price-err-${i}`).text(null);
                    if (!$(`#e-ticket-name-${i}`).val()) {
                        isTrue = false;
                        $(`#ticket-name-err-${i}`).text('Ticket name is required!');
                    }
                    if (!$(`#e-ticket-qty-${i}`).val()) {
                        isTrue = false;
                        $(`#ticket-qty-err-${i}`).text('Ticket quantity is required!');
                    }
                    if (!$(`#e-ticket-price-${i}`).val()) {
                        isTrue = false;
                        $(`#ticket-price-err-${i}`).text('Ticket price is required!');
                    }

                    if (!$("#select_happeings_id").val()) {
                        isTrue = false;
                        toastMsg(false, "Please select event date!");
                    }

                    if (isTrue) {
                        ticketQty = $(`#e-ticket-qty-${i}`).val();
                        ticketName = $(`#e-ticket-name-${i}`).val();
                        salePrice = $(`#e-ticket-price-${i}`).val();
                        ticketType = $(`#e-ticket-type-${i}`).data('type');
                        ticketDesc = $(`#_ticket_desc_${i}`).val();
                        salesStartDate = $(`#_ticket_sales_start_date_${i}`).val();
                        salesStartTime = $(`#_ticket_sales_start_time_${i}`).val();
                        salesEndDate = $(`#_ticket_sales_end_date_${i}`).val();
                        salesEndTime = $(`#_ticket_sales_end_time_${i}`).val();
                        minTicket = $(`#_ticket_allowed_mini_${i}`).val();
                        maxTicket = $(`#_ticket_allowed_max_${i}`).val();
                        let ticketObj = {};
                        if (ticketQty) ticketObj.ticketQty = ticketQty;
                        if (ticketName) ticketObj.ticketName = ticketName;
                        if (salePrice) ticketObj.salePrice = salePrice;
                        if (ticketType) ticketObj.ticketType = ticketType;
                        if (ticketDesc) ticketObj.ticketDesc = ticketDesc;
                        if (salesStartDate) ticketObj.salesStartDate = salesStartDate;
                        if (salesStartTime) ticketObj.salesStartTime = salesStartTime;
                        if (salesEndDate) ticketObj.salesEndDate = salesEndDate;
                        if (salesEndTime) ticketObj.salesEndTime = salesEndTime;
                        if (minTicket) ticketObj.minTicket = minTicket;
                        if (maxTicket) ticketObj.maxTicket = maxTicket;
                        ticketArray.push(ticketObj);
                        $scope.isTicktedVisible = false;
                        ticketObj.happeningsId = $("#select_happeings_id").val();
                        $scope.allTicketArray.push(ticketObj);
                        $scope.whatsonticketList = [];
                        $("#select_happeings_id").val('');
                    }
                    $(`#e-ticket-qty-${i},#e-ticket-name-${i},#e-ticket-price-${i},#e-ticket-type-${i},#_ticket_desc_${i}
                    #_ticket_absorb_fees_${i},#_ticket_sales_start_date_${i},#_ticket_sales_start_time_${i},#_ticket_sales_end_date_${i}
                    #_ticket_sales_end_time_${i},#_ticket_allowed_mini_${i},#_ticket_allowed_max_${i}`).val(null);
                });
            }

            $scope.saveToPreview = () => {
                let happeningsIds = JSON.parse(localStorage.getItem('happeningsIdAFT'));
                if (happeningsIds && happeningsIds.length) {
                    loader.visible();
                    HappeningsTicket.createAndUpdate({ params: { tickets: $scope.allTicketArray } }).$promise.then((res) => {
                        $scope.allTicketArray = [];
                        toastMsg(true, "Successfully created!.");
                        $state.go("edit-happenings");
                        loader.hidden();
                    })
                }
            }

            $scope.viewTicketEvent = (i) => {
                $scope.tciketViewData_M = $scope.allTicketArray[i];
                $('#viewTicketEventsModal').modal({ backdrop: 'static', keyboard: false });
            }

            if ($scope.userDetails.isAdmin == false) {
                $scope.userId = $scope.userDetails.id;
                $scope.isBusinessSelect = true;
                $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                $("#autocompleteBusiness").attr('disabled', true);
                localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userDetails.id, ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
            }

        }])
    .controller('whatsonPokerEventsCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'loader', '$stateParams', 'Happenings',
        function ($scope, $state, $rootScope, Business, $http, loader, $stateParams, Happenings) {

            if (!$rootScope.whatson_title) $state.go('create-whats-on');

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

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
                    Business.find({ filter: { where: { status: "active" }, "fields": ["businessName", "id", "email"] } }).$promise.then((res) => {
                        $scope.businessSelection = res;
                    });
                }
            }

            $scope.isBusinessSelect = false;

            $scope.useremail = $rootScope.currentUser.email;
            $scope.userId = "";
            $rootScope.selectedVenue = JSON.parse(localStorage.getItem("selectedVenue"));
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
            }

            $scope.getBusinessName = () => {
                return $scope.businessDelection;
            };

            if ($rootScope.whatson_title) {
                $scope.title = $rootScope.whatson_title;
            }

            $scope.eventDates = [];
            $scope.addDates = () => {
                let date, dateFormat, registrationCloses, lateRegoTime, startTime, endTime, dateNo, month, year, isTrue = true, gameType, buyIn, reBuy, guarantee, added, reEntry, startingStack, addon, reBuyStack, addOnStack, reEntryStack, buyInCloses, reBuyCloses, addOnCloses, reEntryCloses, maxNoOfReBuy, maxNoOfAddOns, maxNoOfReEntry;
                if (!$("#gameType").val()) {
                    isTrue = false;
                    $("#gameType-poker-err").text('Game type is required!');
                }
                if (!$("#poker_date").val()) {
                    isTrue = false;
                    $("#date-poker-err").text('Event date is required!');
                }
                if (!$("#event_time").val()) {
                    isTrue = false;
                    $("#poker-start-time-err").text('Time is required!');
                }
                if (!$("#closes_time").val()) {
                    isTrue = false;
                    $("#closes_time_err").text('Registration closes time is required!');
                }
                if (!$("#late_rego").val()) {
                    isTrue = false;
                    $("#late_rego_err").text('Late Rego is required!');
                }
                if (!$("#guarantee").val()) {
                    isTrue = false;
                    $("#guarantee_err").text('Guarantee is required!');
                }
                if (!$("#event_added").val()) {
                    isTrue = false;
                    $("#event_added_err").text('Event added is required!');
                }

                if (isTrue) {
                    gameType = $("#gameType").val();
                    date = $("#poker_date").val();
                    let dateF = date.split('-');
                    dateFormat = `${dateF[2]}-${dateF[1]}-${dateF[0]}`;
                    startTime = $("#event_time").val(); endTime = "11:59 pm";
                    registrationCloses = $("#closes_time").val();
                    lateRegoTime = $("#late_rego").val(); guarantee = $("#guarantee").val();
                    added = $("#event_added").val(); buyIn = $("#buy-in").val();
                    reBuy = $("#re-buy-in").val(); addon = $("#add-ons-in").val();
                    reEntry = $("#re-entry-in").val(); startingStack = $("#starting-stack").val();
                    reBuyStack = $("#re-buy-stack").val(); addOnStack = $("#add-on-stack").val();
                    reEntryStack = $("#re-entry-stack").val(); buyInCloses = $("#buy_in_closes").val();
                    reBuyCloses = $("#re_buy_in_closes").val(); addOnCloses = $("#addon_closes").val();
                    reEntryCloses = $("#re_entry_closes").val(); maxNoOfReBuy = $("#maxNoOfReBuys").val();
                    maxNoOfAddOns = $("#maxNoOfAddons").val(); maxNoOfReEntry = $("#maxNoOfReEntry").val();
                    dateNo = dateF[2];
                    month = dateF[1];
                    year = dateF[0];
                    let s_date = new Date($("#poker_date").val());
                    s_date.setHours((convertTime12to24(startTime)).split(':')[0]);
                    s_date.setMinutes((convertTime12to24(startTime)).split(':')[1]);
                    startTimeFormat = s_date.getTime();
                    let e_date = new Date($("#poker_date").val());
                    e_date.setHours(23);
                    e_date.setMinutes(59);
                    endTimeFormat = e_date.getTime();
                    if (startTimeFormat && endTimeFormat) {
                        $scope.eventDates.push({
                            gameType, date, dateFormat, startTime, endTime, registrationCloses, lateRegoTime, guarantee, added,
                            buyIn, reBuy, addon, reEntry, startingStack, reBuyStack, addOnStack, reEntryStack, buyInCloses, reBuyCloses,
                            addOnCloses, reEntryCloses, maxNoOfReBuy, maxNoOfAddOns, maxNoOfReEntry, dateNo, month, year, startTimeFormat, endTimeFormat
                        });
                        $("#events_start_date,#events_regis_time,#events_start_time,#events_end_time").val(null);
                        toastMsg(true, "Successfully added!");
                    } else {
                        toastMsg(false, "Start and end time error. Please try again");
                    }
                }

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

            uploadSeondImg = () => {
                return new Promise((resolve, reject) => {
                    var fd = new FormData();
                    for (let da of $scope.eventDates) {
                        var uid = uuidv4();
                        fd.append(`happenings_0`, dataURItoBlob($("#img-second-pre").attr('src')), `${uid}.png`);
                    }
                    $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess) {
                                $scope.happeningsImage = res.data.result;
                                resolve({ isSuccess: true, img: res.data.result });
                            } else loader.hidden()
                        }, (err) => loader.hidden())
                })
            }

            uploadImg = () => {
                return new Promise((resolve, reject) => {
                    var fd = new FormData();
                    for (let da of $scope.eventDates) {
                        var uid = uuidv4();
                        fd.append(`happenings_0`, dataURItoBlob($("#img-pre").attr('src')), `${uid}.png`);
                    }
                    $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess) {
                                $scope.happeningsImage = res.data.result;
                                resolve({ isSuccess: true, img: res.data.result });
                            } else loader.hidden()
                        }, (err) => loader.hidden())
                })
            }

            $scope.gotoLive = () => {
                if (localStorage.getItem('pokerIdAFT')) {
                    let ids = JSON.parse(localStorage.getItem('pokerIdAFT'));
                    if (ids && ids.length) {
                        loader.visible();
                        Happenings.statusUpdate({ params: { ids } });
                        toastMsg(true, "Successfully updated!.");
                        $state.go("edit-happenings");
                    }
                    setTimeout(function () {
                        toastMsg(true, "Successfully updated!.");
                        loader.hidden();
                    }, 500);
                }
            }

            $scope.saveEvents = () => {
                let isTrue = true;
                let title, fullDesc, happeningsCategoryId, dates = [];

                $scope.addDates();

                if (!$("#desc").val()) {
                    isTrue = false;
                    $("#desc-error").text("Description is required!");
                }

                clearData = () => {
                    $("#desc,#buyIn,#gameType,#buy_in,#re_buy,#guarantee").val(null);
                    $("#buy_in,#re_buy,#guarantee").empty();
                    $scope.eventDates = [];
                }

                if (isTrue && $rootScope.whatson_title && $scope.eventDates && $scope.eventDates.length) {
                    fullDesc = $("#desc").val();
                    let category = $rootScope.happeningsCategory.find(m => m._name == 'poker');
                    if (category && category.id) happeningsCategoryId = category.id;
                    else $state.go('create-whats-on');
                    if (happeningsCategoryId) {
                        loader.visible();
                        let primaryImg = secondaryImg = [];

                        let create_po_ev = () => {
                            title = $rootScope.whatson_title;
                            let titleTxt = title.toString().replace(/\s+/g, '');
                            dates = $scope.eventDates;
                            let isTicketedEvent = $rootScope.isTicketedEvent;
                            if (localStorage.getItem("whatsOnPokerPre")) localStorage.removeItem("whatsOnPokerPre");
                            localStorage.setItem("whatsOnPokerPre", JSON.stringify({ fullDesc, title, primaryImg, secondaryImg, dates, happeningsCategoryId, ownerId: $scope.userId, isTicketedEvent }));
                            let groupId = `${Math.random().toString(36).substring(2)}${(new Date()).getTime()}${Math.random().toString(36).substring(2)}`;

                            let status = "Pending";
                            if ($("#poker-live").is(":checked")) status = "Live";

                            Happenings.createAndUpdate({
                                params: {
                                    fullDesc, title, primaryImg, secondaryImg, dates, happeningsCategoryId, ownerId: $scope.userId,
                                    isTicketedEvent, groupId, titleTxt, status
                                }
                            })
                                .$promise.then((res) => {
                                    $scope.whatsOnPokerPre = JSON.parse(localStorage.getItem("whatsOnPokerPre"));
                                    localStorage.removeItem('pokerIdAFT');
                                    localStorage.setItem('pokerIdAFT', JSON.stringify(res.data.result));
                                    toastMsg(true, "Successfully created!.");
                                    clearData();
                                    $state.go("edit-happenings");
                                }, (err) => {
                                    loader.hidden();
                                    clearData();
                                    toastMsg(false, "Please try again!");
                                });
                        }

                        if ($("#img-pre").attr('src') && $("#img-second-pre").attr('src')) {
                            uploadImg().then((res) => {
                                if (res && res.isSuccess) {
                                    primaryImg = res.img;
                                    uploadSeondImg().then((res_1) => {
                                        if (res_1 && res_1.isSuccess) {
                                            secondaryImg = res_1.img;
                                            create_po_ev();
                                        }
                                    });
                                } else create_po_ev();
                            });
                        } else if ($("#img-pre").attr('src')) {
                            uploadImg().then((res) => {
                                if (res && res.isSuccess) {
                                    primaryImg = res.img;
                                    create_po_ev();
                                } else create_po_ev();
                            });
                        } else if ($("#img-second-pre").attr('src')) {
                            uploadSeondImg().then((res_1) => {
                                if (res_1 && res_1.isSuccess) {
                                    secondaryImg = res_1.img;
                                    create_po_ev();
                                } else create_po_ev();
                            });
                        } else create_po_ev();
                    }
                } else if (!$rootScope.whatson_title) {
                    toastMsg(false, "Event title is required!. Please try again!");
                    $state.go('create-whats-on');
                } else {
                    if ($scope.eventDates.length == 0) toastMsg(false, "Please add the date. Please try again!");
                }
            }
        }])
    .controller('whatsonTriviaEventsCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'loader', '$stateParams', 'Happenings', 'getAllVenues',
        function ($scope, $state, $rootScope, Business, $http, loader, $stateParams, Happenings, getAllVenues) {

            if (!$rootScope.whatson_title) $state.go('create-whats-on');

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
                    setTimeout(function () {
                        $scope.businessSelection = getAllVenues.get();
                        loader.hidden();
                    }, 1000)
                }
            }

            $scope.isBusinessSelect = false;

            $scope.useremail = $rootScope.currentUser.email;
            $scope.userId = "";
            $rootScope.selectedVenue = JSON.parse(localStorage.getItem("selectedVenue"));
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
            }

            $scope.getBusinessName = () => {
                return $scope.businessSelection;
            };

            if ($rootScope.whatson_title) {
                $scope.title = $rootScope.whatson_title;
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

            $scope.eventDates = [];
            $scope.addDates = () => {
                let isTrue = true;
                if (!$("#events_start_date").val()) {
                    isTrue = false;
                    $("#events_start_date_err").text('Event date is required!');
                }
                if (!$("#events_regis_time").val()) {
                    isTrue = false;
                    $("#events_regis_time_err").text('Registration Closes is required!');
                }
                if (!$("#events_start_time").val()) {
                    isTrue = false;
                    $("#events_start_time_err").text('Start time is required!');
                }
                if ($("#trivia_entry").val() == 'select') {
                    isTrue = false;
                    $("#trivia_entry_err").text('Entry is required!');
                }
                if ($("#trivia_entry").val() == 'Paid' && !$("#entry_Fee").val()) {
                    isTrue = false;
                    $("#entry_Fee_err").text('Entry fee is required!');
                } else {
                    $("#entry_Fee_err").text('');
                }
                if (isTrue) {
                    if ($("#events_start_date").val()) {
                        let datesSelect = $("#events_start_date").val().split(',');
                        for (let val of datesSelect) {
                            let date, dateFormat, registrationTime, startTime, endTime, dateNo, month, year, entryFee, entryType, startTimeFormat, endTimeFormat;
                            let dateF = val.split('-');
                            date = `${dateF[2]}-${("0" + dateF[1]).slice(-2)}-${("0" + dateF[0]).slice(-2)}T00:00:00.000Z`;
                            dateFormat = `${("0" + dateF[0]).slice(-2)}-${("0" + dateF[1]).slice(-2)}-${dateF[2]}`;
                            registrationTime = $("#events_regis_time").val();
                            startTime = $("#events_start_time").val();
                            endTime = "11:59 pm";
                            dateNo = ("0" + dateF[0]).slice(-2); month = ("0" + dateF[1]).slice(-2); year = dateF[2];
                            entryFee = parseInt($("#entry_Fee").val()) || 0;
                            entryType = $("#trivia_entry").val();
                            let s_date = new Date(`${("0" + dateF[2]).slice(-2)}-${("0" + dateF[1]).slice(-2)}-${dateF[0]}`);
                            s_date.setHours((convertTime12to24(startTime)).split(':')[0]);
                            s_date.setMinutes((convertTime12to24(startTime)).split(':')[1]);
                            startTimeFormat = s_date.getTime();
                            let e_date = new Date(`${dateF[2]}-${("0" + dateF[1]).slice(-2)}-${("0" + dateF[0]).slice(-2)}`);
                            e_date.setHours(23);
                            e_date.setMinutes(59);
                            endTimeFormat = e_date.getTime();
                            $scope.eventDates.push({
                                date, dateFormat, registrationTime,
                                startTimeFormat, endTimeFormat, startTime, endTime, dateNo, month, year, entryFee, entryType
                            });
                        }

                        $("#events_start_date,#events_regis_time,#events_start_time,#events_end_time").val(null);
                        $("#entry_Fee").val('');
                        toastMsg(true, "Successfully added!");
                    } else toastMsg(false, "Please try again!");
                }
            }

            $scope.primEvnImg = [];
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
                    $scope.primEvnImg = [];
                    $scope.primEvnImg.push({ path: imgSrc });
                    $("#ticketEventImg").val('');
                    $("#image-crop-md").modal('hide');
                    $scope.$apply();
                    cropper_2.destroy();
                    cropper_2.reset();
                    cropper_2.clear();
                    // $("#img-pre").attr('src', imgSrc);
                    //  $(".img-h-s").css({ display: 'block' });
                    //  $(".img-c-s").css({ display: 'none' });
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
                    //  $("#img-second-pre").attr('src', imgSrc);
                    // $(".img-h-s-s").css({ display: 'block' });
                    // $(".img-c-s-s").css({ display: 'none' });
                    $scope.seEvImg = [];
                    $scope.seEvImg.push({ path: imgSrc });
                    $scope.$apply();
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

            uploadImg = () => {
                return new Promise((resolve, reject) => {
                    var fd = new FormData();
                    for (let da of $scope.eventDates) {
                        var uid = uuidv4();
                        fd.append(`happenings_0`, dataURItoBlob($scope.primEvnImg[0].path), `${uid}.png`);
                    }
                    $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess) {
                                $scope.happeningsImage = res.data.result;
                                resolve({ isSuccess: true, img: res.data.result });
                            } else loader.hidden()
                        }, () => loader.hidden())
                })
            }

            uploadSeondImg = () => {
                return new Promise((resolve, reject) => {
                    var fd = new FormData();
                    for (let da of $scope.eventDates) {
                        var uid = uuidv4();
                        fd.append(`happenings_0`, dataURItoBlob($scope.seEvImg[0].path), `${uid}.png`);
                    }
                    $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess) {
                                $scope.happeningsImage = res.data.result;
                                resolve({ isSuccess: true, img: res.data.result });
                            } else loader.hidden()
                        }, (err) => loader.hidden())
                })
            }

            $scope.gotoLive = () => {
                if (localStorage.getItem('triviaIdAFT')) {
                    let ids = JSON.parse(localStorage.getItem('triviaIdAFT'));
                    if (ids && ids.length) {
                        loader.visible();
                        Happenings.statusUpdate({ params: { ids } });
                        toastMsg(true, "Successfully updated!.");
                        $state.go("edit-happenings");
                    }
                    setTimeout(function () {
                        toastMsg(true, "Successfully updated!.");
                        loader.hidden();
                    }, 500);
                }
            }

            $scope.whatsOnTriviaPre = {};
            $scope.saveEvents = () => {
                let isTrue = true;
                let title, fullDesc, happeningsCategoryId, dates = [];

                if (!$("#desc").val()) {
                    isTrue = false;
                    $("#desc-error").text("Description is required!");
                }

                clearData = () => {
                    $("#desc").val(null);
                    $scope.eventDates = [];
                }

                if (isTrue && $rootScope.whatson_title) {
                    fullDesc = $("#desc").val();
                    let category = $rootScope.happeningsCategory.find(m => m._name == 'trivia');
                    if (category && category.id) happeningsCategoryId = category.id;
                    else $state.go('create-whats-on');
                    if (happeningsCategoryId) {
                        loader.visible();
                        let primaryImg = secondaryImg = [];
                        let create_po_ev = () => {
                            title = $rootScope.whatson_title;
                            dates = $scope.eventDates;
                            let isTicketedEvent = $rootScope.isTicketedEvent;

                            if (localStorage.getItem("whatsOnTriviaPre")) localStorage.removeItem("whatsOnTriviaPre");
                            localStorage.setItem("whatsOnTriviaPre", JSON.stringify({
                                fullDesc, title, primaryImg, secondaryImg, dates, happeningsCategoryId,
                                ownerId: $scope.userId, isTicketedEvent
                            }));

                            let titleTxt = title.toString().replace(/\s+/g, '');
                            let groupId = `${Math.random().toString(36).substring(2)}${(new Date()).getTime()}${Math.random().toString(36).substring(2)}`;
                            let status = "Pending";
                            if ($("#trivia-live").is(":checked")) status = "Live";
                            let isBooking = false;
                            isBooking = $("#isBookingEnabled").is(":checked");

                            Happenings.createAndUpdate({
                                params: {
                                    fullDesc, title, primaryImg, secondaryImg, dates, happeningsCategoryId,
                                    ownerId: $scope.userId, isTicketedEvent, groupId, titleTxt, status, isBooking
                                }
                            })
                                .$promise.then((res) => {
                                    $scope.whatsOnTriviaPre = JSON.parse(localStorage.getItem("whatsOnTriviaPre"));
                                    localStorage.removeItem('triviaIdAFT');
                                    localStorage.setItem('triviaIdAFT', JSON.stringify(res.data.result));
                                    toastMsg(true, "Successfully created!.");
                                    clearData();
                                    $state.go("edit-happenings");
                                }, (err) => {
                                    loader.hidden();
                                    clearData();
                                    toastMsg(false, "Please try again!");
                                });
                        }

                        if ($scope.primEvnImg.length && $scope.seEvImg.length) {
                            uploadImg().then((res) => {
                                if (res && res.isSuccess) {
                                    primaryImg = res.img;
                                    uploadSeondImg().then((res_1) => {
                                        if (res_1 && res_1.isSuccess) {
                                            secondaryImg = res_1.img;
                                            create_po_ev();
                                        }
                                    });
                                } else create_po_ev();
                            });
                        } else if ($scope.primEvnImg.length) {
                            uploadImg().then((res) => {
                                if (res && res.isSuccess) {
                                    primaryImg = res.img;
                                    create_po_ev();
                                } else create_po_ev();
                            });
                        } else if ($scope.seEvImg.length) {
                            uploadSeondImg().then((res_1) => {
                                if (res_1 && res_1.isSuccess) {
                                    secondaryImg = res_1.img;
                                    create_po_ev();
                                } else create_po_ev();
                            });
                        } else create_po_ev();

                    }
                } else if (!$rootScope.whatson_title) {
                    toastMsg(false, "Event title is required!. Please try again!");
                    $state.go('create-whats-on');
                }
            }
        }]);