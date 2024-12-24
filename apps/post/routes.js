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

// [GET] /posts/your-posts
router.get("/your-posts", postController.getPersonalPost);

// [DELETE] /posts/:post_id
router.delete("/:post_id", postController.deletePost);

// [PATCH] /posts/:post_id
router.patch("/:post_id", postController.changePost);

// [GET] /posts/:post_id
router.get("/:post_id", postController.getDetails);

module.exports = router;
