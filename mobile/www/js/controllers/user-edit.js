angular.module('billsync.controllers')

.controller('UserEditCtrl', function($scope, $rootScope, $http, $baseUrl, $state, $stateParams, $ionicPopup,$ionicLoading,$ionicModal,$rootScope) {



  $scope.ind = {};
  $scope.scopesSelected = [];
  $scope.availableScopes = [];


	$scope.initUserEditCtrl = function(){
	  
	  $scope.roles = $rootScope.roles;
	  if($stateParams.id !== null && $stateParams.id !== "" && $stateParams.id !== undefined){
	  	// $scope.editUserUrl = ;
	  	$scope.ind = $rootScope.individual;
	  }else{
	  	$scope.ind = {};
	  }

	};


   $scope.getIndividual = function(){
    if ($stateParams.id) {
      $ionicLoading.show({
        template: 'Loading...'
      });
      $http.get($baseUrl + '/api/v1/individuals/' + $stateParams.id)
      .success(function(response) {
          $scope.ind = response;
      }).finally(function () {
        $ionicLoading.hide();
      });
    }
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
      	  $scope.availableScopes = response;
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

    if ($stateParams.id) {
      $http.put($baseUrl + '/api/v1/individuals/' + $scope.ind.id, $scope.ind)
      .success(function (resp) {
        console.log(resp);
        $ionicLoading.hide();
        $scope.getIndividual();
      })
      .error(function (err) {
        var errors = "";
        if(err.errors.email !== undefined && err.errors.email){
          errors = errors + " Email " + err.errors.email[0] + "<br>";
        }
        if(err.errors.password !== undefined && err.errors.password){
          errors = errors + " Password " + err.errors.password[0] + "<br>";
        }
        if(err.errors.business_name !== undefined && err.errors.business_name){
          errors = errors + " Business name " + err.errors.password[0] + "<br>";
        }
        if(err.errors.mobile_phone !== undefined && err.errors.mobile_phone){
          errors = errors + " Password " + err.errors.mobile_phone[0] + "<br>";
        }

        $ionicPopup.alert({
          title: 'Error singup',
          template: errors
        });

        $scope.saveResult = { text: 'There are errors.', saved: false, saving: false };
        $ionicLoading.hide();
      });
    }
    else {
      $http.post($baseUrl + '/api/v1/individuals/', $scope.ind)
      .success(function (resp) {
        console.log(resp);
        $ionicLoading.hide();
        $state.go('app.users');
      })
      .error(function (err) {
        var errors = "";
        if(err.errors.email !== undefined && err.errors.email){
          errors = errors + " Email " + err.errors.email[0] + "<br>";
        }
        if(err.errors.password !== undefined && err.errors.password){
          errors = errors + " Password " + err.errors.password[0] + "<br>";
        }
        if(err.errors.business_name !== undefined && err.errors.business_name){
          errors = errors + " Business name " + err.errors.password[0] + "<br>";
        }
        if(err.errors.mobile_phone !== undefined && err.errors.mobile_phone){
          errors = errors + " Password " + err.errors.mobile_phone[0] + "<br>";
        }

        $ionicPopup.alert({
          title: 'Error singup',
          template: errors
        });

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

  $scope.getIndividual(); 
});