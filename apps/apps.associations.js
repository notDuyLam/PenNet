const User = require('./user/model');                               // Model User
const UserInfo = require('./user/user_info/model');                 // Model UserInfo
const UserRela = require('./user/user_rela/model');                 // Model UserRela

const Post = require('./post/model');                               // Model Post
const Like = require('./post/like/model');                          // Model Like
const Comment = require('./post/comment/model');                    // Model Like

const Conversation = require('./conversation/model');               // Model Conversation
const Participant = require('./conversation/participant/model');    // Model Participant
const Message = require('./conversation/message/model');            // Model Message

// User - UserInfo
User.hasOne(UserInfo, {
  foreignKey: 'user_id',
  as: 'userInfo',
});
UserInfo.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// User - UserRela
User.hasMany(UserRela, {
  foreignKey: 'user_from',
  as: 'sentRequests',
});
User.hasMany(UserRela, {
  foreignKey: 'user_to',
  as: 'receivedRequests',
});
UserRela.belongsTo(User, {
  foreignKey: 'user_from',
  as: 'fromUser',
});
UserRela.belongsTo(User, {
  foreignKey: 'user_to',
  as: 'toUser',
});

// User - Post
User.hasMany(Post, {
  foreignKey: 'user_id',
  as: 'posts',
});

Post.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Post - Post
Post.belongsTo(Post, {
  foreignKey: 'shared_post_id',
  as: 'sharedPost',
});

// User - Like
User.hasMany(Like, {
  foreignKey: 'user_id',
  as: 'likes',
});
Like.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Post - Like
Post.hasMany(Like, {
  foreignKey: 'post_id',
  as: 'likes',
});
Like.belongsTo(Post, {
  foreignKey: 'post_id',
  as: 'post',
});

// User - Comment
User.hasMany(Comment, {
  foreignKey: 'user_id',
  as: 'comments',
});
Comment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Post - Comment
Post.hasMany(Comment, {
  foreignKey: 'post_id',
  as: 'comments',
});
Comment.belongsTo(Post, {
  foreignKey: 'post_id',
  as: 'post',
});

// User - Participant
User.hasMany(Participant, {
  foreignKey: 'user_id',
  as: 'participants',
});
Participant.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Conversation - Participant
Conversation.hasMany(Participant, {
  foreignKey: 'conversation_id',
  as: 'participants',
});
Participant.belongsTo(Conversation, {
  foreignKey: 'conversation_id',
  as: 'conversation',
});

// User - Message
User.hasMany(Message, {
  foreignKey: 'user_id',
  as: 'messages',
});
Message.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Conversation - Message
Conversation.hasMany(Message, {
  foreignKey: 'conversation_id',
  as: 'messages',
});
Message.belongsTo(Conversation, {
  foreignKey: 'conversation_id',
  as: 'conversation',
});


module.exports = {
  User,
  UserInfo,
  UserRela,
  Post,
  Like,
  Comment,
  Conversation,
  Participant,
  Message,
};
