const { Product, validate } = require("../models/product");
const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Helper function to check and update availability
function updateAvailability(product) {
  if (product.quantity === 0) {
    product.availability = "Out of stock";
    product.productInStock = false;
  } else if (product.quantity <= product.thresholdValue) {
    product.availability = "Low stock";
    product.productInStock = true;
  } else {
    product.availability = "In-stock";
    product.productInStock = true;
  }
  return product;
}

router.get("/get-all-products", async (req, res) => {
  const products = await Product.find().sort("name");
  res.send(products);
});

router.post("/create-product", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const category = await Category.findById(req.body.categoryId);
  if (!category) return res.status(400).send("Invalid category.");

  let product = new Product({
    name: req.body.name,
    price: req.body.price,
    varieties: req.body.varieties,
    description: req.body.description,
    productImg: req.body.productImg,
    category: {
      _id: category._id,
      name: category.name,
    },
    productInStock: req.body.productInStock,
    productRating: req.body.productRating,
    buyingPrice: req.body.buyingPrice,
    quantity: req.body.quantity,
    unit: req.body.unit,
    thresholdValue: req.body.thresholdValue,
    expiryDate: req.body.expiryDate,
    availability: req.body.availability,
  });
  product = await product.save();
  res.send(product);
});

router.get("/get-single-product/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product)
    return res.status(404).send("Product with the given ID was not found.");

  res.send(product);
});

router.put("/update-product/:id", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const category = await Category.findById(req.body.categoryId);
  if (!category) return res.status(400).send("Invalid category.");

  let product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      price: req.body.price,
      varieties: req.body.varieties,
      description: req.body.description,
      productImg: req.body.productImg,
      productInStock: req.body.productInStock,
      productRating: req.body.productRating,
      buyingPrice: req.body.buyingPrice,
      quantity: req.body.quantity,
      unit: req.body.unit,
      thresholdValue: req.body.thresholdValue,
      expiryDate: req.body.expiryDate,
      availability: req.body.availability,
      category: {
        _id: category._id,
        name: category.name,
      },
    },
    { new: true }
  );
  if (!product)
    return res.status(404).send("Product with the given ID was not found.");

  // Auto-update availability based on threshold
  product = updateAvailability(product);
  await product.save();

  res.json({
    status: "success",
    message: "product updated successfully",
  });
});

router.delete("/delete-product/:id", [auth, admin], async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product)
    return res.status(404).send("Product with the given ID was not found.");
  res.json({
    status: "success",
    message: "product deleted successfully",
  });
});

router.get("/get-products-by-category/:categoryId", async (req, res) => {
  const products = await Product.find({
    "category._id": req.params.categoryId,
  }).sort("name");

  if (products.length === 0)
    return res.status(404).send("No products found for the given category ID.");
  res.send(products);
});









module.exports = router;
