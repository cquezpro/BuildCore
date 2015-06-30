/**
 * invoice module
 */
angular.module( 'billsync.addresses', [
  'ngResource',
  'ui.bootstrap',
  'billsync.entities'
])

/**
 * Define the route that this module relates to, and the page template and controller that is tied to that route
 */
.config(['$stateProvider', '$provide', function ( $stateProvider, $provide) {
  $stateProvider.state('addresses', {
    url: '/address?assignmentId&workerId&hitId',
    views: {
      "main": {
        controller: 'AddressesCtrl',
        templateUrl: 'addresses/addresses.tpl.html'
      },
      "header": {
        templateUrl: 'common/header-hit.tpl.html'
      }
    },
    data:{pageTitle: 'Addresses'}
  })
  .state('editAddress', {
    url: '/address/:id',
    views: {
      "main": {
        controller: 'AddressesEditCtrl',
        templateUrl: 'addresses/multiclass.tpl.html'
      }
    },
    data:{pageTitle: 'Addresses'}
  });


}])

.controller('AddressesCtrl', ['$scope', '$state', '$stateParams', '$http', '$timeout', 'InvoicesManager', function($scope, $state, $stateParams, $http, $timeout, InvoicesManager) {
  $scope.pdf_url = null;

  InvoicesManager.getInvoice('noId', $stateParams.hitId).then(function(invoice) {
    $scope.invoice = invoice;
    $scope.pdf_url = invoice.pdf_url;
    $scope.new_address = {invoice_id: invoice.id, created_by: 1,
      addressable_id: invoice.id, addressable_type: 'Invoice'};
  });

  $scope.assignmentId = $stateParams.assignmentId;
  $scope.formErrors = '';
  $scope.submiting = false;
  $scope.blank_submission = false;
  $scope.dupes = [];
  $scope.save = function() {
    $scope.formErrors = '';
    $scope.submiting = true;
    $scope.dupes = [];
    if (!canSave() && $stateParams.assignmentId && $stateParams.workerId) {
      var api_url = '/api/v1/addresses';
      var params = {
        address: $scope.new_address,
        mt_worker_id: $stateParams.workerId,
        mt_assignment_id: $stateParams.assignmentId,
        mt_hit_id: $stateParams.hitId
      };

      $http.post(api_url, params).success(function(response) {
        $scope.submiting = false;
        submitAwsForm();
      }).error(function(response) {
        $scope.submiting = false;
        $scope.formErrors = response;
      });
    } else {
      $scope.formErrors = "Looks like you typed the vendor information not the BILL TO information";
      $scope.submiting = false;
    }
  };

  var canSave = function() {
    var fields = [{id: 'name', label: 'Ship to Name'},{id: 'address1', label: 'Address 1'}];
    angular.forEach(fields, function(field) {
      if ($scope.invoice.vendor[field.id] === $scope.new_address[field.id] && $scope.new_address[field.id] && $scope.new_address[field.id].length > 0) {
        $scope.dupes.push(field);
      }
    });

    return ($scope.dupes.length > 0);
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


}])

.controller('AddressesEditCtrl', ['$scope', '$state', '$stateParams', '$http', 'AddressRes', '$modal', function($scope, $state, $stateParams, $http, AddressRes, $modal) {

  var getAddress = function() {
    $scope.currentAddress = AddressRes.get({id: $stateParams.id});
  };

  $scope.$on('refresh:address', function() {
    getAddress();
  });

  getAddress();

  $scope.http_request = false;
  $scope.saveAddress = function() {
    $scope.http_request = true;
    $scope.currentAddress.$update(function() {
      $scope.currentAddress = new AddressRes();
      $scope.http_request = false;
      $scope.back();
    }, function(response) {
      console.log('errors');
    });
  };

}])

.directive('addressFields', function() {
  return {
    restrict: 'E',
    templateUrl: 'addresses/partials/address_fields.tpl.html',
    scope: {
      address: '='
    }
  };
})

.directive('newAddress', ["AddressRes", function(AddressRes) {
  return {
    restrict: 'E',
    templateUrl: 'addresses/partials/new_address.tpl.html',
    link: function($scope) {
      $scope.new_address = new AddressRes();

      $scope.http_request = false;

      $scope.adding_address = false;
      $scope.addAddress = function() {
        $scope.adding_address = true;
      };

      $scope.save = function() {
        $scope.http_request = true;
        $scope.new_address.$save(function() {
          $scope.currentIndividual.user.all_addresses.push($scope.new_address);
          $scope.new_address = new AddressRes();
          $scope.adding_address = false;
          $scope.http_request = false;
        }, function(response) {
          console.log('errors');
        });
      };

      $scope.cancel = function() {
        $scope.adding_address = false;
        $scope.new_address = new AddressRes();
      };
    }
  };
}])

.directive('addressesTable', ["$modal", "AddressRes", "$state", "$http", "$timeout",
  function($modal, AddressRes, $state, $http, $timeout) {
  return {
    restrict: 'E',
    templateUrl: 'addresses/partials/addresses_table.tpl.html',
    scope: {
      addresses: '=',
      parent: '=',
      qbclasses: '='
    },
    link: function($scope) {

      $scope.editAddress = function(address) {
        if (address.parent_id) {
          $scope.address = new AddressRes(address);
          $scope.openModal();
        } else {
          $state.transitionTo('editAddress', { id: address.id });
        }
      };

      $scope.openModal = function () {
        var modalInstance = $modal.open({
          templateUrl: 'common/address_modal/address_modal.tpl.html',
          size: 'lg',
          scope: $scope,
          controller: AddressModalController,
          backdrop: false
        });

        modalInstance.result.then(function () {
          $scope.address = null;

          // getAddress();
          console.log('Upload Completed!');
        }, function () {
          // getAddress();
          console.log('Modal dismissed at: ' + new Date());
        });
      };

      $scope.unmerge = function(address) {
        $http.put('/api/v1/addresses/' + address.id + '/unmerge').success(function(response) {
          $scope.addresses.splice($scope.addresses.indexOf(address), 1);
          $scope.$emit('refresh:address');
        });
      };

      $scope.resetMerge = function() {
        $scope.merging = false;
        $scope.address_list = [];
        $scope.selected_to_merge = null;
        $scope.selected_to_merge_two = null;
      };

      $scope.resetMerge();

      $scope.start_merging = function(selected) {
        $scope.resetMerge();
        $scope.merging = true;
        $scope.selected_to_merge = selected;
        angular.copy($scope.addresses, $scope.address_list);
        $scope.address_list.splice($scope.addresses.indexOf(selected), 1);
      };

      $scope.merge = function(address) {
        var id = address.id;
        var params = { parent_id: $scope.selected_to_merge.id };
        $http.put('/api/v1/addresses/' + id + '/merge', params).success(function(response) {
          $scope.addresses.splice($scope.address_list.indexOf(address), 1);
          $scope.resetMerge();
          $scope.$emit('refresh:address');
        });
      };

      $scope.cancelMerge = function() {
        $scope.resetMerge();
      };

      $scope.updateClass = function(address) {
        var id = address.id;
        var params = { qb_class_id: address.qb_class_id };
        $http.put('/api/v1/addresses/' + id, params).success(function(response) {
          console.log('response', response);
        });
      };
    }
  };
}])

.directive('addressFormated', function() {
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: 'addresses/partials/address_formated.tpl.html',
    scope: {
      address: '='
    },
    link: function($scope) {

      var array = [];

      var pushToArray = function(field) {
        if (field && $scope.address[field].length > 0) {
          array.push($scope.address[field]);
        }
      };

      pushToArray('address1');
      pushToArray('city');
      pushToArray('state');
      pushToArray('zip');

      $scope.formated_address = array.join(', ');

    }
  };
})
;
