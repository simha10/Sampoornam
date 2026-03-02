const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const adminAuth = require("../middleware/auth");
const Product = require("../models/Product");
const Order = require("../models/Order");

const router = express.Router();

// Admin credentials from environment variables
const ADMIN_PHONE = process.env.ADMIN_PHONE || "7007066735";
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD || "sampoornam2026", 10);

// POST /api/admin/login — Admin login
router.post("/login", async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ success: false, error: "Phone and password are required" });
        }

        const cleanPhone = phone.replace(/\D/g, "");
        if (cleanPhone !== ADMIN_PHONE) {
            return res.status(401).json({ success: false, error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: "Invalid credentials" });
        }

        const token = jwt.sign({ phone: cleanPhone, role: "admin" }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.json({ success: true, token });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============ Protected Admin Routes (require JWT) ============

// GET /api/admin/products — List all products (including unavailable)
router.get("/products", adminAuth, async (req, res) => {
    try {
        const products = await Product.find().sort({ category: 1, sortOrder: 1 });
        res.json({ success: true, count: products.length, data: products });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/admin/products — Create a product
router.post("/products", adminAuth, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// PUT /api/admin/products/:id — Update a product
router.put("/products/:id", adminAuth, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!product) {
            return res.status(404).json({ success: false, error: "Product not found" });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// DELETE /api/admin/products/:id — Delete a product
router.delete("/products/:id", adminAuth, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, error: "Product not found" });
        }
        res.json({ success: true, message: "Product deleted" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/admin/orders — List all orders (with optional status filter)
router.get("/orders", adminAuth, async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;

        const orders = await Order.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PATCH /api/admin/orders/:id/status — Update order status
router.patch("/orders/:id/status", adminAuth, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["ordered", "confirmed", "preparing", "out-for-delivery", "delivered", "cancelled"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
            });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, error: "Order not found" });
        }

        order.status = status;
        if (status === "cancelled") order.cancelledBy = "admin";
        await order.save();

        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/admin/stats — Dashboard overview stats
router.get("/stats", adminAuth, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const activeOrders = await Order.countDocuments({
            status: { $nin: ["delivered", "cancelled"] },
        });
        const deliveredOrders = await Order.countDocuments({ status: "delivered" });
        const cancelledOrders = await Order.countDocuments({ status: "cancelled" });
        const totalProducts = await Product.countDocuments();

        // Revenue from delivered orders
        const revenueResult = await Order.aggregate([
            { $match: { status: "delivered" } },
            { $group: { _id: null, total: { $sum: "$subtotal" } } },
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        res.json({
            success: true,
            data: {
                totalOrders,
                activeOrders,
                deliveredOrders,
                cancelledOrders,
                totalProducts,
                totalRevenue,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
