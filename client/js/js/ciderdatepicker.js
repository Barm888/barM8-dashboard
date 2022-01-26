$(function () {
 
  function _24to12() {
    var date_format = '12';
    var d = new Date();
    var hour = d.getHours();  /* Returns the hour (from 0-23) */
    var minutes = d.getMinutes();  /* Returns the minutes (from 0-59) */
    var result = hour;
    var ext = '';

    if (date_format == '12') {
      if (hour > 12) {
        ext = 'PM';
        hour = (hour - 12);

        if (hour < 10) {
          // result = "0" + hour;
          result = hour;
        } else if (hour == 12) {
          hour = "00";
          ext = 'AM';
        }
      }
      else if (hour < 12) {
        //result = ((hour < 10) ? "0" + hour : hour);
        result = ((hour < 10) ? hour : hour);
        ext = 'AM';
      } else if (hour == 12) {
        ext = 'PM';
      }
    }

    if (minutes < 10) {
      minutes = "0" + minutes;
    }

    result = result + ":" + minutes;
    return result;
  }

  var _12hourformat = _24to12();
  $("select option").each(function () {
    if ($(this).html() == "") {
      $(this).remove();
    }
    if ($(this).html().includes(":")) {
      if ($(this).html().split(':')[0] == _12hourformat.split(':')[0]) {
        if ($(this).html().split(':')[1] <= _12hourformat.split(':')[1]) {
          $(this).attr('selected', true);
        }
      }
    }
  });
});
