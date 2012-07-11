// define a prototype for our model. You can just make an instance of Model but this is cleaner
var testModel = new Class({

	Extends: Epitome.Model.Sync,

	Implements: Epitome.Storage.sessionStorage()
});


new testModel({
	initial: 'data',
	id: 'hai'
}).store();

// should read the initial data from the old model
testInstance = new testModel({
	id: 'hai'
}, {
	onRetrieve: function(model) {
		console.log('read from storage', model)
	},
	onEliminate: function() {
		console.log('model removed from storage');
		console.log(this.retrieve());
	},
	onStore: function(model) {
		console.log('saved into storage', model);
	}
});


// careful - here be dragons. shared single request instance
// this should be event-driven and not chained, but it's an example of the api.

// get a model from the server
var model = testInstance.retrieve();
if (model) {
	testInstance.set(model);
}
else {
	testInstance.read();
}

testInstance.set('hai', 'back');
testInstance.store();
console.log(testInstance.retrieve());

console.log(testInstance.get('initial'));

testInstance.eliminate.delay(5000, testInstance);

(function() {
	testInstance.set('hai', 'again');
	testInstance.store();
	console.info(testInstance.retrieve());
}).delay(6000);