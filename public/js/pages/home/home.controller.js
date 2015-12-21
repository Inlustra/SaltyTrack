saltyTrack.controller('HomeController', ['$scope', '$http', '$interval', function ($scope, $http, $interval) {
    $scope.data = {};
    $scope.players = {
        red: {},
        blue: {}
    };

    function refresh() {
        $http.get('/status').then(function (data) {
            data = data.data;
            $scope.currentFight = data.currentFight;
            $scope.players.red = data.redPlayer;
            $scope.players.red.win = data.redPlayerWins;
            $scope.players.blue = data.bluePlayer;
            $scope.players.red.win = data.bluePlayerWins;
        });
    }

    refresh();
    $interval(refresh, 5000, 0);
}]);