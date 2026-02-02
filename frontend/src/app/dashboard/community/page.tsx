"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  User,
  MessageSquare,
  FileText,
  Calendar,
  Quote,
  Settings,
  Bell,
  ExternalLink,
  Loader2,
  MapPin,
} from "lucide-react";
import { API_URL } from "@/lib/api";

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

interface CommunityProfile {
  id: number;
  name: string;
  location: string;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

// Sidebar menu items
const menuItems = [
  { label: "Messages", icon: MessageSquare, count: 0, href: "/dashboard/community/messages" },
  { label: "Drafts", icon: FileText, count: 2, href: "/dashboard/community/drafts" },
  { label: "Events", icon: Calendar, href: "/dashboard/community/events" },
  { label: "Quotes", icon: Quote, href: "/dashboard/community/quotes" },
  { label: "Settings", icon: Settings, href: "/dashboard/community/settings" },
  { label: "Privacy & Notifications", icon: Bell, href: "/dashboard/community/privacy" },
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
            href={`/artists/${artist.artist_id}`}
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
      <h3 className="text-lg font-bold text-slate-900 mb-2">No Artists Touring Nearby</h3>
      <p className="text-slate-500 max-w-md mx-auto">
        When artists announce tour dates within 200km of your location, they&apos;ll appear here.
        Check back soon or browse all artists to send booking requests.
      </p>
      <Link
        href="/search"
        className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors"
      >
        <Search size={16} />
        BROWSE ARTISTS
      </Link>
    </div>
  );
}

export default function CommunityDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [nearbyArtists, setNearbyArtists] = useState<NearbyTouringArtist[]>([]);
  const [userName, setUserName] = useState("Friend");
  const [communityName, setCommunityName] = useState("");
  const [communityId, setCommunityId] = useState<number | null>(null);

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

          // Fetch community profile to get name
          const communityRes = await fetch(`${API_URL}/communities/${commId}`, { headers });
          if (communityRes.ok) {
            const communityData = await communityRes.json();
            setCommunityName(communityData.name);
          }

          // Fetch nearby touring artists
          const nearbyRes = await fetch(
            `${API_URL}/communities/${commId}/nearby-touring-artists?radius_km=200`,
            { headers }
          );

          if (nearbyRes.ok) {
            const artists: NearbyTouringArtist[] = await nearbyRes.json();
            setNearbyArtists(artists);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
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
                href="/dashboard/community"
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
          {/* Left: Greeting */}
          <div className="lg:col-span-2">
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

          {/* Right: Sidebar Menu */}
          <div>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between px-4 py-4 text-slate-800 hover:bg-white/50 rounded-xl transition-colors"
                  >
                    <span className="text-lg font-medium">{item.label}</span>
                    {item.count !== undefined && (
                      <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-semibold shadow-sm">
                        {item.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
