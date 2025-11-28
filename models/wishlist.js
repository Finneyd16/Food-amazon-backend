const Joi = require("joi");
const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    customer: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },

    items: [
      {
        product: {
          _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
          },
          name: {
            type: String,
            required: true,
          },
          price: {
            type: Number,
            required: true,
          },
          productImg: {
            type: String,
          },
          productInStock: {
            type: Boolean,
            default: true,
          },
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

function validateWishlistItem(item) {
  const schema = Joi.object({
    customerId: Joi.string().required(),
    productId: Joi.string().required(),
  });
  return schema.validate(item);
}

module.exports.Wishlist = Wishlist;
module.exports.validateWishlistItem = validateWishlistItem;
