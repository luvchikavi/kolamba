"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Users,
  Shield,
  AlertCircle,
  Loader2,
  X,
  Check,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { API_URL } from "@/lib/api";

const ROLE_LABELS: Record<string, string> = {
  community: "Host",
  artist: "Talent",
  agent: "Agent",
  admin: "Admin",
};

interface User {
  id: number;
  email: string;
  name: string | null;
  role: string;
  status: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  artist_id: number | null;
  categories: string[] | null;
  community_type: string | null;
  location: string | null;
  community_name: string | null;
  managed_count: number | null;
}

interface ProfileData {
  role: string;
  profile: ArtistProfile | CommunityProfile | AgentProfile | null;
}

interface ArtistProfile {
  id: number;
  name_he: string;
  name_en: string | null;
  bio_he: string | null;
  bio_en: string | null;
  price_single: number | null;
  price_tour: number | null;
  city: string | null;
  country: string;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  youtube: string | null;
  facebook: string | null;
  categories: { id: number; name_en: string }[];
  subcategories: string[];
  status: string;
}

interface CommunityProfile {
  id: number;
  name: string;
  community_type: string | null;
  location: string;
  member_count_min: number | null;
  member_count_max: number | null;
  event_types: string[] | null;
  language: string;
  phone: string | null;
  status: string;
}

interface AgentProfile {
  managed_artists: { id: number; name_en: string | null; name_he: string; status: string }[];
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: "bg-violet-100 text-violet-700",
    agent: "bg-orange-100 text-orange-700",
    artist: "bg-blue-100 text-blue-700",
    community: "bg-emerald-100 text-emerald-700",
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[role] || "bg-slate-100 text-slate-700"}`}>
      {ROLE_LABELS[role] || role}
    </span>
  );
}

function StatusBadge({ status, isActive }: { status: string; isActive: boolean }) {
  if (!isActive && status !== "deleted") {
    return (
      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
        Inactive
      </span>
    );
  }

  const styles: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    inactive: "bg-red-100 text-red-700",
    deleted: "bg-red-100 text-red-700",
  };

  const labels: Record<string, string> = {
    active: "Active",
    pending: "Pending",
    inactive: "Inactive",
    deleted: "Deleted",
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status] || "bg-slate-100 text-slate-700"}`}>
      {labels[status] || status}
    </span>
  );
}

function DetailInfo({ user }: { user: User }) {
  if (user.role === "artist" && user.categories && user.categories.length > 0) {
    return (
      <div className="flex flex-wrap gap-1">
        {user.categories.map((cat) => (
          <span key={cat} className="px-1.5 py-0.5 text-xs bg-blue-50 text-blue-600 rounded">
            {cat}
          </span>
        ))}
        {user.location && (
          <span className="text-xs text-slate-400 ml-1">{user.location}</span>
        )}
      </div>
    );
  }

  if (user.role === "community") {
    const parts: string[] = [];
    if (user.community_type) parts.push(user.community_type);
    if (user.location) parts.push(user.location);
    if (parts.length > 0) {
      return <span className="text-xs text-slate-500">{parts.join(" · ")}</span>;
    }
  }

  if (user.role === "agent" && user.managed_count !== null) {
    return (
      <span className="text-xs text-slate-500">
        {user.managed_count} talent{user.managed_count !== 1 ? "s" : ""} managed
      </span>
    );
  }

  return <span className="text-xs text-slate-400">—</span>;
}

