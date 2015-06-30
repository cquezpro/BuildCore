angular.module('billsync.controllers')

.controller('VendorsCtrl', function($scope, $http, $baseUrl, $ionicActionSheet, $state, $ionicLoading, $window) {
	function getVendors () {
		$ionicLoading.show({
	      template: 'Loading...'
	    });

		$http.get($baseUrl + '/api/v1/vendors')
	  	.success(function (vendors) {
	  		$scope.vendors = vendors;
	  	})
	  	.error(function (err, st) {
        if (st === 401)
          	$window.location.reload();
      	})
	  	.finally(function () {
	  		$ionicLoading.hide();
	  	});
	}

  	getVendors();
});