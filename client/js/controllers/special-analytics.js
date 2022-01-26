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

            $scope.happyHourCategories = ["Happy Hour", "Beer", "Wine", "Cocktail", "Spirit", "Cider"];

            toastMsg = (isVaild, msg) => {
                if (isVaild)
                    toastr.success(msg);
                else
                    toastr.error(msg);
                toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
            }

            var mShot = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];

            $scope.setDateChart = (val, special, accessPo = false) => {

                if (special == 'DailySpecial') {
                    $('#special-daily-day').remove();
                    $("#special-chart-day").empty();
                    $('#special-chart-day').append('<canvas height="80" id="special-daily-day"><canvas>');
                    val = val.split('-');
                    let values;
                    if (accessPo) {
                        values = moment(`${val[2]}/${("0" + (mShot.findIndex(m => m == val[1]) + 1)).slice(-2)}/${("0" + val[0]).slice(-2)}`, "YY/MM/DD").format("YYYY-MM-DD");
                    } else {
                        values = `${val[2]}-${val[1]}-${val[0]}`
                    }

                    $scope.dailySpecDayIds = [];
                    DailySpecial.find({
                        filter: {
                            where: {
                                ownerId: $scope.userId,
                                date: `${values}T00:00:00.000Z`
                            },
                            fields: ["ownerId", "id", "date", "title", "titleTxt"]
                        }
                    }).$promise.then((res) => {

                        if (res && res.length) {
                            res.forEach(val => { $scope.dailySpecDayIds.push({ dailySpecialId: val.id }) });

                            let sumValues = (aData, key) => aData.reduce(function (i, v) { return i + v[key]; }, 0);

                            let dataFor = [], labelsFor = ['00-01AM', '01-02AM', '02-03AM', '03-04AM', '04-05AM', '05-06AM', '06-07AM', '07-08AM', '08-09AM', '09-10AM', '10-11AM', '11-12AM', '12-01PM', '01-02PM', '02-03PM', '03-04PM', '04-05PM', '05-06PM', '06-07PM', '07-08PM', '08-09PM', '09-10PM', '10-11PM', '11-12AM'];;

                            let _00to01 = 0, _01to02 = 0, _02to03 = 0, _03to04 = 0, _04to05 = 0, _05to06 = 0,
                                _06to07 = 0, _07to08 = 0, _08to09 = 0, _09to10 = 0, _10to11 = 0, _11to12 = 0,
                                _12to13 = 0, _13to14 = 0, _14to15 = 0, _15to16 = 0, _17to18 = 0, _18to19 = 0,
                                _19to20 = 0, _20to21 = 0, _21to22 = 0, _22to23 = 0, _23to24 = 0;

                            let male = 0, female = 0, others = 0;

                            let _18to23_Age = 0, _24to29_Age = 0, _30to35_Age = 0, _36to41_Age = 0, _42toPlus_Age = 0;

                            AllCategoryChart.find({
                                filter: {
                                    where: { or: $scope.dailySpecDayIds },
                                    include: [{ relation: "dailySpecial" }]
                                }
                            }).$promise.then((res_1) => {

                                if (res_1 && res_1.length) {

                                    _00to01 = sumValues(res_1, "_00to01"); _01to02 = sumValues(res_1, "_01to02");
                                    _02to03 = sumValues(res_1, "_02to03"); _03to04 = sumValues(res_1, "_03to04");
                                    _04to05 = sumValues(res_1, "_04to05"); _05to06 = sumValues(res_1, "_05to06");
                                    _06to07 = sumValues(res_1, "_06to07"); _07to08 = sumValues(res_1, "_07to08");
                                    _08to09 = sumValues(res_1, "_08to09"); _09to10 = sumValues(res_1, "_09to10");
                                    _10to11 = sumValues(res_1, "_10to11"); _11to12 = sumValues(res_1, "_11to12");
                                    _12to13 = sumValues(res_1, "_12to13"); _13to14 = sumValues(res_1, "_13to14");
                                    _14to15 = sumValues(res_1, "_14to15"); _15to16 = sumValues(res_1, "_15to16");
                                    _16to17 = sumValues(res_1, "_16to17"); _17to18 = sumValues(res_1, "_17to18");
                                    _18to19 = sumValues(res_1, "_18to19"); _19to20 = sumValues(res_1, "_19to20");
                                    _20to21 = sumValues(res_1, "_20to21"); _21to22 = sumValues(res_1, "_21to22");
                                    _22to23 = sumValues(res_1, "_22to23"); _23to24 = sumValues(res_1, "_23to24");

                                    dataFor.push(_00to01, _01to02, _02to03, _03to04, _04to05, _05to06, _06to07,
                                        _07to08, _08to09, _09to10, _10to11, _11to12, _12to13, _13to14, _14to15,
                                        _15to16, _16to17, _17to18, _18to19, _19to20, _20to21, _21to22, _22to23, _23to24);

                                    let mxLnt = Number(Math.max(...dataFor));
                                    var cnTI = (parseInt(mxLnt / 10, 10) + 1) * 10;

                                    new Chart(document.getElementById("special-daily-day"), {
                                        type: 'bar',
                                        data: {
                                            labels: labelsFor,
                                            datasets: [{
                                                label: `${val[2]}-${val[1]}-${val[0]} - View`,
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
                                                        min: 0,
                                                        max: cnTI //max value for the chart is 60
                                                    }
                                                }]
                                            }
                                        }
                                    });


                                    male = res_1.reduce(function (i, v) { return i + v.male; }, 0);
                                    female = res_1.reduce(function (i, v) { return i + v.female; }, 0);
                                    others = res_1.reduce(function (i, v) { return i + v.others; }, 0);

                                    $('#MAndFChart').remove();
                                    $('#malefemaleD_D').append('<canvas id="MAndFChart"><canvas>');

                                    new Chart(document.getElementById("MAndFChart"), {
                                        type: 'doughnut',
                                        data: {
                                            labels: ["Male", "Female", "Others"],
                                            datasets: [{
                                                data: [male, female, others],
                                                backgroundColor: ['#388e3c', '#e53935', '#3f51b5']
                                            }]
                                        },
                                        options: {
                                            title: {
                                                display: true,
                                                text: 'Gender'
                                            },
                                            plugins: {
                                                datalabels: {
                                                    display: true,
                                                    backgroundColor: '#ccc',
                                                    borderRadius: 3,
                                                    font: {
                                                        color: 'red',
                                                        weight: 'bold',
                                                    }
                                                },
                                                doughnutlabel: {
                                                    labels: [{
                                                        text: '550',
                                                        font: {
                                                            size: 20,
                                                            weight: 'bold'
                                                        }
                                                    }, {
                                                        text: 'total'
                                                    }]
                                                }
                                            }
                                        }
                                    });


                                    _18to23_Age = res_1.reduce(function (i, v) { return i + v._18to23_Age; }, 0);
                                    _24to29_Age = res_1.reduce(function (i, v) { return i + v._24to29_Age; }, 0);
                                    _30to35_Age = res_1.reduce(function (i, v) { return i + v._30to35_Age; }, 0);
                                    _36to41_Age = res_1.reduce(function (i, v) { return i + v._36to41_Age; }, 0);
                                    _42toPlus_Age = res_1.reduce(function (i, v) { return i + v._42toPlus_Age; }, 0);

                                    $('#ageChart').remove();
                                    $('#ageChartD_Daily').append('<canvas id="ageChart"><canvas>');

                                    new Chart(document.getElementById("ageChart"), {
                                        type: 'pie',
                                        data: {
                                            labels: ["18 to 23", "24 to 29", "30 to 35", "36 to 41", "41 +"],
                                            datasets: [
                                                {
                                                    data: [_18to23_Age, _24to29_Age, _30to35_Age, _36to41_Age, _42toPlus_Age],
                                                    backgroundColor: ['#d81b60', '#3f51b5', '#22b573', '#ffb83b', '#bc1dc1']
                                                }]
                                        },
                                        options: {
                                            title: {
                                                display: true,
                                                text: 'Age'
                                            },
                                            plugins: {
                                                datalabels: {
                                                    display: true,
                                                    align: 'bottom',
                                                    backgroundColor: '#ccc',
                                                    borderRadius: 3,
                                                    font: {
                                                        size: 18,
                                                    }
                                                },
                                            }
                                        }
                                    });


                                    $('#day-chat-sepcial').modal({
                                        backdrop: 'static',
                                        keyboard: false
                                    });
                                    setTimeout(() => { loader.hidden(); }, 200)
                                } else {
                                    toastMsg(false, "Please try again!. No Data!");
                                    setTimeout(() => { loader.hidden(); }, 200)
                                }

                            }, () => {
                                toastMsg(false, "Please try again!. No Data!");
                                setTimeout(() => { loader.hidden(); }, 200)
                            });
                        } else {
                            toastMsg(false, "Please try again!. No Data!");
                            setTimeout(() => { loader.hidden(); }, 200)
                        }

                    }, () => {
                        toastMsg(false, "Please try again!. No Data!");
                        setTimeout(() => { loader.hidden(); }, 200)
                    })
                } else setTimeout(() => { loader.hidden(); }, 200)
            }

            $scope.setDailySpecialAna = (isMultpleDates, dates) => {

                $('#special-anly-daily').remove();
                $('#special-anly').empty();
                $('#special-anly').append('<canvas height="80" id="special-anly-daily"><canvas>');

                let dataFor = [], labelsFor = [];

                let _00to01 = 0, _01to02 = 0, _02to03 = 0, _03to04 = 0, _04to05 = 0, _05to06 = 0,
                    _06to07 = 0, _07to08 = 0, _08to09 = 0, _09to10 = 0, _10to11 = 0, _11to12 = 0,
                    _12to13 = 0, _13to14 = 0, _14to15 = 0, _15to16 = 0, _17to18 = 0, _18to19 = 0,
                    _19to20 = 0, _20to21 = 0, _21to22 = 0, _22to23 = 0, _23to24 = 0;

                if (isMultpleDates) {

                    AllCategoryChart.find({
                        filter: {
                            where: { or: $scope.dailySpecialIds },
                            include: [{ relation: "dailySpecial" }]
                        }
                    }).$promise.then((res) => {

                        if (res && res.length) {

                            res = res.filter(m => m.dailySpecial && m.dailySpecial.id);

                            let sumValues = (aData, key) => aData.reduce(function (i, v) { return i + v[key]; }, 0);

                            dates.forEach(val => {

                                _00to01 = 0; _01to02 = 0; _02to03 = 0; _03to04 = 0; _04to05 = 0; _05to06 = 0;
                                _06to07 = 0; _07to08 = 0; _08to09 = 0; _09to10 = 0; _10to11 = 0; _11to12 = 0;
                                _12to13 = 0; _13to14 = 0; _14to15 = 0; _15to16 = 0; _17to18 = 0; _18to19 = 0;
                                _19to20 = 0; _20to21 = 0; _21to22 = 0; _22to23 = 0; _23to24 = 0;

                                let data = res.filter(m => m.dailySpecial.date == val.date);

                                _00to01 = sumValues(data, "_00to01"); _01to02 = sumValues(data, "_01to02");
                                _02to03 = sumValues(data, "_02to03"); _03to04 = sumValues(data, "_03to04");
                                _04to05 = sumValues(data, "_04to05"); _05to06 = sumValues(data, "_05to06");
                                _06to07 = sumValues(data, "_06to07"); _07to08 = sumValues(data, "_07to08");
                                _08to09 = sumValues(data, "_08to09"); _09to10 = sumValues(data, "_09to10");
                                _10to11 = sumValues(data, "_10to11"); _11to12 = sumValues(data, "_11to12");
                                _12to13 = sumValues(data, "_12to13"); _13to14 = sumValues(data, "_13to14");
                                _14to15 = sumValues(data, "_14to15"); _15to16 = sumValues(data, "_15to16");
                                _16to17 = sumValues(data, "_16to17"); _17to18 = sumValues(data, "_17to18");
                                _18to19 = sumValues(data, "_18to19"); _19to20 = sumValues(data, "_19to20");
                                _20to21 = sumValues(data, "_20to21"); _21to22 = sumValues(data, "_21to22");
                                _22to23 = sumValues(data, "_22to23"); _23to24 = sumValues(data, "_23to24");

                                let totalCnt = _00to01 + _01to02 + _02to03 + _03to04 + _04to05 + _05to06 + _06to07 +
                                    _07to08 + _08to09 + _09to10 + _10to11 + _11to12 + _12to13 + _13to14 + _14to15 +
                                    _15to16 + _16to17 + _17to18 + _18to19 + _19to20 + _20to21 + _21to22 + _22to23 + _23to24;

                                dataFor.push(totalCnt);

                                let fdate = new Date(val.date);

                                labelsFor.push(`${("0" + fdate.getDate()).slice(-2)}-${mShot[fdate.getMonth()]}-${fdate.getFullYear().toString().substring(2, 4)}`);
                            })

                            let mxLnt = Number(Math.max(...dataFor));
                            var cnTI = (parseInt(mxLnt / 10, 10) + 1) * 10;

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
                                                min: 0,
                                                max: cnTI //max value for the chart is 60
                                            }
                                        }]
                                    },
                                    onClick: function (evt) {
                                        try {
                                            if (this.getElementsAtEvent(evt)[0] && this.getElementsAtEvent(evt)[0]._model.label) {
                                                var activePointLabel = this.getElementsAtEvent(evt)[0]._model.label;
                                                loader.visible();
                                                $scope.setDateChart(activePointLabel, "DailySpecial", true);
                                            }
                                        } catch (e) { }
                                    }
                                }
                            });
                            setTimeout(() => { loader.hidden(); }, 200)
                        } else {
                            $('#special-anly-daily').remove();
                            $('#special-anly').append(` <div class="row"
                            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12" style="text-align:center;">
                                <h2 style="font-size: 1.2rem;font-weight:700;">No Data</h2>
                            </div>
                        </div>`);
                        }
                        setTimeout(() => { loader.hidden(); }, 200)
                    }, () => {
                        toastMsg("Please try again!");
                        setTimeout(() => { loader.hidden(); }, 200)
                    });
                } else setTimeout(() => { loader.hidden(); }, 200)
            }

            $scope.dailySpecialIds = [];
            $scope.dailySpecialDates = [];
            $scope.onChanCateDaily = (data) => {
                $scope.dailySpecialDates = [];
                loader.visible();
                let tDate = new Date();
                let offerDate = `${tDate.getFullYear()}-${("0" + (tDate.getMonth() + 1)).slice(-2)}-${("0" + tDate.getDate()).slice(-2)}T00:00:00.000Z`;
                if (data) {
                    if (typeof data == 'string') data = JSON.parse(data);
                    let { titleTxt, title, ownerId } = data;
                    if (titleTxt) {
                        $scope.dailySpecialIds = [];
                        DailySpecial.find({
                            filter: {
                                where: {
                                    titleTxt, status: "Live", ownerId,
                                    date: { gte: offerDate }
                                }, fields: ["id", "date", "liveDate", "status", "category", "_category", "startTime", "endTime",
                                    "titleTxt", "title"], order: "dateNo asc"
                            }
                        }).$promise.then((res) => {
                            if (res && res.length) {
                                res.forEach(val => { $scope.dailySpecialIds.push({ dailySpecialId: val.id }) });
                                $scope.dailySpecialDates = res.reduce((acc, current) => {
                                    if (!acc.find(item => item.date === current.date))
                                        return acc.concat([current]);
                                    else
                                        return acc;
                                }, []).sort(function (a, b) {
                                    return new Date(b.date) - new Date(a.date);
                                }).reverse();
                                if ($scope.dailySpecialDates && $scope.dailySpecialDates.length) {
                                    $scope.setDailySpecialAna(true, $scope.dailySpecialDates);
                                } else {
                                    $('#special-anly-daily').remove();
                                    $('#special-anly').append(` <div class="row"
                                    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12" style="text-align:center;">
                                        <h2 style="font-size: 1.2rem;font-weight:700;">No Data</h2>
                                    </div>
                                </div>`);
                                }

                            } else {
                                $('#special-anly-daily').remove();
                                $('#special-anly').append(` <div class="row"
                                <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12" style="text-align:center;">
                                    <h2 style="font-size: 1.2rem;font-weight:700;">No Data</h2>
                                </div>
                            </div>`);
                            }
                        });
                    }
                }
            }

            $scope.setDateDrinksChart = (val, special, accessPo = false) => {

                if (special == 'DrinksSpecial') {
                    $('#special-drinks-day').remove();
                    $("#special-chart-day").empty();
                    $('#special-chart-day').append('<canvas height="80" id="special-drinks-day"><canvas>');
                    val = val.split('-');
                    let values;
                    if (accessPo) {
                        values = moment(`${val[2]}/${("0" + (mShot.findIndex(m => m == val[1]) + 1)).slice(-2)}/${("0" + val[0]).slice(-2)}`, "YY/MM/DD").format("YYYY-MM-DD");
                    } else {
                        values = `${val[2]}-${val[1]}-${val[0]}`
                    }

                    $scope.drinksSpecDayIds = [];
                    HappyHourDashDay.find({
                        filter: {
                            where: {
                                ownerId: $scope.userId,
                                date: `${values}T00:00:00.000Z`
                            },
                            fields: ["ownerId", "id", "date", "title", "titleTxt"]
                        }
                    }).$promise.then((res) => {

                        if (res && res.length) {

                            res.forEach(val => { $scope.drinksSpecDayIds.push({ happyHourDashDayId: val.id }) });

                            let sumValues = (aData, key) => aData.reduce(function (i, v) { return i + v[key]; }, 0);

                            let dataFor = [], labelsFor = ['00-01AM', '01-02AM', '02-03AM', '03-04AM', '04-05AM', '05-06AM', '06-07AM', '07-08AM', '08-09AM', '09-10AM', '10-11AM', '11-12AM', '12-01PM', '01-02PM', '02-03PM', '03-04PM', '04-05PM', '05-06PM', '06-07PM', '07-08PM', '08-09PM', '09-10PM', '10-11PM', '11-12AM'];;

                            let _00to01 = 0, _01to02 = 0, _02to03 = 0, _03to04 = 0, _04to05 = 0, _05to06 = 0,
                                _06to07 = 0, _07to08 = 0, _08to09 = 0, _09to10 = 0, _10to11 = 0, _11to12 = 0,
                                _12to13 = 0, _13to14 = 0, _14to15 = 0, _15to16 = 0, _17to18 = 0, _18to19 = 0,
                                _19to20 = 0, _20to21 = 0, _21to22 = 0, _22to23 = 0, _23to24 = 0;

                            let male = 0, female = 0, others = 0;

                            let _18to23_Age = 0, _24to29_Age = 0, _30to35_Age = 0, _36to41_Age = 0, _42toPlus_Age = 0;

                            AllCategoryChart.find({
                                filter: {
                                    where: { or: $scope.drinksSpecDayIds },
                                    include: [{ relation: "happyHourDashDay" }]
                                }
                            }).$promise.then((res_1) => {

                                if (res_1 && res_1.length) {

                                    _00to01 = sumValues(res_1, "_00to01"); _01to02 = sumValues(res_1, "_01to02");
                                    _02to03 = sumValues(res_1, "_02to03"); _03to04 = sumValues(res_1, "_03to04");
                                    _04to05 = sumValues(res_1, "_04to05"); _05to06 = sumValues(res_1, "_05to06");
                                    _06to07 = sumValues(res_1, "_06to07"); _07to08 = sumValues(res_1, "_07to08");
                                    _08to09 = sumValues(res_1, "_08to09"); _09to10 = sumValues(res_1, "_09to10");
                                    _10to11 = sumValues(res_1, "_10to11"); _11to12 = sumValues(res_1, "_11to12");
                                    _12to13 = sumValues(res_1, "_12to13"); _13to14 = sumValues(res_1, "_13to14");
                                    _14to15 = sumValues(res_1, "_14to15"); _15to16 = sumValues(res_1, "_15to16");
                                    _16to17 = sumValues(res_1, "_16to17"); _17to18 = sumValues(res_1, "_17to18");
                                    _18to19 = sumValues(res_1, "_18to19"); _19to20 = sumValues(res_1, "_19to20");
                                    _20to21 = sumValues(res_1, "_20to21"); _21to22 = sumValues(res_1, "_21to22");
                                    _22to23 = sumValues(res_1, "_22to23"); _23to24 = sumValues(res_1, "_23to24");

                                    dataFor.push(_00to01, _01to02, _02to03, _03to04, _04to05, _05to06, _06to07,
                                        _07to08, _08to09, _09to10, _10to11, _11to12, _12to13, _13to14, _14to15,
                                        _15to16, _16to17, _17to18, _18to19, _19to20, _20to21, _21to22, _22to23, _23to24);

                                    let mxLnt = Number(Math.max(...dataFor));
                                    var cnTI = (parseInt(mxLnt / 10, 10) + 1) * 10;

                                    new Chart(document.getElementById("special-drinks-day"), {
                                        type: 'bar',
                                        data: {
                                            labels: labelsFor,
                                            datasets: [{
                                                label: `${val[2]}-${val[1]}-${val[0]} - View`,
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
                                                        min: 0,
                                                        max: cnTI //max value for the chart is 60
                                                    }
                                                }]
                                            }
                                        }
                                    });

                                    male = res_1.reduce(function (i, v) { return i + v.male; }, 0);
                                    female = res_1.reduce(function (i, v) { return i + v.female; }, 0);
                                    others = res_1.reduce(function (i, v) { return i + v.others; }, 0);

                                    $('#MAndFChart').remove();
                                    $('#malefemaleD_D').append('<canvas id="MAndFChart"><canvas>');

                                    new Chart(document.getElementById("MAndFChart"), {
                                        type: 'doughnut',
                                        data: {
                                            labels: ["Male", "Female", "Others"],
                                            datasets: [{
                                                data: [male, female, others],
                                                backgroundColor: ['#388e3c', '#e53935', '#3f51b5']
                                            }]
                                        },
                                        options: {
                                            title: {
                                                display: true,
                                                text: 'Gender'
                                            },
                                            plugins: {
                                                datalabels: {
                                                    display: true,
                                                    backgroundColor: '#ccc',
                                                    borderRadius: 3,
                                                    font: {
                                                        color: 'red',
                                                        weight: 'bold',
                                                    }
                                                },
                                                doughnutlabel: {
                                                    labels: [{
                                                        text: '550',
                                                        font: {
                                                            size: 20,
                                                            weight: 'bold'
                                                        }
                                                    }, {
                                                        text: 'total'
                                                    }]
                                                }
                                            }
                                        }
                                    });


                                    _18to23_Age = res_1.reduce(function (i, v) { return i + v._18to23_Age; }, 0);
                                    _24to29_Age = res_1.reduce(function (i, v) { return i + v._24to29_Age; }, 0);
                                    _30to35_Age = res_1.reduce(function (i, v) { return i + v._30to35_Age; }, 0);
                                    _36to41_Age = res_1.reduce(function (i, v) { return i + v._36to41_Age; }, 0);
                                    _42toPlus_Age = res_1.reduce(function (i, v) { return i + v._42toPlus_Age; }, 0);

                                    $('#ageChart').remove();
                                    $('#ageChartD_Daily').append('<canvas id="ageChart"><canvas>');

                                    new Chart(document.getElementById("ageChart"), {
                                        type: 'pie',
                                        data: {
                                            labels: ["18 to 23", "24 to 29", "30 to 35", "36 to 41", "41 +"],
                                            datasets: [
                                                {
                                                    data: [_18to23_Age, _24to29_Age, _30to35_Age, _36to41_Age, _42toPlus_Age],
                                                    backgroundColor: ['#d81b60', '#3f51b5', '#22b573', '#ffb83b', '#bc1dc1']
                                                }]
                                        },
                                        options: {
                                            title: {
                                                display: true,
                                                text: 'Age'
                                            },
                                            plugins: {
                                                datalabels: {
                                                    display: true,
                                                    align: 'bottom',
                                                    backgroundColor: '#ccc',
                                                    borderRadius: 3,
                                                    font: {
                                                        size: 18,
                                                    }
                                                },
                                            }
                                        }
                                    });


                                    $('#day-chat-sepcial').modal({
                                        backdrop: 'static',
                                        keyboard: false
                                    });
                                    setTimeout(() => { loader.hidden(); }, 200)
                                } else {
                                    toastMsg(false, "Please try again!. No Data!");
                                    setTimeout(() => { loader.hidden(); }, 200)
                                }

                            }, () => {
                                toastMsg(false, "Please try again!. No Data!");
                                setTimeout(() => { loader.hidden(); }, 200)
                            });
                        } else {
                            toastMsg(false, "Please try again!. No Data!");
                            setTimeout(() => { loader.hidden(); }, 200)
                        }

                    }, () => {
                        toastMsg(false, "Please try again!. No Data!");
                        setTimeout(() => { loader.hidden(); }, 200)
                    })
                } else setTimeout(() => { loader.hidden(); }, 200)
            }

            $scope.setDrinksSpecialAna = (isMultpleDates, dates) => {

                $('#special-anly-drinks').remove();
                $("#special-anly-happy").empty();
                $('#special-anly-happy').append('<canvas height="80" id="special-anly-drinks"><canvas>');

                let dataFor = [], labelsFor = [];

                let _00to01 = 0, _01to02 = 0, _02to03 = 0, _03to04 = 0, _04to05 = 0, _05to06 = 0,
                    _06to07 = 0, _07to08 = 0, _08to09 = 0, _09to10 = 0, _10to11 = 0, _11to12 = 0,
                    _12to13 = 0, _13to14 = 0, _14to15 = 0, _15to16 = 0, _17to18 = 0, _18to19 = 0,
                    _19to20 = 0, _20to21 = 0, _21to22 = 0, _22to23 = 0, _23to24 = 0;

                if (isMultpleDates) {

                    AllCategoryChart.find({
                        filter: {
                            where: { or: $scope.drinksSpecialIds },
                            include: [{ relation: "happyHourDashDay" }]
                        }
                    }).$promise.then((res) => {

                        if (res && res.length) {

                            res = res.filter(m => m.happyHourDashDay && m.happyHourDashDay.id);

                            let sumValues = (aData, key) => aData.reduce(function (i, v) { return i + v[key]; }, 0);

                            dates.forEach(val => {

                                _00to01 = 0; _01to02 = 0; _02to03 = 0; _03to04 = 0; _04to05 = 0; _05to06 = 0;
                                _06to07 = 0; _07to08 = 0; _08to09 = 0; _09to10 = 0; _10to11 = 0; _11to12 = 0;
                                _12to13 = 0; _13to14 = 0; _14to15 = 0; _15to16 = 0; _17to18 = 0; _18to19 = 0;
                                _19to20 = 0; _20to21 = 0; _21to22 = 0; _22to23 = 0; _23to24 = 0;

                                let data = res.filter(m => m.happyHourDashDay.date == val.date);

                                _00to01 = sumValues(data, "_00to01"); _01to02 = sumValues(data, "_01to02");
                                _02to03 = sumValues(data, "_02to03"); _03to04 = sumValues(data, "_03to04");
                                _04to05 = sumValues(data, "_04to05"); _05to06 = sumValues(data, "_05to06");
                                _06to07 = sumValues(data, "_06to07"); _07to08 = sumValues(data, "_07to08");
                                _08to09 = sumValues(data, "_08to09"); _09to10 = sumValues(data, "_09to10");
                                _10to11 = sumValues(data, "_10to11"); _11to12 = sumValues(data, "_11to12");
                                _12to13 = sumValues(data, "_12to13"); _13to14 = sumValues(data, "_13to14");
                                _14to15 = sumValues(data, "_14to15"); _15to16 = sumValues(data, "_15to16");
                                _16to17 = sumValues(data, "_16to17"); _17to18 = sumValues(data, "_17to18");
                                _18to19 = sumValues(data, "_18to19"); _19to20 = sumValues(data, "_19to20");
                                _20to21 = sumValues(data, "_20to21"); _21to22 = sumValues(data, "_21to22");
                                _22to23 = sumValues(data, "_22to23"); _23to24 = sumValues(data, "_23to24");

                                let totalCnt = _00to01 + _01to02 + _02to03 + _03to04 + _04to05 + _05to06 + _06to07 +
                                    _07to08 + _08to09 + _09to10 + _10to11 + _11to12 + _12to13 + _13to14 + _14to15 +
                                    _15to16 + _16to17 + _17to18 + _18to19 + _19to20 + _20to21 + _21to22 + _22to23 + _23to24;

                                dataFor.push(totalCnt);

                                let fdate = new Date(val.date);

                                labelsFor.push(`${("0" + fdate.getDate()).slice(-2)}-${mShot[fdate.getMonth()]}-${fdate.getFullYear().toString().substring(2, 4)}`);
                            })

                            let mxLnt = Number(Math.max(...dataFor));
                            var cnTI = (parseInt(mxLnt / 10, 10) + 1) * 10;

                            new Chart(document.getElementById("special-anly-drinks"), {
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
                                                min: 0,
                                                max: cnTI //max value for the chart is 60
                                            }
                                        }]
                                    },
                                    onClick: function (evt) {
                                        try {
                                            if (this.getElementsAtEvent(evt)[0] && this.getElementsAtEvent(evt)[0]._model.label) {
                                                var activePointLabel = this.getElementsAtEvent(evt)[0]._model.label;
                                                // alert();
                                                loader.visible();
                                                $scope.setDateDrinksChart(activePointLabel, "DrinksSpecial", true);
                                            }
                                        } catch (e) { }
                                    }
                                }
                            });

                            setTimeout(() => { loader.hidden(); }, 200)
                        } else {
                            toastMsg(false, "Please try again!. No Data!");
                            $('#special-anly-drinks').remove();
                            $("#special-anly-happy").empty();
                            $('#special-anly-happy').append(` <div class="row"
                            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12" style="text-align:center;">
                                <h2 style="font-size: 1.2rem;font-weight:700;">No Data</h2>
                            </div>
                        </div>`);
                            setTimeout(() => { loader.hidden(); }, 200)
                        }
                    }, () => {
                        toastMsg(false, "Please try again!. No Data!");
                        setTimeout(() => { loader.hidden(); }, 200)
                    });
                } else setTimeout(() => { loader.hidden(); }, 200)
            }

            $scope.drinksSpecialIds = [];
            $scope.drinksSpecialDates = [];
            $scope.onChanCateDrinks = (data) => {

                loader.visible();
                let tDate = new Date();
                let offerDate = `${tDate.getFullYear()}-${("0" + (tDate.getMonth() + 1)).slice(-2)}-${("0" + tDate.getDate()).slice(-2)}T00:00:00.000Z`;
                if (data) {
                    if (typeof data == 'string') data = JSON.parse(data);
                    let { titleTxt, title, ownerId } = data;
                    if (titleTxt) {
                        $scope.dailySpecialIds = [];
                        HappyHourDashDay.find({
                            filter: {
                                where: {
                                    titleTxt, status: "Live", ownerId,
                                    date: { gte: offerDate }
                                }, fields: ["id", "date", "liveDate", "status", "category", "_category", "startTime", "endTime",
                                    "titleTxt", "title"], order: "dateNo asc"
                            }
                        }).$promise.then((res) => {
                            if (res && res.length) {
                                res.forEach(val => { $scope.drinksSpecialIds.push({ happyHourDashDayId: val.id }) });
                                $scope.drinksSpecialDates = res.reduce((acc, current) => {
                                    if (!acc.find(item => item.date === current.date))
                                        return acc.concat([current]);
                                    else
                                        return acc;
                                }, []).sort(function (a, b) {
                                    return new Date(b.date) - new Date(a.date);
                                }).reverse();
                                $scope.setDrinksSpecialAna(true, $scope.drinksSpecialDates);
                            }
                        });
                    }
                }
            }

            $scope.setDateLimitedChart = (val, special, accessPo = false) => {

                if (special == 'LimitedOffer') {
                    $('#special-limited-day').remove();
                    $("#special-chart-day").empty();
                    $('#special-chart-day').append('<canvas height="80" id="special-limited-day"><canvas>');
                    val = val.split('-');
                    let values;
                    if (accessPo) {
                        values = moment(`${val[2]}/${("0" + (mShot.findIndex(m => m == val[1]) + 1)).slice(-2)}/${("0" + val[0]).slice(-2)}`, "YY/MM/DD").format("YYYY-MM-DD");
                    } else {
                        values = `${val[2]}-${val[1]}-${val[0]}`
                    }

                    $scope.limitedSpecialIds = [];
                    ExclusiveOffer.find({
                        filter: {
                            where: {
                                ownerId: $scope.userId,
                                offerDate: `${values}T00:00:00.000Z`
                            },
                            fields: ["ownerId", "id", "date", "title", "titleTxt"]
                        }
                    }).$promise.then((res) => {

                        if (res && res.length) {

                            res.forEach(val => { $scope.limitedSpecialIds.push({ exclusiveOfferId: val.id }) });

                            let dataFor = [], labelsFor = ['00-01AM', '01-02AM', '02-03AM', '03-04AM', '04-05AM', '05-06AM', '06-07AM', '07-08AM', '08-09AM', '09-10AM', '10-11AM', '11-12AM', '12-01PM', '01-02PM', '02-03PM', '03-04PM', '04-05PM', '05-06PM', '06-07PM', '07-08PM', '08-09PM', '09-10PM', '10-11PM', '11-12AM'];

                            let fvalue = ["_00to01", "_01to02", "_02to03", "_03to04", "_04to05", "_05to06", "_06to07", "_07to08", "_08to09", "_09to10", "_10to11",
                                "_11to12", "_12to13", "_13to14", "_14to15", "_15to16", "_16to17", "_17to18", "_18to19", "_19to20", "_20to21", "_21to22", "_22to23", "_23to24"]

                            let objV = {
                                _00to01: 0, _01to02: 0, _02to03: 0, _03to04: 0, _04to05: 0, _05to06: 0,
                                _06to07: 0, _07to08: 0, _08to09: 0, _09to10: 0, _10to11: 0, _11to12: 0,
                                _12to13: 0, _13to14: 0, _14to15: 0, _15to16: 0, _17to18: 0, _18to19: 0,
                                _19to20: 0, _20to21: 0, _21to22: 0, _22to23: 0, _23to24: 0
                            }

                            let male = 0, female = 0, others = 0;

                            let _18to23_Age = 0, _24to29_Age = 0, _30to35_Age = 0, _36to41_Age = 0, _42toPlus_Age = 0;

                            ChartForExclusiveOffer.find({
                                filter: {
                                    where: { or: $scope.limitedSpecialIds },
                                    include: [{ relation: "exclusiveOffer" }]
                                }
                            }).$promise.then((res_1) => {

                                if (res_1 && res_1.length) {

                                    fvalue.forEach(vk => {
                                        objV[vk] = res_1.reduce(function (i, v) { return i + v[vk].view; }, 0);
                                        male += res_1.reduce(function (i, v) { return i + v[vk].male; }, 0);
                                        female += res_1.reduce(function (i, v) { return i + v[vk].female; }, 0);
                                        _18to23_Age += res_1.reduce(function (i, v) { return i + v[vk]._18to23_Age; }, 0);
                                        _24to29_Age += res_1.reduce(function (i, v) { return i + v[vk]._24to29_Age; }, 0);
                                        _30to35_Age += res_1.reduce(function (i, v) { return i + v[vk]._30to35_Age; }, 0);
                                        _36to41_Age += res_1.reduce(function (i, v) { return i + v[vk]._36to41_Age; }, 0);
                                        _42toPlus_Age += res_1.reduce(function (i, v) { return i + v[vk]._42toPlus_Age; }, 0);
                                    })

                                    dataFor.push(objV._00to01, objV._01to02, objV._02to03, objV._03to04, objV._04to05, objV._05to06, objV._06to07,
                                        objV._07to08, objV._08to09, objV._09to10, objV._10to11, objV._11to12, objV._12to13, objV._13to14, objV._14to15,
                                        objV._15to16, objV._16to17, objV._17to18, objV._18to19, objV._19to20, objV._20to21, objV._21to22, objV._22to23, objV._23to24);

                                    let mxLnt = Number(Math.max(...dataFor));
                                    var cnTI = (parseInt(mxLnt / 10, 10) + 1) * 10;

                                    new Chart(document.getElementById("special-limited-day"), {
                                        type: 'bar',
                                        data: {
                                            labels: labelsFor,
                                            datasets: [{
                                                label: `${val[2]}-${val[1]}-${val[0]} - View`,
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
                                                        min: 0,
                                                        max: cnTI //max value for the chart is 60
                                                    }
                                                }]
                                            }
                                        }
                                    });

                                    $('#MAndFChart').remove();
                                    $('#malefemaleD_D').append('<canvas id="MAndFChart"><canvas>');

                                    new Chart(document.getElementById("MAndFChart"), {
                                        type: 'doughnut',
                                        data: {
                                            labels: ["Male", "Female", "Others"],
                                            datasets: [{
                                                data: [male, female, others],
                                                backgroundColor: ['#388e3c', '#e53935', '#3f51b5']
                                            }]
                                        },
                                        options: {
                                            title: {
                                                display: true,
                                                text: 'Gender'
                                            },
                                            plugins: {
                                                datalabels: {
                                                    display: true,
                                                    backgroundColor: '#ccc',
                                                    borderRadius: 3,
                                                    font: {
                                                        color: 'red',
                                                        weight: 'bold',
                                                    }
                                                },
                                                doughnutlabel: {
                                                    labels: [{
                                                        text: '550',
                                                        font: {
                                                            size: 20,
                                                            weight: 'bold'
                                                        }
                                                    }, {
                                                        text: 'total'
                                                    }]
                                                }
                                            }
                                        }
                                    });

                                    $('#ageChart').remove();
                                    $('#ageChartD_Daily').append('<canvas id="ageChart"><canvas>');

                                    new Chart(document.getElementById("ageChart"), {
                                        type: 'pie',
                                        data: {
                                            labels: ["18 to 23", "24 to 29", "30 to 35", "36 to 41", "41 +"],
                                            datasets: [
                                                {
                                                    data: [_18to23_Age, _24to29_Age, _30to35_Age, _36to41_Age, _42toPlus_Age],
                                                    backgroundColor: ['#d81b60', '#3f51b5', '#22b573', '#ffb83b', '#bc1dc1']
                                                }]
                                        },
                                        options: {
                                            title: {
                                                display: true,
                                                text: 'Age'
                                            },
                                            plugins: {
                                                datalabels: {
                                                    display: true,
                                                    align: 'bottom',
                                                    backgroundColor: '#ccc',
                                                    borderRadius: 3,
                                                    font: {
                                                        size: 18,
                                                    }
                                                },
                                            }
                                        }
                                    });


                                    $('#day-chat-sepcial').modal({
                                        backdrop: 'static',
                                        keyboard: false
                                    });
                                    setTimeout(() => { loader.hidden(); }, 200);
                                } else {
                                    toastMsg(false, "Please try again!. No Data!");
                                    setTimeout(() => { loader.hidden(); }, 200);
                                }

                            }, () => {
                                toastMsg(false, "Please try again!. No Data!");
                                setTimeout(() => { loader.hidden(); }, 200);
                            });
                        } else {
                            toastMsg(false, "Please try again!. No Data!");
                            setTimeout(() => { loader.hidden(); }, 200);
                        }

                    }, () => {
                        toastMsg(false, "Please try again!. No Data!");
                        setTimeout(() => { loader.hidden(); }, 200);
                    })
                }
            }

            $scope.setLimitedSpecialAna = (isMultpleDates, dates) => {

                $('#special-anly-limited').remove();
                $("#special-anly-Offers").empty();
                $('#special-anly-Offers').append('<canvas height="80" id="special-anly-limited"><canvas>');

                let dataFor = [], labelsFor = [];

                let _00to01 = 0, _01to02 = 0, _02to03 = 0, _03to04 = 0, _04to05 = 0, _05to06 = 0,
                    _06to07 = 0, _07to08 = 0, _08to09 = 0, _09to10 = 0, _10to11 = 0, _11to12 = 0,
                    _12to13 = 0, _13to14 = 0, _14to15 = 0, _15to16 = 0, _17to18 = 0, _18to19 = 0,
                    _19to20 = 0, _20to21 = 0, _21to22 = 0, _22to23 = 0, _23to24 = 0;

                if (isMultpleDates) {

                    ChartForExclusiveOffer.find({
                        filter: {
                            where: { or: $scope.limitedSpecialIds },
                            include: [{ relation: "exclusiveOffer" }]
                        }
                    }).$promise.then((res) => {

                        if (res && res.length) {

                            res = res.filter(m => m.exclusiveOffer && m.exclusiveOffer.id);

                            let sumValues = (aData, key) => aData.reduce(function (i, v) { return i + v[key].view; }, 0);

                            dates.forEach(val => {

                                _00to01 = 0; _01to02 = 0; _02to03 = 0; _03to04 = 0; _04to05 = 0; _05to06 = 0;
                                _06to07 = 0; _07to08 = 0; _08to09 = 0; _09to10 = 0; _10to11 = 0; _11to12 = 0;
                                _12to13 = 0; _13to14 = 0; _14to15 = 0; _15to16 = 0; _17to18 = 0; _18to19 = 0;
                                _19to20 = 0; _20to21 = 0; _21to22 = 0; _22to23 = 0; _23to24 = 0;

                                let data = res.filter(m => m.exclusiveOffer.offerDate == val.offerDate);

                                _00to01 = sumValues(data, "_00to01"); _01to02 = sumValues(data, "_01to02");
                                _02to03 = sumValues(data, "_02to03"); _03to04 = sumValues(data, "_03to04");
                                _04to05 = sumValues(data, "_04to05"); _05to06 = sumValues(data, "_05to06");
                                _06to07 = sumValues(data, "_06to07"); _07to08 = sumValues(data, "_07to08");
                                _08to09 = sumValues(data, "_08to09"); _09to10 = sumValues(data, "_09to10");
                                _10to11 = sumValues(data, "_10to11"); _11to12 = sumValues(data, "_11to12");
                                _12to13 = sumValues(data, "_12to13"); _13to14 = sumValues(data, "_13to14");
                                _14to15 = sumValues(data, "_14to15"); _15to16 = sumValues(data, "_15to16");
                                _16to17 = sumValues(data, "_16to17"); _17to18 = sumValues(data, "_17to18");
                                _18to19 = sumValues(data, "_18to19"); _19to20 = sumValues(data, "_19to20");
                                _20to21 = sumValues(data, "_20to21"); _21to22 = sumValues(data, "_21to22");
                                _22to23 = sumValues(data, "_22to23"); _23to24 = sumValues(data, "_23to24");

                                let totalCnt = _00to01 + _01to02 + _02to03 + _03to04 + _04to05 + _05to06 + _06to07 +
                                    _07to08 + _08to09 + _09to10 + _10to11 + _11to12 + _12to13 + _13to14 + _14to15 +
                                    _15to16 + _16to17 + _17to18 + _18to19 + _19to20 + _20to21 + _21to22 + _22to23 + _23to24;

                                dataFor.push(totalCnt);

                                let fdate = new Date(val.offerDate);

                                labelsFor.push(`${("0" + fdate.getDate()).slice(-2)}-${mShot[fdate.getMonth()]}-${fdate.getFullYear().toString().substring(2, 4)}`);
                            })

                            let mxLnt = Number(Math.max(...dataFor));
                            var cnTI = (parseInt(mxLnt / 10, 10) + 1) * 10;

                            new Chart(document.getElementById("special-anly-limited"), {
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
                                                min: 0,
                                                max: cnTI //max value for the chart is 60
                                            }
                                        }]
                                    },
                                    onClick: function (evt) {
                                        try {
                                            if (this.getElementsAtEvent(evt)[0] && this.getElementsAtEvent(evt)[0]._model.label) {
                                                var activePointLabel = this.getElementsAtEvent(evt)[0]._model.label;
                                                // alert();
                                                loader.visible();
                                                $scope.setDateLimitedChart(activePointLabel, "LimitedOffer", true);
                                            }
                                        } catch (e) { }
                                    }
                                }
                            });
                            setTimeout(() => { loader.hidden(); }, 200)
                        } else {
                            $('#special-anly-limited').remove();
                            $("#special-anly-Offers").empty();
                            $('#special-anly-Offers').append(` <div class="row"
                            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12" style="text-align:center;">
                                <h2 style="font-size: 1.2rem;font-weight:700;">No Data</h2>
                            </div>
                        </div>`);
                            setTimeout(() => { loader.hidden(); }, 200)
                        }
                    }, () => {
                        toastMsg(false, "Please try again!. No Data!");
                        setTimeout(() => { loader.hidden(); }, 200);
                    });
                } else {
                    toastMsg(false, "Please try again!. No Data!");
                    setTimeout(() => { loader.hidden(); }, 200);
                }
            }

            $scope.limitedSpecialIds = [];
            $scope.limitedSpecialDates = [];
            $scope.onChanCateLimited = (data) => {

                loader.visible();
                let tDate = new Date();
                let offerDate = `${tDate.getFullYear()}-${("0" + (tDate.getMonth() + 1)).slice(-2)}-${("0" + tDate.getDate()).slice(-2)}T00:00:00.000Z`;
                if (data) {
                    if (typeof data == 'string') data = JSON.parse(data);
                    let { titleTxt, title, ownerId } = data;
                    if (titleTxt) {
                        $scope.limitedSpecialIds = [];
                        ExclusiveOffer.find({
                            filter: {
                                where: {
                                    titleTxt, status: "Live", ownerId,
                                    offerDate: { gte: offerDate }
                                }, fields: ["id", "offerDate", "liveDate", "status", "startTimeTxt", "offerExpiryTimeTxt",
                                    "titleTxt", "title"], order: "offerDate asc"
                            }
                        }).$promise.then((res) => {
                            if (res && res.length) {
                                res.forEach(val => { $scope.limitedSpecialIds.push({ exclusiveOfferId: val.id }) });
                                $scope.limitedSpecialDates = res.reduce((acc, current) => {
                                    if (!acc.find(item => item.offerDate === current.offerDate))
                                        return acc.concat([current]);
                                    else
                                        return acc;
                                }, []).sort(function (a, b) {
                                    return new Date(b.offerDate) - new Date(a.offerDate);
                                }).reverse();
                                $scope.setLimitedSpecialAna(true, $scope.limitedSpecialDates);
                            }
                        });
                    }
                }
            }

            $scope.tapTagClick = (data) => {
                $('#special-drinks-day').remove();
                $("#special-chart-day").empty();
                $('#special-anly-daily').remove();
                $('#special-anly-limited').remove();
                $('#special-anly-Offers,#special-anly-happy,#special-anly').empty();
                $('#special-anly-Offers,#special-anly-happy,#special-anly').append(` <div class="row"
                <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12" style="text-align:center;">
                    <h2 style="font-size: 1.2rem;font-weight:700;">No Data</h2>
                </div>
            </div>`);
                $scope.chartShow = false;
                $scope.specialTxtList = [];
                loader.visible();
                if (data) {
                    let tDate = new Date();
                    let offerDate = `${tDate.getFullYear()}-${("0" + (tDate.getMonth() + 1)).slice(-2)}-${("0" + tDate.getDate()).slice(-2)}T00:00:00.000Z`;
                    $scope.specialTxtList = [];
                    if (data == "#DailySpecial") {

                        DailySpecial.find({
                            filter: {
                                where: {
                                    status: "Live", ownerId: $scope.userId,
                                    date: { gte: offerDate }
                                }, fields: ["id", "title", "titleTxt"], order: "dateNo asc"
                            }
                        }).$promise.then((res) => {
                            if (res && res.length) {
                                let fgData = groupBy(res, "titleTxt");
                                let arraObj = [];
                                Object.keys(fgData).forEach((k, j) => {
                                    let { titleTxt, title } = res.find(m => m.titleTxt == k);
                                    arraObj.push({ titleTxt, title, ownerId: $scope.userId, special: "DailySpecial" });
                                })
                                $scope.specialTxtList = arraObj;
                                $scope.onChanCateDaily(arraObj[0]);
                            }
                        });

                    } else if (data == "#LimitedOffer" && $scope.userId) {

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
                                let { titleTxt, title } = res.find(m => m.titleTxt == k);
                                arraObj.push({ titleTxt, title, ownerId: $scope.userId, special: "LimitedOffer" });
                            })
                            $scope.specialTxtList = arraObj;
                            $scope.onChanCateLimited(arraObj[0]);
                        });
                    } else if (data == "#DrinkSpecial" && $scope.userId) {

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
                            Object.keys(fgData).forEach((k, j) => {
                                let { titleTxt, title } = res.find(m => m.titleTxt == k);
                                arraObj.push({ titleTxt, title, ownerId: $scope.userId, special: "DrinkSpecial" });
                            })
                            $scope.specialTxtList = arraObj;
                            $scope.onChanCateDrinks(arraObj[0]);
                        })
                    }
                }
                setTimeout(function () { loader.hidden() }, 400)
            }

            $scope.getBusinessName = () => {
                return $scope.businessDelection;
            };

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
                        $(".tab-M-ch").each(function () {
                            if ($(this).hasClass('active')) {
                                let arg = $(this).find('a').attr('data-target');
                                if (arg) {
                                    $scope.tapTagClick(arg);
                                } else toastMsg(false, "Please try again!");
                            } else toastMsg(false, "Please try again!");
                        });

                    }
                } else $("#businessErr").text('Please select the Business name');
            }

            $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

            if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

            if ($scope.userDetails.isAdmin == false) {
                $("#autocompleteBusiness").val($scope.userDetails.businessName);
                localStorage.removeItem("selectedVenue");
                $("#autocompleteBusiness").attr('disabled', true);
                $scope.userId = $scope.userDetails.id;
                localStorage.setItem("selectedVenue",
                    JSON.stringify({
                        venueId: $scope.userDetails.id, ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName
                    }));
                $scope.dailySpecialDates = [];
                $scope.drinksSpecialDates = [];
                $scope.tapTagClick("#DailySpecial");
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
                    $scope.dailySpecialDates = [];
                    $scope.drinksSpecialDates = [];
                    $scope.tapTagClick("#DailySpecial");
                }
            }
        }]);