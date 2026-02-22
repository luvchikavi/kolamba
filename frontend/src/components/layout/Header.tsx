"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, Search, User, LogOut, LayoutDashboard } from "lucide-react";
import { API_URL } from "@/lib/api";
import NotificationBell from "@/components/notifications/NotificationBell";

interface UserInfo {
  name: string | null;
  role: string;
  email: string;
  is_superuser?: boolean;
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Don't render header on dashboard pages (they have their own headers)
  const isDashboard = pathname?.startsWith("/dashboard");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check for logged-in user
    const token = localStorage.getItem("access_token");
    if (token) {
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setUser(data);
        })
        .catch(() => setUser(null));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    setShowUserMenu(false);
    router.push("/");
  };

  const getDashboardLink = () => {
    if (user?.role === "artist") return "/dashboard/talent";
    if (user?.role === "agent") return "/dashboard/agent";
    if (user?.role === "community") return "/dashboard/host";
    if (user?.is_superuser) return "/dashboard/host";
    return "/";
  };

  // Don't render on dashboard pages - they have their own headers
  if (isDashboard) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      {/* Floating pill header */}
      <div
        className={`transition-all duration-300 ${
          isScrolled
            ? "bg-white shadow-lg w-full max-w-none rounded-none -mt-4 pt-4"
            : "bg-white shadow-xl rounded-full max-w-xl"
        }`}
      >
        <div className={`flex justify-between items-center ${isScrolled ? "container-default h-16" : "h-14 px-6"}`}>
          {/* Left: Home */}
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
          >
            <span className="text-sm uppercase tracking-wide font-bold">KOLAMBA</span>
          </Link>

          {/* Center: Search */}
          <Link
            href="/search"
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
          >
            <Search size={18} />
            <span className="text-sm uppercase tracking-wide">Search</span>
          </Link>

          {/* Right: Notifications + User Menu or Sign In */}
          {user ? (
            <div className="flex items-center gap-1">
              <NotificationBell />
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
                aria-expanded={showUserMenu}
                aria-label="User menu"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-sm">
                    {(user.name || user.email)[0].toUpperCase()}
                  </span>
                </div>
                <span className="text-sm hidden sm:inline">
                  Hi, {user.name?.split(" ")[0] || "there"}
                </span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border border-slate-100 py-2 min-w-[180px] z-50">
                  <Link
                    href={getDashboardLink()}
                    className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Link
                href="/login"
                className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
              >
                <User size={18} />
                <span className="text-sm uppercase tracking-wide hidden sm:inline">Sign In</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu button - shown when scrolled */}
      {isScrolled && (
        <button
          className="md:hidden fixed top-4 right-4 p-2 rounded-lg bg-white shadow-lg text-slate-600 hover:bg-slate-100 z-50"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Mobile menu */}
      {isMenuOpen && (
        <div id="mobile-menu" className="md:hidden fixed top-20 left-4 right-4 bg-white rounded-2xl shadow-xl animate-fade-in-down z-40">
          <nav className="p-4 flex flex-col gap-1" aria-label="Mobile navigation">
            <Link
              href="/talents"
              className="px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Talents
            </Link>
            <Link
              href="/search"
              className="flex items-center gap-2 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Search size={18} />
              Search
            </Link>
            <hr className="my-2 border-slate-100" />
            <Link
              href="/login"
              className="px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
            <div className="flex flex-col gap-2 mt-2">
              <Link
                href="/register/host"
                className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-medium text-center transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Host Sign Up
              </Link>
              <Link
                href="/register/talent"
                className="px-4 py-3 border-2 border-slate-900 text-slate-900 hover:bg-slate-50 rounded-full font-medium text-center transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Talent Sign Up
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
