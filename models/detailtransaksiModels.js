const { DataTypes } = require('sequelize');
const db = require('../config/database');
const Transaksi = require('./transaksiModels');
const Produk = require('./produkModels');

const DetailTransaksi = db.define('detail_transaksi', {
    id: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
    },
    transaksi_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        references: {
            model: Transaksi,
            key: 'id'
        }
    },
    produk_id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        references: {
            model: Produk,
            key: 'id'
        }
    },
    kuantitas: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    harga_satuan: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: { 
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false 
    }
}, {
    freezeTableName: true
});

Transaksi.hasMany(DetailTransaksi, {
    foreignKey: 'transaksi_id',
    sourceKey: 'id'
});

DetailTransaksi.belongsTo(Transaksi, {
    foreignKey: 'transaksi_id',
    targetKey: 'id'
});

DetailTransaksi.belongsTo(Produk, {
    foreignKey: 'produk_id',
    targetKey: 'id'
});

module.exports = DetailTransaksi;
