angular.module('app')
  .controller('scanIdsController', ['$scope', 'CurrentVisit', '$state', '$http', '$rootScope', 'Business', 'loader', function ($scope, CurrentVisit, $state, $http, $rootScope, Business, loader) {

    $scope.customerDetails = [];

    if (!$scope.userId) $scope.userId = $rootScope.currentUser.id;

    $scope.userDetails = JSON.parse(localStorage.getItem("userSession"));

    if (!$scope.userDetails.isAdmin) $("#businessSubmit").css({ display: 'none' });

    toastMsg = (isVaild, msg) => {
      if (isVaild)
        toastr.success(msg);
      else
        toastr.error(msg);
      toastr.options = { "closeButton": true, "progressBar": true, "timeOut": "5000" };
    }

    $scope.useremail = $rootScope.currentUser.email;
    $scope.userId = ""; $scope.isBusinessSelected = false;
    if ($rootScope.currentUser && $rootScope.currentUser.isAdmin) {
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

    $scope.venueVisitData = { currentVisitCnt: 0 };
    $scope.resetButtonDis = true;
    $scope.getScanCustomers = () => {
      loader.visible();
      $scope.venueVisitData = { currentVisitCnt: 0 };
      Business.findOne({ filter: { where: { id: $scope.ownerId }, fields: ["id", "currentVisitCnt"] } }).$promise.then((res) => {
        if (res) {
          if (res.currentVisitCnt >= 1) $scope.resetButtonDis = false;
          $scope.venueVisitData = res;
        }
      })
      CurrentVisit.find({ filter: { where: { ownerId: $scope.ownerId }, include: "customer", order: "isCreate desc" } }).$promise.then((res) => {
        $scope.customerDetails = res;
      })
      setTimeout(function () { loader.hidden(); }, 500);
    }

    if ($rootScope.currentUser && $rootScope.currentUser.isAdmin) {
      $("#scanForVenue").css({ "margin-top": "0.5rem" });
      $scope.ownerId = $rootScope.currentUser.id;
      $scope.getScanCustomers();
    }

    if ($scope.userDetails.isAdmin == false) {
      $scope.ownerId = $scope.userDetails.id;
      $("#autocompleteBusiness").val($scope.userDetails.businessName);
      localStorage.removeItem("selectedVenue");
      $("#autocompleteBusiness").attr('disabled', true);
      localStorage.setItem("selectedVenue", JSON.stringify({ ownerId: $scope.userDetails.id, venueName: $scope.userDetails.businessName }));
      $scope.getScanCustomers();
    }

    $scope.Filter = () => {
      $("#date_filter_err").text('');
      let date, month, year;
      if ($("#dateFilter").val()) {
        let dateS = $("#dateFilter").val().split('T')[0];
        if (dateS) {
          dateS = dateS.replace(/\b0/g, '');
          dateS = dateS.split('-');
          date = dateS[2]; month = dateS[1]; year = dateS[0];
          CurrentVisit.find({ filter: { where: { date, month, year, ownerId: $scope.ownerId }, include: "customer" } }).$promise.then((res) => {
            $scope.customerDetails = res;
          })
        }
      } else $("#date_filter_err").text('Date is required!');
    }

    $scope.resetClk = () => {
      $('#resetModal').modal({ backdrop: 'static', keyboard: false })
    }

    $scope.confirm_reset = () => {
      if ($scope.ownerId) {
        Business.currentVisitReset({ params: { ownerId: $scope.ownerId } }).$promise.then((res) => {
          $scope.getScanCustomers();
          $('#resetModal').modal('hide');
          toastMsg(true, "Successfully updated!");
        }, (err) => {
          $('#resetModal').modal('hide');
          toastMsg(false, "Please try again");
        })
      }
    }

    $scope.ownerId;
    $scope.BusinessSelected = (arg) => {
      $("#businessErr").text('');
      if ($("#autocompleteBusiness").data('id')) {
        $scope.ownerId = $("#autocompleteBusiness").data('id');
        $scope.isBusinessSelected = true;
        if ($("#businessSubmit").hasClass('businessSubmit')) {
          $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset');
          $("#businessSubmit").removeClass('businessSubmit').addClass('businessReset');
          $rootScope.selectedVenue = { venueId: $scope.userId, ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
          localStorage.removeItem("selectedVenue");
          localStorage.setItem("selectedVenue", JSON.stringify({ venueId: $scope.userId, ownerId: $scope.userId, venueName: $("#autocompleteBusiness").val() }));
          $scope.getScanCustomers();
        }
      } else {
        $("#businessErr").text('Please select the Business name');
      }
    };

    $scope.addTableNo = (id) => {
      $('#tableNoUpdate').modal({ backdrop: 'static', keyboard: false });
      $("#update_table_no_btn").data('id', id);
    }

    $scope.updateTableNo = () => {
      let id = $("#update_table_no_btn").data('id');
      $("#table_no_err").text('');
      if ($("#tableNo").val()) {
        let tableNo = $("#tableNo").val();
        CurrentVisit.upsertWithWhere({ where: { id } }, { tableNo }).$promise.then((res) => {
          $('#tableNoUpdate').modal('hide');
          toastMsg(true, "Successfully updated!");
          $scope.getScanCustomers();
        }, (err) => {
          console.log(JSON.stringify(err));
        });

      } else $("#table_no_err").text('Table number is required!');
    }

    if ($rootScope.selectedVenue && $rootScope.selectedVenue.venueId) {
      $("#autocompleteBusiness").val($rootScope.selectedVenue.venueName);
      $scope.userId = $rootScope.selectedVenue.venueId;
      $("#autocompleteBusiness").data('id', $rootScope.selectedVenue.venueId)
      if ($("#businessSubmit").hasClass('businessSubmit')) {
        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Reset').removeClass('businessSubmit').addClass('businessReset');
      }
      $scope.isBusinessSelect = true;
      $rootScope.selectedVenue = { venueId: $scope.userId, venueName: $("#autocompleteBusiness").val() }
      $scope.getScanCustomers();
    }
  }]);