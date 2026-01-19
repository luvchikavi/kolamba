import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kolamba - מקשרים אמנים ישראלים לקהילות יהודיות",
  description:
    "פלטפורמת Marketplace לסיורי אמנים ישראלים בקהילות יהודיות ברחבי העולם",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={inter.className}>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
