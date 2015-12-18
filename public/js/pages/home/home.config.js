saltyTrack.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    // Now set up the states
    $stateProvider
        .state('home', {
            url: "/",
            controller: "HomeController",
            templateUrl: "js/pages/home/home.html"
        })
}]);