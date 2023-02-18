const session = require("express-session");
const MongoStore = require("connect-mongo");
const { MONGO_URL } = require("./mongo-url");

const sessionMiddleware = session({
  resave: true,
  saveUninitialized: true,
  secret: "cat",
  store: MongoStore.create({
    mongoUrl: MONGO_URL,
  }),
});

module.exports = { sessionMiddleware };
