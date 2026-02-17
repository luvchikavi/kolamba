"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  User,
  MessageSquare,
  Calendar,
  Quote,
  Settings,
  ExternalLink,
  Loader2,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { API_URL, DiscoverArtist, DiscoverResponse, DiscoverParams } from "@/lib/api";
import DiscoverFilters from "@/components/dashboard/DiscoverFilters";
import DiscoverArtistCard from "@/components/dashboard/DiscoverArtistCard";

interface TourDate {
  id: number;
  artist_id: number;
  location: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  is_booked: boolean;
}

interface NearbyTouringArtist {
  artist_id: number;
  artist_name: string;
  profile_image: string | null;
  tour_date: TourDate;
  distance_km: number;
}

interface DashboardCounts {
  messages: number;
  pendingQuotes: number;
  upcomingEvents: number;
}

interface UpcomingEvent {
  id: number;
  artist_name: string;
  location: string;
  date: string;
}

// Sidebar menu items (dynamic counts filled from API)
const menuConfig = [
  { label: "Messages", icon: MessageSquare, countKey: "messages" as const, href: "/dashboard/host/messages" },
  { label: "Events", icon: Calendar, countKey: "upcomingEvents" as const, href: "/dashboard/host/events" },
  { label: "Quotes", icon: Quote, countKey: "pendingQuotes" as const, href: "/dashboard/host/quotes" },
  { label: "Settings", icon: Settings, href: "/dashboard/host/settings" },
];

