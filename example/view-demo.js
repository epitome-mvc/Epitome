// define a prototype for our model. You can just make an instance of Model but this is cleaner
var testView = new Class({

	Extends: Epitome.View

});



var testInstance = new testView({
	element: 'demo',
	template: 'Hello {name} and welcome to this {app}.<p>Hit your {key} key to continue!</p>',
	data: {
		name: 'tester',
		app: 'Epitome View Demo',
		key: '"any"'
	}
});

testInstance.render();