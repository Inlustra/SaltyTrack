var orm = require('sequelize-singleton');
orm.discover = ['/models'];
orm.connect('SaltyTrack', 'user', 'gaN4myhRe6', {
    host: 'box.thenairn.com',
    dialect: 'mysql',
    logging: console.log
});

module.exports = singleton.getInstance();