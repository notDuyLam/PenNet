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
};

module.exports = userService;
