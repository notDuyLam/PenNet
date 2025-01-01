const express = require("express");
const router = express.Router();

const {
    uploadPhoto,
    resizeAndUploadImage,
} = require("../../middlewares/imageUploadMiddleware");

const conversationController = require('./controller');

router.get('/', conversationController.getConversationHeaders);

router.get('/msgs/:id', conversationController.getAllMessage);

router.post('/msgs',
    uploadPhoto.array("images", 5),
    resizeAndUploadImage,
    conversationController.sendMessage)

module.exports = router;