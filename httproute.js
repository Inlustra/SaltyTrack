var express = require('express');
var cors = require('cors');
var app = express();
var updatesalty = require('./updatesalty');
var Promise = require("bluebird");

var orm = require('sequelize-connect');
var Player = orm.models.Player;
var Fight = orm.models.Fight;

app.use(cors());
app.use(express.static('public'));
app.get('/player/:id', function (req, res) {
    console.log(req.params.id);
    Promise.all([Player.findById(req.params.id), Player.getRoundup(req.params.id)])
        .spread(function (player, data) {
            res.json({
                id: player.id,
                name: player.name,
                roundup: data
            });
        });
});
app.get('/status', function (req, res) {
    Fight.getCurrent().then(function (fight) {
        Promise.all([Player.findById(fight.redPlayerId),
                Player.findById(fight.bluePlayerId)])
            .spread(function (redPlayer, bluePlayer) {
                return Promise.all([redPlayer.getWins().count(),
                        bluePlayer.getWins().count(),
                        redPlayer.getMatches(),
                        bluePlayer.getMatches(),
                        redPlayer.getRoundup(),
                        bluePlayer.getRoundup()])
                    .spread(function (redPlayerWins, bluePlayerWins,
                                      redPlayerMatches, bluePlayerMatches,
                                      redPlayerRoundup, bluePlayerRoundup) {

                        var data = {
                            currentFight: fight,
                            red: {
                                player: redPlayer,
                                wins: redPlayerWins,
                                matches: redPlayerMatches,
                                roundup: redPlayerRoundup[0]
                            },
                            blue: {
                                player: bluePlayer,
                                wins: bluePlayerWins,
                                matches: bluePlayerMatches,
                                roundup: bluePlayerRoundup[0]
                            }
                        };
                        res.json(data);
                    });
            });
    })

});

function start() {

    var server = app.listen(9090, function () {
        var host = server.address().address;
        var port = server.address().port;

        console.log('Example app listening at http://%s:%s', host, port);
    });
}

module.exports = {start: start};