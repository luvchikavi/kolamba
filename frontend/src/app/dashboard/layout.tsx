"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, Home, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/api";

interface UserInfo {
  id: number;
  email: string;
  name: string | null;
  role: string;
  is_superuser: boolean;
}

const ROLE_TO_DASHBOARD: Record<string, string> = {
  community: "/dashboard/host",
  artist: "/dashboard/talent",
  agent: "/dashboard/agent",
};

function getRoleBadge(user: UserInfo) {
  if (user.is_superuser) return { label: "Admin", color: "bg-purple-100 text-purple-700" };
  if (user.role === "community") return { label: "Host", color: "bg-green-100 text-green-700" };
  if (user.role === "artist") return { label: "Talent", color: "bg-blue-100 text-blue-700" };
  if (user.role === "agent") return { label: "Agent", color: "bg-orange-100 text-orange-700" };
  return { label: user.role, color: "bg-slate-100 text-slate-700" };
}

function getDashboardSegment(pathname: string): string | null {
  const match = pathname.match(/^\/dashboard\/(host|talent|admin|agent)/);
  return match ? match[1] : null;
}

function canAccessDashboard(segment: string, user: UserInfo): boolean {
  if (user.is_superuser) return true;
  switch (segment) {
    case "host": return user.role === "community";
    case "talent": return user.role === "artist";
    case "admin": return false;
    case "agent": return user.role === "agent";
    default: return false;
  }
}

function getCorrectDashboard(user: UserInfo): string {
  if (user.is_superuser) return "/dashboard/host";
  return ROLE_TO_DASHBOARD[user.role] || "/";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        let res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          // Try refreshing the token
          const refreshToken = localStorage.getItem("refresh_token");
          if (refreshToken) {
            const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh_token: refreshToken }),
            });
            if (refreshRes.ok) {
              const tokens = await refreshRes.json();
              localStorage.setItem("access_token", tokens.access_token);
              localStorage.setItem("refresh_token", tokens.refresh_token);
              res = await fetch(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${tokens.access_token}` },
              });
            }
          }
          if (!res.ok) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            router.replace("/login");
            return;
          }
        }

        const userData: UserInfo = await res.json();
        setUser(userData);

        // Role validation
        const segment = getDashboardSegment(pathname);
        if (segment && !canAccessDashboard(segment, userData)) {
          router.replace(getCorrectDashboard(userData));
        }
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  const handleSignOut = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("admin_access_token");
    localStorage.removeItem("admin_refresh_token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!user) return null;

  const badge = getRoleBadge(user);

  return (
    <>
      {/* Shared auth bar */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-white border-b border-slate-200 z-[100] flex items-center justify-between px-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-slate-900 truncate">
            {user.name || user.email}
          </span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap ${badge.color}`}
          >
            {badge.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-700 transition-colors"
            title="Home"
          >
            <Home size={18} />
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
      {/* Spacer for the fixed bar */}
      <div className="h-12" />
      {children}
    </>
  );
}
