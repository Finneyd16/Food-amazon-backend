const { Wishlist, validateWishlistItem } = require("../models/wishlist");
const { Customer } = require("../models/customer");
const { Product } = require("../models/product");
const express = require("express");
const router = express.Router();

router.get("/get-wishlist/:customerId", async (req, res) => {
  let wishlist = await Wishlist.findOne({
    "customer._id": req.params.customerId,
  });

  if (!wishlist) {
    return res.json({
      items: [],
      message: "Wishlist is empty",
    });
  }

  res.send(wishlist);
});

router.post("/add-to-wishlist", async (req, res) => {
  const { error } = validateWishlistItem(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { customerId, productId } = req.body;

  // Get customer
  const customer = await Customer.findById(customerId);
  if (!customer) return res.status(400).send("Invalid customer.");

  // Get product
  const product = await Product.findById(productId);
  if (!product) return res.status(400).send("Invalid product.");

  // Find or create wishlist
  let wishlist = await Wishlist.findOne({ "customer._id": customerId });

  if (!wishlist) {
    // Create new wishlist
    wishlist = new Wishlist({
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
      },
      items: [],
    });
  }

  // Check if product already in wishlist
  const existingItem = wishlist.items.find(
    (item) => item.product._id.toString() === productId
  );

  if (existingItem) {
    return res.status(400).send("Product already in wishlist.");
  }

  // Add new item
  wishlist.items.push({
    product: {
      _id: product._id,
      name: product.name,
      price: product.price,
      productImg: product.productImg,
      productInStock: product.productInStock,
    },
  });

  wishlist = await wishlist.save();
  res.send(wishlist);
});

router.delete(
  "/remove-from-wishlist/:customerId/:productId",
  async (req, res) => {
    let wishlist = await Wishlist.findOne({
      "customer._id": req.params.customerId,
    });
    if (!wishlist) return res.status(404).send("Wishlist not found.");

    wishlist.items = wishlist.items.filter(
      (item) => item.product._id.toString() !== req.params.productId
    );

    wishlist = await wishlist.save();
    res.send(wishlist);
  }
);

router.delete("/clear-wishlist/:customerId", async (req, res) => {
  let wishlist = await Wishlist.findOne({
    "customer._id": req.params.customerId,
  });
  if (!wishlist) return res.status(404).send("Wishlist not found.");

  wishlist.items = [];
  wishlist = await wishlist.save();

  res.json({
    status: "success",
    message: "Wishlist cleared successfully",
  });
});

router.post("/move-to-cart/:customerId/:productId", async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).send("Quantity is required and must be at least 1.");
  }

  let wishlist = await Wishlist.findOne({
    "customer._id": req.params.customerId,
  });
  if (!wishlist) return res.status(404).send("Wishlist not found.");

  const itemIndex = wishlist.items.findIndex(
    (item) => item.product._id.toString() === req.params.productId
  );

  if (itemIndex === -1) {
    return res.status(404).send("Product not found in wishlist.");
  }

  // Remove from wishlist
  const product = wishlist.items[itemIndex].product;
  wishlist.items.splice(itemIndex, 1);
  await wishlist.save();

  res.json({
    status: "success",
    message: "Item ready to add to cart",
    product: product,
    quantity: quantity,
  });
});

router.get("/check-wishlist/:customerId/:productId", async (req, res) => {
  const wishlist = await Wishlist.findOne({
    "customer._id": req.params.customerId,
  });

  if (!wishlist) {
    return res.json({ inWishlist: false });
  }

  const inWishlist = wishlist.items.some(
    (item) => item.product._id.toString() === req.params.productId
  );

  res.json({ inWishlist });
});

router.get("/wishlist-count/:customerId", async (req, res) => {
  const wishlist = await Wishlist.findOne({
    "customer._id": req.params.customerId,
  });

  const count = wishlist ? wishlist.items.length : 0;

  res.json({ count });
});

module.exports = router;
