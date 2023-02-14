const express = require("express");
const session = require("express-session");
const cors = require("cors");
const router = express.Router();

router.use(cors());

const db = [
  {
    username: "abebe",
    password: "abebe",
    email: "abebe@gmail.com",
  },
  {
    username: "mamitu",
    password: "mamitu",
    email: "mamitu@gmail.com",
  },
];

function print(r, r, next) {
  console.log(db);
  next();
}

router.use(express.static("./public"));
router.use(cors());
router.use(express.json());

router.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: "cat",
  })
);

router.get("/api", (req, res) => {
  const session = req.session;
  const stringified = JSON.stringify(session);
  res.send("works. cookie is" + stringified);
});

router.get("/api/secret", (req, res) => {
  const secretObject = {
    secret: req.session.username ?? "login first",
  };
  res.json(secretObject);
});

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
  const session = req.session;

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

router.listen(3000, () => console.log("listening in 3000"));
