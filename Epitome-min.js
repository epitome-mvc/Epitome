
/*jshint mootools:true, strict:true */
;(function(exports) {
	

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
					if (index != -1) events.splice(index, 1);
				}
				else {
					delete this.$events[type];
				}
			}
			return this;
		}.overloadSetter(),

		all = '*',

		undefined = 'undefined',

		func = 'function',

		evnt = 'event',

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
				else if (t === undefined){
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
					if (typeof type !== undefined){
						if (key === type) while(len--)
							(((fn && fn === value[len].fn) || !fn) && value[len].context === obj) && value.splice(len, 1);
					}
					else {
						// no type, unsubscribe from all for that context object
						while(len--) value[len].context === obj && value.splice(len, 1);
					}
				});

				return this;
			},

			setOptions: function(){
				//refactored setOptions to use .on and not addEvent. auto-mixed in.
				var options = this.options = Object.merge.apply(null, [{}, this.options].append(arguments)),
					option;
				for (option in options){
					if (typeOf(options[option]) != 'function' || !(/^on[A-Z]/).test(option)) continue;
					this.on(option, options[option]);
					delete options[option];
				}
				return this;
			}
		});

	// wrap up
	if (typeof define === 'function' && define.amd){
		// returns an empty module
		define('epitome-events',[],function(){
			return EpitomeEvents;
		});
	}
	else {
		exports.Epitome || (exports.Epitome = {});
		exports.Epitome.Events = EpitomeEvents;
	}
}(this));

