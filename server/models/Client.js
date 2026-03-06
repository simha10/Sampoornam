const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
    {
        phone: { type: String, required: true, unique: true, trim: true },
        name: { type: String, required: true, trim: true },
        defaultAddress: { type: String, default: "", trim: true },
        alternatePhone: { type: String, default: "", trim: true },
        orderCount: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
