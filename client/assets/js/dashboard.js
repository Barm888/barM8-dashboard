

$(document).ready(function () {
  $(".date").datepicker({
    // autoclose: true, startDate: new Date(), format: "dd-mm-yyyy"
    autoclose: true, format: "dd-mm-yyyy"
  }).on('changeDate', function (e) {
      var scope = angular.element("#dashboardId").scope();
      scope.change($("#selectedvalue").val());
    });
});




