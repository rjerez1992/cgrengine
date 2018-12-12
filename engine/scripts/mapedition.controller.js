app.controller('mapEditionController', function($scope, $location, $rootScope) {
	$rootScope.displayToolbox = true;
	$scope.mouseClicked = false;
	$scope.isCtrlPressed=false;
	$scope.isPreviewMode=false;

	$scope.selectedTextureNumber = -1;
	$scope.selectedTextureRoute = undefined;

	$scope.spriteMap = undefined;

	$scope.isDeleteMode = false;

	$scope.selectedLayer = 1; //Block is the default layer
	$scope.selectedLayerNames = ["Block", "Floor", "Walls", "Roof", "Sky"];

	//Builds the display WebGL frame using PixiJS
	var GameGraphicContext = BuildDisplayFrame();
	PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

	$scope.stagePositionX = GameGraphicContext.screen.width/2;
	$scope.stagePositionY = GameGraphicContext.screen.height/2;


	let blockTexture = PIXI.Texture.fromImage($rootScope.blockTexturePath);

	//$rootScope.mapTextures

	Mousetrap.bind(['command+r', 'ctrl+r'], () => { 
		$rootScope.displayToolbox = !$rootScope.displayToolbox;
		$rootScope.$apply();
	});

	Mousetrap.bind(['command++', 'ctrl++'], () => { 
	 	if ($scope.renderingTileSize<256){
 		 	$scope.renderingTileSize+=8; //px;
 		 	$scope.renderMap($rootScope.mapOnEdition);
	 	}
	});

	Mousetrap.bind(['command+-', 'ctrl+-'], () => { 
	 	if ($scope.renderingTileSize>16){
 		 	$scope.renderingTileSize-=8; //px;
 		 	$scope.renderMap($rootScope.mapOnEdition);
	 	}
	});

	$scope.toggleDeleteMode = function(){
		$scope.isDeleteMode = !$scope.isDeleteMode;
		console.log("Delete mode is now "+$scope.isDeleteMode);
	}

	$scope.fillCurrentLayer = function(){
		if (!$scope.selectedTextureRoute || $scope.isDeleteMode){return null;}
		console.log("fill");
		for(var i=0; i<$scope.spriteMap[$scope.selectedLayer].length; i++){
			for(var j=0; j<$scope.spriteMap[$scope.selectedLayer].length; j++){			
				$rootScope.mapOnEdition.Layers[$scope.selectedLayer][i][j] = $scope.selectedTextureNumber;
				$scope.spriteMap[$scope.selectedLayer][i][j].texture =  $rootScope.mapTextures[$scope.selectedTextureNumber+""];
			}
		}
	}

	$scope.eraseCurrentLayer = function(){
		console.log("erase");
		for(var i=0; i<$scope.spriteMap[$scope.selectedLayer].length; i++){
			for(var j=0; j<$scope.spriteMap[$scope.selectedLayer].length; j++){				
				$rootScope.mapOnEdition.Layers[$scope.selectedLayer][i][j] = 0;
				$scope.spriteMap[$scope.selectedLayer][i][j].texture =  $rootScope.mapTextures["0"];
			}
		}
	}

	$scope.setSelectedTexture = function(id){
		$scope.isDeleteMode = false;
	//console.log("selected texture : "+id);
		$scope.selectedTextureNumber = id;
		$scope.selectedTextureRoute = $rootScope.mapTextures[id].baseTexture.imageUrl;
	}


	GameGraphicContext.renderer.plugins.interaction.on('pointerup', function(event){ 
		$scope.mouseClicked = false;
	});

    GameGraphicContext.renderer.plugins.interaction.on('pointermove', function(e){
    	if ($scope.isCtrlPressed && $scope.mouseClicked){
    		//console.log("MOVING THE SHIT OUT");
    		//console.log(event);
    		GameGraphicContext.stage.x += e.data.originalEvent.movementX;
			GameGraphicContext.stage.y += e.data.originalEvent.movementY;
			$scope.stagePositionX += e.data.originalEvent.movementX;
			$scope.stagePositionY += e.data.originalEvent.movementY;
		}
    });


	 document.addEventListener('keydown', onKeyDown);

	function onKeyDown(key) {
		if (key.keyCode==17){			
			$scope.isCtrlPressed=true;
		}
	}

	document.addEventListener('keyup', onKeyUp);

	function onKeyUp(key) {
		if (key.keyCode==17){
			$scope.isCtrlPressed = false;
			$scope.mouseClicked = false;
			//console.log("alt not pressed anymore");
		}
	}

	$scope.togglePreviewMode = function(){
		$scope.isPreviewMode = !$scope.isPreviewMode;
		$scope.renderMap($rootScope.mapOnEdition);
	}

	//Allows to resize the pixiJS canvas
	window.onresize = function (event){    
		var w = window.innerWidth;  
	  	var h = window.innerHeight;    //this part resizes the canvas but keeps ratio the same  
	    GameGraphicContext.renderer.view.style.width = w + "px"; 
	   	GameGraphicContext.renderer.view.style.height = h + "px";    //this part adjusts the ratio: 
	  	GameGraphicContext.renderer.resize(w,h);
	  	$scope.renderMap($rootScope.mapOnEdition, $scope.selectedLayer);
  	}

	$scope.computeTileSize = function(tileQuantity){
		tileQuantity+=14; //Screw
  		var w = GameGraphicContext.screen.width;
	  	var h = GameGraphicContext.screen.height;
	  	if (w>h){
	  		return h/tileQuantity;
	  	}
	  	else{
	  		return w/tileQuantity;
	  	}
  	}

  	$scope.computeSideOffSet = function(tileSize, tileQuantity){
  		return (GameGraphicContext.screen.width-(tileSize*tileQuantity))/2
  	}

  	$scope.computeTopOffSet = function(tileSize, tileQuantity){
  		return (GameGraphicContext.screen.height-(tileSize*tileQuantity))/2
  	}

    $scope.generateSpriteMap = function(map){
    	//Fix for the 0 empty texture
    	//$rootScope.mapTextures["0"] = $rootScope.mapTextures["0"];

    	var spriteMap = $scope.createMapArray(map.Layers.length, map.Layers[0].length);
  		for (var l = 0; l < map.Layers.length; l++) {
    		var layer = map.Layers[l];

    		if (l==0){
    			for (var i = 0; i < layer.length; i++) {
	          		for (var j = 0; j < layer.length; j++){
	          			if (map.Layers[l][i][j]==1){
	          				spriteMap[l][i][j] = new PIXI.Sprite(blockTexture);
	          			} 
	          			else{
	          				spriteMap[l][i][j] = new PIXI.Sprite($rootScope.mapTextures[0]);
	          			}     				
	          		}
	        	}    			
    		}
    		else{
    			for (var i = 0; i < layer.length; i++) {
	          		for (var j = 0; j < layer.length; j++){
	          			if (map.Layers[l][i][j]!=-1){
	          				spriteMap[l][i][j] = new PIXI.Sprite($rootScope.mapTextures[map.Layers[l][i][j]+""]);
	          			}      				
	          		}
	        	}
    		}	        	
      	}

      	console.log(spriteMap);
      	return spriteMap;
    }

    $scope.createMapArray = function(layers, size){
    	var array = new Array(layers);
    	for(var i=0; i<layers; i++){
    		array[i] = new Array(size);
    		for (var j=0; j<size; j++){
    			array[i][j]=new Array(size);
    			for(var k=0; k<size; k++){
    				array[i][j][k] = undefined;
    			}
    		}
    	}    	
    	return array;
    }

    
  	$scope.renderMap = function(map){

  		//Cleans the stage
  		GameGraphicContext.stage = new PIXI.Container();
  		//console.log(map);
  		
  		if (!$scope.spriteMap){
  			$scope.spriteMap = $scope.generateSpriteMap(map);  			
  		}
  	
		$scope.renderMapFromSprites($scope.spriteMap);
  	
	
  		
  	}

  	$scope.renderMapFromSprites = function(spriteMap){
  		var givenAlpha = 1;
  		var tint =  0xFFFFFF;

  		for(var i = 0; i<spriteMap.length; i++){
  			//Doesnt draw the layer 0. cause they are blocks
  			if (i==0 && $scope.selectedLayer != 0){
  				continue;
  			}  		

  			//Checks only on edition mode
  			if (!$scope.isPreviewMode){
  				//Alpha check
				if (i <= $scope.selectedLayer){
	  				givenAlpha = 1;
	  			}
	  			else{
	  				givenAlpha = 0.37;
	  			}

	  			//tint check
	  			if (i < $scope.selectedLayer){
	  				tint =  0xCACACA;
	  			}
	  			else{
	  				tint =  0xFFFFFF;
	  			}
  			}	  		

  			if ($scope.selectedLayer==i){
  				$scope.renderLayer(spriteMap[i], true, givenAlpha, tint);
  			}
  			else{
				$scope.renderLayer(spriteMap[i], false, givenAlpha, tint);
  			}  			
  		}  	
  	}

  	$scope.renderingTileSize = 56; //px;

  	$scope.renderLayer = function(layer, isActive, alpha, tint){
  	
  		
  		for (var i = 0; i < layer.length; i++) {
  			for (var j = 0; j < layer.length; j++){
  				var tmpSpriteHolder = layer[i][j];
  				tmpSpriteHolder.height = $scope.renderingTileSize;
	    		tmpSpriteHolder.width = $scope.renderingTileSize;
	    		tmpSpriteHolder.x = (j*$scope.renderingTileSize);
			    tmpSpriteHolder.y = (i*$scope.renderingTileSize);
			    //tmpSpriteHolder.zOrder = assignableZOrder;
			    if (isActive){
			    	tmpSpriteHolder.rowIndx = i;
			    	tmpSpriteHolder.columnIndx = j;
			    	tmpSpriteHolder.interactive = true;
			    	tmpSpriteHolder.buttonMode = true;
			    	$scope.setSpriteInteractivity(tmpSpriteHolder);
			    }
			    else{			    	
		    		tmpSpriteHolder.interactive = false;
			    	tmpSpriteHolder.buttonMode = false;
			    }
			    tmpSpriteHolder.alpha = alpha;
			    tmpSpriteHolder.tint = tint;
			    GameGraphicContext.stage.addChild(tmpSpriteHolder);
			}
		}

		//Sets the stage at the center of the screen;
		GameGraphicContext.stage.x = $scope.stagePositionX;
		GameGraphicContext.stage.y = $scope.stagePositionY;

		//Sets the pivot at the center of the stage
		GameGraphicContext.stage.pivot.x = GameGraphicContext.stage.width/2;
		GameGraphicContext.stage.pivot.y = GameGraphicContext.stage.height/2;	
	

		console.log(GameGraphicContext.stage);
  	}


  	$scope.setSpriteInteractivity = function(sprite){
  		sprite.on('pointerdown', function(){
  			$scope.mouseClicked = true;
  			if (!$scope.isCtrlPressed){				
	    		console.log("Clicked tile: "+this.rowIndx+" - "+this.columnIndx);	
	    		$scope.paintCurrentTile(this.rowIndx, this.columnIndx);
  			}	    	
	    });

	    sprite.on('pointerup', function(){
	    	$scope.mouseClicked = false;
	    });

      	sprite.on('pointerover', function(){	
      		//$scope.mouseClicked = true;    	
	    	if (!$scope.isCtrlPressed){
	    		if ($scope.mouseClicked){
	    			console.log("Clicked tile: "+this.rowIndx+" - "+this.columnIndx);
	    			$scope.paintCurrentTile(this.rowIndx, this.columnIndx);
	    		}	
	    	}		    	
	    });
		 
  	}


  	$scope.paintCurrentTile = function(row, column){  	

  		//If selected layer is 0, then switch between 0-1;
  		if ($scope.selectedLayer == 0){
  			if ($rootScope.mapOnEdition.Layers[$scope.selectedLayer][row][column]==0){
  				$rootScope.mapOnEdition.Layers[$scope.selectedLayer][row][column]=1;
  				$scope.spriteMap[$scope.selectedLayer][row][column].texture = blockTexture;
  			}
  			else{
  				$rootScope.mapOnEdition.Layers[$scope.selectedLayer][row][column]=0;
  				$scope.spriteMap[$scope.selectedLayer][row][column].texture = $rootScope.mapTextures[0];
  			}
  			return;
  		}


  		if (!$scope.isDeleteMode && $scope.selectedTextureRoute){
  			console.log("painting tile")
  			$rootScope.mapOnEdition.Layers[$scope.selectedLayer][row][column]=$scope.selectedTextureNumber;
			$scope.spriteMap[$scope.selectedLayer][row][column].texture = $rootScope.mapTextures[$scope.selectedTextureNumber+""];
  		}
  		else if($scope.isDeleteMode){
  			console.log("cleaning tile");
  			$rootScope.mapOnEdition.Layers[$scope.selectedLayer][row][column]=0;
			$scope.spriteMap[$scope.selectedLayer][row][column].texture = $rootScope.mapTextures["0"];	
  		}		
  	}
 

    //Called from UI
  	$scope.cancelMapEdition = function(){
  		$location.path("/zoneedition");
  	}

    //Called from UI
  	$scope.changeSelectedLayer = function(layerNumber){
  		$scope.selectedLayer = layerNumber;
  		console.log("selected layer changed to "+$scope.selectedLayer);
  		$scope.renderMap($rootScope.mapOnEdition);
  		if (layerNumber == 0){
  			console.log("Disabled eraser");
  			$scope.isDeleteMode = false;
  		}
  	}

  	$scope.saveMapChanges = function(){
  		displayConfirmAlertSuccess("Are you sure you want to save the changes?", ()=>{
  			updateMapAfterEdition($rootScope.mapOnEdition, $rootScope.gameServerSocket, ()=>{
  				displayInfoAlert("Map successfully updated");
  			});  			
  		});  		
  	}

    /* Layer is selected through the dropdown menu */
    $scope.renderMap($rootScope.mapOnEdition);



});
