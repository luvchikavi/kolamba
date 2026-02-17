"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Clock,
  Plus,
  ChevronRight,
  Settings,
  Loader2,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { API_URL } from "@/lib/api";

interface AgentArtist {
  id: number;
  name_en: string;
  name_he: string;
  profile_image: string | null;
  city: string | null;
  country: string;
  status: string;
  created_at: string;
  pending_bookings: number;
  tour_dates_count: number;
}

interface AgentStats {
  total_artists: number;
  active_artists: number;
  pending_bookings: number;
  upcoming_tour_dates: number;
}

interface AgentBooking {
  id: number;
  artist_id: number;
  artist_name: string;
  location: string;
  requested_date: string;
  budget: number;
  status: string;
  created_at: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    inactive: "bg-slate-100 text-slate-600",
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

function ArtistCard({ artist }: { artist: AgentArtist }) {
  return (
    <div className="card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
          {artist.profile_image ? (
            <img
              src={artist.profile_image}
              alt={artist.name_en}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <span className="text-2xl font-bold text-primary-600">
              {artist.name_en[0]}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-slate-900 truncate">
              {artist.name_en}
            </h3>
            <StatusBadge status={artist.status} />
          </div>
          <div className="flex items-center gap-1 text-sm text-slate-500 mb-3">
            <MapPin size={14} />
            <span>{artist.city || "Location not set"}, {artist.country}</span>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1 text-slate-600">
              <Clock size={14} className="text-amber-500" />
              <span>{artist.pending_bookings} pending</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600">
              <Calendar size={14} className="text-violet-500" />
              <span>{artist.tour_dates_count} dates</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
        <Link
          href={`/talents/${artist.id}`}
          target="_blank"
          className="flex-1 px-3 py-2 text-sm text-center text-teal-600 hover:bg-teal-50 rounded-lg transition-colors inline-flex items-center justify-center gap-1"
        >
          View Profile
          <ExternalLink size={14} />
        </Link>
        <Link
          href={`/dashboard/talent?artist_id=${artist.id}`}
          className="flex-1 px-3 py-2 text-sm text-center text-primary-600 hover:bg-primary-50 rounded-lg transition-colors inline-flex items-center justify-center gap-1"
        >
          Manage
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: AgentBooking }) {
  const statusStyles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="card p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-medium text-slate-900">{booking.artist_name}</p>
          <p className="text-sm text-slate-500">{booking.location || "Location TBD"}</p>
        </div>
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusStyles[booking.status] || statusStyles.pending}`}>
          {booking.status}
        </span>
      </div>
      <div className="flex justify-between items-center text-sm text-slate-600">
        <span>
          {booking.requested_date
            ? new Date(booking.requested_date).toLocaleDateString()
            : "Date TBD"}
        </span>
        <span className="font-medium">${booking.budget?.toLocaleString() || 0}</span>
      </div>
    </div>
  );
}

export default function AgentDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [artists, setArtists] = useState<AgentArtist[]>([]);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [bookings, setBookings] = useState<AgentBooking[]>([]);
  const [activeTab, setActiveTab] = useState<"artists" | "bookings">("artists");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch stats, artists, and bookings in parallel
      const [statsRes, artistsRes, bookingsRes] = await Promise.all([
        fetch(`${API_URL}/agents/me/stats`, { headers }),
        fetch(`${API_URL}/agents/me/artists`, { headers }),
        fetch(`${API_URL}/agents/me/bookings`, { headers }),
      ]);

      if (statsRes.status === 401 || artistsRes.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (statsRes.status === 403 || artistsRes.status === 403) {
        // Not an agent, redirect to appropriate dashboard
        window.location.href = "/dashboard";
        return;
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (artistsRes.ok) {
        const artistsData = await artistsRes.json();
        setArtists(artistsData);
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container-default py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Agent Dashboard</h1>
              <p className="text-slate-500">Manage your talents and bookings</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/register/talent"
                className="btn-primary"
              >
                <Plus size={18} />
                Add New Talent
              </Link>
              <Link
                href="/dashboard/agent/settings"
                className="btn-secondary"
              >
                <Settings size={18} />
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container-default py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Users size={20} className="text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats?.total_artists || 0}</p>
                <p className="text-sm text-slate-500">Total Talents</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Users size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats?.active_artists || 0}</p>
                <p className="text-sm text-slate-500">Active Talents</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats?.pending_bookings || 0}</p>
                <p className="text-sm text-slate-500">Pending Bookings</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <Calendar size={20} className="text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats?.upcoming_tour_dates || 0}</p>
                <p className="text-sm text-slate-500">Upcoming Tour Dates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("artists")}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === "artists"
                ? "bg-primary-500 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            My Talents ({artists.length})
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === "bookings"
                ? "bg-primary-500 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Bookings ({bookings.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === "artists" && (
          <div className="space-y-6">
            {artists.length === 0 ? (
              <div className="card p-8 text-center">
                <Users size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  No Talents Yet
                </h3>
                <p className="text-slate-500 mb-6">
                  Start by adding your first talent to the platform.
                </p>
                <Link
                  href="/register/talent"
                  className="btn-primary mx-auto"
                >
                  <Plus size={18} />
                  Add Your First Talent
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="card p-8 text-center">
                <Calendar size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  No Bookings Yet
                </h3>
                <p className="text-slate-500">
                  When hosts send booking requests to your talents, they&apos;ll appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
