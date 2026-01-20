"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  X,
  ChevronRight,
  Search,
  MapPin,
  Music,
} from "lucide-react";
import type { Booking, ArtistListItem } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

// Mock community data (will be replaced with auth)
const mockCommunity = {
  id: 1,
  name: "Beth Israel Synagogue",
  location: "New York, NY",
};

// Mock bookings
const mockBookings: (Booking & { artist?: { name_he: string; name_en?: string } })[] = [
  {
    id: 1,
    artist_id: 1,
    community_id: 1,
    requested_date: "2025-03-15",
    location: "Main Hall",
    budget: 1500,
    status: "approved",
    created_at: "2025-01-10",
    updated_at: "2025-01-15",
    artist: { name_he: "דוד כהן", name_en: "David Cohen" },
  },
  {
    id: 2,
    artist_id: 2,
    community_id: 1,
    requested_date: "2025-04-20",
    location: "Community Center",
    budget: 2000,
    status: "pending",
    created_at: "2025-01-12",
    updated_at: "2025-01-12",
    artist: { name_he: "שרה לוי", name_en: "Sara Levi" },
  },
  {
    id: 3,
    artist_id: 3,
    community_id: 1,
    requested_date: "2025-02-28",
    location: "Sanctuary",
    budget: 1200,
    status: "completed",
    created_at: "2024-12-01",
    updated_at: "2025-03-01",
    artist: { name_he: "יוסי אברהם", name_en: "Yossi Avraham" },
  },
];

// Mock recommended artists
const mockRecommendedArtists: ArtistListItem[] = [
  {
    id: 4,
    name_he: "מיכל רוזן",
    name_en: "Michal Rosen",
    price_single: 800,
    city: "Tel Aviv",
    country: "Israel",
    is_featured: true,
    categories: [{ id: 1, name_he: "שירה", name_en: "Singing", slug: "singing", sort_order: 1 }],
  },
  {
    id: 5,
    name_he: "אלון בן דוד",
    name_en: "Alon Ben David",
    price_single: 1000,
    city: "Jerusalem",
    country: "Israel",
    is_featured: false,
    categories: [{ id: 2, name_he: "נגינה", name_en: "Music", slug: "music", sort_order: 2 }],
  },
];

function StatusBadge({ status, t }: { status: string; t: ReturnType<typeof useLanguage>['t'] }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    completed: "bg-purple-100 text-purple-700",
    cancelled: "bg-neutral-100 text-neutral-600",
  };

  const statusKey = status as keyof typeof t.status;
  const label = t.status[statusKey] || status;

  return (
    <span className={`px-2 py-0.5 text-xs rounded-full ${styles[status] || styles.pending}`}>
      {label}
    </span>
  );
}

function BookingCard({
  booking,
  t,
  language,
}: {
  booking: Booking & { artist?: { name_he: string; name_en?: string } };
  t: ReturnType<typeof useLanguage>['t'];
  language: string;
}) {
  const dateLocale = language === 'he' ? 'he-IL' : 'en-US';
  const artistName = language === 'he' ? booking.artist?.name_he : (booking.artist?.name_en || booking.artist?.name_he);
  const altName = language === 'he' ? booking.artist?.name_en : booking.artist?.name_he;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-5">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-neutral-800">{artistName}</h3>
          {altName && (
            <p className="text-sm text-neutral-500">{altName}</p>
          )}
        </div>
        <StatusBadge status={booking.status} t={t} />
      </div>

      <div className="space-y-2 text-sm text-neutral-600">
        {booking.requested_date && (
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-neutral-400" />
            <span>{new Date(booking.requested_date).toLocaleDateString(dateLocale)}</span>
          </div>
        )}
        {booking.location && (
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-neutral-400" />
            <span>{booking.location}</span>
          </div>
        )}
        {booking.budget && (
          <div className="flex items-center gap-2">
            <DollarSign size={14} className="text-neutral-400" />
            <span>${booking.budget}</span>
          </div>
        )}
      </div>

      {booking.status === "approved" && (
        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <span className="text-sm text-green-600 font-medium">{t.dashboard.bookingApproved}</span>
          <Link
            href={`/artists/${booking.artist_id}`}
            className="text-sm text-primary-500 hover:underline"
          >
            {t.dashboard.artistDetails}
          </Link>
        </div>
      )}
    </div>
  );
}

