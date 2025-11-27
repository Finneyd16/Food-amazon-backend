const Joi = require("joi");
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
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
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      minLength: 5,
      maxLength: 20,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      minLength: 5,
      maxLength: 255,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 100,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 100,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 100,
      trim: true,
    },
    zipCode: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 20,
      trim: true,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    totalOrders: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    forOrderNote: {
      type: String,
      minLength: 0,
      maxLength: 255,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model("Customer", customerSchema);

function validateCustomer(customer) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    email: Joi.string().min(5).max(255).required().email(),
    phone: Joi.string().min(5).max(20).required(),
    address: Joi.string().min(5).max(255).required(),
    country: Joi.string().min(2).max(100).required(),
    city: Joi.string().min(2).max(100).required(),
    state: Joi.string().min(2).max(100).required(),
    zipCode: Joi.string().min(2).max(20).required(),
    profilePicture: Joi.string().allow(""),
    status: Joi.string().valid("Active", "Inactive"),
    forOrderNote: Joi.string().min(0).max(255).allow("", null),
  });
  return schema.validate(customer);
}

module.exports.Customer = Customer;
module.exports.validate = validateCustomer;
