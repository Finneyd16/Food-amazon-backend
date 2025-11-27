const { Cart, validateCartItem } = require("../models/cart");
const { Customer } = require("../models/customer");
const { Product } = require("../models/product");
const express = require("express");
const router = express.Router();

// Helper function to calculate cart total
function calculateCartTotal(cartItems) {
  return cartItems.reduce((total, item) => total + item.subtotal, 0);
}

// GET CUSTOMER CART
router.get("/get-cart/:customerId", async (req, res) => {
  let cart = await Cart.findOne({ "customer._id": req.params.customerId });

  if (!cart) {
    // Return empty cart if none exists
    return res.json({
      cartItems: [],
      totalAmount: 0,
      message: "Cart is empty",
    });
  }

  res.send(cart);
});

// ADD ITEM TO CART
router.post("/add-to-cart", async (req, res) => {
  const { error } = validateCartItem(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { customerId, productId, quantity } = req.body;

  // Get customer
  const customer = await Customer.findById(customerId);
  if (!customer) return res.status(400).send("Invalid customer.");

  // Get product
  const product = await Product.findById(productId);
  if (!product) return res.status(400).send("Invalid product.");

  // Check if product is in stock
  if (!product.productInStock) {
    return res.status(400).send("Product is out of stock.");
  }

  // Check if enough quantity available
  if (product.quantity < quantity) {
    return res
      .status(400)
      .send(`Not enough stock. Available: ${product.quantity} ${product.unit}`);
  }

  // Find or create cart
  let cart = await Cart.findOne({ "customer._id": customerId });

  if (!cart) {
    // Create new cart
    cart = new Cart({
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
      },
      cartItems: [],
      totalAmount: 0,
    });
  }

  // Check if product already in cart
  const existingItemIndex = cart.cartItems.findIndex(
    (item) => item.product._id.toString() === productId
  );

  if (existingItemIndex > -1) {
    // Update quantity
    cart.cartItems[existingItemIndex].quantity += quantity;
    cart.cartItems[existingItemIndex].subtotal =
      cart.cartItems[existingItemIndex].quantity * product.price;
  } else {
    // Add new item
    cart.cartItems.push({
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        productImg: product.productImg,
      },
      quantity: quantity,
      subtotal: product.price * quantity,
    });
  }

  // Recalculate total
  cart.totalAmount = calculateCartTotal(cart.cartItems);

  cart = await cart.save();
  res.send(cart);
});

// UPDATE CART ITEM QUANTITY
router.put("/update-cart-item/:customerId/:productId", async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).send("Quantity must be at least 1.");
  }

  let cart = await Cart.findOne({ "customer._id": req.params.customerId });
  if (!cart) return res.status(404).send("Cart not found.");

  const itemIndex = cart.cartItems.findIndex(
    (item) => item.product._id.toString() === req.params.productId
  );

  if (itemIndex === -1) {
    return res.status(404).send("Product not found in cart.");
  }

  // Update quantity and subtotal
  cart.cartItems[itemIndex].quantity = quantity;
  cart.cartItems[itemIndex].subtotal =
    quantity * cart.cartItems[itemIndex].product.price;

  // Recalculate total
  cart.totalAmount = calculateCartTotal(cart.cartItems);

  cart = await cart.save();
  res.send(cart);
});

// REMOVE ITEM FROM CART
router.delete("/remove-from-cart/:customerId/:productId", async (req, res) => {
  let cart = await Cart.findOne({ "customer._id": req.params.customerId });
  if (!cart) return res.status(404).send("Cart not found.");

  cart.cartItems = cart.cartItems.filter(
    (item) => item.product._id.toString() !== req.params.productId
  );

  // Recalculate total
  cart.totalAmount = calculateCartTotal(cart.cartItems);

  cart = await cart.save();
  res.send(cart);
});

// CLEAR ENTIRE CART
router.delete("/clear-cart/:customerId", async (req, res) => {
  let cart = await Cart.findOne({ "customer._id": req.params.customerId });
  if (!cart) return res.status(404).send("Cart not found.");

  cart.cartItems = [];
  cart.totalAmount = 0;
  cart.appliedCoupon = undefined;

  cart = await cart.save();
  res.json({
    status: "success",
    message: "Cart cleared successfully",
  });
});

// APPLY COUPON TO CART
router.post("/apply-coupon/:customerId", async (req, res) => {
  const { couponCode } = req.body;

  let cart = await Cart.findOne({ "customer._id": req.params.customerId });
  if (!cart) return res.status(404).send("Cart not found.");

  if (cart.cartItems.length === 0) {
    return res.status(400).send("Cart is empty.");
  }

  // Validate coupon (you can call the coupon validation endpoint here)
  // For now, just store it
  cart.appliedCoupon = {
    code: couponCode,
    discountAmount: 0, // Calculate this by calling coupon validation
  };

  cart = await cart.save();
  res.send(cart);
});

module.exports = router;
