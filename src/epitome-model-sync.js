/*jshint mootools:true */
;(function(exports) {
	'use strict';

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
				id: {
					get: function() {
						// always need an id, even if we don't have one.
						var id = this._attributes.id || (this._attributes.id = String.uniqueID());
						// always need a collection id.
						this.cid || (this.cid = id);

						return id;
					}
				},
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
				// by default, HTTP emulation is enabled for mootools request class. we want it off.
				emulateREST: false
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
				if (method == methodMap.create || method == methodMap.update)
					options.data = model || this.toJSON();

				// make sure we have the right URL
				options.url = this.get('urlRoot') + this.get('id') + '/';

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

				this.request = new Request.JSON({
					// one request at a time
					link: 'chain',
					url: this.get('urlRoot'),
					emulation: this.options.emulateREST,
					onRequest: incrementRequestId,
					onCancel: function() {
						this.removeEvents(syncPseudo + rid);
					},
					onSuccess: function(responseObj) {
						responseObj = self.parse && self.parse(responseObj);
						self.fireEvent(syncPseudo + rid, [responseObj]);
						self.fireEvent('sync', [responseObj, this.options.method, this.options.data]);
					},
					onFailure: function() {
						self.fireEvent(syncPseudo + 'error', [this.options.method, this.options.url, this.options.data]);
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
					if (responseObj && typeof responseObj == 'object') {
						self.set(responseObj);
						callback && callback.call(self, responseObj);
					}

					// remove this one-off event.
					self.removeEvents(throwAway);
				};

				return this.addEvents(throwAway);
			}.protect(),

			parse: function(resp) {
				// pre-processor for json object from response.
				return resp;
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
				this.isNewModel = false;

				return this;
			},

			destroy: function() {
				// destroy the model, send delete to server
				this._throwAwaySyncEvent(syncPseudo + this.getRequestId(), function() {
					this._attributes = {};
					this.delete_();
					this.fireEvent('destroy');
				});
			},

			isNew: function() {
				if (typeof this.isNewModel === 'undefined')
					this.isNewModel = true;

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