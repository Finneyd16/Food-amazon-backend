const Joi = require("joi");
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
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
    },

    cartItems: [
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
            type: [String],
            default:[],
          },
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        subtotal: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],

    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    appliedCoupon: {
      code: String,
      discountAmount: Number,
    },
  },
  {
    timestamps: true,
  }
);

// AUTO-CALCULATE SUBTOTALS AND TOTAL
cartSchema.pre("save", function (next) {
  // Calculate each item's subtotal
  this.cartItems.forEach((item) => {
    item.subtotal = item.product.price * item.quantity;
  });

  this.totalAmount = this.cartItems.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  next();
});

const Cart = mongoose.model("Cart", cartSchema);

function validateCartItem(item) {
  const schema = Joi.object({
    customerId: Joi.string().required(),
    productId: Joi.string().required(),
    quantity: Joi.number().min(1).required(),
  });
  return schema.validate(item);
}

module.exports.Cart = Cart;
module.exports.validateCartItem = validateCartItem;
