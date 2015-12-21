var express = require('express');
var app = express();
var updatesalty = require('./updatesalty');
var queries = require('./queries');
var models = require('./models');

var Q = require('q');


app.use(express.static('public'));

app.get('/status', function (req, res) {
    var fight = updatesalty.getCurrentFight();
    Q.all([queries.getPlayerById(fight.redPlayerId),
            queries.getPlayerById(fight.bluePlayerId)])
        .spread(function (redPlayer, bluePlayer) {
            return Q.all([queries.getPlayerWins(redPlayer.id).count(),
                    queries.getPlayerWins(bluePlayer.id).count(),
                    queries.getPlayerMatches(bluePlayer.id).findAll(),
                    queries.getPlayerMatches(redPlayer.id).findAll()])
                .spread(function (redPlayerWins, bluePlayerWins, bluePlayerMatches, redPlayerMatches) {
                    var data = {
                        currentFight: fight,
                        redPlayer: redPlayer,
                        bluePlayer: bluePlayer,
                        redPlayerWins: redPlayerWins,
                        redPlayerMatches: redPlayerMatches,
                        bluePlayerWins: bluePlayerWins,
                        bluePlayerMatches: bluePlayerMatches
                    };
                    res.json(data);
                });
        });
});

function start() {

    var server = app.listen(9090, function () {
        var host = server.address().address;
        var port = server.address().port;

        console.log('Example app listening at http://%s:%s', host, port);
    });
}

module.exports = {start: start};