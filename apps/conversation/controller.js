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

    async sendMessage(req, res) {
        if (!req.isAuthenticated()) {
            return res.redirect("/users/login");
        }

        const conversationId = req.body.conversationId;
        const userId = req.user.id;
        const content = req.body.content;

        const data = await conversationService.createMessage(conversationId, userId, content);

        res.status(200).json(data);
    }
}

module.exports = conversationController;
