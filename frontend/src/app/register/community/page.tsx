"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  User,
  Mail,
  MapPin,
  Users,
  Globe,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const languages = [
  { value: "English", label: "English" },
  { value: "Hebrew", label: "עברית" },
  { value: "French", label: "Français" },
  { value: "Spanish", label: "Español" },
  { value: "Russian", label: "Русский" },
];

export default function CommunityRegistrationPage() {
  const { t, language, isRTL } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    communityName: "",
    location: "",
    audienceSize: "",
    language: "English",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const audienceSizes = [
    { value: "small", labelKey: "small" as const },
    { value: "medium", labelKey: "medium" as const },
    { value: "large", labelKey: "large" as const },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.registration.validation.emailRequired;
    }

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = t.registration.validation.nameRequired;
    }

    if (!formData.communityName || formData.communityName.length < 2) {
      newErrors.communityName = t.registration.validation.communityNameRequired;
    }

    if (!formData.location || formData.location.length < 3) {
      newErrors.location = t.registration.validation.locationRequired;
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            name: formData.name,
            community_name: formData.communityName,
            location: formData.location,
            audience_size: formData.audienceSize || null,
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
        submit:
          error instanceof Error
            ? error.message
            : t.registration.validation.submitError,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">
            {t.registration.success.title}
          </h1>
          <p className="text-neutral-600 mb-6">
            {t.registration.success.message}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/artists"
              className="px-6 py-3 bg-primary-400 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {t.registration.success.discoverArtists}
              <ArrowRight size={18} className={isRTL ? 'rotate-180' : ''} />
            </Link>
            <Link
              href="/"
              className="px-6 py-3 text-neutral-600 hover:text-neutral-800 transition-colors"
            >
              {t.registration.success.backToHome}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-sm text-neutral-500">
            <Link href="/" className="hover:text-primary-500">
              {t.pages.home}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-800">{t.registration.breadcrumb}</span>
          </nav>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-brand-gradient p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">{t.registration.title}</h1>
            <p className="text-white/80">
              {t.registration.subtitle}
            </p>
          </div>

          <div className="p-6 md:p-8">
            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-primary-50 rounded-xl">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="text-primary-600" size={24} />
                </div>
                <p className="text-sm text-neutral-700">
                  {t.registration.benefits.accessArtists}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Globe className="text-primary-600" size={24} />
                </div>
                <p className="text-sm text-neutral-700">
                  {t.registration.benefits.easyBooking}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="text-primary-600" size={24} />
                </div>
                <p className="text-sm text-neutral-700">
                  {t.registration.benefits.bilingualSupport}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Info Section */}
              <div className="border-b pb-6">
                <h2 className="font-bold text-lg text-neutral-800 mb-4">
                  {t.registration.sections.contactInfo}
                </h2>

                {/* Email */}
                <div className="mb-4">
                  <label className="block font-medium text-neutral-700 mb-2">
                    <Mail className={`inline-block ${isRTL ? 'ml-2' : 'mr-2'}`} size={18} />
                    {t.registration.fields.email} *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="your@email.com"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.email
                        ? "border-red-400 focus:ring-red-200"
                        : "border-neutral-300 focus:ring-primary-200"
                    } focus:border-primary-400 focus:ring-2 outline-none transition-all`}
                    dir="ltr"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-2">
                    <User className={`inline-block ${isRTL ? 'ml-2' : 'mr-2'}`} size={18} />
                    {t.registration.fields.fullName} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder={t.registration.placeholders.fullName}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.name
                        ? "border-red-400 focus:ring-red-200"
                        : "border-neutral-300 focus:ring-primary-200"
                    } focus:border-primary-400 focus:ring-2 outline-none transition-all`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>
              </div>

              {/* Community Info Section */}
              <div className="space-y-4">
                <h2 className="font-bold text-lg text-neutral-800 mb-4">
                  {t.registration.sections.communityInfo}
                </h2>

                {/* Community Name */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-2">
                    <Building2 className={`inline-block ${isRTL ? 'ml-2' : 'mr-2'}`} size={18} />
                    {t.registration.fields.communityName} *
                  </label>
                  <input
                    type="text"
                    value={formData.communityName}
                    onChange={(e) =>
                      setFormData({ ...formData, communityName: e.target.value })
                    }
                    placeholder={t.registration.placeholders.communityName}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.communityName
                        ? "border-red-400 focus:ring-red-200"
                        : "border-neutral-300 focus:ring-primary-200"
                    } focus:border-primary-400 focus:ring-2 outline-none transition-all`}
                  />
                  {errors.communityName && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.communityName}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-2">
                    <MapPin className={`inline-block ${isRTL ? 'ml-2' : 'mr-2'}`} size={18} />
                    {t.registration.fields.location} *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder={t.registration.placeholders.location}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.location
                        ? "border-red-400 focus:ring-red-200"
                        : "border-neutral-300 focus:ring-primary-200"
                    } focus:border-primary-400 focus:ring-2 outline-none transition-all`}
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-500">{errors.location}</p>
                  )}
                </div>

                {/* Audience Size */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-2">
                    <Users className={`inline-block ${isRTL ? 'ml-2' : 'mr-2'}`} size={18} />
                    {t.registration.fields.audienceSize}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {audienceSizes.map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, audienceSize: size.value })
                        }
                        className={`p-3 rounded-lg border text-center transition-all ${
                          formData.audienceSize === size.value
                            ? "border-primary-400 bg-primary-50 text-primary-700"
                            : "border-neutral-200 hover:border-neutral-300"
                        }`}
                      >
                        <p className="font-medium text-sm">{t.registration.audienceSizes[size.labelKey].label}</p>
                        <p className="text-xs text-neutral-500">
                          {t.registration.audienceSizes[size.labelKey].description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-2">
                    <Globe className={`inline-block ${isRTL ? 'ml-2' : 'mr-2'}`} size={18} />
                    {t.registration.fields.primaryLanguage}
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) =>
                      setFormData({ ...formData, language: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {errors.submit}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary-400 hover:bg-primary-600 disabled:bg-primary-300 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    {t.registration.submitting}
                  </>
                ) : (
                  t.registration.submit
                )}
              </button>

              <p className="text-sm text-neutral-500 text-center">
                {t.registration.termsPrefix}
                <Link href="/terms" className="text-primary-500 hover:underline">
                  {t.registration.termsLink}
                </Link>{" "}
                {t.registration.and}
                <Link href="/privacy" className="text-primary-500 hover:underline">
                  {t.registration.privacyLink}
                </Link>
              </p>

              <p className="text-sm text-neutral-500 text-center border-t pt-4">
                {t.registration.alreadyRegistered}{" "}
                <Link
                  href="/login"
                  className="text-primary-500 hover:underline font-medium"
                >
                  {t.registration.loginHere}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
