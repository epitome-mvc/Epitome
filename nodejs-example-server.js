#!/usr/bin/env node
'use strict';

var express = require('express'),
	app = express(),
	http = require('http'),
	server = http.createServer(app),
	io = require('socket.io').listen(server);

require('mootools');

io.set('log level', 1);
app.use(express.static('./example'));
app.get('/js/Epitome-min.js', function(req, res){
	res.send(require('fs').readFileSync('./Epitome-min.js', 'utf-8'));
});

app.get('/Epitome-min.js', function(req, res){
	res.send(require('fs').readFileSync('./Epitome-min.js', 'utf-8'));
});

server.listen(3333);

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

var users = new Users([
	{
		name: 'Bob',
		surname: 'Roberts'
	}
]);

io.on('connection', function(socket){
	socket.on('data:add', function(model){
		users.addModel(model);
		console.log('added new model', model);
	});

	socket.emit('data', users.toJSON());
});
