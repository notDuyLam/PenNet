const { DataTypes } = require("sequelize");
const db = require("../../config/db");

// Định nghĩa schema cho bảng Users
const User = db.define(
  "user",
  {
    name: {
      type: DataTypes.STRING,
    },

    email: {
      type: DataTypes.STRING,
      unique: true,
    },

    username: {
      type: DataTypes.STRING,
      unique: true,
    },

    avatar_url: {
      type: DataTypes.STRING,
      defaultValue:
        "https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg",
    },

    password: {
      type: DataTypes.STRING,
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
    timestamps: true, // Kích hoạt timestamps
  }
);

module.exports = User;
