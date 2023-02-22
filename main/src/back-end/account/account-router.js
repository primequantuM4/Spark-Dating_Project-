const express = require("express");
const router = express.Router();
const { logGuard } = require("../common/log-guard");

const { userInfoHandler } = require("./user-info-handler");
const { logHandler } = require("./log-handler");
const { profilePictureMulter } = require("./profile-picture-multer");

router.use(express.json());

const path = require("path");
const PROFILE_PICTURE_PATH = "/profile-pictures";

//almost signup
router.post("/users", profilePictureMulter, async (req, res) => {
  const photoUrl = path.join(PROFILE_PICTURE_PATH, req?.file?.filename ?? "");
  const profile = req.body;
  profile.photoUrl = photoUrl;
  const result = await userInfoHandler.fillProfile(profile);
  res.json(result);
});

//get profile info to fill form
router.get("/profile", logGuard, async (req, res) => {
  const userId = req.session.userId;

  const result = await userInfoHandler.getProfile(userId);
  res.json(result);
});

//edit profile
router.put("/profile", logGuard, profilePictureMulter, async (req, res) => {
  const userId = req.session.userId;
  const imageName = req?.file?.filename;

  const profile = req.body;
  if (imageName) {
    const photoUrl = path.join(PROFILE_PICTURE_PATH, imageName);
    profile.photoUrl = photoUrl;
  }
  const result = await userInfoHandler.editProfile(profile, userId);
  res.json(result);
});

//login
router.post("/users/logged-in", async (req, res) => {
  console.log("login attempt");
  const { email, password } = req.body;
  const result = await logHandler.logIn(email, password, req.session);

  if (result.error) {
    res.status(401).json(result);
  } else {
    res.json(result);
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
