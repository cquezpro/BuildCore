angular.module('billsync.controllers')

.controller('SettingCtrl',  function($scope, $http, $baseUrl, $state, $ionicLoading, $ionicModal, Auth, CurrentIndividualRes) {

  $scope.groups = [{name:"E-mail Notifications"},{name:"Text Notifications"}];

  $scope.toggleTab = function(group) {
    if(group == 'email'){
      if($scope.emailShow){
        $scope.emailShow=false;
      }else{
        $scope.emailShow=true;
      }
    }
    if(group == 'text'){
      if($scope.textShow){
        $scope.textShow=false;
      }else{
        $scope.textShow=true;
      }
    }
  };

  $scope.saveUser = function() {
    $ionicLoading.show({
      template: 'Saving...'
    });
    //$scope.currentIndividual.user.signature = signaturePad.toDataURL();
    $scope.currentIndividual.emails = $scope.emails;
    $scope.currentIndividual.numbers = $scope.numbers;
    var individual = new CurrentIndividualRes({individual: $scope.currentIndividual});
    individual.$update(respondToSuccess, respondToFailure);
  };

  var respondToSuccess = function(response) {
    $ionicLoading.hide();
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
    $ionicLoading.hide();
  };


});