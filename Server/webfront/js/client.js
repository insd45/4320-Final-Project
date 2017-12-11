/* Game Controller */

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

    //start the game
    $('#startButton').click( function(){
        if(clientUser.isHost && clientGame.users.length >= MIN_PLAYERS){
            gameSetup();
            
            for(var i = 0; i < clientGame.users.length; i++){
                socket.emit('syncUser', clientGame.users[i]);
            } 

            clientGame.screen = "gameScreen";

            socket.emit('startGame');
            socket.emit('syncMasterGamestate', clientGame);
            generateView();
        }
    });

    /**
     * Socket Events
     */

     /* Lobby events */

    //displays error from server
    socket.on('connectError', function(message){
        console.log(message);
        errorScreen(message);
    });


    //update game data from host
    socket.on('syncGamestate', function(game){
        clientGame = game;
        console.log("Syncing Gamestate");
        console.log(clientGame);
        generateView();
    });

    //host specific events

    //set up host item, create master game object
    socket.on('hostSetup', function(user){
        console.log("Made it to host setup");
        clientUser = user;
        clientGame = new Game(clientUser);
        console.log(clientUser);
        generateView();
    });

    //add new user to game
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

    //remove user from game
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

    //update user object from server
    socket.on('updateUser', function(user){
        clientUser = user;
        console.log("Update user");
        console.log(clientUser);
    });

    //begin team vote
    socket.on('startVoteOnTeam', function(user){
        $('#teamApprovalModal').modal('show');
    });

    //begin mission vote
    socket.on('triggerMissionVote', function(){
        $('#missionVotingModal').modal('show');
    });

    //allow assassin to choose merlin
    socket.on('attemptAssassination', function(){
        console.log("USER SHOULD SEE ASSASSINATION MODAL");
        $('#assassinModal').modal('show');
    });

    //host game functions
    socket.on('updateMissionUsers', function(users){
        clientGame.missions[clientGame.missionNumber].selectedUsers = users;
        socket.emit('syncMasterGamestate', clientGame);
        generateView();
    });

    //end the game
    socket.on('endGame', function(result){
        endGame(result);
    });

    //add approve/reject vote to game
    socket.on('recievedUserTeamVote', function(clientVote){
        console.log("host recieved vote");
        var mission = clientGame.missions[clientGame.missionNumber]; 
    
        if(clientVote.vote == "Yes"){
            mission.acceptMissionVotes.push(clientVote);
            mission.acceptVotes += 1;        
        } else {
            mission.acceptMissionVotes.push(clientVote);
            mission.rejectVotes += 1;
        }

        checkMissionApprovalVotes();
    });

    //add pass/fail vote to game
    socket.on('recievedMissionVote', function(vote){
        console.log("host recieved vote");
        var mission = clientGame.missions[clientGame.missionNumber]; 
    
        if(vote == "Success"){
            mission.passVotes += 1;       
        } else {
            mission.failVotes += 1;
        }

        checkMissionVotes();
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

//display the end game based on results
function endGame(result){
    if(result){
        clientGame.screen = 'goodWinScreen';
    } else {
        clientGame.screen = 'evilWinScreen';
    }

    socket.emit('syncMasterGamestate', clientGame);
    generateView();
}

//Check if the mission has been approved or rejected
function checkMissionApprovalVotes(){
    var mission = clientGame.missions[clientGame.missionNumber]; 
    
    if(mission.acceptMissionVotes.length == clientGame.users.length){
        if(mission.acceptVotes > mission.rejectVotes){
            //send results to users
            //socket.emit("emitToSpecificUsers", "triggerMissionVote", mission.selectedUsers);
            mission.approved = true;
            socket.emit('syncMasterGamestate', clientGame);
            generateView();
            console.log("MISSION ACCEPTED");
        } else {
            clientGame.numMissionRejects++;

            clientGame.leaderIndex++;

            if(clientGame.leaderIndex >= clientGame.users.length){
                clientGame.leaderIndex = 0;
            }

            mission.leader = clientGame.users[clientGame.leaderIndex];
            mission.acceptVotes = 0;
            mission.rejectVotes = 0;
            mission.selectedUsers = [];

            mission.approved = false;
            socket.emit('syncMasterGamestate', clientGame);
            generateView();
            console.log("MISSION REJECTED");
        }
    }

    console.log(mission.acceptMissionVotes);
    console.log("Accept votes " + mission.acceptVotes);
    console.log("Fail votes " + mission.rejectVotes);
}

//check if the mission has passed or failed
function checkMissionVotes(){
    var mission = clientGame.missions[clientGame.missionNumber]; 
    
    if((mission.passVotes + mission.failVotes) == mission.selectedUsers.length){
        if(mission.failVotes < mission.requiredFails){
            //send results to users
            //socket.emit("emitToSpecificUsers", "triggerMissionVote", mission.selectedUsers);
            mission.status = 1;
            mission.approved = null;
            clientGame.missionsPassed++;
            console.log("MISSION PASSED");
        } else {
            clientGame.missionsFailed++;
            //anything else is a fail
            mission.approved = null;            
            mission.status = 2;
            
            console.log("MISSION Failed");
        }

        clientGame.leaderIndex++;
        if(clientGame.leaderIndex >= clientGame.users.length){
            clientGame.leaderIndex = 0;
        }
        clientGame.missions[clientGame.missionNumber + 1].leader = clientGame.users[clientGame.leaderIndex];

        //END GAME
        if(clientGame.missionNumber < 4 && clientGame.missionsPassed < 3 && clientGame.missionsFailed < 3){
            clientGame.missionNumber++;
        } else {
            //game over
            if(clientGame.missionsPassed > clientGame.missionsFailed){ //good wins
                clientGame.gameResult = true;

                var assassin;
                
                for(var i=0; i<clientGame.users.length; i++){
                    if(clientGame.users[i].role == "assassin"){
                        assassin = clientGame.users[i];
                        break;
                    }
                }

                socket.emit('emitToSpecificClient', 'attemptAssassination', assassin.clientId);

            } else {
                clientGame.gameResult = false;    
                endGame(clientGame.gameResult);
            }
        }

        socket.emit('syncMasterGamestate', clientGame);
        generateView();
    }

    console.log(mission.acceptMissionVotes);
    console.log("Accept votes " + mission.acceptVotes);
    console.log("Fail votes " + mission.rejectVotes);
}

//set up roles
function gameSetup(){
    var roles;
    var leader;
    var missionNumbers;
    var requiredFails;
    
    //assign roles and mission based on number of players
    switch(clientGame.users.length){
        case 5:
            requiredFails = [1,1,1,1,1];
            missionNumbers = [2,3,2,3,3];        
            roles = ["merlin","good","good","assassin","evil"];
            break;
        case 6:
            requiredFails = [1,1,1,1,1];
            missionNumbers = [2,3,4,3,4];        
            roles = ["merlin","good","good","good","assassin","evil"];
            break;
        case 7:
            requiredFails = [1,1,1,2,1];
            missionNumbers = [2,3,3,4,4];        
            roles = ["merlin","good","good","good","assassin","evil","evil"];
            break;
        case 8:
            requiredFails = [1,1,1,2,1];
            missionNumbers = [3,4,4,5,5];
            roles = ["merlin","good","good","good","good","assassin","evil","evil"];
            break;
        case 9:
            requiredFails = [1,1,1,2,1];
            missionNumbers = [3,4,4,5,5];
            roles = ["merlin","good","good","good","good","good","assassin","evil","evil"];
            break;
        case 10:
            requiredFails = [1,1,1,2,1];
            missionNumbers = [3,4,4,5,5];
            roles = ["merlin","good","good","good","good","good","assassin","evil","evil","evil"];
            break;  
        default: 
            //For testing
            requiredFails = [1,1,1,1,1];
            missionNumbers = [1,1,1,1,1];
            roles = ["merlin","evil","evil","assassin","evil"];
    }

    for(var i = 0; i<5; i++){
        clientGame.missions.push(new Mission(missionNumbers[i], requiredFails[i]));
    }

    shuffle(roles);

    for(var i = 0; i < clientGame.users.length; i++){
        clientGame.users[i].role = roles[i];
    } 

    //assign leader for 1st mission
    leader = Math.floor(Math.random() * (clientGame.users.length));
    console.log("LEADER INDEX = " + leader);
    clientGame.leaderIndex = leader;
    clientGame.missions[0].leader = clientGame.users[leader];
}

//shuffle an array
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
}

//generate a user id
function generateId(length){
    var uid = "";
    function s4() { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); }
    for(var i = 0; i < length; i++){ uid += s4(); }
    return uid;
}