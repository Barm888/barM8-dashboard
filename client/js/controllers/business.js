angular
  .module('app')
  .controller('BusinessController', ['$scope', '$state', 'Business', 'Category', '$http', 'loader', function ($scope, $state, Business, Category, $http, loader) {

    $scope.businessActive = true;

    toastMsg = (isVaild, msg) => {
      if (isVaild)
        toastr.success(msg);
      else
        toastr.error(msg);
      toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
    }

    $scope.showTheMiddle = (event, i) => {
      $(`.middle_${i}`).css({ 'display': 'block', 'position': 'absolute', 'right': '2%' });
    }
    $scope.hiddenTheMiddle = (i) => {
      $(`.middle_${i}`).css({ 'display': 'none' })
    }

    $scope.searchSubmit = () => {
      loader.visible()
      $scope.appendBusiness = [];
      // if (!$scope.businessActive) $scope.isActive = "inactive";

      let suburb, zipCode, state, businessName, status = 'active';

      suburb = $("#suburbF").val();
      zipCode = $("#postcodeF").val();
      businessName = $("#venueF").val();
      state = $("#stateF").val();
      status = $("#status_f").val();

      var filter, fields = ["id", "businessName", "zipCode", "suburb", "status", "state", "qrCode", "qrImageUrl", "email", "isAppLive"], and = [];

      if (businessName) and.push({ "businessName": { "like": `${businessName}.*`, "options": "i" } });
      if (zipCode) and.push({ "zipCode": { "like": `${zipCode}.*`, "options": "i" } });
      if (state) and.push({ "state": { "like": `${state}.*`, "options": "i" } });
      if (suburb) and.push({ "suburb": { "like": `${suburb}.*`, "options": "i" } });
      if (status && status != 'All') and.push({ status });
      and.push({ UserType: { "nlike": "Barm8" } })

      if (and && and.length) {
        //and.push({ "status": $scope.isActive });
        filter = { "filter": { "where": { and }, fields, "order": "businessName ASC" } };
      } else {
        // filter = {
        //   "filter": { "where": { "status": $scope.isActive }, fields, "order": "businessName ASC" }
        // };
        filter = {
          "filter": { fields, "order": "businessName ASC" }
        };
      }

      $scope.pagination = { pNoStart: 1, pNoEnd: 10, start: 0, last: 10, t_Cnt: 0, a_Number: 1, paginationLimit: 10, pageLimit: 10, arrayPNo: [], tArray: [] };

      $scope.paginationCalu = (vals = []) => {
        loader.visible();
        $scope.appendBusiness = [];
        if (vals.length <= $scope.pagination.pageLimit) $scope.appendBusiness = vals;
        else {
          let start = $scope.pagination.pNoStart, last = $scope.pagination.pNoEnd;
          for (let i = $scope.pagination.start; i < $scope.pagination.last; i++) {
            if (i <= $scope.pagination.last && vals && vals[i]) $scope.appendBusiness.push(vals[i]); else break;
          }
          $scope.pagination.arrayPNo = [];
          for (let i = start; i < last; i++) {
            if (i <= $scope.pagination.t_Cnt) {
              $scope.pagination.arrayPNo.push(i);
            }
          }
          if ($scope.pagination.t_Cnt > [...$scope.pagination.arrayPNo].pop()) {
            $scope.pagination.arrayPNo.push('...');
            $scope.pagination.arrayPNo.push($scope.pagination.t_Cnt);
          }
        }
        setTimeout(() => { loader.hidden(); }, 100)
      }

      $scope.pageNClk = (no = 1 || '...') => {
        let pagiNlimit = $scope.pagination.paginationLimit;
        if (no != '...') {
          $scope.pagination.a_Number = no;
          $scope.pagination.start = ((no * pagiNlimit) - pagiNlimit);
          $scope.pagination.last = no * pagiNlimit;
        } else {
          $scope.pagination.pNoEnd = $scope.pagination.pNoEnd + 10;
          $scope.pagination.pNoStart = $scope.pagination.pNoEnd - 10;
          $scope.pagination.a_Number = $scope.pagination.pNoStart;
          no = $scope.pagination.pNoStart;
          $scope.pagination.start = ((no * pagiNlimit) - pagiNlimit);
          $scope.pagination.last = no * pagiNlimit;
        }
        $scope.paginationCalu($scope.pagination.tArray);
      }

      $scope.pageNextPreClk = (arg = 'next') => {
        let pagiNlimit = $scope.pagination.paginationLimit, no = 0;
        if (arg == 'next') {
          $('.pagination-number').each((e, val) => {
            if ($(val).hasClass('current-number')) $scope.pagination.a_Number = parseInt($(val).data('pageno')) + 1;
          })
          no = $scope.pagination.a_Number;
          $scope.pagination.start = ((no * pagiNlimit) - pagiNlimit);
          $scope.pagination.last = no * pagiNlimit;
          if (!$scope.pagination.arrayPNo.some(m => m == no) && no <= $scope.pagination.t_Cnt) {
            ++$scope.pagination.pNoStart;
            ++$scope.pagination.pNoEnd;
          }
        } else {
          $('.pagination-number').each((e, val) => {
            if ($(val).hasClass('current-number')) $scope.pagination.a_Number = parseInt($(val).data('pageno')) - 1;
          })
          no = $scope.pagination.a_Number;
          $scope.pagination.start = ((no * pagiNlimit) - pagiNlimit);
          $scope.pagination.last = no * pagiNlimit;
          if (!$scope.pagination.arrayPNo.some(m => m == no)) {
            --$scope.pagination.pNoStart;
            --$scope.pagination.pNoEnd;
          }
        }
        $scope.paginationCalu($scope.pagination.tArray);
      }


      Business.find(filter).$promise.then(function (res) {
        loader.hidden();
        $scope.pagination.tArray = []; $scope.pagination.t_Cnt = 0;
        $scope.pagination.tArray = res;
        $scope.pagination.t_Cnt = Math.ceil(res.length / $scope.pagination.pageLimit);
        $scope.paginationCalu(res);
      }, function (err) {
        toastMsg(false, "Please try again!");
        loader.hidden();
      });
    }

    $scope.viewBusiness = (id) => {
      if (id) {
        localStorage.removeItem("v-e-venueId");
        localStorage.setItem("v-e-venueId", JSON.stringify({ id }));
        $state.go("view-venue-profile");
      } else {
        toastMsg(false, "Please try again!");
        loader.hidden();
      }
    }

    $scope.confirmStatus = (status, id) => {
      if (id) {
        // let status = 'inactive';
        // if (statusV == 'inactive') status = 'active';
        loader.visible();
        Business.updateStatus({ params: { id, status } })
          .$promise.then((res) => {
            $scope.searchSubmit();
            setTimeout(function () {
              toastMsg(true, "Successfully updated.");
              loader.hidden();
            }, 100);
          });
      } else toastMsg(false, "Please try again!");
    }

    $scope.confirmAppStatus = (isAppLive, id) => {
      if (id) {
        isAppLive = (isAppLive ? false : true);
        loader.visible();
        console.log(isAppLive);
        Business.updateAppStatus({ params: { id, isAppLive } })
          .$promise.then((res) => {
            $scope.searchSubmit();
            setTimeout(function () {
              toastMsg(true, "Successfully updated.");
              loader.hidden();
            }, 100);
          });
      } else toastMsg(false, "Please try again!");
    }


    $scope.appendBusiness = [];
    if ($scope.currentUser && $scope.currentUser.email && $scope.currentUser.email == 'admin@barm8.com.au') $scope.searchSubmit();

    $scope.deleteId = '';
    $scope.businessDelete = (id, businessName) => {
      $scope.deleteId = '';
      $scope.deleteId = id;
      $("#msgTxt").text(`Do you want delete ${businessName} ?`);
      $("#msgShow").modal({ backdrop: 'static', keyboard: false });
    };

    $scope.removeBusiness = function (item) {
      Business.deleteById({ id: $scope.deleteId }).$promise.then(function (res) {
        if (res.count == 1) $scope.searchSubmit();
      });
    };
  }])
  .controller('businessViewCtl', ['$scope', '$state', 'Business', 'Category', '$http', 'loader', '$rootScope', 'getAllVenues', function ($scope, $state, Business, Category, $http, loader, $rootScope, getAllVenues) {

    $('html, body').css('overflow-y', 'visible');
    $('html, body').css('overflow-x', 'unset');

    $scope.venueFeaturesData = [{ name: "Beer garden", _name: "Beer_garden" },
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
    { name: "LGBTQIA+", _name: "LGBTQIA" }];


    $scope.barTypeData = [{ name: "Themed", _name: "Themed" },
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
    { name: "Karaoke", _name: "Karaoke" }];

    $scope.venueTagData = [...$scope.venueFeaturesData, ...$scope.barTypeData];

    toastMsg = (isVaild, msg) => {
      if (isVaild)
        toastr.success(msg);
      else
        toastr.error(msg);
      toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
    }

    $scope.isBusinessSelect = false;

    $scope.getBusinessName = () => { return $scope.businessDelection; };

    $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

    if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

    $scope.getBusinessData = () => {
      loader.visible();
      Business.findOne({
        filter: {
          where: { id: $scope.userId }, include: [{
            relation: "venueFeatures",
            scope: { where: { ownerId: $scope.userId } }
          }, {
            relation: "barTypes",
            scope: { where: { ownerId: $scope.userId } }
          }, {
            relation: "venueTags",
            scope: { where: { ownerId: $scope.userId } }
          }]
        }
      }).$promise.then(function (res) {

        $scope.business = {};
        $scope.business = res;

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
          let venueTags = res.venueTags.find(m => m._name == $(this).data('namefeatures'));
          if (venueTags && venueTags.name && venueTags._name) $(this).prop('checked', true);
        });

        if (!res.location) {
          $scope.business.location = {};
          $scope.business.location.lat = "";
          $scope.business.location.lng = "";
        }

        setTimeout(function () { loader.hidden() }, 200);

      }, function (err) {
        toastr.success('Please Try again!.');
        toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
      });
    }


    if ($rootScope && $rootScope.currentUser && $rootScope.currentUser.isAdmin) {
      $scope.isBusinessSelect = true;
      if ($rootScope.selectedVenue) {
        loader.visible()
        setTimeout(function () {
          $scope.businessDelection = getAllVenues.get();
          loader.hidden();
        }, 1000)
        $scope.userId = $rootScope.selectedVenue.venueId;
        $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
        $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.venueId);
        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
        $scope.getBusinessData();
      } else {
        loader.visible()
        setTimeout(function () {
          $scope.businessDelection = getAllVenues.get();
          loader.hidden();
        }, 1000)
        $scope.userId = $rootScope.currentUser.id;
      }
    }
    else {
      $scope.isBusinessSelect = true;
      $scope.userId = $rootScope.currentUser.id;
    }

    if ($scope.userDetails.isAdmin == false) {
      $scope.userId = $scope.userDetails.id
      $scope.getBusinessData();
      // $("#autocompleteBusiness").val($scope.userDetails.businessName);
      localStorage.removeItem("selectedVenue");
      // $("#autocompleteBusiness").attr('disabled', true);
      localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userDetails.id, venueId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
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
            $rootScope.selectedVenue = { ownerId: $scope.userId, venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
            $scope.getBusinessData();
          }
        } else $("#businessErr").text('Please select the Business name');
      }
    }

  }])
