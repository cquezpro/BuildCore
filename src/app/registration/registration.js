/**
 * BillSync module
 */
angular.module( 'billsync.registration', [
  'ui.router',
  'ui.bootstrap',
  'inputField',
  'billsync.auth-provider-config'
])

.config(['$stateProvider', function( $stateProvider ) {
  $stateProvider.state('confirmed', {
    url: '/registration/confirmed',
    views: {
      "main": {
        controller: 'RegistrationCtrl',
        templateUrl: 'registration/confirmed.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{pageTitle: 'AWS Worker Scoring'}
  })
  ;
}])

.controller('RegistrationCtrl', ['$scope', "Auth", "$state", "$modalInstance", "$modal", function($scope, Auth, $state, $modalInstance, $modal) {
  $scope.newIndividual = {password_confirmation: ""};
  $scope.errors = [];
  $scope.showPassword = true;

  $scope.masks = {
    mobile_phone: ""
  };

  var timezone = jstz.determine();
  $scope.newIndividual.timezone = timezone.name();

  $scope.submit = function() {
    $scope.newIndividual.password_confirmation = $scope.newIndividual.password;
    Auth.register($scope.newIndividual).then(successSubmitCallback, errorSubmitCallback);
  };

  $scope.showSignInModal = function () {
    if($state.$current.self.name=="dashboard"){
      window.location.reload();
    }else{
      window.location="#/dashboard";
    }

    //window.location="#/signin";
  };

  var successSubmitCallback = function(response) {
    $modalInstance.close(response);
  };

  var errorSubmitCallback = function(response) {
    var formErrors = response.data.errors,
      uniqueErrors;

    if (formErrors.email) {
      uniqueErrors = [];

      formErrors.email.forEach(function (value) {
        if (uniqueErrors.indexOf(value) === -1) {
          uniqueErrors.push(value);
        }
      });

      formErrors.email = uniqueErrors;
    }

    if (formErrors.password) {
      uniqueErrors = [];

      formErrors.password.forEach(function (value) {
        if (uniqueErrors.indexOf(value) === -1) {
          uniqueErrors.push(value);
        }
      });

      formErrors.password = uniqueErrors;
    }

    if (formErrors.business_name) {
      uniqueErrors = [];

      formErrors.business_name.forEach(function (value) {
        if (uniqueErrors.indexOf(value) === -1) {
          uniqueErrors.push(value);
        }
      });

      formErrors.business_name = uniqueErrors;
    }

    if (formErrors.mobile_phone) {
      uniqueErrors = [];

      formErrors.mobile_phone.forEach(function (value) {
        if (uniqueErrors.indexOf(value) === -1) {
          uniqueErrors.push(value);
        }
      });

      formErrors.mobile_phone = uniqueErrors;
    }

    if (formErrors.terms_of_service) {
      uniqueErrors = [];

      formErrors.terms_of_service.forEach(function (value) {
        if (uniqueErrors.indexOf(value) === -1) {
          uniqueErrors.push(value);
        }
      });

      formErrors.terms_of_service = uniqueErrors;
    }

    $scope.errors = formErrors;
  };

  $scope.refreshMask = function(attribute, maskPattern) {
    $scope.masks[attribute] = maskPattern;
  };

  $scope.clearMask = function(attribute) {
    if ($scope.newIndividual[attribute] === undefined || $scope.newIndividual[attribute].length === 0) {
      $scope.masks[attribute] = '';
    }
  };

}]);
