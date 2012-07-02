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

			if (options.collection) {
				this.collection = options.collection;
				delete options.collection;
			}

			this.setOptions(options);
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

		template: function(data) {
			return Epitome.Template.compile(this.options.template, data)
		},

		render: function() {
			this.element.set('html', this.template(this.options.data));
			return this;
		},

		empty: function() {
			this.element.empty();
			return this.fireEvent('empty');
		},

		dispose: function() {
			this.element.dispose();
			return this.fireEvent('dispose');
		},

		destroy: function() {
			this.element.destroy();
			return this.fireEvent('destroy');
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