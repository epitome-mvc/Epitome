/*jshint mootools:true */
;(function(exports) {
	'use strict';

	// wrapper function for requirejs or normal object
	var wrap = function(model) {

		var	methodMap = ['forEach', 'each', 'invoke', 'filter', 'map', 'some', 'indexOf', 'contains', 'getRandom', 'getLast'];

		// decorator type, only not on the proto. exports.Function in a distant future? It's a Type...
		Function.extend({
			monitorModelEvents: function(listener, orig) {
				// `@listener` - subscriber class to also get the event, required.
				// `@orig` - orig model instance for scope, required.

				var self = this;
				// the original func is `this`, now saved ref.

				// this is brave, may affect scope in edge cases: `.fireEvent.apply(otherobj, args)`
				orig = orig || this;

				// has the events class been mixed in?
				if (!(listener && listener.fireEvent))
					return this;

				return function(type, args, delay) {
					// now pass orig bound to orig scope, or at least the function.
					self.apply(orig, arguments);

					// let controller know and place instance. Make sure model is managed still!
					listener.getModelByCID(orig.cid) && listener.fireEvent(type, Array.flatten([orig, args]), delay);
				};
			}
		});

		var collection = new Class({

			Implements: [Options,Events],

			// base model is just Epitome.Model
			model: model,

			_models: [],

			initialize: function(models, options) {
				this.setOptions(options);
				models && this.setUp(models);
				// collections should have an id for storage
				this.id = this.options.id || String.uniqueID();

				return this.fireEvent('ready');
			},

			setUp: function(models) {
				models = Array.from(models);
				Array.each(models, this.addModel.bind(this));

				// if a model is destroyed, remove from the collection
				this.addEvent('destroy', this.removeModel.bind(this));

				return this;
			},

			addModel: function(model, replace) {
				// add a new model to collection
				var exists;

				// if it's just an object, make it a model first
				if (typeOf(model) == 'object' && !instanceOf(model, this.model)) {
					model = new this.model(model);
				}

				// assign a cid.
				model.cid = model.cid || model.get('id') || String.uniqueID();

				// already in the collection?
				exists = this.getModelByCID(model.cid);

				// if not asked to replace, bail out.
				if (exists && replace !== true)
					return this.fireEvent('add:error', model);

				// replace an existing model when requested
				exists && replace === true && (this._models[this._models.indexOf(model)] = model);

				// decorate `fireEvent` by making it local on the model instance. we are a quiet subscriber
				model.fireEvent = Function.monitorModelEvents.apply(model.fireEvent, [this, model]);

				// add to models array.
				this._models.push(model);

				model.collections.include(this);

				this.length = this._models.length;

				// let somebody know.
				return this.fireEvent('add', [model, model.cid]).fireEvent('reset', [model, model.cid]);
			},

			removeModel: function(models, quiet) {
				// supports a single model or an array of models
				var	self = this;

				models = Array.from(models).slice(); // need to dereference or loop will fail

				Array.each(models, function(model) {
					model.collections.erase(self);
					// restore `fireEvent` to one from prototype, aka, `Event.prototype.fireEvent`
					// only if there are no collections left that are interested in this model's events
					model.collections.length || delete model.fireEvent;

					// remove from collection of managed models
					Array.erase(self._models, model);

					self.length = self._models.length;

					// let somebody know we lost some.
					quiet || self.fireEvent('remove', [model, model.cid]);
				});

				return this.fireEvent('reset', [models]);
			},

			get: function(what) {
				// compat for storage
				return this[what];
			},

			getModelByCID: function(cid) {
				// return a model based upon a cid search
				var last = null;

				this.some(function(el) {
					return el.cid == cid && (last = el);
				});

				return last;
			},

			getModelById: function(id) {
				// return a model based upon an id search
				var last = null;

				this.some(function(el) {
					return el.get('id') == id && (last = el);
				});

				return last;
			},

			getModel: function(index) {
				// return a model based upon the index in the array
				return this._models[index];
			},

			toJSON: function() {
				// get the toJSON of all models.
				var getJSON = function(model) {
					return model.toJSON();
				};
				return Array.map(this._models, getJSON);
			},

			empty: function(quiet) {
				this.removeModel(this._models, quiet);
				return this.fireEvent('empty');
			},

			sort: function(how) {
				// no arg. natural sort
				if (!how) {
					this._models.sort();
					return this.fireEvent('sort');
				}

				// callback function
				if (typeof how === 'function') {
					this.model.sort(how);
					return this.fireEvent('sort');
				}

				// string keys, supports `:asc` (default) and `:desc` order
				var type = 'asc',
				// multiple conds are split by ,
					conds = how.split(','),
					c = function(a, b) {
						if (a < b)
							return -1;
						if (a > b)
							return 1;
						return 0;
					};


				this._models.sort(function(a, b) {
					var ret = 0;
					Array.some(conds, function(cond) {
						// run for as long as there is no clear distinction
						cond = cond.trim();

						var	pseudos = cond.split(':'),
							key = pseudos[0],
							sortType = (pseudos[1]) ? pseudos[1] : type,
							ak = a.get(key),
							bk = b.get(key),
							cm = c(ak, bk),
							map = {
								asc: cm,
								desc: -(cm)
							};

						// unknown types are ascending
						if (typeof map[sortType] == 'undefined') {
							sortType = type;
						}

						// assign ret value
						ret = map[sortType];

						// if we have a winner, break .some loop
						return ret != 0;
					});

					// return last good comp
					return ret;
				});

				return this.fireEvent('sort');
			},

			reverse: function() {
				// reversing is just sorting in reverse.
				Array.reverse(this._models);

				return this.fireEvent('sort');
			},

			find: function(expression) {
				// experimental model search engine, powered by MooTools Slick.parse
				var parsed = exports.Slick.parse(expression),
					exported = [],
					found = this,
					map = {
						'=': function(a, b) {
							return a == b;
						},
						'!=': function(a, b) {
							return a != b;
						},
						'^=': function(a, b) {
							return a.indexOf(b) === 0;
						},
						'*=': function(a, b) {
							return a.indexOf(b) !== -1;
						},
						'$=': function(a, b) {
							return a.indexOf(b) == a.length - b.length;
						},
						'*': function(a){
							return typeof a !== 'undefined';
						}
					},
					fixOperator = function(operator) {
						return (!operator || !map[operator]) ? null : map[operator];
					},
					finder = function(attributes) {
						var attr = attributes.key,
							value = attributes.value || null,
							tag = attributes.tag || null,
							operator = fixOperator(attributes.operator);

						found = found.filter(function(el) {
							var t, a;
							if (tag && attr) {
								t = el.get(tag);
								a = t ? t[attr] : null;
							}
							else if (tag) {
								a = el.get(tag);
							}
							else {
								a = el.get(attr);
							}

							if (a !== null && value !== null && operator !== null)
								return operator(a, value);

							return a != null;
						});

					};

				if (parsed.expressions.length) {
					var j, i;
					var attributes;
					var currentExpression, currentBit, expressions = parsed.expressions, id, t, tag;

					search: for (i = 0; (currentExpression = expressions[i]); i++) {
						for (j = 0; (currentBit = currentExpression[j]); j++){
							attributes = currentBit.attributes;
							// support by id
							id = currentBit.id;
							if (id) {
								t = {
									key: 'id',
									value: id,
									operator: '='
								};
								attributes || (attributes = []);
								attributes.push(t);
							}
							// by tag
							tag = currentBit.tag;
							if (tag && tag != '*') {
								attributes || (attributes = [{
									key: null,
									value: '',
									operator: '*'
								}]);

								attributes = Array.map(attributes, function(a){
									a.tag = tag;
									return a;
								});
							}

							if (!attributes) continue search;

							Array.each(attributes, finder);
						}
						exported[i] = found;
						found = this;
					}

				}

				return [].combine(Array.flatten(exported));
			},

			findOne: function(expression) {
				var results = this.find(expression);
				return results.length ? results[0] : null;
			}

		});

		Array.each(methodMap, function(method) {
			collection.implement(method, function() {
				return Array.prototype[method].apply(this._models, arguments);
			});
		});

		return collection;
	}; // end wrap

	if (typeof define === 'function' && define.amd) {
		// requires epitome model and all its deps
		define(['./epitome-model'], wrap);
	}
	else {
		exports.Epitome.Collection = wrap(exports.Epitome.Model);
	}
}(this));