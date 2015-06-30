angular.module( 'billsync.filters')
.filter('maxLength', function() {
  return function(input, maxLength) {
    if (! input) {
      return '';
    } else {
    	var output;
    	if (input.length <= maxLength) {
    		return input;
    	}
    	else {
    		return input.substring(0, maxLength).trim() + '...';	
    	}
    }
  };
});
