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

| Technology          | Purpose                                |
|---------------------|----------------------------------------|
| Next.js 14          | React framework with App Router, SSR   |
| Tailwind CSS v4     | Utility-first styling                  |
| Framer Motion       | Page transitions, animations           |
| Zustand             | Cart state management + persistence     |
| @heroicons/react    | Icon library                           |

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
│   └── components/
│       ├── AppHeader.tsx           # Desktop navigation header
│       ├── BottomNav.tsx           # Mobile bottom navigation
│       ├── HeroBanner.tsx          # Hero section (mobile + desktop)
│       ├── TrustBadges.tsx         # Trust signals section
│       ├── SignatureCollections.tsx # Sweets/Namkeens showcase cards
│       ├── Footer.tsx              # Site footer
│       ├── ProductCard.tsx         # Product card with variants
│       └── CartDrawer.tsx          # Slide-out cart + checkout
├── lib/
│   └── api.ts                      # Typed API client
├── stores/
│   └── cartStore.ts                # Zustand cart store
└── public/
    ├── main.png                    # Desktop hero image
    ├── MUI.png                     # Mobile hero image
    ├── Sweets.png                  # Sweets collection image
    └── Namkeens.png                # Namkeens collection image
```

## Pages

| Route                     | Description                              |
|---------------------------|------------------------------------------|
| `/`                       | Homepage — hero, trust badges, collections |
| `/shop`                   | Product catalog with category tabs         |
| `/shop?category=sweets`   | Filtered to sweets only                    |
| `/shop?category=namkeens` | Filtered to namkeens only                  |
| `/orders`                 | Order tracking by phone number             |

## Key Components

### Navigation
- **AppHeader** — Desktop: Home, Shop (dropdown → Sweets/Namkeens), Orders, Cart icon
- **BottomNav** — Mobile: Home, Shop (slide-up menu), Cart, Orders

### Cart System
- **cartStore.ts** — Zustand store with `addItem`, `removeItem`, `updateQuantity`, `clearCart`
- **CartDrawer.tsx** — Slide-out panel with checkout form (name, phone, address)
- Cart persists to `localStorage` under key `sampoornam-cart`

### Checkout Flow
1. User clicks "Proceed to Checkout" in CartDrawer
2. Fills in: Name, Mobile Number, Delivery Address, Notes
3. Clicks "Place Order via WhatsApp"
4. Frontend calls `POST /api/orders` → server validates and creates order
5. Server returns WhatsApp URL → frontend opens it in new tab
6. Order confirmation via WhatsApp to admin

## Design System

- **Background:** `#0a0a0a` (deep black)
- **Gold accent:** `#D4AF37` (metallic gold)
- **Namkeens accent:** `#F3CA52` (warm mustard)
- **Headings:** Playfair Display (serif)
- **Body text:** Inter (sans-serif)
- **Layout:** `max-w-7xl` with responsive horizontal padding
