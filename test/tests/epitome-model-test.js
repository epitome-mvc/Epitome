if (typeof require === 'function') {
	var Epitome = require('../../src/epitome'),
		buster = require('buster');
}

buster.testRunner.timeout = 1000;

buster.testCase('Basic Epitome model creation with initial data >', {
	setUp: function() {
		var self = this;

		this.dataInitial = {
			foo: 'bar',
			id: '1234-5123'
		};

		this.dataAfter = {
			bar: 'foo'
		};

		this.dataMany = {
			foo: 'one',
			bar: 'two',
			charlie: 'winning'
		};

		this.options = {
			'onChange:foo': function() {
				self.initialEvents = true;
			},
			defaults: {
				foo: 'not bar',
				name: 'dimitar'
			}
		};

		this.initialEvents = false;

		this.model = new Epitome.Model(this.dataInitial, this.options);
	},

	tearDown: function() {
		this.model.removeEvents('change');
	},

	'Expect a model to be created >': function() {
		buster.assert.isTrue(instanceOf(this.model, Epitome.Model));
	},

	'Expect the _attributes object to contain the sent values >': function() {
		var testVal = 123;
		this.model.set('testing', testVal);
		buster.assert.equals(testVal, this.model._attributes['testing']);
	},

	'Expect the model to have the default value if not overridden >': function() {
		buster.assert.equals(this.model.get('name'), this.options.defaults.name);
	},

	'Expect the model to have the default value overridden by model object >': function() {
		buster.refute.equals(this.model.get('foo'), this.options.defaults.foo);
	},

	'Expect a model not to fire initial change events on set >': function() {
		buster.assert.isFalse(this.initialEvents);
	},

	'Expect a model change not to fire if values have not changed >': function() {
		var spy = this.spy();
		this.model.addEvent('change', function() {
			spy();
		});
		this.model.set(this.dataInitial);
		buster.refute.called(spy);
	},

	'Expect a model change on non-primitive values that serialize to the same not to fire >': function() {
		var spy = this.spy();
		this.model.set('obj', {
			foo: 'bar'
		});
		this.model.addEvent('change', function() {
			spy();
		});
		this.model.set('obj', {
			foo: 'bar'
		});
		buster.refute.called(spy);
	},


	'Expect a model change to fire if values have changed >': function(done) {
		var self = this;
		this.model.addEvent('change:bar', function(val) {
			buster.assert.equals(val, self.dataAfter.bar);
			done();
		});

		this.model.set(this.dataAfter);
	},

	'Expect a model to fire change event for each property passed >': function() {
		var spy = this.spy();
		this.model.addEvent('change', function() {
			spy();
		});

		this.model.set(this.dataMany);
		buster.refute.calledThrice(spy);
	},

	'Expect a key that is not on model to be null >': function() {
		buster.assert.isNull(this.model.get('foobar'));
	},

	'Expect that setting to null removes from model >': function() {
		this.model.set('foo', null);
		buster.assert.isNull(this.model.get('foo'));
	},

	'Expect .unset() removes from model >': function() {
		this.model.unset('foo');
		buster.assert.isNull(this.model.get('foo'));
	},

	'Expect .unset([array]) removes all keys from model >': function() {
		var keys = Object.keys(this.dataMany),
			data;

		// put some values in
		this.model.set(this.dataMany);

		// remove them
		this.model.unset(keys);

		// see what's left, should be null,null,null so an empty array.
		data = Object.values(this.model.get(keys)).filter(function(el) {
			return el !== null;
		});

		buster.assert.equals(data.length, 0);
	},


	'Expect model.toJSON to return an object >': function() {
		buster.assert.equals(typeOf(this.model.toJSON()), 'object');
	},

	'Expect model.toJSON to return a dereferenced object >': function() {
		var json = this.model.toJSON(),
			testStr = 'testing';

		json.foo = testStr;
		buster.refute.equals(this.model.get('foo'), json.foo);
	},

	'Expect model to fire a change passing all changed properties as an object >': function() {
		var self = this;
		this.model.addEvent('change', function(changed) {
			buster.assert.equals(changed, self.dataMany);
		});

		this.model.set(this.dataMany);
	},

	'Expect model accessor `get` to fire instead of normal model get >': function() {
		var spy = this.spy();

		this.model.properties = Object.merge({
			foo: {
				get: function() {
					spy();
					return "intercept";
				}
			}
		}, this.model.properties);

		this.model.get('foo');
		buster.assert.calledOnce(spy);
	},

	'Expect model accessor `get` to prefer custom value over model value >': function() {
		var newFoo = 'not old foo';

		this.model.properties = Object.merge({
			foo: {
				get: function() {
					return newFoo;
				}
			}
		}, this.model.properties);

		buster.assert.equals(this.model.get('foo'), newFoo);
	},

	'Expect model accessor `set` to fire instead of model set, passing the value >': function() {
		var spy = this.spy();

		this.model.properties = Object.merge({
			foo: {
				set: spy
			}
		}, this.model.properties);

		this.model.set('foo', 'bar');
		buster.assert.calledWith(spy, 'bar');
	},

	'Expect empty to fire the event and empty the model >': function() {

		this.model.addEvent('empty', function() {
			buster.assert.equals(this._attributes, {});
		});

		this.model.empty();
	},

	'Expect empty to fire the change event with all model properties >': function() {

		var keys = Object.keys(this.model.toJSON());

		this.model.addEvent('change', function(properties) {
			buster.assert.equals(properties, keys);
		});

		this.model.empty();
	}

});