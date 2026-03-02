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

    const message = `🛒 *New Order — Sampoornam Foods*
📋 Order: *${order.orderNumber}*

📦 *Items:*
${itemLines}

💰 *Total: ₹${order.subtotal.toLocaleString("en-IN")}*

👤 Name: ${order.customerName}
📱 Phone: ${order.customerPhone}
📍 Address: ${order.deliveryAddress}${order.deliveryDateTime ? `\n🕐 Delivery: ${order.deliveryDateTime}` : ""}${order.notes ? `\n📝 Notes: ${order.notes}` : ""}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = process.env.WHATSAPP_NUMBER;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    return { message, whatsappUrl };
}

module.exports = { formatWhatsAppMessage };
