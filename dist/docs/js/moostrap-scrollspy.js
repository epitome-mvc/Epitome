/*
---

name: moostrapScrollspy

description: port of twitter scroll spy to mootools

authors: Arian Stolwijk, Dimitar Christoff

license: MIT-style license.

version: 1.03

requires:
- Core/Event
- Core/Element
- Core/Array
- Core/Class

provides: moostrapScrollspy

...
*/
/*jshint evil:true, mootools:true */
/*global define */
;(function(exports){

	'use strict';

	var read = function(option, element){
		// can take a function as argument instead of an element
		return (option) ? (typeof option === 'function' ? option.call(this, element) : element.get(option)) : '';
	};

	var wrap = function() {
		// work as an AMD module or as global

		return new Class({

			Implements: [Options, Events],

			options: {
				/* supported events:
				 onReady: function(){},
				 onActive: function(navEl, TargetEl){},
				 onInactive: function(navEl, TargetEl){},
				 onReset: function(){},
				 */
				offset: 0, // adjust the top offset before an item is deemed 'in view'
				mask: 'a',
				activeClass: 'active',
				wrapper: window,
				navElementParse: function(el){
					// can override that to grab els based on another criteria
					var prop = el.get('href'),
						target;

					prop.slice(0, 1) == '#' && (target = prop.slice(1));

					return target;
				}
			},

			initialize: function(element, options){
				this.setOptions(options);

				this.element = document.id(element);
				this.wrapper = this.options.wrapper;
				this.grabElements();
				this.attach();

				return this;
			},
			grabElements: function(){
				var links = this.links = this.element.getElements(this.options.mask);
				var elements = this.elements = [];
				var prop = this.options.navElementParse;

				Array.each(links, function(el){
					var target = document.id(read.apply(this, [prop, el]));
					if (target) {
						elements.push(target);
						el.store('navMonitor', target);
					}
				});

				return this;
			},

			attach: function(){
				if (!this.boundScroll) this.boundScroll = this.scroll.bind(this);
				this.wrapper.addEvent('scroll', this.boundScroll);
				this.fireEvent('ready');

				return this;
			},

			detach: function(){
				this.boundScroll && this.wrapper.removeEvent('scroll', this.boundScroll);

				return this;
			},

			scroll: function(){
				var top = this.wrapper.getScroll().y - this.options.offset,
					index,
					relativeTo = this.wrapper == window ? document.body : this.wrapper;

				Array.some(this.elements, function(el, i){
					var y = el.getPosition(relativeTo).y;
					y <= top && (index = i);
					return y > top;
				});

				if (index != this.active) {
					if (this.active != null) {
						this.links[this.active].removeClass(this.options.activeClass);
						this.fireEvent('inactive', [this.links[this.active], this.elements[this.active]]);
					}
					this.active = index;
					if (index != null) {
						this.links[index].addClass(this.options.activeClass);
						this.fireEvent('active', [this.links[index], this.elements[index]]);
					}
				}

				return this;
			},

			reset: function(){
				var self = this;

				Array.each(this.links, function(link){
					link.removeClass(self.options.activeClass);
				});

				this.active = null;
				this.scroll.delay(100, this);
				this.fireEvent('reset');

				return this;
			}

		});
	};

	if (typeof define === 'function' && define.amd) {
		// returns an empty module
		define(wrap);
	}
	else {
		exports.moostrapScrollspy = wrap();
	}

}(this));