"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  MapPin,
  Users,
  Loader2,
  Plus,
  X,
  Clock,
  Shield,
  Gauge,
} from "lucide-react";
import { API_URL } from "@/lib/api";

interface Booking {
  id: number;
  artist_id: number;
  community_id: number;
  requested_date: string | null;
  location: string | null;
  budget: number | null;
  notes: string | null;
  status: string;
  created_at: string;
}

interface TourStop {
  id: number;
  tour_id: number;
  booking_id: number | null;
  date: string;
  city: string | null;
  venue_name: string | null;
  sequence_order: number;
  travel_from_prev: string | null;
  travel_cost: number | null;
  accommodation_cost: number | null;
  performance_fee: number | null;
  net_revenue: number | null;
  status: string;
  notes: string | null;
}

interface Tour {
  id: number;
  artist_id: number;
  name: string;
  region: string | null;
  start_date: string | null;
  end_date: string | null;
  total_budget: number | null;
  price_per_show: number | null;
  price_tier: string | null;
  description: string | null;
  status: string;
  confirmed_shows: number;
  // Constraint fields
  max_travel_hours: number | null;
  min_shows_per_week: number | null;
  max_shows_per_week: number | null;
  rest_day_rule: string | null;
  min_net_profit: number | null;
  efficiency_score: number | null;
  visa_status: string | null;
  bookings: Booking[];
  stops: TourStop[];
  created_at: string;
}

const REST_DAY_LABELS: Record<string, string> = {
  every_wednesday: "Every Wednesday",
  every_saturday: "Every Saturday",
  after_3_consecutive: "After 3 Consecutive Shows",
};

const VISA_STATUS_STYLES: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-700",
  in_process: "bg-amber-100 text-amber-700",
  not_required: "bg-slate-100 text-slate-600",
};

const VISA_STATUS_LABELS: Record<string, string> = {
  approved: "Visa Approved",
  in_process: "Visa In Process",
  not_required: "Visa Not Required",
};

const STOP_STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700",
  open: "bg-amber-100 text-amber-700",
  rest_day: "bg-slate-100 text-slate-500",
  inquiry: "bg-blue-100 text-blue-700",
  recommended: "bg-violet-100 text-violet-700",
};

