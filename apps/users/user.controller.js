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

      // Kiểm tra nếu name, email, username, password null
      const userData = { name, email, username, password };
      if (await userService.validateUserData(userData)) {
        return res.status(400).json({
          message: "All fields are required",
        });
      }
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
  async loginUser(req, res, next) {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.log("OK1");

        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        // Đăng nhập thành công
        return res.status(200).json({ message: info.message });
      });
    })(req, res, next);
  },
};

module.exports = userController;
