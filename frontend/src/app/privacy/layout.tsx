import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Kolamba Privacy Policy. Learn how we collect, use, and protect your personal information.",
  openGraph: {
    title: "Privacy Policy | Kolamba",
    description: "Kolamba Privacy Policy",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
