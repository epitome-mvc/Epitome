;(function(){
	'use strict';

	// wrapper function for requirejs or normal object
	var removeOn = function(string){
			return string.replace(/^on([A-Z])/, function(full, first){
				return first.toLowerCase();
			});
		},

		addEvent = function(type, fn){
			type = removeOn(type);

			var types = type.split(/\s+/),
				self = this;

			types.each(function(type){
				self.$events[type] = (self.$events[type] || []).include(fn);
			});

			return this;
		}.overloadSetter(),

		removeEvent = function(type, fn){
			// does not remove remote subscribers. careful, can cause memory issues if you don't clean up
			type = removeOn(type);
			var events = this.$events[type];
			if (events){
				if (fn){
					var index = events.indexOf(fn);
					if (index !== -1) delete events[index]; // sparses array, keeping index
				}
				else {
					delete this.$events[type];
				}
			}
			return this;
		}.overloadSetter(),

		all = '*',

		func = 'function',

		EpitomeEvents = new Class({
			// custom event implementation

			$events: {},

			$subscribers: {},

			on: addEvent,

			off: removeEvent,

			trigger: function(type, args){
				type = removeOn(type);
				var events = this.$events[type] || [],
					subs = (type in this.$subscribers) ? this.$subscribers[type] : (all in this.$subscribers) ? this.$subscribers[all] : [],
					self = this;

				if (!events && !subs) return this;
				args = Array.from(args);

				events.each(function(fn){
					// local events
					fn.apply(self, args);
				});

				subs.each(function(sub){
					// if event was added towards a specific callback, fire that
					if (sub.fn){
						sub.fn.apply(sub.context, args);
					}
					else {
						// runs on subscriber, shifting arguments to pass on instance with a fake event object.

						// this use is not recommended as it can cause event storms, use with caution and
						// argument shift, arg1 = context. result of .listenTo(obj) with no other args or with type but no callback.
						sub.subscriber.trigger(type, Array.flatten([self, args]));
					}
				});

				return this;
			},

			listenTo: function(obj, type, fn){
				// obj: instance to subscribe to
				// type: particular event type or all events, defaults to '*'
				// last argument is the function to call, can shift to 2nd argument.

				// not using type and callbacks can subscribe locally but use with caution.
				var t = typeof type,
					event = {
						context: obj,
						subscriber: this
					};

				if (t === func){
					fn = type;
					type = all;
				}
				else if (t === 'undefined'){
					type = all;
				}

				fn && (event.fn = fn);
				obj.$subscribers[type] = (obj.$subscribers[type] || []).include(event);

				return this;
			},

			stopListening: function(obj, type, fn){
				// obj: instance to stop listening to
				// type: particular event to unsubscribe from, or all events by default. '*' for wildcard events only
				// fn: particular callback fn to unsubscribe from
				var len;
				Object.each(obj.$subscribers, function(value, key){
					len = value.length;
					if (typeof type !== 'undefined'){
						if (key === type) while (len--)
							(((fn && fn === value[len].fn) || !fn) && value[len].context === obj) && value.splice(len, 1);
					}
					else {
						// no type, unsubscribe from all for that context object
						while (len--) value[len].context === obj && value.splice(len, 1);
					}
				});

				return this;
			},

			setOptions: function(){
				//refactored setOptions to use .on and not addEvent. auto-mixed in.
				var options = this.options = Object.merge.apply(null, [
						{},
						this.options
					].append(arguments)),
					option;
				for (option in options){
					if (typeOf(options[option]) !== func || !(/^on[A-Z]/).test(option)) continue;
					this.on(option, options[option]);
					delete options[option];
				}
				return this;
			}
		});

	if (typeof define === 'function' && define.amd){
		define(function(){
			return EpitomeEvents;
		});
	}
	else if (typeof module !== 'undefined' && module.exports){
		module.exports = EpitomeEvents;
	}
	else {
		this.Epitome || (this.Epitome = {});
		this.Epitome.Events = EpitomeEvents;
	}
}.call(this));
