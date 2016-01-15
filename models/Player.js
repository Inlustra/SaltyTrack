"use strict";

module.exports = function (Sequelize, DataTypes) {
    Sequelize.define('Player', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true // Automatically gets converted to SERIAL for postgres
        },
        name: DataTypes.STRING
    }, {
        defaultScope: {
            attributes: ['id', 'name']
        },
        scopes: {
            roundup: ""
        },
        indexes: [
            {
                unique: true,
                fields: ['name']
            }
        ]
    });
};
