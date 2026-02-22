"use client";

import { useState, useEffect, useRef } from "react";
import { Shield, X } from "lucide-react";
import api, { API_URL } from "@/lib/api";

interface UserInfo {
  id: number;
  email: string;
  name: string | null;
  role: string;
  is_superuser: boolean;
}

const ADMIN_TOKEN_KEY = "admin_access_token";
const ADMIN_REFRESH_KEY = "admin_refresh_token";

export default function UserSwitcher() {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [switching, setSwitching] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) return;

    // Check if we're impersonating (admin token exists and differs from current)
    const impersonating = !!adminToken && adminToken !== token;
    setIsImpersonating(impersonating);

    // Fetch current user info (uses api client which handles token refresh)
    api.get<UserInfo & { is_superuser: boolean }>("/auth/me")
      .then((data) => {
        if (data) {
          // Show switcher if user is superuser OR if impersonating (admin token saved)
          if (data.is_superuser || impersonating) {
            setCurrentUser(data);
            // If this is a superuser and no admin token saved yet, save it
            if (data.is_superuser && !adminToken) {
              const freshToken = localStorage.getItem("access_token");
              if (freshToken) localStorage.setItem(ADMIN_TOKEN_KEY, freshToken);
              const refreshTkn = localStorage.getItem("refresh_token");
              if (refreshTkn) localStorage.setItem(ADMIN_REFRESH_KEY, refreshTkn);
            }
          }
        }
      })
      .catch(() => {
        // Auth failed — try falling back to admin token if it exists
        if (adminToken && adminToken !== token) {
          fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${adminToken}` },
          })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data) {
                // Admin token still valid — restore it and reload
                localStorage.setItem("access_token", adminToken);
                const adminRefresh = localStorage.getItem(ADMIN_REFRESH_KEY);
                if (adminRefresh) localStorage.setItem("refresh_token", adminRefresh);
                localStorage.removeItem(ADMIN_TOKEN_KEY);
                localStorage.removeItem(ADMIN_REFRESH_KEY);
                window.location.reload();
              } else {
                // Both tokens failed — clean up
                localStorage.removeItem(ADMIN_TOKEN_KEY);
                localStorage.removeItem(ADMIN_REFRESH_KEY);
              }
            })
            .catch(() => {
              localStorage.removeItem(ADMIN_TOKEN_KEY);
              localStorage.removeItem(ADMIN_REFRESH_KEY);
            });
        }
      });
  }, []);

  useEffect(() => {
    if (isOpen && users.length === 0 && currentUser) {
      setIsLoading(true);
      // Always use admin token for the users list
      const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem("access_token");
      fetch(`${API_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setUsers(data);
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, users.length, currentUser]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  if (!currentUser) return null;

  const handleSwitch = async (userId: number) => {
    setSwitching(userId);
    try {
      // Use admin token for the impersonation call
      const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/auth/impersonate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) throw new Error("Impersonation failed");

      const tokens = await response.json();

      // Save admin token if not already saved
      if (!localStorage.getItem(ADMIN_TOKEN_KEY)) {
        const currentToken = localStorage.getItem("access_token");
        const currentRefresh = localStorage.getItem("refresh_token");
        if (currentToken) localStorage.setItem(ADMIN_TOKEN_KEY, currentToken);
        if (currentRefresh) localStorage.setItem(ADMIN_REFRESH_KEY, currentRefresh);
      }

      // Set the impersonated user's tokens
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
      window.location.reload();
    } catch (err) {
      console.error("Impersonation failed:", err);
      setSwitching(null);
    }
  };

  const handleReturnToAdmin = () => {
    const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    const adminRefresh = localStorage.getItem(ADMIN_REFRESH_KEY);
    if (adminToken) {
      localStorage.setItem("access_token", adminToken);
      if (adminRefresh) localStorage.setItem("refresh_token", adminRefresh);
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_REFRESH_KEY);
      window.location.reload();
    }
  };

  const getRoleBadge = (user: UserInfo) => {
    if (user.is_superuser) return { label: "Admin", color: "bg-purple-100 text-purple-700" };
    if (user.role === "artist") return { label: "Talent", color: "bg-blue-100 text-blue-700" };
    if (user.role === "community") return { label: "Host", color: "bg-green-100 text-green-700" };
    if (user.role === "agent") return { label: "Agent", color: "bg-orange-100 text-orange-700" };
    return { label: user.role, color: "bg-slate-100 text-slate-700" };
  };

  return (
    <div ref={panelRef} className="fixed bottom-4 right-4 z-[9999]">
      {/* Toggle button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 ${
            isImpersonating
              ? "bg-orange-500 hover:bg-orange-600"
              : "bg-purple-600 hover:bg-purple-700"
          } text-white px-4 py-2 rounded-full shadow-lg transition-colors text-sm font-medium`}
          title="Switch User (Superuser)"
        >
          <Shield size={16} />
          <span className="hidden sm:inline">
            {isImpersonating
              ? `As: ${currentUser.name || currentUser.email}`
              : "Switch User"}
          </span>
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-80 max-h-[70vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-purple-50">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-purple-600" />
              <span className="font-semibold text-sm text-purple-900">Switch User</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </div>

          {/* Impersonation banner */}
          {isImpersonating && (
            <div className="px-4 py-2 bg-orange-50 border-b border-orange-100">
              <div className="text-xs text-orange-700">
                Impersonating: <strong>{currentUser.name || currentUser.email}</strong>
              </div>
              <button
                onClick={handleReturnToAdmin}
                className="text-xs text-orange-600 hover:text-orange-800 underline mt-0.5"
              >
                Return to admin account
              </button>
            </div>
          )}

          {/* Current user indicator */}
          {!isImpersonating && (
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs text-slate-500">
              Logged in as: <strong>{currentUser.name || currentUser.email}</strong>
            </div>
          )}

          {/* User list */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="p-4 text-center text-slate-400 text-sm">Loading users...</div>
            ) : (
              users.map((user) => {
                const badge = getRoleBadge(user);
                const isCurrent = user.id === currentUser.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => !isCurrent && handleSwitch(user.id)}
                    disabled={isCurrent || switching !== null}
                    className={`w-full text-left px-4 py-3 border-b border-slate-50 transition-colors ${
                      isCurrent
                        ? "bg-purple-50 cursor-default"
                        : switching === user.id
                        ? "bg-blue-50"
                        : "hover:bg-slate-50 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900 truncate">
                            {user.name || user.email.split("@")[0]}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badge.color}`}>
                            {badge.label}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 truncate">{user.email}</div>
                      </div>
                      {switching === user.id && (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
