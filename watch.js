#!/usr/bin/env node

// recompile main minified file when sources change
var fs = require('fs'),
	ps = require('child_process'),
	path = './src/';

console.log('Watching for changes in ' + path);

fs.watch(path, function (event, filename) {

	console.log('File system change detected....');
	console.log('Trying buster-test first, make sure buster-server is running and slaves are captured');
	console.log('');

	ps.exec('buster-test', function(error, stdout) {
		if (!error) {
			console.log('Tests finished OK, building a new release as per app.build.js...');
			ps.exec('r.js -o app.build.js', function(error, output) {
				console.log(output);
			});
		}
		else {
			console.log('The tests did not pass or failed to run. Not built.');
		}
		console.log('');
	});



});