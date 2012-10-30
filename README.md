![Epitome](https://github.com/DimitarChristoff/Epitome/raw/master/example/epitome-logo.png)

> _Epitome: a typical example of a characteristic or class; embodiment; personification; model_

Epitome is a new extensible and modular open-source MVP* framework, built out of MooTools Classes and Events. See [credits and licensing](#credits-and-licensing)

[![Build Status](https://secure.travis-ci.org/DimitarChristoff/Epitome.png?branch=master)](http://travis-ci.org/DimitarChristoff/Epitome)

**BUT, IS IT MVC?**

> &lt;jiggliemon> MVD, Model View Don'task

Strictly speaking, `Epitome.View` is closer to a _presenter_ in a MVP implementation than a classic MVC one, with thin logic around the views, represented by `Epitome.Template`. However, because `Epitome.View` is very unassuming, it can be used in a more classical MVC pattern context for multiple purposes.

If you feel strongly about semantics of the patterns used, you should look at [Digesting JavaScript MVC – Pattern Abuse Or Evolution?](http://addyosmani.com/blog/digesting-javascript-mvc-pattern-abuse-or-evolution/) by Addy Osmani, a talk he gave at London Ajax recently.

Epitome's API is still subject to small changes and improvements (mostly additions of events and bug fixes), which means documentation is not overly verbose. The non-minified code has a lot of inline comments to ease understanding and development.

Current version: **0.1.3-AMD**

All individual components of Epitome work as normal javscript files to be used in a browser as well as through `require.js` modules. See [Downloading + Building](#download-building)

<a class="btn btn-large btn-primary" href="#download-building">Epitome Builder</a>
<a class="btn btn-large" href="http://epitome.tenderapp.com/discussion/new" target="_blank">Issue / Discussion on Tender</a>

## Epitome.Model

The Epitome.Model implementation at its core is a MooTools class with custom data accessors that fires events. As a MooTools Class, you can extend models or implement objects or other classes into your definitions. By default, the MooTools Options and Events classes are implemented already.

The Model can fire the following events:

* `ready` - when instantiated
* `change` - when any properties have changed
* `change:key` - when a particular property `key` has changed
* `empty` - when a model has been emptied of all properties
* `destroy` - when a model has been `destroyed` and all data removed.

The following methods are official API on all Model Classes:

### constructor (initialize)
---
<div class="alert">
<p>
_Expects arguments: `(Object) model`, `(Object) options`_
</p>
<p>
_Returns: `this`_
</p>
<p>
_**Events: `ready`**_
</p>
</div>

The `model` - if passed, sets the internal data hash to a new derefrenced object. Special accessor properties, as defined in the `Epitome.Model.prototype.properties`, will run first and be applicable. See [properties](#epitome-model/model-properties) for more info.

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

Of note, the Constructor fires an event called `ready` when done and setting the initial model does not fire a `change` event.

### set
---
<div class="alert" markdown="1">
<p>
_Expects arguments: mixed: `(String) key`, `(Mixed) value` - pair - or: `(Object) obj`_
</p>
<p>
_Returns: `this`_
</p>
<p>
_**Events:**_

<ul>
 <li> `change: function(changedProperties) {}`</li>
 <li> `change:key: function(valueForKey) {}`</li>
 <li> `error: function(objectFailedValidation) {}`</li>
</ul>
</p>
</div>

Allows changing of any individual model key or a set of key/value pairs, encapsulated in an object. Will fire a single `change` event with all the changed properties as well as a specific `change:key` event that passes just the value of the key as argument.

For typing of value, you can store anything at all (Primitives, Objects, Functions). Keep in mind that, when it comes to serialising the Model and sending it to the server, only Primitive types or ones with a sensible `toString()` implementation will make sense.

### get
---
<div class="alert">
<p>
_Expects arguments mixed: `(String) key` or `(Array) keys`_
</p>
<p>
_Returns: `this`_
</p>
</div>

Returns known values within the model for either a single key or an array of keys. For an array of keys, it will return an object with `key` : `value` mapping.

### toJSON
------
<div class="alert">
<p>
_Expects arguments: none_
</p>
</div>

Returns a de-referenced Object, containing all the known model keys and values.

### unset
-----
<div class="alert">
<p>
_Expects arguments: mixed: `(String) key` or `(Array) keys`_
</p>
<p>
_Returns: `this`_
</p>
</div>

Removes keys from model, either a single one or an array of multiple keys. Does not fire a change event.

### empty
-----
<div class="alert">
<p>
_Expects arguments: none_
</p>
<p>
_Returns: `this`_
</p>
<p>
_**Events: `empty`**_
</p>
</div>

Empties the model of all data and fires a single change event with all keys as well as individual `change:key` events.

### destroy
-------
<div class="alert">
<p>
_Expects arguments: none_
</p>
<p>
_Returns: `this`_
</p>
<p>
_**Events: `destroy`**_
</p>
</div>

Empties the model. No change event. Event is observed by Collections the model is a member of, where it triggers a `removeModel()`


### Model properties*

There are several additional properties each model instance will have.

#### _attributes: {}
---------------
The attributes object is __public__ (exposed to manipulation on the instance) and it holds the hash data for the model, based upon keys. It is de-referenced from the constructor object used when creating a model but should not be read directly (normally). Exported by `model.toJSON()`

#### collections: []
---------------
An array that contains references to all instances of Epitome.Collection that the model is currently a member of. Useful for iteration as well as utilised by collections that want to know if Event observers are required.

#### options: {}
-----------
A MooTools default options set, which can be on the prototype of the Model constructor.

#### options.defaults: {}
--------------------
An object with default Model Attributes to use when instantiating. Merged with Model object when creating.

#### properties: {}
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

Keep in mind that if you want to use custom setters as transformers, you need to work with the low-level api and mock the default event system for compatibility. Although this gives you great control, it's not exactly API-friendly and can cause circular references if you are not being careful. For instance, decorating a property `price` with a currency sign:
```javascript
properties: {
    price: {
        set: function(value) {
            // do NOT do this, it will create an infinite loop as it's calling self.
            return this.set('price', '$' + value);
        }
    }
}
```
Instead, you need to work with the `_attributes` object and mock the events:
```javascript
properties: {
    price: {
        set: function(value) {
            // get current value and prep new value.
            var currentValue = this.get('price'),
                newValue = '$' + value;

            // store it in the attributes object
            this._attributes['price'] = newValue;

            // see if we need to raise change events
            if (!Epitome.isEqual(currentValue, newValue)) {
                // individual event
                this.fireEvent('change:price', newValue);
                // if a part of a set({obj}), general change as well.
                this.propertiesChanged.push('price');
            }
        }
    }
}
```
This gives you great versatility but it does require some understanding of the inner workings of Model. The important thing to remember is that the `set` method is a proxy and relies on the __private__ setter `_set`, using the MooTools [overloadSetter](http://stackoverflow.com/a/4013500/126998). The same thing applies to `get`, which is overloaded through `overloadGetter`.

### Model validators*

You can also include basic validators into your model. Validators are an object on the Model prototype that maps any expected key to a function that will return `true` if the validation passes or a `string` error message or `false` on failure.

Here is an example:
```javascript
var validUser = new Class({
    Extends: Epitome.Model,
    validators: {
        email: function(value) {
            return (/(.+)@(.+){2,}\.(.+){2,}/).test(value) ? true : 'This looks like an invalid email address';
        }
    }
});

var userInstance = new validUser({}, {
    onError: function(allErrors) {
        console.log('The following fields were rejected', allErrors);
    },
    'onError:email': function(errorObj) {
        // can have a custom message, action or whatever.
        console.log('Email rejected', errorObj.error);
    }
});

userInstance.set('email', 'this will fail!');
```
The `error` event is observed by collections and views and fires on all view and collection instances.

## Epitome.Model.Sync

This is an example implementation of RESTful module that extends the base Epitome.Model class and adds the ability to read, update and delete models with remote server. In terms of implementation, there are subtle differences. The API and methods are as the normal [Model](#epitome-model), unless outlined below:

### constructor (initialize)
---
<div class="alert">
<p>
_Expects arguments: `(Object) model`, `(Object) options`_
</p>
</div>

A model `id` with your model as well as setup a `urlRoot` either as a property of the model or as an options property is required for your model to be synced. The constructor function first calls the Epitome.Model constructor and then sets up the XHR instance and methods.

<div class="alert">
`options.useJSON` (boolean) is an all-important way to control how your Model talks to your server backend. If your server is a native REST implementation, when this value is `true`, Epitome Sync will set the content-type to application/json and send a strigified JSON of your model on every POST or PUT operation.
 </div>

An additional option has been added `options.emulateREST: true || false`, which is being passed to the Request instance. If your server has no CRUD mapping, emulation can be enabled so everything will go through POST/GET requests with `_method` containing the original intent.

### sync
---
<div class="alert">
<p>
Expects optional arguments: `(String) method`, `(Object) model`_
</p>
<p>
_**Events: `sync: function(responseObj, method, options) {}`**_
</p>
</div>

Sync acts as a proxy/interface to the XHR instance in the model `this.request` A method can be one of the following:
> get, post, create, read, delete, update

If no method is supplied, a `read` is performed.

The second argument `model` is optional and should be a simple object. If it is not supplied, the default `model.toJSON()` is used instead.

As a whole, you should NOT use the sync directly but elect to use the API methods for each specific request task.

### parse
---
<div class="alert">
<p>
_Expects arguments: `(Object) response`_
</p>
<p>
_Expected return: `(Object) response`_
</p>
</div>

A method that you can extend in your definition of Models for doing any pre-processing of data returned by sync from the server. For example:

```javascript
parse: function(response) {
    // data comes back with decoration. split them first.
    this.meta = response.meta;
    return response.data;
}
```

### save
---
<div class="alert">
<p>
_Expects optional arguments: `(String) key`, `(String) value`_
</p>
<p>
_Returns: `this`_
</p>
<p>
_**Events: `save`, `sync`, possibly `create`, `update`**_
</p>
</div>

The save should send the contents of the model to the server for storage. If it is a model that has not been saved before or fetched from the server, it will do so via `create()`, else, it will use `update()` instead.

If the optional `key` => `value` pair is passed, it will set them on the model and then save the updated model.

### fetch
---
<div class="alert">
<p>
_Expects arguments: none_
</p>
<p>
_Returns: `this`_
</p>
<p>
_**Events: `fetch`, `sync`, `read`**_
</p>
</div>

It will request the server to return the model object for the current id via a `.read()`. It will also change the status of the model (`model.isNewModel`) to false, meaning `.save()` will never use `.create()`. The fetch event will fire once the response object has been returned. The response object is then merged with the current model via a `.set`, it won't empty your data. To do so, you need to issue a `.empty()` first.

## Epitome.Collection

Epitome collections are in essence, an Array-like Class that can contain multiple Models. It has a basic model prototype and adding and removing of models works either based upon passing a simple data has or an actual Model instance. When a model is in a collection, it observes all of the model events and fires them on the collection instance. It also allows for filtering, mapping, sorting and many other more convenience methods.

### constructor (initialize)
---
<div class="alert">
<p>
_Expects arguments: `(Array) models / objects` (or a single model /object), `(Object) options`_
</p>
<p>
_Returns: `this`_
</p>
<p>
_**Events: `ready`**_
</p>
</div>

The constructor method will accept a large variety of arguments. You can pass on either an Array of Models or an Array of Objects or a single Model or a single Object. You can also pass an empty Array and populate it later. Typical Collection prototype definition looks something like this:
```javascript
var usersCollection = new Class({
    Extends: Epitome.Collection
    model: userModel // or Epitome.Model by default
});

var users = new usersCollection([{
    id: 'bob'
}], {
    onChange: function(model, props) {
        console.log('model change', model, props);
    },
    onReady: function() {
        console.log('the collection is ready');
    }
});
```
For reference purposes, each Model that enters a collection needs to have a `cid` - collection id. If the Model has an `id`, that is preferred. Otherwise, a `cid` will be generated. If the Model gets an `id` later on, the `cid` will not be changed.

<div class="alert alert-info">
<p>
_Please note that Collections **observe** and bubble **all** model events. For instance, if a Model fires `change`, the Collection instance will fire `onChange`, passing the model as `arguments[0]` and then keeping the rest of the arguments in their original order. For the purposes of implementing this, a decorated local copy of each Model's `.fireEvent` method is created instead of the one from Class.Event prototype. Once a Model stops being a member of collections, the original `fireEvent` is restored by deleting the local method on the Model instance._
</p>
</div>

### addModel
---
<div class="alert">
<p>
_Expects arguments: `(Mixed) model` , `(Boolean) replace`_
</p>
<p>
_Returns: `this`_
</p>
<p>
_**Events: `add: function(model, cid) {}`**_
</p>
</div>

Adding a Model to a Collection must always happen through this method. It either appends the Model instance to the internal `_models` Array or it creates a new Model and then appends it. It also starts observing the Model's events and emitting them to the Collection instance with an additional argument passed `Model`. So, if you add a Model stored in `bob` and then do `bob.fireEvent('hai', 'there')`, the collection will also fire an event like this: `this.fireEvent('hai', [bob, 'there']); Adding a Model also increases the `Collection.length` property.

The monitoring of the events (Observer) is done through creating a local function override / decoration of the Model's `fireEvent` method, normally inherited from the MooTools Events Class. If a model stops being a part of a collection, the override is destroyed and the default `fireEvent`.

### removeModel
---
<div class="alert">
<p>
_Expects arguments: `(Mixed) model(s)`_
</p>
<p>
_Returns: `this`_
</p>
<p>
_**Events: `remove: function(model, cid) {}`, `reset`**_
</p>
</div>

This method allows you to remove a single model or an array of models from the collection in the same call. For each removed model, a `remove` Event will fire. When removing of all Models is done, the collection will also fire a `reset` event, allowing you to re-render your views if you like.

In addition to removing the Model from the Collection, it removes the reference to the Collection in the Model's `collections` Array. If that model stops being a member of any collection, the observed `fireEvent` method is removed from the Model instance, resulting in the method from the Events Class prototype taking over.

Decreases the `Collection.length` property.

### getModel
---
<div class="alert">
<p>
_Expects arguments: `(Number) id`_
</p>
<p>
_Returns: `modelInstance` or `null`_
</p>
</div>

Returns a model based upon the Array index in the Collection.

### getModelByCID
---
<div class="alert">
<p>
_Expects arguments: `(String) cid`_
</p>
<p>
_Returns: `modelInstance` or `null`_
</p>
</div>

Performs a search in the collection by `cid` (Collection id). Returns found Model instance or `null` if no match is found.

### getModelById
---
<div class="alert">
<p>
_Expects arguments: `(String) id`_
</p>
<p>
_Returns: `modelInstance` or `null`_
</p>
</div>

Performs a search in the collection by the Model's `id` via the standard `getter`. Returns found Model instance or `null` if no match is found.

### toJSON
---
<div class="alert">
<p>
_Expects arguments: none_
</p>
<p>
_Returns: `modelsData`_
</p>
</div>

Returns an array of the applied `toJSON` method on all Models in the collection.

### empty
---
<div class="alert">
<p>
_Expects arguments: none_
</p>
<p>
_Returns: `this`_
</p>
<p>
_**Events: `remove`, `reset`, `empty`**_
</p>
</div>

Applies `this.removeModel` to all Models of the collection. Fires `empty` when done - though before that, a `remove` and `reset` will fire, see [removeModel](#epitome-collection/removemodel)

### sort
---
<div class="alert">
<p>
_Expects arguments: (Mixed) how_
</p>
<p>
_Returns: `this`_
</p>
<p>
_**Events: `sort`**_
</p>
</div>

Sorting is quite flexible. It works a lot like `Array.prototype.sort`. By default, you can sort based upon strings that represent keys in the Models. You can also stack up secondary, trinary etc sort keys in case the first one is equal. For example:
```javascript
users.sort('name');
// descending order pseduo
users.sort('name:desc');
// by type and then birthdate in reverse order (oldest first)
users.sort('type,birthdate:desc');
```
Sorting also allows you to pass a function you define yourself as per the [Array.prototype.sort](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/sort) interface. When done, it will fire a `sort` event.

### reverse
---
<div class="alert">
<p>
_Expects arguments: none_
</p>
<p>
_Returns: `this`_
</p>
<p>
_**Events: `sort`**_
</p>
</div>

Reverses sort the order of Models in the collection. Fires a `sort` event, not `reverse`

### find
---
<div class="alert">
<p>
_Expects arguments: (String) expression_
</p>
<p>
_Returns: `(Array) MatchingModelObjects`_
</p>
</div>

This is an experimental API and is subject to change without notice. `Collection.find` is currently powered by the MooTools `Slick.parse` engine. This means you can
 search through your Collection for Models by attributes and `#ids` like you would search in a CSS selector.

For example:
```javascript
var collection = new Epitome.Collection([{
    name: 'Bob',
    id: 2
}, {
    name: 'Angry Bob',
    id: 3
}]);

collection.find('[name]'); // where name is defined.
collection.find('[name=Bob]'); // where name is exactly Bob.
collection.find('[name*=Bob]'); // where name contains Bob.
collection.find('[name$=Bob]'); // where name ends on Bob.
collection.find('[name^=Bob]'); // where name starts with Bob.
collection.find('[name=Bob],[name^=Angry]'); // name Bob OR starting with Angry.
collection.find('[name=Bob][id]'); // name Bob AND to have an id
collection.find('#2[name=Bob],#3'); // (name Bob AND id==2) OR id==3
collection.find('[name=Bob][id=2]'); // name Bob AND id==2

```

Supported operators are `=` (equals), `!=` (not equal), `*=` (contains), `$=` (ends on), `^=` (starts with). Currently, you cannot reverse a condition by adding `!` or `not:` - in fact, pseudos are not supported yet. Find is just sugar and for more complicated stuff, you can either extend it or use `filter` instead.

A new 'feature' has been added that alows you to quickly select deeper object properties by treating any parent keys as tags. For instance:

```
var collection = new Epitome.Collection([{
    name: 'Bob',
    permissions: {
        edit: true
    }
}, {
    name: 'Angry Bob',
    permissions: {
        edit: false
    }
}]);


collection.find('permissions[edit]'); // all where there is an edit property
collection.find('permissions[edit=true]'); // all where there edit is true

```

However, this is more of a syntactic sugar than convention. It won't allow you to do complex CSS-like selections as you cannot combine 'tag' with properties. This means you cannot do `permissions[edit][name=Bob]` as the context changes to the permissions property. This kind of structure is possibly an anti-pattern anyway, try to keep your models flat.


### findOne
---
<div class="alert">
<p>
_Expects arguments: (String) expression_
</p>
<p>
_Returns: `(Model) First matching Model instance or null`_
</p>
</div>

Useful for getting a single Model via the `.find`, this method will return the first matched Model or null if none found.

```javascript
var bob = collection.findOne('[name=bob]');
// if found, set
bob && bob.set('name','Robert');
```

### Array helpers

The following Array methods are also available directly on the Collection instances:

* forEach
* each
* invoke
* filter
* map
* some
* indexOf
* contains
* getRandom
* getLast

For more information, see [Mootools Array Type](http://mootools.net/docs/core/Types/Array)

### Collection properties*

#### _models
---
Each Collection instance has an Array property called `_models` that contains all referenced Model instances. Even though it is not a real private property, it is recommended you do not alter it from outside of the API.

#### length
---
Tries to always reference the length of `_models`.

#### model
---
Each Collection prototype has that property that references a Model prototype constructor. When data is being received in raw format (so, simple Objects), Models are being created by instantiating the stored constructor object in `this.model`.

## Epitome.Collection.Sync

The Sync Class is just a layer on top of the normal [Epitome.Collection](#epitome-collection). It extends the default Collection prototype and adds a Request instance that can retrieve an Array of Model data from a server and add / update the Collection after.

### constructor (initialize)
---
<div class="alert">
<p>
_Expects arguments: `(Array) models / objects` (or a single model /object), `(Object) options`_
</p>
<p>
_Returns: `this`_
</p>
<p>
_**Events: `ready`**_
</p>
</div>

In terms of differences with the original prototype, the `options`, needs just one extra key: `urlRoot`, which should contain the absolute or relative URL to the end-point that can return the Model data.

### fetch
---
<div class="alert">
<p>
_Expects optional arguments: (Boolean) refresh_
</p>
<p>
_Returns: `this`_
</p>
<p>
_**Events: `fetch`**_
</p>
</div>

When called, it will asynchronously try to go and fetch Model data. When data arrives, Models are reconciled with the Models in the collection already by `id`. If they exist already, a `set()` is called that will merge new data into the Model instance and fire `change` events as appropriate. If the optional `refresh` argument is set to true, the current collection will be emptied first via [empty](#epitome-collection/empty).

Returns the instance 'now' but because it is async, applying anything to the collection before the `fetch` event has fired may have unexpected results.

### parse
---
<div class="alert">
<p>
_Expects arguments: `(Mixed) response`_
</p>
<p>
_Expected return: `(Array) response`_
</p>
</div>

A method that you can extend in your definition of Epitome.Collection.Sync for doing any pre-processing of data returned by sync from the server. For example:

```javascript
parse: function(response) {
    // data comes back with decoration. split them first.
    // { meta: { something: 'here' }, models: [] }
    this.meta = response.meta;
    return response.models;
}
```

## Epitome.View

The view is a pretty loose binding around a HTMLElement, it does not try to do much by default. It essentially binds the element to either a Model or a Collection, listening and propagating events that they fire in order to be able to react to them. The expectation is that a `render` method will be defined that uses the data to output it in the browser. The render can be called based upon change or reset events as needed.

### constructor (initialize)
---
<div class="alert">
<p>
_Expects arguments: `(Object) options`_
</p>
<p>
_Returns: `this`_
</p>
<p>
_**Events: `ready`**_
</p>
</div>

A single argument in the shape of an `options` Object is passed to the constructor of the View. It is expected to have special 'mutator'-like properties and key properties that it stores for future use.

A simple example would look like this:
```javascript
// define the View prototype
var testView = new Class({

	Extends: Epitome.View,

	render: function() {
	    // have a render.
		this.empty();
        this.element.set('html', this.template(this.model.toJSON()));
		this.parent();
		return this;
	},

	doEmpty: function() {
	    this.model.empty();
	}
});


var testInstance = new testView({

	model: someModelInstance,

	element: 'someid',

	template: document.id('test-template').get('html'),

	// event binding
	events: {
		'click:relay(a.task-remove)': 'emptyModel', // emit this event to instance
		'click:relay(button.change-one)': 'changeModel'
	},

	onReady: function() {
        this.render();
	},

	'onChange:model': this.render.bind(this),

	onEmptyModel: function(event, element) {
        event && event.stop && event.stop();
        element; // a.task-remove
	    this.doEmpty();
	}
});
```

The key `options` are:

* `element` - a String id or an element to bind events to and reference
* `model` - optional Model instance structure to bind to. Exchangeable with `collection`
* `collection` - optional Collection instance to bind to. Exchangeable with `model`
* `template` - a String of raw HTML that defines the raw template to use in output.
* `events` - an Object with MooTools style event bindings to apply to the `element`, delegated or not. values are implied event handlers on the instance
* `onEventHandlers` - code that reacts to various events that the instance fires.

### render
---
<div class="alert">
<p>
_Expects arguments: unknown_
</p>
<p>
_Returns: `this`_
</p>
<p>
_**Events: `render`**_
</p>
</div>

It is essential that this method is defined in your View prototype Object definition. It does not assume to do anything by default, you need to define how the output takes place and how your data is being used. For convenience, it has access to either `this.model` or `this.collection` as the source of data that can be be passed to the [template](#epitome-view/template) method. It is expected that at the bottom of your definition, `this.parent()` is called in order for the `render` event to fire.

### setElement
---
<div class="alert">
<p>
_Expects arguments: `(Mixed) element`, optional `(Object) events`_
</p>
<p>
_Returns: `this`_
</p>
</div>

A public method that allows you to change or set an element that powers a view. If called the first time, it will get the Element (through `document.id()`) and save the reference in `this.element`. If an events object is passed, it will bind the events. If called a second time, it will unbind all events on the old element, change the element reference and rebind new events, if supplied.

### template
---
<div class="alert">
<p>
_Expects arguments: `(Object) data`, optional `(String) template`_
</p>
<p>
_Returns: compiled template or function._
</p>
</div>

A simple sandbox function where you can either use the Epitome.Template templating engine or call an external engine like Mustache, Handlebars, Hogan etc. The second argument is optional and if not supplied, it will revert to `this.options.template` instead.

An example override to make it work with Mustache would be:
```javascript
var myView = new Class({
    Extends: Epitome.View,
    template: function(data, template) {
        template = template || this.options.template;
        return Mustache.render(template, data);
    },
    render: function() {
        this.element.set('html', this.template({name:'there'}, 'Hello {{name}}'));
    }
});
```

You can change the View prototype to always have Mustache in your views. For example, via AMD/RequireJS, you could do a
small module that deals with the prototyping of the default View constructor. Say, `epitome-view-mustache.js`
```javascript

define(['epitome/epitome-view'], function(View){
	// prototype it for everyone to use mustache in every view.

	View.implement({
		template: function(data, template) {
			// refactor this to work with any other template engine in your constructor
			template = template || this.options.template;

			return Mustache.render(template, data);
		}
	});

});
```

In your Require config (loose example):
```
require.config({
	paths: {
		epitome: '/js/vendor/epitome'
	},
	deps: [
	    // always load
		'epitome/epitome-view-mustache'
	]
});

require(['epitome/epitome-view'], function(View){
    // View is now with the mustache template.
});
```

### empty
---
<div class="alert">
<p>
_Expects arguments: `(Boolean) soft`_
</p>
<p>
_Returns: compiled template or function._
</p>
<p>
_**Events: `empty`**_
</p>
</div>

By default, it will empty the element through making innerHTML an empty string, calling GC on all child nodes. If the `soft` argument is true, will apply `this.element.empty()`, which is a MooTools Element method that removes all child nodes without destroying them.

### dispose
---
<div class="alert">
<p>
_Expects arguments: none_
</p>
<p>
_Returns: compiled template or function._
</p>
<p>
_**Events: `dispose`**_
</p>
</div>

Will detach `this.element` from the DOM. It can be injected again later on.

### destroy
---
<div class="alert">
<p>
_Expects arguments: none_
</p>
<p>
_Returns: compiled template or function._
</p>
<p>
_**Events: `dispose`**_
</p>
</div>

Removes and destroys `this.element` from the DOM and from memory. You need to use [setElement](#epitome-view/setelement) to add a new one if you want to re-render.

## Epitome.Storage

The storage Class is meant to be used as a mix-in. It works with any instances of Epitome.Model (including Epitome.Model.Sync) as well as Epitome.Collection.

To add storage functionality to your model, you declare use in the prototype via the `Implements` mutator:
```javascript
var user = new Class({
    Extends: Epitome.Model,
    Implements: Epitome.Storage.localStorage('model')
});
```
The code above will call the storage factory and enable `localStorage` within your model with a storage namespace key `model`. In the actual storage massive, data will appear under an `epitome-model` key.

The following methods are added to your Class (identical to Element.Storage from MooTools):

### store
---
<div class="alert">
<p>
_Expects optional arguments: `(Object) model`_
</p>
<p>
_Returns: `this`_
</p>
<p>
_**Events: `store: function(model) {}`**_
</p>
</div>

When called without any arguments, store will just save the current model or collection into storage. The models and collections are stored under a sub-key of the value returned `.get('id')`, so it is important to have an id in both if you want to achieve persistence.

**If no id is provided, an id is generated for models and collections, which means a page reload will cause a different id to be generated and no data will be retrieved**

You can also pass a custom object as argument to write instead of the current model or collection.

### retrieve
---
<div class="alert">
<p>
_Expects arguments: none_
</p>
<p>
_Returns: `(Object) model` or `(Array) collection`_
</p>
<p>
_**Events: `retrieve: function(model) {}`**_
</p>
</div>

When you retrieve a model or a collection, it will simply return what the browser has as data (based upon the model or colleciton id as key). It will **NOT** apply a `model.set(data)` for you, you need to do this yourself.
```javascript
var bob = new user({
    id: 'bob'
});

// populate model from storage, if available.
bob.set(bob.retrieve());
```

Automatically populate:
```javascript
var bob = new user({
    id: 'bob'
}, {
    onRetrieve: function(data) {
        this.set(data);
    }
}).retrieve();
```

### eliminate
---
<div class="alert">
<p>
_Expects arguments: none_
</p>
<p>
_Returns: `this`_
</p>
<p>
_**Events: `eliminate`**_
</p>
</div>

Calling eliminate on a model or a collection will destroy the stored data the browser has for that model or collection.

## Epitome.Template

The Template module is a dumbed down implementation of the `underscore.js` _.template(), which in turn was based on work by John Resig. The main differences are the following:

* referencing object keys in the template that have no matching data causes no javascript exception
* only 2 types of tags are supported: `<%=normalKey%>` and `<% evaluated logic %>`
* conditional returns do not output. blocks are preferred, eg. `<% if (foo) { %>is foo<% } else { %>is not foo<% } %>`

You can modify the syntax for the tags by altering the regex in the constructor:
```javascript
options: {
    // default block logic syntax is <% if (data.prop) { %>
    evaluate: /<%([\s\S]+?)%>/g,
    // literal out is <%=property%>
    normal: /<%=([\s\S]+?)%>/g
}
```

## Eptiome.Router

The Router Class is a hashbang controller, useful for single page applications. A direct import of [https://github.com/DimitarChristoff/Router](https://github.com/DimitarChristoff/Router).

### constructor (initialize)
---
<div class="alert">
<p>
_Expects arguments: `(Object) options`_
</p>
<p>
_Returns: `this`_
</p>
<p>
_**Events: `ready`, `before`, `after`, mixed, `undefined`, `error`, `route:add`, `route:remove`**_
</p>
</div>

As this is quite involved and can act as a Controller for your app, here's a practical example that defines a few routes and event handlers within the Epitome.Router Class instantiation:
```javascript
App.router = new Epitome.Router({
    // routes definition will proxy the events
    routes: {
        ''						: 'index',
        '#!help'				: 'help',
        '#!test1/:query/:id?'	: 'test1',
        '#!test2/:query/*'		: 'test2',
        '#!error'               : 'dummyerror'
    },

    // router init
    onReady: function(){
        console.log('init');
    },

    // before route method, fires before the event handler once a match has been found
    onBefore: function(routeId){
        console.log('before', routeId)
    },

    // specific pseudos for :before
    'onIndex:before': function() {
        console.log('we are about to go to the index route');
    },

    // specific pseudos for after
    'onIndex:after': function() {
        console.log('navigated already to index route, update breadcrumb?');
    },

    // after route method has fired, post-route event.
    onAfter: function(route){
        console.info('after', route)
    },

    // routes events callbacks are functions that call parts of your app

    // index
    onIndex: function() {
        console.log('index')
    },

    onHelp: function() {
        console.log('help');
        console.log(this.route, this.req, this.param, this.query)
    },

    onTest1: function(query, id) {
        console.info('test1', query, id);
        console.log(this.route, this.req, this.param, this.query)
    },

    onTest2: function(query) {
        console.info('test2', query);
        console.log(this.route, this.req, this.param, this.query)
    },

    // no route event was found, though route was defined
    onError: function(error){
        console.error(error);
        // recover by going default route
        this.navigate('');
    },

    onUndefined: function() {
        console.log('this is an undefined route');
    },

    'onRoute:remove': function(route) {
        alert(route + ' was removed by popular demand');
    },

    'onRoute:add': function(constructorObject) {
        console.log(constructorObject.id + ' was added as a new route');
    }
});
```
### addRoute
---
<div class="alert">
<p>
_Expects arguments: `(Object) route`_
</p>
<p>
_Returns: `this`_
</p>
<p>
_**Events: `route:add`**_
<p>
</div>

Example adding of route to your instance after instantiation:

```javascript
App.router.addRoute({
    route: '#!dynamicRoute',
    id: 'dynamic',
    events: {
        onDynamic: function() {
            alert('you found the blowfish');
            if (confirm('remove this route?'))
                this.removeRoute('#!dynamicRoute');
        }
    }
});
```

### removeRoute
---
<div class="alert">
<p>
_Expects arguments: `(String) route`_
</p>
<p>
_Returns: `this`_
</p>
<p>
_**Events: `route:remove`**_
</p>
</div>

Removes a route by the route identifier string.

For more examples of Router, have a look inside the [todomvc](https://github.com/DimitarChristoff/Epitome-todo/blob/master/epitome/js/app.js#L42-70) demo.



## Examples

Epitome is modular via AMD but all the files will also work in a browser in plain script tags. When using Require.JS, you can pull in only sub-modules that you need and Epitome will resolve any dependencies automatically:
```
require.config({
    baseUrl: 'src'
});

require(['epitome-model-sync'], function(ModelSync) {
    // pulls in isEqual and Model automatically.
    var tweet = new Class({
        Extends: ModelSync
    });
});
```
If you'd like the whole project (all modules), you can require `main.js` (also exported via NPM):
```
require(['main'], function(Epitome) {
    // Epitome is an object with all the submodules.
    var tweet = new Class({
        Extends: Epitome.Model.Sync,
        Implements: Epitome.Storage.sessionStorage()
    });
});
```

an example skeleton of an Epitome-powered AMD app for RequireJS is available [here](https://github.com/DimitarChristoff/epitome-skeleton-amd)

When using it in a browser or after the Epitome Object contains all your modules, quick model creation with prototyping and `localStorage` can look something like this:
```javascript
// create a new user class prototype, basing it on Epitome.Model.Sync and implement storage
var User = new Class({
    Extends: Epitome.Model.Sync,
    Implements: Epitome.Storage.sessionStorage(),
    options: {
        defaults: {
            urlRoot: '/user'
        }
    }
});

// make a new model with id '1' and a property 'name'
var userModel = new User({
    id: '1',
    name: 'Bobby'
}, {
    // default model values to instance only.
    defaults: {
        surname: 'Robertson'
    },
    // add some events
    onChange: function(key, value) {
        console.log('you changed ' + key + ' to ' + value);
    },
    onSave: function() {
        // also save to localStorage
        this.store();
    },
    "onChange:name": function(value) {
        console.log('you changed your name to ' + value);
    }
}); // attr: name: 'Bobby', id: 1, surname: 'Robertson', userModel.urlRoot = '/user/'

// change some values.
userModel.set({
    surname: 'Roberts',
    name: 'Bob'
});


// get from storage if available, else - from server
var data = userModel.retrieve();
if (data) {
    userModel.set(data);
}
else {
    userModel.read();
}

// go wild!
userModel.save();
```

### Sync and Storage

Here's an example pattern that allows you to use Storage and Sync on a model to reconcile data on the client and on the server. In a scenario where a model is being updated on the client with an implicit Save button that does the Sync but a `onChange` event that saves any changes in `localStorage` in the meanwhile, this is how you'd reconcile the differences:

```javascript
var Model = new Class({
   // extends always before implements
	Extends: Epitome.Model.Sync,
	// use storage
	Implements: Epitome.Storage.localStorage('model')
});

// typically, this will be bound in a view
var model = new Model({
	id: 3
}, {
	onChange: function(){
		this.store();
	},
	onFetch: function(){
		var data = this.retrieve();

		if (!Epitome.isEqual(data, this.toJSON)){
			if (confirm('Local copy differs from server, use it?')) {
				this.set(data);
			}
		}
    }
});

// get latest
model.fetch();

```

This pattern can be applied from views as well. Essentially, you are saying: when a model is fetched (and you already know the id), compare server-side version to what storage knows of this model. If a difference is found, you can either prompt the user to accept the client version and load it or you can automatically merge the changes into the model. Since a change always saves into storage, the client-side version will always have an upto date version of data. This is useful when a model is bound to a view and a user modifies it and then reloads the page or navigates away before saving.

### Prototyping Views

It is sometimes useful to prototype the view, including the events that will be bound - as opposed to doing it in the instantiation.

```javascript
var myView = new Class({
	Extends: Epitome.View,
	options: {
		events: {
			// these relate to this.element. if an element is not passed, they won't matter
			'click:relay(button.save)': 'saveData'
		},
		onSaveData: function(){
			var data = {};
			this.element.getElements('input').each(function(el){
				data[el.get('name')] = el.get('value').stripScripts().clean()
			});
			// notice there is no onChange:model saving via sync, we save on demand
			this.model.set(data);
			this.model.save();
		},
		'onChange:model': function(){
			this.model.store(); // changes in-between go to storage
		}
	}
});

```


For more examples, have a look inside of `example/js/`

### TodoMVC reference
---
A standard [TodoMVC](http://todomvc.com/) reference implementation has been provided here: [Epitome-todo](https://github.com/DimitarChristoff/Epitome-todo).

You can view it in action here:
[http://fragged.org/Epitome/example/todo/epitome/#!/](http://fragged.org/Epitome/example/todo/epitome/#!/)

The todo app is also a submodule of Epitome so you can add it by doing this at the root of the repo:
```
git submodule init
git submodule update
```

And you can keep it updated by going to `~/example/todo/` and doing a pull


## Download + Building

You can check it out of the [github repo](https://github.com/DimitarChristoff/Epitome/) or you can [grab the zip](https://github.com/DimitarChristoff/Epitome/zipball/master) or simply download the minified [Epitome-min.js](https://raw.github.com/DimitarChristoff/Epitome/master/Epitome-min.js).

All files are wrapped into `define` blocks, which means you can simply use `require.js` to ask for a component and all of its dependencies will be resolved automatically for you.

You can create your own minified concatenated version of Epitome with the components you want. Have a look inside of the simple `app.build.js` you can use for `r.js` (require.js optimiser).

Typically, you'd create a new production build by running:

```sh
> r.js -o app.build.js

Tracing dependencies for: epitome
Uglifying file: /projects/Epitome/Epitome-min.js

/projects/Epitome/Epitome-min.js
----------------
/projects/Epitome/src/epitome.js
/projects/Epitome/src/epitome-isequal.js
/projects/Epitome/src/epitome-model.js
/projects/Epitome/src/epitome-model-sync.js
/projects/Epitome/src/epitome-storage.js
/projects/Epitome/src/epitome-collection.js
/projects/Epitome/src/epitome-collection-sync.js
/projects/Epitome/src/epitome-template.js
/projects/Epitome/src/epitome-view.js
/projects/Epitome/src/epitome-router.js
```
Install requirejs via npm, if you haven't:

    npm install -g requirejs

Alternatively, grab r.js and put it inside the project, then do `node r.js -o app.build.js`

An npm package is also available:

    npm install epitome

Please note this will grab it inside of your node_modules and if you use browser components like view and sync, you'd have to move it within your web server root. require('epitome') should then return the contents of `main.js` in the source folder, which grabs all dependencies.

### AMD Builder
---
<div id='customDownload'>You can use <a href='http://fragged.org:39170/'>http://fragged.org:39170/?build=module1,module2</a> to create a custom build automatically. See the documentation page for more</div>

## Testing

Tests are currently separated in 2 groups: node tests and browser tests. The distinction is that under node only,
it uses `mootools-server` and lacks `Request` or `Element`, so only unit tests will run.

Testing is run via [Buster.js](http://busterjs.org) can be found in `/tests/` - check the README.md there for more info.

<div class="alert alert-error">
<p>
_Please note that as of buster 0.6.0, having browser and node test groups at the same time fails to terminate the buster-test process. node tests are temporary disabled_
</p>
</div>

## Development and contribution

Feel free to fork, play and contribute back to the project if you can, pull requests are more than welcome. Just make sure you
create the request in a branch and write tests / fix existing tests before you send it. Oh, and make sure it does not break the build!

The creation and logic employed in the writing of Epitome has been documented in several blog posts on the QMetric tech blog:

* [Creating the Model](http://tech.qmetric.co.uk/creating-your-own-mvc-like-data-model-class-in-mootools_59.html)
* [Creating the Model.Sync](http://tech.qmetric.co.uk/building-a-mootools-micro-mvc-part-2-adding-sync-to-your-model_132.html)
* [Adding the template](http://tech.qmetric.co.uk/epitome-template-a-lightweight-templating-engine-for-mootools-that-works_190.html)
* [Testing it in CI via Travis CI](http://tech.qmetric.co.uk/automating-javascript-ci-with-buster-js-and-travisci_205.html)

## Credits and licensing

Built by QMetric Group Limited.

Concept and development by [Dimitar Christoff](http://twitter.com/D_mitar) with help from [Garrick Cheung](http://twitter.com/garrickcheung), [Chase Wilson](http://twitter.com/jiggliemon), [Simon Smith](http://twitter.com/blinkdesign) & [Chiel Kunkels](http://twitter.com/chielkunkels/)

![QMetric](http://tech.qmetric.co.uk/wp-content/themes/the-bootstrap/images/qmetric-logo-on.png)

Released under the MIT license [http://mootools.net/license.txt](http://mootools.net/license.txt)

Documentation generated via [DocumentUp](http://documentup.com), with a local theme in the style of js garden and our [mootstrap scrollspy plugin](https://github.com/DimitarChristoff/mootstrap-scrollspy)