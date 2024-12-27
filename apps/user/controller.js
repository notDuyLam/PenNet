const userService = require("./services");
const postService = require("../post/services");
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
      const { first_name, last_name, email, password } = req.body;

      // Kiểm tra nếu name, email, username, password null
      const userData = { first_name, last_name, email, password };
      if (await userService.validateUserData(userData)) {
        return res.status(400).json({
          message: "All fields are required",
        });
      }
      // Kiểm tra xem tên người dùng hoặc email đã tồn tại chưa
      if (await userService.checkIfEmailExists(email)) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Tạo người dùng mới
      const newUser = await userService.createUser({
        first_name,
        last_name,
        email,
        password,
      });

      // Trả về kết quả
      return res.status(201).json({
        message: "User created successfully",
        user: {
          id: newUser.id,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          avatar: newUser.avatar_url,
          email: newUser.email,
          date_of_birth: newUser.userInfo.date_of_birth,
          country: newUser.userInfo.country,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  },
  async loginUser(req, res, next) {
    passport.authenticate(
      "local",
      { usernameField: "email" },
      (err, user, info) => {
        if (err) {
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
      }
    )(req, res, next);
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
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }

      const userId = req.user.id; // Get user ID from authenticated session
      const { firstName, lastName, date_of_birth, country } = req.body;
      // Prepare the update data
      const updateData = {
        first_name: firstName,
        last_name: lastName,
        date_of_birth: date_of_birth,
        country: country,
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
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            avatar: updatedUser.avatar_url,
            date_of_birth: updatedUser.userInfo.date_of_birth,
            country: updatedUser.userInfo.country,
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
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          avatar: updatedUser.avatar_url,
          email: updatedUser.email,
        });
      });
    } catch (error) {
      console.error("Error updating avatar:", error);
      return res.status(500).json({ errorMessage: "Failed to update avatar" });
    }
  },
  async changePassword(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }

      const userId = req.user.id; // Get user ID from authenticated session
      const { currentPassword, newPassword } = req.body;

      // Verify current password
      const isMatch = await userService.verifyPassword(userId, currentPassword);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errorMessage: "Current password is incorrect" });
      }

      // Update to new password
      await userService.updatePassword(userId, newPassword);
      return res
        .status(200)
        .json({ successMessage: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      return res.status(500).json({ errorMessage: "Server error" });
    }
  },
  async searchFriends(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }
      const user = req.user;
      const user_id = req.user.id;
      const query = req.query.query;
      const results = await userService.searchFriends(user_id, query);
      const filteredResults = results.map((userTarget) => ({
        id: userTarget.id,
        first_name: userTarget.first_name,
        last_name: userTarget.last_name,
        avatar_url: userTarget.avatar_url,
        isFriend: userTarget.isFriend,
        isBanned: userTarget.isBanned,
      }));
      res.render("search", { query, user, results: filteredResults });
    } catch (error) {
      console.error("Error searching friends:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  async sendRequestFriend(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }

      const userId = req.user.id; // Get user ID from authenticated session
      const friendId = req.params.user_id; // Get friend ID from request parameters

      // Send friend request
      const result = await userService.sendFriendRequest(userId, friendId);
      return res.status(200).json({ successMessage: result });
    } catch (error) {
      console.error("Error sending friend request:", error);
      return res.status(500).json({ errorMessage: "Server error" });
    }
  },

  async getNotifications(req, res) {
    const userId = req.user.id; // Assuming user is authenticated and user ID is available
    try {
      const notifications = await userService.getNotifications(userId);
      res.render("notification", { user: req.user, notifications });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return res.status(500).json({ errorMessage: "Server error" });
    }
  },
  async getFriendRequest(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }

      const userId = req.user.id; // Get user ID from authenticated session
      const friendRequests = await userService.getFriendRequests(userId);
      return res.status(200).json({ friendRequests });
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      return res.status(500).json({ errorMessage: "Server error" });
    }
  },
  async getFriendBlocked(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }

      const userId = req.user.id; // Get user ID from authenticated session
      const blockedFriends = await userService.getBlockedFriends(userId);
      return res.status(200).json({ blockedFriends });
    } catch (error) {
      console.error("Error fetching blocked friends:", error);
      return res.status(500).json({ errorMessage: "Server error" });
    }
  },
  async acceptFriendRequest(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }

      const userId = req.user.id; // Get user ID from authenticated session
      const friendId = req.params.user_id; // Get friend ID from request parameters

      // Accept friend request
      const result = await userService.acceptFriendRequest(userId, friendId);

      return res.status(200).json({ result });
    } catch (error) {
      console.error("Error accepting friend request:", error);
      return res.status(500).json({ errorMessage: "Server error" });
    }
  },
  async deniedFriendRequest(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }

      const userId = req.user.id; // Get user ID from authenticated session
      const friendId = req.params.user_id; // Get friend ID from request parameters

      // Deny friend request
      const result = await userService.denyFriendRequest(userId, friendId);
      return res.status(200).json({ successMessage: result });
    } catch (error) {
      console.error("Error denying friend request:", error);
      return res.status(500).json({ errorMessage: "Server error" });
    }
  },
  async blockFriend(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }

      const userId = req.user.id; // Get user ID from authenticated session
      const friendId = req.params.user_id; // Get friend ID from request parameters

      // Block friend
      const result = await userService.blockFriend(userId, friendId);
      return res.status(200).json({ successMessage: result });
    } catch (error) {
      console.error("Error blocking friend:", error);
      return res.status(500).json({ errorMessage: "Server error" });
    }
  },
  async deleteBlockFriend(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }

      const userId = req.user.id; // Get user ID from authenticated session
      const friendId = req.params.user_id; // Get friend ID from request parameters

      // Unblock friend
      const result = await userService.unblockFriend(userId, friendId);
      return res.status(200).json({ successMessage: result });
    } catch (error) {
      console.error("Error unblocking friend:", error);
      return res.status(500).json({ errorMessage: "Server error" });
    }
  },
  async renderProfilePage(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }
      const user = req.user;
      const user_id = req.params.user_id;
      const view_id = user.id;
      const posts = await postService.getPostsByUserId(view_id, user_id);
      const user_info = await postService.getUserById(user_id);
      const reviewers = [
        { id: 1, name: "Reviewer 1" },
        { id: 2, name: "Reviewer 2" },
      ];
      res.render("personProfile", { user, user_info, posts, reviewers });
    } catch (error) {
      console.error("Error rendering profile page:", error);
      return res.status(500).json({ errorMessage: "Server error" });
    }
  },
  async renderFriendsPage(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }
      const user = req.user;
      const userId = req.user.id; // Get user ID from authenticated session
      const friends = await userService.getFriends(userId);
      const friendRequests = await userService.getFriendRequests(userId);
      res.render("friendList", { user, friends, friendRequests });
    } catch (error) {
      console.error("Error fetching friends:", error);
      return res.status(500).json({ errorMessage: "Server error" });
    }
  },
  async renderBlockPage(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }
      const user = req.user;
      const userId = req.user.id; // Get user ID from authenticated session
      const blockList = await userService.getBlockedFriends(userId);
      res.render("block", { user, blockList });
    } catch (error) {
      console.error("Error rendering blocked friends page:", error);
      return res.status(500).json({ errorMessage: "Server error" });
    }
  },
  async renderHomePage(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }
      const filter = {
        index: 0,
        limit: 5,
      };
      const userId = req.user.id; // Get user ID from authenticated session
      const friendPosts = await postService.getFriendPosts(userId);
      const nonFriendPublicPosts = await postService.getNonFriendPublicPosts(
        userId,
        filter
      );
      const posts = [...friendPosts, ...nonFriendPublicPosts];
      res.render("home", {
        user: req.user,
        posts: posts,
      });
    } catch (error) {
      console.error("Error rendering home page:", error);
      return res.status(500).json({ errorMessage: "Server error" });
    }
  },
  async deleteUser(req, res) {
    try {
      const userId = req.params.id;
      const result = await userService.deleteUser(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error deleting user:", error);
      return res.status(500).json({ errorMessage: "Server error" });
    }
  },
  async getMorePost(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }
      const page = parseInt(req.query.page) || 1; // Get page number from query parameters
      const filter = {
        index: page,
        limit: 5,
      };
      const userId = req.user.id; // Get user ID from authenticated session
      const posts = await postService.getNonFriendPublicPosts(userId, filter);
      return res.status(200).json({ posts });
    } catch (error) {
      console.error("Error fetching more posts:", error);
      return res.status(500).json({ errorMessage: "Server error" });
    }
  },
  async renderBanPage(req, res) {
    try {
      res.render('ban', {
        user: req.user, // Ensure req.user contains isBanned property
      });
    } catch (error) {
      console.error("Error rendering ban page:", error);
      return res.status(500).json({ errorMessage: "Server error" });
    }
  },
  async banUser(req, res) {
    try {
      const userId = req.params.id;
      console.log("Banning user:", userId);
      const result = await userService.banUser(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error banning user:", error);
      return res.status(500).json({ message: error.message });
    }
  },
  async unbanUser(req, res) {
    try {
      const userId = req.params.id;
      const result = await userService.unbanUser(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error unbanning user:", error);
      return res.status(500).json({ message: error.message });
    }
  },
};

module.exports = userController;
