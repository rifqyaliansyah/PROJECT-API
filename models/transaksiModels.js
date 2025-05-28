const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Transaksi = db.define('transaksi', {
    id: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
    },
    biaya_layanan: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    freezeTableName: true
});

module.exports = Transaksi;
