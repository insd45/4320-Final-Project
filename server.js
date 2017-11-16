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
		console.log("Host with IP : "+ (client.request.headers['x-forwarded-for'] || client.request.connection.remoteAddress) + " has started a lobby");
		//console.log("Host has started a lobby");
		console.log(client.id);
		console.log(user);

		//generate room code
		var room = user.clientVerificationId;
		room = room.substring(0,5);
		room = room.toUpperCase();

		//user.clientIpAddr = (client.request.headers['x-forwarded-for'] || client.request.connection.remoteAddress);
		user.clientId = client.id;
		user.lobby = room;

		console.log("Host lobby code is " + room);
		client.join(room);
		client.emit('hostCode', room);
		client.emit('userJoined', user);
	});

	client.on('joinGame', function(user){
		console.log("User with IP : "+ (client.request.headers['x-forwarded-for'] || client.request.connection.remoteAddress) + " has joined the Game");
		
		var room = user.lobby;
		var username = user.username;

		//user.clientIpAddr = (client.request.headers['x-forwarded-for'] || client.request.connection.remoteAddress);		
		user.clientId = client.id;
		
		//makes room codes non-case sensitive
		room = room.toUpperCase();

		//kick if lobby is full/doesn't exist
		if( io.sockets.adapter.rooms[room] != null ){
			if(io.sockets.adapter.rooms[room].length < MAX_PLAYERS){
				console.log(username + " joining lobby " + room);
				client.join(room);
				console.log(client.rooms);
				client.emit('userJoined', user);
				client.broadcast.to(room).emit('userJoined', user);
			} else {
				client.emit('connectError', "Lobby is full");
			}
		} else {
			client.emit('connectError', "Lobby doesn't exist");
		}
	});

	

	client.on('updateUsers', function(users){
		client.emit('updateUsers', users);
		client.broadcast.to(users[0].lobby).emit('updateUsers', users);
	});

	client.on('renameUser', function(user){
		client.emit('userJoined', user);
		client.broadcast.to(user.lobby).emit('userJoined', user);
		console.log("RENAMING USER");
	});

	client.on('kickUser', function(user, message){
		client.to(user.clientId).emit("connectError", message);
		client.to(user.clientId).emit("leaveGame");
	});

	client.on('leaveGame', function(user){
		client.leave(user.lobby);		
	});

	client.on('disconnect', function(){
		console.log(client.id + " Disconnected");
	});
});


