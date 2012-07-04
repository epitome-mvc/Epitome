// define a prototype for our model. You can just make an instance of Model but this is cleaner
var testModel = new Class({

	Extends: Epitome.Model,

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
