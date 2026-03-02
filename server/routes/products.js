const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// GET /api/products — List all products (with optional filters)
router.get("/", async (req, res) => {
    try {
        const { category, featured, available } = req.query;
        const filter = {};

        if (category) filter.category = category;
        if (featured === "true") filter.isFeatured = true;
        if (available !== "false") filter.isAvailable = true; // default: only available

        const products = await Product.find(filter).sort({ sortOrder: 1, name: 1 });
        res.json({ success: true, count: products.length, data: products });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/products/:slug — Get single product by slug
router.get("/:slug", async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug });
        if (!product) {
            return res.status(404).json({ success: false, error: "Product not found" });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
