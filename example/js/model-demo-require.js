require.config({
	baseUrl: '../src/'
});

// this will require main module, isequal and model
require(['epitome', 'epitome-model-sync'], function(Epitome, Model) {
	// define a prototype for our model. You can just make an instance of Model but this is cleaner
	Epitome.trigger('ready', function(){
		console.log('ready');
	});

	var testModel = new Class({

		Extends: Model,

		options: {
			defaults: {
				foo: 'not bar'
			}
		}
	});

	var testInstance = new testModel({
		initial: 'data'
	}, {
		onChange: function() {
			console.log(arguments);
		},
		'onChange:foo': function(value) {
			console.log('foo is happening!', value);
		}
	});


	// do some changes
	testInstance.set('foo', 'bar');

	console.log(testInstance.toJSON());

	Epitome.trigger('ready');

});