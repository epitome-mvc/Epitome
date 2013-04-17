var config = exports;

config['Browser tests'] = {
	rootPath: '../',

	environment: 'browser',

	libs: [
		'example/lib/mootools-core.js',
		// need ES5 shim for buster static and IE6/7/8
		'test/lib/es5-shim.min.js'
	],

	sources: [
		// events
		'src/epitome-events.js',

		// core
		'src/epitome.js',

		// utils
		'src/epitome-isequal.js',

		// model core
		'src/epitome-model.js',

		// controller/collection
		'src/epitome-collection.js',

		// extending extras
		'src/epitome-model-sync.js',

		// storage
		'src/epitome-storage.js',

		// controller/collection
		'src/epitome-collection-sync.js',

		// template
		'src/epitome-template.js',

		// template
		'src/epitome-router.js',

		// view
		'src/epitome-view.js'
	],

	tests: [
		// find matching test specs as above sources
		'test/tests/*-test.js'
	],

	resources: [
		// used as a static response json stub for model.sync
		'example/data/1234-5123/*',
		'example/data/collection/*'
	]
};

/*
// tests disabled as buster-test with both groups right now does not proc.exit
config['Node tests'] = {
	rootPath: '../',

	environment: 'node',

	libs: [
		// server-only, no request or element.
		'test/lib/mootools-core-1.4.5-server.js'
	],

	sources: [
		// core
		'src/epitome.js',
		// utils
		'src/epitome-isequal.js',
		// model core
		'src/epitome-model.js',
		// controller/collection
		'src/epitome-collection.js',

		// template
		'src/epitome-template.js'
	],

	tests: [
		// find matching test specs as above sources
		'test/tests/epitome-isequal-test.js',

		'test/tests/epitome-model-test.js',

		'test/tests/epitome-collection-test.js'
	]
};
*/