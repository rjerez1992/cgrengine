app.controller('loadController', function($scope, $location, $timeout, $rootScope) {
	//TODO: Run checks here and load stuff
	$timeout(function() { $location.path("/login");}, 1000);

	/// Directory Routes ///
	$rootScope.mapTexturesDirectory = "client/sprites/maps";
	$rootScope.uiTexturesDirectory = "client/sprites/ui";
	$rootScope.charTexturesDirectory = "client/sprites/chars";
	$rootScope.spellTexturesDirectory = "client/sprites/spells";

	$rootScope.blockTexturePath = "resources/block.png";

	/// PRE-LOADED STUFF ///
	$rootScope.mapTextures = {};
	$rootScope.uiTextures = {};
	$rootScope.charTextures = {};
	$rootScope.spellTextures = {};

	$rootScope.loadMapTextures = function(){
		$rootScope.mapTextures = {};
		const fs = require("fs");
		fs.readdir($rootScope.mapTexturesDirectory, (err, dir) => {
	        for (var i = 0, path; path = dir[i]; i++) {
                //console.log(path);   
                $rootScope.mapTextures[path.substring(0, path.lastIndexOf('.'))] = PIXI.Texture.fromImage($rootScope.mapTexturesDirectory+"/"+path);
	        }
	        $rootScope.$apply();
		});	

	}

	$rootScope.loadUITextures = function(){
		const fs = require("fs");
		fs.readdir($rootScope.uiTexturesDirectory, (err, dir) => {
	        for (var i = 0, path; path = dir[i]; i++) {
                //console.log(path);   
                $rootScope.uiTextures[path.substring(0, path.lastIndexOf('.'))] = PIXI.Texture.fromImage($rootScope.uiTexturesDirectory+"/"+path);
	        }
		});	
	}

	$rootScope.loadCharTextures = function(){
		const fs = require("fs");
		fs.readdir($rootScope.charTexturesDirectory, (err, dir) => {
	        for (var i = 0, path; path = dir[i]; i++) {
                //console.log(path);   
                $rootScope.charTextures[path.substring(0, path.lastIndexOf('.'))] = PIXI.Texture.fromImage($rootScope.charTexturesDirectory+"/"+path);
	        }
	        //console.log($rootScope.charTextures);
	        $rootScope.$apply();
		});	

	}

	$rootScope.loadSpellTextures = function(){
		const fs = require("fs");
		fs.readdir($rootScope.uiTexturesDirectory, (err, dir) => {
	        for (var i = 0, path; path = dir[i]; i++) {
                //console.log(path);   
                $rootScope.uiTextures[path.substring(0, path.lastIndexOf('.'))] = PIXI.Texture.fromImage($rootScope.uiTexturesDirectory+"/"+path);
	        }
		});	
	}

	/// LOADS STUFF ///
	$rootScope.loadMapTextures();
	$rootScope.loadUITextures();
	$rootScope.loadCharTextures();
	$rootScope.loadSpellTextures();

});