modules.exports = function (Sequelize, DataTypes) {
    var Fight = Sequelize.define('Fight', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true // Automatically gets converted to SERIAL for postgres
        },
        finishedAt: DataTypes.DATE,
        redPlayerAmount: DataTypes.BIGINT,
        bluePlayerAmount: DataTypes.BIGINT,
        redPlayerId: {type: DataTypes.INTEGER, defaultValue: null, allowNull: true},
        bluePlayerId: {type: DataTypes.INTEGER, defaultValue: null, allowNull: true},
        winningPlayerId: {type: DataTypes.INTEGER, defaultValue: null, allowNull: true},
        status: DataTypes.STRING,
        duration: {
            type: DataTypes.VIRTUAL,
            get: function () {
                var finished = this.get('finishedAt');
                var end = finished ? new Date(finished) : new Date();
                return (end.getTime() - new Date(this.createdAt).getTime()) / 1000;
            }
        }
    }, {
        defaultScope: {
            attributes: ['duration', 'redPlayerAmount', 'bluePlayerAmount', 'redPlayerId', 'bluePlayerId', 'winningPlayerId', 'finishedAt', 'createdAt']
        },
        scopes: {
            winning: function (id) {
                return {
                    where: {
                        winningPlayerId: id
                    }
                }
            },
            nowinner: function () {
                return {
                    where: {
                        winningPlayerId: null
                    }
                }
            },
            matches: function (id) {
                return {
                    attributes: ['redPlayerAmount', 'bluePlayerAmount', 'winningPlayerId', 'duration'],
                    where: {
                        $or: [
                            {
                                bluePlayerId: id
                            },
                            {
                                redPlayerId: id
                            }
                        ],
                        $and: {
                            winningPlayerId: {
                                $ne: null
                            }
                        }
                    }
                }
            }
        },
        classMethods: {
            associate: function (models) {
                Fight.belongsTo(models.Player, {as: 'RedPlayer', foreignKey: 'redPlayerId'});
                Fight.belongsTo(models.Player, {as: 'BluePlayer', foreignKey: 'bluePlayerId'});
                Fight.belongsTo(models.Player, {
                    as: 'WinningPlayer',
                    foreignKey: 'winningPlayerId'
                });
            }
        }
    });

    return Fight;
};