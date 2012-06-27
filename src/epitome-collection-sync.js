;(function(exports) {

	var Epitome = typeof require == 'function' ? require('epitome-collection') : exports.Epitome,
		noUrl = 'no-urlRoot-set';

	//this file is not functional.

	Epitome.Collection.Sync = new Class({

		Extends: Epitome.Collection,

		options: {
			urlRoot: noUrl,
			emulateREST: false
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
					this.removeEvents(syncPseudo + rid);
				},
				onSuccess: function(responseObj) {
					self.fireEvent('sync', [responseObj, this.options.method, this.options.data]);
					self.fireEvent(syncPseudo + rid, [responseObj]);
				},
				onFailure: function() {
					self.fireEvent(syncPseudo + 'error', [this.options.method, this.options.url, this.options.data]);
				}
			});
		},

		sync: function() {

		}

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