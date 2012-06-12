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
> buster test
Firefox 13.0, OS X 10.7 (Lion): .........
1 test case, 9 tests, 9 assertions, 0 failures, 0 errors, 0 timeouts
```
