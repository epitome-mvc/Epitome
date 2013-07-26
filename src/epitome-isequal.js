;(function(){
	'use strict';

	// wrapper function for requirejs or normal object
	var wrap = function(){

		var eq = function(a, b, stack){
			// this is a modified version of eq func from _.js

			// Identical objects are equal. `0 === -0`, but they aren't identical.
			// See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
			stack = stack || [];

			if (a === b) return a !== 0 || 1 / a == 1 / b;

			// A strict comparison is necessary because `null == undefined`.
			if (a == null || b == null) return a === b;

			// use MooTools types instead of toString.call(a),
			// this fixes FF returning [xpconnect wrapped native prototype] for all w/ MooTools
			var typeA = typeOf(a),
				typeB = typeOf(b);

			if (typeA != typeB) return false;

			switch (typeA){
				// Strings, numbers, dates, and booleans are compared by value.
				case 'string':
					// Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
					// equivalent to `new String("5")`.
					return a == String(b);
				case 'number':
					// `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
					// other numeric values.
					return a != +a ? b != +b : (a === 0 ? 1 / a == 1 / b : a == +b);
				case 'date':
				case 'boolean':
					// Coerce dates and booleans to numeric primitive values. Dates are compared by their
					// millisecond representations. Note that invalid dates with millisecond representations
					// of `NaN` are not equivalent.
					return +a == +b;
				// RegExps are compared by their source patterns and flags.
				case 'regexp':
					return a.source == b.source &&
						a.global == b.global &&
						a.multiline == b.multiline &&
						a.ignoreCase == b.ignoreCase;
			}

			if (typeof a !== 'object' || typeof b !== 'object') return false;

			// Assume equality for cyclic structures. The algorithm for detecting cyclic
			// structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
			var length = stack.length;
			while (length--){
				// Linear search. Performance is inversely proportional to the number of
				// unique nested structures.
				if (stack[length] == a) return true;
			}

			// Add the first object to the stack of traversed objects.
			stack.push(a);
			var size = 0, result = true;
			// Recursively compare objects and arrays.
			if (typeA == 'array'){
				// Compare array lengths to determine if a deep comparison is necessary.
				size = a.length;
				result = size == b.length;
				if (result){
					// Deep compare the contents, ignoring non-numeric properties.
					while (size--){
						// Ensure commutative equality for sparse arrays.
						if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
					}
				}
			} else {
				// Objects with different constructors are not equivalent.
				if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
				// Deep compare objects.
				for (var key in a){
					if (a.hasOwnProperty(key)){
						// Count the expected number of properties.
						size++;
						// Deep compare each member.
						if (!(result = b.hasOwnProperty(key) && eq(a[key], b[key], stack))) break;
					}
				}
				// Ensure that both objects contain the same number of properties.
				if (result){
					for (key in b){
						if (b.hasOwnProperty(key) && !(size--)) break;
					}
					result = !size;
				}
			}

			// Remove the first object from the stack of traversed objects.
			stack.pop();
			return result;
		};

		return eq;
	}; // end wrap

	if (typeof define === 'function' && define.amd){
		define(['./epitome'], wrap);
	}
	else if (typeof module !== 'undefined' && module.exports){
		require('mootools');
		module.exports = wrap();
	}
	else {
		this.Epitome || (this.Epitome = {});
		this.Epitome.isEqual = wrap(this.Epitome);
	}
}.call(this));