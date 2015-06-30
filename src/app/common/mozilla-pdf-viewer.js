angular.module( 'billsync.pdf', [])
.directive('mozillaPdfViewer', ["$interval", function($interval){
  return {
    scope: {
      file: '=',
      pdfPage: '=',
      itemHit: '='
    },
    restrict: 'EA',
    templateUrl: 'common/mozilla-pdf-viewer.tpl.html',
    link: function($scope, element, iAttrs, controller) {
      var hideElements = function() {
        if ($scope.itemHit) {
          setTimeout(function () {
            var viewer = $('#viewer').contents();
            viewer.find('#viewFind, #previous, #next, #pageNumber, #pageNumberLabel, #numPages, #sidebarToggle, #viewBookmark, #secondaryToolbarToggle').hide();
            viewer.find('.page').hide();
            viewer.find('#pageContainer' + $scope.page).show();
          }, 600);
          $interval(function () {
            var viewer = $('#viewer').contents();
            viewer.find('#viewFind, #previous, #next, #pageNumber, #pageNumberLabel, #numPages, #sidebarToggle, #viewBookmark, #secondaryToolbarToggle').hide();
            viewer.find('.page').hide();
            viewer.find('#pageContainer' + $scope.page).show();
          }, 200);
        }
      };

      $scope.page = $scope.pdfPage || 1;
      hideElements();

      var second, url;
      url     = window.location.protocol + '//' + window.location.host;
      second  = ( $scope.file.search('/system') >= 0 )? url : '';
      $scope.fileName = second + $scope.file.match('.+.pdf')[0];

      $scope.$watch('file', function (newValue, oldValue) {
        if ( newValue != oldValue ) {
          second      = ( newValue.search('/system') >= 0 )? url : '';
          $scope.fileName = second + newValue.match('.+.pdf')[0];
          hideElements();
        }
      });
    }
  };
}]);
