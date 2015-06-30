angular.module( 'billsync.dashboard', [
  'ui.router',
  'ui.bootstrap',
  'billsync.entities'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'dashboard', {
    url: '/dashboard',
    views: {
      "main": {
        controller: 'DashboardCtrl',
        templateUrl: 'dashboard/dashboard.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{ pageTitle: 'dashboard' }
  });
  $stateProvider.state( 'signup', {
    url: '/signup',
    views: {
      "main": {
        controller: 'DashboardCtrl',
        templateUrl: 'dashboard/dashboard.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{ pageTitle: 'dashboard' }
  });
  $stateProvider.state( 'signin', {
    url: '/signin',
    views: {
      "main": {
        controller: 'DashboardCtrl',
        templateUrl: 'dashboard/dashboard.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{ pageTitle: 'dashboard' }
  });
})

.controller('DashboardCtrl', function DashboardController ($scope, InvoicesRes,
  $state, $http, $rootScope, $modal, $location, $anchorScroll, $timeout) {

  var STATUES = {
    'PAID': 'mark_as_paid!',
    'READY_TO_PAY_TO_PAYMENT_QUEUE': 'ready_to_pay_to_payment_queue!',
    'MARK_AS_DELETED': 'mark_as_deleted!',
    'PAY_INVOICE' : 'pay_invoice!',
    'PAY_NOW': 'pay_now!'
  };

  $scope.loading = true;
  $scope.vendor = {};

  function fetchInvoices () {
    $http.get('/api/v1/dashboard').success(function(res) {
      $scope.invoicesInProcess = res.in_process_count;
      $scope.countBills();
      $scope.invoices = res.invoices;
      $scope.loading = false;

    })
    .error(function (err, st) {
      $timeout(function () {
        if (st === 401 && ($scope.currentIndividual && $scope.currentIndividual !== null)) {
          $state.transitionTo('error');
        }
      }, 0);
    });
  }

  $scope.hasMissingAddresInfo = function (invoice) {
    if ( angular.isDefined(invoice) && invoice !== null && invoice.vendor ) {
      return ! (invoice.vendor.address1 && invoice.vendor.city &&
        invoice.vendor.state && invoice.vendor.zip);
    }
    return false;
  };

  $scope.isValidVendor = function (invoice) {
    if ( angular.isDefined(invoice) && invoice !== null && invoice.vendor) {
      var vendor = invoice.vendor;
      if (!vendor.name) {
        return false;
      }

      return (vendor.routing_number && vendor.bank_account_number) ||
        (vendor.address1 && vendor.city && vendor.state && vendor.zip);
    }
    return false;
  };

  $scope.hasMissingName = function(invoice) {
    if ( angular.isDefined(invoice) && invoice !== null ) {
      return !invoice.vendor.name;
    }
    return false;
  };

  $scope.alertTooltip = function(alerts) {
    if (alerts.length === 0) {
      return '';
    }

    return alerts[0].long_text;
  };

  $scope.openModal = function () {
    var modalInstance = $modal.open({
      templateUrl: 'common/addBillsModal/addBillsModalContent.tpl.html',
      size: 'lg',
      controller: addBillsModalCtrl,
      backdrop: false
    });

    modalInstance.result.then(function () {
      fetchInvoices();
      console.log('Upload Completed!');
    }, function () {
      fetchInvoices();
      console.log('Modal dismissed at: ' + new Date());
    });
  };

  $scope.addBill = function() {
    $state.transitionTo('newInvoice');
  };

  $scope.init = function () {
    fetchInvoices();
  };

  $scope.changeInvoiceStatus = function (status, invoice) {
    if ( ! invoice ) {
      return console.error('You must supply an ID');
    }

    var params = { ids: [invoice.id] };
    invoice.animateOut = true;

    $http.put('/api/v1/invoices/aasm_events?status=' + STATUES[status], params)
      .success(function(response) {
        var id = $scope.invoices.indexOf(invoice);
        $scope.invoices.splice(id, 1);
        if ( $scope.currentInvoice === invoice ) {
          $scope.currentInvoice = null;
        }

        $scope.countBills();
      });
  };

  $scope.updateInvoiceAddress = function(value) {
    var params = {address_id: value };
    if (value) {
      $http.put('/api/v1/invoices/' + $scope.currentInvoice.id, params).success(function(response) {
        console.log('success');
      }).error(function(response) {
        console.log('error', response);
      });
    }

  };

  $scope.getItemsDetails = function(invoice) {
    if ($scope.currentInvoice.invoice_transactions) {

      var first_item = $scope.currentInvoice.invoice_transactions[0];
      if (first_item && (first_item.percent_difference || first_item.average_volume)) {
        return;
      }
    }
    var url = '/api/v1/invoices/' + $scope.currentInvoice.id + '/invoice_transactions';
    $http.get(url).success(function(response) {
      invoice.invoice_transactions = response;
      $scope.currentInvoice.invoice_transactions = response;
      $scope.tabs[1].disabled = ! Boolean( response.length );
      $scope.repeat = false;
    });
  };

  $scope.setCurrentInvoice = function (invoice) {
    $scope.getImagesForInvoice(invoice.id);
    $rootScope.lineItemMessageAdded = false;
    $scope.repeat = false;
    $scope.currentInvoice = invoice;
    $scope.currentInvoice.vendor_attributes = $scope.currentInvoice.vendor || {};
    $scope.getVendor();
    $scope.getItemsDetails(invoice);

    $scope.qb_classes = angular.copy($scope.currentIndividual.user.qb_classes);
    if (!$scope.currentInvoice.address_id) {
      $scope.qb_classes.unshift({id: null, name: 'Undetermined Location/Class'});
      $scope.currentInvoice.address_id = null;
    }

    if ( ! angular.isDefined($scope.currentInvoice.vendor) ) {
      $scope.currentInvoice.vendor = { name:"", routing_number: "",
        bank_account_number: "", address1: "", city: "", state: "", zip: "" };
    }

    $scope.vendor = {};

    if ( ! angular.isDefined($scope.currentInvoice.vendor) ) {
      $scope.currentInvoice.vendor = { name:"", routing_number: "",
        bank_account_number: "", address1: "", city: "", state: "", zip: "" };
    }

    $scope.vendor = {};
    $scope.tabs[0].disabled = Boolean( showTab.bill(invoice) );
    $scope.tabs[2].disabled = ! Boolean( showTab.accounting(invoice) );

    $scope.tabs[0].active =
      ($scope.isEditableInvoice($scope.currentInvoice.status)) ? true : false;
    $scope.tabs[1].active =
      ($scope.isPayableInvoice($scope.currentInvoice.status)) ? true : false;
    $scope.tabs[2].active = false;

    var countLineItemMessages=0;
    $rootScope.globalAlerts=[];
    for(var i = 0; i < $scope.currentInvoice.total_alerts.length; i++){
        if(($scope.currentInvoice.total_alerts[i].category != 'new_line_item' && $scope.currentInvoice.total_alerts[i].category != 'line_item_quantity' && $scope.currentInvoice.total_alerts[i].category != 'line_item_price_increase')){
          $rootScope.globalAlerts.push($scope.currentInvoice.total_alerts[i]);
        }else{
          if(countLineItemMessages===0){
            $rootScope.globalAlerts.push({category:$scope.currentInvoice.total_alerts[i].category,
              short_text:$scope.currentInvoice.total_alerts[i].short_text});
            countLineItemMessages++;
          }
        }
    }


    $location.hash('right-panel-top');
    $anchorScroll();
  };

  $scope.isEditableInvoice = function (status) {
    return 0 <= ["need_information"].indexOf(status);
  };

  $scope.isPayableInvoice = function (status) {
    return 0 <= ["ready_for_payment"].indexOf(status);
  };

  $scope.editInvoice = function(invoice) {
    $('#right-panel-edit-button').tooltip('hide');
    $state.transitionTo('editInvoice', { invoiceId: invoice.id });
  };

  $scope.editLineItems = function (invoice) {
    $state.transitionTo('editInvoice', { invoiceId: invoice.id, editLineItems: true });
  };

  $scope.autoPay = function(invoice) {
    $state.transitionTo('vendoredit', { vendorid: invoice.vendor_id, tab: 'autopay' });
  };

  $scope.updateInvoice = function (invoice, index) {
    // updateVendor(invoice);
    invoice.from_user = true;
    for( var attr in $scope.vendor ) {
      if ($scope.vendor[attr] && $scope.vendor[attr].length > 0) {
        invoice.vendor_attributes[attr] = $scope.vendor[attr];
      }
    }

    if (invoice.vendor_attributes) {
      invoice.vendor = invoice.vendor_attributes;
    }

    if ($scope.currentInvoice.vendor.name) {
      invoice.vendor_attributes.name = $scope.currentInvoice.vendor.name;
    }

    if (invoice.vendor_attributes) {
      invoice.vendor_id = invoice.vendor_attributes.id;
    }

    InvoicesRes.update({ id: invoice.id }, invoice, function (response) {
      var index = $scope.invoices.indexOf(invoice);
      $scope.invoices.splice(index, 1, response);
      $scope.setCurrentInvoice($scope.invoices[index]);

      console.log('The invoices has been updated successfully.');
    });
  };

  function updateVendor(invoice) {
    for( var attr in $scope.vendor ) {
      if ($scope.vendor[attr] && $scope.vendor[attr].length > 0) {
        $scope.currentInvoice.vendor[attr] = $scope.vendor[attr];
        $scope.currentInvoice.vendor_attributes[attr] = $scope.vendor[attr];
      }
    }
  }

  showTab = {
    bill: function (invoice) {
      if ( invoice ) {
        if (!invoice.vendor) {
          return false;
        }

        if (!invoice.amount_due || !invoice.vendor.name) {
          return false;
        }

        return  (invoice.vendor.routing_number      &&
                invoice.vendor.bank_account_number) ||
                (invoice.vendor.address1           &&
                invoice.vendor.city                &&
                invoice.vendor.state               &&
                invoice.vendor.zip);
      } else {
        return false;
      }
    },
    accounting: function (invoice) {
      if ( invoice ) {
        if (!invoice.vendor) {
          return false;
        }
        console.log("qb_id " + invoice.vendor.qb_id);
        console.log("qb_d_id " + invoice.vendor.qb_d_id);
        console.log("qb_account_number " + invoice.vendor.qb_account_number);
        return (invoice.vendor.qb_account_number || invoice.vendor.qb_id || invoice.vendor.qb_d_id) && $scope.currentIndividual.user.synced_qb;
      } else {
        return false;
      }
    }
  };

  $scope.getVendor = function() {
    if ($scope.currentInvoice.vendor && $scope.currentInvoice.vendor.id) {
      $http.get('/api/v1/vendors/' + $scope.currentInvoice.vendor.id + "?include_config=true").success(function(response) {
        $scope.selected_vendor = response;
        $scope.currentInvoice.vendor = response;
      }).error(function(res) {
        console.log('error');
      });
    }
    return;

  };

  $scope.updateItem = function(id, value, type, update_all) {
    var params = {};
    params[type] = value;

    if (update_all) {
      params['description'] = id;
      params['vendor_id'] = $scope.currentInvoice.vendor.id;
      $http.put('/api/v1/line_items/update_all', params).success(function(response) {
        console.log('success');
      }).error(function(response) {
        console.log('error', response);
      });

    } else {
      $http.put('/api/v1/line_items/' + id, params).success(function(response) {
        console.log('success');
      }).error(function(response) {
        console.log('error', response);
      });
    }

  };

  $scope.tabs = [{
      heading: "Missing Information",
      partial: "dashboard/partials/missing_information_tab.tpl.html",
      disabled: true
    }, {
      heading: "Details",
      partial: "dashboard/partials/invoice_details_tab.tpl.html",
      disabled: true
    }, {
      heading: "Accounting",
      partial: "dashboard/partials/accounting_tab.tpl.html",
      disabled: true
    }];

  $scope.getVendors = function(value) {
    $scope.existingVendorSelected = false;
    var params = {
      name: value,
      user_id: $scope.currentIndividual.user.id
    };

    return $http.get('../api/v1/vendors/search', { params: params })
    .then(function(response){
      return response.data;
    });
  };

  $scope.setVendor = function($item) {
    $scope.errors = [];
    $scope.existingVendorSelected = true;
    $scope.currentInvoice.vendor = $item;
    $scope.currentInvoice.vendor_id = $item.id;
    $scope.vendor = $item;
  };

  $scope.deferDate = function(deferred_string, invoice) {
    var params = { deferred_string: deferred_string };
    $http.put('/api/v1/invoices/' + invoice.id + '/defer', params).success(function(response) {
      $scope.invoices.splice($scope.invoices.indexOf(invoice), 1);
      $scope.countBills();
      if ($scope.currentInvoice) {
        $scope.currentInvoice = null;
      }
    });
  };

  $scope.approveInvoice = function (inv, kind) {
    $('#right-panel-acc-approve-button').tooltip('hide');
    $('#right-panel-regular-approve-button').tooltip('hide');
    var categoryHolder = inv.category;
    $http.post('/api/v1/invoices/' + inv.id + '/approve', { kind: kind })
      .success(function (response) {
        var id = $scope.invoices.indexOf(inv);
        response.category = categoryHolder;
        $scope.invoices.splice(id, 1, response);
        $scope.currentInvoice = response;
      });
  };

  $scope.showLineItemsAlert = false;
  $scope.canShowLineItemAlert = function(){
     if($scope.currentInvoice !== undefined){
      console.log($scope.currentInvoice.invoice_transactions);
       for(var i=0 ; $scope.currentInvoice.invoice_transactions.length>i;i++){
        var transaction = $scope.currentInvoice.invoice_transactions[i];
        if(transaction.alerts.length>0){
          $scope.showLineItemsAlert = true;
        }
       }
     }
  };

  $scope.getImagesForInvoice = function(id) {
    $http.get("/api/v1/invoices/" + id + '/uploads').success(function(r) {
      $scope.invoice_images = r;
    });
  };

})

.directive('lineOutAnimation', [function(){
  return {
    scope: {
      trigger: '='
    },
    restrict: 'A',
    link: function($scope, iElm, iAttrs, controller) {
      $scope.$watch('trigger', function (newValue, oldValue){
        if ("boolean" === typeof newValue && newValue) {
          $("#" + iAttrs.id).one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
            $(this).remove();
          });
        }
      });
    }
  };
}])

.directive('rightInvoicePanel', [function(){
  return {
    restrict: 'A',
    templateUrl: 'dashboard/partials/right_invoice_panel.tpl.html'
  };
}])

.directive('bootstrapTabs', [function(){
  return {
    restrict: 'A',
    link: function($scope, iElm, iAttrs, controller) {
      tabs = $(iElm).find('[data-toggle=tab]');

      tabs.on('click', function (e) {
        e.preventDefault();
        $(this).tab('show');
      });
    }
  };
}])

.directive('bootstrapTooltips', [function(){
  return {
    restrict: 'A',
    link: function($scope, iElm, iAttrs, controller) {
      iElm.tooltip();
    }
  };
}])
;
