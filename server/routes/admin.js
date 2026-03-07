const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const adminAuth = require("../middleware/auth");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Client = require("../models/Client");

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

// PATCH /api/admin/orders/:id/status — Update order status (with timeline tracking)
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

        // Push to status history for timeline tracking
        order.statusHistory.push({
            status,
            changedBy: "admin",
            changedAt: new Date(),
        });

        await order.save();

        res.json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/admin/orders — Create an offline order (for phone-call orders)
router.post("/orders", adminAuth, async (req, res) => {
    try {
        const { customerName, customerPhone, deliveryAddress, deliveryDate, deliveryTimeSlot, items, notes, status } = req.body;

        if (!customerName || !customerPhone || !deliveryAddress || !deliveryDate || !deliveryTimeSlot || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields: customerName, customerPhone, deliveryAddress, deliveryDate, deliveryTimeSlot, items",
            });
        }

        const cleanPhone = customerPhone.replace(/\D/g, "");
        if (cleanPhone.length < 10) {
            return res.status(400).json({ success: false, error: "Invalid phone number." });
        }

        const deliveryDateObj = new Date(deliveryDate);
        if (isNaN(deliveryDateObj.getTime())) {
            return res.status(400).json({ success: false, error: "Invalid delivery date." });
        }

        // Build order items with price verification
        const orderItems = [];
        let subtotal = 0;

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(400).json({ success: false, error: `Product not found: ${item.productId}` });
            }
            const variant = product.variants.find((v) => v.label === item.variant);
            if (!variant) {
                return res.status(400).json({ success: false, error: `Invalid variant "${item.variant}" for "${product.name}"` });
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

        const initialStatus = status || "confirmed";
        const order = new Order({
            customerName,
            customerPhone: cleanPhone,
            deliveryAddress,
            deliveryDate: deliveryDateObj,
            deliveryTimeSlot,
            items: orderItems,
            subtotal,
            notes: notes || "",
            source: "offline",
            status: initialStatus,
            statusHistory: [
                { status: initialStatus, changedBy: "admin", changedAt: new Date() },
            ],
        });

        await order.save();

        // Upsert client record
        try {
            await Client.findOneAndUpdate(
                { phone: cleanPhone },
                {
                    phone: cleanPhone,
                    name: customerName.trim(),
                    defaultAddress: deliveryAddress.trim(),
                    $inc: { orderCount: 1, totalSpent: subtotal },
                },
                { upsert: true, new: true }
            );
        } catch (clientErr) {
            console.error("Client upsert error:", clientErr.message);
        }

        res.status(201).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/admin/requirements?date=YYYY-MM-DD — Daily requirements aggregation
router.get("/requirements", adminAuth, async (req, res) => {
    try {
        const dateStr = req.query.date;
        if (!dateStr) {
            return res.status(400).json({ success: false, error: "Date query parameter is required (YYYY-MM-DD)" });
        }

        const targetDate = new Date(dateStr);
        if (isNaN(targetDate.getTime())) {
            return res.status(400).json({ success: false, error: "Invalid date format" });
        }

        // Date range for the whole day (UTC-based to match how deliveryDate is stored)
        const dayStart = new Date(dateStr + "T00:00:00.000Z");
        const dayEnd = new Date(dayStart);
        dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

        // Fetch all non-cancelled orders for this delivery date
        const orders = await Order.find({
            deliveryDate: { $gte: dayStart, $lt: dayEnd },
            status: { $ne: "cancelled" },
        });

        // Aggregate by product + variant
        const byVariant = {};
        // Aggregate by product (total weight)
        const byProduct = {};

        let toPrepareOrders = 0;
        let dispatchedOrders = 0;

        for (const order of orders) {
            // out-for-delivery and delivered = already prepared (counts as "delivered")
            const isDelivered = ["out-for-delivery", "delivered"].includes(order.status);
            if (isDelivered) dispatchedOrders++;
            else toPrepareOrders++;

            for (const item of order.items) {
                // --- By Variant ---
                const variantKey = `${item.productName}|||${item.variant}`;
                if (!byVariant[variantKey]) {
                    byVariant[variantKey] = {
                        productName: item.productName,
                        variant: item.variant,
                        totalQty: 0,
                        deliveredQty: 0,
                        requirementQty: 0,
                    };
                }
                byVariant[variantKey].totalQty += item.quantity;
                if (isDelivered) {
                    byVariant[variantKey].deliveredQty += item.quantity;
                } else {
                    byVariant[variantKey].requirementQty += item.quantity;
                }

                // --- By Product (weight aggregation) ---
                // Find the product's variant weight from the DB
                if (!byProduct[item.productName]) {
                    byProduct[item.productName] = {
                        productName: item.productName,
                        totalWeight: 0,
                        deliveredWeight: 0,
                        requirementWeight: 0,
                        totalQty: 0,
                        deliveredQty: 0,
                        requirementQty: 0,
                    };
                }

                // Parse weight from variant label (e.g., "250g" → 250, "1kg" → 1000, "6 pcs" → 6)
                const weight = parseVariantWeight(item.variant);
                const totalWeight = weight * item.quantity;

                byProduct[item.productName].totalWeight += totalWeight;
                byProduct[item.productName].totalQty += item.quantity;
                if (isDelivered) {
                    byProduct[item.productName].deliveredWeight += totalWeight;
                    byProduct[item.productName].deliveredQty += item.quantity;
                } else {
                    byProduct[item.productName].requirementWeight += totalWeight;
                    byProduct[item.productName].requirementQty += item.quantity;
                }
            }
        }

        res.json({
            success: true,
            data: {
                date: dateStr,
                totalOrders: orders.length,
                toPrepareOrders,
                dispatchedOrders,
                byVariant: Object.values(byVariant),
                byProduct: Object.values(byProduct),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Helper: parse variant label to weight in grams (or piece count)
function parseVariantWeight(variantLabel) {
    const label = variantLabel.toLowerCase().trim();

    // Match "1kg", "500g", "250g"
    const kgMatch = label.match(/^([\d.]+)\s*kg$/);
    if (kgMatch) return parseFloat(kgMatch[1]) * 1000;

    const gMatch = label.match(/^([\d.]+)\s*g$/);
    if (gMatch) return parseFloat(gMatch[1]);

    // Match "6 pcs", "12 pcs"
    const pcsMatch = label.match(/^(\d+)\s*pcs?$/);
    if (pcsMatch) return parseInt(pcsMatch[1], 10);

    // Fallback: try to parse as number
    const num = parseFloat(label);
    return isNaN(num) ? 0 : num;
}

// GET /api/admin/clients — List all clients
router.get("/clients", adminAuth, async (req, res) => {
    try {
        const clients = await Client.find().sort({ updatedAt: -1 });
        res.json({ success: true, count: clients.length, data: clients });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/admin/clients/:phone/orders — Client's order history
router.get("/clients/:phone/orders", adminAuth, async (req, res) => {
    try {
        const cleanPhone = req.params.phone.replace(/\D/g, "");
        const orders = await Order.find({ customerPhone: cleanPhone }).sort({ createdAt: -1 });
        res.json({ success: true, count: orders.length, data: orders });
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
        const totalClients = await Client.countDocuments();

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
                totalClients,
                totalRevenue,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
