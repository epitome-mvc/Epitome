;(function(exports) {

    var Epitome = typeof require == 'function' ? require('epitome') : exports.Epitome;

    // decorator type, only not on the proto. exports.Function in a distant future? It's a Type...
    Function.extend({
        monitorEvents: function(listener, orig) {
            // two arguments. that = subscriber class to also get the event. orig = orig scope.
            var self = this,
                orig = orig || this; // sucky.

            if (!(listener && listener.fireEvent))
                return this;

            return function(type, args, delay) {
                // console.warn('monitor is running');

                // now pass orig bound to orig scope, or at least function.
                self.apply(orig, arguments);

                // let controller know and place instance. HATE IT.
                listener.models[orig.cid] && listener.fireEvent(type, Array.flatten([orig, args]), delay);
            };
        }
    });

    Epitome.Collection = new Class({

        Implements: [Options,Events],

        _models: [],

        initialize: function(models, options) {
            this.setOptions(options);
            this.setUp(models);
        },

        setUp: function() {
            Array.each(models, this.addModel.bind(this));
        },

        addModel: function(model) {
            // subscribe to all events.
            var exists = this._models.getModelByCID(model.cid);
            if (exists)
                return this.fireEvent('add:error', model);

            // decorate fireEvent by making it local.
            model.fireEvent = Function.monitorEvents.apply(model.fireEvent, [this, model]);

            // assign a cid.
            model.cid = model.cid || model.get('id') || String.uniqueID();

            // add to models array.
            this._models.push(model);

            // let somebody know.
            return this.fireEvent('add', model);
        },

        removeModel: function(model) {
            // restore fireEvent to one from prototype, aka, Event.prototype.fireEvent
            delete model.fireEvent;

            // remove from collection of managed models
            Array.erase(this._models, model);

            // let somebody know we lost one.
            return this.fireEvent('remove', model);
        },

        getModelByCID: function(cid) {
            // return a model based upon an id search
            var last = null;

            Array.some(this._models, function(el) {
                return last = el.cid == cid;
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