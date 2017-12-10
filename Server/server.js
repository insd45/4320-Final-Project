const MAX_PLAYERS = 10;

var express = require('express');
var path = require('path');
var app = express();

//Static resources server
app.use(express.static(path.join(__dirname, 'webfront/')));

var server = app.listen(8080, '127.0.0.1', function () {
    var port = server.address().port;
    console.log('Server running at port %s', port);
});

var io = require('socket.io')(server);

/* Connection events */

io.on('connection', function(client) {
    
    //sync gamestate to all users in room
    client.on('syncMasterGamestate', function(game){
        client.to(client.user.room).emit('syncGamestate', game);
    });

    //emit an event to a specific client
    client.on('emitToSpecificClient', function(event, userId){
        console.log("emitting to specific client " + event);
        if(client.id == userId){
            client.emit(event);
        } else {
            client.to(userId).emit(event);            
        }
    });

    //begin the vote to approve/deny team
    client.on('teamSubmittedForApproval', function(game){
        client.emit('startVoteOnTeam');
        client.to(client.user.room).emit('startVoteOnTeam');
    });

    //trigger the end game by passing the final result
    client.on('gameResult', function(result){
        console.log("User sent vote");
        client.to(io.sockets.adapter.rooms[client.user.room].host.clientId).emit('endGame', result);
    });

    //send approve/deny team vote to host
    client.on('userTeamApprovalVote', function(vote){
        console.log("User sent vote");
        client.to(io.sockets.adapter.rooms[client.user.room].host.clientId).emit('recievedUserTeamVote', vote);
    });

    //send pass/fail mission vote to host
    client.on('missionUserVote', function(vote){
        console.log("User sent vote");
        client.to(io.sockets.adapter.rooms[client.user.room].host.clientId).emit('recievedMissionVote', vote);
    });

    //emit an event to a group of clients
    client.on('emitToSpecificUsers', function(event, users){
        for(var i = 0; i < users.length; i++){
            if(users[i].clientId == client.id){
                client.emit(event);
            } else {
                client.to(users[i].clientId).emit(event);
            }
            
            console.log("Trigger mission vote for "+users[i].username);
        }
    });

    //sync user object to user
    client.on('syncUser', function(user){
        if(user.clientId == client.id){
            client.emit('updateUser', user);    
        } else{        
            client.to(user.clientId).emit('updateUser', user);
        }
    });

    //set game isInProgress flag to true
    client.on('startGame', function(){
        console.log("Room " + client.user.room + " has started the game");
        io.sockets.adapter.rooms[client.user.room].isInProgress = true;
    });

    //send selected mission users to host
    client.on('chosenMissionUsers', function(users){
        var host = io.sockets.adapter.rooms[client.user.room].host.clientId;
        client.to(host).emit('updateMissionUsers', users);
    });

    //host setup
    client.on('hostGame', function(user){
        console.log("Host has started a room");
        console.log(user);

        //generate room code
        user.room = user.clientVerificationId.substring(0,5);
        user.room = user.room.toUpperCase();

        //set user data
        user.clientId = client.id;
        client.user = user;
        
        console.log("Host room code is " + user.room);
        client.join(user.room);
        
        //set room properties
        io.sockets.adapter.rooms[user.room].isInProgress = false;
        io.sockets.adapter.rooms[user.room].host = user; //add the hosts user object to the room
        io.sockets.adapter.rooms[user.room].usernames = [user.username];
        client.emit('hostSetup', user);
    });

    //User setup
    client.on('joinGame', function(user){
        console.log("User has joined the Game");
        user.room = user.room.toUpperCase();
        
        //kick if room is full/doesn't exist
        if( io.sockets.adapter.rooms[user.room] == null ){
            client.emit('connectError', "room doesn't exist");
        } else if(io.sockets.adapter.rooms[user.room].length == MAX_PLAYERS){
            client.emit('connectError', "room is full");
        } else if ( io.sockets.adapter.rooms[user.room].usernames.indexOf(user.username) >= 0) {
            client.emit('connectError', "username already taken");
        } else if (io.sockets.adapter.rooms[user.room].isInProgress){
            //handle recconect event here
            client.emit('connectError', "Game in progress");
        } else {
            //pull host id off room
            var host = io.sockets.adapter.rooms[user.room].host.clientId;
            //add username to global username list
            io.sockets.adapter.rooms[user.room].usernames.push(user.username);
            //set user data
            user.clientId = client.id;
            client.user = user;

            console.log(user.username + " joining room " + user.room);
            client.join(user.room);

            client.emit('userJoined', user);
            client.to(host).emit('userJoined', user);
        }
    });

    //handle user disconnect
    client.on('disconnect', function(){
        console.log("A User has disconnected");
        if(client.user != null){
            if(client.user.isHost){
                client.to(client.user.room).emit('connectError', "Host has left the game, the game has ended");
            } else {
                // if(io.sockets.adapter.rooms[client.user.room].isInProgress != null){
                //     if(io.sockets.adapter.rooms[client.user.room].isInProgress){
                //         client.to(client.user.room).emit('connectError', "A User has left the game, the game has ended");
                //     }
                // }

                console.log(client.user.username + " with ID "+client.id+" Disconnected from Room " + client.user.room);
                
                if (io.sockets.adapter.rooms[client.user.room] != null){
                    var index = io.sockets.adapter.rooms[client.user.room].usernames.indexOf(client.user.username);
                    var host = io.sockets.adapter.rooms[client.user.room].host.clientId;

                    io.sockets.adapter.rooms[client.user.room].usernames.splice(index, 1);
                    console.log(io.sockets.adapter.rooms[client.user.room].usernames);

                    client.to(host).emit('userLeft', client.user);
                }
            }
        }
    });

    
});


