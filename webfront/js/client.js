//var socket = io.connect('104.236.30.76:8080');
var socket = null;
var role = null;
var mission = null;
var phase = null;
var roomCode = null;
//var game = new Game();

$(document).ready( function(){
	$('#joinButton').click( function(){
		connectToSocket();
		
		roomCode = $('#roomCode').val();
		if(roomCode != 0){
			joinGame(roomCode);
		}
	});

	$('#hostButton').click( function(){
		// var username = $('#username').val();
		// joinGame(socket, username);
	});
});

$(window).on('beforeunload', function(){
	socket.emit('leaveGame', roomCode);
});

function joinGame(code){
	socket.emit('joinGame', code);

	$('#startPage').hide();
	$('#lobbyScreen').show();
}

function connectToSocket(){
	socket = io.connect('localhost:8080');
	
	socket.on('sync', function(conn){
		$('#numPlayers').html(conn);
	});
}



