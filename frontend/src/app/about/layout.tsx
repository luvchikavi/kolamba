import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Kolamba - The Jewish Culture Club. Our mission is to bridge the gap between talented Israeli artists and Jewish communities around the world.",
  openGraph: {
    title: "About Us | Kolamba",
    description: "Learn about Kolamba - The Jewish Culture Club",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
