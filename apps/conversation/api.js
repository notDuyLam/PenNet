const express = require("express");
const router = express.Router();

const conversationController = require('./controller');

router.get('/', conversationController.getConversationHeaders);

router.get('/msgs/:id', conversationController.getAllMessage);

router.post('/msgs', conversationController.sendMessage)

module.exports = router;