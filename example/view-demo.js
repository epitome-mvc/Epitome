// define a prototype for our model. You can just make an instance of Model but this is cleaner
var testView = new Class({

	Extends: Epitome.View,

	render: function() {
		var views = [],
			self = this;

		var controls = this.element.getElement('div.task-controls').dispose();

		this.empty();
		this.collection.each(function(model) {
			views.push(self.template(model.toJSON()));
		});

		this.element.set('html', views.join('')).adopt(controls);
	}

});


var testModel = new Class({

	Extends: Epitome.Model.Sync,

	options: {
		defaults: {
			urlRoot: '/blah'
		}
	}
});

var testCollectionProto = new Class({

	Extends: Epitome.Collection,

	model: testModel
});

var testCollection = new testCollectionProto([{
	id: 1,
	title: 'Task one',
	task: 'Do me first'
}, {
	id: 2,
	title: 'Task two',
	task: 'Do me next'
}, {
	id: 3,
	title: 'Task three',
	task: 'Do me last'
}]);


var testInstance = new testView({

	collection: testCollection,

	element: 'demo',

	template: '<div class="task" data-id="{id}"><div class="floatRight"><a href="#" class="task-remove">x remove</a></div><div class="task-title">{title}</div><div class="task-body">{task}</div><div class="clear"></div></div>',

	// event binding
	events: {
		'click:relay(a.task-remove)': 'removeTask',
		'click:relay(button.task-create)': 'newTask',
		'click:relay(button.change-one)': 'changeFirst'
	},

	onReady: function() {
		this.collection.addEvents({
			'change': this.render.bind(this)
		});
	},

	onRemoveTask: function(e, el) {
		e && e.stop && e.stop();
		var id = el.getParent('div.task').get('data-id'),
			model = this.collection.getModelById(id);

		this.collection.removeModel(model);
		this.render();
	},

	onNewTask: function(e, el) {
		testCollection.addModel({
			id: Number.random(1000, 100000),
			title: 'New Task',
			task: 'Some text'
		});
	},

	onChangeFirst: function(e, el) {
		var model = testCollection.getRandom();
		model.set({
			title: String.uniqueID()
		});

		model.save();
	}
});

testInstance.render();