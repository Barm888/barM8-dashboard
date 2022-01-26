angular
  .module('app')
  .controller('analyticsController', ['CustomerScanLoyalty','CustomerInterestWhatshot', 'InAppSpecial', "$scope", 'VisitHourCount', '$state', '$timeout', '$http', '$rootScope', 'moment', 'VisitMonthCount', 'VisitDayCount', 'VisitWeekCount', 'VisitMonthCount', 'Business', 'DashDate', 'Premium', 'DashLine', 'CategoryHourCount', 'BusinessHourCount', 'Customer', 'BusinessDayCount', 'CategoryDayCount', 'BusinessWeekCount', 'CategoryWeekCount', 'BusinessMonthCount', 'CategoryMonthCount', 'LoyaltyLines', 'CustomerScan','WhatshotAnalytics', 
  function (CustomerScanLoyalty,CustomerInterestWhatshot, InAppSpecial, $scope, VisitHourCount, $state, $timeout, $http, $rootScope, moment, VisitMonthCount, VisitDayCount, VisitWeekCount, VisitMonthCount, Business, DashDate, Premium, DashLine, CategoryHourCount, BusinessHourCount, Customer, BusinessDayCount, CategoryDayCount, BusinessWeekCount, CategoryWeekCount, BusinessMonthCount, CategoryMonthCount, LoyaltyLines, CustomerScan,WhatshotAnalytics) {

    $scope.dailyLineChart = {};

    $("#analyticsUserDetails").css('display', 'none');
    if ($scope.userId == "" || $scope.userId == null || $scope.userId == undefined) {
      $scope.userId = $rootScope.currentUser.id;
    }

    $scope.goBackUserDetails = () => {
      $("#analyticsUserDetails").css('display', 'none');
      $("#analyticsChart").css('display', 'block');
      $("#whatshotUserDetails").css('display', 'none');
      $("#inAppUserDetails").css('display', 'none');
      $("#BusinessSearchCntUserDetails").css('display', 'none');
      $("#loyaltyCustomerDetails").css('display', 'none');
    }
    
    var currentWeek = new Date;

    $scope.dailyPieInterestCnt = [0, 0];
    $scope.BusinessHourSearchCntId = "";

    var dailyValue = {
      "series": ["Visit"],
      "data": [$scope.dailyPieInterestCnt],
      "labels": ["Interest", "Not Interest"],
      "colours": [{
        fill: true,
        backgroundColor: [
          '#50af54',
          '#e91e63']
      }],
      options: {
        responsive: true,
        legend: { display: true },
        hover: {
          mode: 'label'
        }
      }
    };
    $scope.dailyInterestCount = dailyValue;

    $scope.whatshotevents = [];
    $scope.whatshotDatechange = (arg, id) => {
      $scope.whatshotevents = [];
      WhatshotAnalytics.find({ filter: { where: { ownerId: id, date: `${arg}T00:00:00.000Z` } ,fields :["teaserMessage","id","dashLineId"] } }).$promise.then((res) => {
        if (res && res.length > 0) {
          $scope.whatshotevents = [];
          for (var data of res) {
            $scope.whatshotevents.push({ teaserMessage: data.teaserMessage, id: data.id, dashLineId: data.dashLineId });
          }
        }
      }, (err) => {
        console.log(JSON.stringify(err));
      });
      $scope.dailyPieInterestCnt = [0, 0];
          dailyValue = {
            "series": ["Visit"],
            "data": [$scope.dailyPieInterestCnt],
            "labels": ["Interest", "Not Interest"],
            "colours": [{
              fill: true,
              backgroundColor: [
                '#50af54',
                '#e91e63']
            }],
            options: {
              responsive: true,
              legend: { display: true },
              hover: {
                mode: 'label'
              },
              title: {
                display: true,
                text: 'Interest & Not Interest'
              }
            }
          };
          $scope.dailyInterestCount = dailyValue;
    };

    $scope.whatsEventsSelecetd = (id) => {
      $scope.dailyPieInterestLabel = ["Interest", "Not Interest "];
      $scope.dailyPieInterestCnt = [0, 0];
      $scope.whatshotDashLineId = id;
      if ($scope.whatshotDashLineId != 'select') {
        CustomerInterestWhatshot.find({ filter: { where: { dashLineId: id } } }).$promise.then((res) => {
          if (res && res.length > 0) {
            var interested = 0, notInterestedCount = 0;
            for (var data of res) {
              if (data.status == 'Interested') {
                ++interested;
              } else {
                ++notInterestedCount;
              }
            }
            $scope.dailyPieInterestCnt = [interested, notInterestedCount];
            dailyValue = {
              "series": ["Visit"],
              "data": [$scope.dailyPieInterestCnt],
              "labels": ["Interest", "Not Interest"],
              "colours": [{
                fill: true,
                backgroundColor: [
                  '#50af54',
                  '#e91e63']
              }],
              options: {
                responsive: true,
                legend: { display: true },
                hover: {
                  mode: 'label'
                },
                title: {
                  display: true,
                  text: 'Interest & Not Interest'
                }
              }
            };
            $scope.dailyInterestCount = dailyValue;
          } else {
            $scope.dailyPieInterestCnt = [0, 0];
            dailyValue = {
              "series": ["Visit"],
              "data": [$scope.dailyPieInterestCnt],
              "labels": ["Interest", "Not Interest"],
              "colours": [{
                fill: true,
                backgroundColor: [
                  '#50af54',
                  '#e91e63']
              }],
              options: {
                responsive: true,
                legend: { display: true },
                hover: {
                  mode: 'label'
                },
                title: {
                  display: true,
                  text: 'Interest & Not Interest'
                }
              }
            };
            $scope.dailyInterestCount = dailyValue;
          }

        }, (err) => {
          console.log(JSON.stringify(err));
        });
      }
    };

    var d = new Date();
    var strDate = d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice( -2 ) + "-" + ('0' +  + d.getDate()).slice( -2 );

    $scope.useremail = $rootScope.currentUser.email;
    $scope.userId = "";
    if ($rootScope.currentUser.email == "admin@barm8.com.au") {
      Business.find({ filter: { where: { status: "active" }, "fields": ["businessName", "id", "email"] } }).$promise.then((res) => {
        $scope.businessDelection = res;
        $scope.userId = $rootScope.currentUser.id;
      }, (err) => {
        console.log(JSON.stringify());
      })
    }
    else {
      $scope.userId = $rootScope.currentUser.id;
    }

    $scope.getBusinessName = () => {
      return $scope.businessDelection;
    };

    $scope.dailyNewCnt = 0, $scope.dailyReturningCnt = 0;

    $scope.dailydateChange = function (arg) {

      if (!arg) {
        strDate = d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice( -2 ) + "-" + ('0' +  + d.getDate()).slice( -2 );
        arg = strDate;
      } else {
        strDate = arg;
      }

      $scope.whatshotDatechange(strDate, $scope.userId);
      $scope.dailyChartInit($scope.userId, strDate);
      $scope.inAppSpecialInterectCountDaily(strDate);
    };

    $scope.dailyChartInit = (id, selectDate) => {

      VisitHourCount.find({ "filter": { "where": { "and": [{ "ownerId": id }, { "date": { "gte": `${selectDate}T00:00:00.000Z` } }, { "date": { "lte": `${selectDate}T23:59:59.000Z` } }] } } }).$promise
        .then(function (result) {

          //Daily hour visit
          $scope.dailyLineChart._12amto1am = 0, $scope.dailyLineChart._1amto2am = 0, $scope.dailyLineChart._2amto3am = 0, $scope.dailyLineChart._3amto4am = 0, $scope.dailyLineChart._4amto5am = 0, $scope.dailyLineChart._5amto6am = 0, $scope.dailyLineChart._6amto7am = 0, $scope.dailyLineChart._7amto8am = 0;
          $scope.dailyLineChart._8amto9am = 0, $scope.dailyLineChart._9amto10am = 0, $scope.dailyLineChart._10amto11am = 0, $scope.dailyLineChart._11amto12pm = 0, $scope.dailyLineChart._12pmto1pm = 0, $scope.dailyLineChart._1pmto2pm = 0, $scope.dailyLineChart._2pmto3pm = 0; $scope.dailyLineChart._3pmto4pm = 0;
          $scope.dailyLineChart._4pmto5pm = 0, $scope.dailyLineChart._5pmto6pm = 0, $scope.dailyLineChart._6pmto7pm = 0, $scope.dailyLineChart._7pmto8pm = 0, $scope.dailyLineChart._8pmto9pm = 0, $scope.dailyLineChart._9pmto10pm = 0, $scope.dailyLineChart._10pmto11pm = 0, $scope.dailyLineChart._11pmto12am = 0;

          //Male and Female Count
          $scope.dailyLineChart.male = 0, $scope.dailyLineChart.female = 0;

          //male & Female Count
          $scope.dailyLineChart._16to20 = 0, $scope.dailyLineChart._20to25 = 0, $scope.dailyLineChart._25to30 = 0, $scope.dailyLineChart._30to35 = 0, $scope.dailyLineChart._35plus = 0;

          //New & Return
          $scope.dailyLineChart.newCustomerCount = 0, $scope.dailyLineChart.returningCustomerCount = 0; $scope.dailyNewCnt = 0, $scope.dailyReturningCnt = 0;

          $scope.bardailymaleid = [];
          $scope.bardailyfemaleid = [];

          if (result.length > 0) {

            $scope.idForVisithourCount = result[0].id;
            //daily per hour Cnt
            $scope.dailyLineChart._12amto1am = result[0]._12amto1am, $scope.dailyLineChart._1amto2am = result[0]._1amto2am, $scope.dailyLineChart._2amto3am = result[0]._2amto3am, $scope.dailyLineChart._3amto4am = result[0]._3amto4am;
            $scope.dailyLineChart._4amto5am = result[0]._4amto5am, $scope.dailyLineChart._5amto6am = result[0]._5amto6am, $scope.dailyLineChart._6amto7am = result[0]._6amto7am, $scope.dailyLineChart._7amto8am = result[0]._7amto8am;
            $scope.dailyLineChart._8amto9am = result[0]._8amto9am, $scope.dailyLineChart._9amto10am = result[0]._9amto10am, $scope.dailyLineChart._10amto11am = result[0]._10amto11am, $scope.dailyLineChart._11amto12pm = result[0]._11amto12pm;
            $scope.dailyLineChart._12pmto1pm = result[0]._12pmto1pm, $scope.dailyLineChart._1pmto2pm = result[0]._1pmto2pm, $scope.dailyLineChart._2pmto3pm = result[0]._2pmto3pm, $scope.dailyLineChart._3pmto4pm = result[0]._3pmto4pm;
            $scope.dailyLineChart._4pmto5pm = result[0]._4pmto5pm, $scope.dailyLineChart._5pmto6pm = result[0]._5pmto6pm, $scope.dailyLineChart._6pmto7pm = result[0]._6pmto7pm, $scope.dailyLineChart._7pmto8pm = result[0]._7pmto8pm;
            $scope.dailyLineChart._8pmto9pm = result[0]._8pmto9pm, $scope.dailyLineChart._9pmto10pm = result[0]._9pmto10pm, $scope.dailyLineChart._10pmto11pm = result[0]._10pmto11pm, $scope.dailyLineChart._11pmto12am = result[0]._11pmto12am;

            //  male and female Id
            $scope.bardailymaleid = result[0].maleArray;
            $scope.bardailyfemaleid = result[0].femaleArray;

            //Daily New Chart
            $scope.dailyNewCnt = result[0].newCustomerCount;
            $scope.dailyReturningCnt = result[0].returningCustomerCount;

            //Male and female Array
            if (result[0].maleArray) {
              $scope.piedailymaleid = result[0].maleArray;
            }
            if (result[0].femaleArray) {
              $scope.piedailyfemaleid = result[0].femaleArray;
            }

            //Male and Female Count
            $scope.dailyLineChart.male = result[0].male;
            $scope.dailyLineChart.female = result[0].female;

            //Age count
            $scope.dailyLineChart._16to20 = result[0]._16to20;
            $scope.dailyLineChart._20to25 = result[0]._20to25;
            $scope.dailyLineChart._25to30 = result[0]._25to30;
            $scope.dailyLineChart._30to35 = result[0]._30to35;
            $scope.dailyLineChart._35plus = result[0]._35plus;
          }

          var biggest = Math.max.apply(null, [$scope.dailyLineChart._12amto1am, $scope.dailyLineChart._1amto2am, $scope.dailyLineChart._2amto3am, $scope.dailyLineChart._3amto4am, $scope.dailyLineChart._4amto5am, $scope.dailyLineChart._5amto6am,
          $scope.dailyLineChart._6amto7am, $scope.dailyLineChart._7amto8am, $scope.dailyLineChart._8amto9am, $scope.dailyLineChart._9amto10am, $scope.dailyLineChart._10amto11am, $scope.dailyLineChart._11amto12pm,
          $scope.dailyLineChart._12pmto1pm, $scope.dailyLineChart._1pmto2pm, $scope.dailyLineChart._2pmto3pm, $scope.dailyLineChart._3pmto4pm, $scope.dailyLineChart._4pmto5pm, $scope.dailyLineChart._5pmto6pm,
          $scope.dailyLineChart._6pmto7pm, $scope.dailyLineChart._7pmto8pm, $scope.dailyLineChart._8pmto9pm, $scope.dailyLineChart._9pmto10pm, $scope.dailyLineChart._10pmto11pm, $scope.dailyLineChart._11pmto12am]);

          //  visit hour chart
          var barDailyLive = {
            "series": ["Visit"],
            "data": [[$scope.dailyLineChart._12amto1am, $scope.dailyLineChart._1amto2am, $scope.dailyLineChart._2amto3am, $scope.dailyLineChart._3amto4am, $scope.dailyLineChart._4amto5am, $scope.dailyLineChart._5amto6am,
            $scope.dailyLineChart._6amto7am, $scope.dailyLineChart._7amto8am, $scope.dailyLineChart._8amto9am, $scope.dailyLineChart._9amto10am, $scope.dailyLineChart._10amto11am, $scope.dailyLineChart._11amto12pm,
            $scope.dailyLineChart._12pmto1pm, $scope.dailyLineChart._1pmto2pm, $scope.dailyLineChart._2pmto3pm, $scope.dailyLineChart._3pmto4pm, $scope.dailyLineChart._4pmto5pm, $scope.dailyLineChart._5pmto6pm,
            $scope.dailyLineChart._6pmto7pm, $scope.dailyLineChart._7pmto8pm, $scope.dailyLineChart._8pmto9pm, $scope.dailyLineChart._9pmto10pm, $scope.dailyLineChart._10pmto11pm, $scope.dailyLineChart._11pmto12am]],
            "labels": ['00-01AM', '01-02AM', '02-03AM', '03-04AM', '04-05AM', '05-06AM', '06-07AM', '07-08AM', '08-09AM', '09-10AM', '10-11AM', '11-12AM', '12-01PM', '01-02PM', '02-03PM', '03-04PM', '04-05PM', '05-06PM', '06-07PM', '07-08PM', '08-09PM', '09-10PM', '10-11PM', '11-12PM'],
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
                    max: (biggest + 10)
                  }
                }]
              },
              onClick: handleClick,
              title: {
                display: true,
                text: 'Customer visit per hour'
              }
            }
          };
          $scope.barDaily = barDailyLive;

          $scope.piedailymaleid = [];
          $scope.piedailyfemaleid = [];

          //Daily male and Female
          var pieDailyGender = {
            "series": ["Visit"],
            "data": [[$scope.dailyLineChart.male, $scope.dailyLineChart.female]],
            "labels": ["Male", "Female"],
            "colours": [{
              fill: true,
              backgroundColor: [
                '#f27521',
                '#0078a6']
            }],
            options: {
              responsive: true,
              legend: { display: true },
              hover: {
                mode: 'label'
              },
              title: {
                display: true,
                text: 'Male & Female'
              }
            }
          };
          $scope.pieDailyG = pieDailyGender;


          //Daily Age Count
          var pieAgeDaily = {
            "series": ["Visit"],
            "data": [[$scope.dailyLineChart._16to20, $scope.dailyLineChart._20to25, $scope.dailyLineChart._25to30, $scope.dailyLineChart._30to35, $scope.dailyLineChart._35plus]],
            "labels": ["16 - 20", "20 - 25", "25 - 30", "30 - 35", "35plus"],
            "colours": [{
              fill: true,
              backgroundColor: [
                '#0078a6',
                '#f27521', 'green', 'red', 'blue']
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

          //Daily  New and return count
          $scope.doughnutDailylabels = ["New", "Returning"];
          $scope.doughnutDailydata = [$scope.dailyNewCnt, $scope.dailyReturningCnt];
          $scope.doughnutDailyColor = ['#2a57ab', '#27ae61'];
          $scope.doughnutDailyoptions = {
            legend: { display: true },
            responsive: true,
            title: {
              display: true,
              text: 'New & Returning'
            }
          }
        });

        LoyaltyLines.find({ filter: { where: { ownerId: id } } }).$promise.then((res) => {

          $scope.loyalityBusinessId= id;
          
        var brone = 0, silver = 0, gold = 0, platinum = 0, vip = 0;
        $scope.loyalityIds = [];
        if (res) {
          for (var data of res) {
            if (data.level == "Bronze") {
              ++brone;
            }
            else if (data.level == "Silver") {
              ++silver;
            }
            else if (data.level == "Gold") {
              ++gold;
            }
            else if (data.level == "Platinum") {
              ++platinum;
            }
            else if (data.level == "Vip") {
              ++vip;
            }
          }
        }
        $scope.layaltyChartlabels = ["Bronze", "Silver", "Gold", "Platinum", "Vip"];
        $scope.layaltyChartdata = [brone, silver, gold, platinum, vip];

        //Daily male and Female
        var pieDailyLoyalty = {
          "series": ["Visit"],
          "data": [[brone, silver, gold, platinum, vip]],
          "labels": ["Bronze", "Silver", "Gold", "Platinum", "Vip"],
          "colours": [{
            fill: true,
            backgroundColor: [
              '#cd8032', '#c0c0c0', '#e8d26c', '#efefef', '#f9a141']
          }],
          options: {
            responsive: true,
            legend: { display: true },
            hover: {
              mode: 'label'
            },
            title: {
              display: true,
              text: 'Loyalty'
            }
          }
        };
        $scope.pieDailyLoyaltyChart = pieDailyLoyalty;

      }, (err) => {
        console.log(JSON.stringify(err));
      });

      BusinessHourCount.find({ filter: { where: { date: `${selectDate}T00:00:00.000Z`, "ownerId": id } } }).$promise
        .then(function (result) {

          //Daily hour visit
          let SearchCnt_12amto1am = 0, SearchCnt_1amto2am = 0, SearchCnt_2amto3am = 0, SearchCnt_3amto4am = 0, SearchCnt_4amto5am = 0, SearchCnt_5amto6am = 0, SearchCnt_6amto7am = 0, SearchCnt_7amto8am = 0, SearchCnt_8amto9am = 0, SearchCnt_9amto10am = 0,
            SearchCnt_10amto11am = 0, SearchCnt_11amto12pm = 0, SearchCnt_12pmto1pm = 0, SearchCnt_1pmto2pm = 0, SearchCnt_2pmto3pm = 0, SearchCnt_3pmto4pm = 0, SearchCnt_4pmto5pm = 0, SearchCnt_5pmto6pm = 0, SearchCnt_6pmto7pm = 0, SearchCnt_7pmto8pm = 0,
            SearchCnt_8pmto9pm = 0, SearchCnt_9pmto10pm = 0, SearchCnt_10pmto11pm = 0, SearchCnt_11pmto12am = 0;

          if (result.length > 0) {
            $scope.BusinessHourSearchCntId = result[0].id;
            SearchCnt_12amto1am = result[0]._12amto1am, SearchCnt_1amto2am = result[0]._1amto2am, SearchCnt_2amto3am = result[0]._2amto3am, SearchCnt_3amto4am = result[0]._3amto4am, SearchCnt_4amto5am = result[0]._4amto5am,
              SearchCnt_5amto6am = result[0]._5amto6am, SearchCnt_6amto7am = result[0]._6amto7am, SearchCnt_7amto8am = result[0]._7amto8am, SearchCnt_8amto9am = result[0]._8amto9am, SearchCnt_9amto10am = result[0]._9amto10am,
              SearchCnt_10amto11am = result[0]._10amto11am, SearchCnt_11amto12pm = result[0]._11amto12pm, SearchCnt_12pmto1pm = result[0]._12pmto1pm, SearchCnt_1pmto2pm = result[0]._1pmto2pm, SearchCnt_2pmto3pm = result[0]._2pmto3pm,
              SearchCnt_3pmto4pm = result[0]._3pmto4pm, SearchCnt_4pmto5pm = result[0]._4pmto5pm, SearchCnt_5pmto6pm = result[0]._5pmto6pm, SearchCnt_6pmto7pm = result[0]._6pmto7pm, SearchCnt_7pmto8pm = result[0]._7pmto8pm,
              SearchCnt_8pmto9pm = result[0]._8pmto9pm, SearchCnt_9pmto10pm = result[0]._9pmto10pm, SearchCnt_10pmto11pm = result[0]._10pmto11pm, SearchCnt_11pmto12am = result[0]._11pmto12am;

          }

          var biggest = Math.max.apply(null, [SearchCnt_12amto1am, SearchCnt_1amto2am, SearchCnt_2amto3am, SearchCnt_3amto4am, SearchCnt_4amto5am, SearchCnt_5amto6am, SearchCnt_6amto7am, SearchCnt_7amto8am, SearchCnt_8amto9am, SearchCnt_9amto10am,
            SearchCnt_10amto11am, SearchCnt_11amto12pm, SearchCnt_12pmto1pm, SearchCnt_1pmto2pm, SearchCnt_2pmto3pm, SearchCnt_3pmto4pm, SearchCnt_4pmto5pm, SearchCnt_5pmto6pm, SearchCnt_6pmto7pm, SearchCnt_7pmto8pm, SearchCnt_8pmto9pm,
            SearchCnt_9pmto10pm, SearchCnt_10pmto11pm, SearchCnt_11pmto12am]);

          //Daily Hits pie Chart
          // var ctx = $("#line-chartcanvas");

          //  visit hour chart
          var BusinessCountbarDailyLive = {
            "series": ["Hits"],
            "data": [[SearchCnt_12amto1am, SearchCnt_1amto2am, SearchCnt_2amto3am, SearchCnt_3amto4am, SearchCnt_4amto5am, SearchCnt_5amto6am, SearchCnt_6amto7am, SearchCnt_7amto8am, SearchCnt_8amto9am, SearchCnt_9amto10am,
              SearchCnt_10amto11am, SearchCnt_11amto12pm, SearchCnt_12pmto1pm, SearchCnt_1pmto2pm, SearchCnt_2pmto3pm, SearchCnt_3pmto4pm, SearchCnt_4pmto5pm, SearchCnt_5pmto6pm, SearchCnt_6pmto7pm, SearchCnt_7pmto8pm, SearchCnt_8pmto9pm,
              SearchCnt_9pmto10pm, SearchCnt_10pmto11pm, SearchCnt_11pmto12am]],
            "labels": ['00-01AM', '01-02AM', '02-03AM', '03-04AM', '04-05AM', '05-06AM', '06-07AM', '07-08AM', '08-09AM', '09-10AM', '10-11AM', '11-12AM', '12-01PM', '01-02PM', '02-03PM', '03-04PM', '04-05PM', '05-06PM', '06-07PM', '07-08PM', '08-09PM', '09-10PM', '10-11PM', '11-12PM'],
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
                    max: (biggest + 10)
                  }
                }]
              },
              onClick: handleClick,
              title: {
                display: true,
                text: 'Business Hits'
              }
            }
          };
          $scope.BusinessCountbarDaily = BusinessCountbarDailyLive;

        });


      //categoery Hits
      $scope.dailyChartCategoryList = [];
      CategoryHourCount.find({ filter: { where: { date: `${selectDate}T00:00:00.000Z` } } }).$promise
        .then(function (result) {
          $scope.dailyChartCategoryList = [];
          if (result.length > 0) {
            $.each(result, function (k, e) {
              if (e.category) {
                $scope.dailyChartCategoryList.push({ category: e.category, id: e.id });
              }
            });
          }
        });

     
    };

    //Daily InappSpecial Interest Count
    $scope.inAppSpecialInterectCountDaily = (date) => {

      var inAppSpecialInitChart = {
        "series": ["Visit"],
        "data": [[0, 0]],
        "labels": ["Interest", "Not Interest"],
        "colours": [{
          fill: true,
          backgroundColor: [
            '#50af54',
            '#e91e63']
        }],
        options: {
          responsive: true,
          legend: { display: true },
          hover: {
            mode: 'label'
          },
          title: {
            display: true,
            text: 'Interest & Not Interest'
          }
        }
      };
      $scope.inAppSpecialChart = inAppSpecialInitChart;

      InAppSpecial.find({ filter: { where: { and: [{ date: { gte: `${date}T00:00:00.000Z` } }, { date: { lte: `${date}T23:59:59.000Z` } }, { ownerId: $scope.userId }] }, fields: { id: true, category: true,item:true } } }).$promise.then((res) => {
        $scope.inAppSpecialCategory = [];
        if (res.length > 0) {
          for (var data of res) {
            $scope.inAppSpecialCategory.push({ id: data.id, category: data.item  +" - "+  data.category });
          }
        }
      }, (err) => {
        console.log(JSON.stringify(err));
      });
    };
    //Selected InAppSpecial category
    $scope.inAppSpecialInterAndNotInterChange = (arg) => {
      if (arg != "" && arg != null && arg != undefined) {

        InAppSpecial.find({ filter: { where: { id: arg }, include: { relation: "inAppSpecialInterCustomers", scope: { fields: { id: true, status: true, customerId: true } } } } }).$promise.then((res) => {
          $scope.inAppSpecialInterestedCnt = 0, $scope.inAppSpecialNotInterestedCnt = 0, $scope.inAppSpecialCustomerId = "";

          if (res && res[0].inAppSpecialInterCustomers &&  res[0].inAppSpecialInterCustomers.length > 0) {

            $scope.inAppSpecialCustomerId = arg;

            for (var data of res[0].inAppSpecialInterCustomers) {
              if (data.status == "Interested") {
                ++$scope.inAppSpecialInterestedCnt;
              } else if (data.status == "NotInterested") {
                ++$scope.inAppSpecialNotInterestedCnt;
              }
            }

            $scope.inAppSpecialPieInterestCnt = [$scope.inAppSpecialInterestedCnt, $scope.inAppSpecialNotInterestedCnt];

            var inAppSpecialInitChart = {
              "series": ["Visit"],
              "data": [$scope.inAppSpecialPieInterestCnt],
              "labels": ["Interest", "Not Interest"],
              "colours": [{
                fill: true,
                backgroundColor: [
                  '#50af54',
                  '#e91e63']
              }],
              options: {
                responsive: true,
                legend: { display: true },
                hover: {
                  mode: 'label'
                }
              }
            };
            $scope.inAppSpecialChart = inAppSpecialInitChart;
          }else{
            $scope.inAppSpecialPieInterestCnt = [0, 0];

            var inAppSpecialInitChart = {
              "series": ["Visit"],
              "data": [$scope.inAppSpecialPieInterestCnt],
              "labels": ["Interest", "Not Interest"],
              "colours": [{
                fill: true,
                backgroundColor: [
                  '#50af54',
                  '#e91e63']
              }],
              options: {
                responsive: true,
                legend: { display: true },
                hover: {
                  mode: 'label'
                }
              }
            };
            $scope.inAppSpecialChart = inAppSpecialInitChart;
          }
        }, (err) => {
          toastr.error('Please try again!');
          toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
        });
      } else {
        toastr.error('Please select the Category!');
        toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
      }
    };
    $scope.inAppSpecialCustomerDetails = [];
    $scope.inAppSpecialCustomerDetailsGet = (id) => {
      if (id != "" && id != undefined && id != null) {
        InAppSpecial.find({
          filter: {
            where: { id: id }, include: {
              relation: "inAppSpecialInterCustomers",
              scope: { include: "customer" }
            }
          }
        }).$promise.then((res) => {
          $("#analyticsChart").css('display', 'none');
          $("#inAppUserDetails").css('display', 'block');
          if (res.length > 0) {
            $scope.inAppSpecialCustomerDetails = [];
            for (var data of res[0].inAppSpecialInterCustomers) {
              if (data.customer) {
                $scope.inAppSpecialCustomerDetails.push({
                  firstName: data.customer.firstName, lastName: data.customer.lastName, status: data.status, gender: data.customer.gender,
                  mobile: data.customer.mobile, email: data.customer.email, interestTime: data.interestTime, country: data.country, redeemCouponTimeString : data.redeemCouponTimeString
                });
              }
            }
          }
        }, (err) => {
          toastr.error('Please Try again!');
          toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
        });
      } else {
        toastr.error('Please Try again!');
        toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
      }
    };

    //loyality ng-click
    $scope.loyalityClick = (id) => {
      $scope.loyaltyCustomerDetails=[];
      LoyaltyLines.find({ filter: { where: { ownerId: id }, include: { relation: "customer" } } }).$promise.then((CustomerScanres)=>{
        for (var data of CustomerScanres) {
          $scope.loyaltyCustomerDetails.push({
            scanTime: data.scanTime, points: data.points, level: data.level, firstName: data.customer.firstName,
            lastName: data.customer.lastName, mobile: data.customer.mobile, email: data.customer.email, gender: data.customer.gender
          });
        }
        if ($scope.loyaltyCustomerDetails.length > 0) {
          $("#analyticsChart").css('display', 'none');
          $("#loyaltyCustomerDetails").css('display', 'block');
        }
        console.log(JSON.stringify($scope.loyaltyCustomerDetails));
      },(CustomerScanerr)=>{

      });
    };

    //Category Search
    $scope.dailyChartCategorySelected = (id) => {
      if (id != 'select') {
        CategoryHourCount.find({ filter: { where: { id: id } } }).$promise
          .then(function (result) {

            var CategoryCnt_12amto1am = 0, CategoryCnt_1amto2am = 0, CategoryCnt_2amto3am = 0, CategoryCnt_3amto4am = 0, CategoryCnt_4amto5am = 0, CategoryCnt_5amto6am = 0, CategoryCnt_6amto7am = 0, CategoryCnt_7amto8am = 0, CategoryCnt_8amto9am = 0,
              CategoryCnt_9amto10am = 0, CategoryCnt_10amto11am = 0, CategoryCnt_11amto12pm = 0, CategoryCnt_12pmto1pm = 0, CategoryCnt_1pmto2pm = 0, CategoryCnt_2pmto3pm = 0, CategoryCnt_3pmto4pm = 0, CategoryCnt_4pmto5pm = 0, CategoryCnt_5pmto6pm = 0,
              CategoryCnt_6pmto7pm = 0, CategoryCnt_7pmto8pm = 0, CategoryCnt_8pmto9pm = 0, CategoryCnt_9pmto10pm = 0, CategoryCnt_10pmto11pm = 0, CategoryCnt_11pmto12am = 0;

            if (result.length > 0) {
              CategoryCnt_12amto1am = result[0]._12amto1am, CategoryCnt_1amto2am = result[0]._1amto2am, CategoryCnt_2amto3am = result[0]._2amto3am, CategoryCnt_3amto4am = result[0]._3amto4am, CategoryCnt_4amto5am = result[0]._4amto5am,
                CategoryCnt_5amto6am = result[0]._5amto6am, CategoryCnt_6amto7am = result[0]._6amto7am, CategoryCnt_7amto8am = result[0]._7amto8am, CategoryCnt_8amto9am = result[0]._8amto9am, CategoryCnt_9amto10am = result[0]._9amto10am,
                CategoryCnt_10amto11am = result[0]._10amto11am, CategoryCnt_11amto12pm = result[0]._11amto12pm, CategoryCnt_12pmto1pm = result[0]._12pmto1pm, CategoryCnt_1pmto2pm = result[0]._1pmto2pm, CategoryCnt_2pmto3pm = result[0]._2pmto3pm,
                CategoryCnt_3pmto4pm = result[0]._3pmto4pm, CategoryCnt_4pmto5pm = result[0]._4pmto5pm, CategoryCnt_5pmto6pm = result[0]._5pmto6pm, CategoryCnt_6pmto7pm = result[0]._6pmto7pm, CategoryCnt_7pmto8pm = result[0]._7pmto8pm,
                CategoryCnt_8pmto9pm = result[0]._8pmto9pm, CategoryCnt_9pmto10pm = result[0]._9pmto10pm, CategoryCnt_10pmto11pm = result[0]._10pmto11pm, CategoryCnt_11pmto12am = result[0]._11pmto12am;
            }

            var barDailyCategoryLive = {
              "series": ["Visit"],
              "data": [[CategoryCnt_12amto1am, CategoryCnt_1amto2am, CategoryCnt_2amto3am, CategoryCnt_3amto4am, CategoryCnt_4amto5am, CategoryCnt_5amto6am, CategoryCnt_6amto7am, CategoryCnt_7amto8am, CategoryCnt_8amto9am,
                CategoryCnt_9amto10am, CategoryCnt_10amto11am, CategoryCnt_11amto12pm, CategoryCnt_12pmto1pm, CategoryCnt_1pmto2pm, CategoryCnt_2pmto3pm, CategoryCnt_3pmto4pm, CategoryCnt_4pmto5pm, CategoryCnt_5pmto6pm,
                CategoryCnt_6pmto7pm, CategoryCnt_7pmto8pm, CategoryCnt_8pmto9pm, CategoryCnt_9pmto10pm, CategoryCnt_10pmto11pm, CategoryCnt_11pmto12am]],
              "labels": ['00-01AM', '01-02AM', '02-03AM', '03-04AM', '04-05AM', '05-06AM', '06-07AM', '07-08AM', '08-09AM', '09-10AM', '10-11AM', '11-12AM', '12-01PM', '01-02PM', '02-03PM', '03-04PM', '04-05PM', '05-06PM', '06-07PM', '07-08PM', '08-09PM', '09-10PM', '10-11PM', '11-12PM'],
              "colours": [{ // default
                backgroundColor: 'rgba(233, 30, 99, 1)',
                pointBackgroundColor: 'rgba(59, 89, 152,1)',
                borderColor: 'rgba(51,51,51,1)',
                pointBorderColor: 'rgba(233, 30, 99, 1)',
                pointHoverBorderColor: 'rgba(233, 30, 99, 1)'
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
                      max: 20
                    }
                  }]
                },
                onClick: handleClick,
                title: {
                  display: true,
                  text: 'Category Hits'
                }
              }
            };
            $scope.barDailyCategoryCnt = barDailyCategoryLive;
          });
      }
    };

    $scope.caregoryHourcountInit = () => {
      var CategoryCnt_12amto1am = 0, CategoryCnt_1amto2am = 0, CategoryCnt_2amto3am = 0, CategoryCnt_3amto4am = 0, CategoryCnt_4amto5am = 0, CategoryCnt_5amto6am = 0, CategoryCnt_6amto7am = 0, CategoryCnt_7amto8am = 0, CategoryCnt_8amto9am = 0,
        CategoryCnt_9amto10am = 0, CategoryCnt_10amto11am = 0, CategoryCnt_11amto12pm = 0, CategoryCnt_12pmto1pm = 0, CategoryCnt_1pmto2pm = 0, CategoryCnt_2pmto3pm = 0, CategoryCnt_3pmto4pm = 0, CategoryCnt_4pmto5pm = 0, CategoryCnt_5pmto6pm = 0,
        CategoryCnt_6pmto7pm = 0, CategoryCnt_7pmto8pm = 0, CategoryCnt_8pmto9pm = 0, CategoryCnt_9pmto10pm = 0, CategoryCnt_10pmto11pm = 0, CategoryCnt_11pmto12am = 0;
      var barDailyCategoryLive = {
        "series": ["Visit"],
        "data": [[CategoryCnt_12amto1am, CategoryCnt_1amto2am, CategoryCnt_2amto3am, CategoryCnt_3amto4am, CategoryCnt_4amto5am, CategoryCnt_5amto6am, CategoryCnt_6amto7am, CategoryCnt_7amto8am, CategoryCnt_8amto9am,
          CategoryCnt_9amto10am, CategoryCnt_10amto11am, CategoryCnt_11amto12pm, CategoryCnt_12pmto1pm, CategoryCnt_1pmto2pm, CategoryCnt_2pmto3pm, CategoryCnt_3pmto4pm, CategoryCnt_4pmto5pm, CategoryCnt_5pmto6pm,
          CategoryCnt_6pmto7pm, CategoryCnt_7pmto8pm, CategoryCnt_8pmto9pm, CategoryCnt_9pmto10pm, CategoryCnt_10pmto11pm, CategoryCnt_11pmto12am]],
        "labels": ['00-01AM', '01-02AM', '02-03AM', '03-04AM', '04-05AM', '05-06AM', '06-07AM', '07-08AM', '08-09AM', '09-10AM', '10-11AM', '11-12AM', '12-01PM', '01-02PM', '02-03PM', '03-04PM', '04-05PM', '05-06PM', '06-07PM', '07-08PM', '08-09PM', '09-10PM', '10-11PM', '11-12PM'],
        "colours": [{ // default
          backgroundColor: 'rgba(233, 30, 99, 1)',
          pointBackgroundColor: 'rgba(59, 89, 152,1)',
          borderColor: 'rgba(233, 30, 99, 1)',
          pointBorderColor: 'rgba(233, 30, 99, 1)',
          pointHoverBorderColor: 'rgba(233, 30, 99, 1)'
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
                max: 20
              }
            }]
          },
          onClick: handleClick,
          title: {
            display: true,
            text: 'Category Hits'
          }
        }
      };
      $scope.barDailyCategoryCnt = barDailyCategoryLive;
    };

    var today = new Date();
    var currentWeek = today.getCurrentWeek();

    var weekdaysTxt = [{ "name": "First Week", "value": "1" }, { "name": "Second Week", "value": "2" }, { "name": "Third Week", "value": "3" }, { "name": "Fourth Week", "value": "4" }, { "name": "Fifth Week", "value": "5" }];
    var y = new Date().getFullYear();
    var m = new Date().getMonth();
    y = y || new Date().getFullYear();
    var d = new Date(y, m, 0);
    var weekCount = Math.floor((d.getDate() - 1) / 7) + 1;

    var weekdaysText = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    $scope.whatshotChartClick = (id) => {
      $scope.whatshotuserdata = [];
      // console.log(id);
      DashLine.find({ filter: { where: { id: id }, include: { relation: "customerInterestWhatshots", scope: { include: { relation: "customer" }  } } } }).$promise.then((res) => {
        if (res.length > 0) {
          $scope.whatshotuserdata = [];
          for (var data of res[0].customerInterestWhatshots) {
            if (data.customer) {
              $scope.whatshotuserdata.push({
                dateTime: data.interestTime, status: data.status, firstName: data.customer.firstName,
                lastName: data.customer.lastName, email: data.customer.email, gender: data.customer.gender ,scanTime : data.scanTimeString, redeemCouponTimeString : data.redeemCouponTimeString
              })
            }
          }
          $("#analyticsChart").css('display', 'none');
          $("#whatshotUserDetails").css('display', 'block');
        } else {
          toastr.error('No customer. Please try again!');
          toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
        }
      }, (err) => {
        toastr.error('No customer. Please try again!');
        toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
        console.log(JSON.stringify(err));
      });
    };

    //weekly  
    moment.lang('en-custom', {
      week: {
        dow: 1,
        doy: 6 // Adjust the first week of the year, depends on the country. For the US it's 6. For the UK, 4.
      }
    });
    $scope.monthsArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    $scope.barWeekdata = [];
    $scope.weekDaysTxt = [];
    $scope.weeklyMaleCnt = 0;
    $scope.weeklyFemaleCnt = 0;
    $scope.week_16to20Cnt = 0, $scope.week_20to25Cnt = 0, $scope.week_25to30Cnt = 0, $scope.week_30to35Cnt = 0, $scope.week_35plusCnt = 0, $scope.weeknewCustomerCount = 0, $scope.weekreturningCustomerCount = 0;
    $scope.WeekmaleArray = []; $scope.weekfemaleArray = [];

    $scope.getWeekSearchCount = (weekStart, weekEnd, id) => {

      BusinessDayCount.find({ filter: { where: { monthYear: `${$scope.monthsArray[m]}-${y}`, "ownerId": id } } }).$promise
        .then(function (res) {

          if (res.length > 0) {
            $scope.BusinessWeekSearchCntId = res[0].id;
          }

          var weekdays = new Date();
          $scope.LineWeekSearchdata = [];
          $scope.weekSearchDaysTxt = [];

          for (i = weekStart; i <= weekEnd; i++) {
            if (res.length < 0) {
              $scope.LineWeekSearchdata.push("0");
            }
            else {
              if (res.length > 0) {
                $scope.LineWeekSearchdata.push(res[0]["_" + i]);
              } else {
                $scope.LineWeekSearchdata.push("0");
              }
            }
            weekdays.setDate(i);
            $scope.weekSearchDaysTxt.push(weekdaysText[weekdays.getDay()] + " - " + ("0" + weekdays.getDate()).slice(-2));
          }

          var weeklyBusinessCnt = Math.max.apply(null, $scope.LineWeekSearchdata);

          //Daily Hits pie Chart
          var BusinessCountWeeklybarWeekly = {
            "series": ["Hits"],
            "data": [$scope.LineWeekSearchdata],
            "labels": $scope.weekSearchDaysTxt,
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
                    max: (weeklyBusinessCnt +10)
                  }
                }]
              },
              title: {
                display: true,
                text: 'Business Hits'
              }
            }
          };
          $scope.BusinessCntWeeklybarWeek = BusinessCountWeeklybarWeekly;
         

        });
    };

    $scope.weeklyChartInit = (id) => {

      $scope.idForVisitWeekCount = "";

      VisitDayCount.find({ filter: { where: { monthYear: `${$scope.monthsArray[m]}-${y}`, "ownerId": id } } }).$promise
        .then(function (res) {

          if (res.length > 0) {
            $scope.idForVisitWeekCount = res[0].id;
          }


          $scope.barWeekdata = [];
          $scope.weekDaysTxt = [];
          $scope.weeklyMaleCnt = 0;
          $scope.weeklyFemaleCnt = 0;
          $scope.week_16to20Cnt = 0, $scope.week_20to25Cnt = 0, $scope.week_25to30Cnt = 0, $scope.week_30to35Cnt = 0, $scope.week_35plusCnt = 0, $scope.weeknewCustomerCount = 0, $scope.weekreturningCustomerCount = 0;
          $scope.WeekmaleArray = []; $scope.weekfemaleArray = [];

          var weekStart = parseInt(moment(today.getFullYear() + "-" + (("0" + today.getMonth()).slice(-2)) + "-" + (("0" + today.getDate()).slice(-2))).weekday(-1).format('D'));
          var weekEnd = parseInt(moment(today.getFullYear() + "-" + (("0" + today.getMonth()).slice(-2)) + "-" + (("0" + today.getDate()).slice(-2))).weekday(5).format('D'));
          if (res.length > 0) {
            if (res[0].maleArray) {
              $scope.WeekmaleArray = res[0].maleArray;
            }
            if (res[0].female) {
              $scope.weekfemaleArray = res[0].female;
            }
            if (res[0]._16to20) {
              $scope.week_16to20Cnt = res[0]._16to20;
            }
            if (res[0]._20to25) {
              $scope.week_20to25Cnt = res[0]._20to25;
            }
            if (res[0]._25to30) {
              $scope.week_25to30Cnt = res[0]._25to30;
            }
            if (res[0]._25to30) {
              $scope.week_30to35Cnt = res[0]._25to30;
            }
            if (res[0]._35plus) {
              $scope.week_35plusCnt = res[0]._35plus;
            }
            if (res[0].newCustomerCount.length > 0) {
              $scope.weeknewCustomerCount = res[0].newCustomerCount.length;
            }
            if (res[0].returningCustomerCount.length > 0) {
              $scope.weekreturningCustomerCount = res[0].returningCustomerCount.length;
            }
            if (res[0].male) {
              $scope.weeklyMaleCnt = res[0].male;
            }
            if (res[0].female) {
              $scope.weeklyFemaleCnt = res[0].female;
            }
          }

          var weekdays = new Date();

          for (i = weekStart; i <= weekEnd; i++) {
            if (res.length < 0) {
              $scope.barWeekdata.push("0");
            }
            else {
              if (res.length > 0) {
                $scope.barWeekdata.push(res[0]["_" + i]);
              } else {
                $scope.barWeekdata.push("0");
              }
            }
            weekdays.setDate(i);
            $scope.weekDaysTxt.push(weekdaysText[weekdays.getDay()] + " - " + ("0" + weekdays.getDate()).slice(-2));
          }

          $scope.getWeekSearchCount(weekStart, weekEnd, id);
          $scope.getWeekSearchCategoryCount(`${$scope.monthsArray[m]}-${y}`, id, weekStart, weekEnd);


          var barWeekly = {
            "series": ["Visit"],
            "data": [$scope.barWeekdata],
            "labels": $scope.weekDaysTxt,
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
                    max: ($scope.barWeekdata.length + 50)
                  }
                }]
              },
              title: {
                display: true,
                text: 'Scans Per Week'
              }
            }
          };

          $scope.barWeek = barWeekly;
          //Weekly
          var pieWeek = {
            "series": ["Visit"],
            "data": [[$scope.weeklyMaleCnt, $scope.weeklyFemaleCnt]],
            "labels": ["Male", "Female"],
            "colours": [{
              fill: true,
              backgroundColor: [
                '#f27521',
                '#0078a6']
            }],
            options: {
              responsive: true,
              legend: { display: true },
              hover: {
                mode: 'label'
              },
              title: {
                display: true,
                text: 'Male & Female'
              }
            }
          };
          $scope.pieWeekly = pieWeek;

          //Weekly
          var pieAgeWeek = {
            "series": ["Visit"],
            "data": [[$scope.week_16to20Cnt, $scope.week_20to25Cnt, $scope.week_25to30Cnt, $scope.week_30to35Cnt, $scope.week_35plusCnt]],
            "labels": ["16 - 20", "20 - 25", "25- 30", "30 - 35", "35Plus"],
            "colours": [{
              fill: true,
              backgroundColor: [
                '#f27521',
                '#0078a6', 'green', 'red', 'blue']
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

          $scope.pieAgeWeek = pieAgeWeek;
          //weekly
          $scope.doughnutWeeklabels = ["New", "Returning"];
          $scope.doughnutWeekdata = [$scope.weeknewCustomerCount, $scope.weekreturningCustomerCount];
          $scope.doughnutWeekColor = ['#2a57ab', '#27ae61'];
          $scope.doughnutWeekoptions = {
            legend: { display: true },
            responsive: true,
            title: {
              display: true,
              text: 'New & Retrun'
            }
          }
        });

      $scope.getWeekSearchCategoryCount = (month, id, weekStart, weekEnd) => {
        $scope.weekSelectFirstday = 0; $scope.weekSelectEndday = 0;
        $scope.weekSelectFirstday = weekStart; $scope.weekSelectEndday = weekEnd;

        $scope.WeeklyChartCategorySelected(id);

        CategoryDayCount.find({ filter: { where: { monthYear: month }, fields: { category: true, id: true } } }).$promise.then(function (res) {
          $scope.weeklyCategoryList = [];
          if (res.length > 0) {
            $.each(res, function (k, v) {
              $scope.weeklyCategoryList.push(v);
            });
          }
        });
      }
    };

    $scope.WeeklyChartCategorySelected = (id) => {
      CategoryDayCount.find({ filter: { where: { id: id } } }).$promise.then(function (res) {

        var weekdays = new Date();

        $scope.barWeekcategorydata = [];
        $scope.weekDaysCategoryTxt = [];

        for (i = $scope.weekSelectFirstday; i <= $scope.weekSelectEndday; i++) {
          if (res.length < 0) {
            $scope.barWeekcategorydata.push("0");
          }
          else {
            if (res.length > 0) {
              $scope.barWeekcategorydata.push(res[0]["_" + i]);
            } else {
              $scope.barWeekcategorydata.push("0");
            }
          }
          weekdays.setDate(i);
          $scope.weekDaysCategoryTxt.push(weekdaysText[weekdays.getDay()] + " - " + ("0" + weekdays.getDate()).slice(-2));
        }

        $scope.barWeekCategoryCnt = {
          "series": ["Visit"],
          "data": $scope.barWeekcategorydata,
          "labels": $scope.weekDaysCategoryTxt,
          "colours": [{ // default
            backgroundColor: 'rgba(233, 30, 99, 1)',
            pointBackgroundColor: 'rgba(59, 89, 152,1)',
            borderColor: 'rgba(51,51,51,1)',
            pointBorderColor: 'rgba(233, 30, 99, 1)',
            pointHoverBorderColor: 'rgba(233, 30, 99, 1)'
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
                  max: 20
                }
              }]
            },
            title: {
              display: true,
              text: 'Category Hits'
            }
          }
        };

      });
    };

    $scope.weekChange = (arg) => {

      $scope.weekdata = arg.split("to");
      $scope.weekstartdata = $scope.weekdata[0].split('-');
      $scope.weekenddata = $scope.weekdata[1].split('-');
      var monthyear = `${$scope.monthsArray[$scope.weekstartdata[1]]}-${$scope.weekstartdata[0]}`;

      if ($scope.weekstartdata[1] == $scope.weekenddata[1]) {
        VisitDayCount.find({ filter: { where: { monthYear: monthyear, "ownerId": $scope.userId } } }).$promise
          .then(function (res) {

            $scope.idForVisitWeekCount = res[0].id;

            $scope.barWeekdata = [];
            $scope.weekDaysTxt = [];
            $scope.weeklyMaleCnt = 0;
            $scope.weeklyFemaleCnt = 0;
            $scope.week_16to20Cnt = 0, $scope.week_20to25Cnt = 0, $scope.week_25to30Cnt = 0, $scope.week_30to35Cnt = 0, $scope.week_35plusCnt = 0, $scope.weeknewCustomerCount = 0, $scope.weekreturningCustomerCount = 0;
            $scope.WeekmaleArray = []; $scope.weekfemaleArray = [];

            $scope.weekreturningCustomerCount = 0; $scope.weeknewCustomerCount = 0; $scope.weeklyMaleCnt = 0; $scope.weeklyFemaleCnt = 0;

            var weekStart = parseInt($scope.weekstartdata[2]);
            var weekEnd = parseInt($scope.weekenddata[2]);
            $scope.getWeekSearchCategoryCount(monthyear, $scope.userId, weekStart, weekEnd);

            var weekdays = new Date();
            $scope.weekDaysTxt = [];
            $scope.weeklyMaleCnt = 0; $scope.weeklyFemaleCnt = 0;
            $scope.weeknewCustomerCount = 0; $scope.weekreturningCustomerCount = 0;
            $scope.barWeekdata = [];
            for (i = weekStart; i <= weekEnd; i++) {
              $scope.barWeekdata.push(res[0]["_" + i]);
              //Selected date get week value 
              if (res.length > 0) {
                if (res[0].maleArray.length > 0) {
                  $.each(res[0].maleArray, function (k, v) {
                    if (v[`_${i}`]) {
                      $scope.weeklyMaleCnt = k;
                    }
                  });
                }
                if (res[0].femaleArray.length > 0) {
                  $.each(res[0].femaleArray, function (k, v) {
                    if (v[`_${i}`]) {
                      $scope.weeklyFemaleCnt = k;
                    }
                  });
                }
                if (res[0].newCustomerCount.length > 0) {
                  $.each(res[0].newCustomerCount, function (k, v) {
                    if (v[`_${i}`]) {
                      $scope.weeknewCustomerCount = k;
                    }
                  });
                }
                if (res[0].returningCustomerCount.length > 0) {
                  $.each(res[0].returningCustomerCount, function (k, v) {
                    if (v[`_${i}`]) {
                      $scope.weekreturningCustomerCount = k;
                    }
                  });
                }
                if (res[0]._16to20Array.length > 0) {
                  $.each(res[0]._16to20Array, function (k, v) {
                    if (v[`_${i}`]) {
                      $scope.week_16to20Cnt = k;
                    }
                  });
                }
                if (res[0]._20to25Array.length > 0) {
                  $.each(res[0]._20to25Array, function (k, v) {
                    if (v[`_${i}`]) {
                      $scope.week_20to25Cnt = k;
                    }
                  });
                }
                if (res[0]._25to30Array.length > 0) {
                  $.each(res[0]._25to30Array, function (k, v) {
                    if (v[`_${i}`]) {
                      $scope.week_25to30Cnt = k;
                    }
                  });
                }
                if (res[0]._30to35Array.length > 0) {
                  $.each(res[0]._30to35Array, function (k, v) {
                    if (v[`_${i}`]) {
                      $scope.week_30to35Cnt = k;
                    }
                  });
                }
                if (res[0]._35plusArray.length > 0) {
                  $.each(res[0]._35plusArray, function (k, v) {
                    if (v[`_${i}`]) {
                      $scope.week_35plusCnt = k;
                    }
                  });
                }
              }
              weekdays.setDate(i);
              $scope.weekDaysTxt.push(weekdaysText[weekdays.getDay()] + " - " + ("0" + weekdays.getDate()).slice(-2));
            }
            if ($scope.weeklyMaleCnt != 0) {
              $scope.weeklyMaleCnt = $scope.weeklyMaleCnt + 1;
            }
            if ($scope.weeklyFemaleCnt != 0) {
              $scope.weeklyFemaleCnt = $scope.weeklyFemaleCnt + 1;
            }
            if ($scope.newCustomerCount != 0) {
              $scope.newCustomerCount = $scope.newCustomerCount + 1;
            }
            if ($scope.weekreturningCustomerCount != 0) {
              $scope.weekreturningCustomerCount = $scope.weekreturningCustomerCount + 1;
            }
            if ($scope._16to20Array != 0) {
              $scope._16to20Array = $scope._16to20Array + 1;
            }
            if ($scope._20to25Array != 0) {
              $scope._20to25Array = $scope._20to25Array + 1;
            }
            if ($scope._25to30Array != 0) {
              $scope._25to30Array = $scope._25to30Array + 1;
            }
            if ($scope._30to35Array != 0) {
              $scope._30to35Array = $scope._30to35Array + 1;
            }
            if ($scope.week_35plusCnt != 0) {
              $scope.week_35plusCnt = $scope.week_35plusCnt + 1;
            }

            var barWeekly = {
              "series": ["Visit"],
              "data": [$scope.barWeekdata],
              "labels": $scope.weekDaysTxt,
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
                      max: ($scope.barWeekdata.length+50)
                    }
                  }]
                },
                title: {
                  display: true,
                  text: 'Scans Per Week'
                }
              }
            };
            $scope.barWeek = barWeekly;

            //Weekly
            var pieWeek = {
              "series": ["Visit"],
              "data": [[$scope.weeklyMaleCnt, $scope.weeklyFemaleCnt]],
              "labels": ["Male", "Female"],
              "colours": [{
                fill: true,
                backgroundColor: [
                  '#f27521',
                  '#0078a6']
              }],
              options: {
                responsive: true,
                legend: { display: true },
                hover: {
                  mode: 'label'
                },
                title: {
                  display: true,
                  text: 'Male & Female'
                }
              }
            };
            $scope.pieWeekly = pieWeek;

            //Weekly
            var pieAgeWeek = {
              "series": ["Visit"],
              "data": [[$scope.week_16to20Cnt, $scope.week_20to25Cnt, $scope.week_25to30Cnt, $scope.week_30to35Cnt, $scope.week_35plusCnt]],
              "labels": ["16 - 20", "20 - 25", "25- 30", "30 - 35", "35Plus"],
              "colours": [{
                fill: true,
                backgroundColor: [
                  '#f27521',
                  '#0078a6', 'green', 'red', 'blue']
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

            $scope.pieAgeWeek = pieAgeWeek;
            //weekly
            $scope.doughnutWeeklabels = ["New", "Returning"];
            $scope.doughnutWeekdata = [$scope.weeknewCustomerCount, $scope.weekreturningCustomerCount];
            $scope.doughnutWeekColor = ['#2a57ab', '#27ae61'];
            $scope.doughnutWeekoptions = {
              legend: { display: true },
              responsive: true,
              title: {
                display: true,
                text: 'New & Retrun'
              }
            }

          });
      }
    };

    $scope.currentMonthYear = new Date();

    //monthly
    $scope.firstMonthCnt = 0, $scope.secondMonthCnt = 0, $scope.thirdMonthCnt = 0; $scope.fourthMonthCnt = 0, $scope.fifthMonthCnt = 0, $scope.MonthMaleCnt = 0, $scope.MonthFeMaleCnt = 0, $scope.Monthlyage16to20 = 0, $scope.Monthlyage20to25 = 0;
    $scope.Monthlyage25to30 = 0, $scope.Monthlyage30to35 = 0, $scope.Monthlyage35Plus = 0, $scope.MonthlyageNew = 0, $scope.MonthlyageReturning = 0;
    $scope.monthlychartInit = (id) => {

      //Visit Count
      VisitWeekCount.find({ filter: { where: { monthYear: ($scope.monthsArray[$scope.currentMonthYear.getMonth()] + "-" + $scope.currentMonthYear.getFullYear()), "ownerId": id } } }).$promise
        .then(function (res) {
          if (res.length > 0) {
            $scope.idForVisitMonthCount = res[0].id;
          } else {
            $scope.idForVisitMonthCount = null;
          }
          $scope.monthvisitdata(res);
        });

      //Search Business Count
      $scope.monthBusinesSearchCountdata(($scope.monthsArray[$scope.currentMonthYear.getMonth()] + "-" + $scope.currentMonthYear.getFullYear()), $scope.userId);
      $scope.monthCategorySearchCountData(($scope.monthsArray[$scope.currentMonthYear.getMonth()] + "-" + $scope.currentMonthYear.getFullYear()), $scope.userId);
    };

    //Month Click  
    $scope.monthChange = (arg) => {
      if (arg != "") {
        $scope.month = `${$scope.monthsArray[(arg.split('-')[0])]}-${arg.split("-")[1]}`;
        //Visit Count
        VisitWeekCount.find({ filter: { where: { monthYear: $scope.month, "ownerId": $scope.userId } } }).$promise
          .then(function (res) {
            $scope.monthvisitdata(res);
          });

        //Search Business Count
        $scope.monthBusinesSearchCountdata($scope.month, $scope.userId);
        $scope.monthCategorySearchCountData($scope.month, $scope.userId);

      }
    };

    //Month pass result value
    $scope.monthvisitdata = (res) => {

      $scope.firstMonthCnt = 0; $scope.secondMonthCnt = 0; $scope.thirdMonthCnt = 0; $scope.fourthMonthCnt = 0; $scope.fifthMonthCnt = 0, $scope.MonthMaleCnt = 0; $scope.MonthFeMaleCnt = 0; $scope.Monthlyage16to20 = 0; $scope.Monthlyage20to25 = 0;
      $scope.Monthlyage25to30 = 0; $scope.Monthlyage30to35 = 0; $scope.Monthlyage35Plus = 0; $scope.MonthlyageNew = 0; $scope.MonthlyageReturning = 0;

      if (res.length > 0) {

        $scope.idForVisitMonthCount = res[0].id;

        if (res[0].maleArray) {
          $scope.maleMonthArray = res[0].maleArray;
        }
        if (res[0].femaleArray) {
          $scope.femaleMonthArray = res[0].femaleArray;
        }
        if (res[0].week1) {
          $scope.firstMonthCnt = res[0].week1;
        }
        if (res[0].week2) {
          $scope.secondMonthCnt = res[0].week2;
        }
        if (res[0].week3) {
          $scope.thirdMonthCnt = res[0].week3;
        }
        if (res[0].week4) {
          $scope.fourthMonthCnt = res[0].week4;
        }
        if (res[0].week5) {
          $scope.fifthMonthCnt = res[0].week5;
        }
        if (res[0].male) {
          $scope.MonthMaleCnt = res[0].male;
        }
        if (res[0].female) {
          $scope.MonthFeMaleCnt = res[0].female;
        }
        if (res[0]._16to20) {
          $scope.Monthlyage16to20 = res[0]._16to20;
        }
        if (res[0]._20to25) {
          $scope.Monthlyage20to25 = res[0]._20to25;
        }
        if (res[0]._25to30) {
          $scope.Monthlyage25to30 = res[0]._25to30;
        }
        if (res[0]._30to35) {
          $scope.Monthlyage30to35 = res[0]._30to35;
        }
        if (res[0]._35plus) {
          $scope.Monthlyage35Plus = res[0]._35plus;
        }
        if (res[0].newCustomerCount) {
          $scope.MonthlyageNew = res[0].newCustomerCount;
        }
        if (res[0].returningCustomerCount) {
          $scope.MonthlyageReturning = res[0].returningCustomerCount;
        }
      }
      //monthly
      var barMonthly = {
        "series": ["Visit"],
        "data": [[$scope.firstMonthCnt, $scope.secondMonthCnt, $scope.thirdMonthCnt, $scope.fourthMonthCnt, $scope.fifthMonthCnt]],
        "labels": ['First Week', 'Second Week', 'Third Week', 'Fourth Week', 'Fifth Week'],
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
                stepValue: 2,
                max: (parseInt(Math.max($scope.firstMonthCnt, $scope.secondMonthCnt, $scope.thirdMonthCnt, $scope.fourthMonthCnt, $scope.fifthMonthCnt))+30) 
              }
            }]
          },
          title: {
            display: true,
            text: 'Scans Per Week'
          }
        }
      };
      $scope.barMonth = barMonthly;

      //monthly

      var pieMonthgenter = {
        "series": ["Visit"],
        "data": [[$scope.MonthMaleCnt, $scope.MonthFeMaleCnt]],
        "labels": ["Male", "Female"],
        "colours": [{
          fill: true,
          backgroundColor: [
            '#f27521',
            '#0078a6']
        }],
        options: {
          responsive: true,
          legend: { display: true },
          hover: {
            mode: 'label'
          },
          title: {
            display: true,
            text: 'Male and Female'
          }
        }
      };

      $scope.piegenderMonth = pieMonthgenter;
      //monthly
      var pieAgeMonth = {
        "series": ["Visit"],
        "data": [[$scope.Monthlyage16to20, $scope.Monthlyage20to25, $scope.Monthlyage25to30, $scope.Monthlyage30to35, $scope.Monthlyage35Plus]],
        "labels": ["16 - 20", "20 - 25", "25 - 30", "30 - 35", "35Plus"],
        "colours": [{
          fill: true,
          backgroundColor: [
            '#f27521',
            '#0078a6', 'green', 'red', 'blue']
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

      $scope.pieMonth = pieAgeMonth;

      //month
      $scope.doughnutMonthlabels = ["New", "Returning"];
      $scope.doughnutMonthkdata = [$scope.MonthlyageNew, $scope.MonthlyageReturning];
      $scope.doughnutMonthColor = ['#2a57ab', '#27ae61'];
      $scope.doughnutMonthoptions = {
        legend: { display: true },
        responsive: true,
        title: {
          display: true,
          text: 'New & Return'
        }
      }
    };

    //Month Business Line data
    $scope.monthBusinesSearchCountdata = (month, id) => {

      BusinessWeekCount.find({ filter: { where: { monthYear: month, "ownerId": $scope.userId } } }).$promise
        .then(function (res) {
          //Daily Hits pie Chart
          var FirstWeekBusinessSearchCount = 0, SecondWeekBusinessSearchCount = 0, ThirdWeekBusinessSearchCount = 0, FourthWeekBusinessSearchCount = 0;

          var ctx = $("#line-chartcanvas-months");

          if (res.length > 0) {

            $scope.BusinessMonthSearchCntId = res[0].id;

            if (res[0].week1) {
              FirstWeekBusinessSearchCount = res[0]['week1'];
            }
            if (res[0].week2) {
              SecondWeekBusinessSearchCount = res[0]['week2'];
            }
            if (res[0].week3) {
              ThirdWeekBusinessSearchCount = res[0]['week3'];
            }
            if (res[0].week4) {
              FourthWeekBusinessSearchCount = res[0]['week4'];
            }
          }

          var MonthlyBusinessCnt = Math.max.apply(null, [FirstWeekBusinessSearchCount, SecondWeekBusinessSearchCount, ThirdWeekBusinessSearchCount, FourthWeekBusinessSearchCount]);


          var BusinessCountMthbarMonthly = {
            "series": ["Hits"],
            "data": [[FirstWeekBusinessSearchCount, SecondWeekBusinessSearchCount, ThirdWeekBusinessSearchCount, FourthWeekBusinessSearchCount]],
            "labels": ['First Week', 'Second Week', 'Third Week', 'Fourth Week'],
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
                    stepValue: 2,
                    max: (MonthlyBusinessCnt+60)
                  }
                }]
              },
              title: {
                display: true,
                text: 'Business Hits'
              }
            }
          };
          $scope.BusinessCountMonthChart = BusinessCountMthbarMonthly;

         
        });
    };

    $scope.monthCategorySearchCountData = (month, id) => {
      CategoryWeekCount.find({ filter: { where: { monthYear: month }, fields: { id: true, category: true } } }).$promise.then(function (res) {
        $scope.categoryMonthList = [];
        if (res.length > 0) {
          $scope.categoryMonthList = res;
        }

        $scope.monthlyChartCategorySelected("");

      });
    };

    $scope.monthlyChartCategorySelected = (id) => {
      var firstWeekCategory = 0, secondWeekCategory = 0, ThirdWeekCategory, FourthWeekCategory = 0;
      $scope.barMOnthlyCategoryCnt = {
        "series": ["Visit"],
        "data": [firstWeekCategory, secondWeekCategory, ThirdWeekCategory, FourthWeekCategory],
        "labels": ["First Week", "Second Week", "Third Week", "Fourth Week"],
        "colours": [{ // default
          backgroundColor: 'rgba(233, 30, 99, 1)',
          pointBackgroundColor: 'rgba(59, 89, 152,1)',
          borderColor: 'rgba(51,51,51,1)',
          pointBorderColor: 'rgba(233, 30, 99, 1)',
          pointHoverBorderColor: 'rgba(233, 30, 99, 1)'
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
                max: 20
              }
            }]
          },
          title: {
            display: true,
            text: 'Category Hits'
          }
        }
      };
      if (id != "") {
        CategoryWeekCount.find({ filter: { where: { id: id } } }).$promise.then(function (res) {
          if (res.length > 0) {
            firstWeekCategory = res[0].week1;
            secondWeekCategory = res[0].week2;
            ThirdWeekCategory = res[0].week3;
            FourthWeekCategory = res[0].week4;

            $scope.barMOnthlyCategoryCnt = {
              "series": ["Visit"],
              "data": [firstWeekCategory, secondWeekCategory, ThirdWeekCategory, FourthWeekCategory],
              "labels": ["First Week", "Second Week", "Third Week", "Fourth Week"],
              "colours": [{ // default
                backgroundColor: 'rgba(233, 30, 99, 1)',
                pointBackgroundColor: 'rgba(59, 89, 152,1)',
                borderColor: 'rgba(51,51,51,1)',
                pointBorderColor: 'rgba(233, 30, 99, 1)',
                pointHoverBorderColor: 'rgba(233, 30, 99, 1)'
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
                      max: 20
                    }
                  }]
                },
                title: {
                  display: true,
                  text: 'Category Hits'
                }
              }
            };
          }
        });
      }


    };

    //Yearly 
    $scope.yearlyChartInit = (id) => {

      var year = today.getFullYear();

      VisitMonthCount.find({ filter: { where: { "year": year, "ownerId": id } } }).$promise.then(function (res) {
        if (res.length > 0) {
          $scope.idForVisitYearCount = res[0].id;
        }
        $scope.yearResGet(res);
      }, function (err) { });

      $scope.getBusinessCategoryCount(id);
      $scope.CategorySearchCountChart(year);
    };

    //Yearly Click
    $scope.yearChange = (arg) => {
      if (arg == "") {
        arg = new Date().getFullYear();
      }
      VisitMonthCount.find({ filter: { where: { "year": arg, "ownerId": $scope.userId } } }).$promise.then(function (res) {

        $scope.yearResGet(res);

      }, function (err) { });
    };

    $scope.yearResGet = (res) => {
      $scope.alltimeJan = "0", $scope.alltimeFeb = "0", $scope.alltimeMar = "0", $scope.alltimeApr = "0", $scope.alltimeMay = "0", $scope.alltimeJun = "0", $scope.alltimeJul = "0", $scope.alltimeAug = "0", $scope.alltimeSep = "0",
        $scope.alltimeOct = "0", $scope.alltimeNov = "0", $scope.alltimeDec = "0";
      $scope.allTime16to20 = "0", $scope.allTime20to25 = "0", $scope.allTime25to30 = "0", $scope.allTime30to35 = "0", $scope.allTime35plus = "0";
      $scope.newCustomerAlltime = "0", $scope.returnCustomerAlltime = "0";
      $scope.alltimeMaleCnt = "0", $scope.alltimeFemaleCnt = "0";

      if (res.length > 0) {
        if (res[0].january) {
          $scope.alltimeJan = res[0].january;
        }
        if (res[0].february) {
          $scope.alltimeFeb = res[0].february;
        }
        if (res[0].march) {
          $scope.alltimeMar = res[0].march;
        }
        if (res[0].april) {
          $scope.alltimeApr = res[0].april;
        }
        if (res[0].may) {
          $scope.alltimeMay = res[0].may;
        }
        if (res[0].june) {
          $scope.alltimeJun = res[0].june;
        }
        if (res[0].july) {
          $scope.alltimeJul = res[0].july;
        }
        if (res[0].august) {
          $scope.alltimeAug = res[0].august;
        }
        if (res[0].september) {
          $scope.alltimeSep = res[0].september;
        }
        if (res[0].october) {
          $scope.alltimeOct = res[0].october;
        }
        if (res[0].november) {
          $scope.alltimeNov = res[0].november;
        }
        if (res[0].december) {
          $scope.alltimeDec = res[0].december;
        }
        $scope.alltimemaleArray = [];
        $scope.alltimefemaleArray = [];
        if (res[0].maleArray) {
          $scope.alltimemaleArray = res[0].maleArray;
        }
        if (res[0].femaleArray) {
          $scope.alltimefemaleArray = res[0].femaleArray;
        }
        if (res[0]._16to20) {
          $scope.allTime16to20 = res[0]._16to20;
        }
        if (res[0]._20to25) {
          $scope.allTime20to25 = res[0]._20to25;
        }
        if (res[0]._25to30) {
          $scope.allTime25to30 = res[0]._25to30;
        }
        if (res[0]._30to35) {
          $scope.allTime30to35 = res[0]._30to35;
        }
        if (res[0]._35plus) {
          $scope.allTime35plus = res[0]._35plus;
        }
        if (res[0].newCustomerCount) {
          $scope.newCustomerAlltime = res[0].newCustomerCount;
        }
        if (res[0].returningCustomerCount) {
          $scope.returnCustomerAlltime = res[0].returningCustomerCount;
        }

        if (res[0].male) {
          $scope.alltimeMaleCnt = res[0].male;
        }
        if (res[0].female) {
          $scope.alltimeFemaleCnt = res[0].female;
        }
      }

      //AllTime
      var barAllTime = {
        "series": ["Visit"],
        "data": [[$scope.alltimeJan, $scope.alltimeFeb, $scope.alltimeMar, $scope.alltimeApr, $scope.alltimeMay, $scope.alltimeJun, $scope.alltimeJul, $scope.alltimeAug, $scope.alltimeSep, $scope.alltimeOct, $scope.alltimeNov, $scope.alltimeDec]],
        "labels": ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
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
                stepValue: 2,
                max: (parseInt(Math.max($scope.alltimeJan, $scope.alltimeFeb, $scope.alltimeMar, $scope.alltimeApr, $scope.alltimeMay, $scope.alltimeJun, $scope.alltimeJul, $scope.alltimeAug, $scope.alltimeSep, $scope.alltimeOct, $scope.alltimeNov, $scope.alltimeDec)) +50) 
              }
            }]
          },
          title: {
            display: true,
            text: 'Scans'
          }
        }
      };
      $scope.barAllTime = barAllTime;

      //AllTime

      var pieAllTimeGenter = {
        "series": ["Visit"],
        "data": [[$scope.alltimeMaleCnt, $scope.alltimeFemaleCnt]],
        "labels": ["Male", "Female"],
        "colours": [{
          fill: true,
          backgroundColor: [
            '#f27521',
            '#0078a6']
        }],
        options: {
          responsive: true,
          legend: { display: true },
          hover: {
            mode: 'label'
          },
          title: {
            display: true,
            text: ' Male and Female'
          }
        }
      };

      $scope.piegenderAllTime = pieAllTimeGenter;
      //allTime
      var pieAgeAllTime = {
        "series": ["Visit"],
        "data": [[$scope.allTime16to20, $scope.allTime20to25, $scope.allTime25to30, $scope.allTime30to35, $scope.allTime35plus]],
        "labels": ["16 - 20", "20 - 25", "25 - 30", "30 - 35", "35 Plus"],
        "colours": [{
          fill: true,
          backgroundColor: [
            '#f27521',
            '#0078a6', 'green', 'red', 'blue']
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

      $scope.pieAllTime = pieAgeAllTime;

      //AllTime
      $scope.doughnutAllTimelabels = ["New", "Returning"];
      $scope.doughnutAllTimedata = [$scope.newCustomerAlltime, $scope.returnCustomerAlltime];
      $scope.doughnutAllTimeColor = ['#2a57ab', '#27ae61'];
      $scope.doughnutAllTimeoptions = {
        legend: { display: true },
        responsive: true,
        title: {
          display: true,
          text: 'New & Return'
        }
      }
    };

    $scope.getBusinessCategoryCount = (id) => {
      var year = $("#currentYear").text();
      BusinessMonthCount.find({ filter: { where: { ownerId: id, year: year } } }).$promise.then(function (res) {
        $scope.BusinessSearchCountChart(res);
      });
    };

    $scope.BusinessSearchCountChart = (res) => {

      var yearJanuary = 0, yearFebruary = 0, yearMarch = 0, yearApril = 0, yearMay = 0, yearJune = 0, yearJuly = 0, yearAugust = 0, yearSeptember = 0, yearOctober = 0, yearNovember = 0, yearDecember = 0;
      if (res.length > 0) {
        $scope.BusinessYearSearchCntId = res[0].id;
        yearJanuary = res[0]['January'];
        yearFebruary = res[0]['February'];
        yearMarch = res[0]['March'];
        yearApril = res[0]['April'];
        yearMay = res[0]['May'];
        yearJune = res[0]['June'];
        yearJuly = res[0]['July'];
        yearAugust = res[0]['August'];
        yearSeptember = res[0]['September'];
        yearOctober = res[0]['October'];
        yearNovember = res[0]['November'];
        yearDecember = res[0]['December'];
      }
    

      var YearlyBusinessCnt = Math.max.apply(null, [yearJanuary, yearFebruary, yearMarch, yearApril, yearMay, yearJune, yearJuly, yearAugust, yearSeptember, yearOctober, yearNovember, yearDecember]);

      var BusinessCountYearbarChart = {
        "series": ["Hits"],
        "data": [[yearJanuary, yearFebruary, yearMarch, yearApril, yearMay, yearJune, yearJuly, yearAugust, yearSeptember, yearOctober, yearNovember, yearDecember]],
        "labels": ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
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
                stepValue: 2,
                max: (YearlyBusinessCnt+100)
              }
            }]
          },
          title: {
            display: true,
            text: 'Business Hits'
          }
        }
      };
      $scope.BusinessCountYearChart = BusinessCountYearbarChart;

      
    };

    $scope.CategorySearchCountChart = (year) => {
      var categoryYearJanuary = 0, categoryYearFebruary = 0, categoryYearMarch = 0, categoryYearApril = 0, categoryYearMay = 0, categoryYearJune = 0, categoryYearJuly = 0, categoryYearAugust = 0, categoryYearSeptember = 0, categoryYearOctober = 0,
        categoryYearNovember = 0, categoryYearDecember = 0;
      $scope.categoryYearList = [];
      CategoryMonthCount.find({ filter: { where: { year: year }, fields: { id: true, category: true } } }).$promise.then(function (res) {
        if (res.length > 0) {
          $scope.categoryYearList = res;
        }
      });
      $scope.barYearlyCategoryCnt = {
        "series": ["Visit"],
        "data": [categoryYearJanuary, categoryYearFebruary, categoryYearMarch, categoryYearApril, categoryYearMay, categoryYearJune, categoryYearJuly, categoryYearAugust, categoryYearSeptember, categoryYearOctober, categoryYearNovember, categoryYearDecember],
        "labels": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        "colours": [{ // default
          backgroundColor: 'rgba(233, 30, 99, 1)',
          pointBackgroundColor: 'rgba(59, 89, 152,1)',
          borderColor: 'rgba(51,51,51,1)',
          pointBorderColor: 'rgba(233, 30, 99, 1)',
          pointHoverBorderColor: 'rgba(233, 30, 99, 1)'
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
                max: 20
              }
            }]
          },
          title: {
            display: true,
            text: 'Category Hits'
          }
        }
      };
    };

    $scope.yearlyChartCategorySelected = (id) => {
      var categoryYearJanuary = 0, categoryYearFebruary = 0, categoryYearMarch = 0, categoryYearApril = 0, categoryYearMay = 0, categoryYearJune = 0, categoryYearJuly = 0, categoryYearAugust = 0, categoryYearSeptember = 0, categoryYearOctober = 0,
        categoryYearNovember = 0, categoryYearDecember = 0;

      $scope.barYearlyCategoryCnt = {
        "series": ["Visit"],
        "data": [categoryYearJanuary, categoryYearFebruary, categoryYearMarch, categoryYearApril, categoryYearMay, categoryYearJune, categoryYearJuly, categoryYearAugust, categoryYearSeptember, categoryYearOctober, categoryYearNovember, categoryYearDecember],
        "labels": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        "colours": [{ // default
          backgroundColor: 'rgba(233, 30, 99, 1)',
          pointBackgroundColor: 'rgba(59, 89, 152,1)',
          borderColor: 'rgba(51,51,51,1)',
          pointBorderColor: 'rgba(233, 30, 99, 1)',
          pointHoverBorderColor: 'rgba(233, 30, 99, 1)'
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
                max: 20
              }
            }]
          },
          title: {
            display: true,
            text: 'Category Hits'
          }
        }
      };
      CategoryMonthCount.find({ filter: { where: { id: id } } }).$promise.then(function (res) {
        if (res.length > 0) {
          categoryYearJanuary = res[0]['January'];
          categoryYearFebruary = res[0]['February'];
          categoryYearMarch = res[0]['March'];
          categoryYearApril = res[0]['April'];
          categoryYearMay = res[0]['May'];
          categoryYearJune = res[0]['June'];
          categoryYearJuly = res[0]['July'];
          categoryYearAugust = res[0]['August'];
          categoryYearSeptember = res[0]['September'];
          categoryYearOctober = res[0]['October'];
          categoryYearNovember = res[0]['November'];
          categoryYearDecember = res[0]['December'];

        }

        var numbers_array = [categoryYearJanuary, categoryYearFebruary, categoryYearMarch, categoryYearApril, categoryYearMay, categoryYearJune, categoryYearJuly, categoryYearAugust, categoryYearSeptember, categoryYearOctober, categoryYearNovember, categoryYearDecember];
        var biggest = Math.max.apply(null, numbers_array);

        $scope.barYearlyCategoryCnt = {
          "series": ["Visit"],
          "data": [categoryYearJanuary, categoryYearFebruary, categoryYearMarch, categoryYearApril, categoryYearMay, categoryYearJune, categoryYearJuly, categoryYearAugust, categoryYearSeptember, categoryYearOctober, categoryYearNovember, categoryYearDecember],
          "labels": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
          "colours": [{ // default
            backgroundColor: 'rgba(233, 30, 99, 1)',
            pointBackgroundColor: 'rgba(59, 89, 152,1)',
            borderColor: 'rgba(51,51,51,1)',
            pointBorderColor: 'rgba(233, 30, 99, 1)',
            pointHoverBorderColor: 'rgba(233, 30, 99, 1)'
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
                  max: (biggest + 10)
                }
              }]
            },
            title: {
              display: true,
              text: 'Category Hits'
            }
          }
        };
      });
    };

    $scope.dailyChartInit($scope.userId, strDate);
    $scope.weeklyChartInit($scope.userId);
    $scope.monthlychartInit($scope.userId);
    $scope.yearlyChartInit($scope.userId);
    $scope.inAppSpecialInterectCountDaily(strDate);
    $scope.whatshotDatechange(strDate, $scope.userId);

    //Category hour Hits
    $scope.caregoryHourcountInit();
   

    //Business Select
    $scope.BusinessSelected = (arg) => {
      $("#businessErr").text('');
      if (arg == 'analytics') {
        if ($("#autocompleteBusiness").data('id') != undefined && $("#autocompleteBusiness").data('id') != null) {
          arg = $("#autocompleteBusiness").data('id');
          if ($("#businessSubmit").hasClass('businessSubmit')) {
            $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset');
            $("#businessSubmit").removeClass('businessSubmit').addClass('businessReset');
          }
        } else {
          $("#businessErr").text('Please select the Business name');
        }
      }

      if (arg) {
        $scope.whatshotDatechange(strDate, arg);
        $scope.userId = arg;
        $scope.idForVisithourCount = null;
        $scope.idForVisitWeekCount = null;
        $scope.idForVisitMonthCount = null;
        $scope.idForVisitYearCount = null;
        $scope.BusinessHourSearchCntId = null;
        $scope.BusinessWeekSearchCntId = null;
        $scope.BusinessMonthSearchCntId = null;
        $scope.BusinessYearSearchCntId = null;
        $scope.dailyChartInit(arg, strDate);
        $scope.weeklyChartInit(arg);
        $scope.monthlychartInit(arg);
        $scope.yearlyChartInit(arg);
        $scope.inAppSpecialInterectCountDaily(strDate);
      }
    };

    //Onclick
    $scope.chartClick = function (id, arg) {

      if (id != "" && id != undefined && id != null) {

        $("#analyticsChart").css('display', 'none');
        $("#analyticsUserDetails").css('display', 'block');

        var filter = {};

        if (arg == 'dailyClick') {
          filter = { "filter": { "where": { "visitHourCountId": id }, "include": { "relation": "customer", "scope": { "fields": { "firstName": true, "lastName": true, "email": true, "mobile": true, "gender": true } } }, order: 'scanDateTimeFormat DESC' } };
        } else if (arg == 'weekClick') {
          filter = { "filter": { "where": { "visitDayCountId": id }, "include": { "relation": "customer", "scope": { "fields": { "firstName": true, "lastName": true, "email": true, "mobile": true, "gender": true } } }, order: 'scanDateTimeFormat DESC' } };
        }
        else if (arg == 'monthClick') {
          filter = { "filter": { "where": { "visitWeekCountId": id }, "include": { "relation": "customer", "scope": { "fields": { "firstName": true, "lastName": true, "email": true, "mobile": true, "gender": true } } }, order: 'scanDateTimeFormat DESC' } };
        }
        else if (arg == 'yearClick') {
          filter = { "filter": { "where": { "visitMonthCountId": id }, "include": { "relation": "customer", "scope": { "fields": { "firstName": true, "lastName": true, "email": true, "mobile": true, "gender": true } } }, order: 'scanDateTimeFormat DESC' } };
        }

        $scope.userdata = [];
        CustomerScan.find(filter).$promise.then(function (res) {
          if (res.length > 0) {
            $.each(res, function (i, v) {
              $scope.customers = {};
              $scope.customers = v.customer;
              $scope.customers.scanTime = v.scanTime;
              $scope.customers.redeemCouponTimeString = v.redeemCouponTimeString;
              $scope.userdata.push($scope.customers);
            });
          }
        }, function (err) {
          console.log(res);
        });
      }
      else {
        $scope.userdata = [];
        toastr.error('Please Try again!');
        toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
      }
    };

    //Business Search UserDetails Click
    $scope.businessSearchUserDetailsClick = (id, name) => {
      $scope.businessSearchCustomerDetailsList = [];
      var BusinessName;
      if (name == 'hour') {
        BusinessName = BusinessHourCount;
      }
      else if (name == 'week') {
        BusinessName = BusinessDayCount;
      }
      else if (name == 'month') {
        BusinessName = BusinessWeekCount;
      }
      else if (name == 'year') {
        BusinessName = BusinessMonthCount;
      }

      BusinessName.find({
        filter: {
          where: { id: id }, include: { relation: "customerSearchBusinesses", scope: { include: { relation: "customer" } } }, order: 'countryDate desc'
        }
      }).$promise.then((res) => {
        if (res.length > 0) {
          $("#BusinessSearchCntUserDetails").css('display', 'block');
          $("#analyticsChart").css('display', 'none');
          for (var data of res[0].customerSearchBusinesses) {
            $scope.businessSearchCustomerDetailsList.push({
              timeZone: data.timeZone, country: data.country, time: data.time, firstName: data.customer.firstName, lastName: data.customer.lastName,
              mobile: data.customer.mobile, gender: data.customer.gender, email: data.customer.email
            });
          }
        }
      }, (err) => {
        console.log(JSON.stringify(err));
      })
    };

  }]);


Date.prototype.getCurrentWeek = function () {
  return Math.ceil(((new Date(this.getFullYear(), this.getMonth(), this.getDate()) - new Date(this.getFullYear(), 0, 1) + 1) / 86400000) / 7)
};
