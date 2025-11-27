const Joi = require("joi");
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minLength: 3,
      maxLength: 20,
    },

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxDiscountAmount: {
      type: Number,
      default: null,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    usageLimit: {
      type: Number,
      default: null,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    description: {
      type: String,
      maxLength: 255,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Coupon = mongoose.model("Coupon", couponSchema);

function validateCoupon(coupon) {
  const schema = Joi.object({
    code: Joi.string().min(3).max(20).required(),
    discountType: Joi.string().valid("percentage", "fixed").required(),
    discountValue: Joi.number().min(0).required(),
    minOrderAmount: Joi.number().min(0),
    maxDiscountAmount: Joi.number().min(0).allow(null),
    expiryDate: Joi.date().required(),
    usageLimit: Joi.number().min(1).allow(null),
    isActive: Joi.boolean(),
    description: Joi.string().max(255).allow(""),
  });
  return schema.validate(coupon);
}

module.exports.Coupon = Coupon;
module.exports.validate = validateCoupon;
