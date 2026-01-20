"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Route,
  CheckCircle,
  Clock,
  X,
  Plus,
  ChevronRight,
} from "lucide-react";
import type { TourSuggestion, Tour, Booking } from "@/lib/api";

// Mock artist ID (will be replaced with auth)
const MOCK_ARTIST_ID = 1;

// Mock data for tour suggestions
const mockSuggestions: TourSuggestion[] = [
  {
    region: "New York, NY",
    booking_ids: [1, 2, 3],
    communities: [
      { id: 1, name: "Beth Israel Synagogue", location: "Manhattan, NY", latitude: 40.7128, longitude: -74.006 },
      { id: 2, name: "Congregation Shearith Israel", location: "Brooklyn, NY", latitude: 40.6782, longitude: -73.9442 },
      { id: 3, name: "Young Israel of Queens", location: "Queens, NY", latitude: 40.7282, longitude: -73.7949 },
    ],
    suggested_start: "2025-03-15",
    suggested_end: "2025-03-22",
    total_distance_km: 45.5,
    estimated_budget: 3500,
  },
  {
    region: "Los Angeles, CA",
    booking_ids: [4, 5],
    communities: [
      { id: 4, name: "Sinai Temple", location: "Westwood, CA", latitude: 34.0522, longitude: -118.2437 },
      { id: 5, name: "Adat Ari El", location: "Valley Village, CA", latitude: 34.1699, longitude: -118.3962 },
    ],
    suggested_start: "2025-04-01",
    suggested_end: "2025-04-05",
    total_distance_km: 28.3,
    estimated_budget: 2000,
  },
];

// Mock tours
const mockTours: Tour[] = [
  {
    id: 1,
    artist_id: 1,
    name: "Northeast Tour Spring 2025",
    region: "Northeast USA",
    start_date: "2025-02-15",
    end_date: "2025-02-28",
    total_budget: 5000,
    status: "confirmed",
    created_at: "2025-01-01",
    updated_at: "2025-01-15",
    bookings: [],
  },
];

