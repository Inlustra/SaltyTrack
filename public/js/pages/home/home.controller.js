saltyTrack.controller('HomeController', ['$scope', '$interval', 'EntityAPI', 'Status', function ($scope, $interval, EntityAPI, Status) {
    $scope.data = {};
    $scope.players = {
        red: {},
        blue: {}
    };

    function refresh() {
        EntityAPI.get('/status').singular().as(Status).then(function (data) {
            console.log(data);
            $scope.data = data;
        });
    }

    $scope.Math = window.Math;

    refresh();
    $interval(refresh, 30000, 0);
}]);