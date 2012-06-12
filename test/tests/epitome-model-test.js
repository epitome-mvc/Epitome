buster.testRunner.timeout = 1000;

buster.testCase('Basic Epitome model creation with initial data >', {
    setUp: function() {
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
        var self = this;

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

    'Expect a key that is not on model to be undefined >': function() {
        buster.assert.equals(this.model.get('foobar'), undefined);
    },

    'Expect a that gets set to null to be removed from model >': function() {
        this.model.set('foo', null);
        buster.assert.equals(this.model.get('foo'), undefined);
    },

    'Expect model.toJSON to return an object >': function() {
        buster.assert.equals(typeOf(this.model.toJSON()), 'object');
    },

    'Expect model.toJSON to return a dereferenced object >': function() {
        var json = this.model.toJSON(),
            testStr = 'testing';

        json.foo = testStr;
        buster.refute.equals(this.model.get('foo'), json.foo);
    }

});