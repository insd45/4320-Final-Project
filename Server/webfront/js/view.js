/* View Handling */

//Button assignment
$(document).ready( function(){
    $('#closePlayerCardButton').click(function(){
        $('#myCharacter').modal('hide');
    });

    $('#startTeamSelection').click(function(){
        clientGame.missions[clientGame.missionNumber].selectedUsers = [];
        generateUserChoiceList();
        $('#missionTeamSelect').modal('show');
    });

    $('#startMissionButton').click(function(){
        socket.emit("emitToSpecificUsers", "triggerMissionVote", clientGame.missions[clientGame.missionNumber].selectedUsers);
    });
    
    $('#playerCardBack').on('click touch', function(){
        $('#myCharacter').modal('show');        
    });

    $('#missionUserSelectionList').on('click', '.missionSelectionItem', function(){
        var index = $(this).val();
        var user = {username: clientGame.users[index].username, clientId: clientGame.users[index].clientId};
        var currMissionArray = clientGame.missions[clientGame.missionNumber].selectedUsers;

        currMissionArray.push(user);
        //$('#missionTeamSelect').modal('hide');

        console.log(clientGame.missions[clientGame.missionNumber].selectedUsers);

        if(currMissionArray.length == clientGame.missions[clientGame.missionNumber].numPlayers){
            $('#missionTeamSelect').modal('hide');
            $('#submitTeamSelection').show();
            if(clientUser.isHost){
                socket.emit('syncMasterGamestate', clientGame);
                generateView();
            } else {
                socket.emit('chosenMissionUsers', currMissionArray);
            }
        } else {
            $(this).prop('disabled', true);
        }
    });

    $('#submitTeamSelection').click(function(){
        //functions send data to host
        socket.emit('teamSubmittedForApproval');
    });
    
    $('.teamAcceptButton').click(function(){
        if($(this).val() == "Yes"){
            console.log("inside first if teamAcceptButton");
            if(clientUser.isHost){
                clientGame.missions[clientGame.missionNumber].acceptMissionVotes.push({username:clientUser.username, vote: "Yes"});
                clientGame.missions[clientGame.missionNumber].acceptVotes += 1;
                checkMissionApprovalVotes();
            } else {
                socket.emit('userTeamApprovalVote', {username:clientUser.username, vote: "Yes"}); 
                console.log("inside else in teamAcceptButton");
            }
        } else {
            if(clientUser.isHost){
                clientGame.missions[clientGame.missionNumber].acceptMissionVotes.push({username:clientUser.username, vote: "No"});
                clientGame.missions[clientGame.missionNumber].rejectVotes += 1;
                checkMissionApprovalVotes();
            } else {
               socket.emit('userTeamApprovalVote', {username:clientUser.username, vote: "No"}); 
            }
        }
        $('#teamApprovalModal').modal('hide');
    });
    
    $('.missionSuccessButton').click(function(){
        if($(this).val() == "Succeed" || clientUser.role == "good" || clientUser.role == "merlin"){
            if(clientUser.isHost){
                clientGame.missions[clientGame.missionNumber].passVotes += 1;
                checkMissionVotes();
            } else {
               socket.emit('missionUserVote', "Success");
            }
        } else {
            if(clientUser.isHost){
                clientGame.missions[clientGame.missionNumber].failVotes += 1;
                checkMissionVotes();
            } else {
               socket.emit('missionUserVote', "Fail"); 
            }
        }
        $('#missionVotingModal').modal('hide');
    });
});

function generateUserVoteList(){
    var userString = "";
    var mission = clientGame.missions[clientGame.missionNumber];

    if(mission.approved){
        $('#teamVotingResultDialog').html("Mission Team Accepted");
    } else {
        $('#teamVotingResultDialog').html("Mission Team Rejected");
    }
    
    for(var i = 0; i < mission.acceptMissionVotes.length; i++){
        if (mission.acceptMissionVotes[i].vote == "Yes") {
            userString += "<li class='list-group-item list-group-item-success'>"+ mission.acceptMissionVotes[i].username +"</li>";
        } else {
            userString += "<li class='list-group-item list-group-item-danger'>"+ mission.acceptMissionVotes[i].username +"</li>";
        }
    }
    
    $('#teamVotingResultList').html(userString);
}

