app.controller('loginController', function($scope, $location, $rootScope, $timeout) {	

	if (bgmList["field3"]!=null){
		bgmList["field3"].pause();
	}

	$scope.loginData = {};
	$scope.loginData.username = "";
	$scope.loginData.password = "";
	$scope.creatingAccount = false;

	$scope.newAccountData = {};
	$scope.newAccountData.username = "";
	$scope.newAccountData.password = "";
	$scope.newAccountData.email = "";

	if ($rootScope.currentAccount != null){
		$location.path("/characters");
	}

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

  	$scope.doLogin = function(){
  		if ($scope.loginData.username == "" || $scope.loginData.password ==""){
  			displayErrorAlert("Please enter your credentials");
  			return;
  		}
		loginRequest($scope.loginData.username, sha256($scope.loginData.password), (token)=>{
			//Success
			$rootScope.currentAccount = {};
			$rootScope.currentAccount.username = $scope.loginData.username;
			$rootScope.currentAccount.token = token;
			//console.log("TOKEN: "+token);
			$location.path("/characters");
			$scope.$apply();
		}, (message)=>{
			//Error
			$scope.loginData.password = "";
			$scope.$apply();
			displayErrorAlert(message);
		});
  	}

  	$scope.toggleCreateAccount = function(){
  		$scope.creatingAccount = !$scope.creatingAccount;  	
		$scope.newAccountData.username = "";
		$scope.newAccountData.password = "";
		$scope.newAccountData.email = "";	
		$scope.loginData.username = "";
		$scope.loginData.password = "";
  	}

  	$scope.createAccount = function(){ 	
  		if ($scope.newAccountData.username == "" || $scope.newAccountData.password=="" || $scope.newAccountData.email==""){
  			displayErrorAlert("Please fill out the fields");
  			return;
  		}
  		if (!validateEmail($scope.newAccountData.email)){
  			displayErrorAlert("Please enter a valid email");
  			return;
  		}

  		createAccountRequest($scope.newAccountData.username, sha256($scope.newAccountData.password), $scope.newAccountData.email, ()=>{
			//Success			
			$scope.toggleCreateAccount();
			$scope.$apply();
			displayInfoAlert("Account created. Please sign in");
		}, (message)=>{
			//Error
			$scope.newAccountData.password = "";
			$scope.$apply();
			displayErrorAlert(message);
		});
  	}

  	function validateEmail(email) 
	{
	    var re = /\S+@\S+\.\S+/;
	    return re.test(email);
	}
});