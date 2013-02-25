Testing via Buster.js
---------------------

[![Build Status](https://secure.travis-ci.org/DimitarChristoff/Epitome.png?branch=master)](http://travis-ci.org/DimitarChristoff/Epitome)

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

    # buster autotest -r specification

Standalone testing via `buster test` w/o browser capture is not supported yet, though you could probably try jsdom or phantom.js - edit buster-test.js config and give it a go. Also, you'd need the server only version of mootools and you'd need to feature-detect XHR and disable the model sync tests, see http://busterjs.org/docs/overview/

Something like this can work:
```javascript
buster.testCase('Epitome model sync >', {
    requiresSupportFor: {
        'XHR': typeof(XMLHttpRequest) != 'undefined'
    },

    'setUp': function() {
        // ..
    },

    // ...
});
```

Auto-testing is experimental but fairly good for MacOSX at present. You can see it in action on our blog here: http://tech.qmetric.co.uk/running-automated-javascript-testing-with-buster-js-autotest_123.html

**nb** please note that when in capture mode via `buster server`, IE7 and IE8 will fire an exception - which is to do with lack of `Object.create`, referenced in one of buster's dependencies `bundle.js`. As a work-around, an es5-shim has been provided that makes tests run in IE7/8 as well.

The following console output is just an example, there are currently the following tests:
```
Browser: 14 test cases, 140 tests, 140 assertions, 0 failures, 0 errors, 0 timeouts
Node: 5 test cases, 54 tests, 54 assertions, 0 failures, 0 errors, 0 timeout
```

There is no XHR subsystem in node and no DOMElement either so testing of view and sync modules is not supported when you have not captured a browser.

When running tests, it goes something like this:

```sh
dchristoff@Dimitars-iMac:~/projects/Epitome (master):
$ buster server &
buster-server running on http://localhost:1111
dchristoff@Dimitars-iMac:~/projects/Epitome (master):
$ buster test -r specification
Firefox 19.0, Mac OS X 10.7
  ✓ Basic Epitome empty collection via sync creation > Expect a collection to be created >
  ✓ Basic Epitome empty collection via sync creation > Expect a collection to have fetch >
  ✓ Basic Epitome empty collection via sync creation > Expect models in collection not to be 0 >
Firefox 19.0, Mac OS X 10.7
  ✓ Basic Epitome empty collection creation > Expect adding models to collection to fire onAdd event >
  ✓ Basic Epitome empty collection creation > Expect not to be able to add the same model twice to the collection >
  ✓ Basic Epitome empty collection creation > Expect a collection to be created >
  ✓ Basic Epitome empty collection creation > Expect adding a model with the same cid twice to fire an add:error event >
  ✓ Basic Epitome empty collection creation > Expect adding a model via an object only to create a model and add it >

  [...]

14 test cases, 140 tests, 140 assertions, 0 failures, 0 errors, 0 timeouts
Finished in 0.881s
```
