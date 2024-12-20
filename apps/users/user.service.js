const bcrypt = require("bcrypt");
const User = require("./user.model");
const emailHelper = require("../../helpers/emailService.helper");

const userService = {
  // Tạo người dùng mới
  async createUser(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10); // Mã hóa mật khẩu
      const verificationToken = await bcrypt.genSalt(10);
      const newUser = new User({
        ...userData,
        verificationToken: verificationToken,
        password: hashedPassword, // Lưu mật khẩu đã mã hóa
      });
      await newUser.save(); // Lưu người dùng mới vào cơ sở dữ liệu
      // emailHelper.sendVerificationEmail(newUser.email, verificationToken);
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
      const user = await User.findOne({ username });
      return user !== null;
    } catch (error) {
      throw new Error("Error checking username: " + error.message);
    }
  },

  // Kiểm tra email đã tồn tại không
  async checkIfEmailExists(email) {
    try {
      const user = await User.findOne({ email });
      return user !== null;
    } catch (error) {
      throw new Error("Error checking email: " + error.message);
    }
  },
  async getUserByUsername(username) {
    try {
      const user = await User.findOne({ username });
      return user;
    } catch (error) {
      throw new Error("Error fetching user by username: " + error.message);
    }
  },
  async getUserByEmail(email) {
    try {
      const user = await User.findOne({ email });
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
      const user = await User.findOne({ verificationToken: token });
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
};

module.exports = userService;