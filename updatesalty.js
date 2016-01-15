var request = require('request');
var Sequelize = require('sequelize');
var queries = require('./queries');
var Q = require('q');

String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.replace(new RegExp(find, 'g'), replace);
};

function SaltyState() {
    this.id = null;
    this.redPlayer = {};
    this.bluePlayer = {};
    this.redPlayerAmount = null;
    this.bluePlayerAmount = null;
    this.createdAt = null;
    this.finishedAt = null;
    this.status = null;

    this.setRedPlayer = function (name) {
        var deferred = Q.defer();
        var that = this;
        queries.getPlayer(name)
            .then(function (player) {
                that.redPlayer = player.dataValues;
                deferred.resolve();
            });
        return deferred.promise;
    };

    this.setBluePlayer = function (name) {
        var deferred = Q.defer();
        var that = this;
        queries.getPlayer(name)
            .then(function (player) {
                that.bluePlayer = player.dataValues;
                deferred.resolve();
            });
        return deferred.promise;
    };

    this.getWinner = function () {
        if (this.status == "1") {
            return this.redPlayer.id;
        } else if (this.status == "2") {
            return this.bluePlayer.id;
        }
        return null;
    };

    this.getWinnerId = function () {
        var winner = this.getWinner();
        return winner ? winner.id : null;
    };

    this.isEnded = function () {
        return this.finishedAt != null;
    };

    this.endMatch = function () {
        this.finishedAt = new Date();
        console.info("Ended fight!");
    };

    this.isSameFight = function (fight) {
        return fight.redPlayer.id == this.redPlayer.id && this.redPlayer.id != null
            && fight.bluePlayer.id == this.bluePlayer.id && this.bluePlayer.id != null;
    };

    this.update = function (fight) {
        this.redPlayerAmount = fight.redPlayerAmount;
        this.bluePlayerAmount = fight.bluePlayerAmount;
        this.status = fight.status;
        if (this.isEnded()) {
            return;
        }
        if (this.getWinner() == null) {
            return;
        }
        this.endMatch();
    };

    this.toDatabase = function () {
        return {
            id: this.id,
            redPlayerId: this.redPlayer.id,
            bluePlayerId: this.bluePlayer.id,
            winningPlayerId: this.getWinnerId(),
            createdAt: this.createdAt,
            redPlayerAmount: this.redPlayerAmount,
            bluePlayerAmount: this.bluePlayerAmount,
            finishedAt: this.finishedAt,
            status: this.status
        };
    };
}

SaltyState.toState = function (fight) {
    var promise = Q.defer();
    var state = new SaltyState();
    state.createdAt = new Date();
    state.status = fight.status;
    state.redPlayerAmount = fight.p1total.replaceAll(',', '');
    state.bluePlayerAmount = fight.p2total.replaceAll(',', '');
    Q.all([state.setRedPlayer(fight.p1name), state.setBluePlayer(fight.p2name)])
        .then(function () {
            promise.resolve(state);
        });
    return promise.promise;
};

function SaltyTrack() {
    this.state = new SaltyState();
}

SaltyTrack.prototype.getState = function () {
    var deferred = Q.defer();
    request('https://www.saltybet.com/state.json', function (error, response, body) {
        deferred.resolve(JSON.parse(body));
    });
    return deferred.promise;
};

SaltyTrack.prototype.getZData = function () {
    var deferred = Q.defer();
    request('https://www.saltybet.com/zdata.json', function (error, response, body) {
        deferred.resolve(JSON.parse(body));
    });
    return deferred.promise;
};

SaltyTrack.prototype.update = function () {
    var that = this;
    this.getState()
        .then(SaltyState.toState)
        .then(function (json) {
            if (that.state.isSameFight(json)) {
                that.state.update(json);
            } else {
                that.state = json;
            }
            return Q.when(that.state.toDatabase());
        })
        .then(function (data) {
            if (data.id != null) {
                queries.updateFight(data);
                console.log("Updated the current fight between " + that.state.redPlayer.name + " and " + that.state.bluePlayer.name);
                return Q.when(data);
            } else {
                console.log("Created new fight between " + that.state.redPlayer.name + " and " + that.state.bluePlayer.name);
                return queries.createFight(data);
            }
        })
        .then(function (database) {
            that.state.id = database.id;
        })
        .catch(function (error) {
            console.error(error);
        });
};

SaltyTrack.prototype.start = function () {
    setInterval(this.update.bind(this), 3000);
};


module.exports = new SaltyTrack();
