import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse by Category",
  description: "Explore artists by category: Music, Dance, Theater, Lectures, Workshops, Comedy, Film, and Visual Arts. Find the perfect performer for your community event.",
  openGraph: {
    title: "Browse by Category | Kolamba",
    description: "Explore artists by category for your community events",
  },
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
