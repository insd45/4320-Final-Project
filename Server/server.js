
const MAX_PLAYERS = 10;

var express = require('express');
var path = require('path');
var app = express();

//Static resources server
app.use(express.static(path.join(__dirname, 'webfront/')));

var server = app.listen(8080, '127.0.0.1', function () {
	var port = server.address().port;
	console.log('Server running at port %s', port);
});

var io = require('socket.io')(server);

/* Connection events */

io.on('connection', function(client) {
	console.log('User connected');

	client.on('hostGame', function(user){
		console.log("Host has started a room");
		console.log(client.id);
		console.log(user);

		//generate room code
		var room = user.clientVerificationId;
		room = room.substring(0,5);
		room = room.toUpperCase();

		//set user data
		user.clientId = client.id;
		user.room = room;
		client.user = user;
		
		console.log("Host room code is " + room);
		client.join(room);
		client.emit('hostCode', room);
		client.emit('userJoined', user);

		io.sockets.adapter.rooms[user.room].host = user;
	});

	client.on('joinGame', function(user){
		console.log("User has joined the Game");
		user.room = user.room.toUpperCase();
		
		//kick if room is full/doesn't exist
		if( io.sockets.adapter.rooms[user.room] != null ){
			if(io.sockets.adapter.rooms[user.room].length < MAX_PLAYERS){

				//set user data
				user.clientId = client.id;
				client.user = user;
				//makes room codes non-case sensitive
				
				//allows user to get a full list of currently connected clients, with user objects
				console.log(io.sockets.adapter.rooms[user.room].sockets);
				var sockets_in_room = io.sockets.adapter.rooms[user.room].sockets;
				var socket_objects = [];
				
				for (socketId in sockets_in_room) {
					socket_objects.push(io.sockets.connected[socketId].user);
				}

				//allows user to access previously stored host data
				console.log("CLIENT VIEWING HOST ");
				console.log(io.sockets.adapter.rooms[user.room].host);

				console.log(socket_objects);


				console.log(user.username + " joining room " + user.room);
				client.join(user.room);
				//console.log(client.rooms);
				//client.emit('userJoined', user);
				client.in(user.room).emit('userJoined', user);
			} else {
				client.emit('connectError', "room is full");
			}
		} else {
			client.emit('connectError', "room doesn't exist");
		}
	});

	

	client.on('updateUsers', function(users){
		client.emit('updateUsers', users);
		client.broadcast.to(users[0].room).emit('updateUsers', users);
	});

	client.on('renameUser', function(user){
		client.emit('userJoined', user);
		client.broadcast.to(user.room).emit('userJoined', user);
		console.log("RENAMING USER");
	});

	client.on('kickUser', function(user, message){
		client.to(user.clientId).emit("connectError", message);
		client.to(user.clientId).emit("leaveGame");
	});

	client.on('leaveGame', function(user){
		client.leave(user.room);		
	});

	client.on('disconnect', function(){
		console.log(client.user.username + " with ID "+client.id+" Disconnected from Room " + client.user.room);
	});
});


