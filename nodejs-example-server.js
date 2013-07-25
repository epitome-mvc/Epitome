#!/usr/bin/env node
'use strict';

var express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	io = require('socket.io').listen(server),
	port = 3333,
	host = '0.0.0.0';

require('mootools');

io.set('log level', 1);
app.use(express.static('./example'));
app.get('/js/Epitome-min.js', function(req, res){
	res.send(require('fs').readFileSync('./Epitome-min.js', 'utf-8'));
});

app.get('/Epitome-min.js', function(req, res){
	res.send(require('fs').readFileSync('./Epitome-min.js', 'utf-8'));
});


server.listen(port);

(function(){
	// output all the ips we listen to so others can connect
	var os = require('os'),
		ifaces = os.networkInterfaces(),
		dev;

	console.log('Express running on http://'+ host + ':' + port);
	for (dev in ifaces){
		ifaces[dev].forEach(function(details){
			if (details.family == 'IPv4'){
				host = details.address;
				console.log('Express also available on http://'+ host + ':' + port);
			}
		});
	}
}());



// use some epitome models and collections
var Model = require('./src/epitome-model'),
	Collection = require('./src/epitome-collection');

var User = new Class({

	Extends: Model,

	options: {
		defaults: {
			title: 'Mr.'
		}
	}
});

var Users = new Class({

	Extends: Collection,

	model: User

});

var users = new Users([{
	name: 'Bob',
	surname: 'Roberts'
}]);


io.on('connection', function(socket){
	socket.on('data:add', function(model){
		users.addModel(model);
		console.log('added new model', model);

		// using Slick on the server...
		var user = users.findOne('[surname='+model.surname+']');
		console.log('Can use slick, found: ' + user.toJSON());
	});

	socket.emit('data', users.toJSON());
});
