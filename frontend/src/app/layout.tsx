import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Providers from "@/lib/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kolamba - The Jewish Culture Club",
  description:
    "מקשרים אמנים ישראלים לקהילות יהודיות ברחבי העולם - פלטפורמת Marketplace לסיורי אמנים",
  keywords: ["Jewish artists", "Jewish communities", "Israeli performers", "cultural events"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${inter.className} bg-neutral-100`}>
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
