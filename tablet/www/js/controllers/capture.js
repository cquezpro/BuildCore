angular.module('billsync.controllers')

.controller('CaptureCtrl', function($scope, $http, $baseUrl, $state, $ionicPopup) {

	$scope.picNum = -1;
	$scope.imgSrcs = [];

	function takePicture () {
		navigator.camera.getPicture(onSuccess, onFail, {allowEdit: false});
	}

	function onSuccess(imageURI) {
    $scope.$apply(function () {
    	if ($scope.picNum === -1) {
    		$scope.imgSrcs.push(imageURI);
    		$scope.picNum = $scope.imgSrcs.length - 1;
    		$scope.imgSrc = imageURI;
    	}
    	else {
    		$scope.imgSrcs[$scope.picNum] = imageURI;
    		$scope.imgSrc = imageURI;
    	}
    });
	}

	function onFail(message) {
    alert('Failed because: ' + message);
	}

	function uploadFiles (fd) {
		$http.post($baseUrl + '/api/v1/invoices/by_upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
			.success(function () {
				$ionicPopup.alert({
          title: 'Uploaded',
          template: 'We received your files.'
        });
        $state.transitionTo('app.tabs.home');
			})
			.error(function (err) {
				$ionicPopup.alert({
          title: 'Upload failed',
          template: angular.toJson(err) + ' Try again.'
        });
			});
	}

	$scope.retake = function () {
		takePicture();
	};

	$scope.addPage = function () {
		$scope.picNum = -1;
		takePicture();
	};

	$scope.submit = function () {
		var fd = new FormData(),
			appFiles = 0;
		$scope.imgSrcs.forEach(function (imgSrc, idx, iSs) {
			window.resolveLocalFileSystemURL(imgSrc, function (fileEntry) {
				fileEntry.file(function (file) {
					reader = new FileReader();
	    		reader.onloadend = function (fileReadResult) {
	    			var data = new Uint8Array(fileReadResult.target.result);
			      fd.append('files[]', new Blob([data], {type: file.type}), file.name);
			    	appFiles++;
						if (appFiles === iSs.length) {
							uploadFiles(fd);
						}  
	    		};
	    		reader.readAsArrayBuffer(file);

					// fd.append('files[]', file);
					// appFiles++;
					// if (appFiles === iSs.length) {
					// 	uploadFiles(fd);
					// }
				});
			});
		});
	};

	$scope.previousPage = function () {
		$scope.picNum--;
		$scope.imgSrc = $scope.imgSrcs[$scope.picNum];
	};

	$scope.nextPage = function () {
		$scope.picNum++;
		$scope.imgSrc = $scope.imgSrcs[$scope.picNum];
	};

	takePicture();

});