angular.module('billsync.controllers')

.controller('CaptureCtrl', function($scope, $http, $baseUrl, $state, $ionicPopup, $ionicLoading) {

    $scope.picNum = -1;
    $scope.imgSrcs = [];

	function makeid()
	{
	    var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	    for( var i=0; i < 5; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));

	    return text;
	}

    function guid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +   s4() + '-' + s4() + s4() + s4();
    }

    function takePicture() {
        /*navigator.camera.getPicture(onSuccess, onFail, {
            allowEdit: false
        });*/
		var filename = makeid() + ".jpg";
        navigator.customCamera.getPicture(filename, function success(imageURI) {
		    //alert("File location: " + imageURI);
		    $scope.$apply(function() {
	            if ($scope.picNum === -1) {
	                $scope.imgSrcs.push(imageURI);
	                $scope.picNum = $scope.imgSrcs.length - 1;
	                $scope.imgSrc = imageURI;
	            } else {
	                $scope.imgSrcs.push(imageURI);
	                $scope.imgSrc = imageURI;
	            }
	        });
		}, function failure(error) {
		    alert(error);
		}, {
		    quality: 60,
		    targetWidth: -1,
		    targetHeight: -1
		});
    }

    function onSuccess(imageURI) {
        $scope.$apply(function() {
            if ($scope.picNum === -1) {
                $scope.imgSrcs.push(imageURI);
                $scope.picNum = $scope.imgSrcs.length - 1;
                $scope.imgSrc = imageURI;
            } else {
                $scope.imgSrcs[$scope.picNum] = imageURI;
                $scope.imgSrc = imageURI;
            }
        });
    }

    function onFail(message) {
        alert('Failed because: ' + message);
    }

    function uploadFiles(fd, index) {

        if(fd.length > index) {
            if(index === 0) {
                $ionicLoading.show({
                  template: 'Please wait...'
                });
            }

            // var sendObj = [];
            console.log(guid());
            var sendObj= {"files": [fd[index]], uniq:guid()};
            //console.log(JSON.stringify(sendObj));
            
            //console.log(fd);        
            $http.post($baseUrl + '/api/v1/invoices/by_upload', sendObj, {})
                .success(function() {
                    if(fd.length == index+1) {
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: 'Uploaded',
                            template: 'We received your files.'
                        });
                        $state.transitionTo('app.tabs.home');
                    }
                    else
                        uploadFiles(fd, index+1);
                })
                .error(function(err) {
                    $ionicLoading.hide();
                    $ionicPopup.alert({
                        title: 'Upload failed',
                        template: angular.toJson(err) + ' Try again.'
                    });
                });
        }
    }

    $scope.retake = function() {
        takePicture();
    };

    $scope.addPage = function() {
        $scope.picNum = -1;
        takePicture();
    };

    $scope.submit = function() {
        //var fd = new FormData(),      appFiles = 0;
        var fd = [],      appFiles = 0;

        $scope.imgSrcs.forEach(function(imgSrc, idx, iSs) {
            window.resolveLocalFileSystemURL(imgSrc, function(fileEntry) {
                fileEntry.file(function(file) {
                    reader = new FileReader();
                    reader.onloadend = function(fileReadResult) {
                         /*var c=document.createElement('canvas');
                         var ctx=c.getContext("2d");
                         var img=new Image();
                         img.onload = function(){
                           c.width=this.width;
                           c.height=this.height;
                           ctx.drawImage(img, 0,0);
                         };
                         img.src=imgSrc;
                         var data = c.toDataURL("image/jpeg");*/
                         
                        var uInt8Array = new Uint8Array(fileReadResult.target.result);
                        var i = uInt8Array.length;
                        var binaryString = new Array(i);
                        while (i--)
                        {
                          binaryString[i] = String.fromCharCode(uInt8Array[i]);
                        }
                        var data = binaryString.join('');

                        var base64 = window.btoa(data);
                       // console.log(fileReadResult.target.result);
                        base64 = "data:image/jpeg;base64," + base64;
 						  
                         fd.push(base64);
	                      
	                     appFiles++;
                         console.log(appFiles);
                    	 if (appFiles === iSs.length) {
                    	 	console.log("will start upload");
                    	 	uploadFiles(fd, 0);
                    	 }
                    };
                    reader.readAsArrayBuffer(file);
                });
            });
        });
    };

    $scope.previousPage = function() {
        $scope.picNum--;
        $scope.imgSrc = $scope.imgSrcs[$scope.picNum];
    };

    $scope.nextPage = function() {
        $scope.picNum++;
        $scope.imgSrc = $scope.imgSrcs[$scope.picNum];
    };

    takePicture();

});