app.controller('zoneEditionController', function($scope, $location, $rootScope) {
	console.log($rootScope.zoneOnEdition);
	$scope.zone = $rootScope.zoneOnEdition;
	$scope.showNewMapModal = false;
	$scope.newMapData = {};

	$scope.editMap = function(map){
		console.log(map);
		$rootScope.mapOnEdition = map;
		$location.path("/mapedition");
	}

	$scope.createNewMap = function(row, column){
		console.log(row + "-" +column);
		$scope.newMapRow = row;
		$scope.newMapColumn = column;
		$scope.showNewMapModal = true;
	}

	$scope.createNewMapFromModal = function(){
		$scope.showNewMapModal = false;

		$rootScope.gameServerSocket.onmessage = function(event){
			if (event.data.startsWith("map.created")){ //Comes with the new map object
				newMapJson = event.data.substring(event.data.indexOf('|')+1);  
				//console.log($scope.zone.Maps[$scope.newMapRow]);
				//console.log(JSON.parse(newMapJson));
	        	$scope.zone.Maps[$scope.newMapRow][$scope.newMapColumn] = JSON.parse(newMapJson);   
				$scope.$apply();
				displayInfoAlert("Map created");
			}
		}

		$rootScope.gameServerSocket.send(EditorRequest.CreateMapAtZone+"|"+
			$scope.zone.ZoneId+"|"+$scope.newMapRow+"|"+$scope.newMapColumn+"|"+$scope.newMapData.Name);		
	}

	$scope.closeNewMapModal = function(){
		$scope.showNewMapModal = false;
	}

	

});
