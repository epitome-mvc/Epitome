;(function(){
	'use strict';

	// wrapper function for requirejs or normal object
	var wrap = function(isEqual, Events){

		return new Class({

			Implements: [Events],

			_attributes: {},

			// custom accessors.
			properties: {
				id: {
					get: function(){
						// need a cid to identify model.
						var id = this._attributes.id || String.uniqueID();
						// always need a collection id.
						this.cid || (this.cid = id);

						return this._attributes.id;
					}
				}
			},

			// validators per property, should return true or error message
			validators: {},

			// initial `private` object
			options: {
				defaults: {}
			},

			collections: [],

			initialize: function(obj, options){
				// constructor for Model class.

				// are there any defaults passed? better to have them on the proto.
				options && options.defaults && (this.options.defaults = Object.merge(this.options.defaults, options.defaults));

				// initial obj should pass on to the setter.
				obj = obj && typeOf(obj) === 'object' ? obj : {};
				this.set(Object.merge(this.options.defaults, obj));

				// merge options overload, will now add the events.
				this.setOptions(options);

				return this.trigger('ready');
			},

			set: function(){
				// call the real getter. we proxy this because we want
				// a single event after all properties are updated and the ability to work with
				// either a single key, value pair or an object
				this.propertiesChanged = [];
				this.validationFailed = [];

				this._set.apply(this, arguments);
				// if any properties did change, fire a change event with the array.
				this.propertiesChanged.length && this.trigger('change', this.get(this.propertiesChanged));
				this.validationFailed.length && this.trigger('error', [this.validationFailed]);

				return this;
			},

			// private, real setter functions, not on prototype, see note above
			_set: function(key, value){
				// needs to be bound the the instance.
				if (!key || typeof value === undef) return this;

				var a = this._attributes,
					p = this.properties;

				// custom setter - see bit further down
				if (p[key] && p[key].set){
					value = p[key].set.call(this, value);
					if (typeof value === undef){
						return this;
					}
				}

				// no change? this is crude and works for primitives.
				if (a.hasOwnProperty(key) && isEqual(a[key], value))
					return this;

				// basic validator support
				var validator = this.validate(key, value);
				if (this.validators[key] && validator !== true){
					var obj = {};
					obj[key] = {
						key: key,
						value: value,
						error: validator
					};
					this.validationFailed.push(obj);
					this.trigger('error:' + key, obj[key]);
					return this;
				}

				if (value === null){
					delete a[key]; // delete = null.
				}
				else {
					a[key] = value;
				}

				// fire an event.
				this.trigger('change:' + key, value);

				// store changed keys...
				this.propertiesChanged.push(key);

				return this;
			}.overloadSetter(),

			get: function(key){
				// overload getter, 2 paths...

				// custom accessors take precedence and have no reliance on item being in attributes
				if (key && this.properties[key] && this.properties[key]['get']){
					return this.properties[key]['get'].call(this);
				}

				// else, return from attributes or return null when undefined.
				return (key && typeof this._attributes[key] !== undef) ? this._attributes[key] : null;
			}.overloadGetter(),

			unset: function(){
				// can remove keys from model, passed on as multiple string arguments or an array of string keys
				var keys = Array.prototype.slice.apply(arguments),
					obj = {},
					len = keys.length;

				if (!len)
					return this;

				Array.each(Array.flatten(keys), function(key){
					obj[key] = null;
				});

				this.set(obj);

				return this;
			},

			toJSON: function(){
				return Object.clone(this._attributes);
			},

			empty: function(){
				// empty the model and fire change event
				var keys = Object.keys(this._attributes),
					self = this;

				// let the instance know.
				this.trigger('change', [keys]);

				// fire change for all keys in the model.
				Array.each(keys, function(key){
					self.trigger('change:' + key, null);
				});

				this._attributes = {};
				this.trigger('empty');
			},

			destroy: function(){
				// destroy the model, send delete to server
				this._attributes = {};
				this.trigger('destroy');
			},

			validate: function(key, value){
				// run validation, return true (validated) if no validator found
				return (key in this.validators) ? this.validators[key].call(this, value) : true;
			}
		});
	}, // end wrap
	undef = 'undefined';

	if (typeof define === 'function' && define.amd){
		define(['./epitome-isequal', './epitome-events'], wrap);
	}
	else if (typeof module !== undef && module.exports){
		require('mootools');
		module.exports = wrap(require('./epitome-isequal'), require('./epitome-events'));
	}
	else {
		this.Epitome || (this.Epitome = {isEqual: {}, Events: {}});
		this.Epitome.Model = wrap(this.Epitome.isEqual, this.Epitome.Events);
	}
}.call(this));