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
import { useLanguage } from "@/contexts/LanguageContext";

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

function StatusBadge({ status, t }: { status: string; t: ReturnType<typeof useLanguage>['t'] }) {
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

  const statusKey = status as keyof typeof t.status;
  const label = t.status[statusKey] || status;

  return (
    <span className={`px-2 py-0.5 text-xs rounded-full ${styles[status] || styles.pending}`}>
      {label}
    </span>
  );
}

function TourSuggestionCard({
  suggestion,
  onCreateTour,
  t,
  language,
}: {
  suggestion: TourSuggestion;
  onCreateTour: (suggestion: TourSuggestion) => void;
  t: ReturnType<typeof useLanguage>['t'];
  language: string;
}) {
  const dateLocale = language === 'he' ? 'he-IL' : 'en-US';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-neutral-800">{suggestion.region}</h3>
          <p className="text-sm text-neutral-500">
            {suggestion.communities.length} {t.dashboard.tourSuggestions.communities} • {suggestion.booking_ids.length} {t.dashboard.tourSuggestions.bookings}
          </p>
        </div>
        <div className="flex items-center gap-2 text-primary-500">
          <Route size={20} />
          <span className="text-sm font-medium">{suggestion.total_distance_km} {t.dashboard.tourSuggestions.km}</span>
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
              <p className="text-xs text-neutral-500">{t.dashboard.tourSuggestions.suggestedDates}</p>
              <p className="text-sm font-medium">
                {new Date(suggestion.suggested_start).toLocaleDateString(dateLocale)} -{" "}
                {new Date(suggestion.suggested_end).toLocaleDateString(dateLocale)}
              </p>
            </div>
          </div>
        )}
        {suggestion.estimated_budget && (
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-neutral-400" />
            <div>
              <p className="text-xs text-neutral-500">{t.dashboard.tourSuggestions.estimatedBudget}</p>
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
        {t.dashboard.tourSuggestions.createTour}
      </button>
    </div>
  );
}

function TourCard({ tour, t, language, isRTL }: { tour: Tour; t: ReturnType<typeof useLanguage>['t']; language: string; isRTL: boolean }) {
  const dateLocale = language === 'he' ? 'he-IL' : 'en-US';

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
        <StatusBadge status={tour.status} t={t} />
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
        {tour.start_date && tour.end_date && (
          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-neutral-400" />
            <span>
              {new Date(tour.start_date).toLocaleDateString(dateLocale)} -{" "}
              {new Date(tour.end_date).toLocaleDateString(dateLocale)}
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
          <span>{tour.bookings.length} {t.dashboard.stats.performances}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center text-primary-500 text-sm font-medium">
        {t.dashboard.moreDetails}
        <ChevronRight size={16} className={isRTL ? 'mr-1' : 'ml-1'} />
      </div>
    </Link>
  );
}

function BookingCard({ booking, t, language }: { booking: Booking; t: ReturnType<typeof useLanguage>['t']; language: string }) {
  const dateLocale = language === 'he' ? 'he-IL' : 'en-US';

  return (
    <div className="bg-white rounded-lg border border-neutral-100 p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-neutral-800">{booking.location}</p>
          {booking.requested_date && (
            <p className="text-sm text-neutral-500">
              {new Date(booking.requested_date).toLocaleDateString(dateLocale)}
            </p>
          )}
        </div>
        <StatusBadge status={booking.status} t={t} />
      </div>
      {booking.budget && (
        <p className="text-sm text-neutral-600 mt-2">{t.dashboard.stats.budget}: ${booking.budget}</p>
      )}
    </div>
  );
}

export default function ArtistDashboardPage() {
  const { t, language, isRTL } = useLanguage();
  const [suggestions, setSuggestions] = useState<TourSuggestion[]>(mockSuggestions);
  const [tours, setTours] = useState<Tour[]>(mockTours);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>(mockPendingBookings);
  const [activeTab, setActiveTab] = useState<"suggestions" | "tours" | "bookings">("suggestions");

  const handleCreateTour = (suggestion: TourSuggestion) => {
    // In real implementation, this would call the API
    const tourName = language === 'he' ? `סבב ${suggestion.region}` : `${suggestion.region} Tour`;
    const newTour: Tour = {
      id: Date.now(),
      artist_id: MOCK_ARTIST_ID,
      name: tourName,
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
              <h1 className="text-2xl font-bold text-neutral-800">{t.dashboard.artistTitle}</h1>
              <p className="text-neutral-500">{t.dashboard.artistSubtitle}</p>
            </div>
            <Link
              href="/dashboard/artist/settings"
              className="px-4 py-2 text-neutral-600 hover:text-neutral-800 border border-neutral-200 rounded-lg transition-colors"
            >
              {t.dashboard.settings}
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
                <p className="text-sm text-neutral-500">{t.dashboard.stats.pendingBookings}</p>
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
                <p className="text-sm text-neutral-500">{t.dashboard.stats.suggestedTours}</p>
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
                <p className="text-sm text-neutral-500">{t.dashboard.stats.confirmedTours}</p>
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
                <p className="text-sm text-neutral-500">{t.dashboard.stats.expectedRevenue}</p>
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
            {t.dashboard.tabs.suggestions} ({suggestions.length})
          </button>
          <button
            onClick={() => setActiveTab("tours")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "tours"
                ? "bg-primary-400 text-white"
                : "bg-white text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            {t.dashboard.tabs.myTours} ({tours.length})
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "bookings"
                ? "bg-primary-400 text-white"
                : "bg-white text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            {t.dashboard.tabs.bookings} ({pendingBookings.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === "suggestions" && (
          <div className="space-y-6">
            {suggestions.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <Route size={48} className="text-neutral-300 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-neutral-800 mb-2">
                  {t.dashboard.empty.noSuggestions}
                </h3>
                <p className="text-neutral-500">
                  {t.dashboard.empty.noSuggestionsDesc}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {suggestions.map((suggestion, idx) => (
                  <TourSuggestionCard
                    key={idx}
                    suggestion={suggestion}
                    onCreateTour={handleCreateTour}
                    t={t}
                    language={language}
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
                  {t.dashboard.empty.noTours}
                </h3>
                <p className="text-neutral-500">
                  {t.dashboard.empty.noToursDesc}
                </p>
              </div>
            ) : (
              tours.map((tour) => <TourCard key={tour.id} tour={tour} t={t} language={language} isRTL={isRTL} />)
            )}
          </div>
        )}

        {activeTab === "bookings" && (
          <div className="space-y-4">
            {pendingBookings.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <Users size={48} className="text-neutral-300 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-neutral-800 mb-2">
                  {t.dashboard.empty.noBookings}
                </h3>
                <p className="text-neutral-500">
                  {t.dashboard.empty.noBookingsDesc}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} t={t} language={language} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
