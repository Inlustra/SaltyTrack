var models = require('./models');
var updatesalty = require('./updatesalty');
var http = require('./httproute');

models.start(true);
updatesalty.start();
http.start();
