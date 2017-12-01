/* Game Model */

//user object
function User(){
    //user properties
    this.isHost = "";
    this.username = "";
    this.room = "";
    this.clientId = "";
    this.clientVerificationId = "";
    
    //game specific properties
    this.isLeader = false;
    this.alignment = "";
    this.role = "";
}


//gameplay object
function Game(host){
    this.users = [host];
    this.missions = [];
    this.disconnectedUsers = [];
    this.missionNumber = 0;
    this.numFails = 0;
    this.screen = "lobbyScreen";
    this.missionSkips = 0;
    this.gameResults;
}


function Mission(numPlayers){
    this.selectedUsers = [];
    this.numPlayers = numPlayers;
    this.leader = "";
    this.status;  //true pass, false fail 
    
    //voting
    this.acceptMissionVotes = [];
    this.passVotes = 0;
    this.failVotes = 0;
}