function updateMapAfterEdition(map, socket, successCallback){
	socket.onmessage = function(event){
		if (event.data.startsWith(ServerResponse.MapUpdated)){ 
			successCallback();
		}		
	}
	socket.send(EditorRequest.UpdateMap+"|"+JSON.stringify(map));
}

function getClassList(socket, successCallback, errorCallBack){
	socket.onmessage = function(event){
		if (event.data.startsWith(ServerResponse.ClassList)){ 
			responseData = event.data.substring(event.data.indexOf('|')+1);  	        
			successCallback(JSON.parse(responseData));		
		}		
		else{
			errorCallBack();
		}
	}
	socket.send(EditorRequest.ClassList);
}

function createClass(name, health, resource, spriteName, socket, successCallback, errorCallBack){
	socket.onmessage = function(event){
		if (event.data.startsWith(ServerResponse.ClassCreated)){ 
			//responseData = event.data.substring(event.data.indexOf('|')+1);  	        
			successCallback();		
		}		
		else{
			errorCallBack();
		}
	}
	socket.send(EditorRequest.CreateClass+"|"+name+"|"+health+"|"+resource+"|"+spriteName);
}

function updateClass(id, name, health, resource, spriteName, socket, successCallback, errorCallBack){
	socket.onmessage = function(event){
		if (event.data.startsWith(ServerResponse.ClassUpdated)){         
			successCallback();		
		}		
		else{
			errorCallBack();
		}
	}
	socket.send(EditorRequest.UpdateClass+"|"+id+"|"+name+"|"+health+"|"+resource+"|"+spriteName);
}