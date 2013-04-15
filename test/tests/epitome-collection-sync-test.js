if (typeof require === 'function') {
	var Epitome = require('../../src/main'),
		buster = require('buster');
}

buster.testRunner.timeout = 1000;

buster.testCase('Basic Epitome empty collection via sync creation >', {
	setUp: function(done) {

		var testModel = new Class({
			Extends: Epitome.Model.Sync
		});

		this.CollectionProto = new Class({

			Extends: Epitome.Collection.Sync,

			options: {
				urlRoot: 'example/data/collection/response.json'
			},

			model: testModel
		});

		this.collection = new this.CollectionProto(null, {
			onFetch: function() {
				done();
			}
		});
		this.collection.fetch();
	},

	tearDown: function() {
		this.collection.off('add');
		this.collection.off('remove');
	},

	'Expect a collection to be created >': function() {
		buster.assert.isTrue(instanceOf(this.collection, Epitome.Collection.Sync));
	},

	'Expect a collection to have fetch >': function() {
		buster.assert.isTrue(typeof this.collection.fetch === 'function');
	},

	'Expect models in collection not to be 0 >': function() {
		buster.assert.equals(this.collection._models.length, 10);
	}
});

