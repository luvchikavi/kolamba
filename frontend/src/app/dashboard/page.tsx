"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { API_URL } from "@/lib/api";

export default function DashboardIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const redirect = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          router.replace("/login");
          return;
        }

        const user = await res.json();
        if (user.is_superuser) {
          router.replace("/dashboard/host");
        } else if (user.role === "artist") {
          router.replace("/dashboard/talent");
        } else if (user.role === "agent") {
          router.replace("/dashboard/agent");
        } else if (user.role === "community") {
          router.replace("/dashboard/host");
        } else {
          router.replace("/");
        }
      } catch {
        router.replace("/login");
      }
    };

    redirect();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
    </div>
  );
}