function EventCard({ artist }: { artist: NearbyTouringArtist }) {
  const formattedDate = new Date(artist.tour_date.start_date).toLocaleDateString("en-GB");
  const distanceText = artist.distance_km < 1
    ? "Less than 1 km away"
    : `${Math.round(artist.distance_km)} km away`;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm flex">
      {/* Artist Image */}
      <div className="relative w-48 h-48 flex-shrink-0">
        <Image
          src={artist.profile_image || "/placeholder-artist.jpg"}
          alt={artist.artist_name}
          fill
          className="object-cover"
        />
        {/* Date overlay */}
        <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded">
          {formattedDate}
        </div>
        {/* Location overlay */}
        <div className="absolute bottom-10 left-3 text-white text-xs">
          <p>Location:</p>
          <p className="font-medium">{artist.tour_date.location}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{artist.artist_name}</h3>
          <div className="flex items-center gap-1 text-sm text-slate-500 mb-1">
            <MapPin size={14} />
            <span>{distanceText}</span>
          </div>
          <p className="text-sm text-slate-500 mb-1">
            <span className="font-medium">Date:</span> {formattedDate}
            {artist.tour_date.end_date && ` - ${new Date(artist.tour_date.end_date).toLocaleDateString("en-GB")}`}
          </p>
          <p className="text-sm text-slate-500">
            <span className="font-medium">Location:</span> {artist.tour_date.location}
          </p>
          {artist.tour_date.description && (
            <p className="text-sm text-slate-400 mt-2 line-clamp-2">
              {artist.tour_date.description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <Link
            href={`/talents/${artist.artist_id}`}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-slate-900 rounded-full text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            VISIT PROFILE
            <ExternalLink size={14} />
          </Link>
          <Link
            href={`/booking/${artist.artist_id}`}
            className="px-4 py-2.5 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            MAKE IT A TOUR
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
      <MapPin size={48} className="text-slate-300 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-slate-900 mb-2">No Talents Touring Nearby</h3>
      <p className="text-slate-500 max-w-md mx-auto">
        When talents announce tour dates within 200km of your location, they&apos;ll appear here.
        Check back soon or browse all talents to send booking requests.
      </p>
      <Link
        href="/search"
        className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors"
      >
        <Search size={16} />
        BROWSE TALENTS
      </Link>
    </div>
  );
}

const DISCOVER_PAGE_SIZE = 6;

export default function CommunityDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [nearbyArtists, setNearbyArtists] = useState<NearbyTouringArtist[]>([]);
  const [userName, setUserName] = useState("Friend");
  const [communityName, setCommunityName] = useState("");
  const [communityId, setCommunityId] = useState<number | null>(null);
  const [counts, setCounts] = useState<DashboardCounts>({ messages: 0, pendingQuotes: 0, upcomingEvents: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);

  // Discover state
  const [communityEventTypes, setCommunityEventTypes] = useState<string[]>([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [discoverParams, setDiscoverParams] = useState<DiscoverParams>({
    match_interests: true,
    sort_by: "relevance",
    limit: DISCOVER_PAGE_SIZE,
    offset: 0,
  });
  const [discoverResults, setDiscoverResults] = useState<DiscoverArtist[]>([]);
  const [discoverTotal, setDiscoverTotal] = useState(0);
  const [discoverTouringCount, setDiscoverTouringCount] = useState(0);
  const [isDiscoverLoading, setIsDiscoverLoading] = useState(false);

  const fetchDiscoverArtists = useCallback(async (
    commId: number,
    params: DiscoverParams,
    append = false,
  ) => {
    setIsDiscoverLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.set(key, String(value));
        }
      });
      const query = searchParams.toString();
      const res = await fetch(
        `${API_URL}/hosts/${commId}/discover-artists${query ? `?${query}` : ""}`,
        { headers },
      );
      if (res.ok) {
        const data: DiscoverResponse = await res.json();
        setDiscoverResults((prev) => append ? [...prev, ...data.artists] : data.artists);
        setDiscoverTotal(data.total);
        // Count artists with nearby tour dates
        const touringNearby = data.artists.filter((a) => a.nearest_tour_date).length;
        if (!append) {
          setDiscoverTouringCount(touringNearby);
        } else {
          setDiscoverTouringCount((prev) => prev + touringNearby);
        }
      }
    } catch (error) {
      console.error("Failed to fetch discover artists:", error);
    } finally {
      setIsDiscoverLoading(false);
    }
  }, []);

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

      // Get community profile
      const profileRes = await fetch(`${API_URL}/auth/me`, { headers });
      if (profileRes.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (profileRes.ok) {
        const userData = await profileRes.json();
        setUserName(userData.name || "Friend");

        // Get community details using community_id from auth/me response
        const commId = userData.community_id;
        if (commId) {
          setCommunityId(commId);

          // Fetch community profile to get name and event_types
          const communityRes = await fetch(`${API_URL}/hosts/${commId}`, { headers });
          if (communityRes.ok) {
            const communityData = await communityRes.json();
            setCommunityName(communityData.name);
            const eventTypes: string[] = communityData.event_types || [];
            setCommunityEventTypes(eventTypes);
            setSelectedEventTypes(eventTypes);
          }

          // Fetch nearby touring artists
          const nearbyRes = await fetch(
            `${API_URL}/hosts/${commId}/nearby-touring-artists?radius_km=200`,
            { headers }
          );

          if (nearbyRes.ok) {
            const artists: NearbyTouringArtist[] = await nearbyRes.json();
            setNearbyArtists(artists);
          }

          // Fetch discover artists (initial load)
          fetchDiscoverArtists(commId, {
            match_interests: true,
            sort_by: "relevance",
            limit: DISCOVER_PAGE_SIZE,
            offset: 0,
          });

          // Fetch bookings to compute counts
          try {
            const bookingsRes = await fetch(`${API_URL}/bookings?community_id=${commId}`, { headers });
            if (bookingsRes.ok) {
              const bookings = await bookingsRes.json();
              const pending = bookings.filter((b: { status: string }) => b.status === "pending");
              const approved = bookings.filter((b: { status: string }) => b.status === "approved");

              setCounts((prev) => ({
                ...prev,
                pendingQuotes: pending.length,
                upcomingEvents: approved.length,
              }));

              // Build upcoming events list (next 3 approved bookings)
              const upcoming = approved
                .filter((b: { requested_date?: string }) => b.requested_date)
                .sort((a: { requested_date: string }, b: { requested_date: string }) =>
                  new Date(a.requested_date).getTime() - new Date(b.requested_date).getTime()
                )
                .slice(0, 3)
                .map((b: { id: number; location?: string; requested_date?: string }) => ({
                  id: b.id,
                  artist_name: "",
                  location: b.location || "TBD",
                  date: b.requested_date || "",
                }));
              setUpcomingEvents(upcoming);
            }
          } catch { /* ignore booking fetch errors */ }

          // Fetch messages count
          try {
            const messagesRes = await fetch(`${API_URL}/conversations`, { headers });
            if (messagesRes.ok) {
              const conversations = await messagesRes.json();
              setCounts((prev) => ({ ...prev, messages: conversations.length }));
            }
          } catch { /* ignore */ }
        }
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch discover results when filters change
  const handleDiscoverParamsChange = (newParams: DiscoverParams) => {
    const updated = { ...newParams, offset: 0, limit: DISCOVER_PAGE_SIZE };
    setDiscoverParams(updated);
    if (communityId) {
      fetchDiscoverArtists(communityId, updated);
    }
  };

  const handleEventTypesChange = (types: string[]) => {
    setSelectedEventTypes(types);
    const updated: DiscoverParams = {
      ...discoverParams,
      match_interests: types.length > 0,
      offset: 0,
      limit: DISCOVER_PAGE_SIZE,
    };
    setDiscoverParams(updated);
    if (communityId) {
      fetchDiscoverArtists(communityId, updated);
    }
  };

  const handleShowMore = () => {
    const newOffset = (discoverParams.offset || 0) + DISCOVER_PAGE_SIZE;
    const updated = { ...discoverParams, offset: newOffset };
    setDiscoverParams(updated);
    if (communityId) {
      fetchDiscoverArtists(communityId, updated, true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-100 via-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-pink-50 to-white">
      {/* Header */}
      <header className="pt-8 pb-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="bg-white rounded-full px-8 py-4 shadow-lg flex items-center gap-12">
              <Link
                href="/search"
                className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium"
              >
                <Search size={18} />
                <span className="uppercase tracking-wide text-sm">Search</span>
              </Link>

              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold tracking-wider text-slate-900">
                  KOLAMBA
                </span>
              </Link>

              <Link
                href="/dashboard/host"
                className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium"
              >
                <User size={18} />
                <span className="uppercase tracking-wide text-sm">{userName}</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Main content */}
          <div className="lg:col-span-2">
            {/* Greeting */}
            <div className="flex items-start gap-6 mb-12">
              <div className="w-16 h-16 rounded-full border-2 border-pink-300 flex items-center justify-center">
                <User size={28} className="text-pink-400" />
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-serif font-bold text-slate-900 mb-2">
                  HEY {userName.toUpperCase()}
                </h1>
                <p className="text-xl text-slate-600">
                  IT&apos;S GOOD TO SEE YOU AGAIN MEYDELE!
                </p>
                {communityName && (
                  <p className="text-sm text-slate-500 mt-2">{communityName}</p>
                )}
              </div>
            </div>

            {/* Discover Artists Section */}
            <div className="mb-16">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 italic mb-4">
                DISCOVER TALENTS
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                {discoverTotal} talent{discoverTotal !== 1 ? "s" : ""} match your interests
                {discoverTouringCount > 0 && (
                  <> &middot; {discoverTouringCount} touring nearby</>
                )}
              </p>

              <DiscoverFilters
                eventTypes={communityEventTypes}
                selectedEventTypes={selectedEventTypes}
                onEventTypesChange={handleEventTypesChange}
                params={discoverParams}
                onParamsChange={handleDiscoverParamsChange}
              />

              {isDiscoverLoading && discoverResults.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-pink-500" />
                </div>
              ) : discoverResults.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                  <Search size={40} className="text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No talents found</h3>
                  <p className="text-slate-500 text-sm">
                    Try adjusting your filters or browse all talents.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {discoverResults.map((artist) => (
                      <DiscoverArtistCard key={artist.id} artist={artist} />
                    ))}
                  </div>

                  {/* Show More button */}
                  {discoverResults.length < discoverTotal && (
                    <div className="text-center mt-6">
                      <button
                        onClick={handleShowMore}
                        disabled={isDiscoverLoading}
                        className="inline-flex items-center gap-2 px-6 py-3 border-2 border-slate-900 rounded-full text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
                      >
                        {isDiscoverLoading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : null}
                        Show More
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Events in Your Area */}
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 italic mb-8">
                EVENTS IN YOUR AREA
              </h2>

              {nearbyArtists.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-6">
                  {nearbyArtists.map((artist) => (
                    <EventCard key={`${artist.artist_id}-${artist.tour_date.id}`} artist={artist} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-8">
            {/* Navigation Menu */}
            <nav className="space-y-2">
              {menuConfig.map((item) => {
                const Icon = item.icon;
                const count = item.countKey ? counts[item.countKey] : undefined;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between px-4 py-4 text-slate-800 hover:bg-white/50 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className="text-slate-500" />
                      <span className="text-lg font-medium">{item.label}</span>
                    </div>
                    {count !== undefined && count > 0 && (
                      <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-semibold shadow-sm">
                        {count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Quick Actions */}
            <div className="bg-white/60 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/search"
                  className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
                >
                  <span>Browse Talents</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/dashboard/host/quotes"
                  className="flex items-center justify-between px-4 py-3 border-2 border-slate-900 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  <span>View Quotes {counts.pendingQuotes > 0 && `(${counts.pendingQuotes} pending)`}</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/dashboard/host/messages"
                  className="flex items-center justify-between px-4 py-3 border-2 border-slate-900 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  <span>Messages {counts.messages > 0 && `(${counts.messages})`}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Upcoming Events Summary */}
            {upcomingEvents.length > 0 && (
              <div className="bg-white/60 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Upcoming Events</h3>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center gap-3 text-sm">
                      <Calendar size={16} className="text-pink-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-800">{event.location}</p>
                        <p className="text-slate-500">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/dashboard/host/events"
                  className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-pink-600 hover:text-pink-700"
                >
                  View all events <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
