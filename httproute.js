var express = require('express');
var app = express();
var updatesalty = require('./updatesalty');
var exphbs = require('express-handlebars');
var queries = require('./queries');
var models = require('./models');

var Q = require('q');


app.set('views', './views');
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/status', function (req, res) {
    var fight = updatesalty.getCurrentFight();
    Q.all([queries.getPlayerById(fight.redPlayerId),
            queries.getPlayerById(fight.bluePlayerId)])
        .spread(function (redPlayer, bluePlayer) {
            return Q.all([queries.getPlayerWins(redPlayer.id),
                    queries.getPlayerWins(bluePlayer.id)])
                .spread(function (redPlayerWins, bluePlayerWins) {
                    var data = {
                        currentFight: fight,
                        redPlayer: redPlayer,
                        bluePlayer: bluePlayer,
                        redPlayerWins: redPlayerWins,
                        bluePlayerWins: bluePlayerWins
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