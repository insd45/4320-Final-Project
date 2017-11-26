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

    //socket events


    socket.on('connectError', function(message){
        console.log(message);
        errorScreen(message);
    });


    socket.on('syncGamestate', function(game){
        clientGame = game;
        console.log("Syncing Gamestate")
        generateView();
    });


    //host specific events

    socket.on('hostSetup', function(user){
        console.log("Made it to host setup");
        clientUser = user;
        clientGame = new Game(clientUser);
        console.log(clientUser);
        generateView();
    });


    socket.on('userJoined', function(user){
        console.log(user.username + "Joined, userJoined event");
        //client recieves completed user object
        if(clientUser.clientVerificationId == user.clientVerificationId){
            clientUser = user;
        }
        
        //host holds the master list of users, clients sync from host
        if(clientUser.isHost){
            //add new user to master gamestate held by host, sync to all clients
            clientGame.users.push(user);
            socket.emit('syncMasterGamestate', clientGame);
            generateView();
            console.log("Host emitted user array");
        } else {
            console.log("user update ended\n USER OBJECT: ");
            console.log(clientUser);
        }
    });


    socket.on('userLeft', function(user){
        console.log(user.username + ' Left the game');
        var index = clientGame.users.findIndex(i => i.clientId == user.clientId);
        
        var leftUser = clientGame.users.splice(index,1);
        if(clientGame.screen != 'lobbyScreen'){
            clientGame.disconnectedUsers.push(leftUser);
        }

        socket.emit('syncMasterGamestate', clientGame);
        generateView();
    });

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
    $('.gameScreen').hide();
    $(nextScreen).show();
}

function updateLobby(){
    var $startButton = $('#startButton');

    $('#numPlayers').html(clientGame.users.length);

    if(clientUser.isHost){
        $startButton.show();
        $('#lobbyCode').html(clientUser.room);
        $('#lobbyDisplay').show();
    }

    if(clientGame.users.length >= MIN_PLAYERS && clientUser.isHost){
        $startButton.show();
    }

    var lobbyContent = "";

    for(var i = 0; i < clientGame.users.length; i++){
        if(clientGame.users[i].clientId == clientUser.clientId){
            lobbyContent += "<li class='list-group-item list-group-item-success'>"+ clientGame.users[i].username +"</li>";
        } else{
            lobbyContent += "<li class='list-group-item'>"+ clientGame.users[i].username +"</li>";
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

function errorScreen(message){
    $('#errorMessage').html(message);
    $('#errorScreen').show();
}










