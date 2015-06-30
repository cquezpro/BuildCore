angular.module( 'billsync.entities', [])

.factory( 'InvoicesRes', function($resource){
  return $resource('../api/v1/invoices/:id',
    {id: '@id'},
    {
      query: {method: 'GET', isArray: true},
      update: {method: 'PUT', params: {id: '@id'}, isArray:false},
      update_all: { method: 'PUT', params: {id: 'update_all'}, isArray: true }
    });
})

.factory( 'InvoiceModerationRes', function($resource){
  return $resource('../api/v1/invoice_moderations/:id?hitId=:hitId',
    {id: '@id', hitId: '@hitId'},
    {
      query: { method: 'GET', params: { hitId: '@hitId'}, isArray: true },
      update: {method: 'PUT', params: {id: '@id', hitId: '@hitId' }, isArray:false}
    });
})

.factory( 'VendorsRes', function($resource){
  return $resource('../api/v1/vendors/:id',
    {id: '@id'},
    {
      update: {method: 'PUT', params: {id: '@id'}, isArray:false}
    });
})

.factory( 'CurrentIndividualRes', function($resource){
  return $resource('../api/v1/settings',
    {},
    {
      update: {method: 'PUT', params: {}, isArray:false}
    });
})

.factory( 'VendorInvoicesRes', function($resource){
  return $resource('../api/v1/vendors/:id/invoices',
    {id: '@id'},
    {
      query: { method: 'GET', params: { id: '@id'}, isArray: true },
      update: {method: 'PUT', params: {id: '@id'}, isArray:false},
      update_all: { method: 'PUT', params: {id: 'update_all'}, isArray: true }
    });
})

.factory( 'EmailRes', function($resource){
  return $resource('../api/v1/emails/:id',
    {id: '@id'},
    {
      query: {method: 'GET', isArray: true},
      update: {method: 'PUT', params: {id: '@id'}, isArray:false}
    });
})

.factory('NumberRes', function($resource){
  return $resource('../api/v1/numbers/:id',
    {id: '@id'},
    {
      query: {method: 'GET', isArray: true},
      update: {method: 'PUT', params: {id: '@id'}, isArray:false}
    });
})

.factory('AddressRes', function($resource){
  return $resource('../api/v1/addresses/:id',
    {id: '@id'},
    {
      query: {method: 'GET', isArray: true},
      update: {method: 'PUT', params: {id: '@id'}, isArray:false}
    });
})
// .factory('SurveyRes', function($resource) {
//   return $resource('../api/v1/surveys/:id?:hitId', { id: '@id', hitId: '@hitId'},{
//     query: { method: 'GET', isArray: true}
//   })
// })
.factory('InvoicesManager', ['$q', 'InvoicesRes', '$rootScope', function($q, InvoicesRes, $rootScope) {
  var invoicesManager = {
    _retrieveInstance: function(invoiceId, invoiceData) {
      var instance = this._search(invoiceId);

      if (instance) {
        instance = invoiceData;
      } else {
        instance = new InvoicesRes(invoiceData);
      }

      return instance;
    },
    _search: function(invoiceId) {
      return _.find($rootScope.invoices, function(invoice){ return invoice.id == invoiceId; });
    },
    _load: function(invoiceId, deferred, hitId) {
      var scope = this;

      InvoicesRes.get({id: invoiceId, hit_id: hitId}, function(invoiceData) {
        var invoice = scope._retrieveInstance(invoiceData.id, invoiceData);
        deferred.resolve(invoice);
      },
      function() {
        deferred.reject();
      });
    },
    /* Public Methods */
    /* Use this function in order to get a invoice instance by it's id */
    getInvoice: function(invoiceId, hitId) {
      var deferred = $q.defer();
      if(invoiceId){
        var invoice = this._search(invoiceId);
        if (invoice) {
          deferred.resolve(invoice);
        } else {
          this._load(invoiceId, deferred, hitId);
        }
      }else{
        deferred.resolve(new InvoicesRes());
      }
      return deferred.promise;
    },
    /* Use this function in order to get instances of all the invoices */
    loadAllInvoices: function() {
      var deferred = $q.defer();
      var scope = this;

      InvoicesRes.query(function(invoicesArray) {
          $rootScope.invoices = invoicesArray;
          deferred.resolve($rootScope.invoices);
      }, function() {
          deferred.reject();
      });

      return deferred.promise;
    },
    loadInvoicesByStatus: function(statusArray){
      return _.filter($rootScope.invoices,function(invoice){
        return _.indexOf(statusArray, invoice.status) !== -1;
      });
    },
    less_than_30: function(){
      return _.filter($rootScope.invoices,function(invoice){
        if(invoice.due_date){
          var today = new Date();
          var dd = today.getDate() - 1;
          var mm = today.getMonth()+2; //January is 0 and we need to add 1 to get next month
          var yyyy = today.getFullYear();
          var oneMonthFromToday = new Date(mm+'/'+dd+'/'+yyyy);
          var due_date_array = invoice.due_date.split("-");
          var due_date = new Date(due_date_array[1]+'/'+due_date_array[2]+'/'+due_date_array[0]);
          var timeDiff = Math.abs(due_date.getTime() - oneMonthFromToday.getTime());
          var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

          return diffDays > 0 && diffDays < 30;

        }else{
          return false;
        }
      });
    },
    more_than_30: function(){
      return _.filter($rootScope.invoices,function(invoice){
        if(invoice.due_date){
          var today = new Date();
          var dd = today.getDate() - 1;
          var mm = today.getMonth() + 2; //January is 0 and we need to add 1 to get next month
          var yyyy = today.getFullYear();
          var oneMonthFromToday = new Date(mm+'/'+dd+'/'+yyyy);
          var due_date_array = invoice.due_date.split("-");
          var due_date = new Date(due_date_array[1]+'/'+due_date_array[2]+'/'+due_date_array[0]);
          var timeDiff = Math.abs(due_date.getTime() - oneMonthFromToday.getTime());
          var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
          return diffDays > 30;

        }else{
          return false;
        }
      });
    },
    /*  This function is useful when we got somehow the invoice data and we wish to store it or update the pool and get a invoice instance in return */
    updateInvoice: function(invoice) {
      var deferred = $q.defer();
      var that = this;
      invoice.$update(function(invoice){
        that._retrieveInstance(invoice.id, invoice);
        deferred.resolve(invoice);
      },function() {
        deferred.reject();
      });
      return deferred.promise;
    },
    saveInvoice: function(invoice){
      var deferred = $q.defer();
      var that = this;
      invoice.$save(function(invoice){
        that._retrieveInstance(invoice.id, invoice);
        deferred.resolve(invoice);
      }, function(response){
        deferred.reject(response);
      });
      return deferred.promise;
    }

  };
  return invoicesManager;
}]);
