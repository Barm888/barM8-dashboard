var runInjector = null;

angular
  .module('app', ['lbServices', 'ngMaterial', 'ngMessages', 'ui.router', "ngStorage", "angularMoment"])

  .factory("hostUrl", function ($location) {
    return {
      id: $location.host() + ':' + $location.port()
    };
  })
  .filter('split', function () {
    return function (input, splitChar, splitIndex) {
      return input.split(splitChar)[splitIndex];
    }
  })
  .filter('fixed', function () {
    return function (input) {
      return (parseFloat(input | 0)).toFixed(2)
    }
  })
  .filter('salesChannelFilter', function () {
    return function (input) {
      if (input && input.appOnly) return 'App Only (Barm8 Only)';
      else if (input && input.appAndDoor) return 'App and At the door';
      else if (input && input.doorOnly) return 'At the door only';
    }
  })
  .filter('range', function () {
    return function (input, total) {
      total = parseInt(total);
      for (var i = 1; i < total; i++)
        input.push(i);
      return input;
    };
  })
  .service('loader', function () {
    this.visible = function () {
      $(".loader").css({ display: 'block' });
      return true;
    }
    this.hidden = function (a) {
      $(".loader").css({ display: 'none' });
      return true;
    }
  })
  .service('getAllVenues', function (Business, $rootScope) {
    let data = [];
    Business.find({
      filter: {
        where: {
          or: [{ status: 'active' }, { status: 'Active L1' }, { status: "Active L2" }]
        }, "fields": ["businessName", "id", "email", "status"]
      }
    }).$promise.then((res) => {
      data = res;
    });
    this.get = function () {
      return data;
    }
  })
  .factory("socket", function () { return io.connect(); })
  .filter('returnPolicyFilter', function () {
    return function (input) {
      if (input && input._1Day) return '1 day';
      else if (input && input._7Days) return '7 days';
      else if (input && input._30Days) return '30 days';
      else if (input && input._noRefund) return 'No refunds';
    }
  })
  .filter('mealscategoryCapital', function () {
    return function (input) {
      if (input && input == 'allday') {
        return 'All Day';
      } else if (input && input == 'dinner') {
        return 'Dinner';
      } else if (input && input == 'lunch') {
        return 'Lunch';
      } else if (input && input == 'breakfast') {
        return 'Breakfast';
      }
    }
  })
  .filter('bistroHoursF', function () {
    return function (input) {
      let data_1 = '';
      const uppercaseWords = str => str.replace(/^(.)|\s+(.)/g, c => c.toUpperCase());
      for (let d of ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']) {
        if (input[d] && input[d].startTime) {
          data_1 += `<tr>
          <td style="padding: 3px;"><span>${uppercaseWords(d)}</span></td>
          <td style="padding: 3px;"><span>${input[d].startTime || '<i>NA</i>'}</span></td>
          <td style="padding: 3px;"><span>${input[d].endTime || '<i>NA</i>'}</span></td>
        </tr>`;
        } else {
          data_1 += `<tr>
          <td style="padding: 3px;"><span>${uppercaseWords(d)}</span></td>
          <td style="padding: 3px;"><span>${'<i>NA</i>'}</span></td>
          <td style="padding: 3px;"><span>${'<i>NA</i>'}</span></td>
        </tr>`;
        }


      }
      let data = `<div class="row"><div class"col-md-12" style="padding:0 10px 0px 10px;">
      <table class="table table-bordered" style="font-size: 12px;">
      <thead> <tr> <th><span>Day</span></th>
      <th><span>Start Time</span></th>
      <th><span>End Time</span></th>
      </tr> </thead>  <tbody>${data_1} </tbody> </table> 
      </div></div>`;
      return data;
    }
  })
  .filter('happeningsDates', function () {
    return function (input) {
      let data = '';
      for (let d of input) data += `< div class="row" > <div class"col-md-12" > <b>${d.date}</b> from < b > ${d.startTime}</b > to < b > ${d.endTime}</b ></div ></div > `;
      return data;
    }
  })
  .filter('happeningSDTRVAI', function () {
    return function (input) {
      if (input && input.whatsOnTeamMembers && input.whatsOnTeamMembers.length) {
        let data = '';
        let newObj = input.whatsOnTeamMembers.find(m => m.isInviter)
        newObj.paymentHistories.forEach((val, i) => {
          let status = '';
          if (val.status == 'succeeded') status = `< span style = "background-color:green;color:#fff;padding:2px 3px;" > Succeeded</span > `;
          if (val.status == 'failed') status = `< span style = "background-color:red;color:#fff;padding:2px 20px !important;" > Failed</span > `;
          data += `< tr >
            <td>${(i + 1)}</td>
            <td>${val.countryDate}</td>
            <td>${val.countryTime}</td>
            <td><span>${status}</span></td>
          </tr > `
        })

        return `< table class="table table-bordered" >
        <tr>
          <th>#</th>
          <th>Date</th>
          <th>Time</th>
          <th>Status</th>
        </tr>
      ${data}
      </table > `;
      } else return '';
    }
  })
  .filter('happeningSDTRVAIInDIv', function () {
    return function (input) {
      if (input && input.paymentHistories && input.paymentHistories.length) {
        let data = '';
        input.paymentHistories.forEach((val, i) => {
          let status = '';
          if (val.status == 'succeeded') status = `< span style = "background-color:green;color:#fff;padding:2px 3px;" > Succeeded</span > `;
          if (val.status == 'failed') status = `< span style = "background-color:red;color:#fff;padding:2px 10px;" > Failed</span > `;
          data += `< tr >
            <td>${(i + 1)}</td>
            <td>${val.countryDate}</td>
            <td>${val.countryTime}</td>
            <td><span>${status}</span></td>
          </tr > `
        })

        return `< table class="table table-bordered" >
        <tr>
          <th>#</th>
          <th>Date</th>
          <th>Time</th>
          <th>Status</th>
        </tr>
      ${data}
      </table > `;
      } else return '';
    }
  })
  .filter('happeningSDLKC', function () {
    return function (input) {
      if (input && input.length) {
        let data = '';
        for (let obj of input) {
          obj.paymentHistories.forEach((val, i) => {
            let status = '';
            if (val.status == 'succeeded') status = `< span style = "background-color:green;color:#fff;padding:2px 3px;" > Succeeded</span > `;
            if (val.status == 'failed') status = `< span style = "background-color:red;color:#fff;padding:2px 10px;" > Failed</span > `;
            data += `< tr >
              <td>${(i + 1)}</td>
              <td>${val.countryDate}</td>
              <td>${val.countryTime}</td>
              <td><span>${status}</span></td>
            </tr > `
          })
        }

        return `< table class="table table-bordered" >
        <tr>
          <th>#</th>
          <th>Date</th>
          <th>Time</th>
          <th>Status</th>
        </tr>
      ${data}
      </table > `;
      } else return '';
    }
  })
  .filter('categoriesShow', function () {
    return function (input) {
      let data = '';
      if (input && input.breakfast) {
        data += `< div class="row" > <div class="col-md-12"><div class="md-switch-container checked" onClick="$(this).toggleClass('checked');menuHeaderCategories('breakfast', this,'${input.id}');"> <div class="md-switch-track"></div> <div class="md-switch-handle"></div>  <div class="md-switch-label"><b>Breakfast</b></div></div></div></div > `;
      } else {
        data += `< div class="row" > <div class="col-md-12"><div class="md-switch-container" onClick="$(this).toggleClass('checked');menuHeaderCategories('breakfast', this,'${input.id}');"> <div class="md-switch-track"></div> <div class="md-switch-handle"></div>  <div class="md-switch-label"><b>Breakfast</b></div></div></div></div > `;
      }
      if (input && input.brunch) {
        data += `< div class="row" > <div class="col-md-12"><div class="md-switch-container checked" onClick="$(this).toggleClass('checked');menuHeaderCategories('brunch', this,'${input.id}');"> <div class="md-switch-track"></div> <div class="md-switch-handle"></div>  <div class="md-switch-label"><b>Brunch</b></div></div></div></div > `;
      } else {
        data += `< div class="row" > <div class="col-md-12"><div class="md-switch-container" onClick="$(this).toggleClass('checked');menuHeaderCategories('brunch', this,'${input.id}');"> <div class="md-switch-track"></div> <div class="md-switch-handle"></div>  <div class="md-switch-label"><b>Brunch</b></div></div></div></div > `;
      }
      if (input && input.lunch) {
        data += `< div class="row" > <div class="col-md-12"><div class="md-switch-container checked" onClick="$(this).toggleClass('checked');menuHeaderCategories('lunch', this,'${input.id}');"> <div class="md-switch-track"></div> <div class="md-switch-handle"></div>  <div class="md-switch-label"><b>Lunch</b></div></div></div></div > `;
      } else {
        data += `< div class="row" > <div class="col-md-12"><div class="md-switch-container" onClick="$(this).toggleClass('checked');menuHeaderCategories('lunch', this,'${input.id}');"> <div class="md-switch-track"></div> <div class="md-switch-handle"></div>  <div class="md-switch-label"><b>Lunch</b></div></div></div></div > `;
      }
      if (input && input.dinner) {
        data += `< div class="row" > <div class="col-md-12"><div class="md-switch-container checked" onClick="$(this).toggleClass('checked');menuHeaderCategories('dinner', this,'${input.id}');"> <div class="md-switch-track"></div> <div class="md-switch-handle"></div>  <div class="md-switch-label"><b>Dinner</b></div></div></div></div > `;
      } else {
        data += `< div class="row" > <div class="col-md-12"><div class="md-switch-container" onClick="$(this).toggleClass('checked');menuHeaderCategories('dinner', this,'${input.id}');"> <div class="md-switch-track"></div> <div class="md-switch-handle"></div>  <div class="md-switch-label"><b>Dinner</b></div></div></div></div > `;
      }
      if (input && input.allday) {
        data += `< div class="row" > <div class="col-md-12"><div class="md-switch-container checked" onClick="$(this).toggleClass('checked');menuHeaderCategories('allday', this,'${input.id}');"> <div class="md-switch-track"></div> <div class="md-switch-handle"></div>  <div class="md-switch-label"><b>All Day</b></div></div></div></div > `;
      } else {
        data += `< div class="row" > <div class="col-md-12"><div class="md-switch-container" onClick="$(this).toggleClass('checked');menuHeaderCategories('allday', this,'${input.id}');"> <div class="md-switch-track"></div> <div class="md-switch-handle"></div>  <div class="md-switch-label"><b>All Day</b></div></div></div></div > `;
      }
      data += `< div class="row" > <div class="col-md-12" style="text-align: center;"><button style="padding: 0px 6px!important;" onclick="angular.element(document.getElementById('menuManager')).scope().updateMenuHeaderRefresh()" class="btn btn-primary">Update</button></div></div > `;
      data += `< script >
        menuHeaderCategories = (category, e, id) => {
          angular.element(document.getElementById('menuManager')).scope().MealsCategoriesUpdate(category, e, id);
        } </script > `;
      return data;
    }
  })
  .filter('mealsShow', function () {
    return function (input, category) {
      let data = "";
      if (category.parent.monday.value) {
        if (input && input.monday) {
          data += `< div class="row" style = "padding: 2px 0px !important;" > <div class="col-md-12"><div class="md-switch-container checked" onClick="$(this).toggleClass('checked');menuHeaderMealsDaysClk('monday', this,'${input.id}','${input.mealsDashLineId}');"> <div class="md-switch-track"></div> <div class="md-switch-handle"></div>  <div class="md-switch-label" style="color: rgba(0,0,0,0.87) !important;"><b>Monday</b></div></div></div></div > `;
        } else {
          data += `< div class="row" style = "padding: 2px 0px !important;" > <div class="col-md-12"><div class="md-switch-container" onClick="$(this).toggleClass('checked');menuHeaderMealsDaysClk('monday', this,'${input.id}','${input.mealsDashLineId}');"> <div class="md-switch-track"></div> <div class="md-switch-handle"></div>  <div class="md-switch-label" style="color: rgba(0,0,0,0.87) !important;"><b>Monday</b></div></div></div></div > `;
        }
      }

      if (category.parent.tuesday.value) {
        if (input && input.tuesday) {
          data += `< div class="row" style = "padding: 2px 0px !important;" > <div class="col-md-12"><div class="md-switch-container checked" onClick="$(this).toggleClass('checked');menuHeaderMealsDaysClk('tuesday', this,'${input.id}','${input.mealsDashLineId}');"> <div class="md-switch-track"></div> <div class="md-switch-handle"></div>  <div class="md-switch-label" style="color: rgba(0,0,0,0.87) !important;"><b>Tuesday</b></div></div></div></div > `;
        } else {
          data += `< div class="row" style = "padding: 2px 0px !important;" > <div class="col-md-12"><div class="md-switch-container" onClick="$(this).toggleClass('checked');menuHeaderMealsDaysClk('tuesday', this,'${input.id}','${input.mealsDashLineId}');"> <div class="md-switch-track"></div> <div class="md-switch-handle"></div>  <div class="md-switch-label" style="color: rgba(0,0,0,0.87) !important;"><b>Tuesday</b></div></div></div></div > `;
        }
      }
      if (category.parent.wednesday.value) {
        if (input && input.wednesday) {
          data += `< div class="row" style = "padding: 2px 0px !important;" > <div class="col-md-12"><div class="md-switch-container checked" onClick="$(this).toggleClass('checked');menuHeaderMealsDaysClk('wednesday', this,'${input.id}','${input.mealsDashLineId}');"> <div class="md-switch-track"></div> <div class="md-switch-handle"></div>  <div class="md-switch-label" style="color: rgba(0,0,0,0.87) !important;"><b>Wednesday</b></div></div></div></div > `;
        } else {
          data += `< div class="row" style = "padding: 2px 0px !important;" > <div class="col-md-12"><div class="md-switch-container" onClick="$(this).toggleClass('checked');menuHeaderMealsDaysClk('wednesday', this,'${input.id}','${input.mealsDashLineId}');"> <div class="md-switch-track"></div> <div class="md-switch-handle"></div>  <div class="md-switch-label" style="color: rgba(0,0,0,0.87) !important;"><b>Wednesday</b></div></div></div></div > `;
        }
      }

      if (category.parent.thursday.value) {
        if (input && input.thursday) {
          data += `< div class="row" style = "padding: 2px 0px !important;" > <div class="col-md-12"><div class="md-switch-container checked" onClick="$(this).toggleClass('checked');menuHeaderMealsDaysClk('thursday', this,'${input.id}','${input.mealsDashLineId}');"> <div class="md-switch-track"></div> <div class="md-switch-handle"></div>  <div class="md-switch-label" style="color: rgba(0,0,0,0.87) !important;"><b>Thursday</b></div></div></div></div > `;
        } else {
          data += `< div class="row" style = "padding: 2px 0px !important;" > <div class="col-md-12"><div class="md-switch-container" onClick="$(this).toggleClass('checked');menuHeaderMealsDaysClk('thursday', this,'${input.id}','${input.mealsDashLineId}');"> <div class="md-switch-track"></div> <div class="md-switch-handle"></div>  <div class="md-switch-label" style="color: rgba(0,0,0,0.87) !important;"><b>Thursday</b></div></div></div></div > `;
        }
      }

      if (category.parent.friday.value) {
        if (input && input.friday) {
          data += `< div class="row" style = "padding: 2px 0px !important;" > <div class="col-md-12"><div class="md-switch-container checked" onClick="$(this).toggleClass('checked');menuHeaderMealsDaysClk('friday', this,'${input.id}','${input.mealsDashLineId}');"> <div class="md-switch-track"></div> <div class="md-switch-handle"></div>  <div class="md-switch-label" style="color: rgba(0,0,0,0.87) !important;"><b>Friday</b></div></div></div></div > `;
        } else {
          data += `< div class="row" style = "padding: 2px 0px !important;" > <div class="col-md-12"><div class="md-switch-container" onClick="$(this).toggleClass('checked');menuHeaderMealsDaysClk('friday', this,'${input.id}','${input.mealsDashLineId}');"> <div class="md-switch-track"></div> <div class="md-switch-handle"></div>  <div class="md-switch-label" style="color: rgba(0,0,0,0.87) !important;"><b>Friday</b></div></div></div></div > `;
        }
      }

      if (category.parent.saturday.value) {
        if (input && input.saturday) {
          data += `< div class="row" style = "padding: 2px 0px !important;" > <div class="col-md-12"><div class="md-switch-container checked" onClick="$(this).toggleClass('checked');menuHeaderMealsDaysClk('saturday', this,'${input.id}','${input.mealsDashLineId}');"> <div class="md-switch-track"></div> <div class="md-switch-handle"></div>  <div class="md-switch-label" style="color: rgba(0,0,0,0.87) !important;"><b>Saturday</b></div></div></div></div > `;
        } else {
          data += `< div class="row" style = "padding: 2px 0px !important;" > <div class="col-md-12"><div class="md-switch-container" onClick="$(this).toggleClass('checked');menuHeaderMealsDaysClk('saturday', this,'${input.id}','${input.mealsDashLineId}');"> <div class="md-switch-track"></div> <div class="md-switch-handle"></div>  <div class="md-switch-label" style="color: rgba(0,0,0,0.87) !important;"><b>Saturday</b></div></div></div></div > `;
        }
      }

      if (category.parent.sunday.value) {
        if (input && input.sunday) {
          data += `< div class="row" style = "padding: 2px 0px !important;" > <div class="col-md-12"><div class="md-switch-container checked" onClick="$(this).toggleClass('checked');menuHeaderMealsDaysClk('sunday',this,'${input.id}','${input.mealsDashLineId}');"> <div class="md-switch-track"></div> <div class="md-switch-handle"></div>  <div class="md-switch-label" style="color: rgba(0,0,0,0.87) !important;"><b>Sunday</b></div></div></div></div > `;
        } else {
          data += `< div class="row" style = "padding: 2px 0px !important;" > <div class="col-md-12"><div class="md-switch-container" onClick="$(this).toggleClass('checked');menuHeaderMealsDaysClk('sunday',this,'${input.id}','${input.mealsDashLineId}');"> <div class="md-switch-track"></div> <div class="md-switch-handle"></div>  <div class="md-switch-label" style="color: rgba(0,0,0,0.87) !important;"><b>Sunday</b></div></div></div></div > `;
        }
      }

      data += `< div class="row" > <div class="col-md-12" style="text-align: center;"><button style="padding: 0px 6px!important;background-color:#4caf50 !important;" onclick="angular.element(document.getElementById('menuManager')).scope().updateMenuHeaderRefresh()" class="btn btn-primary">Update</button></div></div > `;
      if (category.name == 'mealsHeader') {
        data += `< script >
        function menuHeaderMealsDaysClk(day, arg, id) {
          angular.element(document.getElementById('menuManager')).scope().mealsMenuHeaderDaysUpdate(id, day, $(arg).hasClass('checked'));
        };</script > `;
      }
      if (category.name == 'mealsCategory') {
        data += `< script >
          function menuHeaderMealsDaysClk(day, arg, id) {
            angular.element(document.getElementById('menuManager')).scope().mealsCategoryDaysUpdate(id, day, $(arg).hasClass('checked'));
          };</script > `;
      }
      if (category.name == 'mealsItem') {
        data += `< script >
            function menuHeaderMealsDaysClk(day, arg, id, mealsDashLineId) {
              angular.element(document.getElementById('menuManager')).scope().mealsItemDaysUpdate(id, day, $(arg).hasClass('checked'), mealsDashLineId);
            };</script > `;
      }

      return data;
    }
  })
  .filter('_24to12', function () {
    return function (input, splitChar, splitIndex) {

      var timeString = input.split(splitChar)[splitIndex];
      var H = +timeString.substr(0, 2);
      var h = (H % 12) || 12;
      var ampm = H < 12 ? " AM" : " PM";
      timeString = h + timeString.substr(2, 3) + ampm;
      return timeString;
    }
  })
  .factory("States", function () {

    return ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Dakota", "North Carolina", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];

  })
  .run(function ($state, $rootScope, $injector) {
    let stateName = location.href.split('#%2F')[1];
    if (stateName == undefined || stateName == '' || stateName == null) stateName = "home";

    let validSession = () => {
      // try {
      //   var link = document.createElement('a');
      //   link.href = '/login';
      //   document.body.appendChild(link);
      //   link.click();
      // } catch (e) {
      //   var link = document.createElement('a');
      //   link.href = '/login';
      //   document.body.appendChild(link);
      //   link.click();
      // }
    }

    if (localStorage.getItem("userSession")) {
      try {
        $rootScope.currentUser = JSON.parse(localStorage.getItem("userSession"));
        $state.go(stateName);

        $rootScope.selectedVenue = JSON.parse(localStorage.getItem("selectedVenue"));

      } catch (e) {
        validSession();
      }
    } else validSession();
  })
  .directive('chosen', function () {
    var linker = function (scope, element, attrs) {
      var list = attrs['chosen'];

      scope.$watch(list, function () {
        element.trigger('chosen:updated');
      });

      scope.$watch(attrs['ngModel'], function () {
        element.trigger('chosen:updated');
      });

      element.chosen({ width: '100%' });
    };

    return {
      restrict: 'A',
      link: linker
    };
  })
  .directive('date1', function (dateFilter) {
    return {
      require: 'ngModel',
      link: function (scope, elm, attrs, ctrl) {

        var dateFormat = attrs['date'] || 'yyyy-MM-dd';

        ctrl.$formatters.unshift(function (modelValue) {
          return dateFilter(modelValue, dateFormat);
        });
      }
    };
  })
  .filter('underscoreless', function () {
    return function (input) {
      return input.replace(/_/g, ' ');
    };
  })
  .filter('removeSpaces', [function () {
    return function (string) {
      if (!angular.isString(string)) {
        return string;
      }
      return string.replace(/[\s]/g, '');
    };
  }])
  .filter('capitalize', function () {
    return function (input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
  })

  .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$locationProvider', function ($stateProvider,
    $urlRouterProvider, $httpProvider, $locationProvider) {

    let validSession = () => {
      try {
        let session = JSON.parse(localStorage.getItem("userSession"));
        if (session && session.id) {
          setTimeout(function () {
            $("#pageStart").css({ display: 'block' });
          }, 800);
          return true;
        }
        else {
          var link = document.createElement('a');
          link.href = '/';
          document.body.appendChild(link);
          link.click();
          // window.open('/login');
          // location.reload();
        }
      } catch (e) {
        // window.open('/login');
        var link = document.createElement('a');
        link.href = '/';
        document.body.appendChild(link);
        link.click();
        //location.reload();
      }
    }


    //  $urlRouterProvider.otherwise("barmate_business");
    $stateProvider
      .state('resetpassword', {
        url: '/resetpassword?token=',
        templateUrl: 'views/reset_password.html',
        controller: 'resetpassword',
        params: { token: null }
      })
      .state('reservation-invite', {
        url: '/reservation-invite',
        templateUrl: function () {
          if (validSession()) return 'views/redirectStore.html';
        }
      })
      .state('page-not-found', {
        url: 'page-not-found',
        template: '<a ui-href="home" href="/home"><img  class="img-responsive" style="margin: auto;cursor:pointer;" ng-src="/assets/img/404-error-page-templates.jpg"></a>'
      })
      .state('view-venue-profile', {
        url: '/view-venue-profile',
        controller: 'viewEditVenueCtrl',
        templateUrl: function () {
          if (validSession()) return 'views/venue/view-venue.html';
        }
      })
      .state('opening-hours', {
        url: '/opening-hours',
        controller: 'openingHoursCtl',
        templateUrl: function () {
          if (validSession()) return 'views/openingHours/openingHours.html';
        }
      })
      .state('accounts-details', {
        url: '/accounts-details',
        templateUrl: function () {
          if (validSession()) return 'views/payments/accounts-list.html';
        }
      })
      .state('venue-accounts', {
        url: '/venue-accounts',
        templateUrl: function () {
          if (validSession()) return 'views/payments/venue-acounts.html';
        }
      })
      .state('manage-waitlist', {
        url: '/manage-waitlist',
        templateUrl: function () {
          if (validSession()) return 'views/waitlist/index.html';
        }
      })
      .state('admin', {
        url: '/admin',
        templateUrl: function () {
          if (validSession()) return 'views/admin/index.html';
        }
      })
      .state('feedback', {
        url: '/feedback',
        templateUrl: function () {
          if (validSession()) return 'views/customer-feedback/home.html';
        },
        controller: 'feedBackCtl'
      })
      .state('new-user-permission', {
        url: '/new-user-permission',
        templateUrl: function () {
          if (validSession()) return 'views/users/create-user.html';
        }
      })
      .state('update-user-permission', {
        url: '/update-user-permission',
        templateUrl: function () {
          if (validSession()) return 'views/users/edit-user.html';
        }
      })
      .state('venue-users', {
        url: '/venue-users',
        templateUrl: function () {
          if (validSession()) return 'views/users/users-list.html';
        }
      })
      .state('promotion', {
        url: '/promotion',
        templateUrl: function () {
          if (validSession()) return 'views/promotion/manage-promotion.html';
        }
      })
      .state('create-promotion', {
        url: '/create-promotion',
        templateUrl: function () {
          if (validSession()) return 'views/promotion/create-promotion.html';
        }
      })
      .state('events-analytics', {
        url: '/events-analytics',
        templateUrl: function () {
          if (validSession()) return 'views/analytics/events-analytics.html';
        }
      })
      .state('sports-analytics', {
        url: '/sports-analytics',
        templateUrl: function () {
          if (validSession()) return 'views/analytics/sports-analytics.html';
        }
      })
      .state('special-analytics', {
        url: '/special-analytics',
        templateUrl: function () {
          if (validSession()) return 'views/analytics/special-analytics.html';
        }
      })
      .state('book-analytics', {
        url: '/book-analytics',
        templateUrl: function () {
          if (validSession()) return 'views/analytics/book-analytics.html';
        }
      })
      .state('edit-promotion', {
        url: '/edit-promotion',
        templateUrl: function () {
          if (validSession()) return 'views/promotion/edit-promotion.html';
        }
      })
      .state('active-venue', {
        url: '/active-venue',
        templateUrl: function () {
          if (validSession()) return 'views/venue/active-venue.html';
        }
      })
      .state('manage-bistro-hours', {
        url: '/manage-bistro-hours',
        templateUrl: function () {
          if (validSession()) return 'views/bistro-hours/manage-bistro-hours.html';
        },
        controller: 'createbistroHourCtl'
      })
      .state('drinks-service-option', {
        url: '/drinks-service-option',
        templateUrl: function () {
          if (validSession()) return 'views/service-option/drinks-service-option.html';
        },
        controller: 'drinksServiceCtl'
      })
      .state('food-service-option', {
        url: '/food-service-option',
        templateUrl: function () {
          if (validSession()) return 'views/service-option/food-service-option.html';
        },
        controller: 'foodServiceCtl'
      })
      .state('happy-hours', {
        url: '/happy-hours',
        templateUrl: function () {
          if (validSession()) return 'views/happyHours/happyHours.html';
        },
        controller: 'happyHoursCtl'
      })
      .state('edit-happy-hours', {
        url: '/edit-happy-hours',
        templateUrl: function () {
          if (validSession()) return 'views/happyHours/editHappyHours.html';
        },
        controller: 'happyHoursEditCtl'
      })
      .state('manage-happy-hours', {
        url: '/manage-happy-hours',
        templateUrl: function () {
          if (validSession()) return 'views/happyHours/manageHappyHours.html';
        },
        controller: 'happyHoursManageCtl'
      })
      .state('manage-daily-special', {
        url: '/manage-daily-special',
        templateUrl: function () {
          if (validSession()) return 'views/dailySpecial/manage-daily-special.html';
        },
        controller: 'happyHoursManageCtl'
      })
      .state('create-daily-special', {
        url: '/create-daily-special',
        templateUrl: function () {
          if (validSession()) return 'views/dailySpecial/create-daily-special.html';
        },
        controller: 'happyHoursManageCtl'
      })
      .state('edit-daily-special', {
        url: '/edit-daily-special',
        templateUrl: function () {
          if (validSession()) return 'views/dailySpecial/edit-daily-special.html';
        },
        controller: 'editDailySpecialCtl'
      })
      .state('customerforgotpassword', {
        url: '/customerforgotpassword?id=',
        templateUrl: function () {
          if (validSession()) return 'views/customerFP.html';
        },
        controller: 'customerForgotPassword'
      })
      .state('request-offers', {
        url: '/request-offers',
        templateUrl: function () {
          if (validSession()) return 'views/Exclusive_Offers/request_offers.html';
        },
        controller: 'requestOfferCtl'
      })
      .state('create-new-offer', {
        url: '/create-new-offer',
        templateUrl: function () {
          if (validSession()) return 'views/Exclusive_Offers/create_new_offer.html';
        },
        controller: 'createExclusiveOfferCtl'
      })
      .state('manage-offer', {
        url: '/manage-offer',
        templateUrl: function () {
          if (validSession()) return 'views/Exclusive_Offers/manage_offer.html';
        },
        controller: 'manageExclusiveOfferCtl'
      })
      .state('edit-coupon-offer', {
        url: '/edit-coupon-offer',
        templateUrl: function () {
          if (validSession()) return 'views/Exclusive_Offers/edit_offer.html';
        },
        controller: 'EditExclusiveOfferCtl'
      })
      .state('view-coupon-offer', {
        url: '/view-coupon-offer',
        templateUrl: function () {
          if (validSession()) return 'views/Exclusive_Offers/view_offer.html';
        },
        controller: 'ViewExclusiveOfferCtl'
      })
      .state('manage-sport-config', {
        url: '/manage-sport-config',
        templateUrl: function () {
          if (validSession()) return 'views/sports-config/manage-config.html';
        },
        controller: 'manageSportConfigCtl'
      })
      .state('sports', {
        url: '/sports',
        templateUrl: function () {
          if (validSession()) return 'views/sports/manage-sports.html';
        },
        controller: 'ManageSportsCtl'
      })
      .state('create-sports', {
        url: '/create-sports',
        templateUrl: function () {
          if (validSession()) return 'views/sports/create-sports.html';
        },
        controller: 'CreateSportsCtl'
      })
      .state('new-venue', {
        url: '/new-venue',
        templateUrl: function () {
          if (validSession()) return 'views/venue/new-venue.html';
        },
        controller: 'venueCreateCtl'
      })
      .state('view-sports', {
        url: '/view-sports',
        templateUrl: function () {
          if (validSession()) return 'views/sports/view-sports.html';
        },
        controller: 'ViewSportsCtl'
      })
      .state('edit-sports', {
        url: '/edit-sports',
        templateUrl: function () {
          if (validSession()) return 'views/sports/edit-sports.html';
        },
        controller: 'EditSportsCtl'
      })
      .state('venue-images', {
        url: '/venue-images',
        templateUrl: function () {
          if (validSession()) return 'views/whatson/whats-manage.html';
        },
        controller: 'whatsonCtl'
      })
      .state('qr-download-cnt', {
        url: '/qr-download-cnt',
        templateUrl: function () {
          if (validSession()) return 'views/qr-download-cnt/index.html';
        }
      })
      .state('create-whats-on-events', {
        url: '/create-whats-on-events/:arg',
        templateUrl: function () {
          if (validSession()) return 'views/whatson-event/create-l-m-dj-ka-co.html';
        }
      })
      .state('view-whats-on-events', {
        url: '/view-whats-on-events',
        controller: 'whatsOnEventsView',
        templateUrl: function () {
          if (validSession()) return 'views/whatson-event/view-whatson-events.html';
        }
      })
      .state('update-whatson-events', {
        url: '/update-whatson-events',
        templateUrl: function () {
          if (validSession()) return 'views/whatson-event/edit-update-events.html';
        },
        controller: 'whatsOnEventsEdit'
      })
      .state('manage-trivia', {
        url: '/manage-trivia',
        templateUrl: function () {
          if (validSession()) return 'views/happenings/manage-event-trivia.html';
        },
        controller: 'manageRequestTriviaCtl'
      })
      .state('manage-poker', {
        url: '/manage-poker',
        templateUrl: function () {
          if (validSession()) return 'views/happenings/manage-event-poker.html';
        },
        controller: 'manageRequestPokerCtl'
      })
      .state('manage-dj', {
        url: '/manage-dj',
        templateUrl: function () {
          if (validSession()) return 'views/happenings/manage-event-request.html';
        },
        controller: 'whatsOnManageRequestCtl'
      })
      .state('manage-live', {
        url: '/manage-live',
        templateUrl: function () {
          if (validSession()) return 'views/happenings/manage-event-request.html';
        },
        controller: 'whatsOnManageRequestCtl'
      })
      .state('manage-comedy', {
        url: '/manage-comedy',
        templateUrl: function () {
          if (validSession()) return 'views/happenings/manage-event-request.html';
        },
        controller: 'whatsOnManageRequestCtl'
      })
      .state('manage-karaoke', {
        url: '/manage-karaoke',
        templateUrl: function () {
          if (validSession()) return 'views/happenings/manage-event-request.html';
        },
        controller: 'whatsOnManageRequestCtl'
      })
      .state('create-trivia', {
        url: '/create-trivia',
        templateUrl: function () {
          if (validSession()) return 'views/whatson-event/create-trivia.html';
        }
      })
      .state('create-poker', {
        url: '/create-poker',
        templateUrl: function () {
          if (validSession()) return 'views/whatson-event/create-poker.html';
        }
      })
      .state('create-whats-on', {
        url: '/create-whats-on',
        controller: 'whatsoncreateCtl',
        templateUrl: function () {
          if (validSession()) return 'views/whatson-event/create-new-whatson.html';
        }
      })
      .state('edit-happenings', {
        url: '/edit-happenings',
        templateUrl: function () {
          if (validSession()) return 'views/happenings/edit-happenings.html';
        },
        controller: 'happeningsEditCtl'
      })
      .state('manage-events', {
        url: '/manage-events',
        templateUrl: function () {
          if (validSession()) return 'views/happenings/manage-happenings.html';
        },
        controller: 'happeningsManageCtl'
      })
      .state('whatson-reservation', {
        url: '/whatson-reservation',
        templateUrl: function () {
          if (validSession()) return 'views/happenings/whats-reservation.html';
        }
      })
      .state('settings', {
        url: '/settings',
        templateUrl: 'views/settings/settings.html',
        templateUrl: function () {
          if (validSession()) return 'views/settings/settings.html';
        },
        controller: 'settingsCtl'
      })
      .state('menu-hours', {
        url: '/menu-hours',
        templateUrl: function () {
          if (validSession()) return 'views/menus/menu-hours.html';
        },
        controller: 'menuHoursCtl'
      })
      .state('menu-manager', {
        url: '/menu-manager',
        templateUrl: function () {
          if (validSession()) return 'views/menus/menu-manager.html';
        },
        controller: 'menuHoursCtl'
      })
      .state('create-events', {
        url: '/create-events',
        templateUrl: function () {
          if (validSession()) return 'views/events/create-event.html';
        },
        controller: 'createEventCtl'
      })
      .state('view-events', {
        url: '/view-events',
        templateUrl: function () {
          if (validSession()) return 'views/events/view-event.html';
        },
        controller: 'viewEventCtl'
      })
      .state('drinks-manager', {
        url: '/drinks-manager',
        templateUrl: function () {
          if (validSession()) return 'views/drinks/drinks-manager.html';
        },
        controller: 'drinksManagerctl'
      })
      .state('drinks-order', {
        url: '/drinks-order',
        templateUrl: function () {
          if (validSession()) return 'views/drinksorder/drinks-order.html';
        },
        controller: 'drinksOrderCtl'
      })
      .state('drinks-menu', {
        url: '/drinks-menu',
        templateUrl: function () {
          if (validSession()) return 'views/drinks/create-drinks.html';
        },
        controller: 'drinksctl'
      })
      .state('reservation', {
        url: '/reservation',
        templateUrl: function () {
          if (validSession()) return 'views/menus/reservation.html';
        },
        controller: 'reservationCtl'
      })

      .state('contact-us', {
        url: '/contact-us',
        templateUrl: 'views/question.html',
        controller: 'contactUsQuestion'
      })
      .state('venueinform', {
        url: '/venueinform',
        templateUrl: function () {
          if (validSession()) return 'views/venueinform.html';
        }
      })
      .state('orders', {
        url: '/orders',
        controller: 'OrdersCtl',
        templateUrl: function () {
          if (validSession()) return 'views/orders.html';
        }
      })
      .state('event-booking', {
        url: '/booking',
        templateUrl: function () {
          if (validSession()) return 'views/eventBooking.html';
        },
        controller: 'eventBookingCtl'
      })
      .state('order-view', {
        url: '/order-view/:id',
        templateUrl: function () {
          if (validSession()) return 'views/order-view.html';
        },
        controller: 'orderViewCtl'
      })
      .state('id-scan-report', {
        url: '/scan-report',
        templateUrl: function () {
          if (validSession()) return 'views/id-scan-reports.html';
        },
        controller: 'ScanReportCtl'
      })
      .state('id-scan-vip-list', {
        url: '/vip-list',
        templateUrl: function () {
          if (validSession()) return 'views/scan-vip-list.html';
        },
        controller: 'ScanVIPListCtl'
      })
      .state('id-scan-ban-list', {
        url: '/ban-list',
        templateUrl: function () {
          if (validSession()) return 'views/scan-ban-list.html';
        },
        controller: 'ScanBanListCtl'
      })
      .state('activationLandline', {
        url: '/activation',
        templateUrl: function () {
          if (validSession()) return 'views/activationLandline.html';
        },
        controller: 'ActivationCtl'
      })
      .state('forgotpassword', {
        url: '/forgot_password',
        templateUrl: function () {
          if (validSession()) return 'views/forgotpwd.html';
        },
        controller: 'forgotpassword'
      })
      .state('customer-reset', {
        url: 'customer-reset',
        templateUrl: function () {
          if (validSession()) return 'views/customerreset.html';
        },
        controller: 'forgotpassword'
      })
      // .state('business-register', {
      //   url: '/business-register',
      //   templateUrl: 'views/barm8_register_login.html',
      //   controller: 'new_business_create'
      // })
      // .state('partners-login', {
      //   url: '/partners-login',
      //   templateUrl: 'views/barm8_register_login.html',
      //   controller: 'new_business_create'
      // })
      .state('profile', {
        url: '/profile-update',
        templateUrl: function () {
          if (validSession()) return 'views/eprofile.html';
        },
        controller: 'eprofile'
      })
      .state('activationprofile', {
        url: '/profile-update',
        templateUrl: function () {
          if (validSession()) return 'views/activateprofile.html';
        },
        controller: 'activateProfileCtl'
      })
      // .state('loginNew', {
      //   url: '/login',
      //   templateUrl: 'views/barm8_register_login.html',
      //   controller: 'new_business_create'
      // })
      .state('register', {
        url: '/register',
        templateUrl: 'views/register.html',
        controller: 'registerController'
      })
      .state('scans', {
        url: '/scans',
        templateUrl: function () {
          if (validSession()) return 'views/scan-details.html';
        },
        controller: 'scanIdsController'
      })
      .state('patron-analytics', {
        url: '/patron-analytics',
        templateUrl: function () {
          if (validSession()) return 'views/analytics/patron-analytics.html';
        },
        controller: 'patronAnalyticsCtl'
      })
      .state('venue-analytics', {
        url: '/venue-analytics',
        templateUrl: function () {
          if (validSession()) return 'views/analytics/venue-analytics.html';
        },
        controller: 'venueAnalyticsCtl'
      })
      .state('create-analytics', {
        url: '/create-analytics',
        templateUrl: function () {
          if (validSession()) return 'views/create-analytics.html';
        },
        controller: 'createAnalyticsCtl'
      })
      .state('manage-customers', {
        url: '/manage-customers',
        templateUrl: function () {
          if (validSession()) return 'views/customers/home.html';
        },
        controller: 'customerDetailsCtl'
      })
      .state('special-notifications', {
        url: '/special-notifications',
        templateUrl: function () {
          if (validSession()) return 'views/special-notification/s-index.html';
        },
        controller: 'specialNotificationCtl'
      })
      .state('manage-venue-signup', {
        url: '/manage-venue-signup',
        templateUrl: function () {
          if (validSession()) return 'views/venue-signup/home.html';
        },
        controller: 'venueSignupCtl'
      })
      .state('manage-sports-scheduling', {
        url: '/manage-sports-scheduling',
        templateUrl: function () {
          if (validSession()) return 'views/sports/manage-sports-schedule.html';
        },
        controller: 'manageSportsScheduleCtl'
      })
      .state('create-sports-scheduling', {
        url: '/create-sports-scheduling',
        templateUrl: function () {
          if (validSession()) return 'views/sports/create-sports-schedule.html';
        },
        controller: 'createSportsScheduleCtl'
      })
      .state('business', {
        url: '/business',
        templateUrl: function () {
          if (validSession()) return 'views/business.html';
        },
        controller: 'BusinessController'
      })
      .state('create-takeaway', {
        url: '/create-takeaway',
        templateUrl: function () {
          if (validSession()) return 'views/takeaway/create-takeaway.html';
        },
        controller: 'createTakeawayCtl'
      })
      .state('edit-takeaway', {
        url: '/edit-takeaway',
        templateUrl: function () {
          if (validSession()) return 'views/takeaway/edit-takeaway.html';
        },
        controller: 'editTakeawayCtl'
      })
      .state('manage-takeaway', {
        url: '/manage-takeaway',
        templateUrl: function () {
          if (validSession()) return 'views/takeaway/manage-takeaway.html';
        },
        controller: 'manageTakeawayCtl'
      })
      .state('dashboard-home', {
        url: '/dashboard-home',
        templateUrl: function () {
          if (validSession()) return 'views/dashboard/home.html';
        },
      })
      .state('view-business', {
        url: '/view-business',
        templateUrl: function () {
          if (validSession()) return 'views/eprofile.html';
        },
        controller: 'eprofile'
      })
      .state('venue-e-u', {
        url: '/venue-e-u',
        templateUrl: function () {
          if (validSession()) return 'views/profile/business-details.html';
        },
        controller: 'businessViewCtl'
      })
      .state('transaction-setting', {
        url: '/transaction-setting',
        templateUrl: function () {
          if (validSession()) return 'views/venue/transaction-setting.html';
        },
        controller: 'transactionSettingCtl'
      })
      .state('add-business', {
        url: '/add-business',
        templateUrl: function () {
          if (validSession()) return 'views/add-business.html';
        },
        controller: 'BusinessController'
      })
      // .state('login', {
      //   url: '/login',
      //   templateUrl: 'views/login.html',
      //   controller: 'AuthLoginController'
      // })
      .state('logout', {
        url: '',
        controller: 'AuthLogoutController'
      })
      .state('sign-up', {
        url: '/sign-up',
        templateUrl: 'views/sign-up-form.html',
        controller: 'SignUpController',
      })
      .state('sign-up-success', {
        url: '/sign-up/success',
        templateUrl: 'views/sign-up-success.html'
      });
    $locationProvider.html5Mode(true);
  }]);




