import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upcoming Tours | Kolamba",
  description: "Discover talented artists touring near your community. Browse upcoming tour dates and opportunities.",
  openGraph: {
    title: "Upcoming Tours | Kolamba",
    description: "Discover talented artists touring near your community.",
  },
};

export default function ToursLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