// Mock pending bookings
const mockPendingBookings: Booking[] = [
  {
    id: 6,
    artist_id: 1,
    community_id: 6,
    requested_date: "2025-05-10",
    location: "Chicago, IL",
    budget: 800,
    status: "pending",
    created_at: "2025-01-10",
    updated_at: "2025-01-10",
  },
  {
    id: 7,
    artist_id: 1,
    community_id: 7,
    requested_date: "2025-05-12",
    location: "Detroit, MI",
    budget: 750,
    status: "pending",
    created_at: "2025-01-11",
    updated_at: "2025-01-11",
  },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-neutral-100 text-neutral-600",
    proposed: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-green-100 text-green-700",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-purple-100 text-purple-700",
    cancelled: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const labels: Record<string, string> = {
    draft: "טיוטה",
    proposed: "הוצע",
    confirmed: "מאושר",
    in_progress: "בתהליך",
    completed: "הושלם",
    cancelled: "בוטל",
    pending: "ממתין",
    approved: "מאושר",
    rejected: "נדחה",
  };

  return (
    <span className={`px-2 py-0.5 text-xs rounded-full ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
}

function TourSuggestionCard({
  suggestion,
  onCreateTour,
}: {
  suggestion: TourSuggestion;
  onCreateTour: (suggestion: TourSuggestion) => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-neutral-800">{suggestion.region}</h3>
          <p className="text-sm text-neutral-500">
            {suggestion.communities.length} קהילות • {suggestion.booking_ids.length} הזמנות
          </p>
        </div>
        <div className="flex items-center gap-2 text-primary-500">
          <Route size={20} />
          <span className="text-sm font-medium">{suggestion.total_distance_km} ק״מ</span>
        </div>
      </div>

      {/* Communities list */}
      <div className="space-y-2 mb-4">
        {suggestion.communities.map((community, idx) => (
          <div key={community.id} className="flex items-center gap-2 text-sm text-neutral-600">
            <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs">
              {idx + 1}
            </span>
            <span>{community.name}</span>
            <span className="text-neutral-400">•</span>
            <span className="text-neutral-500">{community.location}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 rounded-lg mb-4">
        {suggestion.suggested_start && suggestion.suggested_end && (
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-neutral-400" />
            <div>
              <p className="text-xs text-neutral-500">תאריכים מוצעים</p>
              <p className="text-sm font-medium">
                {new Date(suggestion.suggested_start).toLocaleDateString("he-IL")} -{" "}
                {new Date(suggestion.suggested_end).toLocaleDateString("he-IL")}
              </p>
            </div>
          </div>
        )}
        {suggestion.estimated_budget && (
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-neutral-400" />
            <div>
              <p className="text-xs text-neutral-500">תקציב משוער</p>
              <p className="text-sm font-medium">${suggestion.estimated_budget.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => onCreateTour(suggestion)}
        className="w-full py-2 bg-primary-400 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        צור סבב הופעות
      </button>
    </div>
  );
}

function TourCard({ tour }: { tour: Tour }) {
  return (
    <Link
      href={`/dashboard/artist/tours/${tour.id}`}
      className="block bg-white rounded-xl shadow-sm border border-neutral-100 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-neutral-800">{tour.name}</h3>
          {tour.region && <p className="text-sm text-neutral-500">{tour.region}</p>}
        </div>
        <StatusBadge status={tour.status} />
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
        {tour.start_date && tour.end_date && (
          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-neutral-400" />
            <span>
              {new Date(tour.start_date).toLocaleDateString("he-IL")} -{" "}
              {new Date(tour.end_date).toLocaleDateString("he-IL")}
            </span>
          </div>
        )}
        {tour.total_budget && (
          <div className="flex items-center gap-1">
            <DollarSign size={14} className="text-neutral-400" />
            <span>${tour.total_budget.toLocaleString()}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Users size={14} className="text-neutral-400" />
          <span>{tour.bookings.length} הופעות</span>
        </div>
      </div>

      <div className="mt-4 flex items-center text-primary-500 text-sm font-medium">
        פרטים נוספים
        <ChevronRight size={16} className="mr-1" />
      </div>
    </Link>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <div className="bg-white rounded-lg border border-neutral-100 p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-neutral-800">{booking.location}</p>
          {booking.requested_date && (
            <p className="text-sm text-neutral-500">
              {new Date(booking.requested_date).toLocaleDateString("he-IL")}
            </p>
          )}
        </div>
        <StatusBadge status={booking.status} />
      </div>
      {booking.budget && (
        <p className="text-sm text-neutral-600 mt-2">תקציב: ${booking.budget}</p>
      )}
    </div>
  );
}

export default function ArtistDashboardPage() {
  const [suggestions, setSuggestions] = useState<TourSuggestion[]>(mockSuggestions);
  const [tours, setTours] = useState<Tour[]>(mockTours);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>(mockPendingBookings);
  const [activeTab, setActiveTab] = useState<"suggestions" | "tours" | "bookings">("suggestions");

  const handleCreateTour = (suggestion: TourSuggestion) => {
    // In real implementation, this would call the API
    const newTour: Tour = {
      id: Date.now(),
      artist_id: MOCK_ARTIST_ID,
      name: `סבב ${suggestion.region}`,
      region: suggestion.region,
      start_date: suggestion.suggested_start,
      end_date: suggestion.suggested_end,
      total_budget: suggestion.estimated_budget,
      status: "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      bookings: [],
    };
    setTours([newTour, ...tours]);
    setSuggestions(suggestions.filter((s) => s.region !== suggestion.region));
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">לוח בקרה לאמן</h1>
              <p className="text-neutral-500">נהל את ההזמנות וסבבי ההופעות שלך</p>
            </div>
            <Link
              href="/dashboard/artist/settings"
              className="px-4 py-2 text-neutral-600 hover:text-neutral-800 border border-neutral-200 rounded-lg transition-colors"
            >
              הגדרות
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-800">{pendingBookings.length}</p>
                <p className="text-sm text-neutral-500">הזמנות ממתינות</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Route size={20} className="text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-800">{suggestions.length}</p>
                <p className="text-sm text-neutral-500">סבבים מוצעים</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-800">
                  {tours.filter((t) => t.status === "confirmed").length}
                </p>
                <p className="text-sm text-neutral-500">סבבים מאושרים</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                <DollarSign size={20} className="text-secondary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-800">
                  ${tours.reduce((sum, t) => sum + (t.total_budget || 0), 0).toLocaleString()}
                </p>
                <p className="text-sm text-neutral-500">הכנסות צפויות</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("suggestions")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "suggestions"
                ? "bg-primary-400 text-white"
                : "bg-white text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            הצעות לסבבים ({suggestions.length})
          </button>
          <button
            onClick={() => setActiveTab("tours")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "tours"
                ? "bg-primary-400 text-white"
                : "bg-white text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            הסבבים שלי ({tours.length})
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "bookings"
                ? "bg-primary-400 text-white"
                : "bg-white text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            הזמנות ({pendingBookings.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === "suggestions" && (
          <div className="space-y-6">
            {suggestions.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <Route size={48} className="text-neutral-300 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-neutral-800 mb-2">
                  אין הצעות לסבבים כרגע
                </h3>
                <p className="text-neutral-500">
                  כשיהיו מספיק הזמנות באזורים קרובים, נציע לך סבבי הופעות אופטימליים.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {suggestions.map((suggestion, idx) => (
                  <TourSuggestionCard
                    key={idx}
                    suggestion={suggestion}
                    onCreateTour={handleCreateTour}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "tours" && (
          <div className="space-y-4">
            {tours.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <Route size={48} className="text-neutral-300 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-neutral-800 mb-2">
                  אין סבבים עדיין
                </h3>
                <p className="text-neutral-500">
                  צור סבב הופעות מההצעות או הוסף הזמנות ידנית.
                </p>
              </div>
            ) : (
              tours.map((tour) => <TourCard key={tour.id} tour={tour} />)
            )}
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="space-y-4">
            {pendingBookings.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <Users size={48} className="text-neutral-300 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-neutral-800 mb-2">
                  אין הזמנות ממתינות
                </h3>
                <p className="text-neutral-500">
                  הזמנות חדשות יופיעו כאן כשקהילות ישלחו בקשות.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingBookings.map((booking) => (
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
