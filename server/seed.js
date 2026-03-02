require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Product = require("./models/Product");

// Helper: generate weight-based variants from a per-kg price
function weightVariants(pricePerKg) {
    return [
        { label: "250g", price: Math.round(pricePerKg * 0.25), weight: 250 },
        { label: "500g", price: Math.round(pricePerKg * 0.5), weight: 500 },
        { label: "1kg", price: pricePerKg, weight: 1000 },
    ];
}

// Helper: generate piece-based variants from a per-piece price
function pieceVariants(pricePerPiece) {
    return [
        { label: "6 pcs", price: pricePerPiece * 6, weight: 6 },
        { label: "12 pcs", price: pricePerPiece * 12, weight: 12 },
        { label: "24 pcs", price: pricePerPiece * 24, weight: 24 },
    ];
}

const products = [
    // ========== SWEETS ==========
    {
        name: "Kaju Barfi",
        category: "sweets",
        description: "Premium cashew fudge, delicately crafted with finest cashews and pure sugar.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(1100),
        tags: ["bestseller", "premium"],
        isFeatured: true,
        sortOrder: 1,
    },
    {
        name: "Chandra Kala",
        category: "sweets",
        description: "Moon-shaped pastry filled with khoya and dry fruits, made with pure desi ghee.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(650),
        tags: ["pure-ghee", "festival"],
        sortOrder: 2,
    },
    {
        name: "Balushahi",
        category: "sweets",
        description: "Traditional flaky sweet soaked in sugar syrup, prepared with pure desi ghee.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(600),
        tags: ["pure-ghee", "traditional"],
        sortOrder: 3,
    },
    {
        name: "Gujiya Refined",
        category: "sweets",
        description: "Classic crescent-shaped sweet filled with khoya and dry fruits.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(500),
        tags: ["festival"],
        sortOrder: 4,
    },
    {
        name: "Gujiya",
        category: "sweets",
        description: "Authentic gujiya prepared with pure desi ghee and stuffed with sweetened khoya.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(700),
        tags: ["pure-ghee", "festival", "bestseller"],
        isFeatured: true,
        sortOrder: 5,
    },
    {
        name: "Motichoor ke Laddu",
        category: "sweets",
        description: "Perfectly round laddus made from tiny boondi pearls and pure desi ghee.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(700),
        tags: ["pure-ghee", "traditional", "bestseller"],
        isFeatured: true,
        sortOrder: 6,
    },
    {
        name: "Besan Laddu With Dry Fruits",
        category: "sweets",
        description: "Rich gram flour laddus loaded with premium dry fruits and pure desi ghee.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(700),
        tags: ["pure-ghee", "premium"],
        sortOrder: 7,
    },
    {
        name: "Besan Laddu",
        category: "sweets",
        description: "Classic besan laddu made the traditional way with roasted gram flour and pure desi ghee.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(600),
        tags: ["pure-ghee", "traditional"],
        sortOrder: 8,
    },
    {
        name: "Coconut Laddu",
        category: "sweets",
        description: "Soft and moist laddus made with freshly grated coconut and condensed milk.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(400),
        tags: ["vegetarian"],
        sortOrder: 9,
    },
    {
        name: "Gulab Jamun",
        category: "sweets",
        description: "Soft, spongy milk-solid balls soaked in fragrant rose-cardamom sugar syrup.",
        imgURL: "",
        pricingType: "piece",
        variants: pieceVariants(20),
        tags: ["bestseller", "traditional"],
        isFeatured: true,
        sortOrder: 10,
    },
    {
        name: "Rasugulla",
        category: "sweets",
        description: "Light, spongy cottage cheese balls in clear sugar syrup. Melt-in-mouth goodness.",
        imgURL: "",
        pricingType: "piece",
        variants: pieceVariants(22),
        tags: ["traditional"],
        sortOrder: 11,
    },
    {
        name: "Gondh & Dry Fruit Laddo",
        category: "sweets",
        description: "Nutritious laddus made with edible gum and assorted dry fruits. Perfect winter delicacy.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(800),
        tags: ["premium", "healthy"],
        sortOrder: 12,
    },
    {
        name: "Dry Fruit Laddu (Without Sugar)",
        category: "sweets",
        description: "Sugar-free laddus packed with premium dry fruits. Naturally sweetened with dates.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(1400),
        tags: ["sugar-free", "premium", "healthy"],
        sortOrder: 13,
    },
    {
        name: "Gujiya (Chashini Wala)",
        category: "sweets",
        description: "Gujiya dipped in a rich sugar syrup coating for extra sweetness and crunch.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(800),
        tags: ["festival"],
        sortOrder: 14,
    },
    {
        name: "Gujiya (Sugar Free)",
        category: "sweets",
        description: "Sugar-free gujiya made with pure desi ghee. Guilt-free festive indulgence.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(800),
        tags: ["pure-ghee", "sugar-free"],
        sortOrder: 15,
    },
    {
        name: "Gujiya (Brown Sugar)",
        category: "sweets",
        description: "Gujiya sweetened with brown sugar and made with pure desi ghee. A healthier twist.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(800),
        tags: ["pure-ghee", "healthy"],
        sortOrder: 16,
    },

    // ========== NAMKEENS ==========
    {
        name: "Masala Mathri",
        category: "namkeens",
        description: "Crispy, spiced mathri with a perfect blend of ajwain and cumin. Tea-time essential.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(350),
        tags: ["bestseller", "spicy"],
        isFeatured: true,
        sortOrder: 1,
    },
    {
        name: "Mathri",
        category: "namkeens",
        description: "Classic plain mathri — flaky, crispy, and mildly salted. A North Indian staple.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(300),
        tags: ["traditional"],
        sortOrder: 2,
    },
    {
        name: "Moong Dal Namkeen",
        category: "namkeens",
        description: "Crunchy fried moong dal seasoned with salt, pepper, and a hint of hing.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(400),
        tags: ["snack"],
        sortOrder: 3,
    },
    {
        name: "Namakpare",
        category: "namkeens",
        description: "Diamond-shaped crispy flour bites, lightly salted. Classic Indian snack.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(300),
        tags: ["traditional"],
        sortOrder: 4,
    },
    {
        name: "Namkeen Save",
        category: "namkeens",
        description: "Fine sev noodles seasoned with turmeric and red chili. Crunchy and addictive.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(400),
        tags: ["spicy"],
        sortOrder: 5,
    },
    {
        name: "Saboodana Namkeen",
        category: "namkeens",
        description: "Light and crispy sago pearl snack. Perfect for fasting days and tea-time.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(450),
        tags: ["fasting", "light"],
        sortOrder: 6,
    },
    {
        name: "Sakhe",
        category: "namkeens",
        description: "Traditional savory snack with a satisfying crunch and balanced spice.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(350),
        tags: ["traditional"],
        sortOrder: 7,
    },
    {
        name: "Khurma",
        category: "namkeens",
        description: "Sweet and crunchy flour spirals coated in sugar. A unique sweet-savory treat.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(350),
        tags: ["sweet-savory"],
        sortOrder: 8,
    },
    {
        name: "Papdi",
        category: "namkeens",
        description: "Crispy, flat, round wafers perfect for chaat or as a standalone snack.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(300),
        tags: ["chaat", "snack"],
        sortOrder: 9,
    },
    {
        name: "Mini Khasta",
        category: "namkeens",
        description: "Bite-sized flaky kachori bites with a savory dal filling inside.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(400),
        tags: ["stuffed", "bestseller"],
        isFeatured: true,
        sortOrder: 10,
    },
    {
        name: "Mini Samosa",
        category: "namkeens",
        description: "Tiny, crispy samosas with spiced potato filling. Party snack favorite.",
        imgURL: "",
        pricingType: "weight",
        variants: weightVariants(400),
        tags: ["snack", "bestseller"],
        isFeatured: true,
        sortOrder: 11,
    },
];

async function seed() {
    try {
        await connectDB();
        console.log("🗑️  Clearing existing products...");
        await Product.deleteMany({});

        console.log("🌱 Seeding products...");
        const created = await Product.insertMany(products);
        console.log(`✅ Seeded ${created.length} products successfully!`);

        const sweets = created.filter((p) => p.category === "sweets");
        const namkeens = created.filter((p) => p.category === "namkeens");
        console.log(`   🍬 Sweets: ${sweets.length}`);
        console.log(`   🥨 Namkeens: ${namkeens.length}`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Seed error:", error.message);
        process.exit(1);
    }
}

seed();
