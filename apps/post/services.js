const Post = require("./model");
const Like = require("./like/model");
const Comment = require("./comment/model");
const Attachment = require("./attachment/model");
const User = require("../user/model");
const { Op } = require("sequelize");

const postService = {
  async createPost(dataPost) {
    try {
      const { user_id, content, access_modifier, imageUrls } = dataPost;
      const newPost = await Post.create({
        user_id,
        content,
        access_modifier,
      });
      if (imageUrls && imageUrls.length > 0) {
        const attachments = imageUrls.map((url) => ({
          post_id: newPost.id,
          media_url: url,
        }));
        await Attachment.bulkCreate(attachments);
      }
      const createdAttachments = await Attachment.findAll({
        where: { post_id: newPost.id },
      });
      return { newPost, attachments: createdAttachments };
    } catch (error) {
      throw new Error("Error creating post: " + error.message);
    }
  },
  async getPostsByUserId(user_id) {
    try {
      const posts = await Post.findAll({
        where: { user_id },
        include: [
          { model: Attachment, as: "attachments" },
          {
            model: User,
            as: "user",
            attributes: ["first_name", "last_name", "avatar_url"],
          },
        ],
      });
      const likes = await Like.findAll({
        where: { post_id: posts.map((post) => post.id) },
        attributes: ["id", "user_id", "post_id"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "first_name", "last_name", "avatar_url"],
          },
        ],
      });
      posts.forEach((post) => {
        post.dataValues.likes = likes.filter(
          (like) => like.post_id === post.id
        );
      });
      const comments = await Comment.findAll({
        where: { post_id: posts.map((post) => post.id) },
        attributes: ["id", "user_id", "post_id", "content"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "first_name", "last_name", "avatar_url"],
          },
        ],
      });
      posts.forEach((post) => {
        post.dataValues.comments = comments.filter(
          (comment) => comment.post_id === post.id
        );
      });
      return posts;
    } catch (error) {
      throw new Error("Error retrieving posts: " + error.message);
    }
  },
  async deletePost(post_id, user_id) {
    try {
      const post = await Post.findOne({
        where: { id: post_id, user_id },
      });
      if (!post) {
        throw new Error("Post not found!");
      }
      await Attachment.destroy({
        where: { post_id },
      });
      await post.destroy();
      return { message: "Post deleted successfully." };
    } catch (error) {
      throw new Error("Error deleting post: " + error.message);
    }
  },
  async updatePost(post_id, user_id, data) {
    try {
      const post = await Post.findOne({
        where: { id: post_id, user_id },
      });
      if (!post) {
        throw new Error("Post not found!");
      }
      await post.update(data);
      const updatedPost = await Post.findOne({
        where: { id: post_id },
        include: [{ model: Attachment, as: "attachments" }],
      });
      return updatedPost;
    } catch (error) {
      throw new Error("Error updating post: " + error.message);
    }
  },
  async getPostById(post_id) {
    try {
      const post = await Post.findOne({
        where: { id: post_id },
        include: [{ model: Attachment, as: "attachments" }],
      });
      if (!post) {
        throw new Error("Post not found!");
      }
      const likes = await Like.findAll({
        where: { post_id },
        attributes: ["id", "user_id", "post_id"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "first_name", "last_name", "avatar_url"],
          },
        ],
      });
      post.dataValues.likes = likes;
      const comments = await Comment.findAll({
        where: { post_id },
        attributes: ["id", "user_id", "post_id", "content"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "first_name", "last_name", "avatar_url"],
          },
        ],
      });
      post.dataValues.comments = comments;
      return post;
    } catch (error) {
      throw new Error("Error retrieving post: " + error.message);
    }
  },
  async likePost(post_id, user_id) {
    try {
      const post = await Post.findOne({
        where: { id: post_id },
      });
      if (!post) {
        throw new Error("Post not found!");
      }
      const existingLike = await Like.findOne({
        where: { user_id, post_id },
      });
      if (existingLike) {
        await existingLike.destroy();
        await post.decrement("like_count");
        return { message: "Post unliked successfully." };
      }
      const like = await Like.create({
        user_id,
        post_id,
      });
      await post.increment("like_count");
      return { message: "Post liked successfully.", like };
    } catch (error) {
      throw new Error("Error liking post: " + error.message);
    }
  },
  async addComment(post_id, user_id, content) {
    try {
      const post = await Post.findOne({
        where: { id: post_id },
      });
      if (!post) {
        throw new Error("Post not found!");
      }
      const newComment = await Comment.create({
        post_id,
        user_id,
        content,
      });
      return { message: "Comment added successfully.", content: newComment };
    } catch (error) {
      throw new Error("Error adding comment: " + error.message);
    }
  },
  async deleteComment(post_id, user_id, id) {
    try {
      const comment = await Comment.findOne({
        where: { id, post_id, user_id },
      });
      if (!comment) {
        throw new Error("Comment not found!");
      }
      await comment.destroy();
      return { message: "Comment deleted successfully." };
    } catch (error) {
      throw new Error("Error deleting comment: " + error.message);
    }
  },
  async updateComment(post_id, user_id, id, content) {
    try {
      const comment = await Comment.findOne({
        where: { id, post_id, user_id },
      });
      if (!comment) {
        throw new Error("Comment not found!");
      }
      await comment.update({ content });
      return { message: "Comment updated successfully.", content: comment };
    } catch (error) {
      throw new Error("Error updating comment: " + error.message);
    }
  },
};

module.exports = postService;
