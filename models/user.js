const Joi = require("joi");
const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 100,
    trim: true,
  },
    email: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 255,
    trim: true,
    unique: true,
 },  
    password: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 1024,
    trim: true,
 },
});

const User = mongoose.model("User", userSchema);

function validateUser(user) {
    const schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });
    return schema.validate(user);
}

function validateLogin(auth) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });
  return schema.validate(auth);
}

exports.User = User;
exports.validate = validateUser;
exports.validateLogin = validateLogin;