/*jshint mootools:true */
;(function(exports){
	

	var wrap = function(Events){
		var e = new Events();
		e.Events = Events;
		return e;
	};

	// by default, requiring Epitome returns an Epitome.Events instance as a mediator
	if (typeof define === 'function' && define.amd){
		// returns an empty module
		define('epitome',['./epitome-events'], wrap);
	}
	else {
		exports.Epitome = wrap(exports.Epitome.Events);
	}
}(this));
/*jshint mootools:true */
;(function(exports){
	

	// wrapper function for requirejs or normal object
	var wrap = function(){

		var eq = function(a, b, stack){
			// this is a modified version of eq func from _.js

			// Identical objects are equal. `0 === -0`, but they aren't identical.
			// See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
			stack = stack || [];

			if (a === b) return a !== 0 || 1 / a == 1 / b;

			// A strict comparison is necessary because `null == undefined`.
			if (a == null || b == null) return a === b;

			// use MooTools types instead of toString.call(a),
			// this fixes FF returning [xpconnect wrapped native prototype] for all w/ MooTools
			var typeA = typeOf(a),
				typeB = typeOf(b);

			if (typeA != typeB) return false;

			switch (typeA){
				// Strings, numbers, dates, and booleans are compared by value.
				case 'string':
					// Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
					// equivalent to `new String("5")`.
					return a == String(b);
				case 'number':
					// `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
					// other numeric values.
					return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
				case 'date':
				case 'boolean':
					// Coerce dates and booleans to numeric primitive values. Dates are compared by their
					// millisecond representations. Note that invalid dates with millisecond representations
					// of `NaN` are not equivalent.
					return +a == +b;
				// RegExps are compared by their source patterns and flags.
				case 'regexp':
					return a.source == b.source &&
						a.global == b.global &&
						a.multiline == b.multiline &&
						a.ignoreCase == b.ignoreCase;
			}

			if (typeof a !== 'object' || typeof b !== 'object') return false;

			// Assume equality for cyclic structures. The algorithm for detecting cyclic
			// structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
			var length = stack.length;
			while (length--){
				// Linear search. Performance is inversely proportional to the number of
				// unique nested structures.
				if (stack[length] == a) return true;
			}

			// Add the first object to the stack of traversed objects.
			stack.push(a);
			var size = 0, result = true;
			// Recursively compare objects and arrays.
			if (typeA == 'array'){
				// Compare array lengths to determine if a deep comparison is necessary.
				size = a.length;
				result = size == b.length;
				if (result){
					// Deep compare the contents, ignoring non-numeric properties.
					while (size--){
						// Ensure commutative equality for sparse arrays.
						if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
					}
				}
			} else {
				// Objects with different constructors are not equivalent.
				if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
				// Deep compare objects.
				for (var key in a){
					if (a.hasOwnProperty(key)){
						// Count the expected number of properties.
						size++;
						// Deep compare each member.
						if (!(result = b.hasOwnProperty(key) && eq(a[key], b[key], stack))) break;
					}
				}
				// Ensure that both objects contain the same number of properties.
				if (result){
					for (key in b){
						if (b.hasOwnProperty(key) && !(size--)) break;
					}
					result = !size;
				}
			}

			// Remove the first object from the stack of traversed objects.
			stack.pop();
			return result;
		};

		return eq;
	}; // end wrap

	if (typeof define === 'function' && define.amd){
		// requires epitome object only.
		define('epitome-isequal',['./epitome'], wrap);
	}
	else {
		exports.Epitome || (exports.Epitome = {});
		exports.Epitome.isEqual = wrap(exports.Epitome);
	}
}(this));
/*jshint mootools:true */
;(function(exports) {
	

	// wrapper function for requirejs or normal object
	var wrap = function(isEqual, Events) {

		return new Class({

			Implements: [Events],

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

				return this.trigger('ready');
			},

			set: function() {
				// call the real getter. we proxy this because we want
				// a single event after all properties are updated and the ability to work with
				// either a single key, value pair or an object
				this.propertiesChanged = [];
				this.validationFailed = [];
				
				this._set.apply(this, arguments);
				// if any properties did change, fire a change event with the array.
				this.propertiesChanged.length && this.trigger('change', this.get(this.propertiesChanged));
				this.validationFailed.length && this.trigger('error', [this.validationFailed]);
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
					this.trigger('error:' + key, obj[key]);
					return this;
				}

				if (value === null) {
					delete this._attributes[key]; // delete = null.
				}
				else {
					this._attributes[key] = value;
				}

				// fire an event.
				this.trigger('change:' + key, value);

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
				this.trigger('change', [keys]);

				// fire change for all keys in the model.
				Array.each(keys, function(key) {
					self.trigger('change:' + key, null);
				}, this);

				this._attributes = {};
				this.trigger('empty');
			},

			destroy: function() {
				// destroy the model, send delete to server
				this._attributes = {};
				this.trigger('destroy');
			},

			validate: function(key, value) {
				// run validation, return true (validated) if no validator found
				return (key in this.validators) ? this.validators[key].call(this, value) : true;
			}
		});
	}; // end wrap

	if (typeof define === 'function' && define.amd) {
		// requires epitome object only.
		define('epitome-model',['./epitome-isequal','./epitome-events'], wrap);
	}
	else {
		exports.Epitome || (exports.Epitome = {isEqual:{},Events:{}});
		exports.Epitome.Model = wrap(exports.Epitome.isEqual, exports.Epitome.Events);
	}
}(this));
/*jshint mootools:true */
;(function(exports){
	

	// re-implement Request.JSON correctly
	var EpitomeRequest = new Class({
		Extends: Request,
		options: {
			secure: true
		},
		initialize: function(options){
			this.parent(options);
			Object.append(this.headers, {
				// even though we want json, we will accept more CT so we can fire failure on mismatch.
				'Accept': 'application/json,text/plain;q=0.2,text/html;q=0.1',
				'X-Request': 'JSON'
			});
		},
		success: function(text){
			// fix for no content breaking JSON parser.
			var json;
			try {
				json = this.response.json = JSON.decode(text, this.options.secure);
			} catch (error) {
				this.fireEvent('error', [text, error]);
				return;
			}
			if (text && (json == null && this.status != 204)) this.onFailure();
			else this.onSuccess(json, text);
		}
	});

	// wrapper function for requirejs or normal object
	var wrap = function(Model){

		var syncPseudo = 'sync:';

		// define CRUD mapping.
		var methodMap = {
			'create': 'POST',
			'read': 'GET',
			'update': 'PUT',
			// unsafe to call a method delete in IE7/8
			'delete_': 'DELETE'
		};

		// decorate the original object by adding a new property Sync
		return new Class({

			Extends: Model,

			properties: {
				urlRoot: {
					// normal convention - not in the model!
					set: function(value){
						this.urlRoot = value;
						delete this._attributes['urlRoot'];
					},
					get: function(){
						// make sure we return a sensible url.
						var base = this.urlRoot || this.options.urlRoot || 'no-urlRoot-set';
						base.charAt(base.length - 1) != '/' && (base += '/');
						return base;
					}
				}
			},

			options: {
				// can override Request constructor with a compatible MooTools Request
				request: EpitomeRequest,

				// by default, HTTP emulation is enabled for mootools request class.
				// assume native REST backend
				emulateREST: false,

				// if you prefer content-type to be application/json for POST / PUT, set to true
				useJSON: false

				// pass on custom request headers
				// , headers: {}
			},

			initialize: function(obj, options){
				// needs to happen first before events are added,
				// in case we have custom accessors in the model object.
				this.setOptions(options);
				this.setupSync();

				this.parent(obj, this.options);
			},

			sync: function(method, model){
				// internal low level api that works with the model request instance.
				var options = {};

				// determine what to call or do a read by default.
				method = method && methodMap[method] ? methodMap[method] : methodMap['read'];
				options.method = method;

				// if it's a method via POST, append passed object or use exported model
				if (method == methodMap.create || method == methodMap.update){
					options.data = model || this.toJSON();

					// pre-processor of data support
					this.preProcessor && (options.data = this.preProcessor(options.data));
				}

				// for real REST interfaces, produce native JSON post
				if (this.options.useJSON && ['POST', 'PUT', 'DELETE'].contains(method)){
					// serialise model to a JSON string
					options.data = JSON.encode(options.data);
					// disable urlEncoded to escape mootools Request trap for content type form-urlencoded
					options.urlEncoded = false;

					// declare custom content type
					this.request.setHeader('Content-type', 'application/json');
				}
				else {
					// normal get/post application/x-www-form-urlencoded
					options.urlEncoded = true;
				}

				// make sure we have the right URL. if model has an id, append it
				options.url = [this.get('urlRoot'), this.get('id')].join('');

				// append a trailing / if none found (no id yet)
				options.url.slice(-1) !== '/' && (options.url += '/');

				// pass it all to the request
				this.request.setOptions(options);

				// call the request class' corresponding method (mootools does that).
				this.request[method](model);

				return this;
			},

			setupSync: function(){
				var self = this,
					rid = 0,
					incrementRequestId = function(){
						// request ids are unique and private. private to up them.
						rid++;
					},
					obj;

				// public methods - next likely is current rid + 1
				this.getRequestId = function(){
					return rid + 1;
				};

				obj = {
					// one request at a time
					link: 'chain',
					url: this.get('urlRoot'),
					emulation: this.options.emulateREST,
					onRequest: incrementRequestId,
					onCancel: function(){
						this.removeEvents(syncPseudo + rid);
					},
					onSuccess: function(responseObj){
						responseObj = self.postProcessor && self.postProcessor(responseObj);
						// only becomes an existing model after a successful sync
						self.isNewModel = false;

						self.trigger(syncPseudo + rid, [responseObj]);
						self.trigger('sync', [responseObj, this.options.method, this.options.data]);
					},
					onFailure: function(){
						self.trigger(syncPseudo + 'error', [this.options.method, this.options.url, this.options.data]);
						self.trigger('requestFailure', [this.status, this.response.text]);
					}
				};

				if (this.options.headers){
					obj.headers = this.options.headers;
				}

				this.request = new this.options.request(obj);

				// export crud methods to model.
				Object.each(methodMap, function(requestMethod, protoMethod){
					self[protoMethod] = function(model){
						this.sync(protoMethod, model);
					};
				});

				return this;
			},

			_throwAwaySyncEvent: function(eventName, callback){
				// a pseudo :once event for each sync that sets the model to response and can do more callbacks.

				// normally, methods that implement this will be the only ones to auto sync the model to server version.
				eventName = eventName || syncPseudo + this.getRequestId();

				var self = this,
					throwAway = {};

				throwAway[eventName] = function(responseObj){
					// if we have a response object
					if (responseObj && typeof responseObj == 'object'){
						self.set(responseObj);
					}

					// tell somebody anyway, object or not.
					callback && callback.call(self, responseObj);

					// remove this one-off event.
					self.off(throwAway);
				};

				return this.on(throwAway);
			}.protect(),

			postProcessor: function(resp){
				// post-processor for json response being passed to the model.
				return resp;
			},

			preProcessor: function(data){
				// pre-processor for json object before they are sent to server
				return data;
			},

			fetch: function(){
				// perform a .read and then set returned object key/value pairs to model.
				this._throwAwaySyncEvent(syncPseudo + this.getRequestId(), function(){
					this.isNewModel = false;
					this.trigger('fetch');
				});
				this.read();

				return this;
			},

			save: function(key, value){
				// saves model or accepts a key/value pair/object, sets to model and then saves.
				var method = ['update', 'create'][+this.isNew()];

				if (key){
					// if key is an object, go to overloadSetter.
					var ktype = typeOf(key),
						canSet = ktype == 'object' || (ktype == 'string' && typeof value != 'undefined');

					canSet && this._set.apply(this, arguments);
				}

				// we want to set this.
				this._throwAwaySyncEvent(syncPseudo + this.getRequestId(), function(){
					this.trigger('save');
					this.trigger(method);
				});


				// create first time we sync, update after.
				this[method]();

				return this;
			},

			destroy: function(){
				// destroy the model, send delete to server
				this._throwAwaySyncEvent(syncPseudo + this.getRequestId(), function(){
					this._attributes = {};
					this.trigger('destroy');
				});

				this.delete_();
			},

			isNew: function(){
				if (typeof this.isNewModel === 'undefined'){
					this.isNewModel = !this.get('id');
				}

				return this.isNewModel;
			}
		});
	}; // end wrap

	if (typeof define === 'function' && define.amd){
		// requires epitome object only.
		define('epitome-model-sync',['./epitome-model'], wrap);
	}
	else {
		exports.Epitome || (exports.Epitome = {Model: {}});
		exports.Epitome.Model.Sync = wrap(exports.Epitome.Model);
	}
}(this));
/*jshint mootools:true */
;(function(exports){
	

	// wrapper function for requirejs or normal object
	var wrap = function(Epitome){

		var storage = (function(){
			// returns 2 classes for use with localStorage and sessionStorage as mixins

			// feature detect if storage is available
			var hasNativeStorage = !!(typeof exports.localStorage == 'object' && exports.localStorage.getItem),

			// default storage method
				localStorage = 'localStorage',

			// alternative storage
				sessionStorage = 'sessionStorage',

				setStorage = function(storageMethod){
					// mini constructor that returns an object with the method as context
					var s,
						privateKey = 'epitome-' + storageMethod,
					// this actual object that holds state of storage data - per method.
						storage = {},
					// by default, prefix storage keys with model:
						storagePrefix = 'model';

					// try native
					if (hasNativeStorage){
						try {
							storage = JSON.decode(exports[storageMethod].getItem(privateKey)) || storage;
						}
						catch (e) {
							// session expired / multiple tabs error (security), downgrade.
							hasNativeStorage = false;
						}
					}

					if (!hasNativeStorage){
						// try to use a serialized object in window.name instead
						try {
							s = JSON.decode(exports.name);
							if (s && typeof s == 'object' && s[privateKey])
								storage = s[privateKey];
						}
						catch (e) {
							// window.name was something else. pass on our current object.
							serializeWindowName();
						}
					}


					// exported methods to classes, mootools element storage style
					var Methods = {
							store: function(model){
								// saves model or argument into storage
								model = model || this.toJSON();
								setItem([storagePrefix, this.get('id')].join(':'), model);
								this.trigger('store', model);
							},

							eliminate: function(){
								// deletes model from storage but does not delete the model
								removeItem([storagePrefix, this.get('id')].join(':'));
								return this.trigger('eliminate');
							},

							retrieve: function(){
								// return model from storage. don't set to Model!
								var model = getItem([storagePrefix, this.get('id')].join(':')) || null;

								this.trigger('retrieve', model);

								return model;
							}
						},

					// internal methods to proxy working with storage and fallbacks
						getItem = function(item){
							// return from storage in memory
							return storage[item] || null;
						},

						setItem = function(item, value){
							// add a key to storage hash
							storage = hasNativeStorage ? JSON.decode(exports[storageMethod].getItem(privateKey)) || storage : storage;
							storage[item] = value;

							if (hasNativeStorage){
								try {
									exports[storageMethod].setItem(privateKey, JSON.encode(storage));
								}
								catch (e) {
									// session expired / tabs error (security)
								}
							}
							else {
								serializeWindowName();
							}

							return this;
						},

						removeItem = function(item){
							// remove a key from the storage hash
							delete storage[item];

							if (hasNativeStorage){
								try {
									exports[storageMethod].setItem(privateKey, JSON.encode(storage));
								}
								catch (e) {
									// session expired / tabs error (security)
								}
							}
							else {
								// remove from window.name also.
								serializeWindowName();
							}
						},

						serializeWindowName = function(){
							// this is the fallback that merges storage into window.name
							var obj = {},
								s = JSON.decode(exports.name);

							obj[privateKey] = storage;
							exports.name = JSON.encode(Object.merge(obj, s));
						};

					return function(storageName){
						storageName && (storagePrefix = storageName);
						return new Class(Object.clone(Methods));
					};

				};


			// actual object returns 2 distinct classes we can use.
			return {
				localStorage: setStorage(localStorage),
				sessionStorage: setStorage(sessionStorage)
			};
		})();

		return storage;
	}; // end wrap

	if (typeof define === 'function' && define.amd){
		// requires epitome object only.
		define('epitome-storage',['./epitome'], wrap);
	}
	else {
		exports.Epitome || (exports.Epitome = {});
		exports.Epitome.Storage = wrap(exports);
	}
}(this));
/*jshint mootools:true */
;(function(exports) {
	

	// wrapper function for requirejs or normal object
	var wrap = function(Model, Events) {

		var	methodMap = ['forEach', 'each', 'invoke', 'filter', 'map', 'some', 'indexOf', 'contains', 'getRandom', 'getLast'];

		// decorator type, only not on the proto. exports.Function in a distant future? It's a Type...
		var collection = new Class({

			Implements: [Events],

			// base model is just Epitome.Model
			model: Model,

			_models: [],

			initialize: function(models, options) {
				this.setOptions(options);
				models && this.setUp(models);
				// collections should have an id for storage
				this.id = this.options.id || String.uniqueID();

				return this.trigger('ready');
			},

			setUp: function(models) {
				models = Array.from(models);
				Array.each(models, this.addModel.bind(this));

				// if a model is destroyed, remove from the collection
				this.on('destroy', this.removeModel.bind(this));

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
					return this.trigger('add:error', model);

				// replace an existing model when requested
				exists && replace === true && (this._models[this._models.indexOf(model)] = model);

				// subscribe to all model events and bubble them locally.
				this.listenTo(model);

				// add to models array.
				this._models.push(model);

				model.collections.include(this);

				this.length = this._models.length;

				// let somebody know.
				return this.trigger('add', [model, model.cid]).trigger('reset', [model, model.cid]);
			},

			modelEvent: function(){
				
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
					quiet || self.trigger('remove', [model, model.cid]);
				});

				return this.trigger('reset', [models]);
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
				return this.trigger('empty');
			},

			sort: function(how) {
				// no arg. natural sort
				if (!how) {
					this._models.sort();
					return this.trigger('sort');
				}

				// callback function
				if (typeof how === 'function') {
					this.model.sort(how);
					return this.trigger('sort');
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

				return this.trigger('sort');
			},

			reverse: function() {
				// reversing is just sorting in reverse.
				Array.reverse(this._models);

				return this.trigger('sort');
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
		define('epitome-collection',['./epitome-model', './epitome-events'], wrap);
	}
	else {
		exports.Epitome || (exports.Epitome = {Model:{},Events:{}});
		exports.Epitome.Collection = wrap(exports.Epitome.Model, exports.Epitome.Events);
	}
}(this));
/*jshint mootools:true */
;(function(exports){
	

	// wrapper function for requirejs or normal object
	var wrap = function(Collection){

		var noUrl = 'no-urlRoot-set',
			eventPseudo = 'fetch:';

		return new Class({
			// allows for fetching collections of model from the server

			Extends: Collection,

			options: {
				urlRoot: noUrl
			},

			initialize: function(models, options){
				this.setupSync();
				this.parent(models, options);
			},

			setupSync: function(){
				// single request object as in models. independent of models.
				var self = this,
					rid = 0,
					incrementRequestId = function(){
						// request ids are unique and private. private to up them.
						rid++;
					};

				// public methods - next likely is current rid + 1
				this.getRequestId = function(){
					return rid + 1;
				};

				this.request = new Request.JSON({
					// one request at a time
					link: 'chain',
					url: this.options.urlRoot,
					emulation: this.options.emulateREST,
					onRequest: incrementRequestId,
					onCancel: function(){
						this.removeEvents(eventPseudo + rid);
					},
					onSuccess: function(responseObj){
						responseObj = self.postProcessor && self.postProcessor(responseObj);
						self.trigger(eventPseudo + rid, [
							[responseObj]
						]);
					},
					onFailure: function(){
						self.trigger(eventPseudo + 'error', [this.options.method, this.options.url, this.options.data]);
					}
				});

				this.request.setHeader('Accept', 'application/json,text/plain;q=0.2,text/html;q=0.1');
				return this;
			},

			fetch: function(refresh, queryParams){
				// get a list of models. `@refresh (boolean)` will empty collection first, queryParams passed as get args
				queryParams || (queryParams = {});

				// set the onSuccess event for this fetch call
				this._throwAwayEvent(function(models){
					if (refresh){
						this.empty();
						Array.each(models, this.addModel.bind(this));
					}
					else {
						this.processModels(models);
					}

					// finaly fire the event to instance
					this.trigger('fetch', [models])
				});

				this.request.get(queryParams);

				// dangerous. async stuff coming.
				return this;
			},

			processModels: function(models){
				// deals with newly arrived objects which can either update existing models or be added as new models
				// `@models (array or objects)`, not actual model instances
				var self = this;

				Array.each(models, function(model){
					var exists = model.id && self.getModelById(model.id);

					if (exists){
						exists.set(model);
					}
					else {
						self.addModel(model);
					}
				});
			},

			_throwAwayEvent: function(callback){
				// this is a one-off event that will ensure a fetch event fires only once per `.fetch`
				var eventName = eventPseudo + this.getRequestId(),
					self = this,
					throwAway = {};

				if (!callback || typeof callback !== 'function')
					return;

				throwAway[eventName] = function(responseObj){
					callback.apply(self, responseObj);

					// remove this one-off event.
					self.off(throwAway);
				};

				return this.on(throwAway);
			}.protect(),

			postProcessor: function(jsonResponse){
				// apply a post-processor to response
				return jsonResponse;
			}

		});
	}; // end wrap

	if (typeof define === 'function' && define.amd){
		// requires epitome model and all its deps
		define('epitome-collection-sync',['./epitome-collection'], wrap);
	}
	else {
		exports.Epitome || (exports.Epitome = {Collection: {}});
		exports.Epitome.Collection.Sync = wrap(exports.Epitome.Collection);
	}
}(this));
/*jshint mootools:true */
;(function(exports){
	

	(function(){
		// Add to string proto 
		var escapes = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#x27;',
			'/': '&#x2F;'
		}, escaper = new RegExp('[' + Object.keys(escapes).join('') + ']', 'g');

		String.implement({
			escape: function(){
				// Escapes a string for insertion into HTML, 
				// replacing &, <, >, ", ', and / characters. 
				return String(this).replace(escaper, function(match){
					return escapes[match];
				});
			}
		});
	}());

	// wrapper function for requirejs or normal object
	var wrap = function(){

		return new Class({
			// a templating class based upon the _.js template method and john resig's work
			// but fixed so that it doesn't suck. namely, references in templates not found in
			// the data object do not cause exceptions.
			options: {
				// default block logic syntax is <% if (data.prop) { %>
				evaluate: /<%([\s\S]+?)%>/g,
				// literal out is <%=property%>
				normal: /<%=([\s\S]+?)%>/g,
				// safe scripts and tags, <%-property%>
				escape: /<%-([\s\S]+?)%>/g,

				// these are internals you can change if you like
				noMatch: /.^/,
				escaper: /\\|'|\r|\n|\t|\u2028|\u2029/g
			},

			Implements: Options,

			initialize: function(options){
				this.setOptions(options);

				var escapes = this.escapes = {
					'\\': '\\',
					"'": "'",
					'r': '\r',
					'n': '\n',
					't': '\t',
					'u2028': '\u2028',
					'u2029': '\u2029'
				};

				Object.each(escapes, function(value, key){
					this[value] = key;
				}, escapes);

				this.matcher = new RegExp([
					(this.options.escape || this.options.noMatch).source,
					(this.options.normal || this.options.noMatch).source,
					(this.options.evaluate || this.options.noMatch).source
				].join('|') + '|$', 'g');

				return this;
			},

			template: function(text, data, options){
				// the actual method that compiles a template with some data.
				var o = options ? Object.merge(this.options, options) : this.options,
					render,
					escapes = this.escapes,
					escaper = o.escaper,
					index = 0,
					source = "__p+='";

				text.replace(this.matcher, function(match, escape, interpolate, evaluate, offset){
					source += text.slice(index, offset)
						.replace(escaper, function(match){
							return '\\' + escapes[match];
						});

					if (escape){
						source += "'+\n((__t=(obj['" + escape + "']))==null?'':String.escape(__t))+\n'";
					}
					if (interpolate){
						source += "'+\n((__t=(obj['" + interpolate + "']))==null?'':__t)+\n'";
					}
					if (evaluate){
						source += "';\n" + evaluate + "\n__p+='";
					}
					index = offset + match.length;
					return match;
				});
				source += "';\n";

				// If a variable is not specified, place data values in local scope.
				if (!o.variable) source = 'obj=obj||{};with(obj){\n' + source + '}\n';

				source = "var __t,__p='',__j=Array.prototype.join," +
					"print=function(){__p+=__j.call(arguments,'');};\n" +
					source + "return __p;\n";

				try {
					render = new Function(o.variable || 'obj', source);
				} catch (e) {
					e.source = source;
					throw e;
				}

				if (data) return render(data);
				var template = function(data){
					return render.call(this, data);
				};

				// Provide the compiled function source as a convenience for precompilation.
				template.source = 'function(' + (o.variable || 'obj') + '){\n' + source + '}';
				return template;
			}
		});
	}; // end wrap


	if (typeof define === 'function' && define.amd){
		// requires epitome object only.
		define('epitome-template',['./epitome'], wrap);
	}
	else {
		exports.Epitome || (exports.Epitome = {});
		exports.Epitome.Template = wrap(exports.Epitome);
	}
}(this));


/*jshint mootools:true */
;(function(exports){
	//   // breaks tests due to mootools reliance on args.callee and fireEvent

	// wrapper function for requirejs or normal object
	var wrap = function(Template, Model, Collection, Events){

		return new Class({

			Implements: [Events],

			// a string or element to render to and bind events on
			element: null,

			// optional, a collection may be bound to the view
			collection: null,

			// optional, a model may be bound to the view
			model: null,

			// preset stuff like template and the event map
			options: {
				template: "",
				// the event map should be like `elementEvent`: `instanceEvent`
				// for example: '{click:relay(a.task-remove)': 'removeTask'}
				// will fire instance's onRemoveTask handler when a.task-remove is pressed within the element.
				events: {}
			},

			initialize: function(options){
				// constructor like function.

				// deal with collection first to avoid reference errors with object.clone / merge for setOptions
				if (options && options.collection){
					this.setCollection(options.collection);
					delete options.collection;
				}

				// deal with model as well
				if (options && options.model){
					this.setModel(options.model);
					delete options.model;
				}

				// now we can hopefully setOptions safely.
				this.setOptions(options);

				// define the element.
				if (this.options.element){
					this.setElement(this.options.element, this.options.events);
					delete this.options.element;
				}

				// let the instance know
				return this.trigger('ready');
			},

			setElement: function(el, events){
				// set the element and clean-up old one
				this.element && this.detachEvents() && this.destroy();
				this.element = document.id(el);
				events && this.attachEvents(events);

				return this;
			},

			setCollection: function(collection){
				// a collection should be a real collection.
				var self = this,
					eventProxy = function(type){
						return function(){
							self.trigger(type + ':collection', arguments);
						}
					};

				if (instanceOf(collection, Collection)){
					this.collection = collection;
					// listen in for changes.
					this.collection.on({
						'change': eventProxy('change'),
						'fetch': eventProxy('fetch'),
						'add': eventProxy('add'),
						'remove': eventProxy('remove'),
						'sort': eventProxy('sort'),
						'reset': eventProxy('reset'),
						'error': eventProxy('error')
					});
				}

				return this;
			},

			setModel: function(model){
				// a model should be an Epitome model
				var self = this,
					eventProxy = function(type){
						return function(){
							self.trigger(type + ':model', arguments);
						}
					};

				if (instanceOf(model, Model)){
					this.model = model;
					// listen in for changes.
					this.model.on({
						'change': eventProxy('change'),
						'destroy': eventProxy('destroy'),
						'empty': eventProxy('empty'),
						'error': eventProxy('error')
					});
				}

				return this;
			},

			attachEvents: function(events){
				// add events to main element.
				var self = this;
				Object.each(events, function(method, type){
					self.element.addEvent(type, function(e){
						self.trigger(method, arguments);
					});
				});

				this.element.store('attachedEvents', events);

				return this;
			},

			detachEvents: function(){
				// remove attached events from an element
				var events = this.element.retrieve('attachedEvents');
				events && this.element.removeEvents(events).eliminate('attachedEvents');

				return this;
			},

			template: function(data, template){
				// refactor this to work with any other template engine in your constructor
				template = template || this.options.template;

				// instantiate a template engine when needed
				var compiler = this.Template || (this.Template = new Template());

				return compiler.template(template, data);
			},

			render: function(){
				// refactor this in your constructor object. for example:
				// this.element.set('html', this.template(this.options.data));
				// this.parent(); // fires the render event.
				return this.trigger('render');
			},

			empty: function(soft){
				// with soft flag it does not destroy child elements but detaches from dom
				if (soft){
					this.element.empty();
				}
				else {
					this.element.set('html', '');
				}

				return this.trigger('empty');
			},

			dispose: function(){
				// detach the element from the dom.
				this.element.dispose();

				return this.trigger('dispose');
			},

			destroy: function(){
				// remove element from dom and memory.
				this.element.destroy();

				return this.trigger('destroy');
			}

		});
	}; // end wrap


	if (typeof define === 'function' && define.amd){
		// requires epitome-template and at least eptiome-model and eptiome-collection for implementation
		define('epitome-view',['./epitome-template', './epitome-model', './epitome-collection', './epitome-events'], wrap);
	}
	else {
		exports.Epitome || (exports.Epitome = {Template: {}, Model: {}, Collection: {}, Events: {}});
		exports.Epitome.View = wrap(exports.Epitome.Template, exports.Epitome.Model, exports.Epitome.Collection, exports.Epitome.Events);
	}
}(this));
/*jshint mootools:true */
;(function(exports){
	

	// wrapper function for requirejs or normal object
	var wrap = function(Events){

		var hc = 'hashchange',
			hcSupported = ('on' + hc) in window,
			eventHosts = [window, document],
			timer,
			getQueryString = function(queryString){
				var result = {},
					re = /([^&=]+)=([^&]*)/g,
					m;

				while (m = re.exec(queryString)){
					result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
				}

				return result;
			};

		Element.Events.hashchange = {
			// Cross browser support for onHashChange event - http://github.com/greggoryhz/MooTools-onHashChange-Event/
			onAdd: function(){
				var hash = location.hash,
					check = function(){
						if (hash == location.hash)
							return;

						hash = location.hash;
						eventHosts.invoke('fireEvent', hc, hash.indexOf('#') == 0 ? hash.substr(1) : hash);
					};

				(hcSupported && (window.onhashchange = check)) || (timer = check.periodical(100));
			},
			onRemove: function(){
				(hcSupported && (window.onhashchange = null)) || clearInterval(timer);
			}
		};


		// Router, has its own repo https://github.com/DimitarChristoff/Router
		return new Class({

			Implements: [Events],

			options: {
				triggerOnLoad: true // check route on load
			},

			routes: {
				// '#!path/:query/:id?': 'eventname',
			},

			boundEvents: {},

			initialize: function(options){
				var self = this;

				this.setOptions(options);
				this.options.routes && (this.routes = this.options.routes);

				window.addEvent(hc, function(e){
					var hash = location.hash,
						path = hash.split('?')[0],
						query = hash.split('?')[1] || '',
						notfound = true,
						route;

					for (route in self.routes){
						var keys = [],
							regex = self.normalize(route, keys, true, false),
							found = regex.exec(path),
							routeEvent = false;

						if (found){
							notfound = false;
							self.req = found[0];

							var args = found.slice(1),
								param = {};

							Array.each(args, function(a, i){
								typeof keys[i] !== 'undefined' && (param[keys[i].name] = a);
							});

							self.route = route;
							self.param = param || {};
							self.query = query && getQueryString(query);

							// find referenced events
							routeEvent = self.routes[route];

							// generic before route, pass route id, if avail
							self.trigger('before', routeEvent);

							// if there is an identifier and an event added
							if (routeEvent && self.$events[routeEvent]){
								// route event was defined, fire specific before pseudo
								self.trigger(routeEvent + ':before');
								// call the route event handler itself, pass params as arguments
								self.trigger(routeEvent, Object.values(self.param));
							}
							else {
								// requested route was expected but not found or event is missing
								self.trigger('error', ['Route', routeEvent, 'is undefined'].join(' '));
							}

							// fire a generic after event
							self.trigger('after', routeEvent);

							// if route is defined, also fire a specific after pseudo
							routeEvent && self.trigger(routeEvent + ':after');
							break;
						}
					}

					notfound && self.trigger('undefined');

				});

				this.trigger('ready');
				this.options.triggerOnLoad && window.fireEvent(hc);
			},

			navigate: function(route, trigger){
				if (location.hash == route && trigger){
					window.fireEvent(hc);
				}
				else {
					location.hash = route;
				}
			},

			normalize: function(path, keys, sensitive, strict){
				// normalize by https://github.com/visionmedia/express
				if (path instanceof RegExp) return path;

				path = path.concat(strict ? '' : '/?').replace(/\/\(/g, '(?:/').replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g,function(_, slash, format, key, capture, optional){

					keys.push({
						name: key,
						optional: !!optional
					});

					slash = slash || '';

					return [
						(optional ? '' : slash),
						'(?:',
						(optional ? slash : ''),
						(format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')',
						(optional || '')
					].join('');
				}).replace(/([\/.])/g, '\\$1').replace(/\*/g, '(.*)');

				return new RegExp('^' + path + '$', sensitive ? '' : 'i');
			},

			addRoute: function(obj){
				// adds a new route, expects keys @route (string), @id (string), @events (object)
				if (!obj || !obj.route || !obj.id || !obj.events)
					return this.trigger('error', 'Please include route, id and events in the argument object when adding a route');

				if (!obj.id.length)
					return this.trigger('error', 'Route id cannot be empty, aborting');

				if (this.routes[obj.route])
					return this.trigger('error', 'Route "{route}" or id "{id}" already exists, aborting'.substitute(obj));


				this.routes[obj.route] = obj.id;
				this.on(this.boundEvents[obj.route] = obj.events);

				return this.trigger('route:add', obj);
			},

			removeRoute: function(route){
				if (!route || !this.routes[route] || !this.boundEvents[route])
					return this.trigger('error', 'Could not find route or route is not removable');

				this.off(this.boundEvents[route]);

				delete this.routes[route];
				delete this.boundEvents[route];

				return this.trigger('route:remove', route);
			}

		});
	}; // end wrap


	if (typeof define === 'function' && define.amd){
		// requires epitome object only.
		define('epitome-router',['./epitome-events'], wrap);
	}
	else {
		exports.Epitome || (exports.Epitome = {Events:{}});
		exports.Epitome.Router = wrap(exports.Epitome.Events);
	}
}(this));