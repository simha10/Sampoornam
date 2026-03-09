# Sampoornam Server — Backend API

Express.js + MongoDB REST API for the Sampoornam Foods e-commerce platform.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and admin credentials

# Seed the database with 27 products
npm run seed

# Start development server (with hot reload)
npm run dev

# Start production server
npm start
```

The server runs on **http://localhost:5000** by default.

## Environment Variables

| Variable          | Description                    | Default                                |
| ----------------- | ------------------------------ | -------------------------------------- |
| `PORT`            | Server port                    | `5000`                                 |
| `MONGODB_URI`     | MongoDB connection string      | `mongodb://localhost:27017/sampoornam` |
| `JWT_SECRET`      | Secret for admin JWT tokens    | —                                      |
| `WHATSAPP_NUMBER` | WhatsApp number for kitchen    | `918639445966`                         |
| `ADMIN_PHONE`     | Admin login phone + secret key | `8639445966`                           |
| `ADMIN_PASSWORD`  | Admin login password           | `sampoornam2026`                       |

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
│   ├── Product.js        # Product schema (variants, tags, pricingType)
│   ├── Order.js          # Order schema (statusHistory, source, auto-number)
│   └── Client.js         # Client schema (auto-upserted from orders)
├── routes/
│   ├── products.js       # Public: list/filter/detail products
│   ├── orders.js         # Public: create order, track, cancel
│   └── admin.js          # Protected: products, orders, clients, stats, requirements
└── utils/
    └── whatsapp.js       # WhatsApp message formatter + URL generator
```

## API Reference

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
POST   /api/admin/login                 → Login (phone + password) → JWT
GET    /api/admin/products              → List all products (including hidden)
POST   /api/admin/products              → Create product
PUT    /api/admin/products/:id          → Update product
DELETE /api/admin/products/:id          → Delete product
GET    /api/admin/orders                → List orders (?status= filter)
POST   /api/admin/orders                → Create offline order (phone-call orders)
PATCH  /api/admin/orders/:id/status     → Update order status (with sequence enforcement)
GET    /api/admin/requirements?date=    → Daily delivery target aggregation
GET    /api/admin/clients               → List all clients
GET    /api/admin/clients/:phone/orders → Client order history
GET    /api/admin/stats                 → Dashboard overview stats
```

### Status Update Endpoint Details

`PATCH /api/admin/orders/:id/status`

**Status sequence:** `ordered` → `confirmed` → `preparing` → `out-for-delivery` → `delivered`

| Direction | Body                    | Notes                                |
| --------- | ----------------------- | ------------------------------------ |
| Forward   | `{ status }`            | Allowed freely                       |
| Backward  | `{ status, secretKey }` | Requires `secretKey === ADMIN_PHONE` |

Backward changes also **clean up the status timeline** — removes entries at/above the target status so the timeline looks like the mistake never happened.

### Offline Order Endpoint Details

`POST /api/admin/orders`

Creates an order for phone/walk-in customers. Same validation as regular orders but:

- Tagged with `source: "offline"`
- Supports setting initial status (e.g., `"confirmed"` or `"delivered"`)
- Auto-upserts a `Client` record

## Database Schema

### Product

- `name`, `slug` (auto-generated), `category` (sweets/namkeens)
- `pricingType` (weight/piece), `variants` [{label, price, weight}]
- `tags`, `isAvailable`, `isFeatured`, `sortOrder`, `imgURL`, `description`

### Order

- `orderNumber` (auto: SF-YYYYMMDD-NNN)
- `customerName`, `customerPhone`, `deliveryAddress`
- `deliveryDate`, `deliveryTimeSlot`
- `items` [{product, productName, variant, quantity, unitPrice, lineTotal}]
- `subtotal`, `status`, `statusHistory` [{status, changedAt, changedBy}]
- `source` (online/offline), `cancelledBy` (user/admin), `notes`

### Client

- `phone` (unique), `name`, `address`
- Auto-upserted whenever an order is placed

## Order Flow

1. Customer adds items to cart on frontend
2. Frontend sends `POST /api/orders` with cart items + customer info
3. Server validates products/variants from DB, calculates totals
4. Order saved with auto-generated number (`SF-YYYYMMDD-001`)
5. Server returns formatted WhatsApp URL for kitchen notification
6. Frontend shows success animation + WhatsApp reminder
7. Admin manages orders via dashboard with status sequence enforcement
