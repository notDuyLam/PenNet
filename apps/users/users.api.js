const express = require("express");
const router = express.Router();
const userController = require("./user.controller");

const {
  uploadPhoto,
  resizeAndUploadImage,
} = require("../../middlewares/imageUploadMiddleware");

router.post(
  "/upload-avatar",
  uploadPhoto.array("images", 1),
  resizeAndUploadImage,
  userController.uploadAvatar
);

router.patch("/change-password", userController.changePassword);

module.exports = router;
