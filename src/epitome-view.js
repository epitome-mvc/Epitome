/*jshint strict:false */
;(function(){
	// 'use strict';  // breaks tests due to mootools reliance on args.callee and fireEvent

	// wrapper function for requirejs or normal object
	var wrap = function(Template, Model, Collection, Events){

		return new Class({

			Implements: [Events],

			// a string or element to render to and bind events on
			element: null,

			// optional, a collection may be bound to the view
			collection: null,

			// optional, a model may be bound to the view
			model: null,

			// preset stuff like template and the event map
			options: {
				template: '',
				// the event map should be like `elementEvent`: `instanceEvent`
				// for example: '{click:relay(a.task-remove)': 'removeTask'}
				// will fire instance's onRemoveTask handler when a.task-remove is pressed within the element.
				events: {}
			},

			initialize: function(options){
				// constructor like function.

				// deal with collection first to avoid reference errors with object.clone / merge for setOptions
				if (options && options.collection){
					this.setCollection(options.collection);
					delete options.collection;
				}

				// deal with model as well
				if (options && options.model){
					this.setModel(options.model);
					delete options.model;
				}

				// now we can hopefully setOptions safely.
				this.setOptions(options);

				// define the element.
				if (this.options.element){
					this.setElement(this.options.element, this.options.events);
					delete this.options.element;
				}

				// let the instance know
				return this.trigger('ready');
			},

			setElement: function(el, events){
				// set the element and clean-up old one
				this.element && this.detachEvents() && this.destroy();
				this.element = document.id(el);
				events && this.attachEvents(events);

				return this;
			},

			setCollection: function(collection){
				// a collection should be a real collection.
				var self = this,
					eventProxy = function(type){
						return function(){
							self.trigger(type + ':collection', arguments);
						};
					};

				if (instanceOf(collection, Collection)){
					this.collection = collection;
					// listen in for changes.
					this.collection.on({
						'change': eventProxy('change'),
						'fetch': eventProxy('fetch'),
						'add': eventProxy('add'),
						'remove': eventProxy('remove'),
						'sort': eventProxy('sort'),
						'reset': eventProxy('reset'),
						'error': eventProxy('error')
					});
				}

				return this;
			},

			setModel: function(model){
				// a model should be an Epitome model
				var self = this,
					eventProxy = function(type){
						return function(){
							self.trigger(type + ':model', arguments);
						};
					};

				if (instanceOf(model, Model)){
					this.model = model;
					// listen in for changes.
					this.model.on({
						'change': eventProxy('change'),
						'destroy': eventProxy('destroy'),
						'empty': eventProxy('empty'),
						'error': eventProxy('error')
					});
				}

				return this;
			},

			attachEvents: function(events){
				// add events to main element.
				var self = this;
				Object.each(events, function(method, type){
					self.element.addEvent(type, function(){
						self.trigger(method, arguments);
					});
				});

				this.element.store('attachedEvents', events);

				return this;
			},

			detachEvents: function(){
				// remove attached events from an element
				var events = this.element.retrieve('attachedEvents');
				events && this.element.removeEvents(events).eliminate('attachedEvents');

				return this;
			},

			template: function(data, template){
				// refactor this to work with any other template engine in your constructor
				template = template || this.options.template;

				// instantiate a template engine when needed
				var compiler = this.Template || (this.Template = new Template());

				return compiler.template(template, data);
			},

			render: function(){
				// refactor this in your constructor object. for example:
				// this.element.set('html', this.template(this.options.data));
				// this.parent(); // fires the render event.
				return this.trigger('render');
			},

			empty: function(soft){
				// with soft flag it does not destroy child elements but detaches from dom
				if (soft){
					this.element.empty();
				}
				else {
					this.element.set('html', '');
				}

				return this.trigger('empty');
			},

			dispose: function(){
				// detach the element from the dom.
				this.element.dispose();

				return this.trigger('dispose');
			},

			destroy: function(){
				// remove element from dom and memory.
				this.element.destroy();

				return this.trigger('destroy');
			}

		});
	}; // end wrap

	if (typeof define === 'function' && define.amd){
		define(['./epitome-template', './epitome-model', './epitome-collection', './epitome-events'], wrap);
	}
	else {
		this.Epitome || (this.Epitome = {Template: {}, Model: {}, Collection: {}, Events: {}});
		this.Epitome.View = wrap(this.Epitome.Template, this.Epitome.Model, this.Epitome.Collection, this.Epitome.Events);
	}
}.call(this));