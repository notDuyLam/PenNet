const conversationService = require('./services');

const conversationController = {
    async renderConversationPage(req, res) {
        res.render("message", {
            user: req.user,
        });
    },

    async getConversationHeaders(req, res) {
        if (!req.isAuthenticated()) {
            return res.redirect("/users/login");
        }
        const data = await conversationService.getAllHeaders(req.user.id);

        res.status(200).json(data);
    },

    async getAllMessage(req, res) {
        if (!req.isAuthenticated()) {
            return res.redirect("/users/login");
        }

        const data = await conversationService.getAllMessageWithId(req.params.id, req.user.id);

        res.status(200).json(data);
    },

    async getMessage(req, res) {
        if (!req.isAuthenticated()) {
            return res.redirect("/users/login");
        }

        const data = await conversationService.getMessageWithId(req.params.cid,req.params.mid, req.user.id);

        res.status(200).json(data);
    },

    async sendMessage(req, res) {
        if (!req.isAuthenticated()) {
            return res.redirect("/users/login");
        }

        const imageUrls = req.imageUrls;

        const conversationId = req.body.conversationId;
        const userId = req.user.id;
        const content = req.body.content;

        const message = await conversationService.createMessage(conversationId, userId, content, imageUrls);

        const data = await conversationService.getMessageWithId(conversationId, message.id);

        res.status(200).json(data);
    }
}

module.exports = conversationController;
