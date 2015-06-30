angular.module('billsync.controllers')

.controller('HomeCtrl', function($scope, $rootScope, $http, $ionicActionSheet, $baseUrl, $state, $ionicLoading, $ionicPopover, $window, $ionicScrollDelegate) {
   var STATUES = {
    'PAID': 'mark_as_paid!',
    'READY_TO_PAY_TO_PAYMENT_QUEUE': 'ready_to_pay_to_payment_queue!',
    'MARK_AS_DELETED': 'mark_as_deleted!',
    'PAY_INVOICE' : 'pay_invoice!',
    'PAY_NOW': 'pay_now!'
  };

  $rootScope.valueBadge = 0;
  $scope.invoicesFetched = false;
  
  $scope.fetchInvoices = function () {
    $scope.fetchingInvoices = true;

    if (!$scope.invoices) {
      $ionicLoading.show({
        template: 'Loading...'
      });
    }
    
    $http.get($baseUrl + '/api/v1/dashboard')
      .success(function(invoices) {
       // var needInformation  = addCategoryToInvoices( invoices.need_information, 'Need Information' ),
       //     readyForPayment = addCategoryToInvoices( invoices.ready_for_payment, 'Ready For Payment' );

        $scope.invoicesInProcess = invoices.in_process_count;
        // $scope.invoicesInProcess = invoices[0].in_process_count;
      
        $scope.allInvoices = invoices.invoices;
        $scope.stat = {
          paid_last_seven_days: invoices.paid_last_seven_days,
          pending_next_7_days: invoices.pending_next_7_days,
          pending_next_14_days: invoices.pending_next_14_days,
          pending_next_month: invoices.pending_next_month
        };

        $scope.page = 0;

        $scope.invoices = $scope.allInvoices.slice($scope.page * 20, ($scope.page + 1) * 20);

        if ($scope.invoices.length >= 20) {
          $scope.nextPage = true;
        }
        else {
          $scope.nextPage = false;
        }

        // $scope.loading = false;
        if (!$scope.invoicesFetched || $scope.invoicesFetched === false) {
          $scope.countBills();
        }
      })
      .error(function (err, st) {
        if (st === 401) {
          $scope.nextPage = false;
        }
      })
      .finally(function () {
        $scope.invoicesFetched = true;
        $scope.fetchingInvoices = false;
        $ionicLoading.hide();
      });
  };

  $scope.fetchMoreInvoices = function () {
    $scope.page++;

    $scope.invoices = $scope.allInvoices.slice(($scope.page - 1) * 20, ($scope.page + 1) * 20);

    if ($scope.allInvoices.slice($scope.page * 20, ($scope.page + 1) * 20).length < 20) {
      $scope.nextPage = false;
    }
    else {
      $scope.nextPage = true;
    }

    $ionicScrollDelegate.scrollBy(0, -2200);

    $scope.$broadcast('scroll.infiniteScrollComplete');
  };

  $scope.addPreviousBills = function () {
    if ($scope.page > 1) {
      $scope.page--;

      $scope.invoices = $scope.allInvoices.slice(($scope.page - 1) * 20, ($scope.page + 1) * 20);      
      // $ionicScrollDelegate.scrollBy(0, 2200);
      $scope.nextPage = true;
    }
    $scope.$broadcast('scroll.refreshComplete');
  };

  function addCategoryToInvoices(invoices, category) {
    for (var i = 0; i < invoices.length; i++) {
      invoices[i].category = category;
    }
    return invoices;
  }

  $scope.form = {};
  $scope.form.filterText = "";
  $scope.vendornameFilter = function(item) {
    if($scope.form.filterText.length > 0 && (item.vendor === null || item.vendor === undefined || item.vendor.name === null))
        return false;
    if($scope.form.filterText.length < 1)
        return true;
    if($scope.form.filterText.length > 0 && item.vendor.name === null)
        return false;
    //console.log(item.vendor.name);
    var a = $scope.form.filterText.toLowerCase();
    var b = item.vendor.name.toLowerCase();
    if(b.indexOf(a) === -1)
      return false;
    return true;
  };

  $scope.isEditableInvoice = function (category) {
    return 0 <= ["Need Information"].indexOf(category);
  };

  $scope.isPayableInvoice = function (category) {
    return 0 <= ["Ready For Payment"].indexOf(category);
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

        $scope.countBills();
      });
  };

  $scope.autoPay = function(invoice) {
    $state.transitionTo('app.tabs.vendorPaymentTerms', { vendorid: invoice.vendor_id, tab: 'autopay' });
  };

  $scope.deferDate = function(deferred_string, invoice) {
    var params = { deferred_string: deferred_string };
    $http.put($baseUrl + '/api/v1/invoices/' + invoice.id + '/defer', params).success(function(response) {
      $scope.invoices.splice($scope.invoices.indexOf(invoice), 1);
      $scope.countBills();
    });
  };

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

  $scope.$on('devise:login', function () {
    if (!$scope.fetchingInvoices) {
      $scope.fetchInvoices();
    }
  });

  $scope.clickMoreMenuItem = function(index){
        
         if (index === 1) {
            $scope.changeInvoiceStatus('PAY_INVOICE', $scope.tempInvoice);
            $scope.popover.hide();
          }
          if (index === 11) {
            $scope.changeInvoiceStatus('PAY_NOW', $scope.tempInvoice);
            $scope.popover.hide();
          }
          if (index === 2) {
            $scope.changeInvoiceStatus('PAID', $scope.tempInvoice);
            $scope.popover.hide();
          }
          if (index === 3) {
            $scope.autoPay($scope.tempInvoice);
            $scope.popover.hide();
          }
          if (index === 4){
            $scope.approveInvoice($scope.tempInvoice, 'accountant');
            $scope.popover.hide();
          }
          if (index === 5){
            $scope.approveInvoice($scope.tempInvoice, 'regular');
            $scope.popover.hide();
          }
          if (index === 6){
            $scope.editInvoice($scope.tempInvoice);
            $scope.popover.hide();
          }
          if (index === 7) {
            $scope.deferDate('TOMORROW', $scope.tempInvoice);
            $scope.popover.hide();
          }
          if (index === 8){
            $scope.deferDate('NEXT_WEEK', $scope.tempInvoice);
            $scope.popover.hide();
          }
          if (index === 9){
            $scope.deferDate('NEXT_MONTH', $scope.tempInvoice);
            $scope.popover.hide();
          }
          if (index === 10) {
            $scope.changeInvoiceStatus('MARK_AS_DELETED', $scope.tempInvoice);
            $scope.popover.hide();
          }
          return true;
  };

  $scope.showActions = function (invoice,$event) {
      $scope.tempInvoice = invoice;
      var template = '<ion-popover-view id="actionPopup" style="z-index: 9999; position:fixed;height:70%;border-radius: 25px;border:2px solid #d3d3d3"><ion-content>',
        itemMenu;

      var arrayLinks = [];
      if ($scope.isPayableInvoice(invoice.category) && $scope.authorizeAction('pay-bill') && $scope.currentIndividual.user.verified) {
    
          itemMenu = '<div class="col col-50" ng-click="clickMoreMenuItem(1)">'+
          '<div class="row">'+
          '  <div class="col text-center">'+
          '    <i class="icon ion-cash" style="font-size:35px;"></i>'+
          '  </div>'+
          '</div>'+
          '<div class="row">'+
          '  <div class="col text-center" style="margin-left:0px;" >'+
          '    pay - due date'+
          '  </div>'+
          '</div>'+
          '</div>';


        arrayLinks.push(itemMenu);
      }


      if ($scope.isPayableInvoice(invoice.category) && $scope.authorizeAction('pay-bill') && $scope.currentIndividual.user.verified) {

          itemMenu = '<div class="col col-50" ng-click="clickMoreMenuItem(11)">'+
          '<div class="row">'+
          '  <div class="col text-center">'+
          '    <i class="icon ion-paper-airplane" style="font-size:35px;"></i>'+
          '  </div>'+
          '</div>'+
          '<div class="row">'+
          '  <div class="col text-center" style="margin-left:0px;" >'+
          '    pay now'+
          '  </div>'+
          '</div>'+
          '</div>';


        arrayLinks.push(itemMenu);
      }

      if ($scope.authorizeAction('mark-as-paid-bill') && $scope.currentIndividual.user.verified) {
          itemMenu = '<div class="col col-50" ng-click="clickMoreMenuItem(2)">'+
          '<div class="row">'+
          '  <div class="col text-center">'+
          '    <i class="icon ion-folder" style="font-size:35px;"></i>'+
          '  </div>'+
          '</div>'+
          '<div class="row">'+
          '  <div class="col text-center" style="margin-left:0px;" >'+
          '    mark paid'+
          '  </div>'+
          '</div>'+
          '</div>';


        arrayLinks.push(itemMenu);
      }


      if ($scope.isPayableInvoice(invoice.category) && $scope.authorizeAction('auto-pay-bill') && $scope.authorizeAction('pay-authorized-bill')) {
        
          itemMenu = '<div class="col col-50" ng-click="clickMoreMenuItem(3)">'+
          '<div class="row">'+
          '  <div class="col text-center">'+
          '    <i class="icon ion-loop" style="font-size:35px;"></i>'+
          '  </div>'+
          '</div>'+
          '<div class="row">'+
          '  <div class="col text-center" style="margin-left:0px;" >'+
          '    auto pay'+
          '  </div>'+
          '</div>'+
          '</div>';

        arrayLinks.push(itemMenu);

      }    


      if ($scope.authorizeAction('approve-bill-as-accountant') && !invoice.accountant_approved) {

          itemMenu = '<div class="col col-50" ng-click="clickMoreMenuItem(4)">'+
          '<div class="row">'+
          '  <div class="col text-center">'+
          '    <i class="icon ion-checkmark-round" style="font-size:35px;"></i>'+
          '  </div>'+
          '</div>'+
          '<div class="row">'+
          '  <div class="col text-center" style="margin-left:0px;" >'+
          '    accountant approve'+
          '  </div>'+
          '</div>'+
          '</div>';


        arrayLinks.push(itemMenu);

      }

      if ($scope.authorizeAction('approve-bill') && !invoice.regular_approved) {
        
          itemMenu = '<div class="col col-50" ng-click="clickMoreMenuItem(5)">'+
          '<div class="row">'+
          '  <div class="col text-center">'+
          '    <i class="icon ion-checkmark-round" style="font-size:35px;"></i>'+
          '  </div>'+
          '</div>'+
          '<div class="row">'+
          '  <div class="col text-center" style="margin-left:0px;" >'+
          '    approve'+
          '  </div>'+
          '</div>'+
          '</div>';

        arrayLinks.push(itemMenu);

      }

      if ($scope.authorizeAction('update-edit-bill')) {
          itemMenu = '<div class="col col-50" ng-click="clickMoreMenuItem(6)">'+
          '<div class="row">'+
          '  <div class="col text-center">'+
          '    <i class="icon ion-edit" style="font-size:35px;"></i>'+
          '  </div>'+
          '</div>'+
          '<div class="row">'+
          '  <div class="col text-center" style="margin-left:0px;" >'+
          '    edit'+
          '  </div>'+
          '</div>'+
          '</div>';


        arrayLinks.push(itemMenu);
      }

      if ($scope.authorizeAction('delay-bill')) {
        
          itemMenu = '<div class="col col-50" ng-click="clickMoreMenuItem(7)">'+
          '<div class="row">'+
          '  <div class="col text-center">'+
          '    <i class="icon ion-clock " style="font-size:35px;"></i>'+
          '  </div>'+
          '</div>'+
          '<div class="row">'+
          '  <div class="col text-center" style="margin-left:0px;" >'+
          '    defer - tomorrow'+
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
          '  <div class="col text-center" style="margin-left:0px;" >'+
          '    defer - next week'+
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
          '  <div class="col text-center" style="margin-left:0px;" >'+
          '    defer next month '+
          '  </div>'+
          '</div>'+
          '</div>';

        arrayLinks.push(itemMenu3);

      }

      if ($scope.authorizeAction('delete-bill')) {

          itemMenu = '<div class="col col-50" ng-click="clickMoreMenuItem(9)">'+
          '<div class="row">'+
          '  <div class="col text-center">'+
          '    <i class="icon ion-trash-a" style="font-size:35px;"></i>'+
          '  </div>'+
          '</div>'+
          '<div class="row">'+
          '  <div class="col text-center" style="margin-left:0px;" >'+
          '    delete'+
          '  </div>'+
          '</div>'+
          '</div>';

        arrayLinks.push(itemMenu);
      }

      var itemMenuClose = '<div class="cancelClose col col-50" ng-click="closePopover()">'+
      '<div class="row">'+
      '  <div class="col text-center">'+
      '    <i class="icon">x cancel</i>'+
      '  </div>'+
      '</div>';

      arrayLinks.push(itemMenuClose);

      var newRow=0;
      for(var i = 0; i < arrayLinks.length;i++){
        if(newRow === 0){
           template = template + '<div class="row">';
           template = template + arrayLinks[i]; 
           newRow++;
        }else if(newRow == 1){
          template = template + arrayLinks[i];
          template = template + "</div>";
          newRow=0;
        }        
      }

      //console.log(template);

      template = template + '</ion-content></ion-popover-view>';
      
      $scope.popover =  $ionicPopover.fromTemplate(template, {
        scope: $scope
      });
      $scope.popover.show($event);
  };

  $scope.closePopover = function() {
    $scope.popover.hide();
  };

  $scope.showChecklist = function($event){
      //var template = ' <ion-popover-view><ion-header-bar><h1 class="title">My Popover Title</h1></ion-header-bar><ion-content>Hello!</ion-content></ion-popover-view>';
      /*$scope.popover =  $ionicPopover.fromTemplateUrl('templates/checklist.html', {
        scope: $scope
      }).then(function(popover) {
        $scope.popover.show($event);
      });*/

      $ionicPopover.fromTemplateUrl('templates/checklist.html', {
          scope: $scope,
      }).then(function(popover) {
          $scope.popover = popover;
          $scope.popover.show($event);
      });

  };

