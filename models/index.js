const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'wallets.sqlite',
});

const Wallet = sequelize.define('Wallet', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    privateKey: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    metadata: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

sequelize.sync();

module.exports = { Wallet, sequelize };
