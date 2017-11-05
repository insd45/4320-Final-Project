var socket = io.connect('104.236.30.76:8082');
//var socket = io.connect('localhost:8080');

socket.on('sync', function(conn, users){
	$('#numPlayers').html(conn);
	// $playerField = $('#players'); 
	// $playerField.empty();
	// console.log(users);
	
	// for (var i = 0; i<users.length; i++){
	// 	console.log(users[i]);
	// 	$playerField.append("<li>" + users[i] + "</li>");
	// }
});

$(document).ready( function(){
	$('#joinButton').click( function(){
		var username = $('#username').val();
		joinGame(socket, username);
	});
});

$(window).on('beforeunload', function(){
	socket.emit('leaveGame');
});

function joinGame(socket, username){
	socket.emit('joinGame', username);
	//socket.emit('sync');
	$('#nameEntry').hide();
	$('#lobbyScreen').show();	
}
