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

// [PATCH] /users/profile
router.patch("/profile", userController.updateUser);

// Make friends

// [POST] /users/send-request-friend/:user_id
router.post("/send-request-friend/:user_id", userController.sendRequestFriend);

// [GET] /users/friends-request
router.get("/friends-request", userController.getFriendRequest);

// [POST] /users/friend-request/accept/:user_id
router.post(
  "/friend-request/accept/:user_id",
  userController.acceptFriendRequest
);

// [DELETE] /users/friend-request/denied/:user_id
router.delete(
  "/friend-request/denied/:user_id",
  userController.deniedFriendRequest
);

// [GET] /users/friends-blocked
router.get("/friends-blocked", userController.getFriendBlocked);

// [POST] /users/friend-request/block/:user_id
router.post("/friend-request/block/:user_id", userController.blockFriend);

// [DELETE] /users/friend-request/block/:user_id
router.delete(
  "/friend-request/block/:user_id",
  userController.deleteBlockFriend
);

// [GET] /users/profile:user_id
router.get("/profile/:user_id", userController.renderProfilePage);

// [GET] /users/friends
router.get("/friends", userController.renderFriendsPage);

// [GET] /users/block
router.get("/block", userController.renderBlockPage);

// [DELETE] /users/:id
router.delete("/:id", userController.deleteUser);

module.exports = router;
