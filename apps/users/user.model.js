const mongoose = require("mongoose");

// Định nghĩa schema cho bảng Users
const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    avatar_url: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required: true,
    },
    isVerify: {
      type: Boolean,
      default: false,
    },
    // Add token to check when send email
    verificationToken: {
      type: String,
    },
    // Cho chức năng quên mật khẩu
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Tạo model từ schema
const User = mongoose.model("User", userSchema);

module.exports = User;
