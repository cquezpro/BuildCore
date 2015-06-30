angular.module( 'billsync.services')
.directive('pdfViewer', ['$baseUrl', function($baseUrl){
  return {
    scope: {
      file: '='
    },
    restrict: 'EA',
    templateUrl: 'templates/pdf-viewer.html',
    link: function($scope, element, iAttrs, controller) {
      var second;
      // url     = window.location.protocol + '//' + window.location.host;
      // second  = ( $scope.file.search('/system') >= 0 ) ? url : '';
      // $scope.fileName = second + $scope.file.match('.+.pdf')[0];
      $scope.$watch('file', function (newValue, oldValue) {
        if ( newValue != oldValue ) {
          second      = ( newValue.search('/system') >= 0 )? $baseUrl : '';
          $scope.fileName = second + newValue.match('.+.pdf')[0];
        }
      });
    }
  };
}]);
