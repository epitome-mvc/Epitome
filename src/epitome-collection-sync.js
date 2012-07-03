;(function(exports) {

	var Epitome = typeof require == 'function' ? require('epitome-collection') : exports.Epitome,
		noUrl = 'no-urlRoot-set',
		eventPseudo = 'fetch:';

	//this file is not functional.

	Epitome.Collection.Sync = new Class({

		Extends: Epitome.Collection,

		options: {
			urlRoot: noUrl
		},

		initialize: function(models, options) {
			this.setupSync();
			this.parent(models, options);
		},

		setupSync: function() {
			// single request object as in models. independent of models.
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
				url: this.options.urlRoot,
				emulation: this.options.emulateREST,
				onRequest: incrementRequestId,
				onCancel: function() {
					this.removeEvents(eventPseudo + rid);
				},
				onSuccess: function(responseObj) {
					self.fireEvent('fetch', [responseObj, this.options.method, this.options.data]);
					self.fireEvent(eventPseudo + rid, [responseObj]);
					self.processModels(responseObj);
				},
				onFailure: function() {
					self.fireEvent(eventPseudo + 'error', [this.options.method, this.options.url, this.options.data]);
				}
			});

			return this;
		},

		fetch: function(refresh) {
			this._throwAwayEvent(function(models) {
				this.fireEvent('fetch', [models])
			});

			this.request.get();

			// dangerous. async stuff coming.
			return this;
		},

		processModels: function(models) {
			var self = this;
			Array.each(models, function(model) {
				var exists = model.id && self.getModelById(model.id);
				if (exists) {
					model.set(model);
				}
				else {
					self.addModel(model);
				}
			});
		},

		_throwAwayEvent: function(callback) {
			// this is a one-off event that will ensure a fetch event fires only once per .fetch
			var eventName = eventPseudo + this.getRequestId(),
				self = this,
				throwAway = {};

			if (!callback || typeof callback !== 'function')
				return;

			throwAway[eventName] = function(responseObj) {
				callback.apply(self, responseObj);

				// remove this one-off event.
				self.removeEvents(throwAway);
			};

			return this.addEvents(throwAway);
		}.protect()


	});

	if (typeof define === 'function' && define.amd) {
		define('epitome-collection-sync', function() {
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