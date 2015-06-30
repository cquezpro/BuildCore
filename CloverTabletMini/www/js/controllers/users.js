angular.module('billsync.controllers')

.controller('UsersCtrl', function($scope, $http, $baseUrl, $state, $ionicPopup,$ionicLoading,$rootScope) {

	$scope.getIndividuals = function() {
    $http.get($baseUrl + '/api/v1/individuals.json')
      .success(function(response) {
        $rootScope.individuals = Array.isArray(response) ? response : [response];

        $rootScope.individuals.forEach(function (ind) {
          if($scope.roles!=null && $scope.roles!=undefined){
            $scope.roles.forEach(function (role) {
              if (ind.role_id === role.id)
                ind.role_name = role.name;
            });
          }
        });
        $ionicLoading.hide();
        console.log($rootScope.individuals);
      });
  }

  $scope.getRoles = function(callback) {
    $ionicLoading.show({
      template: 'Loading...'
    });
    $http.get($baseUrl + '/api/v1/roles.json')
      .success(function(response) {
        $scope.roles = Array.isArray(response) ? response : [response];
        if (callback)
        	callback();
      });
  };


  $scope.editUser = function(ind){
    $rootScope.individual = ind;
    $rootScope.roles = $scope.roles;
    $state.go('app.userEdit', { id: ind.id });
  };


  $scope.newUser = function(){
    $rootScope.roles = $scope.roles;
    $state.go('app.userEdit', { id: null });
  };

  $scope.getRoles($scope.getIndividuals());



});