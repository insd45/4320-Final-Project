DROP TABLE IF EXISTS `Lobby`,`User`,`Player`,`Host`;

CREATE TABLE `Lobby`(
	`LobbyId` VARCHAR(255) UNIQUE,
	PRIMARY KEY(`LobbyId`),
	`LobbyNum` INT,
	`HostId` VARCHAR(255) UNIQUE,
	FOREIGN KEY(`HostId`) REFERENCES `User` (`UserId`)
);


CREATE TABLE `User`(
	`UserId` VARCHAR(255) UNIQUE,
	PRIMARY KEY(`UserId`),
	`UserName` VARCHAR(255) UNIQUE,
	`LobbyId` VARCHAR(255) UNIQUE,
	FOREIGN KEY(`LobbyId`) REFERENCES `Lobby` (`LobbyId`),
	`CHARACTER` VARCHAR(255),
	`Password` VARCHAR(255)
);


CREATE TABLE `Player`(
	`PlayerId` VARCHAR(255) UNIQUE,
	FOREIGN KEY(`PlayerId`) REFERENCES `User` (`UserId`)
);


CREATE TABLE `Host`(
	`HostId` VARCHAR(255) UNIQUE,
	FOREIGN KEY(`HostId`) REFERENCES `User` (`UserId`)
);