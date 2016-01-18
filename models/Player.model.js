"use strict";
var Promise = require("bluebird");

module.exports = function (sequelize, DataTypes) {
    var Player = sequelize.define('Player', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true // Automatically gets converted to SERIAL for postgres
        },
        name: DataTypes.STRING
    }, {
        defaultScope: {
            attributes: ['id', 'name']
        },
        scopes: {
            roundup: ""
        },
        indexes: [
            {
                unique: true,
                fields: ['name']
            }
        ],
        classMethods: {
            associate: function (models) {
                Player.hasMany(models.Fight, {as: 'RedPlayer', foreignKey: 'redPlayerId'});
                Player.hasMany(models.Fight, {as: 'BluePlayer', foreignKey: 'bluePlayerId'});
                Player.hasMany(models.Fight, {as: 'WinningPlayer', foreignKey: 'winningPlayerId'});
            },
            findById: function (id) {
                return Player.find({
                    where: {
                        id: id
                    }
                });
            },
            getOrCreate: function (name) {
                return this.find({
                    where: {
                        name: name
                    }
                }).then(function (player) {
                    if (!player) {
                        return this.create({
                            name: name
                        });
                    }
                    return Promise.resolve(player);
                });
            }
        },
        instanceMethods: {
            getWins: function () {
                return sequelize.models.Fight.scope({method: ['winning', this.id]})
            },
            getMatches: function () {
                return sequelize.query('SELECT fight.id,' +
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
                    replacements: {playerId: this.id}, type: sequelize.QueryTypes.SELECT
                });
            },
            getRoundup: function () {
                return sequelize.query('SELECT *,(WinCount / MatchCount) as WinRatio FROM (SELECT COUNT(fight.id) as MatchCount, AVG(fight.finishedAt - fight.createdAt) as AverageDuration,' +
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
                    replacements: {playerId: this.id}, type: sequelize.QueryTypes.SELECT
                });
            }
        }
    });

    return Player;
};
