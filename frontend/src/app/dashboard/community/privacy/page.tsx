"use client";

import Link from "next/link";
import { ArrowLeft, Bell, Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-pink-50 to-white pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link
          href="/dashboard/community"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 italic mb-8">
          PRIVACY & NOTIFICATIONS
        </h1>

        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <div className="flex justify-center gap-4 mb-4">
            <Shield size={40} className="text-slate-300" />
            <Bell size={40} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Coming Soon</h3>
          <p className="text-slate-600 max-w-md mx-auto">
            Control your privacy settings and notification preferences. Manage how
            artists can contact you and what updates you receive.
          </p>
          <Link
            href="/dashboard/community/settings"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Go to Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
