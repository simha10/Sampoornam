const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { formatWhatsAppMessage } = require("../utils/whatsapp");

const router = express.Router();

// POST /api/orders — Create a new order
router.post("/", async (req, res) => {
    try {
        const { customerName, customerPhone, deliveryAddress, deliveryDateTime, items, notes } = req.body;

        // Validate required fields
        if (!customerName || !customerPhone || !deliveryAddress || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields: customerName, customerPhone, deliveryAddress, items",
            });
        }

        // Validate phone number (Indian mobile: 10 digits)
        const cleanPhone = customerPhone.replace(/\D/g, "");
        if (cleanPhone.length < 10) {
            return res.status(400).json({
                success: false,
                error: "Invalid phone number. Must be at least 10 digits.",
            });
        }

        // Build order items with price verification from DB
        const orderItems = [];
        let subtotal = 0;

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(400).json({
                    success: false,
                    error: `Product not found: ${item.productId}`,
                });
            }

            const variant = product.variants.find((v) => v.label === item.variant);
            if (!variant) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid variant "${item.variant}" for product "${product.name}"`,
                });
            }

            const lineTotal = variant.price * item.quantity;
            subtotal += lineTotal;

            orderItems.push({
                product: product._id,
                productName: product.name,
                variant: item.variant,
                quantity: item.quantity,
                unitPrice: variant.price,
                lineTotal,
            });
        }

        // Create the order
        const order = new Order({
            customerName,
            customerPhone: cleanPhone,
            deliveryAddress,
            deliveryDateTime: deliveryDateTime || "",
            items: orderItems,
            subtotal,
            notes: notes || "",
        });

        await order.save();

        // Generate WhatsApp URL
        const { whatsappUrl } = formatWhatsAppMessage(order);

        res.status(201).json({
            success: true,
            data: {
                order,
                whatsappUrl,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/orders/:orderNumber — Get order by order number (for customer tracking)
router.get("/:orderNumber", async (req, res) => {
    try {
        const order = await Order.findOne({ orderNumber: req.params.orderNumber });
        if (!order) {
            return res.status(404).json({ success: false, error: "Order not found" });
        }
        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/orders/phone/:phone — Get all orders by phone number
router.get("/phone/:phone", async (req, res) => {
    try {
        const cleanPhone = req.params.phone.replace(/\D/g, "");
        const orders = await Order.find({ customerPhone: cleanPhone }).sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PATCH /api/orders/:orderNumber/cancel — Cancel order (by customer)
router.patch("/:orderNumber/cancel", async (req, res) => {
    try {
        const order = await Order.findOne({ orderNumber: req.params.orderNumber });
        if (!order) {
            return res.status(404).json({ success: false, error: "Order not found" });
        }

        // Can only cancel if not already delivered or cancelled
        if (["delivered", "cancelled"].includes(order.status)) {
            return res.status(400).json({
                success: false,
                error: `Cannot cancel order with status "${order.status}"`,
            });
        }

        order.status = "cancelled";
        order.cancelledBy = "user";
        await order.save();

        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
