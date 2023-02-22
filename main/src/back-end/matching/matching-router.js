const express = require("express");
const router = express.Router();
const { logGuard } = require("../common/log-guard");
const { suggestionHandler } = require("./suggestion-handler");

router.use(logGuard);

router.get("/suggestions", async (req, res) => {
  const userId = req.session.userId;
  const result = await suggestionHandler.getSuggestedUsers(userId);
  res.json(result);
});

router.post("/likes", async (req, res) => {
  const likerId = req.session.userId;
  const likedId = req.body.userId;
  const result = await suggestionHandler.like(likerId, likedId);
  res.json(result);
});

router.post("/dislikes", async (req, res) => {
  const dislikerId = req.session.userId;
  const dislikedId = req.body.userId;
  console.log(dislikerId, dislikedId);
  const result = await suggestionHandler.dislike(dislikerId, dislikedId);
  res.json(result);
});

module.exports = { matchingRouter: router };
