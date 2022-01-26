angular
  .module('app')
  .controller('barm8MenuCtl', ['$scope', 'Business', '$http', '$state', '$rootScope', '$stateParams', '$location',
    function ($scope, Business, $http, $state, $rootScope, $stateParams, $location) {

      var userSession = JSON.parse(localStorage.getItem("userSession"));

      if (userSession && userSession.isAdmin) {
        $scope.isBusinessSection = userSession.isAdmin;
      }

      let callMobile = () => {
        if ($(window).width() <= 800) {
          if ($('body').hasClass('fixed-sidebar')) { $('body').removeClass('fixed-sidebar').removeClass('mini-navbar') }
        }
      }

      // $(".main-menu ul a,.center ul li a").each(function () {
      //   if ($(this).attr('data-link') == $location.url() && $(this).attr('data-link') != 'javascript:;' && $(this).attr('data-link') !== undefined) {
      //     $(this).parents().parents().addClass('in');
      //     $(this).addClass('menu-focus');
      //   }
      //   callMobile();
      // });

      $scope.menuClick = ($event) => {
        $('.main-menu').find('ul li').removeClass('active');
        $($event.target).parent().toggleClass('active');
        //   $($event.target).parent().find('ul').first().toggleClass('in');
        // $('.nav-second-level').each(function () {
        //   $(this).removeClass('in');
        // })
        // if (arg == 'first') {
        //   $($event.target).parent().toggleClass('active');
        //   $($event.target).parent().find('ul').first().toggleClass('in');
        //   $(".admin-menu-s").removeClass('menu-focus');
        // } else if (arg == 'second') {
        //   $($event.target).parent().toggleClass('active');
        //   $($event.target).parent().find('ul').first().toggleClass('in');
        //   $(".admin-menu-s").removeClass('menu-focus');
        // }
        // else if (arg == 'third') {
        //   $($event.target).parent().toggleClass('active');
        //   $($event.target).parent().find('ul').first().toggleClass('in');
        //   $(".admin-menu-s").removeClass('menu-focus');
        // }
        callMobile();
      }

      if ($location.url() == '/dashboard-home' || $location.url() == '/admin') {
        $(".admin-menu-s").addClass('menu-focus');
        callMobile();
      }
      else {
        $(".admin-menu-s").removeClass('menu-focus');
        callMobile();
      }

      if ($location.url() == '/reservation') {
        $(".reservation-menu-s").addClass('menu-focus');
        callMobile();
      }
      else {
        $(".reservation-menu-s").removeClass('menu-focus');
        callMobile();
      }

    }]);