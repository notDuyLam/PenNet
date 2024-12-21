const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../../../configs/db');
const User = require('../../user/model');
const Conversation = require('../../conversation/model');

class Participant extends Model {}

Participant.init(
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
  },
  {
    sequelize,
    modelName: 'Participants',
    tableName: 'participants',
    timestamps: true,
  }
);

module.exports = Participant;
