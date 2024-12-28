const postService = require("./services");

const postController = {
  renderPostPage(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }
      res.render("login", {});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  createPost(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }

      const user_id = req.user.id; // Get user ID from authenticated session
      const { content, access_modifier } = req.body;
      const imageUrls = req.imageUrls;

      if (!user_id || (!content && !imageUrls)) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      postService
        .createPost({
          user_id,
          content,
          access_modifier,
          imageUrls,
        })
        .then((post) => res.status(201).json(post))
        .catch((error) => res.status(500).json({ error: error.message }));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getPersonalPost(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }

      const user_id = req.user.id; // Get user ID from authenticated session

      postService
        .getPostsByUserId(user_id)
        .then((posts) => res.status(200).json(posts))
        .catch((error) => res.status(500).json({ error: error.message }));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deletePost(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }

      const post_id = req.params.post_id;
      const user_id = req.user.id; // Get user ID from authenticated session

      if (!post_id) {
        return res.status(400).json({ error: "Missing post ID" });
      }

      postService
        .deletePost(post_id, user_id)
        .then(() =>
          res.status(200).json({ message: "Post deleted successfully" })
        )
        .catch((error) => res.status(500).json({ error: error.message }));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  changePost(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }
      const post_id = req.params.post_id;
      const user_id = req.user.id;
      const imageUrls = req.imageUrls;
      const data = {
        content: req.body.content,
        access_modifier: req.body.access_modifier,
        removeImageSources: req.body.removeImageSources,
        images: imageUrls,
      };
      if (!post_id) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      postService
        .updatePost(post_id, user_id, data)
        .then((post) => res.status(200).json(post))
        .catch((error) => res.status(500).json({ error: error.message }));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getDetails(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }
      const post_id = req.params.post_id;

      if (!post_id) {
        return res.status(400).json({ error: "Missing post ID" });
      }
      postService
        .getPostById(post_id)
        .then((post) => res.status(200).json(post))
        .catch((error) => res.status(500).json({ error: error.message }));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  likePost(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }

      const post_id = req.params.post_id;
      const user_id = req.user.id; // Get user ID from authenticated session

      if (!post_id) {
        return res.status(400).json({ error: "Missing post ID" });
      }

      postService
        .likePost(post_id, user_id)
        .then((result) => res.status(200).json(result))
        .catch((error) => res.status(500).json({ error: error.message }));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  commentPost(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }

      const post_id = req.params.post_id;
      const user_id = req.user.id; // Get user ID from authenticated session
      const { content } = req.body;

      if (!post_id || !content) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      postService
        .addComment(post_id, user_id, content)
        .then((result) => res.status(201).json(result))
        .catch((error) => res.status(500).json({ error: error.message }));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getCommentPost(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }

      const post_id = req.params.post_id;

      if (!post_id) {
        return res.status(400).json({ error: "Missing post ID" });
      }

      postService
        .getCommentsByPostId(post_id)
        .then((comments) => res.status(200).json(comments))
        .catch((error) => res.status(500).json({ error: error.message }));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  deleteCommentPost(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }

      const post_id = req.params.post_id;
      const id = req.params.comment_id;
      const user_id = req.user.id; // Get user ID from authenticated session

      if (!post_id || !id) {
        return res.status(400).json({ error: "Missing post ID or comment ID" });
      }

      postService
        .deleteComment(post_id, user_id, id)
        .then(() =>
          res.status(200).json({ message: "Comment deleted successfully" })
        )
        .catch((error) => res.status(500).json({ error: error.message }));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  changeCommentPost(req, res) {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/users/login");
      }

      const post_id = req.params.post_id;
      const id = req.params.comment_id;
      const user_id = req.user.id; // Get user ID from authenticated session
      const { content } = req.body;

      if (!post_id || !id || !content) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      postService
        .updateComment(post_id, user_id, id, content)
        .then((comment) => res.status(200).json(comment))
        .catch((error) => res.status(500).json({ error: error.message }));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deletePostAdmin(req, res) {
    try {
      const postId = req.params.id;
      const result = await postService.deletePostAdmin(postId);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error deleting post:", error);
      return res.status(500).json({ message: error.message });
    }
  },
};

module.exports = postController;
