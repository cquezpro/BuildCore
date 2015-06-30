angular.module('billsync.controllers')

.controller('UserEditCtrl', function($scope, $http, $baseUrl, $state, $stateParams, $ionicPopup,$ionicLoading,$ionicModal,$rootScope,CurrentIndividualRes) {



  $scope.ind = {};
  $scope.scopesSelected = [];


	$scope.initUserEditCtrl = function(){
	  
	  $scope.roles = $rootScope.roles;
	  if($stateParams.id !== null && $stateParams.id !== "" && $stateParams.id !== undefined){
	  	$scope.editUserUrl = $baseUrl + '/api/v1/individuals/' + $stateParams.id;
	  	$scope.ind = $rootScope.individual;
	  }else{
	  	$scope.ind = {};
	  }

	};


   $scope.getIndividual = function(){
   	$ionicLoading.show({
      template: 'Loading...'
    });
    $http.get(userUrl)
      .success(function(response) {
      	  $scope.ind = response;
      }).finally(function () {
        $ionicLoading.hide();
      });
   };

   $scope.isSelectedScope = function(s){
   	if($scope.ind.authorization_scopes !== null && $scope.ind.authorization_scopes !== undefined){
	  	for(var i = 0;i<$scope.ind.authorization_scopes.length;i++){
	  		if($scope.ind.authorization_scopes[i].id == s.id){
	  			return true;
	  		}
	  	}
   	}
	return false;
  };

  $scope.showScopes = function(){
  	  
  	  $scope.scopesSelected = $scope.scopes;
  	  for(var i = 0; i<$scope.scopesSelected.length;i++){
  	  	if($scope.isSelectedScope($scope.scopesSelected[i])){
  	  		$scope.scopesSelected[i].selectedScope=true;
  	  	}else{
  	  		$scope.scopesSelected[i].selectedScope=false;
  	  	}
  	  }


	  $ionicModal.fromTemplateUrl('templates/scopes.html', {
	    scope: $scope
	  }).then(function(modal) {
	    $scope.modal = modal;
	    $scope.modal.show();
	  });
  };

  $scope.getScopes = function(){
  	/*$ionicLoading.show({
      template: 'Loading...'
    });*/
    $http.get($baseUrl + '/api/v1/individuals/authorization_scopes')
      .success(function(response) {
      	  $scope.scopes = response;
      }).finally(function () {
        //$ionicLoading.hide();
      });
  };
  
  $scope.scopesText = "";
  $scope.selectScopes = function(){
  	$scope.modal.hide();

	var match = 0;
	$scope.ind.authorization_scopes=[];
  	for(var i = 0;i<$scope.scopesSelected.length;i++){
  		if($scope.scopesSelected[i].selectedScope){
  			$scope.ind.authorization_scopes.push({
  				id:$scope.scopesSelected[i].id,
  				name:"'" + $scope.scopesSelected[i].name + "'",
  				type:"'" + $scope.scopesSelected[i].type + "'"
  			});
  			if(match === 0){
				$scope.scopesText = $scope.scopesSelected[i].name;
  			}else{
				$scope.scopesText = $scope.scopesText + "," + $scope.scopesSelected[i].name;
  			}
  			match++;
  		}
  	}

  	console.log($scope.ind.authorization_scopes);

  };

  $scope.close = function(){
	$scope.modal.hide();
  };

  $scope.getScopes();

  $scope.saveUser = function(){

  	$ionicLoading.show({
      template: 'Saving...'
    });


  	if($stateParams.id !== null && $stateParams.id !== "" && $stateParams.id !== undefined){
  		$http.put($baseUrl + '/api/v1/individuals/' + $scope.ind.id, $scope.ind)
	  	.success(function (resp) {
			console.log(resp);
			$ionicLoading.hide();
			//$state.transitionTo('app.users', {reload: true});
			$scope.getIndividuals();
			
	  	})
	  	.error(function (err) {
	    	$scope.saveResult = { text: 'There are errors.', saved: false, saving: false };
	    	$ionicLoading.hide();
		});
  	}else{
        $http.post($baseUrl + '/api/v1/individuals', $scope.ind)
          .success(function (resp) {
			console.log(resp);
			$ionicLoading.hide();
			//$state.transitionTo('app.users', {reload: true});
			$scope.getIndividuals();
          })
          .error(function (err) {
          	console.log(err);
          	$scope.saveResult = { text: 'There are errors.', saved: false, saving: false };
	    	$ionicLoading.hide();
          });
  	}





  };

  var respondToSuccess = function(response) {
  	console.log(response);
  	$ionicLoading.hide();
  };

  var respondToFailure = function(response) {
	console.log(response);
  	$ionicLoading.hide();
  };

  $scope.initUserEditCtrl(); 
  

  $scope.getIndividuals = function() {
    $http.get($baseUrl + '/api/v1/individuals.json')
      .success(function(response) {
        $rootScope.individuals = Array.isArray(response) ? response : [response];

        $rootScope.individuals.forEach(function (ind) {
          if($scope.roles !== null && $scope.roles !== undefined){
            $scope.roles.forEach(function (role) {
              if (ind.role_id === role.id)
                ind.role_name = role.name;
            });
          }
        });
        $ionicLoading.hide();
        console.log($rootScope.individuals);
      	$state.go('app.users', {}, {reload: true});

      });
  };

});