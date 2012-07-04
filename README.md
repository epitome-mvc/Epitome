Epitome
=======

> _Epitome: a typical example of a characteristic or class; embodiment; personification; model_

An experimental Model/View/* for MooTools, created by Dimitar Christoff of QMetric Group.
Licence: MIT

BUT, IS IT MVC?
===============

> &lt;jiggliemon> MVD, Model View Don'task

Documentation
=============

Epitome is largely undocumented with a lot of inline comments added to help you read the source code better.
A [Groc](http://nevir.github.com/groc/)-generated _'Documentation'_ is available here: [http://dimitarchristoff.github.com/Epitome/](http://dimitarchristoff.github.com/Epitome/)

A default `.groc.json` file is added so you can just run `groc` in the root to freshen.

The creation and logic employed in the writing of Epitome has been documented in these blog posts:

- [Creating the Model](http://tech.qmetric.co.uk/creating-your-own-mvc-like-data-model-class-in-mootools_59.html)
- [Creating the Model.Sync](http://tech.qmetric.co.uk/building-a-mootools-micro-mvc-part-2-adding-sync-to-your-model_132.html)

Structure
=========

As this is very much work in progress, I cannot guarantee that it is a MVC library in the true sense of the 'word'. This is
because as of yet, I am unable to decide the degree of responsibility the individual components outside of the Model will
actually have. It could well develop into a MVP and not MVC.

The core module is called Epitome and it has the following structure:

- `Epitome.isEqual` - a module for comparing values, borrowed from _.js
- `Epitome.Model` - the model itself
- `Epitome.Model.Sync` - a plugin for keeping your model and collections in sync via REST endpoints
- `Epitome.Collection` - a pseudo model controller, Observing all model events (works but may change)
- `Epitome.Collection.Sync` - extends the collection to fetch RESTfully (not finished)
- `Epitome.Template` - a pseudo templating interface, currently via a custom MooTools `String.substitute(obj)`
- `Epitome.View` - view rendered, using whatever 3-rd party templating engine (works but may change)
- `Epitome.Router` - a pseudo controller for structuring app based upon hashchange

Building
========

Have a look inside of the simple `app.build.js` you can use for `r.js` (require.js optimiser).

Typically, you'd create a new production build by running:
```sh
dchristoff@Dimitars-iMac:~/projects/Epitome (master):
> r.js -o app.build.js

Tracing dependencies for: epitome
Uglifying file: /Users/dchristoff/projects/Epitome/build/Epitome.js

/Users/dchristoff/projects/Epitome/build/Epitome.js
----------------
/Users/dchristoff/projects/Epitome/src/epitome.js
/Users/dchristoff/projects/Epitome/src/epitome-isequal.js
/Users/dchristoff/projects/Epitome/src/epitome-model.js
/Users/dchristoff/projects/Epitome/src/epitome-model-sync.js
/Users/dchristoff/projects/Epitome/src/epitome-collection.js
/Users/dchristoff/projects/Epitome/src/epitome-collection-sync.js
/Users/dchristoff/projects/Epitome/src/epitome-template.js
/Users/dchristoff/projects/Epitome/src/epitome-view.js
/Users/dchristoff/projects/Epitome/src/epitome-router.js
```

Install requirejs via npm, if you haven't:
```
npm install -g requirejs
```

Alternatively, grab r.js and put it inside the project, then do `node r.js -o app.build.js`

Testing
=======

Tests are currently separated in 2 groups: node tests and browser tests. The distinction is that under node only,
it uses `mootools-server` and lacks `Request` or `Element`, so only unit tests will run.

Testing is run via [Buster.js](http;//busterjs.org) can be found in `/tests/` - check the README.md there for more info.

Support
=======

This is not a working repository in the sense that it's not being released as a product you can use. It's more of an _educational_
experience documenting the process involved in creating a MV* (MVP/MVVM) library on top of MooTools. There are over 100
MV* libraries out there and the last thing anyone needs is another abandon-ware product.

Having said that, the components work fine and it will eventually be fully operational. Feel free to fork, play and contribute
back to the project if you can, pull requests are more than welcome.

Credits
=======

![QMetric](http://tech.qmetric.co.uk/wp-content/themes/the-bootstrap/images/qmetric-logo-on.png)

- Inspiration from Backbone.js
- Ideas from Garrick Cheung and Addy Osmani
- Wrap-up code from Simon Smith and Oliver Caldwell