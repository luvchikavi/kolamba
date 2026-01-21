import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "Join Kolamba as an artist or community. Connect with Jewish communities worldwide and book cultural performances.",
  openGraph: {
    title: "Register | Kolamba",
    description: "Join Kolamba as an artist or community",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
