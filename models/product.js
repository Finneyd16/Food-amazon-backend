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

  category: {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
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
});

const Product = mongoose.model("Product", productSchema);

function validateProduct(product) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    price: Joi.number().min(0).required(),
    varieties: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(3).max(255).allow(""),
    productInStock: Joi.boolean(),
    productRating: Joi.number().min(1).max(5).allow(0),
    categoryId: Joi.required(),
  });
  return schema.validate(product);
}

exports.Product = Product;
exports.validate = validateProduct;
