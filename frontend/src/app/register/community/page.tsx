"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  User,
  Mail,
  Globe,
  CheckCircle,
  Briefcase,
  Calendar,
  AlertCircle,
} from "lucide-react";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";
import TagInput from "@/components/ui/TagInput";
import PhoneInput from "@/components/ui/PhoneInput";
import MemberCountInput from "@/components/ui/MemberCountInput";

interface CommunityOptions {
  community_types: string[];
  event_types: string[];
  contact_roles: string[];
  languages: string[];
}

interface FormData {
  email: string;
  name: string;
  communityName: string;
  communityType: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  memberCountMin: number | null;
  memberCountMax: number | null;
  eventTypes: string[];
  contactRole: string;
  phone: string;
  language: string;
}

export default function CommunityRegistrationPage() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [options, setOptions] = useState<CommunityOptions | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [isCheckingName, setIsCheckingName] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    name: "",
    communityName: "",
    communityType: "",
    location: "",
    latitude: null,
    longitude: null,
    memberCountMin: null,
    memberCountMax: null,
    eventTypes: [],
    contactRole: "",
    phone: "",
    language: "English",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch community options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/communities/options`
        );
        if (response.ok) {
          const data = await response.json();
          setOptions(data);
        }
      } catch (error) {
        // Use defaults if fetch fails
        setOptions({
          community_types: [
            "JCC",
            "Synagogue",
            "Temple",
            "Jewish School",
            "Summer Camp",
            "Campus Organization",
            "Federation",
            "Cultural Center",
            "Museum",
            "Independent Community",
          ],
          event_types: [
            "Concerts",
            "Lectures",
            "Workshops",
            "Children Shows",
            "Holiday Events",
            "Shabbat Programs",
            "Educational Programs",
            "Cultural Festivals",
            "Family Events",
            "Youth Programs",
          ],
          contact_roles: [
            "Executive Director",
            "Program Director",
            "Rabbi",
            "Cantor",
            "Education Director",
            "Events Coordinator",
            "Administrator",
            "Board Member",
            "Other",
          ],
          languages: ["English", "Hebrew", "French", "Spanish", "Russian", "German", "Portuguese"],
        });
      }
    };
    fetchOptions();
  }, []);

  // Check for duplicate community name with debounce
  const checkDuplicateName = useCallback(async (name: string) => {
    if (name.length < 2) {
      setDuplicateWarning(null);
      return;
    }

    setIsCheckingName(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/communities/check-name?name=${encodeURIComponent(name)}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          setDuplicateWarning(
            "A community with this name already exists. Please use a different name."
          );
        } else if (data.similar_names?.length > 0) {
          setDuplicateWarning(
            `Similar communities exist: ${data.similar_names.join(", ")}. Is this a new community?`
          );
        } else {
          setDuplicateWarning(null);
        }
      }
    } catch (error) {
      // Ignore errors in name check
    } finally {
      setIsCheckingName(false);
    }
  }, []);

  // Debounce name check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.communityName) {
        checkDuplicateName(formData.communityName);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.communityName, checkDuplicateName]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Contact name is required";
    }
    if (!formData.communityName || formData.communityName.length < 2) {
      newErrors.communityName = "Community name is required";
    }
    if (!formData.location || formData.location.length < 3) {
      newErrors.location = "Location is required";
    }
    if (
      formData.memberCountMin !== null &&
      formData.memberCountMax !== null &&
      formData.memberCountMin > formData.memberCountMax
    ) {
      newErrors.memberCount = "Minimum must be less than maximum";
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
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/communities`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            name: formData.name,
            community_name: formData.communityName,
            community_type: formData.communityType || null,
            location: formData.location,
            latitude: formData.latitude,
            longitude: formData.longitude,
            member_count_min: formData.memberCountMin,
            member_count_max: formData.memberCountMax,
            event_types: formData.eventTypes.length > 0 ? formData.eventTypes : null,
            contact_role: formData.contactRole || null,
            phone: formData.phone || null,
            language: formData.language,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Registration failed");
      }

      setIsSubmitted(true);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Registration failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-20">
        <div className="card max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-emerald-600" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Registration Successful!
          </h1>
          <p className="text-slate-600 mb-6">
            Thank you for joining Kolamba. You can now sign in to your account
            and start discovering artists.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/login" className="btn-primary justify-center">
              Sign In
            </Link>
            <Link
              href="/"
              className="text-slate-600 hover:text-slate-800 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 pt-24">
      <div className="max-w-2xl mx-auto">
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white text-center">
            <h1 className="text-2xl font-bold mb-2">Community Registration</h1>
            <p className="text-slate-300">
              Join Kolamba and connect with talented Israeli artists
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section: Contact Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                  Contact Information
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 mb-2">
                      <Mail className="inline-block mr-2" size={18} />
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="contact@community.org"
                      className={`input ${errors.email ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-2">
                      <User className="inline-block mr-2" size={18} />
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Your full name"
                      className={`input ${errors.name ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 mb-2">
                      <Briefcase className="inline-block mr-2" size={18} />
                      Your Role
                    </label>
                    <select
                      value={formData.contactRole}
                      onChange={(e) =>
                        setFormData({ ...formData, contactRole: e.target.value })
                      }
                      className="input"
                    >
                      <option value="">Select your role...</option>
                      {(options?.contact_roles || []).map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <PhoneInput
                    value={formData.phone}
                    onChange={(phone) => setFormData({ ...formData, phone })}
                    label="Phone Number"
                  />
                </div>
              </div>

              {/* Section: Community Details */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                  Community Details
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 mb-2">
                      <Building2 className="inline-block mr-2" size={18} />
                      Community Name *
                    </label>
                    <input
                      type="text"
                      value={formData.communityName}
                      onChange={(e) =>
                        setFormData({ ...formData, communityName: e.target.value })
                      }
                      placeholder="Beth Israel Synagogue"
                      className={`input ${errors.communityName ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                    />
                    {errors.communityName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.communityName}
                      </p>
                    )}
                    {duplicateWarning && (
                      <div className="mt-2 flex items-start gap-2 text-sm text-amber-600">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                        <span>{duplicateWarning}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-2">
                      <Building2 className="inline-block mr-2" size={18} />
                      Community Type
                    </label>
                    <select
                      value={formData.communityType}
                      onChange={(e) =>
                        setFormData({ ...formData, communityType: e.target.value })
                      }
                      className="input"
                    >
                      <option value="">Select type...</option>
                      {(options?.community_types || []).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <AddressAutocomplete
                  value={formData.location}
                  onChange={(location, lat, lng) =>
                    setFormData({
                      ...formData,
                      location,
                      latitude: lat ?? null,
                      longitude: lng ?? null,
                    })
                  }
                  placeholder="Start typing your address..."
                  error={errors.location}
                  label="Location *"
                />

                <MemberCountInput
                  minValue={formData.memberCountMin}
                  maxValue={formData.memberCountMax}
                  onChange={(min, max) =>
                    setFormData({
                      ...formData,
                      memberCountMin: min,
                      memberCountMax: max,
                    })
                  }
                  error={errors.memberCount}
                  label="Community Size"
                />

                <div>
                  <label className="block font-medium text-slate-700 mb-2">
                    <Globe className="inline-block mr-2" size={18} />
                    Primary Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) =>
                      setFormData({ ...formData, language: e.target.value })
                    }
                    className="input"
                  >
                    {(options?.languages || ["English"]).map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section: Event Preferences */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
                  Event Preferences
                </h2>

                <div>
                  <label className="block font-medium text-slate-700 mb-2">
                    <Calendar className="inline-block mr-2" size={18} />
                    Types of Events You Host
                  </label>
                  <TagInput
                    options={options?.event_types || []}
                    selected={formData.eventTypes}
                    onChange={(eventTypes) =>
                      setFormData({ ...formData, eventTypes })
                    }
                    placeholder="Select event types..."
                    maxTags={5}
                  />
                </div>
              </div>

              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <span>{errors.submit}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full justify-center"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register Community"
                )}
              </button>
            </form>

            <p className="text-center text-slate-600 text-sm mt-6">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
