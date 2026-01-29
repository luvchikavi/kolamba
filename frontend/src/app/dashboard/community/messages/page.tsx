"use client";

import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";

export default function MessagesPage() {
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
          MESSAGES
        </h1>

        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <MessageSquare size={48} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Coming Soon</h3>
          <p className="text-slate-600 max-w-md mx-auto">
            Direct messaging with artists will be available soon. For now, you can
            send booking requests to connect with artists.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Browse Artists
          </Link>
        </div>
      </div>
    </div>
  );
}
