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

    $('#startButton').click( function(){
        if(clientUser.isHost){
            createMissions();
            assignRoles();
            
            for(var i = 0; i < clientGame.users.length; i++){
                socket.emit('syncUser', clientGame.users[i]);
            } 

            //clientGame.screen = "gameScreen";

            socket.emit('syncMasterGamestate', clientGame);
            generateView();
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
        console.log("Syncing Gamestate");
        console.log(clientGame);
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
    socket.on('updateUser', function(user){
        clientUser = user;
        console.log("Update user");
        console.log(clientUser);
    });
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

function createMissions(){
    var missionNumbers;

    switch(clientGame.users.length){
        case 5:
            missionNumbers = [2,3,2,3,3];
            break;
        case 6:
            missionNumbers = [2,3,4,3,4];
            break;
        case 7:
            missionNumbers = [2,3,3,4,4];
            break;
        default:
            missionNumbers = [3,4,4,5,5];
    }

    for(var i = 0; i<5; i++){
        clientGame.missions.push(new Mission(missionNumbers[i]));
    }

    console.log(clientGame.missions);
}

function assignRoles(){
    var roles;
    
    switch(clientGame.users.length){
        case 5:
            roles = ["merlin","good","good","assassin","evil"];
            break;
        case 6:
            roles = ["merlin","good","good","good","assassin","evil"];
            break;
        case 7:
            roles = ["merlin","good","good","good","assassin","evil","evil"];
            break;
        case 8:
            roles = ["merlin","good","good","good","good","assassin","evil","evil"];
            break;
        case 9:
            roles = ["merlin","good","good","good","good","good","assassin","evil","evil"];
            break;
        case 10:
            roles = ["merlin","good","good","good","good","good","assassin","evil","evil","evil"];
            break;  
        default:   
    }

    shuffle(roles);

    for(var i = 0; i < clientGame.users.length; i++){
        clientGame.users[i].role = roles[i];
    } 

    console.log(clientGame.users);
}

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