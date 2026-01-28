"use client";

import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Hide the global header and footer on dashboard pages
    const header = document.querySelector("body > div > div > header");
    const footer = document.querySelector("body > div > div > footer");

    if (header) (header as HTMLElement).style.display = "none";
    if (footer) (footer as HTMLElement).style.display = "none";

    return () => {
      // Restore when leaving dashboard
      if (header) (header as HTMLElement).style.display = "";
      if (footer) (footer as HTMLElement).style.display = "";
    };
  }, []);

  return <>{children}</>;
}
