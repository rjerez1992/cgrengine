app.controller('resourceManagerController', function($scope, $location, $rootScope) {

	
	$scope.usedTileNumbers = [];

	$scope.updateUsedTileNumbers = function(){

		
		for(var entry in $rootScope.mapTextures){
			var texture = $rootScope.mapTextures[entry];
			$scope.usedTileNumbers.push(parseInt($scope.getTextureNumber(texture)));
		}
	
	}

	$scope.removeUsedTileNumber = function(number){
		var index = $scope.usedTileNumbers.indexOf(parseInt(number));

		if (index > -1) {
		  $scope.usedTileNumbers.splice(index, 1);
		}

		console.log("removed :"+number + "with index "+index);
		console.log($scope.usedTileNumbers);
	}


	

	$scope.selectFiles = function(){
		var app = require('electron').remote; 
		var dialog = app.dialog;
		var fs = require('fs');

		dialog.showOpenDialog({ 
		    properties: [ 
		        'openFile', 'multiSelections'
		    ]
		}, (filePaths)=>{
			//console.log(filePaths);
			//require n number to put.

			for(i=0; i<filePaths.length; i++){
				
				fs.readFile(filePaths[i], /*'utf-8',*/ (err, data) => {
			        if(err){
			            alert("An error ocurred reading the file :" + err.message);
			            return;
			        }

			        // Change how to handle the file content
			        //console.log("The file content is : " + data);

			        $rootScope.loadMapTextures();
			        var filepath = $rootScope.mapTexturesDirectory +"/"+ getFirstAvaibleMapTextureIndex() + ".png";
			        //console.log(filepath);
			    	


					//var content = "This is the new content of the file";

			    	fs.writeFile(filepath, data, (err) => {
					    if (err) {
					        alert("An error ocurred updating the file" + err.message);
					        console.log(err);
					        return;
					    }

					    $rootScope.loadMapTextures();

					
					});
			    });	
			}	
			
			displayInfoAlert(i+" new sprites processed");					
		});
	}

	



	//THIS DOESNT POPULATE IT RIGHT.
	function usedContainsNumber(number){
		for(var l=0; l<$scope.usedTileNumbers.length; l++){
			if ($scope.usedTileNumbers[l]==number){				
				return true;
			}
		}		
		return false;
	}

	function getFirstAvaibleMapTextureIndex(){
		//console.log("calling first avaible");
		//console.log($rootScope.mapTextures);
		for(var i=0; i<999999; i++){
			var element = $rootScope.mapTextures[i];
			if (element == undefined && !usedContainsNumber(i)){
				$scope.usedTileNumbers.push(i);		
				return i;
			}
		}

	}



	$scope.spriteSelection = true;
	$scope.mapSpriteManager = false;
	$scope.charSpriteManager = false;
	$scope.previewTexture = undefined;

	/////////////// SWITCHES

	$scope.switchToMapSpriteManager = function(){
		$scope.spriteSelection = false;
		$scope.mapSpriteManager = true;
	}

	
	$scope.switchToSpriteSelection = function(){
		$scope.mapSpriteManager = false;
		$scope.charSpriteManager = false;
		$scope.spriteSelection = true;	
	}

	$scope.switchToCharSpriteManager = function(){
		$scope.spriteSelection = false;
		$scope.charSpriteManager = true;	
	}

	$scope.drawTextureOnPreview = function(texture){

		$scope.previewTexture = texture.textureCacheIds[0];
	}

	$scope.removeResource = function(texture){
	
		$scope.textureToDelete = texture;
		$scope.removeUsedTileNumber($scope.getTextureNumber(texture));

		displayConfirmAlert("You can undo this process. Are you sure to continue?", ()=>{
			var fs = require('fs');

			if (fs.existsSync($scope.textureToDelete.textureCacheIds[0])) {
			    fs.unlink($scope.textureToDelete.textureCacheIds[0], (err) => {
			        if (err) {
			            alert("An error ocurred updating the file" + err.message);
			            console.log(err);
			            return;
			        }
			        //console.log("File succesfully deleted");
		        	$rootScope.loadMapTextures();
			
				    $scope.previewTexture = undefined;
				    //$scope.updateUsedTileNumbers();
				    $scope.$apply();
			    });
			} else {
			    alert("This file doesn't exist, cannot delete");
			}		
		});
	}

	$scope.getNumberFromName = function(name){
		return name.substring(name.lastIndexOf('/')+1, name.lastIndexOf('.'));//name.match(/\d+/)[0];
	}

	$scope.getTextureNumber = function(texture){
		//console.log(texture);
		var name = texture.baseTexture.imageUrl;
		return name.substring(name.lastIndexOf('/')+1, name.lastIndexOf('.'));
	}

	$scope.updateUsedTileNumbers();

	$scope.addCharacterSprite = function(){
		var app = require('electron').remote; 
		var dialog = app.dialog;
		var fs = require('fs');

		dialog.showOpenDialog({ 
		    properties: [ 
		        'openFile'
		    ]
		}, (filePaths)=>{
			//console.log(filePaths);
			//require n number to put.

			for(i=0; i<filePaths.length; i++){
				console.log("FILE DATA: ");
				$scope.processFileName =filePaths[i].split('\\').pop();
				fs.readFile(filePaths[i], /*'utf-8',*/ (err, data) => {					
			        if(err){
			            alert("An error ocurred reading the file :" + err.message);
			            return;
			        }

			        // Change how to handle the file content
			        //console.log("The file content is : " + data);

			        //$rootScope.loadMapTextures();
			        var filepath = $rootScope.charTexturesDirectory +"/"+ $scope.processFileName;
			        console.log(filepath);
			    	


					//var content = "This is the new content of the file";

			    	fs.writeFile(filepath, data, (err) => {
					    if (err) {
					        alert("An error ocurred updating the file" + err.message);
					        console.log(err);
					        return;
					    }

					    $rootScope.loadCharTextures();

				
					});
			    });	
			}			
			displayInfoAlert(i+" new sprites processed");					
		});
	}

	$scope.removeCharacterSprite = function(texture){
		console.log("DELETING: ");
		console.log(texture);

		$scope.textureToDelete = texture;	
		$scope.deleteValueFileName = $scope.textureToDelete.textureCacheIds[0].split('/').pop();

		displayConfirmAlert("You can undo this process. Are you sure to continue?", ()=>{
			var fs = require('fs');

			if (fs.existsSync($scope.textureToDelete.textureCacheIds[0])) {
			    fs.unlink($scope.textureToDelete.textureCacheIds[0], (err) => {
			        if (err) {
			            alert("An error ocurred updating the file" + err.message);
			            console.log(err);
			            return;
			        }			     
		
					var valueToDelete = $scope.deleteValueFileName.substring(0, $scope.deleteValueFileName.lastIndexOf('.'));					
					delete $rootScope.charTextures[""+valueToDelete];
					console.log($rootScope.charTextures);
				    $rootScope.$apply();
			    });
			} else {
			    alert("This file doesn't exist, cannot delete");
			}		
		});
	}
});