app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "views/login.htm",
        controller: "loginController"
    })
    .when("/characters", {
        templateUrl : "views/characters.htm",
        controller: "charactersController"
    })
    .when("/game", {
        templateUrl : "views/game.htm",
        controller: "gameController"
    });

});

