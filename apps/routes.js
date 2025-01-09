const express = require("express");
const userController = require("./user/controller");
const { ensureAuthenticated, checkBan } = require("../middlewares/auth");

// cài đặt router
const router = express.Router();

router.get("/ban", userController.renderBanPage);

// Middleware check if user is banned
router.use(checkBan);

// Home route
router.get("/", userController.renderHomePage);

router.get("/user/id=:id", (req, res) => {
  res.render("personProfile", {});
});

// Login route

// friendRequest route
// router.get("/friends", (req, res) => {
//   res.render("friendRequest", {});
// });

// friend route
router.get("/friends", (req, res) => {
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

router.get("/group", (req, res) => {
  res.render("group", {});
});

router.get("/block", (req, res) => {
  res.render("block", {});
});

router.get("/search", userController.searchFriends);

router.get(
  "/notification",
  ensureAuthenticated,
  userController.getNotifications
);

module.exports = router;
