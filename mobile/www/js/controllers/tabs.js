angular.module('billsync.controllers')

.controller('TabsCtrl', function($scope, $baseUrl, $state, $ionicSideMenuDelegate) {

  $scope.toggleLeftSideMenu = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

});