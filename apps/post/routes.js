const express = require("express");
const router = express.Router();

const {
  uploadPhoto,
  resizeAndUploadImage,
} = require("../../middlewares/imageUploadMiddleware");

const postController = require("./controller");

// [GET] /posts
router.get("/", postController.renderPostPage);

// [POST] /posts
router.post(
  "/",
  uploadPhoto.array("images", 5),
  resizeAndUploadImage,
  postController.createPost
);

// [DELETE] /posts
router.delete("/", postController.deletePost);

// [GET] /posts/your-posts
router.get("/your-posts", postController.getPersonalPost);

module.exports = router;
