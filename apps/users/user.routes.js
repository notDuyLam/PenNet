const express = require("express");
const router = express.Router();

const userController = require("./user.controller");

// [GET] /login
router.get("/login", userController.renderLoginPage);

module.exports = router;
