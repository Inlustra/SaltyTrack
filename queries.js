var models = require('./models');
var Q = require('q');

function getOrCreatePlayer(name) {
    var deferred = Q.defer();
    models.Player.find({
        where: {
            name: name
        }
    }).then(function (player) {
        if (!player) {
            return createPlayer(name, deferred);
        }
        deferred.resolve(player);
    }, function (error) {
        deferred.reject(error);
    });
    return deferred.promise;
}

function createPlayer(name, deferred) {
    models.Player.create({
        name: name
    }).then(function (player) {
        deferred.resolve(player);
    }, function (reason) {
        deferred.reject(reason);
    });
    return deferred.promise;
}

function createFight(red, blue, amount) {
    var deferred = Q.defer();
    getOrCreatePlayer(blue)
        .then(function (bluePlayer) {
            getOrCreatePlayer(red)
                .then(function (redPlayer) {
                    models.Fight.create({
                        redPlayerId: redPlayer.id,
                        bluePlayerId: bluePlayer.id
                    }).then(function (fight) {
                        deferred.resolve(fight);
                    }, function (error) {
                        deferred.reject(error);
                    })
                }, function (error) {
                    deferred.reject(error);
                });
        }, function (error) {
            deferred.reject(error);
        });
    return deferred.promise;
}

function currentFight() {
    return models.Fight.find({
        where: {
            finishedAt: null
        }
    });
}

function getPlayer(id) {
    return models.Player.find({
        where: {
            id: id
        }
    });
}

module.exports = {
    createFight: createFight,
    getPlayer: getOrCreatePlayer,
    currentFight: currentFight,
    getPlayer: getPlayer
};