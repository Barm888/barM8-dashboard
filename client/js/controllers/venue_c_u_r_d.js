
var venueAttributes = [{ name: "Beer garden", _name: "Beer_garden" },
{ name: "Outdoor", _name: "Outdoor" },
{ name: "Rooftop", _name: "Rooftop" },
{ name: "Accept Bookings", _name: "Accept_Bookings" },
{ name: "Dancefloor", _name: "Dancefloor" },
{ name: "Underground", _name: "Underground" },
{ name: "Darts", _name: "Darts" },
{ name: "Pool Table", _name: "Pool_Table" },
{ name: "Views", _name: "Views" },
{ name: "Tab", _name: "Tab" },
{ name: "Pet Friendly", _name: "Pet_Friendly" },
{ name: "LGBTQIA+", _name: "LGBTQIA" },
{ name: "Bottomless", _name: "Bottomless" },
{ name: "Bar Food", _name: "Bar_Food" }];

var barTypes = [{ name: "Themed", _name: "Themed" },
{ name: "Pub", _name: "Pub" },
{ name: "Gin Bar", _name: "Gin_Bar" },
{ name: "Whisky Bar", _name: "Whishkey_Bar" },
{ name: "Speakeasy", _name: "Speakeasy" },
{ name: "Brewery", _name: "Brewery" },
{ name: "Wine bar", _name: "Wine_bar" },
{ name: "Cocktail bar", _name: "Cocktail_bar" },
{ name: "Sports bar", _name: "Sports_bar" },
{ name: "Small bar", _name: "Small_bar" },
{ name: "Rum bar", _name: "Rum_bar" },
{ name: "Craft beer", _name: "Craft_beer" },
{ name: "Nightclub", _name: "Nightclub" },
{ name: "Karaoke", _name: "Karaoke" },
{ name: "Gastropub", _name: "Gastropub" },
{ name: "Live Music Venue", _name: "Live_Music_Venue" },
{ name: "Dive Bar", _name: "Dive_Bar" },
{ name: "Tapas Bar", _name: "Tapas_Bar" }];

var stylesMap = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
    },
    {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
    },
    {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
    },
    {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }],
    },
    {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }],
    },
    {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
    },
];

