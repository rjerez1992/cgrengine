app.controller('zoneSelectionController', function($scope, $location, $rootScope) {
	$rootScope.requestZones = function(){
		$rootScope.gameServerSocket.onmessage = function(event){ 
	        mapDataJson = event.data.substring(event.data.indexOf('|')+1);  
	        $rootScope.zonesList = JSON.parse(mapDataJson);   
	      	$rootScope.$apply();
	    }	  

		$rootScope.gameServerSocket.send(EditorRequest.ZonesList);				
	}

	$scope.deleteZone = function(id){
		displayConfirmAlert("Deleting a zone will delete every map inside of it. Do you wish to proceed?", function(){
			$rootScope.gameServerSocket.onmessage = function(event){
				if (event.data == "zone.deleted"){
					displayInfoAlert("Zone deleted");
					$rootScope.requestZones();
				}
			}
			$rootScope.gameServerSocket.send(EditorRequest.DeleteZone+"|"+id);				
		});		
	}

	$scope.openNewZoneModal = function(){
		$scope.showNewZoneModal = true;		
	}

	$scope.closeNewZoneModal = function(){
		$scope.showNewZoneModal = false;
	}

	$scope.createNewZoneFromModal = function(){
		console.log($scope.newZoneFormData.Name);
		console.log($scope.newZoneFormData.Size);
		$scope.showNewZoneModal = false;

		$rootScope.gameServerSocket.onmessage = function(event){
			if (event.data == "zone.created"){
				displayInfoAlert("New zone created");
				$rootScope.requestZones();
			}
		}
		$rootScope.gameServerSocket.send(EditorRequest.CreateZone+"|"+$scope.newZoneFormData.Name+"|"+$scope.newZoneFormData.Size);	
	}

	$scope.editZone = function(zoneId){
		angular.forEach($rootScope.zonesList, function(value, key) {
		  if (value.ZoneId == zoneId){
		  	$rootScope.zoneOnEdition = value;
		  	$location.path("/zoneedition");
		  	//console.log(value);
		  	//TODO: Set edition zone on rootscope and redirect to zone edition!!!
		  }
		});
	}

	//Loads zones to the view
	$rootScope.requestZones();
	$scope.newZoneFormData = {};
});
