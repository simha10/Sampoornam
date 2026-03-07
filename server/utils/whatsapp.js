/**
 * Formats an order into a WhatsApp-ready message and returns the redirect URL.
 */
function formatWhatsAppMessage(order) {
    const itemLines = order.items
        .map(
            (item) =>
                `• ${item.productName} (${item.variant}) × ${item.quantity} = ₹${item.lineTotal.toLocaleString("en-IN")}`
        )
        .join("\n");

    const message = `📦 *New Order - Sampoornam Foods*
🆔 Order ID: *${order.orderNumber}*

📋 *Items:*
${itemLines}

🪙 *Total: ₹${order.subtotal.toLocaleString("en-IN")}*

👤 Name: ${order.customerName}
📱 Phone: ${order.customerPhone}
📍 Address: ${order.deliveryAddress}
🗓️ Delivery: ${
order.deliveryDate
? new Date(order.deliveryDate).toLocaleDateString("en-IN", {
weekday: "short",
day: "numeric",
month: "short",
year: "numeric"
})
: "N/A"
} | ${order.deliveryTimeSlot || "N/A"}${order.notes ? `\n📝 Notes: ${order.notes}` : ""}`;

    const encodedMessage = encodeURIComponent(message);

    const whatsappUrl =
        `https://api.whatsapp.com/send?phone=${process.env.WHATSAPP_NUMBER}&text=${encodedMessage}`;

    return { message, whatsappUrl };
}

module.exports = { formatWhatsAppMessage };