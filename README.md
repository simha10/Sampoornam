# 🍬 Sampoornam Foods

Premium South Indian Sweets & Namkeens — E-Commerce Platform

> A full-stack delivery app with WhatsApp-based checkout, admin dashboard, and order management. No payment gateway, no sign-up required.

---

## ⚡ Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd Sampoornam

# 2. Install dependencies
cd server && npm install
cd ../client && npm install

# 3. Set up environment
# Edit server/.env with your MongoDB URI & admin credentials

# 4. Seed the database (one-time)
cd server && npm run seed

# 5. Start both servers
cd server && npm run dev    # Backend on :5000
cd client && npm run dev    # Frontend on :7000
```

Open **http://localhost:7000** to view the app.
Admin: **http://localhost:7000/admin/login**

---

## 📁 Project Structure

```
Sampoornam/
├── client/              # Next.js 14 frontend (port 7000)
│   ├── app/             # Pages, admin dashboard, components
│   ├── lib/             # Typed API client
│   ├── stores/          # Zustand stores (cart, admin auth)
│   └── public/          # Images and assets
├── server/              # Express.js backend (port 5000)
│   ├── models/          # Mongoose schemas (Product, Order, Client)
│   ├── routes/          # API routes (products, orders, admin)
│   ├── middleware/      # JWT auth
│   ├── utils/           # WhatsApp message formatter
│   └── seed.js          # Database seeder
├── DOCS/                # PRD, prompts, and implementation docs
└── plans/               # Architecture plan, walkthrough
```

---

## ✅ Features

### Customer-Facing

- 🛍️ **Product catalog** — products with weight/piece variants
- 🛒 **Cart system** — Zustand store, slide-out CartDrawer, quantity controls
- 📦 **Place Order** — Animated success screen + WhatsApp reminder to notify kitchen
- 📋 **Order tracking** — Lookup by phone, expandable order cards with item breakdown, status timeline, delivery info
- 🧭 **Navigation** — Desktop dropdown + mobile bottom bar (Home, Shop, Cart, Orders)
- 🎨 **Premium dark theme** — Gold accents, Playfair Display typography, fully responsive

### Admin Dashboard (`/admin`)

- 📊 **Dashboard** — Stats overview (orders, revenue, products, clients)
- 📋 **Orders** — List, filter by status, expandable details, print invoice
- 🔄 **Status Sequence** — Enforced flow: Ordered → Confirmed → Preparing → Out for Delivery → Delivered
- 🔒 **Backtrack Protection** — Reversing status requires admin secret key (ADMIN_PHONE)
- 📲 **WhatsApp Notify** — After status change, one-click WhatsApp message to customer
- 📞 **Offline Orders** — Create orders for phone-call customers with full product picker
- 🎯 **Delivery Target** — Daily aggregation by variant and by product (weight/piece aware)
- 📦 **Products** — Full CRUD with variant management, image URLs, tags
- 👥 **Clients** — Auto-tracked from orders, order history per client
- 📱 **Responsive** — Mobile sidebar with hamburger menu, scrollable tables

---

## 🛠️ Tech Stack

| Layer    | Technology                                 |
| -------- | ------------------------------------------ |
| Frontend | Next.js 14, Tailwind CSS v4, Framer Motion |
| State    | Zustand (cart + admin auth, localStorage)  |
| Backend  | Express.js 5, Mongoose 9                   |
| Database | MongoDB                                    |
| Auth     | JWT (admin only)                           |
| Checkout | WhatsApp API redirect                      |
| Icons    | @heroicons/react                           |

---

## 📖 Documentation

- **[Implementation](DOCS/IMPLEMENTATION.md)** — Detailed feature docs, API reference, DB schema
- **[Server README](server/README.md)** — Backend setup, API endpoints, order flow
- **[Client README](client/README.md)** — Frontend setup, pages, components, design system

---

## 🔮 Planned

- 🔔 WhatsApp Cloud API (auto-send status notifications)
- 🖼️ Product images (currently emoji placeholders)
- 🔍 Search functionality
- 💳 Payment gateway
