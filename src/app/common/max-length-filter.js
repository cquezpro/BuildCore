angular.module( 'billsync.filters', [])
.filter('maxLength', function() {
	return function(input, maxLength) {
		if (! input) {
			return '';
		} else {
			var output = input.substring(0, maxLength).trim();
			if (output.length < input.length) {
				output += '...';
			}
			return output;
		}
	};
});
