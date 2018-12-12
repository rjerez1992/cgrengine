app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "views/load.htm",
        controller: "loadController"
    })
    .when("/login", {
        templateUrl : "views/login.htm",
        controller: "loginController"
    })
    .when("/menu", {
        templateUrl : "views/menu.htm",
        controller: "menuController"
    })
    .when("/zoneselection", {
        templateUrl : "views/zone-selection.htm",
        controller: "zoneSelectionController"
    })
    .when("/zoneedition", {
        templateUrl : "views/zone-edition.htm",
        controller: "zoneEditionController"
    })
    .when("/mapedition", {
        templateUrl : "views/map-edition.htm",
        controller: "mapEditionController"
    })
    .when("/resourcemanager", {
        templateUrl : "views/resource-manager.htm",
        controller: "resourceManagerController"
    })
    .when("/classselection", {
        templateUrl : "views/class-selection.htm",
        controller: "classSelectionController"
    });


});

