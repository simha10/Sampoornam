"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PWARegister() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => console.log("SW registered: ", registration.scope))
          .catch((error) => console.error("SW registration failed: ", error));
      }

      const matchMedia = window.matchMedia("(display-mode: standalone)");
      if (matchMedia.matches) {
        setIsInstalled(true);
      }

      const checkAndShowPrompt = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        
        const dismissed = localStorage.getItem("pwaInstallDismissed");
        if (!dismissed && !isInstalled) {
          setTimeout(() => {
            setShowPrompt(true);
          }, 7000); // 7 second delay
        }
      };

      window.addEventListener("beforeinstallprompt", checkAndShowPrompt);

      const handleAppInstalled = () => {
        setIsInstalled(true);
        setShowPrompt(false);
      };

      window.addEventListener("appinstalled", handleAppInstalled);

      return () => {
        window.removeEventListener("beforeinstallprompt", checkAndShowPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }
  }, [isInstalled]);

  if (!showPrompt) return null;

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setShowPrompt(false);
      });
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("pwaInstallDismissed", "true");
    setShowPrompt(false);
  };

  const isAdmin = pathname.startsWith("/admin");

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-sm rounded-[24px] bg-[#0a0a0a] border border-white/10 p-6 text-white shadow-2xl">
        <h3 className="mb-3 text-[22px] font-bold font-(family-name:--font-playfair)">
          {isAdmin ? "Sampoornam Kitchen for Admin" : "Sampoornam Foods"}
        </h3>
        <p className="mb-8 text-[15px] leading-relaxed text-white/60">
          {isAdmin
            ? "Install the kitchen dashboard for faster order management and instant updates."
            : "Install our app for faster ordering, quick reorders, and easy access to premium food collection."}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleInstall}
            className="w-full rounded-xl bg-brand-gold py-3.5 text-sm font-semibold text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isAdmin ? "Install Admin App" : "Install App"}
          </button>
          <button
            onClick={handleDismiss}
            className="w-full rounded-xl py-3.5 text-sm font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white"
          >
            {isAdmin ? "Later" : "Not Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
