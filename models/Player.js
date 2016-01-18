"use strict";

module.exports = function (Sequelize, DataTypes) {
    var Player = Sequelize.define('Player', {
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
            }
        }
    });

    return Player;
};
