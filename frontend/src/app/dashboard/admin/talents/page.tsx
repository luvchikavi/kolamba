"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Music,
  Star,
  StarOff,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  ExternalLink,
  X,
} from "lucide-react";
import { API_URL } from "@/lib/api";

interface Artist {
  id: number;
  user_id: number;
  name_en: string | null;
  name_he: string | null;
  email: string;
  status: string;
  city: string | null;
  is_featured: boolean;
  created_at: string;
}

interface RejectionModalProps {
  isOpen: boolean;
  artistName: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const REJECTION_REASONS = [
  "Incomplete Profile",
  "Insufficient Portfolio",
  "Not a Relevant Fit",
  "Duplicate Account",
];

function RejectionModal({ isOpen, artistName, onClose, onConfirm }: RejectionModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onConfirm(reason);
    setIsSubmitting(false);
    setReason("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-slate-900 mb-2">Reject Talent</h3>
        <p className="text-slate-600 mb-4">
          Select a reason for rejecting <strong>{artistName}</strong>.
          This will be visible to the talent.
        </p>

        <div className="space-y-2 mb-4">
          {REJECTION_REASONS.map((r) => (
            <label
              key={r}
              className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                reason === r
                  ? "border-red-400 bg-red-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="rejection_reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
                className="text-red-500 focus:ring-red-400"
              />
              <span className="text-sm font-medium text-slate-700">{r}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason || isSubmitting}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Rejecting...
              </>
            ) : (
              <>
                <XCircle size={16} />
                Reject
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    active: { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle },
    pending: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock },
    inactive: { bg: "bg-slate-100", text: "text-slate-700", icon: XCircle },
    rejected: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
  };

  const { bg, text, icon: Icon } = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${bg} ${text}`}>
      <Icon size={12} />
      {status}
    </span>
  );
}

export default function ArtistsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [error, setError] = useState<string | null>(null);
  const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean; artistId: number | null; artistName: string }>({
    isOpen: false,
    artistId: null,
    artistName: "",
  });

  useEffect(() => {
    fetchArtists();
  }, [searchQuery, statusFilter]);

  const fetchArtists = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

            const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter) params.set("status", statusFilter);

      const response = await fetch(
        `${API_URL}/admin/artists?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 403) {
        router.push("/");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch artists");
      }

      const data = await response.json();
      setArtists(data);
    } catch (err) {
      console.error("Failed to fetch artists:", err);
      setError("Failed to load artists");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (artistId: number, newStatus: string, rejectionReason?: string) => {
    try {
      const token = localStorage.getItem("access_token");

      const url = new URL(`${API_URL}/admin/artists/${artistId}/status`);
      url.searchParams.set("status", newStatus);
      if (rejectionReason) {
        url.searchParams.set("rejection_reason", rejectionReason);
      }

      const response = await fetch(url.toString(), {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setArtists(artists.map((a) =>
          a.id === artistId ? { ...a, status: newStatus } : a
        ));
      }
    } catch (err) {
      console.error("Failed to update artist status:", err);
    }
  };

  const handleRejectWithReason = async (reason: string) => {
    if (rejectionModal.artistId) {
      await handleUpdateStatus(rejectionModal.artistId, "rejected", reason);
      setRejectionModal({ isOpen: false, artistId: null, artistName: "" });
    }
  };

  const openRejectionModal = (artistId: number, artistName: string) => {
    setRejectionModal({ isOpen: true, artistId, artistName });
  };

  const handleToggleFeatured = async (artistId: number, isFeatured: boolean) => {
    try {
      const token = localStorage.getItem("access_token");
      
      const response = await fetch(
        `${API_URL}/admin/artists/${artistId}/featured?is_featured=${!isFeatured}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setArtists(artists.map((a) =>
          a.id === artistId ? { ...a, is_featured: !isFeatured } : a
        ));
      }
    } catch (err) {
      console.error("Failed to toggle featured:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 size={40} className="animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  const pendingCount = artists.filter((a) => a.status === "pending").length;
  const activeCount = artists.filter((a) => a.status === "active").length;
  const rejectedCount = artists.filter((a) => a.status === "rejected").length;
  const inactiveCount = artists.filter((a) => a.status === "inactive").length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Talent Management</h1>
        <p className="text-slate-500">Approve, manage, and feature talents</p>
      </div>

      {/* Status Pills */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setStatusFilter("")}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            statusFilter === ""
              ? "bg-primary-500 text-white"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          All ({artists.length})
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            statusFilter === "pending"
              ? "bg-amber-500 text-white"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setStatusFilter("active")}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            statusFilter === "active"
              ? "bg-emerald-500 text-white"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          Active ({activeCount})
        </button>
        <button
          onClick={() => setStatusFilter("rejected")}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            statusFilter === "rejected"
              ? "bg-red-500 text-white"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          Rejected ({rejectedCount})
        </button>
        <button
          onClick={() => setStatusFilter("inactive")}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            statusFilter === "inactive"
              ? "bg-slate-500 text-white"
              : "bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          Inactive ({inactiveCount})
        </button>
      </div>

      {/* Search */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by talent name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {error && (
        <div className="card p-4 mb-6 bg-red-50 border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Artists Grid */}
      {artists.length === 0 ? (
        <div className="card p-12 text-center">
          <Music size={48} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Talents Found</h3>
          <p className="text-slate-500">
            {statusFilter
              ? `No ${statusFilter} talents match your search.`
              : "No talents match your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist) => (
            <div key={artist.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Music size={24} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {artist.name_en || artist.name_he || "Unnamed Talent"}
                    </h3>
                    <p className="text-sm text-slate-500">{artist.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleFeatured(artist.id, artist.is_featured)}
                  className={`p-2 rounded-lg transition-colors ${
                    artist.is_featured
                      ? "bg-amber-100 text-amber-600"
                      : "bg-slate-100 text-slate-400 hover:text-amber-600"
                  }`}
                  title={artist.is_featured ? "Remove from featured" : "Add to featured"}
                >
                  {artist.is_featured ? <Star size={18} /> : <StarOff size={18} />}
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <StatusBadge status={artist.status} />
                {artist.city && (
                  <span className="text-sm text-slate-500">{artist.city}</span>
                )}
              </div>

              <p className="text-xs text-slate-400 mb-4">
                Registered: {new Date(artist.created_at).toLocaleDateString()}
              </p>

              <div className="flex items-center gap-2">
                {artist.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(artist.id, "active")}
                      className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => openRejectionModal(artist.id, artist.name_en || artist.name_he || "Unnamed Talent")}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </>
                )}
                {artist.status === "active" && (
                  <button
                    onClick={() => handleUpdateStatus(artist.id, "inactive")}
                    className="flex-1 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    Deactivate
                  </button>
                )}
                {(artist.status === "inactive" || artist.status === "rejected") && (
                  <button
                    onClick={() => handleUpdateStatus(artist.id, "active")}
                    className="flex-1 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    Approve
                  </button>
                )}
                <Link
                  href={`/talents/${artist.id}`}
                  target="_blank"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <ExternalLink size={16} />
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={rejectionModal.isOpen}
        artistName={rejectionModal.artistName}
        onClose={() => setRejectionModal({ isOpen: false, artistId: null, artistName: "" })}
        onConfirm={handleRejectWithReason}
      />
    </div>
  );
}
