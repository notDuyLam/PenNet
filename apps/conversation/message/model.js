const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../../../configs/db');
const User = require('../../user/model');
const Conversation = require('../../conversation/model');

class Message extends Model {}

Message.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Conversation,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('sent', 'not_read', 'read'),
        allowNull: false,
        defaultValue: 'sent',
    },
  },
  {
    sequelize,
    modelName: 'Messages',
    tableName: 'messages',
    timestamps: true,
  }
);

module.exports = Message;
