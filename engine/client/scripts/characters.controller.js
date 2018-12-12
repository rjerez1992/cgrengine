app.controller('charactersController', function($scope, $location, $rootScope, $timeout) {

	if ($rootScope.currentAccount==null){
		$location.path("/");
	}

	$rootScope.selectedCharacter = undefined;

	$scope.fetchingData = true;
	$scope.creatingCharacter = false;
	$scope.classes = false;
	$scope.selectedClass = undefined;
	$scope.classImage = undefined;


	$scope.characterCreation = {};
	$scope.characterCreation.charName = "";

	//BACKGROUND STUFF
	var GameGraphicContext = BuildDisplayFrame();
	PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

	$scope.stagePositionX = GameGraphicContext.screen.width/2;
	$scope.stagePositionY = GameGraphicContext.screen.height/2;

	const background = PIXI.Sprite.fromImage('sprites/ui/background.png');
	background.x = 0;
	background.y = 0;
	background.height = GameGraphicContext.screen.height;
	background.width = GameGraphicContext.screen.width;	
	GameGraphicContext.stage.addChild(background);

	//Allows to resize the pixiJS canvas
	window.onresize = function (event){    
		var w = window.innerWidth;  
	  	var h = window.innerHeight;//this part resizes the canvas but keeps ratio the same  
	    GameGraphicContext.renderer.view.style.width = w + "px"; 
	   	GameGraphicContext.renderer.view.style.height = h + "px";    //this part adjusts the ratio: 
	  	GameGraphicContext.renderer.resize(w,h);	  	
  	}

	$scope.selectCharacter = function(char){
		$rootScope.selectedCharacter = char;
		console.log("selected char id "+char.CharacterId);
		$location.path("/game");
	}

	$scope.createCharacter = function(){
		console.log("creating character");
		$scope.creatingCharacter = true;
	}

	$scope.changeClass = function(newClass){
		console.log("class changed");
		$scope.selectedClass = newClass;	
		$scope.classImage = "sprites/chars/"+$scope.selectedClass.SpriteName+"_front0.png";
		console.log($scope.selectedClass);	
	}

	$scope.getCharImageRoute = function(name){
		return "sprites/chars/"+name+"_front0.png";
	}

	$scope.cancelCreateaCharacter = function(){
		console.log("character creation canceled");
		$scope.creatingCharacter = false;
		//Clean out fields?
	}

	$scope.signOut = function(){
		console.log("Login out");
		$rootScope.currentAccount=null;
		closeSockets();
		$location.path("/");		
	}

	$scope.updateAccountDetails = function(){
		requestAccountInfo((account)=>{
			$scope.creatingCharacter = false;			
			$rootScope.currentAccount = account;
			$scope.$apply();
			$rootScope.$apply();					
		}, ()=>{					
			displayErrorAlert("Couldn't fetch account info");
		});
	}

	$scope.createCharacterSubmit = function(){
		if ($scope.createCharacter.charName == "" || $scope.createCharacter.charName==undefined){
			displayErrorAlert("Please insert your character name");			
		}		
		else{
			createCharacter($scope.createCharacter.charName, $scope.selectedClass.ClassId, ()=>{
				displayInfoAlert("Character created");
				$scope.updateAccountDetails();
				
			}, ()=>{
				displayErrorAlert("Coudln't create character");	
			});
		}
	}

	$scope.deleteCharacter = function(char){
		deleteCharacterR(char.CharacterId, ()=>{	
			displayInfoAlert("Character deleted");			
			var i = $rootScope.currentAccount.Characters.indexOf(char);
			if(i != -1) {
				$rootScope.currentAccount.Characters.splice(i, 1);
				$rootScope.$apply();
			}
			
		}, ()=>{
			displayErrorAlert("Couldn't delete character");
		});
	}



	
	openGameSocket($rootScope.currentAccount.username, $rootScope.currentAccount.token, ()=>{
		console.log("Requesting account info");
		requestAccountInfo((account)=>{
			$rootScope.currentAccount = account;
			
			requestClasses((classes)=>{
				//Classes sucess				
				$scope.classes = classes;
				
				$scope.selectedClass = classes[0];
				$scope.classImage = "sprites/chars/"+$scope.selectedClass.SpriteName+"_front0.png";
		
				$scope.fetchingData = false;
				$scope.$apply();

			}, ()=>{
				displayErrorAlert("Couldnt load classes");
				$scope.signOut();
				$scope.$apply();
			});
		}, ()=>{
			//Error callback
			displayErrorAlert("couldn't get account info");
			
		});
	}, (e)=>{
		displayErrorAlertWithCallback("Couldn't auth socket", ()=>{
			$scope.signOut();
			$scope.$apply();
		});
		
	}); 


});