function generateUserChoiceList(){
    $('#missionSelectionDialog').html("Leader, choose " + clientGame.missions[clientGame.missionNumber].numPlayers + " players for this mission");    
    var $userList = $('#missionUserSelectionList');
    var userListString = "";
    

    for(var i = 0; i< clientGame.users.length; i++){
        userListString += "<button class='btn btn-primary missionSelectionItem' value='"+i+"'>"+clientGame.users[i].username+"</button>";
    }

    $userList.html(userListString);
}


function generateView(){
    switch(clientGame.screen){
        case 'lobbyScreen':
            updateLobby();
            transitionScreens('#lobbyScreen');
            break;
        case 'gameScreen':
            updatePlayerCard();
            updateVoteBar();
            updateMissionBar();
            updateMissionUserList();
            transitionScreens('#gameScreen');

            var mission = clientGame.missions[clientGame.missionNumber];
            
            if(mission.approved != null){
                generateUserVoteList();
                $('#teamVotingResultModal').modal("show");

                if(mission.approved){
                    if(mission.leader.clientId == clientUser.clientId){
                        $('#startTeamSelection').hide();
                        $('#submitTeamSelection').hide();
                        $('#startMissionButton').show();
                    }
                }
            }
            break;
        default:
    }
}

function updateMissionUserList(){
    var userString = "";
    var mission = clientGame.missions[clientGame.missionNumber];

    if(clientUser.clientId == mission.leader.clientId){
        $("#startTeamSelection").show();
    } else {
        $("#startTeamSelection").hide();
    }
    userString += "<li class='list-group-item list-group-item-warning'>Leader: "+ mission.leader.username +"</li>";
    for(var i = 0; i < mission.selectedUsers.length; i++){
        userString += "<li class='list-group-item'>"+ mission.selectedUsers[i].username +"</li>";
    }

    $("#currentMissionUserList").html(userString);
}

//handles screen transitions
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

function updatePlayerCard(){
    $('#playerName').html(clientUser.username);
    
    switch(clientUser.role){
        case "merlin":
            showEvilCharacters();
            $('#playerImage').html("<img src='images/merlin.png' alt='merlin' class='playerCard'>");
            break;
        case "good":
            $('#playerImage').html("<img src='images/loyalServant.png' alt='Loyal Servant' class='playerCard'>");
            break;
        case "evil":
            showEvilCharacters();
            $('#playerImage').html("<img src='images/minion.png' alt='Minion of Mordred' class='playerCard'>");
            break;
        case "assassin":
            showEvilCharacters();
            $('#playerImage').html("<img src='images/assassin.png' alt='Assassin' class='playerCard'>");
            break;
        default:
    }

}

function showEvilCharacters(){
    var evilPlayers = "";
    evilPlayers += "<li class='list-group-item list-group-item-danger'>Minions of Mordred</li>";
    for(var i = 0; i < clientGame.users.length; i++){
        if(clientGame.users[i].role == "evil" || clientGame.users[i].role == "assassin"){
            evilPlayers += "<li class='list-group-item'>" + clientGame.users[i].username + "</li>";
        }
    }
    $('#evilPlayerList').html(evilPlayers);
}

function updateVoteBar(){
    var voteString = "";
    for(var i = 0; i < 5; i++){
        if (clientGame.missions[i].status == 1) {
            voteString += "<div class='vote visibleText' style='background-color:#2f3bd3;'>"+(clientGame.missions[i].numPlayers)+"</div>";
        } else if (!clientGame.missions[i].status == 2) {
            voteString += "<div class='vote visibleText' style='background-color:#d12525;'>"+(clientGame.missions[i].numPlayers)+"</div>";
        } else {
            voteString += "<div class='vote'>"+(clientGame.missions[i].numPlayers)+"</div>";
        }
    }
    $('#voteContainer').html(voteString);
}

function updateMissionBar(){
    switch(clientGame.missionNumber){
        case 0:
            $('#mission1').addClass("progress-bar-striped");
            break;
        case 1:
            $('#mission2').addClass("progress-bar-striped");
            $('#mission1').removeClass("progress-bar-striped");
            break;
        case 2:
            $('#mission3').addClass("progress-bar-striped");
            $('#mission2').removeClass("progress-bar-striped");
            break;
        case 3:
            $('#mission4').addClass("progress-bar-striped");
            $('#mission3').removeClass("progress-bar-striped");
            break;
        case 4:
            $('#mission5').addClass("progress-bar-striped");
            $('#mission4').removeClass("progress-bar-striped");
            break;
        default:
    } 
}