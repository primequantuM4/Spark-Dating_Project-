const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const cors = require("cors");

const { sessionMiddleware } = require("./common/session");
const { MONGO_URL } = require("./common/mongo-url");
const { accountRouter } = require("./account/account-router");
const { matchingRouter } = require("./matching/matching-router");
const { chattingRouter } = require("./chatting/chatting-router");

mongoose.set("strictQuery", false);
mongoose.connect(MONGO_URL);

router.use(cors());
router.use(sessionMiddleware);

router.get("/hi", (req, res) => res.send("hi"));
router.use(accountRouter);
router.use(matchingRouter);
router.use(chattingRouter);

router.get("/test-users", async (req, res) => {
  const { importBoysAndGirls } = require("./matching/suggester-dependencies");
  const result = await importBoysAndGirls();
  res.json(result);
});

module.exports = { backEndRouter: router };
