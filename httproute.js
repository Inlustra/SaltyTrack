var express = require('express');
var app = express();
var updatesalty = require('./updatesalty');
var exphbs = require('express-handlebars');
var queries = require('./queries');


app.set('views', './views');
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
    var fight = updatesalty.getCurrentFight();
    var redPlayer;
    var bluePlayer;
    var redPlayerWins;
    queries.getPlayer(fight.redPlayerId).then(function (redPlayerObj) {
        redPlayer = redPlayerObj;

    }).then(function () {
        queries.getPlayer(fight.bluePlayerId).then(function (bluePlayerObj) {
            bluePlayer = bluePlayerObj;
        }).then(function () {
            redPlayer.getWinningFights().then(function (data) {
                redPlayerWins = data.length;
                res.render('index', {
                    RedPlayer: redPlayer.name,
                    redPlayerWins: redPlayerWins,
                    BluePlayer: bluePlayer.name
                });
            })
        })
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