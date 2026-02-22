"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  MessageSquare,
  Settings,
  Loader2,
  Clock,
  Calendar,
  DollarSign,
  CheckCircle,
  Users,
  MapPin,
  XCircle,
} from "lucide-react";
import { API_URL, DiscoverArtist, DiscoverResponse, DiscoverParams } from "@/lib/api";
import DiscoverFilters from "@/components/dashboard/DiscoverFilters";
import DiscoverArtistCard from "@/components/dashboard/DiscoverArtistCard";

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
  quote_amount?: number;
  quote_notes?: string;
  quoted_at?: string;
  decline_reason?: string;
}

interface ConversationListItem {
  id: number;
  booking_id: number;
  artist_name: string | null;
  community_name: string | null;
  last_message: string | null;
  message_count: number;
  booking_status: string | null;
  updated_at: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    quote_sent: "bg-blue-100 text-blue-700",
    approved: "bg-emerald-100 text-emerald-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    declined: "bg-red-100 text-red-700",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-violet-100 text-violet-700",
  };

  const icons: Record<string, React.ElementType> = {
    pending: Clock,
    quote_sent: DollarSign,
    approved: CheckCircle,
    confirmed: CheckCircle,
    declined: XCircle,
    cancelled: XCircle,
    completed: CheckCircle,
  };

  const labels: Record<string, string> = {
    quote_sent: "Quote Received",
  };

  const Icon = icons[status] || Clock;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      <Icon size={12} />
      {labels[status] || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

const DISCOVER_PAGE_SIZE = 6;

export default function HostDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [communityId, setCommunityId] = useState<number | null>(null);
  const [communityName, setCommunityName] = useState("");
  const [activeTab, setActiveTab] = useState<"quotes" | "events" | "messages" | "discover">("quotes");

  // Bookings data (for quotes + events + stats)
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [decliningId, setDecliningId] = useState<number | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  // Conversations data
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);

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

  const getToken = () => localStorage.getItem("access_token");

  const fetchDiscoverArtists = useCallback(async (
    commId: number,
    params: DiscoverParams,
    append = false,
  ) => {
    setIsDiscoverLoading(true);
    try {
      const token = getToken();
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
      const token = getToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Get user profile
      const profileRes = await fetch(`${API_URL}/auth/me`, { headers });
      if (profileRes.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (profileRes.ok) {
        const userData = await profileRes.json();
        const commId = userData.community_id;

        if (commId) {
          setCommunityId(commId);

          // Fetch community profile
          const communityRes = await fetch(`${API_URL}/hosts/${commId}`, { headers });
          if (communityRes.ok) {
            const communityData = await communityRes.json();
            setCommunityName(communityData.name);
            const eventTypes: string[] = communityData.event_types || [];
            setCommunityEventTypes(eventTypes);
            setSelectedEventTypes(eventTypes);
          }

          // Fetch bookings, conversations, and discover artists in parallel
          const [bookingsRes, conversationsRes] = await Promise.all([
            fetch(`${API_URL}/bookings/my-bookings`, { headers }),
            fetch(`${API_URL}/conversations`, { headers }),
          ]);

          if (bookingsRes.ok) {
            const bookingsData: Booking[] = await bookingsRes.json();
            setBookings(bookingsData);
          }

          if (conversationsRes.ok) {
            const conversationsData: ConversationListItem[] = await conversationsRes.json();
            setConversations(conversationsData);
          }

          // Fetch discover artists (initial load)
          fetchDiscoverArtists(commId, {
            match_interests: true,
            sort_by: "relevance",
            limit: DISCOVER_PAGE_SIZE,
            offset: 0,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm("Are you sure you want to cancel this booking request?")) return;

    setCancellingId(bookingId);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
        );
      }
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    } finally {
      setCancellingId(null);
    }
  };

  const handleRespondToQuote = async (bookingId: number, action: "approve" | "decline") => {
    if (action === "approve" && !confirm("Are you sure you want to approve this booking?")) return;

    setRespondingId(bookingId);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/bookings/${bookingId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          decline_reason: action === "decline" ? declineReason || null : null,
        }),
      });
      if (res.ok) {
        const updatedBooking = await res.json();
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: updatedBooking.status, quote_amount: updatedBooking.quote_amount } : b))
        );
        setDecliningId(null);
        setDeclineReason("");
      }
    } catch (error) {
      console.error("Failed to respond to quote:", error);
    } finally {
      setRespondingId(null);
    }
  };

  // Discover filters handlers
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

  // Computed stats
  const pendingQuotes = bookings.filter((b) => b.status === "pending" || b.status === "quote_sent");
  const confirmedEvents = bookings.filter((b) => b.status === "approved" || b.status === "confirmed");
  const totalSpent = bookings
    .filter((b) => b.status === "approved" || b.status === "confirmed" || b.status === "completed")
    .reduce((sum, b) => sum + (b.budget || 0), 0);

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
                <h1 className="text-2xl font-bold text-slate-900">Host Dashboard</h1>
                <p className="text-slate-500">{communityName || "Manage your bookings and events"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/search" className="btn-primary">
                <Search size={18} />
                <span>Browse Talents</span>
              </Link>
              <Link href="/dashboard/host/messages" className="btn-secondary">
                <MessageSquare size={18} />
                <span>Messages</span>
              </Link>
              <Link href="/dashboard/host/settings" className="btn-secondary">
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
                <p className="text-2xl font-bold text-slate-900">{pendingQuotes.length}</p>
                <p className="text-sm text-slate-500">Pending Quotes</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <MessageSquare size={20} className="text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{conversations.length}</p>
                <p className="text-sm text-slate-500">Active Conversations</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Calendar size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{confirmedEvents.length}</p>
                <p className="text-sm text-slate-500">Upcoming Events</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <Users size={20} className="text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{bookings.length}</p>
                <p className="text-sm text-slate-500">Total Bookings</p>
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
                  ${totalSpent.toLocaleString()}
                </p>
                <p className="text-sm text-slate-500">Total Spent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab("quotes")}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === "quotes"
                ? "bg-primary-500 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            Quotes ({pendingQuotes.length})
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === "events"
                ? "bg-primary-500 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            Events ({confirmedEvents.length})
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === "messages"
                ? "bg-primary-500 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            Messages ({conversations.length})
          </button>
          <button
            onClick={() => setActiveTab("discover")}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === "discover"
                ? "bg-primary-500 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            Discover Talents ({discoverTotal})
          </button>
        </div>

        {/* Tab Content */}

        {/* Quotes Tab */}
        {activeTab === "quotes" && (
          <div className="space-y-4">
            {pendingQuotes.length === 0 ? (
              <div className="card p-8 text-center">
                <Clock size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-slate-900 mb-2">No Pending Quotes</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                  When you send booking requests to talents, they&apos;ll appear here.
                </p>
                <Link href="/search" className="btn-primary mx-auto">
                  <Search size={18} />
                  Browse Talents
                </Link>
              </div>
            ) : (
              pendingQuotes.map((booking) => (
                <div key={booking.id} className={`card p-6 ${booking.status === "quote_sent" ? "border-2 border-blue-200" : ""}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">
                        {booking.artist_name || `Artist #${booking.artist_id}`}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Requested on {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  {/* Quote amount display for quote_sent bookings */}
                  {booking.status === "quote_sent" && booking.quote_amount != null && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-slate-600">Quoted Price</span>
                        <span className="text-xl font-bold text-slate-900">${booking.quote_amount.toLocaleString()}</span>
                      </div>
                      {booking.quote_notes && (
                        <p className="text-sm text-slate-600 mt-2">{booking.quote_notes}</p>
                      )}
                    </div>
                  )}

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
                    {booking.budget != null && (
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

                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-3">
                    {/* Inline approve/decline for quote_sent */}
                    {booking.status === "quote_sent" && (
                      <>
                        {decliningId === booking.id ? (
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={declineReason}
                              onChange={(e) => setDeclineReason(e.target.value)}
                              placeholder="Reason for declining (optional)..."
                              className="flex-1 px-3 py-2 text-sm border border-red-200 rounded-full focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                            <button
                              onClick={() => handleRespondToQuote(booking.id, "decline")}
                              disabled={respondingId === booking.id}
                              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              {respondingId === booking.id ? "..." : "Confirm"}
                            </button>
                            <button
                              onClick={() => { setDecliningId(null); setDeclineReason(""); }}
                              className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleRespondToQuote(booking.id, "approve")}
                              disabled={respondingId === booking.id}
                              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-full hover:bg-emerald-700 transition-colors disabled:opacity-50"
                            >
                              {respondingId === booking.id ? "Approving..." : "Approve"}
                            </button>
                            <button
                              onClick={() => setDecliningId(booking.id)}
                              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 rounded-full hover:bg-red-50 transition-colors"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </>
                    )}
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
              ))
            )}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="space-y-4">
            {confirmedEvents.length === 0 ? (
              <div className="card p-8 text-center">
                <Calendar size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-slate-900 mb-2">No Upcoming Events</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  When your booking requests are confirmed by talents, they&apos;ll appear here.
                </p>
              </div>
            ) : (
              confirmedEvents
                .sort((a, b) => {
                  if (!a.requested_date) return 1;
                  if (!b.requested_date) return -1;
                  return new Date(a.requested_date).getTime() - new Date(b.requested_date).getTime();
                })
                .map((booking) => {
                  const isPast = booking.requested_date
                    ? new Date(booking.requested_date) < new Date()
                    : false;

                  return (
                    <div key={booking.id} className={`card p-6 ${isPast ? "opacity-60" : ""}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">
                            {booking.artist_name || `Artist #${booking.artist_id}`}
                          </h3>
                          {booking.requested_date && (
                            <p className="text-sm text-slate-500">
                              {new Date(booking.requested_date).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          )}
                        </div>
                        <StatusBadge status={isPast ? "completed" : booking.status} />
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
                        {booking.budget != null && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <DollarSign size={16} className="text-slate-400" />
                            <span>${booking.budget.toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <Link
                          href={`/talents/${booking.artist_id}`}
                          className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"
                        >
                          View Artist
                        </Link>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="space-y-4">
            {conversations.length === 0 ? (
              <div className="card p-8 text-center">
                <MessageSquare size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-slate-900 mb-2">No Conversations</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  When you send booking requests, conversations with talents will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {conversations.map((conv) => (
                  <Link
                    key={conv.id}
                    href="/dashboard/host/messages"
                    className="card p-4 hover:shadow-md transition-shadow block"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-slate-900">
                        {conv.artist_name || "Unknown Artist"}
                      </span>
                      {conv.booking_status && (
                        <StatusBadge status={conv.booking_status} />
                      )}
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                      {conv.last_message || "No messages yet"}
                    </p>
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>{conv.message_count} {conv.message_count === 1 ? "message" : "messages"}</span>
                      <span>{new Date(conv.updated_at).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Discover Talents Tab */}
        {activeTab === "discover" && (
          <div>
            <p className="text-sm text-slate-500 mb-4">
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
                <Loader2 size={32} className="animate-spin text-primary-500" />
              </div>
            ) : discoverResults.length === 0 ? (
              <div className="card p-8 text-center">
                <Search size={40} className="text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-lg text-slate-900 mb-2">No talents found</h3>
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
        )}
      </div>
    </div>
  );
}
