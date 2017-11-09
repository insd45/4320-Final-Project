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
		
		if(user.username == newUser.username){
			user = newUser;
		}
		
		//host holds the master list of users, clients sync from host
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
		updateLobby();
		console.log(users);
	});

	socket.on('kicked', function(){
		console.log("You have been kicked - too many players");
	});
});

// $(window).on('beforeunload', function(){
// 	socket.emit('leaveGame', user);
// });

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

function updateLobby(){
	$('#numPlayers').html(users.length);
	$('#userList').empty();
	console.log(user);
	for(var i = 0; i < users.length; i++){
		if(users[i].clientId == user.clientId){
			$('#userList').append("<li class='list-group-item list-group-item-success'>"+ users[i].username +"</li>");
		} else{
			$('#userList').append("<li class='list-group-item'>"+ users[i].username +"</li>");
		}
	}
}




