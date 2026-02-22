import type { Metadata } from "next";
import { Inter, Frank_Ruhl_Libre } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Providers from "@/lib/providers";
import WelcomeModal from "@/components/modals/WelcomeModal";
import { Toaster } from "@/components/ui/Toaster";
import UserSwitcher from "@/components/layout/UserSwitcher";

// Body font - using Inter as fallback until Almoni is added
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Headings/Logo font - Frank Ruhl Libre (free from Google Fonts)
const frankRuhlLibre = Frank_Ruhl_Libre({
  subsets: ["latin", "hebrew"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-frank-ruhl",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kolamba.vercel.app"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.png", sizes: "any" },
    ],
    apple: "/favicon.png",
  },
  title: {
    default: "Kolamba - The Jewish Culture Club",
    template: "%s | Kolamba",
  },
  description: "All the world's a stage. Connecting Israeli artists with Jewish communities worldwide. Book performances, workshops, lectures, and cultural events.",
  keywords: [
    "Jewish artists",
    "Jewish communities",
    "Israeli performers",
    "cultural events",
    "Jewish culture",
    "performances",
    "workshops",
    "lectures",
    "music",
    "theater",
    "dance",
  ],
  authors: [{ name: "Kolamba" }],
  creator: "Kolamba",
  publisher: "Kolamba",
  openGraph: {
    title: "Kolamba - The Jewish Culture Club",
    description: "All the world's a stage. Connecting Israeli artists with Jewish communities worldwide.",
    url: "https://kolamba.vercel.app",
    siteName: "Kolamba",
    locale: "en_US",
    type: "website",
    images: [{ url: "/kolamba_logo.png", width: 512, height: 512, alt: "Kolamba logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kolamba - The Jewish Culture Club",
    description: "Connecting Israeli artists with Jewish communities worldwide",
    images: ["/kolamba_logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${frankRuhlLibre.variable}`}>
      <body className="font-sans">
        <Providers>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-coral-600">
            Skip to main content
          </a>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
          </div>
          <WelcomeModal />
          <Toaster />
          <UserSwitcher />
        </Providers>
      </body>
    </html>
  );
}
