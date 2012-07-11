/*jshint mootools:true */
;(function(exports) {
	'use strict';

	// this is just the host object for the MVC toolkit.
	var Epitome = {};

	// Expose the class for AMD, CommonJS and browsers
	if (typeof define === 'function' && define.amd) {
		define('epitome', function() {
			return Epitome;
		});
	}
	else if (typeof module === 'object') {
		module.exports = Epitome;
	}
	else {
		exports.Epitome = Epitome;
	}
}(this));