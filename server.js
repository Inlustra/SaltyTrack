var models = require('./models');
var updatesalty = require('./updatesalty');
var http = require('./httproute');

models.start(false);
updatesalty.start();
http.start();
