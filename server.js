var express = require('express');
var path = require('path');
var app = express();


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

	client.on('hostGame', function(user){
		console.log("Host has started a lobby");
		console.log(client.id);
		console.log(user);

		

		var room = client.id;
		room = room.substring(0,5);
		room = room.toUpperCase();

		user.clientId = client.id;
		user.lobby = room;

		console.log("Host lobby code is " + room);
		client.join(room);
		client.emit('hostCode', room);
		client.emit('userJoined', user);
		//console.log(client.rooms)
		//client.emit('sync', io.sockets.adapter.rooms[room].length);
		//client.broadcast.to(room).emit('sync', io.sockets.adapter.rooms[room].length);
	});

	client.on('joinGame', function(user){
		console.log("User has joined the Game");
		var room = user.lobby;
		var username = user.username;
		room = room.toUpperCase();
		console.log(username + " joining lobby " + room);
		client.join(room);
		console.log(client.rooms);
		client.emit('userJoined', user);
		client.broadcast.to(room).emit('userJoined', user);
	});

	client.on('leaveGame', function(room){
		// console.log('User has left room ' + client.rooms);
		// console.log(io.sockets.adapter.rooms[room].length);
		// client.broadcast.to(room).emit('sync', io.sockets.adapter.rooms[room].length);		
	});

	client.on('updateUsers', function(users){
		client.emit('updateUsers', users);
		client.broadcast.to(users[0].lobby).emit('updateUsers', users);
	});
});

