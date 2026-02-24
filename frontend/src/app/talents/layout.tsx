import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Talents",
  description: "Discover talented Israeli artists for your community events. Musicians, performers, lecturers, and workshop facilitators available for bookings worldwide.",
  openGraph: {
    title: "Browse Talents | Kolamba",
    description: "Discover talented Israeli artists for your community events",
  },
};

export default function ArtistsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
