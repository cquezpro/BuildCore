/**
 * BillSync module
 */
angular.module( 'billsync.auth-provider-config', [
  'ui.router',
  'Devise'
])
/**
 * Define the route that this module relates to, and the page template and controller that is tied to that route
 */
.config(function config( $stateProvider, AuthProvider ) {
  $stateProvider.state( 'logout', {
    url: '/logout',
    views: {
      "main": {
        controller: 'LoginCtrl',
        templateUrl: 'login/login.tpl.html'
      }
    },
    data:{ pageTitle: 'Sign In' }
  });


  AuthProvider.loginPath('/auth/sign_in.json');
  AuthProvider.logoutPath('/auth/sign_out.json');
  AuthProvider.registerPath('/auth/sign_up.json');
  AuthProvider.logoutMethod('GET');
  AuthProvider.resourceName('individual');
});
