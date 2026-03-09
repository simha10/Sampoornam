# Sampoornam Foods — Implementation Documentation

> Last updated: March 9, 2026

## System Overview

Sampoornam Foods is a full-stack e-commerce platform for a premium South Indian cloud kitchen specializing in sweets and namkeens. The system uses a **WhatsApp-based notification** flow and a **phone-number-based** identity model (no sign-up/login required for customers). Admins have a full dashboard for order management, delivery tracking, and customer management.

---

## Architecture

```
Sampoornam/
├── client/          → Next.js 14 (App Router) frontend on port 7000
├── server/          → Express.js + MongoDB API on port 5000
├── DOCS/            → Project documentation & PRD
└── plans/           → Architecture and walkthrough docs
```

### Tech Stack

| Layer    | Technology                                 |
| -------- | ------------------------------------------ |
| Frontend | Next.js 14, Tailwind CSS v4, Framer Motion |
| State    | Zustand (cart + admin auth, localStorage)  |
| Backend  | Express.js 5, Mongoose 9                   |
| Database | MongoDB (local or Atlas)                   |
| Auth     | JWT (admin only)                           |
| Checkout | WhatsApp API redirect                      |
| Icons    | @heroicons/react                           |

---

## Features Implemented

### 1. Product Catalog

- **27 products**: 16 sweets + 11 namkeens
- Weight-based pricing: 250g / 500g / 1kg variants auto-calculated from per-kg price
- Piece-based pricing: 6 / 12 / 24 pcs (Gulab Jamun, Rasugulla)
- Tags: `pure-ghee`, `bestseller`, `festival`, `sugar-free`, etc.
- Featured products for homepage highlights

### 2. Shop Page (`/shop`)

- Category tabs: All / Sweets / Namkeens
- Deep-linking via URL params: `/shop?category=sweets`
- ProductCard with variant selector, dynamic pricing, and Add to Cart
- Loading skeletons, error states, and empty states
- Responsive grid: 2 columns (mobile), 3 columns (tablet), 4 columns (desktop)

### 3. Cart & Checkout

- **Zustand cart store** with localStorage persistence
- Slide-out CartDrawer with item list, quantity controls (+/−), and trash icon
- Checkout form: Customer Name, Mobile Number (10-digit), Delivery Address, Delivery Date, Time Slot, Notes
- **Place Order** button → creates order in DB → shows animated success screen
- **WhatsApp Reminder** button → pre-filled message to notify kitchen
- Cart count badge on header and bottom nav icons

### 4. Orders Tracking (`/orders`)

- Lookup by 10-digit phone number
- **Expandable order cards** — click to reveal:
  - Item breakdown with prices and totals
  - Delivery info (date, time slot, address)
  - Color-coded **status timeline** with timestamps
- Customer can cancel active orders
- Order number format: `SF-YYYYMMDD-001`

### 5. Navigation

- **Desktop header**: Home, Shop (dropdown → Sweets / Namkeens), Orders, Cart icon with badge
- **Mobile bottom bar**: Home, Shop (slide-up sub-menu), Cart, Orders
- No hamburger menu on customer pages, no sign-in/sign-up
- All buttons and CTAs navigate to actual pages

### 6. Admin Dashboard (`/admin`)

#### Overview (`/admin`)

- Stats cards: total orders, active orders, delivered, cancelled, revenue, products, clients

#### Orders (`/admin/orders`)

- List all orders with color-coded status badges
- Filter tabs: All / Ordered / Confirmed / Preparing / Out for Delivery / Delivered / Cancelled
- Expandable order details (items, delivery info, status timeline, print invoice)
- **Status sequence enforcement**: `Ordered → Confirmed → Preparing → Out for Delivery → Delivered`
  - Forward moves: confirmation dialog only
  - Backward moves: requires admin secret key (`ADMIN_PHONE`) + cleans up timeline
