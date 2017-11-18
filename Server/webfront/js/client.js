var socket = io();
var user = new User();
var users = [];
var game;

$(document).ready( function(){
	
	//Interface Interaction
	$('#joinButton').click( function(){		
		createUser(false);
		socket.emit('joinGame', user);
		displayLobby();
	});

	$('#hostButton').click( function(){
		createUser(true);
		socket.emit('hostGame', user);
		displayLobby();
	});

	//socket events
	socket.on('hostCode', function(code){
		user.room = code;
		$('#lobbyCode').html(code);
		$('#lobbyDisplay').show();
		$('#startButton').show();
	});

	socket.on('userJoined', function(newUser){
		
		if(user.clientVerificationId == newUser.clientVerificationId){
			user = newUser;
		}
		
		//host holds the master list of users, clients sync from host
		if(user.isHost){
			console.log("Host emitted user array");

			for(var i = 0; i < users.length; i++){
				if(newUser.username == users[i].username){
					socket.emit("kickUser", newUser, "Username already in use");
					return;
				}
			}

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

	socket.on('connectError', function(message){
		console.log(message);
		errorScreen(message);
	});

	socket.on('leaveGame', function(){
		socket.emit("leaveGame", user);
	});
});

// $(window).on("beforeunload", function() {
// 	return "WARNING: about to leave game!";
// });

//Create a new user
function createUser(isHost){
	var username = $('#username').val();
	
	user.isHost = isHost;
	user.username = username;
	user.clientVerificationId = generateId(4);
	
	if(!isHost){
		user.room = $('#roomCode').val();
	}

	console.log(user);
}

function errorScreen(message){
	$('.gamePage').hide();
	$('#errorScreen').show();
	$('#errorMessage').html(message);
}

function displayLobby(){
	$('#startScreen').fadeOut(function(){
		$('#lobbyScreen').fadeIn();	
	});
}

function updateLobby(){
	$('#numPlayers').html(users.length);
	$('#userList').empty();
	console.log(user);
	if(users.length >= 5 && user.isHost){
		$('#startButton').prop('disabled', false);
	}

	for(var i = 0; i < users.length; i++){
		if(users[i].clientId == user.clientId){
			$('#userList').append("<li class='list-group-item list-group-item-success'>"+ users[i].username +"</li>");
		} else{
			$('#userList').append("<li class='list-group-item'>"+ users[i].username +"</li>");
		}
	}
}

function generateId(length){
	var uid = "";
	function s4() { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); }
	for(var i = 0; i < length; i++){ uid += s4(); }
	return uid;
}




