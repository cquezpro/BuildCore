angular.module('billsync')

// .constant('$baseUrl', 'http://10.0.3.2:3000') // Genymotion
// .constant('$baseUrl', 'http://192.168.1.208:3000') // iOS
//.constant('$baseUrl', 'http://localhost:9292/localhost:3000') // Web app using corsproxy
//.constant('$baseUrl', 'https://billsync-staging.herokuapp.com') // Staging
.constant('$baseUrl', 'https://www.bill-sync.com') // Production
//.constant('$baseUrl', 'http://localhost:3000')

.config(function($stateProvider, $urlRouterProvider, AuthProvider, $httpProvider, $baseUrl, $ionicConfigProvider, $sceDelegateProvider) {
  $stateProvider

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })

    .state('app.tabs.profile', {
      url: "/profile",
      views: {
        'home-tab': {
          templateUrl: "templates/profile.html",
          controller: 'ProfileCtrl'
        }
      }      
    })

    .state('app.settings', {
      url: "/settings",
      templateUrl: "templates/settings.html",
      controller: 'SettingCtrl'
    })

  .state('app.accounting', {
      url: "/accounting",
      templateUrl: "templates/accounting.html"
    })

    /*.state('app.usersAdd', {
      url: "/users",
      templateUrl: "templates/users-add.html",
      controller: 'UsersCtrl'
    })*/
    .state('app.users', {
      url: "/users",
      templateUrl: "templates/users.html",
      controller: 'UsersCtrl'
    })

    .state('app.userEdit', {
      url: "/user/:id/edit",
      templateUrl: "templates/user-edit.html",
      controller: 'UserEditCtrl'  
    })

    .state('app.tabs', {
      url: "/tabs",
      abstract: true,
      templateUrl: "templates/tabs.html",
      controller: 'TabsCtrl'
    })

    .state('app.tabs.home', {
      url: "/home",
      views: {
        'home-tab': {
          templateUrl: "templates/home.html",
          controller: 'HomeCtrl'
        }
      }
    })

    .state('app.tabs.vendors', {
      url: "/vendors",
      views: {
        'vendors-tab': {
          templateUrl: "templates/vendors.html",
          controller: 'VendorsCtrl'
        }
      }
    })

    .state('app.tabs.vendorView', {
      url: "/vendor/:id/view",
      views: {
        'vendors-tab': {
          templateUrl: "templates/vendor-view.html",
          controller: 'VendorEditCtrl'
        }
      }
    })

    .state('app.tabs.vendorEdit', {
      url: "/vendor/:id/edit",
      views: {
        'vendors-tab': {
          templateUrl: "templates/vendor-edit.html",
          controller: 'VendorEditCtrl'
        }
      }
    })

    .state('app.tabs.vendorBasicInfo', {
      url: "/vendor/:id/edit/basic-info",
      views: {
        'vendors-tab': {
          templateUrl: "templates/vendor-tabs/basic-info.html",
          controller: 'VendorEditCtrl'
        }
      }
    })

    .state('app.tabs.vendorPaymentTerms', {
      url: "/vendor/:id/edit/payment-terms",
      views: {
        'vendors-tab': {
          templateUrl: "templates/vendor-tabs/payment-terms.html",
          controller: 'VendorEditCtrl'
        }
      }
    })

    .state('app.tabs.vendorAlerts', {
      url: "/vendor/:id/edit/alerts",
      views: {
        'vendors-tab': {
          templateUrl: "templates/vendor-tabs/alerts.html",
          controller: 'VendorEditCtrl'
        }
      }
    })

    .state('app.tabs.vendorAccounting', {
      url: "/vendor/:id/edit/accounting",
      views: {
        'vendors-tab': {
          templateUrl: "templates/vendor-tabs/accounting.html",
          controller: 'VendorEditCtrl'
        }
      }
    })

    .state('app.tabs.vendorLineItems', {
      url: "/vendor/:id/edit/line-items",
      views: {
        'vendors-tab': {
          templateUrl: "templates/vendor-tabs/line-items.html",
          controller: 'VendorEditCtrl'
        }
      }
    })

    .state('app.tabs.vendorBills', {      url: "/vendor/:id/edit/bills",
      views: {
        'vendors-tab': {
          templateUrl: "templates/vendor-tabs/bills.html",
          controller: 'VendorEditCtrl'
        }
      }
    })

    .state('app.tabs.vendorCombineVendors', {
      url: "/vendor/:id/edit/combine-vendors",
      views: {
        'vendors-tab': {
          templateUrl: "templates/vendor-tabs/combine-vendors.html",
          controller: 'VendorEditCtrl'
        }
      }
    })

    /*.state('app.tabs.vendorCombineVendors', {
      url: "/vendor/:id/edit/combine-vendors",
      views: {
        'vendors-tab': {
          templateUrl: "templates/vendor-tabs/combine-vendors.html",
          controller: 'VendorEditCtrl'
        }
      }
    })*/

    .state('app.tabs.invoice', {
      url: "/invoice/:id",
      views: {
        'home-tab' :{
          templateUrl: "templates/invoice.html",
          controller: 'InvoiceCtrl'
        }
      }
    })

    .state('app.tabs.invoiceEdit', {
      url: "/invoice/:id/edit?from",
      views: {
        'home-tab' :{
          templateUrl: "templates/invoice-edit.html",
          controller: 'InvoiceEditCtrl'
        }
      }
    })

    .state('app.capture', {
      url: "/capture",
      templateUrl: "templates/capture.html",
      controller: 'CaptureCtrl'
    })

    .state('app.tabs.payments', {
      url: "/payments",
      views: {
        'payments-tab' :{
          templateUrl: "templates/payments.html",
          controller: 'ReportsCtrl'
        }
      }
    });
    
  $urlRouterProvider.otherwise('/app/tabs/home');

  AuthProvider.loginPath($baseUrl + '/auth/sign_in.json');
  AuthProvider.logoutPath($baseUrl + '/auth/sign_out.json');
  AuthProvider.registerPath($baseUrl + '/auth/sign_up.json');
  AuthProvider.resourceName('individual');
  AuthProvider.logoutMethod('GET');

  $httpProvider.defaults.withCredentials = true;

  $ionicConfigProvider.tabs.position("botton");

  $sceDelegateProvider.resourceUrlWhitelist(['**']);

});
