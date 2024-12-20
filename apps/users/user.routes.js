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

module.exports = router;
