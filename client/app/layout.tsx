import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sampoornam Foods — Premium South Indian Sweets & Namkeens",
  description:
    "Order authentic South Indian sweets and namkeens crafted with pure desi ghee. Experience the taste of tradition, delivered to your doorstep. Lucknow's finest cloud kitchen.",
  keywords: [
    "Sampoornam Foods",
    "South Indian sweets",
    "namkeens",
    "cloud kitchen",
    "Lucknow",
    "pure desi ghee",
    "Kaju Barfi",
    "Gulab Jamun",
  ],
  openGraph: {
    title: "Sampoornam Foods — Premium South Indian Sweets & Namkeens",
    description:
      "Authentic South Indian sweets & namkeens made with pure desi ghee. Order now via WhatsApp.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
