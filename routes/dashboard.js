const { Order } = require("../models/order");
const { Product } = require("../models/product");
const { Customer } = require("../models/customer");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// GET DASHBOARD OVERVIEW
router.get("/overview", [auth, admin], async (req, res) => {
  try {
    // Total Revenue
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    // Total Orders
    const totalOrders = await Order.countDocuments();

    // Total Customers
    const totalCustomers = await Customer.countDocuments();

    // Total Products
    const totalProducts = await Product.countDocuments();

    // Low Stock Products
    const lowStockProducts = await Product.find({
      $expr: { $lte: ["$quantity", "$thresholdValue"] },
      quantity: { $gt: 0 },
    }).countDocuments();

    // Out of Stock Products
    const outOfStockProducts = await Product.find({
      quantity: 0,
    }).countDocuments();

    // Pending Orders
    const pendingOrders = await Order.countDocuments({
      orderStatus: "Pending",
    });

    // Today's Revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
          paymentStatus: "Paid",
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      pendingOrders,
      todayRevenue: todayRevenue[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).send("Error fetching dashboard data: " + err.message);
  }
});

// GET SALES STATISTICS (Last 7 days)
router.get("/sales-stats", [auth, admin], async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesByDay = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          paymentStatus: "Paid",
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(salesByDay);
  } catch (err) {
    res.status(500).send("Error fetching sales statistics: " + err.message);
  }
});

// GET TOP SELLING PRODUCTS
router.get("/top-products", [auth, admin], async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const topProducts = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product._id",
          productName: { $first: "$orderItems.product.name" },
          productImg: { $first: "$orderItems.product.productImg" },
          totalQuantitySold: { $sum: "$orderItems.quantity" },
          totalRevenue: { $sum: "$orderItems.subtotal" },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: limit },
    ]);

    res.json(topProducts);
  } catch (err) {
    res.status(500).send("Error fetching top products: " + err.message);
  }
});

// GET LOW STOCK ALERTS
router.get("/low-stock-alerts", [auth, admin], async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lte: ["$quantity", "$thresholdValue"] },
    })
      .select("name quantity thresholdValue unit productImg category")
      .sort("quantity");

    res.json(lowStockProducts);
  } catch (err) {
    res.status(500).send("Error fetching low stock alerts: " + err.message);
  }
});

// GET RECENT ORDERS
router.get("/recent-orders", [auth, admin], async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const recentOrders = await Order.find()
      .sort("-createdAt")
      .limit(limit)
      .select("customer orderStatus totalAmount createdAt paymentStatus");

    res.json(recentOrders);
  } catch (err) {
    res.status(500).send("Error fetching recent orders: " + err.message);
  }
});

// GET REVENUE BY CATEGORY
router.get("/revenue-by-category", [auth, admin], async (req, res) => {
  try {
    const revenueByCategory = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product._id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.category.name",
          totalRevenue: { $sum: "$orderItems.subtotal" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    res.json(revenueByCategory);
  } catch (err) {
    res.status(500).send("Error fetching revenue by category: " + err.message);
  }
});

// GET ORDER STATUS BREAKDOWN
router.get("/order-status-breakdown", [auth, admin], async (req, res) => {
  try {
    const statusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(statusBreakdown);
  } catch (err) {
    res
      .status(500)
      .send("Error fetching order status breakdown: " + err.message);
  }
});

module.exports = router;
