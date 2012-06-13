;(function(exports) {

    var Epitome = typeof require == 'function' ? require('epitome') : exports.Epitome;

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

    Epitome.Collection = new Class({

        Implements: [Options,Events],

        _models: [],

        initialize: function(models, options) {
            this.setOptions(options);
            models && this.setUp(models);
        },

        setUp: function(models) {
            Array.each(models, this.addModel.bind(this));
        },

        addModel: function(model) {
            // subscribe to all events.
            var exists = this._models.getModelByCID(model.cid);
            if (exists)
                return this.fireEvent('add:error', model);

            // decorate `fireEvent` by making it local on the model instance. we are a quiet subscriber
            model.fireEvent = Function.monitorModelEvents.apply(model.fireEvent, [this, model]);

            // assign a cid.
            model.cid = model.cid || model.get('id') || String.uniqueID();

            // add to models array.
            this._models.push(model);

            // let somebody know.
            return this.fireEvent('add', [model, model.cid]);
        },

        removeModel: function(model) {
            // restore `fireEvent` to one from prototype, aka, `Event.prototype.fireEvent`
            delete model.fireEvent;

            // remove from collection of managed models
            Array.erase(this._models, model);

            // let somebody know we lost one.
            return this.fireEvent('remove', [model, model.cid]);
        },

        getModelByCID: function(cid) {
            // return a model based upon an id search
            var last = null;

            Array.some(this._models, function(el) {
                return el.cid == cid && (last = el);
            });

            return last;
        }
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