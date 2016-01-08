saltyTrack.controller('HomeController', ['$scope', '$http', '$interval', function ($scope, $http, $interval) {
    $scope.data = {};
    $scope.players = {
        red: {},
        blue: {}
    };

    function refresh() {
        $http.get('http://salty.thenairn.com/status').then(function (data) {
            $scope.data = data.data;
        });
    }

    refresh();
    $interval(refresh, 5000, 0);
}]);