const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../../configs/db');
const User = require('../user/model');

class Post extends Model {}

Post.init(
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    access_modifier: {
      type: DataTypes.ENUM('public', 'private', 'friends_only'),
      allowNull: false,
      defaultValue: 'public',
    },
    like_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    shared_post_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'posts',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'Post',
    tableName: 'posts',
    timestamps: true,
  }
);

module.exports = Post;
