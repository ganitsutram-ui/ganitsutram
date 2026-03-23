/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

import type { Metadata } from "next";
import { Cinzel, Cinzel_Decorative, Cormorant_Garamond, Noto_Serif_Devanagari, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/context/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SecurityWatermark from "@/components/SecurityWatermark";

const cinzel = Cinzel({
  variable: "--font-heading",
  subsets: ["latin"],
});

const cinzelDecorative = Cinzel_Decorative({
  weight: ["400", "700", "900"],
  variable: "--font-display",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "700"],
  variable: "--font-body",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const notoDevanagari = Noto_Serif_Devanagari({
  weight: ["300", "400", "700"],
  variable: "--font-ancient",
  subsets: ["devanagari", "latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-ui",
  subsets: ["latin"],
});

import AuthModal from "@/components/AuthModal";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  metadataBase: new URL("https://ganitsutram.com"),
  title: {
    template: "%s | GaṇitSūtram",
    default: "GaṇitSūtram - Ancient Vedic Mathematics Learning Portal",
  },
  description: "Master Vedic Mathematics with GaṇitSūtram. Discover ancient sutras, interactive solvers, and a cosmic visual knowledge map for rapid mental calculation.",
  keywords: ["Vedic Mathematics", "Vedic Maths", "GanitSutram", "Mental Math", "Indian Mathematics", "Sutras", "Speed Calculation"],
  authors: [{ name: "Jawahar R Mallah", url: "https://www.aitdl.com" }],
  creator: "AITDL Network",
  publisher: "AITDL Network",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "GaṇitSūtram - Vedic Mathematics Learning Portal",
    description: "Master Vedic Mathematics with GaṇitSūtram. Discover ancient sutras, interactive solvers, and a cosmic visual knowledge map.",
    url: "https://ganitsutram.com",
    siteName: "GaṇitSūtram",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GaṇitSūtram Vedic Mathematics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GaṇitSūtram - Vedic Science of Numbers",
    description: "Discover the power of mental mathematics through ancient Indian wisdom.",
    creator: "@aitdlnetwork",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${cinzelDecorative.variable} ${cormorant.variable} ${notoDevanagari.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
            <JsonLd />
            <Navbar />
            <AuthModal />
            <div id="gs-main-layout">
                {children}
            </div>
            <Footer />
            <SecurityWatermark />
        </Providers>
      </body>
    </html>
  );
}
