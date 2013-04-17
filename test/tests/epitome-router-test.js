if (typeof require === 'function') {
	var Epitome = require('../../src/main'),
		buster = require('buster');
}

buster.testRunner.timeout = 2000;

buster.testCase('Epitome router >', {
	setUp: function() {
		this.router = new Epitome.Router({
			routes: {
				'#!dummy': 'dummy'
			}
		});

		window.location.href = '#!';
	},

	tearDown: function() {
		this.router.off('ready');
		this.router.off('undefined');
		this.router.off('dynamic');
		this.router.off('error');

		this.router.routes = [];
		window.location.href = '#!';
	},

	'Expect to be able to create an instance > ': function() {
		buster.assert.isTrue(instanceOf(this.router, Epitome.Router));
	},

	'Expect router to fire onRoute when hash changes > ': function(done) {
		this.router.addRoute({
			route: '#!dynamicRoute',
			id: 'dynamic',
			events: {
				dynamic: function() {
					buster.assert(true);
					done();
				}
			}
		});

		window.location.href = '#!dynamicRoute';
	},

	'Expect router to fire onBefore when hash changes and passes route id > ': function(done) {

		this.router.on('before', function(routeId) {
			buster.assert.equals(routeId, 'dynamic');
			done();
		});

		this.router.addRoute({
			route: '#!dynamicRoute',
			id: 'dynamic',
			events: {
				onDynamic: Function.from()
			}
		});

		window.location.href = '#!dynamicRoute';
	},

	'Expect router to fire onAfter when hash changes and passes route id > ': function(done) {

		this.router.on('after', function(routeId) {
			buster.assert.equals(routeId, 'dynamic');
			done();
		});

		this.router.addRoute({
			route: '#!dynamicRoute',
			id: 'dynamic',
			events: {
				dynamic: Function.from()
			}
		});

		window.location.href = '#!dynamicRoute';
	},

	'Expect router to fire route:before pseudo when hash changes > ': function(done) {

		this.router.on('dynamic:before', function() {
			buster.assert(true);
			done();
		});

		this.router.addRoute({
			route: '#!dynamicRoute',
			id: 'dynamic',
			events: {
				dynamic: Function.from()
			}
		});

		window.location.href = '#!dynamicRoute';
	},

	'Expect router to fire route:after pseudo when hash changes > ': function(done) {

		this.router.on('dynamic:after', function() {
			buster.assert(true);
			done();
		});

		this.router.addRoute({
			route: '#!dynamicRoute',
			id: 'dynamic',
			events: {
				dynamic: Function.from()
			}
		});

		window.location.href = '#!dynamicRoute';
	},

	'Expect onUndefined to fire on an unknown route  > ': function(done) {
		this.router.on('undefined', function() {
			buster.assert(true);
			done();
		});

		window.location.href = '#!dummyCrash';
	},

	'Expect onError to fire on a declared route w/o a handler  > ': function(done) {
		this.router.on('error', function(message) {
			buster.assert.isTrue(message.contains('dummy'));
			done();
		});

		window.location.href = '#!dummy';
	}



});
