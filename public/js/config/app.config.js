saltyTrack.config(['$stateProvider', '$urlRouterProvider', 'EntityAPIProvider',
    function ($stateProvider, $urlRouterProvider, EntityAPIProvider) {
        //
        // For any unmatched url, redirect to /state1
        $urlRouterProvider.otherwise("/");
        //EntityAPIProvider.setApiUrl('127.0.0.1:9090');
        //
    }
]);