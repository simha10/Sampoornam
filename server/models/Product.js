const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
    {
        label: { type: String, required: true }, // "250g", "500g", "1kg", "6 pcs"
        price: { type: Number, required: true }, // price in INR
        weight: { type: Number, default: 0 },    // weight in grams (for sorting)
    },
    { _id: false }
);

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        category: {
            type: String,
            required: true,
            enum: ["sweets", "namkeens"],
        },
        description: { type: String, default: "" },
        imgURL: { type: String, default: "" },
        pricingType: {
            type: String,
            required: true,
            enum: ["weight", "piece"],
            default: "weight",
        },
        variants: [variantSchema],
        tags: [{ type: String }], // ["pure-ghee", "bestseller", "festival"]
        isAvailable: { type: Boolean, default: true },
        isFeatured: { type: Boolean, default: false },
        sortOrder: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Generate slug from name before saving
productSchema.pre("validate", function () {
    if (this.name && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }
});

module.exports = mongoose.model("Product", productSchema);
