"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formBody = new URLSearchParams();
      formBody.append("username", formData.email);
      formBody.append("password", formData.password);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formBody.toString(),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || t.auth.loginError);
      }

      const data = await response.json();

      // Store tokens
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      // Get user info to determine redirect
      const meResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        }
      );

      if (meResponse.ok) {
        const user = await meResponse.json();
        // Redirect based on role
        if (user.role === "artist") {
          router.push("/dashboard/artist");
        } else if (user.role === "community") {
          router.push("/dashboard/community");
        } else {
          router.push("/");
        }
      } else {
        router.push("/");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : t.auth.loginError
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-brand-gradient p-6 text-white text-center">
          <h1 className="text-2xl font-bold mb-2">{t.auth.login}</h1>
          <p className="text-white/80">{t.auth.welcomeBack}</p>
        </div>

        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block font-medium text-neutral-700 mb-2">
                <Mail className={`inline-block ${isRTL ? 'ml-2' : 'mr-2'}`} size={18} />
                {t.auth.email}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                dir="ltr"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-medium text-neutral-700 mb-2">
                <Lock className={`inline-block ${isRTL ? 'ml-2' : 'mr-2'}`} size={18} />
                {t.auth.password}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none transition-all pl-12"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className={isRTL ? "text-left" : "text-right"}>
              <Link
                href="/forgot-password"
                className="text-sm text-primary-500 hover:underline"
              >
                {t.auth.forgotPassword}
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary-400 hover:bg-primary-600 disabled:bg-primary-300 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  {t.auth.loggingIn}
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  {t.auth.login}
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-neutral-500">{t.auth.or}</span>
            </div>
          </div>

          {/* Register links */}
          <div className="space-y-3">
            <p className="text-center text-neutral-600 text-sm">
              {t.auth.notRegistered}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/register/artist"
                className="py-2 px-4 border border-primary-400 text-primary-600 rounded-lg text-center text-sm font-medium hover:bg-primary-50 transition-colors"
              >
                {t.auth.registerAsArtist}
              </Link>
              <Link
                href="/register/community"
                className="py-2 px-4 border border-secondary-400 text-secondary-600 rounded-lg text-center text-sm font-medium hover:bg-secondary-50 transition-colors"
              >
                {t.auth.registerAsCommunity}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
