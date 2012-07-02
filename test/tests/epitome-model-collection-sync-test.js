buster.testRunner.timeout = 1000;

buster.testCase('Basic Epitome empty collection via sync creation >', {
	setUp: function() {
		this.Collection = new Class({
			Extends: Epitome.Collection.Sync,

			foo: function() {

			},

			onChange: function() {
				console.log('hai')
			}
		});

		this.collection = new this.Collection();
		this.model = new Epitome.Model({
			hello: 'there'
		});

	},

	tearDown: function() {
		this.collection.removeEvents('add');
		this.collection.removeEvents('remove');
	},

	'Expect a collection to be created >': function() {
		buster.assert.isTrue(instanceOf(this.collection, Epitome.Collection.Sync));
	},

	'Expect a collection to have sync >': function() {
		buster.assert.isTrue(typeof this.collection.sync !== 'undefined');
	},

});
