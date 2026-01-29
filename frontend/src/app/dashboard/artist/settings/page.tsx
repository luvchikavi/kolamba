"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, CheckCircle, X } from "lucide-react";

// Normalize API URL - ensure it ends with /api
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_URL = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`;

const categories = [
  { id: 1, name: "Music", slug: "music" },
  { id: 2, name: "Dance", slug: "dance" },
  { id: 3, name: "Theater", slug: "theater" },
  { id: 4, name: "Literature", slug: "literature" },
  { id: 5, name: "Comedy", slug: "comedy" },
  { id: 6, name: "Lectures", slug: "lecture" },
  { id: 7, name: "Workshops", slug: "workshop" },
  { id: 8, name: "Journalism", slug: "journalism" },
  { id: 9, name: "Inspiration", slug: "inspiration" },
  { id: 10, name: "Visual Arts", slug: "visual-arts" },
];

const languages = ["English", "Hebrew", "French", "Spanish", "Russian", "German"];

const performanceTypes = [
  "Solo Performance",
  "Band/Group",
  "Workshop Leader",
  "Lecturer/Speaker",
  "Interactive Show",
  "Children's Entertainment",
];

interface ArtistProfile {
  id: number;
  name_he: string;
  name_en: string | null;
  bio_he: string | null;
  bio_en: string | null;
  profile_image: string | null;
  price_single: number | null;
  price_tour: number | null;
  languages: string[];
  city: string | null;
  country: string;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  youtube: string | null;
  performance_types: string[];
  categories: { id: number; name_en: string; slug: string }[];
}

export default function ArtistSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name_he: "",
    name_en: "",
    bio_en: "",
    city: "",
    country: "Israel",
    phone: "",
    website: "",
    instagram: "",
    youtube: "",
    price_single: "",
    price_tour: "",
    languages: [] as string[],
    performance_types: [] as string[],
    category_ids: [] as number[],
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${API_URL}/artists/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const profile: ArtistProfile = await response.json();

      setFormData({
        name_he: profile.name_he || "",
        name_en: profile.name_en || "",
        bio_en: profile.bio_en || "",
        city: profile.city || "",
        country: profile.country || "Israel",
        phone: profile.phone || "",
        website: profile.website || "",
        instagram: profile.instagram || "",
        youtube: profile.youtube || "",
        price_single: profile.price_single?.toString() || "",
        price_tour: profile.price_tour?.toString() || "",
        languages: profile.languages || [],
        performance_types: profile.performance_types || [],
        category_ids: profile.categories.map((c) => c.id),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const updateData = {
        name_he: formData.name_he,
        name_en: formData.name_en || null,
        bio_en: formData.bio_en || null,
        city: formData.city || null,
        country: formData.country,
        phone: formData.phone || null,
        website: formData.website || null,
        instagram: formData.instagram || null,
        youtube: formData.youtube || null,
        price_single: formData.price_single ? parseInt(formData.price_single) : null,
        price_tour: formData.price_tour ? parseInt(formData.price_tour) : null,
        languages: formData.languages,
        performance_types: formData.performance_types,
        category_ids: formData.category_ids,
      };

      const response = await fetch(
        `${API_URL}/artists/me`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to update profile");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleLanguage = (lang: string) => {
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
  };

  const togglePerformanceType = (type: string) => {
    if (formData.performance_types.includes(type)) {
      setFormData({
        ...formData,
        performance_types: formData.performance_types.filter((t) => t !== type),
      });
    } else {
      setFormData({
        ...formData,
        performance_types: [...formData.performance_types, type],
      });
    }
  };

  const toggleCategory = (catId: number) => {
    if (formData.category_ids.includes(catId)) {
      setFormData({
        ...formData,
        category_ids: formData.category_ids.filter((id) => id !== catId),
      });
    } else {
      setFormData({
        ...formData,
        category_ids: [...formData.category_ids, catId],
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container-default py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/artist"
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-slate-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
                <p className="text-slate-500">Update your artist profile information</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary"
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle size={18} />
                  Saved!
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="container-default py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <X size={20} className="text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Basic Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Stage Name / Artist Name
                  </label>
                  <input
                    type="text"
                    value={formData.name_he}
                    onChange={(e) => setFormData({ ...formData, name_he: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary-400"
                    placeholder="Your stage name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Name (English)
                  </label>
                  <input
                    type="text"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary-400"
                    placeholder="Your name in English"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio_en}
                    onChange={(e) => setFormData({ ...formData, bio_en: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary-400 resize-none"
                    placeholder="Tell communities about yourself..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary-400"
                      placeholder="Tel Aviv"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary-400"
                      placeholder="Israel"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.category_ids.includes(cat.id)
                        ? "bg-primary-100 text-primary-800 border-2 border-primary-300"
                        : "bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Performance Types</h2>
              <div className="flex flex-wrap gap-2">
                {performanceTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => togglePerformanceType(type)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.performance_types.includes(type)
                        ? "bg-primary-100 text-primary-800 border-2 border-primary-300"
                        : "bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Contact & Pricing */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Contact Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary-400"
                    placeholder="+972 50-123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary-400"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary-400"
                    placeholder="@yourusername"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    YouTube
                  </label>
                  <input
                    type="url"
                    value={formData.youtube}
                    onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary-400"
                    placeholder="https://youtube.com/@channel"
                  />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Pricing</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Single Performance Price (USD)
                  </label>
                  <input
                    type="number"
                    value={formData.price_single}
                    onChange={(e) => setFormData({ ...formData, price_single: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary-400"
                    placeholder="500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tour Price (USD)
                  </label>
                  <input
                    type="number"
                    value={formData.price_tour}
                    onChange={(e) => setFormData({ ...formData, price_tour: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary-400"
                    placeholder="2000"
                  />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Languages</h2>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.languages.includes(lang)
                        ? "bg-primary-100 text-primary-800 border-2 border-primary-300"
                        : "bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
