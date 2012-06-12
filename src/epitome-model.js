;(function(exports) {

    var Epitome = typeof require == 'function' ? require('epitome') : exports.Epitome;

    Epitome.Model = new Class({

        Implements: [Options, Events],

        _attributes: {},

        // custom accessors.
        properties: {},

        // initial `private` object
        options: {
            defaults: {}
        },

        initialize: function(obj, options) {
            // constructor for Model class.

            // are there any defaults passed? better to have them on the proto.
            options && options.defaults && (this.options.defaults = Object.merge(this.options.defaults, options.defaults));

            // initial obj should pass on a setter (this will fail for now).
            obj && typeOf(obj) === 'object' && this.set(Object.merge(this.options.defaults, obj));

            // merge options overload, will now add the events.
            this.setOptions(options);
        },

        set: function() {
            // call the real getter. we proxy this because we want
            // a single event after all properties are updated and the ability to work with
            // either a single key, value pair or an object
            this.propertiesChanged = [];
            this._set.apply(this, arguments);
            // if any properties did change, fire a change event with the array.
            this.propertiesChanged.length && this.fireEvent('change', this.propertiesChanged);
        },

        // private, real setter functions, not on prototype, see note above
        _set: function(key, value) {
            // needs to be bound the the instance.
            if (!key || typeof value === undefined) return this;

            // custom setter - see bit further down
            if (this.properties[key] && this.properties[key]['set'])
                return this.properties[key]['set'].call(this, value);


            // no change? this is crude and works for primitives.
            if (this._attributes[key] && Epitome.isEqual(this._attributes[key], value))
                return this;

            if (value === null) {
                delete this._attributes[key]; // delete = null.
            }
            else {
                this._attributes[key] = value;
            }

            // fire an event.
            this.fireEvent('change:' + key, value);

            // store changed keys...
            this.propertiesChanged.push(key);

            return this;
        }.overloadSetter(),   // mootools abstracts overloading to allow object iteration

        get: function(key) {
            // and the overload getter
            return (key && typeof this._attributes[key] !== undefined)
                ? this.properties[key] && this.properties[key]['get'] ? this.properties[key]['get'].call(this) : this._attributes[key] : null;
        }.overloadGetter(),

        toJSON: function() {
            return Object.clone(this._attributes);
        }
    });

    if (typeof define === 'function' && define.amd) {
        define('epitome-model', function() {
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