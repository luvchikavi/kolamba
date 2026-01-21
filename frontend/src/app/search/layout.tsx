import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Artists",
  description: "Search and filter artists by category, price, language, and more. Find the perfect performer for your Jewish community event.",
  openGraph: {
    title: "Search Artists | Kolamba",
    description: "Search and filter artists for your community events",
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
