app.controller('menuController', function($scope, $location, $rootScope) {
	$scope.goToZoneSelection = function(){
		$location.path("/zoneselection");
	}

	$scope.goToResourceManager = function(){
		$location.path("/resourcemanager");
	}

	$scope.goToClassManager= function(){
		$location.path("/classselection");
	}

	$scope.closeEditor = function(){
		displayConfirmAlert("Are you sure you want to exit?", ()=>{
			const remote = require('electron').remote;
			let w = remote.getCurrentWindow();
			w.close();	
		});		
	}

	const remote = require('electron').remote;
	let w = remote.getCurrentWindow();
	$rootScope.currentElectronWindow = w;
});