const STOP_STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  open: "Open",
  rest_day: "Rest Day",
  inquiry: "Inquiry",
  recommended: "Recommended",
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    completed: "bg-violet-100 text-violet-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function AddStopModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    date: string;
    city?: string;
    venue_name?: string;
    status: string;
    notes?: string;
  }) => void;
  isSubmitting: boolean;
}) {
  const [stopDate, setStopDate] = useState("");
  const [city, setCity] = useState("");
  const [venueName, setVenueName] = useState("");
  const [stopStatus, setStopStatus] = useState("open");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      date: stopDate,
      city: city || undefined,
      venue_name: venueName || undefined,
      status: stopStatus,
      notes: notes || undefined,
    });
  };

  useEffect(() => {
    if (!isOpen) {
      setStopDate("");
      setCity("");
      setVenueName("");
      setStopStatus("open");
      setNotes("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Add Tour Stop</h2>
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
              Date *
            </label>
            <input
              type="date"
              value={stopDate}
              onChange={(e) => setStopDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., Boston, MA"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Venue / Organization
            </label>
            <input
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="e.g., Community Center"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              value={stopStatus}
              onChange={(e) => setStopStatus(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="open">Open Slot</option>
              <option value="confirmed">Confirmed Show</option>
              <option value="inquiry">Inquiry</option>
              <option value="rest_day">Rest Day</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this stop"
              rows={2}
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
              disabled={isSubmitting || !stopDate}
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
                  Add Stop
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TourDetailsPage() {
  const params = useParams();
  const tourId = params.tourId as string;

  const [tour, setTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddStopOpen, setIsAddStopOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTour = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(`${API_URL}/tours/${tourId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch tour details");
      }

      const data: Tour = await response.json();
      setTour(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tour");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTour();
  }, [tourId]);

  const handleAddStop = async (data: {
    date: string;
    city?: string;
    venue_name?: string;
    status: string;
    notes?: string;
  }) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/tours/${tourId}/stops`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsAddStopOpen(false);
        await fetchTour();
      }
    } catch (error) {
      console.error("Failed to add tour stop:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStop = async (stopId: number) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/tours/${tourId}/stops/${stopId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await fetchTour();
      }
    } catch (error) {
      console.error("Failed to delete tour stop:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20">
        <div className="container-default py-10 text-center">
          <p className="text-red-500 mb-4">{error || "Tour not found"}</p>
          <Link href="/dashboard/talent" className="text-primary-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const totalRevenue = tour.bookings
    .filter((b) => b.status === "approved" || b.status === "confirmed")
    .reduce((sum, b) => sum + (b.budget || 0), 0);

  const hasConstraints =
    tour.max_travel_hours != null ||
    tour.min_shows_per_week != null ||
    tour.max_shows_per_week != null ||
    tour.rest_day_rule ||
    tour.min_net_profit != null;

  const sortedStops = [...(tour.stops || [])].sort(
    (a, b) => a.sequence_order - b.sequence_order || new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="bg-white border-b border-slate-100">
        <div className="container-default py-6">
          <Link
            href="/dashboard/talent"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{tour.name}</h1>
                <StatusBadge status={tour.status} />
                {tour.visa_status && (
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      VISA_STATUS_STYLES[tour.visa_status] || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {VISA_STATUS_LABELS[tour.visa_status] || tour.visa_status}
                  </span>
                )}
                {tour.efficiency_score != null && (
                  <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                    <Gauge size={12} />
                    {tour.efficiency_score}%
                  </span>
                )}
              </div>
              {tour.region && <p className="text-slate-500 mt-1">{tour.region}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="container-default py-8">
        {/* Tour Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Calendar size={20} className="text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Dates</p>
                <p className="text-sm font-medium">
                  {tour.start_date
                    ? `${new Date(tour.start_date).toLocaleDateString()} - ${tour.end_date ? new Date(tour.end_date).toLocaleDateString() : "TBD"}`
                    : "Not set"}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Users size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Confirmed Shows</p>
                <p className="text-sm font-medium">{tour.confirmed_shows}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <DollarSign size={20} className="text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Price per Show</p>
                <p className="text-sm font-medium">
                  {tour.price_per_show ? `$${tour.price_per_show.toLocaleString()}` : "Not set"}
                  {tour.price_tier && ` (${tour.price_tier})`}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <DollarSign size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Confirmed Revenue</p>
                <p className="text-sm font-medium">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {tour.description && (
          <div className="card p-6 mb-8">
            <h2 className="font-bold text-slate-900 mb-2">Description</h2>
            <p className="text-slate-600">{tour.description}</p>
          </div>
        )}

        {/* Tour Rules Card */}
        {hasConstraints && (
          <div className="card p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={18} className="text-primary-600" />
              <h2 className="font-bold text-slate-900">Tour Rules</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tour.max_travel_hours != null && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Clock size={16} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Max Travel Between Shows</p>
                    <p className="text-sm font-medium">{tour.max_travel_hours} hours</p>
                  </div>
                </div>
              )}
              {(tour.min_shows_per_week != null || tour.max_shows_per_week != null) && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Calendar size={16} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Shows per Week</p>
                    <p className="text-sm font-medium">
                      {tour.min_shows_per_week != null && tour.max_shows_per_week != null
                        ? `${tour.min_shows_per_week} - ${tour.max_shows_per_week}`
                        : tour.min_shows_per_week != null
                        ? `Min ${tour.min_shows_per_week}`
                        : `Max ${tour.max_shows_per_week}`}
                    </p>
                  </div>
                </div>
              )}
              {tour.rest_day_rule && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Calendar size={16} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Rest Day Rule</p>
                    <p className="text-sm font-medium">
                      {REST_DAY_LABELS[tour.rest_day_rule] || tour.rest_day_rule}
                    </p>
                  </div>
                </div>
              )}
              {tour.min_net_profit != null && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <DollarSign size={16} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Min Net Profit Target</p>
                    <p className="text-sm font-medium">${tour.min_net_profit.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stops Table */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg text-slate-900">
              Tour Stops ({sortedStops.length})
            </h2>
            <button
              onClick={() => setIsAddStopOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors text-sm"
            >
              <Plus size={16} />
              Add Stop
            </button>
          </div>

          {sortedStops.length === 0 ? (
            <div className="card p-8 text-center">
              <MapPin size={48} className="text-slate-300 mx-auto mb-4" />
              <h3 className="font-bold text-lg text-slate-900 mb-2">No Stops Yet</h3>
              <p className="text-slate-500 mb-4">
                Add anchor shows, open slots, or rest days to plan your route.
              </p>
              <button
                onClick={() => setIsAddStopOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
              >
                <Plus size={16} />
                Add First Stop
              </button>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Date</th>
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">City / Venue</th>
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Travel</th>
                      <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Est. Net Revenue</th>
                      <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedStops.map((stop) => (
                      <tr key={stop.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-900 whitespace-nowrap">
                          {new Date(stop.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="text-slate-900">{stop.city || "TBD"}</div>
                          {stop.venue_name && (
                            <div className="text-xs text-slate-500">{stop.venue_name}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                              STOP_STATUS_STYLES[stop.status] || "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {STOP_STATUS_LABELS[stop.status] || stop.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          {stop.travel_from_prev || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-slate-900 font-medium">
                          {stop.net_revenue != null
                            ? `$${stop.net_revenue.toLocaleString()}`
                            : stop.performance_fee != null
                            ? `$${stop.performance_fee.toLocaleString()}`
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteStop(stop.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                            title="Remove stop"
                          >
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Bookings List */}
        <div>
          <h2 className="font-bold text-lg text-slate-900 mb-4">
            Bookings ({tour.bookings.length})
          </h2>
          {tour.bookings.length === 0 ? (
            <div className="card p-8 text-center">
              <Users size={48} className="text-slate-300 mx-auto mb-4" />
              <h3 className="font-bold text-lg text-slate-900 mb-2">No Bookings Yet</h3>
              <p className="text-slate-500">
                Communities will send booking requests when they see your tour.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tour.bookings.map((booking) => (
                <div key={booking.id} className="card p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin size={14} className="text-slate-400" />
                        <span className="font-medium text-slate-900">
                          {booking.location || "Location TBD"}
                        </span>
                        <StatusBadge status={booking.status} />
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        {booking.requested_date && (
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(booking.requested_date).toLocaleDateString()}
                          </span>
                        )}
                        {booking.budget != null && (
                          <span className="flex items-center gap-1">
                            <DollarSign size={14} />
                            ${booking.budget.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {booking.notes && (
                        <p className="text-sm text-slate-500 mt-2 line-clamp-2">{booking.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AddStopModal
        isOpen={isAddStopOpen}
        onClose={() => setIsAddStopOpen(false)}
        onSubmit={handleAddStop}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
