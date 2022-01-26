$(function () {
  var options =
    {
      imageBox: '.imageBox',
      thumbBox: '.thumbBox',
      spinner: '.spinner',
      imgSrc: 'avatar.png'
    }
  var cropper;
  document.querySelector('#file').addEventListener('change', function (e) {
    angular.element(document.getElementById('businessReg')).scope().getFilenameandType(e.target.files[0].name, $(this));
    var reader = new FileReader();
    reader.onload = function (e) {
      options.imgSrc = e.target.result;
      cropper = new cropbox(options);
    }
    reader.readAsDataURL(this.files[0]);
    this.files = [];
  })
  document.querySelector('#btnCrop').addEventListener('click', function () {
    var img = cropper.getDataURL();
    angular.element(document.getElementById('businessReg')).scope().imageconverttofile(img);
  })
  document.querySelector('#btnZoomIn').addEventListener('click', function () {
    cropper.zoomIn();
  })
  document.querySelector('#btnZoomOut').addEventListener('click', function () {
    cropper.zoomOut();
  })
});
