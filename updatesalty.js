var request = require('request');
var models = require('sequelize');
var Sequelize = require('sequelize');
var queries = require('./queries');
var Q = require('q');

var player1, player2, currentFightObj, doStop = false;

function performRequest() {
    var deferred = Q.defer();
    request('https://www.saltybet.com/zdata.json', function (error, response, body) {
        body = JSON.parse(body);
        if (player1 != body.p1name || player2 != body.p2name) {
            console.log("NEW FIGHT: Red: " + body.p1name + "/" + body.p2total + " Blue: " + body.p2name + "/" + body.p2total);
            player1 = body.p1name;
            player2 = body.p2name;
            if (currentFightObj)
                currentFightObj.update({
                    finishedAt: Sequelize.NOW
                });
            queries.createFight(player1, player2).then(function (fight) {
                currentFightObj = fight;
                deferred.resolve(currentFightObj);
            }, function (error) {
                console.log(error);
                deferred.reject(error);
            });
            return;
        }
        var player1Total = body.p1total.replace(',', '');
        var player2Total = body.p2total.replace(',', '');
        var winner = null;
        if (body.status == "1") {
            winner = player1;
        } else if (body.status == "2") {
            winner = player2;
        }
        console.log("Updating totals: " + body.p1name + "/" + body.p1total + " Blue: " + body.p2name + "/" + body.p2total + "" + (winner !== null ? (" WINNER: " + (winner)) : ""));
        queries.getPlayer(winner).then(function (winningPlayer) {
            currentFightObj.update({
                redPlayerAmount: player1Total,
                bluePlayerAmount: player2Total,
                winner: winningPlayer.id
            }).then(function (currentFight) {
                deferred.resolve(currentFight);
            }, function (error) {
                console.log(error);
                deferred.reject(error);
            });
        })
    });
    return deferred.promise;
}

function update() {
    performRequest().then(function (fight) {
        if (!doStop)
            setTimeout(update, 5000);
    }, function (error) {
        console.log(error);
        update();
    });
}

function stop() {
    doStop = true;
}

module.exports = {
    start: update,
    stop: stop,
    updateFight: performRequest,
    getCurrentFight: function () {
        return currentFightObj;
    }
};
