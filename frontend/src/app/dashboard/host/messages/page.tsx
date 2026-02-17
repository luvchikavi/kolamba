"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Loader2,
  ChevronRight,
  Building2,
  Info,
  X,
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

interface VenueInfo {
  facility_size: string;
  venue_type: string;
  stage_dimensions: string;
  expected_attendance: string;
  audience_type: string;
  sound_system: boolean;
  speaker_system: string;
  lighting: boolean;
  camera_available: boolean;
  green_room: boolean;
  catering: boolean;
  wifi: boolean;
  parking: string;
  accessibility: string;
  load_in_access: string;
  additional_notes: string;
}

const VENUE_TYPES = ["Auditorium", "Social Hall", "Sanctuary", "Outdoor", "Other"];
const AUDIENCE_TYPES = ["Families", "Adults", "Mixed", "Youth", "Seniors"];

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return null;
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    cancelled: "bg-slate-100 text-slate-700",
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

export default function CommunityMessagesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [selectedConv, setSelectedConv] = useState<ConversationDetail | null>(null);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showVenueForm, setShowVenueForm] = useState(false);
  const [venueInfo, setVenueInfo] = useState<VenueInfo>({
    facility_size: "",
    venue_type: "",
    stage_dimensions: "",
    expected_attendance: "",
    audience_type: "",
    sound_system: false,
    speaker_system: "",
    lighting: false,
    camera_available: false,
    green_room: false,
    catering: false,
    wifi: false,
    parking: "",
    accessibility: "",
    load_in_access: "",
    additional_notes: "",
  });
  const [isSavingVenue, setIsSavingVenue] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/conversations/${convId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data: ConversationDetail = await res.json();
        setSelectedConv(data);
        // Load existing venue info
        if (data.venue_info) {
          setVenueInfo({
            facility_size: (data.venue_info.facility_size as string) || "",
            venue_type: (data.venue_info.venue_type as string) || "",
            stage_dimensions: (data.venue_info.stage_dimensions as string) || "",
            expected_attendance: data.venue_info.expected_attendance?.toString() || "",
            audience_type: (data.venue_info.audience_type as string) || "",
            sound_system: (data.venue_info.sound_system as boolean) || false,
            speaker_system: (data.venue_info.speaker_system as string) || "",
            lighting: (data.venue_info.lighting as boolean) || false,
            camera_available: (data.venue_info.camera_available as boolean) || false,
            green_room: (data.venue_info.green_room as boolean) || false,
            catering: (data.venue_info.catering as boolean) || false,
            wifi: (data.venue_info.wifi as boolean) || false,
            parking: (data.venue_info.parking as string) || "",
            accessibility: (data.venue_info.accessibility as string) || "",
            load_in_access: (data.venue_info.load_in_access as string) || "",
            additional_notes: (data.venue_info.additional_notes as string) || "",
          });
        }
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
        // Update conversation list
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

  const saveVenueInfo = async () => {
    if (!selectedConvId) return;

    setIsSavingVenue(true);
    try {
      const token = getToken();
      const payload: Record<string, unknown> = {};
      // Only include non-empty fields
      if (venueInfo.facility_size) payload.facility_size = venueInfo.facility_size;
      if (venueInfo.venue_type) payload.venue_type = venueInfo.venue_type;
      if (venueInfo.stage_dimensions) payload.stage_dimensions = venueInfo.stage_dimensions;
      if (venueInfo.expected_attendance) payload.expected_attendance = parseInt(venueInfo.expected_attendance);
      if (venueInfo.audience_type) payload.audience_type = venueInfo.audience_type;
      if (venueInfo.sound_system) payload.sound_system = venueInfo.sound_system;
      if (venueInfo.speaker_system) payload.speaker_system = venueInfo.speaker_system;
      if (venueInfo.lighting) payload.lighting = venueInfo.lighting;
      if (venueInfo.camera_available) payload.camera_available = venueInfo.camera_available;
      if (venueInfo.green_room) payload.green_room = venueInfo.green_room;
      if (venueInfo.catering) payload.catering = venueInfo.catering;
      if (venueInfo.wifi) payload.wifi = venueInfo.wifi;
      if (venueInfo.parking) payload.parking = venueInfo.parking;
      if (venueInfo.accessibility) payload.accessibility = venueInfo.accessibility;
      if (venueInfo.load_in_access) payload.load_in_access = venueInfo.load_in_access;
      if (venueInfo.additional_notes) payload.additional_notes = venueInfo.additional_notes;

      const res = await fetch(`${API_URL}/conversations/${selectedConvId}/venue-info`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedConv((prev) =>
          prev ? { ...prev, venue_info: data.venue_info } : prev
        );
        setShowVenueForm(false);
      }
    } catch (err) {
      console.error("Failed to save venue info:", err);
    } finally {
      setIsSavingVenue(false);
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
              href="/dashboard/host"
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Messages</h1>
              <p className="text-sm text-slate-500">Communicate with artists about your bookings</p>
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
                    No conversations yet. Send a booking request to start messaging.
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
                          {conv.artist_name || "Unknown Artist"}
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
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Booking #{selectedConv.booking_id}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowVenueForm(!showVenueForm)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      showVenueForm
                        ? "bg-primary-100 text-primary-700"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <Building2 size={16} />
                    Venue Info
                  </button>
                </div>

                {/* Venue Info Panel */}
                {showVenueForm && (
                  <div className="p-4 border-b border-slate-100 bg-slate-50 max-h-[400px] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-slate-900 text-sm">Venue Information</h4>
                      <button onClick={() => setShowVenueForm(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Facility Size</label>
                        <input
                          type="text"
                          value={venueInfo.facility_size}
                          onChange={(e) => setVenueInfo({ ...venueInfo, facility_size: e.target.value })}
                          placeholder="e.g., 5000 sq ft"
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Venue Type</label>
                        <select
                          value={venueInfo.venue_type}
                          onChange={(e) => setVenueInfo({ ...venueInfo, venue_type: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Select...</option>
                          {VENUE_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Stage Dimensions</label>
                        <input
                          type="text"
                          value={venueInfo.stage_dimensions}
                          onChange={(e) => setVenueInfo({ ...venueInfo, stage_dimensions: e.target.value })}
                          placeholder="e.g., 20x15 ft"
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Expected Attendance</label>
                        <input
                          type="number"
                          value={venueInfo.expected_attendance}
                          onChange={(e) => setVenueInfo({ ...venueInfo, expected_attendance: e.target.value })}
                          placeholder="e.g., 200"
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Audience Type</label>
                        <select
                          value={venueInfo.audience_type}
                          onChange={(e) => setVenueInfo({ ...venueInfo, audience_type: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Select...</option>
                          {AUDIENCE_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Speaker System</label>
                        <input
                          type="text"
                          value={venueInfo.speaker_system}
                          onChange={(e) => setVenueInfo({ ...venueInfo, speaker_system: e.target.value })}
                          placeholder="Describe speaker setup"
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Parking</label>
                        <input
                          type="text"
                          value={venueInfo.parking}
                          onChange={(e) => setVenueInfo({ ...venueInfo, parking: e.target.value })}
                          placeholder="e.g., 100 spots, free"
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Accessibility</label>
                        <input
                          type="text"
                          value={venueInfo.accessibility}
                          onChange={(e) => setVenueInfo({ ...venueInfo, accessibility: e.target.value })}
                          placeholder="e.g., Wheelchair accessible"
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Load-In Access</label>
                        <input
                          type="text"
                          value={venueInfo.load_in_access}
                          onChange={(e) => setVenueInfo({ ...venueInfo, load_in_access: e.target.value })}
                          placeholder="e.g., Loading dock on west side"
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      {/* Boolean toggles */}
                      <div className="md:col-span-2 flex flex-wrap gap-4">
                        {(
                          [
                            ["sound_system", "Sound System"],
                            ["lighting", "Lighting"],
                            ["camera_available", "Camera"],
                            ["green_room", "Green Room"],
                            ["catering", "Catering"],
                            ["wifi", "WiFi"],
                          ] as const
                        ).map(([key, label]) => (
                          <label key={key} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={venueInfo[key] as boolean}
                              onChange={(e) => setVenueInfo({ ...venueInfo, [key]: e.target.checked })}
                              className="rounded text-primary-500 focus:ring-primary-500"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Additional Notes</label>
                        <textarea
                          value={venueInfo.additional_notes}
                          onChange={(e) => setVenueInfo({ ...venueInfo, additional_notes: e.target.value })}
                          placeholder="Any additional information..."
                          rows={2}
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={saveVenueInfo}
                        disabled={isSavingVenue}
                        className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSavingVenue ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Venue Info"
                        )}
                      </button>
                    </div>
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
