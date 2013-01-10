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
		this.parent();
		return this;
	}

});


var testModel = new Class({

	Extends: Epitome.Model.Sync,

	options: {
		defaults: {
			urlRoot: 'data'
		},
		emulateREST: !true
	}
});

var testCollectionProto = new Class({

	Extends: Epitome.Collection.Sync,

	options: {
		urlRoot: 'data/collection/response.json'
	},

	model: testModel
});

var testCollection = new testCollectionProto();
testCollection.fetch();

var testInstance = new testView({

	collection: testCollection,

	element: 'demo',

	template: '<div class="task" data-id="<%=id%>"><div class="floatRight"><a href="#" class="task-remove">x remove</a></div><div class="task-title"><%=title%></div><div class="task-body"><%=task%></div><div class="clear"></div></div>',

	// event binding
	events: {
		'click:relay(a.task-remove)': 'removeTask',
		'click:relay(button.task-create)': 'newTask',
		'click:relay(button.change-one)': 'changeFirst',
		'click:relay(button.sort)': 'resort'
	},

	onReady: function() {
		this.render();
	},

	'onSort:collection': function() {
		this.render();
	},

	'onChange:collection': function() {
		this.render();
	},

	'onAdd:collection': function() {
		this.render();
	},

	'onFetch:collection': function() {
		this.render();
	},

	onRemoveTask: function(e, el) {
		e && e.stop && e.stop();
		var id = el.getParent('div.task').get('data-id'),
			model = this.collection.getModelById(id);

		this.collection.removeModel(model);
		model.delete_();
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
	},

	onResort: function(e, el) {
		e && e.stop && e.stop();

		this.collection.sort(el.get('data-sort'));
	}
});
