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
  CalendarCheck,
  FileText,
  MapPin,
  Plane,
} from "lucide-react";
import { API_URL } from "@/lib/api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface AnalyticsData {
  monthly_growth: { month: string; users: number; artists: number; communities: number; bookings: number }[];
  category_breakdown: { name: string; count: number }[];
  booking_status: { name: string; count: number }[];
}

const CHART_COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b", "#6366f1"];

interface Stats {
  total_users: number;
  total_artists: number;
  total_communities: number;
  pending_artists: number;
  active_artists: number;
  active_communities: number;
  total_bookings: number;
  pending_bookings: number;
  total_tour_dates: number;
  upcoming_tour_dates: number;
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

interface RecentBooking {
  id: number;
  artist_id: number;
  artist_name: string;
  community_id: number;
  community_name: string;
  requested_date: string | null;
  location: string | null;
  status: string;
  created_at: string;
}

interface RecentTourDate {
  id: number;
  artist_id: number;
  artist_name: string;
  location: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  is_booked: boolean;
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
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [recentTourDates, setRecentTourDates] = useState<RecentTourDate[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
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

      const headers = { Authorization: `Bearer ${token}` };

      // Check if user is superuser
      const meRes = await fetch(`${API_URL}/auth/me`, { headers });
      if (!meRes.ok) {
        router.push("/login");
        return;
      }
      const me = await meRes.json();
      if (!me.is_superuser) {
        router.push("/");
        return;
      }

      // Fetch stats, recent users, pending artists, bookings, tour dates, and analytics in parallel
      const [statsRes, usersRes, artistsRes, bookingsRes, tourDatesRes, analyticsRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers }),
        fetch(`${API_URL}/admin/users?limit=5`, { headers }),
        fetch(`${API_URL}/admin/artists?status=pending&limit=5`, { headers }),
        fetch(`${API_URL}/admin/bookings?limit=5`, { headers }),
        fetch(`${API_URL}/admin/tour-dates?limit=5`, { headers }),
        fetch(`${API_URL}/admin/analytics`, { headers }),
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

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setRecentBookings(bookingsData);
      }

      if (tourDatesRes.ok) {
        const tourDatesData = await tourDatesRes.json();
        setRecentTourDates(tourDatesData);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
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

      const response = await fetch(
        `${API_URL}/admin/artists/${artistId}/status?status=active`,
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats?.total_users || 0}
          icon={Users}
          color="bg-blue-500"
          href="/dashboard/admin/users"
        />
        <StatCard
          title="Total Talents"
          value={stats?.total_artists || 0}
          icon={Music}
          color="bg-violet-500"
          href="/dashboard/admin/talents"
        />
        <StatCard
          title="Hosts"
          value={stats?.total_communities || 0}
          icon={Building2}
          color="bg-emerald-500"
        />
        <StatCard
          title="Pending Talents"
          value={stats?.pending_artists || 0}
          icon={Clock}
          color="bg-amber-500"
          href="/dashboard/admin/talents?status=pending"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Bookings"
          value={stats?.total_bookings || 0}
          icon={CalendarCheck}
          color="bg-pink-500"
        />
        <StatCard
          title="Pending Bookings"
          value={stats?.pending_bookings || 0}
          icon={FileText}
          color="bg-orange-500"
        />
        <StatCard
          title="Total Tour Dates"
          value={stats?.total_tour_dates || 0}
          icon={MapPin}
          color="bg-cyan-500"
        />
        <StatCard
          title="Upcoming Tours"
          value={stats?.upcoming_tour_dates || 0}
          icon={Plane}
          color="bg-indigo-500"
        />
      </div>

      {/* Analytics Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Growth Over Time */}
          <div className="card p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Platform Growth</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={analytics.monthly_growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Users" />
                <Line type="monotone" dataKey="artists" stroke="#8b5cf6" strokeWidth={2} name="Talents" />
                <Line type="monotone" dataKey="communities" stroke="#10b981" strokeWidth={2} name="Hosts" />
                <Line type="monotone" dataKey="bookings" stroke="#f97316" strokeWidth={2} name="Bookings" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Booking Status Breakdown */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Booking Status</h2>
            {analytics.booking_status.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={analytics.booking_status}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {analytics.booking_status.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-center py-12">No booking data yet</p>
            )}
          </div>

          {/* Category Breakdown */}
          {analytics.category_breakdown.length > 0 && (
            <div className="card p-6 lg:col-span-3">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Talents by Category</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.category_breakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Talents" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
        {/* Pending Artists */}
        <div className="card">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Pending Talent Approvals</h2>
              <Link
                href="/dashboard/admin/talents?status=pending"
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
                      {artist.name_en || "Unnamed Talent"}
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

        {/* Recent Bookings */}
        <div className="card">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Recent Bookings</h2>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {recentBookings.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <CalendarCheck size={32} className="text-slate-300 mx-auto mb-2" />
                <p>No bookings yet</p>
              </div>
            ) : (
              recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 truncate">
                        {booking.artist_name}
                      </p>
                      <p className="text-sm text-slate-500 truncate">
                        {booking.community_name}
                      </p>
                      {booking.requested_date && (
                        <p className="text-xs text-slate-400">
                          {new Date(booking.requested_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span
                      className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${
                        booking.status === "confirmed"
                          ? "bg-emerald-100 text-emerald-700"
                          : booking.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : booking.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Tour Dates */}
        <div className="card">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Upcoming Tour Dates</h2>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {recentTourDates.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <MapPin size={32} className="text-slate-300 mx-auto mb-2" />
                <p>No upcoming tour dates</p>
              </div>
            ) : (
              recentTourDates.map((tourDate) => (
                <Link
                  key={tourDate.id}
                  href={`/talents/${tourDate.artist_id}`}
                  className="p-4 hover:bg-slate-50 transition-colors block"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 truncate">
                        {tourDate.artist_name}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <MapPin size={12} />
                        <span className="truncate">{tourDate.location}</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {new Date(tourDate.start_date).toLocaleDateString()}
                        {tourDate.end_date && ` - ${new Date(tourDate.end_date).toLocaleDateString()}`}
                      </p>
                    </div>
                    {tourDate.is_booked && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                        Booked
                      </span>
                    )}
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
