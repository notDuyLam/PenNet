const Post = require("./model");
const Attachment = require("./attachment/model");
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
        include: [{ model: Attachment, as: "attachments" }],
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
      return post;
    } catch (error) {
      throw new Error("Error retrieving post: " + error.message);
    }
  },
};

module.exports = postService;
