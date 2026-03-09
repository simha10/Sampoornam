# Sampoornam Client — Frontend

Next.js 14 (App Router) frontend for the Sampoornam Foods e-commerce platform.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs on **http://localhost:7000** by default.

> **Note:** The backend server must be running on port 5000 for product data and orders to work. See `/server/README.md`.

## Tech Stack

| Technology       | Purpose                              |
| ---------------- | ------------------------------------ |
| Next.js 14       | React framework with App Router, SSR |
| Tailwind CSS v4  | Utility-first styling                |
| Framer Motion    | Page transitions, animations         |
| Zustand          | Cart + admin auth state management   |
| @heroicons/react | Icon library                         |

## Project Structure

```
client/
├── app/
│   ├── layout.tsx                  # Root layout (fonts, global styles)
│   ├── page.tsx                    # Home page
│   ├── globals.css                 # Tailwind + design tokens
│   ├── shop/
│   │   └── page.tsx                # Product catalog (/shop)
│   ├── orders/
│   │   └── page.tsx                # Order tracking (/orders)
│   ├── admin/
│   │   ├── layout.tsx              # Admin layout (sidebar + mobile nav)
│   │   ├── login/page.tsx          # Admin login
│   │   ├── page.tsx                # Dashboard (stats overview)
│   │   ├── orders/
│   │   │   ├── page.tsx            # Order management
│   │   │   └── OfflineOrderModal.tsx  # Add offline order modal
│   │   ├── products/page.tsx       # Product CRUD
│   │   ├── requirements/page.tsx   # Delivery target (daily aggregation)
│   │   └── clients/page.tsx        # Client list + order history
│   └── components/
│       ├── AppHeader.tsx           # Desktop navigation header
│       ├── BottomNav.tsx           # Mobile bottom navigation
│       ├── HeroBanner.tsx          # Hero section (mobile + desktop)
│       ├── TrustBadges.tsx         # Trust signals section
│       ├── SignatureCollections.tsx # Sweets/Namkeens showcase cards
│       ├── Footer.tsx              # Site footer
│       ├── ProductCard.tsx         # Product card with variants
│       └── CartDrawer.tsx          # Slide-out cart + checkout + success
├── lib/
│   └── api.ts                      # Typed API client (public + admin)
├── stores/
│   ├── cartStore.ts                # Zustand cart store (localStorage)
│   └── adminStore.ts               # Zustand admin auth store
└── public/
    ├── main.png                    # Desktop hero image
    ├── MUI.png                     # Mobile hero image
    ├── Sweets.png                  # Sweets collection image
    └── Namkeens.png                # Namkeens collection image
```

## Pages

### Customer-Facing

| Route                     | Description                                     |
| ------------------------- | ----------------------------------------------- |
| `/`                       | Homepage — hero, trust badges, collections      |
| `/shop`                   | Product catalog with category tabs              |
| `/shop?category=sweets`   | Filtered to sweets only                         |
| `/shop?category=namkeens` | Filtered to namkeens only                       |
| `/orders`                 | Order tracking — expandable cards with timeline |

### Admin Dashboard

| Route                 | Description                                        |
| --------------------- | -------------------------------------------------- |
| `/admin/login`        | Admin login (phone + password)                     |
| `/admin`              | Dashboard — stats overview (orders, revenue, etc.) |
| `/admin/orders`       | Order list — status management, print, offline add |
| `/admin/products`     | Product CRUD — variants, images, tags              |
| `/admin/requirements` | Delivery target — daily by variant / by product    |
| `/admin/clients`      | Client list — auto-tracked, order history          |

## Key Features

### Cart & Checkout

- **cartStore.ts** — Zustand store with `addItem`, `removeItem`, `updateQuantity`, `clearCart`
- **CartDrawer.tsx** — Slide-out panel with checkout form (name, phone, address, delivery date/time)
- Cart persists to `localStorage` under key `sampoornam-cart`
- **Order Success** — Animated green checkmark + "Send WhatsApp Reminder" button

### Customer Order Tracking

- Expandable order cards — click to reveal item breakdown, delivery info, status timeline
- Color-coded status badges with timestamps
- Cancel active orders

### Admin Order Management

- **Status sequence enforcement** — `Ordered → Confirmed → Preparing → Out for Delivery → Delivered`
- **Confirmation modal** — shown for every status change with "from → to" badge preview
- **Secret key protection** — backward status changes require admin phone number
- **Timeline cleanup** — backward changes remove incorrect entries from history
- **WhatsApp notify** — after status update, modal offers one-click WhatsApp message to customer
- **Offline orders** — create orders for phone-call customers with product picker and client auto-fill

### Delivery Target

- Toggle between "By Variant" (individual SKUs) and "By Product" (aggregated)
- Weight-aware: products with `pricingType: "weight"` show in grams/kg, `"piece"` show in pcs
- Summary boxes: total orders, to prepare, dispatched
- CSV export and date picker

### Responsive Design

- Mobile bottom navigation with slide-up shop menu
- Admin sidebar collapses to hamburger menu on mobile
- Tables use horizontal scroll with `overflow-x-auto` on small screens
- Modals stack to single-column layout on mobile

## Design System

- **Background:** `#0a0a0a` (deep black)
- **Gold accent:** `#D4AF37` (metallic gold, `brand-gold`)
- **Namkeens accent:** `#F3CA52` (warm mustard)
- **Headings:** Playfair Display (serif)
- **Body text:** Inter (sans-serif)
- **Layout:** `max-w-7xl` with responsive horizontal padding
