(function () {
    'use strict';

    app.factory('SaltyUpdater', function (envService) {
        return envService.read();
    });
}());