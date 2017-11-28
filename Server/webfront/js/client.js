var socket = io();
const MIN_PLAYERS = 5;
var clientUser;
var clientGame;

$(document).ready( function(){
    
    //user interaction
    $('#joinButton').click( function(){		
        if(createUser(false)){
            socket.emit('joinGame', clientUser);
        }
    });

    
    //host interaction
    $('#hostButton').click( function(){
        if(createUser(true)){
            socket.emit('hostGame', clientUser);
        }
    });

    /**
     * Socket Events
     */

     /* Lobby events */

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


    /* Game Events */
});



//Create a new user
function createUser(isHost){
    var username = $('#username').val();
    var roomCode = $('#roomCode').val();

    if(username.length == 0){
        errorScreen("Enter a username");
        return false;
    }
  
    clientUser = new User();
    clientUser.isHost = isHost;
    clientUser.username = username;
    clientUser.clientVerificationId = generateId(4);
    
    if(!isHost){
        clientUser.room = roomCode;
    }

    return true;
}

/* Game Specific functions */

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

function testShuffle(){
    var newArr = ["evil","assassin","merlin","good","good"];
    console.log(newArr);
    shuffle(newArr);
    console.log(newArr);
}