"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleGoogleResponse = useCallback(async (response: { credential: string }) => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Google login failed");
      }

      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      // Honor redirect param if present
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        // Get user role for redirect
        const meRes = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${data.access_token}` },
        });

        if (meRes.ok) {
          const user = await meRes.json();
          // Onboarding check: new user without a profile
          if (!user.is_superuser && !user.community_id && !user.artist_id) {
            router.push("/onboarding");
          } else if (user.is_superuser) {
            router.push("/dashboard/admin");
          } else if (user.role === "artist") {
            router.push("/dashboard/talent");
          } else if (user.role === "agent") {
            router.push("/dashboard/agent");
          } else if (user.role === "community") {
            router.push("/dashboard/host");
          } else {
            router.push("/");
          }
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google login failed";
      setError(msg);
      showError(msg);
    } finally {
      setIsGoogleLoading(false);
    }
  }, [router, redirectTo]);

  const initGoogleSignIn = useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleResponse,
    });

    const btnContainer = document.getElementById("google-signin-btn");
    if (btnContainer) {
      window.google.accounts.id.renderButton(btnContainer, {
        theme: "outline",
        size: "large",
        width: "100%",
        text: "signin_with",
      });
    }
  }, [handleGoogleResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formBody = new URLSearchParams();
      formBody.append("username", formData.email);
      formBody.append("password", formData.password);

      const response = await fetch(
        `${API_URL}/auth/login`,
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
        throw new Error(data.detail || "Login failed. Please check your credentials.");
      }

      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      // Honor redirect param if present
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        const meResponse = await fetch(
          `${API_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${data.access_token}`,
            },
          }
        );

        if (meResponse.ok) {
          const user = await meResponse.json();
          // Onboarding check: new user without a profile
          if (!user.is_superuser && !user.community_id && !user.artist_id) {
            router.push("/onboarding");
          } else if (user.is_superuser) {
            router.push("/dashboard/admin");
          } else if (user.role === "artist") {
            router.push("/dashboard/talent");
          } else if (user.role === "agent") {
            router.push("/dashboard/agent");
          } else if (user.role === "community") {
            router.push("/dashboard/host");
          } else {
            router.push("/");
          }
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-20">
      <div className="card max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-slate-300">Sign in to your account</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block font-medium text-slate-700 mb-2">
                <Mail className="inline-block mr-2" size={18} />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="your@email.com"
                required
                className="input"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-medium text-slate-700 mb-2">
                <Lock className="inline-block mr-2" size={18} />
                Password
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
                  className="input pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">or continue with</span>
            </div>
          </div>

          {/* Google Sign-In */}
          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <div className="mb-8">
              <div id="google-signin-btn" className="flex justify-center" />
              {isGoogleLoading && (
                <p className="text-sm text-center text-slate-500 mt-2">
                  Signing in with Google...
                </p>
              )}
              <Script
                src="https://accounts.google.com/gsi/client"
                strategy="afterInteractive"
                onLoad={initGoogleSignIn}
              />
            </div>
          )}

          {/* Register links */}
          <div className="space-y-4">
            <p className="text-center text-slate-600 text-sm">
              Don&apos;t have an account?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/register/talent" className="btn-secondary text-sm justify-center">
                Join as Talent
              </Link>
              <Link href="/register/host" className="btn-primary text-sm justify-center">
                Register as Host
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
