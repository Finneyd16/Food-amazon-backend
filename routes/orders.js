const {Order, validate} = require('../models/order');
const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/create', async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        // Check if Paystack key exists
        if (!process.env.PAYSTACK_SECRET_KEY) {
            return res.status(500).send('Paystack secret key not configured');
        }

        const order = new Order(req.body);
        await order.save();

        try {
            // Initialize Paystack
            const response = await axios.post(
                "https://api.paystack.co/transaction/initialize",
                {
                    email: order.customerSnapshot.emailAddress,
                    amount: order.totalAmount * 100,
                    callback_url: "http://localhost:5174/verify",
                    metadata: { orderId: order._id.toString() }
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // ✅ Fixed
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            // Check if response is successful
            if (!response.data.status) {
                throw new Error(response.data.message || 'Paystack initialization failed');
            }

            // save reference
            order.paymentReference = response.data.data.reference;
            await order.save();

            res.send({
                orderId: order._id,
                authorizationUrl: response.data.data.authorization_url,
                reference: response.data.data.reference
            });

        } catch (paystackError) {
            // If Paystack fails, delete the order
            await Order.findByIdAndDelete(order._id);
            throw paystackError; // Re-throw to outer catch
        }

    } catch (error) {
        console.error('Order creation error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        res.status(500).send({
            error: 'Failed to create order',
            message: error.response?.data?.message || error.message
        });
    }
});

router.post('/confirm', async (req, res) => {
    try {
        const { reference } = req.body;

        if (!reference) {
            return res.status(400).send({ success: false, message: "Reference is required" });
        }

        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`, // ✅ Fixed
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` // ✅ Fixed
                },
                timeout: 10000
            }
        );

        const data = response.data.data;
        if (data.status === "success") {
            const order = await Order.findOneAndUpdate(
                { paymentReference: reference },
                { paymentStatus: "paid", transactionId: data.id },
                { new: true }
            );

            if (!order) {
                return res.status(404).send({ success: false, message: "Order not found" });
            }

            return res.send({ success: true, order });
        } else {
            return res.status(400).send({ success: false, message: "Payment failed" });
        }

    } catch (error) {
        console.error('Payment confirmation error:', {
            message: error.message,
            response: error.response?.data
        });

        res.status(500).send({
            success: false,
            message: error.response?.data?.message || 'Failed to verify payment'
        });
    }
});

router.post('/webhook', express.json({ type: 'application/json' }), async (req, res) => {
    try {
        const event = req.body;

        if (event.event === "charge.success") {
            const reference = event.data.reference;
            await Order.findOneAndUpdate(
                { paymentReference: reference },
                { paymentStatus: "paid", transactionId: event.data.id }
            );
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook error:', error.message);
        res.sendStatus(200); // Still return 200 to Paystack
    }
});

module.exports = router;