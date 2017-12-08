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
    this.gameResult;
    this.leaderIndex;

    this.missionsPassed = 0;
    this.missionsFailed = 0;
}


function Mission(numPlayers){
    this.selectedUsers = [];
    this.numPlayers = numPlayers;
    this.leader = "";
    this.status = 0;  //1 pass, 2 fail, 0 nothing 
    this.approved;
    this.requiredFails = 1;

    //team Voting
    this.acceptMissionVotes = [];
    this.acceptVotes = 0;
    this.rejectVotes = 0;
    
    //mission voting
    this.passVotes = 0;
    this.failVotes = 0;
}