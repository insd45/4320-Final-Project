//user object
function User(){
    //user properties
    var username = "";
    var room = "";
    var clientId = "";
    var clientVerificationId = "";
    var clientIpAddr = "";
    var isHost = false;
    var hostCliendId = "";
    
    //game specific properties
    var alignment = "";
    var role = "";
}

// User.prototype = {

// }


//gameplay object
function Game(){
    var players = [];
    var missionNumber;
    var phase;
}

Game.prototype = {
}