function ArtistRecommendationCard({ artist, t, language }: { artist: ArtistListItem; t: ReturnType<typeof useLanguage>['t']; language: string }) {
  const artistName = language === 'he' ? artist.name_he : (artist.name_en || artist.name_he);
  const altName = language === 'he' ? artist.name_en : artist.name_he;
  const categoryName = language === 'he' ? artist.categories[0]?.name_he : (artist.categories[0]?.name_en || artist.categories[0]?.name_he);

  return (
    <Link
      href={`/artists/${artist.id}`}
      className="block bg-white rounded-xl shadow-sm border border-neutral-100 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-white/50">
            {artistName.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-neutral-800 truncate">{artistName}</h4>
          <p className="text-sm text-neutral-500 truncate">{altName}</p>
          <div className="flex items-center gap-2 mt-1 text-sm text-neutral-600">
            <Music size={12} className="text-neutral-400" />
            <span>{categoryName}</span>
            {artist.price_single && (
              <>
                <span className="text-neutral-300">•</span>
                <span>{t.dashboard.fromPrice}${artist.price_single}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CommunityDashboardPage() {
  const { t, language, isRTL } = useLanguage();
  const [bookings] = useState(mockBookings);
  const [recommendedArtists] = useState(mockRecommendedArtists);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredBookings = activeFilter
    ? bookings.filter((b) => b.status === activeFilter)
    : bookings;

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    approved: bookings.filter((b) => b.status === "approved").length,
    completed: bookings.filter((b) => b.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">
                {t.dashboard.communityGreeting.replace('{name}', mockCommunity.name)}
              </h1>
              <p className="text-neutral-500">
                <MapPin className={`inline-block ${isRTL ? 'ml-1' : 'mr-1'}`} size={14} />
                {mockCommunity.location}
              </p>
            </div>
            <Link
              href="/artists"
              className="px-4 py-2 bg-primary-400 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Search size={18} />
              {t.dashboard.searchArtists}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-800">{stats.total}</p>
                <p className="text-sm text-neutral-500">{t.dashboard.stats.totalBookings}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-800">{stats.pending}</p>
                <p className="text-sm text-neutral-500">{t.dashboard.stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-800">{stats.approved}</p>
                <p className="text-sm text-neutral-500">{t.dashboard.stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-800">{stats.completed}</p>
                <p className="text-sm text-neutral-500">{t.dashboard.stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bookings */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-neutral-800">{t.dashboard.myBookings}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveFilter(null)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    activeFilter === null
                      ? "bg-primary-400 text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {t.dashboard.filters.all}
                </button>
                <button
                  onClick={() => setActiveFilter("pending")}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    activeFilter === "pending"
                      ? "bg-yellow-400 text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {t.dashboard.filters.pending}
                </button>
                <button
                  onClick={() => setActiveFilter("approved")}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    activeFilter === "approved"
                      ? "bg-green-500 text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  {t.dashboard.filters.approved}
                </button>
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <Calendar size={48} className="text-neutral-300 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-neutral-800 mb-2">
                  {activeFilter ? t.dashboard.empty.noBookingsStatus : t.dashboard.empty.noBookingsYet}
                </h3>
                <p className="text-neutral-500 mb-4">
                  {t.dashboard.empty.searchAndBook}
                </p>
                <Link
                  href="/artists"
                  className="inline-block px-4 py-2 bg-primary-400 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                >
                  {t.dashboard.searchArtists}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} t={t} language={language} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Recommendations */}
          <div>
            <h2 className="font-bold text-lg text-neutral-800 mb-4">
              {t.dashboard.recommendedArtists}
            </h2>
            <div className="space-y-3">
              {recommendedArtists.map((artist) => (
                <ArtistRecommendationCard key={artist.id} artist={artist} t={t} language={language} />
              ))}
            </div>

            <Link
              href="/artists"
              className="mt-4 flex items-center justify-center gap-2 text-primary-500 hover:text-primary-600 font-medium"
            >
              {t.dashboard.seeMoreArtists}
              <ChevronRight size={18} className={isRTL ? '' : 'rotate-180'} />
            </Link>

            {/* Quick actions */}
            <div className="mt-8 bg-white rounded-xl p-5 shadow-sm border border-neutral-100">
              <h3 className="font-bold text-neutral-800 mb-4">{t.dashboard.quickActions}</h3>
              <div className="space-y-2">
                <Link
                  href="/search"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <Search size={18} className="text-primary-500" />
                  <span className="text-neutral-700">{t.dashboard.advancedSearch}</span>
                </Link>
                <Link
                  href="/dashboard/community/settings"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <MapPin size={18} className="text-primary-500" />
                  <span className="text-neutral-700">{t.dashboard.updateCommunityDetails}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
