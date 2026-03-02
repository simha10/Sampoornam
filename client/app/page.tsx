import AppHeader from "./components/AppHeader";
import BottomNav from "./components/BottomNav";
import HeroBanner from "./components/HeroBanner";
import TrustBadges from "./components/TrustBadges";
import SignatureCollections from "./components/SignatureCollections";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Top Header (Sticky) */}
      <AppHeader />

      {/* Cart Drawer (Slide-out) */}
      <CartDrawer />

      {/* Hero Banner (A Feast for the Senses) */}
      <HeroBanner />

      {/* Trust & Highlights */}
      <TrustBadges />

      {/* Categories (Sweets & Namkeens) */}
      <SignatureCollections />

      {/* App-style Footer */}
      <Footer />

      {/* Mobile Bottom Navigation (Fixed) */}
      <BottomNav />
    </main>
  );
}
