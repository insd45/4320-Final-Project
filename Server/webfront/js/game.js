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
    this.alignment = "";
    this.role = "";
}

// User.prototype = {

// }


//gameplay object
function Game(host){
    this.users = [host];
    this.disconnectedUsers = [];
    this.missionNumber = 1;
    this.screen = "lobbyScreen";
}

Game.prototype = {
}