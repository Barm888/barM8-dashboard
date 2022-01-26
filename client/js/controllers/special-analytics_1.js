angular
    .module('app')
    .controller('specialAnalyticsCtl', ['$scope', '$state', '$rootScope', 'Business', '$http', 'Sports', 'socket', 'loader', '$filter', 'DailySpecialCategory', 'DailySpecial', 'AllCategoryChart', 'DailySpecial', 'ExclusiveOffer', 'CouponDate', 'HappyHourDashDay', 'ChartForExclusiveOffer',
        function ($scope, $state, $rootScope, Business, $http, Sports, socket, loader, $filter, DailySpecialCategory, DailySpecial, AllCategoryChart, DailySpecial, ExclusiveOffer, CouponDate, HappyHourDashDay, ChartForExclusiveOffer) {


            Date.prototype.diff = function (to) {
                return Math.abs(Math.floor(to.getTime() / (3600 * 24 * 1000)) - Math.floor(this.getTime() / (3600 * 24 * 1000)))
            }

            let groupBy = (list, props) => {
                return list.reduce((a, b) => {
                    (a[b[props]] = a[b[props]] || []).push(b);
                    return a;
                }, {});
            }

            $(".wrapper").css({ height: '100vh' });

            $scope.happyHourCategories = ["Happy Hour", "Beer", "Wine", "Cocktail", "Spirit", "Cider"];

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            $scope.getBusinessName = () => {
                return $scope.businessDelection;
            };

            $scope.visibleDailyChart = false;
            $scope.setChartdata = (arg = [], sDateArg, eDateArg) => {

                $scope.setMulValues = arg;

                let _00to01 = 0, _01to02 = 0, _02to03 = 0, _03to04 = 0, _04to05 = 0, _05to06 = 0, _06to07 = 0, _07to08 = 0, _08to09 = 0, _09to10 = 0, _10to11 = 0, _11to12 = 0,
                    _12to13 = 0, _13to14 = 0, _14to15 = 0, _15to16 = 0, _16to17 = 0, _17to18 = 0, _18to19 = 0, _19to20 = 0, _20to21 = 0, _21to22 = 0, _22to23 = 0, _23to24 = 0, _18to23_Age = 0, _24to29_Age = 0, _30to35_Age = 0, _36to41_Age = 0, _42toPlus_Age = 0, newCnt = 0, returning = 0, male = 0, female = 0, others = 0;

                let dataFor = [], labelsFor = [];

                let fddate = new Date(sDateArg).diff(new Date(eDateArg));

                $scope.mulDateSelected = false;

                if (fddate >= 1) $scope.mulDateSelected = true;

                let i = 0;
                for (var day = new Date(sDateArg); day <= new Date(eDateArg); day.setDate(day.getDate() + 1)) {

                    i = i + 1;
                    let dayCntData = 0;

                    let data = arg.find(m => m.date == day.getDate());

                    if (data) {
                        dayCntData = data._00to01 + data._01to02 + data._02to03 + data._03to04 + data._04to05 + data._05to06 +
                            data._06to07 + data._07to08 + data._08to09 + data._09to10 + data._10to11 + data._11to12 + data._12to13 + data._13to14 + data._14to15 + data._15to16 + data._16to17 + data._17to18 + data._18to19 + data._19to20 + data._20to21 + data._21to22 + data._22to23 + data._23to24;
                    }

                    dataFor.push(dayCntData);

                    labelsFor.push(`${("0" + day.getDate()).slice(-2)} - ${['Sun', 'Mon', 'Tues', 'Wed', 'Thrus', 'Fri', 'Sat'][day.getDay()]}`);

                    $('#special-anly-daily').remove();
                    $('#special-anly').append('<canvas height="80" id="special-anly-daily"><canvas>');

                    if (data) {

                        // if ($scope.mulDateSelected) {
                        //     _00to01 = 0, _01to02 = 0, _02to03 = 0, _03to04 = 0, _04to05 = 0,
                        //         _05to06 = 0, _06to07 = 0, _07to08 = 0, _08to09 = 0, _09to10 = 0, _10to11 = 0, _11to12 = 0,
                        //         _12to13 = 0, _13to14 = 0, _14to15 = 0, _15to16 = 0, _16to17 = 0,
                        //         _17to18 = 0, _18to19 = 0, _19to20 = 0, _20to21 = 0, _21to22 = 0, _22to23 = 0, _23to24 = 0;
                        // }

                        // _00to01 += data._00to01 || 0; _01to02 += data._01to02 || 0; _02to03 += data._02to03 || 0; _03to04 += data._03to04 || 0;
                        // _04to05 += data._04to05 || 0; _05to06 += data._05to06 || 0; _06to07 += data._06to07 || 0; _07to08 += data._07to08 || 0;
                        // _08to09 += data._08to09 || 0; _09to10 += data._09to10 || 0; _10to11 += data._10to11 || 0; _11to12 += data._11to12 || 0;
                        // _12to13 += data._12to13 || 0; _13to14 += data._13to14 || 0; _14to15 += data._14to15 || 0; _15to16 += data._15to16 || 0;
                        // _16to17 += data._16to17 || 0; _17to18 += data._17to18 || 0; _18to19 += data._18to19 || 0; _19to20 += data._19to20 || 0;
                        // _20to21 += data._20to21 || 0; _21to22 += data._21to22 || 0; _22to23 += data._22to23 || 0; _23to24 += data._23to24 || 0;


                        // if ($scope.mulDateSelected && i == 1) {
                        //     _18to23_Age += data._18to23_Age || 0; _24to29_Age += data._24to29_Age || 0;
                        //     _30to35_Age += data._30to35_Age || 0; _36to41_Age += data._36to41_Age || 0; _42toPlus_Age += data._42toPlus_Age || 0;
                        //     newCnt += data.new || 0; returning += data.returning || 0; male += data.male || 0;
                        //     female += data.female || 0; others += data.others || 0;
                        // } else if ($scope.mulDateSelected == false) {
                        //     _18to23_Age += data._18to23_Age || 0; _24to29_Age += data._24to29_Age || 0;
                        //     _30to35_Age += data._30to35_Age || 0; _36to41_Age += data._36to41_Age || 0; _42toPlus_Age += data._42toPlus_Age || 0;
                        //     newCnt += data.new || 0; returning += data.returning || 0; male += data.male || 0;
                        //     female += data.female || 0; others += data.others || 0;
                        // }



                    }

                }

                $scope.startAndEndDiff = $scope.startAndEndDiff || 0;
                let datas = [], labels = [];
                let chattxt = 'Day';
                $scope.visibleDailyChart = false;

                new Chart(document.getElementById("special-anly-daily"), {
                    type: 'bar',
                    data: {
                        labels: labelsFor,
                        datasets: [{
                            label: "View",
                            type: "bar",
                            stack: "sensitivity",
                            backgroundColor: 'rgba(254, 191, 75, 1)',
                            pointBackgroundColor: 'rgba(59, 89, 152,1)',
                            borderColor: 'rgba(51,51,51,1)',
                            pointBorderColor: 'rgba(255,255,255,1)',
                            pointHoverBorderColor: 'rgba(255,255,255,1)',
                            borderWidth: 2,
                            data: dataFor,
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
                                    max: 40 //max value for the chart is 60
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

                setTimeout(function () { loader.hidden() }, 300);

                console.log(dataFor, labelsFor);


                // if (fddate == 0) {
                //     $scope.visibleDailyChart = true;
                //     chattxt = 'Hour';
                //     datas = [[_00to01, _01to02, _02to03, _03to04, _04to05, _05to06, _06to07, _07to08, _08to09, _09to10, _10to11, _11to12,
                //         _12to13, _13to14, _14to15, _15to16, _16to17, _17to18, _18to19, _19to20, _20to21, _21to22, _22to23, _23to24]];
                //     labels = ['00-01AM', '01-02AM', '02-03AM', '03-04AM', '04-05AM', '05-06AM', '06-07AM', '07-08AM', '08-09AM', '09-10AM', '10-11AM', '11-12AM',
                //         '12-01PM', '01-02PM', '02-03PM', '03-04PM', '04-05PM', '05-06PM', '06-07PM', '07-08PM', '08-09PM', '09-10PM', '10-11PM', '11-12AM'];
                // } else if (fddate >= 10) {
                //     datas = [dataFor];
                //     labels = labelsFor;
                //     $scope.visibleDailyChart = true;
                // }
                // else {
                //     datas = [dataFor];
                //     labels = labelsFor;
                // }

                // let ageGChart = () => {

                //     $('#ageChart').remove();
                //     $('#ageChartDrinksDaily').append('<canvas id="ageChart"><canvas>');

                //     new Chart(document.getElementById("ageChart"), {
                //         type: 'pie',
                //         data: {
                //             labels: ["18 to 23", "24 to 29", "30 to 35", "36 to 41", "41 +"],
                //             datasets: [
                //                 {
                //                     data: [_18to23_Age, _24to29_Age, _30to35_Age, _36to41_Age, _42toPlus_Age],
                //                     backgroundColor: ['#d81b60', '#3f51b5', '#22b573', '#ffb83b', '#bc1dc1']
                //                 }]
                //         },
                //         options: {
                //             title: {
                //                 display: true,
                //                 text: 'Age'
                //             },
                //             plugins: {
                //                 datalabels: {
                //                     display: true,
                //                     align: 'bottom',
                //                     backgroundColor: '#ccc',
                //                     borderRadius: 3,
                //                     font: {
                //                         size: 18,
                //                     }
                //                 },
                //             }
                //         }
                //     });

                //     $('#MaleAndfemaleChart').remove();
                //     $('#malefemaleDrinksDaily').append('<canvas id="MaleAndfemaleChart"><canvas>');

                //     new Chart(document.getElementById("MaleAndfemaleChart"), {
                //         type: 'doughnut',
                //         data: {
                //             labels: ["Male", "Female", "Others"],
                //             datasets: [{
                //                 data: [male, female, others],
                //                 backgroundColor: ['#388e3c', '#e53935', '#3f51b5']
                //             }]
                //         },
                //         options: {
                //             title: {
                //                 display: true,
                //                 text: 'Gender'
                //             },
                //             plugins: {
                //                 datalabels: {
                //                     display: true,
                //                     backgroundColor: '#ccc',
                //                     borderRadius: 3,
                //                     font: {
                //                         color: 'red',
                //                         weight: 'bold',
                //                     }
                //                 },
                //                 doughnutlabel: {
                //                     labels: [{
                //                         text: '550',
                //                         font: {
                //                             size: 20,
                //                             weight: 'bold'
                //                         }
                //                     }, {
                //                         text: 'total'
                //                     }]
                //                 }
                //             }
                //         }
                //     });
                // }
                // ageGChart();


                // var barHourAndDayLive = {
                //     "series": [`${$scope.selectedItem.name}`], data: datas, labels,
                //     "colours": [{ // default
                //         backgroundColor: 'rgba(254, 191, 75, 1)',
                //         pointBackgroundColor: 'rgba(59, 89, 152,1)',
                //         borderColor: 'rgba(51,51,51,1)',
                //         pointBorderColor: 'rgba(255,255,255,1)',
                //         pointHoverBorderColor: 'rgba(255,255,255,1)'
                //     }],
                //     options: {
                //         onClick: function (e) {

                //             if (e && this.getElementsAtEvent(e)[0] && this.getElementsAtEvent(e)[0]._model && this.getElementsAtEvent(e)[0]._model.label) {
                //                 var activePointLabel = this.getElementsAtEvent(e)[0]._model.label;

                //                 if (activePointLabel) {
                //                     activePointLabel = activePointLabel.replace(/\s/g, '');
                //                     activePointLabel = activePointLabel.split('-');
                //                     let cdAte = activePointLabel[0].replace(/\b0/g, '');
                //                     cdAte = Number(cdAte);
                //                     let getdatVa = $scope.setMulValues.find(m => m.date == cdAte);

                //                     if (getdatVa) {

                //                         _18to23_Age = 0; _24to29_Age = 0; _30to35_Age = 0;
                //                         _36to41_Age = 0; _42toPlus_Age = 0;
                //                         male = 0; female = 0; others = 0;

                //                         _18to23_Age = getdatVa._18to23_Age;
                //                         _24to29_Age = getdatVa._24to29_Age;
                //                         _30to35_Age = getdatVa._30to35_Age;
                //                         _36to41_Age = getdatVa._36to41_Age;
                //                         _42toPlus_Age = getdatVa._42toPlus_Age;

                //                         male = getdatVa.male;
                //                         female = getdatVa.female;
                //                         others = getdatVa.others;

                //                         ageGChart();
                //                     }
                //                 }

                //             }
                //         },
                //         size: {
                //             height: 200,
                //             width: 400
                //         },
                //         hover: {
                //             mode: 'label'
                //         },
                //         scales: {
                //             xAxes: [{
                //                 display: true
                //             }],
                //             yAxes: [{
                //                 display: true,
                //                 ticks: {
                //                     beginAtZero: true,
                //                     steps: 1,
                //                     stepValue: 1,
                //                     max: 20
                //                 }
                //             }]
                //         },
                //         title: {
                //             display: true,
                //             text: `${$scope.selectedItem.name} Hits Per ${chattxt}`
                //         }
                //     }
                // };
                // $scope.barHDayLiveChart = barHourAndDayLive;


                setTimeout(function () { loader.hidden() }, 500);

            }


            $scope.setChartExcludata = (arg = [], sDateArg, eDateArg) => {

                $(".wrapper").css({ height: '65rem' });

                let _00to01_v = 0, _01to02_v = 0, _02to03_v = 0, _03to04_v = 0, _04to05_v = 0, _05to06_v = 0,
                    _06to07_v = 0, _07to08_v = 0, _08to09_v = 0, _09to10_v = 0, _10to11_v = 0, _11to12_v = 0, _12to13_v = 0,
                    _13to14_v = 0, _14to15_v = 0, _15to16_v = 0, _16to17_v = 0, _17to18_v = 0, _18to19_v = 0,
                    _19to20_v = 0, _20to21_v = 0, _21to22_v = 0, _22to23_v = 0, _23to24_v = 0;


                let _00to01_c = 0, _01to02_c = 0, _02to03_c = 0, _03to04_c = 0, _04to05_c = 0, _05to06_c = 0, _06to07_c = 0,
                    _07to08_c = 0, _08to09_c = 0, _09to10_c = 0, _10to11_c = 0, _11to12_c = 0, _12to13_c = 0, _13to14_c = 0,
                    _14to15_c = 0, _15to16_c = 0, _16to17_c = 0, _17to18_c = 0, _18to19_c = 0, _19to20_c = 0, _20to21_c = 0,
                    _21to22_c = 0, _22to23_c = 0, _23to24_c = 0;


                let _00to01_r = 0, _01to02_r = 0, _02to03_r = 0, _03to04_r = 0, _04to05_r = 0, _05to06_r = 0, _06to07_r = 0,
                    _07to08_r = 0, _08to09_r = 0, _09to010_r = 0, _10to11_r = 0, _11to12_r = 0, _12to13_r = 0, _13to14_r = 0,
                    _14to15_r = 0, _15to16_r = 0, _16to17_r = 0, _17to18_r = 0, _18to19_r = 0, _19to20_r = 0,
                    _20to21_r = 0, _21to22_r = 0, _22to23_r = 0, _23to24_r = 0;


                let _18to23_Age = 0, _24to29_Age = 0, _30to35_Age = 0, _36to41_Age = 0, _42toPlus_Age = 0;

                let newCnt = 0, returning = 0, male = 0, female = 0, others = 0;


                let fddate = new Date(sDateArg).diff(new Date(eDateArg));

                $scope.mulDateSelected = false;

                if (fddate >= 1) $scope.mulDateSelected = true;

                let dataForR = [];
                let dataForV = [];
                let dataForC = [];
                let labelsFor = [];

                for (var day = new Date(sDateArg); day <= new Date(eDateArg); day.setDate(day.getDate() + 1)) {


                    let data = arg.find(m => m.date == day.getDate());

                    if (fddate >= 1) {
                        _00to01_v = 0, _01to02_v = 0, _02to03_v = 0, _03to04_v = 0, _04to05_v = 0, _05to06_v = 0,
                            _06to07_v = 0, _07to08_v = 0, _08to09_v = 0, _09to10_v = 0, _10to11_v = 0, _11to12_v = 0, _12to13_v = 0,
                            _13to14_v = 0, _14to15_v = 0, _15to16_v = 0, _16to17_v = 0, _17to18_v = 0, _18to19_v = 0,
                            _19to20_v = 0, _20to21_v = 0, _21to22_v = 0, _22to23_v = 0, _23to24_v = 0;


                        _00to01_c = 0, _01to02_c = 0, _02to03_c = 0, _03to04_c = 0, _04to05_c = 0, _05to06_c = 0, _06to07_c = 0,
                            _07to08_c = 0, _08to09_c = 0, _09to10_c = 0, _10to11_c = 0, _11to12_c = 0, _12to13_c = 0, _13to14_c = 0,
                            _14to15_c = 0, _15to16_c = 0, _16to17_c = 0, _17to18_c = 0, _18to19_c = 0, _19to20_c = 0, _20to21_c = 0,
                            _21to22_c = 0, _22to23_c = 0, _23to24_c = 0;


                        _00to01_r = 0, _01to02_r = 0, _02to03_r = 0, _03to04_r = 0, _04to05_r = 0, _05to06_r = 0, _06to07_r = 0,
                            _07to08_r = 0, _08to09_r = 0, _09to010_r = 0, _10to11_r = 0, _11to12_r = 0, _12to13_r = 0, _13to14_r = 0,
                            _14to15_r = 0, _15to16_r = 0, _16to17_r = 0, _17to18_r = 0, _18to19_r = 0, _19to20_r = 0,
                            _20to21_r = 0, _21to22_r = 0, _22to23_r = 0, _23to24_r = 0;
                    }


                    if (data) {

                        _00to01_v += data._00to01.view || 0; _01to02_v += data._01to02.view || 0; _02to03_v += data._02to03.view || 0;
                        _03to04_v += data._03to04.view || 0; _04to05_v += data._04to05.view || 0; _05to06_v += data._05to06.view || 0;
                        _06to07_v += data._06to07.view || 0; _07to08_v += data._07to08.view || 0; _08to09_v += data._08to09.view || 0;
                        _09to10_v += data._09to10.view || 0; _10to11_v += data._10to11.view || 0; _11to12_v += data._11to12.view || 0;
                        _12to13_v += data._12to13.view || 0; _13to14_v += data._13to14.view || 0; _14to15_v += data._14to15.view || 0;
                        _15to16_v += data._15to16.view || 0; _16to17_v += data._16to17.view || 0; _17to18_v += data._17to18.view || 0;
                        _18to19_v += data._18to19.view || 0; _19to20_v += data._19to20.view || 0; _20to21_v += data._20to21.view || 0;
                        _21to22_v += data._21to22.view || 0; _22to23_v += data._22to23.view || 0; _23to24_v += data._23to24.view || 0;


                        _00to01_c = data._00to01.claim || 0, _01to02_c = data._01to02.claim || 0, _02to03_c = data._02to03.claim || 0,
                            _03to04_c = data._03to04.claim || 0, _04to05_c = data._04to05.claim || 0, _05to06_c = data._05to06.claim || 0,
                            _06to07_c = data._06to07.claim || 0, _07to08_c = data._07to08.claim || 0, _08to09_c = data._08to09.claim || 0,
                            _09to10_c = data._09to10.claim || 0, _10to11_c = data._10to11.claim || 0, _11to12_c = data._11to12.claim || 0,
                            _12to13_c = data._12to13.claim || 0, _13to14_c = data._13to14.claim || 0, _14to15_c = data._14to15.claim || 0,
                            _15to16_c = data._15to16.claim || 0, _16to17_c = data._16to17.claim || 0, _17to18_c = data._17to18.claim || 0,
                            _18to19_c = data._18to19.claim || 0, _19to20_c = data._19to20.claim || 0, _20to21_c = data._20to21.claim || 0,
                            _21to22_c = data._21to22.claim || 0, _22to23_c = data._22to23.claim || 0, _23to24_c = data._23to24.claim || 0;

                        _00to01_r = data._00to01.redeem || 0, _01to02_r = data._01to02.redeem || 0, _02to03_r = data._02to03.redeem || 0,
                            _03to04_r = data._03to04.redeem || 0, _04to05_r = data._04to05.redeem || 0, _05to06_r = data._05to06.redeem || 0,
                            _06to07_r = data._06to07.redeem || 0, _07to08_r = data._07to08.redeem || 0, _08to09_r = data._08to09.redeem || 0,
                            _09to10_r = data._09to10.redeem || 0, _10to11_r = data._10to11.redeem || 0, _11to12_r = data._11to12.redeem || 0,
                            _12to13_r = data._12to13.redeem || 0, _13to14_r = data._13to14.redeem || 0, _14to15_r = data._14to15.redeem || 0,
                            _15to16_r = data._15to16.redeem || 0, _16to17_r = data._16to17.redeem || 0, _17to18_r = data._17to18.redeem || 0,
                            _18to19_r = data._18to19.redeem || 0, _19to20_r = data._19to20.redeem || 0, _20to21_r = data._20to21.redeem || 0,
                            _21to22_r = data._21to22.redeem || 0, _22to23_r = data._22to23.redeem || 0, _23to24_r = data._23to24.redeem || 0;


                        _18to23_Age += data._18to23_Age || 0; _24to29_Age += data._24to29_Age || 0;
                        _30to35_Age += data._30to35_Age || 0; _36to41_Age += data._36to41_Age || 0; _42toPlus_Age += data._42toPlus_Age || 0;
                        newCnt += data.new || 0; returning += data.returning || 0; male += data.male || 0;
                        female += data.female || 0; others += data.others || 0;
                    }

                    dataForR.push(_00to01_r + _01to02_r + _02to03_r + _03to04_r + _04to05_r + _05to06_r +
                        _06to07_r + _07to08_r + _08to09_r + _12to13_r + _13to14_r + _14to15_r +
                        _15to16_r + _16to17_r + _17to18_r + _18to19_r + _19to20_r + _20to21_r + _21to22_r + _22to23_r + _23to24_r);
                    dataForV.push(_00to01_v + _01to02_v + _02to03_v + _03to04_v + _04to05_v + _05to06_v +
                        _06to07_v + _07to08_v + _08to09_v + _12to13_v + _13to14_v + _14to15_v +
                        _15to16_v + _16to17_v + _17to18_v + _18to19_v + _19to20_v + _20to21_v + _21to22_v + _22to23_v + _23to24_v);
                    dataForC.push(_00to01_c + _01to02_c + _02to03_c + _03to04_c + _04to05_c + _05to06_c +
                        _06to07_c + _07to08_c + _08to09_c + _12to13_c + _13to14_c + _14to15_c +
                        _15to16_c + _16to17_c + _17to18_c + _18to19_c + _19to20_c + _20to21_c + _21to22_c + _22to23_c + _23to24_c);


                    labelsFor.push(`${("0" + day.getDate()).slice(-2)}-${['Sun', 'Mon', 'Tues', 'Wed', 'Thrus', 'Fri', 'Sat'][day.getDay()]}`);
                }




                $scope.visibleDailyChart = false;
                if (fddate == 0) {
                    $scope.visibleDailyChart = true;
                    chattxt = 'Hour';
                    dataForR = [_00to01_r, _01to02_r, _02to03_r, _03to04_r, _04to05_r, _05to06_r, _06to07_r,
                        _07to08_r, _08to09_r, _09to010_r, _10to11_r, _11to12_r, _12to13_r, _13to14_r,
                        _14to15_r, _15to16_r, _16to17_r, _17to18_r, _18to19_r, _19to20_r,
                        _20to21_r, _21to22_r, _22to23_r, _23to24_r];
                    dataForV = [_00to01_v, _01to02_v, _02to03_v, _03to04_v, _04to05_v, _05to06_v,
                        _06to07_v, _07to08_v, _08to09_v, _09to10_v, _10to11_v, _11to12_v, _12to13_v,
                        _13to14_v, _14to15_v, _15to16_v, _16to17_v, _17to18_v, _18to19_v,
                        _19to20_v, _20to21_v, _21to22_v, _22to23_v, _23to24_v];
                    dataForC = [_00to01_c, _01to02_c, _02to03_c, _03to04_c, _04to05_c, _05to06_c, _06to07_c,
                        _07to08_c, _08to09_c, _09to10_c, _10to11_c, _11to12_c, _12to13_c, _13to14_c,
                        _14to15_c, _15to16_c, _16to17_c, _17to18_c, _18to19_c, _19to20_c, _20to21_c,
                        _21to22_c, _22to23_c, _23to24_c]
                    labels = ['00-01AM', '01-02AM', '02-03AM', '03-04AM', '04-05AM', '05-06AM', '06-07AM', '07-08AM', '08-09AM', '09-10AM', '10-11AM', '11-12AM',
                        '12-01PM', '01-02PM', '02-03PM', '03-04PM', '04-05PM', '05-06PM', '06-07PM', '07-08PM', '08-09PM', '09-10PM', '10-11PM', '11-12AM'];
                } else if (fddate >= 10) {
                    labels = labelsFor;
                    $scope.visibleDailyChart = true;
                }
                else {
                    labels = labelsFor;
                    $scope.visibleDailyChart = true;
                }

                $('#exclusiveChatAnaly').remove();
                $('#exclusiveChart-1').append('<canvas height="80" id="exclusiveChatAnaly"><canvas>');



                // datasets: [{
                //     label: "View",
                //     type: "bar",
                //     stack: "sensitivity",
                //     backgroundColor: "#2e7d32",
                //     data: dataForV,
                // }, {
                //     label: "Claim",
                //     type: "bar",
                //     stack: "base",
                //     backgroundColor: "#8e24aa",
                //     data: dataForC,
                // },
                // {
                //     label: "Redeem",
                //     type: "bar",
                //     stack: "redeem",
                //     backgroundColor: "#e91e63",
                //     data: dataForR,
                // }]

                new Chart(document.getElementById("exclusiveChatAnaly"), {
                    type: 'bar',
                    data: {
                        labels,
                        datasets: [{
                            label: "View",
                            type: "bar",
                            stack: "sensitivity",
                            backgroundColor: 'rgba(254, 191, 75, 1)',
                            pointBackgroundColor: 'rgba(59, 89, 152,1)',
                            borderColor: 'rgba(51,51,51,1)',
                            pointBorderColor: 'rgba(255,255,255,1)',
                            pointHoverBorderColor: 'rgba(255,255,255,1)',
                            borderWidth: 2,
                            data: dataForV,
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
                                    max: 40 //max value for the chart is 60
                                }
                            }]
                        },
                        onClick: (event, activeElements) => {
                            if (activeElements.length === 0) {
                                // alert("Chart is clickable but you must click a data point to drill-down")
                            } else {
                                let chart = activeElements[0]._chart
                                let activePoints = chart.getElementsAtEventForMode(event, 'point', chart.options);
                                let firstPoint = activePoints[0];
                                let label = chart.data.labels[firstPoint._index];
                                let value = chart.data.datasets[firstPoint._datasetIndex].data[firstPoint._index];

                                if (chart.data.datasets[firstPoint._datasetIndex].label && label && value) {
                                    console.log(chart.data.datasets[firstPoint._datasetIndex].label, label, value);
                                    label = label.split('-');
                                    console.log(label, $scope.selectedOfferId.id, $scope.selectedOfferId.ownerId);
                                    let datesV = $("#ex-offer-fr-date").val();
                                    datesV = label[0];
                                    let monthV = $("#ex-offer-fr-date").val().split('-')[1];
                                    let labelValues = $("#ex-offer-fr-date").val().split('-')[0];
                                    let dateZero = `${labelValues}-${monthV}-${datesV}T00:00:00.000Z`;

                                    let _18to23_Age = 0, _24to29_Age = 0, _30to35_Age = 0, _36to41_Age = 0, _42toPlus_Age = 0;
                                    let male = 0, female = 0, others = 0;

                                    let ChartFun = () => {
                                        var ctx = document.getElementById("ageExcChart").getContext('2d');
                                        new Chart(ctx, {
                                            type: 'pie',
                                            data: {
                                                labels: ["18 to 23", "24 to 29", "30 to 35", "36 to 41", "41 +"],
                                                datasets: [{
                                                    backgroundColor: ['#d81b60', '#3f51b5', '#22b573', '#ffb83b', '#bc1dc1'],
                                                    data: [_18to23_Age, _24to29_Age, _30to35_Age, _36to41_Age, _42toPlus_Age]
                                                }]
                                            }
                                        });

                                        var ctx_Exc_1 = document.getElementById("excluDoughnutChart").getContext('2d');
                                        new Chart(ctx_Exc_1, {
                                            type: 'doughnut',
                                            data: {
                                                labels: ["Male", "Female", "Others"],
                                                datasets: [{
                                                    label: '# of Tomatoes',
                                                    data: [male, female, others],
                                                    backgroundColor: ['#388e3c', '#e53935', '#3f51b5'],
                                                    borderColor: ['#388e3c', '#e53935', '#3f51b5'],
                                                    borderWidth: 1
                                                }]
                                            }
                                        });
                                    }

                                    ChartForExclusiveOffer.find({
                                        filter: {
                                            where: {
                                                ownerId: $scope.selectedOfferId.ownerId,
                                                exclusiveOfferId: $scope.selectedOfferId.id, dateZero
                                            }
                                        }
                                    }).$promise.then((res) => {
                                        // console.log(JSON.stringify(res));
                                        if (chart.data.datasets[firstPoint._datasetIndex].label == 'View') {
                                            let dataF = res[0];
                                            for (var propt in dataF) {
                                                if (propt.includes('to') && propt.includes('_')) {
                                                    if (dataF[propt].view) {
                                                        console.log(dataF[propt]);
                                                        if (dataF[propt]._18to23_Age) _18to23_Age += dataF[propt]._18to23_Age;
                                                        if (dataF[propt]._24to29_Age) _24to29_Age += dataF[propt]._24to29_Age;
                                                        if (dataF[propt]._30to35_Age) _30to35_Age += dataF[propt]._30to35_Age;
                                                        if (dataF[propt]._36to41_Age) _36to41_Age += dataF[propt]._36to41_Age;
                                                        if (dataF[propt]._42toPlus_Age) _42toPlus_Age += dataF[propt]._42toPlus_Age;
                                                        if (dataF[propt].male) male += dataF[propt].male;
                                                        if (dataF[propt].female) female += dataF[propt].female;
                                                    }
                                                }
                                            }
                                        } else if (chart.data.datasets[firstPoint._datasetIndex].label == 'Claim') {

                                        }
                                        ChartFun();
                                    })
                                }
                            }


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

                setTimeout(function () { loader.hidden() }, 300);


                //Age chart
                var pieExcAgeDaily = {
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
                $scope.pieDailyAgeOffer = pieExcAgeDaily;



                setTimeout(function () { loader.hidden() }, 500);

            }

            // $scope.setChartdata();

            $scope.startAndEndDiff = 0;
            getDailyCount = (data, start, end) => {

                // console.log(JSON.stringify(data), start, end);

                loader.visible();
                if (data) {
                    $scope.selectedOfferValue = data;
                    var validStart = new Date(start),
                        valisEnd = new Date(end),
                        diff = new Date(valisEnd - validStart),
                        days = diff / 1000 / 60 / 60 / 24;
                    $scope.startAndEndDiff = days;
                    let startDate = `${start}T00:00:00.000Z`;
                    let endDate = `${end}T00:00:00.000Z`;
                    let filter = {};
                    if ($scope.selectedItem._name == 'daily_Specials') {
                        let filter = {
                            filter: { where: { ownerId: $scope.userId, dailySpecialId: data.id } }
                        }
                        if (Array.isArray(data)) {
                            let or = [];
                            data.forEach(m => {
                                or.push({ dailySpecialId: m.id });
                            });
                            filter = { filter: { where: { ownerId: $scope.userId, or } } };
                        }

                        AllCategoryChart.find(filter).$promise.then((res) => {
                            console.log(JSON.stringify(res));
                            if (res && res.length) {
                                $scope.chartShow = true;
                                $scope.setChartdata(res, start, end);
                            } else {
                                $scope.chartShow = false;
                                toastMsg(false, "No data!");
                                setTimeout(function () { loader.hidden(); }, 500);
                            }
                        })
                    } else if ($scope.selectedItem._name == 'drinks_Specials') {
                        let filter = {};
                        if (Array.isArray(data)) {
                            let or = [];
                            data.forEach(m => {
                                or.push({ happyHourDashDayId: m.id, dateZero: m.date });
                            })
                            filter = { filter: { where: { ownerId: $scope.userId, or } } };
                        } else {
                            filter = { filter: { where: { ownerId: $scope.userId, happyHourDashDayId: data.id, dateZero: { between: [startDate, endDate] } } } };
                        }
                        AllCategoryChart.find(filter).$promise.then((res1) => {
                            if (res1 && res1.length) {
                                $scope.chartShow = true;
                                $scope.setChartdata(res1, start, end);
                            } else {
                                $scope.chartShow = false;
                                toastMsg(false, "No data!");
                                setTimeout(function () { loader.hidden(); }, 500);
                            }
                        });
                    } else if ($scope.selectedItem._name == 'exclusive_Coupon_Offers') {

                        filter = { filter: { where: { ownerId: $scope.userId, exclusiveOfferId: data.id, dateZero: { between: [startDate, endDate] } } } };
                        // if ($scope.startAndEndDiff >= 1) {
                        //     let or = [];
                        //     data.forEach(m => {
                        //         or.push({ exclusiveOfferId: m.id, dateZero: m.offerDate });
                        //     });
                        //     filter = { filter: { where: { ownerId: $scope.userId, or } } };
                        // } else {
                        //     filter = { filter: { where: { ownerId: $scope.userId, exclusiveOfferId: data.id } } };
                        // }

                        ChartForExclusiveOffer.find(filter)
                            .$promise.then((res) => {
                                if (res && res.length) {
                                    $scope.chartShow = true;
                                    $scope.setChartExcludata(res, start, end);
                                    setTimeout(function () { loader.hidden(); }, 500);
                                } else {
                                    $scope.chartShow = false;
                                    setTimeout(function () { loader.hidden(); }, 500);
                                    toastMsg(false, "No Data!. Please try again!");
                                }
                            })
                    }

                } else {
                    toastMsg(false, "Please try again!");
                    loader.hidden();
                }
            }


            $scope.dateOnChange = () => {
                if ($("#start-date").val() && $("#end-date").val()) {
                    getDailyCount($scope.selectEvents, $("#start-date").val(), $("#end-date").val());
                }
            }


            $scope.categoryDropList = [];

            $scope.getCategories = () => {
                $scope.categoryDropList = [{ name: "Select an option", _name: "select" }, { name: "Limited Offers", _name: "exclusive_Coupon_Offers" },
                { name: "Daily Specials", _name: "daily_Specials" }, { name: "Drinks Specials", _name: "drinks_Specials" }]
            }

            $scope.getCategories();

            $scope.formatDate = function (date) {
                var dateOut = new Date(date);
                return $filter('date')(new Date(dateOut), 'MMM d, y');
            };

            $scope.drinksSpecialList = [];
            $scope.cateDSpecialOnChange = (category) => {
                loader.visible();
                if (category) {
                    $scope.drinksSpecialList = [];
                    $scope.chartShow = false;
                    HappyHourDashDay.find({ filter: { where: { ownerId: $scope.userId, mainCategory: category, status: "Live" } } }).$promise.then((res) => {

                        let gD = groupBy(res, 'titleTxt');

                        Object.keys(gD).map(function (k) {
                            let kDaTa = gD[k].find(m => m.titleTxt == k);
                            if (kDaTa && kDaTa.title) {
                                $scope.drinksSpecialList.push({ _name: kDaTa.titleTxt, name: kDaTa.title });
                            }
                        })

                        setTimeout(function () { loader.hidden(); }, 200)

                    })
                }
            }

            $scope.specialDksDates = [];
            $scope.drinksSpecialOnChange = (titleTxt) => {

                if (titleTxt) {

                    $scope.specialDksDates = [];

                    loader.visible();

                    let tDate = new Date();
                    let ftdate = `${tDate.getFullYear()}-${("0" + (tDate.getMonth() + 1)).slice(-2)}-${("0" + tDate.getDate()).slice(-2)}T00:00:00.000Z`;

                    HappyHourDashDay.find({ filter: { where: { ownerId: $scope.userId, titleTxt, status: 'Live', date: { gte: ftdate } } } }).$promise.then((res) => {

                        for (let da of res) {
                            let objData = $scope.specialDksDates.find(m => m.date == da.date);
                            if (!objData || !objData.date) {
                                $scope.specialDksDates.push({
                                    value: `${da.date.split('T')[0]}`,
                                    date: da.date,
                                    txt: `${$scope.formatDate(da.date)}`, id: da.id
                                });
                            }
                        }

                        $scope.specialDksDates.sort(function (a, b) {
                            a = new Date(a.date);
                            b = new Date(b.date);
                            return a > b ? -1 : a < b ? 1 : 0;
                        });

                        $scope.specialDksDates.reverse();

                        setTimeout(() => {
                            loader.hidden();
                        }, 200)

                    }, () => {
                        setTimeout(() => {
                            loader.hidden();
                        }, 200)
                    });
                }
            }

            $scope.drinksSEventsOnChange = (arg) => {
                // console.log(JSON.stringify(arg));
                let { id, date } = arg;
                date = `${date}T00:00:00.000Z`;
                if (id) {
                    HappyHourDashDay.find({
                        filter: {
                            where: {
                                titleTxt: $scope.DSTitleOChange, ownerId: $scope.userId,
                                status: 'Live', date
                            }
                        }
                    }).$promise.then((res) => {
                        if (res && res.length) {
                            console.log(JSON.stringify(res));
                            if (res && res.length == 1) getDailyCount(res[0], res[0].liveDate.split('T')[0], res[0].date.split('T')[0]);
                            else getDailyCount(res, res[0].liveDate.split('T')[0], res[0].date.split('T')[0]);
                        } else {
                            $scope.chartShow = false;
                            toastMsg(false, "No Data!. Please try again");
                        }
                    });
                } else {
                    $scope.chartShow = false;
                    toastMsg(false, "No Data!. Please try again");
                }

            }

            $scope.chartShow = false;
            $(".wrapper").css({ height: '100%' });

            $scope.selectSports = {};
            $scope.dateDisabled = true;
            $scope.sportsOnChange = (data) => {
                $scope.selectSports = data;
                if (data && data.sportsDates && data.sportsDates.length) {
                    if ((data.sportsDates[0]).isCreated && (data.sportsDates[data.sportsDates.length - 1]).dateFormat) {
                        $scope.minDate = (data.sportsDates[0]).isCreated.split('T')[0];
                        $scope.maxDate = (data.sportsDates[data.sportsDates.length - 1]).dateFormat.split('T')[0];
                        $scope.dateDisabled = false;
                        getDailyCount($scope.selectSports, $scope.minDate, $scope.maxDate);
                        $(".wrapper").css({ height: '100%' });
                    }

                } else $scope.dateDisabled = true;

            }


            $scope.formatDate = function (date) {
                var dateOut = new Date(date);
                return $filter('date')(new Date(dateOut), 'MMM d, y');
            };

            $scope.specialListData = [];
            $scope.categoryOnChange = (data) => {
                if (data) {
                    $scope.chartShow = false;
                    loader.visible();
                    $scope.specialListData = [];
                    DailySpecial.find({
                        filter: {
                            where: { ownerId: $scope.userId, status: "Live" },
                            include: [{ relation: "dailySpecialCategory" }]
                        }
                    }).$promise.then((res) => {

                        res = res.filter(m => m.dailySpecialCategory._name == data._name);

                        let gD = groupBy(res, 'titleTxt');

                        Object.keys(gD).map(function (k) {
                            let kDaTa = gD[k].find(m => m.titleTxt == k);
                            if (kDaTa && kDaTa.title) {
                                $scope.specialListData.push({ _name: kDaTa.titleTxt, name: kDaTa.title });
                            }
                        })

                        loader.hidden();
                    })
                }
            }


            $scope.exCouponDates = [];
            $scope.offerOnChange = (data) => {

                $scope.chartShow = false;

                if (data && data.titleTxt) {
                    let { titleTxt } = data;
                    loader.visible();
                    ExclusiveOffer.find({ filter: { where: { titleTxt } } })
                        .$promise.then((res) => {
                            $scope.exCouponDates = [];
                            if (res && res.length) {
                                for (let da of res) {
                                    $scope.exCouponDates.push({ txt: `${$scope.formatDate(da.offerDate)}`, val: da.offerDate.split('T')[0], id: da.id })
                                }
                            }

                            let tDate = new Date();
                            let offerDate = `${tDate.getFullYear()}-${("0" + (tDate.getMonth() + 1)).slice(-2)}-${("0" + tDate.getDate()).slice(-2)}T00:00:00.000Z`;

                            let edata = res.find(m => m.offerDate == offerDate);

                            if (edata && edata.id) {
                                $scope.excluSpDate = edata.id;
                                $scope.minDate = (edata.offerDate).split('T')[0];
                                $scope.maxDate = (edata.offerDate).split('T')[0];
                                getDailyCount(edata, edata.offerDate.split('T')[0],
                                    edata.offerDate.split('T')[0]);
                            } else {
                                setTimeout(function () { loader.hidden() }, 200);
                            }
                        }, () => {
                            toastMsg(false, "Please try again!");
                            setTimeout(function () { loader.hidden() }, 200);
                        });
                }
            }

            $scope.excluSDateOffCh = (arg) => {
                let { id } = arg;
                if (id) {
                    loader.visible();
                    ExclusiveOffer.find({ filter: { where: { id } } })
                        .$promise.then((res) => {
                            if (res && res.length == 1) {
                                getDailyCount(res, res[0].liveDate.split('T')[0],
                                    res[0].offerDate.split('T')[0]);
                                setTimeout(function () {
                                    loader.hidden();
                                }, 400);
                            } else {
                                toastMsg(false, "Please try again!");
                            }

                        });
                }
            }

            $scope.exSDateFandToOnChange = () => {
                if ($("#ex-offer-fr-date").val() && $("#ex-offer-to-e-date").val()) {
                    loader.visible();
                    let sdate = `${$("#ex-offer-fr-date").val()}T00:00:00.000Z`;
                    let edate = `${$("#ex-offer-to-e-date").val()}T00:00:00.000Z`;
                    CouponDate.find({
                        filter: {
                            where: {
                                exclusiveOfferId: $scope.selectedOfferId.id,
                                offerDate: { between: [sdate, edate] }
                            }
                        }
                    }).$promise.then((res) => {
                        if (res && res.length) {
                            getDailyCount(res, $("#ex-offer-fr-date").val(), $("#ex-offer-to-e-date").val());
                        }
                    })
                    setTimeout(function () { loader.hidden(); }, 500)
                }
            }

            $scope.dateOnChange = (arg) => {
                if (arg == 'drinks') {
                    if ($("#start-date-drinks").val() && $("#end-date-drinks").val()) {
                        getDailyCount($scope.selectedOfferValue, $("#start-date-drinks").val(), $("#end-date-drinks").val());
                    }
                }
            }

            $scope.specialSDates = [];
            $scope.titleTxt = '';
            $scope.eventSpDate = '';
            $scope.dailyspecialOnChange = (titleTxt) => {
                if (titleTxt) {
                    $scope.titleTxt = '';
                    $scope.titleTxt = titleTxt;
                    $scope.specialSDates = [];
                    loader.visible();
                    $scope.chartShow = false;

                    let tDate = new Date();
                    let offerDate = `${tDate.getFullYear()}-${("0" + (tDate.getMonth() + 1)).slice(-2)}-${("0" + tDate.getDate()).slice(-2)}T00:00:00.000Z`;

                    DailySpecial.find({ filter: { where: { ownerId: $scope.userId, titleTxt: titleTxt, status: "Live", date: { gte: offerDate } } } })
                        .$promise.then((res) => {
                            for (let da of res) {
                                let objData = $scope.specialSDates.find(m => m.date == da.date);
                                if (!objData || !objData.date) {
                                    $scope.specialSDates.push({
                                        value: `${da.date.split('T')[0]}`,
                                        date: da.date,
                                        txt: `${$scope.formatDate(da.date)}`, id: da.id
                                    });
                                }
                            }

                            $scope.specialSDates.sort(function (a, b) {
                                a = new Date(a.date);
                                b = new Date(b.date);
                                return a > b ? -1 : a < b ? 1 : 0;
                            });

                            setTimeout(() => {
                                loader.hidden();
                            }, 200)

                            // $scope.eventSpDate = '';

                            // let tDate = new Date();
                            // let ftdate = `${tDate.getFullYear()}-${("0" + (tDate.getMonth() + 1)).slice(-2)}-${("0" + tDate.getDate()).slice(-2)}T00:00:00.000Z`;

                            // let todData = $scope.specialSDates.find(m => m.date == ftdate);

                            // if (todData && todData.date) {
                            //     loader.visible();

                            //     let id = $("#dailySDateRange option:selected").attr('data-idvalue');
                            //     $scope.toDailydData = todData;

                            //     $scope.eventSpDate = $scope.toDailydData.id;

                            //     AllCategoryChart.find({ filter: { where: { ownerId: $scope.userId, dailySpecialId: id, dateZero: todData.date } } }).$promise.then((res) => {
                            //         if (res && res.length) {
                            //             $scope.chartShow = true;
                            //             $scope.setChartdata(res, todData.date, todData.date);
                            //         } else {
                            //             $scope.chartShow = false;
                            //             toastMsg(false, "No data!");
                            //             setTimeout(function () { loader.hidden(); }, 500);
                            //         }
                            //     })

                            // }

                            $scope.specialSDates.reverse();

                        }, (err) => {
                            setTimeout(() => {
                                loader.hidden();
                            }, 200)
                        });
                }
            }

            $scope.lFromTodate = [];
            $scope.dailyDDOnChange = (arg) => {
                // console.log(arg);
                let { id, date } = arg;
                $scope.chartShow = false;
                if ($("#daily-title-txt").val()) {
                    let titleTxt = $("#daily-title-txt").val();
                    DailySpecial.find({
                        filter: {
                            where: {
                                date: { gte: `${date}T00:00:00.000Z` },
                                titleTxt
                            }
                        }
                    }).$promise.then((res) => {
                        if (res && res.length) {
                            if (res && res.length == 1) getDailyCount(res[0], res[0].liveDate.split('T')[0], res[0].date.split('T')[0]);
                            else getDailyCount(res, res[0].liveDate.split('T')[0], res[0].date.split('T')[0]);
                            // getDailyCount(res, res[0].liveDate.split('T')[0], res[0].date.split('T')[0]);
                        } else toastMsg(false, "No Data! Please try again!")
                    });
                }

            }

            $scope.selectedOfferId = 'select';

            $scope.dailySDateOnChange = () => {

                if ($("#dailySSdate").val() && $("#dailySEdate").val()) {

                    let sdate = `${$("#dailySSdate").val()}T00:00:00.000Z`;
                    let edate = `${$("#dailySEdate").val()}T00:00:00.000Z`;
                    let titleTxt = $("#daily-title-txt").val();

                    if (titleTxt) {

                        DailySpecial.find({ filter: { where: { titleTxt, status: "Live", date: { between: [sdate, edate] } }, fields: ["id", "date", "liveDate", "status", "dateNo"], order: "dateNo asc" } })
                            .$promise.then((res) => {
                                if (res && res.length) {
                                    getDailyCount(res, $("#dailySSdate").val(),
                                        $("#dailySEdate").val());
                                }
                            });
                    }

                }
            }

            $scope.drinksSDateOnChange = () => {

                if ($("#dSSdate").val() && $("#dSEdate").val()) {

                    let sdate = `${$("#dSSdate").val()}T00:00:00.000Z`;
                    let edate = `${$("#dSEdate").val()}T00:00:00.000Z`;
                    let titleTxt = $("#special-title-ch-d").val();

                    HappyHourDashDay.find({ filter: { where: { titleTxt, status: "Live", date: { between: [sdate, edate] } }, fields: ["id", "date", "liveDate", "status", "dateNo"], order: "dateNo asc" } })
                        .$promise.then((res) => {
                            if (res) {

                                res = res.sort(function (a, b) {
                                    a = new Date(a.date);
                                    b = new Date(b.date);
                                    return a > b ? -1 : a < b ? 1 : 0;
                                });
                                res.reverse();

                                getDailyCount(res, res[0].date.split('T')[0],
                                    res[res.length - 1].date.split('T')[0]);

                            }
                        });
                }

            }

            $scope.specialCategoriesList = [];
            $scope.specialOffersList = [];
            $scope.typeOnChange = (data) => {
                $(".wrapper").css({ height: '120vh' });
                $scope.chartShow = false;
                $scope.specialOffersList = [];
                loader.visible();
                if (data) {
                    let tDate = new Date();
                    let offerDate = `${tDate.getFullYear()}-${("0" + (tDate.getMonth() + 1)).slice(-2)}-${("0" + tDate.getDate()).slice(-2)}T00:00:00.000Z`;
                    $scope.specialCategoriesList = [];
                    if (data._name == "daily_Specials") {

                        DailySpecial.find({
                            filter: {
                                where: {
                                    status: "Live", ownerId: $scope.userId,
                                    date: { gte: offerDate }
                                }, fields: ["id", "title", "titleTxt"], order: "dateNo asc"
                            }
                        })
                            .$promise.then((res) => {
                                if (res && res.length) {
                                    //console.log(JSON.stringify(res));
                                    let fgData = groupBy(res, "titleTxt");
                                    let arraObj = [];
                                    Object.keys(fgData).forEach((k, j) => {
                                        let { titleTxt, title, ownerId } = res.find(m => m.titleTxt == k);
                                        arraObj.push({ titleTxt, title, ownerId });
                                    })
                                    $scope.specialListData = arraObj;
                                }
                            });

                    } else if (data._name == "exclusive_Coupon_Offers" && $scope.userId) {

                        ExclusiveOffer.find({
                            filter: {
                                where: {
                                    ownerId: $scope.userId,
                                    status: "Live",
                                    offerDate: { gte: offerDate }
                                },
                                fields: ["id", "title", "titleTxt"]
                            }
                        }).$promise.then((res) => {
                            let fgData = groupBy(res, "titleTxt");
                            let arraObj = [];
                            Object.keys(fgData).forEach((k, j) => {
                                let ownerId = $scope.userId;
                                let { titleTxt, title } = res.find(m => m.titleTxt == k);
                                arraObj.push({ titleTxt, title, ownerId });
                            })
                            $scope.specialOffersList = arraObj;
                        });
                    } else if (data._name == 'drinks_Specials' && $scope.userId) {
                        HappyHourDashDay.find({
                            filter: {
                                where: {
                                    ownerId: $scope.userId,
                                    status: "Live",
                                    date: { gte: offerDate }
                                },
                                fields: ["id", "title", "titleTxt"]
                            }
                        }).$promise.then((res) => {
                            let fgData = groupBy(res, "titleTxt");
                            let arraObj = [];
                            let ownerId = $scope.userId;
                            Object.keys(fgData).forEach((k, j) => {
                                let { titleTxt, title } = res.find(m => m.titleTxt == k);
                                arraObj.push({ titleTxt, title, ownerId });
                            })
                            $scope.drinksSpecialList = arraObj;
                        })
                    }
                }
                setTimeout(function () { loader.hidden() }, 400)
            }

            // $scope.specialOffersList = [];
            // $scope.defaultFunCon = () => {
            //     let tDate = new Date();
            //     let offerDate = `${tDate.getFullYear()}-${("0" + (tDate.getMonth() + 1)).slice(-2)}-${("0" + tDate.getDate()).slice(-2)}T00:00:00.000Z`;
            //     ExclusiveOffer.find({
            //         filter: {
            //             where: { ownerId: $scope.userId, status: "Live", offerDate: { gte: offerDate } },
            //             fields: ["id", "title", "titleTxt", "ownerId"]
            //         }
            //     }).$promise.then((res) => {
            //         let fgData = groupBy(res, "titleTxt");
            //         let arraObj = [];
            //         Object.keys(fgData).forEach((k, j) => {
            //             let { titleTxt, title, ownerId } = res.find(m => m.titleTxt == k);
            //             arraObj.push({ titleTxt, title, ownerId });
            //         })
            //         $scope.specialOffersList = arraObj;
            //     });
            // }


            $scope.selectedItem = { name: "Select an option", _name: "select" };


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
                        $rootScope.selectedVenue = { venueId: $scope.userId, ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
                        localStorage.removeItem("selectedVenue");
                        localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userId, ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }));
                        // $scope.typeOnChange($scope.selectedItem);
                        //  $scope.defaultFunCon();
                    }
                    $(".wrapper").css({ height: '90vh' });
                } else $("#businessErr").text('Please select the Business name');
            }

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

            if ($scope.userDetails.isAdmin == false) {
                $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                $("#autocompleteBusiness").attr('disabled', true);
                $scope.userId = $scope.userDetails.id;
                $(".wrapper").css({ height: '90vh' });
                localStorage.setItem("selectedVenue",
                    JSON.stringify({
                        venueId: $scope.userDetails.id, ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName
                    }));
                //$scope.typeOnChange($scope.selectedItem);
                // $scope.defaultFunCon();
            } else {
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
                    $(".wrapper").css({ height: '90vh' });
                    // $scope.defaultFunCon();
                    // $scope.typeOnChange($scope.selectedItem);
                }
            }

        }]);