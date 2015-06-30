angular.module('inputField',[])
  .directive('inputField', function () {
    return {
      restrict: 'E',
      templateUrl: 'inputField/inputField.tpl.html',
      replace: true,
      transclude: true,
      scope: {
        model: '=',
        errors: '=',
        inputType: '@',
        label: '@',
        classes: '@'
      }
    };
  });
