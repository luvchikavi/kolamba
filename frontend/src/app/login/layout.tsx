import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Kolamba account to manage bookings, connect with artists, and coordinate community events.",
  openGraph: {
    title: "Sign In | Kolamba",
    description: "Sign in to your Kolamba account",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
