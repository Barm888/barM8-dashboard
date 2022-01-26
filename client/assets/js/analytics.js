

$(() => {
  var today = new Date();
  var weekStart = parseInt(moment(today.getFullYear() + "-" + (((today.getMonth()) < 10 ? '0' : '') + (today.getMonth() + 1)) + "-" + ((today.getDate() < 10 ? '0' : '') + today.getDate())).weekday(-1).format('D'));
  var weekEnd = parseInt(moment(today.getFullYear() + "-" + (((today.getMonth()) < 10 ? '0' : '') + (today.getMonth() + 1)) + "-" + ((today.getDate() < 10 ? '0' : '') + today.getDate())).weekday(5).format('D'));
  var startandend = `${today.getFullYear()}-${today.getMonth()}-${weekStart}to${today.getFullYear()}-${today.getMonth()}-${weekEnd}`;
  $("#weekstartandend").data('date', startandend);

});

var monthsArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

$(document).on("change", "#monthCal", () => {
  var monthandyear = $("#monthCal").val().split("-");
  //let currentMonth = monthandyear
  currentMonth = ((parseInt(monthandyear[0])) - 1);
  currentYear = parseInt(monthandyear[1]);
  $("#monthPre").data('month', currentMonth);
  $("#monthPre").data('year', currentYear);
  $("#monthNext").data('month', currentMonth);
  $("#monthNext").data('year', currentYear);
  $("#monthtxt").text(` ${monthsArray[currentMonth]}    ${currentYear}`);
});
$(document).on("change", "#yearCal", () => {
  $("#yearPre").data('year', $("#yearCal").val());
  $("#currentYear").text($("#yearCal").val());
  $("#yearNext").data('year', $("#yearCal").val());
});

var weeks = ["First", "Second", "Third", "Fourth", "Fifth"];
getCurrentWeek = () => [0, 1, 2, 3, 4][0 | moment(new Date()).date() / 7];

$(() => {
  let currentMonth = moment(new Date()).format("MMMM"),
    currentYear = moment(new Date()).format("YYYY"),
    weekFirstday = moment(new Date()).weekday(0).format('YYYY/MM/DD'),
    weekLastDay = moment(new Date()).weekday(6).format('YYYY/MM/DD');

  $("#WeekTt").html(`${weeks[getCurrentWeek()]} Week, ${currentMonth} ${weekFirstday.toString().split('/')[2]}th - ${weekLastDay.toString().split('/')[2]}th ${currentYear}`);

  angular.element(document.getElementById('analyticsId')).scope().weekCharts(weekFirstday, weekLastDay);
});

$(() => {
  let currentMonth = moment(new Date()).format("MMMM"),
    currentYear = moment(new Date()).format("YYYY"),
    monthstart = new moment().startOf('month').format("D"),
    monthend = new moment().endOf("month").format("D"),
    currentMonthIndex = moment(new Date()).format("M");
  angular.element(document.getElementById('analyticsId')).scope().MonthlyCharts(currentMonth, currentYear, monthstart, monthend, currentMonthIndex);
});

$(() => {
  let currentYear = moment(new Date()).format("YYYY");
  angular.element(document.getElementById('analyticsId')).scope().YearlyCharts(currentYear);
})

$(function () {

  //Month
  var monthget = new Date();
  $("#monthPre").data('month', monthget.getMonth());
  $("#monthPre").data('year', monthget.getFullYear());
  $("#monthNext").data('month', monthget.getMonth());
  $("#monthNext").data('year', monthget.getFullYear());
  $("#monthtxt").text(`${monthsArray[monthget.getMonth()]} ${monthget.getFullYear()}`);


  //Year
  $("#yearPre").data('year', monthget.getFullYear());
  $("#yearNext").data('year', monthget.getFullYear());
  $("#currentYear").text(monthget.getFullYear());
});


