const userService = require("./user.service");
const passport = require("passport");

const userController = {
  // Render login page
  renderLoginPage(req, res) {
    res.render("login", {});
  },

  // Tạo người dùng mới
  async createUser(req, res) {
    try {
      // Lấy dữ liệu từ request body
      const { username, email, password, firstName, lastName, url } = req.body;

      // Kiểm tra xem tên người dùng hoặc email đã tồn tại chưa
      // if (await userService.checkIfUsernameExists(username)) {
      //   return res.status(400).json({ message: "Username already exists" });
      // }
      // if (await userService.checkIfEmailExists(email)) {
      //   return res.status(400).json({ message: "Email already exists" });
      // }

      // Tạo người dùng mới
      const newUser = await userService.createUser({
        username,
        email,
        password,
        firstName,
        lastName,
        url,
      });

      // Trả về kết quả
      return res.status(201).json({
        message: "User created successfully",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          url: newUser.url,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  },
};

module.exports = userController;
