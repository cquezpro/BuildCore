/**
 * BillSync module
 */
angular.module( 'billsync.login', [
  'ui.router',
  'ui.bootstrap',
  'inputField',
  'billsync.auth-provider-config'
])

/**
 * And of course we define a controller for our route.
 */
.controller( 'LoginCtrl', function ( $scope, Auth, $state, $rootScope, $modalInstance, $modal) {
  $scope.individual = {};
  $scope.errors = [];
  $scope.showPassword = false;
  $scope.isFormSubmitted = false; //$dirty is not being referenced so using this flag

  if (Auth.isAuthenticated()) {
    $state.transitionTo('dashboard');
  }

  $scope.submit = function() {
    Auth.login($scope.individual).then(authenticatedCallback, errorCallback);
  };

  $scope.$on('devise:unauthorized', function(event, xhr, deferred) {
    $scope.errors = xhr.data.error;
  });

  var authenticatedCallback = function(response) {
    $modalInstance.close(response);
  };

  var errorCallback = function(response) {
    $scope.errors = response.data.error;
    $scope.isFormSubmitted = true;
  };

  $scope.showSignUpModal = function () {
    $scope.modalInstance = $modal.open({
      templateUrl:  'registration/registration.tpl.html',
      controller:   'RegistrationCtrl',
      size:         'md',
      keyboard: false,
      backdrop: 'static'
    });

    $scope.modalInstance.result.then(function (individual) {
      window.location.reload();
    });
  };

  $scope.showForgotPasswordModal = function () {
    $scope.modalInstance = $modal.open({
      templateUrl:  'passwords/forgot_password.tpl.html',
      controller:   'ForgotPasswordCtrl',
      size:         'md',
      keyboard: false,
      backdrop: 'static'
    });

    $scope.modalInstance.result.then(function (reload) {
      if (reload) {
        window.location.reload();
      }
    });
  };

})
.directive('loginWithQuickbooks', function($window) {
  return {
    restrict: 'E',
    template: '<div ng-if="intuitScriptLoaded()"><ipp:login href="' + 'http://' + $window.location.host + '/users/auth/intuit></ipp:login></div>',
    link: function($scope) {
      $scope.intuitScriptLoaded = function(){
        return $window.intuit && $window.intuit.ipp;
      };

      if ($scope.intuitScriptLoaded()) {
        // Hack to get the button to reload when this directive is shown
        // for the second time, since the QB connect button assumes that
        // the button is not rendered dynamically
        $window.intuit.ipp.anywhere.init();
      } else {
        var script = $window.document.createElement("script");
        script.type = "text/javascript";
        script.src = "//js.appcenter.intuit.com/Content/IA/intuit.ipp.anywhere.js";
        $window.document.body.appendChild(script);
      }
    }
  };
})
;
