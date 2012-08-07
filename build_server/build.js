#!/usr/bin/env node

var requirejs = require('../node_modules/requirejs/bin/r.js'),
	http = require('http'),
	url = require('url'),
	fs = require('fs'),
	ps = require('child_process'),
	host = '127.0.0.1',
	port = 39170,
	config,
	appBuild = ({
		baseUrl: '../../src/',
		optimize: 'uglify',
		out:'./Epitome-min.js',
		name:'epitome',
		include: [
			'../build_server/hash/test.js'
		]
	}),
	generateUID = function(uniqueIndex) {
		var now = new Date();
		return Math.floor(Math.random() * 10) + parseInt(now.getTime()).toString(36).toUpperCase();
	},
	id = generateUID(),
	file = './hash/epitome-' + id + '.js';

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
		out = 'require([';


	req.on('close', function (err) {
		res.end();
	});

	req.on('end', function () {
		// anything in the ?build= arg? needs to be comma separated.
		if (included.build) {
			// make a file that requires all
			var deps = included.build.split(','),
				depsArray = [];

			deps.forEach(function(el) {
				depsArray.push('"../../src/'+el+'"');
			});

			out += depsArray.join(',');
			out += '], function(){});';

			console.log('Created a custom include with ' deps.join(', '));

			fs.writeFile(file, out, function(error) {});
			appBuild.include = ['../build_server/hash/epitome-' + id];
		}
		else {
			console.log('No custom includes found, returning main instead');

			appBuild.include = ['main'];
		}

		// set output folder in out for quick reference
		appBuild.out = '../out/epitome-'+ id +'-min.js';

		fs.writeFile('./hash/' + id + '.json', JSON.stringify(appBuild), function() {
			// what we will actually run now
			console.log('running: r.js -o ./hash/' + id + '.json');

			try {

				ps.exec('r.js -o ./hash/' + id + '.json', function(error, output) {
					console.log(output);

					// remove the temporary module file, leave just config hash.
					fs.unlink('./hash/epitome-' + id + '.js');


					// if error, output 500 internal code with dump
					if (error) {
						respond(res, 500, error.toString());
						return;
					}

					// read the generated file and pipe through to stdout (er, browser).
					fs.readFile('./out/epitome-' + id + '-min.js', function(error, contents) {
						// add a hash so same build config can be reused.
						contents = '/*Epitome hash: ' + id + ' */\n' + contents;
						respond(res, 200, contents);

						// clean up the out file also, we can rebuild
						fs.unlink('./out/epitome-' + id + '.js');
					});
				});
			} catch (e) {
				// something went wrong.
				respond(res, 500, e.toString());
			}
		});
	});

}).listen(port, host);

console.log('Server running at http://' + host + ':' + port + '/');
