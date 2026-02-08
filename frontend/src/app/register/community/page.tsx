"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CheckCircle, ChevronDown, X } from "lucide-react";
import { API_URL } from "@/lib/api";
import { showError } from "@/lib/toast";

interface CommunityOptions {
  community_types: string[];
  event_types: string[];
  contact_roles: string[];
  languages: string[];
}

interface FormData {
  communityName: string;
  country: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  memberCountMin: number | null;
  memberCountMax: number | null;
  languages: string[];
  eventTypes: string[];
  name: string;
  contactRole: string;
  email: string;
  phone: string;
  phoneCountryCode: string;
  acceptTerms: boolean;
}

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

const communityRoles = [
  "Executive Director / CEO",
  "Program / Cultural Director",
  "Rabbi / Spiritual Leader",
  "Educator / School Director",
  "Administrative Staff",
  "Shaliach",
  "Community Member / Participant",
  "Other",
];

const countryCodes = [
  { code: "+1", label: "US/Canada (+1)" },
  { code: "+972", label: "Israel (+972)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+33", label: "France (+33)" },
  { code: "+49", label: "Germany (+49)" },
  { code: "+34", label: "Spain (+34)" },
  { code: "+39", label: "Italy (+39)" },
  { code: "+31", label: "Netherlands (+31)" },
  { code: "+32", label: "Belgium (+32)" },
  { code: "+41", label: "Switzerland (+41)" },
  { code: "+43", label: "Austria (+43)" },
  { code: "+46", label: "Sweden (+46)" },
  { code: "+47", label: "Norway (+47)" },
  { code: "+45", label: "Denmark (+45)" },
  { code: "+358", label: "Finland (+358)" },
  { code: "+48", label: "Poland (+48)" },
  { code: "+7", label: "Russia (+7)" },
  { code: "+380", label: "Ukraine (+380)" },
  { code: "+36", label: "Hungary (+36)" },
  { code: "+420", label: "Czech Rep (+420)" },
  { code: "+54", label: "Argentina (+54)" },
  { code: "+55", label: "Brazil (+55)" },
  { code: "+52", label: "Mexico (+52)" },
  { code: "+56", label: "Chile (+56)" },
  { code: "+57", label: "Colombia (+57)" },
  { code: "+61", label: "Australia (+61)" },
  { code: "+64", label: "New Zealand (+64)" },
  { code: "+27", label: "South Africa (+27)" },
  { code: "+251", label: "Ethiopia (+251)" },
];

