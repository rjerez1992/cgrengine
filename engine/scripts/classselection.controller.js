app.controller('classSelectionController', function($scope, $location, $timeout, $rootScope) {

	$scope.modifyFlag = false;
	$scope.classToModifyId = null;

	$scope.loadClassesFromServer = function(){
		getClassList($rootScope.gameServerSocket, (classes)=>{
			console.log(classes);
			$rootScope.classList = classes;
			$rootScope.$apply();
		}, ()=>{
			displayErrorAlert("Couldn't load classes");
		});
	}
	$scope.loadClassesFromServer();

	$scope.getImageRouteFromSpriteName = function (sname){
		return "client/sprites/chars/"+sname+"_front0.png";		
	}


	/** Model for a new class */
	$scope.newClassModel = {};
	$scope.newClassModel.cname = "NewClass";
	$scope.newClassModel.health = 1;
	$scope.newClassModel.resource = 0;
	$scope.newClassModel.spriteName = "0";

	$scope.openNewClassModal = function(){
		$scope.showNewClassModal = true;		
	}

	$scope.closeNewClassModal = function(){
		$scope.modifyFlag = false;
		$scope.showNewClassModal = false;
		$scope.resetModelValues();
	}

	$scope.createClass = function(){
		console.log("trying to create/update class");

		if (!$scope.modifyFlag){
			createClass($scope.newClassModel.cname, $scope.newClassModel.health,
			$scope.newClassModel.resource, $scope.newClassModel.spriteName, 
			$rootScope.gameServerSocket, ()=>{
				$scope.loadClassesFromServer();
				displayInfoAlert("Class created");
			}, ()=>{
				displayErrorAlert("Couldn't create class");
			});
		}
		else{
			updateClass($scope.classToModifyId , $scope.newClassModel.cname, $scope.newClassModel.health,
			$scope.newClassModel.resource, $scope.newClassModel.spriteName, 
			$rootScope.gameServerSocket, ()=>{
				$scope.loadClassesFromServer();
				displayInfoAlert("Class updated");
			}, ()=>{
				displayErrorAlert("Couldn't update class");
			});
		}

		$scope.closeNewClassModal();
		$scope.modifyFlag = false;
	}

	//Set cosas a new class model y update de ahí
	//Prioridad mas baja a este.
	$scope.modifyClass = function(xclass){
		$scope.newClassModel.cname = xclass.Name;
		$scope.newClassModel.health = xclass.Health;
		$scope.newClassModel.resource = xclass.Resource;
		$scope.newClassModel.spriteName = xclass.SpriteName;
		$scope.openNewClassModal();
		$scope.modifyFlag = true;
		$scope.classToModifyId = xclass.ClassId;
	}

	$scope.deleteClass = function(xclass){
		//TODO: Implement this.
		console.log("Trying to delete: ");
		console.log(xclass);		
	}

	$scope.resetModelValues = function(){
		$scope.newClassModel.cname = "NewClass";
		$scope.newClassModel.health = 1;
		$scope.newClassModel.resource = 0;
		$scope.newClassModel.spriteName = "0";
	}

	
});