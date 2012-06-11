var buster = (function (setTimeout, B) {
    var isNode = typeof require == "function" && typeof module == "object";
    var div = typeof document != "undefined" && document.createElement("div");
    var F = function () {};

    var buster = {
        bind: function bind(obj, methOrProp) {
            var method = typeof methOrProp == "string" ? obj[methOrProp] : methOrProp;
            var args = Array.prototype.slice.call(arguments, 2);
            return function () {
                var allArgs = args.concat(Array.prototype.slice.call(arguments));
                return method.apply(obj, allArgs);
            };
        },

        partial: function partial(fn) {
            var args = [].slice.call(arguments, 1);
            return function () {
                return fn.apply(this, args.concat([].slice.call(arguments)));
            };
        },

        create: function create(object) {
            F.prototype = object;
            return new F();
        },

        extend: function extend(target) {
            if (!target) { return; }
            for (var i = 1, l = arguments.length, prop; i < l; ++i) {
                for (prop in arguments[i]) {
                    target[prop] = arguments[i][prop];
                }
            }
            return target;
        },

        nextTick: function nextTick(callback) {
            if (typeof process != "undefined" && process.nextTick) {
                return process.nextTick(callback);
            }
            setTimeout(callback, 0);
        },

        functionName: function functionName(func) {
            if (!func) return "";
            if (func.displayName) return func.displayName;
            if (func.name) return func.name;
            var matches = func.toString().match(/function\s+([^\(]+)/m);
            return matches && matches[1] || "";
        },

        isNode: function isNode(obj) {
            if (!div) return false;
            try {
                obj.appendChild(div);
                obj.removeChild(div);
            } catch (e) {
                return false;
            }
            return true;
        },

        isElement: function isElement(obj) {
            return obj && buster.isNode(obj) && obj.nodeType === 1;
        },

        isArray: function isArray(arr) {
            return Object.prototype.toString.call(arr) == "[object Array]";
        },

        flatten: function flatten(arr) {
            var result = [], arr = arr || [];
            for (var i = 0, l = arr.length; i < l; ++i) {
                result = result.concat(buster.isArray(arr[i]) ? flatten(arr[i]) : arr[i]);
            }
            return result;
        },

        each: function each(arr, callback) {
            for (var i = 0, l = arr.length; i < l; ++i) {
                callback(arr[i]);
            }
        },

        map: function map(arr, callback) {
            var results = [];
            for (var i = 0, l = arr.length; i < l; ++i) {
                results.push(callback(arr[i]));
            }
            return results;
        },

        parallel: function parallel(fns, callback) {
            function cb(err, res) {
                if (typeof callback == "function") {
                    callback(err, res);
                    callback = null;
                }
            }
            if (fns.length == 0) { return cb(null, []); }
            var remaining = fns.length, results = [];
            function makeDone(num) {
                return function done(err, result) {
                    if (err) { return cb(err); }
                    results[num] = result;
                    if (--remaining == 0) { cb(null, results); }
                };
            }
            for (var i = 0, l = fns.length; i < l; ++i) {
                fns[i](makeDone(i));
            }
        },

        series: function series(fns, callback) {
            function cb(err, res) {
                if (typeof callback == "function") {
                    callback(err, res);
                }
            }
            var remaining = fns.slice();
            var results = [];
            function callNext() {
                if (remaining.length == 0) return cb(null, results);
                var promise = remaining.shift()(next);
                if (promise && typeof promise.then == "function") {
                    promise.then(buster.partial(next, null), next);
                }
            }
            function next(err, result) {
                if (err) return cb(err);
                results.push(result);
                callNext();
            }
            callNext();
        },

        countdown: function countdown(num, done) {
            return function () {
                if (--num == 0) done();
            };
        }
    };

    if (isNode) {
        module.exports = buster;
        buster.eventEmitter = require("./buster-event-emitter");
        Object.defineProperty(buster, "defineVersionGetter", {
            get: function () {
                return require("./define-version-getter");
            }
        });
    }

    return buster.extend(B || {}, buster);
}(setTimeout, buster));
/*jslint eqeqeq: false, onevar: false, plusplus: false*/
/*global buster, require, module*/
if (typeof require == "function" && typeof module == "object") {
    var buster = require("./buster-core");
}

(function () {
    function eventListeners(eventEmitter, event) {
        if (!eventEmitter.listeners) {
            eventEmitter.listeners = {};
        }

        if (!eventEmitter.listeners[event]) {
            eventEmitter.listeners[event] = [];
        }

        return eventEmitter.listeners[event];
    }

    function thisObjects(eventEmitter, event) {
        if (!eventEmitter.contexts) {
            eventEmitter.contexts = {};
        }

        if (!eventEmitter.contexts[event]) {
            eventEmitter.contexts[event] = [];
        }

        return eventEmitter.contexts[event];
    }

    function throwLater(event, error) {
        buster.nextTick(function () {
            error.message = event + " listener threw error: " + error.message;
            throw error;
        });
    }

    buster.eventEmitter = {
        create: function () {
            return buster.create(this);
        },

        addListener: function addListener(event, listener, thisObject) {
            if (typeof listener != "function") {
                throw new TypeError("Listener is not function");
            }

            eventListeners(this, event).push(listener);
            thisObjects(this, event).push(thisObject);
        },

        hasListener: function hasListener(event, listener, thisObject) {
            var listeners = eventListeners(this, event);
            var contexts = thisObjects(this, event);

            for (var i = 0, l = listeners.length; i < l; i++) {
                if (listeners[i] == listener && contexts[i] === thisObject) {
                    return true;
                }
            }

            return false;
        },

        removeListener: function (event, listener) {
            var listeners = eventListeners(this, event);

            for (var i = 0, l = listeners.length; i < l; ++i) {
                if (listeners[i] == listener) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        },

        emit: function emit(event) {
            var listeners = eventListeners(this, event);
            var contexts = thisObjects(this, event);
            var args = Array.prototype.slice.call(arguments, 1);

            for (var i = 0, l = listeners.length; i < l; i++) {
                try {
                    listeners[i].apply(contexts[i] || this, args);
                } catch (e) {
                    throwLater(event, e);
                }
            }
        },

        bind: function (object, events) {
            var method;

            if (!events) {
                for (method in object) {
                    if (object.hasOwnProperty(method) && typeof object[method] == "function") {
                        this.addListener(method, object[method], object);
                    }
                }
            } else if (typeof events == "string" ||
                       Object.prototype.toString.call(events) == "[object Array]") {
                events = typeof events == "string" ? [events] : events;

                for (var i = 0, l = events.length; i < l; ++i) {
                    this.addListener(events[i], object[events[i]], object);
                }
            } else {
                for (var prop in events) {
                    if (events.hasOwnProperty(prop)) {
                        method = events[prop];

                        if (typeof method == "function") {
                            object[buster.functionName(method) || prop] = method;
                        } else {
                            method = object[events[prop]];
                        }

                        this.addListener(prop, method, object);
                    }
                }
            }

            return object;
        }
    };

    buster.eventEmitter.on = buster.eventEmitter.addListener;
}());

if (typeof module != "undefined") {
    module.exports = buster.eventEmitter;
}
var buster = this.buster || {};

if (typeof require != "undefined") {
    buster = require("buster-core");
}

buster.format = buster.format || {};
buster.format.excludeConstructors = ["Object", /^.$/];
buster.format.quoteStrings = true;

buster.format.ascii = (function () {
    function keys(object) {
        var k = Object.keys && Object.keys(object) || [];

        if (k.length == 0) {
            for (var prop in object) {
                if (object.hasOwnProperty(prop)) {
                    k.push(prop);
                }
            }
        }

        return k.sort();
    }

    function isCircular(object, objects) {
        if (typeof object != "object") {
            return false;
        }

        for (var i = 0, l = objects.length; i < l; ++i) {
            if (objects[i] === object) {
                return true;
            }
        }

        return false;
    }

    function ascii(object, processed, indent) {
        if (typeof object == "string") {
            var quote = typeof this.quoteStrings != "boolean" || this.quoteStrings;
            return processed || quote ? '"' + object + '"' : object;
        }

        if (typeof object == "function" && !(object instanceof RegExp)) {
            return ascii.func(object);
        }

        processed = processed || [];

        if (isCircular(object, processed)) {
            return "[Circular]";
        }

        if (Object.prototype.toString.call(object) == "[object Array]") {
            return ascii.array(object);
        }

        if (!object) {
            return "" + object;
        }

        if (buster.isElement(object)) {
            return ascii.element(object);
        }

        if (object.toString !== Object.prototype.toString) {
            return object.toString();
        }

        return ascii.object.call(this, object, processed, indent);
    }

    ascii.func = function (func) {
        return "function " + buster.functionName(func) + "() {}";
    };

    ascii.array = function (array, processed) {
        processed = processed || [];
        processed.push(array);
        var pieces = [];

        for (var i = 0, l = array.length; i < l; ++i) {
            pieces.push(ascii(array[i], processed));
        }

        return "[" + pieces.join(", ") + "]";
    };

    ascii.object = function (object, processed, indent) {
        processed = processed || [];
        processed.push(object);
        indent = indent || 0;
        var pieces = [], properties = keys(object), prop, str, obj;
        var is = "";
        var length = 3;

        for (var i = 0, l = indent; i < l; ++i) {
            is += " ";
        }

        for (i = 0, l = properties.length; i < l; ++i) {
            prop = properties[i];
            obj = object[prop];

            if (isCircular(obj, processed)) {
                str = "[Circular]";
            } else {
                str = ascii.call(this, obj, processed, indent + 2);
            }

            str = (/\s/.test(prop) ? '"' + prop + '"' : prop) + ": " + str;
            length += str.length;
            pieces.push(str);
        }

        var cons = ascii.constructorName.call(this, object);
        var prefix = cons ? "[" + cons + "] " : ""

        return (length + indent) > 80 ?
            prefix + "{\n  " + is + pieces.join(",\n  " + is) + "\n" + is + "}" :
            prefix + "{ " + pieces.join(", ") + " }";
    };

    ascii.element = function (element) {
        var tagName = element.tagName.toLowerCase();
        var attrs = element.attributes, attribute, pairs = [], attrName;

        for (var i = 0, l = attrs.length; i < l; ++i) {
            attribute = attrs.item(i);
            attrName = attribute.nodeName.toLowerCase().replace("html:", "");

            if (attrName == "contenteditable" && attribute.nodeValue == "inherit") {
                continue;
            }

            if (!!attribute.nodeValue) {
                pairs.push(attrName + "=\"" + attribute.nodeValue + "\"");
            }
        }

        var formatted = "<" + tagName + (pairs.length > 0 ? " " : "");
        var content = element.innerHTML;

        if (content.length > 20) {
            content = content.substr(0, 20) + "[...]";
        }

        var res = formatted + pairs.join(" ") + ">" + content + "</" + tagName + ">";

        return res.replace(/ contentEditable="inherit"/, "");
    };

    ascii.constructorName = function (object) {
        var name = buster.functionName(object && object.constructor);
        var excludes = this.excludeConstructors || buster.format.excludeConstructors || [];

        for (var i = 0, l = excludes.length; i < l; ++i) {
            if (typeof excludes[i] == "string" && excludes[i] == name) {
                return "";
            } else if (excludes[i].test && excludes[i].test(name)) {
                return "";
            }
        }

        return name;
    };

    return ascii;
}());

if (typeof module != "undefined") {
    module.exports = buster.format;
}
/*jslint eqeqeq: false, onevar: false, plusplus: false*/
/*global buster, require, module*/
(function () {
    var isCommonJS = typeof require == "function" && typeof module == "object";
    if (isCommonJS) buster = require("buster-core");
    var toString = Object.prototype.toString;
    var slice = Array.prototype.slice;
    var assert, refute, ba = buster.assertions = buster.eventEmitter.create();

    if (isCommonJS) {
        module.exports = buster.assertions;
    }

    function countAssertion() {
        if (typeof ba.count != "number") {
            ba.count = 0;
        }

        ba.count += 1;
    }

    ba.count = countAssertion;

    function assertEnoughArguments(name, args, num) {
        if (args.length < num) {
            ba.fail("[" + name + "] Expected to receive at least " +
                        num + " argument" + (num > 1 ? "s" : ""));
            return false;
        }

        return true;
    }

    function defineAssertion(type, name, func, fl, messageValues) {
        ba[type][name] = function () {
            var fullName = type + "." + name;
            countAssertion();
            if (!assertEnoughArguments(fullName, arguments, fl || func.length)) return;

            var failed = false;

            var ctx = {
                fail: function () {
                    failed = true;
                    var failArgs = [type, name].concat(slice.call(arguments));
                    fail.apply(this, failArgs);
                    return true;
                }
            };

            var args = slice.call(arguments, 0);

            if (typeof messageValues == "function") {
                args = messageValues.apply(this, args);
            }

            if (!func.apply(ctx, arguments)) {
                return fail.apply(ctx, [type, name, "message"].concat(args));
            }

            if (!failed) {
                ba.emit.apply(ba, ["pass", fullName].concat(args));
            }
        };
    }

    ba.add = function (name, options) {
        var refuteArgs;

        if (options.refute) {
            refuteArgs = options.refute.length;
        } else {
            refuteArgs = options.assert.length;
            options.refute = function () {
                return !options.assert.apply(this, arguments);
            };
        }

        var values = options && options.values; // TODO: Remove
        defineAssertion("assert", name, options.assert, options.assert.length, values);
        defineAssertion("refute", name, options.refute, refuteArgs, values);

        assert[name].message = options.assertMessage;
        refute[name].message = options.refuteMessage;

        if (options.expectation) {
            if (ba.expect && ba.expect.wrapAssertion) {
                ba.expect.wrapAssertion(name, options.expectation);
            } else {
                assert[name].expectationName = options.expectation;
                refute[name].expectationName = options.expectation;
            }
        }
    };

    function interpolate(string, property, value) {
        return string.replace(new RegExp("\\$\\{" + property + "\\}", "g"), value);
    }

    function interpolatePosArg(message, values) {
        var value;
        values = values || [];

        for (var i = 0, l = values.length; i < l; i++) {
            message = interpolate(message, i, ba.format(values[i]));
        }

        return message;
    }

    function interpolateProperties(msg, properties) {
        for (var prop in properties) {
            msg = interpolate(msg, prop, ba.format(properties[prop]));
        }

        return msg || "";
    }

    function fail(type, assertion, msg) {
        delete this.fail;
        var message = interpolateProperties(
            interpolatePosArg(ba[type][assertion][msg] || msg,
                              [].slice.call(arguments, 3)), this);
        ba.fail("[" + type + "." + assertion + "] " + message);
    }

    function isDate(value) {
        // Duck typed dates, allows objects to take on the role of dates
        // without actually being dates
        return typeof value.getTime == "function" &&
            value.getTime() == value.valueOf();
    }

    ba.isDate = isDate;

    function areEqual(expected, actual) {
        if (expected === actual) {
            return true;
        }

        // Elements are only equal if expected === actual
        if (buster.isElement(expected) || buster.isElement(actual)) {
            return false;
        }

        // null and undefined only pass for null === null and
        // undefined === undefined
        /*jsl: ignore*/
        if (expected == null || actual == null) {
            return actual === expected;
        }
        /*jsl: end*/

        if (isDate(expected) || isDate(actual)) {
            return isDate(expected) && isDate(actual) &&
                expected.getTime() == actual.getTime();
        }

        var useCoercingEquality = typeof expected != "object" || typeof actual != "object";

        if (expected instanceof RegExp && actual instanceof RegExp) {
            if (expected.toString() != actual.toString()) {
                return false;
            }

            useCoercingEquality = false;
        }

        // Arrays can only be equal to arrays
        var expectedStr = toString.call(expected);
        var actualStr = toString.call(actual);

        // Coerce and compare when primitives are involved
        if (useCoercingEquality) {
            return expectedStr != "[object Array]" && actualStr != "[object Array]" &&
                expected == actual;
        }

        var expectedKeys = ba.keys(expected);
        var actualKeys = ba.keys(actual);

        if (isArguments(expected) || isArguments(actual)) {
            if (expected.length != actual.length) {
                return false;
            }
        } else {
            if (typeof expected != typeof actual || expectedStr != actualStr ||
                expectedKeys.length != actualKeys.length) {
                return false;
            }
        }

        var key;

        for (var i = 0, l = expectedKeys.length; i < l; i++) {
            key = expectedKeys[i];

            if (!Object.prototype.hasOwnProperty.call(actual, key) ||
                !areEqual(expected[key], actual[key])) {
                return false;
            }
        }

        return true;
    }

    ba.deepEqual = areEqual;

    assert = ba.assert = function assert(actual, message) {
        countAssertion();
        if (!assertEnoughArguments("assert", arguments, 1)) return;

        if (!actual) {
            var val = ba.format(actual)
            ba.fail(message || "[assert] Expected " + val + " to be truthy");
        } else {
            ba.emit("pass", "assert", message || "", actual);
        }
    };

    assert.toString = function () {
        return "buster.assert";
    };

    refute = ba.refute = function (actual, message) {
        countAssertion();
        if (!assertEnoughArguments("refute", arguments, 1)) return;

        if (actual) {
            var val = ba.format(actual)
            ba.fail(message || "[refute] Expected " + val + " to be falsy");
        } else {
            ba.emit("pass", "refute", message || "", actual);
        }
    };

    assert.message = "[assert] Expected ${0} to be thruthy";
    ba.count = 0;

    ba.fail = function (message) {
        var exception = new Error(message);
        exception.name = "AssertionError";

        try {
            throw exception;
        } catch (e) {
            ba.emit("failure", e);
        }

        if (typeof ba.throwOnFailure != "boolean" || ba.throwOnFailure) {
            throw exception;
        }
    };

    ba.format = function (object) {
        return "" + object;
    };

    function msg(message) {
        if (!message) { return ""; }
        return message + (/[.:!?]$/.test(message) ? " " : ": ");
    }

    function actualAndExpectedMessageValues(actual, expected, message) {
        return [actual, expected, msg(message)]
    }

    function actualMessageValues(actual) {
        return [actual, msg(arguments[1])];
    }

    function actualAndTypeOfMessageValues(actual) {
        return [actual, typeof actual, msg(arguments[1])];
    }

    ba.add("same", {
        assert: function (actual, expected) {
            return actual === expected;
        },
        refute: function (actual, expected) {
            return actual !== expected;
        },
        assertMessage: "${2}${0} expected to be the same object as ${1}",
        refuteMessage: "${2}${0} expected not to be the same object as ${1}",
        expectation: "toBeSameAs",
        values: actualAndExpectedMessageValues
    });

    function multiLineStringDiff(actual, expected, message) {
        if (actual == expected) return true;

        var message = interpolatePosArg(assert.equals.multiLineStringHeading, [message]),
            actualLines = actual.split("\n"),
            expectedLines = expected.split("\n"),
            lineCount = Math.max(expectedLines.length, actualLines.length),
            lines = [];

        for (var i = 0; i < lineCount; ++i) {
            if (expectedLines[i] != actualLines[i]) {
                lines.push("line " + (i + 1) + ": " + (expectedLines[i] || "") +
                           "\nwas:    " + (actualLines[i] || ""));
            }
        }

        ba.fail("[assert.equals] " + message + lines.join("\n\n"));
        return false;
    }

    ba.add("equals", {
        assert: function (actual, expected) {
            if (typeof actual == "string" && typeof expected == "string" &&
                (actual.indexOf("\n") >= 0 || expected.indexOf("\n") >= 0)) {
                var message = msg(arguments[2]);
                return multiLineStringDiff.call(this, actual, expected, message);
            }

            return areEqual(actual, expected);
        },

        refute: function (actual, expected) {
            return !areEqual(actual, expected);
        },

        assertMessage: "${2}${0} expected to be equal to ${1}",
        refuteMessage: "${2}${0} expected not to be equal to ${1}",
        expectation: "toEqual",
        values: actualAndExpectedMessageValues
    });

    assert.equals.multiLineStringHeading = "${0}Expected multi-line strings to be equal:\n";

    ba.add("typeOf", {
        assert: function (actual, expected) {
            return typeof actual == expected;
        },
        assertMessage: "${3}typeof ${0} (${2}) expected to be ${1}",
        refuteMessage: "${3}typeof ${0} expected not to be ${1}",
        expectation: "toBeType",

        values: function (actual, expected) {
            return [actual, expected, typeof actual, msg(arguments[2])];
        }
    });

    ba.add("defined", {
        assert: function (actual) {
            return typeof actual != "undefined";
        },
        assertMessage: "${2}Expected to be defined",
        refuteMessage: "${2}Expected ${0} (${1}) not to be defined",
        expectation: "toBeDefined",
        values: actualAndTypeOfMessageValues
    });

    ba.add("isNull", {
        assert: function (actual) {
            return actual === null;
        },
        assertMessage: "${1}Expected ${0} to be null",
        refuteMessage: "${1}Expected not to be null",
        expectation: "toBeNull",
        values: actualMessageValues
    });

    function match(object, matcher) {
        if (matcher && typeof matcher.test == "function") {
            return matcher.test(object);
        }

        if (typeof matcher == "function") {
            return matcher(object) === true;
        }

        if (typeof matcher == "string") {
            matcher = matcher.toLowerCase();
            return !!object && ("" + object).toLowerCase().indexOf(matcher) >= 0;
        }

        if (typeof matcher == "number") {
            return matcher == object;
        }

        if (typeof matcher == "boolean") {
            return matcher === object;
        }

        if (matcher && typeof matcher == "object") {
            for (var prop in matcher) {
                if (!match(object[prop], matcher[prop])) {
                    return false;
                }
            }

            return true;
        }

        throw new Error("Matcher (" + ba.format(matcher) + ") was not a " +
                        "string, a number, a function, a boolean or an object");
    }

    ba.match = match;

    ba.add("match", {
        assert: function (actual, matcher) {
            var passed;

            try {
                passed = match(actual, matcher);
            } catch (e) {
                return this.fail("exceptionMessage", e.message, msg(arguments[2]));
            }

            return passed;
        },

        refute: function (actual, matcher) {
            var passed;

            try {
                passed = match(actual, matcher);
            } catch (e) {
                return this.fail("exceptionMessage", e.message);
            }

            return !passed;
        },

        assertMessage: "${2}${0} expected to match ${1}",
        refuteMessage: "${2}${0} expected not to match ${1}",
        expectation: "toMatch",
        values: actualAndExpectedMessageValues
    });

    assert.match.exceptionMessage = "${1}${0}";
    refute.match.exceptionMessage = "${1}${0}";

    ba.add("isObject", {
        assert: function (actual) {
            return typeof actual == "object" && !!actual;
        },
        assertMessage: "${2}${0} (${1}) expected to be object and not null",
        refuteMessage: "${2}${0} expected to be null or not an object",
        expectation: "toBeObject",
        values: actualAndTypeOfMessageValues
    });

    ba.add("isFunction", {
        assert: function (actual) {
            return typeof actual == "function";
        },
        assertMessage: "${2}${0} (${1}) expected to be function",
        refuteMessage: "${2}${0} expected not to be function",
        expectation: "toBeFunction",
        values: function (actual) {
            return [("" + actual).replace("\n", ""), typeof actual, msg(arguments[1])];
        }
    });

    ba.add("isTrue", {
        assert: function (actual) {
            return actual === true;
        },
        assertMessage: "${1}Expected ${0} to be true",
        refuteMessage: "${1}Expected ${0} to not be true",
        expectation: "toBeTrue",
        values: actualMessageValues
    });

    ba.add("isFalse", {
        assert: function (actual) {
            return actual === false;
        },
        assertMessage: "${1}Expected ${0} to be false",
        refuteMessage: "${1}Expected ${0} to not be false",
        expectation: "toBeFalse",
        values: actualMessageValues
    });

    ba.add("isString", {
        assert: function (actual) {
            return typeof actual == "string";
        },
        assertMessage: "${2}Expected ${0} (${1}) to be string",
        refuteMessage: "${2}Expected ${0} not to be string",
        expectation: "toBeString",
        values: actualAndTypeOfMessageValues
    });

    ba.add("isBoolean", {
        assert: function (actual) {
            return typeof actual == "boolean";
        },
        assertMessage: "${2}Expected ${0} (${1}) to be boolean",
        refuteMessage: "${2}Expected ${0} not to be boolean",
        expectation: "toBeBoolean",
        values: actualAndTypeOfMessageValues
    });

    ba.add("isNumber", {
        assert: function (actual) {
            return typeof actual == "number" && !isNaN(actual);
        },
        assertMessage: "${2}Expected ${0} (${1}) to be a non-NaN number",
        refuteMessage: "${2}Expected ${0} to be NaN or another non-number value",
        expectation: "toBeNumber",
        values: actualAndTypeOfMessageValues
    });

    ba.add("isNaN", {
        assert: function (actual) {
            return typeof actual == "number" && isNaN(actual);
        },
        assertMessage: "${2}Expected ${0} to be NaN",
        refuteMessage: "${2}Expected not to be NaN",
        expectation: "toBeNaN",
        values: actualAndTypeOfMessageValues
    });

    ba.add("isArray", {
        assert: function (actual) {
            return toString.call(actual) == "[object Array]";
        },
        assertMessage: "${2}Expected ${0} to be array",
        refuteMessage: "${2}Expected ${0} not to be array",
        expectation: "toBeArray",
        values: actualAndTypeOfMessageValues
    });

    function isArrayLike(object) {
        return toString.call(object) == "[object Array]" ||
            (!!object && typeof object.length == "number" &&
            typeof object.splice == "function") ||
            ba.isArguments(object);
    }

    ba.isArrayLike = isArrayLike;

    ba.add("isArrayLike", {
        assert: function (actual) {
            return isArrayLike(actual);
        },
        assertMessage: "${2}Expected ${0} to be array like",
        refuteMessage: "${2}Expected ${0} not to be array like",
        expectation: "toBeArrayLike",
        values: actualAndTypeOfMessageValues
    });

    function captureException(callback) {
        try {
            callback();
        } catch (e) {
            return e;
        }

        return null;
    }

    ba.captureException = captureException;

    assert.exception = function (callback, exception, message) {
        countAssertion();
        if (!assertEnoughArguments("assert.exception", arguments, 1)) return

        if (!callback) {
            return;
        }

        var err = captureException(callback);
        message = msg(message);

        if (!err) {
            if (exception) {
                return fail.call({}, "assert", "exception", "typeNoExceptionMessage",
                                 message, exception);
            } else {
                return fail.call({}, "assert", "exception", "message",
                                 message, exception);
            }
        }

        if (exception && err.name != exception) {
            if (typeof window != "undefined" && typeof console != "undefined") {
                console.log(err);
            }

            return fail.call({}, "assert", "exception", "typeFailMessage",
                             message, exception, err.name, err.message);
        }

        ba.emit("pass", "assert.exception", message, callback, exception);
    };

    assert.exception.typeNoExceptionMessage = "${0}Expected ${1} but no exception was thrown";
    assert.exception.message = "${0}Expected exception";
    assert.exception.typeFailMessage = "${0}Expected ${1} but threw ${2} (${3})";
    assert.exception.expectationName = "toThrow";

    refute.exception = function (callback) {
        countAssertion();
        if (!assertEnoughArguments("refute.exception", arguments, 1)) return;

        var err = captureException(callback);

        if (err) {
            fail("refute", "exception", "message",
                 msg(arguments[1]), err.name, err.message, callback);
        } else {
            ba.emit("pass", "refute.exception", callback);
        }
    };

    refute.exception.message = "${0}Expected not to throw but threw ${1} (${2})";
    refute.exception.expectationName = "toThrow";

    ba.add("inDelta", {
        assert: function (actual, expected, delta) {
            return Math.abs(actual - expected) <= delta;
        },
        assertMessage: "${3}Expected ${0} to be equal to ${1} +/- ${2}",
        refuteMessage: "${3}Expected ${0} not to be equal to ${1} +/- ${2}",
        expectation: "toBeInDelta",
        values: function (actual, expected, delta, message) {
            return [actual, expected, delta, msg(message)];
        }
    });

    ba.add("hasPrototype", {
        assert: function (actual, protoObj) {
            return protoObj.isPrototypeOf(actual);
        },
        assertMessage: "${2}Expected ${0} to have ${1} on its prototype chain",
        refuteMessage: "${2}Expected ${0} not to have ${1} on its prototype chain",
        expectation: "toHavePrototype",
        values: actualAndExpectedMessageValues
    });

    ba.add("tagName", {
        assert: function (element, tagName) {
            if (!element.tagName) {
                return this.fail("noTagNameMessage", tagName, element, msg(arguments[2]));
            }

            return tagName.toLowerCase &&
                tagName.toLowerCase() == element.tagName.toLowerCase();
        },
        assertMessage: "${2}Expected tagName to be ${0} but was ${1}",
        refuteMessage: "${2}Expected tagName not to be ${0}",
        expectation: "toHaveTagName",
        values: function (element, tagName, message) {
            return [tagName, element.tagName, msg(message)];
        }
    });

    assert.tagName.noTagNameMessage = "${2}Expected ${1} to have tagName property";
    refute.tagName.noTagNameMessage = "${2}Expected ${1} to have tagName property";

    function indexOf(arr, item) {
        for (var i = 0, l = arr.length; i < l; i++) {
            if (arr[i] == item) {
                return i;
            }
        }

        return -1;
    }

    ba.add("className", {
        assert: function (element, className) {
            if (typeof element.className == "undefined") {
                return this.fail("noClassNameMessage", className, element, msg(arguments[2]));
            }

            var expected = typeof className == "string" ? className.split(" ") : className;
            var actual = element.className.split(" ");

            for (var i = 0, l = expected.length; i < l; i++) {
                if (indexOf(actual, expected[i]) < 0) {
                    return false;
                }
            }

            return true;
        },
        assertMessage: "${2}Expected object's className to include ${0} but was ${1}",
        refuteMessage: "${2}Expected object's className not to include ${0}",
        expectation: "toHaveClassName",
        values: function (element, className, message) {
            return [className, element.className, msg(message)];
        }
    });

    assert.className.noClassNameMessage = "${2}Expected object to have className property";
    refute.className.noClassNameMessage = "${2}Expected object to have className property";

    if (typeof module != "undefined") {
        ba.expect = function () {
            ba.expect = require("./buster-assertions/expect");
            return ba.expect.apply(exports, arguments);
        };
    }

    function isArguments(obj) {
        if (typeof obj != "object" || typeof obj.length != "number" ||
            toString.call(obj) == "[object Array]") {
            return false;
        }

        if (typeof obj.callee == "function") {
            return true;
        }

        try {
            obj[obj.length] = 6;
            delete obj[obj.length];
        } catch (e) {
            return true;
        }

        return false;
    }

    ba.isArguments = isArguments;

    if (Object.keys) {
        ba.keys = function (obj) {
            return Object.keys(obj)
        };
    } else {
        ba.keys = function (object) {
            var keys = [];

            for (var prop in object) {
                if (Object.prototype.hasOwnProperty.call(object, prop)) {
                    keys.push(prop);
                }
            }

            return keys;
        }
    }
}());
if (typeof module == "object" && typeof require == "function") {
    var buster = require("buster-core");
    buster.assertions = require("../buster-assertions");
}

(function (ba) {
    ba.expect = function (actual) {
        var expectation = buster.create(ba.expect.expectation);
        expectation.actual = actual;
        expectation.assertMode = true;

        return expectation;
    };

    ba.expect.expectation = {
        not: function () {
            this.assertMode = !this.assertMode;
            return this;
        }
    };

    ba.expect.wrapAssertion = function (assertion, expectation) {
        ba.expect.expectation[expectation] = function () {
            var args = [this.actual].concat(Array.prototype.slice.call(arguments));
            var type = this.assertMode ? "assert" : "refute"

            try {
                return ba[type][assertion].apply(ba.expect, args);
            } catch (e) {
                e.message = (e.message || "").replace(
                    "[" + type + "." + assertion + "]",
                    "[expect." + (this.assertMode ? "" : "not.") + expectation + "]");
                throw e;
            }
        };
    }

    var prop, expectationName;

    for (prop in ba.assert) {
        if (ba.assert[prop].expectationName) {
            expectationName = ba.assert[prop].expectationName;
            ba.expect.wrapAssertion(prop, expectationName);
        }
    }

    if (typeof module == "object") {
        module.exports = ba.expect;
    }
}(buster.assertions));
/*jslint onevar: false, eqeqeq: false*/
/*global require*/
(function (buster, sinon) {
    var ba, testRunner, stackFilter, format;

    if (typeof require == "function" && typeof module == "object") {
        sinon = require("sinon");
        buster = require("buster-core");
        ba = require("buster-assertions");
        format = require("buster-format");
        testRunner = require("buster-test").testRunner;
        stackFilter = require("buster-test").stackFilter;
    } else {
        ba = buster.assertions;
        format = buster.format;
        testRunner = buster.testRunner;
        stackFilter = buster.stackFilter;
    }

    if (stackFilter && stackFilter.filters) {
        stackFilter.filters.push("lib/sinon");
    }

    if (testRunner) {
        testRunner.onCreate(function (runner) {
            runner.on("test:setUp", function (test) {
                var config = sinon.getConfig(sinon.config);
                config.useFakeServer = false;
                var sandbox = sinon.sandbox.create();
                sandbox.inject(test.testCase);

                test.testCase.useFakeTimers = function () {
                    return sandbox.useFakeTimers.apply(sandbox, arguments);
                };

                test.testCase.sandbox = sandbox;
                var testFunc = test.func;
            });

            runner.on("test:tearDown", function (test) {
                try {
                    test.testCase.sandbox.verifyAndRestore();
                } catch (e) {
                    runner.assertionFailure(e);
                }
            });
        });
    }

    if (format) {
        var formatter = buster.create(format);
        formatter.quoteStrings = false;
        sinon.format = buster.bind(formatter, "ascii");
    }

    if (!ba || !sinon) { return; }

    // Sinon assertions for buster
    function verifyFakes() {
        var method, isNot;

        for (var i = 0, l = arguments.length; i < l; ++i) {
            method = arguments[i];
            isNot = (method || "fake") + " is not ";

            if (!method) this.fail(isNot + "a spy");
            if (typeof method != "function") this.fail(isNot + "a function");
            if (typeof method.getCall != "function") this.fail(isNot + "stubbed");
        }

        return true;
    }

    var sf = sinon.spy.formatters;
    var spyValues = function (spy) { return [spy, sf.c(spy), sf.C(spy)]; };

    ba.add("called", {
        assert: function (spy) {
            verifyFakes.call(this, spy);
            return spy.called;
        },
        assertMessage: "Expected ${0} to be called at least once but was never called",
        refuteMessage: "Expected ${0} to not be called but was called ${1}${2}",
        expectation: "toBeCalled",
        values: spyValues
    });

    function slice(arr, from, to) {
        return [].slice.call(arr, from, to);
    }

    ba.add("callOrder", {
        assert: function (spy) {
            verifyFakes.apply(this, arguments);
            if (sinon.calledInOrder(arguments)) return true;

            this.expected = [].join.call(arguments, ", ");
            this.actual = sinon.orderByFirstCall(slice(arguments)).join(", ");
        },

        assertMessage: "Expected ${expected} to be called in order but were called as ${actual}",
        refuteMessage: "Expected ${expected} not to be called in order"
    });

    function addCallCountAssertion(count) {
        var c = count.toLowerCase();

        ba.add("called" + count, {
            assert: function (spy) {
                verifyFakes.call(this, spy);
                return spy["called" + count];
            },
            assertMessage: "Expected ${0} to be called " + c + " but was called ${1}${2}",
            refuteMessage: "Expected ${0} to not be called exactly " + c + "${2}",
            expectation: "toBeCalled" + count,
            values: spyValues
        });
    }

    addCallCountAssertion("Once");
    addCallCountAssertion("Twice");
    addCallCountAssertion("Thrice");

    function valuesWithThis(spy, thisObj) {
        return [spy, thisObj, spy.printf && spy.printf("%t") || ""];
    }

    ba.add("calledOn", {
        assert: function (spy, thisObj) {
            verifyFakes.call(this, spy);
            return spy.calledOn(thisObj);
        },
        assertMessage: "Expected ${0} to be called with ${1} as this but was called on ${2}",
        refuteMessage: "Expected ${0} not to be called with ${1} as this",
        expectation: "toBeCalledOn",
        values: valuesWithThis
    });

    ba.add("alwaysCalledOn", {
        assert: function (spy, thisObj) {
            verifyFakes.call(this, spy);
            return spy.alwaysCalledOn(thisObj);
        },
        assertMessage: "Expected ${0} to always be called with ${1} as this but was called on ${2}",
        refuteMessage: "Expected ${0} not to always be called with ${1} as this",
        expectation: "toAlwaysBeCalledOn",
        values: valuesWithThis
    });

    function formattedArgs(args, i) {
        for (var l = args.length, result = []; i < l; ++i) {
            result.push(sinon.format(args[i]));
        }

        return result.join(", ");
    }

    function spyAndCalls(spy) {
        return [spy, formattedArgs(arguments, 1), spy.printf && spy.printf("%C")];
    }

    ba.add("calledWith", {
        assert: function (spy) {
            verifyFakes.call(this, spy);
            return spy.calledWith.apply(spy, slice(arguments, 1));
        },
        assertMessage: "Expected ${0} to be called with arguments ${1}${2}",
        refuteMessage: "Expected ${0} not to be called with arguments ${1}${2}",
        expectation: "toBeCalledWith",
        values: spyAndCalls
    });

    ba.add("alwaysCalledWith", {
        assert: function (spy) {
            verifyFakes.call(this, spy);
            return spy.alwaysCalledWith.apply(spy, slice(arguments, 1));
        },
        assertMessage: "Expected ${0} to always be called with arguments ${1}${2}",
        refuteMessage: "Expected ${0} not to always be called with arguments${1}${2}",
        expectation: "toAlwaysBeCalledWith",
        values: spyAndCalls
    });

    ba.add("calledOnceWith", {
        assert: function (spy) {
            verifyFakes.call(this, spy);
            return spy.calledOnce && spy.calledWith.apply(spy, slice(arguments, 1));
        },
        assertMessage: "Expected ${0} to be called once with arguments ${1}${2}",
        refuteMessage: "Expected ${0} not to be called once with arguments ${1}${2}",
        expectation: "toBeCalledWith",
        values: spyAndCalls
    });

    ba.add("calledWithExactly", {
        assert: function (spy) {
            verifyFakes.call(this, spy);
            return spy.calledWithExactly.apply(spy, slice(arguments, 1));
        },
        assertMessage: "Expected ${0} to be called with exact arguments ${1}${2}",
        refuteMessage: "Expected ${0} not to be called with exact arguments${1}${2}",
        expectation: "toBeCalledWithExactly",
        values: spyAndCalls
    });

    ba.add("alwaysCalledWithExactly", {
        assert: function (spy) {
            verifyFakes.call(this, spy);
            return spy.alwaysCalledWithExactly.apply(spy, slice(arguments, 1));
        },
        assertMessage: "Expected ${0} to always be called with exact arguments ${1}${2}",
        refuteMessage: "Expected ${0} not to always be called with exact arguments${1}${2}",
        expectation: "toAlwaysBeCalledWithExactly",
        values: spyAndCalls
    });

    function spyAndException(spy, exception) {
        return [spy, spy.printf && spy.printf("%C")];
    }

    ba.add("threw", {
        assert: function (spy) {
            verifyFakes.call(this, spy);
            return spy.threw(arguments[1]);
        },
        assertMessage: "Expected ${0} to throw an exception${1}",
        refuteMessage: "Expected ${0} not to throw an exception${1}",
        expectation: "toHaveThrown",
        values: spyAndException
    });

    ba.add("alwaysThrew", {
        assert: function (spy) {
            verifyFakes.call(this, spy);
            return spy.alwaysThrew(arguments[1]);
        },
        assertMessage: "Expected ${0} to always throw an exception${1}",
        refuteMessage: "Expected ${0} not to always throw an exception${1}",
        expectation: "toAlwaysHaveThrown",
        values: spyAndException
    });
}(typeof buster == "object" ? buster : null, typeof sinon == "object" ? sinon : null));
(function (glbl, buster) {
    if (typeof require == "function" && typeof module == "object") {
        buster = require("buster-core");

        module.exports = buster.extend(buster, require("buster-test"), {
            assertions: require("buster-assertions"),
            format: require("buster-format"),
            eventedLogger: require("buster-evented-logger")
        });

        buster.defineVersionGetter(module.exports, __dirname);
        require("sinon-buster");
    }

    if (buster.format) {
        var logFormatter = buster.create(buster.format);
        logFormatter.quoteStrings = false;
        var asciiFormat = buster.bind(logFormatter, "ascii");
    }

    if (buster.eventedLogger) {
        if (asciiFormat) {
            buster.console = buster.eventedLogger.create({ formatter: asciiFormat });
        }
        buster.log = buster.bind(buster.console, "log");
    }

    if (buster.assertions) {
        if (asciiFormat) {
            buster.assertions.format = asciiFormat;
        }
        buster.assert = buster.assertions.assert;
        buster.refute = buster.assertions.refute;

        // TMP, will add mechanism for avoiding this
        glbl.assert = buster.assert;
        glbl.refute = buster.refute;
        glbl.expect = buster.assertions.expect;

        // Assertion counting
        var assertions = 0;

        buster.assertions.on("pass", function () {
            assertions += 1;
        });
    }

    if (buster.testRunner) {
        buster.testRunner.onCreate(function (runner) {
            buster.assertions.bind(runner, { "failure": "assertionFailure" });
            buster.assertions.throwOnFailure = false;
            runner.console = buster.console;

            runner.on("test:start", function () {
                assertions = 0;
            });

            runner.on("context:start", function (context) {
                context.testCase.log = buster.bind(buster.console, "log");
            });
        });

        buster.testRunner.assertionCount = function () {
            return assertions;
        };
    }
}(typeof global != "undefined" ? global : this, typeof buster == "object" ? buster : null));buster.assertions.fail = fail;
