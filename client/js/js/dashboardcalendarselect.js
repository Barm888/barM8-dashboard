function changeTime(type, event) {
  angular.element(document.getElementById('businessManager')).scope().startandendTimeChnage(type, $(event).val(), $(event).data('name'));
}

var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

$(function () {
  $('#datepicker_push_notification').datepicker({ multidate: true, startDate: new Date() });
  $('#datepicker_push_notification').on('changeDate', function () {
    var items = $.map($("#datepicker_push_notification .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    var date = $('#datepicker_push_notification').datepicker('getFormattedDate');
    var month = ($("#datepicker_push_notification .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    var year = ($("#datepicker_push_notification .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    var monthIndex = monthNames.indexOf(month) + 1;
    angular.element(document.getElementById('businessManager')).scope().notificationSelected(items, monthIndex, year);
  });
  $('#datepicker_loyality').datepicker({ multidate: true, startDate: new Date() });
  $('#datepicker_loyality').on('changeDate', function () {
    let items = $.map($("#datepicker_loyality .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    let date = $('#datepicker_loyality').datepicker('getFormattedDate');
    let month = ($("#datepicker_loyality .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    let year = ($("#datepicker_loyality .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    let monthIndex = monthNames.indexOf(month) + 1;
    angular.element(document.getElementById('businessManager')).scope().LoyaltydateSelected(items, monthIndex, year);
  });

  $('#datepicker_loyality_rewards_notification').datepicker({ multidate: true, startDate: new Date() });
  $('#datepicker_loyality_rewards_notification').on('changeDate', function () {
    var items = $.map($("#datepicker_loyality_rewards_notification .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    var date = $('#datepicker_loyality_rewards_notification').datepicker('getFormattedDate');
    var month = ($("#datepicker_loyality_rewards_notification .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    var year = ($("#datepicker_loyality_rewards_notification .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    var monthIndex = monthNames.indexOf(month) + 1;
    if (items && items.length > 0) {
      angular.element(document.getElementById('businessManager')).scope().getDatebyLoyaltyRewards(("0" + items[0]).slice(-2),("0" + monthIndex).slice(-2) , year);
    }else{
      angular.element(document.getElementById('businessManager')).scope().getDatebyLoyaltyRewards([],("0" + monthIndex).slice(-2) , year);
    }
  });
});

function Column_loyality_rewards_notifi(event){
  if ($(event).is(':checked')) {
    $("#datepicker_loyality_rewards_notification .datepicker-days .table-condensed tbody tr td:nth-child(" + $(event).val() + ")").not('.old').not('.new').not('.disabled').addClass('active');
    var items = [];
    items = $.map($("#datepicker_loyality_rewards_notification .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    var month = ($("#datepicker_loyality_rewards_notification .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    var year = ($("#datepicker_loyality_rewards_notification .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    var monthIndex = monthNames.indexOf(month) + 1;
    var datesAdd = [];
    $.each(items, function (key, val) {
      datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
    });
    $('#datepicker_loyality_rewards_notification').datepicker('setDates', datesAdd);
    if (items && items.length > 0) {
      angular.element(document.getElementById('businessManager')).scope().getDatebyLoyaltyRewards(("0" + items[0]).slice(-2),("0" + monthIndex).slice(-2) , year);
    }else{
      angular.element(document.getElementById('businessManager')).scope().getDatebyLoyaltyRewards([],("0" + monthIndex).slice(-2) , year);
    }
   
  }
  else {
    $("#datepicker_loyality_rewards_notification .datepicker-days .table-condensed tbody tr td:nth-child(" + $(event).val() + ")").not('.old').not('.new').not('.disabled').removeClass('active');
    var items = [];
    items = $.map($("#datepicker_loyality_rewards_notification .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    var month = ($("#datepicker_loyality_rewards_notification .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    var year = ($("#datepicker_loyality_rewards_notification .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    var monthIndex = monthNames.indexOf(month) + 1;
    var datesAdd = [];
    $.each(items, function (key, val) {
      datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
    });
    $('#datepicker_loyality_rewards_notification').datepicker('setDates', datesAdd);
    if (items && items.length > 0) {
      angular.element(document.getElementById('businessManager')).scope().getDatebyLoyaltyRewards(("0" + items[0]).slice(-2),("0" + monthIndex).slice(-2) , year);
    }else{
      angular.element(document.getElementById('businessManager')).scope().getDatebyLoyaltyRewards([],("0" + monthIndex).slice(-2) , year);
    }
  }
}

function Row_loyality_rewards_notifi(event){
  if ($(event).is(':checked')) {
    $("#datepicker_loyality_rewards_notification .datepicker-days .table-condensed tbody tr:nth-child(" + $(event).val() + ") td").not('.old').not('.new').not('.disabled').addClass('active');
    var items = [];
    items = $.map($("#datepicker_loyality_rewards_notification .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    var month = ($("#datepicker_loyality_rewards_notification .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    var year = ($("#datepicker_loyality_rewards_notification .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    var monthIndex = monthNames.indexOf(month) + 1;
    var datesAdd = [];
    $.each(items, function (key, val) {
      datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
    });
    $('#datepicker_loyality_rewards_notification').datepicker('setDates', datesAdd);
    if (items && items.length > 0) {
      angular.element(document.getElementById('businessManager')).scope().getDatebyLoyaltyRewards(("0" + items[0]).slice(-2),("0" + monthIndex).slice(-2) , year);
    }else{
      angular.element(document.getElementById('businessManager')).scope().getDatebyLoyaltyRewards([],("0" + monthIndex).slice(-2) , year);
    }
  }
  else {
    $("#datepicker_loyality_rewards_notification .datepicker-days .table-condensed tbody tr:nth-child(" + $(event).val() + ") td").not('.old').not('.new').not('.disabled').removeClass('active');
    var items = [];
    items = $.map($("#datepicker_loyality_rewards_notification .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    var month = ($("#datepicker_loyality_rewards_notification .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    var year = ($("#datepicker_loyality_rewards_notification .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    var monthIndex = monthNames.indexOf(month) + 1;
    $('#datepicker_loyality_rewards_notification').data('datepicker').setDate(null);
    var datesAdd = [];
    if (items.length > 0) {
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_loyality_rewards_notification').datepicker('setDates', datesAdd);
    }
    if (items && items.length > 0) {
      angular.element(document.getElementById('businessManager')).scope().getDatebyLoyaltyRewards(("0" + items[0]).slice(-2),("0" + monthIndex).slice(-2) , year);
    }else{
      angular.element(document.getElementById('businessManager')).scope().getDatebyLoyaltyRewards([],("0" + monthIndex).slice(-2) , year);
    }
  }
}



function Column_loyality(event){
  if ($(event).is(':checked')) {
    $("#datepicker_loyality .datepicker-days .table-condensed tbody tr td:nth-child(" + $(event).val() + ")").not('.old').not('.new').not('.disabled').addClass('active');
    var items = [];
    items = $.map($("#datepicker_loyality .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    var month = ($("#datepicker_loyality .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    var year = ($("#datepicker_loyality .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    var monthIndex = monthNames.indexOf(month) + 1;
    var datesAdd = [];
    $.each(items, function (key, val) {
      datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
    });
    $('#datepicker_loyality').datepicker('setDates', datesAdd);
    angular.element(document.getElementById('businessManager')).scope().LoyaltydateSelected(items, monthIndex, year);
  }
  else {
    $("#datepicker_loyality .datepicker-days .table-condensed tbody tr td:nth-child(" + $(event).val() + ")").not('.old').not('.new').not('.disabled').removeClass('active');
    var items = [];
    items = $.map($("#datepicker_loyality .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    var month = ($("#datepicker_loyality .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    var year = ($("#datepicker_loyality .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    var monthIndex = monthNames.indexOf(month) + 1;
    var datesAdd = [];
    $.each(items, function (key, val) {
      datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
    });
    $('#datepicker_loyality').datepicker('setDates', datesAdd);
    angular.element(document.getElementById('businessManager')).scope().LoyaltydateSelected(items, monthIndex, year);
  }
}

function Row_loyality(event){
  if ($(event).is(':checked')) {
    $("#datepicker_loyality .datepicker-days .table-condensed tbody tr:nth-child(" + $(event).val() + ") td").not('.old').not('.new').not('.disabled').addClass('active');
    var items = [];
    items = $.map($("#datepicker_loyality .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    var month = ($("#datepicker_loyality .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    var year = ($("#datepicker_loyality .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    var monthIndex = monthNames.indexOf(month) + 1;
    var datesAdd = [];
    $.each(items, function (key, val) {
      datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
    });
    $('#datepicker_loyality').datepicker('setDates', datesAdd);
    angular.element(document.getElementById('businessManager')).scope().LoyaltydateSelected(items, monthIndex, year);
  }
  else {
    $("#datepicker_loyality .datepicker-days .table-condensed tbody tr:nth-child(" + $(event).val() + ") td").not('.old').not('.new').not('.disabled').removeClass('active');
    var items = [];
    items = $.map($("#datepicker_loyality .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    var month = ($("#datepicker_loyality .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    var year = ($("#datepicker_loyality .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    var monthIndex = monthNames.indexOf(month) + 1;
    $('#datepicker_loyality').data('datepicker').setDate(null);
    var datesAdd = [];
    if (items.length > 0) {
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_loyality').datepicker('setDates', datesAdd);
    }
    angular.element(document.getElementById('businessManager')).scope().LoyaltydateSelected(items, monthIndex, year);
  }
}



function events_columnChange(event) {

  if ($(event).data('name') == "Entertainment") {
    if ($(event).is(':checked')) {
      $("#datepicker_Entertainment .datepicker-days .table-condensed tbody tr td:nth-child(" + $(event).val() + ")").not('.old').not('.new').not('.disabled').addClass('active');
      var items = $.map($("#datepicker_Entertainment .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
      var month = ($("#datepicker_Entertainment .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
      var year = ($("#datepicker_Entertainment .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
      var monthIndex = monthNames.indexOf(month) + 1;
      var datesAdd = [];
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_Entertainment').datepicker('setDates', datesAdd);
      angular.element(document.getElementById('businessManager')).scope().entertainmentdateSelected(items, monthIndex, year);
    }
    else {
      $("#datepicker_Entertainment .datepicker-days .table-condensed tbody tr td:nth-child(" + $(event).val() + ")").not('.old').not('.new').not('.disabled').removeClass('active');
      var items = $.map($("#datepicker_Entertainment .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
      var month = ($("#datepicker_Entertainment .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
      var year = ($("#datepicker_Entertainment .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
      var monthIndex = monthNames.indexOf(month) + 1;
      var datesAdd = [];
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_Entertainment').datepicker('setDates', datesAdd);
      angular.element(document.getElementById('businessManager')).scope().entertainmentdateSelected(items, monthIndex, year);
    }
  }
  if ($(event).data('name') == "Sports") {
    if ($(event).is(':checked')) {
      $("#datepicker_Sports .datepicker-days .table-condensed tbody tr td:nth-child(" + $(event).val() + ")").not('.old').not('.new').not('.disabled').addClass('active');
      var items = $.map($("#datepicker_Sports .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
      var month = ($("#datepicker_Sports .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
      var year = ($("#datepicker_Sports .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
      var monthIndex = monthNames.indexOf(month) + 1;
      var datesAdd = [];
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_Sports').datepicker('setDates', datesAdd);
      angular.element(document.getElementById('businessManager')).scope().sportsdateSelected(items, monthIndex, year);
    }
    else {
      $("#datepicker_Sports .datepicker-days .table-condensed tbody tr td:nth-child(" + $(event).val() + ")").not('.old').not('.new').not('.disabled').removeClass('active');
      var items = $.map($("#datepicker_Sports .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
      var month = ($("#datepicker_Sports .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
      var year = ($("#datepicker_Sports .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
      var monthIndex = monthNames.indexOf(month) + 1;
      var datesAdd = [];
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_Sports').datepicker('setDates', datesAdd);
      angular.element(document.getElementById('businessManager')).scope().sportsdateSelected(items, monthIndex, year);
    }
  }
  if ($(event).data('name') == "Events") {
    if ($(event).is(':checked')) {
      $("#datepicker_Events .datepicker-days .table-condensed tbody tr td:nth-child(" + $(event).val() + ")").not('.old').not('.new').not('.disabled').addClass('active');
      var items = $.map($("#datepicker_Events .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
      var month = ($("#datepicker_Events .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
      var year = ($("#datepicker_Events .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
      var monthIndex = monthNames.indexOf(month) + 1;
      var datesAdd = [];
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_Events').datepicker('setDates', datesAdd);
      angular.element(document.getElementById('businessManager')).scope().eventdateSelected(items, monthIndex, year);
    }
    else {
      $("#datepicker_Events .datepicker-days .table-condensed tbody tr td:nth-child(" + $(event).val() + ")").not('.old').not('.new').not('.disabled').removeClass('active');
      var items = $.map($("#datepicker_Events .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
      var month = ($("#datepicker_Events .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
      var year = ($("#datepicker_Events .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
      var monthIndex = monthNames.indexOf(month) + 1;
      var datesAdd = [];
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_Events').datepicker('setDates', datesAdd);
      angular.element(document.getElementById('businessManager')).scope().eventdateSelected(items, monthIndex, year);
    }
  }
  if ($(event).data('name') == "Special_Events") {
    if ($(event).is(':checked')) {
      $("#datepicker_Special_Events .datepicker-days .table-condensed tbody tr td:nth-child(" + $(event).val() + ")").not('.old').not('.new').not('.disabled').addClass('active');
      var items = $.map($("#datepicker_Special_Events .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
      var month = ($("#datepicker_Special_Events .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
      var year = ($("#datepicker_Special_Events .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
      var monthIndex = monthNames.indexOf(month) + 1;
      var datesAdd = [];
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_Special_Events').datepicker('setDates', datesAdd);
      angular.element(document.getElementById('businessManager')).scope().specialEventSelected(items, monthIndex, year);
    }
    else {
      $("#datepicker_Special_Events .datepicker-days .table-condensed tbody tr td:nth-child(" + $(event).val() + ")").not('.old').not('.new').not('.disabled').removeClass('active');
      var items = $.map($("#datepicker_Special_Events .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
      var month = ($("#datepicker_Special_Events .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
      var year = ($("#datepicker_Special_Events .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
      var monthIndex = monthNames.indexOf(month) + 1;
      var datesAdd = [];
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_Special_Events').datepicker('setDates', datesAdd);
      angular.element(document.getElementById('businessManager')).scope().specialEventSelected(items, monthIndex, year);
    }
  }
}

function events_rowChange(event) {
  if ($(event).data('name') == "Entertainment") {
    if ($(event).is(':checked')) {
      $("#datepicker_Entertainment .datepicker-days .table-condensed tbody tr:nth-child(" + $(event).val() + ") td").not('.old').not('.new').not('.disabled').addClass('active');
      var items = $.map($("#datepicker_Entertainment .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
      var month = ($("#datepicker_Entertainment .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
      var year = ($("#datepicker_Entertainment .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
      var monthIndex = monthNames.indexOf(month) + 1;
      var datesAdd = [];
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_Entertainment').datepicker('setDates', datesAdd);
      angular.element(document.getElementById('businessManager')).scope().entertainmentdateSelected(items, monthIndex, year);
    }
    else {
      $("#datepicker_Entertainment .datepicker-days .table-condensed tbody tr:nth-child(" + $(event).val() + ") td").not('.old').not('.new').not('.disabled').removeClass('active');
      var items = $.map($("#datepicker_Entertainment .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
      var month = ($("#datepicker_Entertainment .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
      var year = ($("#datepicker_Entertainment .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
      var monthIndex = monthNames.indexOf(month) + 1;
      var datesAdd = [];
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_Entertainment').datepicker('setDates', datesAdd);
      angular.element(document.getElementById('businessManager')).scope().entertainmentdateSelected(items, monthIndex, year);
    }
  }
  if ($(event).data('name') == "Sports") {
    if ($(event).is(':checked')) {
      $("#datepicker_Sports .datepicker-days .table-condensed tbody tr:nth-child(" + $(event).val() + ") td").not('.old').not('.new').not('.disabled').addClass('active');
      var items = $.map($("#datepicker_Sports .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
      var month = ($("#datepicker_Sports .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
      var year = ($("#datepicker_Sports .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
      var monthIndex = monthNames.indexOf(month) + 1;
      var datesAdd = [];
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_Sports').datepicker('setDates', datesAdd);
      angular.element(document.getElementById('businessManager')).scope().sportsdateSelected(items, monthIndex, year);
    }
    else {
      $("#datepicker_Sports .datepicker-days .table-condensed tbody tr:nth-child(" + $(event).val() + ") td").not('.old').not('.new').not('.disabled').removeClass('active');
      var items = $.map($("#datepicker_Sports .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
      var month = ($("#datepicker_Sports .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
      var year = ($("#datepicker_Sports .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
      var monthIndex = monthNames.indexOf(month) + 1;
      var datesAdd = [];
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_Sports').datepicker('setDates', datesAdd);
      angular.element(document.getElementById('businessManager')).scope().sportsdateSelected(items, monthIndex, year);
    }
  }
  if ($(event).data('name') == "Events") {
    if ($(event).is(':checked')) {
      $("#datepicker_Events .datepicker-days .table-condensed tbody tr:nth-child(" + $(event).val() + ") td").not('.old').not('.new').not('.disabled').addClass('active');
      var items = $.map($("#datepicker_Events .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
      var month = ($("#datepicker_Events .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
      var year = ($("#datepicker_Events .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
      var monthIndex = monthNames.indexOf(month) + 1;
      var datesAdd = [];
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_Events').datepicker('setDates', datesAdd);
      angular.element(document.getElementById('businessManager')).scope().eventdateSelected(items, monthIndex, year);
    }
    else {
      $("#datepicker_Events .datepicker-days .table-condensed tbody tr:nth-child(" + $(event).val() + ") td").not('.old').not('.new').not('.disabled').removeClass('active');
      var items = $.map($("#datepicker_Events .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
      var month = ($("#datepicker_Events .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
      var year = ($("#datepicker_Events .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
      var monthIndex = monthNames.indexOf(month) + 1;
      var datesAdd = [];
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_Events').datepicker('setDates', datesAdd);
      angular.element(document.getElementById('businessManager')).scope().eventdateSelected(items, monthIndex, year);
    }
  }
  if ($(event).data('name') == "Special_Events") {
    if ($(event).is(':checked')) {
      $("#datepicker_Special_Events .datepicker-days .table-condensed tbody tr:nth-child(" + $(event).val() + ") td").not('.old').not('.new').not('.disabled').addClass('active');
      var items = $.map($("#datepicker_Special_Events .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
      var month = ($("#datepicker_Special_Events .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
      var year = ($("#datepicker_Special_Events .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
      var monthIndex = monthNames.indexOf(month) + 1;
      var datesAdd = [];
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_Special_Events').datepicker('setDates', datesAdd);
      angular.element(document.getElementById('businessManager')).scope().specialEventSelected(items, monthIndex, year);
    }
    else {
      $("#datepicker_Special_Events .datepicker-days .table-condensed tbody tr:nth-child(" + $(event).val() + ") td").not('.old').not('.new').not('.disabled').removeClass('active');
      var items = $.map($("#datepicker_Special_Events .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
      var month = ($("#datepicker_Special_Events .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
      var year = ($("#datepicker_Special_Events .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
      var monthIndex = monthNames.indexOf(month) + 1;
      var datesAdd = [];
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_Special_Events').datepicker('setDates', datesAdd);
      angular.element(document.getElementById('businessManager')).scope().specialEventSelected(items, monthIndex, year);
    }
  }
}

function whatshot_rowChange(event) {
  if ($(event).data('name') == "whatshot") {
    if ($(event).is(':checked')) {
      $("#datepicker_whatshot .datepicker-days .table-condensed tbody tr:nth-child(" + $(event).val() + ") td").not('.old').not('.new').not('.disabled').addClass('active');
      var items = $.map($("#datepicker_whatshot .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
      var month = ($("#datepicker_whatshot .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
      var year = ($("#datepicker_whatshot .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
      var monthIndex = monthNames.indexOf(month) + 1;
      var datesAdd = [];
      if (items.length > 0) {
        $.each(items, function (key, val) {
          datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
        });
        $('#datepicker_whatshot').datepicker('setDates', datesAdd);
      }
      angular.element(document.getElementById('businessManager')).scope().whatshotSelected(items, monthIndex, year);
    }
    else {
      $("#datepicker_whatshot .datepicker-days .table-condensed tbody tr:nth-child(" + $(event).val() + ") td").not('.old').not('.new').not('.disabled').removeClass('active');
      var items = $.map($("#datepicker_whatshot .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
      var month = ($("#datepicker_whatshot .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
      var year = ($("#datepicker_whatshot .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
      var monthIndex = monthNames.indexOf(month) + 1;
      var datesAdd = [];
      if (items.length > 0) {
        $.each(items, function (key, val) {
          datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
        });
        $('#datepicker_whatshot').datepicker('setDates', datesAdd);
      }
      angular.element(document.getElementById('businessManager')).scope().whatshotSelected(items, monthIndex, year);
    }
  }
}

function whatshot_columnChange(event) {
  if ($(event).data('name') == "whatshot") {
    if ($(event).is(':checked')) {
      $("#datepicker_whatshot .datepicker-days .table-condensed tbody tr td:nth-child(" + $(event).val() + ")").not('.old').not('.new').not('.disabled').addClass('active');
      var items = $.map($("#datepicker_whatshot .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
      var month = ($("#datepicker_whatshot .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
      var year = ($("#datepicker_whatshot .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
      var monthIndex = monthNames.indexOf(month) + 1;
      var datesAdd = [];
      if (items.length > 0) {
        $.each(items, function (key, val) {
          datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
        });
        $('#datepicker_whatshot').datepicker('setDates', datesAdd);
      }
      angular.element(document.getElementById('businessManager')).scope().whatshotSelected(items, monthIndex, year);

    } else {
      $("#datepicker_whatshot .datepicker-days .table-condensed tbody tr td:nth-child(" + $(event).val() + ")").not('.old').not('.new').not('.disabled').removeClass('active');
      var items = $.map($("#datepicker_whatshot .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
      var month = ($("#datepicker_whatshot .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
      var year = ($("#datepicker_whatshot .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
      var monthIndex = monthNames.indexOf(month) + 1;
      var datesAdd = [];
      if (items.length > 0) {
        $.each(items, function (key, val) {
          datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
        });
        $('#datepicker_whatshot').datepicker('setDates', datesAdd);
      }
      angular.element(document.getElementById('businessManager')).scope().whatshotSelected(items, monthIndex, year);
    }
  }
}

function sponsor_rowChange(event) {
  if ($(event).data('name') == "sponsor") {
    if ($(event).is(':checked')) {
      $("#datepicker_sponsor .datepicker-days .table-condensed tbody tr:nth-child(" + $(event).val() + ") td").not('.old').not('.new').not('.disabled').addClass('active');
      var items = $.map($("#datepicker_sponsor .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
      var month = ($("#datepicker_sponsor .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
      var year = ($("#datepicker_sponsor .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
      var monthIndex = monthNames.indexOf(month) + 1;
      var datesAdd = [];
      if (items.length > 0) {
        $.each(items, function (key, val) {
          datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
        });
        $('#datepicker_sponsor').datepicker('setDates', datesAdd);
      }
      angular.element(document.getElementById('businessManager')).scope().sponsorSelected(items, monthIndex, year);
    }
    else {
      $("#datepicker_sponsor .datepicker-days .table-condensed tbody tr:nth-child(" + $(event).val() + ") td").not('.old').not('.new').not('.disabled').removeClass('active');
      var items = $.map($("#datepicker_sponsor .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
      var month = ($("#datepicker_sponsor .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
      var year = ($("#datepicker_sponsor .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
      var monthIndex = monthNames.indexOf(month) + 1;
      var datesAdd = [];
      if (items.length > 0) {
        $.each(items, function (key, val) {
          datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
        });
        $('#datepicker_sponsor').datepicker('setDates', datesAdd);
      }
      angular.element(document.getElementById('businessManager')).scope().sponsorSelected(items, monthIndex, year);
    }
  }
}

function sponsor_columnChange(event) {
  if ($(event).data('name') == "sponsor") {
    if ($(event).is(':checked')) {
      $("#datepicker_sponsor .datepicker-days .table-condensed tbody tr td:nth-child(" + $(event).val() + ")").not('.old').not('.new').not('.disabled').addClass('active');
      var items = $.map($("#datepicker_sponsor .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
      var month = ($("#datepicker_sponsor .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
      var year = ($("#datepicker_sponsor .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
      var monthIndex = monthNames.indexOf(month) + 1;
      var datesAdd = [];
      if (items.length > 0) {
        $.each(items, function (key, val) {
          datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
        });
        $('#datepicker_sponsor').datepicker('setDates', datesAdd);
      }
      angular.element(document.getElementById('businessManager')).scope().sponsorSelected(items, monthIndex, year);

    } else {
      $("#datepicker_sponsor .datepicker-days .table-condensed tbody tr td:nth-child(" + $(event).val() + ")").not('.old').not('.new').not('.disabled').removeClass('active');
      var items = $.map($("#datepicker_sponsor .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
      var month = ($("#datepicker_sponsor .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
      var year = ($("#datepicker_sponsor .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
      var monthIndex = monthNames.indexOf(month) + 1;
      var datesAdd = [];
      if (items.length > 0) {
        $.each(items, function (key, val) {
          datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
        });
        $('#datepicker_sponsor').datepicker('setDates', datesAdd);
      }
      angular.element(document.getElementById('businessManager')).scope().sponsorSelected(items, monthIndex, year);
    }
  }
}

function Row_pushnotification(event) {
  if ($(event).is(':checked')) {
    $("#datepicker_push_notification .datepicker-days .table-condensed tbody tr:nth-child(" + $(event).val() + ") td").not('.old').not('.new').not('.disabled').addClass('active');
    var items = $.map($("#datepicker_push_notification .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    var month = ($("#datepicker_push_notification .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    var year = ($("#datepicker_push_notification .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    var monthIndex = monthNames.indexOf(month) + 1;
    var datesAdd = [];
    if (items.length > 0) {
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_push_notification').datepicker('setDates', datesAdd);
    }
    angular.element(document.getElementById('businessManager')).scope().getNotificationData(items, monthIndex, year);
  }
  else {
    $("#datepicker_push_notification .datepicker-days .table-condensed tbody tr:nth-child(" + $(event).val() + ") td").not('.old').not('.new').not('.disabled').removeClass('active');
    var items = $.map($("#datepicker_push_notification .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    var month = ($("#datepicker_push_notification .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    var year = ($("#datepicker_push_notification .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    var monthIndex = monthNames.indexOf(month) + 1;
    var datesAdd = [];
    if (items.length > 0) {
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_push_notification').datepicker('setDates', datesAdd);
    } else {
      $('#datepicker_push_notification').datepicker('setDates', null);
    }
    angular.element(document.getElementById('businessManager')).scope().getNotificationData(items, monthIndex, year);
  }
}

function Column_pushnotification(event) {
  if ($(event).is(':checked')) {
    $("#datepicker_push_notification .datepicker-days .table-condensed tbody tr td:nth-child(" + $(event).val() + ")").not('.old').not('.new').not('.disabled').addClass('active');
    var items = $.map($("#datepicker_push_notification .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    var month = ($("#datepicker_push_notification .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    var year = ($("#datepicker_push_notification .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    var monthIndex = monthNames.indexOf(month) + 1;
    var datesAdd = [];
    if (items.length > 0) {
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_push_notification').datepicker('setDates', datesAdd);
    }
    angular.element(document.getElementById('businessManager')).scope().getNotificationData(items, monthIndex, year);

  }
  else {
    $("#datepicker_push_notification .datepicker-days .table-condensed tbody tr td:nth-child(" + $(event).val() + ")").not('.old').not('.new').not('.disabled').removeClass('active');
    var items = $.map($("#datepicker_push_notification .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    var month = ($("#datepicker_push_notification .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    var year = ($("#datepicker_push_notification .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    var monthIndex = monthNames.indexOf(month) + 1;
    var datesAdd = [];
    if (items.length > 0) {
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_push_notification').datepicker('setDates', datesAdd);
    } else {
      $('#datepicker_push_notification').datepicker('setDates', null);
    }
    angular.element(document.getElementById('businessManager')).scope().getNotificationData(items, monthIndex, year);
  }
}

function Row_meals(event) {
  if ($(event).is(':checked')) {
    $("#datepicker_meals .datepicker-days .table-condensed tbody tr:nth-child(" + $(event).val() + ") td").not('.old').not('.new').not('.disabled').addClass('active');
    var items = $.map($("#datepicker_meals .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    var month = ($("#datepicker_meals .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    var year = ($("#datepicker_meals .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    var monthIndex = monthNames.indexOf(month) + 1;
    var datesAdd = [];
    if (items.length > 0) {
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_meals').datepicker('setDates', datesAdd);
    }
    angular.element(document.getElementById('businessManager')).scope().getMealsDateSelected(items, monthIndex, year);
  }
  else {
    $("#datepicker_meals .datepicker-days .table-condensed tbody tr:nth-child(" + $(event).val() + ") td").not('.old').not('.new').not('.disabled').removeClass('active');
    var items = $.map($("#datepicker_meals .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    var month = ($("#datepicker_meals .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    var year = ($("#datepicker_meals .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    var monthIndex = monthNames.indexOf(month) + 1;
    var datesAdd = [];
    if (items.length > 0) {
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_meals').datepicker('setDates', datesAdd);
    } else {
      $('#datepicker_meals').datepicker('setDates', null);
    }
    angular.element(document.getElementById('businessManager')).scope().getMealsDateSelected(items, monthIndex, year);
  }
}

function Column_meals(event) {
  if ($(event).is(':checked')) {
    $("#datepicker_meals .datepicker-days .table-condensed tbody tr td:nth-child(" + $(event).val() + ")").not('.old').not('.new').not('.disabled').addClass('active');
    var items = $.map($("#datepicker_meals .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    var month = ($("#datepicker_meals .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    var year = ($("#datepicker_meals .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    var monthIndex = monthNames.indexOf(month) + 1;
    var datesAdd = [];
    if (items.length > 0) {
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_meals').datepicker('setDates', datesAdd);
    }
    angular.element(document.getElementById('businessManager')).scope().getMealsDateSelected(items, monthIndex, year);

  }
  else {
    $("#datepicker_meals .datepicker-days .table-condensed tbody tr td:nth-child(" + $(event).val() + ")").not('.old').not('.new').not('.disabled').removeClass('active');
    var items = $.map($("#datepicker_meals .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    var month = ($("#datepicker_meals .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    var year = ($("#datepicker_meals .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    var monthIndex = monthNames.indexOf(month) + 1;
    var datesAdd = [];
    if (items.length > 0) {
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_meals').datepicker('setDates', datesAdd);
    } else {
      $('#datepicker_meals').datepicker('setDates', null);
    }
    angular.element(document.getElementById('businessManager')).scope().getMealsDateSelected(items, monthIndex, year);
  }
}

//In App Special
// multidate: true,
$(function () {
  $('#datepicker_inAppSpecial').datepicker({
    multidate: true, startDate: new Date()
  });
  $('#datepicker_inAppSpecial').on('changeDate', function () {
    var items = $.map($("#datepicker_inAppSpecial .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    var date = $('#datepicker_inAppSpecial').datepicker('getFormattedDate');
    var month = ($("#datepicker_inAppSpecial .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    var year = ($("#datepicker_inAppSpecial .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    var monthIndex = monthNames.indexOf(month) + 1;
    angular.element(document.getElementById('businessManager')).scope().getinAppSpecialData(items, monthIndex, year);
  });
});



//meals
// multidate: true,
$(function () {

  $('#datepicker_meals').datepicker({
       multidate: true, startDate: new Date()
  });
  $('#datepicker_meals').on('changeDate', function () {
    var items = $.map($("#datepicker_meals .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    var date = $('#datepicker_meals').datepicker('getFormattedDate');
    var month = ($("#datepicker_meals .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    var year = ($("#datepicker_meals .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    var monthIndex = monthNames.indexOf(month) + 1;
    angular.element(document.getElementById('businessManager')).scope().getMealsDateSelected(items, monthIndex, year);
  });
});

//In App Special Row Change value
function Row_inAppSpecial(event) {
  if ($(event).is(':checked')) {
    $("#datepicker_inAppSpecial .datepicker-days .table-condensed tbody tr:nth-child(" + $(event).val() + ") td").not('.old').not('.new').not('.disabled').addClass('active');
    var items = $.map($("#datepicker_inAppSpecial .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    var month = ($("#datepicker_inAppSpecial .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    var year = ($("#datepicker_inAppSpecial .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    var monthIndex = monthNames.indexOf(month) + 1;
    var datesAdd = [];
    if (items.length > 0) {
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_inAppSpecial').datepicker('setDates', datesAdd);
    }
    angular.element(document.getElementById('businessManager')).scope().getinAppSpecialData(items, monthIndex, year);
  }
  else {
    $("#datepicker_inAppSpecial .datepicker-days .table-condensed tbody tr:nth-child(" + $(event).val() + ") td").not('.old').not('.new').not('.disabled').removeClass('active');
    var items = $.map($("#datepicker_inAppSpecial .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    var month = ($("#datepicker_inAppSpecial .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    var year = ($("#datepicker_inAppSpecial .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    var monthIndex = monthNames.indexOf(month) + 1;
    var datesAdd = [];
    if (items.length > 0) {
      $.each(items, function (key, val) {
        datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
      });
      $('#datepicker_inAppSpecial').datepicker('setDates', datesAdd);
    }
    angular.element(document.getElementById('businessManager')).scope().getinAppSpecialData(items, monthIndex, year);
  }
}

//InAppSpecial Column Change value
function Column_inAppSpecialChange(event) {
  if ($(event).is(':checked')) {
    $("#datepicker_inAppSpecial .datepicker-days .table-condensed tbody tr td:nth-child(" + $(event).val() + ")").not('.old').not('.new').not('.disabled').addClass('active');
    var items = [];
    items = $.map($("#datepicker_inAppSpecial .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    var month = ($("#datepicker_inAppSpecial .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    var year = ($("#datepicker_inAppSpecial .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    var monthIndex = monthNames.indexOf(month) + 1;
    var datesAdd = [];
    $.each(items, function (key, val) {
      datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
    });
    $('#datepicker_inAppSpecial').datepicker('setDates', datesAdd);
    angular.element(document.getElementById('businessManager')).scope().getinAppSpecialData(items, monthIndex, year);
  }
  else {
    $("#datepicker_inAppSpecial .datepicker-days .table-condensed tbody tr td:nth-child(" + $(event).val() + ")").not('.old').not('.new').not('.disabled').removeClass('active');
    var items = [];
    items = $.map($("#datepicker_inAppSpecial .datepicker-days .table-condensed tbody tr .active"), function (ele) { return $(ele).text(); });
    var month = ($("#datepicker_inAppSpecial .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
    var year = ($("#datepicker_inAppSpecial .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[1];
    var monthIndex = monthNames.indexOf(month) + 1;
    var datesAdd = [];
    $.each(items, function (key, val) {
      datesAdd.push(new Date(parseInt(year), parseInt((monthIndex - 1)), parseInt(val)));
    });
    $('#datepicker_inAppSpecial').datepicker('setDates', datesAdd);
    angular.element(document.getElementById('businessManager')).scope().getinAppSpecialData(items, monthIndex, year);
  }
}

//InAppSpecial Category Chnage
function inAppSpecialCategory(arg) {
  var date = $("#datepicker_inAppSpecial .datepicker-days .table-condensed tbody tr .active").html();
  var month = ($("#datepicker_inAppSpecial .datepicker-days .table-condensed thead  .datepicker-switch").text()).split(" ")[0];
  var year = $("#datepicker_inAppSpecial .table-condensed thead tr .datepicker-switch").html().toString().split(' ');
  var rootDate = new Date(`${date} ${month}, ${year}`);
  angular.element(document.getElementById('businessManager')).scope().inAppSpecialCategoryChange(arg, weekdays[parseInt(rootDate.getDay())]);
}


function mealsTapClick(arg) {
  if (arg == 'Breakfast') {
    angular.element(document.getElementById('businessManager')).scope().BreakfastRefresh();
  }
  else if (arg == 'Lunch') {
    angular.element(document.getElementById('businessManager')).scope().LunchRefresh();
  }
  else if (arg == 'Dinner') {
    angular.element(document.getElementById('businessManager')).scope().DinnerRefresh();
  }
  else if (arg == 'Allday') {
    angular.element(document.getElementById('businessManager')).scope().AlldayRefresh();
  }
}

function breakfast_lunch_ASIN(arg) {
  angular.element(document.getElementById('businessManager')).scope().meals_breakfast_asin_getTime(arg);
}

function lunch_startend_ASIN(arg) {
  angular.element(document.getElementById('businessManager')).scope().meals_lunch_asin_getTime(arg);
}

function dinner_startend_ASIN(arg) {
  angular.element(document.getElementById('businessManager')).scope().meals_dinner_asin_getTime(arg);
}

function allday_startend_ASIN(arg) {
  angular.element(document.getElementById('businessManager')).scope().meals_allday_asin_getTime(arg);
}






