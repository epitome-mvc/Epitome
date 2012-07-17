![Epitome](epitome-logo.png)

The Epitome.Model implementation at its core is a MooTools class with custom data accessors that fires events. As a MooTools Class, you can extend models or implement objects or other classes into your definitions. By default, the MooTools Options and Events classes are implemented already.

## Epitome.Model - API

The following are the officially API'd class methods:

### constructor (initialize)
---
_Expects arguments: `(Object) model, (Object) options`_

The `modelObject` - if passed, sets the internal data hash to a new derefrenced object with the keys of the `modelObject`. Special accessor properties as defined in the `Epitome.Model.prototype.properties` will run first and be applicable. 

The `options` object is a standard MooTools class options override and is being merged with the `Epitome.Model.prototype.options` when a new model is created. It typically contains various event handlers in the form of:

```javascript

new Epitome.Model({}, {
   onChange: function(key, value) {
       console.log(key, value);
   },
   defaults: {
       userTitle: 'admin'
   }
});
```

Supported: `(Object) options.defaults` - allows initial values of the model to be set if they are not being passed to the model constructor.

Constructor fires an event called `ready` when done. Setting the initial model does not fire a `change` event.

### set
---
_Expects arguments: mixed: `(String) key, (Mixed) value` pair or `(Object) obj`_

Allows changing of any individual model key or a set of key/value pairs, encapsulated in an object. Will fire a single `change` event with all the changed properties as well as a specific `change:key` event that passes just the value of the key as argument.

For typing of value, you can store anything at all (Primitives, Objects, Functions) but keep in mind that when it comes to serialising the Model and sending it to the server, only Primitive types make sense. 

### get
---
_Expects arguments: mixed: `(String) key` or `(Array) keys`_

Returns known values within the model for either a single key or an array of keys. For an array of keys, it will return an object with `key` : `value` mapping.

### toJSON
------
_Expects arguments: none_

Returns a de-referenced Object, containing all the known model keys and values.

### unset
-----
_Expects arguments: mixed: `(String) key` or `(Array) keys`_

Removes keys from model, either a single one or an array of multiple keys. Does not fire a change event.

### empty
-----
_Expects arguments: none_

Empties the model of all data and fires a single change event with all keys as well as individual `change:key` events.

Fires an `empty` event.

### destroy
-------
_Expects arguments: none_

Emits a `destroy` event, empties the model. No change event. Event is observed by Collections the model is a member of, where it triggers a `removeModel`


## Epitome.Model Events
======

The following events are emitted by the Model:

### ready
-----
Fires when the model is instantiated and set.

### change
------
_Returns arguments: `(Array) changedProperties`_

Fires on `.set`, returns an array of all properties on the Model that changed since the previous `set`. Does not fire if there are no changes, even when values are not primitives (through _.js -> `Epitome.isEqual`)

### change:key
----------
_Returns arguments: `(Mixed) value`_

Fires on a `.set` on a particular key, eg. `model.set('this', 'that')` will fire `onChange:this` to the instance, passing on `that` as the `value` argument.

### empty
-----
Fires after a model has been emptied of all values through `model.empty()`, independently of all `change` events that fire on the attributes

### destroy
-------
Fires after `.destroy()` has been called. Expect the attributes collection to be an empty object. Observed by collections, which will auto-remove models


## Epitome.Model extras

There are several additional properties each model instance will have.

### _attributes: {}
---------------
The attributes object is __public__ (exposed to manipulation on the instance) and it holds the hash data for the model, based upon keys. It is de-referenced from the constructor object used when creating a model but should not be read directly (normally). Exported by `model.toJSON()` 

### collections: []
---------------
An array that contains references to all instances of Epitome.Collection that the model is currently a member of. Useful for iteration as well as utilised by collections that want to know if Event observers are required.

### options: {}
-----------
A MooTools default options set, which can be on the prototype of the Model constructor.

### options.defaults: {}
--------------------
An object with default Model Attributes to use when instantiating. Merged with Model object when creating. 

### properties: {}
--------------
A collection of custom accessors that override default `model.get` and `model.set` methods. For example:

```javascript
properties: {
    foo: {
        get: function() {
            // scope is model
            return this.foo();
        },
        set: function(value) {
            // don't send this to the attributes, store in the instance directly.
            // won't fire a traditional onChange
            this.foo = value;
        }
    }
}
```
In the example above, any calls to `model.set('foo', value)` and `model.get('foo')` are handled by custom functions. This is a pattern that allows you to use getters and setters for properties that are handled differently than normal ones. It can also be used as pre-processors for data. Make sure that you either set them on the instance directly or that you import the default ones for id in a custom prototype version as they are not merged like options.


## Epitome.Model.Sync

This is an example implementation of RESTful module that extends the base Epitome.Model class and adds the ability to read, update and delete models with remote server. In terms of implementation, there are subtle differences. The API and methods are as the normal [Model](#epitome-model-api), unless outlined below:

### constructor (initialize)
---
_Expects arguments: `(Object) model, (Object) options`_

A model `id` with your model as well as setup a `urlRoot` either as a property of the model or as an options property is required for your model to be synced. The constructor function first calls the Epitome.Model constructor and then sets up the XHR instance and methods.

An additional option has been added `options.emulateREST: true || false`, which is being passed to the Request instance. If your server has no CRUD mapping, emulation can be enabled so everything will go through POST/GET requests with `_method` containing the original intent.

### sync
---
_Expects arguments: `(String) method`, `(Object) model` - optional_

Sync acts as a proxy/interface to the XHR instance in the model `this.request` A method can be one of the following:
> get post, create, read, delete, update

The second argument `model` is optional and should be a simple object. If it is not supplied, the default `model.toJSON()` is used instead.

As a whole, you should NOT use the sync directly but elect to use the API methods for each specific request task.

### parse
---
_Expects arguments: `(Object) response`_

_Expected return: `(Object) response`_

A method that you can extend in your definition of Models for doing any pre-processing of data returned by sync from the server. For example:

```javascript
parse: function(response) {
    // data comes back with decoration. split them first.
    this.meta = response.meta;
    return response.data;
}
```

