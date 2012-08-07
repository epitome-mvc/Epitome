#!/usr/bin/env node

// recompile main minified file when sources change
var fs = require('fs'),
	http = require('http'),
	url = require('url'),
	ps = require('child_process'),
	path = '../src/',
	port = 39170,
	ip = '127.0.0.1',
	modules = [
		'epitome',
		'epitome-isequal',
		'epitome-model',
		'epitome-model-sync',
		'epitome-storage',
		'epitome-collection',
		'epitome-collection-sync',
		'epitome-template',
		'epitome-view',
		'epitome-router'
	],
	build = {
		baseUrl: '../../src/',
		optimize: 'uglify',
		name:'epitome',
		include: modules.slice()
	};


var generateUID = function(uniqueIndex) {
	var now = new Date();
	return Math.floor(Math.random() * 10) + parseInt(now.getTime()).toString(36).toUpperCase();
};


console.log('Listening for build requests on http://' + ip + ':' + port + '/');

http.createServer(function (req, res) {
	var id = generateUID(),
		file = './hash/build-' + id + '.json',
		out = './out/epitome-' + id + '-min.js',
		included = url.parse(req.url, true)['query'],
		localBuild = JSON.parse(JSON.stringify(build));

	if (!included.build) {
		console.log('Nothing requested, reverting to full build.');
	}
	else {
		localBuild.include = included.build.split(',');
	}

	localBuild.out = '.' + out;

	fs.writeFile(file, '(' + JSON.stringify(localBuild) + ')', function(error) {});

	console.log('Trying to generate build...');

	ps.exec('r.js -o ' + file, function(error, output) {
		if (error) {
			console.log(error);
		}

		var fileName = error ? '../src/Epitome-min.js' : out;

		fs.readFile(fileName, function(error, data) {
			console.log('Read ' + fileName);

			res.writeHead(200, {
				'Content-Type': 'text/javascript'
			});

			data = '/*Epitome hash: ' + id + ' */\n' + data;
			res.end(data);
		});
	});

}).listen(port, ip);