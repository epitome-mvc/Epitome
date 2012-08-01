/*jshint mootools:true */
;(function(exports) {
	'use strict';

	// wrapper function for requirejs or normal object
	var wrap = function() {

		return new Class({
			// a templating class based upon the _.js template method and john resig's work
			// but fixed so that it doesn't suck. namely, references in templates not found in
			// the data object do not cause exceptions.
			options: {
				// default block logic syntax is <% if (data.prop) { %>
				evaluate: /<%([\s\S]+?)%>/g,
				// literal out is <%=property%>
				normal: /<%=([\s\S]+?)%>/g,

				// these are internals you can change if you like
				noMatch: /.^/,
				escaper: /\\|'|\r|\n|\t|\u2028|\u2029/g,
				unescaper: /\\(\\|'|r|n|t|u2028|u2029)/g
			},

			Implements: [Options],

			initialize: function(options) {
				this.setOptions(options);

				var unescaper = this.options.unescaper,
					escapes = this.escapes = {
						'\\': '\\',
						"'": "'",
						'r': '\r',
						'n': '\n',
						't': '\t',
						'u2028': '\u2028',
						'u2029': '\u2029'
					};

				Object.each(escapes, function(value, key) {
					this[value] = key;
				}, escapes);


				this.unescape = function(code) {
					return code.replace(unescaper, function(match, escape) {
						return escapes[escape];
					});
				};
				return this;
			},

			template: function(str, data) {
				// the actual method that compiles a template with some data.
				var o = this.options,
					escapes = this.escapes,
					unescape = this.unescape,
					noMatch = o.noMatch,
					escaper = o.escaper,
					template,
					source = [
						'var __p=[],print=function(){__p.push.apply(__p,arguments);};',
						'with(obj||{}){__p.push(\'',
						str.replace(escaper, function(match) {
							return '\\' + escapes[match];
						}).replace(o.normal || noMatch, function(match, code) {
							// these are normal literal output first, eg. <%= %>
							return "',\nobj['" + unescape(code) + "'],\n'";
						}).replace(o.evaluate || noMatch, function(match, code) {
							// the evaluating block is after so <% logic %>
							return "');\n" + unescape(code) + "\n;__p.push('";
						}),
						"');\n}\nreturn __p.join('');"
					].join(''),
					render = new Function('obj', '_', source);

				if (data) return render(data);

				template = function(data) {
					return render.call(this, data);
				};
				template.source = 'function(obj){\n' + source + '\n}';

				return template;
			}
		});
	}; // end wrap


	if (typeof define === 'function' && define.amd) {
		// requires epitome object only.
		define(['./epitome'], wrap);
	}
	else {
		exports.Epitome.Template = wrap(exports.Epitome);
	}
}(this));
