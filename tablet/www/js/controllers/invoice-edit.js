angular.module('billsync.controllers')

.controller('InvoiceEditCtrl', function($scope, $baseUrl, $stateParams, $http, $ionicActionSheet, $state, pdfDelegate, $ionicLoading, $ionicPopup, InvoicesManager,$window) {
	var invoiceUrl = $baseUrl + '/api/v1/invoices/' + $stateParams.id;


  $scope.showUpload = true;
  $scope.showProcessing = false;
  $scope.showPdf = false;
  $scope.collapse = true;
  $scope.existingVendorSelected = true;
  $scope.submitted = false;
  $scope.errors = [];
  $scope.vendorErrors = {groupFields: [], name: []};
  $scope.states = [
    { id: "AL", name: "AL - Alabama"},
    { id: "AK", name: "AK - Alaska"},
    { id: "AZ", name: "AZ - Arizona"},
    { id: "AR", name: "AR - Arkansas"},
    { id: "CA", name: "CA - California"},
    { id: "CO", name: "CO - Colorado"},
    { id: "CT", name: "CT - Connecticut"},
    { id: "DE", name: "DE - Delaware"},
    { id: "FL", name: "FL - Florida"},
    { id: "GA", name: "GA - Georgia"},
    { id: "HI", name: "HI - Hawaii"},
    { id: "ID", name: "ID - Idaho"},
    { id: "IL", name: "IL - Illinois"},
    { id: "IN", name: "IN - Indiana"},
    { id: "IA", name: "IA - Iowa"},
    { id: "KS", name: "KS - Kansas"},
    { id: "KY", name: "KY - Kentucky"},
    { id: "LA", name: "LA - Louisiana"},
    { id: "ME", name: "ME - Maine"},
    { id: "MD", name: "MD - Maryland"},
    { id: "MA", name: "MA - Massachusetts"},
    { id: "MI", name: "MI - Michigan"},
    { id: "MN", name: "MN - Minnesota"},
    { id: "MS", name: "MS - Mississippi"},
    { id: "MO", name: "MO - Missouri"},
    { id: "MT", name: "MT - Montana"},
    { id: "NE", name: "NE - Nebraska"},
    { id: "NV", name: "NV - Nevada"},
    { id: "NH", name: "NH - New Hampshire"},
    { id: "NJ", name: "NJ - New Jersey"},
    { id: "NM", name: "NM - New Mexico"},
    { id: "NY", name: "NY - New York"},
    { id: "NC", name: "NC - North- Carolina"},
    { id: "ND", name: "ND - North- Dakota"},
    { id: "OH", name: "OH - Ohio"},
    { id: "OK", name: "OK - Oklahoma"},
    { id: "OR", name: "OR - Oregon"},
    { id: "PA", name: "PA - Pennsylvania"},
    { id: "RI", name: "RI - Rhode Island"},
    { id: "SC", name: "SC - South Carolina"},
    { id: "SD", name: "SD - South Dakota"},
    { id: "TN", name: "TN - Tennessee"},
    { id: "TX", name: "TX - Texas"},
    { id: "UT", name: "UT - Utah"},
    { id: "VT", name: "VT - Vermont"},
    { id: "VA", name: "VA - Virginia"},
    { id: "WA", name: "WA - Washington"},
    { id: "WV", name: "WV - West Virginia"},
    { id: "WI", name: "WI - Wisconsin"},
    { id: "WY", name: "WY - Wyoming"},
    { id: "AS", name: "AS - American Samoa"},
    { id: "DC", name: "DC - District of Columbia"},
    { id: "GU", name: "GU - Guam"},
    { id: "MP", name: "MP - Northern Mariana Islands"},
    { id: "PR", name: "PR - Puerto Rico"},
    { id: "VI", name: "VI - Virgin Islands"}
  ];

  $scope.focusedInputName = '';
  $scope.new_line_item = {};
  $scope.total_item = {};

 $scope.clear = function () {
    $scope.invoice.due_date = null;
  };

  $scope.cancel = function(){
    $state.transitionTo('home');
  };


  $scope.inv_date = false;
  $scope.openDatePicker = function($event, field) {
   $event.preventDefault();
   $event.stopPropagation();

   $scope[field] = true;
  };

  $scope.dateOptions = {
   formatYear: 'yy',
   startingDay: 1
  };

  $scope.isActive = false;

  $scope.rotate = function () {
    $scope.isActive = !$scope.isActive;
  };


  $scope.createHits = function() {
    $http.post('/api/v1/invoices/create_moderations').success(function(response) {
      $scope.hit_text = 'Hits Created';
    });
  };

  $scope.masks = {
    date: '99/99/99',
    due_date: '99/99/99'
  };

  $scope.refreshMask = function(attribute, maskPattern) {
    $scope.masks[attribute] = maskPattern;
  };

  $scope.clearMask = function(attribute) {
    if ($scope.vendor[attribute] === undefined || $scope.vendor[attribute].length === 0) {
      $scope.masks[attribute] = '';
    }
  };

  $scope.scroll = 0;

  var getWorker = function(mt_worker_id) {
    $http.get('/api/v1/workers/' + mt_worker_id).success(function(response) {
      $rootScope.worker = response;
    });
  };

  var getCompanyInfo = function() {
    $http.get('/api/v1/users/company_info?hit_id=' + $stateParams.hitId).success(function(res) {
      $scope.company_info = res;
    });
  };





var countLineItemMessages = 0;
  var setGlobalAlerts = function() {
    $rootScope.globalAlerts = [];
    for(var i = 0; i < $scope.invoice.total_alerts.length; i++){
        if(($scope.invoice.total_alerts[i].category != 'new_line_item' && $scope.invoice.total_alerts[i].category != 'line_item_quantity' && $scope.invoice.total_alerts[i].category != 'line_item_price_increase')){
          $rootScope.globalAlerts.push($scope.invoice.total_alerts[i]);
        }else{
          if(countLineItemMessages===0){
            $rootScope.globalAlerts.push({category:$scope.invoice.total_alerts[i].category,
              short_text:$scope.invoice.total_alerts[i].short_text});
            countLineItemMessages++;
          }
        }
    }
  };

  var calculateUnaccounted = function() {
    if (!$scope.invoice || !$scope.invoice_fields) {
      return 0;
    }

    var notAllowed = ["Un accounted for line items", "Tax", "Other Fees"];
    var sum = 0;
    angular.forEach($scope.invoice.invoice_transactions, function(obj) {
      if (obj.default_item) {
        return;
      }
      sum = sum + parseFloat(obj.total);
    });

    value = ($scope.invoice_fields.amount_due || 0) - ( $scope.invoice_fields.tax || 0) - ($scope.invoice_fields.other_fee || 0) - sum;

    return value;
  };

  $scope.getUnacounted = function() {
    return calculateUnaccounted();
  };

  var getModeration = function(invoice_id){
    $http.get('/api/v1/invoices/' + invoice_id + '/moderations').success(function(response) {
      console.log('moderation');
      console.log(response);
    });
  };

  $scope.$watch('worker', function(newValue, oldValue) {
    if (newValue && newValue.score >= 15) {
      $scope.collapse = false;
    }
  });

  $scope.cancel = function(){
    $state.transitionTo('home');
  };

  $scope.selected = undefined;
  $scope.vendor = {};

  $scope.save = function() {
    $scope.invoice.from_user = true;
    $scope.invoice.vendor_attributes = $scope.invoice.vendor;
    $scope.invoice.transactions = $scope.invoice.invoice_transactions;
    delete $scope.invoice.vendor;
    delete $scope.invoice.invoice_transactions;
    if(!$scope.existingVendorSelected){
      delete $scope.invoice.vendor_attributes.id;
    }
    if ($scope.invoice.id) {
      InvoicesManager.updateInvoice($scope.invoice).then(respondToSuccess, respondToFailure);
    } else {
      InvoicesManager.saveInvoice($scope.invoice).then(respondToSuccess, respondToFailure);
    }
  };

  $scope.comment = {};
  $scope.submitComment = function() {
    $scope.comment.mt_worker_id = $stateParams.workerId;
    $scope.comment.mt_assignment_id = $stateParams.assignmentId;
    $scope.comment.mt_hit_id = $stateParams.hitId;
    $http.post('/api/v1/comments', $scope.comment).success(function(res) {
    }).error(function(res) {
    });
  };

  $scope.submiting = false;
  $scope.form_error = {};
  $scope.saveInvoiceModeration = function() {
    $scope.form_error = {};
    $scope.submiting = true;
    $scope.invoice.mt_worker_id     = $stateParams.workerId;
    $scope.invoice.mt_assignment_id = $stateParams.assignmentId;
    $scope.invoice.mt_hit_id        = $stateParams.hitId;
    if ($scope.invoice.state && typeof $scope.invoice.state === "object") {
      $scope.invoice.state = $scope.invoice.state[0].id;
    }
    if (canSave()) {
      $scope.invoice.$update({}, function(response) {
        $scope.submiting = false;
        submitAwsForm();
      }, function(response) {
        $scope.submiting = false;
        // $scope.form_error['server_error'] = response;
      });

    } else {
      $scope.submiting = false;
      $scope.form_error['missing_fields'] = 'Please fill the required items.';
    }
  };

  var sameAddressDetected = function() {
    if (!$scope.invoice.name || !$scope.invoice.address1) {
      return false;
    }

    if (_.findWhere($scope.company_info, {address1: angular.lowercase($scope.invoice.address1)})) {
      return true;
    }

    if (_.findWhere($scope.company_info, {name: angular.lowercase($scope.invoice.name)})) {
      return true;
    }

    return false;
  };

  $scope.displayErrors = function() {
    return !angular.equals({}, $scope.form_error);
  };

  var canSave = function() {
    if ($scope.company_info && $scope.invoice.original_invoice.address_present) {
        var result = sameAddressDetected();
      if (result) {
        $scope.form_error['same_address'] = "Looks like you have entered the Company information and not the VENDOR information.  Please enter the information of the company that is selling the products";
      }
      return !result;
    }

    if ($scope.invoice.original_invoice.vendor_present && !(/\d/.test($scope.invoice.name) || /[a-zA-Z]/.test($scope.invoice.name)) && ($scope.invoice_type === 'for_vendor' || $scope.invoice_type === 'default')) {
      return false;
    }
    if ($scope.invoice.original_invoice.address_present && missingFields(['address1','city', 'zip', 'state']) && ($scope.invoice_type === 'for_vendor' || $scope.invoice_type === 'default')) {
      return false;
    }
    if ($scope.invoice.original_invoice.amount_due_present && !$scope.invoice.amount_due && ($scope.invoice_type === 'for_amount_due' || $scope.invoice_type === 'for_marked_through' || $scope.invoice_type === 'default')) {
      return false;
    }
    if ($scope.invoice.original_invoice.bank_information_present && missingFields(['routing_number', 'bank_account_number']) && ($scope.invoice_type === 'for_vendor' || $scope.invoice_type === 'default')) {
      return false;
    }

    return true;
  };

  var missingFields = function(fields) {
    angular.forEach(fields, function(field) {
      if (!(/\d/.test($scope.invoice[field]) || /[a-zA-Z]/.test($scope.invoice[field]))) {
        return true;
      }
    });
    return false;
  };

  var submitAwsForm = function() {
    if (!$scope.submiting) {
      document.submitForm.submit();
    }
  };



   var uploadFiles = function(files){
    $scope.showProcessing = true;
    $scope.showPdf = false;
    uploadUrl = '/api/v1/invoices/handlePdfUpload';
    var formData = new FormData();
    for (var i = 0; i < files.length; i++) {
      formData.append('files[]', files[i]);
    }

    if($scope.invoice.id){
      formData.append('invoice_id', $scope.invoice.id);
    }

    $http.post(uploadUrl, formData, {
        withCredentials: true,
        headers: {'Content-Type': undefined },
        transformRequest: angular.identity
    }).success(respondToUploadSuccess).error(respondToFailure);
  };

  var respondToUploadSuccess = function(invoice) {
    setTimeout(function(){
      $http.get('/api/v1/invoices/' + invoice.id ).success(function(response) {
        if(response.pdf_file_name){
          $scope.showUpload = false;
          $scope.showProcessing = false;
          $scope.showPdf = true;
          if($state.includes('editInvoice')){
            $scope.invoice = response;
            $scope.pdf_url = response.pdf_url;
          }else{
            $state.transitionTo('editInvoice', { invoiceId: response.id });
          }
        }else{
          respondToUploadSuccess(invoice);
        }
      });
    }, 2000);
  };

  var respondToSuccess = function(reponse){
    window.history.back();
  };

  var respondToFailure = function(response) {
    $scope.submitted = true;
    $scope.checkVendorGroups();
    if($scope.invoice.vendor.name === ""){
      $scope.vendorErrors.name = ["Vendor name can't be blank"];
    }
    if (response) {
      if (response.errors) {
        $scope.errors = response.errors;
      } else {
        $scope.errors = response.data.errors;
      }
    }
  };

  $scope.getVendors = function(value, invoice_id) {
    $scope.existingVendorSelected = false;
    if (invoice_id) {
      return $http.get('../api/v1/vendors/search', { params: { name: value, invoice_id: invoice_id }})
      .then(function(response){
        return response.data;
      });
    } else {
      return $http.get('../api/v1/vendors/search', { params: { name: value, user_id: $scope.currentIndividual.user.id }})
      .then(function(response){
        return response.data;
      });
    }
  };

  $scope.setVendor = function($item) {
    $scope.errors = [];
    if ($state.current.name === "fromaws") {
      $scope.invoice.name = $item.name;
      $scope.invoice.address1 = $item.address1;
      $scope.invoice.address2 = $item.address2;
      $scope.invoice.state = $item.state;
      $scope.invoice.zip = $item.zip;
      $scope.invoice.city = $item.city;
    } else {
      $scope.existingVendorSelected = true;
      $scope.invoice.vendor = $item;
      $scope.invoice.vendor_id = $item.id;
    }
  };

  $scope.getNavStyle = function(scroll) {
    if (scroll > 100) {
      return 'pdf-controls fixed';
    } else {
      return 'pdf-controls';
    }
  };

  $scope.alreadyFilled = function(modelName, index, invoice, alias) {
    if (alias) {
      return invoice[modelName] && $scope.from_aws[alias + index].$pristine;
    } else {
      return invoice[modelName] && $scope.from_aws[modelName + index].$pristine;
    }
  };

  $scope.uploadSuccess = function(response) {
    if ($scope.selected_image === '') {
      $scope.selected_image = response.data[0];
    }

    $.each(response.data, function(index, item) {
      $scope.images.push(item);
    });
  };

  $scope.setSelected = function(image) {
    $scope.selected_image = image;
  };

  $scope.removeImage = function(image) {
    $scope.images.splice($scope.images.indexOf(image), 1);
    if ($scope.selected_image === image) {
      $scope.selected_image = $scope.images[0];
    }
  };

  $scope.openModal = function () {
    var modalInstance = $modal.open({
      templateUrl: 'line_items/modal.tpl.html',
      size: 'lg',
      controller: 'LineItemsCtrl',
      backdrop: false,
      resolve: {
        pdf_url: function () {
          return $scope.pdf_url;
        },
        showPdf: function(){
          return $scope.showPdf;
        },
        invoice: function(){
          return $scope.invoice;
        }
      }
    });

    modalInstance.result.then(function () {

    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });
  };

  $scope.getLineItems = function(value, type) {
    var params = {};
    params[type] = value;
    params.hit_id = $stateParams.hitId;
    return $http.get('/api/v1/invoices/noId/line_items/search',  {params: params} )
    .then(function(response){
      return response.data;
    });
  };

  $scope.setLineItem = function($item, $model, $label, type, obj) {
    if (type === 'code') {
      obj.code = $item.code;
      obj.description = $item.description;
    } else {
      obj.description = $item.description;
      obj.code = $item.code;
    }
  };

  $scope.checkVendorGroups = function() {
    if(validateVendorGroups()){
      $scope.errors = {};
    }else{
      $scope.vendorErrors.groupFields = ["Must have a payment method Wire or Check filled out for every vendor"];
    }
  };

  var validateVendorGroups = function(){
    return validateBankWireGroup() || validateMailGroup();
  };

  var validateBankWireGroup = function(){
    var routing = $scope.invoice.vendor.routing_number !== '';
    var bank_account_number = $scope.invoice.vendor.bank_account_number !== '';
    return routing && bank_account_number;
  };

  var validateMailGroup = function(){
    var address1 = $scope.invoice.vendor.address1 !== '';
    var city = $scope.invoice.vendor.city !== '';
    var state = $scope.invoice.vendor.state !== '';
    var zip = $scope.invoice.vendor.zip !== '';
    return address1 && city && state && zip;
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
      $http.put('/api/v1/line_items/update_all', params).success(function(response) {
        console.log('success');
      }).error(function(response) {
        console.log('error', response);
      });
    }

  };


  $scope.focusLabel = function(elementId){
    $(elementId).parent().find('label').addClass('focus');
  };

  $scope.blurLabel = function(elementId){
    $(elementId).parent().find('label').removeClass('focus');
  };

  $scope.setWasFocused = function(formElement){
    if(formElement.$dirty){
      formElement.$wasFocused = true;
    }
  };

  var checkState = function(string) {
    var states = ["AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY" ];
    return states.indexOf(angular.uppercase(string)) > -1;
  };

  /*$scope.$watch('invoice.vendor.state', function(newValue, oldValue) {
    if (newValue && newValue.length > 0) {
      if (checkState(newValue)) {
        $scope.invoiceForm.state.$setValidity("states", true);
      } else {
        $scope.invoiceForm.state.$setValidity("states", false);
      }
    }
  });*/

  $scope.focusedInputName = '';
  $scope.new_line_item = {};
  $scope.total_item = {};

  var unnacountedPresent = function(item) {
    return item.description === 'Un accounted for line items';
  };

  var getUnnacounted = function(item) {
    if (item.description === 'Un accounted for line items') {
      return item;
    }
  };

  if ($stateParams.workerId) {
    getWorker($stateParams.workerId);
    $scope.workerId = $stateParams.workerId;
  }

  $scope.addLineItem = function(fieldName){
    $scope.focusedInputName = fieldName;
    if ($scope.invoice.invoice_transactions.filter(unnacountedPresent).length === 0) {
      $scope.invoice.invoice_transactions.push($scope.new_line_item);
    } else {
      $scope.invoice.invoice_transactions.splice(-1, 0, $scope.new_line_item);
    }
    $scope.new_line_item = {};
  };

  $scope.removeLineItem = function(index){
    var item_id = $scope.invoice.invoice_transactions[index].id;
    if (item_id) {
      var url = '/api/v1/invoices/' + $scope.invoice.id + '/invoice_transactions/' + item_id;
      $http({method: 'delete', url: url}).success(function(res) {}).error(function(res) {});
    }
    $scope.invoice.invoice_transactions.splice(index, 1);
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

  $scope.form = {};

	function getInvoice () {
    $ionicLoading.show({
      template: 'Loading...'
    });
		$http.get(invoiceUrl)
	  	.success(function (inv) {
        $scope.currentInvoice = inv;
	  		$scope.invoice = inv;

        //get pdf images
        $scope.getImagesForInvoice(inv.id);

        //get vendor
        $scope.getVendor();

        try{
         pdfDelegate
            .$getByHandle('my-pdf-container')
              .load($scope.invoice.pdf_url);
              $("#pdfContainer").show();
        }catch(err){
          $("#pdfContainer").hide();
        }
	  	})
      .error(function (err, st) {
        if (st === 401)
          $window.location.reload();
      })
      .finally(function () {
        $ionicLoading.hide();
      });
	}

  $scope.saveDetails = function () {
    $ionicLoading.show({
      template: 'Saving...'
    });
    $scope.invoice.line_items_attributes = $scope.invoice.line_items;
    $scope.invoice.from_user = true;
    $scope.invoice.vendor_attributes = $scope.invoice.vendor;

    $http.put(invoiceUrl, $scope.invoice)
    	.success(function (data) {
	      if ($state.params.from === 'home')
          $state.transitionTo('app.tabs.home');
        if ($state.params.from === 'invoice')
          $state.transitionTo('app.tabs.invoice', { id: $scope.invoice.id });
        $ionicLoading.hide();

	    });
  };

  
  $scope.pageInfo=""; 
  $scope.m_pageCount = 1;
  $scope.m_pageNum = 0;
  $scope.m_pdfImgUrl = "";
  $scope.m_pdfImgUrlList = [];
  $scope.angle = 0;
  $scope.rotate = "";

  $scope.getImagesForInvoice = function(id) {
    $http.get($baseUrl + "/api/v1/invoices/" + id + '/uploads').success(function(r) {
      if(r.length > 0) {
        $scope.m_pageCount = r.length;
        $scope.m_pdfImgUrl = r[0].url;
        $scope.invoice_images = r;
        for(i=0;i<r.length;i++) {
           $scope.m_pdfImgUrlList.push(r[i].url);
        }
      }
    });
  };


  $scope.rotatePdf = function(){
    $scope.angle = ($scope.angle+90)%360;
    $scope.rotate = "rotate" + $scope.angle;
  };

  $scope.zoomIn = function(){
    pdfDelegate.$getByHandle('my-pdf-container').zoomIn();
  };

  $scope.zoomOut = function(){
    pdfDelegate.$getByHandle('my-pdf-container').zoomOut();
  };

  
  $scope.next = function(){

    $scope.m_pageNum++;
    if($scope.m_pageNum >= $scope.m_pageCount)
      $scope.m_pageNum = $scope.m_pageCount - 1;

    $scope.m_pdfImgUrl = $scope.m_pdfImgUrlList[$scope.m_pageNum];
  };

  $scope.prev = function(){
    $scope.m_pageNum--;
    if($scope.m_pageNum < 0)
      $scope.m_pageNum = 0;
    $scope.m_pdfImgUrl = $scope.m_pdfImgUrlList[$scope.m_pageNum];

  };


  $scope.getItemsDetails = function(invoice) {    
    var url = $baseUrl + '/api/v1/invoices/' + $scope.invoice.id + '/line_items/details';
    $http.get(url).success(function(response) {
      invoice.invoice_transactions = response;
      $scope.currentInvoice.invoice_transactions = response;
    });
  };


 $scope.getVendor = function() {
    if ($scope.currentInvoice.vendor && $scope.currentInvoice.vendor.id) {
      $http.get($baseUrl + '/api/v1/vendors/' + $scope.currentInvoice.vendor.id).success(function(response) {
        //$scope.m_pageCount = pdfDelegate.$getByHandle('my-pdf-container').getPageCount();
        $scope.selected_vendor = response;
        $scope.currentInvoice.vendor = response;
      }).error(function(res) {
        console.log('error');
      });
    }
    return;
 
  }
 $scope.elems={};
 $scope.elems.detailsSection = true;
 // $scope.elems.lineItemsSection = false;
 $scope.elems.accountingSection = false;

  $scope.clickDetails = function(){
    $scope.elems.detailsSection = true;
    $scope.elems.lineItemsSection = false;
    $scope.elems.accountingSection = false;
    $("#details2Button").removeClass("button-outline");
    $("#lineItems2Button").addClass("button-outline");
    $("#accounting2Button").addClass("button-outline");
    $("#accountingTab").hide();
    $("#lineItemsTab").hide();
    $("#detailsTab").show();
  };

  $scope.clickLineItems = function() {
    $scope.elems.detailsSection = false;
    $scope.elems.lineItemsSection = true;
    $scope.elems.accountingSection = false;
    $("#details2Button").addClass("button-outline");
    $("#lineItems2Button").removeClass("button-outline");
    $("#accounting2Button").addClass("button-outline");
    $("#accountingTab").hide();
    $("#lineItemsTab").show();
    $("#detailsTab").hide();
  }

  $scope.clickAccounting = function(){    
    $scope.elems.detailsSection = false;
    $scope.elems.lineItemsSection = false;
    $scope.elems.accountingSection = true;
    $("#details2Button").addClass("button-outline");
    $("#lineItems2Button").addClass("button-outline");
    $("#accounting2Button").removeClass("button-outline");
    $("#accountingTab").show();
    $("#lineItemsTab").hide();
    $("#detailsTab").hide();
  };


  $scope.alertTooltip = function(alerts) {
    if (alerts.length > 0) {
      $ionicPopup.alert({
        title: 'Alerts',
        template: alerts[0].large_text
      });
    }
  };

  getInvoice();


  $scope.focusedInputName = '';
  $scope.new_line_item = {};
  $scope.total_item = {};

  var unnacountedPresent = function(item) {
    return item.description === 'Un accounted for line items';
  };

  var getUnnacounted = function(item) {
    if (item.description === 'Un accounted for line items') {
      return item;
    }
  };

  if ($stateParams.workerId) {
    getWorker($stateParams.workerId);
    $scope.workerId = $stateParams.workerId;
  }

  $scope.addLineItem = function(fieldName){
    $scope.focusedInputName = fieldName;
    if ($scope.invoice.invoice_transactions.filter(unnacountedPresent).length === 0) {
      $scope.invoice.invoice_transactions.push($scope.new_line_item);
    } else {
      $scope.invoice.invoice_transactions.splice(-1, 0, $scope.new_line_item);
    }
    $scope.new_line_item = {};
  };

  $scope.removeLineItem = function(index){
    var item_id = $scope.invoice.invoice_transactions[index].id;
    if (item_id) {
      var url = '/api/v1/invoices/' + $scope.invoice.id + '/invoice_transactions/' + item_id;
      $http({method: 'delete', url: url}).success(function(res) {}).error(function(res) {});
    }
    $scope.invoice.invoice_transactions.splice(index, 1);
  };



  $scope.submiting = false;
  $scope.blank_submission = false;

  $scope.comment = {};
  $scope.submitComment = function() {
    $scope.comment.mt_worker_id = $stateParams.workerId;
    $scope.comment.mt_assignment_id = $stateParams.assignmentId;
    $scope.comment.mt_hit_id = $stateParams.hitId;
    $http.post($baseUrl + '/api/v1/comments', $scope.comment).success(function(res) {
    }).error(function(res) {
    });
  };

  var submitAwsForm = function() {
    if (!$scope.submiting) {
      document.submitForm.submit();
    }
  };

  $scope.setLineItem = function($item, $model, $label, type, obj) {
    if (type === 'code') {
      obj.code = $item.code;
      obj.description = $item.description;
    } else {
      obj.description = $item.description;
      obj.code = $item.code;
    }
  };

  $scope.getLineItems = function(value, type) {
    var params = {};
    params[type] = value;
    params.hit_id = $stateParams.hitId;
    return $http.get('/api/v1/invoices/noId/line_items/search',  {params: params} )
    .then(function(response){
      return response.data;
    });
  };

   $scope.saveItems = function() {
    var url = $baseUrl + '/api/v1/invoices/' + $scope.invoice.id + '/invoice_transactions';
    var params = { invoice_transactions: $scope.invoice.invoice_transactions };
    $http.post(url, params).success(function(response) {
    });
  };

  $scope.backToInvoice = function () {
     $scope.saveItems();
    $modalInstance.dismiss('cancel');
  };

  var setFocus = function(){
    if ($scope.invoice.invoice_transactions.filter(unnacountedPresent).length === 0) {
      index = $scope.invoice.invoice_transactions.length - 1;
    } else {
      index = $scope.invoice.invoice_transactions.length - 2;
    }
    $('input[name="'+ $scope.focusedInputName + index + '"]').focus();
  };

  $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
    setFocus();
  });

   var calculateUnaccounted = function() {
    if (!$scope.invoice || !$scope.invoice_fields) {
      return 0;
    }

    var notAllowed = ["Un accounted for line items", "Tax", "Other Fees"];
    var sum = 0;
    angular.forEach($scope.invoice.invoice_transactions, function(obj) {
      if (obj.default_item) {
        return;
      }
      sum = sum + parseFloat(obj.total);
    });

    value = ($scope.invoice_fields.amount_due || 0) - ( $scope.invoice_fields.tax || 0) - ($scope.invoice_fields.other_fee || 0) - sum;

    return value;
  };

  var calculateItems = function() {
    if (!$scope.invoice_fields) {
      return 0;
    }

    var sum = 0;
    angular.forEach($scope.invoice.invoice_transactions, function(obj) {
      if (obj.default_item) {
        return;
      }
      sum = sum + parseFloat(obj.total);
    });

    $scope.invoice_fields.total_line_items = sum;
    return sum;
  };

  $scope.getUnacounted = function() {
    return calculateUnaccounted();
  };

  $scope.getTotal = function() {
    return calculateItems();
  };

  $scope.getClass = function() {
    if ($scope.invoice.show_unaccounted) {
      calculateUnaccounted();
    } else {
      calculateItems();
    }
  };

  $scope.saveLineItems = function() {
    $scope.invoice.from_user = true;
    $scope.invoice.vendor_attributes = $scope.invoice.vendor;
    $scope.invoice.transactions = $scope.invoice.invoice_transactions;
    delete $scope.invoice.vendor;
    delete $scope.invoice.invoice_transactions;
    if(!$scope.existingVendorSelected){
      delete $scope.invoice.vendor_attributes.id;
    }
    if ($scope.invoice.id) {
      InvoicesManager.updateInvoice($scope.invoice).then(respondToSuccess, respondToFailure);
    } else {
      InvoicesManager.saveInvoice($scope.invoice).then(respondToSuccess, respondToFailure);
    }
  };

});