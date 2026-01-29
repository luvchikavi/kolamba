"use client";

import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";

export default function EventsPage() {
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
          EVENTS
        </h1>

        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <Calendar size={48} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Coming Soon</h3>
          <p className="text-slate-600 max-w-md mx-auto">
            View and manage your upcoming events with artists. Track confirmed
            bookings and event details all in one place.
          </p>
          <Link
            href="/dashboard/community/quotes"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            View Your Quotes
          </Link>
        </div>
      </div>
    </div>
  );
}
