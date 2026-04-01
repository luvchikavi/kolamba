"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, CheckCircle, X, Music, Upload, Image, Video, Plus, Trash2 } from "lucide-react";
import { API_URL } from "@/lib/api";

const categories = [
  { id: 1, name: "Music", slug: "music" },
  { id: 2, name: "Literature", slug: "literature" },
  { id: 3, name: "Journalism", slug: "journalism" },
  { id: 4, name: "Film & Television", slug: "film-television" },
  { id: 5, name: "Religion & Judaism", slug: "religion-judaism" },
  { id: 6, name: "Comedy", slug: "comedy" },
  { id: 7, name: "Theater", slug: "theater" },
  { id: 8, name: "Visual Arts", slug: "visual-arts" },
  { id: 9, name: "Culinary", slug: "culinary" },
  { id: 10, name: "Inspiration", slug: "inspiration" },
];

const languages = ["English", "Hebrew", "French", "Spanish", "Russian", "German", "Italian", "Amharic", "Dutch", "Swedish", "Yiddish"];

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
  portfolio_images: string[];
  video_urls: string[];
  spotify_links: string[];
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
  const [noProfile, setNoProfile] = useState(false);
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
    profile_image: "",
    portfolio_images: [] as string[],
    video_urls: [] as string[],
    spotify_links: [] as string[],
  });

  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

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
        `${API_URL}/talents/me`,
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

      if (response.status === 404) {
        setNoProfile(true);
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
        profile_image: profile.profile_image || "",
        portfolio_images: profile.portfolio_images || [],
        video_urls: profile.video_urls || [],
        spotify_links: profile.spotify_links || [],
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
        profile_image: formData.profile_image || null,
        portfolio_images: formData.portfolio_images.filter(url => url.trim() !== ""),
        video_urls: formData.video_urls.filter(url => url.trim() !== ""),
        spotify_links: formData.spotify_links.filter(url => url.trim() !== ""),
      };

      const response = await fetch(
        `${API_URL}/talents/me`,
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

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) { setError("Please upload a JPG, PNG, WebP, or GIF image"); return; }
    if (file.size > 10 * 1024 * 1024) { setError("File too large. Maximum size is 10MB"); return; }
    setIsUploadingProfile(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const response = await fetch(`${API_URL}/uploads/public/image`, { method: "POST", body: fd });
      if (!response.ok) { const data = await response.json(); throw new Error(data.detail || "Upload failed"); }
      const data = await response.json();
      setFormData({ ...formData, profile_image: data.url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploadingProfile(false);
      if (profileInputRef.current) profileInputRef.current.value = "";
    }
  };

  const handlePortfolioImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const validFiles = Array.from(files).filter(f => allowedTypes.includes(f.type) && f.size <= 10 * 1024 * 1024);
    if (validFiles.length === 0) { setError("No valid images selected"); return; }
    setIsUploadingPortfolio(true);
    setError(null);
    try {
      const uploadedUrls: string[] = [];
      for (const file of validFiles) {
        const fd = new FormData();
        fd.append("file", file);
        const response = await fetch(`${API_URL}/uploads/public/image`, { method: "POST", body: fd });
        if (response.ok) { const data = await response.json(); uploadedUrls.push(data.url); }
      }
      if (uploadedUrls.length > 0) {
        setFormData({ ...formData, portfolio_images: [...formData.portfolio_images, ...uploadedUrls] });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploadingPortfolio(false);
      if (portfolioInputRef.current) portfolioInputRef.current.value = "";
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

  if (noProfile) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Music size={48} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Talent Profile</h2>
          <p className="text-slate-600 mb-6">
            Your account doesn&apos;t have a linked talent profile.
          </p>
          <Link
            href="/dashboard/admin/talents"
            className="btn-primary inline-flex items-center gap-2"
          >
            Go to Talents Management
          </Link>
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
                href="/dashboard/talent"
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

        {/* Media Section - Full Width */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Profile Photo */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Profile Photo</h2>
            <p className="text-sm text-slate-500 mb-3">
              Upload a professional photo (JPG, PNG, max 10MB)
            </p>
            {formData.profile_image ? (
              <div className="flex items-center gap-4">
                <img
                  src={formData.profile_image}
                  alt="Profile preview"
                  className="w-24 h-24 object-cover rounded-xl border-2 border-slate-200"
                />
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (profileInputRef.current) profileInputRef.current.click();
                    }}
                    className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors inline-flex items-center gap-2 text-sm"
                  >
                    <Upload size={16} />
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, profile_image: "" })}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center gap-2 text-sm"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <label
                  htmlFor="settings-profile-upload"
                  className={`flex items-center gap-2 px-4 py-3 border-2 border-primary-300 bg-primary-50 text-primary-700 rounded-lg cursor-pointer hover:bg-primary-100 transition-colors ${
                    isUploadingProfile ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isUploadingProfile ? (
                    <><Loader2 size={18} className="animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload size={18} /> Upload Photo</>
                  )}
                </label>
              </div>
            )}
            <input
              ref={profileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleProfilePhotoUpload}
              className="hidden"
              id="settings-profile-upload"
            />
          </div>

          {/* Portfolio Images */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Image size={20} />
              Portfolio Images
            </h2>
            {formData.portfolio_images.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mb-4">
                {formData.portfolio_images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border-2 border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          portfolio_images: formData.portfolio_images.filter((_, i) => i !== index),
                        });
                      }}
                      className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3">
              <label
                htmlFor="settings-portfolio-upload"
                className={`flex items-center gap-2 px-4 py-3 border-2 border-primary-300 bg-primary-50 text-primary-700 rounded-lg cursor-pointer hover:bg-primary-100 transition-colors ${
                  isUploadingPortfolio ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isUploadingPortfolio ? (
                  <><Loader2 size={18} className="animate-spin" /> Uploading...</>
                ) : (
                  <><Upload size={18} /> Upload Images</>
                )}
              </label>
            </div>
            <input
              ref={portfolioInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handlePortfolioImageUpload}
              className="hidden"
              id="settings-portfolio-upload"
            />
          </div>

          {/* Video Links */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Video size={20} />
              Video Clips
            </h2>
            <p className="text-sm text-slate-500 mb-3">
              Add YouTube or Vimeo links to showcase your performances
            </p>
            <div className="space-y-2">
              {formData.video_urls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...formData.video_urls];
                      newUrls[index] = e.target.value;
                      setFormData({ ...formData, video_urls: newUrls });
                    }}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        video_urls: formData.video_urls.filter((_, i) => i !== index),
                      });
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, video_urls: [...formData.video_urls, ""] })}
                className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Add Video Link
              </button>
            </div>
          </div>

          {/* Spotify Links */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Music size={20} />
              Spotify Links
            </h2>
            <p className="text-sm text-slate-500 mb-3">
              Add links to your Spotify tracks or albums
            </p>
            <div className="space-y-2">
              {formData.spotify_links.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...formData.spotify_links];
                      newUrls[index] = e.target.value;
                      setFormData({ ...formData, spotify_links: newUrls });
                    }}
                    placeholder="https://open.spotify.com/..."
                    className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        spotify_links: formData.spotify_links.filter((_, i) => i !== index),
                      });
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, spotify_links: [...formData.spotify_links, ""] })}
                className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Add Spotify Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
