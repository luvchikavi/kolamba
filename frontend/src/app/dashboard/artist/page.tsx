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
  Plus,
  ChevronRight,
  Settings,
  Loader2,
  X,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { API_URL } from "@/lib/api";

interface TourSuggestion {
  region: string;
  communities: { id: number; name: string; location: string }[];
  suggested_start: string;
  suggested_end: string;
  total_distance_km: number;
  estimated_budget: number;
}

interface Tour {
  id: number;
  name: string;
  region: string;
  start_date: string;
  end_date: string;
  total_budget: number;
  price_per_show?: number;
  price_tier?: string;
  description?: string;
  status: string;
  confirmed_shows?: number;
  bookings: { id: number }[];
}

interface Booking {
  id: number;
  location: string;
  requested_date: string;
  budget: number;
  status: string;
}

interface ArtistProfile {
  id: number;
  name_en: string;
  status: string;
  rejection_reason?: string;
}

interface ArtistTourDate {
  id: number;
  artist_id: number;
  location: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  is_booked: boolean;
  created_at: string;
}

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
  suggestion: TourSuggestion;
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
            <span className="text-slate-300">-</span>
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

function TourCard({ tour }: { tour: Tour }) {
  const confirmedCount = tour.confirmed_shows ?? tour.bookings?.length ?? 0;

  return (
    <div className="card p-6">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-slate-900">{tour.name}</h3>
          <p className="text-sm text-slate-500">{tour.region}</p>
        </div>
        <StatusBadge status={tour.status} />
      </div>

      {tour.description && (
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{tour.description}</p>
      )}

      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
        <div className="flex items-center gap-1">
          <Calendar size={14} className="text-slate-400" />
          <span>
            {new Date(tour.start_date).toLocaleDateString()} -{" "}
            {new Date(tour.end_date).toLocaleDateString()}
          </span>
        </div>
        {tour.price_tier && (
          <span className="text-primary-600 font-medium">{tour.price_tier}</span>
        )}
        <div className="flex items-center gap-1">
          <Users size={14} className="text-slate-400" />
          <span>{confirmedCount} {confirmedCount === 1 ? "show" : "shows"} confirmed</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Link
          href={`/dashboard/artist/tours/${tour.id}`}
          className="flex items-center text-primary-600 text-sm font-medium hover:text-primary-700"
        >
          View Details
          <ChevronRight size={16} className="ml-1" />
        </Link>
        {tour.status === "pending" && confirmedCount > 0 && (
          <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            Ready to approve
          </span>
        )}
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <div className="card p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-slate-900">{booking.location || "Location TBD"}</p>
          <p className="text-sm text-slate-500">
            {booking.requested_date
              ? new Date(booking.requested_date).toLocaleDateString()
              : "Date TBD"}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <p className="text-sm text-slate-600 mt-2">Budget: ${booking.budget || 0}</p>
    </div>
  );
}

