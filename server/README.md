# Sampoornam Server — Backend API

Express.js + MongoDB REST API for the Sampoornam Foods e-commerce platform.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Seed the database with 27 products
npm run seed

# Start development server (with hot reload)
npm run dev

# Start production server
npm start
```

The server runs on **http://localhost:5000** by default.

## Environment Variables

| Variable         | Description                     | Default                          |
|------------------|---------------------------------|----------------------------------|
| `PORT`           | Server port                     | `5000`                           |
| `MONGODB_URI`    | MongoDB connection string       | `mongodb://localhost:27017/sampoornam` |
| `JWT_SECRET`     | Secret for admin JWT tokens     | —                                |
| `WHATSAPP_NUMBER`| WhatsApp Business number        | `917007066735`                   |

## Project Structure

```
server/
├── index.js              # Entry point — Express app, CORS, routes
├── seed.js               # Database seeder (27 products)
├── config/
│   └── db.js             # MongoDB connection via Mongoose
├── middleware/
│   └── auth.js           # JWT authentication middleware
├── models/
│   ├── Product.js        # Product schema (variants, tags, pricing)
│   └── Order.js          # Order schema (auto order number, status)
├── routes/
│   ├── products.js       # Public: list/filter/detail products
│   ├── orders.js         # Public: create order, track, cancel
│   └── admin.js          # Protected: CRUD products, manage orders
└── utils/
    └── whatsapp.js       # WhatsApp message formatter + URL generator
```

## API Overview

### Public Endpoints

```
GET    /api/products                    → List all products
GET    /api/products?category=sweets    → Filter by category
GET    /api/products?featured=true      → Featured products only
GET    /api/products/:slug              → Single product detail
POST   /api/orders                      → Create order (returns WhatsApp URL)
GET    /api/orders/:orderNumber         → Track order by order number
GET    /api/orders/phone/:phone         → List orders by phone number
PATCH  /api/orders/:orderNumber/cancel  → Cancel order (customer)
GET    /api/health                      → Health check
```

### Admin Endpoints (JWT Required)

```
POST   /api/admin/login                 → Login (phone + password)
GET    /api/admin/products              → List all (including hidden)
POST   /api/admin/products              → Create product
PUT    /api/admin/products/:id          → Update product
DELETE /api/admin/products/:id          → Delete product
GET    /api/admin/orders                → List orders (?status= filter)
PATCH  /api/admin/orders/:id/status     → Update order status
GET    /api/admin/stats                 → Dashboard stats
```

### Admin Credentials

- **Phone:** `7007066735`
- **Password:** `sampoornam2026`

## Product Data

27 products seeded from the Sampoornam menu:

- **Sweets (16):** Kaju Barfi, Chandra Kala, Balushahi, Gujiya variants, Laddu variants, Gulab Jamun, Rasugulla, and more
- **Namkeens (11):** Masala Mathri, Moong Dal, Namakpare, Saboodana, Mini Samosa, and more

Each product has auto-generated weight variants (250g / 500g / 1kg) or piece variants (6 / 12 / 24 pcs).

## Order Flow

1. Customer adds items to cart on frontend
2. Frontend sends `POST /api/orders` with cart items + customer info
3. Server validates products/variants from DB, calculates totals
4. Order saved with auto-generated number (`SF-YYYYMMDD-001`)
5. Server returns a formatted WhatsApp URL
6. Frontend opens WhatsApp with the order message
7. Admin manages orders via `/api/admin/orders` endpoints
