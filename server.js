var orm = require('sequelize-connect');
var SaltyScraper = require('./saltyscraper');

SaltyScraper.scrape(__dirname + '/todo.html');

orm.discover = [__dirname+'/models'];
orm.connect('SaltyTrack', 'user', 'gaN4myhRe6', {
    host: 'box.thenairn.com',
    dialect: 'mysql',
    logging: console.log
}).then(function () {
    orm.models = orm.sequelize.models;
    var updatesalty = require('./updatesalty');
    var http = require('./httproute');
    orm.models.Fight.getIncompleteMatches().findAll().then(function (fights) {
        fights.forEach(function (fight) {
            fight.destroy();
        })
    });
    updatesalty.start();
    http.start();
});
