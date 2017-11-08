var socket = io();
var user = new User();
var users = [];
var game;

$(document).ready( function(){
	
	$('#joinButton').click( function(){		
		createUser(false);
		socket.emit('joinGame', user);
		joinGame();
		
	});

	$('#hostButton').click( function(){
		createUser(true);
		//users.push(user);
		socket.emit('hostGame', user);
		joinGame();
	});

	socket.on('sync', function(conn){
		console.log("synced from server");
		$('#numPlayers').html(conn);
	});

	socket.on('hostCode', function(code){
		user.lobby = code;
		$('#lobbyCode').html(code);
		$('#lobbyDisplay').show();
	});

	socket.on('userJoined', function(newUser){
		//host holds the master list of users
		if(user.isHost){
			console.log("Host emitted user array");
			users.push(newUser);
			socket.emit('updateUsers', users);
		} else {
			console.log("user update ended");
		}
	});

	socket.on('updateUsers', function(userList){
		users = userList;
		console.log("Users recieved data from host");
		$('#numPlayers').html(users.length);
		console.log(users);
	});
});

$(window).on('beforeunload', function(){
	socket.emit('leaveGame', user);
});

function createUser(host){
	var username = $('#username').val();
	var lobbyCode = $('#roomCode').val();
	
	user.isHost = host;
	user.username = username;
	user.lobby = lobbyCode;
	console.log(user);
}

function joinGame(code){
	$('#startPage').hide();
	$('#lobbyScreen').show();
}




