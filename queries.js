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
    return Q.all([getOrCreatePlayer(blue), getOrCreatePlayer(red)])
        .spread(function (bluePlayer, redPlayer) {
            return models.Fight.create({
                redPlayerId: redPlayer.id,
                bluePlayerId: bluePlayer.id
            });
        });
}

function currentFight() {
    return models.Fight.find({
        order: [['createdAt', 'DESC']]
    });
}

function getPlayer(id) {
    return models.Player.find({
        where: {
            id: id
        }
    });
}

function playerWins(player) {
    return models.Fight.scope({method: ['winning', player]});
}

function noWinnerMatches() {
    return models.Fight.scope({method: ['nowinner']});
}

function playerMatches(player) {
    return models.Fight.scope({method: ['matches', player]});
}

module.exports = {
    createFight: createFight,
    getPlayer: getOrCreatePlayer,
    currentFight: currentFight,
    getPlayerById: getPlayer,
    getPlayerWins: playerWins,
    getPlayerMatches: playerMatches,
    noWinnerMatches: noWinnerMatches
};