;(function(exports) {

	// get the Epitome module
	var Epitome = typeof require == 'function' ? require('./epitome-model') : exports.Epitome,
		Model = Epitome.Model,
		storagePseudo = 'storage:';

	var Storage = new Class({

		storage: {}, // you can puncture this through classname.storage[key]

		Implements: [Options],

		options: {
			storageMethod: 'sessionStorage', // or localStorage
			privateKey: 'myStorage' // sub key for namespacing
		},

		initialize: function(options) {
			this.setOptions(options);
			this.storageMethod = this.options.storageMethod;

			this.setupStorage();
		},

		setupStorage: function() {
			// main method that needs to be called to set the api up and handles detection
			// 3 levels of degradation. with storage, without -> window.name or a simple {}
			var storage;

			this.hasNativeStorage = !!(typeof window[this.storageMethod] == 'object' && window[this.storageMethod].getItem);

			// try native
			if (this.hasNativeStorage) {
				try {
					this.storage = JSON.decode(window[this.storageMethod].getItem(this.options.privateKey)) || this.storage;
				}
				catch(e) {
					// session expired / multiple tabs error (security), downgrade.
					this.hasNativeStorage = false;
				}
			}

			if (!this.hasNativeStorage) {
				// try to use a serialized object in window.name instead
				try {
					storage = JSON.decode(window.name);
					if (storage && typeof storage == 'object' && storage[this.options.privateKey])
						this.storage = storage[this.options.privateKey];
				}
				catch(e) {
					// window.name was something else. pass on our current object.
					this._serializeWindowName();
				}
			}

			return this;
		},

		getItem: function(item) {
			// return from storage in memory
			return this.storage[item] || null;
		},

		setItem: function(item, value) {
			// add a key to storage hash
			this.storage = JSON.decode(window[this.storageMethod].getItem(this.options.privateKey)) || this.storage;
			this.storage[item] = value;

			if (this.hasNativeStorage) {
				try {
					window[this.storageMethod].setItem(this.options.privateKey, JSON.encode(this.storage));
				}
				catch(e) {
					// session expired / tabs error (security)
				}
			}
			else {
				this._serializeWindowName();
			}

			return this;
		},

		removeItem: function(item) {
			// remove a key from the storage hash
			delete this.storage[item];

			if (this.hasNativeStorage) {
				try {
					window[this.storageMethod].setItem(this.options.privateKey, JSON.encode(this.storage));
				}
				catch(e) {
					// session expired / tabs error (security)
				}
			}
			else {
				// remove from window.name also.
				this._serializeWindowName();
			}
		},

		_serializeWindowName: function() {
			// this is the fallback that merges storage into window.name
			var obj = {},
				storage = JSON.decode(window.name);

			obj[this.options.privateKey] = this.storage;
			window.name = JSON.encode(Object.merge(obj, storage));
		}
	});


	// decorate the original object by adding a new property Sync
	Model.Storage = new Class({

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
			}
		},

		options: {
			// by default, HTTP emulation is enabled for mootools request class. we want it off.
			storageMethod: 'sessionStorage'
		},

		initialize: function(obj, options) {
			// needs to happen first before events are added,
			// in case we have custom accessors in the model object.
			this.parent(obj, options);
			this.setupMethods();
		},

		setupMethods: function() {

			var storage = this.storage = new Storage({
				storageMethod: this.options.storageMethod,
				privateKey: storagePseudo + this.get('id')
			});

			Array.each(['create', 'update'], function(method) {
				this[method] = function(model) {
					model = model || this.toJSON();
					storage.setItem('model', model);
					this.fireEvent(method, model);
				};
			}, this);

			this.delete = function() {
				storage.removeItem('model');

				return this.fireEvent('delete');
			};

			this.read = function() {
				var model = storage.getItem('model');
				if (model && typeof model == 'object') {
					this.set(model);
				}
				this.fireEvent('read');

				return model;
			};

			return this;
		},

		fetch: function() {
			// perform a .read and then set returned object key/value pairs to model.

			this.read();
			this.fireEvent('fetch');

			return this;
		},

		save: function(key, value) {
			// saves model or accepts a key/value pair/object, sets to model and then saves.
			if (key) {
				// if key is an object, go to overloadSetter.
				var ktype = typeOf(key),
					canSet = ktype == 'object' || (ktype == 'string' && typeof value != 'undefined');

				canSet && this._set.apply(this, arguments);
			}

			// we want to set this.
			this.update();
			this.fireEvent('save');

			return this;
		},

		destroy: function() {
			// destroy the model, send delete to server
			this._attributes = {};
			this.delete();
			this.fireEvent('destroy');

		}
	});

	if (typeof define === 'function' && define.amd) {
		define('epitome-model-storage', function() {
			return Epitome;
		});
	}
	else if (typeof module === 'object') {
		module.exports = Epitome;
	}
	else {
		exports.Epitome = Epitome;
	}
}(this));