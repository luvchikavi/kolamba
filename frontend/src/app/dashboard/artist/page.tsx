"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Route,
  CheckCircle,
  Clock,
  Plus,
  ChevronRight,
  Settings,
} from "lucide-react";

// Mock data for tour suggestions
const mockSuggestions = [
  {
    region: "New York Metro",
    communities: [
      { id: 1, name: "Beth Israel Synagogue", location: "Manhattan, NY" },
      { id: 2, name: "Congregation Shearith Israel", location: "Brooklyn, NY" },
      { id: 3, name: "Young Israel of Queens", location: "Queens, NY" },
    ],
    suggested_start: "2025-03-15",
    suggested_end: "2025-03-22",
    total_distance_km: 45.5,
    estimated_budget: 3500,
  },
  {
    region: "Los Angeles",
    communities: [
      { id: 4, name: "Sinai Temple", location: "Westwood, CA" },
      { id: 5, name: "Adat Ari El", location: "Valley Village, CA" },
    ],
    suggested_start: "2025-04-01",
    suggested_end: "2025-04-05",
    total_distance_km: 28.3,
    estimated_budget: 2000,
  },
];

// Mock tours
const mockTours = [
  {
    id: 1,
    name: "Northeast Tour Spring 2025",
    region: "Northeast USA",
    start_date: "2025-02-15",
    end_date: "2025-02-28",
    total_budget: 5000,
    status: "confirmed",
    bookings: 4,
  },
];

// Mock pending bookings
const mockPendingBookings = [
  {
    id: 6,
    location: "Chicago, IL",
    requested_date: "2025-05-10",
    budget: 800,
    status: "pending",
  },
  {
    id: 7,
    location: "Detroit, MI",
    requested_date: "2025-05-12",
    budget: 750,
    status: "pending",
  },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-slate-100 text-slate-600",
    proposed: "bg-amber-100 text-amber-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-violet-100 text-violet-700",
    cancelled: "bg-red-100 text-red-700",
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
  };

  const labels: Record<string, string> = {
    draft: "Draft",
    proposed: "Proposed",
    confirmed: "Confirmed",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    pending: "Pending",
    approved: "Approved",
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  );
}

