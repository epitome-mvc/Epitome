#!/usr/bin/env node

// recompile main minified file when sources change
var fs = require('fs'),
	ps = require('child_process');

fs.watch('./src/', function (event, filename) {

	ps.exec('r.js -o app.build.js', function(error, output) {
		console.log(output);
	});

});