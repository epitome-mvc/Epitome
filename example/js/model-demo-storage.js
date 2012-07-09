// define a prototype for our model. You can just make an instance of Model but this is cleaner
var testModel = new Class({
	Extends: Epitome.Model.Storage
});



new testModel({
	initial: 'data',
	id: 'hai'
}).create();

// should read the initial data from the old model
testInstance = new testModel({
	id: 'hai'
}, {
	onRead: function() {
		console.log('read', this.toJSON())
	},
	onDestroy: function() {
		console.log('model removed from storage');
	},
	onUpdate: function(model) {
		console.log('saved into storage', model);
	}
});



// careful - here be dragons. shared single request instance
// this should be event-driven and not chained, but it's an example of the api.

// get a model from the server
testInstance.read();

testInstance.set('hai', 'back');

testInstance.update();

console.log(testInstance.get('initial'));

testInstance.destroy.delay(10000, testInstance);