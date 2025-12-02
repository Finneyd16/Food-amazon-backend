const { Cart, validateCartItem } = require("../models/cart");
const { Customer } = require("../models/customer");
const { Product } = require("../models/product");
const express = require("express");
const router = express.Router();



// GET CUSTOMER CART
router.get("/get-cart/:customerId", async (req, res) => {
  let cart = await Cart.findOne({ "customer._id": req.params.customerId });

  if (!cart) {
    return res.json({
      cartItems: [],
      totalAmount: 0,
      message: "Cart is empty",
    });
  }

  res.send(cart);
});

router.post("/add-to-cart", async (req, res) => {
  const { error } = validateCartItem(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { customerId, productId, quantity } = req.body;

  const customer = await Customer.findById(customerId);
  if (!customer) return res.status(400).send("Invalid customer.");

  const product = await Product.findById(productId);
  if (!product) return res.status(400).send("Invalid product.");

  if (!product.productInStock) {
    return res.status(400).send("Product is out of stock.");
  }

  if (product.quantity < quantity) {
    return res.status(400).send(
      `Not enough stock. Available: ${product.quantity} ${product.unit}`
    );
  }

  let cart = await Cart.findOne({ "customer._id": customerId });

  if (!cart) {
    cart = new Cart({
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
      },
      cartItems: [],
    });
  }

  const existingItemIndex = cart.cartItems.findIndex(
    (item) => item.product._id.toString() === productId
  );

  if (existingItemIndex > -1) {
    // Update quantity only - subtotal calculated by pre-save
    cart.cartItems[existingItemIndex].quantity += quantity;
  } else {
    // Add new item - subtotal calculated by pre-save
    cart.cartItems.push({
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        productImg: product.productImg,
      },
      quantity: quantity,
    });
  }

  cart = await cart.save(); 
  res.send(cart);
});

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

  // Update quantity only - subtotal calculated by pre-save
  cart.cartItems[itemIndex].quantity = quantity;

  cart = await cart.save(); 
  res.send(cart);
});


router.delete("/remove-from-cart/:customerId/:productId", async (req, res) => {
  const { customerId, productId } = req.params;

  let cart = await Cart.findOne({ "customer._id": customerId });
  if (!cart) return res.status(404).send("Cart not found.");

  // Remove the product
  cart.cartItems = cart.cartItems.filter(
    (item) => item.product._id.toString() !== productId
  );

  // Pre-save hook will recalc subtotal + totalAmount
  cart = await cart.save();

  res.send(cart);
});


router.delete("/clear-cart/:customerId", async (req, res) => {
  const { customerId } = req.params;

  let cart = await Cart.findOne({ "customer._id": customerId });
  if (!cart) return res.status(404).send("Cart not found.");

  cart.cartItems = [];
  cart.appliedCoupon = undefined;

  cart = await cart.save();

  res.json({
    status: "success",
    message: "Cart cleared successfully",
    cart,
  });
});

router.post("/apply-coupon/:customerId", async (req, res) => {
  const { customerId } = req.params;
  const { couponCode } = req.body;

  let cart = await Cart.findOne({ "customer._id": customerId });
  if (!cart) return res.status(404).send("Cart not found.");

  if (cart.cartItems.length === 0) {
    return res.status(400).send("Cart is empty.");
  }

  // Store coupon for now
  cart.appliedCoupon = {
    code: couponCode,
    discountAmount: 0, 
  };

  cart = await cart.save();

  res.send(cart);
});


module.exports = router;
