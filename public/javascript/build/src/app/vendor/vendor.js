/**
 * Vendor module
 */
angular.module( 'billsync.vendor', [
  'ui.state',
  'ngResource',
  'ui.bootstrap'
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
      }
    },
    data:{ pageTitle: 'Vendors' }
  })
  .state('vendornew', {
    url: '/vendor/new',
    views: {
      "main": {
        controller: 'VendorNewCtrl',
        templateUrl: 'vendor/new.tpl.html'
      }
    },
    data:{pageTitle: 'New Vendor'}
  })
  .state('vendoredit', {
    url: '/vendor/:vendorid/edit',
    views: {
      "main": {
        controller: 'VendorEditCtrl',
        templateUrl: 'vendor/edit.tpl.html'
      }
    },
    data:{pageTitle: 'Edit Vendor'}
  })
  ;
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'VendorCtrl', function VendorController( $scope, VendorsRes, $state ) {
  $scope.vendors = VendorsRes.query();
  $scope.newvendor = function() {
    $state.transitionTo("vendornew");
  };
  $scope.editvendor = function(vendorid) {
    $state.transitionTo('vendoredit', { vendorid: vendorid });
  };
  $scope.removevendor = function(vendor) {
    VendorsRes.remove(vendor, function(){
      $scope.vendors = VendorsRes.query();
    });     
  };
})

.controller( 'VendorNewCtrl', function VendorNewController( $scope, VendorsRes, $state ) {
  $scope.vendorsave = function() {
    VendorsRes.save($scope.vendor);
    $state.transitionTo("vendor");
  };
  $scope.vendorcancel = function() {
    $state.transitionTo("vendor");
  };
})

.controller( 'VendorEditCtrl', function VendorEditController( $scope, VendorsRes, $state, $stateParams) {
  $scope.vendor = VendorsRes.get({id: $stateParams.vendorid});
  $scope.vendorupdate = function() {
    
    var vendorcopy = angular.copy($scope.vendor);
    delete vendorcopy.id;
    delete vendorcopy.created_at;
    delete vendorcopy.updated_at;
    
    VendorsRes.update({id: $stateParams.vendorid},
      vendorcopy,
      function() {
        $state.transitionTo("vendor");
      });
  };
  $scope.vendorcancel = function() {
    $state.transitionTo("vendor");
  };
})


.factory( 'VendorsRes', function($resource){
    return $resource('../vendors/:id.json', 
      {id: '@id'}, 
      {
        update: {method: 'PUT', params: {id: '@id'}, isArray:false}
      });
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