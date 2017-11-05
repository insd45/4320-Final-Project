var express = require('express');
var path = require('path');
var app = express();

var connections = 0;
var users = [];

//Static resources server
//app.use(express.static(__dirname + 'webfront/'));
app.use(express.static(path.join(__dirname, 'webfront/')));

var server = app.listen(8082, function () {
	var port = server.address();
	console.log('Server running at %s', port);
});

var io = require('socket.io')(server);

/* Connection events */

io.on('connection', function(client) {
	console.log('User connected');
	connections++;

	client.on('sync', function(data){
		//Receive data from clients
		//update ball positions
		//Broadcast data to clients
		client.emit('sync', connections, users);
		client.broadcast.emit('sync', connections, users);

		//I do the cleanup after sending data, so the clients know
		//when the tank dies and when the balls explode
	});

	client.on('joinGame', function(username){
		console.log(username + " has joined the Game");
		users.push(username);
		console.log(users);
		client.emit('sync', connections, users);
		client.broadcast.emit('sync', connections, users);
	});

	client.on('leaveGame', function(){
		console.log('User has left the game');
		connections--;
		client.broadcast.emit('sync', connections, users);		
	});
});

// User.prototype = {

// }