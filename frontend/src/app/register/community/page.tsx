"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, User, Mail, MapPin, Users, Globe, CheckCircle } from "lucide-react";

export default function CommunityRegistrationPage() {
  const router = useRouter();
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Name is required";
    }
    if (!formData.communityName || formData.communityName.length < 2) {
      newErrors.communityName = "Community name is required";
    }
    if (!formData.location || formData.location.length < 3) {
      newErrors.location = "Location is required";
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
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/register/community`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
      setErrors({ submit: error instanceof Error ? error.message : "Registration failed" });
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
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Registration Successful!</h1>
          <p className="text-slate-600 mb-6">Thank you for joining Kolamba. You can now sign in to your account.</p>
          <div className="flex flex-col gap-3">
            <Link href="/login" className="btn-primary justify-center">
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
    <div className="min-h-screen bg-slate-50 py-12 px-4 pt-24">
      <div className="max-w-lg mx-auto">
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white text-center">
            <h1 className="text-2xl font-bold mb-2">Community Registration</h1>
            <p className="text-slate-300">Join Kolamba and connect with talented artists</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  <Mail className="inline-block mr-2" size={18} />
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@community.org"
                  className={`input ${errors.email ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  <User className="inline-block mr-2" size={18} />
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your full name"
                  className={`input ${errors.name ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  <Building2 className="inline-block mr-2" size={18} />
                  Community Name *
                </label>
                <input
                  type="text"
                  value={formData.communityName}
                  onChange={(e) => setFormData({ ...formData, communityName: e.target.value })}
                  placeholder="Beth Israel Synagogue"
                  className={`input ${errors.communityName ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                />
                {errors.communityName && <p className="mt-1 text-sm text-red-500">{errors.communityName}</p>}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  <MapPin className="inline-block mr-2" size={18} />
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="New York, NY"
                  className={`input ${errors.location ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                />
                {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  <Users className="inline-block mr-2" size={18} />
                  Community Size
                </label>
                <select
                  value={formData.audienceSize}
                  onChange={(e) => setFormData({ ...formData, audienceSize: e.target.value })}
                  className="input"
                >
                  <option value="">Select...</option>
                  <option value="small">Small (up to 100)</option>
                  <option value="medium">Medium (100-500)</option>
                  <option value="large">Large (500+)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  <Globe className="inline-block mr-2" size={18} />
                  Primary Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="input"
                >
                  <option value="English">English</option>
                  <option value="Hebrew">Hebrew</option>
                  <option value="French">French</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Russian">Russian</option>
                </select>
              </div>

              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {errors.submit}
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
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
