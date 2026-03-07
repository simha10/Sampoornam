const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        productName: { type: String, required: true },
        variant: { type: String, required: true },   // "1kg", "6 pcs"
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
        lineTotal: { type: Number, required: true },
    },
    { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
    {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: {
            type: String,
            enum: ["system", "admin", "user"],
            default: "system",
        },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        orderNumber: { type: String, required: true, unique: true },
        customerName: { type: String, required: true, trim: true },
        customerPhone: { type: String, required: true, trim: true },
        deliveryAddress: { type: String, required: true, trim: true },
        deliveryDate: { type: Date, required: true },
        deliveryTimeSlot: { type: String, required: true },
        items: [orderItemSchema],
        subtotal: { type: Number, required: true },
        status: {
            type: String,
            enum: ["ordered", "confirmed", "preparing", "out-for-delivery", "delivered", "cancelled"],
            default: "ordered",
        },
        statusHistory: [statusHistorySchema],
        cancelledBy: {
            type: String,
            enum: ["user", "admin", null],
            default: null,
        },
        whatsappSent: { type: Boolean, default: false },
        source: {
            type: String,
            enum: ["online", "offline"],
            default: "online",
        },
        notes: { type: String, default: "" },
    },
    { timestamps: true }
);

// Auto-generate order number before saving
orderSchema.pre("validate", async function () {
    if (!this.orderNumber) {
        const today = new Date();
        const dateStr =
            today.getFullYear().toString() +
            String(today.getMonth() + 1).padStart(2, "0") +
            String(today.getDate()).padStart(2, "0");

        const count = await mongoose.model("Order").countDocuments({
            createdAt: {
                $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
            },
        });

        this.orderNumber = `SF-${dateStr}-${String(count + 1).padStart(3, "0")}`;
    }
});

module.exports = mongoose.model("Order", orderSchema);
