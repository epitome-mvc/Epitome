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
			}, addEvent = function(type, fn, internal){
				type = removeOn(type);

				this.$events[type] = (this.$events[type] || []).include(fn);
				if (internal) fn.internal = true;
				return this;
			}.overloadSetter(),
			all = '*',
			EEvents = new Class({

				Extends: Events,

				on: addEvent,

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
					var args = [].slice.call(arguments);
					if (args.length === 2){
						fn = type;
						type = all;
					}
					obj.$subscribers[type] || (obj.$subscribers[type] = []);
					obj.$subscribers[type].include({
						context: obj,
						fn: fn
					});

					console.log(obj.$subscribers);
				},

				stopListening: function(obj, type, fn){
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