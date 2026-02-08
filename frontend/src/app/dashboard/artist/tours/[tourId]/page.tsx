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
  bookings: Booking[];
  created_at: string;
}

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

export default function TourDetailsPage() {
  const params = useParams();
  const tourId = params.tourId as string;

  const [tour, setTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    fetchTour();
  }, [tourId]);

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
          <Link href="/dashboard/artist" className="text-primary-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const totalRevenue = tour.bookings
    .filter((b) => b.status === "approved" || b.status === "confirmed")
    .reduce((sum, b) => sum + (b.budget || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="bg-white border-b border-slate-100">
        <div className="container-default py-6">
          <Link
            href="/dashboard/artist"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{tour.name}</h1>
              {tour.region && <p className="text-slate-500">{tour.region}</p>}
            </div>
            <StatusBadge status={tour.status} />
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
    </div>
  );
}
