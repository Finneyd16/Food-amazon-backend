const mongoose = require("mongoose");
const Joi = require("joi");
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: String,
  image: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  // subTotal: Number,
});
const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  customerSnapshot: {
    firstName: String,
    lastName: String,
    email: String,
    address: String,
    country: String,
    state: String,
    city: String,
    zipCode: String,
    phoneNumber: String,
    orderNote: String,
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
  },
  deliveryStatus: {
    type: String,
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  // Paystack integration fields
  paymentReference: {
    type: String, // Paystack's unique reference
    required: false,
  },
  paymentGateway: {
    type: String,
    default: "paystack",
  },
  transactionId: {
    type: String, // Paystack transaction id
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
// --- Calculate total before saving ---
orderSchema.pre("save", function (next) {
  this.totalAmount = this.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  this.updatedAt = new Date();
  next();
});
const Order = mongoose.model("Order", orderSchema);
// --- Joi Validation ---
function validateOrder(order) {
  const schema = Joi.object({
    customerId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),
    customerSnapshot: Joi.object().keys({
      firstName: Joi.string().min(2).max(50).required(),
      lastName: Joi.string().min(2).max(50).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().min(5).max(11).required(),
      state: Joi.string().required(),
      city: Joi.string().required(),
    }),
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required(),
          name: Joi.string().required(),
          image: Joi.string().required(),
          price: Joi.number().required(),
          quantity: Joi.number().min(1).required(),
          // subTotal: Joi.number(),
        })
      )
      .min(1)
      .required(),
    totalAmount: Joi.number(),
    paymentStatus: Joi.string().valid("pending", "paid", "failed", "refunded"),
    deliveryStatus: Joi.string().valid(
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled"
    ),
    paymentReference: Joi.string().optional(),
    paymentGateway: Joi.string().optional(),
    transactionId: Joi.string().optional(),
    createdAt: Joi.date(),
    updatedAt: Joi.date(),
  });
  return schema.validate(order);
}
exports.Order = Order;
exports.validate = validateOrder;
