/* View Handling */

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
        $startButton.prop('disabled', false);
    } else {
        $startButton.prop('disabled', true);
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

function updateVoteBar(){
    var voteString;
    for(var i = 0; i < 5; i++){
        if (clientGame.mission[i].status) {
            voteString += "<div class='vote' style='background-color:#2f3bd3;'></div>";
        } else if (!clientGame.mission[i].status) {
            voteString += "<div class='vote' style='background-color:#d12525;'></div>";
        } else {
            voteString += "<div class='vote' style='background-color:white;'></div>";
        }
    }
    $('#voteContainer').html(voteString);
}

function updateMissionBar(){
    switch(clientGame.missionNumber){
        case 1:
            $('#mission1').addClass(progress-bar-striped);
            break;
        case 2:
            $('#mission2').addClass(progress-bar-striped);
            $('#mission1').removeClass(progress-bar-striped);
            break;
        case 3:
            $('#mission3').addClass(progress-bar-striped);
            $('#mission2').removeClass(progress-bar-striped);
            break;
        case 4:
            $('#mission4').addClass(progress-bar-striped);
            $('#mission3').removeClass(progress-bar-striped);
            break;
        case 5:
            $('#mission5').addClass(progress-bar-striped);
            $('#mission4').removeClass(progress-bar-striped);
            break;
        default:
    } 
}







