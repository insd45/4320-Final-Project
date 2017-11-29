//user object
function User(){
    //user properties
    this.isHost = "";
    this.username = "";
    this.room = "";
    this.clientId = "";
    this.clientVerificationId = "";
    this.hostCliendId = "";
    
    //game specific properties
    this.isLeader = false;
    this.alignment = "";
    this.role = "";
}

// User.prototype = {

// }


//gameplay object
function Game(host){
    this.users = [host];
    this.missions [];
    this.disconnectedUsers = [];
    this.missionNumber = 1;
    this.screen = "lobbyScreen";
    this.currLeader;
}

function Mission(){

}