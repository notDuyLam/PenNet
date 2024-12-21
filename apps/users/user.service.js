const bcrypt = require("bcrypt");
const User = require("./user.model");
const { Op } = require("sequelize");
const emailHelper = require("../../helpers/emailService.helper");

const userService = {
  // Tạo người dùng mới
  async createUser(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10); // Mã hóa mật khẩu
      const verificationToken = await bcrypt.genSalt(10);
      const newUser = await User.create({
        ...userData,
        verificationToken: verificationToken,
        password: hashedPassword, // Lưu mật khẩu đã mã hóa
      });
      emailHelper.sendVerificationEmail(newUser.email, verificationToken);
      return newUser;
    } catch (error) {
      throw new Error("Error creating user: " + error.message);
    }
  },
  // Kiểm tra các trường bắt buộc
  async validateUserData(userData) {
    const { name, email, username, password } = userData;
    if (!name || !email || !username || !password) {
      return true;
    }
  },
  // Kiểm tra tên người dùng có tồn tại không
  async checkIfUsernameExists(username) {
    try {
      const user = await User.findOne({ where: { username } });
      return user !== null;
    } catch (error) {
      throw new Error("Error checking username: " + error.message);
    }
  },

  // Kiểm tra email đã tồn tại không
  async checkIfEmailExists(email) {
    try {
      const user = await User.findOne({ where: { email } });
      return user !== null;
    } catch (error) {
      throw new Error("Error checking email: " + error.message);
    }
  },
  async getUserByUsername(username) {
    try {
      const user = await User.findOne({ where: { username } });
      return user;
    } catch (error) {
      throw new Error("Error fetching user by username: " + error.message);
    }
  },
  async getUserByEmail(email) {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      throw new Error("Error fetching user by email: " + error.message);
    }
  },
  // Tạo người dùng từ thông tin lấy từ email
  async createUserEmail(userData) {
    try {
      const randomPassword = Math.random().toString(36).slice(-8); // Tạo mật khẩu ngẫu nhiên
      const hashedPassword = await bcrypt.hash(randomPassword, 10); // Mã hóa mật khẩu
      const newUser = await User.create({
        ...userData,
        password: hashedPassword, // Lưu mật khẩu đã mã hóa
      });
      return newUser;
    } catch (error) {
      throw new Error("Error creating user: " + error.message);
    }
  },
  async verifyAccount(token) {
    try {
      const user = await User.findOne({ where: { verificationToken: token } });
      if (!user) {
        return { error: "Invalid token" };
      }
      user.verificationToken = null;
      user.isVerify = true;
      await user.save();
      return user;
    } catch (error) {
      throw new Error("Error verifying account: " + error.message);
    }
  },
  async forgotPassword(email) {
    try {
      const user = await User.findOne({ where: { email: email } });
      if (!user) {
        return { message: "User not found" };
      }
      const token = await bcrypt.genSalt(10);
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 900000; // 15 minutes
      await user.save();

      await emailHelper.sendResetPasswordEmail(user.email, token);
      return { message: "Token reset email sent" };
    } catch (error) {
      return { message: "Internal server error" };
    }
  },
  async resetPassword(token, newPassword) {
    try {
      const user = await User.findOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { [Op.gt]: Date.now() },
        },
      });
      if (!user) {
        return { message: "Invalid token" };
      }
      if (!user.isVerify) {
        return { error: "User account is not verified." };
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.resetPasswordToken = null; // Xóa token
      user.resetPasswordExpires = null; // Xóa thời gian hết hạn
      await user.save();

      return { message: "Password reset successful" };
    } catch (error) {
      return { message: "Internal server error" };
    }
  },
  async getUserById(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return { error: "User not found" };
      }
      return user;
    } catch (error) {
      return { error: "Error fetching user: " + error.message };
    }
  },
  async updateUser(userId, updateData) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }
      await user.update(updateData);
      return user;
    } catch (error) {
      throw new Error("Error updating user: " + error.message);
    }
  },
  async updateUserAvatar(userId, avatarUrl) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }
      user.avatar_url = avatarUrl.toString();
      await user.save();
      return user;
    } catch (error) {
      throw new Error("Error updating user avatar: " + error.message);
    }
  },
};

module.exports = userService;
