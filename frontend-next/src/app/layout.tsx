import type { Metadata } from "next";
import { Cinzel, Cinzel_Decorative, Cormorant_Garamond, Noto_Serif_Devanagari, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/context/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

export const metadata: Metadata = {
  title: {
    template: "%s | GaṇitSūtram",
    default: "GaṇitSūtram - Vedic Mathematics Learning Portal",
  },
  description: "Learn Vedic Mathematics through interactive solvers and detailed modules.",
  openGraph: {
    title: "GaṇitSūtram",
    description: "Learn Vedic Mathematics through interactive solvers and detailed modules.",
    url: "https://ganitsutram.com",
    siteName: "GaṇitSūtram",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GaṇitSūtram",
    description: "Learn Vedic Mathematics through interactive solvers and detailed modules.",
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
            <Navbar />
            <AuthModal />
            {children}
            <Footer />
        </Providers>
      </body>
    </html>
  );
}
