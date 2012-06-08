;(function(exports) {

    var Epitome = typeof require == 'function' ? require('Epitome') : exports.Epitome,
        Model = Epitome.Model;

    // define CRUD mapping.
    var methodMap = {
        'create': 'POST',
        'read': 'GET',
        'update': 'PUT',
        'delete': 'DELETE'
    };

    Model.Sync = new Class({

        Extends: Model,

        properties: {
            id: {
                get: function() {
                    // always need an id, even if we don't have one.
                    return this._attributes.id || (this._attributes.id = String.uniqueID());
                }
            },
            urlRoot: {
                // normal convention - not in the model!
                set: function(value) {
                    this.urlRoot = value;
                },
                get: function() {
                    // make sure we return a sensible url.
                    var base = this.urlRoot || this.options.urlRoot || 'no-urlRoot-set';
                    base.charAt(base.length - 1) != '/' && (base += '/');
                    return base;
                }
            }
        },

        initialize: function(obj, options) {
            // needs to happen first before events are added,
            // in case we have custom accessors in the model object.
            this.setupSync();
            this.parent(obj, options);
        },

        sync: function(method, model, options) {
            // internal low level api that works with the model request instance.
            options = options || {};

            // determine what to call or do a read by default.
            method = method && methodMap[method] ? methodMap[method] : methodMap['read'];
            options.method = method;

            // if it's a method via POST, append passed object or use exported model
            if (method == methodMap.create || method == methodMap.update)
                options.data = model || this.toJSON();

            // make sure we have the right URL
            options.url = this.get('urlRoot') + this.get('id') + '/';

            // pass it all to the request
            this.request.setOptions(options);

            // call the request class' corresponding method (mootools does that).
            this.request[method](model);
        },

        setupSync: function() {
            var self = this;
            this.request = new Request.JSON({
                // one request at a time
                link: 'chain',
                url: this.get('urlRoot'),
                onSuccess: function(responseObj) {
                    self.fireEvent('sync', [responseObj, this.options.method, this.options.data]);
                },
                onFailure: function() {
                    self.fireEvent('sync:error', [this.options.method, this.options.url, this.options.data]);
                }
            });

            // export crud methods to model.
            Object.each(methodMap, function(requestMethod, protoMethod) {
                self[protoMethod] = function(model, options) {
                    this.sync(protoMethod, model, options);
                };
            });
        },

        fetch: function() {
            // perform a .read and then set returned object key/value pairs to model.
            var self = this,
                throwAway = {
                    sync: function(responseObj) {
                        self.set(responseObj);
                        self.removeEvents(throwAway);
                    }
                };

            this.addEvents(throwAway);
            this.read();
        },

        save: function(key, value) {
            // saves model or accepts a key/value pair/object, sets to model and then saves.
            if (key) {
                var ktype = typeOf(key),
                    canSet = ktype == 'object' || (ktype == 'string' && typeof value != undefined);

                canSet && this._set.apply(this, arguments);
            }

            this.update();
        }
    });

    // Expose the class for AMD, CommonJS and browsers
    if(typeof define === 'function' && define.amd) {
        define(function() {
            return Epitome;
        });
    }
    else if(typeof module === 'object') {
        module.exports = Epitome;
    }
    else {
        exports.Epitome = Epitome;
    }
}(this));