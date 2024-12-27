const express = require("express");
const router = express.Router();
const conversationController = require("./controller");

router.get('/', conversationController.renderConversationPage);

module.exports = router;
