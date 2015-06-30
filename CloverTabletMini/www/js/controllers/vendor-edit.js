angular.module('billsync.controllers')

.controller('VendorEditCtrl', function($scope, $baseUrl, $stateParams, $http, $ionicActionSheet, $state, $filter, $ionicLoading, $ionicPopover, $window, $ionicModal) {
	var vendorUrl = $baseUrl + '/api/v1/vendors/' + $stateParams.id,
    payment_terms = ['pay_after_bill_received', 'pay_day_of_month', 'pay_before_due_date', 'pay_after_bill_date', 'pay_after_due_date', 'pay_weekly'];

  $scope.form = {};
  $scope.days = [{id: 'sunday', label: 'Sunday'}, {id: 'monday', label: 'Monday'}, {id: 'tuesday', label: 'Tuesday'}, {id: 'wednesday', label: 'Wednesday'}, {id: 'thursday', label: 'Thursday'}, {id: 'friday', label: 'Friday'}, {id: 'saturday', label: 'Saturday'}];

  var STATUES = {
      'PAID': 8,
      'READY_TO_PAY_TO_PAYMENT_QUEUE': 'ready_to_pay_to_payment_queue!',
      'MARK_AS_DELETED': 'mark_as_deleted!',
      'PAY_INVOICE' : 'pay_invoice!',
      'PAY_NOW': 'pay_now!'
  };

	function getVendor () {
    $ionicLoading.show({
      template: 'Loading...'
    });
		$http.get(vendorUrl + "?include_config=true")
	  	.success(function (v) {
	  		$scope.vendor = v;
        $scope.vendor.invoices = $scope.vendor.vendor_invoices;
        $scope.vendor.payment_end_exceed = parseInt($scope.vendor.payment_end_exceed, 10);
        $scope.vendor.payment_end_payments = parseInt($scope.vendor.payment_end_payments, 10);
	  		$scope.vendor.after_recieved = $scope.currentIndividual.user.default_due_date;
        $scope.vendor.payment_term = payment_terms.indexOf($scope.vendor.payment_term);
		    $scope.qb_classes = angular.copy($scope.currentIndividual.user.qb_classes);
		    $scope.qb_classes.unshift({id: null, name: "Default to Delivery Location/Person"});
        getAllVendors();
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
    $http.put(vendorUrl, $scope.vendor)
    	.success(function (data) {
        $state.transitionTo('app.tabs.vendors');
	    });
  };

  $scope.todayDate = function() {
    return $filter('date')(new Date(), 'yyyy-MM-dd');
  };

  $scope.updateItems = function(description, value, type) {
    var params = {
      vendor_id: $scope.vendor.id,
      description: description
    };

    params[type] = value;

    $http.put($baseUrl + '/api/v1/line_items/update_all', params).success(function(response) {
      console.log('success');
    }).error(function(response) {
      console.log('error', response);
    });
  };

  $scope.isEditableInvoice = function (status) {
    return 0 <= ["need_information"].indexOf(status);
  };

  $scope.isPayableInvoice = function (status) {
    return 0 <= ["ready_for_payment"].indexOf(status);
  };

  $scope.editInvoice = function(invoice) {
    $state.transitionTo('app.tabs.invoiceEdit', { id: invoice.id, from: 'home' });
  };

  $scope.changeInvoiceStatus = function (status, invoice) {
    if ( ! invoice ) {
      return console.error('You must supply an ID');
    }

    var params = { ids: [invoice.id] };
    invoice.animateOut = true;

    $http.put($baseUrl + '/api/v1/invoices/aasm_events?status=' + STATUES[status], params)
      .success(function(response) {
        var id = $scope.invoices.indexOf(invoice);
        $scope.invoices.splice(id, 1);
        if ( $scope.currentInvoice === invoice ) {
          $scope.currentInvoice = null;
        }

        // $scope.countBills();
      });
  };

  $scope.autoPay = function(invoice) {
    $state.transitionTo('vendoredit', { vendorid: invoice.vendor_id, tab: 'autopay' });
  };

  $scope.deferDate = function(deferred_string, invoice) {
    var params = { deferred_string: deferred_string };
    $http.put($baseUrl + '/api/v1/invoices/' + invoice.id + '/defer', params).success(function(response) {
      $scope.invoices.splice($scope.invoices.indexOf(invoice), 1);
      // $scope.countBills();
      if ($scope.currentInvoice) {
        $scope.currentInvoice = null;
      }
    });
  };



 $scope.tempInvoice;
  $scope.clickMoreMenuItem = function(index){
         if (index === 1)
            $scope.changeInvoiceStatus('PAY_INVOICE', $scope.tempInvoice);
            $scope.popover.hide();
          if (index === 11)
            $scope.changeInvoiceStatus('PAY_NOW', $scope.tempInvoice);
            $scope.popover.hide();
          if (index === 2)
            $scope.changeInvoiceStatus('PAID', $scope.tempInvoice);
            $scope.popover.hide();
          if (index === 3)
            $scope.autoPay($scope.tempInvoice);
            $scope.popover.hide();
          if (index === 4)
            $scope.approveInvoice($scope.tempInvoice, 'accountant');
            $scope.popover.hide();
          if (index === 5)
            $scope.approveInvoice($scope.tempInvoice, 'regular');
            $scope.popover.hide();
          if (index === 6)
            $scope.editInvoice($scope.tempInvoice);
            $scope.popover.hide();
          if (index === 7)
            $scope.deferDate('TOMORROW', $scope.tempInvoice);
            $scope.popover.hide();
          if (index === 8)
            $scope.deferDate('NEXT_WEEK', $scope.tempInvoice);
            $scope.popover.hide();
          if (index === 9)
            $scope.deferDate('NEXT_MONTH', $scope.tempInvoice);
            $scope.popover.hide();
          if (index === 10)
            $scope.changeInvoiceStatus('MARK_AS_DELETED', $scope.tempInvoice);
            $scope.popover.hide();
          return true;
  };

$scope.showActions = function (invoice,$event) {
      $scope.tempInvoice = invoice;
      var template = '<ion-popover-view id="actionPopup" style="z-index: 9999; position:fixed;height:70%;border-radius: 25px;border:2px solid #d3d3d3; opacity: 1;"><ion-content>';

      var arrayLinks = [];
      if ($scope.isPayableInvoice(invoice.category) && $scope.authorizeAction('pay-bill')) {
        //template =  template + '<div class="col col-50"><a class="item text-center" ng-click="clickMoreMenuItem(1)">Pay - due date</a></div>';
       
          var itemMenu = '<div class="col col-50" ng-click="clickMoreMenuItem(1)">'+
          '<div class="row">'+
          '  <div class="col text-center">'+
          '    <i class="icon ion-cash" style="font-size:35px;"></i>'+
          '  </div>'+
          '</div>'+
          '<div class="row">'+
          '  <div class="col text-center" style="margin-left:-8px;" >'+
          '    Pay - due date'+
          '  </div>'+
          '</div>'+
          '</div>';


        arrayLinks.push(itemMenu);
      }

      if ($scope.isPayableInvoice(invoice.category) && $scope.authorizeAction('auto-pay-bill')) {
        //template =  template + '<div class="col col-50"><a class="item text-center" ng-click="clickMoreMenuItem(3)">Auto Pay</a></div>';
        
          var itemMenu = '<div class="col col-50" ng-click="clickMoreMenuItem(3)">'+
          '<div class="row">'+
          '  <div class="col text-center">'+
          '    <i class="icon ion-loop" style="font-size:35px;"></i>'+
          '  </div>'+
          '</div>'+
          '<div class="row">'+
          '  <div class="col text-center" style="margin-left:-8px;" >'+
          '    Auto Pay'+
          '  </div>'+
          '</div>'+
          '</div>';


        arrayLinks.push(itemMenu);


        //arrayLinks.push('<div class="col col-50"><a class="item text-center" ng-click="clickMoreMenuItem(3)">Auto Pay</a></div>');
      }    

      if ($scope.authorizeAction('mark-as-paid-bill')) {
        //template =  template + '<div class="col col-50"><a class="item text-center" ng-click="clickMoreMenuItem(2)">Mark paid</a></div>';
        
          var itemMenu = '<div class="col col-50" ng-click="clickMoreMenuItem(2)">'+
          '<div class="row">'+
          '  <div class="col text-center">'+
          '    <i class="icon ion-folder" style="font-size:35px;"></i>'+
          '  </div>'+
          '</div>'+
          '<div class="row">'+
          '  <div class="col text-center" style="margin-left:-8px;" >'+
          '    Mark paid'+
          '  </div>'+
          '</div>'+
          '</div>';


        arrayLinks.push(itemMenu);

        //arrayLinks.push('<div class="col col-50"><a class="item text-center" ng-click="clickMoreMenuItem(2)">Mark paid</a></div>');
      }

  

      if ($scope.authorizeAction('approve-bill-as-accountant') && !invoice.accountant_approved) {
        //template =  template + '<div class="col col-50"><a class="item text-center" ng-click="clickMoreMenuItem(4)">Accountant Approved</a></div>';
        

          var itemMenu = '<div class="col col-50" ng-click="clickMoreMenuItem(4)">'+
          '<div class="row">'+
          '  <div class="col text-center">'+
          '    <i class="icon ion-checkmark-round" style="font-size:35px;"></i>'+
          '  </div>'+
          '</div>'+
          '<div class="row">'+
          '  <div class="col text-center" style="margin-left:-8px;" >'+
          '    Accountant Approved'+
          '  </div>'+
          '</div>'+
          '</div>';


        arrayLinks.push(itemMenu);


        //arrayLinks.push('<div class="col col-50"><a class="item text-center" ng-click="clickMoreMenuItem(4)">Accountant Approved</a></div>');
      }

      if ($scope.authorizeAction('approve-bill') && !invoice.regular_approved) {
        //template =  template + '<div class="col col-50"><a class="item text-center" ng-click="clickMoreMenuItem(5)">Approved</a></div>';
        
          var itemMenu = '<div class="col col-50" ng-click="clickMoreMenuItem(5)">'+
          '<div class="row">'+
          '  <div class="col text-center">'+
          '    <i class="icon ion-checkmark-round" style="font-size:35px;"></i>'+
          '  </div>'+
          '</div>'+
          '<div class="row">'+
          '  <div class="col text-center" style="margin-left:-8px;" >'+
          '    Approved'+
          '  </div>'+
          '</div>'+
          '</div>';


        arrayLinks.push(itemMenu);


        //arrayLinks.push('<div class="col col-50"><a class="item text-center" ng-click="clickMoreMenuItem(5)">Approved</a></div>');
      }

      if ($scope.authorizeAction('update-edit-bill')) {
        //template =  template + '<div class="col col-50"><a class="item text-center" ng-click="clickMoreMenuItem(6)">Edit</a></div>';
        
          var itemMenu = '<div class="col col-50" ng-click="clickMoreMenuItem(6)">'+
          '<div class="row">'+
          '  <div class="col text-center">'+
          '    <i class="icon ion-edit" style="font-size:35px;"></i>'+
          '  </div>'+
          '</div>'+
          '<div class="row">'+
          '  <div class="col text-center" style="margin-left:-8px;" >'+
          '    Edit'+
          '  </div>'+
          '</div>'+
          '</div>';


        arrayLinks.push(itemMenu);


        //arrayLinks.push('<div class="col col-50"><a class="item text-center" ng-click="clickMoreMenuItem(6)">Edit</a></div>');
      }

      if ($scope.authorizeAction('delay-bill')) {
        //template =  template + '<div class="col col-50"><a class="item text-center" ng-click="clickMoreMenuItem(7)">Defer...</a></div>';
        
          var itemMenu = '<div class="col col-50" ng-click="clickMoreMenuItem(7)">'+
          '<div class="row">'+
          '  <div class="col text-center">'+
          '    <i class="icon ion-clock " style="font-size:35px;"></i>'+
          '  </div>'+
          '</div>'+
          '<div class="row">'+
          '  <div class="col text-center" style="margin-left:-8px;" >'+
          '    Defer - Tomorrow'+
          '  </div>'+
          '</div>'+
          '</div>';


          arrayLinks.push(itemMenu);

          var itemMenu2 = '<div class="col col-50" ng-click="clickMoreMenuItem(8)">'+
          '<div class="row">'+
          '  <div class="col text-center">'+
          '    <i class="icon ion-archive" style="font-size:35px;"></i>'+
          '  </div>'+
          '</div>'+
          '<div class="row">'+
          '  <div class="col text-center" style="margin-left:-8px;" >'+
          '    Defer - Next Week'+
          '  </div>'+
          '</div>'+
          '</div>';


        arrayLinks.push(itemMenu2);


        var itemMenu3 = '<div class="col col-50" ng-click="clickMoreMenuItem(10)">'+
          '<div class="row">'+
          '  <div class="col text-center">'+
          '    <i class="icon ion-calendar" style="font-size:35px;"></i>'+
          '  </div>'+
          '</div>'+
          '<div class="row">'+
          '  <div class="col text-center" style="margin-left:-8px;" >'+
          '    Defer Next Month '+
          '  </div>'+
          '</div>'+
          '</div>';


        arrayLinks.push(itemMenu3);


        //arrayLinks.push('<div class="col col-50"><a class="item text-center" ng-click="clickMoreMenuItem(7)">Defer...</a></div>');

      }

      if ($scope.authorizeAction('delete-bill')) {
        //template =  template + '<div class="col col-50"><a class="item text-center">Delete</a></div>';
        
          var itemMenu = '<div class="col col-50" ng-click="clickMoreMenuItem(9)">'+
          '<div class="row">'+
          '  <div class="col text-center">'+
          '    <i class="icon ion-trash-a" style="font-size:35px;"></i>'+
          '  </div>'+
          '</div>'+
          '<div class="row">'+
          '  <div class="col text-center" style="margin-left:-8px;" >'+
          '    Delete'+
          '  </div>'+
          '</div>'+
          '</div>';


        arrayLinks.push(itemMenu);

        //arrayLinks.push('<div class="col col-50"><a class="item text-center">Delete</a></div>');

      }

      var itemMenuClose = '<div class="col col-50" ng-click="closePopover()">'+
      '<div class="row">'+
      '  <div class="col text-center">'+
      '    <i class="icon ion-close" style="font-size:35px;"></i>'+
      '  </div>'+
      '</div>'+
      '<div class="row">'+
      '  <div class="col text-center" style="margin-left:-8px;" >'+
      '    Cancel'+
      '  </div>'+
      '</div>'+
      '</div>';

      arrayLinks.push(itemMenuClose);

      var newRow=0;
      for(var i = 0; i < arrayLinks.length;i++){
        if(newRow==0){
           template = template + '<div class="row">';
           template = template + arrayLinks[i]; 
           newRow++;
        }else if(newRow == 1){
          template = template + arrayLinks[i];
          template = template + "</div>";
          newRow=0;
        }
        
      }

      console.log(template);

      template = template + '</ion-content></ion-popover-view>';
      
      $scope.popover =  $ionicPopover.fromTemplate(template, {
        scope: $scope
      });
      $scope.popover.show($event);
  };



/*
  $scope.showActions = function (invoice) {
    var actionButtons = $scope.isPayableInvoice(invoice.category) ? [
         { text: 'Pay' },
         { text: 'Mark paid' },
         { text: 'Auto Pay' },
         { text: 'Edit' },
         { text: 'Defer...' }
        ] : [
         { text: 'Mark paid' },
         { text: 'Edit' },
         { text: 'Defer...' }
        ],
      buttonIndex = $scope.isPayableInvoice(invoice.category) ? {
        pay: 0,
        markPaid: 1,
        autoPay: 2,
        edit: 3,
        deferPay: 4
      } : {
        markPaid: 0,
        edit: 1,
        deferPay: 2
      };
      
      hideSheet = $ionicActionSheet.show({
        buttons: actionButtons,
        destructiveText: 'Delete',
        titleText: 'Bill Actions',
        cancelText: 'Cancel',
        cancel: function() {
            // add cancel code..
          },
        buttonClicked: function(index) {
          if (buttonIndex.hasOwnProperty('pay') && index === buttonIndex.pay)
            $scope.changeInvoiceStatus('PAY_INVOICE', invoice);
          if (index === buttonIndex.markPaid)
            $scope.changeInvoiceStatus('PAID', invoice);
          if (buttonIndex.autoPay && index === buttonIndex.autoPay)
            $scope.autoPay(invoice);
          if (index === buttonIndex.edit)
            $scope.editInvoice(invoice);
          if (index === buttonIndex.deferPay)
            showDeferActions(invoice);
          return true;
        },
        destructiveButtonClicked: function () {
          $scope.changeInvoiceStatus('MARK_AS_DELETED', invoice);
          return true;
        }
      });
  };*/

  showDeferActions = function (invoice) {
    var hideDeferSheet = $ionicActionSheet.show({
        buttons: [
         { text: 'Tomorrow' },
         { text: 'Next Week' },
         { text: 'Next Month' }
        ],
        titleText: 'Defer to:',
        cancelText: 'Cancel',
        cancel: function() {
            // add cancel code..
          },
        buttonClicked: function(index) {
          if (index === 0)
            $scope.deferDate('TOMORROW', invoice);
          if (index === 1)
            $scope.deferDate('NEXT_WEEK', invoice);
          if (index === 2)
            $scope.deferDate('NEXT_MONTH', invoice);
          return true;
        }
      });
  };

  $scope.startMerging = function() {
    $scope.is_merging = true;
  };

  $scope.reset = function() {
    $scope.selected_vendor = null;
    $scope.is_merging = false;
  };

  $scope.merge = function(selected) {
    var params = { children_id: selected.id };
    $http.put($baseUrl + '/api/v1/vendors/' + $scope.vendor.id + '/merge', params).success(function(res) {
      $scope.$emit('refresh:vendor');
      $scope.$emit('refresh:vendors');
      $scope.reset();
    });
  };

  $scope.unmerge = function(vendor) {
    $http.put($baseUrl + '/api/v1/vendors/' + vendor.id + '/unmerge').success(function(res) {
      $scope.$emit('refresh:vendor');
    });
  };

  $scope.showLineItem = function (li, idx) {
    $scope.currentLI = li;
    $scope.currentLI.idx = idx;
    $ionicModal.fromTemplateUrl('templates/line-items-modal.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.lineItemModal = modal;
      $scope.lineItemModal.show();
    });
  };

  $scope.$on('refresh:vendors', function() {
    getAllVendors();
  });

  $scope.$on('refresh:vendor', function() {
    getVendor();
  });

  getAllVendors = function() {
    if ($scope.vendor) {
      $http.get($baseUrl + '/api/v1/vendors/' + $scope.vendor.id + '/only_parents').success(function(response) {
        $scope.vendors = response;
      });
    }
  };

  getVendor();
});