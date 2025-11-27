const Joi = require("joi");
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
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
      phone: {
        type: String,
        required: true,
      },
    },

    orderItems: [
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
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        subtotal: {
          type: Number,
          default:0,
          min: 0,
        },
      },
    ],

    shippingAddress: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
    },

    orderNote: {
      type: String,
      maxLength: 255,
      trim: true,
      default: "",
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    paymentMethod: {
      type: String,
      enum: ["Cash on Delivery", "Card", "Bank Transfer"],
      default: "Cash on Delivery",
    },
  },
  {
    timestamps: true,
  }
);


orderSchema.pre("save", function (next) {
  this.orderItems.forEach(item => {
    item.subtotal = item.product.price * item.quantity;
  });

  this.totalAmount = this.orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  next();
});


const Order = mongoose.model("Order", orderSchema);

function validateOrder(order) {
  const schema = Joi.object({
    customerId: Joi.string().required(),
    orderItems: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().required(),
          quantity: Joi.number().min(1).required(),
        })
      )
      .required(),
    shippingAddress: Joi.object({
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      zipCode: Joi.string().required(),
    }).required(),
    orderNote: Joi.string().max(255).allow(""),
    paymentMethod: Joi.string()
      .valid("Cash on Delivery", "Card", "Bank Transfer")
      .required(),
  });
  return schema.validate(order);
}

module.exports.Order = Order;
module.exports.validate = validateOrder;