//month
$(document).on('click', '#monthPre', () => {
  var monthget = new Date();
  var currentMonth = 0, currentYear = 0;
  if (parseInt($("#monthPre").data('month')) != 0) {
    currentMonth = (parseInt($("#monthPre").data('month')) - 1);
    currentYear = $('#monthPre').data('year');
    $("#monthtxt").text(` ${monthsArray[currentMonth]}    ${currentYear}`);
  } else {
    currentMonth = 11;
    currentYear = (parseInt($("#monthPre").data('year')) - 1);
    $("#monthtxt").text(` ${monthsArray[currentMonth]}    ${currentYear}`);
  }

  $("#monthPre").data('month', currentMonth);
  $("#monthPre").data('year', currentYear);
  $("#monthNext").data('month', currentMonth);
  $("#monthNext").data('year', currentYear);
})
$(document).on('click', '#monthNext', () => {
  var monthget = new Date();
  var currentMonth = 0, currentYear = 0;
  if (parseInt($("#monthNext").data('month')) != 11) {
    currentMonth = (parseInt($("#monthNext").data('month')) + 1);
    currentYear = $('#monthNext').data('year');
    $("#monthtxt").text(` ${monthsArray[currentMonth]}    ${currentYear}`);
  } else {
    currentMonth = 0;
    currentYear = (parseInt($("#monthNext").data('year')) + 1);
    $("#monthtxt").text(` ${monthsArray[currentMonth]}    ${currentYear}`);
  }
  $("#monthNext").data('month', currentMonth);
  $("#monthNext").data('year', currentYear);
  $("#monthPre").data('month', currentMonth);
  $("#monthPre").data('year', currentYear);
})
//
$(document).on('click', '#yearPre', () => {
  var currentYear = 0;
  currentYear = (parseInt($("#yearPre").data('year')) - 1);
  $("#yearPre").data('year', currentYear);
  $("#currentYear").text(currentYear);
  $("#yearNext").data('year', currentYear);
});

$(document).on('click', '#yearNext', () => {
  var currentYear = 0;
  currentYear = (parseInt($("#yearNext").data('year')) + 1);
  $("#yearNext").data('year', currentYear);
  $("#yearPre").data('year', currentYear);
  $("#currentYear").text(currentYear);
});
$("#dailyBarCalendar").on('change', function () {
  var newDate = new Date();
  var preDate = $(this).val().split('-')[2];
  $('#dailyPre').data('date', '');
  $('#dailyNext').data('date', '');
  $('#dailyPre').data('date', preDate);
  $('#dailyNext').data('date', preDate);
  newDate.setDate(preDate);
  $("#dailySpan").text("" + days[newDate.getDay()] + ", " + months[newDate.getMonth()] + " " + newDate.getDate() + "th " + newDate.getFullYear() + "");
});

