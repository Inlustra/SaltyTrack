var express = require('express');
var cors = require('cors')
var app = express();
var updatesalty = require('./updatesalty');
var queries = require('./queries');
var models = require('./models');

var Q = require('q');


app.use(cors());
app.use(express.static('public'));
app.get('/player/:id', function (req, res) {
    console.log(req.params.id);
    Q.all([queries.getPlayerById(req.params.id), queries.getPlayerRoundup(req.params.id)])
        .spread(function (player, data) {
            res.json({
                id: player.id,
                name: player.name,
                roundup: data
            });
        });
});
app.get('/status', function (req, res) {
    queries.currentFight().then(function (fight) {
        Q.all([queries.getPlayerById(fight.redPlayerId),
                queries.getPlayerById(fight.bluePlayerId)])
            .spread(function (redPlayer, bluePlayer) {
                return Q.all([queries.getPlayerWins(redPlayer.id).count(),
                        queries.getPlayerWins(bluePlayer.id).count(),
                        queries.getPlayerMatches(bluePlayer.id).findAll(),
                        queries.getPlayerMatches(redPlayer.id).findAll(),
                        queries.getPlayerRoundup(redPlayer.id),
                        queries.getPlayerRoundup(bluePlayer.id)])
                    .spread(function (redPlayerWins, bluePlayerWins, bluePlayerMatches, redPlayerMatches,
                                      redPlayerRoundup,
                                      bluePlayerRoundup) {

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