export default function CommunityRegistrationPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [options, setOptions] = useState<CommunityOptions | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [eventTypeSearch, setEventTypeSearch] = useState("");
  const [showEventDropdown, setShowEventDropdown] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    communityName: "",
    country: "United States",
    city: "",
    state: "",
    latitude: null,
    longitude: null,
    memberCountMin: null,
    memberCountMax: null,
    languages: ["English"],
    eventTypes: [],
    name: "",
    contactRole: "",
    email: "",
    phone: "",
    phoneCountryCode: "+1",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch(
          `${API_URL}/communities/options`
        );
        if (response.ok) {
          const data = await response.json();
          setOptions(data);
        }
      } catch (error) {
        setOptions({
          community_types: [],
          event_types: [
            "Holiday Celebrations",
            "Shabbat Service",
            "Concerts",
            "Lectures",
            "Workshops",
            "Children Shows",
            "Educational Programs",
            "Cultural Festivals",
            "Family Events",
            "Youth Programs",
          ],
          contact_roles: communityRoles,
          languages: ["English", "Hebrew", "French", "Spanish", "Russian", "Italian", "Amharic", "Dutch", "Swedish", "Yiddish"],
        });
      }
    };
    fetchOptions();
  }, []);

  const checkDuplicateName = useCallback(async (name: string) => {
    if (name.length < 2) {
      setDuplicateWarning(null);
      return;
    }
    try {
      const response = await fetch(
        `${API_URL}/communities/check-name?name=${encodeURIComponent(name)}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          setDuplicateWarning("This Name Is Already Taken");
        } else {
          setDuplicateWarning(null);
        }
      }
    } catch (error) {
      // Ignore
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.communityName) {
        checkDuplicateName(formData.communityName);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.communityName, checkDuplicateName]);

  const handleAddEventType = (eventType: string) => {
    if (!formData.eventTypes.includes(eventType)) {
      setFormData({ ...formData, eventTypes: [...formData.eventTypes, eventType] });
    }
    setEventTypeSearch("");
    setShowEventDropdown(false);
  };

  const handleRemoveEventType = (eventType: string) => {
    setFormData({
      ...formData,
      eventTypes: formData.eventTypes.filter((e) => e !== eventType),
    });
  };

  const filteredEventTypes = (options?.event_types || []).filter(
    (type) =>
      type.toLowerCase().includes(eventTypeSearch.toLowerCase()) &&
      !formData.eventTypes.includes(type)
  );

  // Helper to detect Hebrew characters
  const containsHebrew = (text: string) => /[\u0590-\u05FF]/.test(text);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.communityName || formData.communityName.length < 2) {
      newErrors.communityName = "Community name is required";
    } else if (containsHebrew(formData.communityName)) {
      newErrors.communityName = "Please use English characters only";
    }
    if (!formData.country) {
      newErrors.country = "Country is required";
    }
    if (!formData.city || formData.city.length < 2) {
      newErrors.city = "City is required";
    } else if (containsHebrew(formData.city)) {
      newErrors.city = "Please use English characters only";
    }
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Full name is required";
    } else if (containsHebrew(formData.name)) {
      newErrors.name = "Please use English characters only";
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }
    if (!formData.phone || formData.phone.length < 6) {
      newErrors.phone = "Please enter a valid phone number (at least 6 digits)";
    } else if (formData.phone.length > 15) {
      newErrors.phone = "Phone number is too long";
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the Terms of Service";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}/communities`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            name: formData.name,
            community_name: formData.communityName,
            location: [formData.city, formData.state, formData.country].filter(Boolean).join(", "),
            latitude: formData.latitude,
            longitude: formData.longitude,
            member_count_min: formData.memberCountMin,
            member_count_max: formData.memberCountMax,
            event_types: formData.eventTypes.length > 0 ? formData.eventTypes : null,
            contact_role: formData.contactRole || null,
            phone: formData.phone ? `${formData.phoneCountryCode} ${formData.phone}` : null,
            language: formData.languages.join(", "),
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Registration failed");
      }

      setIsSubmitted(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      setErrors({ submit: errorMessage });
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-teal-600" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Registration Successful!
          </h1>
          <p className="text-slate-600 mb-6">
            Thank you for joining Kolamba. You can now sign in to your account.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="px-6 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>
            <Link href="/" className="text-slate-600 hover:text-slate-800 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-28 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-8 mb-12">
          <h1 className="text-2xl font-bold text-slate-900 tracking-wide">KOLAMBA</h1>
          <span className="text-xl text-slate-600">COMMUNITY SIGN UP</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-8">
            {/* Left Column - Community Details */}
            <div className="space-y-6">
              {/* Section Header */}
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                1 | Community Info
              </h2>
              {/* Community Name */}
              <div>
                <label className="block text-base font-medium text-slate-800 mb-2">
                  Community Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.communityName}
                  onChange={(e) =>
                    setFormData({ ...formData, communityName: e.target.value })
                  }
                  placeholder="City, State/Country"
                  className={`w-full px-4 py-3.5 border-2 rounded-lg text-base focus:outline-none transition-colors ${
                    duplicateWarning
                      ? "border-slate-300"
                      : errors.communityName
                        ? "border-red-300 focus:border-red-400"
                        : "border-slate-300 focus:border-slate-400"
                  }`}
                />
                {duplicateWarning && (
                  <p className="mt-2 text-sm text-teal-600">{duplicateWarning}</p>
                )}
                {errors.communityName && !duplicateWarning && (
                  <p className="mt-2 text-sm text-red-500">{errors.communityName}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-base font-medium text-slate-800 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {/* Country */}
                  <div className="relative">
                    <select
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value, state: "" })
                      }
                      className={`w-full px-4 py-3.5 border-2 rounded-lg text-base focus:outline-none appearance-none bg-white transition-colors ${
                        errors.country
                          ? "border-red-300 focus:border-red-400"
                          : "border-slate-300 focus:border-slate-400"
                      }`}
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={20}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    {errors.country && (
                      <p className="mt-2 text-sm text-red-500">{errors.country}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {/* City */}
                    <div>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        placeholder="City"
                        className={`w-full px-4 py-3.5 border-2 rounded-lg text-base focus:outline-none transition-colors ${
                          errors.city
                            ? "border-red-300 focus:border-red-400"
                            : "border-slate-300 focus:border-slate-400"
                        }`}
                      />
                      {errors.city && (
                        <p className="mt-2 text-sm text-red-500">{errors.city}</p>
                      )}
                    </div>
                    {/* State - only for US/Canada */}
                    {(formData.country === "United States" || formData.country === "Canada") && (
                      <div className="relative">
                        <select
                          value={formData.state}
                          onChange={(e) =>
                            setFormData({ ...formData, state: e.target.value })
                          }
                          className="w-full px-4 py-3.5 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-slate-400 appearance-none bg-white transition-colors"
                        >
                          <option value="">State (Optional)</option>
                          {usStates.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={20}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* How Many Members */}
              <div>
                <label className="block text-base font-medium text-slate-800 mb-2">
                  How Many Members?
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={
                      formData.memberCountMin && formData.memberCountMax
                        ? `${formData.memberCountMin}-${formData.memberCountMax}`
                        : formData.memberCountMin || ""
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.includes("-")) {
                        const [min, max] = val.split("-").map((v) => parseInt(v) || null);
                        setFormData({ ...formData, memberCountMin: min, memberCountMax: max });
                      } else {
                        const num = parseInt(val) || null;
                        setFormData({ ...formData, memberCountMin: num, memberCountMax: null });
                      }
                    }}
                    placeholder="120-150"
                    className="w-28 px-4 py-3.5 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-slate-400 transition-colors"
                  />
                  <span className="text-slate-600 text-base">People</span>
                </div>
              </div>

              {/* Main Language */}
              <div>
                <label className="block text-base font-medium text-slate-800 mb-2">
                  Main Language
                </label>
                <div className="flex flex-wrap gap-2">
                  {(options?.languages || ["English", "Hebrew", "French", "Spanish", "Russian", "Italian", "Amharic", "Dutch", "Swedish", "Yiddish"]).map((lang) => (
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

              {/* Types Of Community Events */}
              <div>
                <label className="block text-base font-medium text-slate-800 mb-2">
                  Types Of Community Events
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={eventTypeSearch}
                    onChange={(e) => {
                      setEventTypeSearch(e.target.value);
                      setShowEventDropdown(true);
                    }}
                    onFocus={() => setShowEventDropdown(true)}
                    placeholder="Holiday"
                    className="w-full px-4 py-3.5 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-slate-400 transition-colors"
                  />
                  {showEventDropdown && filteredEventTypes.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border-2 border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                      {filteredEventTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleAddEventType(type)}
                          className="w-full px-4 py-3 text-left text-base hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.eventTypes.map((type) => (
                    <span
                      key={type}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-800 rounded-full text-sm font-medium"
                    >
                      {type}
                      <button
                        type="button"
                        onClick={() => handleRemoveEventType(type)}
                        className="hover:text-teal-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Contact Info */}
            <div className="space-y-6">
              {/* Section Header */}
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                2 | Contact Info
              </h2>
              {/* Full Name */}
              <div>
                <label className="block text-base font-medium text-slate-800 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Israel Israeli"
                  className={`w-full px-4 py-3.5 border-2 rounded-lg text-base focus:outline-none transition-colors ${
                    errors.name
                      ? "border-red-300 focus:border-red-400"
                      : "border-slate-300 focus:border-slate-400"
                  }`}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Community Role */}
              <div>
                <label className="block text-base font-medium text-slate-800 mb-2">
                  Community Role
                </label>
                <div className="relative">
                  <select
                    value={formData.contactRole}
                    onChange={(e) =>
                      setFormData({ ...formData, contactRole: e.target.value })
                    }
                    className="w-full px-4 py-3.5 border-2 border-slate-300 rounded-lg text-base focus:outline-none focus:border-slate-400 appearance-none bg-white transition-colors"
                  >
                    <option value="">Select your role</option>
                    {communityRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={20}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-base font-medium text-slate-800 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  className={`w-full px-4 py-3.5 border-2 rounded-lg text-base focus:outline-none transition-colors ${
                    errors.email
                      ? "border-red-300 focus:border-red-400"
                      : "border-slate-300 focus:border-slate-400"
                  }`}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-base font-medium text-slate-800 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <div className="relative">
                    <select
                      value={formData.phoneCountryCode}
                      onChange={(e) =>
                        setFormData({ ...formData, phoneCountryCode: e.target.value })
                      }
                      className="h-full px-3 py-3.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-slate-400 appearance-none bg-white pr-10 text-teal-600"
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500 pointer-events-none"
                    />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      // Only allow digits
                      const digits = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, phone: digits });
                    }}
                    placeholder="1234567890"
                    maxLength={15}
                    className={`flex-1 px-4 py-3.5 border-2 rounded-lg text-base focus:outline-none transition-colors ${
                      errors.phone
                        ? "border-red-300 focus:border-red-400"
                        : "border-slate-300 focus:border-slate-400"
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Terms Acceptance */}
          <div className="mt-12 flex justify-center">
            <label className="flex items-start gap-3 cursor-pointer max-w-md">
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) =>
                  setFormData({ ...formData, acceptTerms: e.target.checked })
                }
                className="mt-1 w-5 h-5 text-teal-500 border-2 border-slate-300 rounded focus:ring-teal-400"
              />
              <span className="text-slate-600 text-sm">
                I accept the{" "}
                <Link href="/terms" className="text-teal-600 hover:text-teal-700 underline" target="_blank">
                  Terms of Service
                </Link>
              </span>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-red-500 text-sm text-center mt-2">{errors.acceptTerms}</p>
          )}

          {/* Submit Button */}
          <div className="mt-8 flex flex-col items-center">
            {errors.submit && (
              <p className="text-red-500 text-sm mb-4">{errors.submit}</p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-16 py-4 bg-slate-900 text-white rounded-full font-semibold text-base hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Registration"}
            </button>
          </div>
        </form>

        <p className="text-center text-slate-500 text-sm mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
