const { User, validate, validateLogin } = require("../models/user");
const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Joi = require("joi");


router.post("/register", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "name", "email"]));
});


router.post("/login", async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password.");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  user.tokenVersion += 1;
  await user.save();

  const token = user.generateAuthToken();
  res.send({ token: token });
});


router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(400).send("User with this email does not exist.");

  // Generate token & hash it before saving
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  // Build reset link
  const resetLink = `${req.protocol}://${req.get("host" )}/api/users/reset-password/${resetToken}`;

  console.log("RESET LINK:", resetLink);

  res.send("Password reset link has been sent to your email.");
});



router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;

  const schema = Joi.object({
    password: Joi.string().min(5).max(255).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Hash token and compare with DB
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).send("Invalid or expired password reset token.");

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt);

  // Clear reset fields and invalidate old tokens
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  user.tokenVersion += 1;

  await user.save();

  res.send("Password has been reset successfully.");
});




module.exports = router;
