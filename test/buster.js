var config = exports;

config['Browser tests'] = {
    rootPath: '../',
    environment: 'browser',
    libs: ['example/lib/mootools-core.js', 'test/lib/es5-shim.min.js'],
    sources: [
        'src/epitome.js',
        'src/epitome-model.js',
        'src/epitome-model-sync.js',
        'src/epitome-collection.js'
    ],
    tests: [
        'test/tests/*-test.js'
    ]
};