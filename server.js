var request = require('request');
var Sequelize = require('sequelize');

request('https://www.saltybet.com/zdata.json', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body) // Show the HTML for the Google homepage.
    }
});

var Q = require('q');
var sequelize = new Sequelize('SALTYTRACK', 'user', 'gaN4myhRe6');

var Player = sequelize.define('Player', {}, {
    indexes: [
        {
            unique: true,
            using: 'gin',
            fields: ['name']
        }
    ]
});

var Fight = sequelize.define('Fight', {
    redPlayerAmount: Sequelize.BIGINT,
    bluePlayerAmount: Sequelize.BIGINT,
    blueWinner: Sequelize.BOOLEAN,
    duration: Sequelize.BIGINT
});

Fight.hasOne(Player, {as: 'BluePlayer', through: 'Fight', foreignKey: 'bluePlayerId'});
Fight.hasOne(Player, {as: 'RedPlayer', through: 'Fight', foreignKey: 'redPlayerId'});
Player.belongsToMany(Fight, {as: 'RedPlayer', foreignKey: 'redPlayerId'});
Player.belongsToMany(Fight, {as: 'BluePlayer', foreignKey: 'bluePlayerId'});

function getOrCreatePlayer(name) {
    var deferred = Q.defer();
    Player.find({
        where: {
            name: name
        }
    }).then(function (player) {
        if (!player) {
            createPlayer(name, deferred);
            return deferred.promise;
        }
        deferred.resolve(player);
    });
    return deferred.promise;
}

function createPlayer(name, deferred) {
    Player.create({
        name: name
    }).then(function (player) {
        deferred.resolve(player);
    }, function (reason) {
        deferred.reject(reason);
    })
}

function createFight(blue, red, amount) {
    getOrCreatePlayer(blue)
        .then(function (bluePlayer) {
            getOrCreatePlayer(red)
                .then(function (redPlayer) {
                    Fight.create({redPlayerId: redPlayer.id})
                });
        });
}

sequelize.sync();
