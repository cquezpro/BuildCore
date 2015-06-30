//, 
angular.module('billsync', ['ionic', 'Devise', 'billsync.controllers', 'billsync.filters', 'billsync.services','billsync.directives','billsync.entities','pdf','ui.mask', 'ngResource'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $location, Auth, $ionicPopup, $window, $state, $rootScope, $http, $baseUrl,$ionicLoading, authorize) {
  $scope.loginData = {};
  $scope.newUser = {};
  $scope.return_state = null;
  $scope.select_times = [{id: 0, label: '00 AM' },{id: 1, label: '1 AM' },{id: 2, label: '2 AM' },{id: 3, label: '3 AM' },{id: 4, label: '4 AM' },{id: 5, label: '5 AM' },{id: 6, label: '6 AM' },{id: 7, label: '7 AM' },{id: 8, label: '8 AM' },{id: 9, label: '9 AM' },{id: 10, label: '10 AM' },{id: 11, label: '11 AM' },{id: 12, label: '12 PM' },{id: 13, label: '1 PM' },{id: 14, label: '2 PM' },{id: 15, label: '3 PM' },{id: 16, label: '4 PM' },{id: 17, label: '5 PM' },{id: 18, label: '6 PM' },{id: 19, label: '7 PM' },{id: 20, label: '8 PM' },{id: 21, label: '9 PM' },{id: 22, label: '10 PM' },{id: 23, label: '11 PM' }];
  

  var modalInstance;
  var availableStates = ['registration', 'fromaws', 'forgot-password', 'sample', 'score', 'line_items_aws', 'surveys', 'addresses'];
  var unAvailableStates = ['fromaws', 'sample', 'score', 'line_items_aws', 'surveys', 'addresses'];
  var availablePaths = ['/surveys', '/invoice/fromaws', '/invoice/score', '/line-items-aws', '/address'];
  $scope.checklistMinimized = true;



  function performAuthentication() {
    if (! Auth.isAuthenticated() && ! _.contains(availableStates, $state.$current.self.name)) {
      Auth.currentUser().then(function(individual) {
        $scope.currentIndividual = individual;
        /*if(cordova.plugins.intercom) {
          cordova.plugins.intercom.startSession({ email: $scope.currentIndividual.email });
        }*/
        //startIntercom();
      }, function () {
        

      });
    } else if (!Auth.isAuthenticated() && !$scope.currentIndividual) {
      Auth.currentUser().then(function(individual) {
        $scope.currentIndividual = individual;
        //startIntercom();
      });
    }
  }

  $scope.openIntercom = function() {
    $ionicModal.fromTemplateUrl('templates/intercom-modal.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.InterComModal = modal;
      $scope.InterComModal.show();
    });    
  };

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
  };



   $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    $scope.fromState = fromState;
    $scope.fromParams = fromParams;


    $scope.$on('refresh:currentIndividual', function(event, response) {
      if (response) {
        $scope.currentIndividual = response.individual;
        startIntercom();
      } else {
        $http.get($baseUrl + '/api/v1/users/some-user').success(function(response) {
          $scope.currentIndividual = response;
        });
      }
    });

    performAuthentication();

    $http.get($baseUrl + '/api/v1/config')
    .success(function (response) {
      window.Intercom('update', {
        user_id:    $scope.currentIndividual ? $scope.currentIndividual.id : null,
        app_id:     response.intercom_app_id,
        company:   {
          id: $scope.currentIndividual ? $scope.currentIndividual.user.id : null
        }
      });
    });

  });

   function startIntercom () {
    if ( typeof(Intercom) !== "undefined" && $scope.currentIndividual ) {
      (function(Intercom){
        var created_at = new Date();

        $http.get($baseUrl +  '/api/v1/config')
          .success(function (response) {
            var created_at = new Date();
            console.log("startIntercom okay");
            window.Intercom('boot', {
               app_id: 'li1no6',
               email: $scope.currentIndividual.email,
               user_id: $scope.currentIndividual.id,
               created_at: created_at,
               widget: {
                  activator: '#intercom'
               }  
            });
           /* new Intercom('boot', {
              user_id:    $scope.currentIndividual.id,
              app_id:     response.intercom_app_id,
              created_at: created_at,
              company:   {
                id: $scope.currentIndividual.user.id
              }
            });*/

         });
      })(Intercom);
    }
  }

 function initApp () {
    var locationPath = $location.path();

    if (locationPath.indexOf('/line-items-aws') >= 0) {
      locationPath = '/line-items-aws';
    }

    if (_.contains(availablePaths, locationPath) ) {
      $scope.class = "toggled";
    }
    else {
      $scope.class = "nottoggled";
      // intuit.ipp.anywhere.setup({menuProxy: '/path/to/blue-dot', grantUrl: 'http://billsync-staging.herokuapp.com/api/v1/users/authenticate'});
      //console.log("intercom setting");
      intercomSettings = { widget: { activator: '#intercom' } };
      (function(){var w=window; var ic=w.Intercom; if(typeof ic==="function"){ic('reattach_activator'); ic('update',intercomSettings); }else{var d=document; var i=function(){i.c(arguments);}; i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function l(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/li1no6';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
    }
  }

  initApp();

  $scope.showTerms = function(){
    $ionicPopup.alert({
        title: 'Terms and Conditions',
        template: 'Terms and Conditions content'
    });
  };

  $scope.showPassword = function(){
    if($scope.chkState){
      $scope.chkState = false;
    }else{
      $scope.chkState = true;
    }

  };

$scope.bDefault =  true;
$scope.bLogin = true;
$scope.bSignup = true;

  $scope.doAuth = function () {
    Auth.currentUser().then(
      function (user) {
        $scope.bDefault =  false;
        $scope.bLogin = false;
        $scope.bSignup = false;
        $scope.currentIndividual = user;
        return true;
      },
      function (error) {
        if (localStorage.getItem('loginData')) {
          $scope.loginData = angular.fromJson(localStorage.getItem('loginData'));
          $scope.doLogin();
        }
        else {
          
          console.log("$rootScope.logoutAction " + $rootScope.logoutAction);
          if(localStorage.getItem('logoutAction')){
            $scope.openLogin();
            localStorage.removeItem('logoutAction');
          }else{
          $ionicModal.fromTemplateUrl('templates/default.html', {
            scope: $scope,
            backdropClickToClose: false,
            hardwareBackButtonClose: false
          }).then(function(modal) {
            $scope.modalDefault = modal;
            $scope.bDefault =  true;
            if ($scope.signUpModal) {
              $scope.signUpModal.hide();
            }
            if ($scope.modal) {
              $scope.modal.hide();
            }
            $scope.modalDefault.show();
          });
            localStorage.removeItem('logoutAction');
          }
        }
        
      }
    );
  };

  $scope.openLogin = function(){
    $scope.chkState = false;
    if ($scope.signUpModal) {
      $scope.signUpModal.hide();
    }
    if ($scope.modalDefault) {
      $scope.modalDefault.hide();
    }

      $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope,
        backdropClickToClose: false,
        hardwareBackButtonClose: false
      }).then(function(modal) {
        $scope.modal = modal;
        if ($scope.signUpModal) {
          $scope.signUpModal.hide();
        }
        if ($scope.modalDefault) {
          $scope.modalDefault.hide();
        }
        $scope.modal.show();
      });

  };

  $scope.closeLogin = function() {
    if ($scope.modal)
      $scope.modal.hide();
  };

  $scope.login = function() {
    if ($scope.signUpModal) {
      $scope.signUpModal.hide();
    }
    if ($scope.modal) {
      $scope.modal.hide();
    }
    $scope.modalDefault.show();
  };

  $scope.showSignUp = function () {
    $scope.chkState = true;
    if ($scope.modal) {
      $scope.modal.hide();
    }
    if ($scope.modalDefault) {
      $scope.modalDefault.hide();
    }

    if (!$scope.signUpModal) {
      $ionicModal.fromTemplateUrl('templates/signup.html', {
        scope: $scope,
        backdropClickToClose: false,
        hardwareBackButtonClose: false
      }).then(function(modal) {
        $scope.signUpModal = modal;
        $scope.signUpModal.show();  
      });  
    }
    else {
      $scope.signUpModal.show();
    }
  };

  $scope.doSignup = function(){
    var timezone = jstz.determine();
    var timezoneName = timezone.name();
    //console.log("timezoneName " + timezoneName);
    //$scope.newUser = {name: "hector22", business_name: "hector", mobile_phone: "133456789", email:"h22@g.com", password: "hector27",timezone:timezoneName}
    //$scope.newUser.password="holahola234*";
    $scope.newUser.timezone = timezoneName;
    $ionicLoading.show({
      template: 'Please wait...'
    });
    Auth.register($scope.newUser).then(function(user){
        console.log(user);
        $scope.currentIndividual = user;
        if ($scope.signUpModal) {
          $scope.signUpModal.hide();
        }
        $scope.bDefault = false;
        $scope.bLogin = false;
        $scope.bSignup = false;
        $ionicLoading.hide();
    }, function(response){
        console.log(response);
        
        var errors = "";
        if(response.data.errors.email !== undefined && response.data.errors.email){
          errors = errors + " Email " + response.data.errors.email[0] + "<br>";
        }
        if(response.data.errors.password !== undefined && response.data.errors.password){
          errors = errors + " Password " + response.data.errors.password[0] + "<br>";
        }
        if(response.data.errors.business_name !== undefined && response.data.errors.business_name){
          errors = errors + " Business name " + response.data.errors.password[0] + "<br>";
        }
        if(response.data.errors.mobile_phone !== undefined && response.data.errors.mobile_phone){
          errors = errors + " Password " + response.data.errors.mobile_phone[0] + "<br>";
        }


        $ionicPopup.alert({
            title: 'Error singup',
            template: errors
        });
        $ionicLoading.hide();
    });

  };

  $scope.individual = {};
  $scope.showForgotPassword = function () {
    $scope.chkState = true;
    if ($scope.modal) {
      $scope.modal.hide();
    }
    if ($scope.modalDefault) {
      $scope.modalDefault.hide();
    }
    if ($scope.signUpModal) {
      $scope.signUpModal.hide();
    }

    if (!$scope.forgotPasswordModal) {
      $ionicModal.fromTemplateUrl('templates/forgotpassword.html', {
        scope: $scope,
        backdropClickToClose: false,
        hardwareBackButtonClose: false
      }).then(function(modal) {
        $scope.forgotPasswordModal = modal;
        $scope.forgotPasswordModal.show();  
      });  
    }
    else {
      $scope.forgotPasswordModal.show();
    }
  };

  $scope.contactUs = function(){
      window.open("http://bill-sync.com/contact/", "_system");
  };

  $scope.backtoSignin = function() {
    $scope.forgotPasswordModal.hide();
     $scope.modal.show();
  };


 $scope.submiting_request = false;
  $scope.successForgotPassword = function(response) {
    $scope.responseText =  "If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes.";
    $scope.submiting_request = false;
  };

   $scope.errorForgotPassword = function(response) {
    $scope.responseText =  "Error while trying to submit.";
    $scope.submiting_request = false;
  };

  $scope.submitForgotPasswordForm = function() {
    $scope.responseText = '';
    $http.post($baseUrl + '/auth/password',{individual: $scope.individual}).success($scope.successForgotPassword).error($scope.errorForgotPassword);
  };

   $scope.submitPasswordChangeForm = function() {
    $scope.submiting_request = true;
    $scope.errors = [];
    $scope.individual.reset_password_token = $scope.reset_password_token;
    $http.put($baseUrl + '/auth/password', {individual: $scope.individual}).success($scope.successPasswordChange).error($scope.errorPasswordChange);
  };

   $scope.successPasswordChange = function(response) {
    $state.transitionTo('app.tabs.home');
    $scope.submiting_request = false;
  };

   $scope.errorPasswordChange = function(response) {
    $scope.errors = response;
    $scope.submiting_request = false;
    console.log(typeof $scope.errors === 'string');
    if (typeof $scope.errors === 'string') {
      $state.transitionTo('app.tabs.home');
    }
  };

 $scope.submitForgotPassword = function() {
    $scope.submiting_request = true;
    if ($scope.reset_password_token) {
      $scope.submitPasswordChangeForm();
    } else {
      $scope.submitForgotPasswordForm();
    }
  };

  $scope.doLogin = function() {
    //$scope.loginData.email ="danielfromarg@gmail.com";
    //$scope.loginData.email ="asd@asd.com";
    //$scope.loginData.password="asdasd";
    Auth.login($scope.loginData).then(
      function (user) {
        localStorage.setItem('loginData', angular.toJson($scope.loginData));
        $scope.currentIndividual = user;
        $scope.closeLogin();
        $scope.bDefault = false;
        $scope.bLogin = false;
        $scope.bSignup = false;
      },
      function (error) {
        if ($scope.modal) {
          console.log(angular.toJson(error));
          if (error.data.error === 'Please click the link we sent to your email to confirm your account.') {
            var confirmPopup = $ionicPopup.confirm({
              title: 'Login Error',
              template: 'Your account is not approved.',
              cancelText: 'Resend confirm email'
            });

            confirmPopup.then(function (result) {
              if (!result) {
                $scope.confirmEmail($scope.loginData.email);
              }
            });
          }
          else {
            $ionicPopup.alert({
              title: 'Login Error',
              template: 'Check your e-mail and password.'
            });
          }
        }
          
        else {
          $scope.logout();
        }
      }
    );
  };

  $scope.logout = function () {
    Auth.logout().then(
      function () {
        localStorage.removeItem('loginData');
        $rootScope.logoutAction = true;
        localStorage.setItem('logoutAction',true);
        $state.transitionTo('app.tabs.home');
        $window.location.reload();
      },
      function () {
        localStorage.removeItem('loginData');
        $rootScope.logoutAction = true;
        localStorage.setItem('logoutAction',true);
        $state.transitionTo('app.tabs.home');
        $window.location.reload();
      }
    );
  };

  $scope.doAuth();

  $scope.saveUser = function() {
    $scope.currentIndividual.user.emails = $scope.emails;
    $scope.currentIndividual.user.numbers = $scope.numbers;
    $scope.currentIndividual.$update(respondToSuccess, respondToFailure);
  };

  $scope.savePassword = function() {
    $scope.userParams = {
      current_password: $scope.currentIndividual.current_password,
      password: $scope.currentIndividual.password,
      password_confirmation: $scope.currentIndividual.password_confirmation
    };
    $http.put($baseUrl + '/api/v1/users/update_password', $scope.userParams).success(function(response) {
      $scope.errors = {};
      $scope.reinitializeUserPasswordForm();
    }).error(function(response) {
      $scope.reinitializeUserPasswordForm();
      $scope.errors = response;
    });
  };
  $scope.billsCount = 0;
  $scope.countBills = function () {
    $http.get($baseUrl + '/api/v1/invoices/counts')
      .success(function (response) {
        $scope.billsCount = response.dashboard_count;
      });
  };

  // $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
  //   if (Auth.isAuthenticated() && !$scope.authorizeView(toState.views.main.templateUrl)) {
  //     event.preventDefault();
  //     $state.transitionTo('error');
  //   }
  // });

  $scope.authorizeView = function (tplUrl) {
    return authorize.view(tplUrl, $scope.currentIndividual ? $scope.currentIndividual.permissions : []);
  };

  $scope.authorizeState = function (st) {
    return authorize.state(st, $scope.currentIndividual ? $scope.currentIndividual.permissions : []);
  };

  $scope.authorizeAction = function (a) {
    return authorize.action(a, $scope.currentIndividual ? $scope.currentIndividual.permissions : []);
  };

  $scope.confirmEmail = function (eml) {
    var reqBody = {};
    if (eml) {
      reqBody = { individual: {email: eml} };
    }
    
    $http.post($baseUrl + '/auth/confirmation', reqBody)
    .finally(function () {
      $ionicPopup.alert({
        title: 'Confirm Email',
        template: 'Confirmation sent to your email address.'
      });
    });
  };
});

angular.module('billsync.controllers', []);
angular.module('billsync.filters', []);
angular.module('billsync.services', []);
