if (typeof require === 'function') {
	var Epitome = require('../../src/epitome'),
		buster = require('buster');
}

buster.testRunner.timeout = 1000;

buster.testCase('Epitome model storage >', {
	setUp: function() {
		this.dataInitial = {
			foo: 'bar',
			id: '1234-5123'
		};

		this.dataAfter = {
			bar: 'foo'
		};

		this.protoModelLocal = new Class({
			Extends: Epitome.Model,
			Implements: Epitome.Storage.localStorage
		});

		this.protoModelSession = new Class({
			Extends: Epitome.Model,
			Implements: Epitome.Storage.sessionStorage
		});

		this.model = new this.protoModelLocal(this.dataInitial);
		this.model2 = new this.protoModelSession(this.dataInitial);
	},

	tearDown: function() {
		this.model.eliminate();
		this.model2.eliminate();
	},

	'Expect the model to have the sync methods >': function() {
		var hasMethods = !!(this.model.store && this.model.retrieve && this.model.eliminate);
		buster.assert.isTrue(hasMethods);
	},

	'Expect the model to be able to store and retrieve >': function() {
		this.model.store();
		buster.assert.equals(this.model.retrieve(), this.model.toJSON());
	},

	'Expect eliminate to remove storage >': function() {
		this.model.store();
		var data = this.model.retrieve();

		this.model.eliminate();
		buster.refute.equals(this.model.retrieve, data);
	},

	'Expect a new model with the same id to be able to retrieve via storage >': function() {
		this.model.store();
		var data = this.model.toJSON();

		this.model.destroy();

		var newmodel = new this.protoModelLocal({
			id: this.dataInitial.id
		});

		newmodel.set(newmodel.retrieve());
		buster.assert.equals(data, newmodel.toJSON());
	},

	'Expect to be able to use models with localStorage and sessionStorage at the same time >': function() {
		// share the same id, different storage medium
		this.model.set('foo', 'foo');

		this.model.store();

		this.model2.set('foo', 'more foo');

		this.model2.store();

		buster.refute.equals(this.model.retrieve(), this.model2.retrieve())

	}
});