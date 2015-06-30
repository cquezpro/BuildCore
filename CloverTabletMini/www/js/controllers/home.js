angular.module('billsync.controllers')

.controller('HomeCtrl',  function($scope, $ionicModal, $http, $ionicActionSheet,$ionicSideMenuDelegate, $baseUrl, $state, $ionicPopup, $ionicLoading, pdfDelegate, $ionicPopover,$window,$rootScope) {

   var STATUES = {
    'PAID': 'mark_as_paid!',
    'READY_TO_PAY_TO_PAYMENT_QUEUE': 'ready_to_pay_to_payment_queue!',
    'MARK_AS_DELETED': 'mark_as_deleted!',
    'PAY_INVOICE' : 'pay_invoice!',
    'PAY_NOW': 'pay_now!'
  };


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

$scope.currentInvoice = null;

    //$scope.pdfUrl = 'https://billsync1.s3.amazonaws.com/invoices/pdfs/000/000/812/original/invoices-q3FNvxc1r1EF7CcArx83.pdf?1426118062';

  //$scope.viewer = PDFViewerService.Instance("viewer");
  //console.log(PDFJS.PageViewport);

  //$scope.pagePdf;

  //$scope.pageLoaded = function(url) {
    /*console.log($scope.viewer);
    console.log(PDFJS.getDocument(url));

    //ctx = canvas.getContext('2d');


    PDFJS.getDocument(url).then(function(doc) {
      console.log(doc.getPage());
      doc.getPage(1).then(function(page){
        console.log("Page rotate");
        console.log(page.rotate);
        console.log(page);
        $scope.pagePdf = page;

        var pdfViewBox = page.pageInfo.view;
        pdfPageWidth = pdfViewBox[2];
        pdfPageHeight = pdfViewBox[3];
        pdfRotate = page.rotate;

        var viewport = new PDFJS.PageViewport(pdfViewBox, 1, 180, -xOffset, -yOffset);

        var renderContext = {

          viewport : viewport
        };

        var renderTask = page.render(renderContext);

        // Wait for rendering to finish
        renderTask.promise.then(function() {
            console.log("Should render");
        });

      });
    });*/

  //};

  $scope.elems={};
  $scope.elems.detailsSection = true;
  $scope.elems.accountingSection = false;

  $scope.clickDetails = function(){
    $scope.elems.detailsSection = true;
    $scope.elems.accountingSection = false;
    $("#detailsButton").removeClass("button-outline");
    $("#accountingButton").addClass("button-outline");
    $("#accountingTab").hide();
    $("#detailsTab").show();
  };

  $scope.clickAccounting = function(){
    $scope.elems.detailsSection = false;
    $scope.elems.accountingSection = true;
    $("#detailsButton").addClass("button-outline");
    $("#accountingButton").removeClass("button-outline");
    $("#accountingTab").show();
    $("#detailsTab").hide();
    console.log($scope.currentInvoice.invoice_transactions);
    console.log($scope.selected_vendor);
  };

  $scope.showTasksButton = function(){
    if($scope.showTasks){
      $scope.showTasks=false;
    }else{
      $scope.showTasks=true;
    }
  };

  /*$scope.shade = function(event){
    console.log("Entro a hacer algo " + event.target.id);
    console.log(event);
    //$(event).css( "background-color", "red" );
    $(".invoicelinks").css("background", "white");
    $(event.currentTarget).css("background", "#d3d3d3");
  };*/

  $scope.shade = function(id){
    console.log("Entro a hacer algo " + event.target.id);
    console.log(event);
    //$(event).css( "background-color", "red" );
    $(".invoicelinks").css("background", "white");
    $(".invoicelinks").css("border", "");
    $(".invoicelinks").css("border-radius", "");
    $("#invoice_" + id).css("background", "#F2F2F2");
    $("#invoice_" + id).css("border", "2px solid #DEDEDE");
    $("#invoice_" + id).css("border-radius", "10px");    
  };

  $scope.fetchInvoices = function () {
    $scope.fetchingInvoices = true;
    $ionicLoading.show({
      template: 'Loading...'
    });
    $http.get($baseUrl + '/api/v1/dashboard')
      .success(function(invoices) {
       // var needInformation  = addCategoryToInvoices( invoices.need_information, 'Need Information' ),
       //     readyForPayment = addCategoryToInvoices( invoices.ready_for_payment, 'Ready For Payment' );

        $scope.invoicesInProcess = invoices.in_process_count;
        // $scope.invoicesInProcess = invoices[0].in_process_count;
        $scope.invoices = invoices.invoices;
        // $scope.loading = false;
        $scope.countBills();

      })
      .error(function (err, st) {
        if (st === 401)
          $window.location.reload();
      })
      .finally(function () {
        $scope.invoicesFetched = true;
        $scope.fetchingInvoices = false;
        $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
      });
  };

  function addCategoryToInvoices(invoices, category) {
    for (var i = 0; i < invoices.length; i++) {
      invoices[i].category = category;
    }
    return invoices;
  }

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
    //$state.transitionTo('app.tabs.vendorEdit', { vendorid: invoice.vendor_id, tab: 'autopay' });
    $state.transitionTo('app.tabs.vendorPaymentTerms', { vendorid: invoice.vendor_id, tab: 'autopay' });
    
  };

  /*$scope.deferDate = function(deferred_string, invoice) {
    var params = { deferred_string: deferred_string };
    $http.put($baseUrl + '/api/v1/invoices/' + invoice.id + '/defer', params).success(function(response) {
      $scope.invoices.splice($scope.invoices.indexOf(invoice), 1);
      $scope.countBills();
    });
  };*/

  $scope.deferDate = function(deferred_string, invoice) {
    var params = { deferred_string: deferred_string };
    $http.put($baseUrl + '/api/v1/invoices/' + invoice.id + '/defer', params).success(function(response) {
      $scope.invoices.splice($scope.invoices.indexOf(invoice), 1);
      $scope.countBills();
      if ($scope.currentInvoice) {
        $scope.currentInvoice = null;
      }
    });
  };

  /*$scope.approveInvoice = function (inv, kind) {
    $http.post($baseUrl + '/api/v1/invoices/' + inv.id + '/approve', { kind: kind })
      .success(function (response) {
        var id = $scope.invoices.indexOf(inv);
        $scope.invoices.splice(id, 1, response);
      });
  };*/

  $scope.approveInvoice = function (inv, kind) {
    var categoryHolder = inv.category;
     $http.post($baseUrl + '/api/v1/invoices/' + inv.id + '/approve', { kind: kind })
       .success(function (response) {
         var id = $scope.invoices.indexOf(inv);
         response.category = categoryHolder;
         $scope.invoices.splice(id, 1, response);
         $scope.currentInvoice = response;
       });
  };

  $scope.$on('devise:login', function () {
    if (!$scope.fetchingInvoices)
      $scope.fetchInvoices();
  });

  if ($scope.currentIndividual && !$scope.fetchingInvoices)
    $scope.fetchInvoices();

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
      var template = '<ion-popover-view id="actionPopup" style="z-index: 9999; position:fixed;height:70%;border-radius: 25px;border:2px solid #d3d3d3"><ion-content>';

      var arrayLinks = [];
      if ($scope.isPayableInvoice(invoice.category) && $scope.authorizeAction('pay-bill')) {
        //template =  template + '<div class="col col-50"><a class="item text-center" ng-click="clickMoreMenuItem(1)">Pay - due date</a></div>';
       
          var itemMenu = '<div class="col col-33" ng-click="clickMoreMenuItem(1)">'+
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


       if ($scope.isPayableInvoice(invoice.category) && $scope.authorizeAction('pay-bill')) {
        //template =  template + '<div class="col col-50"><a class="item text-center" ng-click="clickMoreMenuItem(1)">Pay - due date</a></div>';
       
          var itemMenu = '<div class="col col-33" ng-click="clickMoreMenuItem(11)">'+
          '<div class="row">'+
          '  <div class="col text-center">'+
          '    <i class="icon ion-paper-airplane" style="font-size:35px;"></i>'+
          '  </div>'+
          '</div>'+
          '<div class="row">'+
          '  <div class="col text-center" style="margin-left:-8px;" >'+
          '    Pay Now'+
          '  </div>'+
          '</div>'+
          '</div>';


        arrayLinks.push(itemMenu);
      }

      if ($scope.isPayableInvoice(invoice.category) && $scope.authorizeAction('auto-pay-bill')) {
        //template =  template + '<div class="col col-50"><a class="item text-center" ng-click="clickMoreMenuItem(3)">Auto Pay</a></div>';
        
          var itemMenu = '<div class="col col-33" ng-click="clickMoreMenuItem(3)">'+
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
        
          var itemMenu = '<div class="col col-33" ng-click="clickMoreMenuItem(2)">'+
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
        

          var itemMenu = '<div class="col col-33" ng-click="clickMoreMenuItem(4)">'+
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
        
          var itemMenu = '<div class="col col-33" ng-click="clickMoreMenuItem(5)">'+
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
        
          var itemMenu = '<div class="col col-33" ng-click="clickMoreMenuItem(6)">'+
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
        
          var itemMenu = '<div class="col col-33" ng-click="clickMoreMenuItem(7)">'+
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

          var itemMenu2 = '<div class="col col-33" ng-click="clickMoreMenuItem(8)">'+
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


        var itemMenu3 = '<div class="col col-33" ng-click="clickMoreMenuItem(10)">'+
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
        
          var itemMenu = '<div class="col col-33" ng-click="clickMoreMenuItem(9)">'+
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

      var itemMenuClose = '<div class="cancelClose col col-33" ng-click="closePopover()">'+
      '<div class="row">'+
      '  <div class="col text-center">'+
      '    <i class="icon">x cancel</i>'+
      '  </div>'+
      '</div>';

      arrayLinks.push(itemMenuClose);

      var newRow=0;
      for(var i = 0; i < arrayLinks.length;i++){
        if(newRow ==0){
           template = template + '<div class="row">';
           template = template + arrayLinks[i]; 
           newRow++;
        }else if(newRow == 1){
           template = template + arrayLinks[i]; 
           newRow++;
        }else if(newRow == 2){
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

  $scope.closePopover = function() {
    $scope.popover.hide();
  };

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

  $scope.setCurrentInvoice = function (invoice) {
    $("#contentColumn").show();
    $scope.currentInvoice = invoice;
    $scope.currentInvoice.vendor_attributes = $scope.currentInvoice.vendor || {};

    $scope.getInvoice(invoice);
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
    //console.log($scope.currentInvoice.pdf_url);
    //$scope.pdfUrl=$scope.currentInvoice.pdf_url;

    $scope.shade($scope.currentInvoice.id);

    $("#globalAlert").hide();
    if($scope.currentInvoice.total_alerts.length>0 && $scope.currentInvoice.total_alerts != null && $scope.currentInvoice.total_alerts != undefined){
      var alertToShow = "<strong>Alerts</strong><ul style='list-style-type:disc;margin-left:20px;'>";
      for(var i=0;$scope.currentInvoice.total_alerts.length>i;i++){
        if($scope.currentInvoice.total_alerts[i].large_text!=null){
          alertToShow = alertToShow + "<li>"  + $scope.currentInvoice.total_alerts[i].large_text + "</li>";
        }  
      }
      
      $("#globalAlert").empty();
      if(alertToShow != null){
        alertToShow = alertToShow + "</ul>";
        $("#globalAlert").append(alertToShow);
      }
      $("#globalAlert").show();
    }

     
    PDFJS.disableWorker = true;
    PDFJS.disableStream = true;
    //
    // Asynchronous download PDF as an ArrayBuffer
    //
    alert("PDFJS:" + PDFJS);
    alert("PDFJS:" + PDFJS.getDocument);
    var pdfUrl = 'https://billsync1.s3.amazonaws.com/invoices/pdfs/000/000/812/original/invoices-q3FNvxc1r1EF7CcArx83.pdf?1426118062'
   PDFJS.getDocument(pdfUrl).then(function getPdfHelloWorld(pdf) {
      alert("pdf1");
      //
      // Fetch the first page
      //
      pdf.getPage(1).then(function getPageHelloWorld(page) {
        alert("pdf2");
        var scale = 1.5;
        var viewport = page.getViewport(scale);

        //
        // Prepare canvas using PDF page dimensions
        //
        var canvas = document.getElementById('the-canvas');
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

         //
          // Render PDF page into canvas context
          //
          var renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          page.render(renderContext);
      });
    });

   
  /*  pdfDelegate
    .$getByHandle('my-pdf-container')
    .load($scope.currentInvoice.pdf_url);*/

  };


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
  $scope.m_pageCount = 2;
  //pdfDelegate.$getByHandle('my-pdf-container').getPageCount();
  
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

  $scope.getVendor = function() {
    if ($scope.currentInvoice.vendor && $scope.currentInvoice.vendor.id) {
      $http.get($baseUrl + '/api/v1/vendors/' + $scope.currentInvoice.vendor.id).success(function(response) {
        $scope.m_pageCount = pdfDelegate.$getByHandle('my-pdf-container').getPageCount();
        $scope.selected_vendor = response;
        $scope.currentInvoice.vendor = response;
      }).error(function(res) {
        console.log('error');
      });
    }
    return;
 
  };



  /*$scope.getItemsDetails = function(invoice) {
    if ($scope.currentInvoice.line_items_scoped) {
      var first_item = $scope.currentInvoice.line_items_scoped[0];
      if (first_item && (first_item.percent_difference || first_item.average_volume)) {
        return;
      }
    }
    var url = $baseUrl + '/api/v1/invoices/' + $scope.currentInvoice.id + '/line_items/details';
    $http.get(url).success(function(response) {
      invoice.line_items_scoped = response;
      $scope.currentInvoice.line_items_scoped = response;
    });
  };*/


  $scope.alertTooltip = function(alerts) {
    if (alerts.length > 0) {
      $ionicPopup.alert({
        title: 'Alerts',
        template: alerts[0].large_text
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
    var url = $baseUrl + '/api/v1/invoices/' + $scope.currentInvoice.id + '/line_items/details';
    $http.get(url).success(function(response) {
      invoice.invoice_transactions = response;
      $scope.currentInvoice.invoice_transactions = response;
      //$scope.tabs[1].disabled = ! Boolean( response.length );
          console.log("currentInvoice.invoice_transactions");
          console.log($scope.currentInvoice.invoice_transactions);

    });
  };

  $scope.showChecklist = function($event){
      $ionicPopover.fromTemplateUrl('templates/checklist.html', {
          scope: $scope,
      }).then(function(popover) {
          $scope.popover = popover;
          $scope.popover.show($event);
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



  $scope.getInvoice = function(invoice) {
      $ionicLoading.show({
        template: 'Loading...'
      });
      var invoiceUrl = $baseUrl + '/api/v1/invoices/' + invoice.id;
      
      $http.get(invoiceUrl)
        .success(function (inv) {
          $scope.currentInvoice = inv;
          $scope.getVendor();
          /*$scope.bShowAccounting =  ($scope.invoice.vendor.qb_account_number || $scope.invoice.vendor.qb_id || $scope.invoice.vendor.qb_d_id) && $scope.currentIndividual.user.synced_qb;*/
          $scope.bShowAccounting = $scope.currentIndividual.user.synced_qb;
        })
        .error(function (err, st) {
          if (st === 401)
            $window.location.reload();
        })
        .finally(function () {
          $ionicLoading.hide();
        });
  }

   $scope.openIntercom = function() {
    $ionicModal.fromTemplateUrl('templates/intercom-modal.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.InterComModal = modal;
      $scope.InterComModal.show();
    });    
  }

  $scope.sendMsg = {data: ''};
  $scope.sentMsgFlag = false;

  $scope.sendMsgwithIntercom = function() {
    //alert($scope.sendMsg.data);
    
    $ionicLoading.show({
      template: 'Sending message...'
    });

    var params = {
      "from": {
        "type": "user",
        "email": $scope.currentIndividual.email
      },
      "body" :$scope.sendMsg.data
    };

    $http.post('https://api.intercom.io/messages', params).success(function(response) {
        alert("sent");
        $scope.sentMsgFlag = true;
        $ionicLoading.hide();
       
      }).error(function(response) {
        $scope.sentMsgFlag = false;
        alert("failed");
        $ionicLoading.hide();
      });
  }

});