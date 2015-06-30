angular.module('billsync.controllers')

.controller('InvoiceEditCtrl', function($scope, $baseUrl, $stateParams, $http, $ionicActionSheet, $state, $ionicLoading, $window) {
	var invoiceUrl = $baseUrl + '/api/v1/invoices/' + $stateParams.id;

  $scope.form = {};

	function getInvoice () {
    $ionicLoading.show({
      template: 'Loading...'
    });
		$http.get(invoiceUrl)
	  	.success(function (inv) {
	  		$scope.invoice = inv;
	  	})
      .error(function (err, st) {
        if (st === 401)
          $window.location.reload();
      })
      .finally(function () {
        $ionicLoading.hide();
      });
	}

  $scope.save = function () {
    $scope.invoice.line_items_attributes = $scope.invoice.line_items;
    $scope.invoice.from_user = true;
    $scope.invoice.vendor_attributes = $scope.invoice.vendor;

    $http.put(invoiceUrl, $scope.invoice)
    	.success(function (data) {
	      if ($state.params.from === 'home')
          $state.transitionTo('app.tabs.home');
        if ($state.params.from === 'invoice')
          $state.transitionTo('app.tabs.invoice', { id: $scope.invoice.id });
	    });
  };

  $scope.viewPdf = function (pdfUrl) {
    var url = window.location.protocol + '//' + window.location.host,
      second = (pdfUrl.search('/system') >= 0) ? url : '';

    pdfUrl = second + pdfUrl.match('.+.pdf')[0];

    if (ionic.Platform.isAndroid()) {
      pdfUrl = 'https://docs.google.com/viewer?url=' + encodeURIComponent(pdfUrl);
    }

    var ref = window.open(pdfUrl, '_blank', 'location=no,enableViewportScale=yes');
  };

  getInvoice();
});