const jwt = require("jsonwebtoken");
const config = require("config");
const { User } = require("../models/user");

async function auth(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));

    // Fetch user from DB
    const user = await User.findById(decoded._id);
    if (!user) return res.status(400).send("Invalid token: user not found.");

    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).send("Token expired. Please log in again.");
    }

    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    next();
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
}

module.exports = auth;
