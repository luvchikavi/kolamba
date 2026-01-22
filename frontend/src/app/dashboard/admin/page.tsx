"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Music,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface Stats {
  total_users: number;
  total_artists: number;
  total_communities: number;
  pending_artists: number;
  active_artists: number;
  active_communities: number;
}

interface RecentUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
  status: string;
  created_at: string;
}

interface PendingArtist {
  id: number;
  name_en: string | null;
  email: string;
  city: string | null;
  created_at: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  href?: string;
}) {
  const content = (
    <div className="card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{title}</p>
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [pendingArtists, setPendingArtists] = useState<PendingArtist[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const headers = { Authorization: `Bearer ${token}` };

      // Check if user is superuser
      const meRes = await fetch(`${apiUrl}/api/auth/me`, { headers });
      if (!meRes.ok) {
        router.push("/login");
        return;
      }
      const me = await meRes.json();
      if (!me.is_superuser) {
        router.push("/");
        return;
      }

      // Fetch stats, recent users, and pending artists in parallel
      const [statsRes, usersRes, artistsRes] = await Promise.all([
        fetch(`${apiUrl}/api/admin/stats`, { headers }),
        fetch(`${apiUrl}/api/admin/users?limit=5`, { headers }),
        fetch(`${apiUrl}/api/admin/artists?status=pending&limit=5`, { headers }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setRecentUsers(usersData);
      }

      if (artistsRes.ok) {
        const artistsData = await artistsRes.json();
        setPendingArtists(artistsData);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveArtist = async (artistId: number) => {
    try {
      const token = localStorage.getItem("access_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const response = await fetch(
        `${apiUrl}/api/admin/artists/${artistId}/status?status=active`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setPendingArtists(pendingArtists.filter((a) => a.id !== artistId));
        if (stats) {
          setStats({
            ...stats,
            pending_artists: stats.pending_artists - 1,
            active_artists: stats.active_artists + 1,
          });
        }
      }
    } catch (err) {
      console.error("Failed to approve artist:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 size={40} className="animate-spin text-primary-500 mx-auto mb-4" />
            <p className="text-slate-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="card p-8 text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error</h2>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Admin Overview</h1>
        <p className="text-slate-500">Welcome to the Kolamba admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats?.total_users || 0}
          icon={Users}
          color="bg-blue-500"
          href="/dashboard/admin/users"
        />
        <StatCard
          title="Total Artists"
          value={stats?.total_artists || 0}
          icon={Music}
          color="bg-violet-500"
          href="/dashboard/admin/artists"
        />
        <StatCard
          title="Communities"
          value={stats?.total_communities || 0}
          icon={Building2}
          color="bg-emerald-500"
        />
        <StatCard
          title="Pending Approvals"
          value={stats?.pending_artists || 0}
          icon={Clock}
          color="bg-amber-500"
          href="/dashboard/admin/artists?status=pending"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Artists */}
        <div className="card">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Pending Artist Approvals</h2>
              <Link
                href="/dashboard/admin/artists?status=pending"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingArtists.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <CheckCircle size={32} className="text-emerald-500 mx-auto mb-2" />
                <p>No pending approvals</p>
              </div>
            ) : (
              pendingArtists.map((artist) => (
                <div key={artist.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">
                      {artist.name_en || "Unnamed Artist"}
                    </p>
                    <p className="text-sm text-slate-500">{artist.email}</p>
                    {artist.city && (
                      <p className="text-xs text-slate-400">{artist.city}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleApproveArtist(artist.id)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Approve
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="card">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Recent Users</h2>
              <Link
                href="/dashboard/admin/users"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {recentUsers.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <Users size={32} className="text-slate-300 mx-auto mb-2" />
                <p>No users yet</p>
              </div>
            ) : (
              recentUsers.map((user) => (
                <Link
                  key={user.id}
                  href={`/dashboard/admin/users?search=${encodeURIComponent(user.email)}`}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {user.name || user.email}
                    </p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        user.role === "admin"
                          ? "bg-violet-100 text-violet-700"
                          : user.role === "artist"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {user.role}
                    </span>
                    <ChevronRight size={16} className="text-slate-400" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
