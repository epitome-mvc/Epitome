/*jshint quotmark:false, evil:true */
;(function(){
	'use strict';

	(function(){
		// Add to string proto 
		var escapes = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#x27;',
			'/': '&#x2F;'
		}, escaper = new RegExp('[' + Object.keys(escapes).join('') + ']', 'g');

		String.implement({
			escape: function(){
				// Escapes a string for insertion into HTML, 
				// replacing &, <, >, ", ', and / characters. 
				return String(this).replace(escaper, function(match){
					return escapes[match];
				});
			}
		});
	}());

	// wrapper function for requirejs or normal object
	var wrap = function(){

		return new Class({
			// a templating class based upon the _.js template method and john resig's work
			// but fixed so that it doesn't suck. namely, references in templates not found in
			// the data object do not cause exceptions.
			options: {
				// default block logic syntax is <% if (data.prop) { %>
				evaluate: /<%([\s\S]+?)%>/g,
				// literal out is <%=property%>
				normal: /<%=([\s\S]+?)%>/g,
				// safe scripts and tags, <%-property%>
				escape: /<%-([\s\S]+?)%>/g,

				// these are internals you can change if you like
				noMatch: /.^/,
				escaper: /\\|'|\r|\n|\t|\u2028|\u2029/g
			},

			Implements: Options,

			initialize: function(options){
				this.setOptions(options);

				var escapes = this.escapes = {
					'\\': '\\',
					"'": "'",
					'r': '\r',
					'n': '\n',
					't': '\t',
					'u2028': '\u2028',
					'u2029': '\u2029'
				};

				Object.each(escapes, function(value, key){
					this[value] = key;
				}, escapes);

				this.matcher = new RegExp([
					(this.options.escape || this.options.noMatch).source,
					(this.options.normal || this.options.noMatch).source,
					(this.options.evaluate || this.options.noMatch).source
				].join('|') + '|$', 'g');

				return this;
			},

			template: function(text, data, options){
				// the actual method that compiles a template with some data.
				var o = options ? Object.merge(this.options, options) : this.options,
					render,
					escapes = this.escapes,
					escaper = o.escaper,
					index = 0,
					source = "__p+='";

				text.replace(this.matcher, function(match, escape, interpolate, evaluate, offset){
					source += text.slice(index, offset)
						.replace(escaper, function(match){
							return '\\' + escapes[match];
						});

					if (escape){
						source += "'+\n((__t=(obj['" + escape + "']))==null?'':String.escape(__t))+\n'";
					}
					if (interpolate){
						source += "'+\n((__t=(obj['" + interpolate + "']))==null?'':__t)+\n'";
					}
					if (evaluate){
						source += "';\n" + evaluate + "\n__p+='";
					}
					index = offset + match.length;
					return match;
				});
				source += "';\n";

				// If a variable is not specified, place data values in local scope.
				if (!o.variable) source = 'obj=obj||{};with(obj){\n' + source + '}\n';

				source = "var __t,__p='',__j=Array.prototype.join," +
					"print=function(){__p+=__j.call(arguments,'');};\n" +
					source + "return __p;\n";

				try {
					render = new Function(o.variable || 'obj', source);
				} catch (o_O) {
					o_O.source = source;
					throw o_O;
				}

				if (data) return render(data);
				var template = function(data){
					return render.call(this, data);
				};

				// Provide the compiled function source as a convenience for precompilation.
				template.source = 'function(' + (o.variable || 'obj') + '){\n' + source + '}';
				return template;
			}
		});
	}; // end wrap


	if (typeof define === 'function' && define.amd){
		define(['./epitome'], wrap);
	}
	else if (typeof module !== 'undefined' && module.exports){
		module.exports = wrap();
	}
	else {
		this.Epitome || (this.Epitome = {});
		this.Epitome.Template = wrap(this.Epitome);
	}
}.call(this));