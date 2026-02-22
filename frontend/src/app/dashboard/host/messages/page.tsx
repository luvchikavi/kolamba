"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  Loader2,
  Building2,
  X,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Send,
  Edit3,
  CheckCircle,
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
  artist_id: number;
  artist_name?: string;
  requested_date?: string;
  location?: string;
  budget?: number;
  notes?: string;
  status: string;
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

const EMPTY_VENUE: VenueInfo = {
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
};

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return null;
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    cancelled: "bg-slate-100 text-slate-700",
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status] || "bg-slate-100 text-slate-600"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function RoleBadge({ role }: { role: string | null }) {
  if (!role) return null;
  const styles: Record<string, string> = {
    host: "bg-blue-100 text-blue-700",
    community: "bg-blue-100 text-blue-700",
    artist: "bg-violet-100 text-violet-700",
    talent: "bg-violet-100 text-violet-700",
    admin: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[role] || "bg-slate-100 text-slate-600"}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

function hasVenueData(info: Record<string, unknown> | null): boolean {
  if (!info) return false;
  return Object.values(info).some((v) => v !== null && v !== undefined && v !== "" && v !== false);
}

function VenueSummary({ info }: { info: Record<string, unknown> }) {
  const items: { label: string; value: string }[] = [];
  if (info.venue_type) items.push({ label: "Type", value: String(info.venue_type) });
  if (info.facility_size) items.push({ label: "Size", value: String(info.facility_size) });
  if (info.stage_dimensions) items.push({ label: "Stage", value: String(info.stage_dimensions) });
  if (info.expected_attendance) items.push({ label: "Attendance", value: String(info.expected_attendance) });
  if (info.audience_type) items.push({ label: "Audience", value: String(info.audience_type) });
  if (info.parking) items.push({ label: "Parking", value: String(info.parking) });
  if (info.accessibility) items.push({ label: "Accessibility", value: String(info.accessibility) });
  if (info.load_in_access) items.push({ label: "Load-In", value: String(info.load_in_access) });

  const amenities: string[] = [];
  if (info.sound_system) amenities.push("Sound System");
  if (info.lighting) amenities.push("Lighting");
  if (info.camera_available) amenities.push("Camera");
  if (info.green_room) amenities.push("Green Room");
  if (info.catering) amenities.push("Catering");
  if (info.wifi) amenities.push("WiFi");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className="text-sm font-medium text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>
      {amenities.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-1">Amenities</p>
          <div className="flex flex-wrap gap-1">
            {amenities.map((a) => (
              <span key={a} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full font-medium">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}
      {!!info.speaker_system && (
        <div>
          <p className="text-xs text-slate-500">Speaker System</p>
          <p className="text-sm text-slate-900">{String(info.speaker_system)}</p>
        </div>
      )}
      {!!info.additional_notes && (
        <div>
          <p className="text-xs text-slate-500">Notes</p>
          <p className="text-sm text-slate-700">{String(info.additional_notes)}</p>
        </div>
      )}
    </div>
  );
}

export default function HostMessagesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [selectedConv, setSelectedConv] = useState<ConversationDetail | null>(null);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [bookingDetail, setBookingDetail] = useState<BookingDetail | null>(null);
  const [newNote, setNewNote] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showVenueForm, setShowVenueForm] = useState(false);
  const [venueInfo, setVenueInfo] = useState<VenueInfo>({ ...EMPTY_VENUE });
  const [isSavingVenue, setIsSavingVenue] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const getToken = () => localStorage.getItem("access_token");

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
    setBookingDetail(null);
    setShowVenueForm(false);
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
        } else {
          setVenueInfo({ ...EMPTY_VENUE });
        }

        // Fetch booking details
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

  const sendNote = async () => {
    if (!newNote.trim() || !selectedConvId) return;

    setIsSending(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/conversations/${selectedConvId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newNote }),
      });

      if (res.ok) {
        const msg: MessageItem = await res.json();
        setSelectedConv((prev) =>
          prev ? { ...prev, messages: [...prev.messages, msg] } : prev
        );
        setNewNote("");
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConvId
              ? { ...c, last_message: newNote, message_count: c.message_count + 1, updated_at: new Date().toISOString() }
              : c
          )
        );
      }
    } catch (err) {
      console.error("Failed to send note:", err);
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
              <p className="text-sm text-slate-500">Communicate with talents about your bookings</p>
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

          {/* Detail Panel */}
          <div className="lg:col-span-2">
            {!selectedConv ? (
              <div className="card p-12 text-center h-full flex flex-col items-center justify-center">
                <MessageSquare size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Select a Conversation</h3>
                <p className="text-slate-500">Choose a conversation from the list to view details.</p>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
                {/* Booking Details Card */}
                <div className="card p-5">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400" />
                    Booking Details
                  </h3>
                  {bookingDetail ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Artist</p>
                        <p className="text-sm font-medium text-slate-900">
                          {bookingDetail.artist_name || `#${bookingDetail.artist_id}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Date</p>
                        <p className="text-sm font-medium text-slate-900">
                          {bookingDetail.requested_date
                            ? new Date(bookingDetail.requested_date).toLocaleDateString()
                            : "TBD"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Location</p>
                        <p className="text-sm font-medium text-slate-900">
                          {bookingDetail.location || "TBD"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Budget</p>
                        <p className="text-sm font-medium text-slate-900">
                          {bookingDetail.budget ? `$${bookingDetail.budget.toLocaleString()}` : "TBD"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Status</p>
                        <StatusBadge status={bookingDetail.status} />
                      </div>
                      {bookingDetail.notes && (
                        <div className="col-span-2 sm:col-span-3">
                          <p className="text-xs text-slate-500">Notes</p>
                          <p className="text-sm text-slate-700">{bookingDetail.notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 size={14} className="animate-spin" />
                      Loading booking details...
                    </div>
                  )}
                </div>

                {/* Venue Information Panel */}
                <div className="card p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <Building2 size={16} className="text-slate-400" />
                      Venue Information
                    </h3>
                    {!showVenueForm && (
                      <button
                        onClick={() => setShowVenueForm(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Edit3 size={14} />
                        {hasVenueData(selectedConv.venue_info) ? "Edit" : "Add Info"}
                      </button>
                    )}
                  </div>

                  {showVenueForm ? (
                    <div>
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
                      <div className="mt-4 flex justify-end gap-2">
                        <button
                          onClick={() => setShowVenueForm(false)}
                          className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
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
                            <>
                              <CheckCircle size={14} />
                              Save Venue Info
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : hasVenueData(selectedConv.venue_info) ? (
                    <VenueSummary info={selectedConv.venue_info!} />
                  ) : (
                    <p className="text-sm text-slate-400">
                      No venue information added yet. Click &quot;Add Info&quot; to provide details about your venue.
                    </p>
                  )}
                </div>

                {/* Activity Log */}
                <div className="card p-5">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" />
                    Activity Log
                  </h3>
                  {selectedConv.messages.length === 0 ? (
                    <p className="text-sm text-slate-400">No activity yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {selectedConv.messages.map((msg) => (
                        <div key={msg.id} className="flex gap-3 text-sm">
                          <div className="flex-shrink-0 pt-0.5">
                            <span className="text-xs text-slate-400 whitespace-nowrap">
                              {new Date(msg.created_at).toLocaleDateString()}{" "}
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <div className="flex-shrink-0">
                            <RoleBadge role={msg.sender_role} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-slate-900">
                              {msg.sender_name || "Unknown"}
                            </span>
                            <p className="text-slate-600 whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes Area */}
                <div className="card p-5">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Send size={16} className="text-slate-400" />
                    Send a Note
                  </h3>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Write a note to the talent..."
                    rows={3}
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none mb-3"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={sendNote}
                      disabled={!newNote.trim() || isSending}
                      className="px-5 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSending ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          Send Note
                        </>
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
