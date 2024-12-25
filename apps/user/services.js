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
  async searchFriends(query) {
    try {
      const friends = await User.findAll({
        where: {
          [Op.or]: [
            { first_name: { [Op.like]: `%${query}%` } },
            { last_name: { [Op.like]: `%${query}%` } },
          ],
        },
      });
      return friends;
    } catch (error) {
      console.error("Error searching friends:", error);
      throw error;
    }
  },
  async notifyLike(userId, postId) {
    const post = await Post.findByPk(postId);
    const user = await User.findByPk(userId);
    const message = `${user.first_name} ${user.last_name} liked your post.`;
    await this.createNotification(post.userId, 'like', message, user.avatar_url, `${user.first_name} ${user.last_name}`);
  },

  async notifyComment(userId, postId, commentId) {
    const post = await Post.findByPk(postId);
    const user = await User.findByPk(userId);
    const comment = await Comment.findByPk(commentId);
    const message = `${user.first_name} ${user.last_name} commented: "${comment.content}" on your post.`;
    await this.createNotification(post.userId, 'comment', message, user.avatar_url, `${user.first_name} ${user.last_name}`);
  },

  async notifyBirthday(userId, friendId) {
    const user = await User.findByPk(userId);
    const friend = await User.findByPk(friendId);
    const message = `Today is ${friend.first_name} ${friend.last_name}'s birthday.`;
    await this.createNotification(userId, 'birthday', message, friend.avatar_url, `${friend.first_name} ${friend.last_name}`);
  },

  async notifyMessage(senderId, receiverId, messageContent) {
    const sender = await User.findByPk(senderId);
    const message = `${sender.first_name} ${sender.last_name} sent you a message: "${messageContent}".`;
    await this.createNotification(receiverId, 'message', message, sender.avatar_url, `${sender.first_name} ${sender.last_name}`);
  },

  async getNotifications(userId) {
    // console.log(userId);
    try {

      // Fetch accepted friends
      const acceptedFriends = await UserRela.findAll({
        where: {
          user_from: userId,
          status: "accepted",
        },
        attributes: ['user_to'], // Only need user_to
      });

      // Extract list of friend IDs
      const friendIds = acceptedFriends.map(rel => rel.user_to);

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
              Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM date_of_birth')),
              todayMonth
            ),

            Sequelize.where(
              Sequelize.fn('EXTRACT', Sequelize.literal('DAY FROM date_of_birth')),
              todayDay
            ),
          ],
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['first_name', 'last_name'], // Get necessary info from User table
          },
        ],
        attributes: ['user_id', 'date_of_birth'], // Get necessary info from UserInfo table
      });

      



      // Tìm tất cả các post có user_id = userId trong bảng Post
      const userPosts = await Post.findAll({
        where: { user_id: userId },
        attributes: ['id'], // Chỉ cần lấy post_id
      });

      // Trích xuất danh sách post_id
      const postIds = userPosts.map(post => post.id);

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
            as: 'post',
            include: [
              {
                model: User,
                as: 'user',
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
            as: 'post',
            include: [
              {
                model: User,
                as: 'user',
              },
            ],
          },
        ],
      });

      // Lấy danh sách conversation_id từ bảng Participant
      const participantConversations = await Participant.findAll({
        where: { user_id: userId },
        attributes: ['conversation_id'], // Chỉ lấy trường conversation_id
      });

      // Trích xuất danh sách conversation_id
      const conversationIds = participantConversations.map(pc => pc.conversation_id);

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
            as: 'conversation',
          },
        ],
      });



      const notifications = [];

      for (const like of likes) {
        const sender = await User.findByPk(like.user_id);
        // const receiver = message.conversation.participants.find(p => p.user_id !== userId).user;
        notifications.push({
          type: 'like',
          message: `${sender.first_name} ${sender.last_name} liked your post.`,
          profileImage: sender.avatar_url,
          name: `${sender.first_name} ${sender.last_name}`,
          createdAt: like.createdAt
        });
      }

      for (const comment of comments) {
        const sender = await User.findByPk(comment.user_id);
        // const receiver = message.conversation.participants.find(p => p.user_id !== userId).user;
        notifications.push({
          type: 'comment',
          message: `${sender.first_name} ${sender.last_name} comment "${comment.content}" on your post.`,
          profileImage: sender.avatar_url,
          name: `${sender.first_name} ${sender.last_name}`,
          createdAt: comment.createdAt
        });
      }

      for (const message of messages) {
        const sender = await User.findByPk(message.user_id);
        // const receiver = message.conversation.participants.find(p => p.user_id !== userId).user;
        notifications.push({
          type: 'message',
          message: `${sender.first_name} ${sender.last_name} sent you a message: "${message.content}".`,
          profileImage: sender.avatar_url,
          name: `${sender.first_name} ${sender.last_name}`,
          createdAt: message.createdAt
        });
      }

      for (const birthday of birthdates) {
        const sender = await User.findByPk(birthday.user_id);
        // const receiver = message.conversation.participants.find(p => p.user_id !== userId).user;
        notifications.push({
          type: 'birthday',
          message: `Today is ${sender.first_name} ${sender.last_name} birthday!!! Let's celebrate!`,
          profileImage: sender.avatar_url,
          name: `${sender.first_name} ${sender.last_name}`,
          createdAt: new Date()
        });
      }

      // Sort notifications by createdAt
      notifications.sort((a, b) => b.createdAt - a.createdAt);

      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
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

      if (!friendRequest) {
        return { message: "Friend request not found" };
      }

      friendRequest.status = "accepted";
      await friendRequest.save();

      return { message: "Friend request accepted" };
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

  async blockFriend(userId, friendId) {
    try {
      const existingRelation = await UserRela.findOne({
        where: {
          user_from: userId,
          user_to: friendId,
        },
      });

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
};

module.exports = userService;
