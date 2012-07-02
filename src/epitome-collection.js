;(function(exports) {

	var Epitome = typeof require == 'function' ? require('epitome') : exports.Epitome,
		methodMap = ['forEach', 'each', 'invoke', 'filter', 'map', 'some', 'indexOf', 'contains', 'getRandom'];

	// decorator type, only not on the proto. exports.Function in a distant future? It's a Type...
	Function.extend({
		monitorModelEvents: function(listener, orig) {
			// `@listener` - subscriber class to also get the event, required.
			// `@orig` - orig model instance for scope, required.

			var self = this;
			// the original func is `this`, now saved ref.

			// this is brave, may affect scope in edge cases: `.fireEvent.apply(otherobj, args)`
			orig = orig || this;

			// has the events class been mixed in?
			if (!(listener && listener.fireEvent))
				return this;

			return function(type, args, delay) {
				// now pass orig bound to orig scope, or at least the function.
				self.apply(orig, arguments);

				// let controller know and place instance. Make sure model is managed still!
				listener.getModelByCID(orig.cid) && listener.fireEvent(type, Array.flatten([orig, args]), delay);
			};
		}
	});

	var Collection = Epitome.Collection = new Class({

		Implements: [Options,Events],

		// base model is just Epitome.Model
		model: Epitome.Model,

		_models: [],

		initialize: function(models, options) {
			this.setOptions(options);
			models && this.setUp(models);
		},

		setUp: function(models) {
			Array.each(models, this.addModel.bind(this));
		},

		addModel: function(model, replace) {
			// add a new model to collection
			var exists;

			// if it's just an object, make it a model first
			if (typeOf(model) == 'object' && !instanceOf(model, this.model)) {
				model = new this.model(model);
			}

			// assign a cid.
			model.cid = model.cid || model.get('id') || String.uniqueID();

			// already in the collection?
			exists = this.getModelByCID(model.cid);

			// if not asked to replace, bail out.
			if (exists && replace !== true)
				return this.fireEvent('add:error', model);

			// replace an existing model when requested
			exists && replace === true && (this._models[this._models.indexOf(model)] = model);

			// decorate `fireEvent` by making it local on the model instance. we are a quiet subscriber
			model.fireEvent = Function.monitorModelEvents.apply(model.fireEvent, [this, model]);

			// add to models array.
			this._models.push(model);

			this.length = this._models.length;

			// let somebody know.
			return this.fireEvent('add', [model, model.cid]);
		},

		removeModel: function(model) {
			// restore `fireEvent` to one from prototype, aka, `Event.prototype.fireEvent`
			delete model.fireEvent;

			// remove from collection of managed models
			Array.erase(this._models, model);

			this.length = this._models.length;

			// let somebody know we lost one.
			return this.fireEvent('remove', [model, model.cid]);
		},

		getModelByCID: function(cid) {
			// return a model based upon a cid search
			var last = null;

			this.some(function(el) {
				return el.cid == cid && (last = el);
			});

			return last;
		},

		getModelById: function(id) {
			// return a model based upon an id search
			var last = null;

			this.some(function(el) {
				return el.get('id') == id && (last = el);
			});

			return last;
		},

		toJSON: function() {
			// get the toJSON of all models.
			var getJSON = function(model) {
				return model.toJSON();
			};
			return Array.map(this._models, getJSON);
		}
	});

	Array.each(methodMap, function(method) {
		Collection.implement(method, function() {
			return Array.prototype[method].apply(this._models, arguments);
		});
	});


	if (typeof define === 'function' && define.amd) {
		define('epitome-collection', function() {
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