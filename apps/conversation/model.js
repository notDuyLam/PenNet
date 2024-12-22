const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../../configs/db');

class Conversation extends Model {}

Conversation.init(
  {
    is_group: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
  },
  {
    sequelize,
    modelName: 'Conversations',
    tableName: 'conversations',
    timestamps: true,
  }
);

module.exports = Conversation;
