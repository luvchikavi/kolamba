"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Loader2,
  Music,
} from "lucide-react";
import { API_URL } from "@/lib/api";

interface TourStop {
  id: number;
  date: string;
  city: string | null;
  venue_name: string | null;
  status: string;
  sequence_order: number;
}

interface TourDetail {
  id: number;
  name: string;
  region: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  status: string;
  price_tier: string | null;
  artist_id: number;
  stops: TourStop[];
  bookings: { id: number; location: string | null; requested_date: string | null; status: string }[];
}

interface ArtistInfo {
  id: number;
  name_en: string | null;
  name_he: string | null;
  profile_image: string | null;
  city: string | null;
  country: string | null;
}

export default function PublicTourDetailPage() {
  const params = useParams();
  const tourId = params.tourId as string;
  const [tour, setTour] = useState<TourDetail | null>(null);
  const [artist, setArtist] = useState<ArtistInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await fetch(`${API_URL}/tours/${tourId}`);
        if (res.ok) {
          const data: TourDetail = await res.json();
          setTour(data);

          // Fetch artist info
          const artistRes = await fetch(`${API_URL}/talents/${data.artist_id}`);
          if (artistRes.ok) {
            const artistData = await artistRes.json();
            setArtist(artistData);
          }
        }
      } catch (error) {
        console.error("Failed to fetch tour:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTour();
  }, [tourId]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateShort = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24">
        <div className="container mx-auto px-4 max-w-4xl text-center py-16">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Tour Not Found</h1>
          <p className="text-slate-500 mb-6">This tour may have been removed or doesn&apos;t exist.</p>
          <Link href="/tours" className="btn-primary inline-flex">
            Browse Tours
          </Link>
        </div>
      </div>
    );
  }

  const artistName = artist?.name_en || artist?.name_he || "Artist";
  const confirmedStops = tour.stops.filter((s) => s.status === "confirmed");
  const sortedStops = [...tour.stops].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const stopStatusStyles: Record<string, string> = {
    confirmed: "bg-emerald-100 text-emerald-700",
    open: "bg-amber-100 text-amber-700",
    inquiry: "bg-blue-100 text-blue-700",
    recommended: "bg-violet-100 text-violet-700",
    rest_day: "bg-slate-100 text-slate-500",
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back link */}
        <Link
          href="/tours"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Tours
        </Link>

        {/* Tour Header */}
        <div className="card p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Artist avatar */}
            {artist && (
              <Link href={`/talents/${artist.id}`} className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-accent-100">
                  {artist.profile_image ? (
                    <img
                      src={artist.profile_image}
                      alt={artistName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/60">
                      {artistName[0]}
                    </div>
                  )}
                </div>
              </Link>
            )}

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{tour.name}</h1>
                  {artist && (
                    <Link
                      href={`/talents/${artist.id}`}
                      className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
                    >
                      {artistName}
                    </Link>
                  )}
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full flex-shrink-0 ${
                    tour.status === "approved"
                      ? "bg-emerald-100 text-emerald-700"
                      : tour.status === "completed"
                      ? "bg-violet-100 text-violet-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {tour.status === "approved" ? "Confirmed" : tour.status === "pending" ? "Open" : tour.status}
                </span>
              </div>

              {tour.description && (
                <p className="text-slate-600 mb-4">{tour.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-slate-400" />
                  <span>{tour.region}</span>
                </div>
                {tour.start_date && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={16} className="text-slate-400" />
                    <span>
                      {formatDateShort(tour.start_date)}
                      {tour.end_date && ` – ${formatDate(tour.end_date)}`}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Users size={16} className="text-slate-400" />
                  <span>{confirmedStops.length} confirmed {confirmedStops.length === 1 ? "stop" : "stops"}</span>
                </div>
                {tour.price_tier && (
                  <span className="text-primary-600 font-semibold">{tour.price_tier}</span>
                )}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-3">
            <Link
              href={`/booking/${tour.artist_id}?tour=${tour.id}`}
              className="btn-primary"
            >
              <Music size={18} />
              Book This Tour
            </Link>
            <Link
              href={`/talents/${tour.artist_id}`}
              className="btn-secondary"
            >
              View Artist Profile
            </Link>
          </div>
        </div>

        {/* Tour Schedule */}
        {sortedStops.length > 0 && (
          <div className="card p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Tour Schedule</h2>
            <p className="text-sm text-slate-500 mb-6">
              {sortedStops.length} {sortedStops.length === 1 ? "stop" : "stops"} planned
            </p>

            <div className="space-y-3">
              {sortedStops.map((stop, idx) => (
                <div
                  key={stop.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  {/* Sequence number */}
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {idx + 1}
                  </div>

                  {/* Stop details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-slate-900 truncate">
                        {stop.city || stop.venue_name || "TBD"}
                      </p>
                      {stop.venue_name && stop.city && (
                        <span className="text-sm text-slate-500 truncate hidden sm:inline">
                          · {stop.venue_name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <Calendar size={14} className="text-slate-400" />
                      <span>{formatDate(stop.date)}</span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                      stopStatusStyles[stop.status] || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {stop.status === "rest_day" ? "Rest Day" : stop.status.charAt(0).toUpperCase() + stop.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state for stops */}
        {sortedStops.length === 0 && (
          <div className="card p-8 text-center mb-6">
            <MapPin size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="font-bold text-lg text-slate-900 mb-2">No Stops Announced Yet</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              The artist hasn&apos;t added stops to this tour yet. Book now to be one of the first!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
