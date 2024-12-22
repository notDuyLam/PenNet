const express = require("express");

// cài đặt router
const router = express.Router();

// Home route
router.get("/", (req, res) => {
  res.render("home", {
    user: req.user,
  });
});

router.get('/user/id=:id', (req, res) => {
    res.render('personProfile', {});
});

// Login route
router.get("/login", (req, res) => {
  res.render("login", {});
});

// Signup route
router.get("/signup", (req, res) => {
  res.render("signup", {});
});

// friendRequest route
router.get("/friends", (req, res) => {
  res.render("friendRequest", {});
});

// friend route
router.get("/friendList", (req, res) => {
  res.render("friendList", {});
});

// google route
router.get("/LoginGoogle", (req, res) => {
  res.render("LoginGoogle", {});
});

// ForgetPassword route
router.get("/ForgetPassword", (req, res) => {
  res.render("ForgetPassword", {});
});

// CodeGoogle route
router.get("/CodeGoogle", (req, res) => {
  res.render("CodeGoogle", {});
});

router.get("/message", (req, res) => {
  res.render("message", {
    user: req.user,
  });
});

router.get("/group", (req, res) => {
  res.render("group", {});
});

router.get("/block", (req, res) => {
  res.render("block", {});
});

module.exports = router;
