const express = require("express");
const router = express.Router();
const { logGuard } = require("../common/log-guard");
const { chatHandler } = require("./chat-handler");

router.use(logGuard);

router.get("/chats", async (req, res) => {
  const userId = req.session.userId;
  const result = await chatHandler.getUserAndChatInfo(userId);
  res.json(result);
});

router.get("/chats/:chatId", async (req, res) => {
  const chatId = req.params.chatId;
  const userId = req.session.userId;
  const result = await chatHandler.getUserAndMessages(userId, chatId);
  res.json(result);
});

module.exports = { chattingRouter: router };
