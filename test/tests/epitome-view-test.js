buster.testRunner.timeout = 1000;

buster.testCase('Basic Epitome view test >', {
	setUp: function() {

		this.data = {
			name: 'View',
			type: 'test'
		};

		var self = this,
			viewProto = new Class({

				Extends: Epitome.View,

				options: {
					template: 'This is a {name} {type} render app',
					element: new Element('div')
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
	},

	'Expect a view to be created >': function() {
		buster.assert.isTrue(instanceOf(this.view, Epitome.View));
	}


});