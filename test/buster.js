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

		// controller/collection
		'src/epitome-collection-sync.js',

		// template
		'src/epitome-template.js',

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

config['Node tests'] = {
	rootPath: '../',

	environment: 'node',

	libs: [
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
