# Avalon
#### 4320-Final-Project
---
# Where to play
[Click Here to Play](https://josephmfrank.com)

5-10 players

# Rules

[Official Rules](http://www.skiptherulebook.com/2016/09/18/avalon/)
Note: our version of the game only utilizes the Merlin and Assassin character cards

Avalon is a 5-10 player card game with 2 different opposing sides. The number of good and evil players depends on how many overall players there are.

| Number of Players | Number of good guys | Number of bad guys |
| ----------------- | ------------------- | ------------------ |
| 5 | 3 | 2 |
| 6 | 4 | 2 |
| 7 | 4 | 3 |
| 8 | 5 | 3 |
| 9 | 6 | 3 |
| 10 | 6 | 4 |

One player on the good team will be Merlin and one player on the evil team will be the Assassin. At the start of the game, Merlin is given the identities of the evil characters, but he can't give away the fact that he knows this, because if the Assassin is able to learn who Merlin was, evil wins.

Whoever the leader is picks a team of the required number of players in hopes that their allegiance wins. Once a team is selected, all players vote on whether to approve or veto the team. If the team is vetoed, it becomes another person's turn to pick the team, and so on. If the team is approved, the team members are then given the option to succeed or fail the quest. If there is 1 fail or higher, the quest fails. The good guys are only able to succeed, but the bad guys are able to succeed or fail the mission. Succeeding may be a wise strategy for a villain so they don't appear evil.

| Number of Players | Required number for Quest 1 | Required number for Quest 2 | Required number for Quest 3 | Required number for Quest 4 | Required number for Quest 5 |
| ----------------- | ------------------- | ------------------ | ------ | --- | ---- |
| 5 | 2 | 3 | 2 | 3 | 3 | 
| 6 | 2 | 3 | 4 | 3 | 4 |
| 7 | 2 | 3 | 3 | 4 (2 fails required) | 4 |
| 8 | 3 | 4 | 4 | 5 (2 fails required) | 5 |
| 9 | 3 | 4 | 4 | 5 (2 fails required) | 5 |
| 10 | 3 | 4 | 4 | 5 (2 fails required) | 5 |

The first team to achieve 3 quests towards their alignment wins. However, if the good guys win, the Assassin is given the option to choose who Merlin was. If they are correct, evil wins. Otherwise, the good guys are victorious.

Good luck, and have fun deceiving your friends!

# Implementation
View.js uses javascript and socket.io to implement the main aspects of the game.  These functions act as the “rules” to the game.  Some basic methods include checking whether a majority of the votes either passed or failed a mission.  Other functions handle modal’s and when they are to be displayed or hidden.

Index.html and the CSS is used to create a user friendly UI and overall experience.  The traditional game board was reimagined when adapting it for the web.  The 5 circles at the top show the success of each mission and how many players are to go on the mission.  The Quest bar below displays the current mission and the player can select on pass missions to view the results.  Finally, in the bottom left there is the player card which displays your current identity and any other information that comes with being that character.

There is a UML diagram and SQL statements for a potential database that can store user data such as their username and password.  This database did not make this release but is planned to be included in a future release.

# Team Contributions

### Alex Brooks

### Austin Sizemore

### Ian Smith

### Jacob Krajewski

### Joey Frank

### Nathan Schlechte
