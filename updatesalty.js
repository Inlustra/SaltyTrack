var request = require('request');
var models = require('sequelize');
var Sequelize = require('sequelize');
var queries = require('./queries');
var Q = require('q');

var player1, player2, currentFightObj, doStop = false, finished = false;
String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.replace(new RegExp(find, 'g'), replace);
};

function SaltyTrack () {
    this.player1 = null;
    this.player2 = null;
    this.currentFight = null;
}

SaltyTrack.prototype.getState = function() {
    var deferred = Q.defer();
    request('https://www.saltybet.com/state.json', function (error, response, body) {
        body.p1total = body.p1total.replaceAll(',', '');
        body.p2total = body.p2total.replaceAll(',', '');
        deferred.resolve(JSON.parse(body));
    });
    return deferred;
};

SaltyTrack.prototype.getZData = function() {
    var deferred = Q.defer();
    request('https://www.saltybet.com/zdata.json', function (error, response, body) {
        body.p1total = body.p1total.replaceAll(',', '');
        body.p2total = body.p2total.replaceAll(',', '');
        deferred.resolve(JSON.parse(body));
    });
    return deferred;
};

SaltyTrack.prototype.update = function() {
    Q.all(this.getState())
        .then(this.getFight)
        .then(this.checkWinner);
};

SaltyTrack.prototype.getFight = function(state) {
    var deferred = Q.defer();
    var that = this;
    if (that.player1 != state.p1name || that.player2 != state.p2name) {
        queries.createFight(player1, player2, state.status).then(function (fight) {
            that.player1 = state.p1name;
            that.player2 = state.p2name;
            that.currentFight = fight;
            deferred.resolve(that.currentFight);
        }, function (error) {
            console.log(error);
            deferred.reject(error);
        });
    } else {
        SaltyTrack.currentFight.update(updating).then(function (currentFight) {
            deferred.resolve(currentFight);
        }, function (error) {
            console.log(error);
            deferred.reject(error);
        });
        deferred.resolve(SaltyTrack.currentFight);
    }
    return deferred;
};

function checkWinner() {
    return null;
}


function updateSalty() {
    getState()
        .then(updateState)

}

function getState() {
}

function getZData() {
}

function isNewFight(status) {

}

function updateState(state) {

}

function performRequest() {
    request('https://www.saltybet.com/zdata.json', function (error, response, body) {
        body = JSON.parse(body);
        if (player1 != body.p1name || player2 != body.p2name) {
            console.log("NEW FIGHT: Red: " + body.p1name + "/" + body.p1total + " Blue: " + body.p2name + "/" + body.p2total);
            finished = false;
            player1 = body.p1name;
            player2 = body.p2name;

            return;
        }
        var player1Total = body.p1total.replaceAll(',', '');
        var player2Total = body.p2total.replaceAll(',', '');
        var winner = null;
        if (body.status == "1") {
            winner = player1;
        } else if (body.status == "2") {
            winner = player2;
        }
        var updating = {
            redPlayerAmount: player1Total,
            bluePlayerAmount: player2Total
        };
        if (winner != null) {
            if (!finished) {
                updating.finishedAt = Sequelize.fn('NOW');
                finished = true;
            }
            queries.getPlayer(winner).then(function (winningPlayer) {
                updating.winningPlayerId = winningPlayer.id;
                currentFightObj.update(updating).then(function (currentFight) {
                    deferred.resolve(currentFight);
                }, function (error) {
                    console.log(error);
                    deferred.reject(error);
                });
            });
        } else {
            currentFightObj.update(updating).then(function (currentFight) {
                deferred.resolve(currentFight);
            }, function (error) {
                console.log(error);
                deferred.reject(error);
            });
        }
        console.log("Updating totals: " + body.p1name + "/" + body.p1total + " Blue: " + body.p2name + "/" + body.p2total + "" + (winner !== null ? (" WINNER: " + (winner)) : ""));

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
