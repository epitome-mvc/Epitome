/*jshint mootools:true */
;(function(exports) {
	'use strict';

	// wrapper function for requirejs or normal object
	var wrap = function(isEqual) {

		return new Class({

			Implements: [Options, Events],

			_attributes: {},

			// custom accessors.
			properties: {
				id: {
					get: function() {
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

			initialize: function(obj, options) {
				// constructor for Model class.

				// are there any defaults passed? better to have them on the proto.
				options && options.defaults && (this.options.defaults = Object.merge(this.options.defaults, options.defaults));

				// initial obj should pass on to the setter.
				obj = obj && typeOf(obj) === 'object' ? obj : {};
				this.set(Object.merge(this.options.defaults, obj));

				// merge options overload, will now add the events.
				this.setOptions(options);

				return this.fireEvent('ready');
			},

			set: function() {
				// call the real getter. we proxy this because we want
				// a single event after all properties are updated and the ability to work with
				// either a single key, value pair or an object
				this.propertiesChanged = this.validationFailed = [];
				this._set.apply(this, arguments);
				// if any properties did change, fire a change event with the array.
				this.propertiesChanged.length && this.fireEvent('change', this.get(this.propertiesChanged));
				this.validationFailed.length && this.fireEvent('error', [this.validationFailed]);
			},

			// private, real setter functions, not on prototype, see note above
			_set: function(key, value) {
				// needs to be bound the the instance.
				if (!key || typeof value === 'undefined') return this;

				// custom setter - see bit further down
				if (this.properties[key] && this.properties[key]['set'])
					return this.properties[key]['set'].call(this, value);

				// no change? this is crude and works for primitives.
				if (this._attributes[key] && isEqual(this._attributes[key], value))
					return this;

				// basic validator support
				var validator = this.validate(key, value);
				if (this.validators[key] && validator !== true) {
					var obj = {};
					obj[key] = {
						key: key,
						value: value,
						error: validator
					};
					this.validationFailed.push(obj);
					this.fireEvent('error:' + key, obj[key]);
					return this;
				}

				if (value === null) {
					delete this._attributes[key]; // delete = null.
				}
				else {
					this._attributes[key] = value;
				}

				// fire an event.
				this.fireEvent('change:' + key, value);

				// store changed keys...
				this.propertiesChanged.push(key);

				return this;
			}.overloadSetter(),   // mootools abstracts overloading to allow object iteration

			get: function(key) {
				// overload getter, 2 paths...

				// custom accessors take precedence and have no reliance on item being in attributes
				if (key && this.properties[key] && this.properties[key]['get']) {
					return this.properties[key]['get'].call(this);
				}

				// else, return from attributes or return null when undefined.
				return (key && typeof this._attributes[key] !== 'undefined') ? this._attributes[key] : null;
			}.overloadGetter(),

			unset: function() {
				// can remove keys from model, passed on as multiple string arguments or an array of string keys
				var keys = Array.prototype.slice.apply(arguments),
					obj = {},
					len = keys.length;

				if (!len)
					return this;

				Array.each(Array.flatten(keys), function(key) {
					obj[key] = null;
				});

				this.set(obj);

				return this;
			},

			toJSON: function() {
				return Object.clone(this._attributes);
			},

			empty: function() {
				// empty the model and fire change event
				var keys = Object.keys(this.toJSON()),
					self = this;

				// let the instance know.
				this.fireEvent('change', [keys]);

				// fire change for all keys in the model.
				Array.each(keys, function(key) {
					self.fireEvent('change:' + key, null);
				}, this);

				this._attributes = {};
				this.fireEvent('empty');
			},

			destroy: function() {
				// destroy the model, send delete to server
				this._attributes = {};
				this.fireEvent('destroy');
			},

			validate: function(key, value) {
				// run validation, return true (validated) if no validator found
				return (key in this.validators) ? this.validators[key].call(this, value) : true;
			}
		});
	}; // end wrap

	if (typeof define === 'function' && define.amd) {
		// requires epitome object only.
		define(['./epitome-isequal'], wrap);
	}
	else {
		exports.Epitome.Model = wrap(exports.Epitome.isEqual);
	}
}(this));