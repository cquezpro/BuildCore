angular.module('billsync.controllers')

.controller('InvoiceCtrl', function($scope, $baseUrl, $stateParams, $http, $ionicActionSheet, $state, $ionicLoading, $ionicPopup, $window) {
	var invoiceUrl = $baseUrl + '/api/v1/invoices/' + $stateParams.id,
		STATUES = {
      'PAID': 8,
      'READY_TO_PAY_TO_PAYMENT_QUEUE': 'ready_to_pay_to_payment_queue!',
      'MARK_AS_DELETED': 'mark_as_deleted!',
      'PAY_INVOICE' : 'pay_invoice!'
    };


  $scope.form = {};
  $scope.bShowAccounting = true;

	function getInvoice () {
    $ionicLoading.show({
      template: 'Loading...'
    });
		$http.get(invoiceUrl)
	  	.success(function (inv) {
	  		$scope.invoice = inv;
        $scope.getVendor();
        /*$scope.bShowAccounting =  ($scope.invoice.vendor.qb_account_number || $scope.invoice.vendor.qb_id || $scope.invoice.vendor.qb_d_id) && $scope.currentIndividual.user.synced_qb;*/
        $scope.bShowAccounting = $scope.currentIndividual.user.synced_qb;
        /*var ga = $("#globalAlert");
        ga.hide();
        if($scope.invoice.total_alerts.length>0 && $scope.invoice.total_alerts != null && $scope.invoice.total_alerts != undefined){
          var alertToShow = "<ul style='list-style-type:disc;margin-left:20px;'>";
          for(var i=0;$scope.invoice.total_alerts.length>i;i++){
            if($scope.invoice.total_alerts[i].large_text!=null){
              alertToShow = alertToShow + "<li>"  + $scope.invoice.total_alerts[i].large_text + "</li>";
            }  
          }
          
          ga.empty();
          if(alertToShow != null){
            alertToShow = alertToShow + "</ul>";
            ga.append(alertToShow);
          }
          ga.show();
        }*/

	  	})
      .error(function (err, st) {
        if (st === 401)
          $window.location.reload();
      })
      .finally(function () {
        $ionicLoading.hide();
      });
	}

  $scope.showAccounting = function(invoice) {
    return true;
    if ( invoice ) {
      if (!invoice.vendor) {
        alert("false");
        return false;
      }
      console.log("qb_id " + invoice.vendor.qb_id);
      console.log("qb_d_id " + invoice.vendor.qb_d_id);
      console.log("qb_account_number " + invoice.vendor.qb_account_number);
      alert((invoice.vendor.qb_account_number || invoice.vendor.qb_id || invoice.vendor.qb_d_id) && $scope.currentIndividual.user.synced_qb);
      return (invoice.vendor.qb_account_number || invoice.vendor.qb_id || invoice.vendor.qb_d_id) && $scope.currentIndividual.user.synced_qb;
    } else {
      alert("false");
      return false;
    }
  }

  $scope.alertTooltip = function(alerts) {
    if (alerts.length > 0) {
      $ionicPopup.alert({
        title: 'Alerts',
        cssClass: 'yellowAlert',
        template: alerts[0].large_text
      });
    }
  };

  $scope.updateInvoice = function (invoice) {
    $scope.form.missingFields.$setPristine();
    $scope.invoice.from_user = true;

    $scope.invoice.vendor_attributes = $scope.invoice.vendor;

    $http.put(invoiceUrl, $scope.invoice)
    	.success(function (data) {
	      $scope.invoice = data;

	    });
  };

  $scope.editInvoice = function(invoice) {
    $state.transitionTo('app.tabs.invoiceEdit', { id: invoice.id, from: 'invoice' });
  };

  $scope.changeInvoiceStatus = function (status, invoice) {
    if ( ! invoice ) {
      return console.error('You must supply an ID');
    }

    var params = { ids: [invoice.id] };
    invoice.animateOut = true;

    $http.put($baseUrl + '/api/v1/invoices/aasm_events?status=' + STATUES[status], params)
      .success(function(response) {
        $state.transitionTo('app.tabs.home');
      });
  };

  $scope.autoPay = function(invoice) {
    //$state.transitionTo('vendoredit', { vendorid: invoice.vendor_id, tab: 'autopay' });
    $state.transitionTo('app.tabs.vendorPaymentTerms', { vendorid: invoice.vendor_id, tab: 'autopay' });
  };

  deferDate = function(deferred_string, invoice) {
    var params = { deferred_string: deferred_string };
    $http.put($baseUrl + '/api/v1/invoices/' + invoice.id + '/defer', params)
    	.success(function(response) {
	      $state.transitionTo('app.tabs.home');
	    });
  };

  /*$scope.approveInvoice = function (inv, kind) {
    $http.post($baseUrl + '/api/v1/invoices/' + inv.id + '/approve', { kind: kind })
      .success(function (response) {
        $scope.invoice = response;
      });
  };*/

  $scope.approveInvoice = function (inv, kind) {
    var categoryHolder = inv.category;
    $http.post($baseUrl + '/api/v1/invoices/' + inv.id + '/approve', { kind: kind })
      .success(function (response) {
         var id = $scope.invoices.indexOf(inv);
         response.category = categoryHolder;
         $scope.invoices.splice(id, 1, response);
        $scope.invoice = response;
      });
  };


  $scope.showDeferActions = function (invoice) {
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
            deferDate('TOMORROW', invoice);
          if (index === 1)
            deferDate('NEXT_WEEK', invoice);
          if (index === 2)
            deferDate('NEXT_MONTH', invoice);
          return true;
        }
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

  $scope.checkPDFURL = function (pdfUrl) {
    try {
     var url = window.location.protocol + '//' + window.location.host,
      second = (pdfUrl.search('/system') >= 0) ? url : '';
      pdfUrl = second + pdfUrl.match('.+.pdf')[0];
      return (pdfUrl.match(/\.(pdf)$/) != null);
    }catch(err) {
      //console.log("pdfUrl is null");
      return false;
    }
  }

  getInvoice();

  $scope.showDetails=true;
  $scope.clickDetails = function(){
    $scope.showDetails=true;
  };

  $scope.clickAccounting = function(){
    $scope.showDetails=false;
  };

  $scope.getVendor = function() {
    if ($scope.invoice.vendor && $scope.invoice.vendor.id) {
      $http.get($baseUrl + '/api/v1/vendors/' + $scope.invoice.vendor.id).success(function(response) {
        $scope.selected_vendor = response;
        $scope.invoice.vendor = response;
      }).error(function(res) {
        console.log('error');
      });
    }
    return;
  };

});