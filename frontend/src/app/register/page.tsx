"use client";

import Link from "next/link";
import { Music, Users } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-24">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Join Kolamba</h1>
        <p className="text-slate-600 mb-8">Choose how you want to join our community</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/register/talent"
            className="card p-8 hover:shadow-lg transition-shadow text-center group"
          >
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Music size={28} className="text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">I'm a Talent</h2>
            <p className="text-sm text-slate-500">Register as an artist or performer</p>
          </Link>

          <Link
            href="/register/host"
            className="card p-8 hover:shadow-lg transition-shadow text-center group"
          >
            <div className="w-16 h-16 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Users size={28} className="text-accent-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">I'm a Host</h2>
            <p className="text-sm text-slate-500">Register as a community or venue</p>
          </Link>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
