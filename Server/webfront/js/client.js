var socket = io();
const MIN_PLAYERS = 5;
var clientUser;
var clientGame;

$(document).ready( function(){
	
	//user interaction
	$('#joinButton').click( function(){		
		createUser(false);
		socket.emit('joinGame', clientUser);
	});

	//host interaction
	$('#hostButton').click( function(){
		createUser(true);
		socket.emit('hostGame', clientUser);
	});

	//host events
	socket.on('hostSetup', function(user){
		console.log("Made it to host setup");
		clientUser = user;
		clientGame = new Game(clientUser);
		generateView();
	});


	//socket events
// 	socket.on('hostCode', function(code){
// 		user.room = code;
// 		$('#lobbyCode').html(code);
// 		$('#lobbyDisplay').show();
// 		$('#startButton').show();
// 	});

// 	socket.on('userJoined', function(newUser){
		
// 		if(user.clientVerificationId == newUser.clientVerificationId){
// 			user = newUser;
// 		}
		
// 		//host holds the master list of users, clients sync from host
// 		if(user.isHost){
// 			console.log("Host emitted user array");

// 			for(var i = 0; i < users.length; i++){
// 				if(newUser.username == users[i].username){
// 					socket.emit("kickUser", newUser, "Username already in use");
// 					return;
// 				}
// 			}

// 			users.push(newUser);
// 			socket.emit('updateUsers', users);
// 		} else {
// 			console.log("user update ended");
// 		}
// 	});

// 	socket.on('updateUsers', function(userList){
// 		users = userList;
// 		console.log("Users recieved data from host");
// 		updateLobby();
// 		console.log(users);
// 	});

// 	socket.on('connectError', function(message){
// 		console.log(message);
// 		errorScreen(message);
// 	});

// 	socket.on('leaveGame', function(){
// 		socket.emit("leaveGame", user);
// 	});
});



//Create a new user
function createUser(isHost){
	clientUser = new User();
	var username = $('#username').val();
	
	clientUser.isHost = isHost;
	clientUser.username = username;
	clientUser.clientVerificationId = generateId(4);
	
	if(!isHost){
		clientUser.room = $('#roomCode').val();
	}
}




// View Handling
function generateView(){
	switch(clientGame.screen){
		case 'lobbyScreen':
			updateLobby();
			transitionScreens('#lobbyScreen');
			break;
		default:
	}
}

//handles all screen transitions
function transitionScreens(nextScreen){
	console.log("transitioned screens");
	$('.gameScreen:visible').hide(function(){
		$(nextScreen).show();
	});
}

function updateLobby(){
	var $startButton = $('#startButton');

	$('#numPlayers').html(clientGame.users.length);

	if(clientUser.isHost){
		$startButton.show();
	}

	if(clientGame.users.length >= MIN_PLAYERS && clientUser.isHost){
		$startButton.prop('disabled', false);
	}

	var lobbyContent = "";

	for(var i = 0; i < users.length; i++){
		if(clientGame.users[i].clientId == clientUser.clientId){
			lobbyContent += "<li class='list-group-item list-group-item-success'>"+ users[i].username +"</li>";
		} else{
			lobbyContent += "<li class='list-group-item'>"+ users[i].username +"</li>";
		}
	}

	$('#userList').html(lobbyContent);
}

function generateId(length){
	var uid = "";
	function s4() { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); }
	for(var i = 0; i < length; i++){ uid += s4(); }
	return uid;
}


// function errorScreen(message){
// 	$('.gamePage').hide();
// 	$('#errorScreen').show();
// 	$('#errorMessage').html(message);
// }










