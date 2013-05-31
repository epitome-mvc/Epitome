/*jshint mootools:true */
/*global moostrapScrollspy, prettyPrint, ace */
(function(){
	'use strict';

	var nav = document.id('nav');
	var main = document.id('content');

	main.getElements('.lang-ace').each(function(el){

		var html = el.get('text'),
			parent = el.getParent('pre'),
			edit = new Element('div.ace', {
				text: html
			}).inject(parent, 'before');

		new Element('div.alert').adopt(
			new Element('button.btn.btn-demo.btn-primary[text=Run this]')
		).inject(edit, 'after');

		parent.destroy();
		var editor = ace.edit(edit);
		editor.setTheme('ace/theme/clouds_midnight');
		editor.getSession().setMode('ace/mode/javascript');
		edit.store('editor', editor);
	});

	main.getElements('h2,h3').each(function(el){
		new Element('a', {
			html: '&sect;',
			title: 'Link to ' + el.get('text'),
			'class': 'heading-anchor',
			href: '#' + el.get('id')
		}).inject(el, 'top');
	});

	nav && new moostrapScrollspy('sections', {
		offset: 0,
		onReady: function(){
			this.scroll();
			/* may want to overrride this
			 var handleClicks = function(e, el){
			 e.stop();
			 var target = el.get('href');
			 window.location.hash = target;
			 body.scrollTo(0, main.getElement(target).getPosition().y - 40);
			 };

			 this.element.addEvent('click:relay(li > a)', handleClicks);
			 main.addEvent('click:relay(a[href^=#])', handleClicks);
			 */
		},
		onActive: function(el, target){
			var g = el.getParents("li").getLast();
			g.addClass('active');
			target.addClass('active');
			nav.scrollTo(0, g.getPosition(this.element).y);
		},
		onInactive: function(el, target){
			target.removeClass('active');
			this.element.getElements('li.active').removeClass('active');
		}
	});

	var buildWindow = function(el){
		var editor = el.getParent().getPrevious().retrieve('editor');

		var uid = Slick.uidOf(el),
			iframe = document.id('demoFrame' + uid);

		if (!iframe) {
			// make example
			new IFrame({
				src: 'js/blank.html',
				styles: {
					width: '100%',
					height: 400
				},
				'class': 'acely',
				id: 'demoFrame' + uid,
				events: {
					load: function(){
						new Element('script', {
							type: 'text/javascript',
							text: editor.getValue()
						}).inject(this.contentDocument.body);
					}
				}
			}).inject(el, 'after');
		}
		else {
			// close example
			iframe.destroy();
		}
	};

	var toggleState = function(anchor){
		var state = anchor.retrieve('isopen'),
			map = {
				true: {
					text: 'Close example'
				},
				false: {
					text: 'Run this'
				}
			};

		// when not set, it's the first time
		state === null && (state = true);
		anchor.set(map[state]).toggleClass('btn-warning').toggleClass('btn-info').store('isopen', !state);
	};

	// delegated event handler.
	var handleClick = function(e, el){
		e && e.stop();
		var code = el.getPrevious('div.ace') || el.getParent().getPrevious('div.ace'),
			editor,
			module;

		if (!code) {
			return false;
		}

		editor = code.retrieve('editor');
		module = el.get('data-module');

		toggleState(el);
		buildWindow(el);

		// buildExample(module, editor.getValue(), el); - changed to linked iframe
	};

	main.addEvent('click:relay(button.btn-demo)', handleClick);


	prettyPrint();

	(function() {
		// custom download
		var modules = {
			"epitome": ["epitome-events"],
			"epitome-events": [],
			"epitome-model": ["epitome","epitome-isequal","epitome-events"],
			"epitome-model-sync": ["epitome","epitome-isequal","epitome-model","epitome-events"],
			"epitome-collection": ["epitome","epitome-isequal","epitome-model","epitome-events"],
			"epitome-collection-sync": ["epitome","epitome-isequal","epitome-model","epitome-collection","epitome-events"],
			"epitome-template": ["epitome","epitome-events"],
			"epitome-view": ["epitome","epitome-events","epitome-isequal","epitome-model","epitome-collection","epitome-template"],
			"epitome-storage": ["epitome"],
			"epitome-router": ["epitome", "epitome-events"]
		};

		new Element('div', {
			html: document.id('custom-download').get('html')
		}).replaces(document.id('customDownload'));

		var builder = document.id('builder').getFirst(),
			defaultURL = 'http://fragged.org:39170/',
			downloadLink = document.getElement('a.download-link'),
			setURL = function() {
				var deps = document.getElements('input.epitome-builder:checked').get('name'),
					url = deps.length ? defaultURL + '?build=' + deps.join(',') : defaultURL;

				downloadLink.set('href', url);
			};

		downloadLink.addEvent('click', setURL);

		Object.each(modules, function(deps, module) {
			var tr = new Element('tr'),
				td1 = new Element('td.small').inject(tr),
				td2 = new Element('td').inject(tr);

			var label = new Element('label[for=input-'+module+'][html=" ' + module +'"]').inject(td2)
			new Element('input.epitome-builder[type=checkbox][name=' + module + ']#input-'+module, {
				events: {
					change: function() {
						var deps = this.retrieve('deps'),
							checked = this.get('checked'),
							vals,
							already;

						if (checked) {
							vals = deps.map(function(dep) {
								return 'input[name=' + dep + ']';
							});
							document.getElements(vals.join(',')).set('checked', checked);
							setURL();
						}
					}
				}
			}).inject(td1, 'top').store('deps', deps);
			tr.inject(builder);
		});
	}());
}());