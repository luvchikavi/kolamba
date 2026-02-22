"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Loader2,
  Building2,
  X,
  Check,
  DollarSign,
  Clock,
} from "lucide-react";
import { API_URL } from "@/lib/api";

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

interface MessageItem {
  id: number;
  sender_id: number;
  sender_name: string | null;
  sender_role: string | null;
  content: string;
  created_at: string;
}

interface ConversationDetail {
  id: number;
  booking_id: number;
  venue_info: Record<string, unknown> | null;
  messages: MessageItem[];
  created_at: string;
  updated_at: string;
}

interface BookingDetail {
  id: number;
  status: string;
  quote_amount?: number;
  quote_notes?: string;
  quoted_at?: string;
  decline_reason?: string;
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return null;
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    quote_sent: "bg-blue-100 text-blue-700",
    approved: "bg-emerald-100 text-emerald-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    declined: "bg-red-100 text-red-700",
    rejected: "bg-red-100 text-red-700",
    cancelled: "bg-slate-100 text-slate-700",
    completed: "bg-violet-100 text-violet-700",
  };

  const labels: Record<string, string> = {
    quote_sent: "Quote Sent",
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      {labels[status] || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function VenueInfoPanel({ venueInfo }: { venueInfo: Record<string, unknown> }) {
  const booleanFields = [
    ["sound_system", "Sound System"],
    ["lighting", "Lighting"],
    ["camera_available", "Camera"],
    ["green_room", "Green Room"],
    ["catering", "Catering"],
    ["wifi", "WiFi"],
  ];

  const textFields = [
    ["facility_size", "Facility Size"],
    ["venue_type", "Venue Type"],
    ["stage_dimensions", "Stage Dimensions"],
    ["expected_attendance", "Expected Attendance"],
    ["audience_type", "Audience Type"],
    ["speaker_system", "Speaker System"],
    ["parking", "Parking"],
    ["accessibility", "Accessibility"],
    ["load_in_access", "Load-In Access"],
    ["additional_notes", "Additional Notes"],
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {textFields.map(([key, label]) => {
        const value = venueInfo[key];
        if (!value) return null;
        return (
          <div key={key}>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="text-sm text-slate-900">{String(value)}</p>
          </div>
        );
      })}
      <div className="md:col-span-2 flex flex-wrap gap-3">
        {booleanFields.map(([key, label]) => {
          const value = venueInfo[key];
          if (value === undefined || value === null) return null;
          return (
            <span
              key={key}
              className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                value ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
              }`}
            >
              {value ? <Check size={12} /> : <X size={12} />}
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function ArtistMessagesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [selectedConv, setSelectedConv] = useState<ConversationDetail | null>(null);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [bookingDetail, setBookingDetail] = useState<BookingDetail | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showVenueInfo, setShowVenueInfo] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quote form state
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  useEffect(() => {
    fetchConversations();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv?.messages]);

  const getToken = () => localStorage.getItem("access_token");

  const fetchCurrentUser = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUserId(user.id);
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  const fetchConversations = async () => {
    try {
      const token = getToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch(`${API_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectConversation = async (convId: number) => {
    setSelectedConvId(convId);
    setShowVenueInfo(false);
    setBookingDetail(null);
    setQuoteAmount("");
    setQuoteNotes("");
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/conversations/${convId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data: ConversationDetail = await res.json();
        setSelectedConv(data);

        // Fetch booking details for quote status
        try {
          const bookingRes = await fetch(`${API_URL}/bookings/${data.booking_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (bookingRes.ok) {
            const bookingData = await bookingRes.json();
            setBookingDetail(bookingData);
          }
        } catch { /* ignore */ }
      }
    } catch (err) {
      console.error("Failed to fetch conversation:", err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConvId) return;

    setIsSending(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/conversations/${selectedConvId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newMessage }),
      });

      if (res.ok) {
        const msg: MessageItem = await res.json();
        setSelectedConv((prev) =>
          prev ? { ...prev, messages: [...prev.messages, msg] } : prev
        );
        setNewMessage("");
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConvId
              ? { ...c, last_message: newMessage, message_count: c.message_count + 1, updated_at: new Date().toISOString() }
              : c
          )
        );
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const submitQuote = async () => {
    if (!quoteAmount || !bookingDetail) return;

    setIsSubmittingQuote(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/bookings/${bookingDetail.id}/quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quote_amount: parseFloat(quoteAmount),
          quote_notes: quoteNotes || null,
        }),
      });

      if (res.ok) {
        const updatedBooking = await res.json();
        setBookingDetail(updatedBooking);
        // Update conversation status in list
        setConversations((prev) =>
          prev.map((c) =>
            c.booking_id === bookingDetail.id
              ? { ...c, booking_status: "quote_sent" }
              : c
          )
        );
        // Refresh conversation to get the auto-message
        if (selectedConvId) {
          selectConversation(selectedConvId);
        }
      }
    } catch (err) {
      console.error("Failed to submit quote:", err);
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="bg-white border-b border-slate-100">
        <div className="container-default py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/talent"
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Messages</h1>
              <p className="text-sm text-slate-500">Communicate with communities about bookings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-default py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: "calc(100vh - 200px)" }}>
          {/* Conversation List */}
          <div className="lg:col-span-1">
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">Conversations</h2>
              </div>
              {conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare size={36} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">
                    No conversations yet. Conversations are created when communities send booking requests.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv.id)}
                      className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
                        selectedConvId === conv.id ? "bg-primary-50 border-l-2 border-primary-500" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-slate-900 text-sm">
                          {conv.community_name || "Unknown Community"}
                        </span>
                        <StatusBadge status={conv.booking_status} />
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-1">
                        {conv.last_message || "No messages yet"}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">
                          {conv.message_count} {conv.message_count === 1 ? "message" : "messages"}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(conv.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Conversation Detail */}
          <div className="lg:col-span-2">
            {!selectedConv ? (
              <div className="card p-12 text-center h-full flex flex-col items-center justify-center">
                <MessageSquare size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Select a Conversation</h3>
                <p className="text-slate-500">Choose a conversation from the list to view messages.</p>
              </div>
            ) : (
              <div className="card flex flex-col" style={{ height: "calc(100vh - 200px)" }}>
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-slate-900">
                      Booking #{selectedConv.booking_id}
                    </h3>
                    {bookingDetail && <StatusBadge status={bookingDetail.status} />}
                  </div>
                  {selectedConv.venue_info && Object.keys(selectedConv.venue_info).length > 0 && (
                    <button
                      onClick={() => setShowVenueInfo(!showVenueInfo)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        showVenueInfo
                          ? "bg-primary-100 text-primary-700"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <Building2 size={16} />
                      Venue Info
                    </button>
                  )}
                </div>

                {/* Venue Info Panel (read-only for artist) */}
                {showVenueInfo && selectedConv.venue_info && (
                  <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-slate-900 text-sm">Venue Information</h4>
                      <button onClick={() => setShowVenueInfo(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={16} />
                      </button>
                    </div>
                    <VenueInfoPanel venueInfo={selectedConv.venue_info} />
                  </div>
                )}

                {/* Quote Submission / Summary Card */}
                {bookingDetail && bookingDetail.status === "pending" && (
                  <div className="p-4 border-b border-slate-100 bg-blue-50">
                    <h4 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                      <DollarSign size={16} className="text-blue-600" />
                      Submit Quote
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Amount (USD) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={quoteAmount}
                          onChange={(e) => setQuoteAmount(e.target.value)}
                          placeholder="e.g., 2500"
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          What&apos;s included (optional)
                        </label>
                        <textarea
                          value={quoteNotes}
                          onChange={(e) => setQuoteNotes(e.target.value)}
                          placeholder="Duration, equipment, travel, etc."
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>
                      <button
                        onClick={submitQuote}
                        disabled={!quoteAmount || isSubmittingQuote}
                        className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmittingQuote ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send size={14} />
                            Submit Quote
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {bookingDetail && bookingDetail.status === "quote_sent" && (
                  <div className="p-4 border-b border-slate-100 bg-blue-50">
                    <h4 className="font-semibold text-slate-900 text-sm mb-2 flex items-center gap-2">
                      <DollarSign size={16} className="text-blue-600" />
                      Quote Submitted
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Amount</span>
                        <span className="text-lg font-bold text-slate-900">
                          ${bookingDetail.quote_amount?.toLocaleString()}
                        </span>
                      </div>
                      {bookingDetail.quote_notes && (
                        <div>
                          <span className="text-xs text-slate-500">What&apos;s included</span>
                          <p className="text-sm text-slate-700">{bookingDetail.quote_notes}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-1">
                        <Clock size={12} className="text-blue-500" />
                        <span className="text-xs text-blue-600 font-medium">Waiting for host response</span>
                      </div>
                    </div>
                  </div>
                )}

                {bookingDetail && bookingDetail.status === "approved" && (
                  <div className="p-4 border-b border-slate-100 bg-emerald-50">
                    <h4 className="font-semibold text-emerald-800 text-sm mb-2 flex items-center gap-2">
                      <Check size={16} className="text-emerald-600" />
                      Booking Approved
                    </h4>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Agreed Amount</span>
                      <span className="text-lg font-bold text-emerald-800">
                        ${bookingDetail.quote_amount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {bookingDetail && bookingDetail.status === "declined" && (
                  <div className="p-4 border-b border-slate-100 bg-red-50">
                    <h4 className="font-semibold text-red-800 text-sm mb-2 flex items-center gap-2">
                      <X size={16} className="text-red-600" />
                      Quote Declined
                    </h4>
                    {bookingDetail.decline_reason && (
                      <p className="text-sm text-red-700">{bookingDetail.decline_reason}</p>
                    )}
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selectedConv.messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare size={36} className="text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  ) : (
                    selectedConv.messages.map((msg) => {
                      const isMe = msg.sender_id === currentUserId;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                              isMe
                                ? "bg-primary-500 text-white"
                                : "bg-slate-100 text-slate-900"
                            }`}
                          >
                            {!isMe && (
                              <p className="text-xs font-medium mb-1 opacity-70">
                                {msg.sender_name || "Unknown"} ({msg.sender_role})
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <p className={`text-xs mt-1 ${isMe ? "text-white/60" : "text-slate-400"}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-slate-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || isSending}
                      className="px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSending ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
