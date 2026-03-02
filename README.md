# 🍬 Sampoornam Foods

Premium South Indian Sweets & Namkeens — E-Commerce Platform

> A full-stack delivery app with WhatsApp-based checkout. No payment gateway, no sign-up required.

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
# Edit server/.env with your MongoDB URI

# 4. Seed the database (one-time)
cd server && npm run seed

# 5. Start both servers
cd server && npm run dev    # Backend on :5000
cd client && npm run dev    # Frontend on :7000
```

Open **http://localhost:7000** to view the app.

---

## 📁 Project Structure

```
Sampoornam/
├── client/              # Next.js 14 frontend (port 7000)
│   ├── app/             # Pages and components
│   ├── lib/             # API client
│   ├── stores/          # Zustand cart store
│   └── public/          # Images and assets
├── server/              # Express.js backend (port 5000)
│   ├── models/          # Mongoose schemas (Product, Order)
│   ├── routes/          # API routes (products, orders, admin)
│   ├── middleware/       # JWT auth
│   ├── utils/           # WhatsApp message formatter
│   └── seed.js          # Database seeder
└── DOCS/                # PRD, prompts, and implementation docs
```

---

## ✅ Current Status

### Implemented
- 🛍️ **Product catalog** — 27 products (16 sweets, 11 namkeens) with weight/piece variants
- 🛒 **Cart system** — Zustand store, slide-out CartDrawer, quantity controls
- 📱 **WhatsApp checkout** — Orders sent as formatted messages to admin
- 📋 **Order tracking** — Lookup by phone number, status badges, cancel support
- 🧭 **Navigation** — Desktop dropdown + mobile bottom bar (Home, Shop, Cart, Orders)
- 🎨 **Premium dark theme** — Gold accents, Playfair Display typography, responsive design
- 🔐 **Admin API** — JWT-protected endpoints for product CRUD and order management

### Not Yet Implemented
- 🖥️ Admin dashboard UI
- 🖼️ Product images (currently placeholders)
- 🔍 Search functionality
- 💳 Payment gateway
- 📧 Order notifications

---

## 🛠️ Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | Next.js 14, Tailwind CSS v4, Framer Motion |
| State      | Zustand (persisted to localStorage)      |
| Backend    | Express.js 5, Mongoose 9                |
| Database   | MongoDB                                  |
| Auth       | JWT (admin only)                         |
| Checkout   | WhatsApp Business API                    |

---

## 📖 Documentation

- **[PRD](DOCS/sampoornam%20PRD.txt)** — Original product requirements
- **[Implementation](DOCS/IMPLEMENTATION.md)** — Detailed feature documentation
- **[Server README](server/README.md)** — Backend setup, API reference
- **[Client README](client/README.md)** — Frontend setup, components, design system
