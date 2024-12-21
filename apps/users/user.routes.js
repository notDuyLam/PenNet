const express = require("express");
const router = express.Router();

const userController = require("./user.controller");

// [GET] /login
router.get("/login", userController.renderLoginPage);

// [GET] /signup
router.get("/signup", userController.renderSignupPage);

// [POST] /signup
router.post("/signup", userController.createUser);

// [POST] /login
router.post("/login", userController.loginUser);

// [GET] /verify
router.get("/verify", userController.verifyAccount);

// [GET] /login/auth/google
router.get("/login/auth/google", userController.loginWithGoogle);

// [GET] /login/auth/google/callback
router.get("/login/auth/google/callback", userController.callbackGoogle);

// [GET] /forgot-password
router.get("/forgot-password", userController.renderForgotPasswordPage);

// [POST] /forgot-password
router.post("/forgot-password", userController.forgotPassword);

// [GET] /reset-password
router.get("/reset-password", userController.renderResetPasswordPage);

// [POST] /reset-password
router.post("/reset-password", userController.resetPassword);

// [POST] /logout
router.get("/logout", userController.logoutUser);

// Route profile
router.get("/profile", (req, res) => {
  res.render("profile", {
    currentView: "profile",
    name: req.user?.username,
    profileImg: req.user?.picture,
    email: req.user?.email,
    name: req.user?.name,
  });
});

module.exports = router;
