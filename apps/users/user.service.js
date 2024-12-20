const bcrypt = require("bcrypt");
const User = require("./user.model");
// const emailHelper = require("../../helpers/emailService.helper");

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
};

module.exports = userService;
