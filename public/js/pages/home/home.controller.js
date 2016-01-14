saltyTrack.controller('HomeController', ['$scope', '$http', '$interval', function ($scope, $http, $interval) {
    $scope.data = {};
    $scope.players = {
        red: {},
        blue: {}
    };

    function refresh() {
        $http.get('/status').then(function (data) {
            $scope.data = data.data;
        });
    }
    $scope.Math = window.Math;

    refresh();
    $interval(refresh, 3000, 0);
}]);