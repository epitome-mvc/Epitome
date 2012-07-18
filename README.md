![Epitome](https://github.com/DimitarChristoff/Epitome/raw/master/example/epitome-logo.png)

> _Epitome: a typical example of a characteristic or class; embodiment; personification; model_

Epitome is an experimental MV* modular framework based upon MooTools. The building blocks of all components are extensible MooTools classes
and the Event observer patterns that come out of the box.

[![Build Status](https://secure.travis-ci.org/DimitarChristoff/Epitome.png?branch=master)](http://travis-ci.org/DimitarChristoff/Epitome)

**BUT, IS IT MVC?**

> &lt;jiggliemon> MVD, Model View Don'task

Strictly speaking, `Epitome.View` is closer to a MVP implementation than a classic MVC with thin logic around the views, represented by `Epitome.Template`. If you feel strongly about semantics of the patterns used, you should look at [Digesting JavaScript MVC – Pattern Abuse Or Evolution?](http://addyosmani.com/blog/digesting-javascript-mvc-pattern-abuse-or-evolution/) by Addy Osmani, a talk he gave at London Ajax recently.

Epitome's API is still subject to changes, which means documentation is not overly verbose. The code itself is with a lot of inline comments added to help you understand it better.

The creation and logic employed in the writing of Epitome has been documented in several blog posts:

* [Creating the Model](http://tech.qmetric.co.uk/creating-your-own-mvc-like-data-model-class-in-mootools_59.html)
* [Creating the Model.Sync](http://tech.qmetric.co.uk/building-a-mootools-micro-mvc-part-2-adding-sync-to-your-model_132.html)
* [Adding the template](http://tech.qmetric.co.uk/epitome-template-a-lightweight-templating-engine-for-mootools-that-works_190.html)
* [Testing it in CI via Travis CI](http://tech.qmetric.co.uk/automating-javascript-ci-with-buster-js-and-travisci_205.html)

## Epitome.Model - API

The Epitome.Model implementation at its core is a MooTools class with custom data accessors that fires events. As a MooTools Class, you can extend models or implement objects or other classes into your definitions. By default, the MooTools Options and Events classes are implemented already.

The following are the officially API'd class methods:

### constructor (initialize)
---
_Expects arguments: `(Object) model`, `(Object) options`_

_Returns: `this`_

_**Events: `ready`**_

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
_Expects arguments: mixed: `(String) key`, `(Mixed) value` - pair - or: `(Object) obj`_

_Returns: `this`_

_**Events:**_

 * `change: function(changedProperties)`
 * `change:key: function(valueForKey)`

Allows changing of any individual model key or a set of key/value pairs, encapsulated in an object. Will fire a single `change` event with all the changed properties as well as a specific `change:key` event that passes just the value of the key as argument.

For typing of value, you can store anything at all (Primitives, Objects, Functions) but keep in mind that when it comes to serialising the Model and sending it to the server, only Primitive types make sense. 

### get
---
_Expects arguments mixed: `(String) key` or `(Array) keys`_

_Returns: `this`_

Returns known values within the model for either a single key or an array of keys. For an array of keys, it will return an object with `key` : `value` mapping.

### toJSON
------
_Expects arguments: none_

Returns a de-referenced Object, containing all the known model keys and values.

### unset
-----
_Expects arguments: mixed: `(String) key` or `(Array) keys`_

_Returns: `this`_

Removes keys from model, either a single one or an array of multiple keys. Does not fire a change event.

### empty
-----
_Expects arguments: none_

_Returns: `this`_

_**Events: `empty`**_

Empties the model of all data and fires a single change event with all keys as well as individual `change:key` events.

### destroy
-------
_Expects arguments: none_

_Returns: `this`_

_**Events: `destroy`**_

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


## Epitome.Model.Sync - API

This is an example implementation of RESTful module that extends the base Epitome.Model class and adds the ability to read, update and delete models with remote server. In terms of implementation, there are subtle differences. The API and methods are as the normal [Model](#epitome-model-api), unless outlined below:

### constructor (initialize)
---
_Expects arguments: `(Object) model`, `(Object) options`_

A model `id` with your model as well as setup a `urlRoot` either as a property of the model or as an options property is required for your model to be synced. The constructor function first calls the Epitome.Model constructor and then sets up the XHR instance and methods.

An additional option has been added `options.emulateREST: true || false`, which is being passed to the Request instance. If your server has no CRUD mapping, emulation can be enabled so everything will go through POST/GET requests with `_method` containing the original intent.

### sync
---
_Expects optional arguments: `(String) method`, `(Object) model`_

_**Events: `sync: function(responseObj, method, options) {}`**_

Sync acts as a proxy/interface to the XHR instance in the model `this.request` A method can be one of the following:
> get, post, create, read, delete, update

If no method is supplied, a `read` is performed.

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

### save
---
_Expects optional arguments: `(String) key`, `(String) value`_

_Returns: `this`_

_**Events: `save`, `sync`, possibly `create`, `update`**_

The save should send the contents of the model to the server for storage. If it is a model that has not been saved before or fetched from the server, it will do so via `create()`, else, it will use `update()` instead.

If the optional `key` => `value` pair is passed, it will set them on the model and then save the updated model.

### fetch
---
_Expects arguments: none_

_Returns: `this`_

_**Events: `fetch`, `sync`, `read`**_

It will request the server to return the model object for the current id via a `.read()`. It will also change the status of the model (`model.isNewModel`) to false, meaning `.save()` will never use `.create()`. The fetch event will fire once the response object has been returned. The response object is then merged with the current model via a `.set`, it won't empty your data. To do so, you need to issue a `.empty()` first.

## Epitome.Collection - API

Epitome collections are in essence, an Array-like Class that can contain multiple Models. It has a basic model prototype and adding and removing of models works either based upon passing a simple data has or an actual Model instance. When a model is in a collection, it observes all of the model events and fires them on the collection instance. It also allows for filtering, mapping, sorting and many other more convenience methods.

### constructor (initialize)
---
_Expects arguments: `(Array) models / objects` (or a single model /object), `(Object) options`_

_Returns: `this`_

_**Events: `ready`**_

The constructor method will accept a large variety of arguments. You can pass on either an Array of Models or an Array of Objects or a single Model or a single Object. You can also pass an empty Array and populate it later. Typical Collection prototype definition looks something like this:
```
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

### addModel
---
_Expects arguments: `(Mixed) model` , `(Boolean) replace`_

_Returns: `this`_

_**Events: `add: function(model, cid) {}`**_

Adding a Model to a Collection must always happen through this method. It either appends the Model instance to the internal `_models` Array or it creates a new Model and then appends it. It also starts observing the Model's events and emitting them to the Collection instance with an additional argument passed `Model`. So, if you add a Model stored in `bob` and then do `bob.fireEvent('hai', 'there')`, the collection will also fire an event like this: `this.fireEvent('hai', [bob, 'there']); Adding a Model also increases the `Collection.length` property.

The monitoring of the events (Observer) is done through creating a local function override / decoration of the Model's `fireEvent` method, normally inherited from the MooTools Events Class. If a model stops being a part of a collection, the override is destroyed and the default `fireEvent`.

### removeModel
---
_Expects arguments: `(Mixed) model(s)`_

_Returns: `this`_

_**Events: `remove: function(model, cid) {}`, `reset`**_

This method allows you to remove a single model or an array of models from the collection in the same call. For each removed model, a `remove` Event will fire. When removing of all Models is done, the collection will also fire a `reset` event, allowing you to re-render your views if you like.

In addition to removing the Model from the Collection, it removes the reference to the Collection in the Model's `collections` Array. If that model stops being a member of any collection, the observed `fireEvent` method is removed from the Model instance, resulting in the method from the Events Class prototype taking over.

Decreases the `Collection.length` property.

### getModelByCID
---
_Expects arguments: `(String) cid`_

_Returns: `modelInstance` or `null`_

Performs a search in the collection by `cid` (Collection id). Returns found Model instance or `null` if no match is found.

### getModel
---
_Expects arguments: `(Number) id`_

_Returns: `modelInstance` or `null`_

Returns a model based upon the Array index in the Collection.

### getModelById
---
_Expects arguments: `(String) id`_

_Returns: `modelInstance` or `null`_

Performs a search in the collection by the Model's `id` via the standard `getter`. Returns found Model instance or `null` if no match is found.

### getModelById
---
_Expects arguments: `(String) id`_

_Returns: `modelInstance` or `null`_

Performs a search in the collection by the Model's `id` via the standard `getter`. Returns found Model instance or `null` if no match is found.

### toJSON
---
_Expects arguments: none_

_Returns: `modelsData`_

Returns an array of the applied `toJSON` method on all Models in the collection.

### empty
---
_Expects arguments: none_

_Returns: `this`_

_**Events: `remove`, `reset`, `empty`**_

Applies `this.removeModel` to all Models of the collection. Fires `empty` when done - though before that, a `remove` and `reset` will fire, see [removeModel](#epitome-collection-api/removemodel)

### sort
---
_Expects arguments: (Mixed) how_

_Returns: `this`_

_**Events: `sort`**_

Sorting is quite flexible. It works a lot like `Array.prototype.sort`. By default, you can sort based upon strings that represent keys in the Models. For example:
```
users.sort('name');
// descending order pseduo
users.sort('name:desc');
```
Sorting also allows you to pass a function you define yourself as per the [Array.prototype.sort](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/sort) interface. When done, it will fire a `sort` event.

### reverse
---
_Expects arguments: none_

_Returns: `this`_

_**Events: `sort`**_

Reverses sort the order of Models in the collection. Fires a `sort` event, not `reverse`

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

## Epitome.Storage - API

The storage Class is meant to be used as a mix-in. It works with any instances of Epitome.Model (including Epitome.Model.Sync) as well as Epitome.Collection.

To add storage functionality to your model, you declare use in the prototype via the `Implements` mutator:
```
var user = new Class({
    Extends: Epitome.Model,
    Implements: Epitome.Storage.localStorage('model')
});
```
The code above will call the storage factory and enable `localStorage` within your model with a storage namespace key `model`. In the actual storage massive, data will appear under an `epitome-model` key.

The following methods are added to your Class (identical to Element.Storage from MooTools):

### store
---
_Expects optional arguments: `(Object) model`_

_Returns: `this`_

_**Events: `store: function(model) {}`**_

When called without any arguments, store will just save the current model or collection into storage. The models and collections are stored under a sub-key of the value returned `.get('id')`, so it is important to have an id in both if you want to achieve persistence.

**If no id is provided, an id is generated for models and collections, which means a page reload will cause a different id to be generated and no data will be retrieved**

You can also pass a custom object as argument to write instead of the current model or collection.

### retrieve
---
_Expects arguments: none_

_Returns: `(Object) model` or `(Array) collection`_

_**Events: `retrieve: function(model) {}`**_

When you retrieve a model or a collection, it will simply return what the browser has as data (based upon the model or colleciton id as key). It will **NOT** apply a `model.set(data)` for you, you need to do this yourself.
```
var bob = new user({
    id: 'bob'
});

// populate model from storage, if available.
bob.set(bob.retrieve());
```

Automatically populate:
```
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
_Expects arguments: none_

_Returns: `this`_

_**Events: `eliminate`**_

Calling eliminate on a model or a collection will destroy the stored data the browser has for that model or collection.

## Examples
---

A quick model creation with prototyping and `localStorage` looks like this:

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


## Building
---

You can create a minified concatenated version of Epitome. Have a look inside of the simple `app.build.js` you can use for `r.js` (require.js optimiser).

Typically, you'd create a new production build by running:

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

Install requirejs via npm, if you haven't:

    npm install -g requirejs

Alternatively, grab r.js and put it inside the project, then do `node r.js -o app.build.js`

An npm package is also available:

    npm install epitome

## Testing
---

Tests are currently separated in 2 groups: node tests and browser tests. The distinction is that under node only,
it uses `mootools-server` and lacks `Request` or `Element`, so only unit tests will run.

Testing is run via [Buster.js](http://busterjs.org) can be found in `/tests/` - check the README.md there for more info.

_Please note that as of buster 0.6.0, having browser and node test groups at the same time fails to terminate the buster-test process. node tests are temporary disabled_


## Development and contribution
---

Feel free to fork, play and contribute back to the project if you can, pull requests are more than welcome. Just make sure you
create the request in a branch and write tests / fix existing tests before you send it. Oh, and make sure it does not break the build!

## Credits and licensing
---

Built by QMetric Group Limited.

Concept and development by [Dimitar Christoff](http://twitter.com/D_mitar)

![QMetric](http://tech.qmetric.co.uk/wp-content/themes/the-bootstrap/images/qmetric-logo-on.png)

Released under the MIT license [http://mootools.net/license.txt](http://mootools.net/license.txt)