app.controller('loginController', function($scope, $location, $rootScope, $timeout) {
	$rootScope.loginData = {};
	$rootScope.loginData.serverAddress = "127.0.0.1:51182";

	$rootScope.sessionKey = null; //TODO:Set to login data
	$rootScope.gameServerSocket = null; 

	$scope.openSocket = function(){
		//TODO: Change to wss
		$rootScope.gameServerSocket = new WebSocket('ws://'+$rootScope.loginData.serverAddress);	

		$rootScope.gameServerSocket.onopen = function(event){
			//TODO: Send credentials and validate to obtain key
			$scope.openningConnection = false;			

			//Sets on close action
		    $rootScope.gameServerSocket.onclose = function(event){
		    	displayErrorAlert("Lost connection with the server. Please try restarting the editor");
		    	//TODO: Reconnect protocool   	
		    }
			$location.path("/menu");
			$scope.$apply();
			//$rootScope.apply();
		}

	    $rootScope.gameServerSocket.onerror = function(event){
	    	displayErrorAlert("Couldn't establish connection with the server on the given address");
	    	$scope.openningConnection = false;
    		$scope.$apply();    	
	    }
	}

	$scope.doLogin = function(){
		
		if (!$rootScope.loginData.serverAddress || !$rootScope.loginData.accountUsername || !$rootScope.loginData.accountPassword){
			displayErrorAlert("Please fill out the fields in order to login");
			return null;
		}
		if ($rootScope.loginData.accountUsername!="seed" || $rootScope.loginData.accountPassword!="seed"){
			displayErrorAlert("Wrong credentials. Please try again");
			return null;			
		}
		
		$scope.openningConnection = true;
		$scope.openSocket($location);
	}	

});