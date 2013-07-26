;(function(){
	'use strict';

	var obj,
		wrap = function(Events){
			var e = new Events();
			e.Events = Events;
			return e;
		};

	// by default, requiring Epitome returns an Epitome.Events instance as a mediator
	if (typeof define === 'function' && define.amd){
		// returns an empty module
		define(['./epitome-events'], wrap);
	}
	else if (typeof module !== 'undefined' && module.exports){
		// CommonJS module is defined
		// load mootools-core npm
		require('mootools');

		obj = wrap(require('./epitome-events'));

		// export all sub modules that work w/o a browser.
		obj.Model = require('./epitome-model');
		obj.Collection = require('./epitome-collection');
		obj.isEqual = require('./epitome-isequal');
		obj.Template = require('./epitome-template');

		module.exports = obj;
	}
	else {
		this.Epitome = wrap(this.Epitome.Events);
	}
}.call(this));