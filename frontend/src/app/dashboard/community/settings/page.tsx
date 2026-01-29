"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle, ChevronDown } from "lucide-react";
import { API_URL } from "@/lib/api";

interface CommunityProfile {
  id: number;
  name: string;  // Community name
  location: string;
  phone?: string;
  language: string;
  member_count_min?: number;
  member_count_max?: number;
  event_types?: string[];
  contact_role?: string;
}

const languageOptions = [
  "English",
  "Hebrew",
  "French",
  "Spanish",
  "Russian",
  "Italian",
  "Amharic",
  "Dutch",
  "Swedish",
  "Yiddish",
];

export default function CommunitySettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",  // Community name
    location: "",
    phone: "",
    language: "English",
    member_count_min: "",
    member_count_max: "",
    contact_role: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_URL}/communities/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data);
      setFormData({
        name: data.name || "",  // Community name
        location: data.location || "",
        phone: data.phone || "",
        language: data.language || "English",
        member_count_min: data.member_count_min?.toString() || "",
        member_count_max: data.member_count_max?.toString() || "",
        contact_role: data.contact_role || "",
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load your profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/communities/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,  // Community name
          location: formData.location,
          phone: formData.phone || null,
          language: formData.language,
          member_count_min: formData.member_count_min ? parseInt(formData.member_count_min) : null,
          member_count_max: formData.member_count_max ? parseInt(formData.member_count_max) : null,
          contact_role: formData.contact_role || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to update profile");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-100 via-pink-50 to-white flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-pink-50 to-white pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Back Button */}
        <Link
          href="/dashboard/community"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        {/* Page Title */}
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 italic mb-8">
          SETTINGS
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <CheckCircle size={18} />
            Your profile has been updated successfully.
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="space-y-6">
            {/* Community Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Community Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 transition-colors"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 transition-colors"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 transition-colors"
              />
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Main Language
              </label>
              <div className="relative">
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 appearance-none bg-white transition-colors"
                >
                  {languageOptions.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Member Count */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Member Count Range
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={formData.member_count_min}
                  onChange={(e) => setFormData({ ...formData, member_count_min: e.target.value })}
                  placeholder="Min"
                  className="w-24 px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 transition-colors"
                />
                <span className="text-slate-500">to</span>
                <input
                  type="number"
                  value={formData.member_count_max}
                  onChange={(e) => setFormData({ ...formData, member_count_max: e.target.value })}
                  placeholder="Max"
                  className="w-24 px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 transition-colors"
                />
                <span className="text-slate-500">members</span>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Role
              </label>
              <input
                type="text"
                value={formData.contact_role}
                onChange={(e) => setFormData({ ...formData, contact_role: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full px-6 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
