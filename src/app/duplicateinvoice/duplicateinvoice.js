angular.module( 'billsync.duplicate_invoice', [
  'ui.router',
  'ui.bootstrap',
  'billsync.entities'
])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config( $stateProvider ) {
  $stateProvider.state( 'duplicateInvoice', {
    url: '/duplicate-invoice/:originalId/:duplicateId',
    views: {
      "main": {
        controller: 'DuplicateInvoiceCtrl',
        templateUrl: 'duplicateinvoice/duplicateinvoice.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{ pageTitle: 'Duplicate Invoice' }
  })
  ;
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'DuplicateInvoiceCtrl', function DuplicateInvoiceController($scope, InvoicesManager, $state, $stateParams) {

  $scope.loading = true;
  $scope.original_loaded = false;
  $scope.duplicate_loaded = false;
  $scope.show_original_pdf = false;
  $scope.show_duplicate_pdf = false;

  var loadInvoices = function(){
    InvoicesManager.getInvoice($stateParams.originalId).then(function(invoice) {
      $scope.original_invoice = invoice;

      if($scope.original_invoice.pdf_file_name){
        $scope.original_pdf_url = $scope.original_invoice.pdf_url;
        $scope.show_original_pdf = true;
      }

      $scope.original_loaded = true;
      setLoadingStatus();
    });

    InvoicesManager.getInvoice($stateParams.duplicateId).then(function(invoice) {
      $scope.duplicate_invoice = invoice;

      if($scope.original_invoice.pdf_file_name){
        $scope.duplicate_pdf_url = $scope.duplicate_invoice.pdf_url;
        $scope.show_duplicate_pdf = true;
      }

      $scope.duplicate_loaded = true;
      setLoadingStatus();
    });
  };

  loadInvoices();

  var setLoadingStatus = function(){
    if($scope.original_loaded && $scope.duplicate_loaded){
      $scope.loading = false;
    }
  };

  $scope.keepOriginal = function(){
    $scope.loading = true;
    $scope.duplicate_invoice.status = 11;
    InvoicesManager.updateInvoice($scope.duplicate_invoice).then(respondToSuccess, respondToFailure);
  };

  $scope.keepDuplicate = function(){
    $scope.loading = true;
    $scope.original_invoice.status = 11;
    InvoicesManager.updateInvoice($scope.original_invoice).then(respondToSuccess, respondToFailure);
  };

  $scope.keepBoth = function(){
    $state.transitionTo('home');
  };

  $scope.deleteBoth = function(){
    $scope.loading = true;
    $scope.original_invoice.status = 11;
    $scope.duplicate_invoice.status = 11;
    updateInvoices();
  };

  var updateInvoices = function(){
    InvoicesManager.updateInvoice($scope.original_invoice).then(function(){
      InvoicesManager.updateInvoice($scope.duplicate_invoice).then(respondToSuccess, respondToFailure);
    }, respondToFailure);

  };

  var respondToSuccess = function(reponse){
    $state.transitionTo('home');
  };

  var respondToFailure = function(){
    console.log('failure');
  };

})
.directive('pdfOriginal', [function() {
  return {
    restrict: 'E',
    template: '<div id="scrollArea"><ng-pdf template-url="duplicateinvoice/partials/original-pdf-partial.tpl.html" canvasid="original-canvas" scale="1"></ng-pdf></div>',
    scope: {
      pdfUrl: '=',
      openInModal: '=',
      invoice: '='
    }
  };
}])
.directive('pdfDuplicate', [function() {
  return {
    restrict: 'E',
    template: '<div id="scrollArea"><ng-pdf template-url="duplicateinvoice/partials/duplicate-pdf-partial.tpl.html" canvasid="duplicate-canvas" scale="1"></ng-pdf></div>',
    scope: {
      pdfUrl: '=',
      openInModal: '=',
      invoice: '='
    }
  };
}])
;
