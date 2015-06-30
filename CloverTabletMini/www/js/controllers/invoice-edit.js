angular.module('billsync.controllers')

.controller('InvoiceEditCtrl', function($scope, $baseUrl, $stateParams, $http, $ionicActionSheet, $state, $cordovaToast, pdfDelegate, $ionicLoading) {
	var invoiceUrl = $baseUrl + '/api/v1/invoices/' + $stateParams.id;


if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (function() {
    return window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback, element) {
        window.setTimeout(callback, 1000 / 60);
      };
  })();
}

  $scope.form = {};

	function getInvoice () {
    $ionicLoading.show({
      template: 'Loading...'
    });
		$http.get(invoiceUrl)
	  	.success(function (inv) {
	  		$scope.invoice = inv;
        try{
         pdfDelegate
            .$getByHandle('my-pdf-container')
              .load($scope.invoice.pdf_url);
              $("#pdfContainer").show();
        }catch(err){
          $("#pdfContainer").hide();
        }
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
    $ionicLoading.show({
      template: 'Saving...'
    });
    $scope.invoice.line_items_attributes = $scope.invoice.line_items;
    $scope.invoice.from_user = true;
    $scope.invoice.vendor_attributes = $scope.invoice.vendor;

    $http.put(invoiceUrl, $scope.invoice)
    	.success(function (data) {
	      if ($state.params.from === 'home')
          $state.transitionTo('app.tabs.home');
        if ($state.params.from === 'invoice')
          $state.transitionTo('app.tabs.invoice', { id: $scope.invoice.id });
        $ionicLoading.hide();

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


  $scope.rotatePdf = function(){
    pdfDelegate.$getByHandle('my-pdf-container').rotate(90);
  };

  $scope.zoomIn = function(){
    pdfDelegate.$getByHandle('my-pdf-container').zoomIn();
  };

  $scope.zoomOut = function(){
    pdfDelegate.$getByHandle('my-pdf-container').zoomOut();
  };

  $scope.pageInfo=""; 
  $scope.next = function(){
    var pageCount = pdfDelegate.$getByHandle('my-pdf-container').getPageCount();
    if(pageCount>pdfDelegate.$getByHandle('my-pdf-container').getCurrentPage()){
      $scope.pageInfo=pdfDelegate.$getByHandle('my-pdf-container').getCurrentPage()+1 + " of " +  pageCount;
      pdfDelegate.$getByHandle('my-pdf-container').goToPage(parseInt(pdfDelegate.$getByHandle('my-pdf-container').getCurrentPage()+1));
    }
  };

  $scope.prev = function(){
    var pageCount = pdfDelegate.$getByHandle('my-pdf-container').getPageCount();
    if(1<pdfDelegate.$getByHandle('my-pdf-container').getCurrentPage()){
      $scope.pageInfo=pdfDelegate.$getByHandle('my-pdf-container').getCurrentPage()-1 + " of " +  pageCount;
      pdfDelegate.$getByHandle('my-pdf-container').goToPage(pdfDelegate.$getByHandle('my-pdf-container').getCurrentPage()-1);
    }
  };

});