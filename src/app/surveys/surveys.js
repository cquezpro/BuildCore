/**
 * invoice module
 */
angular.module( 'billsync.surveys', [
  'ui.router',
  'ngResource',
  'ui.bootstrap',
  'billsync.entities'
])

/**
 * Define the route that this module relates to, and the page template and controller that is tied to that route
 */
.config(['$stateProvider', '$provide', function ( $stateProvider, $provide) {
  $stateProvider.state('surveys', {
    url: '/surveys?assignmentId&workerId&hitId',
    views: {
      "main": {
        controller: 'SurveysCtrl',
        templateUrl: 'surveys/surveys.tpl.html'
      },
      "header": {
        templateUrl: 'common/header-hit.tpl.html'
      }
    },
    data:{pageTitle: 'Survey'}
  });

}])

.controller('SurveysCtrl', ['$scope', '$state', '$stateParams', '$http', '$timeout', '$location', '$anchorScroll', '$rootScope', function($scope, $state, $stateParams, $http, $timeout, $location, $anchorScroll, $rootScope) {

  $scope.surveys = [];
  $scope.current_survey = null;
  $scope.pdf_url = null;

  $('#bill-affix').affix({
    offset: {
      top: 65
    }
  });

  $('[data-toggle="tooltip"]').tooltip();

  $http.get('/api/v1/surveys', { params: {hit_id: $stateParams.hitId}}).success(function(response) {
    angular.forEach(response, function(invoice, index) {
      var addresses = invoice.user_addresses;
      addresses.unshift({id: "NOT_LISTED", string: "Not Listed"});
      var invoice_pages = [];
      for (var i = 1; i <= invoice.pdf_total_pages; i++) {
        invoice_pages.push({invoice_id: invoice.id, page_number: i});
      }

      $scope.surveys.push({invoice: invoice, invoice_id: invoice.id, index: index,
        user_addresses: addresses, locations_feature: invoice.locations_feature,
        pdf_total_pages: invoice.pdf_total_pages, invoice_pages: invoice_pages
      });
    });
    $scope.current_survey = $scope.surveys[0];
    $timeout(function() {
      $scope.pdf_url = $scope.current_survey.invoice.pdf_url;
    }, 10);
  });

  $scope.setSelected = function(index) {
    $scope.pdf_url = null;
    $scope.current_survey = $scope.surveys[index];
    $location.hash('scroll-top');
    $anchorScroll();

    $timeout(function() {
      $scope.pdf_url = $scope.current_survey.invoice.pdf_url;
    }, 10);
  };

  $scope.assignmentId = $stateParams.assignmentId;
  $scope.formErrors = '';
  $scope.submiting = false;
  $scope.blank_submission = false;
  $scope.can_submit = true;
  if ($scope.assignmentId === 'ASSIGNMENT_ID_NOT_AVAILABLE') {
    $scope.can_submit = false;
  }

  var getWorker = function(mt_worker_id) {
    $http.get('/api/v1/workers/' + mt_worker_id).success(function(response) {
      $rootScope.worker = response;
    });
  };

  if ($stateParams.workerId) {
    getWorker($stateParams.workerId);
    $scope.workerId = $stateParams.workerId;
  }

  $scope.save = function() {
    $scope.formErrors = '';
    if ($scope.answeredAll()) {
      $scope.submiting = true;
      var api_url = '/api/v1/surveys';
      var params = {
        surveys: $scope.surveys,
        mt_worker_id: $stateParams.workerId,
        mt_assignment_id: $stateParams.assignmentId,
        mt_hit_id: $stateParams.hitId
      };

      $http.post(api_url, params).success(function(response) {
        $scope.submiting = false;
        submitAwsForm();
      }).error(function(response) {
        $scope.submiting = false;
      });

    } else {
      $scope.formErrors = 'Some of the inputs are missing, please check all the invoices.';
    }
  };

  var surveyFields = ['is_invoice', 'vendor_present', 'address_present', 'amount_due_present', 'is_marked_through'];
  // line_items_count
  $scope.answeredAll = function() {
    var errors = [];
    angular.forEach($scope.surveys, function(survey) {
      angular.forEach(survey.invoice_pages, function(page) {
        var number = parseInt(page.line_items_count, 10);
        if (typeof page.line_items_count !== "string" && !isNaN(number) && number >= 0) {
          errors.push(true);
        }
      });

      angular.forEach(surveyFields, function(field) {
        if (survey[field] === undefined) {
          errors.push(true);
        }
      });
    });

    var is_invalid = errors.length > 0;
    return !is_invalid;
  };

  $scope.comment = {};
  $scope.submitComment = function() {
    if (!$scope.comment.body) {
      return;
    }

    $scope.comment.mt_hit_id = $stateParams.hitId;
    $scope.comment.mt_worker_id = $stateParams.workerId;
    $scope.comment.mt_assignment_id = $stateParams.assignmentId;
    $http.post('/api/v1/comments', $scope.comment).success(function(res) {
    }).error(function(res) {
    });
  };

  var submitAwsForm = function() {
    if (!$scope.submiting) {
      document.submitForm.submit();
    }
  };

}])
;
