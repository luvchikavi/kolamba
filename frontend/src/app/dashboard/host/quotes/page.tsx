"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { API_URL } from "@/lib/api";
import { showSuccess, showError } from "@/lib/toast";

interface Booking {
  id: number;
  artist_id: number;
  artist_name?: string;
  requested_date?: string;
  location?: string;
  budget?: number;
  notes?: string;
  status: string;
  created_at: string;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    pending: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock },
    confirmed: { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle },
    cancelled: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
    completed: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle },
  };

  const { bg, text, icon: Icon } = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full ${bg} ${text}`}>
      <Icon size={14} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function CommunityQuotesPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError("Failed to load your quotes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm("Are you sure you want to cancel this booking request?")) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }

      // Update local state - change status to cancelled
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
      );

      showSuccess("Booking request cancelled successfully");
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      showError("Failed to cancel the booking request. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-100 via-pink-50 to-white flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-pink-50 to-white pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Link
          href="/dashboard/host"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        {/* Page Title */}
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 italic mb-8">
          YOUR QUOTES
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <MessageSquare size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Quotes Yet</h3>
            <p className="text-slate-600 mb-6">
              You haven&apos;t requested any quotes from artists yet.
            </p>
            <Link
              href="/search"
              className="inline-block px-6 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-colors"
            >
              Browse Artists
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {booking.artist_name || `Artist #${booking.artist_id}`}
                    </h3>
                    <p className="text-sm text-slate-500">
                      Requested on {new Date(booking.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  {booking.requested_date && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar size={16} className="text-slate-400" />
                      <span>{new Date(booking.requested_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {booking.location && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin size={16} className="text-slate-400" />
                      <span>{booking.location}</span>
                    </div>
                  )}
                  {booking.budget && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <DollarSign size={16} className="text-slate-400" />
                      <span>${booking.budget}</span>
                    </div>
                  )}
                </div>

                {booking.notes && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">{booking.notes}</p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-3">
                  <Link
                    href={`/talents/${booking.artist_id}`}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"
                  >
                    View Artist
                  </Link>
                  {booking.status === "pending" && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={cancellingId === booking.id}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancellingId === booking.id ? "Cancelling..." : "Cancel Request"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
