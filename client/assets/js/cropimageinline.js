$(function () {
  var options = {
    imageBox: '.imageBox',
    thumbBox: '.thumbBox',
    spinner: '.spinner',
    imgSrc: 'avatar.png'
  }

  var cropper;
  $(document).on('change', '#file', function (e) {

    $(".imageBox").css('background-image', '');
    if (document.getElementById('businessManager'))
      angular.element(document.getElementById('businessManager')).scope().getFilenameandType(e.target.files[0].name, $(this));
    else if (document.getElementById('createEvent'))
      angular.element(document.getElementById('createEvent')).scope().getFilenameandType(e.target.files[0].name, $(this));
    else if (document.getElementById('happenings'))
      angular.element(document.getElementById('happenings')).scope().getFilenameandType(e.target.files[0].name, $(this));
    else if (document.getElementById('CreateSports'))
      angular.element(document.getElementById('CreateSports')).scope().getFilenameandType(e.target.files[0].name, $(this));
    else if (document.getElementById('exclusiveOffer'))
      angular.element(document.getElementById('exclusiveOffer')).scope().getFilenameandType(e.target.files[0].name, $(this));
    else if (document.getElementById('happyHoursCtl'))
      angular.element(document.getElementById('happyHoursCtl')).scope().getFilenameandType(e.target.files[0].name, $(this));
    else if (document.getElementById('createDailySpecialCtl'))
      angular.element(document.getElementById('createDailySpecialCtl')).scope().getFilenameandType(e.target.files[0].name, $(this));
      else if (document.getElementById('whatsOnEventsEditUpdate'))
      angular.element(document.getElementById('whatsOnEventsEditUpdate')).scope().getFilenameandType(e.target.files[0].name, $(this));
      else if (document.getElementById('happyHoursEditCtl'))
      angular.element(document.getElementById('happyHoursEditCtl')).scope().getFilenameandType(e.target.files[0].name, $(this));
      else if (document.getElementById('editDailySpecialCtl'))
      angular.element(document.getElementById('editDailySpecialCtl')).scope().getFilenameandType(e.target.files[0].name, $(this));
      else if (document.getElementById('promotionCreateCtl'))
      angular.element(document.getElementById('promotionCreateCtl')).scope().getFilenameandType(e.target.files[0].name, $(this));
      else if (document.getElementById('promotionEditCtl'))
      angular.element(document.getElementById('promotionEditCtl')).scope().getFilenameandType(e.target.files[0].name, $(this));
    var reader = new FileReader();
    reader.onload = function (e) {
      options.imgSrc = e.target.result;
      cropper = new cropbox(options);
    }
    if (e && e.target && e.target.files.length) {
      reader.readAsDataURL(e.target.files[0]);
      // e.target.files = [];
    }
    //document.getElementById("file").value = null;
  });
  document.querySelector('#file').addEventListener('click', function (e) {
    if (e && e.target && e.target.files && e.target.files.length && e.target.files[0].name) {
      if (document.getElementById('businessManager'))
        angular.element(document.getElementById('businessManager')).scope().getFilenameandType(e.target.files[0].name, $(this));
      else if (document.getElementById('createEvent'))
        angular.element(document.getElementById('createEvent')).scope().getFilenameandType(e.target.files[0].name, $(this));
      else if (document.getElementById('happenings'))
        angular.element(document.getElementById('happenings')).scope().getFilenameandType(e.target.files[0].name, $(this));
      else if (document.getElementById('CreateSports'))
        angular.element(document.getElementById('CreateSports')).scope().getFilenameandType(e.target.files[0].name, $(this));
      else if (document.getElementById('exclusiveOffer'))
        angular.element(document.getElementById('exclusiveOffer')).scope().getFilenameandType(e.target.files[0].name, $(this));
      else if (document.getElementById('happyHoursCtl'))
        angular.element(document.getElementById('happyHoursCtl')).scope().getFilenameandType(e.target.files[0].name, $(this));
      else if (document.getElementById('createDailySpecialCtl'))
        angular.element(document.getElementById('createDailySpecialCtl')).scope().getFilenameandType(e.target.files[0].name, $(this));
        else if (document.getElementById('whatsOnEventsEditUpdate'))
        angular.element(document.getElementById('whatsOnEventsEditUpdate')).scope().getFilenameandType(e.target.files[0].name, $(this));
        else if (document.getElementById('happyHoursEditCtl'))
        angular.element(document.getElementById('happyHoursEditCtl')).scope().getFilenameandType(e.target.files[0].name, $(this));
        else if (document.getElementById('editDailySpecialCtl'))
        angular.element(document.getElementById('editDailySpecialCtl')).scope().getFilenameandType(e.target.files[0].name, $(this));
        else if (document.getElementById('promotionCreateCtl'))
        angular.element(document.getElementById('promotionCreateCtl')).scope().getFilenameandType(e.target.files[0].name, $(this));
        else if (document.getElementById('promotionEditCtl'))
        angular.element(document.getElementById('promotionEditCtl')).scope().getFilenameandType(e.target.files[0].name, $(this));
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      options.imgSrc = e.target.result;
      cropper = new cropbox(options);
    }
    if (e && e.target && e.target.files && e.target.files.length) {
      reader.readAsDataURL(e.target.files[0]);
      // e.target.files = [];
    }
    // document.getElementById("file").value = null;
  });
  document.querySelector('#btnCrop').addEventListener('click', function () {
    if (cropper.getDataURL()) {
      var img = cropper.getDataURL();
      if (document.getElementById('businessManager'))
        angular.element(document.getElementById('businessManager')).scope().imageconverttofile(img);
      if (document.getElementById('createEvent'))
        angular.element(document.getElementById('createEvent')).scope().imageconverttofile(img);
      if (document.getElementById('happenings'))
        angular.element(document.getElementById('happenings')).scope().imageconverttofile(img);
      if (document.getElementById('CreateSports'))
        angular.element(document.getElementById('CreateSports')).scope().imageconverttofile(img);
      if (document.getElementById('exclusiveOffer'))
        angular.element(document.getElementById('exclusiveOffer')).scope().imageconverttofile(img);
      if (document.getElementById('happyHoursCtl'))
        angular.element(document.getElementById('happyHoursCtl')).scope().imageconverttofile(img);
      if (document.getElementById('createDailySpecialCtl'))
        angular.element(document.getElementById('createDailySpecialCtl')).scope().imageconverttofile(img);
        if (document.getElementById('whatsOnEventsEditUpdate'))
        angular.element(document.getElementById('whatsOnEventsEditUpdate')).scope().imageconverttofile(img);
        if (document.getElementById('happyHoursEditCtl'))
        angular.element(document.getElementById('happyHoursEditCtl')).scope().imageconverttofile(img);
        if (document.getElementById('editDailySpecialCtl'))
        angular.element(document.getElementById('editDailySpecialCtl')).scope().imageconverttofile(img);
        if (document.getElementById('promotionCreateCtl'))
        angular.element(document.getElementById('promotionCreateCtl')).scope().imageconverttofile(img);
        if (document.getElementById('promotionEditCtl'))
        angular.element(document.getElementById('promotionEditCtl')).scope().imageconverttofile(img);
      $(".imageBox").css('background-image', '');
    }
  });
  document.querySelector('#btnZoomIn').addEventListener('click', function () {
    cropper.zoomIn();
  });
  document.querySelector('#btnZoomOut').addEventListener('click', function () {
    cropper.zoomOut();
  });
});