export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [editProfile, setEditProfile] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (roleFilter) params.set("role", roleFilter);
      if (statusFilter) params.set("status", statusFilter);

      const response = await fetch(
        `${API_URL}/admin/users?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 403) {
        router.push("/");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, roleFilter, statusFilter, router]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const fetchProfile = async (userId: number) => {
    setProfileLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/admin/users/${userId}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
        if (data.profile) {
          setEditProfile({ ...data.profile });
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setProfileData(null);
    setEditProfile({});
    fetchProfile(user.id);
  };

  const handleUpdateUser = async (userId: number, updates: Partial<User>) => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map((u) => (u.id === userId ? { ...u, ...updatedUser } : u)));
        setEditingUser(null);
        setProfileData(null);
      }
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };

  const handleSaveProfile = async () => {
    if (!editingUser || !profileData?.profile) return;
    setProfileSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      const profile = profileData.profile;
      let url = "";
      if (editingUser.role === "artist" && "id" in profile) {
        url = `${API_URL}/admin/artists/${(profile as ArtistProfile).id}/profile`;
      } else if (editingUser.role === "community" && "id" in profile) {
        url = `${API_URL}/admin/communities/${(profile as CommunityProfile).id}/profile`;
      }
      if (url) {
        await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editProfile),
        });
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user? They will be hidden from the website.")) return;

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setUsers(users.map((u) =>
          u.id === userId ? { ...u, is_active: false, status: "deleted" } : u
        ));
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
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

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-500">Manage all registered users</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="agent">Agent</option>
            <option value="artist">Talent</option>
            <option value="community">Host</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
            <option value="deleted">Deleted</option>
          </select>
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

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users size={32} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500">No users found</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => openEditModal(user)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">
                            {(user.name || user.email)[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 hover:text-primary-600 transition-colors">
                            {user.name || "\u2014"}
                            {user.is_superuser && (
                              <Shield size={14} className="inline ml-1 text-violet-500" />
                            )}
                          </p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4">
                      <DetailInfo user={user} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={user.status} isActive={user.is_active} />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {user.role === "artist" && user.artist_id && (
                          <Link
                            href={`/talents/${user.artist_id}`}
                            target="_blank"
                            className="px-3 py-1 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            View Profile
                            <ExternalLink size={14} />
                          </Link>
                        )}
                        <button
                          onClick={() => openEditModal(user)}
                          className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        {!user.is_superuser && user.status !== "deleted" && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Edit User</h2>
                <button
                  onClick={() => { setEditingUser(null); setProfileData(null); }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  disabled
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editingUser.name || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="artist">Talent</option>
                  <option value="agent">Agent</option>
                  <option value="community">Host</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={editingUser.status}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                  <option value="deleted">Deleted</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingUser.is_active}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, is_active: e.target.checked })
                  }
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="is_active" className="text-sm text-slate-700">
                  Account is active
                </label>
              </div>

              {/* Profile Section */}
              {profileLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 size={24} className="animate-spin text-primary-500" />
                </div>
              ) : profileData?.profile && (
                <div className="border-t border-slate-100 pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Profile Details</h3>

                  {/* Talent profile fields */}
                  {editingUser.role === "artist" && profileData.role === "artist" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Name (EN)</label>
                          <input
                            type="text"
                            value={(editProfile.name_en as string) || ""}
                            onChange={(e) => setEditProfile({ ...editProfile, name_en: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Name (HE)</label>
                          <input
                            type="text"
                            value={(editProfile.name_he as string) || ""}
                            onChange={(e) => setEditProfile({ ...editProfile, name_he: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Bio (EN)</label>
                        <textarea
                          value={(editProfile.bio_en as string) || ""}
                          onChange={(e) => setEditProfile({ ...editProfile, bio_en: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">City</label>
                          <input
                            type="text"
                            value={(editProfile.city as string) || ""}
                            onChange={(e) => setEditProfile({ ...editProfile, city: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Country</label>
                          <input
                            type="text"
                            value={(editProfile.country as string) || ""}
                            onChange={(e) => setEditProfile({ ...editProfile, country: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Price (Single)</label>
                          <input
                            type="number"
                            value={(editProfile.price_single as number) ?? ""}
                            onChange={(e) => setEditProfile({ ...editProfile, price_single: e.target.value ? Number(e.target.value) : null })}
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Price (Tour)</label>
                          <input
                            type="number"
                            value={(editProfile.price_tour as number) ?? ""}
                            onChange={(e) => setEditProfile({ ...editProfile, price_tour: e.target.value ? Number(e.target.value) : null })}
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                        <input
                          type="text"
                          value={(editProfile.phone as string) || ""}
                          onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Instagram</label>
                        <input
                          type="text"
                          value={(editProfile.instagram as string) || ""}
                          onChange={(e) => setEditProfile({ ...editProfile, instagram: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Host profile fields */}
                  {editingUser.role === "community" && profileData.role === "community" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Community Name</label>
                        <input
                          type="text"
                          value={(editProfile.name as string) || ""}
                          onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Community Type</label>
                        <input
                          type="text"
                          value={(editProfile.community_type as string) || ""}
                          onChange={(e) => setEditProfile({ ...editProfile, community_type: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
                        <input
                          type="text"
                          value={(editProfile.location as string) || ""}
                          onChange={(e) => setEditProfile({ ...editProfile, location: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Members (Min)</label>
                          <input
                            type="number"
                            value={(editProfile.member_count_min as number) ?? ""}
                            onChange={(e) => setEditProfile({ ...editProfile, member_count_min: e.target.value ? Number(e.target.value) : null })}
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Members (Max)</label>
                          <input
                            type="number"
                            value={(editProfile.member_count_max as number) ?? ""}
                            onChange={(e) => setEditProfile({ ...editProfile, member_count_max: e.target.value ? Number(e.target.value) : null })}
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Language</label>
                        <input
                          type="text"
                          value={(editProfile.language as string) || ""}
                          onChange={(e) => setEditProfile({ ...editProfile, language: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                        <input
                          type="text"
                          value={(editProfile.phone as string) || ""}
                          onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Agent profile - read-only managed artists */}
                  {editingUser.role === "agent" && profileData.role === "agent" && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 mb-2">Managed Talents</p>
                      {(profileData.profile as AgentProfile).managed_artists.length === 0 ? (
                        <p className="text-sm text-slate-400">No managed talents</p>
                      ) : (
                        (profileData.profile as AgentProfile).managed_artists.map((a) => (
                          <div key={a.id} className="flex items-center justify-between py-1.5 px-3 bg-slate-50 rounded-lg">
                            <span className="text-sm text-slate-700">{a.name_en || a.name_he}</span>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={a.status} isActive={true} />
                              <Link href={`/talents/${a.id}`} target="_blank" className="text-xs text-teal-600 hover:underline">
                                View
                              </Link>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white rounded-b-2xl">
              <button
                onClick={() => { setEditingUser(null); setProfileData(null); }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              {profileData?.profile && (editingUser.role === "artist" || editingUser.role === "community") && (
                <button
                  onClick={async () => {
                    await handleSaveProfile();
                    await handleUpdateUser(editingUser.id, {
                      name: editingUser.name,
                      role: editingUser.role,
                      status: editingUser.status,
                      is_active: editingUser.is_active,
                    });
                  }}
                  disabled={profileSaving}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {profileSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  Save All Changes
                </button>
              )}
              {(!profileData?.profile || editingUser.role === "agent" || editingUser.role === "admin") && (
                <button
                  onClick={() =>
                    handleUpdateUser(editingUser.id, {
                      name: editingUser.name,
                      role: editingUser.role,
                      status: editingUser.status,
                      is_active: editingUser.is_active,
                    })
                  }
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Check size={18} />
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
