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

function createFight(red, blue, status) {
    return Q.all([getOrCreatePlayer(blue), getOrCreatePlayer(red)])
        .spread(function (bluePlayer, redPlayer) {
            return models.Fight.create({
                redPlayerId: redPlayer.id,
                bluePlayerId: bluePlayer.id,
                status: status
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
    return models.sequelize.query('SELECT fight.id,' +
        '    IF(rPlayer.id=:playerId, bPlayer.id, rPlayer.id) as OpposingPlayerId,' +
        '    IF(rPlayer.id=:playerId, bPlayer.name, rPlayer.name) as OpposingPlayerName,' +
        '    IF(rPlayer.id=:playerId,  bluePlayerAmount, redPlayerAmount) as OpposingBet,' +
        '    IF(rPlayer.id=:playerId, redPlayerAmount, bluePlayerAmount) as HomeBet,' +
        '    IF(wPlayer.id=:playerId, 1, 0) as WonGame,' +
        '    (fight.finishedAt - fight.createdAt) as Duration' +
        '    FROM Fights fight' +
        '    INNER JOIN Players bPlayer ON fight.bluePlayerId = bPlayer.id' +
        '    INNER JOIN Players rPlayer ON fight.redPlayerId = rPlayer.id' +
        '    INNER JOIN Players wPlayer ON fight.winningPlayerId = wPlayer.id' +
        '    WHERE rPlayer.id = :playerId OR bPlayer.id = :playerId LIMIT 10;', {
        replacements: {playerId: player}, type: models.sequelize.QueryTypes.SELECT
    });
}

function playerRoundup(player) {
    return models.sequelize.query('SELECT *,(WinCount / MatchCount) as WinRatio FROM (SELECT COUNT(fight.id) as MatchCount, AVG(fight.finishedAt - fight.createdAt) as AverageDuration,' +
        '    AVG(IF(bPlayer.id =:playerId,bluePlayerAmount,0)+IF(rPlayer.id =:playerId,redPlayerAmount,0)) as AverageBets,' +
        '    AVG(IF(IF(bPlayer.id =:playerId,bluePlayerAmount,0)+IF(rPlayer.id =:playerId,redPlayerAmount,0) >' +
        '        IF(bPlayer.id =:playerId,redPlayerAmount,0)+IF(rPlayer.id =:playerId,bluePlayerAmount,0),' +
        '        (IF(bPlayer.id =:playerId,bluePlayerAmount,0)+IF(rPlayer.id =:playerId,redPlayerAmount,0))/' +
        '        (IF(bPlayer.id =:playerId,redPlayerAmount,0)+IF(rPlayer.id =:playerId,bluePlayerAmount,0)) ,1)) as BetRatio,' +
        '    SUM(IF(wPlayer.id =:playerId,1,0)) as WinCount' +
        '    FROM Fights fight' +
        '    INNER JOIN Players bPlayer ON fight.bluePlayerId = bPlayer.id' +
        '    INNER JOIN Players rPlayer ON fight.redPlayerId = rPlayer.id' +
        '    INNER JOIN Players wPlayer ON fight.winningPlayerId = wPlayer.id' +
        '    WHERE rPlayer.id =:playerId OR bPlayer.id =:playerId) as Query', {
        replacements: {playerId: player}, type: models.sequelize.QueryTypes.SELECT
    });
}

module.exports = {
    createFight: createFight,
    getPlayer: getOrCreatePlayer,
    currentFight: currentFight,
    getPlayerById: getPlayer,
    getPlayerWins: playerWins,
    getPlayerMatches: playerMatches,
    getPlayerRoundup: playerRoundup,
    noWinnerMatches: noWinnerMatches
};