const { Coupon, validate } = require("../models/coupon");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// GET ALL COUPONS
router.get("/get-all-coupons", [auth, admin], async (req, res) => {
  const coupons = await Coupon.find().sort("-createdAt");
  res.send(coupons);
});

// CREATE COUPON
router.post("/create-coupon", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check if coupon code already exists
  let coupon = await Coupon.findOne({ code: req.body.code.toUpperCase() });
  if (coupon) return res.status(400).send("Coupon code already exists.");

  coupon = new Coupon({
    code: req.body.code.toUpperCase(),
    discountType: req.body.discountType,
    discountValue: req.body.discountValue,
    minOrderAmount: req.body.minOrderAmount,
    maxDiscountAmount: req.body.maxDiscountAmount,
    expiryDate: req.body.expiryDate,
    usageLimit: req.body.usageLimit,
    isActive: req.body.isActive,
    description: req.body.description,
  });

  coupon = await coupon.save();
  res.send(coupon);
});

// GET SINGLE COUPON
router.get("/get-single-coupon/:id", [auth, admin], async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon)
    return res.status(404).send("Coupon with the given ID was not found.");

  res.send(coupon);
});

// VALIDATE COUPON (For customers to apply)
router.post("/validate-coupon", async (req, res) => {
  const { code, orderAmount } = req.body;

  if (!code || !orderAmount) {
    return res.status(400).send("Coupon code and order amount are required.");
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) return res.status(404).send("Invalid coupon code.");

  // Check if coupon is active
  if (!coupon.isActive) {
    return res.status(400).send("This coupon is no longer active.");
  }

  // Check if coupon has expired
  if (new Date() > coupon.expiryDate) {
    return res.status(400).send("This coupon has expired.");
  }

  // Check usage limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).send("This coupon has reached its usage limit.");
  }

  // Check minimum order amount
  if (orderAmount < coupon.minOrderAmount) {
    return res
      .status(400)
      .send(
        `Minimum order amount of ₦${coupon.minOrderAmount} required for this coupon.`
      );
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = (orderAmount * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  const finalAmount = orderAmount - discountAmount;

  res.json({
    valid: true,
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    },
    originalAmount: orderAmount,
    discountAmount: discountAmount,
    finalAmount: finalAmount,
  });
});

// UPDATE COUPON
router.put("/update-coupon/:id", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    {
      code: req.body.code.toUpperCase(),
      discountType: req.body.discountType,
      discountValue: req.body.discountValue,
      minOrderAmount: req.body.minOrderAmount,
      maxDiscountAmount: req.body.maxDiscountAmount,
      expiryDate: req.body.expiryDate,
      usageLimit: req.body.usageLimit,
      isActive: req.body.isActive,
      description: req.body.description,
    },
    { new: true }
  );

  if (!coupon)
    return res.status(404).send("Coupon with the given ID was not found.");

  res.json({
    status: "success",
    message: "Coupon updated successfully",
  });
});

// DELETE COUPON
router.delete("/delete-coupon/:id", [auth, admin], async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon)
    return res.status(404).send("Coupon with the given ID was not found.");

  res.json({
    status: "success",
    message: "Coupon deleted successfully",
  });
});

// INCREMENT COUPON USAGE (Called when order is placed)
router.post("/increment-usage/:code", async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() });
  if (!coupon) return res.status(404).send("Coupon not found.");

  coupon.usedCount += 1;
  await coupon.save();

  res.send(coupon);
});

module.exports = router;
