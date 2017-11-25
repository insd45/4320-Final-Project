
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
	// console.log('User connected');

	//host setup
	client.on('hostGame', function(user){
		console.log("Host has started a room");
		console.log(user);

		//generate room code
		user.room = user.clientVerificationId.substring(0,5);
		user.room = user.room.toUpperCase();

		//set user data
		user.clientId = client.id;
		client.user = user;
		
		console.log("Host room code is " + user.room);
		client.join(user.room);
		//add the hosts user object to the room
		io.sockets.adapter.rooms[user.room].host = user;
		io.sockets.adapter.rooms[user.room].usernames = [user.username];
		client.emit('hostSetup', user);
	});

	//User setup
	client.on('joinGame', function(user){
		console.log("User has joined the Game");
		user.room = user.room.toUpperCase();
		
		//kick if room is full/doesn't exist
		if( io.sockets.adapter.rooms[user.room] == null ){
			client.emit('connectError', "room doesn't exist");
		} else if(io.sockets.adapter.rooms[user.room].length == MAX_PLAYERS){
			client.emit('connectError', "room is full");
		} else if ( io.sockets.adapter.rooms[user.room].usernames.indexOf(user.username) >= 0) {
			client.emit('connectError', "username already taken");
		} else {
			//pull host id off room
			var host = io.sockets.adapter.rooms[user.room].host.clientId;
			//add username to global username list
			io.sockets.adapter.rooms[user.room].usernames.push(user.username);
			//set user data
			user.clientId = client.id;
			client.user = user;

			console.log(user.username + " joining room " + user.room);
			client.join(user.room);

			client.emit('userJoined', user);
			client.to(host).emit('userJoined', user);
		}
	});

	client.on('syncMasterGamestate', function(game){
		client.to(client.user.room).emit('syncGamestate', game);
	});

	client.on('disconnect', function(){
		console.log("A User has disconnected");
		if(client.user != null){
			console.log(client.user.username + " with ID "+client.id+" Disconnected from Room " + client.user.room);
			
			var index = io.sockets.adapter.rooms[client.user.room].usernames.indexOf(client.user.username);
			var host = io.sockets.adapter.rooms[client.user.room].host.clientId;
			//console.log(host)
			io.sockets.adapter.rooms[client.user.room].usernames.splice(index, 1);
			console.log(io.sockets.adapter.rooms[client.user.room].usernames);

			client.to(host).emit('userLeft', client.user);
			delete client.user;
		}
	});

	

	// client.on('updateUsers', function(users){
	// 	client.emit('updateUsers', users);
	// 	client.broadcast.to(users[0].room).emit('updateUsers', users);
	// });

	// client.on('renameUser', function(user){
	// 	client.emit('userJoined', user);
	// 	client.broadcast.to(user.room).emit('userJoined', user);
	// 	console.log("RENAMING USER");
	// });

	// client.on('kickUser', function(user, message){
	// 	client.to(user.clientId).emit("connectError", message);
	// 	client.to(user.clientId).emit("leaveGame");
	// });

	// client.on('leaveGame', function(user){
	// 	client.leave(user.room);		
	// });

	
});


