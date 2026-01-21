"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  ChevronRight,
  Search,
  MapPin,
  Music,
  Star,
  Plane,
  Sparkles,
  Loader2,
} from "lucide-react";
import TourOpportunityCard from "@/components/tours/TourOpportunityCard";

// Mock community data (will be replaced with auth)
const mockCommunity = {
  id: 1,
  name: "Beth Israel Synagogue",
  location: "New York, NY",
  latitude: 40.7128,
  longitude: -74.006,
};

// Mock bookings
const mockBookings = [
  {
    id: 1,
    artist_id: 1,
    artistName: "David Cohen",
    requested_date: "2025-03-15",
    location: "Main Hall",
    budget: 1500,
    status: "approved",
  },
  {
    id: 2,
    artist_id: 2,
    artistName: "Sarah Levy",
    requested_date: "2025-04-20",
    location: "Community Center",
    budget: 2000,
    status: "pending",
  },
  {
    id: 3,
    artist_id: 3,
    artistName: "Yossi Mizrachi",
    requested_date: "2025-02-28",
    location: "Sanctuary",
    budget: 1200,
    status: "completed",
  },
];

// Mock recommended artists
const mockRecommendedArtists = [
  {
    id: 4,
    name: "Michal Rosen",
    category: "Singing",
    price: 800,
    rating: 4.9,
  },
  {
    id: 5,
    name: "Alon Ben David",
    category: "Music",
    price: 1000,
    rating: 4.8,
  },
];

