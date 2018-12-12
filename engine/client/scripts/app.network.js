var loginServerSocket = null;
var gameServerSocket = null;
var authServerAddress = "ws://localhost:50182";
var gameServerAddress = "ws://localhost:51182";

var ClientRequest = {
	Login : "client.login", //Must include username and password
	CreateAccount : "client.create.account", //username|password|email
	EstablishConnection : "client.socket.auth", //username|token
	//############ Messages below required an authed connection
	GetAccountInfo : "client.request.account",
	GetAvaibleClasses : "client.request.classes",
	CreateCharacter : "client.character.create", //must include name and class id
	DeleteCharacter : "client.character.delete", //must include char id
	SelectCharacter : "client.character.select", //must include char id
	//################ Messages below required a gaming socket
	ClientChatMessage : "client.chat.message", //must include the message
	/**** MOVEMENT ****/
	ClientCharMove : "client.char.move", //must include the direction 0-8 >> nort, nort-right, right...etc
	ClientCharStop : "client.char.stop",
	ClientCharOnMap : "client.map.chonmap",
	CastSpell : "client.cast.spell1", //stops movement
	CastSpell2 : "client.cast.spell2",
	CastSpell3 : "client.cast.spell3",
}

var ServerResponse = {
	LoginSuccess : "server.login.ok", //Includes auth token
	LoginError : "server.login.notok",//Includes error message
	AccountCreated : "server.account.created",
	CreateAccountFailed : "server.create.account.failed",
	ConnectionEstablished : "server.socket.ok",
	ConnectionError : "server.socket.error",
	//############ Messages below required an authed connection
	AccountInfo : "server.account.info",
	ClassesInfo : "server.game.classes",
	CharacterCreated : "server.character.created",
	CharacterErrror : "server.character.notcreated",
	CharacterDeleted : "server.character.deleted",
	CharacterSelected : "server.character.selected", //This upgrades the socket
	CharacterSelectionError : "server.character.selectionerror",
	//################ Messages below required a gaming socket
	ChatMessage : "server.chat.message", //includes chat message
	CharPosition : "scp", //includes x and y
	CharJoinedMap : "server.map.chjoin", //includes char info
	CharsOnMap : "server.map.chonmap", //includes char info
	CharResourceValue : "scr",
	MapNewProjectile : "mnp",
	ProjectilePosition : "spp",
	ProjectileDestroyed : "spd",
	CharLeftMap : "server.character.left", //includes character id
	CharHealthValue : "scv",
	CharacterDead : "scd",
	CharacterShielded : "csh",
	CharacterLostShield : "cnsh",
}

function loginRequest(username, password, successCallback, errorCallback){
	if (loginServerSocket==null || loginServerSocket.readyState == 3){
		loginServerSocket = new WebSocket(authServerAddress);   
		loginServerSocket.onerror = () =>{
			errorCallback("Cannot establish connection with the server");			
		}
	}   

	loginServerSocket.onmessage = function(event){
		if (event.data.startsWith(ServerResponse.LoginSuccess)){ 
			token = event.data.substring(event.data.indexOf('|')+1);
			loginServerSocket.close();
			successCallback(token);			
		}		
		else{
			loginServerSocket.close();
			errorCallback("Wrong username/password");			
		}
	}

	loginServerSocket.onopen = function(event){       
	    loginServerSocket.send(ClientRequest.Login+"|"+username+"|"+password);
    }	
}

function createAccountRequest(username, password, email,successCallback, errorCallback){
	if (loginServerSocket==null || loginServerSocket.readyState == 3){
		loginServerSocket = new WebSocket(authServerAddress);   
		loginServerSocket.onerror = () =>{
			errorCallback("Cannot establish connection with the server");			
		}
	}   

	loginServerSocket.onmessage = function(event){
		if (event.data.startsWith(ServerResponse.AccountCreated)){ 
			//loginServerSocket.close();
			loginServerSocket.close();
			successCallback();			
		}		
		else{			
			loginServerSocket.close();
			errorCallback();			
		}
	}

	loginServerSocket.onopen = function(event){       
	    loginServerSocket.send(ClientRequest.CreateAccount+"|"+username+"|"+password+"|"+email);
    }	
}

function openGameSocket(username, token, successCallback, errorCallback){
	if (gameServerSocket==null || gameServerSocket.readyState == 3){
		gameServerSocket = new WebSocket(gameServerAddress);   
		gameServerSocket.onerror = () =>{
			errorCallback("Cannot establish connection with the GAME server");			
		}
	}   

	/*gameServerSocket.onclose = () => {
		displayErrorAlert("Lost connection from the server. Try reloading");
	}*/

	gameServerSocket.onmessage = function(event){
		console.log("GOT FROM SERVER:"+event.data);
		if (event.data.startsWith(ServerResponse.ConnectionEstablished)){ 			
			//gameServerSocket.close();
			successCallback();			
		}		
		else{			
			gameServerSocket.close();
			errorCallback();			
		}
	}

	gameServerSocket.onopen = function(event){       
	    gameServerSocket.send(ClientRequest.EstablishConnection+"|"+username+"|"+token);
    }	
}

function requestAccountInfo(successCallback, errorCallback){
	gameServerSocket.onmessage = function(event){		
		if (event.data.startsWith(ServerResponse.AccountInfo)){ 	
			responseData = event.data.substring(event.data.indexOf('|')+1);  	        
			successCallback(JSON.parse(responseData));			
		}		
		else{					
			errorCallback();			
		}
	}
	gameServerSocket.send(ClientRequest.GetAccountInfo);	
}

