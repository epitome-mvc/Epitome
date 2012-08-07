#!/usr/bin/env node

// this is broken as it does not do a build.

var requirejs = require('../node_modules/requirejs/bin/r.js'),
	http = require('http'),
	url = require('url'),
	fs = require('fs'),
	host = '127.0.0.1',
	port = 39170,
	config,
	mootools = require('../test/lib/mootools-core-1.4.5-server.js');

var generateUID = function(uniqueIndex) {
	var now = new Date();
	return Math.floor(Math.random() * 10) + parseInt(now.getTime()).toString(36).toUpperCase();
};

var id = generateUID(),
	file = './hash/epitome-' + id + '.js';

//Set up the config passed to the optimizer
config = {
	baseUrl: '../src',
	//Uncomment this line if uglify minification is not wanted.
	optimize: 'uglify',
	//Specify the optimization target. Choose the requireLib,
	//so that it is first in the output, then include the main.js
	//for this project.
	name: 'epitome',
	include: ['main']
	//Uncomment this if you want to debug three.js by itself
	//excludeShallow: ['three'],
	//out: './builds/main-built.js'
};

function respond(res, code, contents) {
	res.writeHead(code, {
		'Content-Type': (code === 200 ? 'application/javascript;charset=UTF-8' : 'text/plain'),
		'Content-Length': contents.length
	});

	res.write(contents, 'utf8');
	res.end();
}

http.createServer(function (req, res) {
	var included = url.parse(req.url, true)['query'],
		out = 'define([';


	req.on('close', function (err) {
		res.end();
	});

	req.on('end', function () {
		if (included.build) {
			// make a file that requires all
			var deps = included.build.split(','),
				depsArray = [],
				depsNice = deps.map(function(el) {
					return el.camelCase()
				});

			deps.forEach(function(el) {
				depsArray.push('"./'+el+'"');
			});



			out += depsArray.join(',');
			out += '], function(' + depsNice.join(',') + ') {});';

			console.log(out);
			fs.writeFile(file, out, function(error) {});
			config.include = ['../build_server/hash/epitome-' + id];
		}

		config.name = '../build_server/hash/epitome-' + id;
		config.out = './out/epitome-'+ id +'min.js';

		try {
			requirejs.optimize(config, function (buildResponse) {
				console.log(buildResponse);
				//buildResponse is just a text output of the modules
				//included. Load the built file for the contents.
				var contents = fs.readFileSync(config.out, 'utf8');
				respond(res, 200, contents);
			});
		} catch (e) {
			respond(res, 500, e.toString());
		}
	});

}).listen(port, host);

console.log('Server running at http://' + host + ':' + port + '/');
