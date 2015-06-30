/**
* billsync.directives Module
*
* A bunch of directives used over app
*/
angular.module('billsync.directives', [])

.directive('checklist', ['$http', '$rootScope', '$ionicModal', 'CurrentIndividualRes','$baseUrl', '$state',
function($http, $rootScope, $ionicModal, CurrentIndividualRes, $baseUrl, $state){
  return {
    // scope: {}, // {} = isolate, true = child, false/undefined = no change
    // controller: function($scope, $element, $attrs, $transclude) {},
    restrict: 'E',
    templateUrl: 'templates/checklist.tpl.html',
    link: function($scope, iElm, iAttrs, controller) {
      $rootScope.checklists = [
        { done: true,  msg: "Sign up" },//signUp:        0
        { done: false,  msg: "Add email" },//email:         1
        { done: false,  msg: "Add mobile number" },//mobileNumber:  2
        { done: false, msg: "Confirm email" },//confirmedEmail: 3
        { done: false, msg: "Add first bill (text, email, upload)" },//firstBill:     4
        { done: false, msg: "Add banking information" },//bankInfo:      5
        { done: false, msg: "Pay first bill on Due Date", disabled: true },//firstPayd:     6
        { done: false, msg: "Setup an auto-pay", disabled: true }//autoPay:       7
      ];

      $scope.$watch('currentIndividual', function (individual, oldIndividual) {
        if ( individual || oldIndividual) {
          var this_individual = individual || oldIndividual;

          $rootScope.checklists[1].done = this_individual.user.has_email;

          $rootScope.checklists[2].done = this_individual.user.has_mobile_number;
          $rootScope.checklists[2].url = 'app.tabs.profile';
          $rootScope.checklists[2].internal = true;

          $rootScope.checklists[3].done = this_individual.user.confirmed_email;

          $rootScope.checklists[4].done = this_individual.user.has_bills;
          $rootScope.checklists[4].url = 'http://bill-sync.com/save-time-take-a-picture-and-move-on/';

          $rootScope.checklists[5].done = this_individual.user.valid_user;
          $rootScope.checklists[5].url = 'app.tabs.profile';
          $rootScope.checklists[5].internal = true;

          $rootScope.checklists[6].done = this_individual.user.pay_first_bill;
          $rootScope.checklists[6].url = 'http://bill-sync.com/stay-focused-getting-to-know-the-home-screen/';

          $rootScope.checklists[7].done = this_individual.user.has_autopay;
          $rootScope.checklists[7].url = 'http://bill-sync.com/intelligent-auto-pay/';

          $rootScope.checkListValue = $scope.getCompletationPersent();

          if ($rootScope.checklists[4].done) {
            $rootScope.checklists[6].disabled = false;
            $rootScope.checklists[7].disabled = false;
          }

        }
      });

      $rootScope.valueBadge = 0;
      $scope.getCompletationPersent = function () {
        var percent = 0;
        angular.forEach($rootScope.checklists, function (list) {
          if ( list.done ) {
            percent++;
          }
          return true;
        });
        $rootScope.valueBadge = 8 - percent;
        return 8 - percent;
      };
      /*$scope.getCompletationPersent = function () {
        var percent = 0;
        angular.forEach($rootScope.checklists, function (list) {
          if ( list.done ) {
            percent++;
          }
          return true;
        });

        return 8 - percent;
      };*/

      $scope.toggleChecklist = function(){

      };

      $scope.openUrl = function (check) {
        if (check.internal) {
          $scope.popover.hide();
          $state.go(check.url);
        }
        else {
          window.open(check.url, '_system');
        }
      };
      /*$scope.unlockTreat = function() {
        var modalInstance = $modal.open({
          templateUrl: 'common/dilbert-completation-checklist.tpl.html',
          size: 'lg',
          controller: function ($scope, $modalInstance) {
            $scope.close = function () {
              $modalInstance.dismiss('cancel');
            };
          }
        });

        modalInstance.result.then(function () {
          $scope.markModalUsed();
          console.log('Upload Completed!');
        }, function () {
          $scope.markModalUsed();

          console.log('Modal dismissed at: ' + new Date());
        });
      };

      $scope.markModalUsed = function() {
        $scope.individualResource = new CurrentIndividualRes($scope.currentIndividual);
        $scope.individualResource.user.modal_used = true;
        $scope.individualResource.$update(function(response) {
          console.log('scucess');
          $scope.$emit('refresh:currentIndividual', {individual: response});
        });
      };*/

    }
  };
}]);