angular
    .module('app')
    .controller('venueCreateCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'loader', 'VenueFeatures', 'BarType', 'VenueTags', 'VenueSettings', 'WeeklyTiming', 'BistroHours',
        function ($scope, $state, $rootScope, Business, $http, loader, VenueFeatures, BarType, VenueTags, VenueSettings, WeeklyTiming, BistroHours) {

            const convertTime12to24 = (time12h) => moment(time12h, 'hh:mm A').format('HH:mm');

            let toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.mealsWeekDays = [{ name: 'Sun', txt: 'Sunday', val: 'sunday', disabled: false },
            { name: 'Mon', txt: 'Monday', val: 'monday', disabled: false },
            { name: 'Tue', txt: 'Tuesday', val: 'tuesday', disabled: false },
            { name: 'Wed', txt: 'Wednesday', val: 'wednesday', disabled: false },
            { name: 'Thu', txt: 'Thursday', val: 'thursday', disabled: false },
            { name: 'Fri', txt: 'Friday', val: 'friday', disabled: false },
            { name: 'Sat', txt: 'Saturday', val: 'saturday', disabled: false }];

            $scope.daysSelected = (arg, day, sday) => {
                if ($(`#${arg}${day}`).attr('data-selected') == "true")
                    $(`#${arg}${day}`).attr('data-selected', false).addClass('btnBeforemenu').removeClass('btnAfterMenu').css({ 'background-color': '#757575' }).html(`${sday}`);
                else
                    $(`#${arg}${day}`).attr('data-selected', true).css({ 'background-color': '#4caf50' }).removeClass('btnBeforemenu').addClass('btnAfterMenu').html(`<i class="fas fa-check"></i> ${sday}`);
            }

            $scope.bistrodaysSelected = (arg, day, sday) => {
                if ($(`#${arg}${day}`).attr('data-selected') == "true")
                    $(`#${arg}${day}`).attr('data-selected', false).addClass('btnBistroBeforemenu').removeClass('btnBistroAfterMenu').css({ 'background-color': '#757575' }).html(`${sday}`);
                else
                    $(`#${arg}${day}`).attr('data-selected', true).css({ 'background-color': '#4caf50' }).removeClass('btnBistroBeforemenu').addClass('btnBistroAfterMenu').html(`<i class="fas fa-check"></i> ${sday}`);
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
            $scope.createBistro = () => {
                var startTime = $.trim($("#_start_time").val()),
                    endTime = $.trim($("#_end_time").val());

                let createObj = {}, istrue = true;

                if ($('.btnBistroAfterMenu').length == 0) {
                    istrue = false;
                    toastMsg(false, "Please select the days!");
                }

                if (startTime && endTime) {
                    loader.visible();
                    $('.btnBistroAfterMenu').each(function () {

                        let startConvert = (convertTime12to24(startTime)).split(':'),
                            endConvert = (convertTime12to24(endTime)).split(':');

                        let day = $(this).attr('data-dayname');

                        createObj[day] = {
                            startTime, "startHour": startConvert[0],
                            "startMinute": startConvert[1], endTime, "endHour": endConvert[0], "endMinute": endConvert[1]
                        }
                    });

                    let menu = $("#selectedMenu").val();

                    if (menu) createObj.menu = menu;

                    $('[name="days"]:checked').each(function () {
                        $(this).prop('checked', false);
                    });

                    if ($scope.bistros.find(m => m.menu == menu)) {
                        let i = $scope.bistros.findIndex(m => m.menu == menu)
                        // $scope.bistros.push(createObj);
                        for (let v in createObj) {
                            $scope.bistros[i][v] = createObj[v];
                        }
                        $(`#_start_time,#_end_time`).val('');
                        $scope.initCall();
                    } else {
                        $scope.bistros.push(createObj);
                        $(`#_start_time,#_end_time`).val('');
                        $scope.initCall();
                    }


                    setTimeout(function () { loader.hidden(); }, 200);
                } else {
                    istrue = false;
                    toastMsg(false, "Start and end time is required!");
                }
            }

            $scope.bistrosDelete = (i) => {
                $scope.bistros.splice(i, 1);
            }


            $scope.getMenusObj = (menu) => {
                let res = $scope.bistros.find(m => m.menu == menu);
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
            }

            $scope.showTheMiddle = (event, i) => {
                $(`.middle_${i}`).css({ 'display': 'block', 'position': 'absolute', 'right': '2%' });
            }
            $scope.hiddenTheMiddle = (i) => {
                $(`.middle_${i}`).css({ 'display': 'none' })
            }

            $scope.openingHoursData = [];
            $scope.addOpeningHours = () => {

                var startTime = $.trim($("#open_hours_stime").val()),
                    endTime = $.trim($("#open_hours_etime").val()),
                    sequence = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'Public Holiday'];

                $("#weeklystarttimingErr,#weeklyendtimingErr").text('');
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
                if (isTrue) {
                    if (startTime && endTime) {
                        loader.visible();
                        $('.btnAfterMenu').each(function () {
                            let startConvert = (convertTime12to24(startTime)).split(':'),
                                endConvert = (convertTime12to24(endTime)).split(':');

                            let day = toTitleCase($(this).attr('data-dayname'));
                            if ($scope.openingHoursData.find(m => m.day == day)) {
                                toastMsg(false, `${day} already added. Please try again!`);
                            } else {
                                let fi = $scope.mealsWeekDays.findIndex(m => m.txt == day);
                                $scope.mealsWeekDays[fi].isSeleced = true;
                                $scope.openingHoursData.push({
                                    day, startTime, "startHour": startConvert[0],
                                    "startMinute": startConvert[1], endTime, "endHour": endConvert[0], "endMinute": endConvert[1],
                                    sequence: (sequence.findIndex(m => m == $(this).attr('data-dayname'))) + 1
                                });
                            }

                        });
                        $('.oHoursDaysOpenBtn').each(function () {
                            let daysValues = $scope.mealsWeekDays.find(m => m.val == $(this).attr('data-dayname'));
                            $(this).attr('data-selected', false).addClass('btnBeforemenu')
                                .removeClass('btnAfterMenu').css({ 'background-color': '#757575' }).html(`${daysValues.name}`);
                        });
                        $("#open_hours_stime,#open_hours_etime").val('');
                        setTimeout(function () { loader.hidden() }, 200);
                    } else {
                        toastMsg(false, "Start and end time is required!");
                    }

                } else {
                    toastMsg(false, "Start and end time or days is required!");
                }
            };

            $scope.weeklyDaysDelete = (i) => {
                loader.visible();
                $scope.openingHoursData.splice(i, 1);
                setTimeout(function () {
                    loader.hidden();
                    toastMsg(true, "Successfully deleted!")
                }, 300);
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

            $scope.venueFeaturesData = venueAttributes;

            $scope.barTypeData = barTypes;

            $scope.venueTagData = [...$scope.venueFeaturesData, ...$scope.barTypeData];

            $scope.initialize = function () {
                $scope.mapOptions = {
                    zoom: 16,
                    center: new google.maps.LatLng(-33.865143, 151.209900),
                    zoomControl: false,
                    scaleControl: true,
                    streetViewControl: false,
                    fullscreenControl: false,
                    mapTypeControl: false,
                    styles: stylesMap
                };
                $scope.map = new google.maps.Map(document.getElementById('map_search'), $scope.mapOptions);
            }

            $scope.autoComplete = () => {
                let autocomplete = new google.maps.places.Autocomplete(/** @type {!HTMLInputElement} */(document.getElementById('location')));
                autocomplete.addListener('place_changed', function () {

                    let place = JSON.parse(JSON.stringify(autocomplete.getPlace()));
                    let street = '';
                    if (place && place.geometry && place.geometry.location) $scope.location = place.geometry.location;
                    if (place && place.place_id) $scope.placeId = place.place_id;

                    $scope.mapOptions.center = new google.maps.LatLng($scope.location.lat, $scope.location.lng);

                    var marker = new google.maps.Marker({
                        position: $scope.location,
                        map: new google.maps.Map(document.getElementById('map_search'), $scope.mapOptions)
                    });

                    const infowindow = new google.maps.InfoWindow({
                        content: `${$("#venuename").val()}`,
                    });

                    marker.addListener("click", () => {
                        infowindow.open({
                            anchor: marker
                        });
                    });

                    for (var data of place.address_components) {

                        if (data.types[0] == "locality") {
                            $("#city").val(data.long_name);
                        }
                        //  else {
                        //     if (data.types[0] == "administrative_area_level_2") $("#city").val(data.long_name);
                        // }

                        if (data.types[0] == "country") {
                            $("#country").val(data.long_name);
                        }
                        if (data.types[0] == "postal_code") {
                            $("#zipCode").val(data.long_name);
                        }
                        if (data.types[0] == "administrative_area_level_1") {
                            $("#state").val(data.short_name);
                        }
                        if (data.types[0] == "street_number" || data.types[0] == "route") {
                            street += ` ${data.long_name}`
                        }
                    }
                    $('#street_address').val(street);
                });
            }

            $scope.loadMap = function () {
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCZCRYyaP1xJP9WYzxy9zE7BefTnau-mfA&libraries=places&callback=initAutocomplete';
                document.body.appendChild(script);
                setTimeout(function () {
                    $scope.initialize();
                    $scope.autoComplete();
                }, 500);
            }

            $scope.loadMap();


            uploadPrimaryImg = () => {
                return new Promise((resolve, reject) => {
                    var fd = new FormData();
                    var uid = uuidv4();
                    fd.append(`happenings_0`, dataURItoBlob($("#img-pre-pri").attr('src')), `${uid}.png`);
                    $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess) {
                                img = res.data.result;
                                resolve({ isSuccess: true, img });
                            } else loader.hidden()
                        }, () => loader.hidden())
                })
            }

            uploadSecondImg = () => {
                return new Promise((resolve, reject) => {
                    var fd = new FormData();
                    for (let file of $scope.imgSeArr) {
                        var uid = uuidv4();
                        fd.append(`secondary-image_0`, dataURItoBlob(file), `${uid}.png`);
                    }
                    $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess) {
                                img = res.data.result;
                                resolve({ isSuccess: true, img });
                            } else loader.hidden()
                        }, () => loader.hidden())
                })
            }


            let uploadPrimaryVideo = () => {
                return new Promise((resolve, reject) => {

                    var files = $('#video').prop('files');

                    var fd = new FormData();
                    for (let file of files) {
                        var extension = '';
                        function openFile(file) {
                            extension = file.substr((file.lastIndexOf('.') + 1));
                        };
                        var uid = uuidv4();
                        openFile(file.name);
                        fd.append(`secondary_video_0`, file, `${uid}.${extension}`);
                    }

                    loader.visible();
                    $http.post('/whatsonImg', fd, { headers: { 'Content-Type': undefined } }).then((res) => {
                        if (res.data.isSuccess && res.data.result) {
                            let files = [];
                            res.data.result.forEach(val => {
                                if (val.path.includes('https://')) files.push({ fileName: val.fileName, path: `${val.path}` })
                                else files.push({ fileName: val.fileName, path: `https://${val.path}` })
                            });
                            resolve({ isSuccess: true, video: files });
                        }
                    })
                })
            }


            $scope.clickImageSection = (file) => {

                var result = document.querySelector('.result'),
                    cropbtn = document.querySelector('#crop-btn'),
                    cropper = '';

                const reader = new FileReader();
                reader.onload = (e) => {
                    if (e.target.result) {
                        $("#image-crop-md-pri").modal({ backdrop: 'static', keyboard: false });
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
                            minContainerHeight: 320,
                            minCropBoxWidth: 700,
                            minCropBoxHeight: 300
                        });
                    }
                };
                reader.readAsDataURL(file);

                // save on click
                cropbtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    let imgSrc = cropper.getCroppedCanvas({
                        width: 700,
                        height: 300
                    }).toDataURL();

                    $(".img-h-s-p").css({ display: 'block' });
                    $("#image-crop-md-pri").modal('hide');
                    $("#img-pre-pri").attr('src', imgSrc).css({ display: 'block' });
                    $(".img-c-s-p").css({ display: 'none' });
                    $("#primary-img").val('');

                    cropper.destroy();
                    cropper.reset();
                    cropper.clear();
                });

                $("#delete_i_index").on('click', function () {
                    $("#img-pre-pri").attr('src', '');
                    $(".img-c-s-p").css({ display: 'block' })
                    $(".img-h-s-p").css({ display: 'none' })
                });

                $("#modalClose").on('click', function () {
                    $("#image-crop-md-pri").modal('hide');
                });
            }

            $scope.imgSeArr = [{}, {}, {}, {}, {}];
            $scope.reValues = 5;
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
                            minContainerWidth: 296,
                            minContainerHeight: 370,
                            minCropBoxWidth: 700,
                            minCropBoxHeight: 875
                        });
                    }
                };
                reader.readAsDataURL(file);

                // save on click
                cropbtn.addEventListener('click', (e) => {

                    loader.visible();

                    e.preventDefault();
                    let imgSrc = cropper_2.getCroppedCanvas({
                        width: 700,
                        height: 875
                    }).toDataURL();


                    $("#image-crop-second-md").modal('hide');

                    let i = localStorage.getItem('se-img-i-venue');
                    var fd = new FormData();
                    var uid = uuidv4();
                    fd.append(`secondary-image_0`, dataURItoBlob(imgSrc), `${uid}.png`);

                    $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                        .then((res) => {
                            if (res && res.data && res.data.isSuccess) {
                                $scope.imgSeArr[i] = res.data.result[0];
                                loader.hidden()
                            } else loader.hidden()
                        }, () => loader.hidden())

                    cropper_2.destroy();
                    cropper_2.reset();
                    cropper_2.clear();
                });

                $("#modalClose_second").on('click', function () {
                    $("#image-crop-second-md").modal('hide');
                });
            }


            $scope.secondImgDelete = (i) => {
                $scope.imgSeArr[i] = {};
            }


            $scope.createNewvenue = () => {

                let isTrue = true, businessName = abn = phone = email = contact1 =
                    website = country = city = state = zipCode = addressLine1 = addressLine2 = suburb = landline =
                    landmark = password = role = venueInformation = bookingUrl =
                    imageUrl = fullPath = eddystoneNameSpaceId = eddystoneInstanceId = eddystoneUrl =
                    iBeaconId = minorId = suburb = placeId = majorId = contactFirstName = contactLastName = contactPhoneNo = contactEmail = null;

                $("#image_err_pr").css({ display: 'none' });

                let location = {}, venueCapacity = 30;
                $(`#venuenameErr,#locationErr,#latErr,#lngErr,#contact1Err,#inputEmailErr,
                #inputRoleErr,#inputPasswordErr,#confirmPasswordErr,#PasswordconfirmPasswordErr`).html(null);
                if (!$("#venuename").val()) {
                    isTrue = false;
                    $("#venuenameErr").html('Venue name is required!');
                }
                if (!$("#contact_first_name").val()) {
                    isTrue = false;
                    $("#contact_first_nameErr").html('First name is required!');
                }
                if (!$("#contact_email").val()) {
                    isTrue = false;
                    $("#contact_emailErr").html('Contact email is required!');
                }
                if (!$("#login_Email").val()) {
                    isTrue = false;
                    $("#inputEmailErr").html('Email is required!');
                }
                // if (!$("#inputRole").val()) {
                //     isTrue = false;
                //     $("#inputRoleErr").html('Role is required!');
                // }
                if (!$("#password").val()) {
                    isTrue = false;
                    $("#inputPasswordErr").html('Password is required!');
                }
                if (!$("#confirmPassword").val()) {
                    isTrue = false;
                    $("#confirmPasswordErr").html('Confirm password is required!');
                }
                if ($("#primaryImage").val()) {
                    $("#image_err_pr").css({ display: 'block' });
                }
                if ($("#password").val() && $("#confirmPassword").val()) {
                    if ($("#password").val() != $("#confirmPassword").val()) {
                        isTrue = false;
                        $("#PasswordconfirmPasswordErr").html('The password and confirm password do not match.');
                    }
                }

                BusinessCreate = (primaryImage = [], secondaryImage = []) => {

                    let videos = [];

                    let cBFunc = () => {
                        Business.create({
                            businessName, abn, venueInformation, website, phone, addressLine1, addressLine2,
                            city, zipCode, state, country, location, eddystoneNameSpaceId,
                            eddystoneInstanceId, eddystoneUrl, iBeaconId, minorId, bookingUrl,
                            majorId, contact1, email, role, contactPhoneNo, password, placeId, venueCapacity,
                            videos, primaryImage, secondaryImage, status: 'inactive', suburb: city,
                            contactFirstName, contactLastName, contactPhoneNo, contactEmail
                        }).$promise.then((res) => {

                            let isAbsorb = false, absorbFee = 0, isFixed = false, fixedFee = 0, isPercentage = false, percentageFee = 0, isUrl = false, url = '',
                                isEnabled = false, isPhoneNumber = false, phoneNumber = '';

                            if (bookingUrl) {
                                isEnabled = true;
                                isUrl = true;
                                url = bookingUrl;
                            }
                            if (phone) {
                                isEnabled = true;
                                isPhoneNumber = true;
                                phoneNumber = phone;
                            }

                            if (bookingUrl && phone) isPhoneNumber = false


                            VenueSettings.create({
                                ownerId: res.id, isEnabled, category: "BookingReservation", isAbsorb, absorbFee,
                                isFixed, fixedFee, isPercentage, percentageFee, isUrl, url, phoneNumber, isPhoneNumber
                            })

                            $scope.openingHoursData.forEach((val) => {
                                WeeklyTiming.create({
                                    ownerId: res.id, day: val.day, startTime: val.startTime, startHour: val.startHour,
                                    startMinute: val.startMinute, endTime: val.endTime, endHour: val.endHour, endMinute: val.endMinute,
                                    sequence: val.sequence
                                })
                            })

                            for (let val in $scope.bistros) {

                                let emptyObj = { startTime: '', startHour: '', startMinute: '', endTime: '', endHour: '', endMinute: '' };
                                let { menu, sunday = emptyObj, monday = emptyObj, tuesday = emptyObj, wednesday = emptyObj, thursday = emptyObj, friday = emptyObj, saturday = emptyObj } = $scope.bistros[val];
                                BistroHours.create({
                                    ownerId: res.id, menu, sunday, monday, tuesday, wednesday, thursday, friday, saturday
                                })
                            }

                            let features = [];
                            $("input[name='_features']:checked").each(function () {
                                features.push({ name: $(this).val(), _name: $(this).data('namefeatures'), ownerId: res.id });
                            });
                            for (let data of features) {
                                VenueFeatures.upsertWithWhere({ where: { ownerId: data.ownerId, _name: data._name } }, { ownerId: data.ownerId, name: data.name, _name: data._name });
                            }

                            let bartypes = [];
                            $("input[name='_bar_type']:checked").each(function () {
                                bartypes.push({ name: $(this).val(), _name: $(this).data('namebartype'), ownerId: res.id });
                            });
                            for (let data of bartypes) {
                                BarType.upsertWithWhere({ where: { ownerId: data.ownerId, _name: data._name } }, { ownerId: data.ownerId, name: data.name, _name: data._name });
                            }

                            let venueTagsA = [];
                            $("input[name='_venue_tag']:checked").each(function () {
                                venueTagsA.push({ name: $(this).val(), _name: $(this).data('namevenuetags'), ownerId: res.id });
                            });
                            for (let data of venueTagsA) {
                                VenueTags.upsertWithWhere({ where: { ownerId: data.ownerId, _name: data._name } }, { ownerId: data.ownerId, name: data.name, _name: data._name });
                            }

                            toastMsg(true, "successfully created.");
                            setTimeout(function () { loader.hidden() }, 200);
                            loader.hidden();
                            $("input[name='_features']:checkbox").prop('checked', false);
                            $("input[name='_bar_type']:checkbox").prop('checked', false);
                            $(`#venuename,#inputABN,#inputAddres_1,#suburb,#inputzipCode,#phone,
                            #website,#landline,#venueInformation,#lat,#lng,#inputEmail,#contact1,#password,
                            #inputRole,#eddystoneNameSpaceId,#eddystoneInstanceId,#eddystoneUrl,#iBeaconId,
                            #majorId,#minorId,#confirmPassword`).val(null);
                            $("#inputAddres_2,#inputVenueCapacity,#location").val('');
                            $("#primaryImage,#secondaryImage,#video").val('');
                            $(".img-c-s-se").empty();
                            $(".img-h-s").empty();
                            $('.img-c-s').css({ 'display': 'block' });
                            $state.go('business');
                        }, (err) => {
                            console.log(err);
                            if (err && err.data && err.data.error) toastMsg(false, err.data.error.message);
                            else toastMsg(false, "Not Created. Please try again");
                            loader.hidden();
                            // Business.errorSendToMe({ params : err });
                        });
                    }

                    if ($("#video").val()) {
                        uploadPrimaryVideo().then((video_1) => {
                            if (video_1 && video_1.video) {
                                videos = video_1.video;
                                cBFunc();
                            } else cBFunc();
                        })
                    } else cBFunc();
                }

                if (isTrue) {
                    businessName = $("#venuename").val();
                    abn = $("#inputABN").val();
                    venueInformation = $("#venueInformation").val();
                    website = $("#website").val();
                    phone = $("#phone").val();
                    addressLine1 = $("#street_address").val();
                    addressLine2 = $("#inputAddres_2").val();
                    city = $("#city").val();
                    zipCode = $("#zipCode").val();
                    state = $('#state').val();
                    country = $('#country').val();
                    location = $scope.location;
                    eddystoneNameSpaceId = $("#eddystoneNameSpaceId").val();
                    eddystoneInstanceId = $("#eddystoneInstanceId").val();
                    eddystoneUrl = $("#eddystoneUrl").val();
                    iBeaconId = $("#iBeaconId").val();
                    minorId = $("#majorId").val();
                    majorId = $("#minorId").val();
                    contact1 = $("#contact1").val();
                    email = $("#login_Email").val();
                    contactPhoneNo = $("#contactNumber").val();
                    password = $("#password").val();
                    placeId = $scope.placeId;
                    bookingUrl = $("#booking_url").val();
                    contactFirstName = $("#contact_first_name").val();
                    contactLastName = $("#contact_last_name").val();
                    contactEmail = $("#contact_email").val();
                    contactPhoneNo = $("#contactNumber").val();
                    loader.visible();

                    if ($("#img-pre-pri").attr('src') && $scope.imgSeArr.length) {
                        uploadPrimaryImg().then((res) => {
                            if (res && res.isSuccess) {
                                if (res.img && res.img.length && res.img[0].fileName) {
                                    let primaryImage = res.img;
                                    BusinessCreate(primaryImage, $scope.imgSeArr);
                                } else {
                                    toastMsg(false, "Image not upload. Please try again!");
                                    loader.hidden();
                                }
                            } else {
                                toastMsg(false, "Image not upload. Please try again!");
                                loader.hidden();
                            }
                        })
                    } else if ($("#img-pre-pri").attr('src')) {
                        uploadPrimaryImg().then((res) => {
                            if (res && res.isSuccess) {
                                if (res.img && res.img.length && res.img[0].fileName) {
                                    let primaryImage = res.img;
                                    BusinessCreate(primaryImage, []);
                                } else {
                                    toastMsg(false, "Image not upload. Please try again!");
                                    loader.hidden();
                                }
                            } else {
                                toastMsg(false, "Image not upload. Please try again!");
                                loader.hidden();
                            }
                        })
                    } else if ($scope.imgSeArr.length) {
                        BusinessCreate([], $scope.imgSeArr);
                    } else {
                        BusinessCreate();
                    }
                } else {
                    toastMsg(false, "Fields is missing");
                }
            }
        }])
    .controller('activeVenueCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'loader', 'HappyHourDashDay', 'Happenings', 'DailySpecial', 'getAllVenues', 'ExclusiveOffer',
        function ($scope, $state, $rootScope, Business, $http, loader, HappyHourDashDay, Happenings, DailySpecial, getAllVenues, ExclusiveOffer) {

            $scope.todayDate = new Date();

            let fDate = new Date();
            let date = `${fDate.getFullYear()}-${("0" + (fDate.getMonth() + 1)).slice(-2)}-${("0" + fDate.getDate()).slice(-2)}T00:00:00.000Z`;

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.isBusinessSelect = false;

            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                loader.visible()
                setTimeout(function () {
                    $scope.businessSelection = getAllVenues.get();
                    loader.hidden();
                }, 1500)
            }

            $scope.getBusinessName = () => {
                return $scope.businessSelection;
            };

            $scope.whatsOnData
            $scope.getHappenings = () => {
                Happenings.find({
                    filter: {
                        where: { ownerId: $scope.userId, date, status: "Live" }, order: "date asc",
                        fields: ["title", "date", "id", "primaryImg", "secondaryImg", "startTime", "endTime"]
                    }
                }).$promise.then((res) => {
                    $scope.whatsOnData = res;
                });
            }


            $scope.HappyHourData = [];
            $scope.getHappyHours = () => {
                HappyHourDashDay.find({
                    filter: {
                        where: { ownerId: $scope.userId, date, status: "Live" }, order: "date asc",
                        fields: ["img", "title", "date", "id", "img", "startTime", "endTime"]
                    }
                })
                    .$promise.then((res) => {
                        $scope.HappyHourData = res;
                    });
            }


            $scope.DailySpecialData = [];
            $scope.getDailySpecials = () => {
                DailySpecial.find({
                    filter: {
                        where: { ownerId: $scope.userId, date, status: "Live" }, order: "date asc",
                        fields: ["img", "title", "date", "id", "img", "startTime", "endTime"]
                    }
                }).$promise.then((res) => {
                    $scope.DailySpecialData = res;
                });
            }

            $scope.LimitedOfferData = [];
            $scope.getLimitedOffers = () => {
                ExclusiveOffer.find({
                    filter: {
                        where: { ownerId: $scope.userId, offerDate: date, status: "Live" }, order: "date asc",
                        fields: ["img", "title", "date", "id", "img", "startTimeTxt", "offerExpiryTimeTxt"]
                    }
                }).$promise.then((res) => {

                    $scope.LimitedOfferData = res;
                    console.log(res);
                });
            }

            loader.visible();

            setTimeout(function () { loader.hidden(); }, 500);

            $scope.viewOrder = () => {
                $state.go("drinks-order");
            }

            $scope.viewBookingRequest = () => {
                $state.go("reservation");
            }

            $scope.BusinessSelected = (arg) => {
                $("#businessErr").text('');
                loader.visible();
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
                            localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val(), venueId: $scope.userId }));
                            $scope.getHappenings();
                            $scope.getHappyHours();
                            $scope.getDailySpecials();
                            $scope.getLimitedOffers();
                            setTimeout(function () { loader.hidden(); }, 500);
                        }
                    } else $("#businessErr").text('Please select the Business name');
                }
            }

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

            if (localStorage.getItem("selectedVenue")) {
                $rootScope.selectedVenue = JSON.parse(localStorage.getItem("selectedVenue"));
            }

            if ($scope.userDetails.isAdmin == false) {
                $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                $("#autocompleteBusiness").attr('disabled', true);
                $scope.getHappenings();
                $scope.getHappyHours();
                $scope.getDailySpecials();
                $scope.getLimitedOffers();
                localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName, venueId: $scope.userDetails.id }));
            } else if ($scope.userDetails.isAdmin) {

                if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId) {
                    $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                    $scope.userId = $rootScope.selectedVenue.venueId;
                    $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.venueId)
                    if ($("#businessSubmit").hasClass('businessSubmit')) {
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    }
                    $scope.isBusinessSelect = true;
                    $scope.getHappenings();
                    $scope.getHappyHours();
                    $scope.getDailySpecials();
                    $scope.getLimitedOffers();
                }
            }
        }])
    .controller('viewEditVenueCtrl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'loader', 'VenueFeatures', 'BarType', 'VenueTags', 'VenueSettings', 'WeeklyTiming', 'BistroHours', '$timeout',
        function ($scope, $state, $rootScope, Business, $http, loader, VenueFeatures, BarType, VenueTags, VenueSettings, WeeklyTiming, BistroHours, $timeout) {

            const convertTime12to24 = (time12h) => moment(time12h, 'hh:mm A').format('HH:mm');

            $scope.oHInitCall = () => {
                $scope.mealsWeekDays = [{ name: 'Sun', txt: 'Sunday', val: 'sunday', isSeleced: false },
                { name: 'Mon', txt: 'Monday', val: 'monday', isSeleced: false },
                { name: 'Tue', txt: 'Tuesday', val: 'tuesday', isSeleced: false },
                { name: 'Wed', txt: 'Wednesday', val: 'wednesday', isSeleced: false },
                { name: 'Thu', txt: 'Thursday', val: 'thursday', isSeleced: false },
                { name: 'Fri', txt: 'Friday', val: 'friday', isSeleced: false },
                { name: 'Sat', txt: 'Saturday', val: 'saturday', isSeleced: false }];
            }
            $scope.oHInitCall();

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

            $scope.bistrodaysSelected = (arg, day, sday) => {
                if ($(`#${arg}${day}`).attr('data-selected') == "true")
                    $(`#${arg}${day}`).attr('data-selected', false).addClass('btnBistroBeforemenu').removeClass('btnBistroAfterMenu').css({ 'background-color': '#757575' }).html(`${sday}`);
                else
                    $(`#${arg}${day}`).attr('data-selected', true).css({ 'background-color': '#4caf50' }).removeClass('btnBistroBeforemenu').addClass('btnBistroAfterMenu').html(`<i class="fas fa-check"></i> ${sday}`);
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

            $scope.bistroHours = [];
            $scope.createBistro = () => {

                var startTime = $.trim($("#_start_time").val()),
                    endTime = $.trim($("#_end_time").val());

                let createObj = {}, istrue = true;

                if ($('.btnBistroAfterMenu').length == 0) {
                    istrue = false;
                    toastMsg(false, "Please select the days!");
                }

                if (startTime && endTime) {
                    $('.btnBistroAfterMenu').each(function () {

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

                let values = JSON.parse(localStorage.getItem("v-e-venueId"));
                if (values && values.id) {

                    createObj.ownerId = values.id;

                    loader.visible();

                    if (menu && createObj.ownerId) {
                        BistroHours.upsertWithWhere({ where: { menu, ownerId: createObj.ownerId } }, createObj).$promise.then(() => {
                            $('[name="days"]:checked').each(function () {
                                $(this).prop('checked', false);
                            });
                            $(`#_start_time,#_end_time`).val('');
                            toastMsg(true, "Successfully created!")
                            $scope.basicInit();
                            $scope.initCall();
                            loader.hidden();
                        }, () => {
                            toastMsg(false, "Please try again!")
                            loader.hidden();
                        })
                    }
                }

            }

            $scope.getMenus = (menu) => {
                loader.visible();
                try {
                    let values = JSON.parse(localStorage.getItem("v-e-venueId"));
                    if (values && values.id) {
                        try {
                            BistroHours.find({ filter: { where: { ownerId: values.id, menu } } })
                                .$promise.then((res) => {
                                    $scope.days = [{ name: 'Sun', day: 'Sunday', isSeleced: false, val: 'sunday' },
                                    { name: 'Mon', day: 'Monday', isSeleced: false, val: 'monday' },
                                    { name: 'Tue', day: 'Tuesday', isSeleced: false, val: 'tuesday' },
                                    { name: 'Wed', day: 'Wednesday', isSeleced: false, val: 'wednesday' },
                                    { name: 'Thu', day: 'Thursday', isSeleced: false, val: 'thursday' },
                                    { name: 'Fri', day: 'Friday', isSeleced: false, val: 'friday' },
                                    { name: 'Sat', day: 'Saturday', isSeleced: false, val: 'saturday' }];
                                    if (res) {
                                        res = res[0];

                                        if (res && res.id) {
                                            for (let k in res) {
                                                let i = $scope.days.findIndex(m => m.val == k);
                                                try {
                                                    if (res[k].startTime && res[k].endTime) {
                                                        $scope.days[i].isSeleced = true;
                                                        $scope.days[i].time = `<div style="text-align:center;"><b>${$scope.days[i].day}</b><p>${res[k].startTime} - ${res[k].endTime}</p></div>`;
                                                    } else {
                                                        $scope.days[i].time = `<div><b>${$scope.days[i].day}</b></div>`;
                                                        $scope.days[i].isSeleced = false;
                                                    }
                                                } catch (e) {

                                                }
                                            }
                                        }

                                        setTimeout(function () {
                                            loader.hidden();
                                        }, 300);
                                    }
                                }, () => {
                                    setTimeout(function () {
                                        loader.hidden();
                                    }, 200);
                                })
                        } catch (e) {
                            $scope.days = [{ name: 'Sun', day: 'Sunday', isSeleced: false, val: 'sunday' },
                            { name: 'Mon', day: 'Monday', isSeleced: false, val: 'monday' },
                            { name: 'Tue', day: 'Tuesday', isSeleced: false, val: 'tuesday' },
                            { name: 'Wed', day: 'Wednesday', isSeleced: false, val: 'wednesday' },
                            { name: 'Thu', day: 'Thursday', isSeleced: false, val: 'thursday' },
                            { name: 'Fri', day: 'Friday', isSeleced: false, val: 'friday' },
                            { name: 'Sat', day: 'Saturday', isSeleced: false, val: 'saturday' }];
                        }

                    }

                } catch (e) {
                    $scope.days = [{ name: 'Sun', day: 'Sunday', isSeleced: false, val: 'sunday' },
                    { name: 'Mon', day: 'Monday', isSeleced: false, val: 'monday' },
                    { name: 'Tue', day: 'Tuesday', isSeleced: false, val: 'tuesday' },
                    { name: 'Wed', day: 'Wednesday', isSeleced: false, val: 'wednesday' },
                    { name: 'Thu', day: 'Thursday', isSeleced: false, val: 'thursday' },
                    { name: 'Fri', day: 'Friday', isSeleced: false, val: 'friday' },
                    { name: 'Sat', day: 'Saturday', isSeleced: false, val: 'saturday' }];
                }

            }

            $scope.deleteBistroHours = (id) => {
                if (id) {
                    localStorage.removeItem('delete_id_Bis_hou');
                    localStorage.setItem('delete_id_Bis_hou', JSON.stringify({ id }));
                    $("#deleteBistroConfirm").modal('show');
                } else toastMsg(false, 'Please try again!');
            }

            $scope.confirmDelete = () => {
                if (localStorage.getItem('delete_id_Bis_hou')) {
                    var ids = JSON.parse(localStorage.getItem('delete_id_Bis_hou'));
                    if (ids.id) {
                        loader.visible();
                        let values = JSON.parse(localStorage.getItem("v-e-venueId"));
                        if (values && values.id) {
                            BistroHours.deleteById({ id: ids.id }).$promise.then((d_res) => {

                                console.log(JSON.stringify(d_res));

                                //  $scope.$apply();
                                setTimeout(function () {
                                    loader.hidden();
                                    $scope.basicInit();
                                    $scope.$apply();
                                    $("#deleteBistroConfirm").modal('hide');
                                    toastMsg(true, 'Successfully deleted');
                                }, 300)
                            })
                        }


                    }
                }
            }

            $scope.weeklyDaysDelete = (id) => {
                loader.visible();
                if (id) {
                    WeeklyTiming.removeWeekly({ params: { id } }).$promise.then((res_1) => {

                        setTimeout(function () {
                            $scope.basicInit();
                            loader.hidden();
                        }, 200);
                        toastMsg(true, "Successfully Deleted!");
                    }, function (err) {
                        toastMsg(false, "Please try again!");
                        loader.hidden();
                    })
                }
            };

            $scope.addOpeningHours = () => {

                var startTime = $.trim($("#open_hours_stime").val()),
                    endTime = $.trim($("#open_hours_etime").val()),
                    sequence = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'Public Holiday'];

                $("#weeklystarttimingErr,#weeklyendtimingErr").text('');
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
                    let values = JSON.parse(localStorage.getItem("v-e-venueId"));
                    if (values && values.id) {
                        $('.btnAfterMenu').each(function () {
                            let startConvert = (convertTime12to24(startTime)).split(':'),
                                endConvert = (convertTime12to24(endTime)).split(':');
                            let day = $(this).attr('data-dayname');
                            $scope.openingHoursData.push({
                                "day": toTitleCase(day), startTime, "startHour": startConvert[0],
                                "startMinute": startConvert[1], endTime, "endHour": endConvert[0], "endMinute": endConvert[1],
                                sequence: (sequence.findIndex(m => m == day)) + 1,
                                "ownerId": values.id
                            });
                        });
                        if ($scope.openingHoursData.length) {
                            WeeklyTiming.createAndUpdate({ params: { openingsHours: $scope.openingHoursData } })
                                .$promise.then((res) => {
                                    if (res.data.isSuccess) {
                                        setTimeout(function () {
                                            $scope.basicInit();
                                            $scope.mealsWeekDays = [{ name: 'Sun', txt: 'Sunday', val: 'sunday' }, { name: 'Mon', txt: 'Monday', val: 'monday' }, { name: 'Tue', txt: 'Tuesday', val: 'tuesday' },
                                            { name: 'Wed', txt: 'Wednesday', val: 'wednesday' }, { name: 'Thu', txt: 'Thursday', val: 'thursday' }, { name: 'Fri', txt: 'Friday', val: 'friday' },
                                            { name: 'Sat', txt: 'Saturday', val: 'saturday' }];
                                            $("#open_hours_stime,#open_hours_etime").val('');
                                            //$("#addOpeningHoursBtn").attr('disabled', false).css('pointer-events', '');
                                            toastMsg(true, "Successfully created!");
                                            loader.hidden();
                                        }, 500)
                                    } else {
                                        toastMsg(false, "Please try again!");
                                        loader.hidden();
                                    }
                                })
                        }
                    } else {
                        toastMsg(false, "Please try again!");
                        loader.hidden();
                    }
                }
            };

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
                    $scope.basicInit();
                    setTimeout(function () {
                        toastMsg(true, "Successfully updated!");
                        loader.hidden();
                    }, 500);
                }, () => {
                    $scope.basicInit();
                    setTimeout(function () {
                        toastMsg(false, "Please try again!");
                        loader.hidden();
                    }, 300);
                });
            }

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
                            $scope.basicInit();
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

            $scope.updateOpeningAllHours = () => {
                let values = JSON.parse(localStorage.getItem("v-e-venueId"));
                if (values && values.id) {
                    let startTime = $("#startTime_up_v").val();
                    let endTime = $("#endTime_up_v").val();
                    let startConvert = (convertTime12to24($("#startTime_up_v").val())).split(':'),
                        endConvert = (convertTime12to24($("#endTime_up_v").val())).split(':');
                    loader.visible();
                    WeeklyTiming.updateAllWithStatus({
                        params: {
                            startTime, "startHour": startConvert[0], status: $scope.statusOpen, ownerId: values.id,
                            "startMinute": startConvert[1], endTime, "endHour": endConvert[0], "endMinute": endConvert[1]
                        }
                    }).$promise.then((res_56) => {
                        setTimeout(function () {
                            $('#editPopup').modal('hide');
                            loader.hidden();
                            $scope.basicInit();
                        }, 100);
                    }, () => {
                        setTimeout(function () {
                            loader.hidden();
                            toastMsg(false, "Please try again!");
                        }, 100);
                    });
                } else {
                    loader.hidden();
                    toastMsg(false, "Please try again!");
                }
            }

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

            let toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
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

            $scope.venueFeaturesData = venueAttributes;

            $scope.barTypeData = barTypes;

            $scope.venueTagData = [...$scope.venueFeaturesData, ...$scope.barTypeData];

            $scope.initialize = function () {

                if ($scope.location && $scope.location.lat && $scope.location.lng) {
                    $scope.mapOptions = {
                        zoom: 16,
                        center: new google.maps.LatLng($scope.location.lat, $scope.location.lng),
                        zoomControl: false,
                        scaleControl: true,
                        streetViewControl: false,
                        fullscreenControl: false,
                        mapTypeControl: false,
                        styles: stylesMap
                    };
                } else {
                    $scope.mapOptions = {
                        zoom: 16,
                        center: new google.maps.LatLng(-33.865143, 151.209900),
                        zoomControl: false,
                        scaleControl: true,
                        streetViewControl: false,
                        fullscreenControl: false,
                        mapTypeControl: false,
                        styles: stylesMap
                    };
                }

                $scope.map = new google.maps.Map(document.getElementById('map_search'), $scope.mapOptions);

                var marker = new google.maps.Marker({
                    position: $scope.location,
                    map: new google.maps.Map(document.getElementById('map_search'), $scope.mapOptions)
                });

                const infowindow = new google.maps.InfoWindow({
                    content: `${$scope.venueNewData.businessName}`,
                });

                marker.addListener("click", () => {
                    infowindow.open({
                        anchor: marker
                    });
                });


            }

            $scope.autoComplete = () => {
                let autocomplete = new google.maps.places.Autocomplete(/** @type {!HTMLInputElement} */(document.getElementById('location')));
                autocomplete.addListener('place_changed', function () {

                    let place = JSON.parse(JSON.stringify(autocomplete.getPlace()));
                    let street = '';
                    if (place && place.geometry && place.geometry.location) $scope.location = place.geometry.location;
                    if (place && place.place_id) $scope.placeId = place.place_id;

                    $scope.mapOptions.center = new google.maps.LatLng($scope.location.lat, $scope.location.lng);

                    var marker = new google.maps.Marker({
                        position: $scope.location,
                        map: new google.maps.Map(document.getElementById('map_search'), $scope.mapOptions)
                    });

                    const infowindow = new google.maps.InfoWindow({
                        content: `${$scope.venueNewData.businessName}`,
                    });

                    marker.addListener("click", () => {
                        infowindow.open({
                            anchor: marker
                        });
                    });
                    for (var data of place.address_components) {
                        if (data.types[0] == "locality") {
                            $("#city").val(data.long_name);
                        }
                        //  else {
                        //     if (data.types[0] == "administrative_area_level_2") $("#city").val(data.long_name);
                        // }

                        if (data.types[0] == "country") {
                            $("#country").val(data.long_name);
                        }
                        if (data.types[0] == "postal_code") {
                            $("#zipCode").val(data.long_name);
                        }
                        if (data.types[0] == "administrative_area_level_1") {
                            $("#state").val(data.short_name);
                        }
                        if (data.types[0] == "street_number" || data.types[0] == "route") {
                            street += ` ${data.long_name}`
                        }
                    }
                    $('#street_address').val(street);
                });
            }

            $scope.loadMap = function () {
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCZCRYyaP1xJP9WYzxy9zE7BefTnau-mfA&libraries=places&callback=initAutocomplete';
                document.body.appendChild(script);
                setTimeout(function () {
                    $scope.initialize();
                    $scope.autoComplete();
                }, 500);
            }

            $scope.createQr = (id) => {
                if (id) {
                    loader.visible();
                    try {
                        Business.createQrCode({ params: { id } }).$promise.then((res) => {
                            $scope.basicInit();
                            setTimeout(() => {
                                toastMsg(true, "Successfully created!");
                                loader.hidden();
                            }, 300)
                        }, (err) => {
                            toastMsg(false, "Error!. Please try again");
                            loader.hidden();
                        })
                    } catch (e) {
                        toastMsg(false, "Error!. Please try again");
                        loader.hidden();
                    }

                } else toastMsg(false, "Please try again!");
            }

            $scope.venueNewData = {};
            $scope.location = {};
            $scope.basicInit = () => {
                let values = JSON.parse(localStorage.getItem("v-e-venueId"));
                if (values && values.id) {
                    try {
                        loader.visible();
                        Business.findOne({ filter: { where: { id: values.id }, include: [{ relation: "venueTags" }, { relation: "barTypes" }, { relation: "venueFeatures" }, { relation: "weeklyTimings", scope: { order: 'sequence asc' } }, { relation: "bistroHours" }] } })
                            .$promise.then((res) => {

                                $scope.oHInitCall();

                                try {
                                    for (let da in res.weeklyTimings) {
                                        let i = $scope.mealsWeekDays.findIndex(m => m.txt == res.weeklyTimings[da].day);
                                        $scope.mealsWeekDays[i].isSeleced = true;
                                        $scope.mealsWeekDays[i].time = `<div style="text-align:center;"><b>${res.weeklyTimings[da].day}</b><p>${res.weeklyTimings[da].startTime} - ${res.weeklyTimings[da].endTime}</p></div>`;
                                    }
                                } catch (e) { }

                                $scope.venueNewData = res;
                                $scope.location = res.location;
                                $scope.placeId = res.placeId;
                                $scope.loadMap();

                                $("input[name='_features']").prop('checked', false);
                                $("input[name='_features']").each(function () {
                                    let fValues = res.venueFeatures.find(m => m._name == $(this).data('namefeatures'));
                                    if (fValues && fValues.name && fValues._name) $(this).prop('checked', true);
                                    if (fValues && fValues.name == 'LGBTQIA') $(this).prop('checked', true);
                                });

                                $("input[name='_bar_type']").prop('checked', false);
                                $("input[name='_bar_type']").each(function () {
                                    let barTyValues = res.barTypes.find(m => m._name == $(this).data('namefeatures'));
                                    if (barTyValues && barTyValues.name && barTyValues._name) $(this).prop('checked', true);
                                });

                                $("input[name='_venue_tag']").prop('checked', false);
                                $("input[name='_venue_tag']").each(function () {
                                    let venueTagsV = res.venueTags.find(m => m._name == $(this).data('namefeatures'));
                                    if (venueTagsV && venueTagsV.name && venueTagsV._name) $(this).prop('checked', true);
                                });
                                // $scope.$apply();
                                $timeout(function () { loader.hidden(); }, 500);
                                // setTimeout(function () {
                                //     loader.hidden();
                                // }, 500);
                            });
                    } catch (e) {
                        toastMsg(false, e);
                        setTimeout(function () {
                            loader.hidden();
                        }, 500);
                    }
                }
            }

            $scope.basicInit();

            $scope.uploadPrimaryVideo = () => {
                let values = JSON.parse(localStorage.getItem("v-e-venueId"));
                if (values && values.id) {
                    var files = $('#video').prop('files');

                    var fd = new FormData();
                    for (let file of files) {
                        var extension = '';
                        function openFile(file) {
                            extension = file.substr((file.lastIndexOf('.') + 1));
                        };
                        var uid = uuidv4();
                        openFile(file.name);
                        fd.append(`secondary_video_0`, file, `${uid}.${extension}`);
                    }

                    loader.visible();
                    $http.post('/whatsonImg', fd, { headers: { 'Content-Type': undefined } }).then((res) => {
                        if (res.data.isSuccess && res.data.result) {
                            let files = [];
                            res.data.result.forEach(val => {
                                if (val.path.includes('https://')) files.push({ fileName: val.fileName, path: `${val.path}` })
                                else files.push({ fileName: val.fileName, path: `https://${val.path}` })
                            });

                            $('#video').val('');

                            Business.upsertWithWhere({ where: { id: values.id } }, { videos: files }).$promise.then((res) => {
                                setTimeout(function () {
                                    toastMsg(true, "Successfully updated!");
                                    loader.hidden();
                                }, 500)
                                $scope.venueNewData = res;
                            }, (err) => {
                                loader.hidden();
                                toastMsg(false, "Please try again!");
                            });
                        }
                    })
                }

            }

            $scope.replaceVideo = (file) => {
                if (file && file.fileName) {
                    loader.visible();
                    localStorage.removeItem('r-vi-ve-edit');
                    localStorage.setItem('r-vi-ve-edit', JSON.stringify(file));
                    $('#video').trigger('click'); return false;
                } else {
                    toastMsg(false, "Please try again!");
                }
            }

            $scope.videoDelete = (file) => {
                if (file && file.fileName) {
                    loader.visible();
                    let values = JSON.parse(localStorage.getItem("v-e-venueId"));
                    if (values && values.id) {
                        let fileName = file.fileName;
                        $http.post('/spaceFileDelete', { fileName });
                        Business.upsertWithWhere({ where: { id: values.id } }, { videos: [] }).$promise.then((res) => {
                            setTimeout(function () {
                                toastMsg(true, "Successfully deleted!");
                                loader.hidden();
                            }, 200)
                            $scope.venueNewData = res;
                        }, (err) => {
                            loader.hidden();
                            toastMsg(false, "Please try again!");
                        });
                    } else {
                        toastMsg(false, "Please try again!");
                    }
                } else {
                    toastMsg(false, "Please try again!");
                }
            }

            $scope.updateProfile = () => {
                let values = JSON.parse(localStorage.getItem("v-e-venueId"));
                if (values && values.id) {

                    var updateVenue = () => {
                        try {
                            loader.visible();
                            let businessName, abn, addressLine1, addressLine2, city, zipCode, state, country, phone, website, venueInformation,
                                contactPhoneNo, eddystoneNameSpaceId, eddystoneInstanceId, eddystoneUrl, iBeaconId, majorId, minorId, contactFirstName, contactLastName, contactEmail, location, placeId,
                                isQrCode = false, isBeacon = false, bookingUrl = '';

                            if ($("#venuename").val()) {

                                businessName = $("#venuename").val().trim();
                                abn = $("#abn").val().trim() || '';
                                venueInformation = $("#desc").val().trim() || '';
                                phone = $("#Phone_number").val().trim() || '';
                                website = $("#website").val().trim() || '';

                                addressLine1 = $("#street_address").val().trim() || '';
                                addressLine2 = $("#building_suite").val().trim() || '';
                                zipCode = $("#zipCode").val().trim() || '';
                                state = $("#state").val().trim() || '';
                                city = $("#city").val().trim() || '';
                                country = $("#country").val().trim() || '';

                                //email = $("#email").val().trim() || '';
                                // contact1 = $("#contactName").val().trim() || '';
                                // role = $("#role").val().trim() || '';
                                contactFirstName = $("#contactFirstName").val().trim() || '';
                                contactLastName = $("#contactLastName").val().trim() || '';
                                contactEmail = $("#contactEmail").val().trim() || '';
                                contactPhoneNo = $("#phoneNumber").val().trim() || '';

                                location = $scope.location;
                                placeId = $scope.placeId;

                                eddystoneNameSpaceId = $("#eddystoneNameSpaceId").val().trim() || '';
                                eddystoneInstanceId = $("#eddystoneInstanceId").val().trim() || '';
                                eddystoneUrl = $("#eddystoneUrl").val().trim() || '';
                                iBeaconId = $("#iBeaconId").val().trim() || '';
                                majorId = $("#majorId").val().trim() || '';
                                minorId = $("#minorId").val().trim() || '';

                                isQrCode = $("#isQrCode").is(':checked');
                                isBeacon = $("#isBeacon").is(':checked');

                                bookingUrl = $("#booking_url").val();

                                if (values.id) {
                                    let params = {
                                        businessName, abn, venueInformation, website, phone, addressLine1, addressLine2, city, state, zipCode, country, eddystoneNameSpaceId, eddystoneInstanceId, eddystoneUrl, iBeaconId, majorId, minorId, contactFirstName,
                                        contactLastName, contactEmail,
                                        contactPhoneNo, location, placeId, ownerId: values.id, suburb: city, isQrCode, isBeacon, bookingUrl
                                    };
                                    if ($scope.primaryImage && $scope.primaryImage.length) {
                                        params.primaryImage = $scope.primaryImage;
                                    }


                                    try {


                                        if ($scope.venueNewData.venueFeatures && $scope.venueNewData.venueFeatures.length) {
                                            VenueFeatures.deleteAllVenueFeatures({ params: { ownerId: values.id } });
                                        }

                                        if ($scope.venueNewData.barTypes && $scope.venueNewData.barTypes.length) {
                                            BarType.deleteAllOldData({ params: { ownerId: values.id } });
                                        }

                                        if ($scope.venueNewData.venueTags && $scope.venueNewData.venueTags.length) {
                                            VenueTags.deleteAllOldData({ params: { ownerId: values.id } });
                                        }

                                        Business.updateBusinessAttributes({ params }).$promise.then((res) => {

                                            let isAbsorb = false, absorbFee = 0, isFixed = false, fixedFee = 0, isPercentage = false,
                                                percentageFee = 0, isUrl = false, url = '', isEnabled = false, isPhoneNumber = false, phoneNumber = '';

                                            VenueSettings.find({ filter: { where: { ownerId: values.id, category: "BookingReservation" } } }).$promise.then((vsRes) => {

                                                if (bookingUrl) {
                                                    isUrl = true;
                                                    isEnabled = true;
                                                    url = bookingUrl;
                                                }

                                                if (phone) {
                                                    isPhoneNumber = true;
                                                    isEnabled = true;
                                                    phoneNumber = phone;
                                                }
                                                if (bookingUrl && phone) isPhoneNumber = false

                                                if (vsRes && vsRes.length) {
                                                    let nvsResOb = vsRes[0];
                                                    if (nvsResOb && nvsResOb.id) {
                                                        isAbsorb = nvsResOb.isAbsorb;
                                                        absorbFee = nvsResOb.absorbFee;
                                                        isFixed = nvsResOb.isFixed;
                                                        fixedFee = nvsResOb.fixedFee;
                                                        isPercentage = nvsResOb.isPercentage;
                                                        percentageFee = nvsResOb.percentageFee;
                                                        VenueSettings.deleteById({ id: nvsResOb.id }).$promise.then((vsD) => {
                                                            VenueSettings.create({
                                                                isEnabled, category: "BookingReservation", isAbsorb, absorbFee, isPhoneNumber, phoneNumber,
                                                                isFixed, fixedFee, isPercentage, percentageFee, isUrl, url, ownerId: values.id
                                                            })
                                                        })
                                                    }
                                                } else {
                                                    VenueSettings.create({
                                                        isEnabled, category: "BookingReservation", isAbsorb, absorbFee,
                                                        isFixed, fixedFee, isPercentage, percentageFee, isUrl, url, ownerId: values.id
                                                    }).$promise.then((vsres_34) => {
                                                        console.log(JSON.stringify(vsres_34));
                                                    })
                                                }

                                            })

                                            let features = []; let barTypes = []; let venueTagsA = [];

                                            $("input[name='_features']:checked").each(function () {
                                                features.push({ name: $(this).val(), _name: $(this).data('namefeatures'), ownerId: values.id });
                                            });

                                            $("input[name='_bar_type']:checked").each(function () {
                                                barTypes.push({ name: $(this).val(), _name: $(this).data('namefeatures'), ownerId: values.id });
                                            });

                                            $("input[name='_venue_tag']:checked").each(function () {
                                                venueTagsA.push({ name: $(this).val(), _name: $(this).data('namefeatures'), ownerId: values.id });
                                            });

                                            setTimeout(function () {
                                                if (features && features.length) {
                                                    for (let v of features) {
                                                        VenueFeatures.upsertWithWhere({ where: { ownerId: v.ownerId, name: v.name, _name: v._name } },
                                                            { ownerId: v.ownerId, name: v.name, _name: v._name });
                                                    }
                                                }

                                                if (barTypes && barTypes.length) {
                                                    for (let v of barTypes) {
                                                        BarType.upsertWithWhere({ where: { ownerId: v.ownerId, name: v.name, _name: v._name } },
                                                            { ownerId: v.ownerId, name: v.name, _name: v._name });
                                                    }
                                                }

                                                if (venueTagsA && venueTagsA.length) {
                                                    for (let v of venueTagsA) {
                                                        VenueTags.upsertWithWhere({ where: { ownerId: v.ownerId, name: v.name, _name: v._name } },
                                                            { ownerId: v.ownerId, name: v.name, _name: v._name });
                                                    }
                                                }
                                            }, 200);

                                            setTimeout(function () { $scope.basicInit(); }, 600);

                                            // $scope.$apply();

                                            setTimeout(function () {
                                                toastMsg(true, 'Successfully updated!');
                                                loader.hidden();
                                            }, 700);
                                        }, (err) => {
                                            toastMsg(false, 'Please try again!');
                                            setTimeout(function () {
                                                loader.hidden();
                                            }, 100);
                                        });
                                    } catch (e) { }

                                } else {
                                    toastMsg(false, 'Please try again!');
                                    setTimeout(function () {
                                        loader.hidden();
                                    }, 100);
                                }

                            } else {
                                toastMsg(false, 'Venue name is required!');
                                setTimeout(function () {
                                    loader.hidden();
                                }, 100);
                            }

                        } catch (e) {
                            toastMsg(false, e);
                            setTimeout(function () {
                                loader.hidden();
                            }, 100);
                        }
                    }


                    loader.visible();
                    Business.findOne({ filter: { where: { id: values.id } } }, (bGData) => {
                        if (bGData) {
                            if ($("#img-pre-primary").attr('src')) {

                                var fd = new FormData();
                                var uid = uuidv4();
                                fd.append(`happenings_0`, dataURItoBlob($("#img-pre-primary").attr('src')), `${uid}.png`);
                                loader.visible();
                                $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                                    .then(function (resP) {
                                        $("#primaryImage").val('');
                                        $('#img-pre-primary').attr('src', '');
                                        $('.img-h-s-p').html('');
                                        $('.img-h-s-p').html(`<div class="img-container">
                                        <div class="img-content">
                                            <img src="" class="img-resposive img-bkg-pri" id="img-pre-primary">
                                            <div class="content-details fadeIn-bottom">
                                                <button class="btn btn-danger" id="delete_i_index"
                                                    data-toggle="tooltip" data-placement="top" title="Delete"
                                                    href="javascript:;"><i
                                                        class="far fa-trash-alt"></i>&nbsp;Remove</button>
                                            </div>
                                        </div>
                                    </div>`);
                                        $scope.venueNewData.primaryImage = resP.data.result;
                                        $scope.primaryImage = resP.data.result;
                                        updateVenue();
                                    });

                            }
                            else {
                                loader.visible();
                                updateVenue();
                            }
                        }
                    })


                }
            }

            $scope.chanPwdClk = () => {
                loader.visible();
                $("#ch_email_ad_eer,#ch_pass_ad_eer,#ch_confirm_pass_ad_eer").html('');
                $("#new_password,#con_chan_password").val('');
                setTimeout(function () {
                    loader.hidden();
                }, 200)
            }

            $scope.updatePassword = () => {
                function validateEmail(email) {
                    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                    return regex.test(email);
                }
                let isTrue = true;
                let email = $("#login_email_con").val();
                let password = $("#new_password").val();
                let c_password = $("#con_chan_password").val();
                $("#ch_email_ad_eer,#ch_pass_ad_eer,#ch_confirm_pass_ad_eer").html('');
                if (!email) {
                    $("#ch_email_ad_eer").html('Email is required!');
                    isTrue = false;
                }
                if (!password) {
                    $("#ch_pass_ad_eer").html('Pasword is required!');
                    isTrue = false;
                }
                if (!c_password) {
                    $("#ch_confirm_pass_ad_eer").html('Confirm Pasword is required!');
                    isTrue = false;
                }

                if (isTrue) {
                    if (validateEmail(email)) {
                        if (password == c_password) {
                            try {
                                let values = JSON.parse(localStorage.getItem("v-e-venueId"));
                                if (values && values.id) {
                                    loader.visible();
                                    Business.updateEmailAndPwd({ params: { id: values.id, email, password } })
                                        .$promise.then((res) => {
                                            $scope.basicInit();
                                            $('#changeLoginAndPwd').modal('hide');
                                            setTimeout(function () {
                                                loader.hidden();
                                            }, 300);
                                            toastMsg(true, "Successfully updated");
                                        }, () => {
                                            loader.hidden();
                                            toastMsg(false, "Please try again!");
                                        })
                                } else {
                                    toastMsg(false, "Please try again!");
                                }
                            } catch (e) {
                                toastMsg(false, "Please try again!");
                            }

                        } else {
                            $("#ch_confirm_pass_ad_eer").html("Confirm password does not match!");
                        }
                    } else {
                        $("#ch_email_ad_eer").html("Enter vaild email!");
                    }
                } else {
                    toastMsg(false, "Please try again!");
                }
            }

            $scope.imgDelete = (img, arg) => {

                if (localStorage.getItem("v-e-venueId")) {
                    $scope.ids = JSON.parse(localStorage.getItem("v-e-venueId"));
                    $scope.userId = $scope.ids.id;

                    try {
                        loader.visible();
                        let fileName = img.fileName;
                        $http.post('/spaceFileDelete', { fileName }).then(function (res) {

                            $scope.venueNewData = {};

                            Business.find({ filter: { where: { id: $scope.userId } } }, (biData) => {

                                let data = {}, primaryImage = [];
                                if (arg == 'primaryImage') data = { primaryImage };

                                Business.upsertWithWhere({ where: { id: $scope.userId } }, data).$promise.then((res) => {
                                    toastMsg(true, "Successfully updated!");
                                    loader.hidden();
                                    $scope.venueNewData = res;
                                    $('.img-c-s-p').css({ display: 'block' });
                                    $('.img-h-s-p').css({ display: 'none' })
                                }, (err) => {
                                    loader.hidden();
                                    toastMsg(false, "Please try again!");
                                });
                            })
                        }, (err) => {
                            toastMsg(false, "Error!. Please try again!");
                            loader.hidden();
                        });
                    } catch (err) { toastMsg(false, err); loader.hidden(); }
                }

            };

            $scope.clickImageSection = (file) => {

                var result = document.querySelector('.result'),
                    cropbtn = document.querySelector('#crop-btn'),
                    cropper = '';

                const reader = new FileReader();
                reader.onload = (e) => {
                    if (e.target.result) {
                        $("#image-crop-md-p").modal({ backdrop: 'static', keyboard: false });
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
                            minContainerHeight: 320,
                            minCropBoxWidth: 700,
                            minCropBoxHeight: 300
                        });
                    }
                };
                reader.readAsDataURL(file);

                // save on click
                cropbtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    let imgSrc = cropper.getCroppedCanvas({
                        width: 700,
                        height: 300
                    }).toDataURL();

                    $scope.venueNewData.primaryImage = [];
                    $scope.$apply();
                    $(".img-h-s-p").css({ display: 'block' });
                    $("#image-crop-md-p").modal('hide');
                    $("#img-pre-primary").attr('src', imgSrc).css({ display: 'block' });
                    $(".img-c-s-p").css({ display: 'none' });
                    $("#primaryImage").val('');

                    cropper.destroy();
                    cropper.reset();
                    cropper.clear();
                });

                $("#delete_i_index").on('click', function () {
                    $("#img-pre").attr('src', '');
                    $(".img-c-s-p").css({ display: 'block' })
                    $(".img-h-s-p").css({ display: 'none' })
                });

                $("#modalClose").on('click', function () {
                    $("#image-crop-md-p").modal('hide');
                });
            }

            $scope.imgSeArr = [];
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
                            minContainerWidth: 296,
                            minContainerHeight: 370,
                            minCropBoxWidth: 700,
                            minCropBoxHeight: 875
                        });
                    }
                };
                reader.readAsDataURL(file);

                // save on click
                cropbtn.addEventListener('click', (e) => {

                    loader.visible();

                    e.preventDefault();
                    let imgSrc = cropper_2.getCroppedCanvas({
                        width: 700,
                        height: 875
                    }).toDataURL();

                    $("#image-crop-second-md").modal('hide');
                    if (localStorage.getItem("v-e-venueId")) {
                        $scope.ids = JSON.parse(localStorage.getItem("v-e-venueId"));
                        $scope.userId = $scope.ids.id;
                        try {

                            Business.find({ filter: { where: { id: $scope.userId } } }, (biData) => {

                                let { secondaryImage } = biData[0];

                                var fd = new FormData();
                                var uid = uuidv4();
                                fd.append(`happenings_0`, dataURItoBlob(imgSrc), `${uid}.png`);

                                $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                                    .then(function (resP) {

                                        let index = localStorage.getItem('se-img-i-venue');

                                        if (secondaryImage || secondaryImage.length >= 5) secondaryImage[index] = resP.data.result[0];


                                        // console.log(JSON.stringify(secondaryImage));

                                        Business.upsertWithWhere({ where: { id: $scope.userId } }, { secondaryImage }).$promise.then((res) => {

                                            setTimeout(function () {
                                                toastMsg(true, "Successfully Deleted");
                                                loader.hidden();
                                            }, 300)
                                            $scope.venueNewData = res;
                                            //$scope.$apply();
                                        }, (err) => {
                                            loader.hidden();
                                            toastMsg(false, "Please try again!");
                                        });
                                    });


                            });
                        } catch (e) {
                            loader.hidden();
                            toastMsg(false, e);
                        }
                    }
                    cropper_2.destroy();
                    cropper_2.reset();
                    cropper_2.clear();
                });

                $("#modalClose_second").on('click', function () {
                    $("#image-crop-second-md").modal('hide');
                });
            }

            $scope.clkImgReplceSend = (file) => {

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
                            minContainerWidth: 296,
                            minContainerHeight: 370,
                            minCropBoxWidth: 700,
                            minCropBoxHeight: 875
                        });
                    }
                };
                reader.readAsDataURL(file);

                // save on click
                cropbtn.addEventListener('click', (e) => {

                    loader.visible();

                    e.preventDefault();
                    let imgSrc = cropper_2.getCroppedCanvas({
                        width: 700,
                        height: 875
                    }).toDataURL();
                    $("#image-crop-second-md").modal('hide');
                    let values = JSON.parse(localStorage.getItem('re-img-se-p'));
                    let fileName = values.fileName;
                    if (localStorage.getItem("v-e-venueId")) {
                        $scope.ids = JSON.parse(localStorage.getItem("v-e-venueId"));
                        $scope.userId = $scope.ids.id;
                        try {

                            Business.find({ filter: { where: { id: $scope.userId } } }, (biData) => {

                                let { secondaryImage } = biData[0];

                                let arrIndex = secondaryImage.findIndex(m => m.fileName == fileName);

                                $http.post('/spaceFileDelete', { fileName });

                                var fd = new FormData();
                                var uid = uuidv4();
                                fd.append(`happenings_0`, dataURItoBlob(imgSrc), `${uid}.png`);

                                $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                                    .then(function (resP) {

                                        secondaryImage[arrIndex] = resP.data.result[0];

                                        Business.upsertWithWhere({ where: { id: $scope.userId } }, { secondaryImage }).$promise.then((res) => {

                                            setTimeout(function () {
                                                toastMsg(true, "Successfully Deleted");
                                                loader.hidden();
                                            }, 300)
                                            $scope.venueNewData = res;
                                            // $scope.$apply();
                                        }, (err) => {
                                            loader.hidden();
                                            toastMsg(false, "Please try again!");
                                        });
                                    });


                            });
                        } catch (e) {
                            loader.hidden();
                            toastMsg(false, e);
                        }
                    }
                    cropper_2.destroy();
                    cropper_2.reset();
                    cropper_2.clear();
                });

                $("#modalClose_second").on('click', function () {
                    $("#image-crop-second-md").modal('hide');
                });
            }

            $scope.secondImgDelete = (i) => {
                $(`#img-d-s-${i}`).css({ display: 'block' });
                $(`#drag-drop-img-second_${i}`).addClass('drag-img-up');
                // $(`#img-s-s-${i}`).remove();
                $(`#img-s-s-${i}`).html('');
                let index = $scope.imgSeArr.findIndex(m => m.index == i)
                delete $scope.imgSeArr[index];
            }

            $scope.secondaryImgDelete = (img) => {

                loader.visible();
                if (localStorage.getItem("v-e-venueId")) {
                    $scope.ids = JSON.parse(localStorage.getItem("v-e-venueId"));
                    $scope.userId = $scope.ids.id;

                    try {

                        let fileName = img.fileName;
                        $http.post('/spaceFileDelete', { fileName }).then(function (res) {

                            $scope.venueNewData = {};

                            Business.find({ filter: { where: { id: $scope.userId } } }, (biData) => {
                                let data = {};
                                if (biData && biData.length) {
                                    let { secondaryImage } = biData[0];
                                    if (secondaryImage && secondaryImage.length) {
                                        data = {
                                            secondaryImage: $.grep(biData[0].secondaryImage, function (e) {
                                                return e.fileName != fileName;
                                            })
                                        };
                                        Business.upsertWithWhere({ where: { id: $scope.userId } }, data).$promise.then((res) => {

                                            setTimeout(function () {
                                                toastMsg(true, "Successfully Deleted");
                                                loader.hidden();
                                            }, 300)
                                            $scope.venueNewData = res;
                                            $scope.$apply();
                                        }, (err) => {
                                            loader.hidden();
                                            toastMsg(false, "Please try again!");
                                        });
                                    } else {
                                        toastMsg(false, "Error!. Please try again!");
                                        loader.hidden();
                                    }
                                } else {
                                    toastMsg(false, "Error!. Please try again!");
                                    loader.hidden();
                                }
                            })
                        })
                    } catch (e) {
                        toastMsg(false, "Error!. Please try again!");
                        loader.hidden();
                    }
                } else {
                    toastMsg(false, "Error!. Please try again!");
                    loader.hidden();
                }
            }

            $scope.downloadQr = (data) => {
                var a = $("<a>")
                    .attr("href", `${data.qrCode}`)
                    .attr("download", `${data.id}.png`)
                    .appendTo("body");
                a[0].click();
                a.remove();
            }

        }])
    .controller('businessViewCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'loader', 'VenueFeatures', 'BarType', 'VenueTags', 'VenueSettings', 'WeeklyTiming', 'BistroHours', '$timeout', 'getAllVenues', function ($scope, $state, $rootScope, Business, $http, loader, VenueFeatures, BarType, VenueTags, VenueSettings, WeeklyTiming, BistroHours, $timeout, getAllVenues) {

        const convertTime12to24 = (time12h) => moment(time12h, 'hh:mm A').format('HH:mm');

        $scope.fieldDisabled = true;

        $scope.oHInitCall = () => {
            $scope.mealsWeekDays = [{ name: 'Sun', txt: 'Sunday', val: 'sunday', isSeleced: false },
            { name: 'Mon', txt: 'Monday', val: 'monday', isSeleced: false },
            { name: 'Tue', txt: 'Tuesday', val: 'tuesday', isSeleced: false },
            { name: 'Wed', txt: 'Wednesday', val: 'wednesday', isSeleced: false },
            { name: 'Thu', txt: 'Thursday', val: 'thursday', isSeleced: false },
            { name: 'Fri', txt: 'Friday', val: 'friday', isSeleced: false },
            { name: 'Sat', txt: 'Saturday', val: 'saturday', isSeleced: false }];
        }
        $scope.oHInitCall();

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

        $scope.bistrodaysSelected = (arg, day, sday) => {
            if ($(`#${arg}${day}`).attr('data-selected') == "true")
                $(`#${arg}${day}`).attr('data-selected', false).addClass('btnBistroBeforemenu').removeClass('btnBistroAfterMenu').css({ 'background-color': '#757575' }).html(`${sday}`);
            else
                $(`#${arg}${day}`).attr('data-selected', true).css({ 'background-color': '#4caf50' }).removeClass('btnBistroBeforemenu').addClass('btnBistroAfterMenu').html(`<i class="fas fa-check"></i> ${sday}`);
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

        $scope.bistroHours = [];
        $scope.createBistro = () => {

            var startTime = $.trim($("#_start_time").val()),
                endTime = $.trim($("#_end_time").val());

            let createObj = {}, istrue = true;

            if ($('.btnBistroAfterMenu').length == 0) {
                istrue = false;
                toastMsg(false, "Please select the days!");
            }

            if (startTime && endTime) {
                $('.btnBistroAfterMenu').each(function () {

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

            let values = JSON.parse(localStorage.getItem("v-e-venueId"));
            if (values && values.id) {

                createObj.ownerId = values.id;

                loader.visible();

                if (menu && createObj.ownerId) {
                    BistroHours.upsertWithWhere({ where: { menu, ownerId: createObj.ownerId } }, createObj).$promise.then(() => {
                        $('[name="days"]:checked').each(function () {
                            $(this).prop('checked', false);
                        });
                        $(`#_start_time,#_end_time`).val('');
                        toastMsg(true, "Successfully created!")
                        $scope.basicInit();
                        $scope.initCall();
                        loader.hidden();
                    }, () => {
                        toastMsg(false, "Please try again!")
                        loader.hidden();
                    })
                }
            }

        }

        $scope.getMenus = (menu) => {
            loader.visible();
            try {
                let values = JSON.parse(localStorage.getItem("v-e-venueId"));
                if (values && values.id) {
                    try {
                        BistroHours.find({ filter: { where: { ownerId: values.id, menu } } })
                            .$promise.then((res) => {
                                $scope.days = [{ name: 'Sun', day: 'Sunday', isSeleced: false, val: 'sunday' },
                                { name: 'Mon', day: 'Monday', isSeleced: false, val: 'monday' },
                                { name: 'Tue', day: 'Tuesday', isSeleced: false, val: 'tuesday' },
                                { name: 'Wed', day: 'Wednesday', isSeleced: false, val: 'wednesday' },
                                { name: 'Thu', day: 'Thursday', isSeleced: false, val: 'thursday' },
                                { name: 'Fri', day: 'Friday', isSeleced: false, val: 'friday' },
                                { name: 'Sat', day: 'Saturday', isSeleced: false, val: 'saturday' }];
                                if (res) {
                                    res = res[0];

                                    if (res && res.id) {
                                        for (let k in res) {
                                            let i = $scope.days.findIndex(m => m.val == k);
                                            try {
                                                if (res[k].startTime && res[k].endTime) {
                                                    $scope.days[i].isSeleced = true;
                                                    $scope.days[i].time = `<div style="text-align:center;"><b>${$scope.days[i].day}</b><p>${res[k].startTime} - ${res[k].endTime}</p></div>`;
                                                } else {
                                                    $scope.days[i].time = `<div><b>${$scope.days[i].day}</b></div>`;
                                                    $scope.days[i].isSeleced = false;
                                                }
                                            } catch (e) {

                                            }
                                        }
                                    }

                                    setTimeout(function () {
                                        loader.hidden();
                                    }, 300);
                                }
                            }, () => {
                                setTimeout(function () {
                                    loader.hidden();
                                }, 200);
                            })
                    } catch (e) {
                        $scope.days = [{ name: 'Sun', day: 'Sunday', isSeleced: false, val: 'sunday' },
                        { name: 'Mon', day: 'Monday', isSeleced: false, val: 'monday' },
                        { name: 'Tue', day: 'Tuesday', isSeleced: false, val: 'tuesday' },
                        { name: 'Wed', day: 'Wednesday', isSeleced: false, val: 'wednesday' },
                        { name: 'Thu', day: 'Thursday', isSeleced: false, val: 'thursday' },
                        { name: 'Fri', day: 'Friday', isSeleced: false, val: 'friday' },
                        { name: 'Sat', day: 'Saturday', isSeleced: false, val: 'saturday' }];
                    }

                }

            } catch (e) {
                $scope.days = [{ name: 'Sun', day: 'Sunday', isSeleced: false, val: 'sunday' },
                { name: 'Mon', day: 'Monday', isSeleced: false, val: 'monday' },
                { name: 'Tue', day: 'Tuesday', isSeleced: false, val: 'tuesday' },
                { name: 'Wed', day: 'Wednesday', isSeleced: false, val: 'wednesday' },
                { name: 'Thu', day: 'Thursday', isSeleced: false, val: 'thursday' },
                { name: 'Fri', day: 'Friday', isSeleced: false, val: 'friday' },
                { name: 'Sat', day: 'Saturday', isSeleced: false, val: 'saturday' }];
            }

        }

        $scope.deleteBistroHours = (id) => {
            if (id) {
                localStorage.removeItem('delete_id_Bis_hou');
                localStorage.setItem('delete_id_Bis_hou', JSON.stringify({ id }));
                $("#deleteBistroConfirm").modal('show');
            } else toastMsg(false, 'Please try again!');
        }

        $scope.confirmDelete = () => {
            if (localStorage.getItem('delete_id_Bis_hou')) {
                var ids = JSON.parse(localStorage.getItem('delete_id_Bis_hou'));
                if (ids.id) {
                    loader.visible();
                    let values = JSON.parse(localStorage.getItem("v-e-venueId"));
                    if (values && values.id) {
                        BistroHours.deleteById({ id: ids.id }).$promise.then((d_res) => {

                            console.log(JSON.stringify(d_res));

                            //  $scope.$apply();
                            setTimeout(function () {
                                loader.hidden();
                                $scope.basicInit();
                                $scope.$apply();
                                $("#deleteBistroConfirm").modal('hide');
                                toastMsg(true, 'Successfully deleted');
                            }, 300)
                        })
                    }


                }
            }
        }

        $scope.weeklyDaysDelete = (id) => {
            loader.visible();
            if (id) {
                WeeklyTiming.removeWeekly({ params: { id } }).$promise.then((res_1) => {

                    setTimeout(function () {
                        $scope.basicInit();
                        loader.hidden();
                    }, 200);
                    toastMsg(true, "Successfully Deleted!");
                }, function (err) {
                    toastMsg(false, "Please try again!");
                    loader.hidden();
                })
            }
        };

        $scope.addOpeningHours = () => {

            var startTime = $.trim($("#open_hours_stime").val()),
                endTime = $.trim($("#open_hours_etime").val()),
                sequence = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'Public Holiday'];

            $("#weeklystarttimingErr,#weeklyendtimingErr").text('');
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
                let values = JSON.parse(localStorage.getItem("v-e-venueId"));
                if (values && values.id) {
                    $('.btnAfterMenu').each(function () {
                        let startConvert = (convertTime12to24(startTime)).split(':'),
                            endConvert = (convertTime12to24(endTime)).split(':');
                        let day = $(this).attr('data-dayname');
                        $scope.openingHoursData.push({
                            "day": toTitleCase(day), startTime, "startHour": startConvert[0],
                            "startMinute": startConvert[1], endTime, "endHour": endConvert[0], "endMinute": endConvert[1],
                            sequence: (sequence.findIndex(m => m == day)) + 1,
                            "ownerId": values.id
                        });
                    });
                    if ($scope.openingHoursData.length) {
                        WeeklyTiming.createAndUpdate({ params: { openingsHours: $scope.openingHoursData } })
                            .$promise.then((res) => {
                                if (res.data.isSuccess) {
                                    setTimeout(function () {
                                        $scope.basicInit();
                                        $scope.mealsWeekDays = [{ name: 'Sun', txt: 'Sunday', val: 'sunday' }, { name: 'Mon', txt: 'Monday', val: 'monday' }, { name: 'Tue', txt: 'Tuesday', val: 'tuesday' },
                                        { name: 'Wed', txt: 'Wednesday', val: 'wednesday' }, { name: 'Thu', txt: 'Thursday', val: 'thursday' }, { name: 'Fri', txt: 'Friday', val: 'friday' },
                                        { name: 'Sat', txt: 'Saturday', val: 'saturday' }];
                                        $("#open_hours_stime,#open_hours_etime").val('');
                                        //$("#addOpeningHoursBtn").attr('disabled', false).css('pointer-events', '');
                                        toastMsg(true, "Successfully created!");
                                        loader.hidden();
                                    }, 500)
                                } else {
                                    toastMsg(false, "Please try again!");
                                    loader.hidden();
                                }
                            })
                    }
                } else {
                    toastMsg(false, "Please try again!");
                    loader.hidden();
                }
            }
        };

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
                $scope.basicInit();
                setTimeout(function () {
                    toastMsg(true, "Successfully updated!");
                    loader.hidden();
                }, 500);
            }, () => {
                $scope.basicInit();
                setTimeout(function () {
                    toastMsg(false, "Please try again!");
                    loader.hidden();
                }, 300);
            });
        }

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
                        $scope.basicInit();
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

        $scope.updateOpeningAllHours = () => {
            let values = JSON.parse(localStorage.getItem("v-e-venueId"));
            if (values && values.id) {
                let startTime = $("#startTime_up_v").val();
                let endTime = $("#endTime_up_v").val();
                let startConvert = (convertTime12to24($("#startTime_up_v").val())).split(':'),
                    endConvert = (convertTime12to24($("#endTime_up_v").val())).split(':');
                loader.visible();
                WeeklyTiming.updateAllWithStatus({
                    params: {
                        startTime, "startHour": startConvert[0], status: $scope.statusOpen, ownerId: values.id,
                        "startMinute": startConvert[1], endTime, "endHour": endConvert[0], "endMinute": endConvert[1]
                    }
                }).$promise.then((res_56) => {
                    setTimeout(function () {
                        $('#editPopup').modal('hide');
                        loader.hidden();
                        $scope.basicInit();
                    }, 100);
                }, () => {
                    setTimeout(function () {
                        loader.hidden();
                        toastMsg(false, "Please try again!");
                    }, 100);
                });
            } else {
                loader.hidden();
                toastMsg(false, "Please try again!");
            }
        }

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

        let toastMsg = (isVaild, msg) => {
            if (isVaild)
                toastr.success(msg);
            else
                toastr.error(msg);
            toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
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

        $scope.venueFeaturesData = venueAttributes;

        $scope.barTypeData = barTypes;

        $scope.venueTagData = [...$scope.venueFeaturesData, ...$scope.barTypeData];

        $scope.initialize = function () {

            if ($scope.location && $scope.location.lat && $scope.location.lng) {
                $scope.mapOptions = {
                    zoom: 16,
                    center: new google.maps.LatLng($scope.location.lat, $scope.location.lng),
                    zoomControl: false,
                    scaleControl: true,
                    streetViewControl: false,
                    fullscreenControl: false,
                    mapTypeControl: false,
                    styles: stylesMap
                };
            } else {
                $scope.mapOptions = {
                    zoom: 16,
                    center: new google.maps.LatLng(-33.865143, 151.209900),
                    zoomControl: false,
                    scaleControl: true,
                    streetViewControl: false,
                    fullscreenControl: false,
                    mapTypeControl: false,
                    styles: stylesMap
                };
            }

            $scope.map = new google.maps.Map(document.getElementById('map_search'), $scope.mapOptions);

            var marker = new google.maps.Marker({
                position: $scope.location,
                map: new google.maps.Map(document.getElementById('map_search'), $scope.mapOptions)
            });

            const infowindow = new google.maps.InfoWindow({
                content: `${$scope.venueNewData.businessName}`,
            });

            marker.addListener("click", () => {
                infowindow.open({
                    anchor: marker
                });
            });


        }

        $scope.autoComplete = () => {
            let autocomplete = new google.maps.places.Autocomplete(/** @type {!HTMLInputElement} */(document.getElementById('location')));
            autocomplete.addListener('place_changed', function () {

                let place = JSON.parse(JSON.stringify(autocomplete.getPlace()));
                let street = '';
                if (place && place.geometry && place.geometry.location) $scope.location = place.geometry.location;
                if (place && place.place_id) $scope.placeId = place.place_id;

                $scope.mapOptions.center = new google.maps.LatLng($scope.location.lat, $scope.location.lng);

                var marker = new google.maps.Marker({
                    position: $scope.location,
                    map: new google.maps.Map(document.getElementById('map_search'), $scope.mapOptions)
                });

                const infowindow = new google.maps.InfoWindow({
                    content: `${$scope.venueNewData.businessName}`,
                });

                marker.addListener("click", () => {
                    infowindow.open({
                        anchor: marker
                    });
                });
                for (var data of place.address_components) {
                    if (data.types[0] == "locality") {
                        $("#city").val(data.long_name);
                    }
                    //  else {
                    //     if (data.types[0] == "administrative_area_level_2") $("#city").val(data.long_name);
                    // }

                    if (data.types[0] == "country") {
                        $("#country").val(data.long_name);
                    }
                    if (data.types[0] == "postal_code") {
                        $("#zipCode").val(data.long_name);
                    }
                    if (data.types[0] == "administrative_area_level_1") {
                        $("#state").val(data.short_name);
                    }
                    if (data.types[0] == "street_number" || data.types[0] == "route") {
                        street += ` ${data.long_name}`
                    }
                }
                $('#street_address').val(street);
            });
        }

        $scope.loadMap = function () {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCZCRYyaP1xJP9WYzxy9zE7BefTnau-mfA&libraries=places&callback=initAutocomplete';
            document.body.appendChild(script);
            setTimeout(function () {
                $scope.initialize();
                $scope.autoComplete();
            }, 500);
        }

        $scope.createQr = (id) => {
            if (id) {
                loader.visible();
                try {
                    Business.createQrCode({ params: { id } }).$promise.then((res) => {
                        $scope.basicInit();
                        setTimeout(() => {
                            toastMsg(true, "Successfully created!");
                            loader.hidden();
                        }, 300)
                    }, (err) => {
                        toastMsg(false, "Error!. Please try again");
                        loader.hidden();
                    })
                } catch (e) {
                    toastMsg(false, "Error!. Please try again");
                    loader.hidden();
                }

            } else toastMsg(false, "Please try again!");
        }

        $scope.venueNewData = {};
        $scope.location = {};
        $scope.basicInit = () => {
            if ($scope.userId) {
                try {
                    loader.visible();
                    Business.findOne({ filter: { where: { id: $scope.userId }, include: [{ relation: "venueTags" }, { relation: "barTypes" }, { relation: "venueFeatures" }, { relation: "weeklyTimings", scope: { order: 'sequence asc' } }, { relation: "bistroHours" }] } })
                        .$promise.then((res) => {

                            $scope.oHInitCall();

                            try {
                                for (let da in res.weeklyTimings) {
                                    let i = $scope.mealsWeekDays.findIndex(m => m.txt == res.weeklyTimings[da].day);
                                    $scope.mealsWeekDays[i].isSeleced = true;
                                    $scope.mealsWeekDays[i].time = `<div style="text-align:center;"><b>${res.weeklyTimings[da].day}</b><p>${res.weeklyTimings[da].startTime} - ${res.weeklyTimings[da].endTime}</p></div>`;
                                }
                            } catch (e) { }

                            $scope.venueNewData = res;
                            $scope.location = res.location;
                            $scope.placeId = res.placeId;
                            $scope.loadMap();

                            $("input[name='_features']").prop('checked', false);
                            $("input[name='_features']").each(function () {
                                let fValues = res.venueFeatures.find(m => m._name == $(this).data('namefeatures'));
                                if (fValues && fValues.name && fValues._name) $(this).prop('checked', true);
                                if (fValues && fValues.name == 'LGBTQIA') $(this).prop('checked', true);
                            });

                            $("input[name='_bar_type']").prop('checked', false);
                            $("input[name='_bar_type']").each(function () {
                                let barTyValues = res.barTypes.find(m => m._name == $(this).data('namefeatures'));
                                if (barTyValues && barTyValues.name && barTyValues._name) $(this).prop('checked', true);
                            });

                            $("input[name='_venue_tag']").prop('checked', false);
                            $("input[name='_venue_tag']").each(function () {
                                let venueTagsV = res.venueTags.find(m => m._name == $(this).data('namefeatures'));
                                if (venueTagsV && venueTagsV.name && venueTagsV._name) $(this).prop('checked', true);
                            });
                            // $scope.$apply();
                            $timeout(function () { loader.hidden(); }, 500);
                            // setTimeout(function () {
                            //     loader.hidden();
                            // }, 500);
                        });
                } catch (e) {
                    toastMsg(false, e);
                    setTimeout(function () {
                        loader.hidden();
                    }, 500);
                }
            }
        }



        $scope.uploadPrimaryVideo = () => {
            let values = JSON.parse(localStorage.getItem("v-e-venueId"));
            if (values && values.id) {
                var files = $('#video').prop('files');

                var fd = new FormData();
                for (let file of files) {
                    var extension = '';
                    function openFile(file) {
                        extension = file.substr((file.lastIndexOf('.') + 1));
                    };
                    var uid = uuidv4();
                    openFile(file.name);
                    fd.append(`secondary_video_0`, file, `${uid}.${extension}`);
                }

                loader.visible();
                $http.post('/whatsonImg', fd, { headers: { 'Content-Type': undefined } }).then((res) => {
                    if (res.data.isSuccess && res.data.result) {
                        let files = [];
                        res.data.result.forEach(val => {
                            if (val.path.includes('https://')) files.push({ fileName: val.fileName, path: `${val.path}` })
                            else files.push({ fileName: val.fileName, path: `https://${val.path}` })
                        });

                        $('#video').val('');

                        Business.upsertWithWhere({ where: { id: values.id } }, { videos: files }).$promise.then((res) => {
                            setTimeout(function () {
                                toastMsg(true, "Successfully updated!");
                                loader.hidden();
                            }, 500)
                            $scope.venueNewData = res;
                        }, (err) => {
                            loader.hidden();
                            toastMsg(false, "Please try again!");
                        });
                    }
                })
            }

        }

        $scope.replaceVideo = (file) => {
            if (file && file.fileName) {
                loader.visible();
                localStorage.removeItem('r-vi-ve-edit');
                localStorage.setItem('r-vi-ve-edit', JSON.stringify(file));
                $('#video').trigger('click'); return false;
            } else {
                toastMsg(false, "Please try again!");
            }
        }

        $scope.videoDelete = (file) => {
            if (file && file.fileName) {
                loader.visible();
                let values = JSON.parse(localStorage.getItem("v-e-venueId"));
                if (values && values.id) {
                    let fileName = file.fileName;
                    $http.post('/spaceFileDelete', { fileName });
                    Business.upsertWithWhere({ where: { id: values.id } }, { videos: [] }).$promise.then((res) => {
                        setTimeout(function () {
                            toastMsg(true, "Successfully deleted!");
                            loader.hidden();
                        }, 200)
                        $scope.venueNewData = res;
                    }, (err) => {
                        loader.hidden();
                        toastMsg(false, "Please try again!");
                    });
                } else {
                    toastMsg(false, "Please try again!");
                }
            } else {
                toastMsg(false, "Please try again!");
            }
        }

        $scope.updateProfile = () => {
            let values = JSON.parse(localStorage.getItem("v-e-venueId"));
            if (values && values.id) {

                var updateVenue = () => {
                    try {
                        loader.visible();
                        let businessName, abn, addressLine1, addressLine2, city, zipCode, state, country, phone, website, venueInformation,
                            contactPhoneNo, eddystoneNameSpaceId, eddystoneInstanceId, eddystoneUrl, iBeaconId, majorId, minorId, contactFirstName, contactLastName, contactEmail, location, placeId,
                            isQrCode = false, isBeacon = false, bookingUrl = '';

                        if ($("#venuename").val()) {

                            businessName = $("#venuename").val().trim();
                            abn = $("#abn").val().trim() || '';
                            venueInformation = $("#desc").val().trim() || '';
                            phone = $("#Phone_number").val().trim() || '';
                            website = $("#website").val().trim() || '';

                            addressLine1 = $("#street_address").val().trim() || '';
                            addressLine2 = $("#building_suite").val().trim() || '';
                            zipCode = $("#zipCode").val().trim() || '';
                            state = $("#state").val().trim() || '';
                            city = $("#city").val().trim() || '';
                            country = $("#country").val().trim() || '';

                            //email = $("#email").val().trim() || '';
                            // contact1 = $("#contactName").val().trim() || '';
                            // role = $("#role").val().trim() || '';
                            contactFirstName = $("#contactFirstName").val().trim() || '';
                            contactLastName = $("#contactLastName").val().trim() || '';
                            contactEmail = $("#contactEmail").val().trim() || '';
                            contactPhoneNo = $("#phoneNumber").val().trim() || '';

                            location = $scope.location;
                            placeId = $scope.placeId;

                            eddystoneNameSpaceId = $("#eddystoneNameSpaceId").val().trim() || '';
                            eddystoneInstanceId = $("#eddystoneInstanceId").val().trim() || '';
                            eddystoneUrl = $("#eddystoneUrl").val().trim() || '';
                            iBeaconId = $("#iBeaconId").val().trim() || '';
                            majorId = $("#majorId").val().trim() || '';
                            minorId = $("#minorId").val().trim() || '';

                            isQrCode = $("#isQrCode").is(':checked');
                            isBeacon = $("#isBeacon").is(':checked');

                            bookingUrl = $("#booking_url").val();

                            if (values.id) {
                                let params = {
                                    businessName, abn, venueInformation, website, phone, addressLine1, addressLine2, city, state, zipCode, country, eddystoneNameSpaceId, eddystoneInstanceId, eddystoneUrl, iBeaconId, majorId, minorId, contactFirstName,
                                    contactLastName, contactEmail,
                                    contactPhoneNo, location, placeId, ownerId: values.id, suburb: city, isQrCode, isBeacon, bookingUrl
                                };
                                if ($scope.primaryImage && $scope.primaryImage.length) {
                                    params.primaryImage = $scope.primaryImage;
                                }


                                try {


                                    if ($scope.venueNewData.venueFeatures && $scope.venueNewData.venueFeatures.length) {
                                        VenueFeatures.deleteAllVenueFeatures({ params: { ownerId: values.id } });
                                    }

                                    if ($scope.venueNewData.barTypes && $scope.venueNewData.barTypes.length) {
                                        BarType.deleteAllOldData({ params: { ownerId: values.id } });
                                    }

                                    if ($scope.venueNewData.venueTags && $scope.venueNewData.venueTags.length) {
                                        VenueTags.deleteAllOldData({ params: { ownerId: values.id } });
                                    }

                                    Business.updateBusinessAttributes({ params }).$promise.then((res) => {

                                        let isAbsorb = false, absorbFee = 0, isFixed = false, fixedFee = 0, isPercentage = false,
                                            percentageFee = 0, isUrl = false, url = '', isEnabled = false, isPhoneNumber = false, phoneNumber = '';

                                        VenueSettings.find({ filter: { where: { ownerId: values.id, category: "BookingReservation" } } }).$promise.then((vsRes) => {

                                            if (bookingUrl) {
                                                isUrl = true;
                                                isEnabled = true;
                                                url = bookingUrl;
                                            }

                                            if (phone) {
                                                isPhoneNumber = true;
                                                isEnabled = true;
                                                phoneNumber = phone;
                                            }
                                            if (bookingUrl && phone) isPhoneNumber = false

                                            if (vsRes && vsRes.length) {
                                                let nvsResOb = vsRes[0];
                                                if (nvsResOb && nvsResOb.id) {
                                                    isAbsorb = nvsResOb.isAbsorb;
                                                    absorbFee = nvsResOb.absorbFee;
                                                    isFixed = nvsResOb.isFixed;
                                                    fixedFee = nvsResOb.fixedFee;
                                                    isPercentage = nvsResOb.isPercentage;
                                                    percentageFee = nvsResOb.percentageFee;
                                                    VenueSettings.deleteById({ id: nvsResOb.id }).$promise.then((vsD) => {
                                                        VenueSettings.create({
                                                            isEnabled, category: "BookingReservation", isAbsorb, absorbFee, isPhoneNumber, phoneNumber,
                                                            isFixed, fixedFee, isPercentage, percentageFee, isUrl, url, ownerId: values.id
                                                        })
                                                    })
                                                }
                                            } else {
                                                VenueSettings.create({
                                                    isEnabled, category: "BookingReservation", isAbsorb, absorbFee,
                                                    isFixed, fixedFee, isPercentage, percentageFee, isUrl, url, ownerId: values.id
                                                }).$promise.then((vsres_34) => {
                                                    console.log(JSON.stringify(vsres_34));
                                                })
                                            }

                                        })

                                        let features = []; let barTypes = []; let venueTagsA = [];

                                        $("input[name='_features']:checked").each(function () {
                                            features.push({ name: $(this).val(), _name: $(this).data('namefeatures'), ownerId: values.id });
                                        });

                                        $("input[name='_bar_type']:checked").each(function () {
                                            barTypes.push({ name: $(this).val(), _name: $(this).data('namefeatures'), ownerId: values.id });
                                        });

                                        $("input[name='_venue_tag']:checked").each(function () {
                                            venueTagsA.push({ name: $(this).val(), _name: $(this).data('namefeatures'), ownerId: values.id });
                                        });

                                        setTimeout(function () {
                                            if (features && features.length) {
                                                for (let v of features) {
                                                    VenueFeatures.upsertWithWhere({ where: { ownerId: v.ownerId, name: v.name, _name: v._name } },
                                                        { ownerId: v.ownerId, name: v.name, _name: v._name });
                                                }
                                            }

                                            if (barTypes && barTypes.length) {
                                                for (let v of barTypes) {
                                                    BarType.upsertWithWhere({ where: { ownerId: v.ownerId, name: v.name, _name: v._name } },
                                                        { ownerId: v.ownerId, name: v.name, _name: v._name });
                                                }
                                            }

                                            if (venueTagsA && venueTagsA.length) {
                                                for (let v of venueTagsA) {
                                                    VenueTags.upsertWithWhere({ where: { ownerId: v.ownerId, name: v.name, _name: v._name } },
                                                        { ownerId: v.ownerId, name: v.name, _name: v._name });
                                                }
                                            }
                                        }, 200);

                                        setTimeout(function () { $scope.basicInit(); }, 600);

                                        // $scope.$apply();

                                        setTimeout(function () {
                                            toastMsg(true, 'Successfully updated!');
                                            loader.hidden();
                                        }, 700);
                                    }, (err) => {
                                        toastMsg(false, 'Please try again!');
                                        setTimeout(function () {
                                            loader.hidden();
                                        }, 100);
                                    });
                                } catch (e) { }

                            } else {
                                toastMsg(false, 'Please try again!');
                                setTimeout(function () {
                                    loader.hidden();
                                }, 100);
                            }

                        } else {
                            toastMsg(false, 'Venue name is required!');
                            setTimeout(function () {
                                loader.hidden();
                            }, 100);
                        }

                    } catch (e) {
                        toastMsg(false, e);
                        setTimeout(function () {
                            loader.hidden();
                        }, 100);
                    }
                }


                loader.visible();
                Business.findOne({ filter: { where: { id: values.id } } }, (bGData) => {
                    if (bGData) {
                        if ($("#img-pre-primary").attr('src')) {

                            var fd = new FormData();
                            var uid = uuidv4();
                            fd.append(`happenings_0`, dataURItoBlob($("#img-pre-primary").attr('src')), `${uid}.png`);
                            loader.visible();
                            $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                                .then(function (resP) {
                                    $("#primaryImage").val('');
                                    $('#img-pre-primary').attr('src', '');
                                    $('.img-h-s-p').html('');
                                    $('.img-h-s-p').html(`<div class="img-container">
                                    <div class="img-content">
                                        <img src="" class="img-resposive img-bkg-pri" id="img-pre-primary">
                                        <div class="content-details fadeIn-bottom">
                                            <button class="btn btn-danger" id="delete_i_index"
                                                data-toggle="tooltip" data-placement="top" title="Delete"
                                                href="javascript:;"><i
                                                    class="far fa-trash-alt"></i>&nbsp;Remove</button>
                                        </div>
                                    </div>
                                </div>`);
                                    $scope.venueNewData.primaryImage = resP.data.result;
                                    $scope.primaryImage = resP.data.result;
                                    updateVenue();
                                });

                        }
                        else {
                            loader.visible();
                            updateVenue();
                        }
                    }
                })


            }
        }

        $scope.chanPwdClk = () => {
            loader.visible();
            $("#ch_email_ad_eer,#ch_pass_ad_eer,#ch_confirm_pass_ad_eer").html('');
            $("#new_password,#con_chan_password").val('');
            setTimeout(function () {
                loader.hidden();
            }, 200)
        }

        $scope.updatePassword = () => {
            function validateEmail(email) {
                var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                return regex.test(email);
            }
            let isTrue = true;
            let email = $("#login_email_con").val();
            let password = $("#new_password").val();
            let c_password = $("#con_chan_password").val();
            $("#ch_email_ad_eer,#ch_pass_ad_eer,#ch_confirm_pass_ad_eer").html('');
            if (!email) {
                $("#ch_email_ad_eer").html('Email is required!');
                isTrue = false;
            }
            if (!password) {
                $("#ch_pass_ad_eer").html('Pasword is required!');
                isTrue = false;
            }
            if (!c_password) {
                $("#ch_confirm_pass_ad_eer").html('Confirm Pasword is required!');
                isTrue = false;
            }

            if (isTrue) {
                if (validateEmail(email)) {
                    if (password == c_password) {
                        try {
                            let values = JSON.parse(localStorage.getItem("v-e-venueId"));
                            if (values && values.id) {
                                loader.visible();
                                Business.updateEmailAndPwd({ params: { id: values.id, email, password } })
                                    .$promise.then((res) => {
                                        $scope.basicInit();
                                        $('#changeLoginAndPwd').modal('hide');
                                        setTimeout(function () {
                                            loader.hidden();
                                        }, 300);
                                        toastMsg(true, "Successfully updated");
                                    }, () => {
                                        loader.hidden();
                                        toastMsg(false, "Please try again!");
                                    })
                            } else {
                                toastMsg(false, "Please try again!");
                            }
                        } catch (e) {
                            toastMsg(false, "Please try again!");
                        }

                    } else {
                        $("#ch_confirm_pass_ad_eer").html("Confirm password does not match!");
                    }
                } else {
                    $("#ch_email_ad_eer").html("Enter vaild email!");
                }
            } else {
                toastMsg(false, "Please try again!");
            }
        }

        $scope.imgDelete = (img, arg) => {

            if (localStorage.getItem("v-e-venueId")) {
                $scope.ids = JSON.parse(localStorage.getItem("v-e-venueId"));
                $scope.userId = $scope.ids.id;

                try {
                    loader.visible();
                    let fileName = img.fileName;
                    $http.post('/spaceFileDelete', { fileName }).then(function (res) {

                        $scope.venueNewData = {};

                        Business.find({ filter: { where: { id: $scope.userId } } }, (biData) => {

                            let data = {}, primaryImage = [];
                            if (arg == 'primaryImage') data = { primaryImage };

                            Business.upsertWithWhere({ where: { id: $scope.userId } }, data).$promise.then((res) => {
                                toastMsg(true, "Successfully updated!");
                                loader.hidden();
                                $scope.venueNewData = res;
                                $('.img-c-s-p').css({ display: 'block' });
                                $('.img-h-s-p').css({ display: 'none' })
                            }, (err) => {
                                loader.hidden();
                                toastMsg(false, "Please try again!");
                            });
                        })
                    }, (err) => {
                        toastMsg(false, "Error!. Please try again!");
                        loader.hidden();
                    });
                } catch (err) { toastMsg(false, err); loader.hidden(); }
            }

        };

        $scope.clickImageSection = (file) => {

            var result = document.querySelector('.result'),
                cropbtn = document.querySelector('#crop-btn'),
                cropper = '';

            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target.result) {
                    $("#image-crop-md-p").modal({ backdrop: 'static', keyboard: false });
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
                        minContainerHeight: 320,
                        minCropBoxWidth: 700,
                        minCropBoxHeight: 300
                    });
                }
            };
            reader.readAsDataURL(file);

            // save on click
            cropbtn.addEventListener('click', (e) => {
                e.preventDefault();
                let imgSrc = cropper.getCroppedCanvas({
                    width: 700,
                    height: 300
                }).toDataURL();

                $scope.venueNewData.primaryImage = [];
                $scope.$apply();
                $(".img-h-s-p").css({ display: 'block' });
                $("#image-crop-md-p").modal('hide');
                $("#img-pre-primary").attr('src', imgSrc).css({ display: 'block' });
                $(".img-c-s-p").css({ display: 'none' });
                $("#primaryImage").val('');

                cropper.destroy();
                cropper.reset();
                cropper.clear();
            });

            $("#delete_i_index").on('click', function () {
                $("#img-pre").attr('src', '');
                $(".img-c-s-p").css({ display: 'block' })
                $(".img-h-s-p").css({ display: 'none' })
            });

            $("#modalClose").on('click', function () {
                $("#image-crop-md-p").modal('hide');
            });
        }

        $scope.imgSeArr = [];
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
                        minContainerWidth: 296,
                        minContainerHeight: 370,
                        minCropBoxWidth: 700,
                        minCropBoxHeight: 875
                    });
                }
            };
            reader.readAsDataURL(file);

            // save on click
            cropbtn.addEventListener('click', (e) => {

                loader.visible();

                e.preventDefault();
                let imgSrc = cropper_2.getCroppedCanvas({
                    width: 700,
                    height: 875
                }).toDataURL();

                $("#image-crop-second-md").modal('hide');
                if (localStorage.getItem("v-e-venueId")) {
                    $scope.ids = JSON.parse(localStorage.getItem("v-e-venueId"));
                    $scope.userId = $scope.ids.id;
                    try {

                        Business.find({ filter: { where: { id: $scope.userId } } }, (biData) => {

                            let { secondaryImage } = biData[0];

                            var fd = new FormData();
                            var uid = uuidv4();
                            fd.append(`happenings_0`, dataURItoBlob(imgSrc), `${uid}.png`);

                            $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                                .then(function (resP) {

                                    let index = localStorage.getItem('se-img-i-venue');

                                    if (secondaryImage || secondaryImage.length >= 5) secondaryImage[index] = resP.data.result[0];


                                    // console.log(JSON.stringify(secondaryImage));

                                    Business.upsertWithWhere({ where: { id: $scope.userId } }, { secondaryImage }).$promise.then((res) => {

                                        setTimeout(function () {
                                            toastMsg(true, "Successfully Deleted");
                                            loader.hidden();
                                        }, 300)
                                        $scope.venueNewData = res;
                                        //$scope.$apply();
                                    }, (err) => {
                                        loader.hidden();
                                        toastMsg(false, "Please try again!");
                                    });
                                });


                        });
                    } catch (e) {
                        loader.hidden();
                        toastMsg(false, e);
                    }
                }
                cropper_2.destroy();
                cropper_2.reset();
                cropper_2.clear();
            });

            $("#modalClose_second").on('click', function () {
                $("#image-crop-second-md").modal('hide');
            });
        }

        $scope.clkImgReplceSend = (file) => {

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
                        minContainerWidth: 296,
                        minContainerHeight: 370,
                        minCropBoxWidth: 700,
                        minCropBoxHeight: 875
                    });
                }
            };
            reader.readAsDataURL(file);

            // save on click
            cropbtn.addEventListener('click', (e) => {

                loader.visible();

                e.preventDefault();
                let imgSrc = cropper_2.getCroppedCanvas({
                    width: 700,
                    height: 875
                }).toDataURL();
                $("#image-crop-second-md").modal('hide');
                let values = JSON.parse(localStorage.getItem('re-img-se-p'));
                let fileName = values.fileName;
                if (localStorage.getItem("v-e-venueId")) {
                    $scope.ids = JSON.parse(localStorage.getItem("v-e-venueId"));
                    $scope.userId = $scope.ids.id;
                    try {

                        Business.find({ filter: { where: { id: $scope.userId } } }, (biData) => {

                            let { secondaryImage } = biData[0];

                            let arrIndex = secondaryImage.findIndex(m => m.fileName == fileName);

                            $http.post('/spaceFileDelete', { fileName });

                            var fd = new FormData();
                            var uid = uuidv4();
                            fd.append(`happenings_0`, dataURItoBlob(imgSrc), `${uid}.png`);

                            $http.post('/happeningsImg', fd, { headers: { 'Content-Type': undefined } })
                                .then(function (resP) {

                                    secondaryImage[arrIndex] = resP.data.result[0];

                                    Business.upsertWithWhere({ where: { id: $scope.userId } }, { secondaryImage }).$promise.then((res) => {

                                        setTimeout(function () {
                                            toastMsg(true, "Successfully Deleted");
                                            loader.hidden();
                                        }, 300)
                                        $scope.venueNewData = res;
                                        // $scope.$apply();
                                    }, (err) => {
                                        loader.hidden();
                                        toastMsg(false, "Please try again!");
                                    });
                                });


                        });
                    } catch (e) {
                        loader.hidden();
                        toastMsg(false, e);
                    }
                }
                cropper_2.destroy();
                cropper_2.reset();
                cropper_2.clear();
            });

            $("#modalClose_second").on('click', function () {
                $("#image-crop-second-md").modal('hide');
            });
        }

        $scope.secondImgDelete = (i) => {
            $(`#img-d-s-${i}`).css({ display: 'block' });
            $(`#drag-drop-img-second_${i}`).addClass('drag-img-up');
            // $(`#img-s-s-${i}`).remove();
            $(`#img-s-s-${i}`).html('');
            let index = $scope.imgSeArr.findIndex(m => m.index == i)
            delete $scope.imgSeArr[index];
        }

        $scope.secondaryImgDelete = (img) => {

            loader.visible();
            if (localStorage.getItem("v-e-venueId")) {
                $scope.ids = JSON.parse(localStorage.getItem("v-e-venueId"));
                $scope.userId = $scope.ids.id;

                try {

                    let fileName = img.fileName;
                    $http.post('/spaceFileDelete', { fileName }).then(function (res) {

                        $scope.venueNewData = {};

                        Business.find({ filter: { where: { id: $scope.userId } } }, (biData) => {
                            let data = {};
                            if (biData && biData.length) {
                                let { secondaryImage } = biData[0];
                                if (secondaryImage && secondaryImage.length) {
                                    data = {
                                        secondaryImage: $.grep(biData[0].secondaryImage, function (e) {
                                            return e.fileName != fileName;
                                        })
                                    };
                                    Business.upsertWithWhere({ where: { id: $scope.userId } }, data).$promise.then((res) => {

                                        setTimeout(function () {
                                            toastMsg(true, "Successfully Deleted");
                                            loader.hidden();
                                        }, 300)
                                        $scope.venueNewData = res;
                                        $scope.$apply();
                                    }, (err) => {
                                        loader.hidden();
                                        toastMsg(false, "Please try again!");
                                    });
                                } else {
                                    toastMsg(false, "Error!. Please try again!");
                                    loader.hidden();
                                }
                            } else {
                                toastMsg(false, "Error!. Please try again!");
                                loader.hidden();
                            }
                        })
                    })
                } catch (e) {
                    toastMsg(false, "Error!. Please try again!");
                    loader.hidden();
                }
            } else {
                toastMsg(false, "Error!. Please try again!");
                loader.hidden();
            }
        }

        $scope.downloadQr = (data) => {
            var a = $("<a>")
                .attr("href", `${data.qrCode}`)
                .attr("download", `${data.id}.png`)
                .appendTo("body");
            a[0].click();
            a.remove();
        }

        $scope.getBusinessName = () => { return $scope.businessDelection; };

        $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

        if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

        var getValuesDataL = () => {
            loader.visible()
            setTimeout(function () {
                $scope.businessDelection = getAllVenues.get();
                loader.hidden();
            }, 1000)
        }

        if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
            $scope.isBusinessSelect = true;
            if ($rootScope.selectedVenue) {
                $scope.userId = $rootScope.selectedVenue.venueId;
                $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.venueId);
                $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                getValuesDataL();
                $scope.basicInit();
                //$scope.getBusinessData();
            } else {
                loader.visible()
                getValuesDataL();
                $scope.userId = $rootScope.currentUser.id;
                $scope.basicInit();
            }
        }

        if ($scope.userDetails.isAdmin == false) {
            $scope.userId = $scope.userDetails.id
            $scope.basicInit();
            //  $scope.getBusinessData();
            // $("#autocompleteBusiness").val($scope.userDetails.businessName);
            // localStorage.removeItem("selectedVenue");
            // $("#autocompleteBusiness").attr('disabled', true);
            //  localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userDetails.id, venueId: $scope.userDetails./////id, venueName: $scope.userDetails.businessName }));
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
                        $scope.basicInit();
                        // $scope.getBusinessData();
                    }
                } else $("#businessErr").text('Please select the Business name');
            }
        }

    }]);