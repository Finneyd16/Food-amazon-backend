const Joi = require("joi");
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 100,
    trim: true,
  },

  price: {
    type: Number,
    required: true,
    min: 0,
  },

  varieties: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 100,
    trim: true,
  },

  description: {
    type: String,
    minLength: 0,
    maxLength: 255,
    trim: true,
    default: "",
  },

  productImg: {
    type: [String],
    default:
      [],
  },

  category: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },

  productInStock: {
    type: Boolean,
    default: true,
  },

  productRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },

  buyingPrice: {
    type: Number,
    min: 0,
    default: 0,
  },

  quantity: {
    type: Number,
    min: 0,
    default: 0,
  },

  unit: {
    type: String,
    default: "Packets",
  },

  thresholdValue: {
    type: Number,
    min: 0,
    default: 10,
  },

  expiryDate: {
    type: Date,
  },

  availability: {
    type: String,
    enum: ["In-stock", "Out of stock", "Low stock"],
    default: "In-stock",
  },
});

// Middleware to auto-update availability based on quantity and threshold
productSchema.pre("save", function (next) {
  if (this.quantity === 0) {
    this.availability = "Out of stock";
    this.productInStock = false;
  } else if (this.quantity <= this.thresholdValue) {
    this.availability = "Low stock";
    this.productInStock = true;
  } else {
    this.availability = "In-stock";
    this.productInStock = true;
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

function validateProduct(product) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    price: Joi.number().min(0).required(),
    varieties: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(0).max(255).allow(""),
    productImg: Joi.string().allow(""),
    productInStock: Joi.boolean(),
    productRating: Joi.number().min(0).max(5),
    categoryId: Joi.string().required(),
    buyingPrice: Joi.number().min(0),
    quantity: Joi.number().min(0),
    unit: Joi.string(),
    thresholdValue: Joi.number().min(0),
    expiryDate: Joi.date(),
    availability: Joi.string().valid("In-stock", "Out of stock", "Low stock"),
  });
  return schema.validate(product);
}

exports.Product = Product;
exports.validate = validateProduct;
