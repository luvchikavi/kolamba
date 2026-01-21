import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Kolamba Terms of Service. Read our terms and conditions for using the platform.",
  openGraph: {
    title: "Terms of Service | Kolamba",
    description: "Kolamba Terms of Service",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
