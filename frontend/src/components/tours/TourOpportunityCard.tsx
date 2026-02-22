"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { API_URL } from "@/lib/api";

interface TourArtist {
  id: number;
  name_en: string | null;
  name_he: string | null;
  profile_image: string | null;
  category: string | null;
}

interface NearbyBooking {
  id: number;
  location: string;
  requested_date: string | null;
  distance_km: number | null;
}

interface TourOpportunity {
  tour_id?: number;
  id?: number;  // New schema uses id
  tour_name?: string;
  name?: string;  // New schema uses name
  artist: TourArtist;
  region: string;
  start_date: string | null;
  end_date: string | null;
  nearest_booking?: NearbyBooking | null;
  distance_to_nearest_km?: number | null;
  total_stops?: number;
  confirmed_shows?: number;  // New schema
  status: string;
  estimated_savings?: number | null;
  price_tier?: string | null;  // New: $, $$, or $$$
  description?: string | null;
}

interface TourOpportunityCardProps {
  tour: TourOpportunity;
  onJoinRequest?: (tourId: number) => void;
  communityId: number;
}

export default function TourOpportunityCard({
  tour,
  onJoinRequest,
  communityId,
}: TourOpportunityCardProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const artistName = tour.artist.name_en || tour.artist.name_he || "Unknown Artist";
  const tourId = tour.tour_id || tour.id || 0;
  const tourName = tour.tour_name || tour.name || "Tour";
  const totalStops = tour.total_stops ?? tour.confirmed_shows ?? 0;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleJoinRequest = async () => {
    if (requestSent || !tourId) return;

    setIsRequesting(true);
    try {
      const response = await fetch(
        `${API_URL}/tours/${tourId}/join-request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            community_id: communityId,
            notes: "Interested in joining this tour",
          }),
        }
      );

      if (response.ok) {
        setRequestSent(true);
        onJoinRequest?.(tourId);
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to send request");
      }
    } catch (error) {
      console.error("Failed to send join request:", error);
    } finally {
      setIsRequesting(false);
    }
  };

  const getStatusBadge = () => {
    switch (tour.status) {
      case "approved":
        return "bg-emerald-100 text-emerald-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "confirmed":
        return "bg-emerald-100 text-emerald-700";
      case "proposed":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusLabel = () => {
    switch (tour.status) {
      case "approved":
        return "Confirmed";
      case "pending":
        return "Open";
      case "confirmed":
        return "Confirmed";
      case "proposed":
        return "Open";
      default:
        return tour.status;
    }
  };

  return (
    <div className="card p-0 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Artist Header */}
      <div className="flex items-center gap-4 p-4 border-b border-slate-100">
        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
          {tour.artist.profile_image ? (
            <Image
              src={tour.artist.profile_image}
              alt={artistName}
              fill
              unoptimized={tour.artist.profile_image.startsWith("http")}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-lg font-semibold">
              {artistName[0]}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={`/talents/${tour.artist.id}`}
            className="font-semibold text-slate-900 hover:text-primary-600 transition-colors line-clamp-1"
          >
            {artistName}
          </Link>
          {tour.artist.category && (
            <p className="text-sm text-slate-500">{tour.artist.category}</p>
          )}
        </div>
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge()}`}
        >
          {getStatusLabel()}
        </span>
      </div>

      {/* Tour Details */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-slate-800">{tourName}</h3>

        {tour.description && (
          <p className="text-sm text-slate-600 line-clamp-2">{tour.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin size={16} className="text-slate-400" />
            <span className="line-clamp-1">{tour.region}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <Calendar size={16} className="text-slate-400" />
            <span>
              {formatDate(tour.start_date)} - {formatDate(tour.end_date)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <Users size={16} className="text-slate-400" />
            <span>{totalStops} {totalStops === 1 ? "show" : "shows"} confirmed</span>
          </div>

          {tour.price_tier && (
            <span className="text-primary-600 font-semibold">{tour.price_tier}</span>
          )}

          {tour.distance_to_nearest_km && (
            <div className="flex items-center gap-2 text-primary-600 font-medium col-span-2">
              <MapPin size={16} />
              <span>{Math.round(tour.distance_to_nearest_km)} km away</span>
            </div>
          )}
        </div>

        {/* Nearest Location */}
        {tour.nearest_booking && (
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Nearest stop:</p>
            <p className="text-sm font-medium text-slate-700">
              {tour.nearest_booking.location}
            </p>
            {tour.nearest_booking.requested_date && (
              <p className="text-xs text-slate-500 mt-1">
                {formatDate(tour.nearest_booking.requested_date)}
              </p>
            )}
          </div>
        )}

        {/* Estimated Savings */}
        {tour.estimated_savings && tour.estimated_savings > 0 && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg">
            <Sparkles size={18} className="text-emerald-600" />
            <div>
              <p className="text-xs text-emerald-700">Estimated savings</p>
              <p className="font-semibold text-emerald-800">
                ${tour.estimated_savings.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <Link
          href={`/talents/${tour.artist.id}`}
          className="flex-1 btn-secondary text-center justify-center text-sm"
        >
          View Artist
        </Link>
        <button
          onClick={handleJoinRequest}
          disabled={isRequesting || requestSent}
          className={`flex-1 text-sm justify-center inline-flex items-center gap-2 ${
            requestSent
              ? "bg-emerald-100 text-emerald-700 cursor-default px-4 py-2.5 rounded-xl font-medium"
              : "btn-primary"
          }`}
        >
          {isRequesting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </>
          ) : requestSent ? (
            "Request Sent"
          ) : (
            <>
              Request to Join
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
