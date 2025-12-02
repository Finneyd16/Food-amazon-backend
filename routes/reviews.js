const { Review, validate } = require("../models/review");
const { Customer } = require("../models/customer");
const { Product } = require("../models/product");
const { Order } = require("../models/order");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.get("/get-all-reviews", async (req, res) => {
  const reviews = await Review.find().sort("-createdAt");
  res.send(reviews);
});

router.post("/create-review", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send("Invalid customer.");

  const product = await Product.findById(req.body.productId);
  if (!product) return res.status(400).send("Invalid product.");

  // Check if customer already reviewed this product
  const existingReview = await Review.findOne({
    "customer._id": req.body.customerId,
    "product._id": req.body.productId,
  });
  if (existingReview) {
    return res.status(400).send("You have already reviewed this product.");
  }

  // Check if customer purchased this product (verified purchase)
  const hasPurchased = await Order.findOne({
    "customer._id": req.body.customerId,
    "orderItems.product._id": req.body.productId,
    paymentStatus: "Paid",
  });

  let review = new Review({
    customer: {
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      profilePicture: customer.profilePicture,
    },
    product: {
      _id: product._id,
      name: product.name,
    },
    rating: req.body.rating,
    reviewText: req.body.reviewText,
    isVerifiedPurchase: hasPurchased ? true : false,
  });

  review = await review.save();

  // Update product average rating
  await updateProductRating(req.body.productId);

  res.send(review);
});

// Helper function to update product rating
async function updateProductRating(productId) {
  const reviews = await Review.find({ "product._id": productId });

  if (reviews.length === 0) return;

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  await Product.findByIdAndUpdate(productId, {
    productRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
  });
}

router.get("/get-product-reviews/:productId", async (req, res) => {
  const reviews = await Review.find({
    "product._id": req.params.productId,
  }).sort("-createdAt");

  if (reviews.length === 0) {
    return res.status(404).send("No reviews found for this product.");
  }

  res.send(reviews);
});

router.get("/get-customer-reviews/:customerId", async (req, res) => {
  const reviews = await Review.find({
    "customer._id": req.params.customerId,
  }).sort("-createdAt");

  if (reviews.length === 0) {
    return res.status(404).send("No reviews found for this customer.");
  }

  res.send(reviews);
});

router.put("/update-review/:id", async (req, res) => {
  const { rating, reviewText } = req.body;

  if (rating && (rating < 1 || rating > 5)) {
    return res.status(400).send("Rating must be between 1 and 5.");
  }

  if (reviewText && (reviewText.length < 10 || reviewText.length > 500)) {
    return res
      .status(400)
      .send("Review text must be between 10 and 500 characters.");
  }

  let review = await Review.findByIdAndUpdate(
    req.params.id,
    {
      rating: rating,
      reviewText: reviewText,
    },
    { new: true }
  );

  if (!review)
    return res.status(404).send("Review with the given ID was not found.");

  // Update product average rating
  await updateProductRating(review.product._id);

  res.json({
    status: "success",
    message: "Review updated successfully",
  });
});

router.delete("/delete-review/:id", [auth, admin], async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review)
    return res.status(404).send("Review with the given ID was not found.");

  // Update product average rating
  await updateProductRating(review.product._id);

  res.json({
    status: "success",
    message: "Review deleted successfully",
  });
});

router.post("/mark-helpful/:id", async (req, res) => {
  let review = await Review.findById(req.params.id);
  if (!review) return res.status(404).send("Review not found.");

  review.helpful += 1;
  await review.save();

  res.send(review);
});

// GET PRODUCT RATING SUMMARY
router.get("/rating-summary/:productId", async (req, res) => {
  const reviews = await Review.find({ "product._id": req.params.productId });

  if (reviews.length === 0) {
    return res.json({
      averageRating: 0,
      totalReviews: 0,
      ratingBreakdown: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    });
  }

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  const ratingBreakdown = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  res.json({
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: reviews.length,
    ratingBreakdown,
  });
});

module.exports = router;
