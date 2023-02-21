const { UserDbModel } = require("../models/user-db-model");

class LogHandler {
  async logIn(email, password, session) {
    const userDocument = await UserDbModel.findOne({ email, password });
    if (userDocument) {
      session.userId = userDocument._id;
      return userDocument;
    } else {
      return { error: `email ${email} and password ${password} dont match!` };
    }
  }

  async logOut(session) {
    let error;
    await session.destroy((err) => (error = err));

    if (error) return null;
    else return { logout: "successful" };
  }
}

const logHandler = new LogHandler();
module.exports = { logHandler };
