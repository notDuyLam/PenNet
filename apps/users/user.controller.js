const userService = require("./user.service");
const passport = require("passport");

const userController = {
  // Render login page
  renderLoginPage(req, res) {
    res.render("login", {});
  },

  // Render login page
  renderSignupPage(req, res) {
    res.render("signup", {});
  },

  // Tạo người dùng mới
  async createUser(req, res) {
    try {
      // Lấy dữ liệu từ request body
      const { name, email, username, password, url } = req.body;
      // Kiểm tra xem tên người dùng hoặc email đã tồn tại chưa
      if (await userService.checkIfUsernameExists(username)) {
        return res.status(400).json({ message: "Username already exists" });
      }
      if (await userService.checkIfEmailExists(email)) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Tạo người dùng mới
      const newUser = await userService.createUser({
        name,
        email,
        username,
        password,
        url,
      });

      // Trả về kết quả
      return res.status(201).json({
        message: "User created successfully",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          name: newUser.name,
          url: newUser.avatar_url,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  },
};

module.exports = userController;
