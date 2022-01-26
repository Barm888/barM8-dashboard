angular
    .module('app')
    .controller('bookAnalyticsCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'socket', 'getAllVenues', 'loader', 'ChartForBooking',
        function ($scope, $state, $rootScope, Business, $http, socket, getAllVenues, loader, ChartForBooking) {

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.getBusinessName = () => {
                return $scope.businessSelection;
            };



            $scope.callDailyAnaly = () => {

                let tDate = new Date();
                let dateZero = `${tDate.getFullYear()}-${("0" + (tDate.getMonth() + 1)).slice(-2)}-${("0" + tDate.getDate()).slice(-2)}T00:00:00.000Z`;


                let createChart = (data) => {
                    let _00to01 = 0, _01to02 = 0, _02to03 = 0, _03to04 = 0, _04to05 = 0, _05to06 = 0,
                        _06to07 = 0, _07to08 = 0, _08to09 = 0, _09to10 = 0, _10to11 = 0, _11to12 = 0, _12to13 = 0,
                        _13to14 = 0, _14to15 = 0, _15to16 = 0, _16to17 = 0, _17to18 = 0, _18to19 = 0,
                        _19to20 = 0, _20to21 = 0, _21to22 = 0, _22to23 = 0, _23to24 = 0;


                    labels = ['00-01AM', '01-02AM', '02-03AM', '03-04AM', '04-05AM', '05-06AM', '06-07AM', '07-08AM', '08-09AM', '09-10AM', '10-11AM', '11-12AM',
                        '12-01PM', '01-02PM', '02-03PM', '03-04PM', '04-05PM', '05-06PM', '06-07PM', '07-08PM', '08-09PM', '09-10PM', '10-11PM', '11-12AM'];

                    let dataForV = [_00to01, _01to02, _02to03, _03to04, _04to05, _05to06,
                        _06to07, _07to08, _08to09, _09to10, _10to11, _11to12,
                        _12to13, _13to14, _14to15, _15to16, _16to17, _17to18,
                        _18to19, _19to20, _20to21, _21to22, _22to23, _23to24];

                    if (data && data.length) {
                        _00to01 = data[0]._00to01; _00to01 = data[0]._00to01; _02to03 = data[0]._02to03;
                        _03to04 = data[0]._03to04; _04to05 = data[0]._04to05; _05to06 = data[0]._05to06;
                        _06to07 = data[0]._06to07; _07to08 = data[0]._07to08; _08to09 = data[0]._08to09;
                        _09to10 = data[0]._09to10; _10to11 = data[0]._10to11; _11to12 = data[0]._11to12;
                        _12to13 = data[0]._12to13; _13to14 = data[0]._13to14; _14to15 = data[0]._14to15;
                        _15to16 = data[0]._15to16; _16to17 = data[0]._16to17; _17to18 = data[0]._17to18;
                        _18to19 = data[0]._18to19; _19to20 = data[0]._19to20; _20to21 = data[0]._20to21;
                        _21to22 = data[0]._21to22; _22to23 = data[0]._22to23; _23to24 = data[0]._23to24;

                        dataForV = [_00to01, _01to02, _02to03, _03to04, _04to05, _05to06,
                            _06to07, _07to08, _08to09, _09to10, _10to11, _11to12,
                            _12to13, _13to14, _14to15, _15to16, _16to17, _17to18,
                            _18to19, _19to20, _20to21, _21to22, _22to23, _23to24];
                    }

                    $scope.dailyBusinessHits = {
                        "series": ["Hits"],
                        "data": [dataForV], labels,
                        "colours": [{ // default
                            backgroundColor: 'rgba(254, 191, 75, 1)',
                            pointBackgroundColor: 'rgba(59, 89, 152,1)',
                            borderColor: 'rgba(51,51,51,1)',
                            pointBorderColor: 'rgba(255,255,255,1)',
                            pointHoverBorderColor: 'rgba(255,255,255,1)'
                        }],
                        options: {
                            responsive: true,
                            legend: { display: true },
                            hover: {
                                mode: 'label'
                            },
                            scales: {
                                xAxes: [{
                                    display: true
                                }],
                                yAxes: [{
                                    display: true,
                                    ticks: {
                                        beginAtZero: true,
                                        steps: 1,
                                        stepValue: 1,
                                        max: 50
                                    }
                                }]
                            },
                            title: {
                                display: true,
                                text: 'Book hits per hour'
                            }
                        }
                    };


                    //Age Chart

                    let _18to23_Age = 0, _24to29_Age = 0, _30to35_Age = 0, _36to41_Age = 0, _42toPlus_Age = 0;

                    if (data && data.length) {
                        _18to23_Age = data[0]._18to23_Age;
                        _24to29_Age = data[0]._24to29_Age;
                        _30to35_Age = data[0]._30to35_Age;
                        _36to41_Age = data[0]._36to41_Age;
                        _42toPlus_Age = data[0]._42toPlus_Age;
                    }

                    var pieAgeDaily = {
                        "series": ["Visit"],
                        "data": [[_18to23_Age, _24to29_Age, _30to35_Age, _36to41_Age, _42toPlus_Age]],
                        "labels": ["18 to 23", "24 to 29", "30 to 35", "36 to 41", "41 +"],
                        "colours": [{
                            fill: true,
                            backgroundColor: ['#d81b60', '#3f51b5', '#22b573', '#ffb83b', '#bc1dc1']
                        }],
                        options: {
                            responsive: true,
                            legend: { display: true },
                            hover: {
                                mode: 'label'
                            },
                            title: {
                                display: true,
                                text: 'Age'
                            }
                        }
                    };
                    $scope.pieDailyAge = pieAgeDaily;

                    // Male and female
                    let male = 0, female = 0, others = 0;
                    if (data && data.length) {
                        male = data[0].male;
                        female = data[0].female;
                        others = data[0].others;
                    }

                    $scope.doughnutDailylabels = ["Male", "Female", "Others"];
                    $scope.doughnutDailydata = [male, female, others];
                    $scope.doughnutDailyColor = ['#388e3c', '#e53935', '#3f51b5'];
                    $scope.doughnutDailyoptions = {
                        legend: { display: true },
                        responsive: true,
                        title: {
                            display: true,
                            text: 'Gender'
                        }
                    }
                }


                ChartForBooking.find({ filter: { where: { ownerId: $scope.userId, dateZero } } }).$promise.then((res) => {
                    if (res && res.length) {
                        createChart(res);
                    } else createChart([]);
                })
            }


            $scope.callWeekAnaly = () => {

                let createWeekChart = (data) => {
                    let _week_day_0 = 0, _week_day_1 = 0, _week_day_2 = 0, _week_day_3 = 0,
                        _week_day_4 = 0, _week_day_5 = 0, _week_day_6 = 0;
                    let _18to23_Age = 0, _24to29_Age = 0, _30to35_Age = 0, _36to41_Age = 0, _42toPlus_Age = 0;
                    let male = 0, female = 0, others = 0, newWeekCnt = 0, weekreturning = 0;

                    if (data && data.length) {

                        data.forEach(val => {

                            let day = new Date(val.dateZero);

                            let { _00to01 = 0, _01to02 = 0, _02to03 = 0, _03to04 = 0, _04to05 = 0,
                                _05to06 = 0, _06to07 = 0, _07to08 = 0, _08to09 = 0, _09to010 = 0,
                                _10to11 = 0, _11to12 = 0, _12to13 = 0, _13to14 = 0, _14to15 = 0,
                                _15to16 = 0, _16to17 = 0, _17to18 = 0, _18to19 = 0, _19to20 = 0,
                                _20to21 = 0, _21to22 = 0, _22to23 = 0, _23to24 = 0
                            } = val;

                            let totalCnt = 0;
                            totalCnt = _00to01 + _01to02 + _02to03 + _03to04 + _04to05 + _05to06 + _06to07 + _07to08 + _08to09 + _09to010 + _10to11 + _11to12
                                + _12to13 + _13to14 + _14to15 + _15to16 + _16to17 + _17to18 + _18to19 + _19to20 + _20to21 + _21to22 + _22to23 + _23to24;

                            if (day.getDay() == 0) { _week_day_0 = totalCnt }
                            else if (day.getDay() == 1) { _week_day_1 = totalCnt }
                            else if (day.getDay() == 2) { _week_day_2 = totalCnt }
                            else if (day.getDay() == 3) { _week_day_3 = totalCnt }
                            else if (day.getDay() == 4) { _week_day_4 = totalCnt }
                            else if (day.getDay() == 5) { _week_day_5 = totalCnt }
                            else if (day.getDay() == 6) { _week_day_6 = totalCnt }

                            //Week Start 
                            _18to23_Age += val._18to23_Age;
                            _24to29_Age += val._24to29_Age;
                            _30to35_Age += val._30to35_Age;
                            _36to41_Age += val._36to41_Age;
                            _42toPlus_Age += val._42toPlus_Age;

                            male += val.male;
                            female += val.female;
                            others += val.others;
                            //WeekEnd

                        })
                    }

                    $scope.bookHitsWeek = {
                        "series": ["Hits"],
                        "data": [[_week_day_0, _week_day_1, _week_day_2, _week_day_3, _week_day_4, _week_day_5, _week_day_6]],
                        "labels": ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                        "colours": [{ // default
                            backgroundColor: 'rgba(254, 191, 75, 1)',
                            pointBackgroundColor: 'rgba(59, 89, 152,1)',
                            borderColor: 'rgba(51,51,51,1)',
                            pointBorderColor: 'rgba(255,255,255,1)',
                            pointHoverBorderColor: 'rgba(255,255,255,1)'
                        }],
                        options: {
                            responsive: true,
                            legend: { display: true },
                            hover: {
                                mode: 'label'
                            },
                            scales: {
                                xAxes: [{
                                    display: true
                                }],
                                yAxes: [{
                                    display: true,
                                    ticks: {
                                        beginAtZero: true,
                                        steps: 1,
                                        stepValue: 1,
                                        max: 50
                                    }
                                }]
                            },
                            title: {
                                display: true,
                                text: 'Book hits per day'
                            }
                        }
                    };

                    //Week age chart
                    $scope.pieAgeWeekly = {
                        "series": ["Visit"],
                        "data": [[_18to23_Age, _24to29_Age, _30to35_Age, _36to41_Age, _42toPlus_Age]],
                        "labels": ["18 to 23", "24 to 29", "30 to 35", "36 to 41", "41 +"],
                        "colours": [{
                            fill: true,
                            backgroundColor: ['#d81b60', '#3f51b5', '#22b573', '#ffb83b', '#bc1dc1']
                        }],
                        options: {
                            responsive: true,
                            legend: { display: true },
                            hover: {
                                mode: 'label'
                            },
                            title: {
                                display: true,
                                text: 'Age'
                            }
                        }
                    };

                    //Week male and Female chart
                    $scope.dghnutWeeklylab = ["Male", "Female", "Others"];
                    $scope.dghnutWeeklydata = [male, female, others];
                    $scope.dghnutWeeklyCor = ['#388e3c', '#e53935', '#3f51b5'];
                    $scope.dghnutWeeklyOption = {
                        legend: { display: true },
                        responsive: true,
                        title: {
                            display: true,
                            text: 'Gender'
                        }
                    }
                }

                const from_date = moment().startOf('week');
                const to_date = moment().endOf('week');

                var weekStart = new Date(from_date), weekend = new Date(to_date);
                let dateZeroStart = `${weekStart.getFullYear()}-${("0" + (weekStart.getMonth() + 1)).slice(-2)}-${("0" + weekStart.getDate()).slice(-2)}T00:00:00.000Z`,
                    dateZeroEnd = `${weekend.getFullYear()}-${("0" + (weekend.getMonth() + 1)).slice(-2)}-${("0" + weekend.getDate()).slice(-2)}T00:00:00.000Z`;

                ChartForBooking.find({ filter: { where: { ownerId: $scope.userId, dateZero: { between: [dateZeroStart, dateZeroEnd] } } } }).$promise.then((res) => {
                    if (res && res.length) {
                        createWeekChart(res);
                    } else createWeekChart([]);
                })
            }

            $scope.callMonthAnaly = () => {

                let _18to23_Age = 0, _24to29_Age = 0, _30to35_Age = 0, _36to41_Age = 0,
                    _42toPlus_Age = 0, male = 0, female = 0, others = 0;

                let monthDayArray = [], monthDayArrayTxt = [],
                    monthstart = parseInt(new moment().startOf('month').format("D")),
                    monthend = parseInt(new moment().endOf("month").format("D"));

                let createAnly = (arg = []) => {
                    for (let i = monthstart; i <= monthend; i++) {
                        if (arg && arg.length == 0) { monthDayArray.push(0); }
                        else {
                            let val = arg.find((m) => m.date == i);
                            if (val) {
                                let { _00to01, _01to02, _02to03, _03to04, _04to05, _05to06, _06to07, _07to08, _08to09, _09to10, _10to11, _11to12
                                    , _12to13, _13to14, _14to15, _15to16, _16to17, _17to18, _18to19, _19to20, _20to21, _21to22, _22to23, _23to24 } = val;

                                let totalCnt = _00to01 || 0 + _01to02 || 0 + _02to03 || 0 + _03to04 || 0 + _04to05 || 0 + _05to06 || 0 + _06to07 || 0 + _07to08 || 0 + _08to09 || 0 + _09to10 || 0 + _10to11 || 0 + _11to12 || 0
                                    + _12to13 || 0 + _13to14 || 0 + _14to15 || 0 + _15to16 || 0 + _16to17 || 0 + _17to18 || 0 + _18to19 || 0 + _19to20 || 0 + _20to21 || 0 + _21to22 || 0 + _22to23 || 0 + _23to24 || 0;

                                monthDayArray.push(totalCnt || 0);


                                //Age count
                                _18to23_Age += val._18to23_Age;
                                _24to29_Age += val._24to29_Age;
                                _30to35_Age += val._30to35_Age;
                                _36to41_Age += val._36to41_Age;
                                _42toPlus_Age += val._42toPlus_Age;

                                //male and Female count
                                male += val.male;
                                female += val.female;
                                others += val.others;

                            } else monthDayArray.push(0);
                        }
                        if (i == 1 || i == 21 || i == 31) monthDayArrayTxt.push(`${i}st`);
                        else if (i == 2 || i == 22) monthDayArrayTxt.push(`${i}nd`);
                        else if (i == 3 || i == 23) monthDayArrayTxt.push(`${i}rd`);
                        else monthDayArrayTxt.push(`${i}th`);
                    }
                }

                setTimeout(function () {

                    let check = moment(new Date(), 'YYYY/MM/DD');
                    $scope.bookHitsMon = {
                        "series": [`${check.format('MMMM')} Hits`],
                        "data": [monthDayArray],
                        "labels": monthDayArrayTxt,
                        "colours": [{ // default
                            backgroundColor: 'rgba(254, 191, 75, 1)',
                            pointBackgroundColor: 'rgba(59, 89, 152,1)',
                            borderColor: 'rgba(51,51,51,1)',
                            pointBorderColor: 'rgba(255,255,255,1)',
                            pointHoverBorderColor: 'rgba(255,255,255,1)'
                        }],
                        options: {
                            responsive: true,
                            legend: { display: true },
                            hover: {
                                mode: 'label'
                            },
                            scales: {
                                xAxes: [{
                                    display: true
                                }],
                                yAxes: [{
                                    display: true,
                                    ticks: {
                                        beginAtZero: true,
                                        steps: 1,
                                        stepValue: 1,
                                        max: 50
                                    }
                                }]
                            },
                            title: {
                                display: true,
                                text: 'Book hits per month'
                            }
                        }
                    };

                    $scope.pieMonthlyAge = {
                        "series": ["Visit"],
                        "data": [[_18to23_Age, _24to29_Age, _30to35_Age, _36to41_Age, _42toPlus_Age]],
                        "labels": ["18 to 23", "24 to 29", "30 to 35", "36 to 41", "41 +"],
                        "colours": [{
                            fill: true,
                            backgroundColor: ['#d81b60', '#3f51b5', '#22b573', '#ffb83b', '#bc1dc1']
                        }],
                        options: {
                            responsive: true,
                            legend: { display: true },
                            hover: {
                                mode: 'label'
                            },
                            title: {
                                display: true,
                                text: 'Age'
                            }
                        }
                    };

                    $scope.dohntMonlab = ["Male", "Female", "Others"];
                    $scope.dohntMondata = [male, female, others];
                    $scope.dohntMoncol = ['#388e3c', '#e53935', '#3f51b5'];
                    $scope.dohntMonOpt = {
                        legend: { display: true },
                        responsive: true,
                        title: {
                            display: true,
                            text: 'Gender'
                        }
                    }
                }, 200)

                let currentY = parseInt(moment(new Date()).format("YYYY"));
                currentMonIn = parseInt(moment(new Date()).format("M"));
                monthstart = parseInt(new moment().startOf('month').format("D"));
                monthend = parseInt(new moment().endOf("month").format("D"));
                ChartForBooking.find({ filter: { where: { ownerId: $scope.userId, year: { eq: currentY }, month: { eq: currentMonIn }, date: { between: [monthstart, monthend] } } } })
                    .$promise.then((res) => {
                        if (res && res.length) {
                            createAnly(res);
                        } else createAnly([]);
                    });
            }

            $scope.callYearAnaly = () => {


                let callYear = (arg) => {
                    let _Jan = _Feb = _Mar = _Apr = _May = _Jun = _Jul = _Aug = _Sep = _Oct = _Nov = _Dec = 0,
                        _18to23_Age = _24to29_Age = _30to35_Age = _36to41_Age = _42toPlus_Age = male = female = others = 0;

                    for (let i = 1; i <= 12; i++) {
                        let data = arg.filter(m => m.month == i);
                        data.forEach(val => {
                            if (val) {

                                let { _00to01, _01to02, _02to03, _03to04, _04to05, _05to06, _06to07, _07to08, _08to09, _09to010, _10to11, _11to12, _12to13, _13to14, _14to15, _15to16, _16to17, _17to18, _18to19, _19to20, _20to21, _21to22, _22to23, _23to24 } = val;

                                let totalCnt = _00to01 || 0 + _01to02 || 0 + _02to03 || 0 + _03to04 || 0 + _04to05 || 0 + _05to06 || 0 + _06to07 || 0 + _07to08 || 0 + _08to09 || 0 + _09to010 || 0 + _10to11 || 0 + _11to12 || 0
                                    + _12to13 || 0 + _13to14 || 0 + _14to15 || 0 + _15to16 || 0 + _16to17 || 0 + _17to18 || 0 + _18to19 || 0 + _19to20 || 0 + _20to21 || 0 + _21to22 || 0 + _22to23 || 0 + _23to24 || 0;
                                if (i == 1) _Jan += totalCnt || 0; if (i == 2) _Feb += totalCnt || 0; if (i == 3) _Mar += totalCnt || 0;
                                if (i == 4) _Apr += totalCnt || 0; if (i == 5) _May += totalCnt || 0; if (i == 6) _Jun += totalCnt || 0;
                                if (i == 7) _Jul += totalCnt || 0; if (i == 8) _Aug += totalCnt || 0; if (i == 9) _Sep += totalCnt || 0;
                                if (i == 10) _Oct += totalCnt || 0; if (i == 11) _Nov += totalCnt || 0; if (i == 12) _Dec += totalCnt || 0;

                                _18to23_Age += val._18to23_Age;
                                _24to29_Age += val._24to29_Age;
                                _30to35_Age += val._30to35_Age;
                                _36to41_Age += val._36to41_Age;
                                _42toPlus_Age += val._42toPlus_Age;

                                male += val.male;
                                female += val.female;
                                others += val.others;
                            }
                        })
                    }

                    $scope.barYearly = {
                        "series": ["Hits"],
                        "data": [[_Jan, _Feb, _Mar, _Apr, _May, _Jun, _Jul, _Aug, _Sep, _Oct, _Nov, _Dec]],
                        "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                        "colours": [{ // default
                            backgroundColor: 'rgba(254, 191, 75, 1)',
                            pointBackgroundColor: 'rgba(59, 89, 152,1)',
                            borderColor: 'rgba(51,51,51,1)',
                            pointBorderColor: 'rgba(255,255,255,1)',
                            pointHoverBorderColor: 'rgba(255,255,255,1)'
                        }],
                        options: {
                            responsive: true,
                            legend: { display: true },
                            hover: {
                                mode: 'label'
                            },
                            scales: {
                                xAxes: [{
                                    display: true
                                }],
                                yAxes: [{
                                    display: true,
                                    ticks: {
                                        beginAtZero: true,
                                        steps: 1,
                                        stepValue: 1,
                                        max: 50
                                    }
                                }]
                            },
                            title: {
                                display: true,
                                text: 'Book hits per Year'
                            }
                        }
                    };


                    $scope.pieYearAge = {
                        "series": ["Visit"],
                        "data": [[_18to23_Age, _24to29_Age, _30to35_Age, _36to41_Age, _42toPlus_Age]],
                        "labels": ["18 to 23", "24 to 29", "30 to 35", "36 to 41", "41 +"],
                        "colours": [{
                            fill: true,
                            backgroundColor: ['#d81b60', '#3f51b5', '#22b573', '#ffb83b', '#bc1dc1']
                        }],
                        options: {
                            responsive: true,
                            legend: { display: true },
                            hover: {
                                mode: 'label'
                            },
                            title: {
                                display: true,
                                text: 'Age'
                            }
                        }
                    };

                    $scope.doghYelylas = ["Male", "Female", "Others"];
                    $scope.doghYelydata = [male, female, others];
                    $scope.doghYelyCol = ['#388e3c', '#e53935', '#3f51b5'];
                    $scope.doghYelyOpt = {
                        legend: { display: true },
                        responsive: true,
                        title: {
                            display: true,
                            text: 'Gender'
                        }
                    }
                }

                let currentYear = moment(new Date()).format("YYYY");

                ChartForBooking.find({ filter: { where: { ownerId: $scope.userId, year: currentYear } } }).$promise.then((res) => {
                    if (res && res.length) {
                        callYear(res);
                    } else callYear([]);
                })
            }

            $scope.runAnalytics = () => {
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.1/Chart.min.js';
                document.body.appendChild(script);
                $scope.callDailyAnaly();
                $scope.callWeekAnaly();
                $scope.callMonthAnaly();
                $scope.callYearAnaly();
            }

            $scope.loaderFun = () => {
                loader.visible();
                setTimeout(function () {
                    loader.hidden();
                }, 500);
            }

            $scope.BusinessSelected = (arg) => {
                $("#businessErr").text('');
                if (arg && $("#autocompleteBusiness").data('id')) {
                    arg = $("#autocompleteBusiness").data('id');
                    if ($("#businessSubmit").hasClass('businessSubmit')) {
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    }
                    if (arg != "select") {
                        $scope.userId = arg;
                        $rootScope.selectedVenue = { venueId: $scope.userId, ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                        localStorage.removeItem("selectedVenue");
                        localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val(), venueId: $scope.userId }));
                        $scope.runAnalytics();
                    }
                } else $("#businessErr").text('Please select the Business name');
            }


            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });


            if ($scope.userDetails.isAdmin == false) {
                $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                $("#autocompleteBusiness").attr('disabled', true);
                localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName, venueId: $scope.userDetails.id }));
                $scope.runAnalytics();
            }

            $scope.businessSelection = [];
            if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin && $rootScope.selectedVenue && $rootScope.selectedVenue.venueId) {
                $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                $scope.userId = $rootScope.selectedVenue.venueId;
                loader.visible()
                setTimeout(function () {
                    $scope.businessSelection = getAllVenues.get();
                    loader.hidden();
                }, 1500)
                $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.venueId)
                if ($("#businessSubmit").hasClass('businessSubmit')) {
                    $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                }
                $scope.runAnalytics();
            }

        }]);