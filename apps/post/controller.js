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

      if (!user_id || !content) {
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
      const user_id = req.user.id; // Get user ID from authenticated session
      const data = {
        content: req.body.content,
        access_modifier: req.body.access_modifier,
      };
      if (!post_id || !data.content) {
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
};

module.exports = postController;
