angular
    .module('app')
    .controller('manageEventCtl', ['$scope', '$state', '$rootScope', 'Business', 'Events', '$http', function ($scope, $state, $rootScope, Business, Events, $http) {
        $(".event-sub-menu").addClass('in slowDown');
        $(".event-menu").html(`<i class="far fa-calendar-alt"></i> <span
                    class="nav-label"> &nbsp; Events</span>
                    <i class="fas fa-angle-down pull-right"></i>`);


        toastMsg = (isVaild, msg) => {
            if (isVaild)
                toastr.success(msg);
            else
                toastr.error(msg);
            toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
        }


        $scope.isBusinessSelect = false;

        if (!$scope.userId) {
            $scope.userId = $rootScope.currentUser.id;
        }

        $scope.useremail = $rootScope.currentUser.email;
        $scope.userId = "";
        if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.email == "admin@barm8.com.au") {
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

        $scope.viewEvent = (id) => {
            $rootScope.eventId = id;
            $rootScope.ownerId = $scope.userId;
            $state.go('view-events');
        }

        $scope.editEvent = (id) => {
            $rootScope.eventId = id;
            $rootScope.ownerId = $scope.userId;
            $state.go('edit-events');
        }

        $scope.eventsList = [];
        $scope.getAllEvents = () => {
            if ($scope.userId) {
                Events.find({ filter: { where: { ownerId: $scope.userId }, include: [{ relation: "eventDates" }] } }).$promise.then((res) => {
                    $scope.eventsList = [];
                    if (res && res.length) $scope.eventsList = res;
                });
            }
        }

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
                            $scope.getAllEvents();
                        }
                    } else {
                        $("#businessErr").text('Please select the Business name');
                    }
                }
            }
        }

        $scope.confirmRemoveEvent = () => {
            let id = $("#confirmRemove_Yes_btn").attr('data-valueid');
            if (id) {
                $('#removeConfirmModal').modal('hide');
                Events.findOne({ filter: { where: { id } } }).$promise.then((res) => {
                    let result = res;
                    if (result.img && result.img.length)
                        $http.post('/spaceFileDelete', { fileName: result.img[0].name });
                    if (result.organiser && result.organiser.img && result.organiser.img.length)
                        $http.post('/spaceFileDelete', { fileName: result.organiser.img[0].name });
                    Events.removeEvent({ params: { id } }).$promise.then((res) => {
                        $scope.getAllEvents();
                        if (res.data.isSuccess) {
                            toastMsg(true, "Successfully deleted.");
                        }
                        else
                            toastMsg(false, "Please try again");
                    });
                });
            } else
                toastMsg(false, "please try again");
        }

        $scope.deleteEvent = (id) => {
            if (id) {
                $('#removeConfirmModal').modal({ backdrop: 'static', keyboard: false });
                $("#confirmRemove_Yes_btn").attr('data-valueid', id);
            }
            else
                toastMsg(false, "please try again");
        };
    }])
    .controller('createEventCtl', ['$scope', '$state', '$rootScope', 'Business', 'Events', 'EventCategory', 'EventPromoCode', '$http', 'EventGenre', 'Events', 'EventCategory', 'TicketGeneralSetting', 'Tickets', 'EventTicketGroup', 'EventTicketType', 'EventPromoCode',
        function ($scope, $state, $rootScope, Business, Events, EventCategory, EventPromoCode, $http, EventGenre, Events, EventCategory, TicketGeneralSetting, Tickets, EventTicketGroup, EventTicketType, EventPromoCode) {
            $(".event-sub-menu").addClass('in slowDown');
            $(".event-menu").html(`<i class="far fa-calendar-alt"></i> <span
                    class="nav-label"> &nbsp; Events</span>
                    <i class="fas fa-angle-down pull-right"></i>`);

            const convertTime12to24 = (time12h) => {
                const [time, modifier] = time12h.split(' ');
                let [hours, minutes] = time.split(':');
                (hours === '12' ? hours = '00' : ((modifier === 'PM' || modifier === 'pm') ? hours = parseInt(hours, 10) + 12 : ""));
                return `${hours}:${minutes}`;
            }

            function dataURItoBlob(dataURI) {
                var byteString;
                if (dataURI.split(',')[0].indexOf('base64') >= 0)
                    byteString = atob(dataURI.split(',')[1]);
                else
                    byteString = unescape(dataURI.split(',')[1]);

                var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

                var ia = new Uint8Array(byteString.length);
                for (var i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }

                return new Blob([ia], { type: mimeString });
            };

            $scope.imageDetails = {};
            $scope.getFilenameandType = (arg, e) => {
                if (e.data('name') == "whatshotImageAdd") {
                    $scope.imageDetails.whatshotImageAddCrop = '';
                    $scope.imageDetails.whatshotImageAddCrop = Math.random().toString(36).substring(2) + "_" + arg.replace(/ /g, "_");
                }
                if (e.data('name') == "eventOrganiser") {
                    $scope.imageDetails.eventOrganiserAddCrop = '';
                    $scope.imageDetails.eventOrganiserAddCrop = Math.random().toString(36).substring(2) + "_" + arg.replace(/ /g, "_");
                }
            };


            //Sponsors image convert a base64 image into a image file 
            $scope.whatshotImage = []; $scope.eventOrganiserFullImage = [];
            $scope.imageconverttofile = (data) => {
                $('#imageCropModal').modal('hide');
                if ($(".action #btnCrop").data('name') === "whatshotImageAdd") {
                    $scope.whatshotImage = [];
                    $("#upload__btn__wrap1").html('');
                    $(".container .imageBox").css('background-image', '');
                    $("#upload__btn__wrap1").append(`<img src=${data} style="height: 105px;margin-top: -21px;margin-left: -21px;object-fit: cover;" />`);
                    $scope.whatshotImage.push({ imgBlop: dataURItoBlob(data), imgName: $scope.imageDetails.whatshotImageAddCrop });
                }
                else if ($(".action #btnCrop").data('name') === "eventOrganiser") {
                    $scope.eventOrganiserFullImage = [];
                    $("#upload__btn__event_organiser").html('');
                    $(".container .imageBox").css('background-image', '');
                    $("#upload__btn__event_organiser").append(`<img src=${data} style="height: 105px;margin-top: -21px;margin-left: -21px;    object-fit: cover;" />`);
                    $scope.eventOrganiserFullImage.push({ imgBlop: dataURItoBlob(data), imgName: $scope.imageDetails.eventOrganiserAddCrop });
                }
            };


            $scope.eventName = "Create new event";

            $scope.update = function () {
                if ($scope.eventTitle.length)
                    $scope.eventName = $scope.eventTitle;
                else
                    $scope.eventName = "Create new event";
            };
            $scope.$watch('eventTitle', function (nval, oval) {
                if (oval !== nval) {
                    $scope.update();
                }
            });

            $scope.eventAgeRegtriction = ["All Ages", "18 and Over", "Under 18", "Other"];

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }


            $scope.isBusinessSelect = false;

            if (!$scope.userId) {
                $scope.userId = $rootScope.currentUser.id;
            }

            $scope.eventTicketTypesList = [];
            $scope.getTicketTypes = () => {
                EventTicketType.find({ filter: { where: { ownerId: $scope.userId } } }).$promise.then((res) => {
                    $scope.eventTicketTypesList = res
                });
            };


            $scope.EventTicketGroupsList = [];
            $scope.getTicketgroups = () => {
                EventTicketGroup.find({ filter: { where: { ownerId: $scope.userId } } }).$promise.then((res) => { 
                    $scope.EventTicketGroupsList = res;
                 });
            }

            $scope.useremail = $rootScope.currentUser.email;
            $scope.userId = "";
            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.email == "admin@barm8.com.au") {
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

            $scope.BusinessSelected = (arg) => {
                $("#businessErr").text('');
                if ($("#autocompleteBusiness").data('id')) {
                    arg = $("#autocompleteBusiness").data('id');
                    $scope.getTicketgroups();
                    $scope.getTicketTypes();
                    if ($("#businessSubmit").hasClass('businessSubmit')) {
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    }
                    if (arg != "select") {
                        $scope.isBusinessSelect = true;
                        $scope.userId = arg;

                    }
                } else {
                    $("#businessErr").text('Please select the Business name');
                }
            }

            $scope.eventCategories = [];
            $scope.getEventCategory = () => {
                EventCategory.find({ filter: { include: "eventGenres" } }).$promise.then(res => $scope.eventCategories = res);
            };
            $scope.getEventCategory();

            $scope.chgEventCategory = (id) => {
                if (id) {
                    $scope.eventGenreArrayList = $scope.eventCategories.find(m => m.id == id).eventGenres;
                    $("#event-category-error").css({ display: 'none' });
                }
                else
                    $scope.eventGenreArrayList = [];
            }

            $scope.eventsList = []; $scope.selectEventTitle;
            $scope.businessVaild = (isVaild = false) => {
                if (!$("#businessSubmit").is('.businessReset'))
                    toastMsg(false, 'Please select the business!');
                else {
                    $scope.getAllEvents();
                }
            };

            $scope.createNewPromoCode = (th) => {
                if ($(th).find('option:selected').val() == 'addNew') {
                    $("#addNewpromoCodeModal").modal({ backdrop: 'static', keyboard: false });
                }
            };

            $scope.getPromoCode = () => {
                EventPromoCode.find().$promise.then((res) => {
                    if (res && res.length)
                        $scope.EventPromoCodeList = res;
                });
            }
            $scope.getPromoCode();

            $scope.promoCodeCreate = () => {
                let ticketOption = { ownerId: '' };
                if (ticketOption) {
                    ticketOption.ownerId = $scope.userId;
                    ticketOption.name = document.getElementById("ticket_enter_promo_code").value;
                    ticketOption.value = document.getElementById("ticket_enter_promo_code").value.toLowerCase().replace(/\s/g, '');
                    EventPromoCode.create(ticketOption).$promise.then((res) => {
                        toastMsg(true, 'promo code is successfully created.');
                        $scope.getPromoCode();
                    });
                    $('#addNewpromoCodeModal').modal('hide');
                }
            };

            $scope.createNewTicketOption = (arg) => {
                let ticketOption = { ownerId: '' };
                if (arg == 'ticketGroup') {
                    ticketOption.ownerId = $scope.userId;
                    if (ticketOption.ownerId && document.getElementById("ticket_enter_ticket_group").value) {
                        ticketOption.name = document.getElementById("ticket_enter_ticket_group").value;
                        ticketOption.value = document.getElementById("ticket_enter_ticket_group").value.toLowerCase().replace(/\s/g, '');
                        $("#ticket_enter_ticket_group").val('');
                        EventTicketGroup.create(ticketOption).$promise.then((res) => {
                            toastMsg(true, 'Ticket group is successfully created.');
                            $scope.getTicketgroups();
                        });
                        $('#addNewgroupModal').modal('hide');
                    } else toastMsg(false, 'Please try again');
                } else if (arg == 'ticketType') {
                    ticketOption.ownerId = $scope.userId;
                    if (ticketOption.ownerId) {
                        ticketOption.name = document.getElementById("ticket_enter_ticket_type").value;
                        ticketOption.value = document.getElementById("ticket_enter_ticket_type").value.toLowerCase().replace(/\s/g, '');
                        EventTicketType.create(ticketOption).$promise.then((res) => {
                            toastMsg(true, 'Ticket Type is successfully created.');
                            $scope.getTicketTypes();
                        });
                        $("#ticket_enter_ticket_type").val('');
                        $('#addNewTypeModal').modal('hide');
                    } else toastMsg(false, 'Please try again');
                }
            };

            $scope.addNewTypeAndname = (arg, th) => {
                if (arg == 'ticketType' && $(th).find('option:selected').val() == 'addNew') {
                    $("#addNewTypeModal").modal({ backdrop: 'static', keyboard: false });
                }
                else if ($(th).find('option:selected').val() == 'addNew') {
                    $("#addNewgroupModal").modal({ backdrop: 'static', keyboard: false });
                }
            };

            $scope.eventsDateList = [];
            $scope.eventsDateAdd = () => {
                if ($("#events_start_time").val() && $("#events_end_time").val()) {
                    let date = $("#events_start_date").val(), cdate = new Date($("#events_start_date").val()), dateNo = ((cdate.getDate()) >= 10) ? (cdate.getDate()) : '0' + (cdate.getDate()),
                        month = ((cdate.getMonth() + 1) >= 10) ? (cdate.getMonth() + 1) : '0' + (cdate.getMonth() + 1),
                        year = cdate.getFullYear();
                    let eventDates = {
                        date, dateNo, month, year, startTime: $("#events_start_time").val(), endTime: $("#events_end_time").val(),
                        startDateUTC: (new Date(`${date} ${convertTime12to24($("#events_start_time").val())}:00`)).toISOString(),
                        endDateUTC: (new Date(`${date} ${convertTime12to24($("#events_end_time").val())}:00`)).toISOString()
                    };
                    if (eventDates && eventDates.date) {

                        if ($scope.eventsDateList && $scope.eventsDateList.length) {
                            let dateObj = $scope.eventsDateList.find(({ date }) => date === eventDates.date);
                            if (dateObj && dateObj.date) toastMsg(false, "Same date is already there. Please try again");
                            else $scope.eventsDateList.push(eventDates);
                        } else $scope.eventsDateList.push(eventDates);

                        $("#events_start_date,#events_start_time,#events_end_time").val('');
                    }
                } else {
                    if (!$("#events_start_time").val())
                        toastMsg(false, "Please select event start time!");
                    if (!$("#events_end_time").val())
                        toastMsg(false, "Please select event end time!");
                }

            }

            $scope.eventsDateRemove = i => $scope.eventsDateList.splice(i, 1);


            $scope.ticket_settings_per = ['select options...', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

            //Ticket Events
            var events = {};
            $scope.isVaildVenue = false;
            $scope.venueFind = () => {
                events.venue = { name: $("#events_venue_name").val() };
                if (events && events.venue && events.venue.name) {
                    Business.find({ filter: { where: { businessName: events.venue.name } } }).$promise.then(res => {
                        if (res && res.length) {
                            $("#events_add_btn").prop('disabled', false);
                            $scope.isVaildVenue = false;
                        } else {
                            $scope.isVaildVenue = true;
                        }
                    });
                } else {
                    $scope.isVaildVenue = false;
                }
            };

            $scope.eventTicketSelected = (id) => {
                if (id) $scope.ticketViewList = $scope.eventsList.find(({ id }) => id == id).eventDates[0];
                $scope.ticketViewList.eventName = $("#createTicket_eventId option:selected").text();
            };


            $scope.categoryId = "";

            $scope.createEvents = () => {

                afterErrorResult = (isSuccess, msg) => {
                    toastMsg(isSuccess, msg);
                    $("#events_add_btn").html('Save').prop('disabled', false);
                };

                $("#events_add_btn").html('<i class="fas fa-spinner fa-spin"></i> Save').prop('disabled', true);
                if ($("#businessSubmit").is('.businessReset')) {

                    events = {
                        SellTicketToBarM8: false, title: "", organiser: { name: "", desc: "", img: [] }, artist: "", ageRestrict: "", eventCategoryId: "", genre: "", img: [],
                        teaserMsg: "", fullDesc: "", announceDate: "", announceTime: "", announceUTC: "", venue: { name: "", address: "", city: "", state: "", zip: "" }, ownerId: ""
                    };

                    events.SellTicketToBarM8 = $("input[name='event-ticket-selling-r']:checked").val();
                    events.title = $("#eventTitle").val();
                    events.organiser = { name: $("#event_organiser_name").val(), desc: $("#event_organiser_details").val(), img: [] };
                    events.artist = $("#event_artists_guest").val(); events.ageRestrict = $("#ageRegistriction").val();
                    events.genre = $("#event_genre").val();
                    events.img = []; events.teaserMsg = $("#event_teaser_desc").val();
                    events.fullDesc = $("#event-full-desc").val();
                    events.announceDate = $("#announcement_date").val(); events.announceTime = $("#announcement_time").val();
                    events.announceUTC = ""; events.eventCategoryId = $scope.categoryId; events.venue = {
                        name: $("#events_venue_name").val(), address: $("#events_venue_address").val(),
                        city: $("#events_venue_city").val(), state: $("#events_venue_state").val(), zip: $("#events_venue_zip").val()
                    };

                    isVaild = true;

                    if ($("#events_start_date").val() && $("#events_start_time").val() && $("#events_end_time").val()) {
                        $scope.eventsDateAdd();
                    } else {
                        afterErrorResult(false, 'Please add the event date and start time, end time!');
                    }

                    if (!events.title) { isVaild = false; $("#event-t-Error").css({ 'display': 'block' }); }
                    if (events.organiser && !events.organiser.name) { isVaild = false; $("#event-t-organ-name-error").css({ 'display': 'block' }); }
                    if (events.organiser && !events.organiser.desc) { isVaild = false; $("#event-t-organ-desc-error").css({ 'display': 'block' }); }
                    if (!events.ageRestrict) { isVaild = false; $("#event-age-restriction-error").css({ 'display': 'block' }); }
                    if (!events.eventCategoryId) { isVaild = false; $("#event-category-error").css({ 'display': 'block' }); }
                    if (!events.teaserMsg) { isVaild = false; $("#event-teaser-error").css({ 'display': 'block' }); }
                    if (!events.fullDesc) { isVaild = false; $("#event-full-desc-error").css({ 'display': 'block' }); }
                    if (!events.announceDate) { isVaild = false; $("#event-announcement-date-error").css({ 'display': 'block' }); }
                    if (!events.announceTime) { isVaild = false; $("#event-announcement-time-error").css({ 'display': 'block' }); }
                    if (events.venue && !events.venue.name) { isVaild = false; $("#event-venue-name-error").css({ 'display': 'block' }); }
                    if ($scope.eventsDateList && $scope.eventsDateList.length == 0) { isVaild = false; afterErrorResult(false, 'Please add the event date and start time, end time!'); }



                    uploadImg = () => {
                        return new Promise((resolve, reject) => {
                            var fd = new FormData();
                            fd.append(`events_0`, $scope.whatshotImage[0].imgBlop, $scope.whatshotImage[0].imgName);
                            fd.append('organiser_0', $scope.eventOrganiserFullImage[0].imgBlop, $scope.eventOrganiserFullImage[0].imgName);
                            $http.post('/uploadEventsImg', fd, { headers: { 'Content-Type': undefined } })
                                .then((res) => {
                                    if (res && res.data && res.data.isSuccess) {
                                        for (let data of res.data.result) {
                                            if (data.from == 'events')
                                                events.img.push({ "name": data.fileName, path: `/uploads/${data.fileName}`, fullPath: data.path, from: "events" });
                                            else if (data.from == "organiser")
                                                events.organiser.img.push({ "name": data.fileName, path: `/uploads/${data.fileName}`, fullPath: data.path, from: "organiser" });
                                        }
                                        $scope.whatshotImage = [];
                                        $scope.eventOrganiserFullImage = [];
                                        resolve({ isSuccess: true, events });
                                    } else
                                        resolve({ isSuccess: false, events });
                                });
                        });
                    }

                    events.announceUTC = (new Date(`${events.announceDate} ${convertTime12to24(events.announceTime)}:00`)).toISOString();

                    if (isVaild) {
                        uploadImg().then((res) => {
                            if (res.isSuccess) {
                                events.ownerId = $scope.userId;
                                if (events.ownerId && events.img && events.img.length) {
                                    if ($scope.eventsDateList && $scope.eventsDateList.length) {
                                        Events.createAndUpdate({ params: { events, EventDates: $scope.eventsDateList } }).$promise.then((createRes) => {
                                            if (createRes && createRes.data && createRes.data.isSuccess) {
                                                $("#create_ticket_btn").attr('data-valueId', createRes.data.result.id);
                                                $scope.eventsDateList = [];
                                                $("#upload__btn__wrap1,#upload__btn__event_organiser").html('');
                                                $(`#events_venue_name,#eventTitle,#event_organiser_name,#event_organiser_details,#event_artists_guest,#event_teaser_desc,#event-full-desc,#events_start_date,#events_start_time,#events_end_time,#announcement_time`).val('');
                                                $(`#event-t-Error,#event-t-organ-name-error,#event-t-organ-desc-error,#event-age-restriction-error,#event-category-error,#event-teaser-error,
                                             #event-full-desc-error,#event-announcement-date-error,#event-announcement-time-error,#event-venue-name-error`).css({ 'display': 'none' });
                                                $("#nav-ticket-type").addClass('active in');
                                                $("#nav-event-create").removeClass('active in');
                                                $("#nav-ticket-tab").addClass('active');
                                                $("#nav-event-tab").removeClass('active');
                                                $('html, body').animate({ scrollTop: $("#nav-ticket-tab").offset().top }, 800);
                                                afterErrorResult(true, 'Event has been successfully created!');
                                            } else afterErrorResult(false, 'Please try again');
                                        });
                                    } else afterErrorResult(false, 'Please add the event date and start time, end time!');
                                } else afterErrorResult(false, 'Please enter the required field!');
                            } else afterErrorResult(false, 'Please try again!');
                        });
                    } else afterErrorResult(false, 'Please enter the required field!');
                } else afterErrorResult(false, 'Please select the business!');
            };

            $scope.createTickets = () => {
                let eventsId = $("#create_ticket_btn").data('valueid');
                $("#create_ticket_btn").prop('disabled', true);

                isAfter = (isSuccess = false, msg = "please try again!") => {
                    toastMsg(isSuccess, msg);
                    $("#create_ticket_btn").prop('disabled', false);
                };

                if ($("#businessSubmit").is('.businessReset')) {
                    if (eventsId) {
                        $("#ticket-setting-fixed-fee-per-error,#ticket-setting-fixed-fee-error,#ticket-fees-error,#ticket-sales-channel-error").css({ display: 'none' });

                        let ticketSettings = {
                            isCheckedFixedFee: false, isCheckedPercent: false, fixedFee: "", percent: "",
                            salesChannel: { appOnly: false, appAndDoor: false, doorOnly: false },
                            restrictionsMin: "", restrictionsMax: "", returnPolicy: { _1Day: false, _7Days: false, _30Days: false, _noRefund: false },
                            ticketInfo: "", pricingInfo: "", deliveryInfo: ""
                        }, isVaild = true;

                        if ($('input[name=ticket-fee-type]:checked').val() == 'percent')
                            ticketSettings.isCheckedPercent = true;
                        else if ($('input[name=ticket-fee-type]:checked').val() == 'fixedFee')
                            ticketSettings.isCheckedFixedFee = true;

                        if (!ticketSettings.isCheckedFixedFee && !ticketSettings.isCheckedPercent) {
                            isVaild = false;
                            $("#ticket-fees-error").css({ display: 'block' });
                        }

                        if (ticketSettings.isCheckedFixedFee) {
                            if (!$("#ticket-setting-fixed-fee").val()) {
                                $("#ticket-setting-fixed-fee-error").css({ display: 'block' });
                                isVaild = false;
                            }
                            else
                                ticketSettings.fixedFee = $("#ticket-setting-fixed-fee").val();
                        }

                        if (ticketSettings.isCheckedPercent) {
                            if ($("#ticket_settings_fee_per").val() == 'select options...') {
                                $("#ticket-setting-fixed-fee-per-error").css({ display: 'block' });
                                isVaild = false;
                            }
                            else
                                ticketSettings.percent = $("#ticket_settings_fee_per").val();
                        }

                        if ($('input[name=ticket-sales-channel]:checked').val()) {
                            let salesChannelVal = $('input[name=ticket-sales-channel]:checked').val();
                            if (salesChannelVal == 'appOnly')
                                ticketSettings.salesChannel = { appOnly: true, appAndDoor: false, doorOnly: false };
                            else if (salesChannelVal == 'appAndDoorOnly')
                                ticketSettings.salesChannel = { appOnly: false, appAndDoor: true, doorOnly: false };
                            else if (salesChannelVal == 'doorOnly')
                                ticketSettings.salesChannel = { appOnly: false, appAndDoor: false, doorOnly: true };
                        } else
                            $("#ticket-sales-channel-error").css({ display: 'block' });

                        if ($('input[name=ticket-return-type-list]:checked').val()) {
                            let ticketReturnVal = $('input[name=ticket-return-type-list]:checked').val();
                            if (ticketReturnVal == "1")
                                ticketSettings.returnPolicy._1Day = true;
                            else if (ticketReturnVal == "7")
                                ticketSettings.returnPolicy._7Days = true;
                            else if (ticketReturnVal == '30')
                                ticketSettings.returnPolicy._30Days = true;
                            else if (ticketReturnVal == 'noRefunds')
                                ticketSettings.returnPolicy._noRefund = true;
                        } else
                            $("#ticket-return-policy-error").css({ display: 'block' });

                        if ($("#min_ticket_per_order").val())
                            ticketSettings.restrictionsMin = $("#min_ticket_per_order").val();

                        if ($("#max_ticket_per_order").val())
                            ticketSettings.restrictionsMax = $("#max_ticket_per_order").val();

                        if ($("#ticketInfoGenSet").val())
                            ticketSettings.ticketInfo = $("#ticketInfoGenSet").val();

                        if ($("#pricingAndFeeInfoGenSet").val())
                            ticketSettings.pricingInfo = $("#pricingAndFeeInfoGenSet").val();

                        if ($("#collectionAndDeliveryInfoGenSet").val())
                            ticketSettings.deliveryInfo = $("#collectionAndDeliveryInfoGenSet").val();

                        let ticketArray = [];
                        for (let i in $scope.ticketTypesList) {

                            let type, name = $(`#ticket_name_${i} option:selected`).text(), eventTicketTypeId = $(`#ticket_name_${i} option:selected`).val(), eventTicketGroupId = $(`#ticket_group_name_${i} option:selected`).val(), group = $(`#ticket_group_name_${i} option:selected`).text(), qty = $(`#ticket_qty_${i}`).val(),
                                basePrice = $(`#ticket_base_price_${i}`).val(), totalPrice = $(`#ticket_online_price_${i}`).val(), desc = $(`#ticket_settings_desc_${i}`).val(),
                                salesStartDate = $(`#ticket_settings_start_date_${i}`).val(), salesStartTime = $(`#ticket_settings_start_time_${i}`).val(),
                                salesStartUTC, salesEndDate = $(`#ticket_settings_end_date_${i}`).val(), salesEndTime = $(`#ticket_settings_end_time_${i}`).val(),
                                salesEndUTC, visibility = $(`#ticket-visibility-type-${i}:checked`).val(), promoCode = $(`#ticket_promo_code_${i} option:selected`).text();

                            if (name == 'select' || !name) {
                                isVaild = false;
                                $(`#ticket-name-error-${i}`).css({ display: 'block' });
                            }
                            if (group == 'select' || !group) {
                                isVaild = false;
                                $(`#ticket-group-error-${i}`).css({ display: 'block' });
                            }
                            if (!qty && $scope.ticketTypesList[i].type == 'paid') {
                                isVaild = false;
                                $(`#ticket-quantity-error-${i}`).css({ display: 'block' });
                            }
                            if (!basePrice && $scope.ticketTypesList[i].type == 'paid') {
                                isVaild = false;
                                $(`#ticket-base-price-error-${i}`).css({ display: 'block' });
                            }
                            if (!totalPrice && $scope.ticketTypesList[i].type == 'paid') {
                                isVaild = false;
                                $(`#ticket-online-price-error-${i}`).css({ display: 'block' });
                            }

                            type = $scope.ticketTypesList[i].type;

                            if (salesStartDate && salesStartTime) salesStartUTC = (new Date(`${salesStartDate} ${convertTime12to24(salesStartTime)}:00`)).toISOString();
                            if (salesEndDate && salesEndTime) salesEndUTC = (new Date(`${salesEndDate} ${convertTime12to24(salesEndTime)}:00`)).toISOString();

                            ticketArray.push({
                                type, name, group, qty, basePrice, totalPrice, promoCode, desc, salesStartDate, eventTicketTypeId,
                                salesStartTime, salesStartUTC, salesEndDate, salesEndTime, salesEndUTC, visibility, eventTicketGroupId
                            });
                        }

                        if (isVaild) {
                            Tickets.createAndUpdate({ params: { ticketSettings, tickets: ticketArray, eventsId } }).$promise.then((res) => {
                                $("#ticket-setting-fixed-fee,#min_ticket_per_order,#max_ticket_per_order").val('');
                                for (let i in $scope.ticketTypesList) {
                                    $(`#ticket_name_${i},#ticket_group_name_${i},#ticket_qty_${i},#ticket_base_price_${i},#ticket_online_price_${i}
                  ,#ticket_settings_desc_${i},#ticket_settings_start_date_${i},#ticket_settings_start_time_${i},#ticket_settings_end_date_${i},
                  #ticket_settings_end_time_${i},#ticket_promo_code_${i},#pricingAndFeeInfoGenSet,#ticketInfoGenSet,#collectionAndDeliveryInfoGenSet`).val('');
                                }
                                isAfter(true, 'Successfully created!.');
                            }, (err) => isAfter(false, 'Please try again!'));
                        } else {
                            isAfter(false, 'Please try again');
                        }
                    } else isAfter(false, 'Please try again. Event id is required');
                } else isAfter(false, 'Please select the business!')
            }



            $scope.isEdit = false;
            $scope.editEvent = (id) => {
                $(`#events_venue_name,#eventTitle,#event_organiser_name,#event_organiser_details,#event_artists_guest,#event_teaser_desc,#event-full-desc,#events_start_date,#events_start_time,#events_end_time,#announcement_time`).val('');
                $(`#event-t-Error,#event-t-organ-name-error,#event-t-organ-desc-error,#event-age-restriction-error,#event-category-error,#event-teaser-error,
        #event-full-desc-error,#event-announcement-date-error,#event-announcement-time-error,#event-venue-name-error`).css({ 'display': 'none' });
                if (id) {
                    $scope.isEdit = true;
                    $scope.eventsDateList = []; $scope.viewEventObj = {};
                    $scope.viewTicket(id);
                    $scope.eventId = id;
                    $("#events_update_btn,#events_cancel_btn").css({ display: 'block' });
                    $("#events_add_btn").css({ display: 'none' });
                    Events.findOne({ filter: { where: { id }, include: [{ relation: "eventDates" }, { relation: "eventCategory" }] } }).$promise.then(res => {
                        $scope.viewEventObj = res;
                        $scope.isVaildVenue = true;
                        $('html, body').animate({ scrollTop: $("#tabs").offset().top }, 800);
                        $("#announcement_date").val(res.announceDate.split('T')[0]);
                        $(`#ageRegistriction option[value='${res.ageRestrict}']`).prop("selected", true);
                        $(`#eventCategory option[value='${res.eventCategory.id}']`).prop("selected", true);
                        if (res && res.eventDates && res.eventDates.length)
                            $scope.eventsDateList = res.eventDates;
                    });
                }
            };

            $scope.deleteImg = (type, id) => {

                deleteImg = (fileName, updateObj) => {
                    $http.post('/spaceFileDelete', { fileName });
                    Events.upsertWithWhere({ where: { id } }, updateObj).$promise.then(() => {
                        Events.findOne({ filter: { where: { id }, include: [{ relation: "eventDates" }, { relation: "eventCategory" }] } }).$promise.then(eventRes => {
                            $scope.viewEventObj = eventRes;
                            toastMsg(true, "Successfully removed.");
                        });
                    });
                };

                if (id)
                    Events.findOne({ where: { id } }).$promise.then((res) => {
                        if (id && type == "eventImg" && res && res.img && res.img.length) {
                            deleteImg(res.img[0].name, { img: [] });
                        }
                        else if (id && type == "organiserImg" && res && res.organiser && res.organiser.img && res.organiser.img.length) {
                            deleteImg(res.organiser.img[0].name, { organiser: { img: [], name: $("#event_organiser_name").val(), desc: $("#event_organiser_details").val() } });
                        }
                    });
            }

            $scope.eventVisibleFun = () => {
                $scope.eventIsVisible = true;
            }

            $scope.isSaveIsvisible = false;

            $scope.createEventIsvisible = () => {
                $scope.isSaveIsvisible = $scope.isEdit = true;
                $scope.eventsDateList = []; $scope.viewEventObj = {};
                $("#events_update_btn,#events_cancel_btn").css({ display: 'none' });
                $("#events_add_btn").css({ display: 'block' });
            }

            $scope.eventView = (id) => {
                $(`#events_venue_name,#eventTitle,#event_organiser_name,#event_organiser_details,#event_artists_guest,#event_teaser_desc,#event-full-desc,#events_start_date,#events_start_time,#events_end_time,#announcement_time`).val('');
                $(`#event-t-Error,#event-t-organ-name-error,#event-t-organ-desc-error,#event-age-restriction-error,#event-category-error,#event-teaser-error,
        #event-full-desc-error,#event-announcement-date-error,#event-announcement-time-error,#event-venue-name-error`).css({ 'display': 'none' });
                if (id) {
                    $scope.isSaveIsvisible = false;
                    $scope.eventsDateList = []; $scope.viewEventObj = {};
                    $scope.viewTicket(id);
                    $scope.eventId = id;
                    $scope.isEdit = false;
                    $("#events_update_btn,#events_cancel_btn").css({ display: 'none' });
                    $("#events_add_btn").css({ display: 'none' });
                    Events.findOne({ filter: { where: { id }, include: [{ relation: "eventDates" }, { relation: "eventCategory" }] } }).$promise.then(res => {
                        $scope.viewEventObj = res;
                        $('html, body').animate({ scrollTop: $("#tabs").offset().top }, 800);
                        $("#announcement_date").val(res.announceDate.split('T')[0]);
                        $(`#ageRegistriction option[value='${res.ageRestrict}']`).prop("selected", true);
                        $(`#eventCategory option[value='${res.eventCategory.id}']`).prop("selected", true);
                        if (res && res.eventDates && res.eventDates.length)
                            $scope.eventsDateList = res.eventDates;
                    });
                }
            }

            $scope.eventUpdate = (id) => {

                var img = [], organiser = { img: [], name: "", desc: "" }

                $("#events_update_btn").html('<i class="fas fa-spinner fa-spin"></i> Update').prop('disabled', true);

                uploadImg = () => {
                    return new Promise((resolve, reject) => {
                        var fd = new FormData(), isTrue = false;
                        if ($scope.whatshotImage && $scope.whatshotImage.length) {
                            isTrue = true;
                            fd.append(`events_0`, $scope.whatshotImage[0].imgBlop, $scope.whatshotImage[0].imgName);
                        }

                        if ($scope.eventOrganiserFullImage && $scope.eventOrganiserFullImage.length) {
                            isTrue = true;
                            fd.append('organiser_0', $scope.eventOrganiserFullImage[0].imgBlop, $scope.eventOrganiserFullImage[0].imgName);
                        }

                        if (isTrue) {
                            $http.post('/uploadEventsImg', fd, { headers: { 'Content-Type': undefined } })
                                .then((res) => {
                                    if (res && res.data && res.data.isSuccess) {
                                        for (let data of res.data.result) {
                                            if (data.from == 'events')
                                                img.push({ "name": data.fileName, path: `/uploads/${data.fileName}`, fullPath: data.path, from: "events" });
                                            else if (data.from == "organiser")
                                                organiser.img.push({ "name": data.fileName, path: `/uploads/${data.fileName}`, fullPath: data.path, from: "organiser" });
                                        }
                                        $scope.whatshotImage = [];
                                        $scope.eventOrganiserFullImage = [];
                                        resolve({ isSuccess: true, events });
                                    } else
                                        resolve({ isSuccess: false, events });
                                });
                        } else resolve({ isSuccess: true, events });
                    });
                }

                let title = $("#eventTitle").val(), artist, ageRestrict, eventCategory, teaserMsg, fullDesc, announceDate, announceTime, announceUTC, venue = {};
                artist = $("#event_artists_guest").val(); ageRestrict = $("#ageRegistriction").val();
                organiser.name = $("#event_organiser_name").val(); organiser.desc = $("#event_organiser_details").val();
                eventCategory = $("#eventCategory").val(); teaserMsg = $("#event_teaser_desc").val();
                fullDesc = $("#event-full-desc").val(); announceDate = $("#announcement_date").val();
                announceTime = $("#announcement_time").val(); announceUTC = (new Date(`${announceDate} ${convertTime12to24(announceTime)}:00`)).toISOString();
                venue.name = $("#events_venue_name").val(); venue.address = $("#events_venue_address").val();
                venue.city = $("#events_venue_city").val(); venue.state = $("#events_venue_state").val(); venue.zip = $("#events_venue_zip").val();
                uploadImg().then((imgUpload) => {
                    Events.findOne({ filter: { where: { id } } }).$promise.then((res) => {
                        if (img && img.length == 0) img = res.img;
                        if (organiser.img && organiser.img.length == 0) organiser.img = res.organiser.img;
                        Events.upsertWithWhere({ where: { id } }, { title, organiser, img, artist, ageRestrict, eventCategory, teaserMsg, fullDesc, announceDate, announceTime, announceUTC, venue }).$promise.then((res) => {
                            $scope.getAllEvents();
                            $("#events_update_btn").html('Update').prop('disabled', false);
                            toastMsg(true, "Successfully updated.");
                        });
                    });
                });
            };

            $scope.eventUpdateCancel = () => {
                $scope.viewEventObj = {};
                $scope.eventsDateList = [];
                $scope.isVaildVenue = false;
                $("#events_update_btn,#events_cancel_btn").css({ display: 'none' });
                $("#events_add_btn").css({ display: 'block' });
            };

            $scope.ticketUpdateCancel = () => {
                $scope.ticketTypesList = [];
                $scope.ticketAndSettingsView = {};
                $("#create_ticket_btn").css({ display: 'block' });
                $("#ticket_cancel_btn,#ticket_update_btn").css({ display: 'none' });
            };


            $scope.ticketTypesList = [];
            $scope.addTicketTypes = (type) => {
                $scope.getTicketTypes();
                $scope.getTicketgroups();
                $scope.ticketTypesList.push({ ticketName: '', price: 0, type: (type == 'free' ? 'Free' : (type == 'donation' ? 'Donation' : type)) });
            };
        }])
    .controller('editEventCtl', ['$scope', '$state', '$rootScope', 'Business', 'Events', 'EventCategory', 'EventPromoCode', '$http', 'EventGenre', 'Events', 'EventCategory', 'TicketGeneralSetting', 'Tickets', 'EventTicketGroup', 'EventTicketType', 'EventPromoCode',
        function ($scope, $state, $rootScope, Business, Events, EventCategory, EventPromoCode, $http, EventGenre, Events, EventCategory, TicketGeneralSetting, Tickets, EventTicketGroup, EventTicketType, EventPromoCode) {
            $(".event-sub-menu").addClass('in slowDown');
            $(".event-menu").html(`<i class="far fa-calendar-alt"></i> <span
                    class="nav-label"> &nbsp; Events</span>
                    <i class="fas fa-angle-down pull-right"></i>`);
            $scope.eventAgeRegtriction = ["All Ages", "18 and Over", "Under 18", "Other"];

            $scope.eventCategories = [];
            $scope.getEventCategory = () => {
                EventCategory.find({ filter: { include: "eventGenres" } }).$promise.then(res => $scope.eventCategories = res);
            };
            $scope.getEventCategory();

            $scope.eventTicketTypesList = [];
            $scope.getTicketTypes = () => {
                EventTicketType.find({ filter: { where: { ownerId: $scope.userId } } }).$promise.then((res) => $scope.eventTicketTypesList = res);
            };
            $scope.getTicketTypes();


            $scope.EventTicketGroupsList = [];
            $scope.getTicketgroups = () => {
                EventTicketGroup.find({ filter: { where: { ownerId: $scope.userId } } }).$promise.then((res) => $scope.EventTicketGroupsList = res);
            }
            $scope.getTicketgroups();

            $scope.ticket_settings_per = ['select options...', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];


            if ($rootScope.eventId && $rootScope.ownerId) {
                Events.findOne({ filter: { where: { id: $rootScope.eventId } } }).$promise.then((res) => {
                    $scope.viewEventObj = {};
                    $scope.viewEventObj = res;
                    $scope.eventGenreArrayList = $scope.eventCategories.find(m => m.id == res.eventCategoryId).eventGenres;
                });

            } else {
                $state.go('manage-events');
            }
        }])
    .controller('viewEventCtl', ['$scope', '$state', '$rootScope', 'Business', 'Events', 'EventCategory', 'EventPromoCode', '$http', 'EventGenre', 'Events', 'EventCategory', 'TicketGeneralSetting', 'Tickets', 'EventTicketGroup', 'EventTicketType', 'EventPromoCode',
        function ($scope, $state, $rootScope, Business, Events, EventCategory, EventPromoCode, $http, EventGenre, Events, EventCategory, TicketGeneralSetting, Tickets, EventTicketGroup, EventTicketType, EventPromoCode) {
            $(".event-sub-menu").addClass('in slowDown');
            $(".event-menu").html(`<i class="far fa-calendar-alt"></i> <span
                    class="nav-label"> &nbsp; Events</span>
                    <i class="fas fa-angle-down pull-right"></i>`);

            $scope.eventAgeRegtriction = ["All Ages", "18 and Over", "Under 18", "Other"];


            $scope.eventCategories = [];
            $scope.getEventCategory = () => {
                EventCategory.find({ filter: { include: "eventGenres" } }).$promise.then(res => $scope.eventCategories = res);
            };
            $scope.getEventCategory();

            $scope.ticket_settings_per = ['select options...', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

            $scope.eventTicketTypesList = [];
            $scope.getTicketTypes = () => {
                EventTicketType.find({ filter: { where: { ownerId: $scope.userId } } }).$promise.then((res) => $scope.eventTicketTypesList = res);
            };
            $scope.getTicketTypes();


            $scope.EventTicketGroupsList = [];
            $scope.getTicketgroups = () => {
                EventTicketGroup.find({ filter: { where: { ownerId: $scope.userId } } }).$promise.then((res) => $scope.EventTicketGroupsList = res);
            }
            $scope.getTicketgroups();

            if ($rootScope.eventId && $rootScope.ownerId) {
                Events.findOne({ filter: { where: { id: $rootScope.eventId }, include: [{ relation: "eventDates", scope: { include: [{ relation: "ticketGeneralSettings" }, { relation: "tickets" }] } }] } }).$promise.then((res) => {
                    $scope.viewEventObj = {};
                    $scope.ticketSettings = {};
                    $scope.ticketTypesList = [];
                    if (res) {
                        $scope.viewEventObj = res;
                        if (res.eventDates && res.eventDates.length)
                            $scope.eventsDateList = res.eventDates;
                        $scope.ticketSettings = res.eventDates[0].ticketGeneralSettings;
                        $scope.ticketTypesList = res.eventDates[0].tickets;
                    }
                });
            } else {
                $state.go('manage-events');
            }


        }]);