;(function(exports) {

	// get the Epitome module
	var Epitome = typeof require == 'function' ? require('./epitome') : exports.Epitome;

	Epitome.Storage	= (function() {
		// returns 2 classes for use with localStorage and sessionStorage as mixins

			// used by the models
		var storagePseudo = 'model:',

			// feature detect if storage is available
			hasNativeStorage = !!(typeof exports.localStorage == 'object' && exports.localStorage.getItem),

			// default storage method
			localStorage = 'localStorage',

			// alternative storage
			sessionStorage = 'sessionStorage',

			setStorage = function(storageMethod) {
				// mini constructor that returns an object with the method as context
				var s,
					privateKey = 'epitome-' + storageMethod,
					// this actual object that holds state of storage data - per method.
					storage = {};

				// try native
				if (hasNativeStorage) {
					try {
						storage = JSON.decode(exports[storageMethod].getItem(privateKey)) || storage;
					}
					catch(e) {
						// session expired / multiple tabs error (security), downgrade.
						hasNativeStorage = false;
					}
				}

				if (!hasNativeStorage) {
					// try to use a serialized object in window.name instead
					try {
						s = JSON.decode(exports.name);
						if (s && typeof s == 'object' && s[privateKey])
							storage = s[privateKey];
					}
					catch(e) {
						// window.name was something else. pass on our current object.
						serializeWindowName();
					}
				}


				// exported methods to classes, mootools element storage style
				var Methods = {
					store: function(model) {
						// saves model or argument into storage
						model = model || this.toJSON();
						setItem(storagePseudo + this.get('id'), model);
						this.fireEvent('store', model);
					},

					eliminate: function() {
						// deletes model from storage but does not delete the model
						removeItem(storagePseudo + this.get('id'));
						return this.fireEvent('eliminate');
					},

					retrieve: function() {
						// return model from storage. don't set to Model!
						var model = getItem(storagePseudo + this.get('id')) || null;

						this.fireEvent('retrieve', model);

						return model;
					}
				},

				// internal methods to proxy working with storage and fallbacks
				getItem = function(item) {
					// return from storage in memory
					return storage[item] || null;
				},

				setItem = function(item, value) {
					// add a key to storage hash
					storage = JSON.decode(exports[storageMethod].getItem(privateKey)) || storage;
					storage[item] = value;

					if (hasNativeStorage) {
						try {
							exports[storageMethod].setItem(privateKey, JSON.encode(storage));
						}
						catch(e) {
							// session expired / tabs error (security)
						}
					}
					else {
						serializeWindowName();
					}

					return this;
				},

				removeItem = function(item) {
					// remove a key from the storage hash
					delete storage[item];

					if (hasNativeStorage) {
						try {
							exports[storageMethod].setItem(privateKey, JSON.encode(storage));
						}
						catch(e) {
							// session expired / tabs error (security)
						}
					}
					else {
						// remove from window.name also.
						serializeWindowName();
					}
				},

				serializeWindowName = function() {
					// this is the fallback that merges storage into window.name
					var obj = {},
						s = JSON.decode(exports.name);

					obj[privateKey] = storage;
					exports.name = JSON.encode(Object.merge(obj, s));
				};

				return new Class(Object.clone(Methods));
			};



		// actual object returns 2 distinct classes we can use.
		return {
			localStorage: setStorage(localStorage),
			sessionStorage: setStorage(sessionStorage)
		};
	})();

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