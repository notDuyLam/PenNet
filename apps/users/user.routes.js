const express = require("express");
const router = express.Router();

const userController = require("./user.controller");

// [GET] /login
router.get("/login", userController.renderLoginPage);

// [GET] /signup
router.get("/signup", userController.renderSignupPage);

// [POST] /signup
router.post("/signup", userController.createUser);

module.exports = router;
