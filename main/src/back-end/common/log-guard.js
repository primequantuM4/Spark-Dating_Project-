function logGuard(req, res, next) {
  if (req.session.userId === undefined) {
    console.log("NOT LOGGED IN");
    res.status(401).json({ error: "please log in" });
  } else {
    next();
  }
}

module.exports = { logGuard };
