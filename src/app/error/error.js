angular.module( 'billsync.error', [
  'ui.router',
  'ui.bootstrap',
  'billsync.entities'
])

.config(function config($stateProvider) {
  $stateProvider.state(
    'error',
    {
      url: '/error',
      views: {
        "main": {
          controller: 'ErrorCtrl',
          templateUrl: 'error/error.tpl.html'
        },
        "header": {
          templateUrl: 'common/header.tpl.html'
        },
        "sidebar": {
          templateUrl: 'common/sidebar.tpl.html'
        }
      },
      data: { pageTitle: 'Error' }
    }
  );
})

.controller('ErrorCtrl', function ErrorController ($scope, $state) {
  if (!$scope.currentIndividual || $scope.currentIndividual === null) {
    $state.transitionTo('dashboard');
  }
})

;
