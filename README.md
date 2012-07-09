Epitome [![Build Status](https://secure.travis-ci.org/DimitarChristoff/Epitome.png?branch=master)](http://travis-ci.org/DimitarChristoff/Epitome)
=======

> _Epitome: a typical example of a characteristic or class; embodiment; personification; model_

Epitome is an experimental M/V/* modular framework based upon MooTools. The building blocks of all components are extensible MooTools classes
and the Event observer patterns that come out of the box.

An example model creation with prototyping looks like this:

    // if using AMD...
    var Epitome (typeof require === 'function')
        ? require('epitome-model-sync')
        : this.Epitome;

    // user class
    var User = new Class({
        Extends: Epitome.Model.Sync,
        options: {
            defaults: {
                urlRoot: '/user/'
            }
        }
    });

    var userModel = new User({
        id: '1',
        name: 'Bobby'
    }, {
        onChange: function(key, value) {
            console.log('you changed ' + key + ' to ' + value);
        },
        "onChange:name": function(value) {
            console.log('you changed your name to ' + value);
        }
    });

    userModel.set({
        surname: 'Roberts',
        name: 'Bob'
    });

BUT, IS IT MVC?
===============

> &lt;jiggliemon> MVD, Model View Don'task

Documentation
=============

Epitome's API is still subject to changes, which means it is undocumented. The code itself is with a lot of inline comments added to help you understand it better.

A [Groc](http://nevir.github.com/groc/)-generated _'Documentation'_ is available here: [http://dimitarchristoff.github.com/Epitome/](http://dimitarchristoff.github.com/Epitome/)
A default `.groc.json` file is added so you can just run `groc` in the root to freshen.

The creation and logic employed in the writing of Epitome has been documented in several blog posts:

- [Creating the Model](http://tech.qmetric.co.uk/creating-your-own-mvc-like-data-model-class-in-mootools_59.html)
- [Creating the Model.Sync](http://tech.qmetric.co.uk/building-a-mootools-micro-mvc-part-2-adding-sync-to-your-model_132.html)
- [Adding the template](http://tech.qmetric.co.uk/epitome-template-a-lightweight-templating-engine-for-mootools-that-works_190.html)
- [Testing it in CI via Travis CI](http://tech.qmetric.co.uk/automating-javascript-ci-with-buster-js-and-travisci_205.html)

Structure
=========

As this is very much work in progress, structure and the API are subject to changes. For the most part,
the core components are very similar to the ones found in Backbone.js

- `Epitome.isEqual` - a module for comparing values, borrowed from _.js
- `Epitome.Model` - the model itself
- `Epitome.Model.Sync` - a plugin for keeping your model and collections in sync via REST endpoints
- `Epitome.Collection` - an Array-like model collection, observing all model events
- `Epitome.Collection.Sync` - extends the collection to fetch and reset if needed
- `Epitome.Template` - based upon _.js and jresig work but safer, `<%=key%>` or `<% logic %>`
- `Epitome.View` - a simple structure which can bind to models, collections or nothing at all
- `Epitome.Router` - a pseudo controller, based upon hashchange

Building
========

You can create a minified concatenated version of Epitome. Have a look inside of the simple `app.build.js` you can use for `r.js` (require.js optimiser).

Typically, you'd create a new production build by running:

    dchristoff@Dimitars-iMac:/projects/Epitome (master):
    > r.js -o app.build.js

    Tracing dependencies for: epitome
    Uglifying file: /projects/Epitome/build/Epitome.js

    /projects/Epitome/build/Epitome.js
    ----------------
    /projects/Epitome/src/epitome.js
    /projects/Epitome/src/epitome-isequal.js
    /projects/Epitome/src/epitome-model.js
    /projects/Epitome/src/epitome-model-sync.js
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


Testing
=======

Tests are currently separated in 2 groups: node tests and browser tests. The distinction is that under node only,
it uses `mootools-server` and lacks `Request` or `Element`, so only unit tests will run.

Testing is run via [Buster.js](http://busterjs.org) can be found in `/tests/` - check the README.md there for more info.

_Please note that as of buster 0.6.0, having browser and node test groups at the same time fails to terminate the buster-test process. node tests are temporary disabled_

Support
=======

There just aren't any MV* frameworks based upon MooTools. Epitome is not stable yet. it was more of an _educational_ experiment
that went too far ended up being too cool to be dumped. It is now being implemented in production environments and will soon
heave an official release with a stable public API. Until this happens, do not base your own production code on top of Epitome
as there may be breaking changes.

Development and contribution
============================

Feel free to fork, play and contribute back to the project if you can, pull requests are more than welcome. Just make sure you
create the request in a branch and write tests / fix existing tests before you send it. Oh, and make sure it does not break the build!

Credits and licensing
=====================

Built by QMetric Group Limited.

Concept and development by [Dimitar Christoff](http://twitter.com/D_mitar)

![QMetric](http://tech.qmetric.co.uk/wp-content/themes/the-bootstrap/images/qmetric-logo-on.png)

Released under the MIT license [http://mootools.net/license.txt](http://mootools.net/license.txt)