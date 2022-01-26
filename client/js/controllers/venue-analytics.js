angular
    .module('app')
    .controller('venueAnalyticsCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'BusinessVisitCount', 'socket', 'VisitCount',
        function ($scope, $state, $rootScope, Business, $http, BusinessVisitCount, socket , VisitCount) {

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.isBusinessSelect = false;

          

            $scope.getBusinessName = () => {
                return $scope.businessDelection;
            };

            getBusinessDailyHits = (res = {}, visit = {}) => {

                let _00to01 = _01to02 = _02to03 = _03to04 = _04to05 = _05to06 = _06to07 = _07to08 = _08to09 = _09to010 = _10to11 = _11to12 =
                    _12to13 = _13to14 = _14to15 = _15to16 = _16to17 = _17to18 = _18to19 = _19to20 = _20to21 = _21to22 = _22to23 = _23to24 = 0;

                let _00to01_v = _01to02_v = _02to03_v = _03to04_v = _04to05_v = _05to06_v = _06to07_v = _07to08_v = _08to09_v = _09to010_v = _10to11_v =
                    _11to12_v = _12to13_v = _13to14_v = _14to15_v = _15to16_v = _16to17_v = _17to18_v = _18to19_v = _19to20_v =
                    _20to21_v = _21to22_v = _22to23_v = _23to24_v = 0;

                if (res) {
                    _00to01 = res._00to01 || 0; _01to02 = res._01to02 || 0; _02to03 = res._02to03 || 0; _03to04 = res._03to04 || 0; _04to05 = res._04to05 || 0;
                    _05to06 = res._05to06 || 0; _06to07 = res._06to07 || 0; _08to09 = res._08to09 || 0; _09to010 = res._09to010 || 0; _10to11 = res._10to11 || 0;
                    _11to12 = res._11to12 || 0; _12to13 = res._12to13 || 0; _13to14 = res._13to14 || 0; _14to15 = res._14to15 || 0; _15to16 = res._15to16 || 0;
                    _16to17 = res._16to17 || 0; _17to18 = res._17to18 || 0; _18to19 = res._18to19 || 0; _19to20 = res._19to20 || 0; _20to21 = res._20to21 || 0;
                    _21to22 = res._21to22 || 0; _22to23 = res._22to23 || 0; _23to24 = res._23to24 || 0;
                }
                if (visit) {
                    _00to01_v = visit._00to01 || 0; _01to02_v = visit._01to02 || 0; _02to03_v = visit._02to03 || 0; _03to04_v = visit._03to04 || 0;
                    _04to05_v = visit._04to05 || 0; _05to06_v = visit._05to06 || 0; _06to07_v = visit._06to07 || 0; _07to08_v = visit._07to08 || 0;
                    _08to09_v = visit._08to09 || 0; _09to010_v = visit._09to010 || 0; _10to11_v = visit._10to11 || 0; _11to12_v = visit._11to12 || 0;
                    _12to13_v = visit._12to13 || 0; _13to14_v = visit._13to14 || 0; _14to15_v = visit._14to15 || 0; _15to16_v = visit._15to16 || 0;
                    _16to17_v = visit._16to17 || 0; _17to18_v = visit._17to18 || 0; _18to19_v = visit._18to19 || 0; _19to20_v = visit._19to20 || 0;
                    _20to21_v = visit._20to21 || 0; _21to22_v = visit._21to22 || 0; _22to23_v = visit._22to23 || 0; _23to24_v = visit._23to24 || 0;
                }

                $scope.dailyBusinessHits = {
                    "series": ["Hits", "Conversions"],
                    "data": [[_00to01, _01to02, _02to03, _03to04, _04to05, _05to06, _06to07, _07to08, _08to09, _09to010, _10to11, _11to12,
                        _12to13, _13to14, _14to15, _15to16, _16to17, _17to18, _18to19, _19to20, _20to21, _21to22, _22to23, _23to24],
                    [_00to01_v, _01to02_v, _02to03_v, _03to04_v, _04to05_v, _05to06_v, _06to07_v, _07to08_v, _08to09_v, _09to010_v,
                        _10to11_v, _11to12_v, _12to13_v, _13to14_v, _14to15_v, _15to16_v, _16to17_v, _17to18_v, _18to19_v, _19to20_v,
                        _20to21_v, _21to22_v, _22to23_v, _23to24_v]],
                    "labels": ['00-01AM', '01-02AM', '02-03AM', '03-04AM', '04-05AM', '05-06AM', '06-07AM', '07-08AM', '08-09AM', '09-10AM', '10-11AM', '11-12PM',
                        '12-01PM', '01-02PM', '02-03PM', '03-04PM', '04-05PM', '05-06PM', '06-07PM', '07-08PM', '08-09PM', '09-10PM', '10-11PM', '11-12AM'],
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
                            text: 'Business Hits per hour'
                        }
                    }
                };


                 //Age Chart
                 let { _18to23_Age = 0, _24to29_Age = 0, _30to35_Age = 0, _36to41_Age = 0, _42toPlus_Age = 0 } = res;
                 var pieAgeDaily = {
                     "series": ["Visit"],
                     "data": [[_18to23_Age || 0, _24to29_Age || 0, _30to35_Age || 0, _36to41_Age || 0, _42toPlus_Age || 0]],
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
                let { male = 0, female = 0, others = 0 } = res;
                $scope.doughnutDailylabels = ["Male", "Female", "Others"];
                $scope.doughnutDailydata = [male || 0, female || 0, others || 0];
                $scope.doughnutDailyColor = ['#388e3c', '#e53935', '#3f51b5'];
                $scope.doughnutDailyoptions = {
                    legend: { display: true },
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Gender'
                    }
                }

                var newCnt = 0; var returning = 0;
                if (res) {
                    newCnt = res.new;
                    returning = res.Returning;
                }

                $scope.newReturnDailylabels = ["New", "Returning"];
                $scope.newReturnDailydata = [newCnt | 0, returning | 0];
                $scope.newReturnDailyColor = ['#c51162', '#ff9800'];
                $scope.newReturnDailyoptions = {
                    legend: { display: true },
                    responsive: true,
                    title: {
                        display: true,
                        text: 'New & Returning'
                    }
                }
            }
            getBusinessDailyHits();

            getBusinessWeeklyHits = (arg = []) => {

                let _week_day_0 = _week_day_1 = _week_day_2 = _week_day_3 = _week_day_4 = _week_day_5 = _week_day_6 = 0;
                let _18to23_Age = 0, _24to29_Age = 0, _30to35_Age = 0, _36to41_Age = 0, _42toPlus_Age = 0;
                let male = 0, female = 0, others = 0, newWeekCnt = 0, weekreturning = 0;

                if (arg && arg.length) {
                    arg.forEach(val => {

                        let day = new Date(val.dateZero);

                        let { _00to01, _01to02, _02to03, _03to04, _04to05, _05to06, _06to07, _07to08, _08to09, _09to010, _10to11, _11to12
                            , _12to13, _13to14, _14to15, _15to16, _16to17, _17to18, _18to19, _19to20, _20to21, _21to22, _22to23, _23to24 } = val;

                        let totalCnt = _00to01 || 0 + _01to02 || 0 + _02to03 || 0 + _03to04 || 0 + _04to05 || 0 + _05to06 || 0 + _06to07 || 0 + _07to08 || 0 + _08to09 || 0 + _09to010 || 0 + _10to11 || 0 + _11to12 || 0
                            + _12to13 || 0 + _13to14 || 0 + _14to15 || 0 + _15to16 || 0 + _16to17 || 0 + _17to18 || 0 + _18to19 || 0 + _19to20 || 0 + _20to21 || 0 + _21to22 || 0 + _22to23 || 0 + _23to24 || 0;

                        if (day.getDay() == 0) { _week_day_0 = totalCnt || 0 }
                        else if (day.getDay() == 1) { _week_day_1 = totalCnt || 0 }
                        else if (day.getDay() == 2) { _week_day_2 = totalCnt || 0 }
                        else if (day.getDay() == 3) { _week_day_3 = totalCnt || 0 }
                        else if (day.getDay() == 4) { _week_day_4 = totalCnt || 0 }
                        else if (day.getDay() == 5) { _week_day_5 = totalCnt || 0 }
                        else if (day.getDay() == 6) { _week_day_6 = totalCnt || 0 }

                         //Week Start 
                         _18to23_Age += val._18to23_Age || 0;
                         _24to29_Age += val._24to29_Age || 0;
                         _30to35_Age += val._30to35_Age || 0;
                         _36to41_Age += val._36to41_Age || 0;
                         _42toPlus_Age += val._42toPlus_Age || 0;
 
                         male += val.male || 0;
                         female += val.female || 0;
                         others += val.others || 0;
                         //WeekEnd
 
 
                         //start new & returning
                         newWeekCnt += val.new || 0;
                         weekreturning += val.Returning || 0;
                         //end new & returning

                    })
                }

                $scope.businessHitsWeekLive = {
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
                            text: 'Business Hits per Week'
                        }
                    }
                };

                 //Week age chart
                var pieAgeWeekly = {
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
                $scope.pieWeeklyAge = pieAgeWeekly;


                //Week male and Female chart
                $scope.doughnutWeeklylabels = ["Male", "Female", "Others"];
                $scope.doughnutWeeklydata = [male, female, others];
                $scope.doughnutWeekColor = ['#388e3c', '#e53935', '#3f51b5'];
                $scope.doughnutWeekoptions = {
                    legend: { display: true },
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Gender'
                    }
                }

                //New and Returning
                $scope.newReturnWeeklylabels = ["New", "Returning"];
                $scope.newReturnWeeklydata = [newWeekCnt | 0, weekreturning | 0];
                $scope.newReturnWeeklyColor = ['#c51162', '#ff9800'];
                $scope.newReturnWeeklyoptions = {
                    legend: { display: true },
                    responsive: true,
                    title: {
                        display: true,
                        text: 'New & Returning'
                    }
                }
            }
            getBusinessWeeklyHits();

            getBusinessMonthlyHits = (arg = []) => {

                let _18to23_Age = _24to29_Age = _30to35_Age = _36to41_Age = _42toPlus_Age = male = female = others = 0,
                newMonthlyCnt = 0, returningMonthlyCnt = 0;

                let monthDayArray = [], monthDayArrayTxt = [],
                    monthstart = parseInt(new moment().startOf('month').format("D")),
                    monthend = parseInt(new moment().endOf("month").format("D"));

                for (let i = monthstart; i <= monthend; i++) {
                    if (arg && arg.length == 0) { monthDayArray.push(0); }
                    else {
                        let val = arg.find((m) => m.date == i);
                        if (val) {
                            let { _00to01, _01to02, _02to03, _03to04, _04to05, _05to06, _06to07, _07to08, _08to09, _09to010, _10to11, _11to12
                                , _12to13, _13to14, _14to15, _15to16, _16to17, _17to18, _18to19, _19to20, _20to21, _21to22, _22to23, _23to24 } = val;
                            let totalCnt = _00to01 || 0 + _01to02 || 0 + _02to03 || 0 + _03to04 || 0 + _04to05 || 0 + _05to06 || 0 + _06to07 || 0 + _07to08 || 0 + _08to09 || 0 + _09to010 || 0 + _10to11 || 0 + _11to12 || 0
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

                            //New and returning count
                            newMonthlyCnt += val.new;
                            returningMonthlyCnt  += val.Returning;

                        } else monthDayArray.push(0);
                    }
                    if (i == 1 || i == 21 || i == 31) monthDayArrayTxt.push(`${i}st`);
                    else if (i == 2 || i == 22) monthDayArrayTxt.push(`${i}nd`);
                    else if (i == 3 || i == 23) monthDayArrayTxt.push(`${i}rd`);
                    else monthDayArrayTxt.push(`${i}th`);
                }

                $scope.businessHitsMonthlyLive = {
                    "series": ["Hits"],
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
                            text: 'Business Hits per month'
                        }
                    }
                };


                var pieMonthly = {
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
                $scope.pieMonthlyAge = pieMonthly;

                $scope.doughnutMonthlylabels = ["Male", "Female", "Others"];
                $scope.doughnutMonthlydata = [male, female, others];
                $scope.doughnutMonthlyColor = ['#388e3c', '#e53935', '#3f51b5'];
                $scope.doughnutMonthlyoptions = {
                    legend: { display: true },
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Gender'
                    }
                }

                $scope.newReturnMonthlylabels = ["New", "Returning"];
                $scope.newReturnMonthlydata = [newMonthlyCnt | 0, returningMonthlyCnt | 0];
                $scope.newReturnMonthlyColor = ['#c51162', '#ff9800'];
                $scope.newReturnMonthlyoptions = {
                    legend: { display: true },
                    responsive: true,
                    title: {
                        display: true,
                        text: 'New & Returning'
                    }
                }
            }

            getBusinessMonthlyHits();

            let yearlyCurrentYear;
           let  getBusinessyearlyChart = (arg = []) => {

                let _Jan = _Feb = _Mar = _Apr = _May = _Jun = _Jul = _Aug = _Sep = _Oct = _Nov = _Dec = 0,
                _18to23_Age = _24to29_Age = _30to35_Age = _36to41_Age = _42toPlus_Age = male = female = others = 0,
                newYearlyCnt = 0, returningYearlyCnt = 0;

                for (let i = 1; i <= 12; i++) {
                    let data = arg.filter(m => m.month == i);
                    data.forEach(val => {
                        if (val) {

                            let { _00to01, _01to02, _02to03, _03to04, _04to05, _05to06, _06to07, _07to08, _08to09, _09to010, _10to11, _11to12, _12to13, _13to14, _14to15, _15to16, _16to17, _17to18, _18to19, _19to20, _20to21, _21to22, _22to23, _23to24 } = val;

                            let totalCnt = _00to01 || 0 + _01to02 || 0 + _02to03 || 0 + _03to04 || 0 + _04to05  || 0+ _05to06 || 0 + _06to07 || 0 + _07to08 || 0 + _08to09 || 0 + _09to010 || 0 + _10to11 || 0 + _11to12 || 0
                                + _12to13 || 0 + _13to14 || 0 + _14to15 || 0 + _15to16 || 0 + _16to17 || 0 + _17to18 || 0 + _18to19 || 0 + _19to20 || 0 + _20to21 || 0 + _21to22 || 0 + _22to23 || 0 + _23to24 || 0;
                            if (i == 1) _Jan += totalCnt || 0; if (i == 2) _Feb += totalCnt || 0; if (i == 3) _Mar += totalCnt || 0;
                            if (i == 4) _Apr += totalCnt || 0; if (i == 5) _May += totalCnt || 0; if (i == 6) _Jun += totalCnt || 0 ;
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


                            newYearlyCnt += val.new;
                            returningYearlyCnt += val.Returning;
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
                            text: 'Business Hits per Year'
                        }
                    }
                };

                
                var pieYearly = {
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
                $scope.pieYearAge = pieYearly;

                $scope.doughnutYearlylabels = ["Male", "Female", "Others"];
                $scope.doughnutYearlydata = [male, female, others];
                $scope.doughnutYearlyColor = ['#388e3c', '#e53935', '#3f51b5'];
                $scope.doughnutYearlyoptions = {
                    legend: { display: true },
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Gender'
                    }
                }

                $scope.newReturnYearlylabels = ["New", "Returning"];
                $scope.newReturnYearlydata = [newYearlyCnt | 0, returningYearlyCnt | 0];
                $scope.newReturnYearlyColor = ['#c51162', '#ff9800'];
                $scope.newReturnYearlyoptions = {
                    legend: { display: true },
                    responsive: true,
                    title: {
                        display: true,
                        text: 'New & Returning'
                    }
                }
            }
            getBusinessyearlyChart();

            let getBusinessHitsFromModel = () => {
                //daily chart
                let newdate = new Date();
                 let dateZero = `${newdate.getFullYear()}-${("0" + (newdate.getMonth() + 1)).slice(-2)}-${("0" + newdate.getDate()).slice(-2)}T00:00:00.000Z`;
                BusinessVisitCount.find({ filter: { where: { ownerId: $scope.userId, dateZero } } })
                    .$promise.then((res) => {
                        VisitCount.find({ filter: { where: { ownerId: $scope.userId, dateZero } } })
                            .$promise.then((visitRes) => {
                                if(res && res.length && visitRes && visitRes.length)  getBusinessDailyHits(res[0], visitRes[0]);
                                else getBusinessDailyHits(res[0]);
                            });
                    });

                //weekly chart
                const from_date = moment().startOf('week');
                const to_date = moment().endOf('week');

                var weekStart = new Date(from_date), weekend = new Date(to_date);
                let dateZeroStart = `${weekStart.getFullYear()}-${("0" + (weekStart.getMonth() + 1)).slice(-2)}-${("0" + weekStart.getDate()).slice(-2)}T00:00:00.000Z`,
                    dateZeroEnd = `${weekend.getFullYear()}-${("0" + (weekend.getMonth() + 1)).slice(-2)}-${("0" + weekend.getDate()).slice(-2)}T00:00:00.000Z`;



                BusinessVisitCount.find({ filter: { where: { ownerId: $scope.userId, dateZero: { between: [dateZeroStart, dateZeroEnd] } } } })
                    .$promise.then((res) => {
                        if (res && res.length) {
                            getBusinessWeeklyHits(res);
                        } else getBusinessWeeklyHits();
                    });


                let currentMonth = moment(new Date()).format("MMMM"),
                    currentYear = moment(new Date()).format("YYYY"),
                    monthstart = new moment().startOf('month').format("D"),
                    monthend = new moment().endOf("month").format("D"),
                    currentMonthIndex = moment(new Date()).format("M");
                currentYear = parseInt(currentYear);
                currentMonthIndex = parseInt(currentMonthIndex);
                monthstart = parseInt(monthstart);
                monthend = parseInt(monthend);
                BusinessVisitCount.find({ filter: { where: { ownerId: $scope.userId, year: { eq: currentYear }, month: { eq: currentMonthIndex }, date: { between: [monthstart, monthend] } } } })
                    .$promise.then((res) => {
                        if (res && res.length) {
                            getBusinessMonthlyHits(res);
                        } else getBusinessMonthlyHits([]);
                    });


                BusinessVisitCount.find({ filter: { where: { ownerId: $scope.userId, year: currentYear } } })
                    .$promise.then((res) => {
                        if (res && res.length) {
                            getBusinessyearlyChart(res);
                        } else getBusinessyearlyChart();
                    });

            }


            $scope.BusinessSelected = (arg) => {
                $("#businessErr").text('');
                if (arg && arg == 'analytics' && $("#autocompleteBusiness").data('id')) {
                    arg = $("#autocompleteBusiness").data('id');
                    if ($("#businessSubmit").hasClass('businessSubmit')) {
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    }
                    if (arg != "select") {
                        $scope.isBusinessSelect = true;
                        $scope.userId = arg;
                        $rootScope.selectedVenue = { venueId: $scope.userId,ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                        localStorage.removeItem("selectedVenue");
                        localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() , venueId: $scope.userId }));
                    }
                    getBusinessHitsFromModel();
                } else $("#businessErr").text('Please select the Business name');
            }

           

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if(!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display : 'none' });

            if (!$scope.userDetails.isAdmin) {
                $("#businessSubmit").css({ display: 'none' });
                $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                $("#autocompleteBusiness").attr('disabled', true);
                localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
                getBusinessHitsFromModel();
            }

            if ($scope.userDetails.isAdmin) {
                $scope.isBusinessSelect = true;
                Business.find({ filter: { where: { status: "active" }, "fields": ["businessName", "id", "email"] } }).$promise.then((res) => {
                    $scope.businessDelection = res;
                });
                if(localStorage.getItem("selectedVenue")) {
                    $rootScope.selectedVenue = JSON.parse(localStorage.getItem("selectedVenue"));
                } else {
                    $scope.userId = $scope.userDetails.id;
                }
                if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId) {
                    $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
                    $scope.userId = $rootScope.selectedVenue.venueId;
                    $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.venueId)
                    if ($("#businessSubmit").hasClass('businessSubmit')) {
                        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
                    }
                    getBusinessHitsFromModel();
                }
            }
        }]);