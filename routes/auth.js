const { User, validate, validateLogin } = require("../models/user");
const express = require("express");
const {Customer} = require("../models/customer");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");

router.post('/register', async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        let user = await User.findOne({email: req.body.email});
        if (user) return res.status(400).json({ message: "User already registered." });

        user = new User({
            name: req.body.name,
            email: req.body.email,
            number: req.body.number,
            password: req.body.password,
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();

        // ✅ Check if customer already exists
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
            token: token
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: error.message || "Server error during registration" });
    }
});

router.post('/login', async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ message: "Invalid email or password." });

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).json({ message: "Invalid email or password." });

  // Invalidate previous tokens
  user.tokenVersion += 1;
  await user.save({ validateModifiedOnly: true });

  const token = user.generateAuthToken();
  res.json({ 
    token: token, 
    email: user.email, 
    name: user.name,
    _id: user._id
  });
});

module.exports = router;