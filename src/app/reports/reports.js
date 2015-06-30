/**
 * Reports module
 */
angular.module( 'billsync.reports', [
  'ui.router',
  'ngResource',
  'ui.bootstrap',
  'billsync.entities',
  'nvd3ChartDirectives'
])

/**
 * Define the route that this module relates to, and the page template and controller that is tied to that route
 */
.config(function config( $stateProvider ) {
  $stateProvider.state( 'reports', {
    url: '/reports',
    views: {
      "main": {
        controller: 'ReportsCtrl',
        templateUrl: 'reports/listing.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{ pageTitle: 'reports' }
  })
  .state( 'lastitemprice', {
    url: '/lastitemprice',
    views: {
      "main": {
        controller: 'ReportsCtrl',
        templateUrl: 'reports/lastitemprice.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{ pageTitle: 'last price' }
  })
.state( 'billarchive', {
    url: '/billarchive',
    views: {
      "main": {
        controller: 'ReportsCtrl',
        templateUrl: 'reports/billarchive.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{ pageTitle: 'bill archive' }
  })
.state( 'outstandingbills', {
    url: '/outstandingbills',
    views: {
      "main": {
        controller: 'ReportsCtrl',
        templateUrl: 'reports/outstandingbills.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{ pageTitle: 'bills outstaning' }
  })
.state( 'vendorterms', {
    url: '/vendorterms',
    views: {
      "main": {
        controller: 'ReportsCtrl',
        templateUrl: 'reports/vendorterms.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{ pageTitle: 'vendor' }
  })
.state( 'descendingdollar', {
    url: '/descendingdollar',
    views: {
      "main": {
        controller: 'ReportsCtrl',
        templateUrl: 'reports/descendingdollar.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{ pageTitle: 'descending dollar' }
  })
.state( 'paymentreconcilation', {
    url: '/paymentreconcilation',
    views: {
      "main": {
        controller: 'ReportsCtrl',
        templateUrl: 'reports/paymentreconcilation.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{ pageTitle: 'payments' }
  })
.state( 'itemsdetail', {
    url: '/line_item/:id/details',
    views: {
      "main": {
        controller: 'ReportsCtrl',
        templateUrl: 'reports/itemsdetail.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{ pageTitle: 'item detail' }
  })
.state( 'current_payments', {
    url: '/current-payments',
    views: {
      "main": {
        controller: 'ReportsCtrl',
        templateUrl: 'reports/current_payments.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{ pageTitle: 'Current Payments' }
  })
;
})
.controller( 'ReportsCtrl', function ReportsCtrl( $scope, $http, Auth, $state, $stateParams, $filter ) {

  $scope.colorFunction = function() {
  return function(d, i) {
      return '#336699' ;
    };
  };

 $scope.xFunction = function(){
    return function(d){
      return d[0];
    };
  };

  $scope.yFunction = function(){
    return function(d){
      return d[1];
    };
  };

  $scope.xAxisTickFormat = function () {
    return function(d){
      return $filter('date')(new Date(d), 'MM/dd/yyyy');
    };
  };

  $scope.scope_url = null;
  $scope.collection_name = null;

  var date = new Date();
  date.setDate(date.getDate() - 365);
  $scope.start_date = $filter('date')(date, 'MM/dd/yy');
  $scope.end_date = $filter('date')(new Date(), 'MM/dd/yy');
  $scope.scope_params = {};
  $scope.apply_scopes = function(callback) {
    $http.get($scope.scope_url, { params: $scope.scope_params }).success(function(res) {
      $scope[$scope.collection_name] = res.records || res;
      $scope.currentPage = res.current_page;
      $scope.totalItems = res.total_pages;
      $scope.per_page = res.per_page;
      if (callback) {
        callback(res);
      }
    });
  };


  $scope.descendingdollarStart = function() {
    $scope.scope_params["page"] = 1;
    $scope.scope_params["per_page"] = 300;
    $scope.collection_name = 'line_items';
    $scope.scope_url = "/api/v1/line_items_reports";
    $scope.reverse = true;
    $scope.predicate = "total_amount";
    $scope.apply_scopes();
    $scope.getVendors();
  };

  $scope.billsArchiveStart = function() {
    $scope.collection_name = 'invoices';
    $scope.scope_url = "/api/v1/invoices/archived_invoices";
    $scope.apply_scopes();
    $scope.getVendors();
  };

  $scope.lastItemPriceStart = function() {
    $scope.collection_name = 'line_items';
    $scope.scope_url = "/api/v1/line_items_reports";
    $scope.scope_params["by_vendor_name"] = true;
    $scope.scope_params["per_page"] = 200;
    $scope.apply_scopes();
    $scope.getVendors();
  };

  $scope.outstandingBillsStart = function() {
    $scope.collection_name = 'invoices';
    $scope.scope_url = "/api/v1/invoices";
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
    $scope.scope_url = "/api/v1/vendors/vendors_payments";
    $scope.collection_name = 'vendor_payments';
    $scope.apply_scopes();
    $scope.getVendors();
  };

  $scope.currentPaymentsStart = function() {
    $scope.scope_url = "/api/v1/invoices";
    $scope.collection_name = 'invoices';
    $scope.scope_params = { "by_status[]": [5]};
    var date = new Date();
    date.setDate(date.getDate() - 14);
    $scope.scope_params['by_check_date'] = date;
    $scope.resetPayments();
    $scope.getVendors();
    $scope.choices = {
      payment_pending: [{status: 4, text:'cancel autopay'}, {status: 4,text: 'remove from queue'}, {status: 5, text: 'mark as paid'}, {text: 'delete', status: 11}]
    };
  };

  $scope.vendorTermsStart = function() {
    $scope.scope_params["reports_serializer"] = true;
    $scope.scope_url = "/api/v1/vendors";
    $scope.collection_name = 'collection';
    $scope.predicate = "percent_time_period";
    $scope.reverse = true;
    $scope.apply_scopes();
    $scope.getVendors();
  };

  var invoicesCallback = function(invoices){
    setTimeout(function(){
      $('.addAnimation').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
        $(this).removeClass('addAnimation');
      });
    }, 200);
  };

  $scope.resetPayments = function() {
    if ($scope.selected_vendor) {
      $scope.scope_params['by_vendor'] = $scope.selected_vendor;
    } else {
      delete $scope.scope_params['by_vendor'];
    }
    $http.get("/api/v1/vendors/vendors_payments", { params: $scope.scope_params}).success(function(res) {
      $scope.vendor_payments = res;
    });
    $scope.apply_scopes(invoicesCallback);
  };

  $scope.setItem = function(id) {
    var params = {};
    if ($scope.start_date) {
      params['by_period[start_date]'] = $scope.start_date;
    }
    if ($scope.end_date) {
      params['by_period[end_date]'] = $scope.end_date;
    }

    $http.get("/api/v1/line_items_reports/" + id, { params: params }).success(function(res) {
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
      d3Start();
    });
    // $scope.exampleData = [
    //   {
    //     "key": "price",
    //     "values": [[110.0,1],[198.0,2],[198.0,3]]
    // }];
    // d3Start();
  };

  $scope.refreshItem = function() {
    $scope.setItem($scope.selected_line_item_id);
  };

  $scope.lineItemChanged = function() {
    $scope.setItem($scope.selected_line_item_id);
  };

  $scope.getItemsForVendor = function(id) {
    $http.get("/api/v1/line_items_reports/by_vendor?vendor_id=" + id).success(function(res) {
      $scope.line_items = res;
    });
  };

  $scope.getVendorForDropdowns = function() {
    $http.get("/api/v1/vendors/for_dropdown").success(function(res) {
      if (!$scope.selected_vendor) {
        $scope.selected_vendor = null;
      }
      $scope.vendors = res;
    });
  };

  $scope.vendorDropDownChanged = function() {
    $scope.getItemsForVendor($scope.selected_vendor_id);
  };

  $scope.setItemFilter = function(id) {
    $scope.selected_item_filter = $scope.line_item.item_savings[$scope.item_filter];
  };

  var div1 = d3.select(document.getElementById('div1'));
  var div2 = d3.select(document.getElementById('div2'));
  var div3 = d3.select(document.getElementById('div3'));


  function d3Start() {
    var rp1 = radialProgress(document.getElementById('div1'))
      .label("")
      .diameter(130)
      .value($scope.line_item.percent_vendor_spend)
      .render();

    var rp2 = radialProgress(document.getElementById('div2'))
      .label("")
      .diameter(130)
      .value($scope.line_item.percent_total_spend)
      .render();

    var rp3 = radialProgress(document.getElementById('div3'))
      .label("")
      .diameter(130)
      .value($scope.line_item.percent_of_invoices)
      .render();
  }

  $scope.getVendors = function() {
    $http.get("/api/v1/vendors?listing=true").success(function(res) {
      var default_vendor = {id: null, name: "All Vendors"};
      res.unshift(default_vendor);
      if (!$scope.selected_vendor) {
        $scope.selected_vendor = null;
      }
      $scope.vendors = res;
    });
  };

  if ($state.$current.name === "lastitemprice") {
    $scope.lastItemPriceStart();
  } else if ($state.$current.name === "descendingdollar") {
    $scope.descendingdollarStart();
  } else if($state.$current.name === "billarchive") {
    $scope.billsArchiveStart();
  } else if($state.$current.name === "outstandingbills") {
    $scope.outstandingBillsStart();
  } else if ($state.$current.name === "itemsdetail") {
    $scope.itemsdetailStart();
  } else if ($state.$current.name === "paymentreconcilation") {
    $scope.paymentReconcilationStart();
  } else if ($state.$current.name === "current_payments") {
    $scope.currentPaymentsStart();
  } else if ($state.$current.name === "vendorterms") {
    $scope.vendorTermsStart();
  }

  $scope.vendorChanged = function() {
    if ($scope.selected_vendor) {
      $scope.scope_params['by_vendor'] = $scope.selected_vendor;
    } else {
      delete $scope.scope_params['by_vendor'];
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
      $scope.scope_params['by_qb_class'] = $scope.selected_class;
    } else {
      delete $scope.scope_params['by_qb_class'];
    }
    $scope.apply_scopes();
  };

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

  $scope.setStartDate = function() {
    $scope.scope_params['by_period[start_date]'] = $scope.start_date;
    $scope.apply_scopes();
  };

  $scope.setEndDate = function() {
    $scope.scope_params['by_period[end_date]'] = $scope.end_date;
    if ($scope.scope_params['by_period[start_date]']) {
      $scope.apply_scopes();
    }
  };

  $scope.editItem = function(id) {
     $state.transitionTo('itemsdetail', { id: id });
  };

  $scope.editBill = function(id) {
    $state.transitionTo('editInvoice', { invoiceId: id });
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

  $scope.pageChanged = function() {
    $scope.scope_params["page"] = $scope.currentPage;
    $scope.apply_scopes();
  };
})

;
