var Sequelize = require('sequelize');

var sequelize = new Sequelize('SALTYTRACK', 'user', 'gaN4myhRe6', {
    host: 'box.thenairn.com',
    dialect: 'mysql',
    logging: console.log
});

var Player = sequelize.define('Player', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true // Automatically gets converted to SERIAL for postgres
    },
    name: Sequelize.STRING
}, {
    indexes: [
        {
            unique: true,
            fields: ['name']
        }
    ]
});

var Fight = sequelize.define('Fight', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true // Automatically gets converted to SERIAL for postgres
    },
    finishedAt: Sequelize.DATE,
    redPlayerAmount: Sequelize.BIGINT,
    bluePlayerAmount: Sequelize.BIGINT,
    redPlayerId: {type: Sequelize.INTEGER, defaultValue: null, allowNull: true},
    bluePlayerId: {type: Sequelize.INTEGER, defaultValue: null, allowNull: true},
    winningPlayerId: {type: Sequelize.INTEGER, defaultValue: null, allowNull: true}
}, {
    scopes: {
        winning: function (id) {
            return {
                where: {
                    winningPlayerId: id
                }
            }
        }
    }
});

Fight.belongsTo(Player, {as: 'RedPlayer', foreignKey: 'redPlayerId'});
Fight.belongsTo(Player, {as: 'BluePlayer', foreignKey: 'bluePlayerId'});
Fight.belongsTo(Player, {
    as: 'WinningPlayer',
    foreignKey: 'winningPlayerId'
});
Player.hasMany(Fight, {as: 'RedPlayer', foreignKey: 'redPlayerId'});
Player.hasMany(Fight, {as: 'BluePlayer', foreignKey: 'bluePlayerId'});
Player.hasMany(Fight, {as: 'WinningPlayer', foreignKey: 'winningPlayerId'});

module.exports = {
    Player: Player,
    Fight: Fight,
    start: function (drop) {
        sequelize.sync({logging: console.log, force: drop});
    }
};