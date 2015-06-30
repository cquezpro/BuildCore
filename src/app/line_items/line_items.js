/**
 * invoice module
 */
angular.module( 'billsync.line_items', [
  'ui.router',
  'ngResource',
  'ui.bootstrap',
  'billsync.entities'
])

/**
 * Define the route that this module relates to, and the page template and controller that is tied to that route
 */
.config(['$stateProvider', '$provide', function ( $stateProvider, $provide) {
  $stateProvider.state('line_items_aws', {
    url: '/invoice/:invoiceId/line-items-aws?assignmentId&workerId&hitId',
    views: {
      "main": {
        controller: 'LineItemsCtrl',
        templateUrl: 'line_items/line_items.tpl.html'
      },
      "header": {
        templateUrl: 'common/header-hit.tpl.html'
      }
    },
    data:{pageTitle: 'Line Items'}
  });

  // :(
  $provide.value('$modalInstance', function() {});
  $provide.value('pdf_url', function() {});
  $provide.value('showPdf', function() {});
  $provide.value('invoice', function() {});
}])

.controller('LineItemsCtrl', ['$scope', '$modalInstance', 'pdf_url', 'showPdf', 'invoice', '$state', '$stateParams', '$http', 'InvoicesManager', '$modal', '$rootScope', function($scope, $modalInstance, pdf_url, showPdf, invoice, $state, $stateParams, $http, InvoicesManager, $modal, $rootScope) {

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

  var getWorker = function(mt_worker_id) {
    $http.get('/api/v1/workers/' + mt_worker_id).success(function(response) {
      $rootScope.worker = response;
    });
  };

  if ($stateParams.workerId) {
    getWorker($stateParams.workerId);
    $scope.workerId = $stateParams.workerId;
  }

  var pushDefaultItem = function() {
    if (!$scope.invoice.default_item && $scope.invoice.invoice_transactions.filter(unnacountedPresent).length === 0) {
      var item = {
        description: 'Un accounted for line items',
        created_by: 0,
        invoice_id: $scope.invoice.id,
        automatic_calculation: true
      };
      $scope.invoice.invoice_transactions.push(item);
      $scope.total_item = $scope.invoice.invoice_transactions[$scope.invoice.invoice_transactions.indexOf(item)];
    } else {
      $scope.total_item = $scope.invoice.invoice_transactions.filter(getUnnacounted)[0];
    }
  };

  if ($stateParams.hitId) {
    $scope.assignmentId = $stateParams.assignmentId;
    $scope.can_submit = true;
    if ($scope.assignmentId === 'ASSIGNMENT_ID_NOT_AVAILABLE') {
      $scope.can_submit = false;
    }
    InvoicesManager.getInvoice('noId', $stateParams.hitId).then(function(invoice) {
      $scope.invoice = invoice;

      $scope.invoice = invoice;
      $scope.invoice_fields = {
        "amount_due": invoice.amount_due,
        "tax": invoice.tax,
        "other_fee": invoice.other_fee,
        "total_line_items": invoice.total_line_items,
        "unaccounted": invoice.unaccounted
      };
      calculateUnaccounted();
      calculateItems();

      $scope.invoice.tax = 100;
      $scope.invoice.amount_due = 100;
      $scope.invoice.other_fees = 100;
      $scope.invoice.invoice_transactions = [];

      $scope.showUpload = false;
      $scope.showPdf = true;
      $scope.itemHit = true;
      $scope.pdfPage = invoice.pdf_page;
      // $scope.pdf_url = "https://billsync1.s3.amazonaws.com/invoices/pdfs/000/006/402/original/invoices-6U1iWk9Gcz-z-msJj5qS.pdf?1430319790https://billsync1.s3.amazonaws.com/invoices/pdfs/000/006/402/original/invoices-6U1iWk9Gcz-z-msJj5qS.pdf?1430319790";

      if($scope.invoice.pdf_file_name){
        $scope.pdf_url = $scope.invoice.pdf_url;
        $scope.showUpload = false;
        $scope.showPdf = true;
        if ($scope.invoice.failed_items) {
          for (var i = $scope.invoice.failed_items; i > 0; i--) {
            $scope.invoice.invoice_transactions.push({failed: true});
          }
        }
      }
    });
  } else if(invoice) {
    $scope.pdf_url = pdf_url;
    $scope.showPdf = showPdf;
    $scope.invoice = invoice;
    pushDefaultItem();
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
  $scope.save = function() {
    $scope.submit_count_error = '';
    var invoice_total = $scope.invoice.line_items_count;
    var items_count = $scope.invoice.invoice_transactions.length;
    if ($scope.submiting) {
      return false;
    }
    if (items_count > 0 && (items_count === invoice_total || (items_count >= invoice_total - 3 && items_count <= invoice_total + 3))) {
      $scope.submiting = true;
      var api_url = '/api/v1/invoices/' + $scope.invoice.id + '/turk_transactions';
      var params = {
        turk_transactions: $scope.invoice.invoice_transactions,
        mt_worker_id: $stateParams.workerId,
        mt_assignment_id: $stateParams.assignmentId,
        mt_hit_id: $stateParams.hitId
      };

      $http.post(api_url, params).success(function(response) {
        $scope.submiting = false;
        submitAwsForm();
      }).error(function(response) {
        $scope.submit_count_error = "Add description and total to all line items.";
        $scope.submiting = false;
      });
    } else {
      var minValue = invoice_total - 3;
      minValue = minValue > 0 ? minValue : 1;
      $scope.submit_count_error = 'Count of line items should be between ' + minValue + ' and ' + (invoice_total + 3);
      $scope.blank_submission = true;
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

  var saveItems = function() {
    var url = '/api/v1/invoices/' + $scope.invoice.id + '/invoice_transactions';
    var params = { invoice_transactions: $scope.invoice.invoice_transactions };
    $http.post(url, params).success(function(response) {
    });
  };

  $scope.backToInvoice = function () {
    saveItems();
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
    calculateItems();
    value = ($scope.invoice_fields.amount_due || 0) - ( $scope.invoice_fields.tax || 0) - ($scope.invoice_fields.other_fee || 0) - $scope.invoice_fields.total_line_items;

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

}])

.directive('pdfModalfileclient', [function() {
  return {
    restrict: 'E',
    template: '<div id="scrollArea"><ng-pdf template-url="line_items/pdf_partialclient.tpl.html" canvasid="modal-pdf-canvas" scale="1"></ng-pdf></div>',
    scope: {
      pdfUrl: '=',
      openInModal: '='
    }
  };
}])

.directive('onFinishRender', ['$timeout', function ($timeout) {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      if (scope.$last === true) {
        $timeout(function () {
          scope.$emit('ngRepeatFinished');
        });
      }
    }
  };
}])
;
