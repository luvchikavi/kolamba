"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle,
  Loader2,
  ExternalLink,
  Clock,
} from "lucide-react";
import { API_URL } from "@/lib/api";

interface Booking {
  id: number;
  artist_id: number;
  artist_name?: string;
  artist_image?: string;
  requested_date?: string;
  location?: string;
  budget?: number;
  notes?: string;
  status: string;
  created_at: string;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getTimeUntilEvent(dateStr: string) {
  const eventDate = new Date(dateStr);
  const now = new Date();
  const diffTime = eventDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Past event";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays <= 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
  return `In ${Math.ceil(diffDays / 30)} months`;
}

function EventCard({ booking }: { booking: Booking }) {
  const isPastEvent = booking.requested_date
    ? new Date(booking.requested_date) < new Date()
    : false;

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden shadow-sm ${
        isPastEvent ? "opacity-60" : ""
      }`}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Artist Image */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
            {booking.artist_image ? (
              <Image
                src={booking.artist_image}
                alt={booking.artist_name || "Artist"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xl font-bold">
                {(booking.artist_name || "A")[0]}
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {booking.artist_name || `Artist #${booking.artist_id}`}
                </h3>
                {booking.requested_date && (
                  <p className="text-sm text-slate-500">
                    {formatDate(booking.requested_date)}
                  </p>
                )}
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full ${
                  isPastEvent
                    ? "bg-slate-100 text-slate-600"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                <CheckCircle size={14} />
                {isPastEvent ? "Completed" : "Confirmed"}
              </span>
            </div>

            {/* Time indicator */}
            {booking.requested_date && !isPastEvent && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-primary-600 font-medium">
                <Clock size={14} />
                {getTimeUntilEvent(booking.requested_date)}
              </div>
            )}
          </div>
        </div>

        {/* Event Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-sm">
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
              <span>${booking.budget.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Notes preview */}
        {booking.notes && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 line-clamp-2">{booking.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex gap-3">
          <Link
            href={`/talents/${booking.artist_id}`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"
          >
            View Artist
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
      <Calendar size={48} className="text-slate-300 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-slate-900 mb-2">No Confirmed Events</h3>
      <p className="text-slate-600 max-w-md mx-auto mb-6">
        When your booking requests are confirmed by artists, they&apos;ll appear here
        as upcoming events.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/dashboard/host/quotes"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-900 text-slate-900 rounded-full text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          View Your Quotes
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors"
        >
          Browse Artists
        </Link>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
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
        throw new Error("Failed to fetch events");
      }

      const data: Booking[] = await response.json();

      // Filter for confirmed/approved events and sort by date
      const confirmedEvents = data
        .filter((b) => b.status === "approved" || b.status === "confirmed" || b.status === "completed")
        .sort((a, b) => {
          if (!a.requested_date) return 1;
          if (!b.requested_date) return -1;
          return new Date(a.requested_date).getTime() - new Date(b.requested_date).getTime();
        });

      setEvents(confirmedEvents);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError("Failed to load your events. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    );
  }

  // Separate upcoming and past events
  const now = new Date();
  const upcomingEvents = events.filter(
    (e) => !e.requested_date || new Date(e.requested_date) >= now
  );
  const pastEvents = events.filter(
    (e) => e.requested_date && new Date(e.requested_date) < now
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
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
        <h1 className="text-2xl font-bold text-slate-900 mb-8">
          Your Events
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {events.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-8">
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-emerald-600" />
                  Upcoming Events ({upcomingEvents.length})
                </h2>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <EventCard key={event.id} booking={event} />
                  ))}
                </div>
              </section>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <CheckCircle size={20} className="text-slate-400" />
                  Past Events ({pastEvents.length})
                </h2>
                <div className="space-y-4">
                  {pastEvents.map((event) => (
                    <EventCard key={event.id} booking={event} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