function TourSuggestionCard({
  suggestion,
  onCreateTour,
}: {
  suggestion: typeof mockSuggestions[0];
  onCreateTour: () => void;
}) {
  return (
    <div className="card p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-900">{suggestion.region}</h3>
          <p className="text-sm text-slate-500">
            {suggestion.communities.length} communities
          </p>
        </div>
        <div className="flex items-center gap-2 text-primary-600">
          <Route size={20} />
          <span className="text-sm font-medium">{suggestion.total_distance_km} km</span>
        </div>
      </div>

      {/* Communities list */}
      <div className="space-y-2 mb-4">
        {suggestion.communities.map((community, idx) => (
          <div key={community.id} className="flex items-center gap-2 text-sm text-slate-600">
            <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">
              {idx + 1}
            </span>
            <span>{community.name}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">{community.location}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">Suggested Dates</p>
            <p className="text-sm font-medium">
              {new Date(suggestion.suggested_start).toLocaleDateString()} -{" "}
              {new Date(suggestion.suggested_end).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">Est. Budget</p>
            <p className="text-sm font-medium">${suggestion.estimated_budget.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <button
        onClick={onCreateTour}
        className="btn-primary w-full justify-center"
      >
        <Plus size={18} />
        Create Tour
      </button>
    </div>
  );
}

function TourCard({ tour }: { tour: typeof mockTours[0] }) {
  return (
    <Link
      href={`/dashboard/artist/tours/${tour.id}`}
      className="block card card-hover p-6"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-slate-900">{tour.name}</h3>
          <p className="text-sm text-slate-500">{tour.region}</p>
        </div>
        <StatusBadge status={tour.status} />
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
        <div className="flex items-center gap-1">
          <Calendar size={14} className="text-slate-400" />
          <span>
            {new Date(tour.start_date).toLocaleDateString()} -{" "}
            {new Date(tour.end_date).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign size={14} className="text-slate-400" />
          <span>${tour.total_budget.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users size={14} className="text-slate-400" />
          <span>{tour.bookings} performances</span>
        </div>
      </div>

      <div className="mt-4 flex items-center text-primary-600 text-sm font-medium">
        View Details
        <ChevronRight size={16} className="ml-1" />
      </div>
    </Link>
  );
}

function BookingCard({ booking }: { booking: typeof mockPendingBookings[0] }) {
  return (
    <div className="card p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-slate-900">{booking.location}</p>
          <p className="text-sm text-slate-500">
            {new Date(booking.requested_date).toLocaleDateString()}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <p className="text-sm text-slate-600 mt-2">Budget: ${booking.budget}</p>
    </div>
  );
}

export default function ArtistDashboardPage() {
  const [suggestions, setSuggestions] = useState(mockSuggestions);
  const [tours, setTours] = useState(mockTours);
  const [pendingBookings] = useState(mockPendingBookings);
  const [activeTab, setActiveTab] = useState<"suggestions" | "tours" | "bookings">("suggestions");

  const handleCreateTour = (region: string) => {
    const suggestion = suggestions.find((s) => s.region === region);
    if (!suggestion) return;

    const newTour = {
      id: Date.now(),
      name: `${suggestion.region} Tour`,
      region: suggestion.region,
      start_date: suggestion.suggested_start,
      end_date: suggestion.suggested_end,
      total_budget: suggestion.estimated_budget,
      status: "draft",
      bookings: suggestion.communities.length,
    };

    setTours([newTour, ...tours]);
    setSuggestions(suggestions.filter((s) => s.region !== region));
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container-default py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Artist Dashboard</h1>
              <p className="text-slate-500">Manage your tours and bookings</p>
            </div>
            <Link
              href="/dashboard/artist/settings"
              className="btn-secondary"
            >
              <Settings size={18} />
              Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container-default py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{pendingBookings.length}</p>
                <p className="text-sm text-slate-500">Pending Requests</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Route size={20} className="text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{suggestions.length}</p>
                <p className="text-sm text-slate-500">Tour Suggestions</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {tours.filter((t) => t.status === "confirmed").length}
                </p>
                <p className="text-sm text-slate-500">Confirmed Tours</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center">
                <DollarSign size={20} className="text-accent-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  ${tours.reduce((sum, t) => sum + (t.total_budget || 0), 0).toLocaleString()}
                </p>
                <p className="text-sm text-slate-500">Expected Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("suggestions")}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === "suggestions"
                ? "bg-primary-500 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            Suggestions ({suggestions.length})
          </button>
          <button
            onClick={() => setActiveTab("tours")}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === "tours"
                ? "bg-primary-500 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            My Tours ({tours.length})
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === "bookings"
                ? "bg-primary-500 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            Requests ({pendingBookings.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === "suggestions" && (
          <div className="space-y-6">
            {suggestions.length === 0 ? (
              <div className="card p-8 text-center">
                <Route size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  No Tour Suggestions
                </h3>
                <p className="text-slate-500">
                  When communities in nearby areas show interest, we&apos;ll suggest tour routes for you.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {suggestions.map((suggestion) => (
                  <TourSuggestionCard
                    key={suggestion.region}
                    suggestion={suggestion}
                    onCreateTour={() => handleCreateTour(suggestion.region)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "tours" && (
          <div className="space-y-4">
            {tours.length === 0 ? (
              <div className="card p-8 text-center">
                <Route size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  No Tours Yet
                </h3>
                <p className="text-slate-500">
                  Create your first tour from a suggestion above.
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
              <div className="card p-8 text-center">
                <Users size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  No Pending Requests
                </h3>
                <p className="text-slate-500">
                  When communities send you booking requests, they&apos;ll appear here.
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
