"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Music, Loader2, MapPin, ArrowLeft } from "lucide-react";
import { API_URL } from "@/lib/api";
import { showError } from "@/lib/toast";

type Role = "community" | "artist";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"role" | "host-form">("role");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [communityName, setCommunityName] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          router.replace("/login");
          return;
        }

        const user = await res.json();

        // Already has a profile — redirect to correct dashboard
        if (user.is_superuser) {
          router.replace("/dashboard/host");
          return;
        }
        if (user.community_id) {
          router.replace("/dashboard/host");
          return;
        }
        if (user.artist_id) {
          router.replace("/dashboard/talent");
          return;
        }
      } catch {
        router.replace("/login");
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleRoleSelect = async (role: Role) => {
    setSelectedRole(role);

    if (role === "artist") {
      // Set role to artist, then redirect to talent registration
      setSubmitting(true);
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_URL}/auth/complete-profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: "artist" }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || "Failed to set role");
        }

        router.push("/register/talent");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        showError(msg);
        setSubmitting(false);
        setSelectedRole(null);
      }
      return;
    }

    // Host — show the form
    setStep("host-form");
  };

  const handleHostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/auth/complete-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: "community",
          community_name: communityName.trim(),
          location: location.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to create profile");
      }

      router.push("/dashboard/host");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      showError(msg);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="card max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white text-center">
          <h1 className="text-2xl font-bold mb-2">
            {step === "role" ? "Welcome to Kolamba" : "Set Up Your Community"}
          </h1>
          <p className="text-slate-300">
            {step === "role"
              ? "How would you like to use the platform?"
              : "Tell us about your community"}
          </p>
        </div>

        <div className="p-8">
          {step === "role" && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleRoleSelect("community")}
                disabled={submitting}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition-all text-center group"
              >
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Building2 className="w-7 h-7 text-green-700" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">I&apos;m a Host</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Community, venue, or organization
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect("artist")}
                disabled={submitting}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition-all text-center group"
              >
                {submitting && selectedRole === "artist" ? (
                  <Loader2 className="w-7 h-7 animate-spin text-slate-400" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Music className="w-7 h-7 text-blue-700" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-900">I&apos;m a Talent</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Artist, performer, or speaker
                  </p>
                </div>
              </button>
            </div>
          )}

          {step === "host-form" && (
            <>
              <button
                onClick={() => {
                  setStep("role");
                  setSelectedRole(null);
                  setError(null);
                }}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <form onSubmit={handleHostSubmit} className="space-y-5">
                <div>
                  <label className="block font-medium text-slate-700 mb-2">
                    <Building2 className="inline-block mr-2" size={18} />
                    Community Name
                  </label>
                  <input
                    type="text"
                    value={communityName}
                    onChange={(e) => setCommunityName(e.target.value)}
                    placeholder="e.g. Beth Israel Congregation"
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-2">
                    <MapPin className="inline-block mr-2" size={18} />
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Chicago, IL"
                    required
                    className="input"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    "Continue"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
