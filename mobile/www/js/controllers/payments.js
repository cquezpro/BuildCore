angular.module('billsync.controllers')

.controller('ReportsCtrl', function($scope, $rootScope, $http, Auth, $ionicActionSheet, $baseUrl, $state, $ionicLoading, $ionicModal, $ionicPopover, $window) {
  

  $scope.scope_url = null;
  $scope.collection_name = null;
  $scope.scope_params = {};
  $scope.apply_scopes = function(callback) {
    $http.get($scope.scope_url, { params: $scope.scope_params }).success(function(res) {
      $scope[$scope.collection_name] = res;
      if (callback) {
        callback(res);
      }
    });
  };


  $scope.descendingdollarStart = function() {
    $scope.collection_name = 'line_items';
    $scope.scope_url = $baseUrl + "/api/v1/line_items";
    $scope.apply_scopes();
    $scope.getVendors();
  };

  $scope.billsArchiveStart = function() {
    $scope.collection_name = 'invoices';
    $scope.scope_url = $baseUrl + "/api/v1/invoices/archived_invoices";
    $scope.apply_scopes();
    $scope.getVendors();
  };

  $scope.lastItemPriceStart = function() {
    $scope.collection_name = 'line_items';
    $scope.scope_url = $baseUrl + "/api/v1/line_items";
    $scope.apply_scopes();
    $scope.getVendors();
  };

  $scope.outstandingBillsStart = function() {
    $scope.collection_name = 'invoices';
    $scope.scope_url = $baseUrl + "/api/v1/invoices";
    $scope.scope_params = { "by_status[]": [4,5]};
    $scope.apply_scopes();
    $scope.getVendors();
  };

  $scope.itemsdetailStart = function() {
    $scope.item_filters = [{id: "didnt_change", label: "didn’t change"} , {id: "at_today_price", label: "had stayed at today's price"}, {id: "at_the_low_price", label: "had stayed at the low"}, {id: "at_the_high_price", label: "had stayed at the high"}];
    $scope.getVendorForDropdowns();
    $scope.setItem($stateParams.id);
  };

  $scope.paymentReconcilationStart = function() {
    $scope.scope_url = $baseUrl + "/api/v1/vendors/vendors_payments";
    $scope.collection_name = 'vendor_payments';
    $scope.apply_scopes();
    $scope.getVendors();
  };

  $scope.currentPaymentsStart = function() {
    $scope.selected_vendor = null;
    $scope.scope_url = $baseUrl + "/api/v1/invoices";
    $scope.collection_name = 'invoices';
    $scope.scope_params = { "by_status[]": [5]};
    var date = new Date();
    date.setDate(date.getDate() - 14);
    $scope.scope_params.by_check_date = date;
    $scope.resetPayments();
    $scope.getVendors();
    $scope.choices = {
      payment_pending: [{status: 4, text:'cancel autopay'}, {status: 4,text: 'remove from queue'}, {status: 5, text: 'mark as paid'}, {text: 'delete', status: 11}]
    };
  };

  var invoicesCallback = function(invoices){
    setTimeout(function(){
      $('.addAnimation').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
        $(this).removeClass('addAnimation');
      });
    }, 200);
  };

  $scope.form = {};
  $scope.form.selected_vendor = null;

  $scope.resetPayments = function() {
    if ($scope.form.selected_vendor) {
      $scope.scope_params.by_vendor = $scope.form.selected_vendor;
    } else {
      delete $scope.scope_params.by_vendor;
    }
    $ionicLoading.show({
      template: 'Loading...'
    });
    $http.get($baseUrl + "/api/v1/vendors/vendors_payments", { params: $scope.scope_params}).success(function(res) {
      $scope.vendor_payments = res;
      $ionicLoading.hide();
    });
    $scope.apply_scopes(invoicesCallback);
  };

  $scope.setItem = function(id) {
    var params = {};
    if ($scope.start_date) {
      params['by_period[start_date]'] = $scope.start_date;
    }
    if ($scope.dates && $scope.dates.end_date) {
      params['by_period[end_date]'] = $scope.dates.end_date;
    }

    $http.get($baseUrl + "/api/v1/line_items/" + id, { params: params }).success(function(res) {
      $scope.line_item = res;
      $scope.selected_line_item_id = res.id;
      $scope.selected_vendor_id = res.vendor_id;
      $scope.getItemsForVendor(res.vendor_id);
      $scope.item_filter = "didnt_change";
      $scope.selected_item_filter = res.item_savings[$scope.item_filter];

      $scope.exampleData = [
        {
          "key": "price",
          "values": $scope.line_item.spark_line_data
      }];
    });
  };

  $scope.refreshItem = function() {
    $scope.setItem($scope.selected_line_item_id);
  };

  $scope.lineItemChanged = function() {
    $scope.setItem($scope.selected_line_item_id);
  };

  $scope.getItemsForVendor = function(id) {
    $http.get($baseUrl + "/api/v1/line_items/by_vendor?vendor_id=" + id).success(function(res) {
      $scope.line_items = res;
    });
  };

  $scope.getVendorForDropdowns = function() {
    $http.get($baseUrl + "/api/v1/vendors/for_dropdown").success(function(res) {
      $scope.vendors = res;
    });
  };

  $scope.vendorDropDownChanged = function() {
    $scope.getItemsForVendor($scope.selected_vendor_id);
  };

  $scope.setItemFilter = function(id) {
    $scope.selected_item_filter = $scope.line_item.item_savings[$scope.item_filter];
  };

  $scope.getVendors = function() {
     $ionicLoading.show({
      template: 'Loading...'
    });
    $http.get($baseUrl + "/api/v1/vendors?listing=true").success(function(res) {
      $ionicLoading.hide();
      var default_vendor = {id: null, name: "All Vendors"};
      res.unshift(default_vendor);
      $scope.vendors = res;
    })
    .error(function (err, st) {
        $ionicLoading.hide();
    })
    .finally(function () {
        $ionicLoading.hide();
    });
  };

  

  $scope.currentPaymentsStart();
  

  $scope.vendorChanged = function() {
    if ($scope.form.selected_vendor) {
      $scope.scope_params.by_vendor = $scope.form.selected_vendor;
    } else {
      delete $scope.scope_params.by_vendor;
    }
    $scope.apply_scopes();
  };

  var getCurrentIndividual = function(other_individual) {
    Auth.currentUser().then(function(individual) {
      var new_individual = other_individual || individual;
      $scope.qb_classes = $scope.currentIndividual.user.qb_classes;
    });
  };

  getCurrentIndividual();

  $scope.classChanged = function() {
    if ($scope.selected_class) {
      $scope.scope_params.by_qb_class = $scope.selected_class;
    } else {
      delete $scope.scope_params.by_qb_class;
    }
    $scope.apply_scopes();
  };

  $scope.dates = {};

  $scope.date_start = false;
  $scope.openDatePicker = function($event, field) {
   $event.preventDefault();
   $event.stopPropagation();

   $scope[field] = true;
  };


  $scope.dateOptions = {
   formatYear: 'yy',
   startingDay: 1
  };

  $scope.endDateOptions = {
    formatYear: 'yy',
    startingDay: 1,
    minDate: $scope.start_date
  };

  $scope.dates = {};
  $scope.setStartDate = function() {
    $scope.scope_params['by_period[start_date]'] = $scope.start_date;
    $scope.apply_scopes();
  };

  $scope.setEndDate = function() {
    $scope.scope_params['by_period[end_date]'] = $scope.dates.end_date;
    if ($scope.scope_params['by_period[start_date]']) {
      $scope.apply_scopes();
    }
  };

  $scope.editItem = function(id) {
     $state.transitionTo('itemsdetail', { id: id });
  };

  $scope.resendPayment = function(invoice) {
    var new_invoice = new InvoicesRes(invoice);
    new_invoice.resend_payment = true;
    new_invoice.$update({});
  };

  $scope.autoPay = function(invoice) {
    $state.transitionTo('vendoredit', { vendorid: invoice.vendor_id, tab: 'autopay' });
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
        //$scope.getInvoices();
        $scope.resetPayments();
      });
    } else {
      invoice.action = true;
      $('#' + invoice.id).one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
        $(this).remove();
      });
      $scope.animation_invoice_ids.push(invoice.id);
      var params = { ids: [invoice.id] };
      $http.put($baseUrl + '/api/v1/invoices/aasm_events?status=' + status, params).success(function(response) {
        //$scope.getInvoices();
        $scope.resetPayments();
      });
    }
  };

 $scope.changeInvoiceStatus = function (status, invoice) {
    if ( ! invoice ) {
      return console.error('You must supply an ID');
    }

    var params = { ids: [invoice.id] };
    invoice.animateOut = true;

    $http.put($baseUrl + '/api/v1/invoices/aasm_events?status=' + status, params)
      .success(function(response) {
        $scope.getInvoices();
      });
  };

  $scope.getInvoices = function(){
    // Used http get until InvoicesManager get fixed :P
    $http.get($baseUrl + '/api/v1/invoices').success(function(invoices) {
      $scope.invoices = invoices;  
      $scope.resetPayments();
      $scope.countBills();
      $scope.totalBillsWithoutProcessingCount = invoices.need_information.length + invoices.ready_for_payment.length + invoices.payment_queue.length + invoices.recently_paid.length;
      $scope.totalBillsCount = invoices.total_count;

      if($scope.totalBillsCount === 0){
        $scope.noBillsNotice = true;
      }
      setTimeout(function(){
        $('.addAnimation').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
          $(this).removeClass('addAnimation');
        });
      }, 200);
      //$scope.apply();
    })
    .error(function (err, st) {
      
    });
  };

  $scope.detailVendor = null;
  $scope.mainBox = true;
  $scope.detailBox = false;

  $scope.showDetail = function(vendor) {
    $scope.detailVendor = vendor;
    /*$scope.mainBox = false;
    $scope.detailBox = true;*/
    $ionicModal.fromTemplateUrl('templates/payments-detail.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  };

  $scope.closeDetail = function () {
    $scope.modal.hide();
    $scope.mainBox = true;
    $scope.detailBox = false;
  };

});