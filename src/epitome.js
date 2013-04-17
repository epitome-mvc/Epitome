/*jshint mootools:true */
;(function(exports){
	'use strict';

	var wrap = function(Events){
		var e = new Events();
		e.Events = Events;
		return e;
	};

	// by default, requiring Epitome returns an Epitome.Events instance as a mediator
	if (typeof define === 'function' && define.amd){
		// returns an empty module
		define(['./epitome-events'], wrap);
	}
	else {
		exports.Epitome = wrap(exports.Epitome.Events);
	}
}(this));