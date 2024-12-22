const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../../../configs/db');

const User = require('../model');

class UserInfo extends Model {}

UserInfo.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE', // Delete User -> Delete UserInfo
      onUpdate: 'CASCADE',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    sequelize,
    modelName: 'UserInfo',
    tableName: 'user_infos',
    timestamps: false,
  }
);

module.exports = UserInfo;