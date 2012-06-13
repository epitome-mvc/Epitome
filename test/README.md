Testing via Buster.js
---------------------

[buster-test.js](http://busterjs.org) is a new up-and-coming javascript testing framework in development.

It features standalone static testing or CI testing via node with browser capture.
To see the basic example static test runner, load  `index.html`

To install buster:

    # npm install -g buster

To start the static tester:

    # buster static

To start in capture mode for multiple browsers:

    # buster server &

Once you have captured your target browsers, just run:

    # buster test

Or even better:

    # buster autotest

Standalone testing via `buster test` w/o browser capture is not supported yet, though you could probably try jsdom or phantom.js - edit buster-test.js config and give it a go. Also, you'd need the server only version of mootools.

Auto-testing is experimental but fairly good for MacOSX at present. You can see it in action on our blog here: http://tech.qmetric.co.uk/running-automated-javascript-testing-with-buster-js-autotest_123.html

**nb** please note that when in capture mode via `buster server`, IE7 and IE8 will fire an exception - which is to do with lack of `Object.create`, referenced in one of buster's dependencies `bundle.js`. As a work-around, an es5-shim has been provided that makes tests run in IE7/8 as well.

```sh
dchristoff@Dimitars-iMac:~/projects/Epitome (master):
> buster server &
buster-server running on http://localhost:1111
dchristoff@Dimitars-iMac:~/projects/Epitome (master):
> buster test -r specification
Firefox 13.0, OS X 10.7 (Lion)
  ✓ Basic Epitome model creation with initial data > Expect a model to be created >
  ✓ Basic Epitome model creation with initial data > Expect the _attributes object to contain the sent values >
  ✓ Basic Epitome model creation with initial data > Expect the model to have the default value if not overridden >
  ✓ Basic Epitome model creation with initial data > Expect the model to have the default value overridden by model object >
  ✓ Basic Epitome model creation with initial data > Expect a model not to fire initial change events on set >
  ✓ Basic Epitome model creation with initial data > Expect a model change not to fire if values have not changed >
  ✓ Basic Epitome model creation with initial data > Expect a model change on non-primitive values that serialize to the same not to fire >
  ✓ Basic Epitome model creation with initial data > Expect a model change to fire if values have changed >
  ✓ Basic Epitome model creation with initial data > Expect a model to fire change event for each property passed >
  ✓ Basic Epitome model creation with initial data > Expect a that gets set to null to be removed from model >
  ✓ Basic Epitome model creation with initial data > Expect a key that is not on model to be undefined >
  ✓ Basic Epitome model creation with initial data > Expect model.toJSON to return an object >
  ✓ Basic Epitome model creation with initial data > Expect model.toJSON to return a dereferenced object >
1 test case, 13 tests, 13 assertions, 0 failures, 0 errors, 0 timeouts
Finished in 0.113s
```
