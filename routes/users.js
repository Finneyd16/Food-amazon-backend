const { User, validate, validateLogin } = require("../models/user");
const express = require("express");
const router = express.Router();
const { Customer } = require("../models/customer");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Joi = require("joi");

router.post("/register", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    let user = await User.findOne({ email: req.body.email });
    if (user)
      return res.status(400).json({ message: "User already registered." });

    user = new User({
      name: req.body.name,
      email: req.body.email,
      number: req.body.number,
      password: req.body.password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    //  Check if customer already exists
    let customer = await Customer.findById(user._id);

    if (!customer) {
      customer = new Customer({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.number || "",
        status: "Active",
      });

      try {
        await customer.save();
      } catch (customerError) {
        // If customer creation fails, rollback user creation
        await User.findByIdAndDelete(user._id);
        throw new Error("Failed to create customer profile");
      }
    }

    const token = user.generateAuthToken();
    res.header("x-auth-token", token).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ message: error.message || "Server error during registration" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password." });

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password,
    );
    if (!validPassword)
      return res.status(400).json({ message: "Invalid email or password." });

    user.tokenVersion += 1;
    await user.save({ validateModifiedOnly: true });

    const token = user.generateAuthToken();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
      isAdmin: user.isAdmin,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * FORGOT PASSWORD
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res
        .status(400)
        .json({ message: "User with this email does not exist." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetLink = `${req.protocol}://${req.get(
      "host",
    )}/api/users/reset-password/${resetToken}`;

    console.log("RESET LINK:", resetLink);

    res.json({ message: "Password reset link has been sent to your email." });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * RESET PASSWORD
 */
router.post("/reset-password/:token", async (req, res) => {
  try {
    const schema = Joi.object({
      password: Joi.string().min(5).max(255).required(),
    });

    const { error } = schema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .json({ message: "Invalid or expired password reset token." });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.tokenVersion += 1;

    await user.save();

    res.json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
