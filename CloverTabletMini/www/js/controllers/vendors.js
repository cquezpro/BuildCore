angular.module('billsync.controllers')

.controller('VendorsCtrl', function($scope, $http, $baseUrl, $ionicActionSheet, $state, $ionicLoading, $window) {
	
	$scope.vendors;

	$scope.getVendors = function() {
		
		$ionicLoading.show({
	      template: 'Loading...'
	    });
		$http.get($baseUrl + '/api/v1/vendors')
	  	.success(function (vendors) {
	  		$scope.vendors = vendors;
	  		if($scope.vendors.length>0){
	  			$("#vendorList").show();
	  		}
	  	})
	  	.error(function (err, st) {
        if (st === 401)
          $window.location.reload();
      }).finally(function () {
	  		$ionicLoading.hide();
	  });
	}

  	$scope.getVendors();

});