/**
 * invoice module
 */
angular.module( 'billsync.invoice', [
  'ui.router',
  'ngResource',
  'ui.bootstrap',
  'billsync.entities'
])

/**
 * Define the route that this module relates to, and the page template and controller that is tied to that route
 */
.config(['$stateProvider', function( $stateProvider ) {
  $stateProvider.state('newInvoice', {
    url: '/invoice/new',
    views: {
      "main": {
        controller: 'InvoiceCtrl',
        templateUrl: 'invoice/form.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{pageTitle: 'New Invoice'}
  })
  .state('editInvoice', {
    url: '/invoice/:invoiceId/edit/:editLineItems',
    views: {
      "main": {
        controller: 'InvoiceCtrl',
        templateUrl: 'invoice/form.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{pageTitle: 'Edit Invoice'}
  })
  .state('fromaws', {
    url: '/invoice/fromaws?assignmentId&workerId&hitId',
    views: {
      "main": {
        controller: 'InvoiceCtrl',
        templateUrl: 'invoice/from_aws.tpl.html'
      },
      "header": {
        templateUrl: 'common/header-hit.tpl.html'
      }
    },
    data:{pageTitle: 'AWS Invoice'}
  })
  .state('sample', {
    url: '/invoice/sample',
    views: {
      "main": {
        controller: 'SampleCtrl',
        templateUrl: 'invoice/partials/form/sampleinvoices.tpl.html'
      }
    },
    data:{pageTitle: 'AWS Invoice Help'}
  })
  .state('score', {
    url: '/invoice/score?workerId',
    views: {
      "main": {
        controller: 'ScoreCtrl',
        templateUrl: 'invoice/partials/form/workerscoring.tpl.html'
      }
    },
    data:{pageTitle: 'AWS Worker Scoring'}
  })
  ;
}])

.controller('ScoreCtrl', ['$scope', '$http', '$stateParams', '$rootScope', function($scope, $http, $stateParams, $rootScope) {
  $rootScope.worker = false;

  if ($stateParams.workerId) {
    $http.get('/api/v1/workers/' + $stateParams.workerId).success(function(response) {
      $rootScope.worker = response;
    });
  }

  $scope.workerLevel = function(level) {
    if (!$rootScope.worker) {
      return false;
    }

    return $rootScope.worker.level === level;
  };

}])

.controller( 'InvoiceCtrl', [
  '$scope', 'InvoicesManager', '$state', '$stateParams', '$http',
  'InvoiceModerationRes', '$location', '$timeout', '$filter', '$modal', '$rootScope',
  function( $scope, InvoicesManager, $state, $stateParams, $http,
    InvoiceModerationRes, $location, $timeout, $filter, $modal, $rootScope) {

  $timeout(function () {
    $('[data-toggle="tooltip"]').tooltip();
  }, 1000);


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

  /*$scope.missingGeneralInfo = function(tabTitle){
    console.log($scope.invoice);
    if($scope.invoice.vendor === null){
       return true;
    }else{
      if((!$scope.invoice.vendor.routing_number && !$scope.invoice.vendor.bank_account_number && !$scope.invoice.vendor.address1) || (!$scope.invoice.vendor.routing_number && !$scope.invoice.vendor.bank_account_number && !$scope.invoice.vendor.state) || (!$scope.invoice.vendor.routing_number && !$scope.invoice.vendor.bank_account_number && !$scope.invoice.vendor.city) || (!$scope.invoice.vendor.routing_number && !$scope.invoice.vendor.bank_account_number && !$scope.invoice.vendor.state) || (!$scope.invoice.vendor.routing_number && !$scope.invoice.vendor.bank_account_number && !$scope.invoice.vendor.zip) || ()){
        return true;
      }
    }

    return false;
  };*/

  $scope.$watch("currentIndividual", function(newValue, oldValue) {
    if (newValue && newValue !== oldValue) {
      $scope.qb_classes = angular.copy($scope.currentIndividual.user.qb_classes);
      $scope.qb_classes.unshift({id: null, name: 'Undetermined Location/Class'});
    }
  });

  if ($stateParams.invoiceId) {

    InvoicesManager.getInvoice($stateParams.invoiceId).then(function(invoice) {

      $scope.invoice = invoice;
      $scope.invoice_fields = {
        "amount_due": invoice.amount_due,
        "tax": invoice.tax,
        "other_fee": invoice.other_fee,
        "total_line_items": invoice.total_line_items,
        "unaccounted": invoice.unaccounted
      };
      calculateUnaccounted();

      setGlobalAlerts();
      $scope.currentInvoice = invoice;
      if ($scope.invoice.vendor) {
        $scope.selected = $scope.invoice.vendor.name;
      }
      if($scope.invoice.pdf_file_name){
        $scope.pdf_url = $scope.invoice.pdf_url;
        $scope.showUpload = false;
        $scope.showPdf = true;
      }

      if ( $stateParams.editLineItems ) {
        $scope.openModal();
      }
      $scope.tabs = [
        { heading: "General", partial: "invoice/partials/form/general_tab.tpl.html", name: "general",active:true, show:true},
        { heading: "Line Items", partial: "line_items/line_items_table_edit.tpl.html", name: "line_items_table",show:true },
        { heading: "Accounting",partial: "dashboard/partials/accounting_tab.tpl.html",name:"accounting",show:true }
      ];

    });
  } else if($state.current.name === "fromaws") {
    $scope.assignmentId = $stateParams.assignmentId;
    $scope.can_submit = true;
    if ($scope.assignmentId === 'ASSIGNMENT_ID_NOT_AVAILABLE') {
      $scope.can_submit = false;
    }
    InvoiceModerationRes.query({hitId: $stateParams.hitId}, function(response) {
      if (response.length > 0) {
        getCompanyInfo();
        $scope.invoice = response[0];
        $scope.currentInvoice = $scope.invoice;
        $scope.pdf_url = $scope.invoice.pdf_url;
        $scope.showPdf = $scope.invoice.pdf_url ? true : false;
        $scope.invoice_type = $scope.invoice.moderation_type;
        $scope.selected_vendor = $scope.invoice.vendor;
        // $scope.selected_vendor.expense_accounts = $scope.currentIndividual.user.expense_accounts;
        if ($stateParams.workerId) {
          getWorker($stateParams.workerId);
          $scope.workerId = $stateParams.workerId;
        }
      }
    });
  } else {

    $scope.tabs = [
      { heading: "General", partial: "invoice/partials/form/general_tab.tpl.html", name: "general",active:true,show:true },
      { heading: "Line Items", partial: "line_items/line_items_table_edit.tpl.html", name: "line_items_table",show:false },
      {heading: "Accounting",partial: "dashboard/partials/accounting_tab.tpl.html",name:"accounting",show:false }
    ];

    InvoicesManager.getInvoice().then(function(invoice){
      $scope.invoice = invoice;
      $scope.invoice.date = $filter('date')(new Date(), 'MM/dd/yy');
      // $scope.invoice.date = $filter('date')(new Date(), 'MM/dd/yy');
      $scope.invoice.vendor = {name:"", routing_number: "", bank_account_number: "", address1: "", city: "", state: "", zip: ""};
      $scope.invoice.line_items = [{}];
      $scope.vendorErrors.groupFields = ["Must have a payment method (Wire/Check filled out for every vendor"];
      $scope.showUpload = true;
      $scope.showPdf = false;
      $scope.pdf_url = $scope.invoice.pdf_url;
    });
  }
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
    delete $scope.invoice.vendor;
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

  /*var fileUploadInit = function(){
    holder = document.getElementById("dropBox");
    holder.ondragover = function () { $(this).toggleClass('hover'); return false; };
    holder.ondragend = function () { $(this).toggleClass('hover'); return false; };
    holder.ondrop = function (e) {
      $(this).toggleClass('hover');
      e.preventDefault();
      uploadFiles(e.target.files || e.dataTransfer.files);
    };
    document.getElementById("fileUploadButton").addEventListener('change', function(e){
      uploadFiles(e.target.files || e.dataTransfer.files);
    });
    holder = document.getElementById("appendDropBox");
    holder.ondragover = function () { $(this).toggleClass('hover'); return false; };
    holder.ondragend = function () { $(this).toggleClass('hover'); return false; };
    holder.ondrop = function (e) {
      $(this).toggleClass('hover');
      e.preventDefault();
      uploadFiles(e.target.files || e.dataTransfer.files);
    };
    document.getElementById("appendFileUploadButton").addEventListener('change', function(e){
      uploadFiles(e.target.files || e.dataTransfer.files);
    });
  };

  if ($state.includes('editInvoice') || $state.includes('newInvoice')) {
    fileUploadInit();
  }*/

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

  // $(window).on('scroll', function(){
  //   if(!$scope.collapse){
  //     if($(this).scrollTop() > 450 && $(this).scrollTop() < 1170){
  //       $(".fixedPdf").addClass('fix');
  //       $(".fixedPdf").css('top', '20px');
  //     }else if($(this).scrollTop() > 1200){
  //       $(".fixedPdf").removeClass('fix');
  //       $(".fixedPdf").css('top', '830px');
  //     }else{
  //       $(".fixedPdf").removeClass('fix');
  //       $(".fixedPdf").css('top', '20px');
  //     }
  //   }else{
  //     if($(this).scrollTop() > 205 && $(this).scrollTop() < 930){
  //       $(".fixedPdf").addClass('fix');
  //       $(".fixedPdf").css('top', '20px');
  //     }else if($(this).scrollTop() > 930){
  //       $(".fixedPdf").removeClass('fix');
  //       $(".fixedPdf").css('top', '830px');
  //     }else{
  //       $(".fixedPdf").removeClass('fix');
  //       $(".fixedPdf").css('top', '20px');
  //     }
  //   }
  // });

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



//'ng-invalid ng-invalid-required': ! invoice.vendor.routing_number && ! invoice.vendor.bank_account_number && ! invoice.vendor.address1


}])

.directive('pdfFileclient', [function() {
  return {
    restrict: 'E',
    template: '<div id="scrollArea"><ng-pdf template-url="invoice/partials/form/pdf_partialclient.tpl.html" canvasid="pdf-canvas" scale="1"></ng-pdf></div>',
    scope: {
      pdfUrl: '=',
      openInModal: '='
    }
  };
}])

;
