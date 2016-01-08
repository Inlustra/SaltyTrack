saltyTrack.run(['$state', function ($state) {
    $state.transitionTo('home');
    console.log("dsf");

    Number.prototype.round = function(places) {
        return +(Math.round(this + "e+" + places)  + "e-" + places);
    }
}])