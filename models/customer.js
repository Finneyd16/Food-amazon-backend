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
      required: false,
      maxLength: 20,  // ✅ Removed minLength
      trim: true,
      default: "",
    },
    address: {
      type: String,
      required: false,
      maxLength: 255,  // ✅ Removed minLength
      trim: true,
      default: "",
    },
    country: {
      type: String,
      required: false,
      maxLength: 100,  // ✅ Removed minLength
      trim: true,
      default: "",
    },
    city: {
      type: String,
      required: false,
      maxLength: 100,  // ✅ Removed minLength
      trim: true,
      default: "",
    },
    state: {
      type: String,
      required: false,
      maxLength: 100,  // ✅ Removed minLength
      trim: true,
      default: "",
    },
    zipCode: {
      type: String,
      required: false,
      maxLength: 20,  // ✅ Removed minLength
      trim: true,
      default: "",
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
      maxLength: 255,  // ✅ Removed minLength
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
    phone: Joi.string().max(20).allow(""),  // ✅ Made optional
    address: Joi.string().max(255).allow(""),  // ✅ Made optional
    country: Joi.string().max(100).allow(""),  // ✅ Made optional
    city: Joi.string().max(100).allow(""),  // ✅ Made optional
    state: Joi.string().max(100).allow(""),  // ✅ Made optional
    zipCode: Joi.string().max(20).allow(""),  // ✅ Made optional
    profilePicture: Joi.string().allow(""),
    status: Joi.string().valid("Active", "Inactive"),
    forOrderNote: Joi.string().max(255).allow("", null),
  });
  return schema.validate(customer);
}

module.exports.Customer = Customer;
module.exports.validate = validateCustomer;