;(function(exports) {

	var Epitome = typeof require == 'function' ? require('epitome-template') : exports.Epitome;


	Epitome.View = new Class({

		Implements: [Options, Events],

		element: null,

		options: {
			template: ""
			/*
			events: {
				"click": "render"
			},
			*/
		},

		initialize: function(options) {
			this.setUp(options);
		},

		setUp: function(options) {
			if (options.element) {
				this.element = document.id(options.element);
				delete options.element;
			}

			if (options.events && this.element) {
				this.attachEvents(options.events);
				delete options.events;
			}

			this.setOptions(options);
			this.template = this.options.template;
			return this;
		},

		attachEvents: function(events) {
			var self = this;
			Object.each(events, function(method, type) {
				self.element.addEvent(type, function(e) {
					self.fireEvent(method, arguments);
				});
			});

		},

		render: function() {
			this.element.set('html', Epitome.Template.compile(this.options.template, this.options.data));
			return this;
		},

		dispose: function() {
			this.element.dispose();
			return this;
		},

		destroy: function() {
			this.element.destroy();
			return this;
		}

	});



	if (typeof define === 'function' && define.amd) {
		define('epitome-view', function() {
			return Epitome;
		});
	}
	else if (typeof module === 'object') {
		module.exports = Epitome;
	}
	else {
		exports.Epitome = Epitome;
	}
}(this));