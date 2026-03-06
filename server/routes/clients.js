const express = require("express");
const Client = require("../models/Client");

const router = express.Router();

// GET /api/clients/:phone — Get client by phone (for auto-fill)
router.get("/:phone", async (req, res) => {
    try {
        const cleanPhone = req.params.phone.replace(/\D/g, "");
        const client = await Client.findOne({ phone: cleanPhone });

        if (!client) {
            return res.status(404).json({ success: false, error: "Client not found" });
        }

        res.json({ success: true, data: client });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/clients — Upsert client (create or update)
router.post("/", async (req, res) => {
    try {
        const { phone, name, defaultAddress, alternatePhone } = req.body;

        if (!phone || !name) {
            return res.status(400).json({
                success: false,
                error: "Phone and name are required",
            });
        }

        const cleanPhone = phone.replace(/\D/g, "");

        const client = await Client.findOneAndUpdate(
            { phone: cleanPhone },
            {
                phone: cleanPhone,
                name: name.trim(),
                defaultAddress: defaultAddress?.trim() || "",
                alternatePhone: alternatePhone?.trim() || "",
            },
            { upsert: true, new: true, runValidators: true }
        );

        res.json({ success: true, data: client });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