- **WhatsApp notify**: after status change, one-click pre-filled WhatsApp message to customer
- **Offline orders**: "Add Offline Order" modal with product picker, variant/qty controls, client auto-fill by phone, initial status selection
- Offline orders tagged with purple 📞 badge

#### Delivery Target (`/admin/requirements`)

- Daily aggregation by date picker
- **By Variant** tab: individual SKU breakdown (product + variant, requirement/delivered/total counts)
- **By Product** tab: aggregated weight/piece totals
  - Weight-based products: displayed in grams/kg
  - Piece-based products: displayed in pcs
- Summary boxes: Orders, To Prepare, Dispatched (with singular/plural)
- CSV export

#### Products (`/admin/products`)

- Full CRUD: create, edit, delete
- Variant management with drag-and-drop
- Tags, image URL, featured toggle, availability toggle

#### Clients (`/admin/clients`)

- Auto-tracked from orders (upserted on every order)
- Phone, name, address, total orders, last order date
- Expandable order history per client

### 7. Homepage

- Hero banner: Portrait (MUI.png) for mobile, landscape (main.png) for desktop
- Trust badges: 100% Pure Desi Ghee, FSSAI Certified, Lucknow Delivery
- Signature Collections: Sweets and Namkeens cards → link to `/shop?category=...`
- Footer with contact info and newsletter section

### 8. Responsive Design

- All pages fully responsive across mobile, tablet, and desktop
- Admin sidebar collapses to hamburger menu on mobile
- Tables use horizontal scroll (`overflow-x-auto`) on small screens
- Modals stack to single-column on mobile
- Customer bottom nav with slide-up shop menu

---

## API Endpoints

### Public

| Method  | Endpoint                          | Description                                    |
| ------- | --------------------------------- | ---------------------------------------------- |
| `GET`   | `/api/products`                   | List products (`?category=`, `?featured=true`) |
| `GET`   | `/api/products/:slug`             | Single product by slug                         |
| `POST`  | `/api/orders`                     | Create order → returns WhatsApp URL            |
| `GET`   | `/api/orders/:orderNumber`        | Track order by number                          |
| `GET`   | `/api/orders/phone/:phone`        | List orders by phone                           |
| `PATCH` | `/api/orders/:orderNumber/cancel` | Cancel order (customer)                        |
| `GET`   | `/api/health`                     | Health check                                   |

### Admin (JWT Protected)

| Method   | Endpoint                           | Description                       |
| -------- | ---------------------------------- | --------------------------------- |
| `POST`   | `/api/admin/login`                 | Login → returns JWT               |
| `GET`    | `/api/admin/products`              | List all products                 |
| `POST`   | `/api/admin/products`              | Create product                    |
| `PUT`    | `/api/admin/products/:id`          | Update product                    |
| `DELETE` | `/api/admin/products/:id`          | Delete product                    |
| `GET`    | `/api/admin/orders`                | List orders (`?status=`)          |
| `POST`   | `/api/admin/orders`                | Create offline order              |
| `PATCH`  | `/api/admin/orders/:id/status`     | Update status (sequence enforced) |
| `GET`    | `/api/admin/requirements?date=`    | Daily delivery target             |
| `GET`    | `/api/admin/clients`               | List all clients                  |
| `GET`    | `/api/admin/clients/:phone/orders` | Client order history              |
| `GET`    | `/api/admin/stats`                 | Dashboard stats                   |

---

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
- `source` (online/offline), `cancelledBy` (user/admin), `notes`, `whatsappSent`

### Client

- `phone` (unique), `name`, `address`
- Auto-upserted whenever an order is placed (online or offline)

---

## What's NOT Implemented Yet

- [ ] WhatsApp Cloud API (auto-send notifications without manual send)
- [ ] Product images (currently emoji placeholders)
- [ ] Search / filter within shop page
- [ ] User accounts / auth
- [ ] Payment gateway integration
