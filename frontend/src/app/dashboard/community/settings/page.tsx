"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, ChevronDown } from "lucide-react";
import { API_URL } from "@/lib/api";
import { showSuccess, showError } from "@/lib/toast";

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

const usStates = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming",
];

export default function CommunitySettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",  // Community name
    city: "",
    state: "",
    phone: "",
    languages: ["English"] as string[],
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
      // Parse location into city and state
      const locationParts = (data.location || "").split(", ");
      const parsedState = usStates.find((s) => locationParts.includes(s)) || "";
      const parsedCity = locationParts.filter((p: string) => p !== parsedState).join(", ");
      // Parse languages (stored as comma-separated string)
      const parsedLanguages = data.language
        ? data.language.split(", ").map((l: string) => l.trim()).filter(Boolean)
        : ["English"];
      setFormData({
        name: data.name || "",  // Community name
        city: parsedCity,
        state: parsedState,
        phone: data.phone || "",
        languages: parsedLanguages,
        member_count_min: data.member_count_min?.toString() || "",
        member_count_max: data.member_count_max?.toString() || "",
        contact_role: data.contact_role || "",
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      showError("Failed to load your profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

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
          location: formData.state ? `${formData.city}, ${formData.state}` : formData.city,
          phone: formData.phone || null,
          language: formData.languages.join(", "),
          member_count_min: formData.member_count_min ? parseInt(formData.member_count_min) : null,
          member_count_max: formData.member_count_max ? parseInt(formData.member_count_max) : null,
          contact_role: formData.contact_role || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to update profile");
      }

      showSuccess("Settings saved successfully");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to save changes");
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
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 transition-colors"
                />
                <div className="relative">
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 appearance-none bg-white transition-colors"
                  >
                    <option value="">State (Optional)</option>
                    {usStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
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
              <div className="flex flex-wrap gap-2">
                {languageOptions.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      if (formData.languages.includes(lang)) {
                        setFormData({
                          ...formData,
                          languages: formData.languages.filter((l) => l !== lang),
                        });
                      } else {
                        setFormData({
                          ...formData,
                          languages: [...formData.languages, lang],
                        });
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.languages.includes(lang)
                        ? "bg-teal-100 text-teal-800 border-2 border-teal-300"
                        : "bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
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
