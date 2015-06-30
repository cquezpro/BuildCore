var addBillsModalCtrl = ['$scope', '$modalInstance', '$http', '$timeout', '$rootScope', function($scope, $modalInstance, $http, $timeout, $rootScope) {
  $scope.uploading = false;
  $scope.showFiles = false;

  $scope.files = [];

  function handleFiles (files) {
    $scope.files.push(files);
    $scope.showFiles = true;
    console.log('here');
    for (var i = 0; i < files.length; i++) {
      $('#fileList').append('<h5>' + files[i]['name'] +'</h5>');
    }
    $rootScope.$apply();
  }

  $modalInstance.opened.then(function(){

    $timeout(function(){
      holder = document.getElementById("modalDropBox");
      holder.ondragover = function () {return false; };
      holder.ondragend = function () {return false; };
      holder.ondrop = function (e) {
        e.preventDefault();
        handleFiles(e.target.files || e.dataTransfer.files);
      };

      document.getElementById("fileUploadButton").addEventListener('change', function(evt){
        var files = evt.target.files;
        console.log('here');
        handleFiles(files);
      });
    }, 1000);


  });

  $scope.upload = function () {
    $scope.uploading = true;

    var fd = new FormData();

    for(var i = 0; i < $scope.files[0].length; i++){
      fd.append("files[]", $scope.files[0][i]);
    }


    $.ajax({
      url: '/api/v1/invoices/by_upload',
      type: "POST",
      data: fd,
      processData: false,
      contentType: false,
      success: function(response) {
        respondToSuccess(response);
      },
      error: function(response) {
        respondToFailure(response);
      }
    });
    //$http.post('/api/v1/invoices/by_upload',{ files: data }).success(respondToSuccess).error(respondToFailure);
  };

  $scope.canselAndCloseModal = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.uploadSuccess = function(response) {
    $scope.uploading = false;
    $.each(response.data, function(index, item) {
      $scope.images.push(item);
    });
  };

  $scope.removeImage = function(image) {
    $scope.images.splice($scope.images.indexOf(image), 1);
    if ($scope.selected_image === image) {
      $scope.selected_image = $scope.images[0];
    }
  };

  $scope.setUploadingActions = function() {
    $scope.uploading = true;
  };

  $scope.setUploadingActionsError = function(response) {
    $scope.uploading = false;
  };

  var respondToSuccess = function(response) {
    $scope.$emit('refresh:invoices');
    $modalInstance.close();
  };

  var respondToFailure = function(response) {
    $modalInstance.dismiss('cancel');
  };
}];
