saltyTrack.factory('Status', function (Entity, Player, EntityMutator) {

    function Status() {
    }

    Status.prototype.blue = new EntityMutator(Player);
    Status.prototype.red = new EntityMutator(Player);

    Status.prototype.clone = function () {
        console.log(this);
    };

    return angular.extend(Status, Entity);
});