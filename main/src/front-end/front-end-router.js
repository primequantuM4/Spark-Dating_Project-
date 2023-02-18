const express = require("express");
const router = express.Router();
const joinPath = require("path").join;

const public = joinPath(__dirname, "public"); //truly dono why not ./public
router.use(express.static(public));

router.get("/test-hi", (r, res) => res.send("hi"));
router.get("/chats/:chatId", (req, res) => {
  const chatHtmlPath = joinPath(public, "chat.html");
  res.sendFile(chatHtmlPath);
});

module.exports = { frontEndRouter: router };
