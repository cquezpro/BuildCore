angular.module('billsync.controllers')

.controller('UsersCtrl', function($scope, $rootScope, $http, $baseUrl, $state, $ionicLoading, $ionicPopup) {

	function getIndividuals () {
    $http.get($baseUrl + '/api/v1/individuals.json')
      .success(function(response) {
        $scope.individuals = Array.isArray(response) ? response : [response];
        $scope.individuals.forEach(function (ind) {
        	$scope.roles.forEach(function (role) {
        		if (ind.role_id === role.id)
        			ind.role_name = role.name;
        	});
        });
        $ionicLoading.hide();
      });
  }

  function getRoles (callback) {
    $ionicLoading.show({
      template: 'Loading...'
    });
    $http.get($baseUrl + '/api/v1/roles.json')
      .success(function(response) {
        $scope.roles = Array.isArray(response) ? response : [response];
        if (callback)
        	callback();
      });
  }

  $scope.editUser = function(ind){
    $rootScope.individual = ind;
    $rootScope.roles = $scope.roles;
    $state.go('app.userEdit', { id: ind.id });
  };


  $scope.newUser = function(){
    $rootScope.roles = $scope.roles;
    $state.go('app.userEdit', { id: null });
  };

  getRoles(getIndividuals);

});