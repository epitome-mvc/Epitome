if (typeof require === 'function') {
	var Epitome = require('../../src/epitome'),
		buster = require('buster');
}

buster.testRunner.timeout = 1000;

buster.testCase('Basic Epitome view test >', {
	setUp: function() {

		this.data = {
			name: 'View',
			type: 'test'
		};

		this.element = new Element('div').inject(document.body);

		var self = this,
			viewProto = new Class({

				Extends: Epitome.View,

				options: {
					template: 'This is a <%=name%> <%=type%> render app',
					element: this.element,
					events: {
						click: 'handleClick'
					}
				},

				render: function() {
					this.element.set('html', this.template(self.data));
					this.parent();
				}
			});

		this.view = new viewProto();
	},

	tearDown: function() {
		this.view.destroy();
		this.view.removeEvents();
	},

	'Expect a view to be created >': function() {
		buster.assert.isTrue(instanceOf(this.view, Epitome.View));
	},

	'Expect the view to have an element >': function() {
		buster.assert.equals(this.element, this.view.element);
	},

	'Expect the view to render and call the onRender event >': function() {
		var spy = this.spy();
		this.view.addEvent('render', spy);
		this.view.render();
		buster.assert.called(spy);
	},

	'Expect the .template to change based upon data >': function() {
		var data1 = this.view.template(this.data),
			data2 = this.view.template({
				name: 'foo',
				type: 'fail'
			});

		buster.refute.equals(data1, data2);
	},

	'Expect the view to render the compiled template >': function(done) {
		this.view.addEvent('render', function() {
			buster.assert.equals(this.element.get('html'), 'This is a View test render app');
			done();
		});
		this.view.render();
	},

	'Expect the events to be added to the element from options event map >': function() {
		buster.refute.isNull(this.view.element.retrieve('events')['click']);
	},

	'Expect the events on the element to bubble to class instance >': function() {
		var spy = this.spy();
		this.view.addEvent('handleClick', spy);
		this.view.element.fireEvent('click', {});
		buster.assert.called(spy);
	}

});