const Post = require("./model");
const Like = require("./like/model");
const Comment = require("./comment/model");
const Attachment = require("./attachment/model");
const User = require("../user/model");
const UserRela = require("../user/user_rela/model");
const UserInfo = require("../user/user_info/model");
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
  async getPostsByUserId(view_id, user_id) {
    try {
      let whereClause = { user_id };

      if (view_id !== user_id) {
        // Check if the users are friends or blocked
        const userRelationship = await UserRela.findOne({
          where: {
            [Op.or]: [
              { user_from: view_id, user_to: user_id },
              { user_from: user_id, user_to: view_id },
            ],
          },
        });

        if (userRelationship) {
          if (userRelationship.status === "blocked") {
            return [];
          } else if (userRelationship.status === "accepted") {
            whereClause.access_modifier = {
              [Op.in]: ["public", "friends_only"],
            };
          } else {
            whereClause.access_modifier = "public";
          }
        } else {
          whereClause.access_modifier = "public";
        }
      }

      const posts = await Post.findAll({
        where: whereClause,
        include: [
          { model: Attachment, as: "attachments" },
          {
            model: User,
            as: "user",
            attributes: ["id", "first_name", "last_name", "avatar_url"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      const likes = await Like.findAll({
        where: { post_id: { [Op.in]: posts.map((post) => post.id) } },
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
        where: { post_id: { [Op.in]: posts.map((post) => post.id) } },
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
  async getUserById(user_id) {
    try {
      const user = await User.findOne({
        where: { id: user_id },
        include: [
          {
            model: UserInfo,
            as: "userInfo", // Chỉ định alias đã định nghĩa
          },
        ],
      });
      if (!user) {
        return null;
      }
      return user;
    } catch (error) {
      throw new Error("Error retrieving user: " + error.message);
    }
  },
  async deletePost(post_id, user_id) {
    try {
      const post = await Post.findOne({
        where: { id: post_id, user_id },
      });
      if (!post) {
        return { error: "Post not found!" };
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
        return { error: "Post not found!" };
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
        include: [
          { model: Attachment, as: "attachments" },
          {
            model: User,
            as: "user",
            attributes: ["id", "first_name", "last_name", "avatar_url"],
          },
        ],
      });
      if (!post) {
        return { error: "Post not found!" };
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
        return { error: "Post not found!" };
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
      const createdComment = await Comment.findOne({
        where: { id: newComment.id },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "first_name", "last_name", "avatar_url"],
          },
        ],
      });
      return createdComment;
    } catch (error) {
      throw new Error("Error adding comment: " + error.message);
    }
  },
  async getCommentsByPostId(post_id) {
    try {
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
      return comments;
    } catch (error) {
      throw new Error("Error retrieving comments: " + error.message);
    }
  },
  async deleteComment(post_id, user_id, id) {
    try {
      const comment = await Comment.findOne({
        where: { id, post_id, user_id },
      });
      if (!comment) {
        return { error: "Comment not found!" };
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
        return { error: "Comment not found!" };
      }
      await comment.update({ content });
      return { message: "Comment updated successfully.", content: comment };
    } catch (error) {
      throw new Error("Error updating comment: " + error.message);
    }
  },
  async getPublicPosts(userId) {
    try {
      const posts = await Post.findAll({
        where: { access_modifier: "public" },
        include: [
          { model: Attachment, as: "attachments" },
          {
            model: User,
            as: "user",
            attributes: ["first_name", "last_name", "avatar_url"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      const likes = await Like.findAll({
        where: { post_id: { [Op.in]: posts.map((post) => post.id) } },
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
        where: { post_id: { [Op.in]: posts.map((post) => post.id) } },
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
      throw new Error("Error retrieving public posts: " + error.message);
    }
  },
  async getNonFriendPublicPosts(user_id, filter) {
    try {
      // Get the list of friend IDs
      const sentRequests = await UserRela.findAll({
        where: {
          user_from: user_id,
          status: {
            [Op.in]: ["accepted", "blocked"], // Tìm các trạng thái "accepted" hoặc "blocked"
          },
        },
        attributes: ["user_to"],
      });

      const receivedRequests = await UserRela.findAll({
        where: {
          user_to: user_id,
          status: {
            [Op.in]: ["accepted", "blocked"], // Tìm các trạng thái "accepted" hoặc "blocked"
          },
        },
        attributes: ["user_from"],
      });

      const friendIds = [
        ...sentRequests.map((rel) => rel.user_to),
        ...receivedRequests.map((rel) => rel.user_from),
      ];

      // Get public posts not from friends
      const { index, limit } = filter;
      const posts = await Post.findAll({
        where: {
          user_id: { [Op.notIn]: friendIds },
          access_modifier: "public",
        },
        include: [
          { model: Attachment, as: "attachments" },
          {
            model: User,
            as: "user",
            attributes: ["id", "first_name", "last_name", "avatar_url"],
          },
        ],
        order: [["createdAt", "DESC"]],
        offset: index * limit,
        limit: limit,
      });

      const likes = await Like.findAll({
        where: { post_id: { [Op.in]: posts.map((post) => post.id) } },
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
        where: { post_id: { [Op.in]: posts.map((post) => post.id) } },
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
      throw new Error(
        "Error retrieving non-friend public posts: " + error.message
      );
    }
  },
  async getFriendPosts(user_id) {
    try {
      // Kiểm tra người dùng có tồn tại
      const user = await User.findByPk(user_id);
      if (!user) {
        return { error: "User not found" };
      }

      // Tìm danh sách bạn bè từ cả yêu cầu gửi và nhận
      const sentRequests = await UserRela.findAll({
        where: {
          user_from: user_id,
          status: "accepted",
        },
        include: [
          {
            model: User,
            as: "toUser",
            attributes: ["id", "first_name", "last_name", "avatar_url"],
          },
        ],
      });

      const receivedRequests = await UserRela.findAll({
        where: {
          user_to: user_id,
          status: "accepted",
        },
        include: [
          {
            model: User,
            as: "fromUser",
            attributes: ["id", "first_name", "last_name", "avatar_url"],
          },
        ],
      });

      // Kết hợp danh sách bạn bè
      const friends = [
        ...sentRequests.map((rel) => rel.toUser),
        ...receivedRequests.map((rel) => rel.fromUser),
      ];
      const friendIds = friends.map((friend) => friend.id);

      // Lấy bài viết của bạn bè
      const posts = await Post.findAll({
        where: {
          user_id: { [Op.in]: friendIds },
          access_modifier: { [Op.in]: ["public", "friends_only"] },
        },
        include: [
          { model: Attachment, as: "attachments" },
          {
            model: User,
            as: "user",
            attributes: ["id", "first_name", "last_name", "avatar_url"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      // Lấy thông tin lượt thích
      const likes = await Like.findAll({
        where: { post_id: { [Op.in]: posts.map((post) => post.id) } },
        attributes: ["id", "user_id", "post_id"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "first_name", "last_name", "avatar_url"],
          },
        ],
      });

      // Gắn thông tin lượt thích vào bài viết
      posts.forEach((post) => {
        post.dataValues.likes = likes.filter(
          (like) => like.post_id === post.id
        );
      });

      // Lấy thông tin bình luận
      const comments = await Comment.findAll({
        where: { post_id: { [Op.in]: posts.map((post) => post.id) } },
        attributes: ["id", "user_id", "post_id", "content"],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "first_name", "last_name", "avatar_url"],
          },
        ],
      });

      // Gắn thông tin bình luận vào bài viết
      posts.forEach((post) => {
        post.dataValues.comments = comments.filter(
          (comment) => comment.post_id === post.id
        );
      });

      return posts;
    } catch (error) {
      throw new Error("Error retrieving friend posts: " + error.message);
    }
  },
  async deletePostAdmin(postId){
    try {
      // Delete related records in likes, comments, and attachments tables
      await Like.destroy({ where: { post_id: postId } });
      await Comment.destroy({ where: { post_id: postId } });
      await Attachment.destroy({ where: { post_id: postId } });
  
      // Delete the post
      const result = await Post.destroy({ where: { id: postId } });
  
      if (result === 0) {
        throw new Error('Post not found');
      }
  
      return { message: 'Post and related records deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting post: ${error.message}`);
    }
  },
};

module.exports = postService;
