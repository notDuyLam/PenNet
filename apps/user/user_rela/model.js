const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../../../configs/db');

const User = require('../model');

class UserRela extends Model {}

UserRela.init(
  {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_from: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: User,
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    user_to: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: User,
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'blocked'),
        allowNull: false,
        defaultValue: 'pending',
    },
  },
  {
    sequelize,
    modelName: 'UserRela',
    tableName: 'user_relas',
    timestamps: true,
  }
);

module.exports = UserRela;