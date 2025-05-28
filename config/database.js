const Sequelize = require('sequelize');

const db = new Sequelize('db_fnb', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
});

module.exports = db;