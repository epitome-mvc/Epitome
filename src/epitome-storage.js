;(function(exports){
	'use strict';

	// wrapper function for requirejs or normal object
	var wrap = function(){

		var storage = (function(){
			// returns 2 classes for use with localStorage and sessionStorage as mixins

			// feature detect if storage is available
			var hasNativeStorage = !!(typeof exports.localStorage === 'object' && exports.localStorage.getItem),

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
						catch (o_O) {
							// session expired / multiple tabs error (security), downgrade.
							hasNativeStorage = false;
						}
					}

					if (!hasNativeStorage){
						// try to use a serialized object in window.name instead
						try {
							s = JSON.decode(exports.name);
							if (s && typeof s === 'object' && s[privateKey])
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
							return item in storage ? storage[item] : null;
						},

						setItem = function(item, value){
							// add a key to storage hash
							storage = hasNativeStorage ? JSON.decode(exports[storageMethod].getItem(privateKey)) || storage : storage;
							storage[item] = value;

							if (hasNativeStorage){
								try {
									exports[storageMethod].setItem(privateKey, JSON.encode(storage));
								}
								catch (o_O) {
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
								catch (o_O) {
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
		define(['./epitome'], wrap);
	}
	else {
		exports.Epitome || (exports.Epitome = {});
		exports.Epitome.Storage = wrap(exports);
	}
}(this));