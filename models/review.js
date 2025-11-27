const Joi = require("joi");
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      profilePicture: {
        type: String,
      },
    },

    product: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    reviewText: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 500,
      trim: true,
    },

    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },

    helpful: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);

function validateReview(review) {
  const schema = Joi.object({
    customerId: Joi.string().required(),
    productId: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
    reviewText: Joi.string().min(10).max(500).required(),
  });
  return schema.validate(review);
}

module.exports.Review = Review;
module.exports.validate = validateReview;
