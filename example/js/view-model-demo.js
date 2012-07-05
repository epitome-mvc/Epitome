// define a prototype for our model. You can just make an instance of Model but this is cleaner
var testView = new Class({

	Extends: Epitome.View,

	render: function() {
		var controls = this.element.getElement('div.task-controls').dispose();

		this.empty();

		this.element.set('html', this.template(this.model.toJSON())).adopt(controls);
		this.parent();
		return this;
	}

});


var testModel = new Class({

	Extends: Epitome.Model,

	options: {
		defaults: {
			id: 1,
			title: 'Task one',
			task: 'Do me'
		}
	}
});



var testInstance = new testView({

	model: new testModel(),

	element: 'demo',

	template: '<div class="task" data-id="<%=id%>"><div class="floatRight"><a href="#" class="task-remove">x remove</a></div><div class="task-title"><%=title%></div><div class="task-body"><%=task%></div><div class="clear"></div></div>',

	// event binding
	events: {
		'click:relay(a.task-remove)': 'emptyModel',
		'click:relay(button.change-one)': 'changeModel'
	},

	onReady: function() {
	},

	'onChange:model': function() {
		this.render();
	},

	onEmptyModel: function(e, el) {
		e && e.stop && e.stop();

		this.model.empty();
		this.render();
	},

	onChangeModel: function(e, el) {

		var model = this.model.toJSON();
		Object.each(model, function(value, key) {
			model[key] = String.uniqueID();
		});

		this.model.set(model);
	}
});

testInstance.render();