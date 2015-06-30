angular.module( 'billsync.dispute', [
  'ui.router',
  'ui.bootstrap'

  // 'placeholders',
  // 'ui.bootstrap'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'dispute', {
    url: '/dispute',
    views: {
      "main": {
        controller: 'DisputeCtrl',
        templateUrl: 'dispute/dispute.tpl.html'
      }
    },
    data:{ pageTitle: 'dispute' }
  });
})

.controller('disputeCtrl', function disputeController ($scope, InvoicesRes, $state) {

});
