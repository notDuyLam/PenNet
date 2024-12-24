const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = require("../../../configs/db");
const Message = require("../../conversation/message/model");
const Post = require("../model");

class Attachment extends Model {}

Attachment.init(
  {
    message_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Message,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Post,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    media_url: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Attachment",
    tableName: "attachments",
    timestamps: true,
  }
);

module.exports = Attachment;
