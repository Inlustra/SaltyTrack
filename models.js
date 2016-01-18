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
    defaultScope: {
        attributes: ['id', 'name'],
    },
    indexes: [
        {
            unique: true,
            fields: ['name']
        }
    ]
});


module.exports = {
    Player: Player,
    Fight: Fight,
    start: function (drop) {
        sequelize.sync({logging: console.log, force: drop});
    }
};