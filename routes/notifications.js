const { Notification, validate } = require("../models/notification");
const { Customer } = require("../models/customer");
const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// GET ALL NOTIFICATIONS (Admin)
router.get("/get-all-notifications", [auth, admin], async (req, res) => {
  const notifications = await Notification.find().sort("-createdAt");
  res.send(notifications);
});

// CREATE NOTIFICATION
router.post("/create-notification", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let recipient;
  if (req.body.recipientType === "Customer") {
    recipient = await Customer.findById(req.body.recipientId);
  } else {
    recipient = await User.findById(req.body.recipientId);
  }

  if (!recipient) return res.status(400).send("Invalid recipient.");

  let notification = new Notification({
    recipient: {
      _id: recipient._id,
      name: recipient.name,
      email: recipient.email,
      recipientType: req.body.recipientType,
    },
    type: req.body.type,
    title: req.body.title,
    message: req.body.message,
    relatedId: req.body.relatedId,
    relatedType: req.body.relatedType,
    priority: req.body.priority,
  });

  notification = await notification.save();
  res.send(notification);
});

// GET USER/CUSTOMER NOTIFICATIONS
router.get("/get-user-notifications/:userId", async (req, res) => {
  const notifications = await Notification.find({
    "recipient._id": req.params.userId,
  }).sort("-createdAt");

  res.send(notifications);
});

// GET UNREAD NOTIFICATIONS COUNT
router.get("/unread-count/:userId", async (req, res) => {
  const count = await Notification.countDocuments({
    "recipient._id": req.params.userId,
    isRead: false,
  });

  res.json({ unreadCount: count });
});

// MARK NOTIFICATION AS READ
router.put("/mark-as-read/:id", async (req, res) => {
  let notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );

  if (!notification)
    return res
      .status(404)
      .send("Notification with the given ID was not found.");

  res.send(notification);
});

// MARK ALL AS READ
router.put("/mark-all-read/:userId", async (req, res) => {
  const result = await Notification.updateMany(
    { "recipient._id": req.params.userId, isRead: false },
    { isRead: true }
  );

  res.json({
    status: "success",
    message: "All notifications marked as read",
    modifiedCount: result.modifiedCount,
  });
});

// DELETE NOTIFICATION
router.delete("/delete-notification/:id", async (req, res) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);
  if (!notification)
    return res
      .status(404)
      .send("Notification with the given ID was not found.");

  res.json({
    status: "success",
    message: "Notification deleted successfully",
  });
});

// DELETE ALL READ NOTIFICATIONS
router.delete("/clear-read/:userId", async (req, res) => {
  const result = await Notification.deleteMany({
    "recipient._id": req.params.userId,
    isRead: true,
  });

  res.json({
    status: "success",
    message: "Read notifications cleared",
    deletedCount: result.deletedCount,
  });
});

// GET NOTIFICATIONS BY TYPE
router.get("/get-by-type/:userId/:type", async (req, res) => {
  const notifications = await Notification.find({
    "recipient._id": req.params.userId,
    type: req.params.type,
  }).sort("-createdAt");

  res.send(notifications);
});

// HELPER: Send Order Notification (Use this when creating orders)
async function sendOrderNotification(customerId, orderData) {
  const customer = await Customer.findById(customerId);
  if (!customer) return;

  const notification = new Notification({
    recipient: {
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      recipientType: "Customer",
    },
    type: "Order",
    title: "Order Confirmed",
    message: `Your order #${orderData.orderId} has been placed successfully. Total: ₦${orderData.totalAmount}`,
    relatedId: orderData.orderId,
    relatedType: "Order",
    priority: "high",
  });

  await notification.save();
}

// HELPER: Send Low Stock Alert (Use in product update)
async function sendLowStockAlert(adminId, productData) {
  const admin = await User.findById(adminId);
  if (!admin || !admin.isAdmin) return;

  const notification = new Notification({
    recipient: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      recipientType: "Admin",
    },
    type: "Stock Alert",
    title: "Low Stock Alert",
    message: `${productData.name} is running low. Current stock: ${productData.quantity} ${productData.unit}`,
    relatedId: productData.productId,
    relatedType: "Product",
    priority: "high",
  });

  await notification.save();
}


module.exports = router;
module.exports.sendOrderNotification = sendOrderNotification;
module.exports.sendLowStockAlert = sendLowStockAlert;
