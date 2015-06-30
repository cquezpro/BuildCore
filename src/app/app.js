angular.module( 'billsync', [
  'templates-app',
  'templates-common',
  'billsync.entities',
  'billsync.directives',
  'billsync.dilbert',
  'billsync.pdf',
  'billsync.authorize',
  'billsync.home',
  'billsync.about',
  'billsync.vendor',
  'billsync.invoice',
  'billsync.login',
  'billsync.registration',
  'billsync.passwords',
  'billsync.profile',
  'billsync.dispute',
  'billsync.dashboard',
  'billsync.line_items',
  'billsync.duplicate_invoice',
  'billsync.surveys',
  'billsync.addresses',
  'billsync.reports',
  'ui.router',
  'ui.route',
  'ui.mask',
  'ui.bootstrap',
  'ui.select',
  'Devise',
  'lr.upload',
  'pdf',
  'ngIdle',
  'fiestah.money',
  'localytics.directives',
  'billsync.filters',
  'ngSanitize',
  'billsync.error'
])

.config( function myAppConfig ( $urlRouterProvider, IdleProvider, $httpProvider, $locationProvider) {
  $urlRouterProvider.otherwise( '/dashboard' );

  IdleProvider.timeout(2*60);
  IdleProvider.idle(18*60);
  IdleProvider.keepalive(false);
})

.run( function run (Idle) {
  Idle.watch();
})

.controller( 'AppCtrl', function AppCtrl ($rootScope, $scope, $location, Auth, $state, $http, InvoicesManager, DilbertRss, $modal, $timeout, authorize) {
  DilbertRss.getRss();

  var modalInstance;
  var availableStates = ['registration', 'fromaws', 'forgot-password', 'sample', 'score', 'line_items_aws', 'surveys', 'addresses'];
  var unAvailableStates = ['fromaws', 'sample', 'score', 'line_items_aws', 'surveys', 'addresses'];
  var availablePaths = ['/surveys', '/invoice/fromaws', '/invoice/score', '/line-items-aws', '/address'];
  // $scope.hideElement = $location.path()=='/invoice/fromaws';
  $scope.stateCopy = $state;


  function performAuthentication() {
    if (! Auth.isAuthenticated() && ! _.contains(availableStates, $state.$current.name)) {
      Auth.currentUser().then(function(individual) {
        $scope.currentIndividual = individual;
        startIntercom();
      }, function () {
        if ($state.$current.name === 'signup') {
          $scope.modalInstance = $modal.open({
            templateUrl:  'registration/registration.tpl.html',
            controller:   'RegistrationCtrl',
            size:         'md',
            keyboard: false,
            backdrop: 'static'
          });

          $scope.modalInstance.result.then(function (individual) {
            window.location.reload();
          });
        }
        else {
          $scope.modalInstance = $modal.open({
            templateUrl:  'login/login.tpl.html',
            controller:   'LoginCtrl',
            size:         'md',
            backdrop:     'static',
            keyboard:     false
          });

          $scope.modalInstance.result.then(function (individual) {
            $scope.currentIndividual = individual;
            startIntercom();
            $scope.$emit('refresh:individual_instance');
            window.location.reload();
          }, function (data) {
            if ( 'changeRoute' !== data ) {
              $state.transitionTo('dashboard');
            }
          });
        }

      });
    } else if (!Auth.isAuthenticated() && !$scope.currentIndividual) {
      Auth.currentUser().then(function(individual) {
        $scope.currentIndividual = individual;
        startIntercom();
      });
    }
  }

  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
    if (Auth.isAuthenticated() && !$scope.authorizeView(toState.views.main.templateUrl)) {
      event.preventDefault();
      $state.transitionTo('error');
    }
  });

  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | billSync' ;
    }

    if ( angular.isDefined( modalInstance ) ) {
      modalInstance.dismiss('changeRoute');
    }

    $scope.fromState = fromState;
    $scope.fromParams = fromParams;

    $scope.$on('devise:unauthorized', function(event, xhr, deferred) {
      deferred.reject(xhr);
    });

    $scope.$on('refresh:currentIndividual', function(event, response) {
      if (response) {
        $scope.currentIndividual = response.individual;
        startIntercom();
      } else {
        $http.get('/api/v1/users/some-user').success(function(response) {
          $scope.currentIndividual = response;
        });
      }
    });

    performAuthentication();

    
    $http.get('/api/v1/config')
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

        $http.get('/api/v1/config')
          .success(function (response) {
            new Intercom('boot', {
              user_id:    $scope.currentIndividual.id,
              app_id:     response.intercom_app_id,
              company:   {
                id: $scope.currentIndividual.user.id
              }
            });
          });
      })(Intercom);
    }
  }

  $scope.countBills = function () {
    $http.get('/api/v1/invoices/counts')
      .success(function (response) {
        $rootScope.billsCount = response.dashboard_count;
        $rootScope.allBillsCount = response.regular_view;
      });
  };

  startIntercom();
  $scope.countBills();

  // $timeout(function() {
  //   startIntercom();
  // }, 300000); //

  // what to do when idle timeout happens
  // Refactor this conditional logic in to a function
  $scope.$on('IdleTimeout', function() {
    if ( !_.contains(unAvailableStates, $state.current.name) ) {
      $scope.logout();
    }
  });

  $scope.$on('IdleStart', function() {
    $scope.idleModal = $modal.open({
      templateUrl: 'common/idle-modal.tpl.html'
    });
  });

  $scope.$on('IdleEnd', function() {
    if ($scope.idleModal) {
      $scope.idleModal.close();  
    }
  });

  $scope.freePass = function() {
    if ( _.contains(availableStates, $state.current.name) ) {
      return true;
    } else {
      return false;
    }
  };

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
      intercomSettings = { widget: { activator: '#intercom' } };
      (function(){var w=window; var ic=w.Intercom; if(typeof ic==="function"){ic('reattach_activator'); ic('update',intercomSettings); }else{var d=document; var i=function(){i.c(arguments);}; i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function l(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/li1no6';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
    }
  }

  initApp();

  $scope.changeClass = function(){
    if ($scope.class === "nottoggled"){
      $scope.class = "toggled";
    }
    else{
      $scope.class = "nottoggled";
    }
  };

  $scope.logout = function() {
    Auth.logout().then(function(res) {
      $scope.currentIndividual = null;
      window.location.reload();
    });
  };

  $scope.back = function() {
    var state = ("" === $scope.fromState.name)? "home" : $scope.fromState.name;
    $state.transitionTo(state, $scope.fromParams);
  };

  $scope.authorizeView = function (tplUrl) {
    return authorize.view(tplUrl, $scope.currentIndividual ? $scope.currentIndividual.permissions : []);
  };

  $scope.authorizeState = function (st) {
    return authorize.state(st, $scope.currentIndividual ? $scope.currentIndividual.permissions : []);
  };

  $scope.authorizeAction = function (a) {
    return authorize.action(a, $scope.currentIndividual ? $scope.currentIndividual.permissions : []);
  };

  $scope.confirmEmail = function () {
    $http.post('/auth/confirmation', {});
  };

  $rootScope.billsCount = 0;

  $rootScope.turksandbox = true;
  if ($rootScope.turksandbox) {
    $rootScope.turk_form_url = "https://workersandbox.mturk.com/mturk/externalSubmit";
    $scope.turk_form_url = "https://workersandbox.mturk.com/mturk/externalSubmit";
  } else {
    $rootScope.turk_form_url = "https://www.mturk.com/mturk/externalSubmit";
    $scope.turk_form_url = "https://www.mturk.com/mturk/externalSubmit";
  }


});

