angular
    .module('app')
    .controller('alayticsAnalyticsCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'AllChart', 'socket', 'HappeningsCategory', 'Happenings', 'loader', '$filter',
        function ($scope, $state, $rootScope, Business, $http, AllChart, socket, HappeningsCategory, Happenings, loader, $filter) {


            Date.prototype.diff = function (to) {
                return Math.abs(Math.floor(to.getTime() / (3600 * 24 * 1000)) - Math.floor(this.getTime() / (3600 * 24 * 1000)))
            }

            let toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            let groupBy = (list, props) => {
                return list.reduce((a, b) => {
                    (a[b[props]] = a[b[props]] || []).push(b);
                    return a;
                }, {});
            }

            $scope.isBusinessSelect = false;

            if (!$scope.userId) $scope.userId = $rootScope.currentUser.id;


            $scope.getBusinessName = () => {
                return $scope.businessDelection;
            };

            $scope.visibleDailyChart = false;

            $scope.formatDate = function (date) {
                var dateOut = new Date(date);
                return $filter('date')(new Date(dateOut), 'MMM dd, y');
            };



            $scope.mulDateSelected = false;
            $scope.setChartdata = (arg = []) => {

                let _00to01_v = 0, _01to02_v = 0, _02to03_v = 0, _03to04_v = 0, _04to05_v = 0, _05to06_v = 0,
                    _06to07_v = 0, _07to08_v = 0, _08to09_v = 0, _09to10_v = 0, _10to11_v = 0, _11to12_v = 0, _12to13_v = 0,
                    _13to14_v = 0, _14to15_v = 0, _15to16_v = 0, _16to17_v = 0, _17to18_v = 0, _18to19_v = 0,
                    _19to20_v = 0, _20to21_v = 0, _21to22_v = 0, _22to23_v = 0, _23to24_v = 0;

                let _00to01_i = 0, _01to02_i = 0, _02to03_i = 0, _03to04_i = 0, _04to05_i = 0, _05to06_i = 0,
                    _06to07_i = 0, _07to08_i = 0, _08to09_i = 0, _09to10_i = 0, _10to11_i = 0, _11to12_i = 0, _12to13_i = 0,
                    _13to14_i = 0, _14to15_i = 0, _15to16_i = 0, _16to17_i = 0, _17to18_i = 0, _18to19_i = 0,
                    _19to20_i = 0, _20to21_i = 0, _21to22_i = 0, _22to23_i = 0, _23to24_i = 0;

                let dataForV = [], dataFori = [], labelsFor = [];

                $scope.lineCnt = arg.length;

                var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


                if (arg && arg.length == 1) {

                    labelsFor = ['00-01AM', '01-02AM', '02-03AM', '03-04AM', '04-05AM', '05-06AM', '06-07AM', '07-08AM', '08-09AM', '09-10AM', '10-11AM', '11-12PM',
                        '12-01PM', '01-02PM', '02-03PM', '03-04PM', '04-05PM', '05-06PM', '06-07PM', '07-08PM', '08-09PM', '09-10PM', '10-11PM', '11-12AM'];

                    $scope.chartShow = true;

                    arg.forEach((v, i) => {

                        dataForV.push(
                            v._00to01.view, v._01to02.view, v._02to03.view, v._03to04.view, v._04to05.view, v._05to06.view,
                            v._06to07.view, v._07to08.view, v._08to09.view, v._09to10.view, v._10to11.view, v._11to12.view,
                            v._12to13.view, v._13to14.view, v._14to15.view, v._15to16.view, v._16to17.view, v._17to18.view,
                            v._18to19.view, v._19to20.view, v._20to21.view, v._21to22.view, v._22to23.view, v._23to24.view
                        )

                        dataFori.push(
                            v._00to01.interest, v._01to02.interest, v._02to03.interest, v._03to04.interest, v._04to05.interest,
                            v._05to06.interest, v._06to07.interest, v._07to08.interest, v._08to09.interest, v._09to10.interest,
                            v._10to11.interest, v._11to12.interest, v._12to13.interest, v._13to14.interest, v._14to15.interest,
                            v._15to16.interest, v._16to17.interest, v._17to18.interest, v._18to19.interest, v._19to20.interest,
                            v._20to21.interest, v._21to22.interest, v._22to23.interest, v._23to24.interest
                        )
                    })
                } else {

                    $scope.chartShow = true;

                    arg.forEach((v, i) => {

                        _00to01_v = v._00to01.view, _01to02_v = v._01to02.view, _02to03_v = v._02to03.view,
                            _03to04_v = v._03to04.view, _04to05_v = v._04to05.view, _05to06_v = v._05to06.view,
                            _06to07_v = v._06to07.view, _07to08_v = v._07to08.view, _08to09_v = v._08to09.view,
                            _09to10_v = v._09to10.view, _10to11_v = v._10to11.view, _11to12_v = v._11to12.view,
                            _12to13_v = v._12to13.view, _13to14_v = v._13to14.view, _14to15_v = v._14to15.view,
                            _15to16_v = v._15to16.view, _16to17_v = v._16to17.view, _17to18_v = v._17to18.view,
                            _18to19_v = v._18to19.view, _19to20_v = v._19to20.view, _20to21_v = v._20to21.view,
                            _21to22_v = v._21to22.view, _22to23_v = v._22to23.view, _23to24_v = v._23to24.view;

                        _00to01_i = v._00to01.interest, _01to02_i = v._01to02.interest, _02to03_i = v._02to03.interest,
                            _03to04_i = v._03to04.interest, _04to05_i = v._04to05.interest, _05to06_i = v._05to06.interest,
                            _06to07_i = v._06to07.interest, _07to08_i = v._07to08.interest, _08to09_i = v._08to09.interest,
                            _09to10_i = v._09to10.interest, _10to11_i = v._10to11.interest, _11to12_i = v._11to12.interest,
                            _12to13_i = v._12to13.interest, _13to14_i = v._13to14.interest, _14to15_i = v._14to15.interest,
                            _15to16_i = v._15to16.interest, _16to17_i = v._16to17.interest, _17to18_i = v._17to18.interest,
                            _18to19_i = v._18to19.interest, _19to20_i = v._19to20.interest, _20to21_i = v._20to21.interest,
                            _21to22_i = v._21to22.interest, _22to23_i = v._22to23.interest, _23to24_i = v._23to24.interest;

                        if (v && v.dateZero) labelsFor.push($scope.formatDate(v.dateZero));

                        let cnt_v = 0;
                        cnt_v = _00to01_v + _01to02_v + _02to03_v + _03to04_v + _04to05_v + _05to06_v +
                            _06to07_v + _07to08_v + _08to09_v + _09to10_v + _10to11_v + _11to12_v + _12to13_v +
                            _13to14_v + _14to15_v + _15to16_v + _16to17_v + _17to18_v + _18to19_v +
                            _19to20_v + _20to21_v + _21to22_v + _22to23_v + _23to24_v;

                        dataForV.push(cnt_v)


                        let cnt_i = 0;
                        cnt_i = _00to01_i + _01to02_i + _02to03_i + _03to04_i + _04to05_i + _05to06_i +
                            _06to07_i + _07to08_i + _08to09_i  + _09to10_i  + _10to11_i  + _11to12_i  + _12to13_i +
                            _13to14_i  + _14to15_i  + _15to16_i  + _16to17_i  + _17to18_i + _18to19_i +
                            _19to20_i  + _20to21_i  + _21to22_i  + _22to23_i  + _23to24_i ;

                        dataFori.push(cnt_i);
                    })
                }

                $(".wrapper").css({ height: '100%' });

                $('#barChart').remove();
                $('#main-chart').append('<canvas id="barChart"><canvas>');

                new Chart(document.getElementById("barChart").getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: labelsFor,
                        datasets: [{
                            label: "View",
                            type: "bar",
                            stack: "sensitivity",
                            backgroundColor: "#2e7d32",
                            data: dataForV,
                        }, {
                            label: "Interest",
                            type: "bar",
                            stack: "base",
                            backgroundColor: "#8e24aa",
                            data: dataFori,
                        }]
                    },
                    options: {
                        scales: {
                            xAxes: [{
                                //stacked: true,
                                stacked: true,
                                ticks: {
                                    beginAtZero: false,
                                }
                            }],
                            yAxes: [{
                                stacked: true,
                                ticks: {
                                    beginAtZero: false,
                                    steps: 10,
                                    min: 1,
                                    max: 50 //max value for the chart is 60
                                }
                            }]
                        },
                        animation: {
                            duration: 500,
                            easing: "easeOutQuart",
                            onComplete: function () {
                                var ctx = this.chart.ctx;
                                ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontFamily, 'normal', Chart.defaults.global.defaultFontFamily);
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'bottom';

                                this.data.datasets.forEach(function (dataset) {
                                    for (var i = 0; i < dataset.data.length; i++) {
                                        var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
                                            scale_max = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._yScale.maxHeight;
                                        ctx.fillStyle = '#444';
                                        var y_pos = model.y - 5;
                                        if ((scale_max - model.y) / scale_max >= 0.93)
                                            y_pos = model.y + 20;
                                        if (dataset.data[i]) {
                                            ctx.fillText(dataset.data[i], model.x, y_pos);
                                        }

                                    }
                                });
                            }
                        }
                    }
                });

                setTimeout(function () { loader.hidden() }, 500);

            }

            $scope.startAndEndDiff = 0;
            getDailyCount = (data) => {
                if (data && data.id) {
                    loader.visible();
                    AllChart.find({ filter: { where: { happeningsId: data.id } } }).$promise.then((res) => {
                        if (res && res.length) {
                            $scope.setChartdata(res);
                        } else {
                            toastMsg(false, "Please try again!");
                            loader.hidden();
                        }
                    })
                }

            }

            $scope.selectedLiveDrop = (data) => {
                if (data && data.id) {
                    loader.visible();
                    let dateZero = `${data.date}T00:00:00.000Z`;
                    AllChart.find({ filter: { where: { happeningsId: data.id, dateZero } } }).$promise.then((res) => {
                        if (res && res.length) {
                            $scope.setChartdata(res);
                            setTimeout(function () { loader.hidden(); }, 300)
                        } else {
                            $(".wrapper").css({ height: '55rem' });
                            $scope.chartShow = false;
                            toastMsg(false, "Please try again!");
                            loader.hidden();
                        }
                    })
                }
            }


            $scope.dateFromToChange = () => {
                if ($("#liveDateTo").val() && $("#liveDateFrom").val()) {
                    loader.visible();
                    let sdate = `${$("#liveDateFrom").val()}T00:00:00.000Z`;
                    let edate = `${$("#liveDateTo").val()}T00:00:00.000Z`;
                    let id = $("#eventsSSdate").val();
                    if (id) {
                        AllChart.find({ filter: { where: { happeningsId: id, dateZero: { between: [sdate, edate] } } } }).$promise.then((res) => {
                            if (res && res.length) {
                                $scope.setChartdata(res);
                                setTimeout(function () { loader.hidden(); }, 300)
                            } else {
                                $(".wrapper").css({ height: '55rem' });
                                $scope.chartShow = false;
                                toastMsg(false, "Please try again!");
                                loader.hidden();
                            }
                        })
                    } else {
                        $(".wrapper").css({ height: '55rem' });
                        $scope.chartShow = false;
                        toastMsg(false, "Please try again!");
                        loader.hidden();
                    }
                }
            }


            $scope.eventsCategoryList = [];
            $scope.getEventscategory = () => {
                $scope.eventsCategoryList = [];
                HappeningsCategory.find({ filter: { where: { ownerId: $scope.userId } } }).$promise.then((res) => {
                    $scope.eventsCategoryList = res;
                    loader.hidden();
                });
            }

            $scope.eventsDropList = [];
            $scope.getEventsMethod = (data) => {

                if (data) {
                    loader.visible();
                    $scope.eventsDropList = [];
                    let tDate = new Date();
                    let ftdate = `${tDate.getFullYear()}-${("0" + (tDate.getMonth() + 1)).slice(-2)}-${("0" + tDate.getDate()).slice(-2)}T00:00:00.000Z`;

                    Happenings.find({
                        filter: {
                            where: { ownerId: $scope.userId, isDeleted: false, status: 'Live', date: { "gte": ftdate } },
                            fields: ["isLive", "title", "happeningsCategory", "id", "happeningsCategoryId", "date", "dateFormat", "live", "liveDate", "liveTime", "titleTxt"], include: [{ relation: "happeningsCategory", scope: { where: { _name: data } } }]
                        }
                    }).$promise.then((res) => {

                        if (res) {
                            res = res.filter(m => m.happeningsCategory && m.happeningsCategory.name);

                            let gD = groupBy(res, 'titleTxt');

                            Object.keys(gD).map(function (k) {
                                let kDaTa = gD[k].find(m => m.titleTxt == k);
                                if (kDaTa && kDaTa.title) {
                                    $scope.eventsDropList.push({ _name: kDaTa.titleTxt, name: kDaTa.title });
                                }
                            })

                            loader.hidden();
                        }
                    })
                } else toastMsg(false, "Please try again!");
            }

            $scope.formatDate = function (date) {
                var dateOut = new Date(date);
                return $filter('date')(new Date(dateOut), 'MMM d, y');
            };

            $scope.chartShow = false;
            $(".wrapper").css({ height: '55rem' });

            $scope.eventsDates = [];
            $scope.dateDisabled = true;
            $scope.eventsOnChange = (titleTxt) => {

                if (titleTxt) {
                    Happenings.find({
                        filter: {
                            where: {
                                ownerId: $scope.userId, titleTxt,
                                isDeleted: false, status: 'Live'
                            }
                        }
                    }).$promise.then((res) => {

                        $scope.eventsDates = [];
                        for (let da of res) {
                            $scope.eventsDates.push({
                                value: `${da.date.split('T')[0]}`,
                                txt: `${$scope.formatDate(da.date)}`, id: da.id
                            });
                        }

                    })
                }
            }

            $scope.categoryOnChange = (data) => {
                if (data) {
                    $scope.getEventsMethod(data);
                }
            }

            $scope.lFromTodate = [];
            $scope.dateOnChange = () => {
                if ($("#eventsSSdate").val()) {

                    let id = $("#eventsSSdate").val();

                    Happenings.find({ filter: { where: { status: "Live", id }, fields: ["id", "date", "liveDate", "status", "dateNo"], order: "dateNo asc" } })
                        .$promise.then((res) => {
                            if (res) {

                                $scope.lFromTodate = [];
                                let tDate = new Date();
                                let ftdate = `${tDate.getFullYear()}-${("0" + (tDate.getMonth() + 1)).slice(-2)}-${("0" + tDate.getDate()).slice(-2)}T00:00:00.000Z`;

                                $scope.minDate = (res[0].liveDate).split('T')[0];
                                $scope.maxDate = (res[0].date).split('T')[0];

                                for (var day = new Date(res[0].liveDate.split('T')[0]); day <= new Date(res[0].date.split('T')[0]); day.setDate(day.getDate() + 1)) {

                                    let cfDate = `${day.getFullYear()}-${("0" + (day.getMonth() + 1)).slice(-2)}-${("0" + day.getDate()).slice(-2)}T00:00:00.000Z`;


                                    if (cfDate == ftdate) {
                                        loader.visible();
                                        AllChart.find({ filter: { where: { happeningsId: res[0].id, dateZero: cfDate } } }).$promise.then((resChart) => {
                                            if (resChart && resChart.length) {
                                                $scope.setChartdata(resChart);
                                            } else {
                                                toastMsg(false, "Please try again!");
                                                loader.hidden();
                                            }
                                        })
                                    } else {
                                        $scope.lFromTodate.push({
                                            happeningsId: res[0].id,
                                            txt: `${$scope.formatDate(cfDate)}`, value: `${cfDate.split('T')[0]}`
                                        })
                                    }
                                }
                            }
                        });
                }
            }


            $scope.BusinessSelected = (arg) => {

                $("#businessErr").text('');
                if (arg && $("#autocompleteBusiness").data('id')) {
                    arg = $("#autocompleteBusiness").data('id');
                    if ($("#businessSubmit").hasClass('businessSubmit')) {
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    }
                    if (arg != "select") {
                        $scope.isBusinessSelect = true;
                        $scope.userId = arg;
                        loader.visible();
                        $scope.getEventscategory();
                        $rootScope.selectedVenue = { venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                        localStorage.removeItem("selectedVenue");
                        localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userId, ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }));
                    }
                } else $("#businessErr").text('Please select the Business name');
            }

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });


            if ($scope.userDetails.isAdmin == false) {
                $scope.userId = $scope.userDetails.id;
                $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                $("#autocompleteBusiness").attr('disabled', true);
                $scope.getEventscategory();
                localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userDetails.id, ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
            }

            $scope.useremail = $rootScope.currentUser.email;
            $scope.userId = "";
            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
                $rootScope.selectedVenue = JSON.parse(localStorage.getItem('selectedVenue'));

                $scope.isBusinessSelect = true;
                Business.find({ filter: { where: { status: "active" }, "fields": ["businessName", "id", "email"] } }).$promise.then((res) => {
                    $scope.businessDelection = res;
                });
                if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId) {
                    $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                    $scope.userId = $rootScope.selectedVenue.venueId;
                    $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.venueId)
                    if ($("#businessSubmit").hasClass('businessSubmit')) {
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    }
                    $scope.getEventscategory();
                }
            }
            else {
                $scope.isBusinessSelect = true;
                $scope.userId = $rootScope.currentUser.id;
            }
        }]);