interface TourOpportunity {
  tour_id: number;
  tour_name: string;
  artist: {
    id: number;
    name_en: string | null;
    name_he: string | null;
    profile_image: string | null;
    category: string | null;
  };
  region: string;
  start_date: string | null;
  end_date: string | null;
  nearest_booking: {
    id: number;
    location: string;
    requested_date: string | null;
    distance_km: number | null;
  } | null;
  distance_to_nearest_km: number | null;
  total_stops: number;
  status: string;
  estimated_savings: number | null;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    completed: "bg-violet-100 text-violet-700",
    cancelled: "bg-slate-100 text-slate-600",
  };

  const labels: Record<string, string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <span
      className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status] || styles.pending}`}
    >
      {labels[status] || status}
    </span>
  );
}

function BookingCard({ booking }: { booking: (typeof mockBookings)[0] }) {
  return (
    <div className="card p-5">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-slate-900">{booking.artistName}</h3>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-400" />
          <span>{new Date(booking.requested_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-slate-400" />
          <span>{booking.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign size={14} className="text-slate-400" />
          <span>${booking.budget}</span>
        </div>
      </div>

      {booking.status === "approved" && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
          <span className="text-sm text-emerald-600 font-medium">Confirmed</span>
          <Link
            href={`/artists/${booking.artist_id}`}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            View Artist
          </Link>
        </div>
      )}
    </div>
  );
}

function ArtistRecommendationCard({
  artist,
}: {
  artist: (typeof mockRecommendedArtists)[0];
}) {
  return (
    <Link href={`/artists/${artist.id}`} className="block card card-hover p-4">
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-100 via-primary-50 to-accent-100 flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-primary-600/50">
            {artist.name.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 truncate">{artist.name}</h4>
          <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
            <Music size={12} className="text-slate-400" />
            <span>{artist.category}</span>
            <span className="text-slate-300">|</span>
            <span>From ${artist.price}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Star size={12} className="text-amber-500 fill-amber-500" />
            <span className="text-sm text-slate-600">{artist.rating}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CommunityDashboardPage() {
  const [bookings] = useState(mockBookings);
  const [recommendedArtists] = useState(mockRecommendedArtists);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [nearbyTours, setNearbyTours] = useState<TourOpportunity[]>([]);
  const [isLoadingTours, setIsLoadingTours] = useState(true);

  // Fetch nearby tours
  useEffect(() => {
    const fetchNearbyTours = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/communities/${mockCommunity.id}/tour-opportunities?radius_km=500`
        );
        if (response.ok) {
          const data = await response.json();
          setNearbyTours(data);
        }
      } catch (error) {
        console.error("Failed to fetch nearby tours:", error);
      } finally {
        setIsLoadingTours(false);
      }
    };

    fetchNearbyTours();
  }, []);

  const filteredBookings = activeFilter
    ? bookings.filter((b) => b.status === activeFilter)
    : bookings;

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    approved: bookings.filter((b) => b.status === "approved").length,
    completed: bookings.filter((b) => b.status === "completed").length,
  };

  const handleTourJoinRequest = (tourId: number) => {
    // Could refresh the list or show a notification
    console.log("Join request sent for tour:", tourId);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container-default py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Welcome, {mockCommunity.name}
              </h1>
              <p className="text-slate-500 flex items-center gap-1">
                <MapPin size={14} />
                {mockCommunity.location}
              </p>
            </div>
            <Link href="/artists" className="btn-primary">
              <Search size={18} />
              Find Artists
            </Link>
          </div>
        </div>
      </div>

      <div className="container-default py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-sm text-slate-500">Total Bookings</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
                <p className="text-sm text-slate-500">Pending</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.approved}</p>
                <p className="text-sm text-slate-500">Approved</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <CheckCircle size={20} className="text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
                <p className="text-sm text-slate-500">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Artists Coming to Your Area - NEW SECTION */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Plane size={20} className="text-primary-600" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-slate-900">
                  Artists Coming to Your Area
                </h2>
                <p className="text-sm text-slate-500">
                  Join existing tours to save on costs
                </p>
              </div>
            </div>
            <Link
              href="/tours/nearby"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
            >
              View All
              <ChevronRight size={16} />
            </Link>
          </div>

          {isLoadingTours ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-primary-500" />
            </div>
          ) : nearbyTours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyTours.slice(0, 3).map((tour) => (
                <TourOpportunityCard
                  key={tour.tour_id}
                  tour={tour}
                  communityId={mockCommunity.id}
                  onJoinRequest={handleTourJoinRequest}
                />
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plane size={32} className="text-slate-400" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">
                No tours in your area right now
              </h3>
              <p className="text-slate-500 mb-4">
                We&apos;ll notify you when artists plan tours near{" "}
                {mockCommunity.location}.
              </p>
              <Link href="/artists" className="btn-primary inline-flex">
                <Search size={18} />
                Browse All Artists
              </Link>
            </div>
          )}

          {nearbyTours.length > 0 && (
            <div className="mt-4 p-4 bg-emerald-50 rounded-xl flex items-center gap-3">
              <Sparkles size={20} className="text-emerald-600 flex-shrink-0" />
              <p className="text-sm text-emerald-800">
                <strong>Save up to 30%</strong> by joining existing tours! When
                artists are already traveling to nearby communities, you can share
                travel costs.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bookings */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-slate-900">My Bookings</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveFilter(null)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    activeFilter === null
                      ? "bg-primary-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter("pending")}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    activeFilter === "pending"
                      ? "bg-amber-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setActiveFilter("approved")}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    activeFilter === "approved"
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Approved
                </button>
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="card p-8 text-center">
                <Calendar size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  {activeFilter
                    ? "No bookings with this status"
                    : "No bookings yet"}
                </h3>
                <p className="text-slate-500 mb-4">
                  Start by searching for artists and sending booking requests.
                </p>
                <Link href="/artists" className="btn-primary inline-flex">
                  Find Artists
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Recommendations */}
          <div>
            <h2 className="font-bold text-lg text-slate-900 mb-4">
              Recommended Artists
            </h2>
            <div className="space-y-3">
              {recommendedArtists.map((artist) => (
                <ArtistRecommendationCard key={artist.id} artist={artist} />
              ))}
            </div>

            <Link
              href="/artists"
              className="mt-4 flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              See More Artists
              <ChevronRight size={18} />
            </Link>

            {/* Quick actions */}
            <div className="mt-8 card p-5">
              <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/tours/nearby"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <Plane size={18} className="text-primary-600" />
                  <span className="text-slate-700">Find Nearby Tours</span>
                </Link>
                <Link
                  href="/search"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <Search size={18} className="text-primary-600" />
                  <span className="text-slate-700">Advanced Search</span>
                </Link>
                <Link
                  href="/dashboard/community/settings"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <MapPin size={18} className="text-primary-600" />
                  <span className="text-slate-700">Update Profile</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
