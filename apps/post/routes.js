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

// [POST] /posts/like/:post_id
router.post("/like/:post_id", postController.likePost);

// [POST] /posts/comment/:post_id
router.post("/comment/:post_id", postController.commentPost);

// [DELETE] /posts/comment/:post_id/:comment_id
router.delete(
  "/comment/:post_id/:comment_id",
  postController.deleteCommentPost
);

// [PATCH] /posts/comment/:post_id/:comment_id
router.patch("/comment/:post_id/:comment_id", postController.changeCommentPost);

module.exports = router;
