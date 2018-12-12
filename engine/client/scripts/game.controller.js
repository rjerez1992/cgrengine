app.controller('gameController', function($scope, $location, $rootScope, $timeout, $interval, $log) {
	/*** Basic preload ***/
	var GameGraphicContext = BuildDisplayFrame();
	PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

	/*** Graphics Groups ***/
	var floorGroup = new PIXI.display.Group(0, false);
	var groundGroup = new PIXI.display.Group(1, false);
	var charactersGroup = new PIXI.display.Group(2, true);
	charactersGroup.on('sort', function (sprite) {
	    sprite.zOrder = -sprite.y;
	});

	var wallsGroup = new PIXI.display.Group(3, false);
	var skyGroup = new PIXI.display.Group(4, false);
	
	GameGraphicContext.stage = new PIXI.display.Stage();
	GameGraphicContext.stage.addChild(new PIXI.display.Layer(floorGroup));
	GameGraphicContext.stage.addChild(new PIXI.display.Layer(groundGroup));
	GameGraphicContext.stage.addChild(new PIXI.display.Layer(charactersGroup));
	GameGraphicContext.stage.addChild(new PIXI.display.Layer(wallsGroup));
	GameGraphicContext.stage.addChild(new PIXI.display.Layer(skyGroup));

	GameGraphicContext.stage.group.enableSort = true;	

	//////console.log(PIXI.tilemap.TileRenderer);
	PIXI.tilemap.TileRenderer.SCALE_MODE = PIXI.SCALE_MODES.NEAREST﻿;
	//////console.log(PIXI.tilemap.TileRenderer);


	/*** Variables ***/
	$scope.gameSocketSet = false;
	$scope.messageModel = {};
	$scope.messageModel.message = "";
	var otherCharactersInMap = {};
	$scope.projectilesInMap = {};
	$scope.currentMovementDir = 0;
	$scope.currentCharAnimation = null;
	$scope.characterAnimations = {};
	$scope.titleText = "";
	$scope.isMenuOpen = false;
	$scope.currentDrawingLayer = 0;
	$scope.movementCount = 0;

	/*** Init and checks ***/
	if ($rootScope.selectedCharacter == undefined || $rootScope.currentAccount==undefined){
		$location.path("/");
	}

	selectGameCharacter($rootScope.selectedCharacter.CharacterId, ()=>{
		setupGameSocketListener($scope, $rootScope);
		$scope.gameSocketSet = true;
		////console.log("We are all setup with character");		
	}, ()=>{
		displayErrorAlert("Couldn't select the character");
	});

	/*** Chat ***/
	$scope.chatText = "Client: Welcome to Example Game.";

	$scope.sendChatMessage = function(){
		if ($scope.messageModel.message=="" || $scope.messageModel.message==undefined){
			return;
		}
		sendChatMessage($scope.messageModel.message);
		$scope.messageModel.message = "";
	}

	var calculatedMovementValue = window.innerWidth/2 - ((5*GameGraphicContext.stage.width)/320);
	var calculatedMovementValueY = window.innerHeight/2 - ((5*GameGraphicContext.stage.height)/320);

	$scope.moveMainCharacter = function(newx, newy){
		//////console.log("Moving character");
		var value1 = (newx*GameGraphicContext.stage.width)/320;
		var value2 = (newy*GameGraphicContext.stage.height)/320;
		GameGraphicContext.stage.x = -value1;
		GameGraphicContext.stage.y = -value2;
		GameGraphicContext.stage.x+=calculatedMovementValue;
		GameGraphicContext.stage.y += calculatedMovementValueY;
		$scope.currentCharAnimation.x = value1;
		$scope.currentCharAnimation.y = value2;
		//$scope.currentCharAnimation.zOrder = value2+10;
	}

	$scope.moveCharacter = function(id, newx, newy, dir){			
		if (id == $scope.selectedCharacter.CharacterId){
			$scope.moveMainCharacter(newx, newy);			
		}		
		else{
			$scope.updateMoveCharacter(id, newx, newy, dir);
		}
	}

	$scope.addNewCharacter = function(chr, flag){
		if(flag){
			$scope.addChatLine("Player "+chr.Name+" joined!");		
		}
		else{
			$scope.addChatLine("Player "+chr.Name+" already on map!");		
		}		
		otherCharactersInMap[chr.CharacterId] = drawOtherCharacter(chr.CoordX, chr.CoordY, chr.Class.SpriteName);
		GameGraphicContext.stage.addChild(otherCharactersInMap[chr.CharacterId].currentAnimation);
	}

	$scope.removeCharacter = function(chrId){		
		GameGraphicContext.stage.removeChild(otherCharactersInMap[chrId].currentAnimation);
		delete otherCharactersInMap[chr.CharacterId];
	}
	
	$scope.updateMoveCharacter = function(chrId, newx, newy, dir){		
		if (otherCharactersInMap[chrId]!=null){
		
			if (otherCharactersInMap[chrId].lastAnim != dir){
				changeOtherCharacterAnimation(otherCharactersInMap[chrId], dir);
				otherCharactersInMap[chrId].lastAnim = dir;
			}

			otherCharactersInMap[chrId].currentAnimation.x = (newx*GameGraphicContext.stage.width)/320;
			otherCharactersInMap[chrId].currentAnimation.y = (newy*GameGraphicContext.stage.height)/320;
			//otherCharactersInMap[chrId].zOrder = value2+10;
		}		
	}

	$scope.characterDead = function(){
		displayErrorAlertWithCallback("You died!", ()=>{
			$scope.doLogout();
		});		
	}

	$scope.addChatLine = function(line){
		//////console.log("new chat line!");
		$scope.chatText +="\n"+line;
		$scope.$apply();
		//Scrolls to bottom of the chatbox
		var element = document.getElementById("gameChatBox");
	    element.scrollTop = element.scrollHeight;
	}
	
	$scope.toggleMenu = function(){
		$scope.isMenuOpen = !$scope.isMenuOpen;
	}

	$scope.doLogout = function(){
		////console.log("Login out");
		$rootScope.currentAccount=null;
		closeSockets();
		$location.path("/");
	}



	//Allows to resize the pixiJS canvas
	window.onresize = function (event){    
		var w = window.innerWidth;  
	  	var h = window.innerHeight;//this part resizes the canvas but keeps ratio the same  
	    GameGraphicContext.renderer.view.style.width = w + "px"; 
	   	GameGraphicContext.renderer.view.style.height = h + "px";    //this part adjusts the ratio: 
	  	GameGraphicContext.renderer.resize(w,h);	  
  	}	

  	function  LoadMaps(){	
	  var mapGameSocket = new WebSocket(gameServerAddress);
	    if (!mapGameSocket){
	      alert("Cannot connect to server. Please try later.");
	    }	    
	    mapGameSocket.onopen = function(event){       
	        mapGameSocket.send("game.currentmap.request");
	    }
	    mapGameSocket.onmessage = function(event){ 
	        if (event.data.startsWith("currentmap.data")){
	          mapDataJson = event.data.substring(event.data.indexOf('|')+1);
	          arrayData = JSON.parse(mapDataJson);	      
	          RenderMaps(arrayData);
	        }
	        else{
	          alert("Wrong response from service");
	          ////console.log("Could not connect");            
	        }	   
	    }
	}

	function RenderMaps(maps){
		RenderSpecificMap(/*$scope.*/maps[0]);	
	}

	var textureCheck = {};	
	var textureMap = {};
	var textureCompendium = [];

	var tilemapFloor = new PIXI.tilemap.CompositeRectTileLayer(0, [], true);	 
	var tilemapWalls = new PIXI.tilemap.CompositeRectTileLayer(0, [], true);	 
	var tilemapRoof = new PIXI.tilemap.CompositeRectTileLayer(0, [], true);	 
	var tilemapSky = new PIXI.tilemap.CompositeRectTileLayer(0, [], true);	 

	//tilemap.parentGroup = skyGroup;

	function RenderSpecificMap(map){
		  $scope.titleText = map.Name;	
		  mapLayers = JSON.parse(map._layers);
		  $scope.blockLayer = undefined;
		  var firstPass = true; 

		  //Loads the textures needed
		  for(var layer in mapLayers){
				if (firstPass){ firstPass = false; continue;}			
				LoadTextures(mapLayers[layer]);	 	  		 	  	 	  	
		}

		//Compendium has everything
		////console.log();

		if (Object.keys(PIXI.loader.resources).length != 0){
			////console.log("Already loaded");
			for(var loadedItem in PIXI.loader.resources){
			  		var prefix = loadedItem.split("/");
			  		var vaxue = prefix[2].split(".")[0];	  		
					textureMap[vaxue]=PIXI.loader.resources[loadedItem].texture;
			  	}

		  		firstPass = true;
				for(var layer in mapLayers){
					if (firstPass){ firstPass = false; continue;}		
					$scope.currentDrawingLayer++;
					DisplayMap(mapLayers[layer], textureMap);	 	  		 	  	 	  	
				}

				var xtileHeight = ComputeTileHeight(16);
				var xtileWidth = ComputeTileWidth($scope.horizontalTilesQuantity);

				////console.log("TH: "+xtileHeight+" - TW: "+xtileWidth);

				//hack to make the container be the size of the map. Yep. Fucking hack.
				var spritex = new PIXI.Sprite(PIXI.Texture.EMPTY);
				spritex.height = 32*xtileHeight;
			    spritex.width = 32*xtileWidth;
			    spritex.x = 0;
			    spritex.y = 0;
			    //spritex.parentGroup = charactersGroup;

			    GameGraphicContext.stage.addChild(spritex);
			    tilemapFloor.scale.x = xtileWidth/32;
			    tilemapFloor.scale.y = xtileHeight/32;

			    tilemapWalls.scale.x = xtileWidth/32;
			    tilemapWalls.scale.y = xtileHeight/32;

			    tilemapRoof.scale.x = xtileWidth/32;
			    tilemapRoof.scale.y = xtileHeight/32;

			    tilemapSky.scale.x = xtileWidth/32;
			    tilemapSky.scale.y = xtileHeight/32;


			    tilemapFloor.parentGroup = floorGroup;
			    tilemapWalls.parentGroup = groundGroup;
			    tilemapRoof.parentGroup = wallsGroup;
			    tilemapSky.parentGroup = skyGroup;

				var mapContainer = new PIXI.Container();		
				mapContainer.addChild(tilemapFloor);
				mapContainer.addChild(tilemapWalls);
				mapContainer.addChild(tilemapRoof);
				mapContainer.addChild(tilemapSky);
				GameGraphicContext.stage.addChild(mapContainer);

				drawCharacter();
			  	gameServerSocket.send("client.map.chonmap");
		}
		else{
			PIXI.loader
			  .add(textureCompendium)
			  .load(()=>{
			  	for(var loadedItem in PIXI.loader.resources){
			  		var prefix = loadedItem.split("/");
			  		var vaxue = prefix[2].split(".")[0];	  		
					textureMap[vaxue]=PIXI.loader.resources[loadedItem].texture;
			  	}

		  		firstPass = true;
				for(var layer in mapLayers){
					if (firstPass){ firstPass = false; continue;}		
					$scope.currentDrawingLayer++;
					DisplayMap(mapLayers[layer], textureMap);	 	  		 	  	 	  	
				}

				var xtileHeight = ComputeTileHeight(16);
				var xtileWidth = ComputeTileWidth($scope.horizontalTilesQuantity);

				////console.log("TH: "+xtileHeight+" - TW: "+xtileWidth);

				//hack to make the container be the size of the map. Yep. Fucking hack.
				var spritex = new PIXI.Sprite(PIXI.Texture.EMPTY);
				spritex.height = 32*xtileHeight;
			    spritex.width = 32*xtileWidth;
			    spritex.x = 0;
			    spritex.y = 0;
			    //spritex.parentGroup = charactersGroup;

			    GameGraphicContext.stage.addChild(spritex);
			    tilemapFloor.scale.x = xtileWidth/32;
			    tilemapFloor.scale.y = xtileHeight/32;

			    tilemapWalls.scale.x = xtileWidth/32;
			    tilemapWalls.scale.y = xtileHeight/32;

			    tilemapRoof.scale.x = xtileWidth/32;
			    tilemapRoof.scale.y = xtileHeight/32;

			    tilemapSky.scale.x = xtileWidth/32;
			    tilemapSky.scale.y = xtileHeight/32;

		

			    tilemapFloor.parentGroup = floorGroup;
			    tilemapWalls.parentGroup = groundGroup;
			    tilemapRoof.parentGroup = wallsGroup;
			    tilemapSky.parentGroup = skyGroup;

				var mapContainer = new PIXI.Container();		
				mapContainer.addChild(tilemapFloor);
				mapContainer.addChild(tilemapWalls);
				mapContainer.addChild(tilemapRoof);
				mapContainer.addChild(tilemapSky);
				GameGraphicContext.stage.addChild(mapContainer);

				drawCharacter();
			  	gameServerSocket.send("client.map.chonmap"); 
		  });
		}		
	}

	function LoadTextures(mapData){
	  //const loader = new PIXI.loaders.Loader();

	  for(i=0; i<Object.keys(mapData).length; i++){	  
	    for(j=0; j<Object.keys(mapData[i]).length; j++){  
	    	if (textureCheck[mapData[i][j]]==null){
	    		textureCompendium.push('sprites/maps/'+mapData[i][j]+'.png');
    			//loader.add(mapData[i][j]+"", 'sprites/maps/'+mapData[i][j]+'.png');    			
    			textureCheck[mapData[i][j]] = true;
	    	}	    	
	
	    }
	  }


	}

	

	function DisplayMap(mapData, mapTextures){

		qh = Object.keys(mapData).length;
		qv = Object.keys(mapData[0]).length;

		$scope.horizontalTilesQuantity = qh;
		$scope.verticalTilesQuantity = qv;

		tileHeight = ComputeTileHeight(16);
		tileWidth = ComputeTileWidth(qh);
    	
		for(i=0; i<qh; i++){	  
			for(j=0; j<qv; j++){  
				if (mapData[i][j]== 0){
					continue;
				}		
				switch ($scope.currentDrawingLayer) {
			      	case 1:
			      		tilemapFloor.addFrame(mapTextures[mapData[i][j]], j*32, i*32);	      		
			      		break;
		      		case 2:
		      			tilemapWalls.addFrame(mapTextures[mapData[i][j]], j*32, i*32);
		      			break;
		  			case 3:
		  				tilemapRoof.addFrame(mapTextures[mapData[i][j]], j*32, i*32);
		  				break;
					case 4:
						tilemapSky.addFrame(mapTextures[mapData[i][j]], j*32, i*32);
						break;
			      	default:
			      		////console.log("Error not handled "+$scope.currentDrawingLayer);
			      		break;
			      }	    										      
			}
		}
		
	
	}

	function ComputeTileHeight(vQuantity){
	  return GameGraphicContext.screen.height/vQuantity;
	}

	function ComputeTileWidth(hQuantity){
	  return GameGraphicContext.screen.width/hQuantity;
	}


	//Load character
	function drawCharacter(){
		var chrSpriteName = $rootScope.selectedCharacter.Class.SpriteName;
		var charTextures = loadCharTextures(chrSpriteName);

    	$scope.characterAnimations.back = new PIXI.extras.AnimatedSprite(charTextures.back);
    	$scope.characterAnimations.side = new PIXI.extras.AnimatedSprite(charTextures.side);
    	$scope.characterAnimations.front = new PIXI.extras.AnimatedSprite(charTextures.front);
    	$scope.characterAnimations.sideL = new PIXI.extras.AnimatedSprite(charTextures.side);

    	$scope.setupCharacterAnimationPosition($scope.characterAnimations.back);
    	$scope.setupCharacterAnimationPosition($scope.characterAnimations.side);
    	$scope.setupCharacterAnimationPosition($scope.characterAnimations.front);
    	$scope.setupCharacterAnimationPosition($scope.characterAnimations.sideL);

    	$scope.characterAnimations.sideL.scale.x *= -1;
    	$scope.characterAnimations.sideL.anchor.x = 1;

    	$scope.currentCharAnimation = $scope.characterAnimations.front;
    	GameGraphicContext.stage.addChild($scope.currentCharAnimation);
	}

	function loadCharTextures(chrSpriteName){
		var charTextures = {
			front : [	PIXI.Texture.fromImage('sprites/chars/'+ chrSpriteName +'_front0.png'), 
						PIXI.Texture.fromImage('sprites/chars/'+ chrSpriteName +'_front1.png'), 
						PIXI.Texture.fromImage('sprites/chars/'+ chrSpriteName +'_front2.png')],
			side : [	PIXI.Texture.fromImage('sprites/chars/'+ chrSpriteName +'_side0.png'), 
						PIXI.Texture.fromImage('sprites/chars/'+ chrSpriteName +'_side1.png'), 
						PIXI.Texture.fromImage('sprites/chars/'+ chrSpriteName +'_side2.png')],
			back : [	PIXI.Texture.fromImage('sprites/chars/'+ chrSpriteName +'_back0.png'), 
						PIXI.Texture.fromImage('sprites/chars/'+ chrSpriteName +'_back1.png'), 
						PIXI.Texture.fromImage('sprites/chars/'+ chrSpriteName +'_back2.png')]
		}
		return charTextures;
	}

	function loadShieldAnimation(mirror){
		var sprites = [	PIXI.Texture.fromImage('sprites/spells/2_spell1.png'), 
						PIXI.Texture.fromImage('sprites/spells/2_spell2.png'), 
						PIXI.Texture.fromImage('sprites/spells/2_spell3.png')];
		var anim = new PIXI.extras.AnimatedSprite(sprites);
		anim.animationSpeed = 0.2;
		anim.height = ComputeTileHeight(16);
		anim.width = ComputeTileWidth($scope.horizontalTilesQuantity);
		anim.anchor.set(0.25);
		if (mirror){
			anim.scale.x *= -1;
    	
		}	
		
		anim.play();
		return anim;
	}

	$scope.setupCharacterAnimationPosition = function(animation){
		//animation.zOrder = 10; 			
		animation.animationSpeed = 0.2;
    	animation.height = ComputeTileHeight(16);
    	animation.width = ComputeTileWidth($scope.horizontalTilesQuantity);
    	animation.x = GameGraphicContext.screen.width/2;
		animation.y = GameGraphicContext.screen.height/2;	
		animation.x -= window.innerWidth/2;
		animation.y -=  window.innerHeight/2;	
		animation.parentGroup = charactersGroup;  	
	}

	$scope.basicAnimationSetup = function(animation, chrx, chry){
		animation.animationSpeed = 0.2;
    	animation.height = ComputeTileHeight(16);
    	animation.width = ComputeTileWidth($scope.horizontalTilesQuantity);
    	animation.x = (chrx*GameGraphicContext.stage.width)/320;
		animation.y = (chry*GameGraphicContext.stage.height)/320;
		animation.parentGroup = charactersGroup; 
	}

	function drawOtherCharacter(chX, chY, spriteName){
		var newCharTextures = loadCharTextures(spriteName);

		var newCharacter = {};
		newCharacter.animations = {};
		newCharacter.animations.down = new PIXI.extras.AnimatedSprite(newCharTextures.front);
		newCharacter.animations.up = new PIXI.extras.AnimatedSprite(newCharTextures.back);
		newCharacter.animations.left = new PIXI.extras.AnimatedSprite(newCharTextures.side);
		newCharacter.animations.right = new PIXI.extras.AnimatedSprite(newCharTextures.side);

		$scope.basicAnimationSetup(newCharacter, chX, chY);
		$scope.basicAnimationSetup(newCharacter.animations.down, chX, chY);	
		$scope.basicAnimationSetup(newCharacter.animations.up, chX, chY);
		$scope.basicAnimationSetup(newCharacter.animations.left, chX, chY);
		$scope.basicAnimationSetup(newCharacter.animations.right, chX, chY);

		newCharacter.animations.left.scale.x *= -1;
		newCharacter.animations.left.anchor.x = 1;	

		newCharacter.currentAnimation = newCharacter.animations.down;
		newCharacter.currentAnimation.play();
		newCharacter.lastAnim = "Down";
		return newCharacter;
	}

	function keyboard(keyCode) {
	  ////console.log("keyboard setup");
	  let key = {};
	  key.code = keyCode;
	  key.isDown = false;
	  key.isUp = true;
	  key.press = undefined;
	  key.release = undefined;
	  //The `downHandler`
	  key.downHandler = event => {
	    if (event.keyCode === key.code) {
	      if (key.isUp && key.press) key.press();
	      key.isDown = true;
	      key.isUp = false;
	    }
	    //event.preventDefault();
	  };

	  //The `upHandler`
	  key.upHandler = event => {
	    if (event.keyCode === key.code) {
	      if (key.isDown && key.release) key.release();
	      key.isDown = false;
	      key.isUp = true;
	    }
	    //event.preventDefault();
	  };

	  //Attach event listeners
	  window.addEventListener(
	    "keydown", key.downHandler.bind(key), false
	  );
	  window.addEventListener(
	    "keyup", key.upHandler.bind(key), false
	  );
	  return key;
	}

	function setupKeys(){
		//Capture the keyboard arrow keys
		 let left = keyboard(37),
		      up = keyboard(38),
		      right = keyboard(39),
		      down = keyboard(40),
		      space = keyboard(32),
		      keyz = keyboard(90),
		      keyx = keyboard(88);
      	//PRESS
		up.press = () =>{			
			$scope.sendMoveCommand(0);
			$scope.movementCount++;
		}
		down.press = () =>{
			$scope.sendMoveCommand(4);
			$scope.movementCount++;
		}		
		left.press = () =>{
			$scope.sendMoveCommand(6);
			$scope.movementCount++;
		}		
		right.press = () =>{
			$scope.sendMoveCommand(2);
			$scope.movementCount++;
		}

		space.press = () =>{}
		keyz.press = ()=>{} //shield
		keyx.press = ()=>{
			$scope.startCastSpell3();			
		} //superpower 

		//RELEASE
		up.release = () => {		
			$scope.movementCount--;
			if ($scope.movementCount == 0){
				$scope.sendStopCommand();
			}						 	
		}
		down.release = () => {
			$scope.movementCount--;
			if ($scope.movementCount == 0){
				$scope.sendStopCommand();
			}	
		}
		left.release = () => {
		  	$scope.movementCount--;
			if ($scope.movementCount == 0){
				$scope.sendStopCommand();
			}	
		}
		right.release = () => {
		  	$scope.movementCount--;
			if ($scope.movementCount == 0){
				$scope.sendStopCommand();
			}	
		}
		space.release = () =>{
			$scope.castSpell();
		}
		keyz.release = () =>{
			$scope.castSpell2();			
		}
		keyx.release = () =>{
			$scope.endCastSpell3();			
		}
	}

	$scope.lastSpellUsage = 0;
	$scope.lastSpellUsage2 = 0;

	$scope.castSpell = function(){	
		//Static value since spell creation  is not supported yet

		var d = new Date();
		var n = d.getTime();

		spellCost = 5;
		spellCooldown = 250;

		if (n-$scope.lastSpellUsage < spellCooldown){
			$scope.addChatLine("Spell is on cooldown");
			return;			
		}

		if ($scope.selectedCharacter.CurrentResource >= spellCost){
			$scope.updateResource($scope.selectedCharacter.CurrentResource - spellCost);
			$scope.sendCastCommand();
			$scope.lastSpellUsage = n;
		}
	}

	$scope.castSpell2 = function(){	
		//Static value since spell creation  is not supported yet

		var d = new Date();
		var n = d.getTime();

		spellCost = 20;
		spellCooldown = 10000;

		if (n-$scope.lastSpellUsage2 < spellCooldown){
			$scope.addChatLine("Spell is on cooldown");
			return;			
		}

		if ($scope.selectedCharacter.CurrentResource >= spellCost){
			$scope.updateResource($scope.selectedCharacter.CurrentResource - spellCost);
			$scope.sendCastCommand2();
			$scope.lastSpellUsage2 = n;
		}
	}

	$scope.castingSpell = false;
	$scope.startedCast = 0;
	$scope.castTimer = new Date();

	$scope.startCastSpell3 = function(){
		////console.log("starting launch");
		var spellCost = 50;
		if ($scope.selectedCharacter.CurrentResource >= spellCost){				
			var d = new Date();
			var n = d.getTime();	
			$scope.startedCast = n;
			$scope.castingSpell = true;
		}
	}



	$scope.endCastSpell3 = function(){
		////console.log("testing launch");
		var spellCost = 50;
		$scope.castingSpell = false;

				var d = new Date();
		var n = d.getTime();	
		
		////console.log(n-$scope.startedCast);
		if (n-$scope.startedCast > 1500 && $scope.selectedCharacter.CurrentResource >= spellCost){
			$scope.updateResource($scope.selectedCharacter.CurrentResource - spellCost);	
			$scope.sendCastCommand3();
		}	
	}

	$scope.sendCastCommand =  function(){
		//////console.log("SENT SPELL CCOMMAND");
		mx = 1;
		my = 1;
		switch ($scope.currentMovementDir) {
			case 0:
				mx = 0;
				my = -1;				
				break;			
			case 2:	
				mx = 1;
				my = 0;			
				break;
			case 4:
				mx = 0;
				my = 1;
				break;
			case 6:
				mx = -1;
				my = 0;				
				break;
			default:				
				break;
		}
    	gameServerSocket.send(ClientRequest.CastSpell+"|"+mx+"|"+my);
	}

	$scope.sendCastCommand2 = function(){
		gameServerSocket.send(ClientRequest.CastSpell2);		
	}

	$scope.sendCastCommand3 =  function(){
		//////console.log("SENT SPELL CCOMMAND");
		mx = 1;
		my = 1;
		switch ($scope.currentMovementDir) {
			case 0:
				mx = 0;
				my = -1;				
				break;			
			case 2:	
				mx = 1;
				my = 0;			
				break;
			case 4:
				mx = 0;
				my = 1;
				break;
			case 6:
				mx = -1;
				my = 0;				
				break;
			default:				
				break;
		}
		////console.log("sent command");
    	gameServerSocket.send(ClientRequest.CastSpell3+"|"+mx+"|"+my);
	}

	$scope.addProjectile = function(projectile){
		$scope.projectilesInMap[projectile.ProjectileId] = $scope.drawProjectile(projectile.BoundingBox.X, projectile.BoundingBox.Y, projectile.BoundingBox.Size);
		GameGraphicContext.stage.addChild($scope.projectilesInMap[projectile.ProjectileId]);
		sfxList["1"].play();
	}

	$scope.shieldCharacter = function(charId){
		if ($scope.selectedCharacter.CharacterId == charId){
			//$scope.selectedCharacter.shieldAnim = loadShieldAnimation();
			$scope.characterAnimations.back.addChild(loadShieldAnimation(false));
			$scope.characterAnimations.front.addChild(loadShieldAnimation(false));
			$scope.characterAnimations.side.addChild(loadShieldAnimation(false));
			$scope.characterAnimations.sideL.addChild(loadShieldAnimation(true));
		}		
		else{
			if (otherCharactersInMap[charId] != null){
				otherCharactersInMap[charId].animations.up.addChild(loadShieldAnimation(false));
				otherCharactersInMap[charId].animations.down.addChild(loadShieldAnimation(false));
				otherCharactersInMap[charId].animations.right.addChild(loadShieldAnimation(false));
				otherCharactersInMap[charId].animations.left.addChild(loadShieldAnimation(true));
			}			
		}	
		////console.log("Character "+charId+" got shielded!");
		//setup shield as child for every animation
	}

	$scope.unShieldCharacter = function(charId){
		if ($scope.selectedCharacter.CharacterId == charId){
			$scope.characterAnimations.back.removeChild($scope.characterAnimations.back.children[0]);
			$scope.characterAnimations.front.removeChild($scope.characterAnimations.front.children[0]);
			$scope.characterAnimations.side.removeChild($scope.characterAnimations.side.children[0]);
			$scope.characterAnimations.sideL.removeChild($scope.characterAnimations.sideL.children[0]);
		}	
		else{
			if (otherCharactersInMap[charId] != null){
				otherCharactersInMap[charId].animations.up.removeChild(otherCharactersInMap[charId].animations.up.children[0]);
				otherCharactersInMap[charId].animations.down.removeChild(otherCharactersInMap[charId].animations.down.children[0]);
				otherCharactersInMap[charId].animations.right.removeChild(otherCharactersInMap[charId].animations.right.children[0]);
				otherCharactersInMap[charId].animations.left.removeChild(otherCharactersInMap[charId].animations.left.children[0]);
			}			
		}	
		////console.log("Character "+charId+"lost shield!");
		//remove shield as child for every animation (this easy?)
	}

	$scope.moveProjectile = function(id,  newx, newy){		
		var value1 = ((newx+5)*GameGraphicContext.stage.width)/320;
		var value2 = ((newy+5)*GameGraphicContext.stage.height)/320;
		$scope.projectilesInMap[id].x = value1;
		$scope.projectilesInMap[id].y = value2;
		//otherCharactersInMap[chrId].zOrder = value2+10;
	}

	$scope.removeProjectile = function(id){
		GameGraphicContext.stage.removeChild($scope.projectilesInMap[id]);
		delete $scope.projectilesInMap[id];
	}

	$scope.drawProjectile = function(x, y, size){
		////console.log("projectile size: "+size);
		//Sprite name is static since we  dont support creation of spells
		var newProjectile = new PIXI.Sprite(PIXI.Texture.fromImage('sprites/spells/1_spell.png'));
		//newProjectile.zOrder = 10;
		newProjectile.height = ComputeTileHeight(16)*(size/10);
		newProjectile.width = ComputeTileWidth($scope.horizontalTilesQuantity)*(size/10);	
		newProjectile.x = ((x+5)*GameGraphicContext.stage.width)/320;
		newProjectile.y = ((y+5)*GameGraphicContext.stage.height)/320;
		newProjectile.anchor.set(0.5);
		newProjectile.parentGroup = charactersGroup;
		return newProjectile;
	}

	$scope.updateResource = function(newValue){
		//Update barrita qla
		$scope.selectedCharacter.CurrentResource = newValue;
		$scope.$apply();
		document.getElementById("resourceBar").style.width = ((newValue/$scope.selectedCharacter.Class.Resource)*100)+"%"; 
	}

	$scope.updateHealth = function(newValue){
		//Update barrita qla
		$scope.selectedCharacter.CurrentHealth = newValue;
		$scope.$apply();
		document.getElementById("healthBar").style.width = ((newValue/$scope.selectedCharacter.Class.Health)*100)+"%"; 
	}

    function changeOtherCharacterAnimation(character, anim){   

    	//Manejar el last anim de alguna manera.    		
    	switch (anim) {
    		case "Stop":
    			character.currentAnimation.gotoAndStop(0);	    			
    			break;
			case "Top":		
				GameGraphicContext.stage.removeChild(character.currentAnimation);		
		    	character.currentAnimation = character.animations.up;
		    	GameGraphicContext.stage.addChild(character.currentAnimation);	
				character.currentAnimation.play();
				break;
			case "Down":
			GameGraphicContext.stage.removeChild(character.currentAnimation);
		    	character.currentAnimation = character.animations.down;
				character.currentAnimation.play();
				GameGraphicContext.stage.addChild(character.currentAnimation);	
				break;
			case "Left":
			GameGraphicContext.stage.removeChild(character.currentAnimation);
		    	character.currentAnimation = character.animations.left;
				character.currentAnimation.play();
				GameGraphicContext.stage.addChild(character.currentAnimation);	
				break;
			case "Right":
			GameGraphicContext.stage.removeChild(character.currentAnimation);
		    	character.currentAnimation = character.animations.right;
				character.currentAnimation.play();
				GameGraphicContext.stage.addChild(character.currentAnimation);	
				break;
    		default:
    			////console.log("Unhandled animation error");
    			break;
    	}    	
    }


	
	setupKeys();

	/*** Character controller commands ***/
	$scope.sendMoveCommand = function(movementDir){		
		gameServerSocket.send(ClientRequest.ClientCharMove+"|"+movementDir);
		$scope.currentMovementDir = movementDir;
		//Defines movement animation		
		$scope.currentCharAnimation.stop();
		switch (movementDir) {
			case 0:
				$scope.replaceCurrentAnimation($scope.characterAnimations.back);				
				break;			
			case 2:	
				$scope.replaceCurrentAnimation($scope.characterAnimations.side);
			
				break;
			case 4:
				$scope.replaceCurrentAnimation($scope.characterAnimations.front);	
				break;
			case 6:
				$scope.replaceCurrentAnimation($scope.characterAnimations.sideL);
				//$scope.currentCharAnimation.scale.x = -1;	
				break;
			default:				
				break;
		}
		$scope.currentCharAnimation.play();
	}

	$scope.sendStopCommand = function(){
		$scope.currentCharAnimation.gotoAndStop(0);	
		gameServerSocket.send(ClientRequest.ClientCharStop);	
	}

	$scope.replaceCurrentAnimation = function(newAnimation){
		//Is it really the best way to do it?
		newAnimation.x = $scope.currentCharAnimation.x;
		newAnimation.y = $scope.currentCharAnimation.y;
		GameGraphicContext.stage.removeChild($scope.currentCharAnimation);
		$scope.currentCharAnimation = newAnimation;
		GameGraphicContext.stage.addChild($scope.currentCharAnimation);
	}

	LoadMaps();
	//Plays the music. Fuck yah

	bgmList["field3"].play();
	bgmList["field3"].fadeIn(1);

	$scope.currentFPSValue = 0;

	$scope.fpsTimer = $interval(function () {
        $scope.currentFPSValue = GameGraphicContext.ticker.FPS;
        $log.log($scope.currentFPSValue);

    }, 100);


	GameGraphicContext.ticker.add(function(delta) {
	    for(var key in $scope.projectilesInMap){
	    	//////console.log("UPDATE inner");
	    	$scope.projectilesInMap[key].rotation += 1 * delta;
	    }	    
	});

});

