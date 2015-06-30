/**
* Dilbert Module
*
* Fetch Dilbert img from rss
*/
angular.module('billsync.dilbert', [])
.factory('DilbertRss', ['$http', '$rootScope', function($http, $rootScope){
  var getRss = function() {
    $http.get('/api/v1/dilbert_images').success(function(response) {
      $rootScope.dilbertRecord = response[0];
    });
  };

  return { getRss: getRss };
}]);
