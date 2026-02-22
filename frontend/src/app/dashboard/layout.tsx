"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  Home,
  Loader2,
  LayoutDashboard,
  Users,
  Music,
  Building2,
  ChevronRight,
} from "lucide-react";
import { API_URL } from "@/lib/api";

interface UserInfo {
  id: number;
  email: string;
  name: string | null;
  role: string;
  is_superuser: boolean;
  artist_id: number | null;
  community_id: number | null;
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
  if (user.is_superuser) return "/dashboard/admin";
  return ROLE_TO_DASHBOARD[user.role] || "/";
}

const adminSidebarLinks = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/users", label: "Users", icon: Users },
  { href: "/dashboard/admin/talents", label: "Talents", icon: Music },
];

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

        // Onboarding guard: redirect users without a profile
        if (!userData.is_superuser && !userData.community_id && !userData.artist_id) {
          router.replace("/onboarding");
          return;
        }

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
      {user.is_superuser ? (
        <div className="min-h-[calc(100vh-3rem)] bg-slate-50">
          <div className="flex">
            {/* Admin Sidebar */}
            <aside className="w-64 min-h-[calc(100vh-3rem)] bg-white border-r border-slate-100 p-4 hidden md:block">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">Admin Dashboard</h2>
                <p className="text-sm text-slate-500">Manage Kolamba</p>
              </div>
              <nav className="space-y-1">
                {adminSidebarLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-primary-50 text-primary-600"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{link.label}</span>
                      {isActive && <ChevronRight size={16} className="ml-auto" />}
                    </Link>
                  );
                })}
              </nav>
              {/* Quick Links */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  View As
                </h3>
                <div className="space-y-1">
                  <Link
                    href="/dashboard/talent"
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
                      pathname.startsWith("/dashboard/talent")
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Music size={16} />
                    Talent Dashboard
                  </Link>
                  <Link
                    href="/dashboard/host"
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
                      pathname.startsWith("/dashboard/host")
                        ? "bg-green-50 text-green-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Building2 size={16} />
                    Host Dashboard
                  </Link>
                </div>
              </div>
            </aside>
            {/* Main content */}
            <div className="flex-1">
              {/* Mobile nav */}
              <div className="md:hidden bg-white border-b border-slate-100 p-4">
                <div className="flex gap-2 overflow-x-auto">
                  {adminSidebarLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                          isActive
                            ? "bg-primary-500 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                  <Link
                    href="/dashboard/talent"
                    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                      pathname.startsWith("/dashboard/talent")
                        ? "bg-blue-500 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    Talent
                  </Link>
                  <Link
                    href="/dashboard/host"
                    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                      pathname.startsWith("/dashboard/host")
                        ? "bg-green-500 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    Host
                  </Link>
                </div>
              </div>
              {children}
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </>
  );
}
