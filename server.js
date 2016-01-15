var models = require('./models/models');
var queries = require('./queries');
var updatesalty = require('./updatesalty');
var http = require('./httproute');

models.start(false);
queries.noWinnerMatches().findAll().then(function (fights) {
    fights.forEach(function (fight) {
        fight.destroy();
    })
});
updatesalty.start();
http.start();
