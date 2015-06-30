/**
 * Vendor module
 */
angular.module( 'billsync.vendor', [
  'ui.router',
  'ngResource',
  'ui.bootstrap',
  'billsync.entities'
])

/**
 * Define the route that this module relates to, and the page template and controller that is tied to that route
 */
.config(function config( $stateProvider ) {
  $stateProvider.state( 'vendor', {
    url: '/vendor',
    views: {
      "main": {
        controller: 'VendorCtrl',
        templateUrl: 'vendor/vendor.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{ pageTitle: 'vendors' }
  })
  .state('vendornew', {
    url: '/vendor/new',
    views: {
      "main": {
        controller: 'VendorNewCtrl',
        templateUrl: 'vendor/form.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{pageTitle: 'new vendor'}
  })
  .state('vendoredit', {
    url: '/vendor/:vendorid/edit?tab',
    views: {
      "main": {
        controller: 'VendorEditCtrl',
        templateUrl: 'vendor/form.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{pageTitle: 'edit vendor'}
  })
  ;
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'VendorCtrl', function VendorController( $scope, VendorsRes, $state, $http ) {
  $scope.loading = true;

  $http.get('/api/v1/vendors')
    .success(function (vs) {
      $scope.vendors = vs;
      $scope.loading = false;
      if (!$scope.vendors || $scope.vendors.length === 0) {
        $scope.noVendorsNotice = true;
      }
      else {
        $scope.noVendorsNotice = false;
      }
    })
    .error(function (err, st) {
      if (st === 401 && ($scope.currentIndividual && $scope.currentIndividual !== null)) {
        $state.transitionTo('error');
      }
    });

  $scope.orderByField = 'name';
  $scope.reverseSort = false;
  $scope.newvendor = function() {
    $state.go('vendornew');
  };
  $scope.editvendor = function(vendorid) {
    $state.transitionTo('vendoredit', { vendorid: vendorid });
  };
  $scope.removevendor = function(vendor) {
    VendorsRes.remove(vendor, function(){
      $scope.vendors = VendorsRes.query(function (vs) {
        if (!$scope.vendors || $scope.vendors.length === 0) {
          $scope.noVendorsNotice = true;
        }
        else {
          $scope.noVendorsNotice = false;
        }
      });
    });
  };
})

.controller( 'VendorNewCtrl', function VendorNewController( $scope, VendorsRes, $state, $filter, InvoicesRes) {
  // $scope.invoice = new InvoicesRes();
  // Defaults

  $scope.line_items = [];
  $scope.default_category = '';

  $scope.masks = {
    business_number: '',
    fax_number: '',
    cell_number: '',
    tax_id_number: ''
  };

  $scope.tabs = [
    { heading: "Basic Information", partial: 'vendor/partials/form/basic_info.tpl.html' },
    { heading: "Payment Terms", partial: "vendor/partials/form/auto_pay.tpl.html" },
    { heading: "Alerts", partial: "vendor/partials/form/alerts.tpl.html" },
    { heading: "Accounting", partial: "vendor/partials/form/line_items.tpl.html" },
    { heading: "Line Items", partial: "vendor/partials/form/line_items_data.tpl.html" },
    { heading: "Bills", partial: "vendor/partials/form/invoice_fields.tpl.html" },
    { heading: "Combined Vendors", partial: "vendor/partials/form/merged.tpl.html" }
  ];

  $scope.errors = [];
  $scope.errors["groupFields"] = ["Must have a payment method (Wire/Check filled out for every vendor"];

  $scope.vendor = new VendorsRes({
    payment_term: 1,
    payment_end: 0,
    payment_amount: 0,
    fax_number: '',
    business_number: '',
    cell_number: '',
    tax_id_number: '',
    states: '',
    day_of_the_month: 1,
    after_bill_date: 7,
    before_due_date: 0,
    after_due_date: 0,
    payment_end_exceed: 500,
    payment_end_payments: 12,
    alert_total_flag: true,
    alert_itemqty_flag: true,
    alert_itemprice_flag: true,
    alert_item_flag: true,
    alert_duplicate_invoice_flag: true,
    routing_number: '',
    bank_account_number: '',
    payment_end_if_alert: true,
    address1: '',
    city: '',
    state: '',
    zip: ''
  });


  if ($scope.currentIndividual) {
    $scope.vendor.after_recieved = $scope.currentIndividual.user.default_due_date;
    $scope.qb_classes = angular.copy($scope.currentIndividual.user.qb_classes);
    $scope.qb_classes.unshift({id: null, name: "Default to Delivery Location/Person"});
  }

  $scope.$watch('currentIndividual', function(newValue, oldValue) {
    if (newValue) {
      $scope.vendor.after_recieved = newValue.default_due_date;
      $scope.qb_classes = angular.copy($scope.currentIndividual.user.qb_classes);
      $scope.qb_classes.unshift({id: null, name: "Default to Delivery Location/Person"});
    }
  });

  var checkState = function(string) {
    var states = ["AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY" ];
    return states.indexOf(angular.uppercase(string)) > -1;
  };

  $scope.$watch('vendor.state', function(newValue, oldValue) {
    if (newValue && newValue.length > 0) {
      if (checkState(newValue)) {
        $scope.vendorForm.state.$error["states"] = false;
      } else {
        $scope.vendorForm.state.$error["states"] = true;
      }
    }
  });

  $scope.setWasFocused = function(formElement){
    formElement.$wasFocused = true;
  };

  $scope.refreshMask = function(attribute, maskPattern) {
    $scope.masks[attribute] = maskPattern;
  };

  $scope.clearMask = function(attribute) {
    if ($scope.vendor[attribute] === undefined || $scope.vendor[attribute].length === 0) {
      $scope.masks[attribute] = '';
    }
  };

  $scope.todayDate = function() {
    return $filter('date')(new Date(), 'yyyy-MM-dd');
  };

  var respondToSuccess = function(response) {
    $scope.$emit('refresh:currentIndividual');
    $state.transitionTo("vendor");
  };

  var respondToFailure = function(response) {
    $scope.errors = response.data.errors;
  };

  $scope.save = function() {
    if ($scope.vendor.default_qb_class_id === "DEFAULT_LOCATION") {
      $scope.vendor.default_qb_class_id = null;
    }

    $scope.vendor.user_id = $scope.currentIndividual.user.id;

    $scope.vendor.$save(respondToSuccess, respondToFailure);
  };

  $scope.cancel = function() {
    $state.transitionTo("vendor");
  };

  $scope.checkVendorGroups = function() {
    if(validateVendorGroups()){
      $scope.errors = [];
    }else{
      $scope.errors['groupFields'] = ["Must have a payment method (Wire/Check filled out for every vendor"];
    }
  };

  var validateVendorGroups = function(){
    return validateBankWireGrop() || validateMailGroup();
  };

  var validateBankWireGrop = function(){
    var routing = $scope.vendor.routing !== '';
    var bank_account_number = $scope.vendor.bank_account_number !== '';
    return routing && bank_account_number;
  };

  var validateMailGroup = function(){
    var address1 = $scope.vendor.address1 !== '';
    var city = $scope.vendor.city !== '';
    var state = $scope.vendor.state !== '';
    var zip = $scope.vendor.zip !== '';
    return address1 && city && state && zip;
  };

  $scope.getCategories = function() {
    return ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5'];
  };

  $scope.setDefaultCategory = function(item, model, label){
    //implement functionality for saving default category
    $scope.default_category = item;
  };

})

.controller( 'VendorEditCtrl', function VendorEditController( $scope, VendorsRes, $state, $stateParams, $filter, InvoicesRes, VendorInvoicesRes, $http) {
  var payment_terms = ['pay_after_bill_received', 'pay_day_of_month', 'pay_before_due_date', 'pay_after_bill_date', 'pay_after_due_date', 'pay_weekly'];
  $scope.days = [{id: 'sunday', label: 'Sunday'}, {id: 'monday', label: 'Monday'}, {id: 'tuesday', label: 'Tuesday'}, {id: 'wednesday', label: 'Wednesday'}, {id: 'thursday', label: 'Thursday'}, {id: 'friday', label: 'Friday'}, {id: 'saturday', label: 'Saturday'}];

  getAllVendors = function() {
    if ($scope.vendor) {
      $http.get('/api/v1/vendors/' + $scope.vendor.id + '/only_parents').success(function(response) {
        $scope.vendors = response;
      });
    }
  };

  var getVendor = function() {
    VendorsRes.get({id: $stateParams.vendorid, include_config: true}, function(response) {
      $scope.vendor = response;
      console.log($scope.vendor.vendor_invoices);
      $scope.expense_account_id = $scope.vendor.expense_account_id;
      $scope.default_qb_class_id = $scope.vendor.default_qb_class_id;
      $scope.vendor.invoices = $scope.vendor.vendor_invoices;
      $scope.vendor.payment_end_exceed = parseInt($scope.vendor.payment_end_exceed, 10);
      $scope.vendor.payment_end_payments = parseInt($scope.vendor.payment_end_payments, 10);
      $scope.vendor.payment_term = payment_terms.indexOf($scope.vendor.payment_term);
      getAllVendors();
      // getInvoices();
    });
  };

  getVendor();

  $scope.$on('refresh:vendor', function() {
    getVendor();
  });

  // var getInvoices = function() {
  //   VendorInvoicesRes.query({id: $stateParams.vendorid}, function(response) {
  //     $scope.vendor.invoices = response[0];
  //   });
  // };

  // var getUniqueLineItems = function(){
  //   $http({method: 'GET', url: '/api/v1/vendors/' + $stateParams.vendorid + '/unique_line_items'}).
  //   success(function(data, status, headers, config) {
  //     $scope.line_items = data;
  //   }).
  //   error(function(data, status, headers, config) {
  //     // called asynchronously if an error occurs
  //     // or server returns response with an error status.
  //   });
  // };

  // getUniqueLineItems();

  $scope.changeLineItemAccounts = function () {
    $scope.vendor.line_items.forEach(function (li) {
      if (li.expense_account_id === $scope.expense_account_id) {
        li.expense_account_id = $scope.vendor.expense_account_id;
      }
    });
    $scope.expense_account_id = $scope.vendor.expense_account_id;
  };

  $scope.changeLineItemClasses = function () {
    $scope.vendor.line_items.forEach(function (li) {
      if (li.qb_class_id === $scope.default_qb_class_id) {
        li.qb_class_id = $scope.vendor.default_qb_class_id;
      }
    });
    $scope.default_qb_class_id = $scope.vendor.default_qb_class_id;
  };

  $scope.updateItems = function(description, value, type) {
    var params = {
      vendor_id: $scope.vendor.id,
      description: description
    };

    params[type] = value;

    $http.put('/api/v1/line_items/update_all', params).success(function(response) {
      console.log('success');
    }).error(function(response) {
      console.log('error', response);
    });
  };

  $scope.choices = {
    less_than_30: [{status: 5, text: 'mark as paid'}, {text: 'delete', status: 11 }],
    more_than_30: [{status: 0, text: 'pay on due date'}, {status: 5, text: 'mark as paid'}, {text: 'delete', status: 11 }],
    archived: [{status: 4, text:'cancel autopay'}, {status: 4,text: 'remove from queue'}, {status: 5, text: 'mark as paid'}, {text: 'delete', status: 11}]
  };

  $scope.checkDate = function(due_date){
    if (due_date) {
      var date = new Date();
      var year = due_date.split('-')[0];
      return toString(date.getFullYear()) === year;
    }
    return false;
  };

  $scope.editBill = function(id) {
    $state.transitionTo('editInvoice', { invoiceId: id });
  };

  $scope.tabs = [
    { heading: "Basic Information", partial: 'vendor/partials/form/basic_info.tpl.html', name: 'basic_info' },
    { heading: "Payment Terms", partial: "vendor/partials/form/auto_pay.tpl.html", name: 'auto_pay' },
    { heading: "Alerts", partial: "vendor/partials/form/alerts.tpl.html", name: 'alerts' },
    { heading: "Accounting", partial: "vendor/partials/form/line_items.tpl.html", name: 'accounting' },
    { heading: "Line Items", partial: "vendor/partials/form/line_items_data.tpl.html", name: 'line_items' },
    { heading: "Bills", partial: "vendor/partials/form/invoice_fields.tpl.html", name: 'invoice_fields' },
    { heading: "Merge Vendors", partial: "vendor/partials/form/merged.tpl.html", name: 'merged' }
  ];

  if ($stateParams.tab === 'autopay') {
    $scope.tabs[1].active = true;
  }

  $scope.errors = [];
  // Defaults
  $scope.masks = {
    business_number: '',
    fax_number: '',
    cell_number: '',
    tax_id_number: ''
  };

  $scope.errors = [];

  $scope.refreshMask = function(attribute, maskPattern) {
    $scope.masks[attribute] = maskPattern;
  };

  $scope.clearMask = function(attribute) {
    if ($scope.vendor[attribute] === undefined || $scope.vendor[attribute].length === 0) {
      $scope.masks[attribute] = '';
    }
  };

  $scope.todayDate = function() {
    return $filter('date')(new Date(), 'yyyy-MM-dd');
  };

  var respondToSuccess = function(response) {
    $scope.$emit('refresh:currentIndividual');
    if ($stateParams.tab === 'autopay') {
     $state.transitionTo("home");
    } else {
      $state.transitionTo("vendor");
    }
  };

  var respondToFailure = function(response) {
    $scope.errors = response.data;
  };

  var checkState = function(string) {
    var states = ["AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY" ];
    return states.indexOf(angular.uppercase(string)) > -1;
  };

  $scope.$watch('vendor.state', function(newValue, oldValue) {
    if (newValue && newValue.length > 0 && $scope.vendorForm.state) {
      if (checkState(newValue)) {
        $scope.vendorForm.state.$error["states"] = false;
      } else {
        $scope.vendorForm.state.$error["states"] = true;
      }
    }
  });

  $scope.setWasFocused = function(formElement){
    formElement.$wasFocused = true;
    console.log(formElement);
  };

  $scope.save = function() {
    if ($scope.vendor.default_qb_class_id === "DEFAULT_LOCATION") {
      $scope.vendor.default_qb_class_id = null;
    }
    $scope.vendor.payment_term = parseInt($scope.vendor.payment_term, 10);
    $scope.vendor.settings.individual_id = $scope.currentIndividual.id;
    $scope.vendor.alert_settings_attributes = $scope.vendor.settings;
    $scope.vendor.$update(respondToSuccess, respondToFailure);
  };

  $scope.cancel = function() {
    $state.transitionTo("vendor");
  };

  $scope.$on('refresh:vendors', function() {
    getAllVendors();
  });

  $scope.changeStatus = function(status, invoice, collection) {
    if (collection) {
      var invoices = $filter('filter')(collection, {checked: true});
      var invoice_ids = [];
      $.map(invoices, function(item, index) {
        invoice_ids.push(item.id);
      });
      InvoicesRes.update_all({invoice_ids: invoice_ids, invoice_status: status}, function() {
        $scope.$emit('refresh:invoices');
      });
    } else {
      InvoicesRes.update({id: invoice.id}, { status: status}, function(response) {
        $scope.$emit('refresh:invoices');
      });
    }
  };

  $scope.getCategories = function() {
    return ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5'];
  };

  // $scope.setDefaultsFor = function() {

  // };

  // $scope.$on('vendor.default_qb_class_id', function(newValue, oldValue) {
  //   if (newValue) {
  //     var items = []:
  //     angular.forEach($scope.vendor.unique_line_items, function(item) {
  //       if (!item.qb_class_id) {
  //         items.push(item.id);

  //       }
  //     }):
  //   }

  // }):

  $scope.displayItem = function(description) {
    return !_.contains(["Un accounted for line items", "Tax", "Other Fees"], description);
  };

  $scope.setDefaultCategory = function($item, $model, $label, default_category){
    //implement functionality for saving default category
    $scope.default_category = $item;
  };

  if ($scope.currentIndividual) {
    if ($scope.vendor) {
      $scope.vendor.after_recieved = $scope.currentIndividual.user.default_due_date;
    }
    $scope.qb_classes = angular.copy($scope.currentIndividual.user.qb_classes);
    $scope.qb_classes.unshift({id: null, name: "Default to Delivery Location/Person"});
  }

  $scope.$watch('currentIndividual', function(newValue, oldValue) {
    if (newValue) {
      if ($scope.vendor) {
        $scope.vendor.after_recieved = newValue.default_due_date;
      }
      $scope.qb_classes = angular.copy($scope.currentIndividual.user.qb_classes);
      $scope.qb_classes.unshift({id: null, name: "Default to Delivery Location/Person"});
    }
  });

  $scope.resendPayment = function(invoice) {
    var new_invoice = new InvoicesRes(invoice);
    new_invoice.resend_payment = true;
    new_invoice.$update({});
  };

  $scope.autoPay = function(invoice) {
    $state.transitionTo('vendoredit', { vendorid: invoice.vendor_id, tab: 'autopay' });
  };

})
.directive('vendorChildrensTable', function($http) {
  return {
    restrict: 'E',
    templateUrl: 'vendor/partials/form/vendor_childrens.tpl.html',
    scope: {
      vendors: '=',
      currentVendor: '='
    },
    link: function($scope) {

      $scope.unmerge = function(vendor) {
        $scope.saving=true;
        $scope.message="Saving";
        $http.put('/api/v1/vendors/' + vendor.id + '/unmerge').success(function(res) {
          console.log('success');
          $scope.$emit('refresh:vendor');
          // do something
          $scope.saving=false;
          $scope.saved=true;
          $scope.message="Saved";
        });


      };
    }
  };
})
.directive("mergeVendors", function($http, $timeout) {
  return {
    restrict: 'E',
    templateUrl: 'vendor/partials/form/vendor_merge.tpl.html',
    scope: {
      currentVendor: '=',
      vendors: '='
    },
    link: function($scope) {
      $scope.is_merging = false;
      $scope.selected_vendor = null;
      $scope.selectedItem=null;

      $scope.startMerging = function() {
        $scope.is_merging = true;
      };

      $scope.reset = function() {
        $scope.selected_vendor = null;
        $scope.is_merging = false;
      };


      $scope.combine = function(){
        $scope.saving=true;
        $scope.message="Saving...";
        var params = { children_id: $scope.selectedItem.id };
        $http.put('/api/v1/vendors/' + $scope.currentVendor.id + '/merge', params).success(function(res) {
          $scope.saving=false;
          $scope.saved=true;
          $scope.message="Saved";
          $scope.$emit('refresh:vendor');
          $scope.$emit('refresh:vendors');
          $scope.reset();
        });
      };

      $scope.merge = function(selected) {
        $scope.selectedItem=selected;
      };


    }
  };

})

.directive('ngFocus', [function() {
  var FOCUS_CLASS = "ng-focused";
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, ctrl) {
      ctrl.$focused = false;
      element.bind('focus', function(evt) {
        element.addClass(FOCUS_CLASS);
        scope.$apply(function() {ctrl.$focused = true;});
      }).bind('blur', function(evt) {
        element.removeClass(FOCUS_CLASS);
        scope.$apply(function() {ctrl.$focused = false;});
      });
    }
  };
}])

;
