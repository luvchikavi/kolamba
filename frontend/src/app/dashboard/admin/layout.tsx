"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Music,
  Building2,
  ChevronRight,
} from "lucide-react";

const sidebarLinks = [
  {
    href: "/dashboard/admin",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/admin/users",
    label: "Users",
    icon: Users,
  },
  {
    href: "/dashboard/admin/artists",
    label: "Artists",
    icon: Music,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-5rem)] bg-white border-r border-slate-100 p-4 hidden md:block">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Admin Dashboard</h2>
            <p className="text-sm text-slate-500">Manage Kolamba</p>
          </div>
          <nav className="space-y-1">
            {sidebarLinks.map((link) => {
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
                href="/dashboard/artist"
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <Music size={16} />
                Artist Dashboard
              </Link>
              <Link
                href="/dashboard/community"
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                <Building2 size={16} />
                Community Dashboard
              </Link>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          {/* Mobile nav */}
          <div className="md:hidden bg-white border-b border-slate-100 p-4">
            <div className="flex gap-2 overflow-x-auto">
              {sidebarLinks.map((link) => {
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
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
