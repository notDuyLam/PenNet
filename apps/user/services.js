const bcrypt = require("bcrypt");
const User = require("./model");
const UserInfo = require("./user_info/model");
const UserRela = require("./user_rela/model");
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
        password_hash: hashedPassword, // Lưu mật khẩu đã mã hóa
      });
      await UserInfo.create({
        user_id: newUser.id,
      });
      emailHelper.sendVerificationEmail(newUser.email, verificationToken);

      return await User.findOne({
        where: { id: newUser.id },
        include: [
          {
            model: UserInfo,
            as: "userInfo",
          },
        ],
      });
    } catch (error) {
      throw new Error("Error creating user: " + error.message);
    }
  },
  // Kiểm tra các trường bắt buộc
  async validateUserData(userData) {
    const { first_name, last_name, email, password } = userData;
    if (!first_name || !last_name || !email || !password) {
      return true;
    }
    return false;
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
  async getUserByEmail(email) {
    try {
      const user = await User.findOne({
        where: { email },
        include: [
          {
            model: UserInfo,
            as: "userInfo", // Chỉ định alias đã định nghĩa
          },
        ],
      });
      if (!user) {
        return null;
      }
      return user;
    } catch (error) {
      throw new Error("Error checking email: " + error.message);
    }
  },
  // Tạo người dùng từ thông tin lấy từ email
  async createUserEmail(userData) {
    try {
      const randomPassword = Math.random().toString(36).slice(-8); // Tạo mật khẩu ngẫu nhiên
      const hashedPassword = await bcrypt.hash(randomPassword, 10); // Mã hóa mật khẩu

      const newUser = {
        email: userData.email,
        isVerify: true,
        first_name: userData.first_name,
        last_name: userData.last_name,
        // avatar_url: userData.avatar_url,
        password_hash: hashedPassword, // Lưu mật khẩu đã mã hóa
      };
      const createdUser = await User.create(newUser);
      await UserInfo.create({
        user_id: createdUser.id,
        date_of_birth: userData.date_of_birth, // Ngày sinh
        country: userData.country, // Quốc gia
      });
      const user = await User.findOne({
        where: { email: createdUser.email },
        include: [
          {
            model: UserInfo,
            as: "userInfo",
          },
        ],
      });

      return user;
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
      user.password_hash = hashedPassword;
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
      const { first_name, last_name, date_of_birth, country } = updateData;
      const updateUserInfo = {
        date_of_birth: date_of_birth,
        country: country,
      };
      const updateUser = {
        first_name: first_name,
        last_name: last_name,
      };
      await UserInfo.update(updateUserInfo, { where: { user_id: userId } });
      await User.update(updateUser, { where: { id: userId } });
      const user = await User.findOne({
        where: { id: userId },
        include: [
          {
            model: UserInfo,
            as: "userInfo",
          },
        ],
      });
      if (!user) {
        throw new Error("User not found");
      }
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
      return await User.findOne({
        where: { id: user.id },
        include: [
          {
            model: UserInfo,
            as: "userInfo",
          },
        ],
      });
    } catch (error) {
      throw new Error("Error updating user avatar: " + error.message);
    }
  },
  async verifyPassword(userId, currentPassword) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      return isMatch;
    } catch (error) {
      throw new Error("Error verifying password: " + error.message);
    }
  },
  async updatePassword(userId, newPassword) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password_hash = hashedPassword;
      await user.save();
      return { message: "Password updated successfully" };
    } catch (error) {
      throw new Error("Error updating password: " + error.message);
    }
  },
  async getFriends(userId) {
    try {
      // Tìm User trước
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Tìm sentRequests
      const sentRequests = await UserRela.findAll({
        where: {
          user_from: userId,
          status: "accepted",
        },
        include: [
          {
            model: User,
            as: "toUser", // Sử dụng alias 'toUser'
            attributes: {
              exclude: [
                "password_hash",
                "isVerify",
                "verificationToken",
                "resetPasswordToken",
                "resetPasswordExpires",
                "email",
              ],
            },
          },
        ],
      });

      // Tìm receivedRequests
      const receivedRequests = await UserRela.findAll({
        where: {
          user_to: userId,
          status: "accepted",
        },
        include: [
          {
            model: User,
            as: "fromUser", // Sử dụng alias 'fromUser'
            attributes: {
              exclude: [
                "password_hash",
                "isVerify",
                "verificationToken",
                "resetPasswordToken",
                "resetPasswordExpires",
                "email",
              ],
            },
          },
        ],
      });

      // Kết hợp danh sách bạn bè từ cả hai loại yêu cầu
      const friends = [
        ...sentRequests.map((rel) => rel.toUser),
        ...receivedRequests.map((rel) => rel.fromUser),
      ];

      return friends;
    } catch (error) {
      throw new Error("Error fetching friends: " + error.message);
    }
  },
  async sendFriendRequest(userId, friendId) {
    try {
      const existingRequest = await UserRela.findOne({
        where: {
          user_from: userId,
          user_to: friendId,
        },
      });

      if (existingRequest) {
        return { message: "Friend request already sent" };
      }

      const newRequest = await UserRela.create({
        user_from: userId,
        user_to: friendId,
        status: "pending",
      });

      return newRequest;
    } catch (error) {
      throw new Error("Error sending friend request: " + error.message);
    }
  },
  async getFriendRequests(userId) {
    try {
      const receivedRequests = await UserRela.findAll({
        where: {
          user_to: userId,
          status: "pending",
        },
        include: [
          {
            model: User,
            as: "fromUser", // Sử dụng alias 'fromUser'
            attributes: {
              exclude: [
                "password_hash",
                "isVerify",
                "verificationToken",
                "resetPasswordToken",
                "resetPasswordExpires",
                "email",
              ],
            },
          },
        ],
      });

      return receivedRequests.map((rel) => rel.fromUser);
    } catch (error) {
      throw new Error("Error fetching friend requests: " + error.message);
    }
  },
  async getBlockedFriends(userId) {
    try {
      const blockedUsers = await UserRela.findAll({
        where: {
          user_from: userId,
          status: "blocked",
        },
        include: [
          {
            model: User,
            as: "toUser",
            attributes: {
              exclude: [
                "password_hash",
                "isVerify",
                "verificationToken",
                "resetPasswordToken",
                "resetPasswordExpires",
                "email",
              ],
            },
          },
        ],
      });

      return blockedUsers.map((rel) => rel.toUser);
    } catch (error) {
      throw new Error("Error fetching blocked friends: " + error.message);
    }
  },
};

module.exports = userService;
