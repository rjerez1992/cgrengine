app.controller('loadingController', function($scope, $location, $rootScope, $timeout, $interval) {
	//Displays the background of the screen on PixiJS
	var GameGraphicContext = BuildDisplayFrame();
	PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

	$scope.stagePositionX = GameGraphicContext.screen.width/2;
	$scope.stagePositionY = GameGraphicContext.screen.height/2;

	const background = PIXI.Sprite.fromImage('sprites/ui/background.jpg');
	background.x = 0;
	background.y = 0;
	background.height = GameGraphicContext.screen.height;
	background.width = GameGraphicContext.screen.width;	
	GameGraphicContext.stage.addChild(background);

	//Loads everything
	$rootScope.mapTexturesDirectory = "sprites/maps";
	$rootScope.uiTexturesDirectory = "sprites/ui";
	$rootScope.charTexturesDirectory = "sprites/chars";
	$rootScope.spellTexturesDirectory = "sprites/spells";

	/// PRE-LOADED STUFF ///
	$rootScope.mapTextures = {};
	$rootScope.uiTextures = {};
	$rootScope.charTextures = {};
	$rootScope.spellTextures = {};

	// Loading flags
	$scope.loadedMaps = false;
	$scope.loadedUI = false;
	$scope.loadedChars = false;
	$scope.loadedSpells = false;

	$rootScope.loadMapTextures = function(){
		$rootScope.mapTextures = {};
		const fs = require("fs");
		fs.readdir($rootScope.mapTexturesDirectory, (err, dir) => {
	        for (var i = 0, path; path = dir[i]; i++) {
                ////console.log(path);   
                $rootScope.mapTextures[path.substring(0, path.lastIndexOf('.'))] = PIXI.Texture.fromImage($rootScope.mapTexturesDirectory+"/"+path);
	        }
	        $scope.loadedMaps = true;
	        $scope.$apply();
	        $rootScope.$apply();
		});	

	}

	$rootScope.loadUITextures = function(){
		const fs = require("fs");
		fs.readdir($rootScope.uiTexturesDirectory, (err, dir) => {
	        for (var i = 0, path; path = dir[i]; i++) {
                ////console.log(path);   
                $rootScope.uiTextures[path.substring(0, path.lastIndexOf('.'))] = PIXI.Texture.fromImage($rootScope.uiTexturesDirectory+"/"+path);
	        }
            $scope.loadedUI = true;
	        $scope.$apply();
	        $rootScope.$apply();
		});	
	}

	$rootScope.loadCharTextures = function(){
		const fs = require("fs");
		fs.readdir($rootScope.charTexturesDirectory, (err, dir) => {
	        for (var i = 0, path; path = dir[i]; i++) {
                ////console.log(path);   
                $rootScope.charTextures[path.substring(0, path.lastIndexOf('.'))] = PIXI.Texture.fromImage($rootScope.charTexturesDirectory+"/"+path);
	        }
            $scope.loadedChars = true;
	        $scope.$apply();
	        $rootScope.$apply();
		});	

	}

	$rootScope.loadSpellTextures = function(){
		const fs = require("fs");
		fs.readdir($rootScope.uiTexturesDirectory, (err, dir) => {
	        for (var i = 0, path; path = dir[i]; i++) {
                ////console.log(path);   
                $rootScope.uiTextures[path.substring(0, path.lastIndexOf('.'))] = PIXI.Texture.fromImage($rootScope.uiTexturesDirectory+"/"+path);
	        }
            $scope.loadedSpells = true;
	        $scope.$apply();
	        $rootScope.$apply();
		});	
	}

	/// LOADS STUFF ///
	$rootScope.loadMapTextures();
	$rootScope.loadUITextures();
	$rootScope.loadCharTextures();
	$rootScope.loadSpellTextures();

	$scope.checkLoadingComplete = function(){
		//console.log("Called");
		if ($scope.loadedMaps && $scope.loadedUI && $scope.loadedChars && $scope.loadedSpells){
			//console.log($rootScope.mapTextures);
			//console.log($rootScope.uiTextures);
			//console.log($rootScope.charTextures);
			//console.log($rootScope.spellTextures);

			$location.path("/login");			
		}		
	}

	$interval($scope.checkLoadingComplete, 100, 9999);
	

});