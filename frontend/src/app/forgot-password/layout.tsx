import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your Kolamba account password. Enter your email to receive a password reset link.",
  openGraph: {
    title: "Reset Password | Kolamba",
    description: "Reset your Kolamba account password",
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
