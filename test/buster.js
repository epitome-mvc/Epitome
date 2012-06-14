var config = exports;

config['Browser tests'] = {
    rootPath: '../',
    environment: 'browser',
    libs: ['example/lib/mootools-core.js', 'test/lib/es5-shim.min.js'],
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
        'src/epitome-model-sync.js'
    ],
    tests: [
        'test/tests/*-test.js'
    ]
};