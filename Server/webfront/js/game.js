//user object
function User(){
    //user properties
    var isHost = "";
    var username = "";
    var room = "";
    var clientId = "";
    var clientVerificationId = "";
    var clientIpAddr = "";
    var hostCliendId = "";
    
    //game specific properties
    var alignment = "";
    var role = "";
}

// User.prototype = {

// }


//gameplay object
function Game(host){
    var users = [host];
    var missionNumber = 1;
    var screen = "lobbyScreen";
}

Game.prototype = {
}