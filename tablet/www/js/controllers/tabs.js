angular.module('billsync.controllers')

.controller('TabsCtrl', function($scope, $baseUrl, $state, $ionicSideMenuDelegate, $window, $location, $timeout) {

  $scope.toggleLeftSideMenu = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.goPaymentPage = function() {
	$location.path("/app/tabs/payments");	
	$timeout(function () {
		$window.location.reload(true);	
	}, 500);	
  };

});