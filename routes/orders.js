const { Order, validate } = require("../models/order");
const { Customer } = require("../models/customer");
const { Product } = require("../models/product");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const axios = require("axios");

router.get("/get-all-orders", [auth, admin], async (req, res) => {
  const orders = await Order.find().sort("-createdAt");
  res.send(orders);
});



router.post("/create", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let order = new Order(req.body);

  await order.save();
  // Initialize Paystack
  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email: order.customerSnapshot.email,
      name: order.customerSnapshot.name,
      amount: order.totalAmount * 100, // in kobo
      metadata: { orderId: order._id.toString() },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );
  // save reference
  order.paymentReference = response.data.data.reference;
  await order.save();
  res.send({
    orderId: order._id,
    authorizationUrl: response.data.data.authorization_url,
    reference: response.data.data.reference,
  });



});
router.post("/confirm", async (req, res) => {
  const { reference } = req.body;
  const response = await axios.get(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );
  const data = response.data.data;
  if (data.status === "success") {
    const order = await Order.findOneAndUpdate(
      { paymentReference: reference },
      { paymentStatus: "paid", transactionId: data.id },
      { new: true }
    );
    return res.send({ success: true, order });
  } else {
    return res.status(400).send({ success: false, message: "Payment failed" });
  }
});















router.get("/get-single-order/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order)
    return res.status(404).send("Order with the given ID was not found.");

  res.send(order);
});

router.put("/update-order-status/:id", [auth, admin], async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;

  if (
    orderStatus &&
    !["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].includes(
      orderStatus
    )
  ) {
    return res.status(400).send("Invalid order status.");
  }

  if (paymentStatus && !["Pending", "Paid", "Failed"].includes(paymentStatus)) {
    return res.status(400).send("Invalid payment status.");
  }

  let order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      orderStatus: orderStatus,
      paymentStatus: paymentStatus,
    },
    { new: true }
  );

  if (!order)
    return res.status(404).send("Order with the given ID was not found.");

  res.json({
    status: "success",
    message: "Order updated successfully",
    data: order,
  });
});

router.delete("/delete-order/:id", [auth, admin], async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order)
    return res.status(404).send("Order with the given ID was not found.");

  res.json({
    status: "success",
    message: "Order deleted successfully",
  });
});

router.get("/get-customer-orders/:customerId", async (req, res) => {
  const orders = await Order.find({
    "customer._id": req.params.customerId,
  }).sort("-createdAt");

  if (orders.length === 0) {
    return res.status(404).send("No orders found for this customer.");
  }

  res.send(orders);
});

router.get("/get-orders-by-status/:status", [auth, admin], async (req, res) => {
  const orders = await Order.find({ orderStatus: req.params.status }).sort(
    "-createdAt"
  );

  if (orders.length === 0) {
    return res.status(404).send("No orders found with this status.");
  }

  res.send(orders);
});




// POST /api/paystack/webhook
router.post('/webhook', express.json({ type: 'application/json' }), async (req, res) => {
    const event = req.body;
    if (event.event === "charge.success") {
        const reference = event.data.reference;
        await Order.findOneAndUpdate(
            { paymentReference: reference },
            { paymentStatus: "paid", transactionId: event.data.id }
        );
    }
    res.sendStatus(200);
});






module.exports = router;
