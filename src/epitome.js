/*jshint mootools:true */
;(function(exports){
	'use strict';

	// wrapper function for requirejs or normal object
	var wrap = function(){
		// this is just the host object for the Epitome modules
		Events.prototype.$subscribers = {};

		var removeOn = function(string){
				return string.replace(/^on([A-Z])/, function(full, first){
					return first.toLowerCase();
				});
			},
			addEvent = function(type, fn, internal){
				type = removeOn(type);

				this.$events[type] = (this.$events[type] || []).include(fn);
				return this;
			}.overloadSetter(),
			removeEvent = function(type, fn){
				// does not remove remote subscribers. careful, can cause memory issues if you don't clean up
				type = removeOn(type);
				var events = this.$events[type];
				if (events){
					var index = events.indexOf(fn);
					if (index != -1) delete events[index];
				}
				return this;
			}.overloadSetter(),
			all = '*',
			EEvents = new Class({

				Extends: Events,

				on: addEvent,

				off: removeEvent,

				trigger: function(type, args, delay){
					type = removeOn(type);
					var events = this.$events[type] || [],
						subs = (type in this.$subscribers) ? this.$subscribers[type] : (all in this.$subscribers) ? this.$subscribers[all] : [],
						self = this;

					if (!events && !subs) return this;
					args = Array.from(args);

					events.each(function(fn){
						if (delay) fn.delay(delay, self, args);
						else fn.apply(self, args);
					});

					subs.each(function(sub){
						if (delay) sub.fn.delay(delay, sub.context, args);
						sub.fn.apply(sub.context, args);
					});

					return this;
				},

				listenTo: function(obj, type, fn){
					// obj: instance to subscribe to
					// type: particular event type or all events, defaults to '*'
					// last argument is the function to call, can shift to 2nd argument.
					if (typeof type === 'function'){
						fn = type;
						type = all;
					}

					obj.$subscribers[type] = (obj.$subscribers[type] || []).include({
						context: obj,
						fn: fn
					});
				},

				stopListening: function(obj, type, fn){
					// obj: instance to stop listening to
					// type: particular event to unsubscribe from, or all events by default. '*' for wildcard events only
					// fn: particular callback fn to unsubscribe from
					var len;
					Object.each(obj.$subscribers, function(value, key){
						len = value.length;
						if (typeof type !== 'undefined'){
							if (key === type) while(len--)
								(((fn && fn === value[len].fn) || !fn) && value[len].context === obj) && value.splice(len, 1);
						}
						else {
							// no type, unsubscribe from all for that context object
							while(len--) value[len].context === obj && value.splice(len, 1);
						}
					});
				}
			});

		var e = new EEvents();
		e.Events = EEvents;

		return e;
	};

	if (typeof define === 'function' && define.amd){
		// returns an empty module
		define(wrap);
	}
	else {
		exports.Epitome = wrap(exports);
	}
}(this));