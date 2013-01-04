/*jshint mootools:true */
;(function(exports) {
	'use strict';

	// wrapper function for requirejs or normal object
	var wrap = function() {
		// this is just the host object for the Epitome modules

		(function(){
			var EID = 0;

			var emitter = new Class({
				// custom emitter ported from prime.
				on: function (event, fn) {
					var listeners = this._listeners || (this._listeners = {}),
						events = listeners[event] || (listeners[event] = {}),
						exists = false,
						k;

					for (k in events) if (events[k] === fn) {
						exists = true;
						break
					}

					if (!exists) events[(EID++).toString(36)] = fn;
					return this;
				}.overloadSetter(),

				off: function (event, fn) {
					var listeners = this._listeners,
						events,
						key, k, l, empty, length = 0;

					if (listeners && (events = listeners[event])) {

						if (typeof fn === 'function') {
							for (k in events) {
								length++;
								if (key == null && events[k] === fn) key = k;
								if (key && length > 1) break;
							}

							if (key) {
								delete events[key];
								if (length === 1) {
									delete listeners[event];

									empty = true;
									for (l in listeners) {
										empty = false;
										break;
									}
									if (empty) delete this._listeners;
								}
							}
						}
						else {
							delete listeners[event];
						}
					}
					return this
				}.overloadSetter(),

				emit: function (event) {
					var listeners = this._listeners,
						events,
						k,
						args;

					if (listeners && (events = listeners[event])) {
						args = (arguments.length > 1) ? array.slice(arguments, 1) : [];
						for (k in events) events[k].apply(this, args);
					}
					return this
				}

			});
		}());

		return {
			emitter: emitter
		};
	};

	if (typeof define === 'function' && define.amd) {
		// returns an empty module
		define(wrap);
	}
	else {
		exports.Epitome = wrap(exports);
	}
}(this));