saltyTrack.controller('HomeController', ['$scope', '$http', '$interval', function ($scope, $http, $interval) {
    $scope.data = {};
    $scope.players = {
        red: {},
        blue: {}
    };

    function refresh() {
        $http.get('http://localhost:9090/status').then(function (data) {
            $scope.data = data.data;
        });
    }
    $scope.Math = window.Math;

    refresh();
    $interval(refresh, 5000, 0);
}]);