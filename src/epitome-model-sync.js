/*jshint mootools:true */
;(function(exports) {
	'use strict';

	// re-implement Request.JSON correctly
	var EpitomeRequest = new Class({
		Extends: Request,
		options: {
			secure: true
		},
		initialize: function(options){
			this.parent(options);
			Object.append(this.headers, {
				'Accept': 'application/json',
				'X-Request': 'JSON'
			});
		},
		success: function(text){
			// fix for no content breaking JSON parser.
			var json;
			try {
				json = this.response.json = JSON.decode(text, this.options.secure);
			} catch (error){
				this.fireEvent('error', [text, error]);
				return;
			}
			if (text && (json == null && this.status != 204)) this.onFailure();
			else this.onSuccess(json, text);
		}
	});

	// wrapper function for requirejs or normal object
	var wrap = function(Model) {

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
					set: function(value) {
						this.urlRoot = value;
						delete this._attributes['urlRoot'];
					},
					get: function() {
						// make sure we return a sensible url.
						var base = this.urlRoot || this.options.urlRoot || 'no-urlRoot-set';
						base.charAt(base.length - 1) != '/' && (base += '/');
						return base;
					}
				}
			},

			options: {
				// by default, HTTP emulation is enabled for mootools request class.
				// assume native REST backend
				emulateREST: false,
				// if you prefer content-type to be application/json for POST / PUT, set to true
				useJSON: false
			},

			initialize: function(obj, options) {
				// needs to happen first before events are added,
				// in case we have custom accessors in the model object.
				this.setupSync();
				this.parent(obj, options);
			},

			sync: function(method, model) {
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
				if (this.options.useJSON && ['POST','PUT','DELETE'].contains(method)) {
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

			setupSync: function() {
				var self = this,
					rid = 0,
					incrementRequestId = function() {
						// request ids are unique and private. private to up them.
						rid++;
					};

				// public methods - next likely is current rid + 1
				this.getRequestId = function() {
					return rid + 1;
				};

				this.request = new EpitomeRequest({
					// one request at a time
					link: 'chain',
					url: this.get('urlRoot'),
					emulation: this.options.emulateREST,
					onRequest: incrementRequestId,
					onCancel: function() {
						this.removeEvents(syncPseudo + rid);
					},
					onSuccess: function(responseObj) {
						responseObj = self.postProcessor && self.postProcessor(responseObj);
						self.fireEvent(syncPseudo + rid, [responseObj]);
						self.fireEvent('sync', [responseObj, this.options.method, this.options.data]);
						// only becomes an existing model after a successful sync
						self.isNewModel = false;
					},
					onFailure: function() {
						self.fireEvent(syncPseudo + 'error', [this.options.method, this.options.url, this.options.data]);
						self.fireEvent('requestFailure', [this.status, this.response.text]);
					}
				});

				// export crud methods to model.
				Object.each(methodMap, function(requestMethod, protoMethod) {
					self[protoMethod] = function(model) {
						this.sync(protoMethod, model);
					};
				});

				return this;
			},

			_throwAwaySyncEvent: function(eventName, callback) {
				// a pseudo :once event for each sync that sets the model to response and can do more callbacks.

				// normally, methods that implement this will be the only ones to auto sync the model to server version.
				eventName = eventName || syncPseudo + this.getRequestId();

				var self = this,
					throwAway = {};

				throwAway[eventName] = function(responseObj) {
					// if we have a response object
					if (responseObj && typeof responseObj == 'object') {
						self.set(responseObj);
					}

					// tell somebody anyway, object or not.
					callback && callback.call(self, responseObj);

					// remove this one-off event.
					self.removeEvents(throwAway);
				};

				return this.addEvents(throwAway);
			}.protect(),

			postProcessor: function(resp) {
				// post-processor for json response being passed to the model.
				return resp;
			},

			preProcessor: function(data) {
				// pre-processor for json object before they are sent to server
				return data;
			},

			fetch: function() {
				// perform a .read and then set returned object key/value pairs to model.
				this._throwAwaySyncEvent(syncPseudo + this.getRequestId(), function() {
					this.fireEvent('fetch');
					this.isNewModel = false;
				});
				this.read();

				return this;
			},

			save: function(key, value) {
				// saves model or accepts a key/value pair/object, sets to model and then saves.
				var method = ['update','create'][+this.isNew()];

				if (key) {
					// if key is an object, go to overloadSetter.
					var ktype = typeOf(key),
						canSet = ktype == 'object' || (ktype == 'string' && typeof value != 'undefined');

					canSet && this._set.apply(this, arguments);
				}

				// we want to set this.
				this._throwAwaySyncEvent(syncPseudo + this.getRequestId(), function() {
					this.fireEvent('save');
					this.fireEvent(method);
				});


				// create first time we sync, update after.
				this[method]();

				return this;
			},

			destroy: function() {
				// destroy the model, send delete to server
				this._throwAwaySyncEvent(syncPseudo + this.getRequestId(), function() {
					this._attributes = {};
					this.fireEvent('destroy');
				});

				this.delete_();
			},

			isNew: function() {
				if (typeof this.isNewModel === 'undefined') {
					this.isNewModel = !this.get('id');
				}

				return this.isNewModel;
			}
		});
	}; // end wrap

	if (typeof define === 'function' && define.amd) {
		// requires epitome object only.
		define(['./epitome-model'], wrap);
	}
	else {
		exports.Epitome.Model.Sync = wrap(exports.Epitome.Model);
	}
}(this));