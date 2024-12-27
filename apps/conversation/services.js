const Conversation = require('./model');
const Participant = require('./participant/model');
const User = require('../user/model');
const Message = require('./message/model');

const { Op, Sequelize } = require("sequelize");

class ConversationService {
    static async createConversationWithParticipants(user1Id, user2Id, isGroup = false) {
        try {
        const conversation = await Conversation.create(
            { is_group: isGroup }
        );
        await Participant.create(
            { user_id: user1Id, conversation_id: conversation.id }
        );
        await Participant.create(
            { user_id: user2Id, conversation_id: conversation.id }
        );
        } catch (error) {
            throw new Error(`Error creating conversation with participants: ${error.message}`);
        }
    }

    static async getAllHeaders(userId) {
      try {
        // const headers = await Conversation.findAll({
        //   include: [
        //     {
        //       model: Participant,
        //       as: 'participants',
        //       where: { user_id: userId },
        //       include: [
        //         {
        //           model: User,
        //           as: 'user',
        //           attributes: ['first_name', 'last_name', 'avatar_url']
        //         },
        //       ]
        //     },
        //     {
        //       model: Message,
        //       as: 'messages',
        //       attributes: ['content', 'createdAt'],
        //       order: [['createdAt', 'DESC']],
        //       limit: 1
        //     }
        //   ]
        // });

        const conversations = await Conversation.findAll({
          include: [
            {
              model: Participant,
              as: 'participants',
              where: { user_id: userId }
            },
          ]
        });

        const conversationIds = conversations.map((conversation)=>{
          return conversation.id;
        });

        const headers = await Conversation.findAll({
          where: {
            id: {
              [Op.in]: conversationIds
            }
          },
          include: [
            {
              model: Participant,
              as: 'participants',
              include: [
                {
                  model: User,
                  as: 'user',
                  where: {
                    id: { [Sequelize.Op.ne]: userId }
                  },
                  attributes: ['first_name', 'last_name', 'avatar_url']
                },
              ]
            },
            {
              model: Message,
              as: 'messages',
              attributes: ['content', 'createdAt'],
              order: [['createdAt', 'DESC']],
              limit: 1
            }
          ]
        });

        const result = headers.map(header => {
          const conversation_id = header.id;
          const name = header.participants[0].user.first_name + " " + header.participants[0].user.last_name;
          const avatar_url = header.participants[0].user.avatar_url;
          const content = header.messages[0] ? header.messages[0].content : "";
          return {conversation_id:conversation_id, name: name, content: content, avatar_url };
      });

        return result;
      } catch (error) {
        throw new Error(`Error retrieving conversation headers: ${error.message}`);
      }
  }

  static async getAllMessageWithId(conversationId, userId) {
    try {
      const messages = await Message.findAll({
        where: {
          conversation_id: conversationId,
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['first_name', 'avatar_url'],
          },
        ]
      });
  
      // Add isSender field to each message
      const enhancedMessages = messages.map(message => ({
        ...message.dataValues, // Extract Sequelize data values
        isSender: message.user_id === userId,
      }));
  
      return enhancedMessages;
    } catch (error) {
      throw new Error(`Error retrieving messages from conversation: ${error.message}`);
    }
  }

  static async createMessage(conversationId, userId, content) {
    try {
      const message = await Message.create({
        user_id: userId,
        conversation_id: conversationId,
        content: content,
        status: "sent"
      });

      return message;
    } catch (error) {
      throw new Error(`Error storing message: ${error.message}`);
    }
  }

  static async isValidMessage(messageId, conversationId, userId, content){
    try {
      let message = await Message.findOne({
        where:{
          id: messageId,
          user_id: userId,
          conversation_id: conversationId,
          content: content
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['first_name', 'avatar_url'],
          },
        ]
      });

      const isValid = message != null;

      return {isValid: isValid, newMessage: message};
    } catch (error) {
      throw new Error(`Error isvalid message: ${error.message}`);
    }
  }

}

module.exports = ConversationService;