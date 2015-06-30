angular.module( 'billsync.profile', [
  'ui.router',
  'ui.bootstrap',
  'billsync.entities'
])

/**
 * Define the route that this module relates to, and the page template and controller that is tied to that route
 */
.config(function config( $stateProvider ) {
  $stateProvider.state( 'profile', {
    url: '/profiles/profile',
    views: {
      "main": {
        controller: 'ProfilesCtrl',
        templateUrl: 'profile/profiles.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{ pageTitle: 'profile' }
  });
  $stateProvider.state( 'settings', {
    url: '/profiles/settings',
    views: {
      "main": {
        controller: 'ProfilesCtrl',
        templateUrl: 'profile/profiles.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{ pageTitle: 'profile' }
  });
  $stateProvider.state( 'accounting', {
    url: '/profiles/accounting',
    views: {
      "main": {
        controller: 'ProfilesCtrl',
        templateUrl: 'profile/profiles.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{ pageTitle: 'profile' }
  });
  $stateProvider.state( 'individuals', {
    url: '/profiles/individuals',
    views: {
      "main": {
        controller: 'ProfilesCtrl',
        templateUrl: 'profile/profiles.tpl.html'
      },
      "header": {
        templateUrl: 'common/header.tpl.html'
      },
      "sidebar": {
        templateUrl: 'common/sidebar.tpl.html'
      }
    },
    data:{ pageTitle: 'profile' }
  });
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'ProfilesCtrl', function ProfilesController( $scope, CurrentIndividualRes, $state, Auth, $http, EmailRes, NumberRes, $rootScope, $modalInstance, $modal, $timeout) {

  var signaturePad = null;

  function initSignaturePad (img) {
    var canvas = document.querySelector("canvas");

    signaturePad = new SignaturePad(canvas, {
      penColor: "rgb(51, 102, 153)"
    });

    if (img) {
      signaturePad.fromDataURL(img);
    }

  }

  $scope.clearSignature = function () {
    signaturePad.clear();
  };

  $scope.forms = {};

  $scope.submitted = false;

  $scope.emails   = [];
  $scope.numbers  = [];
  // $scope.errors = [];

  $scope.select_times = [{id: 0, label: '00 AM' },{id: 1, label: '1 AM' },{id: 2, label: '2 AM' },{id: 3, label: '3 AM' },{id: 4, label: '4 AM' },{id: 5, label: '5 AM' },{id: 6, label: '6 AM' },{id: 7, label: '7 AM' },{id: 8, label: '8 AM' },{id: 9, label: '9 AM' },{id: 10, label: '10 AM' },{id: 11, label: '11 AM' },{id: 12, label: '12 PM' },{id: 13, label: '1 PM' },{id: 14, label: '2 PM' },{id: 15, label: '3 PM' },{id: 16, label: '4 PM' },{id: 17, label: '5 PM' },{id: 18, label: '6 PM' },{id: 19, label: '7 PM' },{id: 20, label: '8 PM' },{id: 21, label: '9 PM' },{id: 22, label: '10 PM' },{id: 23, label: '11 PM' }];

  var getCurrentIndividual = function(other_individual) {
    Auth.currentUser().then(function(individual) {
      var new_individual = other_individual || individual;
      $scope.currentIndividual = new CurrentIndividualRes(new_individual);
      angular.forEach($scope.currentIndividual.user.emails, function(email) {
        $scope.emails.push(new EmailRes(email));
      });
      angular.forEach($scope.currentIndividual.user.numbers, function(number) {
        $scope.numbers.push(new EmailRes(number));
      });
      $timeout(function () {
        initSignaturePad(individual.user.signature);
      });
    });
  };

  getCurrentIndividual();

  var fetchCurrentIndividual = function() {
    $http.get('/api/v1/users/some-user').success(function(response) {
      getCurrentIndividual(response);
    });
  };

  $scope.$on('refresh:individual_instance', function() {
    fetchCurrentIndividual();
  });

  $scope.$on('refresh:address', function() {
    $http.get('/api/v1/users/some-user').success(function(response) {
      getCurrentIndividual(response);
    });
  });

  $scope.refreshIndividual = function() {
    fetchCurrentIndividual();
  };

  $scope.disconnect = function() {
    $http.put('/api/v1/settings/disconnect').success(function(res) {
      fetchCurrentIndividual();
    }).error(function(res) {
      console.log('error!');
    })
    ;
  };

  $scope.tabs = [
    { heading: "Profile", partial: "profile/partials/form/profile.tpl.html", name: "profile", href: "#/profiles/profile", active: $state.$current.name === "profile" },
    { heading: "Email/Text Settings", partial: "profile/partials/form/settings.tpl.html", name: "settings", href: "#/profiles/settings", active: $state.$current.name === "settings" },
    { heading: "Accounting", partial: "profile/partials/form/accounting.tpl.html", name: "accounting", href: "#/profiles/accounting", active: $state.$current.name === "accounting" },
    { heading: "Manage Users", partial: "profile/partials/form/individuals.tpl.html", name: "individuals", href: "#/profiles/individuals", active: $state.$current.name === "individuals" }
  ];

  $scope.masks = {
    business_number: "",
    fax_number: "",
    mobile_number: "",
    tax_id_number: ""
  };

  var respondToSuccess = function(response) {
    Auth._currentUser = response;
    $scope.$emit('refresh:currentIndividual', {individual: response});
    try {
      $scope.mainErrors = [];
      $scope.back();
    } catch(err){
      console.log('error on:', err);
    }
  };

  var respondToFailure = function(response) {
    $scope.submitted = true;
    $scope.mainErrors = response.data.errors;
    console.log("issues");
  };

  $scope.save = function() {
    $scope.currentIndividual.user.signature = signaturePad.toDataURL();
    $scope.currentIndividual.emails = $scope.emails;
    $scope.currentIndividual.numbers = $scope.numbers;

    var individual = new CurrentIndividualRes({individual: $scope.currentIndividual});
    delete individual.individual.permissions;
    delete individual.individual.authorization_scopes;
    individual.$update(respondToSuccess, respondToFailure);
  };

  $scope.sending_request = false;
  $scope.errors = {};

  $scope.savePassword = function() {
    $scope.sending_request = true;
    $scope.individualParams = {
      current_password: $scope.currentIndividual.current_password,
      password: $scope.currentIndividual.password,
      password_confirmation: $scope.currentIndividual.password_confirmation
    };
    $http.post('/api/v1/settings/password', $scope.individualParams).success(function(response) {
      $scope.errors = {};
      $scope.reinitializeIndividualPasswordForm();
    }).error(function(response) {
      $scope.reinitializeIndividualPasswordForm();
      $scope.errors = response;
    });
  };

  $scope.sending_request_verification = false;
  $scope.request_verification_sent = false;
  $scope.verifyBankInformation = function() {
    $scope.sending_request_verification = true;
    $scope.request_verification_sent = true;
    var params = {
      verification: {
        one: $scope.currentIndividual.verify_one,
        two: $scope.currentIndividual.verify_two
      }
    };

    $scope.verification_success = false;
    $scope.verification_errors = false;
    $http.put('/api/v1/settings/verify_bank_information', params).success(function(response) {
      $scope.reinitializeIndividualVerifyForm();
      $scope.verification_success = true;
      fetchCurrentIndividual();
    }).error(function(response) {
      $scope.reinitializeIndividualVerifyForm();
      $scope.errors = response;
      $scope.verification_errors = true;
    });
  };

  $scope.showVerifyFields = function() {
    if ($scope.currentIndividual.user.verification_status === 'verified') {
      return false;
    }
    if ($scope.currentIndividual.user.verification_status === 'in_process' || ($scope.currentIndividual.user.bank_account_number && $scope.currentIndividual.user.routing_number && $scope.currentIndividual.user.bank_account_number.length > 0 && $scope.currentIndividual.user.routing_number.length > 0 && _.contains(["in_process", "not_verified"], $scope.currentIndividual.user.verification_status))) {
      return true;
    }
    if ($scope.currentIndividual.user.verification_status === 'in_process' || $scope.currentIndividual.user.bank_information_filled) {
      return true;
    }
    return false;
  };

  $scope.reinitializeIndividualPasswordForm = function() {
    $scope.currentIndividual.current_password = '';
    $scope.currentIndividual.password = '';
    $scope.currentIndividual.password_confirmation = '';
    $scope.individualParams = {};
    $scope.sending_request_verification = false;
  };

  $scope.reinitializeIndividualVerifyForm = function() {
    $scope.currentIndividual.verify_one = null;
    $scope.currentIndividual.verify_two = null;
    $scope.sending_request_verification = false;
  };

  /*$scope.cancel = function() {
    $scope.back();
  };*/

  $scope.refreshMask = function(attribute, maskPattern) {
    $scope.masks[attribute] = maskPattern;
  };

  $scope.clearMask = function(attribute) {
    if ($scope.currentIndividual.user[attribute] === undefined || $scope.currentIndividual.user[attribute].length === 0) {
      $scope.masks[attribute] = '';
    }
  };

  $scope.setWasFocused = function(formElement){
    formElement.$wasFocused = true;
  };

  var checkState = function(string) {
    var states = ["AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY" ];
    return states.indexOf(angular.uppercase(string)) > -1;
  };

  $scope.$watch('currentIndividual.user.billing_state', function(newValue, oldValue) {
    if (newValue && newValue.length > 0 && $scope.forms.profileForm) {
      if (checkState(newValue)) {
        $scope.forms.profileForm.billing_state.$setValidity("states", true);
      } else {
        $scope.forms.profileForm.billing_state.$setValidity("states", false);
      }
    }
  });

  $scope.openModal = function () {
    var modalInstance = $modal.open({
      templateUrl: 'profile/partials/password_modal.tpl.html',
      size: 'lg',
      controller: 'FileModalCtrl',
      backdrop: false
    });

    modalInstance.result.then(function () {
      console.log('Upload Completed!');
      $timeout(function() {
        $scope.refreshIndividual();
      }, 700);
      $scope.refreshIndividual();
    }, function () {
      $timeout(function() {
        $scope.refreshIndividual();
      }, 700);
      $scope.refreshIndividual();
      console.log('Modal dismissed at: ' + new Date());
    });
  };

  // Users Section

  $scope.availableScopes = [];
  getIndividuals();
  getRoles();
  getScopes();

  function getIndividuals () {
    $http.get('/api/v1/individuals.json')
      .success(function(response) {
        $scope.individuals = Array.isArray(response) ? response : [response];
      });
  }

  function getRoles () {
    $http.get('/api/v1/roles.json')
      .success(function(response) {
        $scope.roles = Array.isArray(response) ? response : [response];

      });
  }

  function getScopes () {
    // $scope.availableScopes = [{id: 1, name: 'Cool'}, {id: 2, name: 'Awesome'}, {id: 3, name: 'Great'}, {id: 4, name: 'Amazing'}, {id: 5, name: 'Gorgeous'}];
    $http.get('/api/v1/individuals/authorization_scopes')
      .success(function(response) {
        $scope.availableScopes = response;
      });
  }

  $scope.prepareTab = function (tabName) {
    if (tabName === 'individuals') {
      $scope.individualsTab = true;
    } else {
      $scope.individualsTab = false;
    }
  };

  $scope.saveIndividuals = function () {
    var idx = 0;

    $scope.saveResult = { text: 'Saving in progress...', saving: true };

    $scope.individuals.forEach(function (u, i, us) {
      u.edit_mode = false;
      u.error = '';
      idx++;
      if (u.selected_scopes_ids) {
        u.authorization_scopes = [];
        u.selected_scopes_ids.forEach(function (ssi) {
          var scopeType = ssi.substr(0, ssi.indexOf('-')),
            scopeId = ssi.substring(ssi.indexOf('-') + 1, ssi.length);

          $scope.availableScopes.some(function (sc) {
            if (sc.id === Number(scopeId) && sc.type === scopeType) {
              u.authorization_scopes.push(sc);
              return true;
            }
            else {
              return false;
            }
          });
        });
      }

      if (u.new_individual) {
        u.password = 'asdasd';
        u.password_confirmation = 'asdasd';
        u.encrypted_password = 'asdasd';
        u.inviter_name = $scope.currentIndividual.name;
        $http.post('/api/v1/individuals', u)
          .success(function (nu) {
            if (idx === us.length) {
              $scope.saveResult = { text: 'Users saved successfully.', saved: true, saving: false };
              getIndividuals();
            }
          })
          .error(function (err) {
            u.error = angular.toJson(err).replace(/\{/g, '').replace(/"/g, '').replace(/:/g, ' ')
              .replace(/\[/g, '').replace(/\]/g, '').replace(/\}/g, '').replace(/errors/, '');
            idx = -1;
            $scope.saveResult = { text: 'There are errors.', saved: false, saving: false };
          });
      }
      else if (u.changed) {
        $http.put('/api/v1/individuals/' + u.id, { individual: u })
          .success(function (uu) {
            if (idx === us.length) {
              $scope.saveResult = { text: 'Users saved successfully.', saved: true, saving: false };
              getIndividuals();
            }
          })
          .error(function (err) {
            u.error = angular.toJson(err).replace(/\{/g, '').replace(/"/g, '').replace(/:/g, ' ')
              .replace(/\[/g, '').replace(/\]/g, '').replace(/\}/g, '').replace(/errors/, '');
            idx = -1;
            $scope.saveResult = { text: 'There are errors.', saved: false, saving: false };
          });
      }
    });
  };

  $scope.newIndividual = function () {
    $scope.individuals.unshift({
      edit_mode: true,
      role_id: 1,
      new_individual: true
    });
  };


  $scope.showBoxes=true;
  $scope.businessBox=false;
  $scope.paymentBox=false;
  $scope.userBox=false;
  $scope.passwordBox=false;

  $scope.editBusiness = function(){
    $scope.showBoxes=false;
    $scope.businessBox=true;
  };

  $scope.editPayment = function(){
    $scope.showBoxes=false;
    $scope.paymentBox=true;
  };

  $scope.editUser = function(){
    $scope.showBoxes=false;
    $scope.userBox=true;
  };

  $scope.editPassword = function(){
    $scope.showBoxes=false;
    $scope.passwordBox=true;
  };

  $scope.cancel = function() {
    //$scope.back();
    $scope.showBoxes=true;
    $scope.businessBox=false;
    $scope.paymentBox=false;
    $scope.userBox=false;
    $scope.passwordBox=false;
  };

})

.controller('FileModalCtrl', function FileModal ($scope, $http, $modalInstance, $window, Auth) {

  var url = '/api/v1/settings';

  $scope.save = function() {
    var params = { individual: { user: { file_password: $scope.file_password } } };
    $http.put(url, params).success(function(res) {
      $modalInstance.close();
      // $window.open("/qbwc/qwc");
      window.location.href = "/qbwc/qwc";
    });
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

})

.directive('connectToQuickbooks', function($window){
  return {
    restrict: 'E',
    template: "<ipp:connectToIntuit></ipp:connectToIntuit>",
    link: function(scope) {
      var intuitScriptLoaded = function(){
        return $window.intuit && $window.intuit.ipp && $window.intuit.ipp.anywhere && $window.intuit.ipp.anywhere.setup;
      };

      if (intuitScriptLoaded()) {
        // Hack to get the button to reload when this directive is shown
        // for the second time, since the QB connect button assumes that
        // the button is not rendered dynamically
        window.intuit.ipp.anywhere.init();
      } else {
        var script = $window.document.createElement("script");
        script.type = "text/javascript";
        script.src = "//js.appcenter.intuit.com/Content/IA/intuit.ipp.anywhere.js";
        $window.document.body.appendChild(script);
      }

      scope.$watch(
        intuitScriptLoaded,
        function(newValue, oldValue) {
          var host = $window.location.host;
          // var host = 'localhost:3000';
          if(intuitScriptLoaded()) {
            $window.intuit.ipp.anywhere.setup({
              grantUrl: 'http://' + host + '/api/v1/users/authenticate'
            });
          }
        }
      );
    }
  };
})
;
