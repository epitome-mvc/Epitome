/*jshint mootools:true */
;(function(exports) {
	'use strict';

	// wrapper function for requirejs or normal object
	var wrap = function() {
		// this is just the host object for the Epitome modules
		return {};
	};

	if (typeof define === 'function' && define.amd) {
		// returns an empty module
		define(wrap);
	}
	else {
		exports.Epitome = wrap(exports);
	}
}(this));