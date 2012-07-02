// define a prototype for our model. You can just make an instance of Model but this is cleaner
var testView = new Class({

	Extends: Epitome.View,

	render: function() {
		var views = [],
			self = this;

		this.empty();
		this.collection.each(function(model) {
			views.push(self.template(model.toJSON()));
		});

		this.element.set('html', views.join(''));
	}

});



var testInstance = new testView({

	collection: new Epitome.Collection([{
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
	}]),

	element: 'demo',

	template: '<div class="task" data-id="{id}"><div class="floatRight"><a href="#" class="task-remove">x remove</a></div><div class="task-title">{title}</div><div class="task-body">{task}</div><div class="clear"></div></div>',

	// event binding
	events: {
		'click:relay(a.task-remove)': 'removeTask'
	},

	onRemoveTask: function(e, el) {
		e && e.stop && e.stop();
		var id = el.getParent('div.task').get('data-id'),
			model = this.collection.getModelById(id);

		this.collection.removeModel(model);
		this.render();
	}
});

testInstance.render();