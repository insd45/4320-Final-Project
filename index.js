var express = require('express');
var path = require('path');
var app = express();

var connections = 0;

//Static resources server
app.use(express.static(path.join(__dirname, 'webfront/')));

var server = app.listen(8080, function () {
	var port = server.address().port;
	console.log('Server running at port %s', port);
});

var io = require('socket.io')(server);

/* Connection events */

io.on('connection', function(client) {
	console.log('User connected');

	client.on('sync', function(data){
		//Broadcast data to clients
		// client.emit('sync', io.sockets.adapter.rooms[roomCode].length);
		// client.broadcast.emit('sync', io.sockets.adapter.rooms['my_room'].length);
	});

	client.on('joinGame', function(room){
		console.log("User has joined the Game");
		//users.push(username);
		//console.log(users);
		client.join(room);
		client.emit('sync', io.sockets.adapter.rooms[room].length);
		client.broadcast.to(room).emit('sync', io.sockets.adapter.rooms[room].length);
	});

	client.on('hostGame', function(){

	});

	client.on('leaveGame', function(room){
		console.log('User has left the game');
		client.broadcast.to(room).emit('sync', io.sockets.adapter.rooms[room].length);		
	});
});

