/**
 * Each section of the site has its own module. It probably also has
 * submodules, though this boilerplate is too simple to demonstrate it. Within
 * `src/app/home`, however, could exist several additional folders representing
 * additional modules that would then be listed as dependencies of this one.
 * For example, a `note` section could have the submodules `note.create`,
 * `note.delete`, `note.edit`, etc.
 *
 * Regardless, so long as dependencies are managed correctly, the build process
 * will automatically take take of the rest.
 *
 * The dependencies block here is also where component dependencies should be
 * specified, as shown below.
 */
angular.module( 'billsync.home', [
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
  $stateProvider.state( 'home', {
    url: '/home',
    views: {
      "main": {
        controller: 'HomeCtrl',
        templateUrl: 'home/home.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{ pageTitle: 'bills' }
  })
  .state('archive', {
    url: '/archive',
    views: {
      "main": {
        controller: 'HomeCtrl',
        templateUrl: 'home/archive.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{pageTitle: 'archive'}
  })
  .state('processing', {
    url: '/processing',
    views: {
      "main": {
        controller: 'HomeCtrl',
        templateUrl: 'home/processing.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{pageTitle: 'processing'}
  })
  .state('invoice', {
    url: '/invoice',
    views: {
      "main": {
        controller: 'InvoiceCtrl',
        templateUrl: 'home/form.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{pageTitle: 'Invoice'}
  })
  ;
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'HomeCtrl', function HomeController($rootScope, $scope, InvoicesManager, $state, $filter, $http, $modal, InvoicesRes, Auth, CurrentIndividualRes) {

  $scope.loading = true;
  $scope.items = ['item1', 'item2', 'item3'];

  $scope.openModal = function () {
    var modalInstance = $modal.open({
      templateUrl: 'common/addBillsModal/addBillsModalContent.tpl.html',
      size: 'lg',
      controller: addBillsModalCtrl,
      backdrop: false
    });

    modalInstance.result.then(function () {
      getInvoices();
      console.log('Upload Completed!');
    }, function () {
      getInvoices();
      console.log('Modal dismissed at: ' + new Date());
    });
  };

  var getInvoices = function(){
    // Used http get until InvoicesManager get fixed :P
    $http.get('/api/v1/invoices').success(function(invoices) {
      $scope.invoices = invoices;
      $scope.countBills();
      $scope.totalBillsWithoutProcessingCount = invoices.need_information.length + invoices.ready_for_payment.length + invoices.payment_queue.length + invoices.recently_paid.length;
      $scope.totalBillsCount = invoices.total_count;

      if($scope.totalBillsCount === 0){
        $scope.noBillsNotice = true;
      }
      $scope.loading = false;
      setTimeout(function(){
        $('.addAnimation').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
          $(this).removeClass('addAnimation');
        });
      }, 200);
    })
    .error(function (err, st) {
      if (st === 401 && ($scope.currentIndividual && $scope.currentIndividual !== null)) {
        $state.transitionTo('error');
      }
    });
  };

  if ($state.current.name === 'archive') {
    $http.get('/api/v1/invoices/archived_invoices').success(function(invoices) {
      $scope.invoices = invoices;
      console.log($scope.invoices);
    })
    .error(function (err, st) {
      if (st === 401 && ($scope.currentIndividual && $scope.currentIndividual !== null)) {
        $state.transitionTo('error');
      }
    });
  } else {
    getInvoices();
  }

  $scope.choices = {
    missing_information: [{status: 5, text: 'mark as paid'}, {text: 'delete', status: 11 }],
    ready_for_payment: [{status: 0, text: 'pay on due date'}, {status: 5, text: 'mark as paid'}, {text: 'delete', status: 11 }],
    payment_pending: [{status: 4, text:'cancel autopay'}, {status: 4,text: 'remove from queue'}, {status: 5, text: 'mark as paid'}, {text: 'delete', status: 11}]
  };


  $scope.$on('refresh:invoices', function() {
    getInvoices();
  });

  $scope.addBill = function() {
    $state.transitionTo('newInvoice');
  };

  $scope.checkDate = function(due_date){
    if (due_date) {
      var date = new Date();
      var year = due_date.split('-')[0];
      return toString(date.getFullYear()) === year;
    }
  };

  $scope.editBill = function(id) {
    $state.transitionTo('editInvoice', { invoiceId: id });
  };

  $scope.animation_invoice_ids = [];
  $scope.changeStatus = function(status, invoice, collection) {
    if (collection) {
      var invoices = $filter('filter')(collection, {checked: true});
      var invoice_ids = [];
      $.map(invoices, function(item, index) {
        invoice_ids.push(item.id);
        $scope.animation_invoice_ids.push(item.id);
        item.action = true;
        $('#' + item.id).one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
          $(this).remove();
        });
      });
      InvoicesRes.update_all({invoice_ids: invoice_ids, invoice_status: status}, function() {
        getInvoices();
      });
    } else {
      invoice.action = true;
      $('#' + invoice.id).one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
        $(this).remove();
      });
      $scope.animation_invoice_ids.push(invoice.id);
      var params = { ids: [invoice.id] };
      $http.put('/api/v1/invoices/aasm_events?status=' + status, params).success(function(response) {
        getInvoices();
      });
    }
  };

  $scope.checkOrUncheck = function(collection, ngModel) {
    if ($scope[ngModel]) {
      markCollectionAs(collection, true);
    } else {
      markCollectionAs(collection, false);
    }
  };

  var markCollectionAs = function(collection, type) {
    $.map(collection, function(item, index) {
      item.checked = type;
    });
  };

  $scope.autoPay = function(invoice) {
    $state.transitionTo('vendoredit', { vendorid: invoice.vendor_id, tab: 'autopay' });
  };

  $scope.resendPayment = function(invoice) {
    var new_invoice = new InvoicesRes(invoice);
    new_invoice.resend_payment = true;
    new_invoice.$update({});
  };

  Auth.currentUser().then(function(individual) {
    $scope.currentIndividual = new CurrentIndividualRes(individual);
  });

  $scope.getSourceText = function(invoice){
    if(invoice.source == 'by_app'){
      return 'upload-' + $scope.currentIndividual.name;
    }else{
      return invoice.source_email;
    }
  };

})

.directive('displayAlerts', ['$state','$rootScope', function($state,$rootScope) {
  return {
    restrict: 'E',
    templateUrl: 'home/partials/home/alerts_template.tpl.html',
    scope: {
      invoice: '=',
      showUl: '='
    },
    link: function($scope) {
      $scope.showTitle = false;


      $scope.solveDuplicateInvoice = function (original_id, duplicate_id) {
        $state.transitionTo('duplicateInvoice', {
          originalId: original_id,
          duplicateId: duplicate_id
        });
      };


      $scope.canShowAlert = function (category) {
        console.log($rootScope.globalAlerts);
        /*for(var i = 0; i < $rootScope.globalAlerts.length; i++){
          if(($rootScope.globalAlerts[i].category == 'new_line_item' || $rootScope.globalAlerts[i].category == 'line_item_quantity' || $rootScope.globalAlerts[i].category == 'line_item_price_increase') && $rootScope.lineItemMessageAdded){
            return false;
          }
          }
        }*/

        if (category == 'invoice_increase_total' && $scope.invoice.vendor.settings.alert_total_flag) {
          return true;
        /*} else if (category === 'new_line_item' && $scope.invoice.vendor.alert_item_flag) {
          return true;
        } else if (category === 'line_item_quantity' && $scope.invoice.vendor.alert_itemqty_flag) {
          return true;
        } else if (category === 'line_item_price_increase' && $scope.invoice.vendor.alert_itemprice_flag) {
          return true;
        }*/
        } else if (category === 'new_line_item') {
          $rootScope.lineItemMessageAdded = true;
          return true;
        } else if (category === 'line_item_quantity') {
          $rootScope.lineItemMessageAdded = true;
          return true;
        } else if (category === 'line_item_price_increase') {
          $rootScope.lineItemMessageAdded = true;
          return true;
        }else if (category === 'new_vendor') {
          return true;
        } else if (category === 'duplicate_invoice' && $scope.invoice.vendor.settings.alert_duplicate_invoice_flag) {
          return true;
        } else if (category === 'manual_adjustment' && $scope.invoice.vendor.settings.alert_marked_through_flag) {
          return true;
        } else if (category === 'resending_payment') {
          return true;
        } else if (category === 'no_location') {
          return true;
        } else if (category === 'processing_items') {
          return true;
        } else if (category === 'invoice_increase_total') {
          return true;
        }

        return false;
      };

      $scope.noRepeat = function(){
        if(!$rootScope.lineItemMessageAdded){
          $rootScope.lineItemMessageAdded=true;
          return true;
        }else{
          return false;
        }
      };

      $scope.alertsToShow = function(alerts){
        var canShow=false;
        for(var i=0; i < alerts.length; i++){
          if($scope.canShowAlert(alerts[i].category)){
            canShow=true;
          }
        }
        return canShow;
      };

      var hideOrShowAlerts = function() {
        angular.forEach($scope.invoice.total_alerts, function(alert) {
          if ($scope.canShowAlert(alert.category)) {
            $scope.showTitle = true;
          }
        });
      };

      hideOrShowAlerts();

    }
  };
}])

;