function requestClasses(successCallback, errorCallback){
	gameServerSocket.onmessage = function(event){		
		if (event.data.startsWith(ServerResponse.ClassesInfo)){ 	
			responseData = event.data.substring(event.data.indexOf('|')+1);  	        
			successCallback(JSON.parse(responseData));			
		}		
		else{					
			errorCallback();			
		}
	}
	gameServerSocket.send(ClientRequest.GetAvaibleClasses);
}

function createCharacter(name, classId, successCallback, errorCallback){
	gameServerSocket.onmessage = function(event){		
		if (event.data.startsWith(ServerResponse.CharacterCreated)){			 				        
			successCallback();			
		}		
		else{					
			errorCallback();			
		}
	}
	gameServerSocket.send(ClientRequest.CreateCharacter+"|"+name+"|"+classId);
}

function deleteCharacterR(charId, successCallback, errorCallback){
	gameServerSocket.onmessage = function(event){		
		if (event.data.startsWith(ServerResponse.CharacterDeleted)){			 				        
			successCallback();			
		}		
		else{					
			errorCallback();			
		}
	}
	gameServerSocket.send(ClientRequest.DeleteCharacter+"|"+charId);
}


function selectGameCharacter(charId, successCallback, errorCallback){
	gameServerSocket.onmessage = function(event){		
		if (event.data.startsWith(ServerResponse.CharacterSelected)){			 				        
			successCallback();			
		}		
		else{					
			errorCallback();			
		}
	}
	gameServerSocket.send(ClientRequest.SelectCharacter+"|"+charId);
}

function sendChatMessage(chatMessage){
	gameServerSocket.send(ClientRequest.ClientChatMessage+"|"+chatMessage);
}




function setupGameSocketListener($scope, $rootScope){
	gameServerSocket.onmessage = function(event){
		if(event.data.startsWith(ServerResponse.CharPosition)){					
			var params = event.data.split("|");
			for(var i=1; i<params.length; i+=4){
				$scope.moveCharacter(params[i], parseInt(params[i+1]), parseInt(params[i+2]), params[i+3]);
			}			
			//$scope.moveCharacter(params[1], parseInt(params[2]), parseInt(params[3]));
		}
		else if (event.data.startsWith(ServerResponse.ChatMessage)){			 
			//console.log(event.data.substring(event.data.indexOf('|')+1));			        
			$scope.addChatLine(event.data.substring(event.data.indexOf('|')+1));		
		}				
		else if(event.data.startsWith(ServerResponse.CharJoinedMap)){
			var responseData = event.data.substring(event.data.indexOf('|')+1);  
			//Adds new character	        
			$scope.addNewCharacter(JSON.parse(responseData), true);			
		}
		else if(event.data.startsWith(ServerResponse.CharsOnMap)){			
			var responseData = event.data.substring(event.data.indexOf('|')+1);  
			//Adds new character but doesnt notify	        
			$scope.addNewCharacter(JSON.parse(responseData), false);			
		}
		else if(event.data.startsWith(ServerResponse.CharResourceValue)){	
			//console.log(event.data);	 ///Resource update	
			var responseData = event.data.substring(event.data.indexOf('|')+1);          
			$scope.updateResource(responseData); 		
		}
		else if(event.data.startsWith(ServerResponse.CharHealthValue)){	
			//console.log(event.data);	 ///Health update	
			var responseData = event.data.substring(event.data.indexOf('|')+1);          
			$scope.updateHealth(responseData); 		
		}
		else if(event.data.startsWith(ServerResponse.MapNewProjectile)){		
			//console.log(event.data);	
			var responseData = event.data.substring(event.data.indexOf('|')+1);          
			$scope.addProjectile(JSON.parse(responseData)); 		
		}
		else if(event.data.startsWith(ServerResponse.ProjectilePosition)){	
			//console.log(event.data);		
			var params = event.data.split("|");
			$scope.moveProjectile(params[1], parseInt(params[2]), parseInt(params[3]));		
		}
		else if(event.data.startsWith(ServerResponse.ProjectileDestroyed)){	
			//console.log(event.data);		
			var params = event.data.split("|");
			$scope.removeProjectile(params[1]);		
		}
		else if(event.data.startsWith(ServerResponse.CharLeftMap)){	
			//console.log(event.data);		
			var params = event.data.split("|");
			$scope.removeCharacter(params[1]);		
		}
		else if(event.data.startsWith(ServerResponse.CharacterDead)){		
			var params = event.data.split("|");
			$scope.characterDead();	
		}
		else if(event.data.startsWith(ServerResponse.CharacterShielded)){		
			var params = event.data.split("|");
			$scope.shieldCharacter(params[1]);	
		}
		else if(event.data.startsWith(ServerResponse.CharacterLostShield)){		
			var params = event.data.split("|");
			$scope.unShieldCharacter(params[1]);	
		}
		else{
			console.log("Not handled server command");
			console.log(event.data);			
		}		
	}
}






function closeSockets(){
	if (gameServerSocket!=undefined){
		gameServerSocket.close();
	}
	if (loginServerSocket!=undefined){
		loginServerSocket.close();
	}	
}