var Today = new Date();
function taggleFun(e) {
  $.each($("#analyticsTab li"), function () {
    if (!$(this).hasClass('card')) {
      $(this).addClass('card');
    }
  });
  $(e).parent('li').removeClass('card');
}
$(function () {
  $(".date").click(function () {
    var popup = $(this).offset();
    var popupTop = popup.top - 40;
    $('.ui-datepicker').css({
      'top': popupTop
    });
    $("#weeklyCalendar").datepicker({
      format: "yyyy-mm-dd",
      autoclose: true
    }).on('show', function (e) {

      var tr = $('body').find('.datepicker-days table tbody tr');

      tr.mouseover(function () {
        $(this).addClass('week');
      });

      tr.mouseout(function () {
        $(this).removeClass('week');
      });

      calculate_week_range(e);

    }).on('hide', function (e) {
      calculate_week_range(e);
    });
    var calculate_week_range = function (e) {

      var input = e.currentTarget;

      // remove all active class
      $('body').find('.datepicker-days table tbody tr').removeClass('week-active');

      // add active class
      var tr = $('body').find('.datepicker-days table tbody tr td.active.day').parent();
      tr.addClass('week-active');

      // find start and end date of the week

      var date = e.date;
      var start_date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
      var end_date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 6);

      // make a friendly string

      var friendly_string = start_date.getFullYear() + '-' + (start_date.getMonth()) + '-' + start_date.getDate() + 'to'
        + end_date.getFullYear() + '-' + (end_date.getMonth()) + '-' + end_date.getDate();
      weekstartandendChange(friendly_string);

      $("#weekstartandend").data('date', friendly_string);

    }
    $("#monthlyCalendar").datepicker({
      format: "m-yyyy",
      viewMode: "months",
      minViewMode: "months",
      autoclose: true
    });
    $("#yearlyCalendar").datepicker({
      format: " yyyy",
      viewMode: "years",
      minViewMode: "years",
      autoclose: true
    });
   
    $('#dailyCalendar').datepicker({ format: 'yyyy-mm-dd', autoclose: true });
  });
});
$(function () {
  $('#dailyPre').data('date', Today.getDate());
  $('#dailyNext').data('date', Today.getDate());
  let dateReadTxt = 'th';
  if(Today.getDate()== 1 || Today.getDate() == 21 || Today.getDate() == 31) { dateReadTxt = "st"  }
  else if(Today.getDate() == 2 || Today.getDate() == 22) { dateReadTxt = "nd" }
  else if(Today.getDate() == 3 || Today.getDate() == 23) { dateReadTxt = "rd" }
  $("#dailySpan").text("" + days[Today.getDay()] + ", " + months[Today.getMonth()] + " " + Today.getDate() + ""+ dateReadTxt +" " + Today.getFullYear() + "");
});
$("#dailyPre").on('click', function () {
  var newDate = new Date();
  var preDate = ($('#dailyPre').data('date') - 1);
  $('#dailyPre').data('date', '');
  $('#dailyNext').data('date', '');
  $('#dailyPre').data('date', preDate);
  $('#dailyNext').data('date', preDate);
  newDate.setDate(preDate);
  $("#dailySpan").text('');
  let dateReadTxt = 'th';
  if(newDate.getDate()== 1 || newDate.getDate() == 21 || newDate.getDate() == 31) { dateReadTxt = "st"  }
  else if(newDate.getDate() == 2 || newDate.getDate() == 22) { dateReadTxt = "nd" }
  else if(newDate.getDate() == 3 || newDate.getDate() == 23) { dateReadTxt = "rd" }
  $("#dailySpan").text("" + days[newDate.getDay()] + ", " + months[newDate.getMonth()] + " " + newDate.getDate() + ""+ dateReadTxt +" " + newDate.getFullYear() + "");
  let month = (parseInt(newDate.getMonth()) + 1);
  var d = newDate.getFullYear() + "-" + (("0" + month).slice(-2)) + "-" + (("0" + newDate.getDate()).slice(-2));
});
$("#dailyNext").on('click', function () {
  var newDate = new Date();
  var nextDate = (parseInt($('#dailyNext').data('date')) + 1);
  newDate.setDate(nextDate);
  $('#dailyPre').data('date', '');
  $('#dailyNext').data('date', '');
  $('#dailyPre').data('date', nextDate);
  $('#dailyNext').data('date', nextDate);
  $("#dailySpan").text('');
  let dateReadTxt = 'th';
  if(newDate.getDate()== 1 || newDate.getDate() == 21 || newDate.getDate() == 31) { dateReadTxt = "st"  }
  else if(newDate.getDate() == 2 || newDate.getDate() == 22) { dateReadTxt = "nd" }
  else if(newDate.getDate() == 3 || newDate.getDate() == 23) { dateReadTxt = "rd" }
  $("#dailySpan").text("" + days[newDate.getDay()] + ", " + months[newDate.getMonth()] + " " + newDate.getDate() + ""+ dateReadTxt +" " + newDate.getFullYear() + "");
  let month = (parseInt(newDate.getMonth()) + 1);
  var d = newDate.getFullYear() + "-" + (("0" + month).slice(-2)) + "-" + (("0" + newDate.getDate()).slice(-2));
});