/*
  $scope.showActions = function (invoice) {
    var actionButtons = [],
      actionSheetOptions = {
        buttons: actionButtons,
        titleText: 'Invoice Actions',
        cancelText: 'Cancel',
        cancel: function() {
            // add cancel code..
          },
        buttonClicked: function(index) {
          if (actionButtons[index].text === 'Pay')
            $scope.changeInvoiceStatus('PAY_INVOICE', invoice);
          if (actionButtons[index].text === 'Mark paid')
            $scope.changeInvoiceStatus('PAID', invoice);
          if (actionButtons[index].text === 'Auto Pay')
            $scope.autoPay(invoice);
          if (actionButtons[index].text === 'Accountant Approved')
            $scope.approveInvoice(invoice, 'accountant');
          if (actionButtons[index].text === 'Approved')
            $scope.approveInvoice(invoice, 'regular');
          if (actionButtons[index].text === 'Edit')
            $scope.editInvoice(invoice);
          if (actionButtons[index].text === 'Defer...')
            showDeferActions(invoice);
          return true;
        },
        destructiveButtonClicked: function () {
          $scope.changeInvoiceStatus('MARK_AS_DELETED', invoice);
          return true;
        }
      };
      
      if ($scope.isPayableInvoice(invoice.category) && $scope.authorizeAction('pay-bill')) {
        actionButtons.push({ text: 'Pay' });
      }

      if ($scope.authorizeAction('mark-as-paid-bill')) {
        actionButtons.push({ text: 'Mark paid' });
      }

      if ($scope.isPayableInvoice(invoice.category) && $scope.authorizeAction('auto-pay-bill')) {
        actionButtons.push({ text: 'Auto Pay' });
      }      

      if ($scope.authorizeAction('approve-bill-as-accountant') && !invoice.accountant_approved) {
        actionButtons.push({ text: 'Accountant Approved' });
      }

      if ($scope.authorizeAction('approve-bill') && !invoice.regular_approved) {
        actionButtons.push({ text: 'Approved' });
      }

      if ($scope.authorizeAction('update-edit-bill')) {
        actionButtons.push({ text: 'Edit' });
      }

      if ($scope.authorizeAction('delay-bill')) {
        actionButtons.push({ text: 'Defer...' });
      }

      if ($scope.authorizeAction('delete-bill')) {
        actionSheetOptions.destructiveText = 'Delete';
      }

      var hideSheet = $ionicActionSheet.show(actionSheetOptions);
  };
*/
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

  $scope.getCompletationPersent2 = function () {
    var percent = 0;
    angular.forEach($rootScope.checklists, function (list) {
      if ( list.done ) {
        percent++;
      }
      return true;
    });
    return 8 - percent;
  };

});