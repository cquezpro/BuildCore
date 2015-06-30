angular.module( 'billsync', [
  'templates-app',
  'templates-common',
  'billsync.home',
  'billsync.about',
  'billsync.vendor',
  'billsync.login',
  'ui.state',
  'ui.route',
  'Devise'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/home' );
})

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | BillSync' ;
    }
  });
})

;

