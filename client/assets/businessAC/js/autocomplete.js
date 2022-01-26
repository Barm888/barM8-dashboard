function autocomplete(inp, call) {
  var currentFocus;
  inp.addEventListener("input", function (e) {
    if ($("#businessErr").text() != "") {
      $("#businessErr").text('');
    }
    if ($("#autocompleteBusiness").data('id') != null && $("#autocompleteBusiness").data('id') != undefined && $("#autocompleteBusiness").data('id') != "") {
      $("#autocompleteBusiness").data('id', null);
    }
    var a, b, i, val = this.value;
    closeAllLists();
    if (!val) { return false; }
    currentFocus = -1;
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    this.parentNode.appendChild(a);
    var arg = [];
    if (call == 'analytics') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
        $("#businessSubmit").removeClass('businessReset').addClass('businessSubmit');
      }
      arg = angular.element('#analyticsChart').scope().getBusinessName();
    }
    else if (call == 'createNewEventFirst') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
        $("#businessSubmit").removeClass('businessReset').addClass('businessSubmit');
      }
      arg = angular.element('#createNewHappenings').scope().getBusinessName();
    }
    else if (call == 'businessManager') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
        $("#businessSubmit").removeClass('businessReset').addClass('businessSubmit');
      }
      arg = angular.element('#businessManager').scope().autoCompleteBusinessName();
    }
    else if (call == 'profileUpdate') {
      if ($(".submitBtnProfile").hasClass('businessReset')) {
        $(".submitBtnProfile").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
        $(".submitBtnProfile").removeClass('businessReset').addClass('businessSubmit');
      }
      arg = angular.element('#editProfile').scope().getBusinessName();
    }
    else if (call == 'scansBusiness') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
        $("#businessSubmit").removeClass('businessReset').addClass('businessSubmit');
      }
      arg = angular.element('#wrapper').scope().getBusinessName();
    }
    else if (call == 'order') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
        $("#businessSubmit").removeClass('businessReset').addClass('businessSubmit');
      }
      arg = angular.element('#wrapper').scope().getBusinessName();
    }
    else if (call == 'eventbooking') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
        $("#businessSubmit").removeClass('businessReset').addClass('businessSubmit');
      }
      arg = angular.element('#wrapper').scope().getBusinessName();
    }
    else if (call == 'createEvent') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#wrapper').scope().getBusinessName();
    }
    else if (call == 'manageEvent') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#wrapper').scope().getBusinessName();
    }
    else if (call == 'editManageEvent') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#happeningsEdit').scope().getBusinessName();
    }
    else if (call == 'createNewOffer') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#exclusiveOffer').scope().getBusinessName();
    }
    else if (call == 'openingHours') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#openingHoursCtl').scope().getBusinessName();
    }
    else if (call == 'bistroHours') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#bistroHoursCtl').scope().getBusinessName();
    }
    else if (call == 'happyHours') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#happyHoursCtl').scope().getBusinessName();
    }
    else if (call == 'happyHoursManage') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#happyHoursManageCtl').scope().getBusinessName();
    }
    else if (call == 'dailySpecial') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#createDailySpecialCtl').scope().getBusinessName();
    }
    else if (call == 'dailySpecialManage') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#dailySpecialManageCtl').scope().getBusinessName();
    }
    else if (call == 'requestOffer') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#requestOfferCtl').scope().getBusinessName();
    }
    else if (call == 'venueSettings') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#settingsForVenue').scope().getBusinessName();
    }
    else if (call == 'venueDetails') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#businessViewCtl').scope().getBusinessName();
    }
    else if (call == 'activeVenue') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#activeVenueCtl').scope().getBusinessName();
    }
    else if (call == 'manageEventsRequest') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#whatsOnManageRequestCtl').scope().getBusinessName();
    }
    else if (call == 'manageTriviaEvent') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#manageRequestTriviaCtl').scope().getBusinessName();
    }
    else if (call == 'managePokerEvent') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#manageRequestPokerCtl').scope().getBusinessName();
    }
    else if (call == 'drinksServiceOption') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#drinksServiceCtl').scope().getBusinessName();
    }
    else if (call == 'foodServiceOption') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#foodServiceCtl').scope().getBusinessName();
    }
    else if (call == 'promotionCreate') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#promotionCreateCtl').scope().getBusinessName();
    }
    else if (call == 'promotionManage') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#managePromotionCtl').scope().getBusinessName();
    }
    else if (call == 'events-analytics') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#alayticsAnalyticsCtl').scope().getBusinessName();
    }
    else if (call == 'analytics-sports') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#sportsAnalyticsCtl').scope().getBusinessName();
    }
    else if (call == 'analytics-special') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#specialAnalyticsCtl').scope().getBusinessName();
    }
    else if (call == 'transaction-settings') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#transactionSettingCtl').scope().getBusinessName();
    }
    else if (call == 'userPermission') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#userPermissionListCtl').scope().getBusinessName();
    }
    else if (call == 'createUserPermission') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#userPermissionCtl').scope().getBusinessName();
    }
    else if (call == 'venueAccounts') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#vanueAccountListCtl').scope().getBusinessName();
    }
    else if (call == 'create-bistroHours') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#createbistroHourCtl').scope().getBusinessName();
    }
    else if (call == 'drinksManger') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#drinksManger').scope().getBusinessName();
    }
    else if (call == 'createTakeaway') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#createTakeaway').scope().getBusinessName();
    }
    else if (call == 'manageTakeaway') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#manageTakeaway').scope().getBusinessName();
    }
    else if (call == 'book-analytics') {
      if ($("#businessSubmit").hasClass('businessReset')) {
        $("#businessSubmit").css({ 'background-color': 'green' }).html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp;&nbsp;Submit');
      }
      arg = angular.element('#bookAnalyticsCtl').scope().getBusinessName();
    }
    for (i = 0; i < arg.length; i++) {
      if (arg[i] && arg[i].businessName && arg[i].businessName.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        b = document.createElement("DIV");
        b.innerHTML = "<strong>" + arg[i].businessName.substr(0, val.length) + "</strong>";
        b.innerHTML += arg[i].businessName.substr(val.length);
        b.innerHTML += "<input type='hidden' value='" + arg[i].businessName + "' data-id='" + arg[i].id + "'>";
        b.addEventListener("click", function (e) {
          inp.value = this.getElementsByTagName("input")[0].value.trimRight();
          closeAllLists();
        });
        if ($(".autocomplete-items").find('div').length) {
          $(".autocomplete-items").css({ 'height': '200px', 'overflow': 'auto' });
        }
        a.appendChild(b);
      }
    }
  });
  inp.addEventListener("keydown", function (e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      currentFocus++;
      addActive(x);
    } else if (e.keyCode == 38) {
      currentFocus--;
      addActive(x);
    } else if (e.keyCode == 13) {
      e.preventDefault();
      if (currentFocus > -1) {
        if (x) x[currentFocus].click();
      }
    }
  });
  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    var x = document.getElementsByClassName("autocomplete-items");
    if ($(elmnt).find('input').data('id') != undefined && $(elmnt).find('input').data('id') != null) {
      $("#autocompleteBusiness").data('id', $(elmnt).find('input').data('id'));
    }

    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}

