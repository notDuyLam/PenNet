const userService = require("./user.service");
const passport = require("passport");

const userController = {
  // Render login page
  renderLoginPage(req, res) {
    if (req.isAuthenticated()) {
      return res.redirect("/");
    }
    res.render("login", {});
  },

  // Render signup page
  renderSignupPage(req, res) {
    if (req.isAuthenticated()) {
      return res.redirect("/");
    }
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
  async verifyAccount(req, res) {
    try {
      const { token } = req.query;
      //   Tìm người dùng
      const user = await userService.verifyAccount(token);
      if (user.error) {
        return res.status(400).send(user.error);
      }
      res.redirect("/users/login");
    } catch (err) {
      res.status(500).send("Error verifying account");
    }
  },
  async loginWithGoogle(req, res) {
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res);
  },
  // Call back cho Google
  async callbackGoogle(req, res, next) {
    passport.authenticate(
      "google",
      { failureRedirect: "/users/login" },
      (err, user, info) => {
        if (!user) {
          // Người dùng không tồn tại hoặc email chưa được xác minh
          // Chưa có thông báo
          return res.redirect("/users/login");
        }
        if (!user.isVerify) {
          // Email chưa được xác minh
          // Chưa có thông báo
          return res.redirect("/users/login");
        }

        // Xác thực thành công, đăng nhập người dùng
        req.login(user, (err) => {
          if (err) {
            return next(err);
          }
          return res.redirect("/");
        });
      }
    )(req, res, next);
  },
  // Trang điền thông tin để cập nhật
  async renderForgotPasswordPage(req, res) {
    res.render("ForgetPassword", {});
  },
  async renderResetPasswordPage(req, res) {
    res.render("reset-password", {});
  },
  // Quên mật khẩu
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const result = await userService.forgotPassword(email);
      res.status(200).json({ message: result.message }); // Trả về JSON khi thành công
    } catch (err) {
      res.status(500).send("Error sending password reset link");
    }
  },
  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;
      const user = await userService.resetPassword(token, password);
      res.status(200).json({ message: user.message }); // Trả về JSON khi thành công
    } catch (err) {
      res
        .status(400)
        .json({ message: "Invalid token or error resetting password" }); // Đảm bảo JSON khi có lỗi
    }
  },
  async logoutUser(req, res) {
    req.logout(() => {
      res.redirect("/users/login");
    });
  },
  async updateUser(req, res) {
    try {
      const userId = req.user.id; // Get user ID from authenticated session
      const { name } = req.body;

      // Prepare the update data
      const updateData = {
        name,
      };

      // Update the user
      const updatedUser = await userService.updateUser(userId, updateData);

      // Update the user session
      req.login(updatedUser, (err) => {
        if (err) {
          console.log("Error updating session:", err);
          return res.status(500).json({ errorMessage: "Server error" });
        }
        // Return the updated user information
        return res.status(200).json({
          successMessage: "User updated successfully",
          user: {
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            name: updatedUser.name,
            avatar: updatedUser.avatar_url,
          },
        });
      });
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ errorMessage: "Server error" });
    }
  },
  async uploadAvatar(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }

      const userId = req.user.id; // Lấy user ID từ session đã xác thực
      const avatarUrl = req.imageUrls;

      // Cập nhật avatar của người dùng
      const updatedUser = await userService.updateUserAvatar(userId, avatarUrl);

      // Cập nhật lại session của người dùng
      req.login(updatedUser, (err) => {
        if (err) {
          console.error("Error updating session:", err);
          return res.status(500).json({ errorMessage: "Server error" });
        }

        // Trả về thông tin người dùng đã được cập nhật
        return res.status(200).json({
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          name: updatedUser.name,
          avatar: updatedUser.avatar_url,
        });
      });
    } catch (error) {
      console.error("Error updating avatar:", error);
      return res.status(500).json({ errorMessage: "Failed to update avatar" });
    }
  },
};

module.exports = userController;
