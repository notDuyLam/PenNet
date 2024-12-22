const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../../configs/db');

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-Image.png",
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isVerify: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // Add token to check when send email
    verificationToken: {
      type: DataTypes.STRING,
    },

    // Cho chức năng quên mật khẩu
    resetPasswordToken: {
      type: DataTypes.STRING,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false,
  }
);

module.exports = User;
