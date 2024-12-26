const express = require("express");
const router = express.Router();
const userController = require("./controller");

const {
  uploadPhoto,
  resizeAndUploadImage,
} = require("../../middlewares/imageUploadMiddleware");

// [PATCH] /api/users/upload-avatar
router.patch(
  "/upload-avatar",
  uploadPhoto.array("images", 1),
  resizeAndUploadImage,
  userController.uploadAvatar
);

// [PATCH] /api/users/change-password
router.patch("/change-password", userController.changePassword);

// [GET] /api/users/posts?page=${pageNumber + 1}
router.get("/posts", userController.getMorePost);

module.exports = router;
