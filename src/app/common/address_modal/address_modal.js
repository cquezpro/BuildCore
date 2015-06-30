var AddressModalController = ['$scope', '$modalInstance', '$http', function($scope, $modalInstance) {
  console.log('hue opened!');
  console.log($scope.address);

  $scope.canselAndCloseModal = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.http_request = false;
  $scope.save = function() {
    $scope.http_request = true;
    if ($scope.address.id) {
      $scope.address.$update(callbackSucess, callbackError);
    } else {
      $scope.address.$save(callbackSucess, callbackError);
    }
  };

  var callbackSucess = function(response) {
    $scope.http_request = false;
    console.log('saved success');
    $modalInstance.close();
  };

  var callbackError = function(response) {
    $scope.http_request = false;
    console.log('error:', response);
  };

}];
