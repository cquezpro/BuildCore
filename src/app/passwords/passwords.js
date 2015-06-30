/**
 * BillSync module
 */
angular.module( 'billsync.passwords', [
  'ui.router',
  'ui.bootstrap',
  'inputField',
  'Devise'
])

/**
 * Define the route that this module relates to, and the page template and controller that is tied to that route
 */
// .config(function config( $stateProvider) {
//   $stateProvider.state( 'forgot-password', {
//     url: '/forgot-password?reset_password_token',
//     views: {
//       "main": {
//         controller: 'ForgotPasswordCtrl',
//         templateUrl: 'passwords/passwords.tpl.html'
//       }
//     },
//     data:{ pageTitle: 'Forgot Password' }
//   });
// })

/**
 * And of course we define a controller for our route.
 */
.controller( 'ForgotPasswordCtrl', function ( $scope, Auth, $state, $stateParams, $rootScope, $http, $timeout, $modalInstance, $modal) {
  if ($stateParams.reset_password_token) {
    $scope.reset_password_token = $stateParams.reset_password_token;
  }
  $scope.individual = {};

  if (Auth.isAuthenticated()) {
    $state.transitionTo('home');
  }

  $scope.submit = function() {
    $scope.submiting_request = true;
    if ($scope.reset_password_token) {
      submitPasswordChangeForm();
    } else {
      submitForgotPasswordForm();
    }
  };

  $scope.submiting_request = false;
  var successForgotPassword = function(response) {
    $scope.responseText =  "If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes.";
    $scope.submiting_request = false;
  };

  var errorForgotPassword = function(response) {
    $scope.responseText =  "Error while trying to submit.";
    $scope.submiting_request = false;
  };

  var submitForgotPasswordForm = function() {
    $scope.responseText = '';
    $http.post('/auth/password',{individual: $scope.individual}).success(successForgotPassword).error(errorForgotPassword);
  };

  var submitPasswordChangeForm = function() {
    $scope.submiting_request = true;
    $scope.errors = [];
    $scope.individual.reset_password_token = $scope.reset_password_token;
    $http.put('/auth/password', {individual: $scope.individual}).success(successPasswordChange).error(errorPasswordChange);
  };

  var successPasswordChange = function(response) {
    $state.transitionTo('home');
    $scope.submiting_request = false;
  };

  var errorPasswordChange = function(response) {
    $scope.errors = response;
    $scope.submiting_request = false;
    console.log(typeof $scope.errors === 'string');
    if (typeof $scope.errors === 'string') {
      $state.transitionTo('home');
    }
  };

  $scope.closeModal = function () {
    $modalInstance.close(false);
  };


});
