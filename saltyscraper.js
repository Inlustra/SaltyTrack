var cheerio = require('cheerio');
var fs = require('fs');

function SaltyScraper() {

}

SaltyScraper.prototype.toColumnName = function(col) {

}

SaltyScraper.prototype.scrape = function (file) {
    var $ = cheerio.load(fs.readFileSync(file));
    var cols = [];
    var data = []
    $('thead tr th').each(function (index, element) {
        switch($(this).text()) {
            case 'Name':
                break;
        }
    });
    $('tbody tr').each(function (id, element) {
        data[id] = {};
        $(this).children().each(function (cid, element) {
            data[id][cols[cid]] = $(this).text();
        })
    });
    console.log(data[0]);
};

module.exports = new SaltyScraper();