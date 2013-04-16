if (typeof require === 'function') {
	var Epitome = require('../../src/main'),
		buster = require('buster');
}

buster.testRunner.timeout = 2000;

buster.testCase('Basic Epitome Events test >', {

	setUp: function(){

		this.Foo = new Class({

			Implements: Epitome.Events,

			initialize: function(options){
				this.setOptions(options);
				this.name = 'foo';
			}
		});

		this.Bar = new Class({

			Implements: Epitome.Events,

			initialize: function(){
				this.name = 'bar';
			}
		});

	},

	'Expect an event to be added via onEventname > ': function(){
		var spy = this.spy();

		var foo = new this.Foo({
			onTest: spy
		});

		foo.trigger('test');
		buster.assert.called(spy);
	},

	'Expect an event to be removed by off wildcard > ': function(){
		var spy = this.spy();

		var foo = new this.Foo({
			onTest: spy
		});

		foo.off('test');

		foo.trigger('test');
		buster.refute.called(spy);
	},

	'Expect a specific event to be removed by off(name, callback) > ': function(){
		var spy = this.spy(),
			dummy = Function.from();

		var foo = new this.Foo();

		foo.on('test', dummy);
		foo.on('test', spy);
		foo.off('test', dummy);

		foo.trigger('test');
		buster.assert.called(spy);
	},

	'Expect .on to add a single event > ': function(){
		var foo = new this.Foo(),
			spy = this.spy();

		foo.on('test', spy);

		buster.assert.equals(foo.$events['test'][0], spy);
	},

	'Expect .on(object) to add multiple events > ': function(){
		var foo = new this.Foo(),
			spy = this.spy();

		foo.on({
			test: spy,
			test2: spy
		});

		buster.assert.equals(foo.$events['test'][0], spy);
		buster.assert.equals(foo.$events['test2'][0], spy);
	},

	'Expect .off(object) to remove all events > ': function(){
		var foo = new this.Foo(),
			spy = Function.from(),
			saved = {
				test: spy,
				test2: spy
			};

		foo.on(saved);

		foo.off(saved);

		buster.assert.equals(foo.$events['test'].length, 0);
		buster.assert.equals(foo.$events['test2'].length, 0);
	},

	'Expect .listenTo to sub to foreign events and pass other instance > ': function(){
		var foo = new this.Foo(),
			bar = new this.Bar(),
			spy = this.spy(),
			data = 'hi';

		bar.listenTo(foo).on('test', spy);

		foo.trigger('test', [data]);

		buster.assert.calledWith(spy, foo, data);
	}

});