function TourDateCard({
  tourDate,
  onDelete,
}: {
  tourDate: ArtistTourDate;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="card p-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={14} className="text-slate-400" />
            <p className="font-medium text-slate-900">{tourDate.location}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar size={14} className="text-slate-400" />
            <span>
              {new Date(tourDate.start_date).toLocaleDateString()}
              {tourDate.end_date && ` - ${new Date(tourDate.end_date).toLocaleDateString()}`}
            </span>
          </div>
          {tourDate.description && (
            <p className="text-sm text-slate-400 mt-2 line-clamp-2">{tourDate.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {tourDate.is_booked && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
              Booked
            </span>
          )}
          <button
            onClick={() => onDelete(tourDate.id)}
            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
            title="Delete tour date"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function AddTourDateModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { location: string; start_date: string; end_date?: string; description?: string }) => void;
  isSubmitting: boolean;
}) {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      location,
      start_date: startDate,
      end_date: endDate || undefined,
      description: description || undefined,
    });
  };

  const resetForm = () => {
    setLocation("");
    setStartDate("");
    setEndDate("");
    setDescription("");
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Add Confirmed Show</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Boston, MA or New York, USA"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Location will be automatically geocoded for distance calculations
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Show Date *
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional: Add details about your availability or event"
              rows={3}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !location || !startDate}
              className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Add Show
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateTourModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    region: string;
    start_date: string;
    end_date: string;
    price_per_show?: number;
    min_tour_budget?: number;
    description?: string;
  }) => void;
  isSubmitting: boolean;
}) {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pricePerShow, setPricePerShow] = useState("");
  const [minTourBudget, setMinTourBudget] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      region,
      start_date: startDate,
      end_date: endDate,
      price_per_show: pricePerShow ? parseInt(pricePerShow) : undefined,
      min_tour_budget: minTourBudget ? parseInt(minTourBudget) : undefined,
      description: description || undefined,
    });
  };

  const resetForm = () => {
    setName("");
    setRegion("");
    setStartDate("");
    setEndDate("");
    setPricePerShow("");
    setMinTourBudget("");
    setDescription("");
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Start a New Tour</h2>
            <p className="text-sm text-slate-500">
              Announce your availability and let communities invite you
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tour Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., East Coast Spring Tour 2026"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Region / Area *
            </label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g., Northeast USA, California, Europe"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Communities in this region will see your tour opportunity
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Price per Show (USD)
              </label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  value={pricePerShow}
                  onChange={(e) => setPricePerShow(e.target.value)}
                  placeholder="e.g., 5000"
                  min="0"
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Communities will see your price tier ($, $$, or $$$)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Minimum Tour Budget (USD)
              </label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  value={minTourBudget}
                  onChange={(e) => setMinTourBudget(e.target.value)}
                  placeholder="e.g., 10000"
                  min="0"
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Tour confirms when bookings reach this total
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell communities about this tour - what type of performances, special requirements, etc."
              rows={3}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="font-medium text-amber-800 mb-1">How it works</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>1. Your tour will be visible to communities in the region</li>
              <li>2. Communities can send you booking requests</li>
              <li>3. Approve requests that meet your requirements</li>
              <li>4. Your tour is confirmed once approved bookings reach your minimum tour budget</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name || !region || !startDate || !endDate}
              className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Publish Tour
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ArtistDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [artistId, setArtistId] = useState<number | null>(null);
  const [artistStatus, setArtistStatus] = useState<string>("active");
  const [rejectionReason, setRejectionReason] = useState<string | undefined>();
  const [suggestions, setSuggestions] = useState<TourSuggestion[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [tourDates, setTourDates] = useState<ArtistTourDate[]>([]);
  const [activeTab, setActiveTab] = useState<"suggestions" | "tours" | "bookings" | "tourDates">("tours");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreateTourModalOpen, setIsCreateTourModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Get artist profile first
      const profileRes = await fetch(`${API_URL}/artists/me`, { headers });
      if (profileRes.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!profileRes.ok) {
        throw new Error("Failed to fetch artist profile");
      }
      const profile: ArtistProfile = await profileRes.json();
      setArtistId(profile.id);
      setArtistStatus(profile.status);
      setRejectionReason(profile.rejection_reason);

      // Fetch bookings, tours, suggestions, and tour dates in parallel
      const [bookingsRes, toursRes, suggestionsRes, tourDatesRes] = await Promise.all([
        fetch(`${API_URL}/bookings?artist_id=${profile.id}`, { headers }),
        fetch(`${API_URL}/tours?artist_id=${profile.id}`, { headers }),
        fetch(`${API_URL}/tours/suggestions?artist_id=${profile.id}`, { headers }),
        fetch(`${API_URL}/artists/${profile.id}/tour-dates`, { headers }),
      ]);

      if (bookingsRes.ok) {
        const bookingsData: Booking[] = await bookingsRes.json();
        setPendingBookings(bookingsData.filter((b) => b.status === "pending"));
      }

      if (toursRes.ok) {
        const toursData: Tour[] = await toursRes.json();
        setTours(toursData);
      }

      if (suggestionsRes.ok) {
        const suggestionsData: TourSuggestion[] = await suggestionsRes.json();
        setSuggestions(suggestionsData);
      }

      if (tourDatesRes.ok) {
        const tourDatesData: ArtistTourDate[] = await tourDatesRes.json();
        setTourDates(tourDatesData);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTour = async (region: string) => {
    const suggestion = suggestions.find((s) => s.region === region);
    if (!suggestion || !artistId) return;

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/tours`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          artist_id: artistId,
          name: `${suggestion.region} Tour`,
          region: suggestion.region,
          start_date: suggestion.suggested_start,
          end_date: suggestion.suggested_end,
          total_budget: suggestion.estimated_budget,
        }),
      });

      if (response.ok) {
        const newTour = await response.json();
        setTours([newTour, ...tours]);
        setSuggestions(suggestions.filter((s) => s.region !== region));
      }
    } catch (error) {
      console.error("Failed to create tour:", error);
    }
  };

  const handleAddTourDate = async (data: {
    location: string;
    start_date: string;
    end_date?: string;
    description?: string;
  }) => {
    if (!artistId) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/artists/${artistId}/tour-dates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newTourDate: ArtistTourDate = await response.json();
        setTourDates([...tourDates, newTourDate].sort(
          (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        ));
        setIsAddModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to add tour date:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTourDate = async (tourDateId: number) => {
    if (!artistId) return;

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/artists/${artistId}/tour-dates/${tourDateId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setTourDates(tourDates.filter((td) => td.id !== tourDateId));
      }
    } catch (error) {
      console.error("Failed to delete tour date:", error);
    }
  };

  const handleCreateNewTour = async (data: {
    name: string;
    region: string;
    start_date: string;
    end_date: string;
    price_per_show?: number;
    min_tour_budget?: number;
    description?: string;
  }) => {
    if (!artistId) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/tours`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          artist_id: artistId,
          name: data.name,
          region: data.region,
          start_date: data.start_date,
          end_date: data.end_date,
          price_per_show: data.price_per_show,
          min_tour_budget: data.min_tour_budget,
          description: data.description,
        }),
      });

      if (response.ok) {
        const newTour = await response.json();
        setTours([newTour, ...tours]);
        setIsCreateTourModalOpen(false);
        setActiveTab("tours");
      }
    } catch (error) {
      console.error("Failed to create tour:", error);
    } finally {
      setIsSubmitting(false);
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
      {/* Status Banners */}
      {artistStatus === "pending" && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="container-default py-4 flex items-center gap-3">
            <Clock size={20} className="text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-800">Profile Under Review</p>
              <p className="text-sm text-amber-700">
                Your profile is being reviewed by our team. You&apos;ll be notified once it&apos;s approved.
              </p>
            </div>
          </div>
        </div>
      )}
      {artistStatus === "rejected" && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="container-default py-4 flex items-center gap-3">
            <X size={20} className="text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800">Profile Not Approved</p>
              <p className="text-sm text-red-700">
                {rejectionReason
                  ? `Reason: ${rejectionReason}`
                  : "Your profile was not approved. Please update your profile and contact support."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container-default py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xl font-bold text-slate-900 hover:text-primary-600 transition-colors">
                KOLAMBA
              </Link>
              <div className="h-8 w-px bg-slate-200" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Artist Dashboard</h1>
                <p className="text-slate-500">Manage your tours and bookings</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCreateTourModalOpen(true)}
                className="btn-primary"
              >
                <Plus size={18} />
                <span>Start a Tour</span>
              </button>
              <Link
                href="/dashboard/artist/messages"
                className="btn-secondary"
              >
                <MessageSquare size={18} />
                <span>Messages</span>
              </Link>
              <Link
                href="/dashboard/artist/settings"
                className="btn-secondary"
              >
                <Settings size={18} />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container-default py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
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
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <MapPin size={20} className="text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{tourDates.length}</p>
                <p className="text-sm text-slate-500">Confirmed Shows</p>
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
        <div className="flex gap-2 mb-6 flex-wrap">
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
          <button
            onClick={() => setActiveTab("tourDates")}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === "tourDates"
                ? "bg-primary-500 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            Confirmed Shows ({tourDates.length})
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
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                  Announce your availability and let communities invite you to perform.
                  Once you have confirmed bookings, your tour will be live!
                </p>
                <button
                  onClick={() => setIsCreateTourModalOpen(true)}
                  className="btn-primary mx-auto"
                >
                  <Plus size={18} />
                  Start Your First Tour
                </button>
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

        {activeTab === "tourDates" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Your Confirmed Shows</h3>
                <p className="text-sm text-slate-500">
                  Shows you&apos;ve confirmed - nearby communities will see these
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn-primary"
              >
                <Plus size={18} />
                Add Show
              </button>
            </div>

            {tourDates.length === 0 ? (
              <div className="card p-8 text-center">
                <MapPin size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  No Confirmed Shows Yet
                </h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                  Add your confirmed shows so nearby communities can find you.
                  They&apos;ll appear in their &quot;Events in Your Area&quot; section.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="btn-primary mx-auto"
                >
                  <Plus size={18} />
                  Add Your First Show
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tourDates.map((tourDate) => (
                  <TourDateCard
                    key={tourDate.id}
                    tourDate={tourDate}
                    onDelete={handleDeleteTourDate}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <AddTourDateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTourDate}
        isSubmitting={isSubmitting}
      />

      <CreateTourModal
        isOpen={isCreateTourModalOpen}
        onClose={() => setIsCreateTourModalOpen(false)}
        onSubmit={handleCreateNewTour}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
