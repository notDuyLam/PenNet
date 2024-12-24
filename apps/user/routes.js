const express = require("express");
const router = express.Router();

const userController = require("./controller");

// [GET] /users/login
router.get("/login", userController.renderLoginPage);

// [POST] /users/login
router.post("/login", userController.loginUser);

// [GET] /users/signup
router.get("/signup", userController.renderSignupPage);

// [POST] /users/signup
router.post("/signup", userController.createUser);

// [GET] /users/verify
router.get("/verify", userController.verifyAccount);

// [GET] /users/login/auth/google
router.get("/login/auth/google", userController.loginWithGoogle);

// [GET] /users/login/auth/google/callback
router.get("/login/auth/google/callback", userController.callbackGoogle);

// [GET] /users/forgot-password
router.get("/forgot-password", userController.renderForgotPasswordPage);

// [POST] /users/forgot-password
router.post("/forgot-password", userController.forgotPassword);

// [GET] /users/reset-password
router.get("/reset-password", userController.renderResetPasswordPage);

// [POST] /users/reset-password
router.post("/reset-password", userController.resetPassword);

// [POST] /users/logout
router.get("/logout", userController.logoutUser);

// [GET] /users/profile
router.get("/profile", (req, res, next) => {
  if (req.isAuthenticated()) {
    res.render("profile", {
      user: req.user,
    });
  } else {
    res.redirect("/users/login");
  }
});

// [PATCH] /users/profile
router.patch("/profile", userController.updateUser);

// Make friends

// [GET] /users/friends
router.get("/friends", userController.getFriends);

// [POST] /users/make-friends/:user_id
router.post("/send-request-friend/:user_id", userController.sendRequestFriend);

// [GET] /users/friend-request
router.get("/friends-request", userController.getFriendRequest);

// [GET] /users/friends-blocked
router.get("/friends-blocked", userController.getFriendBlocked);

module.exports = router;
