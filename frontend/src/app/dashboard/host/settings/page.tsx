"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, ChevronDown, Building2, Home } from "lucide-react";
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
  venue_info?: VenueInfo;
}

interface VenueInfo {
  facility_size: string;
  venue_type: string;
  stage_dimensions: string;
  expected_attendance: string;
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

const VENUE_TYPES = ["Auditorium", "Social Hall", "Sanctuary", "Outdoor", "Classroom", "Multi-Purpose Room", "Other"];

const SPEAKER_SYSTEM_OPTIONS = [
  "Full PA System",
  "Basic Sound System",
  "Portable Speakers",
  "None / Bring Your Own",
];

const ACCESSIBILITY_OPTIONS = [
  "Fully Accessible (ADA Compliant)",
  "Partially Accessible",
  "Limited Accessibility",
  "Not Accessible",
];

const EMPTY_VENUE: VenueInfo = {
  facility_size: "",
  venue_type: "",
  stage_dimensions: "",
  expected_attendance: "",
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

const countries = [
  "United States",
  "Canada",
  "Israel",
  "United Kingdom",
  "France",
  "Germany",
  "Spain",
  "Italy",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Austria",
  "Sweden",
  "Norway",
  "Denmark",
  "Russia",
  "Argentina",
  "Brazil",
  "Australia",
  "South Africa",
  "Ethiopia",
  "Mexico",
  "Poland",
  "Hungary",
  "Czech Republic",
  "Ukraine",
  "Romania",
  "Greece",
  "Portugal",
  "Ireland",
  "New Zealand",
  "India",
  "Japan",
  "Singapore",
  "Other",
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
  const [noProfile, setNoProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",  // Community name
    country: "United States",
    city: "",
    state: "",
    phone: "",
    languages: ["English"] as string[],
    member_count_min: "",
    member_count_max: "",
    contact_role: "",
  });

  const [venueInfo, setVenueInfo] = useState<VenueInfo>({ ...EMPTY_VENUE });

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

      const response = await fetch(`${API_URL}/hosts/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (response.status === 404) {
        setNoProfile(true);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data);
      // Parse location into city, state, and country
      const locationParts = (data.location || "").split(", ");
      const parsedCountry = countries.find((c) => locationParts.includes(c)) || "";
      const parsedState = usStates.find((s) => locationParts.includes(s)) || "";
      const parsedCity = locationParts.filter((p: string) => p !== parsedState && p !== parsedCountry).join(", ");
      // Parse languages (stored as comma-separated string)
      const parsedLanguages = data.language
        ? data.language.split(", ").map((l: string) => l.trim()).filter(Boolean)
        : ["English"];
      setFormData({
        name: data.name || "",  // Community name
        country: parsedCountry || "United States",
        city: parsedCity,
        state: parsedState,
        phone: data.phone || "",
        languages: parsedLanguages,
        member_count_min: data.member_count_min?.toString() || "",
        member_count_max: data.member_count_max?.toString() || "",
        contact_role: data.contact_role || "",
      });
      // Populate venue info from profile
      if (data.venue_info) {
        setVenueInfo({
          facility_size: data.venue_info.facility_size || "",
          venue_type: data.venue_info.venue_type || "",
          stage_dimensions: data.venue_info.stage_dimensions || "",
          expected_attendance: data.venue_info.expected_attendance?.toString() || "",
          sound_system: data.venue_info.sound_system || false,
          speaker_system: data.venue_info.speaker_system || "",
          lighting: data.venue_info.lighting || false,
          camera_available: data.venue_info.camera_available || false,
          green_room: data.venue_info.green_room || false,
          catering: data.venue_info.catering || false,
          wifi: data.venue_info.wifi || false,
          parking: data.venue_info.parking || "",
          accessibility: data.venue_info.accessibility || "",
          load_in_access: data.venue_info.load_in_access || "",
          additional_notes: data.venue_info.additional_notes || "",
        });
      }
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

      const response = await fetch(`${API_URL}/hosts/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,  // Community name
          location: [formData.city, formData.state, formData.country].filter(Boolean).join(", "),
          phone: formData.phone || null,
          language: formData.languages.join(", "),
          member_count_min: formData.member_count_min ? parseInt(formData.member_count_min) : null,
          member_count_max: formData.member_count_max ? parseInt(formData.member_count_max) : null,
          contact_role: formData.contact_role || null,
          venue_info: {
            facility_size: venueInfo.facility_size || null,
            venue_type: venueInfo.venue_type || null,
            stage_dimensions: venueInfo.stage_dimensions || null,
            expected_attendance: venueInfo.expected_attendance ? parseInt(venueInfo.expected_attendance) : null,
            sound_system: venueInfo.sound_system,
            speaker_system: venueInfo.speaker_system || null,
            lighting: venueInfo.lighting,
            camera_available: venueInfo.camera_available,
            green_room: venueInfo.green_room,
            catering: venueInfo.catering,
            wifi: venueInfo.wifi,
            parking: venueInfo.parking || null,
            accessibility: venueInfo.accessibility || null,
            load_in_access: venueInfo.load_in_access || null,
            additional_notes: venueInfo.additional_notes || null,
          },
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
      <div className="min-h-screen bg-slate-50 pt-24 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    );
  }

  if (noProfile) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Home size={48} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Host Profile</h2>
          <p className="text-slate-600 mb-6">
            Your account doesn&apos;t have a linked host profile.
          </p>
          <Link
            href="/dashboard/admin"
            className="btn-primary inline-flex items-center gap-2"
          >
            Back to Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Back Button */}
        <Link
          href="/dashboard/host"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        {/* Page Title */}
        <h1 className="text-2xl font-bold text-slate-900 mb-8">
          Settings
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
              <div className="space-y-3">
                <div className="relative">
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value, state: "" })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 appearance-none bg-white transition-colors"
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 transition-colors"
                  />
                  {(formData.country === "United States" || formData.country === "Canada") && (
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
                  )}
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

          {/* Venue Information Section */}
          <div className="pt-8 mt-8 border-t border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Building2 size={20} />
              Venue Information
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              This info will be automatically shared with artists when you send booking requests.
            </p>

            <div className="space-y-5">
              {/* Venue Type & Facility Size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Venue Type</label>
                  <div className="relative">
                    <select
                      value={venueInfo.venue_type}
                      onChange={(e) => setVenueInfo({ ...venueInfo, venue_type: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 appearance-none bg-white transition-colors"
                    >
                      <option value="">Select type</option>
                      {VENUE_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Facility Size</label>
                  <input
                    type="text"
                    value={venueInfo.facility_size}
                    onChange={(e) => setVenueInfo({ ...venueInfo, facility_size: e.target.value })}
                    placeholder="e.g., 5,000 sq ft"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 transition-colors"
                  />
                </div>
              </div>

              {/* Stage & Attendance */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Stage Dimensions</label>
                  <input
                    type="text"
                    value={venueInfo.stage_dimensions}
                    onChange={(e) => setVenueInfo({ ...venueInfo, stage_dimensions: e.target.value })}
                    placeholder="e.g., 20ft x 15ft"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Expected Attendance</label>
                  <input
                    type="text"
                    value={venueInfo.expected_attendance}
                    onChange={(e) => setVenueInfo({ ...venueInfo, expected_attendance: e.target.value })}
                    placeholder="e.g., 200"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 transition-colors"
                  />
                </div>
              </div>

              {/* Speaker System & Accessibility (dropdowns) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Speaker System</label>
                  <div className="relative">
                    <select
                      value={venueInfo.speaker_system}
                      onChange={(e) => setVenueInfo({ ...venueInfo, speaker_system: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 appearance-none bg-white transition-colors"
                    >
                      <option value="">Select option</option>
                      {SPEAKER_SYSTEM_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                    <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Accessibility</label>
                  <div className="relative">
                    <select
                      value={venueInfo.accessibility}
                      onChange={(e) => setVenueInfo({ ...venueInfo, accessibility: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 appearance-none bg-white transition-colors"
                    >
                      <option value="">Select option</option>
                      {ACCESSIBILITY_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                    <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Parking & Load-In */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Parking</label>
                  <input
                    type="text"
                    value={venueInfo.parking}
                    onChange={(e) => setVenueInfo({ ...venueInfo, parking: e.target.value })}
                    placeholder="e.g., Free lot, 50 spaces"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Load-In Access</label>
                  <input
                    type="text"
                    value={venueInfo.load_in_access}
                    onChange={(e) => setVenueInfo({ ...venueInfo, load_in_access: e.target.value })}
                    placeholder="e.g., Side door, ground level"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 transition-colors"
                  />
                </div>
              </div>

              {/* Amenities (boolean toggles) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {([
                    ["sound_system", "Sound System"],
                    ["lighting", "Lighting"],
                    ["camera_available", "Camera"],
                    ["green_room", "Green Room"],
                    ["catering", "Catering"],
                    ["wifi", "WiFi"],
                  ] as [keyof VenueInfo, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setVenueInfo({ ...venueInfo, [key]: !venueInfo[key] })}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        venueInfo[key]
                          ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-300"
                          : "bg-white text-slate-600 border-2 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes</label>
                <textarea
                  value={venueInfo.additional_notes}
                  onChange={(e) => setVenueInfo({ ...venueInfo, additional_notes: e.target.value })}
                  placeholder="Any other details artists should know about your venue..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 transition-colors resize-none"
                />
              </div>
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
