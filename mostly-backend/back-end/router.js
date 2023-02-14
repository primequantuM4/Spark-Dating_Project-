const express = require("express");
const router = express.Router();
const session = require("express-session");
const cors = require("cors");

router.use(cors());
router.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: "cat",
  })
);

//signup
router.post("/api/users", (req, res) => {
  const { name, username, password } = req.body;
  const user = { name, username, password };
  const alreadyExists = db.find((user) => user.username === username);

  if (alreadyExists) {
    res.write("username already exists");
  } else {
    db.push(user);
    res.json(user);
  }
});

//login
router.post("/api/users/logged-in", (req, res) => {
  const { username, password } = req.body;
  const hasSignedUp = db.find((user) => {
    return user.username === username && user.password === password;
  });
  if (hasSignedUp) {
    req.session.username = username;
    res.json({ username, password });
  } else {
    res
      .status(401)
      .json(`try again, ${username} with ${password} are incorrect`);
  }
});

//logout
router.delete("/api/users/logged-in", (req, res) => {
  let error;
  req.session.destroy((err) => (error = err));
  if (error) {
    res.status(500).json(error);
  } else {
    res.status(204).json();
  }
});

//edit profile
router.put("/api/users", (res, req) => {});
