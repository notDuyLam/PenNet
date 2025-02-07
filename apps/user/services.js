const bcrypt = require("bcrypt");
const User = require("./model");
const UserInfo = require("./user_info/model");
const emailHelper = require("../../helpers/emailService.helper");
const Like = require("../post/like/model");
const Post = require("../post/model");
const Comment = require("../post/comment/model");
const Message = require("../conversation/message/model");
const Participant = require("../conversation/participant/model");
const Conversation = require("../conversation/model");
const UserRela = require("./user_rela/model");
const Review = require("./user_review/model");
const { Op, Sequelize } = require("sequelize");

const userService = {
  // Tạo người dùng mới
  async createUser(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10); // Mã hóa mật khẩu
      const verificationToken = await bcrypt.genSalt(10);
      const newUser = await User.create({
        ...userData,
        verificationToken: verificationToken,
        password_hash: hashedPassword, // Lưu mật khẩu đã mã hóa
      });
      await UserInfo.create({
        user_id: newUser.id,
      });
      emailHelper.sendVerificationEmail(newUser.email, verificationToken);

      return await User.findOne({
        where: { id: newUser.id },
        include: [
          {
            model: UserInfo,
            as: "userInfo",
          },
        ],
      });
    } catch (error) {
      throw new Error("Error creating user: " + error.message);
    }
  },
  // Kiểm tra các trường bắt buộc
  async validateUserData(userData) {
    const { first_name, last_name, email, password } = userData;
    if (!first_name || !last_name || !email || !password) {
      return true;
    }
    return false;
  },
  // Kiểm tra email đã tồn tại không
  async checkIfEmailExists(email) {
    try {
      const user = await User.findOne({ where: { email } });
      return user !== null;
    } catch (error) {
      throw new Error("Error checking email: " + error.message);
    }
  },
  async getUserByEmail(email) {
    try {
      const user = await User.findOne({
        where: { email },
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
      throw new Error("Error checking email: " + error.message);
    }
  },
  // Tạo người dùng từ thông tin lấy từ email
  async createUserEmail(userData) {
    try {
      const randomPassword = Math.random().toString(36).slice(-8); // Tạo mật khẩu ngẫu nhiên
      const hashedPassword = await bcrypt.hash(randomPassword, 10); // Mã hóa mật khẩu

      const newUser = {
        email: userData.email,
        isVerify: true,
        first_name: userData.first_name,
        last_name: userData.last_name,
        // avatar_url: userData.avatar_url,
        password_hash: hashedPassword, // Lưu mật khẩu đã mã hóa
      };
      const createdUser = await User.create(newUser);
      await UserInfo.create({
        user_id: createdUser.id,
        date_of_birth: userData.date_of_birth, // Ngày sinh
        country: userData.country, // Quốc gia
      });
      const user = await User.findOne({
        where: { email: createdUser.email },
        include: [
          {
            model: UserInfo,
            as: "userInfo",
          },
        ],
      });

      return user;
    } catch (error) {
      throw new Error("Error creating user: " + error.message);
    }
  },
  async verifyAccount(token) {
    try {
      const user = await User.findOne({ where: { verificationToken: token } });
      if (!user) {
        return { error: "Invalid token" };
      }
      user.verificationToken = null;
      user.isVerify = true;
      await user.save();
      return user;
    } catch (error) {
      throw new Error("Error verifying account: " + error.message);
    }
  },
  async forgotPassword(email) {
    try {
      const user = await User.findOne({ where: { email: email } });
      if (!user) {
        return { message: "User not found" };
      }
      const token = await bcrypt.genSalt(10);
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 900000; // 15 minutes
      await user.save();
      await emailHelper.sendResetPasswordEmail(user.email, token);
      return { message: "Token reset email sent" };
    } catch (error) {
      return { message: "Internal server error" };
    }
  },
  async resetPassword(token, newPassword) {
    try {
      const user = await User.findOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { [Op.gt]: Date.now() },
        },
      });
      if (!user) {
        return { message: "Invalid token" };
      }
      if (!user.isVerify) {
        return { error: "User account is not verified." };
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password_hash = hashedPassword;
      user.resetPasswordToken = null; // Xóa token
      user.resetPasswordExpires = null; // Xóa thời gian hết hạn
      await user.save();

      return { message: "Password reset successful" };
    } catch (error) {
      return { message: "Internal server error" };
    }
  },
  async getUserById(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return { error: "User not found" };
      }
      return user;
    } catch (error) {
      return { error: "Error fetching user: " + error.message };
    }
  },
  async updateUser(userId, updateData) {
    try {
      const { first_name, last_name, date_of_birth, country } = updateData;
      const user = await User.findOne({
        where: { id: userId },
        include: [{ model: UserInfo, as: "userInfo" }],
      });
      if (!user) {
        throw new Error("User not found");
      }

      const updateUserInfo = {
        date_of_birth: date_of_birth || user.userInfo.date_of_birth,
        country: country || user.userInfo.country,
      };
      const updateUser = {
        first_name: first_name || user.first_name,
        last_name: last_name || user.last_name,
      };

      await UserInfo.update(updateUserInfo, { where: { user_id: userId } });
      await User.update(updateUser, { where: { id: userId } });
      const updatedUser = await User.findOne({
        where: { id: userId },
        include: [
          {
            model: UserInfo,
            as: "userInfo",
          },
        ],
      });
      if (!updatedUser) {
        throw new Error("User not found");
      }
      return updatedUser;
    } catch (error) {
      throw new Error("Error updating user: " + error.message);
    }
  },
  async updateUserAvatar(userId, avatarUrl) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }
      user.avatar_url = avatarUrl.toString();
      await user.save();
      return await User.findOne({
        where: { id: user.id },
        include: [
          {
            model: UserInfo,
            as: "userInfo",
          },
        ],
      });
    } catch (error) {
      throw new Error("Error updating user avatar: " + error.message);
    }
  },
  async verifyPassword(userId, currentPassword) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      return isMatch;
    } catch (error) {
      throw new Error("Error verifying password: " + error.message);
    }
  },
  async updatePassword(userId, newPassword) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password_hash = hashedPassword;
      await user.save();
      return { message: "Password updated successfully" };
    } catch (error) {
      throw new Error("Error updating password: " + error.message);
    }
  },
  async searchFriends(userId, query) {
    try {
      // Convert query to lowercase for case-insensitive search
      const lowerCaseQuery = query.toLowerCase();

      // Tìm kiếm bạn bè theo query
      const friends = await User.findAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                Sequelize.where(
                  Sequelize.fn("LOWER", Sequelize.col("first_name")),
                  { [Op.like]: `%${lowerCaseQuery}%` }
                ),
                Sequelize.where(
                  Sequelize.fn("LOWER", Sequelize.col("last_name")),
                  { [Op.like]: `%${lowerCaseQuery}%` }
                ),
                Sequelize.where(
                  Sequelize.fn(
                    "LOWER",
                    Sequelize.fn(
                      "CONCAT",
                      Sequelize.col("first_name"),
                      " ",
                      Sequelize.col("last_name")
                    )
                  ),
                  { [Op.like]: `%${lowerCaseQuery}%` }
                ),
              ],
            },
            { id: { [Op.ne]: userId } }, // Loại bỏ id trùng với userId
          ],
        },
        attributes: ["id", "first_name", "last_name", "avatar_url", "isBanned"],
      });

      if (!friends || friends.length === 0) {
        console.warn("No friends found for the given query.");
        return [];
      }

      // Lấy danh sách quan hệ đã được chấp nhận (cả gửi và nhận)
      const acceptedRelationships = await UserRela.findAll({
        where: {
          [Op.or]: [{ user_from: userId }, { user_to: userId }],
          status: "accepted",
        },
        attributes: ["user_from", "user_to"],
      });

      const pendingRelationships = await UserRela.findAll({
        where: {
          [Op.or]: [{ user_from: userId }, { user_to: userId }],
          status: "pending",
        },
        attributes: ["user_from", "user_to"],
      });

      const friendIds = new Set(
        acceptedRelationships.map((rel) =>
          rel.user_from === userId ? rel.user_to : rel.user_from
        )
      );

      const pendingRequestIds = new Set(
        pendingRelationships.map((rel) =>
          rel.user_from === userId ? rel.user_to : rel.user_from
        )
      );

      const results = friends.map((friend) => {
        const friendData = friend?.toJSON ? friend.toJSON() : {};
        return {
          ...friendData,
          isFriend: friendIds.has(friendData.id),
          pendingRequest: pendingRequestIds.has(friendData.id),
        };
      });
      return results;
    } catch (error) {
      console.error("Error searching friends:", error.message, error.stack);
      throw error;
    }
  },
  async getNotifications(userId) {
    try {
      // Fetch accepted friends
      const acceptedFriends = await UserRela.findAll({
        where: {
          user_from: userId,
          status: "accepted",
        },
        attributes: ["user_to"], // Only need user_to
      });

      // Extract list of friend IDs
      const friendIds = acceptedFriends.map((rel) => rel.user_to);

      // Find all records in UserInfo with user_id in friendIds
      // and date_of_birth matching today, join with User table to get first_name and last_name
      const today = new Date();
      const todayMonth = today.getMonth() + 1; // getMonth() returns 0-11
      const todayDay = today.getDate();

      const birthdates = await UserInfo.findAll({
        where: {
          user_id: { [Op.in]: friendIds },
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn(
                "EXTRACT",
                Sequelize.literal("MONTH FROM date_of_birth")
              ),
              todayMonth
            ),
            Sequelize.where(
              Sequelize.fn(
                "EXTRACT",
                Sequelize.literal("DAY FROM date_of_birth")
              ),
              todayDay
            ),
          ],
        },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["first_name", "last_name"], // Get necessary info from User table
          },
        ],
        attributes: ["user_id", "date_of_birth"], // Get necessary info from UserInfo table
      });

      // Tìm tất cả các post có user_id = userId trong bảng Post
      const userPosts = await Post.findAll({
        where: { user_id: userId },
        attributes: ["id"], // Chỉ cần lấy post_id
      });

      // Trích xuất danh sách post_id
      const postIds = userPosts.map((post) => post.id);

      // Tìm tất cả các like có post_id thuộc danh sách postIds
      // và user_id khác với userId
      const likes = await Like.findAll({
        where: {
          post_id: { [Op.in]: postIds },
          user_id: { [Op.ne]: userId }, // Chỉ chọn các like có user_id khác userId
        },
        include: [
          {
            model: Post,
            as: "post",
            include: [
              {
                model: User,
                as: "user",
              },
            ],
          },
        ],
      });

      const comments = await Comment.findAll({
        where: {
          post_id: { [Op.in]: postIds },
          user_id: { [Op.ne]: userId }, // Chỉ chọn các comment có user_id khác userId
        },
        include: [
          {
            model: Post,
            as: "post",
            include: [
              {
                model: User,
                as: "user",
              },
            ],
          },
        ],
      });

      // Lấy danh sách conversation_id từ bảng Participant
      const participantConversations = await Participant.findAll({
        where: { user_id: userId },
        attributes: ["conversation_id"], // Chỉ lấy trường conversation_id
      });

      // Trích xuất danh sách conversation_id
      const conversationIds = participantConversations.map(
        (pc) => pc.conversation_id
      );

      // Tìm tất cả các Message có conversation_id trùng với danh sách conversationIds
      // và user_id khác với userId
      const messages = await Message.findAll({
        where: {
          conversation_id: { [Op.in]: conversationIds },
          user_id: { [Op.ne]: userId }, // Lọc các tin nhắn không phải của userId
        },
        include: [
          {
            model: Conversation,
            as: "conversation",
          },
        ],
      });

      // Fetch pending friend requests
      const friendRequests = await UserRela.findAll({
        where: {
          user_to: userId,
          status: "pending",
        },
      });

      const notifications = [];

      for (const like of likes) {
        const sender = await User.findByPk(like.user_id);
        notifications.push({
          type: "like",
          message: `${sender.first_name} ${sender.last_name} liked your post.`,
          profileImage: sender.avatar_url,
          name: `${sender.first_name} ${sender.last_name}`,
          createdAt: like.createdAt,
        });
      }

      for (const comment of comments) {
        const sender = await User.findByPk(comment.user_id);
        notifications.push({
          type: "comment",
          message: `${sender.first_name} ${sender.last_name} commented "${comment.content}" on your post.`,
          profileImage: sender.avatar_url,
          name: `${sender.first_name} ${sender.last_name}`,
          createdAt: comment.createdAt,
        });
      }

      for (const message of messages) {
        const sender = await User.findByPk(message.user_id);
        notifications.push({
          type: "message",
          message: `${sender.first_name} ${sender.last_name} sent you a message: "${message.content}".`,
          profileImage: sender.avatar_url,
          name: `${sender.first_name} ${sender.last_name}`,
          createdAt: message.createdAt,
        });
      }

      for (const birthday of birthdates) {
        const sender = await User.findByPk(birthday.user_id);
        notifications.push({
          type: "birthday",
          message: `Today is ${sender.first_name} ${sender.last_name}'s birthday! Let's celebrate!`,
          profileImage: sender.avatar_url,
          name: `${sender.first_name} ${sender.last_name}`,
          createdAt: new Date(),
        });
      }

      for (const request of friendRequests) {
        const sender = await User.findByPk(request.user_from);
        notifications.push({
          type: "friend_request",
          message: `${sender.first_name} ${sender.last_name} sent you a friend request.`,
          profileImage: sender.avatar_url,
          name: `${sender.first_name} ${sender.last_name}`,
          createdAt: request.createdAt,
        });
      }

      // Sort notifications by createdAt
      notifications.sort((a, b) => b.createdAt - a.createdAt);

      return notifications;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  async getFriends(userId) {
    try {
      // Find User first
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Find sentRequests
      const sentRequests = await UserRela.findAll({
        where: {
          user_from: userId,
          status: "accepted",
        },
        include: [
          {
            model: User,
            as: "toUser", // Use alias 'toUser'
            attributes: {
              exclude: [
                "password_hash",
                "isVerify",
                "verificationToken",
                "resetPasswordToken",
                "resetPasswordExpires",
                "email",
              ],
            },
          },
        ],
      });

      // Find receivedRequests
      const receivedRequests = await UserRela.findAll({
        where: {
          user_to: userId,
          status: "accepted",
        },
        include: [
          {
            model: User,
            as: "fromUser", // Use alias 'fromUser'
            attributes: {
              exclude: [
                "password_hash",
                "isVerify",
                "verificationToken",
                "resetPasswordToken",
                "resetPasswordExpires",
                "email",
              ],
            },
          },
        ],
      });

      // Combine friend lists from both types of requests
      const friends = [
        ...sentRequests.map((rel) => rel.toUser),
        ...receivedRequests.map((rel) => rel.fromUser),
      ];

      return friends;
    } catch (error) {
      throw new Error("Error fetching friends: " + error.message);
    }
  },

  async sendFriendRequest(userId, friendId) {
    try {
      const existingRequest = await UserRela.findOne({
        where: {
          user_from: userId,
          user_to: friendId,
        },
      });

      if (existingRequest) {
        return { message: "Friend request already sent" };
      }

      const newRequest = await UserRela.create({
        user_from: userId,
        user_to: friendId,
        status: "pending",
      });

      return newRequest;
    } catch (error) {
      throw new Error("Error sending friend request: " + error.message);
    }
  },

  async getFriendRequests(userId) {
    try {
      const receivedRequests = await UserRela.findAll({
        where: {
          user_to: userId,
          status: "pending",
        },
        include: [
          {
            model: User,
            as: "fromUser", // Use alias 'fromUser'
            attributes: {
              exclude: [
                "password_hash",
                "isVerify",
                "verificationToken",
                "resetPasswordToken",
                "resetPasswordExpires",
                "email",
              ],
            },
          },
        ],
      });

      return receivedRequests.map((rel) => rel.fromUser);
    } catch (error) {
      throw new Error("Error fetching friend requests: " + error.message);
    }
  },

  async getBlockedFriends(userId) {
    try {
      const blockedUsers = await UserRela.findAll({
        where: {
          user_from: userId,
          status: "blocked",
        },
        include: [
          {
            model: User,
            as: "toUser",
            attributes: {
              exclude: [
                "email",
                "password_hash",
                "isVerify",
                "verificationToken",
                "resetPasswordToken",
                "resetPasswordExpires",
              ],
            },
          },
        ],
      });
      return blockedUsers.map((rel) => rel.toUser);
    } catch (error) {
      throw new Error("Error fetching blocked friends: " + error.message);
    }
  },

  async acceptFriendRequest(userId, friendId) {
    try {
      const friendRequest = await UserRela.findOne({
        where: {
          user_from: friendId,
          user_to: userId,
          status: "pending",
        },
      });
      const friend = await User.findByPk(friendId, {
        attributes: {
          exclude: [
            "password_hash",
            "isVerify",
            "verificationToken",
            "resetPasswordToken",
            "resetPasswordExpires",
            "email",
          ],
        },
      });
      if (!friendRequest) {
        return { message: "Friend request not found" };
      }

      friendRequest.status = "accepted";
      await friendRequest.save();

      return { message: "Friend request accepted", info: friend };
    } catch (error) {
      throw new Error("Error accepting friend request: " + error.message);
    }
  },
  async denyFriendRequest(userId, friendId) {
    try {
      const friendRequest = await UserRela.findOne({
        where: {
          user_from: friendId,
          user_to: userId,
          status: "pending",
        },
      });

      if (!friendRequest) {
        return { message: "Friend request not found" };
      }

      await friendRequest.destroy();

      return { message: "Friend request denied" };
    } catch (error) {
      throw new Error("Error denying friend request: " + error.message);
    }
  },
  async unFriendUser(userId, friendId) {
    try {
      const relation = await UserRela.findOne({
        where: {
          [Op.or]: [
            { user_from: userId, user_to: friendId },
            { user_from: friendId, user_to: userId },
          ],
          status: "accepted",
        },
      });

      if (!relation) {
        return { message: "Friendship not found" };
      }

      await relation.destroy();
      return { message: "Friendship removed successfully" };
    } catch (error) {
      throw new Error("Error removing friendship: " + error.message);
    }
  },
  async blockFriend(userId, friendId) {
    try {
      const existingRelation = await UserRela.findOne({
        where: {
          user_from: userId,
          user_to: friendId,
        },
      });

      const reverseRelation = await UserRela.findOne({
        where: {
          user_from: friendId,
          user_to: userId,
        },
      });

      if (reverseRelation) {
        await reverseRelation.destroy();
      }

      if (!existingRelation) {
        await UserRela.create({
          user_from: userId,
          user_to: friendId,
          status: "blocked",
        });
        return { message: "Friend blocked successfully" };
      }

      existingRelation.status = "blocked";
      await existingRelation.save();

      return { message: "Friend blocked successfully" };
    } catch (error) {
      throw new Error("Error blocking friend: " + error.message);
    }
  },
  async unblockFriend(userId, friendId) {
    try {
      const existingRelation = await UserRela.findOne({
        where: {
          user_from: userId,
          user_to: friendId,
          status: "blocked",
        },
      });

      if (!existingRelation) {
        return { message: "No blocked relation found" };
      }

      await existingRelation.destroy();

      return { message: "Friend unblocked successfully" };
    } catch (error) {
      throw new Error("Error unblocking friend: " + error.message);
    }
  },
  async deleteUser(userId) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error("User not found");
      }

      // Delete related records in userInfo table
      await UserInfo.destroy({ where: { user_id: userId } });

      // Delete related records in userRela table
      await UserRela.destroy({ where: { user_from: userId } });
      await UserRela.destroy({ where: { user_to: userId } });

      await user.destroy();
      return { message: "User and related records deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  },
  async banUser(userId) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error("User not found");
      }

      user.isBanned = true;
      await user.save();

      return { message: "User banned successfully" };
    } catch (error) {
      throw new Error(`Error banning user: ${error.message}`);
    }
  },
  async unbanUser(userId) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error("User not found");
      }

      user.isBanned = false;
      await user.save();

      return { message: "User banned successfully" };
    } catch (error) {
      throw new Error(`Error banning user: ${error.message}`);
    }
  },
  async isFriend(userId, reviewedUserId) {
    try {
      const relation = await UserRela.findOne({
        where: {
          [Op.or]: [
            { user_from: userId, user_to: reviewedUserId },
            { user_from: reviewedUserId, user_to: userId },
          ],
          status: "accepted",
        },
      });
      return relation !== null;
    } catch (error) {
      throw new Error("Error checking friendship: " + error.message);
    }
  },
  async getNumFollower(userId) {
    try {
      // Count followers where user_to is the userId
      const followersCount = await UserRela.count({
        where: {
          user_to: userId,
          status: "accepted",
        },
      });

      // Count followers where user_from is the userId
      const followingCount = await UserRela.count({
        where: {
          user_from: userId,
          status: "accepted",
        },
      });

      // Sum the counts
      const totalCount = followersCount + followingCount;

      return totalCount;
    } catch (error) {
      throw new Error(
        "Error fetching follower and following count: " + error.message
      );
    }
  },
  async getNumFollowing(userId) {
    try {
      const followingCount = await UserRela.count({
        where: {
          user_from: userId,
          status: "accepted",
        },
      });
      return followingCount;
    } catch (error) {
      throw new Error("Error fetching following count: " + error.message);
    }
  },
  async addReview(userId, reviewedUserId, content) {
    try {
      const review = await Review.create({
        user_from: userId,
        user_to: reviewedUserId,
        content: content,
      });
      return review;
    } catch (error) {
      throw new Error("Error adding review: " + error.message);
    }
  },
  async deleteReview(userId, reviewedUserId, reviewId) {
    try {
      let review;
      if (userId == reviewedUserId) {
        review = await Review.findOne({
          where: {
            id: reviewId,
          },
        });
      } else {
        review = await Review.findOne({
          where: {
            id: reviewId,
            user_from: userId,
            user_to: reviewedUserId,
          },
        });
      }

      if (!review) {
        throw new Error("Review not found");
      }

      await review.destroy();
      return { message: "Review deleted successfully" };
    } catch (error) {
      throw new Error("Error deleting review: " + error.message);
    }
  },
  async editReview(userId, reviewedUserId, reviewId, content) {
    try {
      const review = await Review.findOne({
        where: {
          id: reviewId,
          user_from: userId,
          user_to: reviewedUserId,
        },
      });

      if (!review) {
        throw new Error("Review not found");
      }

      review.content = content;
      await review.save();

      return review;
    } catch (error) {
      throw new Error("Error editing review: " + error.message);
    }
  },
  async getReviewers(user_id) {
    try {
      const reviews = await Review.findAll({
        where: { user_to: user_id },
        include: [
          {
            model: User,
            as: "fromUser",
            attributes: ["id", "first_name", "last_name", "avatar_url"],
          },
        ],
      });
      return reviews;
    } catch (error) {
      throw new Error("Error retrieving reviews: " + error.message);
    }
  },
};

module.exports = userService;
