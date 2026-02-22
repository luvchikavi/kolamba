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
  X,
  Check,
  Pencil,
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

interface ArtistProfileData {
  id: number;
  name_he: string;
  name_en: string | null;
  bio_he: string | null;
  bio_en: string | null;
  price_single: number | null;
  price_tour: number | null;
  city: string | null;
  country: string;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  youtube: string | null;
  facebook: string | null;
  categories: { id: number; name_en: string }[];
  subcategories: string[];
  status: string;
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

function ArtistCard({ artist, onEdit }: { artist: AgentArtist; onEdit: (id: number) => void }) {
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
        <button
          onClick={() => onEdit(artist.id)}
          className="flex-1 px-3 py-2 text-sm text-center text-primary-600 hover:bg-primary-50 rounded-lg transition-colors inline-flex items-center justify-center gap-1"
        >
          <Pencil size={14} />
          Edit Profile
        </button>
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

function EditArtistModal({
  artistId,
  onClose,
  onSaved,
}: {
  artistId: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ArtistProfileData | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_URL}/agents/me/artists/${artistId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setForm(data);
        }
      } catch (err) {
        console.error("Failed to fetch artist profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [artistId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/agents/me/artists/${artistId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name_en: form.name_en,
          name_he: form.name_he,
          bio_en: form.bio_en,
          bio_he: form.bio_he,
          price_single: form.price_single,
          price_tour: form.price_tour,
          city: form.city,
          country: form.country,
          phone: form.phone,
          website: form.website,
          instagram: form.instagram,
          youtube: form.youtube,
          facebook: form.facebook,
        }),
      });
      if (res.ok) {
        onSaved();
        onClose();
      }
    } catch (err) {
      console.error("Failed to save artist profile:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Edit Talent Profile
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-primary-500" />
          </div>
        ) : profile ? (
          <>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name (EN)</label>
                  <input
                    type="text"
                    value={(form.name_en as string) || ""}
                    onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name (HE)</label>
                  <input
                    type="text"
                    value={(form.name_he as string) || ""}
                    onChange={(e) => setForm({ ...form, name_he: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bio (EN)</label>
                <textarea
                  value={(form.bio_en as string) || ""}
                  onChange={(e) => setForm({ ...form, bio_en: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bio (HE)</label>
                <textarea
                  value={(form.bio_he as string) || ""}
                  onChange={(e) => setForm({ ...form, bio_he: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={(form.city as string) || ""}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={(form.country as string) || ""}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price (Single Show)</label>
                  <input
                    type="number"
                    value={(form.price_single as number) ?? ""}
                    onChange={(e) => setForm({ ...form, price_single: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price (Tour)</label>
                  <input
                    type="number"
                    value={(form.price_tour as number) ?? ""}
                    onChange={(e) => setForm({ ...form, price_tour: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={(form.phone as string) || ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                <input
                  type="text"
                  value={(form.website as string) || ""}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Instagram</label>
                <input
                  type="text"
                  value={(form.instagram as string) || ""}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">YouTube</label>
                <input
                  type="text"
                  value={(form.youtube as string) || ""}
                  onChange={(e) => setForm({ ...form, youtube: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Facebook</label>
                <input
                  type="text"
                  value={(form.facebook as string) || ""}
                  onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white rounded-b-2xl">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                Save Changes
              </button>
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-slate-500">
            Failed to load profile data.
          </div>
        )}
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
  const [editingArtistId, setEditingArtistId] = useState<number | null>(null);

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
                  <ArtistCard
                    key={artist.id}
                    artist={artist}
                    onEdit={(id) => setEditingArtistId(id)}
                  />
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

      {/* Edit Artist Modal */}
      {editingArtistId && (
        <EditArtistModal
          artistId={editingArtistId}
          onClose={() => setEditingArtistId(null)}
          onSaved={() => fetchDashboardData()}
        />
      )}
    </div>
  );
}
