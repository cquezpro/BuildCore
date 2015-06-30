angular.module('billsync.controllers')

.controller('ProfileCtrl',  function($scope, $http, $baseUrl, $state, $ionicLoading, $ionicModal,$ionicPopup, $rootScope, Auth, CurrentIndividualRes, $ionicScrollDelegate) {


/*if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (function() {
    return window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback, element) {
        window.setTimeout(callback, 1000 / 60);
      };
  })();
}*/

  $scope.signature=null;
  $scope.signaturePad = null;

    $scope.clearCanvas = function() {
        $scope.signaturePad.clear();        
    }
 
    $scope.saveCanvas = function() {
        var sigImg = $scope.signaturePad.toDataURL();
        $scope.currentIndividual.user.signature= sigImg;
        $scope.signatureModal.hide();
    }



  $scope.openSignature = function(){
    if($scope.signatureModal===undefined || $scope.signatureModal===null){
          $ionicModal.fromTemplateUrl('templates/signature.html', {
            scope: $scope
          }).then(function(modal) {
            console.log("$scope.currentIndividual");
            console.log($scope.currentIndividual);
            $scope.signatureModal = modal;
            $scope.signatureModal.show();

            $scope.signaturePad = null;
            //if($scope.signaturePad == null){
              $scope.canvas = $('#signatureCanvas')[0];
              $scope.signaturePad = new SignaturePad($scope.canvas);
            //}

            
            if ($scope.currentIndividual.user.signature) {
             $scope.signaturePad.fromDataURL($scope.currentIndividual.user.signature);
            }

          });
    }else{
      $scope.signatureModal.show();
    }

  };

 $scope.$on('$destroy', function() {
        $scope.signatureModal.remove();
 });

 $scope.save = function() {
  
  $ionicLoading.show({
    template: 'Saving...'
  });
  //$scope.currentIndividual.user.signature = signaturePad.toDataURL();
  $scope.currentIndividual.emails = $scope.emails;
  $scope.currentIndividual.numbers = $scope.numbers;
  var individual = new CurrentIndividualRes({individual: $scope.currentIndividual});
  individual.$update(respondToSuccess, respondToFailure);
  $scope.signaturePad = null;

  //?((d{0,3})|([^#]+)

  //var patt = new RegExp("([0-9]) ? (#{5}[0-9]{4}$)");
  /*var patt = new RegExp("#*[0-9]*$");
  var validRoutingNumber = patt.test($scope.currentIndividual.user.routing_number);
  var patt2 = new RegExp("#*[0-9]*$");
  var validBankAccount = patt2.test($scope.currentIndividual.user.routing_number);

      if(!validRoutingNumber || !validBankAccount){
        var errors = "";
        
        if(!validRoutingNumber){
          errors = errors + " Please enter a valid routing number <br>";
        }
        if(!validBankAccount){
          errors = errors + " Please enter a valid bank account <br>";
        }

        $ionicPopup.alert({
            title: 'Error',
            template: errors
        });

      }else{
          $ionicLoading.show({
            template: 'Saving...'
          });
          //$scope.currentIndividual.user.signature = signaturePad.toDataURL();
          $scope.currentIndividual.emails = $scope.emails;
          $scope.currentIndividual.numbers = $scope.numbers;
          var individual = new CurrentIndividualRes({individual: $scope.currentIndividual});
          individual.$update(respondToSuccess, respondToFailure);
          $scope.signaturePad = null;
      }*/

  };

  var respondToSuccess = function(response) {
    $ionicLoading.hide();
    Auth._currentUser = response;
    $scope.$emit('refresh:currentIndividual', {individual: response});
    try {
      $scope.mainErrors = [];
      //$scope.back();
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

  $scope.sending_request_verification = false;
  $scope.verifyBankInformation = function() {
      $ionicLoading.show({
        template: 'Saving...'
      });
      $scope.sending_request_verification = true;
      var params = {
        one: $scope.currentIndividual.verify_one,
        two: $scope.currentIndividual.verify_two
      };
      $http.post($baseUrl + '/api/v1/settings/verify_bank_information', params).success(function(response) {
        $scope.reinitializeIndividualVerifyForm();
        $ionicLoading.hide();
        $("#verificationContainer").hide();
      }).error(function(response) {
        $scope.reinitializeIndividualVerifyForm();
        $scope.errors = response;
        $ionicPopup.alert({
            title: 'Error',
            template: 'The amount is incorrect'
        });

        $ionicLoading.hide();
      });
  };
  $scope.reinitializeIndividualPasswordForm = function() {
      $scope.currentIndividual.current_password = '';
      $scope.currentIndividual.password = '';
      $scope.currentIndividual.password_confirmation = '';
      $scope.individualParams = {};
      $scope.sending_request = false;
  };
  $scope.reinitializeIndividualVerifyForm = function() {
      $scope.currentIndividual.verify_one = null;
      $scope.currentIndividual.verify_two = null
      $scope.sending_request_verification = false;
  };


 
  $scope.showBoxes=true;
  $scope.businessBox=false;
  $scope.paymentBox=false;
  $scope.userBox=false;
  $scope.passwordBox=false;

  $scope.editBusiness = function(){
    $ionicScrollDelegate.scrollTop();
    $scope.showBoxes=false;
    $scope.businessBox=true;
  };

  $scope.editPayment = function(){
     $ionicScrollDelegate.scrollTop();
    $scope.showBoxes=false;
    $scope.paymentBox=true;
  };

  $scope.editUser = function(){
     $ionicScrollDelegate.scrollTop();
    $scope.showBoxes=false;
    $scope.userBox=true;
  };

  $scope.editPassword = function(){
     $ionicScrollDelegate.scrollTop();
    $scope.showBoxes=false;
    $scope.passwordBox=true;
  };

  $scope.savePassword = function() {
    $scope.sending_request = true;
    $scope.individualParams = {
      current_password: $scope.currentIndividual.current_password,
      password: $scope.currentIndividual.password,
      password_confirmation: $scope.currentIndividual.password_confirmation
    };
    
    $http.post($baseUrl + '/api/v1/settings/password', $scope.individualParams).success(function(response) {
      $scope.errors = {};
      $scope.reinitializeIndividualPasswordForm();
    }).error(function(response) {
      $scope.reinitializeIndividualPasswordForm();
      $scope.errors = response;
    });
  };

  $scope.cancel = function() {
    $ionicScrollDelegate.scrollTop();
    //$scope.back();
    $scope.showBoxes=true;
    $scope.businessBox=false;
    $scope.paymentBox=false;
    $scope.userBox=false;
    $scope.passwordBox=false;
  };
});