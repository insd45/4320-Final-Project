var socket = io();
var role = null;
var mission = null;
var phase = null;
var roomCode = null;
var user = new User();
var game;

$(document).ready( function(){
	
	$('#joinButton').click( function(){		
		createUser();
		socket.emit('joinGame', user);
		joinGame();
		
	});

	$('#hostButton').click( function(){
		createUser();
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
});

$(window).on('beforeunload', function(){
	socket.emit('leaveGame', user);
});

function createUser(){
	var username = $('#username').val();
	var lobbyCode = $('#roomCode').val();
	user.username = username;
	user.lobby = lobbyCode;
	console.log(user);
}

function joinGame(code){
	$('#startPage').hide();
	$('#lobbyScreen').show();
}




