const express = require("express");
const router = express.Router();
const { logGuard } = require("../common/log-guard");
const { userInfoHandler } = require("./user-info-handler");
const { logHandler } = require("./log-handler");

router.use(express.json());

//almost signup
router.post("/users", async (req, res) => {
  const result = await userInfoHandler.fillProfile(req.body);
  res.json(result);
});

//get profile info to fill form
router.get("/profile", logGuard, async (req, res) => {
  const userId = req.session.userId;

  const result = await userInfoHandler.getProfile(userId);
  res.json(result);
});

//edit profile
router.put("/profile", logGuard, async (req, res) => {
  const userId = req.session.userId;
  const result = await userInfoHandler.editProfile(req.body, userId);
  res.json(result);
});

//login
router.post("/users/logged-in", async (req, res) => {
  const { email, password } = req.body;
  const result = await logHandler.logIn(email, password, req.session);

  if (result) {
    res.json(result);
  } else {
    res
      .status(401)
      .json({ error: `try again, ${email} with ${password} are incorrect` });
  }
});

//logout
router.delete("/users/logged-in", logGuard, async (req, res) => {
  const result = await logHandler.logOut(req.session);
  if (result) {
    res.status(204).json(result);
  } else {
    res.status(500).json({ error: "we could not log you out" });
  }
});

//delete account
router.delete("/", logGuard, async (req, res) => {
  const userId = req.session.userId;
  const result = await userInfoHandler.deleteAccount(userId);
  res.json(result);
});

module.exports = { accountRouter: router };
